---
outline: [2, 3]
---

# Kv: Valkey und Redis

Mit `Kv` teilt sich eine Texo-Anwendung einen Schlüssel-Wert-Speicher mit anderen Programmen, zum Beispiel einem
Go-Server: **Valkey, Redis, KeyDB oder Dragonfly**. Beide lesen und schreiben dieselben Schlüssel, Zähler und Hashes,
schicken sich Nachrichten über Pub/Sub und können sogar Cache und Sitzungen gemeinsam nutzen.

Kv ist in allen Backends eingebaut (Texo, Node.js, Bun, Deno). Es braucht keine npm-Pakete und keine eigene
Konfigurationsdatei: Eine Umgebungsvariable reicht.

::: tip Auf einen Blick
| Was | Texo | das andere Programm |
|---|---|---|
| Werte, Zähler, Hashes | [`Kv.get`, `Kv.set`, `Kv.increment`, `Kv.hashSet` …](#die-kv-api) | `GET`, `SET`, `INCRBY`, `HSET` … |
| Zwischenspeicher mit Sperre | [`Kv.cached`](#zwischenspeichern-mit-kvcached) | liest oder löscht den Schlüssel |
| `@Cache` von Services | [`@Cache(key: "artikel:{id}")`](#cache-in-kv) | `GET`, `DEL`, `PUBLISH texo:cache-clear` |
| Live-Nachrichten | [`Channel(topic: "preise")`](#kanäle-mit-anderen-programmen) | `PUBLISH` / `SUBSCRIBE` |
| Mehrere Instanzen | [`"cluster": {"bus": "kv"}`](#mehrere-instanzen) | – |
| `@RateLimit`, Abmelden | [automatisch](#was-sonst-noch-in-kv-liegt) | `HGET texo:revoked` |
| Sitzungen | [`TEXO_KV_SESSIONS=1`](#sitzungen-in-kv) | `GET texo:session:<kennung>` |
:::

## Schnellstart

**1. Valkey starten**, zum Beispiel mit Docker:

```sh
docker run -d --name valkey -p 6379:6379 valkey/valkey:8
```

Oder dauerhaft in der `docker-compose.yml` deines Projekts:

```yaml
services:
  valkey:
    image: valkey/valkey:8
    ports:
      - "6379:6379"
    volumes:
      - kv-daten:/data

volumes:
  kv-daten:
```

**2. Verbinden** über die Umgebungsvariable `TEXO_KV_URL`, etwa in der `.env` des Projekts:

```sh
TEXO_KV_URL=valkey://localhost:6379
```

**3. Benutzen** in einem Service:

```texo
package app.server

import texo.server.*

@Api("/api/zaehler")
service Zaehler {
    async fn aufruf(): Int => await Kv.increment("aufrufe")
    async fn stand(): Int => await Kv.get<Int>("aufrufe") ?? 0
}
```

```sh
texo dev
```

Ohne `TEXO_KV_URL` liegt alles im Speicher dieser einen Instanz, und alle `Kv`-Funktionen verhalten sich gleich. So
laufen `texo dev` und `texo test` auch ohne Valkey, und dein Code ändert sich nicht, wenn du später einen Server
anschließt. Nur `Kv.command` kennt ohne Server bloß die gängigen Befehle (`GET`, `SET`, `DEL`, `INCRBY`, `HSET`,
`LPUSH`, `SADD` …) und meldet bei anderen einen Fehler.

## Verbindung und Umgebungsvariablen

| Variable | Bedeutung |
|---|---|
| `TEXO_KV_URL` | `valkey://benutzer:passwort@rechner:6379/0`, mit TLS `valkeys://…`; `redis://` und `rediss://` gehen auch. Ohne Benutzer: `valkey://:passwort@…`. Die Zahl am Ende wählt die Datenbank. |
| `TEXO_KV_PREFIX` | steht vor jedem Schlüssel und Kanal, z. B. `lager:`. Standard: leer, damit Texo genau die Schlüssel sieht, die das andere Programm schreibt. |
| `TEXO_KV_SESSIONS` | `1`: Sitzungen liegen in Kv, siehe [Sitzungen in Kv](#sitzungen-in-kv) |

```sh
TEXO_KV_URL=valkey://texo:geheim@valkey:6379/0 TEXO_KV_PREFIX=lager: texo start
```

Was Texo selbst ablegt (Cache-Verzeichnisse, Sperren, Bus, Sitzungen), liegt unter `<präfix>texo:…` und kommt deinen
eigenen Schlüsseln nicht in die Quere.

- Jeder Befehl wird ein Abschnitt im Trace (`kv GET`, ohne Schlüssel und Werte), siehe
  [Beobachtbarkeit](./backend.md#betrieb-und-beobachtbarkeit).
- Antwortet der Server 5 Sekunden lang nicht, wirft der Befehl `KvError`.
- Ist Kv nicht erreichbar, laufen `@Cache`, Kanäle, `@RateLimit` und Sitzungen für diese Instanz weiter (siehe die
  einzelnen Abschnitte) und das Log meldet es höchstens einmal je Minute. Direkte Aufrufe von `Kv.…` werfen `KvError`.

## Die Kv-API

`Kv` gehört zu `texo.server` und ist nur auf dem Server verfügbar (in Services, `@Server`-Funktionen, Jobs und
Zeitplänen).

```texo
package app.server

import texo.server.*

data class Bestand(sku: String, menge: Int, lager: Map<String, Int>)

@Api("/api/lager")
service Lager {
    // liest lager:bestand:<sku>; fehlt er, lädt die Funktion ihn und er bleibt 30 Sekunden
    async fn bestand(sku: String): Bestand =>
        await Kv.cached("bestand:${sku}", 30.s, async () => Bestand(sku, 0, [:]))

    async fn merken(sku: String): Boolean => await Kv.set("zuletzt", sku, ttl: 1.d)

    async fn zuletzt(): String? => await Kv.get<String>("zuletzt")

    async fn aufrufe(): Int => await Kv.increment("aufrufe")

    async fn gebucht(sku: String): Int => await Kv.publish("buchungen", sku)
}
```

### Werte

| Signatur | Beschreibung |
|---|---|
| `Kv.get<T>(key: String): Future<T?>` | der Wert unter `key` oder `null`; passt er nicht zu `T`, wirft es `KvError` |
| `Kv.set<T>(key: String, value: T, ttl: Duration? = null, onlyIfAbsent: Boolean = false): Future<Boolean>` | speichert `value`; `null` löscht den Schlüssel, `ttl` lässt ihn ablaufen, `onlyIfAbsent` setzt nur, wenn es ihn noch nicht gibt (eine einfache Sperre). `true`, wenn gespeichert |
| `Kv.getMany<T>(keys: List<String>): Future<List<T?>>` | mehrere Werte auf einmal, in der Reihenfolge der Schlüssel, `null` für fehlende |
| `Kv.delete(key: String): Future<Boolean>` | löscht den Schlüssel; `false`, wenn es ihn nicht gab |
| `Kv.exists(key: String): Future<Boolean>` | `true`, wenn es den Schlüssel gibt |
| `Kv.expire(key: String, ttl: Duration): Future<Boolean>` | lässt den Schlüssel nach `ttl` ablaufen |
| `Kv.ttl(key: String): Future<Duration?>` | Restzeit bis zum Ablauf; `null`, wenn es den Schlüssel nicht gibt oder er nicht abläuft |
| `Kv.increment(key: String, by: Int = 1): Future<Int>` | zählt um `by` weiter (ein fehlender Schlüssel zählt als 0) und liefert den neuen Stand |
| `Kv.cached<T>(key: String, ttl: Duration, load: () => Future<T>): Future<T>` | siehe [unten](#zwischenspeichern-mit-kvcached) |

### Hashes

| Signatur | Beschreibung |
|---|---|
| `Kv.hashGet<T>(key: String, field: String): Future<T?>` | ein Feld eines Hash oder `null` |
| `Kv.hashSet<T>(key: String, field: String, value: T): Future<Void>` | setzt ein Feld |
| `Kv.hashGetAll<T>(key: String): Future<Map<String, T>>` | alle Felder; leer, wenn es den Hash nicht gibt |
| `Kv.hashDelete(key: String, field: String): Future<Boolean>` | löscht ein Feld; `false`, wenn es das Feld nicht gab |

### Nachrichten und alles andere

| Signatur | Beschreibung |
|---|---|
| `Kv.publish<T>(channel: String, value: T): Future<Int>` | veröffentlicht `value` auf einem Kanal (Pub/Sub); liefert die Zahl der Empfänger. Zum Empfangen in Texo: [`Channel(topic:)`](#kanäle-mit-anderen-programmen) |
| `Kv.command(name: String, args: List<String> = []): Future<Any>` | ein beliebiger Befehl, ohne Präfix und ohne Prüfung des Ergebnisses: `await Kv.command("LPUSH", ["liste", "x"])` |

### Fehler: `KvError`

`KvError` heißt: Der Server ist nicht erreichbar, antwortet mit einem Fehler, oder ein gelesener Wert passt nicht zum
erwarteten Typ.

```texo
package app.server

import texo.server.*

data class Artikel(sku: String, name: String, preis: Float)

@Api("/api/artikel")
service ArtikelApi {
    async fn lesen(sku: String): Artikel? {
        try {
            return await Kv.get<Artikel>("artikel:${sku}")
        } catch (e: KvError) {
            Log.warn("Artikel ${sku} nicht lesbar: ${e.message}")
            return null
        }
    }
}
```

## Wie Werte gespeichert werden

Damit das andere Programm die Werte versteht, gilt eine feste Regel, die zu `json.Marshal` in Go passt:

| Texo-Typ | im Speicher | in Go |
|---|---|---|
| `String`, Enum-Fall | der Text, ohne Anführungszeichen | `string` |
| `Int`, `Float`, `Boolean` | Zahl bzw. `true`/`false` als Text | `strconv`, `INCRBY` |
| `DateTime` | ISO 8601 (`2026-11-08T12:00:00.000Z`) | `time.Parse(time.RFC3339, …)` |
| data class, `List`, `Map` | JSON mit den Feldnamen aus Texo, Maps als Objekte | `json.Unmarshal` |

Was ein anderes Programm geschrieben hat, sind fremde Daten. `Kv.get<T>` prüft sie wie die Eingaben einer API:
Unbekannte Felder werden ignoriert. Fehlt ein Pflichtfeld oder passt ein Typ nicht, wirft es `KvError` mit dem
Schlüssel in der Meldung, statt falsche Daten weiterzugeben.

Dieselben Daten in Go, zum Beispiel mit [valkey-go](https://github.com/valkey-io/valkey-go):

```go
var b Bestand // struct mit json:"sku", json:"menge", json:"lager"
s, _ := client.Do(ctx, client.B().Get().Key("lager:bestand:"+sku).Build()).ToString()
json.Unmarshal([]byte(s), &b)
client.Do(ctx, client.B().Del().Key("lager:bestand:"+sku).Build()) // Texo lädt beim nächsten Aufruf neu
```

## Zwischenspeichern mit `Kv.cached`

```texo
let bestand = await Kv.cached("bestand:${sku}", 30.s, async () => await ladeBestand(sku))
```

- Liegt ein passender Wert unter dem Schlüssel, kommt er sofort zurück.
- Sonst ruft Texo `load` auf, speichert das Ergebnis für `ttl` und gibt es zurück.
- Kommen gleiche Aufrufe gleichzeitig an, **auch auf verschiedenen Instanzen**, lädt nur der erste. Die anderen warten
  auf seinen Wert (Sperre unter `<präfix>texo:lock:<schlüssel>`, höchstens 10 Sekunden).
- Passt ein vorhandener Wert nicht zum Typ (weil ein anderes Programm etwas anderes abgelegt hat), lädt `Kv.cached` neu.

## `@Cache` in Kv

Ist `TEXO_KV_URL` gesetzt, legt [`@Cache`](./backend.md#zwischenspeicher-cache) seine Einträge in Kv statt im
Arbeitsspeicher. Alle Instanzen teilen sich dann einen Speicher, gleiche Aufrufe laufen auch über Instanzen hinweg nur
einmal, und `Cache.clear` und `@Invalidates` leeren die Einträge in Kv, bevor die Antwort hinausgeht. Am Code ändert
sich nichts.

```texo
package app.server

import texo.server.*

data class Artikel(sku: String, name: String, preis: Float)

@Api("/api/katalog")
service Katalog {
    // liegt unter <präfix>artikel:A-1, so wie Kv.set ihn schreibt: Go liest ihn mit json.Unmarshal
    @Cache(ttl: 10.min, shared: true, key: "artikel:{sku}")
    async fn artikel(sku: String): Artikel => Artikel(sku, "Schraube", 0.12)

    // bleibt im Arbeitsspeicher dieser Instanz, auch mit Kv
    @Cache(ttl: 5.s, local: true)
    async fn uhrzeit(): String => DateTime.now().toIso()
}
```

- `key: "artikel:{sku}"` gibt dem Eintrag einen festen Namen; `{sku}` ist ein Parameter der Methode (Text, Zahl,
  Wahrheitswert oder Enum). Das geht nur mit `shared: true`, sonst sähe jeder Benutzer die Daten des anderen.
- Den Wert schreibt Texo wie `Kv.set`. Was ein anderes Programm dort ablegt, prüft es wie `Kv.get`; passt es nicht,
  lädt die Methode neu.
- Ohne `key:` heißen Einträge `<präfix>texo:cache:<Service.methode>:<hash>`. Die Schlüssel einer Methode stehen im Set
  `<präfix>texo:cache-index:<Service.methode>`, die Methoden mit Einträgen in `<präfix>texo:cache-methods`.
- `local: true` lässt eine Methode im Arbeitsspeicher, etwa für sehr kurze Lebensdauern.
- Ist Kv nicht erreichbar, laufen die Methoden ohne Zwischenspeicher weiter.

**Aus einem anderen Programm leeren:**

```sh
DEL lager:artikel:A-1                                 # ein Eintrag mit festem Namen
PUBLISH lager:texo:cache-clear Katalog.artikel        # alle Einträge einer Methode
PUBLISH lager:texo:cache-clear Katalog                # ein ganzer Service
PUBLISH lager:texo:cache-clear ""                     # alles
```

`PUBLISH …texo:cache-clear` leert auch Methoden mit `local: true` in allen Instanzen.

## Kanäle mit anderen Programmen

Ein [`Channel`](./backend.md#echtzeit-stream-und-channel) mit `topic:` läuft über Pub/Sub in Kv. Was Texo oder ein
anderes Programm auf dem Kanal veröffentlicht, kommt bei allen `Stream`s an, in allen Instanzen und live im Browser.

```texo
package app.server

import texo.server.*

data class Kurs(symbol: String, preis: Float)

@Api("/api/boerse")
service Boerse {
    // <präfix>preise in Kv
    private let preise: Channel<Kurs> = Channel(topic: "preise", replay: 20)

    fn live(): Stream<Kurs> => this.preise.stream()
    fn melden(k: Kurs): Void => this.preise.send(k)
}
```

```go
b, _ := json.Marshal(Kurs{Symbol: "TXO", Preis: 12.5})
client.Do(ctx, client.B().Publish().Channel("preise").Message(string(b)).Build())
```

- Werte laufen über `PUBLISH`/`SUBSCRIBE`, kodiert wie bei `Kv.publish`. Auch die sendende Instanz bekommt ihren Wert
  erst von dort, damit alle Instanzen dieselbe Reihenfolge sehen.
- Was nicht zum Typ passt, landet im Log statt beim Browser.
- Ein Kanal mit `topic:` reicht ohne `"cluster"` über alle Instanzen. `replay` hebt jede Instanz für sich auf.
- Ist Kv nicht erreichbar, bekommen wenigstens die Zuschauer dieser Instanz die Werte.

## Mehrere Instanzen

Laufen mehrere Instanzen deiner App hinter einem Load-Balancer, tauschen sie sich über einen Instanz-Bus aus: geteilte
Kanäle (`shared: true`), Sperren nach dem Abmelden und Live-Abfragen. Statt über die Datenbank kann der Bus über Kv
laufen:

```json
{
  "backend": "texo",
  "cluster": { "bus": "kv" }
}
```

Die Nachrichten liegen dann in einem Stream `<präfix>texo:bus`, den jede Instanz mit `XREAD BLOCK` liest, ohne
Abfragen alle 200 ms und ohne Datenbank. Werte von Kanälen mit `replay` bleiben eine Stunde im Stream. Ohne
`TEXO_KV_URL` (etwa in `texo dev`) bleibt alles in der einen Instanz. Mehr in
[Mehrere Instanzen](./backend.md#mehrere-instanzen-cluster).

## Was sonst noch in Kv liegt

Mit `TEXO_KV_URL` liegt noch mehr im gemeinsamen Speicher, ohne dass sich am Code etwas ändert:

| Was | Wo | Für andere Programme |
|---|---|---|
| `@RateLimit` | Zähler `<präfix>texo:rate:<client>\|<pfad>` für eine Minute | die Grenze gilt für alle Instanzen zusammen |
| Abmelden (`session.clear()`) | Hash `<präfix>texo:revoked` (Kennung → Ablauf in ms), angekündigt über `PUBLISH <präfix>texo:revoke` | `HGET` sagt, ob eine Sitzung gesperrt ist; neue Instanzen kennen die Sperren sofort |
| `@Cache` leeren | `PUBLISH <präfix>texo:cache-clear "Katalog.artikel"` | leert den `@Cache` aller Instanzen |

Ist Kv nicht erreichbar, zählt und sperrt jede Instanz für sich weiter.

## Sitzungen in Kv

Mit `TEXO_KV_SESSIONS=1` liegt jede Sitzung (`this.request.session`) zusätzlich unter
`<präfix>texo:session:<kennung>` als JSON:

```json
{ "data": { "name": "ada" }, "expires": 1731100000000 }
```

Ein anderes Programm kann sie lesen, Werte ändern oder jemanden mit `DEL` abmelden. Die Kennung steht im Cookie
`tx_session`: Base64url-JSON vor dem Punkt, Feld `i`.

```go
c, _ := r.Cookie("tx_session")
raw, _ := base64.RawURLEncoding.DecodeString(c.Value[:strings.LastIndex(c.Value, ".")])
var cookie struct{ I string `json:"i"` }
json.Unmarshal(raw, &cookie)
s, _ := client.Do(ctx, client.B().Get().Key("texo:session:"+cookie.I).Build()).ToString()
// {"data":{"name":"ada"},"expires":…}; fehlt der Schlüssel, ist niemand angemeldet
```

- Kv ist dann maßgeblich: Texo liest die Werte von dort statt aus dem Cookie, eine Kennung ohne Eintrag ist
  abgemeldet. Werte sind Text (Zahlen eines anderen Programms werden zu Text).
- Wer `TEXO_KV_SESSIONS` einschaltet, meldet alle bisherigen Sitzungen einmal ab, weil sie noch nicht in Kv stehen.
- Ist Kv nicht erreichbar, gelten die Werte aus dem Cookie.
- Die Kennung im Cookie ist nicht geheim, aber Texo nimmt das Cookie nur mit gültiger Signatur (`TEXO_SECRET`) an. Ein
  anderes Programm, das nur liest, braucht das Geheimnis nicht; es vertraut dem Eintrag in Kv.

## Testen

In `texo test` liegt Kv immer im Speicher, auch wenn `TEXO_KV_URL` gesetzt ist. Tests brauchen also keinen
Valkey-Server und beeinflussen sich nicht über einen gemeinsamen Speicher.

```texo
package app.tests

import texo.test.*
import app.server.*

@Test("Jeder Aufruf zählt weiter")
async fn zaehlt() {
    expect(await Zaehler.aufruf()).toBe(1)
    expect(await Zaehler.aufruf()).toBe(2)
    expect(await Zaehler.stand()).toBe(2)
}
```

## In Produktion

- Mit [`texo build --docker`](./docker.md) bekommt die App ein Image; Valkey läuft als eigener Dienst daneben, etwa in
  derselben `docker-compose.yml`. `TEXO_KV_URL` zeigt dann auf den Dienstnamen: `valkey://valkey:6379`.
- Für Verbindungen über das Netz `valkeys://` (TLS) und ein Passwort verwenden.
- Teilen sich mehrere Anwendungen einen Server, trennt `TEXO_KV_PREFIX` ihre Schlüssel.
- Kv ist ein Zwischenspeicher und Nachrichtenweg, keine Datenbank: Was nicht verloren gehen darf, gehört in
  [Texo Data](./datenbank.md).

## Vollständiges Beispiel mit Go

Das Beispiel [Lager mit Go](./beispiele/lager-go.md) zeigt alles zusammen: Eine Texo-Seite und ein Go-Dienst teilen sich
Bestände (`Kv.increment` und `INCRBY`), einen `@Cache`-Eintrag, Live-Buchungen über `Channel(topic:)` und die Sitzung
des angemeldeten Benutzers.

```sh
docker run -d -p 6379:6379 valkey/valkey:8

export TEXO_KV_URL=valkey://localhost:6379 TEXO_KV_SESSIONS=1
(cd go-dienst && go run .) &          # http://localhost:8080
texo build && texo start dist          # http://localhost:3000
```

<!-- Übernommen aus LearNivram/Texo (docs/backend.md) mit scripts/docs-uebernehmen.mjs – bitte dort ändern. -->

# Backend & Sicherheit

Mit Texo schreibst du **Website und Backend in einer Sprache**. Ein `service` läuft ausschließlich auf dem Server; der
Compiler erzeugt daraus

- einen **HTTP(S)-Handler** im Backend und
- einen **typisierten Client** im Browser – ein Aufruf sieht aus wie ein normaler Methodenaufruf: `await NotesApi.list()`.

Dieselben `data class`-Typen gelten auf beiden Seiten. Ändert sich eine Signatur, meldet der Typprüfer die Fehler im
Frontend *und* im Backend.

## Inhalt

1. [Backend wählen: Node.js, Bun, Deno oder statisch](#backend-wählen)
2. [Services](#services)
3. [Anmeldung (`@Auth`) – typisierter Benutzer in der Session](#anmeldung-auth)
4. [Routen-Wächter (`@Guard`) – Server und Browser](#routen-wächter-guard)
5. [Seiten mit Daten vom Server (`@Load`)](#seiten-mit-daten-vom-server-load)
6. [Formulare (`Form`) – mit und ohne JavaScript](#formulare-form)
7. [Dateien hochladen (`Upload` und `Files`)](#dateien-hochladen-upload-und-files)
8. [Echtzeit (`Stream` und `Channel`)](#echtzeit-stream-und-channel)
9. [Zeitpläne (`@Cron` und `@Every`)](#zeitpläne-cron-und-every)
10. [Hintergrundjobs (`@Job`)](#hintergrundjobs-job)
11. [E-Mails verschicken (`Mail` und `Tokens`)](#e-mails-verschicken-mail-und-tokens)
12. [Zwischenspeicher (`@Cache`)](#zwischenspeicher-cache)
    und [gemeinsamer Speicher mit anderen Programmen (`Kv`)](#gemeinsamer-speicher-mit-anderen-programmen-kv)
13. [Server-Daten im Browser (`Resource` und `@Invalidates`)](#server-daten-im-browser-resource-und-invalidates)
14. [Betrieb: Verwaltungskonsole (`AdminConsole`)](#betrieb-verwaltungskonsole-adminconsole)
15. [Fremde Dienste (`@HttpApi` und `@Webhook`)](#fremde-dienste-httpapi-und-webhook)
16. [Sicherheitsmodell – die drei Angriffsszenarien](#sicherheitsmodell)
17. [Sessions, Passwörter, Umgebungsvariablen](#sessions-passwörter-umgebungsvariablen)
18. [Konfiguration (`@Config`) und Geheimnisse (`Secret`)](#konfiguration-config-und-geheimnisse-secret)
19. [Weitere Annotationen: `@Public`, `@RateLimit`, `@Api`, `@Server`, `@Cron`, `@Every`, `@Job`, `@Cache`, `@Config`, `@Invalidates`, `@Webhook`](#weitere-annotationen)
20. [Entwickeln, bauen, starten, HTTPS](#entwickeln-bauen-starten-https)
21. [Mehrere Instanzen (`cluster`)](#mehrere-instanzen-cluster)
22. [Betrieb und Beobachtbarkeit: Tracing, Kennzahlen, Fehlerberichte](#betrieb-und-beobachtbarkeit)
23. [Erzeugte Dateien](#erzeugte-dateien)

Daten dauerhaft speichern (SQLite, PostgreSQL, MySQL, MongoDB): [Datenbanken](datenbank.md). npm-Pakete im
Server-Code: [npm-Pakete](npm.md).

---

## Backend wählen

Beim Anlegen eines Projekts fragt `texo init` nach dem Backend (oder du gibst es direkt an):

```sh
texo init meine-app                    # interaktive Auswahl
texo init meine-app --backend node     # Node.js  (empfohlen, überall verfügbar)
texo init meine-app --backend texo     # Texo     (nativer Server im texo-Programm, ohne Node.js; Vorschau)
texo init meine-app --backend bun      # Bun      (sehr schneller Start)
texo init meine-app --backend deno     # Deno     (Berechtigungsmodell)
texo init meine-app --backend static   # kein Backend – nur HTML/CSS/JS für Static Hosting
```

Server-Code liegt danach in `src/server/` (Paket `app.server`), Seiten in `src/pages/`, Bausteine in
`src/components/`. Ein vollständiges Beispiel mit Konto-Tabelle, Registrieren, Anmelden (`@Auth`) und eigenen Daten
legt `texo init meine-app --example aufgaben` an.

### Nur Backend (ohne Webseite)

Ein Texo-Projekt braucht keine Seiten. Für eine API, die Apps, Skripte oder andere Server aufrufen, legt
`texo init meine-api --example api` (in der Auswahl „Nur Backend“) nur `src/server/` und `tests/` an, mit oder ohne
Datenbank:

```sh
texo init meine-api --example api --backend texo --db sqlite
cd meine-api && texo dev
curl -X POST http://localhost:3000/api/notizen/neu -H 'Content-Type: application/json' -d '{"args":["Milch kaufen"]}'
# {"ok":true,"value":{"id":1,"text":"Milch kaufen"}}
```

Hat ein Projekt mit Backend keine Seite und keine Komponente, gilt es als reines Backend: `texo build` und
`texo dev` erzeugen keinen Browser-Code, `dist/` enthält nur den Server (`dist/server/`, `package.json`, mit
`--docker` das Dockerfile). Dateien, die du selbst in `public/` legst (etwa eine `robots.txt`), liefert der Server
weiter aus. Kommt später eine Seite dazu, baut Texo wieder Seiten und Browser-Code, ohne dass du etwas umstellen musst.

**Aufrufen.** Jede öffentliche Service-Methode ist ein Endpunkt `POST <@Api-Pfad>/<methode>` mit dem Rumpf
`{"args": [...]}` (die Argumente in der Reihenfolge der Parameter). Die Antwort ist `{"ok":true,"value":…}` oder
`{"ok":false,"error":"…"}` mit dem Status des Fehlers (`400`, `401`, `404`, `429` …). Ohne Webseite gibt es kein
CSRF-Token, deshalb trägt der Service im Beispiel `@Public`. Was nicht jeder aufrufen darf, sicherst du wie sonst mit
einem [Wächter](#routen-wächter-guard) ab, z. B. über einen API-Schlüssel im Header (`this.request`) oder mit
[`@Auth`](#anmeldung-auth). Signierte Ereignisse fremder Dienste nimmt [`@Webhook`](#webhooks-empfangen-webhook) an;
[Zeitpläne](#zeitpläne-cron-und-every) und [Hintergrundjobs](#hintergrundjobs-job) laufen ebenso ohne Seiten.

Die Wahl steht in `texo.json` und lässt sich jederzeit ändern – der Texo-Code bleibt derselbe:

```json
{
  "src": "src",
  "out": "dist",
  "backend": "node",
  "server": { "port": 3000, "allowedOrigins": [] }
}
```

Der erzeugte Server baut auf den Web-Standards `Request`/`Response` auf und läuft unverändert auf allen drei
Laufzeiten; nur ein kleiner Adapter (`server/texo/adapter.js`) unterscheidet sich. Einmalig für einen Build kannst du
das Backend auch per `texo build --backend bun` überschreiben.

---

## Services

```texo
package notes

import texo.server.*

data class Note(id: Int, text: String, author: String, pinned: Boolean = false)

/// der angemeldete Benutzer (siehe Anmeldung unten)
@Auth
data class User(id: Int, name: String)

@Server
fn loggedIn(req: Request): Access => req.user != null ? Access.allow() : Access.redirect("/login")

@Api("/api/notes")
@Guard(loggedIn)
service NotesApi {
    private var notes: List<Note> = []
    private var nextId: Int = 1

    fn list(): List<Note> => this.notes

    @RateLimit(perMinute: 30)
    fn add(text: String): Note {
        let clean = text.trim()
        if (clean.isEmpty() || clean.length > 280) throw HttpError(400, "Eine Notiz braucht 1–280 Zeichen")
        let note = Note(this.nextId, clean, this.request.user?.name ?? "?")
        this.nextId += 1
        this.notes.add(note)
        return note
    }
}
```

Im Browser:

```texo
async fn add(): Void {
    try {
        let note = await NotesApi.add(this.draft.value)   // Future<Note> – typgeprüft
        this.notes.value.add(note)
    } catch (e) {
        this.message.value = e.message                       // "Eine Notiz braucht 1–280 Zeichen"
    }
}
```

**Regeln**

| | |
|---|---|
| Endpunkte | alle öffentlichen Methoden eines Service; `private` Methoden sind Hilfsfunktionen und nicht erreichbar |
| Pfad | `POST <@Api-Pfad>/<methode>`, Standard: `/api/<ServiceName>` |
| Rückgabe im Browser | immer `Future<T>` → mit `await` verwenden |
| `this.request` | die aktuelle Anfrage (Header, Cookies, `ip`, `session`) – nur im Service |
| Zustand | Felder eines Service leben im Server-Speicher (für Persistenz eine Datenbank anbinden) |
| Übertragbare Typen | `Int`, `Float`, `Boolean`, `String`, Enums, `data class`es, `List`, `Map<String/Int, …>`, `Pair`, nullable Varianten |
| Fehler | `throw HttpError(status, "Nachricht")` → im Browser ein Fehler mit genau dieser Nachricht; typisierte Fehler siehe unten |
| Übertragung | Antworten ab 1 KB gehen gzip-komprimiert, wenn der Browser es annimmt (eine Liste mit 50 Zeilen: 4,4 KB → 0,4 KB) |

Was nicht übertragbar ist (z. B. ein `View` oder eine normale `class`), meldet der Compiler:
`Parameter 'v: View' kann nicht über das Netz übertragen werden`.

### Typisierte Fehler (`throws`)

Fehler, mit denen der Aufrufer rechnen soll, sind eigene Klassen und stehen in der Signatur. Im Browser kommen sie als
genau diese Klassen an, mit allen Feldern und typgeprüft wie jeder andere Wert:

```texo
package notizen

import texo.ui.*
import texo.server.*

data class NichtGefunden(id: Int): Error("Die Notiz ${id} gibt es nicht")
data class FremdeNotiz(id: Int, autor: String): Error("Die Notiz ${id} gehört ${autor}")

@Api("/api/notizen")
service Notizen {
    private var autoren: Map<Int, String> = [1: "ada"]

    fn loeschen(id: Int): Void throws NichtGefunden | FremdeNotiz {
        let autor = this.autoren.get(id)
        if (autor == null) throw NichtGefunden(id)
        if (autor != this.request.session.get("user")) throw FremdeNotiz(id, autor)
        this.autoren.remove(id)
    }
}

component Liste {
    private State<String> meldung = State("")

    async fn loeschen(id: Int): Void {
        try {
            await Notizen.loeschen(id)
        } catch (e: FremdeNotiz) {
            this.meldung.value = "Nur ${e.autor} darf das löschen"
        } catch (e: NichtGefunden) {
            this.meldung.value = ""
        }
    }

    fn build(): View => Text(this.meldung.value)
}
```

- Fehlerklassen erben von `Error` und geben die Meldung weiter: `data class X(…): Error("…")`. Über das Netz gehen nur
  `data class`es mit übertragbaren Feldern.
- `throws A | B` steht nach dem Rückgabetyp. Andere Fehler (`HttpError`, Abstürze) bleiben wie bisher. Wirft eine
  Service-Methode eine eigene Fehlerklasse ohne `throws`, meldet das der Compiler: Browser und `TestClient` bekämen
  sonst nur einen allgemeinen Fehler mit der Meldung.
- `catch (e: A)` fängt nur `A`; die Zweige werden der Reihe nach geprüft, ein `catch (e)` ohne Typ steht zuletzt.
- Hat ein `try` typisierte Zweige und keinen ohne Typ, muss es **jeden** deklarierten Fehler seiner Aufrufe behandeln,
  sonst meldet der Compiler `Der Fehler 'NichtGefunden' aus 'Notizen.loeschen' wird nicht behandelt`. Deklariert die
  umgebende Funktion den Fehler selbst mit `throws`, darf er durchgehen.
- Auf der Leitung: Status 400 mit `{ "ok": false, "error": Meldung, "type": "paket.Klasse", "value": { Felder } }`.

### Client und Server sind getrennt

- **Services und `@Server`-Code gelangen nie in den Browser.** Der Browser erhält nur Stubs mit Pfad und Typbeschreibung –
  keine Logik, keine Passwort-Hashes, keine Geheimnisse.
- Browser-Code (Komponenten, normale Funktionen) darf keine Server-Symbole benutzen:
  `'Env' ist nur auf dem Server verfügbar und darf nicht im Browser-Code verwendet werden`.
- Felder eines Service sind aus dem Browser nicht erreichbar, nur seine Methoden.
- `texo.server.*` (`Request`, `Session`, `Env`, `Password`, `Log`, `HttpError`) ist nur in Services und `@Server`-Code
  verwendbar.

---

## Anmeldung (`@Auth`)

Eine `data class` mit `@Auth` beschreibt den angemeldeten Benutzer. Auf dem Server ist er dann als `request.user`
verfügbar, mit genau diesem Typ:

```texo
package konten

import texo.server.*

enum Rolle { Leser, Admin }

@Auth
data class Benutzer(id: Int, name: String, rolle: Rolle)

@Server
fn angemeldet(req: Request): Access => req.user != null ? Access.allow() : Access.redirect("/login")

@Server
fn nurAdmins(req: Request): Access =>
    req.user?.rolle == Rolle.Admin ? Access.allow() : Access.deny(403, "Nur für Administratoren")

@Api("/api/auth")
service AuthApi {
    /// Name → Passwort-Hash (Password.hash), in echten Anwendungen aus der Datenbank
    private let hashes: Map<String, String> = ["admin": "pbkdf2$210000$cO7Euo5OE2SwEmSHqmDmxQ$lo_mTvYCPZva0tKxUy7OXed7Nbi7QcTqVoCcx6nKu5E"]

    @RateLimit(perMinute: 10)
    async fn login(name: String, passwort: String): Boolean {
        let hash = this.hashes.get(name)
        if (hash == null || !(await Password.verify(passwort, hash))) return false
        this.request.signIn(Benutzer(1, name, name == "admin" ? Rolle.Admin : Rolle.Leser))
        return true
    }

    fn me(): Benutzer? => this.request.user

    fn logout(): Void => this.request.signOut()
}

@Api("/api/verwaltung")
@Guard(angemeldet, nurAdmins)
service Verwaltung {
    fn begruessung(): String {
        let name = this.request.user?.name ?? "?"
        return "Hallo ${name}"
    }
}
```

| | |
|---|---|
| `request.user` | der angemeldete Benutzer oder `null` |
| `request.signIn(b)` | speichert `b` in der signierten Session und gibt ihr eine **neue Kennung**: ein Cookie, das vor der Anmeldung bekannt war, gilt danach nicht mehr (Schutz gegen Session Fixation) |
| `request.signOut()` | leert die Session und sperrt ihre Kennung, wie `session.clear()` |

Der Benutzer steht im Session-Cookie, mit HMAC signiert und mit demselben Codec wie bei Services. Er lässt sich im
Browser nicht verändern, und jede Anfrage kommt ohne Datenbankzugriff an ihn. Daraus folgen zwei Regeln:

- Speichere nur, was Wächter brauchen (Id, Name, Rolle), keine Geheimnisse und keine großen Listen. Das Cookie sollte
  unter 4 KB bleiben.
- Ändert sich die Rolle eines Benutzers, gilt das erst nach seiner nächsten Anmeldung. Wer sofort sperren muss, prüft
  im Wächter zusätzlich die Datenbank oder beendet in der [Verwaltungskonsole](#betrieb-verwaltungskonsole-adminconsole)
  alle Sitzungen des Benutzers.

Passt ein gespeicherter Benutzer nicht mehr zur Klasse, etwa nach einem neuen Pflichtfeld, ist `request.user` `null`
und der Benutzer meldet sich neu an. Im Browser gibt es `request` nicht; dort holst du den Benutzer über eine
Service-Methode wie `AuthApi.me()` oder einen Loader (`@Load`).

### Vollständiges Beispiel: Registrieren und Anmelden mit Datenbank

Der häufigste Fall: Konten liegen in der Datenbank, jeder sieht nur seine eigenen Daten. Dazu braucht es in
`texo.json` eine Datenbank (`"database": { "type": "sqlite", "url": "data/app.db" }`, siehe
[Datenbank](datenbank.md)). Die Tabellen legt Texo beim Start selbst an.

```texo
package app

import texo.server.*
import texo.db.*

/// steht in der signierten Session: nur, was Wächter brauchen
@Auth
data class Benutzer(id: Int, name: String)

/// das Passwort selbst wird nie gespeichert, nur sein Hash
@Table
data class Konto(@Id id: Int = 0, @Unique name: String, hash: String)

/// Regeln an der Tabelle gelten bei jedem insert/update; Verstöße kommen im Browser als ValidationException an
@Table
data class Aufgabe(@Id id: Int = 0, @Index besitzer: Int, @Required @MaxLength(200) titel: String, erledigt: Boolean = false)

@Server
fn angemeldet(req: Request): Access => req.user != null ? Access.allow() : Access.redirect("/login")

@Server
fn abgemeldet(req: Request): Access => req.user == null ? Access.allow() : Access.redirect("/")

@Api("/api/konto")
service KontoApi {
    @RateLimit(perMinute: 10)
    async fn registrieren(name: String, passwort: String): Void {
        let n = name.trim().lower()
        if (n.length < 3 || n.length > 30) throw HttpError(400, "Name: 3–30 Zeichen")
        if (passwort.length < 8) throw HttpError(400, "Passwort: mindestens 8 Zeichen")
        if (await Konto.where(k => k.name == n).exists()) throw HttpError(409, "Name ist vergeben")
        let k = await Konto.insert(Konto(name: n, hash: await Password.hash(passwort)))
        this.request.signIn(Benutzer(k.id, k.name))      // gleich angemeldet
    }

    @RateLimit(perMinute: 10)
    async fn anmelden(name: String, passwort: String): Void {
        let k = await Konto.where(k => k.name == name.trim().lower()).first()
        // dieselbe Meldung für unbekannten Namen und falsches Passwort: verrät nicht, welche Namen es gibt
        if (k == null || !(await Password.verify(passwort, k.hash))) throw HttpError(401, "Name oder Passwort falsch")
        this.request.signIn(Benutzer(k.id, k.name))
    }

    fn abmelden(): Void => this.request.signOut()
}

/// alles hier nur für Angemeldete; request.user ist also gesetzt
@Api("/api/aufgaben")
@Guard(angemeldet)
service AufgabenApi {
    async fn liste(): List<Aufgabe> =>
        await Aufgabe.where(a => a.besitzer == this.request.user!!.id).orderBy(a => a.id).list()

    async fn neu(titel: String): Aufgabe =>
        await Aufgabe.insert(Aufgabe(besitzer: this.request.user!!.id, titel: titel.trim()))

    async fn loeschen(id: Int): Void {
        let a = await Aufgabe.find(id)
        // fremde Aufgaben gibt es für diesen Benutzer nicht
        if (a == null || a.besitzer != this.request.user!!.id) throw HttpError(404, "Aufgabe nicht gefunden")
        await Aufgabe.delete(a)
    }
}
```

Die Seiten dazu schützen dieselben Wächter, die Anmeldeseite mit `abgemeldet`, damit Angemeldete gleich zur
Startseite kommen:

```texo
@Page(title: "Anmelden", path: "login")
@Guard(abgemeldet)
component LoginSeite {
    private State<String> name = State("")
    private State<String> passwort = State("")
    private State<String> fehler = State("")

    async fn senden(neu: Boolean): Void {
        this.fehler.value = ""
        try {
            if (neu) await KontoApi.registrieren(this.name.value, this.passwort.value)
            else await KontoApi.anmelden(this.name.value, this.passwort.value)
            Window.navigate("/")
        } catch (e) {
            this.fehler.value = e.message                 // "Name oder Passwort falsch"
        }
    }

    fn build(): View => Column(spacing: 12.px, [
        Input(bind: this.name, placeholder: "Name"),
        Input(bind: this.passwort, placeholder: "Passwort", type: InputType.Password).onSubmit(() => this.senden(false)),
        Button("Anmelden").onClick(() => this.senden(false)),
        Button("Neu registrieren").onClick(() => this.senden(true)),
        Text(this.fehler.value).textColor(Color.Rose600)
    ])
}

@Page(title: "Aufgaben")
@Guard(angemeldet)
component Startseite {
    private State<List<Aufgabe>> aufgaben = State([])
    private State<String> titel = State("")
    private State<String> fehler = State("")

    async fn onMount(): Void {
        this.aufgaben.value = await AufgabenApi.liste()
    }

    async fn hinzufuegen(): Void {
        try {
            await AufgabenApi.neu(this.titel.value)
            this.titel.value = ""
            this.fehler.value = ""
            this.aufgaben.value = await AufgabenApi.liste()
        } catch (e: ValidationException) {
            this.fehler.value = e.errors.map(f => f.message).join(", ")   // "ist erforderlich"
        }
    }

    fn build(): View => Column(spacing: 8.px, [
        Input(bind: this.titel, placeholder: "Neue Aufgabe").onSubmit(() => this.hinzufuegen()),
        Text(this.fehler.value).textColor(Color.Rose600),
        ForEach(this.aufgaben.value, a => Text(a.titel), key: a => a.id),
        Button("Abmelden").onClick(async () => {
            await KontoApi.abmelden()
            Window.navigate("/login")
        })
    ])
}
```

Was du dafür nicht schreiben musst: Passwort-Hashing (PBKDF2), signierte Session mit neuer Kennung nach dem Login,
Sperre der Session beim Abmelden, CSRF-Schutz, Begrenzung der Login-Versuche und die Prüfung, dass jedes Argument den
richtigen Typ hat. Testen lässt sich das mit `TestClient(user: Benutzer(2, "bob"))`, siehe [Testen](testen.md).

### Passkeys

Mit Passkeys melden sich Benutzer ohne Passwort an: per Fingerabdruck, Gesicht oder Geräte-PIN (WebAuthn). Es gibt
nichts, was sich abfangen oder auf einer gefälschten Seite eingeben ließe, denn der Passkey gilt nur für deine Domain.
Der Ablauf hat drei Schritte, jeweils über eine Service-Methode:

1. Der Server erzeugt Optionen mit einer Aufgabe (Challenge): `Passkeys.registration(…)` bzw. `Passkeys.authentication(…)`.
2. Der Browser zeigt den Dialog des Systems: `Passkey.create(optionen)` bzw. `Passkey.get(optionen)`.
3. Der Server prüft die Antwort: `Passkeys.register(…)` liefert einen `PasskeyKey` zum Speichern, `Passkeys.verify(…)` den
   neuen Zähler oder `null`.

```texo
package konten

import texo.server.*

@Auth
data class Benutzer(name: String)

@Api("/api/passkeys")
service PasskeyApi {
    // in echten Anwendungen in der Datenbank: id, publicKey, algorithm und counter je Passkey
    private let schluessel: Map<String, PasskeyKey> = Map()
    private let besitzer: Map<String, String> = Map()

    fn optionen(): String {
        let me = this.request.user
        if (me == null) throw HttpError(401, "Anmeldung erforderlich")
        return Passkeys.registration(this.request, me.name, me.name)
    }

    async fn anlegen(antwort: String): Void {
        let me = this.request.user
        if (me == null) throw HttpError(401, "Anmeldung erforderlich")
        let key = await Passkeys.register(this.request, antwort)
        this.schluessel.set(key.id, key)
        this.besitzer.set(key.id, me.name)
    }

    fn anmeldeOptionen(): String => Passkeys.authentication(this.request)

    @RateLimit(perMinute: 10)
    async fn anmelden(antwort: String): Boolean {
        let id = Passkeys.credentialId(antwort) ?? ""
        let key = this.schluessel.get(id)
        let name = this.besitzer.get(id)
        if (key == null || name == null) return false
        let zaehler = await Passkeys.verify(this.request, antwort, key)
        if (zaehler == null) return false
        this.schluessel.set(id, PasskeyKey(key.id, key.publicKey, key.algorithm, zaehler))
        this.request.signIn(Benutzer(name))
        return true
    }
}
```

Im Browser:

```texo
async fn passkeyAnlegen(): Void {
    await PasskeyApi.anlegen(await Passkey.create(await PasskeyApi.optionen()))
}

async fn mitPasskeyAnmelden(): Void {
    if (await PasskeyApi.anmelden(await Passkey.get(await PasskeyApi.anmeldeOptionen()))) Window.navigate("/")
}
```

Was der Server prüft (auf Node, Bun, Deno und dem Texo-Server gleich):

| Prüfung | schützt vor |
|---|---|
| Die Aufgabe steht in der signierten Session und gilt für genau einen Versuch | Wiedereinspielen einer alten Antwort |
| Herkunft (`origin`) und Hash der Domain (RP-Id) passen zur Anfrage | Phishing über eine fremde Seite |
| Das Flag „Benutzer anwesend“ ist gesetzt | Anmeldung ohne Zutun des Benutzers |
| Das Flag „Benutzer verifiziert“ ist gesetzt: PIN, Fingerabdruck oder Gesicht am Gerät | Anmeldung mit einem fremden, entsperrten Gerät oder einem Sicherheitsschlüssel ohne PIN |
| Signatur mit dem gespeicherten Schlüssel (ES256, Ed25519 oder RS256) | gefälschte Antworten |
| Der Signaturzähler wächst | kopierte Authenticatoren |

Die RP-Id ist der Hostname der Seite. Läuft die Anwendung unter mehreren Subdomains, setze `TEXO_RP_ID` auf die
gemeinsame Domain (z. B. `beispiel.de`). Passkeys brauchen HTTPS; zum Entwickeln genügt `http://localhost`, eine
IP-Adresse wie `127.0.0.1` lehnt der Browser ab. Eine Bescheinigung des Herstellers (Attestation) fragt Texo nicht ab.

Ist der Passkey ein **zweiter Faktor** neben dem Passwort, darf er auch ohne PIN gelten: setze dann
`TEXO_PASSKEY_USER_VERIFICATION=preferred` (oder `discouraged`). Ohne die Variable verlangt Texo die Verifikation
(`required`), denn als einziger Faktor ersetzt der Passkey das Passwort.

### Anmelden mit GitHub, Google, Microsoft oder GitLab (OAuth)

Benutzer melden sich bei einem Anbieter an, den sie schon haben. Texo nutzt den Ablauf *Authorization Code* mit PKCE
und holt das Profil über OpenID Connect (`userinfo`). Beide Schritte sind **Server-Wächter** an zwei Seiten:

```texo
@Server
fn github(): OAuthProvider => OAuthProvider.github(Env.require("GITHUB_ID"), Env.require("GITHUB_SECRET"))

/// Schritt 1: zum Anbieter umleiten
@Server
fn zuGithub(req: Request): Access => Access.redirect(OAuth.start(req, github(), "/auth/github"))

/// Schritt 2: der Anbieter schickt den Benutzer mit ?code=…&state=… zurück
@Server
async fn vonGithub(req: Request): Access {
    let p = await OAuth.finish(req, github())
    if (p == null) return Access.redirect("/login?fehler=github")
    let konto = await KontoApi.zuAnbieter(p.provider, p.id, p.name ?? p.id)   // eigenes Konto anlegen oder finden
    req.signIn(Benutzer(konto.id, konto.name, Rolle.Leser))
    return Access.redirect("/")
}

@Page(title: "GitHub", path: "/login/github")
@Guard(zuGithub)
component MitGithub { fn build(): View => Empty() }

@Page(title: "GitHub", path: "/auth/github")
@Guard(vonGithub)
component VonGithub { fn build(): View => Empty() }
```

Auf der Anmeldeseite genügt ein Link: `Link("Mit GitHub anmelden", to: "/login/github")`.

| Anbieter | Aufruf | Rückruf-Adresse eintragen bei |
|---|---|---|
| GitHub | `OAuthProvider.github(id, secret)` | Settings → Developer settings → OAuth Apps |
| Google | `OAuthProvider.google(id, secret)` | Google Cloud Console → APIs & Dienste → Anmeldedaten |
| Microsoft | `OAuthProvider.microsoft(id, secret, tenant = "common")` | Microsoft Entra ID → App-Registrierungen |
| GitLab | `OAuthProvider.gitlab(id, secret, url = "https://gitlab.com")` | Einstellungen → Anwendungen |
| andere mit OpenID Connect | `OAuthProvider(name, id, secret, authorizeUrl, tokenUrl, userInfoUrl)` | beim Anbieter |

`OAuth.finish` liefert ein `OAuthProfile` mit `provider`, `id`, `email`, `emailVerified`, `name` und `picture`, oder
`null`, wenn etwas nicht passt (der Grund steht als Warnung im Log). Erkenne Benutzer an `provider` und `id` wieder;
E-Mail-Adressen können sich ändern, und nur `emailVerified == true` sagt, dass der Anbieter sie bestätigt hat.

Was Texo dabei prüft (auf Node, Bun, Deno und dem Texo-Server gleich):

| Prüfung | schützt vor |
|---|---|
| `state` aus der signierten Session muss zum Rückruf passen, gilt für einen Versuch | untergeschobenen Anmeldungen (CSRF), Wiedereinspielen |
| PKCE (S256): der Code gilt nur zusammen mit dem Geheimnis aus der Session | abgefangenen Codes |
| Token und Profil holt der Server direkt beim Anbieter über HTTPS | gefälschten Profilen aus dem Browser |
| `signIn` gibt der Session eine neue Kennung | Session Fixation |

Die Rückruf-Adresse setzt sich aus der Adresse der Anfrage und dem Pfad zusammen (`http://localhost:3000/auth/github`).
Hinter einem Reverse Proxy oder bei mehreren Domains setze `TEXO_PUBLIC_URL` (z. B. `https://shop.beispiel.de`); die
Adresse muss genau so beim Anbieter eingetragen sein. `client_secret` gehört in die Umgebung (`.env`), nie in den
Quelltext. Server-Wächter dürfen die Session ändern: Was `signIn` oder `session.set` in einem Wächter schreibt, kommt
auch bei einer Umleitung mit dem Cookie zurück.

Der Compiler prüft:

- `@Auth` steht an genau einer `data class`, deren Felder übertragbar sind (wie bei Services).
- `request.user` und `request.signIn(…)` gibt es nur mit einer `@Auth`-Klasse:
  `'request.user' braucht eine Datenklasse mit @Auth`.
- `request.user` ist nullbar: `req.user.name` ist ein Fehler, `req.user?.name` nicht.

---

## Routen-Wächter (`@Guard`)

Ein Wächter ist eine Funktion, die `Access` zurückgibt:

| `Access` | Wirkung |
|---|---|
| `Access.allow()` | weiter |
| `Access.deny(403, "Nur für Admins")` | Seite: Fehlerseite mit Status; API: Fehler mit Status und Nachricht |
| `Access.redirect("/login")` | Seite: `303 See Other`; API: `401` mit Weiterleitung, der Browser-Client navigiert automatisch |

Texo unterscheidet die Seite **an der Signatur**:

| Signatur | läuft | schützt |
|---|---|---|
| `@Server fn g(req: Request): Access` | **auf dem Server**, vor jeder Auslieferung | Seiten (`@Page`), Services, einzelne Methoden |
| `fn g(): Access` (auch `async`) | **im Browser**, bevor die Seite sichtbar wird | Seiten (`@Page`), Router-Routen |

```texo
@Server
fn isAdmin(req: Request): Access {
    if (req.session.get("role") != "admin") return Access.deny(403, "Nur für Administratoren")
    return Access.allow()
}

/// Browser-Wächter: angemeldete Benutzer brauchen die Login-Seite nicht
async fn notLoggedInYet(): Access {
    let me = await AuthApi.me()
    return me == null ? Access.allow() : Access.redirect("/")
}

@Page(title: "Admin", path: "admin.html")
@Guard(loggedIn, isAdmin)          // Server: ohne Berechtigung wird das HTML gar nicht ausgeliefert
component AdminPage { … }

@Page(title: "Anmelden", path: "login.html")
@Guard(notLoggedInYet)             // Browser: leitet bereits angemeldete Benutzer weiter
component LoginPage { … }
```

Wächter werden der Reihe nach ausgewertet; der erste, der nicht `allow()` liefert, entscheidet. Bei Services gelten erst
die Wächter des Service, dann die der Methode.

Im **Router** (Single-Page-Apps) gibt es Browser-Wächter pro Route:

```texo
Router(
    Route("/", _ => Home()),
    Route("/einstellungen", _ => Settings(), guard: () => this.user.value != null ? Access.allow() : Access.redirect("/")),
)
```

> **Wichtig:** Browser-Wächter sind Komfort (schnelle Weiterleitung, kein Aufblitzen fremder Inhalte). Jeder Code im
> Browser kann manipuliert werden – **Schutz entsteht nur durch Server-Wächter.** Deshalb lehnt der Compiler
> Browser-Wächter an Services ab: `'ui' ist ein Browser-Wächter und kann eine API nicht schützen – der Server muss selbst prüfen`.

---

## Seiten mit Daten vom Server (`@Load`)

Statt eine Seite leer auszuliefern und die Daten danach in `onMount` nachzuladen, kann der Server sie gleich mitschicken.
Ein **Loader** ist eine `@Server`-Funktion; `@Load` verbindet ihn mit einer Seite. Platzhalter im Seitenpfad
(`:id`) werden zu Parametern des Loaders:

```texo
@Server
async fn loadNote(req: Request, id: Int): Note? {
    return (await NotesApi.list()).find(n => n.id == id)
}

@Page(title: "Notiz", path: "/notiz/:id")
@Guard(loggedIn)
@Load(loadNote)
component NotePage(note: Note) {
    fn build(): View => Text(this.note.text)
}
```

Bei jeder Anfrage an `/notiz/7`:

1. Die **Server-Wächter** laufen zuerst; ohne Berechtigung wird nichts geladen.
2. Der Server wandelt die Routenparameter um (`Int` oder `String`). Ist `/notiz/abc` keine Zahl, antwortet er mit 404.
3. Der Loader läuft. Liefert er `null`, gibt es 404; `throw HttpError(403, "…")` ergibt eine Fehlerseite mit diesem Status.
4. Das Ergebnis kommt mit demselben Codec wie bei Services als `<script type="application/json" id="tx-data">` in die
   Seite (`Cache-Control: no-store, private`). Der Browser baut die Seite sofort damit auf, ohne weitere Anfrage.

Der Compiler prüft:

- Der Loader ist mit `@Server` markiert, sein erster Parameter ist `req: Request`.
- Jeder weitere Parameter heißt wie ein Platzhalter im Pfad und ist `Int` oder `String`.
- Das Ergebnis ist übertragbar (wie bei Services). Die Seite hat genau einen Pflichtparameter, der es aufnimmt; ein
  nullbares Ergebnis (`Note?`) kommt ohne `null` an.
- Seiten mit `@Load` brauchen ein Backend.

`req.param("id")` liest einen Routenparameter auch in Wächtern. Die Datei einer Seite mit Platzhaltern heißt
`notiz/_id.html`; sie wird nur unter ihrem Muster ausgeliefert. Links auf solche Pfade (`Link("Öffnen", to: "/notiz/${n.id}")`)
sind echte URLs und keine Router-Pfade. Der Server rendert das HTML noch nicht selbst; das übernimmt der Browser mit den
mitgeschickten Daten.

---

## Formulare (`Form`)

Ein `Form` sendet seine Felder an eine Service-Methode. Es funktioniert auch, wenn JavaScript fehlt oder noch lädt:

```texo
package beispiel

import texo.server.*
import texo.ui.*

data class Anmeldung(@Required name: String, @Email email: String, personen: Int = 1)

@Api("/api/feier")
service Feier {
    fn anmelden(a: Anmeldung): String => "Danke, ${a.name}!"
}

@Page(title: "Anmeldung", path: "/")
component AnmeldeSeite {
    private State<String> name = State("")
    private State<String> email = State("")
    private State<String> meldung = State("")

    fn build(): View => Column(spacing: 12.px, [
        Form(Feier.anmelden, onDone: text => this.meldung.value = text, onError: m => this.meldung.value = m, [
            Input(bind: this.name, placeholder: "Name", name: "name"),
            Input(bind: this.email, placeholder: "E-Mail", type: InputType.Email, name: "email"),
            Button("Anmelden", submit: true)
        ]),
        Text(this.meldung.value)
    ])
}
```

**Mit JavaScript** ruft das Formular `Feier.anmelden` wie jeden anderen Service auf. `onDone` bekommt die Antwort.

**Ohne JavaScript** schickt der Browser `application/x-www-form-urlencoded` an `/api/feier/anmelden`. Der Server:

1. prüft Herkunft und CSRF-Token wie bei jedem Aufruf. Das Token steht im verdeckten Feld `tx_csrf`, das er beim
   Ausliefern der Seite einsetzt.
2. führt die Wächter aus. Leitet ein Wächter um (`Access.redirect`), folgt der Browser dorthin.
3. wandelt die Felder in Argumente um. Text bleibt Text, `Int` und `Float` werden geprüft (`1,5` gilt als `1.5`), eine
   angehakte Checkbox ist `true`, ein leeres Feld für `String?` ist `null`.
4. ruft die Methode auf und antwortet mit `303` zurück zur Seite, von der das Formular kam (nur gleiche Herkunft).

Ein Fehler ergibt eine schlichte HTML-Seite mit Status, Meldung, Feldfehlern und dem Link „Zurück“.

**Prüfregeln gelten auf dem Server:** Hat eine `data class` Regeln (`@Required`, `@Email`, `@MinLength` …), prüft der
Server jedes Argument dieses Typs, bevor die Methode läuft. Das gilt für jeden Aufruf, nicht nur für Formulare. Bei
Verstößen antwortet er mit `400` und `{ok: false, error: "Ungültige Eingaben", fields: [{field, message}]}`. Dieselbe
Antwort gibt es für eine `ValidationException` aus der Methode, etwa von Texo Data. Im Browser zeigt `Form` diese
Feldfehler direkt neben den Feldern.

`@Pattern("…")` ist ein JavaScript-Muster ohne Flags; `\d`, `\w` und `\b` meinen wie dort nur ASCII. Lookahead
(`(?=…)`) und Rückverweise (`\1`) meldet `texo check` als Fehler, weil der Texo-Server sie nicht prüfen kann.

Ein direkter Aufruf bekommt sie als `ValidationException` zurück, wie sie der Server geworfen hat. Die Regeln an der
Tabelle reichen also, eine zweite Prüfung im Service ist nicht nötig:

```texo
try {
  await AufgabenApi.neu(titel.value)
} catch (e: ValidationException) {
  fehler.value = e.errors.map(f => "${f.field}: ${f.message}").join(", ")   // "titel: ist erforderlich"
}
```

Beide Server (Node, Bun, Deno und der native Server `texo`) verhalten sich dabei gleich.

---

## Dateien hochladen (`Upload` und `Files`)

Eine Service-Methode nimmt Dateien als Parameter vom Typ `Upload` (auch `Upload?`, `List<Upload>` oder als Feld einer
`data class`). Im Browser liefert `FilePicker` die gewählte Datei, auf dem Server speichert `Files.save` sie:

```texo
package beispiel

import texo.server.*
import texo.ui.*

@Api("/api/profil")
service ProfilApi {
    /// speichert das Bild und liefert einen Link, der eine Stunde gilt
    async fn bild(foto: Upload): String {
        let key = await Files.save(foto, "avatare", maxSize: 5000000, types: ["image/*"])
        return Files.url(key)
    }
}

@Page(title: "Profilbild", path: "/")
component ProfilSeite {
    private State<Upload?> foto = State(null)
    private State<String> link = State("")

    fn build(): View => Column(spacing: 12.px, [
        FilePicker(bind: this.foto, accept: "image/*"),
        Button("Hochladen").onClick(() => this.hochladen()),
        Text(this.link.value)
    ])

    async fn hochladen(): Void {
        let f = this.foto.value
        if (f == null) return
        this.link.value = await ProfilApi.bild(f)
        this.foto.value = null
    }
}

@Page(title: "Ohne JavaScript", path: "/formular")
component FormularSeite {
    fn build(): View => Form(ProfilApi.bild, [
        FilePicker(name: "foto", accept: "image/*"),
        Button("Hochladen", submit: true)
    ])
}
```

**Übertragung.** Hat ein Aufruf Dateien, schickt der Browser `multipart/form-data`: die Argumente als JSON im Feld
`args`, jede Datei als eigenen Teil. Ein `Form` mit `FilePicker` bekommt `enctype="multipart/form-data"` und
funktioniert so auch ohne JavaScript. Ein leeres Dateifeld für einen `Upload`-Parameter ist ein Feldfehler
„Bitte eine Datei auswählen“, für `Upload?` ist es `null`. `Upload` gibt es nur in diese Richtung; als Rückgabe einer
Methode meldet der Compiler einen Fehler. Dateien zum Anzeigen gibt der Server als Link zurück.

**Was eine Datei mitbringt:** `name` (ohne Pfad), `type` (Medientyp laut Browser), `size` in Bytes und
`await datei.text()`. Name und Typ sind Angaben des Browsers, also nicht vertrauenswürdig.

**`Files.save(datei, ordner, maxSize, types)`** prüft und speichert:

- `maxSize` in Bytes; zu groß ergibt `HttpError` 413 „Datei zu groß (höchstens 5 MB)“.
- `types` wie bei `accept`: `"image/*"`, `"application/pdf"` oder Endungen wie `".pdf"`. Gezählt wird die Endung des
  Namens, nicht die Angabe des Browsers. Passt sie nicht, gibt es `HttpError` 415.
- PNG, JPEG, GIF, WebP und PDF müssen auch so anfangen: Eine `.png`, die eigentlich HTML ist, wird mit 415 abgelehnt.
- Der Schlüssel ist `ordner/zufällige-kennung/name.endung`. Der Name ist bereinigt (Umlaute umschrieben, sonst nur
  Buchstaben, Ziffern, `.`, `_` und `-`). Speichere den Schlüssel in der Datenbank, nicht den Link.

**`Files.url(key, minutes)`** gibt einen befristeten Link aus (Standard 60 Minuten, höchstens 7 Tage). Auf der
Platte zeigt er auf `/__texo/files/<schlüssel>?e=…&s=…`, signiert mit einem Schlüssel aus `TEXO_SECRET`. Ohne
gültige Signatur oder nach Ablauf antwortet der Server mit 404. Ausgeliefert wird mit `nosniff` und
`Content-Security-Policy: sandbox`. Bilder, Videos, Audio, PDF und Text zeigt der Browser an, alles andere (HTML, SVG,
Skripte …) kommt als Download. Videos lassen sich vorspulen (`Range`). `Files.delete(key)` und `Files.exists(key)`
ergänzen das.

**Nur für Angemeldete: `Files.privateUrl(key, this.request)`.** Ein Link aus `Files.url` gilt für jeden, der ihn hat.
Sollen Anhänge nur angemeldete Benutzer laden können, gib stattdessen `Files.privateUrl` aus: Der Link gilt nur mit
derselben Anmeldung wie beim Erzeugen. Abgemeldet, als anderer Benutzer oder weitergegeben antwortet der Server mit
404. Ist niemand angemeldet, wirft `privateUrl` `HttpError(401)`. Bei S3 läuft der Link über den eigenen Server, der
die Anmeldung prüft und dann auf einen S3-Link mit einer Minute Laufzeit weiterleitet.

```texo
package app

import texo.server.*

@Auth data class Benutzer(id: Int, name: String)

@Server
fn angemeldet(req: Request): Access => req.user != null ? Access.allow() : Access.deny(401, "Anmeldung erforderlich")

@Api("/api/anhaenge")
@Guard(angemeldet)
service Anhaenge {
    fn link(key: String): String => Files.privateUrl(key, this.request)
}
```

**Wohin.** Ohne weitere Einstellung landen Dateien im Ordner `data/files` (`TEXO_FILES` ändert ihn). Für einen
S3-kompatiblen Speicher (AWS S3, Cloudflare R2, MinIO, Hetzner, Backblaze …):

| Variable | |
|---|---|
| `TEXO_S3_BUCKET` | Name des Buckets; schaltet S3 ein |
| `TEXO_S3_REGION` | Region, Standard `us-east-1` (R2: `auto`) |
| `TEXO_S3_ENDPOINT` | eigener Endpunkt, z. B. `https://<konto>.r2.cloudflarestorage.com`; ohne ihn AWS |
| `TEXO_S3_ACCESS_KEY`, `TEXO_S3_SECRET_KEY` | Zugangsdaten |

Mit S3 sind die Links vorsignierte Adressen des Speichers (Signature Version 4), der Bucket bleibt privat.

**Grenzen.** Alle Dateien einer Anfrage zusammen dürfen `TEXO_UPLOAD_MAX` groß sein, Standard 20 MB (auch `50MB`).
Der Server hält eine Anfrage dabei im Speicher; für sehr große Dateien ist ein direkter Upload zu S3 besser.
In `texo test` liegen gespeicherte Dateien im Speicher.

---

## Echtzeit (`Stream` und `Channel`)

Eine Service-Methode kann statt eines Werts einen `Stream<T>` liefern. Die Verbindung bleibt offen, und jeder Wert kommt
im Browser an, sobald der Server ihn schickt. Werte verteilt ein `Channel<T>`:

```texo
package beispiel

import texo.server.*
import texo.ui.*

data class Nachricht(von: String, text: String)

@Api("/api/chat")
service Chat {
    private let kanal: Channel<Nachricht> = Channel()

    fn raum(): Stream<Nachricht> => this.kanal.stream()

    fn senden(text: String): Void {
        this.kanal.send(Nachricht(this.request.session.get("user") ?? "Gast", text))
    }
}

@Page(title: "Chat", path: "/")
component ChatSeite {
    private State<List<Nachricht>> verlauf = Chat.raum().collect()
    private State<String> entwurf = State("")

    fn build(): View => Column(spacing: 8.px, [
        ForEach(this.verlauf.value, n => Text("${n.von}: ${n.text}")),
        Input(bind: this.entwurf).onSubmit(() => Chat.senden(this.entwurf.value))
    ])
}
```

**Im Browser** ist `Chat.raum()` kein `Future`, sondern gleich ein `Stream<Nachricht>`. Er verbindet sich beim ersten
Abnehmer und trennt sich, wenn die Komponente verschwindet:

| Methode | Ergebnis |
| --- | --- |
| `collect()` | alle empfangenen Werte als `State<List<T>>` |
| `latest(initial)` | der zuletzt empfangene Wert als `State<T>` |
| `onEach(action)` | ruft `action` für jeden Wert auf, z. B. in `onMount` |
| `close()` | beendet die Verbindung |

Bricht die Verbindung ab, verbindet sich der Stream erneut, mit wachsender Pause bis 30 Sekunden. Ohne `replay` kommen
Werte, die in der Zwischenzeit gesendet wurden, nicht nach. Lade den Stand deshalb wie gewohnt (`fn liste(): List<T>`)
und nimm den Stream für das, was danach passiert. Das Notizen-Beispiel (`examples/fullstack`) macht es so. Für Listen
aus der Datenbank geht es einfacher mit einer [Live-Abfrage](#live-abfragen-live). Nutzen
mehrere Komponenten einer Seite denselben Stream (gleiche Methode, gleiche Argumente), teilen sie sich eine Verbindung.

**Auf dem Server** ist `Channel<T>` ein gewöhnliches Feld des Service. `send(value)` schickt den Wert an alle offenen
Streams, `subscribers` zählt sie. Der Wert wird dabei nur einmal in JSON umgewandelt, egal wie viele zuschauen.

Drei Einstellungen am Kanal bestimmen, was bei langsamen Verbindungen und Abbrüchen passiert:

```texo
private let chat: Channel<Nachricht> = Channel(replay: 50)                  // nach Abbruch: Verpasstes nachholen
private let kurse: Channel<Kurs> = Channel(buffer: 16, dropOldest: true)   // nur der neueste Kurs zählt
```

| Parameter | Standard | Bedeutung |
| --- | --- | --- |
| `buffer` | 256 | So viele Werte warten höchstens je Zuschauer, dessen Verbindung nicht hinterherkommt (Funkloch, langsames Netz). Ist das voll, endet sein Stream und der Browser verbindet neu. So hält ein einzelner langsamer Client nie unbegrenzt Speicher fest. |
| `dropOldest` | `false` | Statt den Stream zu beenden, fallen bei vollem Puffer die ältesten Werte weg. Richtig für Kurse, Positionen und Messwerte, bei denen nur der neueste Wert zählt. |
| `replay` | 0 | So viele letzte Werte hebt der Kanal auf. Jedes Ereignis bekommt eine ID (`id:`). Verbindet sich der Browser nach einem Abbruch neu, schickt er die letzte ID mit (`Last-Event-ID`) und bekommt zuerst alles, was er verpasst hat. |
| `shared` | `false` | Mit dem Instanz-Bus (`"cluster"` in der `texo.json`) gehen die Werte an die Zuschauer aller Instanzen. Ohne `"cluster"` ändert es nichts. | Wächter, `@RateLimit`, CSRF-Schutz und Session gelten beim Öffnen des Streams wie bei
jedem anderen Aufruf. Der Server antwortet mit Server-Sent Events (`text/event-stream`): eine Zeile `data: …` mit
dem Wert als JSON je Ereignis und alle 25 Sekunden ein Kommentar, damit Proxys eine ruhige Verbindung nicht schließen.
Über HTTP/1.1 erlauben Browser nur sechs Verbindungen je Domain. Der Server `texo` spricht deshalb auch HTTP/2 (über
HTTPS automatisch, ohne TLS für Proxys, die es direkt sprechen): dann laufen alle Streams und Aufrufe einer Seite über
eine Verbindung.

Die Werte eines Streams müssen übertragbar sein wie Rückgabewerte. Ein Kanal lebt im Speicher eines Serverprozesses.
Laufen mehrere Prozesse hinter einem Load Balancer, setzt du `shared: true` und schaltest in der `texo.json` den
Instanz-Bus ein (`"cluster": { "bus": "database" }`): dann sieht jeder Zuschauer alle Werte, egal an welcher Instanz er
hängt, und `replay` funktioniert auch nach einem Wechsel der Instanz – siehe
[Mehrere Instanzen](#mehrere-instanzen-cluster). Beide Server (Node, Bun, Deno und `texo`) verhalten sich gleich.

### Live-Abfragen (`.live()`)

Soll eine Liste aus der Datenbank aktuell bleiben, reicht `.live()` an der Abfrage. Die Methode liefert dann einen
`Stream<List<T>>`: zuerst das Ergebnis, danach ein neuer Wert, sobald ein `insert`, `update`, `delete` oder `save`
über Texo Data das Ergebnis ändert. Ein `Channel` ist dafür nicht nötig, und der Stand beim Verbinden kommt gleich mit.

```texo
fn offene(): Stream<List<Aufgabe>> => Aufgabe.where(a => !a.erledigt).orderBy(a => a.id).live()
```

```texo
private State<List<Aufgabe>> aufgaben = Aufgaben.offene().latest([])
```

Der Server bündelt Änderungen (höchstens alle 50 ms je Abfrage), schickt nur, wenn sich das Ergebnis geändert hat, und
lässt gleiche Abfragen mit gleichen Werten nur einmal laufen. Wächter gelten beim Verbinden. Nach einem Abbruch
bekommt der Browser wieder den vollen Stand. Schreibzugriffe über `Db.sql` meldest du mit `Db.changed("tabelle")`.
Einzelheiten und Grenzen stehen in [Datenbanken](datenbank.md#live-abfragen).

### Videos und große Dateien

Videos, Audio und andere Dateien legst du wie Bilder nach `public/` und zeigst sie mit `Video` oder `Audio`:

```texo
Video("/filme/intro.mp4", poster: "/filme/intro.jpg")
    .autoplay()
    .muted()
    .loop()
    .fit(ImageFit.Cover)
    .onEnded(() => { this.fertig.value = true })
Audio("/podcast/folge1.mp3")
```

Beide Server liefern Dateien in Teilen (`Range`, Antwort 206). Der Browser lädt so nur, was er gerade abspielt, Spulen
geht sofort, und Safari auf iPhone und Mac spielt Videos überhaupt erst damit ab. Dateien ab 1 MB (außer Seiten) liegen
nicht im Speicher, sondern werden beim Abruf blockweise von der Platte gelesen, nur so schnell, wie der Client sie
abnimmt. Ein 2-GB-Film belegt also keinen Arbeitsspeicher. Die Content-Security-Policy erlaubt Medien von der eigenen
Seite, aus `blob:` und über HTTPS (`media-src`).

### Livestreams mit OBS

Der Server `texo` nimmt Livestreams direkt aus OBS (oder jedem anderen RTMP-Programm) an und gibt sie als HLS an die
Browser weiter. Es wird nichts umgerechnet: das Bild kommt so an, wie OBS es kodiert, der Server zerlegt es nur in
Stücke von etwa 2 Sekunden. Ein Livestream kostet deshalb kaum Rechenzeit, und die Verzögerung liegt bei 6 bis 10
Sekunden.

Zum Einschalten setzt du einen geheimen Stream-Schlüssel (mindestens 16 Zeichen) und startest wie gewohnt:

```bash
TEXO_LIVE_KEY=ein-langes-geheimnis-123 texo start
```

In OBS unter *Einstellungen → Stream*:

| Feld | Wert |
|---|---|
| Dienst | Benutzerdefiniert |
| Server | `rtmp://dein-server:1935/live` |
| Streamschlüssel | `kamera?key=ein-langes-geheimnis-123` |

`kamera` ist der Name des Streams (Kleinbuchstaben, Ziffern, `-` und `_`). Unter *Ausgabe* stellst du den Encoder auf
x264 oder einen Hardware-Encoder für H.264, den Audio-Encoder auf AAC und das Keyframe-Intervall auf 2 Sekunden. Andere
Codecs (HEVC, AV1, Opus) lehnt der Server ab, weil nicht jeder Browser sie abspielt.

Auf der Seite zeigst du den Stream mit `Video.live`:

```texo
Video.live("kamera", poster: "/offline.jpg").muted().autoplay()
```

Safari spielt HLS selbst ab, Chrome, Firefox und Edge über Media Source Extensions; dafür braucht es keine
Bibliothek. Der Player hält sich am Live-Rand, holt nach einem Abbruch selbst wieder auf und wartet, solange niemand
sendet. Startet OBS neu, läuft das Bild beim Zuschauer ohne Neuladen weiter.

| Variable | Bedeutung | Standard |
|---|---|---|
| `TEXO_LIVE_KEY` | Stream-Schlüssel; ohne ihn ist Live aus | – |
| `TEXO_RTMP_PORT` | Port für OBS | `1935` |
| `TEXO_LIVE_MAX` | höchstens so viele Streams gleichzeitig | `8` |

Die Wiedergabe-Adressen liegen unter `/__texo/live/<name>/index.m3u8`; damit funktionieren auch VLC oder andere
HLS-Player. RTMP selbst ist unverschlüsselt. Läuft OBS nicht im selben Netz, schalte einen Tunnel davor (zum Beispiel
stunnel für RTMPS) oder sende über ein VPN. Livestreams gibt es nur mit dem Backend `texo`; unter Node, Bun und Deno
antwortet die Adresse mit 404 und der Player wartet.

---

## Zeitpläne (`@Cron` und `@Every`)

Private Methoden eines Service können nach Zeitplan auf dem Server laufen, auf allen Backends gleich. Über die API
sind sie nicht erreichbar.

```texo
@Api("/api/notes")
service NotesApi {
    // jeden Tag um 03:00 Ortszeit
    @Cron("0 3 * * *")
    private async fn aufraeumen(): Void {
        await Note.where(n => n.archiviert).deleteAll()
    }

    // alle 15 Minuten (:00, :15, :30, :45)
    @Every(15.min)
    private fn statistik(): Void {
        Log.info("Notizen: ${this.notes.length}")
    }
}
```

- `@Cron` nimmt die üblichen fünf Felder: Minute, Stunde, Tag, Monat, Wochentag. Erlaubt sind `*`, `*/5`, `1-5`,
  `1,15`, `9-17/2`, Namen wie `mon-fri` oder `jan` und die Kürzel `@hourly`, `@daily`, `@weekly`, `@monthly`,
  `@yearly`. Wochentag 0 und 7 sind Sonntag. Sind Tag und Wochentag beide gesetzt, reicht einer (wie bei cron).
  Einen falschen Ausdruck meldet schon der Compiler.
- `@Every` nimmt eine feste Dauer von mindestens einer Sekunde: `30.s`, `15.min`, `2.h`, `1.d`. Die Läufe liegen auf
  Vielfachen des Abstands, gezählt ab 1970 (UTC). `@Every(15.min)` läuft also zur vollen Viertelstunde.
- Die Methode ist `private`, hat keine Parameter und gibt `Void` oder `Future<Void>` zurück. `this.request` gibt es
  in einem Zeitplan nicht, das meldet der Compiler.
- Läuft ein Durchgang noch, wenn der nächste fällig wäre, fällt der nächste aus. Läufe überlappen sich nie.
- Ein Fehler landet im Log (`Zeitplan NotesApi.aufraeumen: …`). Der nächste Termin gilt trotzdem.
- In `texo test` laufen Zeitpläne nicht von selbst. Stellt ein Test die Uhr mit [`Clock`](testen.md#die-uhr-stellen-clock),
  führt `await Jobs.runPending()` die fällig gewordenen aus.

**Zeitzone.** `@Cron` gilt in der Ortszeit des Rechners, auf dem der Server läuft (beim Entwickeln also dein PC).
Mit der Umgebungsvariable `TZ` legst du sie fest, z. B. `TZ=Europe/Berlin`. Docker-Container ohne `TZ` laufen meist
in UTC. Bei der Zeitumstellung gilt: Ein Termin in der übersprungenen Stunde im Frühjahr läuft direkt danach
(02:30 wird zu 03:30). Ein Termin in der doppelten Stunde im Herbst läuft einmal; nur Zeitpläne für jede Stunde
(`30 * * * *`) laufen in beiden Stunden. `@Every` hängt nicht von der Zeitzone ab.

**Mehrere Instanzen.** Hat die Anwendung eine Datenbank, trägt jeder Serverprozess einen fälligen Termin vor dem
Lauf in die Tabelle `_texo_cron` ein. Nur der Prozess, dem das gelingt, führt ihn aus. Bei mehreren Instanzen läuft
jeder Termin also einmal. Ohne Datenbank führt jeder Prozess seine Zeitpläne selbst aus. Einträge älter als sieben
Tage werden gelöscht.

Die Server-VM des Backends texo hat einen Thread. Ein Zeitplan, der lange rechnet statt zu warten, hält in dieser
Zeit Anfragen auf. Warten auf Datenbank oder Netz ist kein Problem.

---

## Hintergrundjobs (`@Job`)

Eine `@Job`-Funktion läuft nicht sofort, sondern kommt in eine Warteschlange und wird im Hintergrund abgearbeitet.
Die Anfrage, die sie anstößt, wartet nicht darauf. Das passt für E-Mails, Berichte, Bildverarbeitung oder Aufrufe
fremder Dienste.

```texo
@Job(retries: 3, timeout: 5.min)
async fn monatsbericht(nutzer: Int, monat: String): Void {
    let notizen = await Note.where(n => n.autor == nutzer).list()
    await Bericht(nutzer, monat, notizen.length).insert()
}

@Api("/api/berichte")
service Berichte {
    fn anfordern(nutzer: Int, monat: String): Void {
        monatsbericht.enqueue(nutzer, monat)               // kehrt sofort zurück
        monatsbericht.enqueue(nutzer, monat, delay: 1.h)   // frühestens in einer Stunde
    }
}
```

- `@Job` gehört an eine Funktion auf oberster Ebene und macht sie zu Server-Code (wie `@Server`). Sie gibt `Void`
  oder `Future<Void>` zurück; Ergebnisse speichert sie z. B. in der Datenbank.
- `enqueue` hat dieselben Parameter wie die Funktion, typgeprüft, dazu `delay:`. Die Argumente müssen übertragbar
  sein (Int, Float, Boolean, String, Enums, data classes, List, Map, Pair), sonst meldet es der Compiler. Fehlende
  Argumente bekommen beim Lauf ihren Standardwert.
- Schlägt ein Job fehl, läuft er erneut nach 30 s, 2 min, 8 min usw. `retries` sagt, wie oft (Standard 3, höchstens
  20). Danach bleibt er mit seiner Fehlermeldung als fehlgeschlagen in der Warteschlange und erscheint im Log
  (`Job app/Berichte.monatsbericht fehlgeschlagen …`).
- `timeout:` begrenzt die Dauer eines Durchgangs (mindestens 1 s); eine Überschreitung zählt als Fehler. Ohne
  `timeout` gilt nur die Rechenzeitgrenze wie bei Anfragen (`TEXO_VM_TIMEOUT` im Backend texo).
- Der Server führt höchstens vier Jobs zugleich aus. Einen neuen Job startet er sofort, sonst schaut er jede Sekunde
  nach fälligen.

**Speicherung und mehrere Instanzen.** Hat die Anwendung eine Datenbank, liegen die Jobs in der Tabelle `_texo_jobs`
und überstehen Neustarts. Mehrere Serverprozesse teilen sich die Arbeit: vor jedem Durchgang trägt ein Prozess ihn in
`_texo_cron` ein, nur wem das gelingt, führt ihn aus. Stirbt der Prozess mitten im Lauf, ist der Job nach seinem
`timeout` plus einer Minute wieder fällig (ohne `timeout` nach einer Stunde) und zählt als Versuch. Ohne Datenbank
liegt die Warteschlange im Speicher; beim Start erscheint dazu eine Warnung, denn ein Neustart verliert offene Jobs.

**Testen.** In `texo test` laufen Jobs nicht von selbst, und jeder Test beginnt mit einer leeren Warteschlange.
`await Jobs.pending()` liefert die Namen der offenen Jobs, `await Jobs.runPending()` führt jeden offenen einmal aus
(auch die mit `delay` und die, die auf einen neuen Versuch warten) und gibt die Anzahl der Läufe zurück. Hat der Test
die Uhr mit [`Clock`](testen.md#die-uhr-stellen-clock) gestellt, laufen nur die bis dahin fälligen.

```texo
@Test("Bericht wird im Hintergrund erstellt")
async fn bericht() {
    await Berichte.anfordern(7, "2026-10")
    expect((await Jobs.pending()).join(",")).toBe("monatsbericht,monatsbericht")
    expect(await Jobs.runPending()).toBe(2)
}
```

Wie bei Zeitplänen gilt im Backend texo: Ein Job, der lange rechnet statt zu warten, hält in dieser Zeit Anfragen auf.

## E-Mails verschicken (`Mail` und `Tokens`)

Eine Mail besteht aus Bausteinen. Texo macht daraus HTML, das in Gmail, Outlook und Apple Mail gleich aussieht
(Tabellen und eingebettete Stile, höchstens 560 px breit), und eine Textfassung. Vorlagen sind gewöhnliche
`@Server`-Funktionen, die eine `Mail` zurückgeben:

```texo
package konto

import texo.server.*

@Server
fn bestaetigung(name: String, link: String): Mail => Mail("Bitte bestätige deine Adresse", [
    MailHeading("Hallo ${name}!"),
    MailText("Schön, dass du dabei bist. Bitte bestätige noch deine E-Mail-Adresse."),
    MailButton("Adresse bestätigen", link),
    MailText("Der Link gilt 24 Stunden. Du hast dich nicht angemeldet? Dann ignoriere diese Mail.", muted: true),
], preview: "Noch ein Klick, dann bist du dabei")

@Server
fn sendeBestaetigung(name: String, email: String, seite: String): Void {
    let token = Tokens.create("confirm", email, 24 * 60)
    Mail.send(email, bestaetigung(name, "${seite}?t=${token}"))
}

@Api("/api/konto")
service KontoApi {
    fn registrieren(name: String, email: String): Void {
        // … Benutzer anlegen …
        sendeBestaetigung(name, email, this.request.link("/bestaetigen"))
    }

    /// Die Seite /bestaetigen ruft das mit dem Token aus der Adresse auf.
    fn bestaetigen(token: String): Boolean {
        let email = Tokens.check("confirm", token)
        if (email == null) return false
        // … Adresse als bestätigt speichern …
        return true
    }
}
```

| Baustein | Wirkung |
|---|---|
| `MailHeading(text, level = 1)` | Überschrift (Stufe 1 bis 3) |
| `MailText(text, muted = false)` | Absatz, Zeilenumbrüche bleiben; `muted` kleiner und grau, z. B. für Hinweise |
| `MailButton(label, url)` | Knopf in der Akzentfarbe |
| `MailLink(label, url)` | Link als eigene Zeile, auch `mailto:` |
| `MailImage(url, alt = "", width = 0)` | Bild von einer öffentlichen Adresse; `width` in Pixeln, 0 = volle Breite |
| `MailCode(text)` | Code zum Abtippen, groß und gesperrt |
| `MailDivider()`, `MailSpacer(height = 16)` | Trennlinie, Leerraum |

`Mail(subject, parts, preview = "", accent = "#4f46e5")`: `preview` ist die Vorschauzeile in der Liste des
Mailprogramms, `accent` die Farbe von Knöpfen und Links. `mail.html()` und `mail.text()` liefern beide Fassungen,
etwa für eine Vorschau. Links in Mails müssen absolut sein (`https://…`); `req.link("/pfad")` setzt
`TEXO_PUBLIC_URL` davor. Eine relative Adresse ist ein Fehler beim Erzeugen des Bausteins.

**Versand.** `Mail.send(to, mail, from = null, replyTo = null)` prüft die Adressen, rendert die Mail und kehrt sofort
zurück. Empfänger und Absender sind `"ada@example.com"` oder `"Ada Lovelace <ada@example.com>"`; ungültige Adressen
und Zeilenumbrüche (eingeschleuste Kopfzeilen) sind ein Fehler beim Aufruf.

| Variable | Bedeutung |
|---|---|
| `TEXO_SMTP_URL` | `smtps://benutzer:passwort@smtp.example.com:465` (TLS) oder `smtp://…:587` (STARTTLS, Pflicht). Sonderzeichen im Passwort %-kodieren. `smtp://localhost:1025?tls=off` nur für einen Testserver wie Mailpit auf dem eigenen Rechner |
| `TEXO_MAIL_FROM` | Standardabsender, z. B. `Notizen <noreply@example.com>`; ohne ihn muss jeder Aufruf `from` angeben |
| `TEXO_PUBLIC_URL` | Adresse der App für `req.link`, z. B. `https://notizen.example.com` |

Mit `TEXO_SMTP_URL` kommt jede Mail als Job in die [Warteschlange](#hintergrundjobs-job): Ist der Mailserver nicht
erreichbar oder lehnt er ab, versucht Texo es nach 30 s, 2 min, 8 min, 32 min und gut 2 Stunden erneut; danach steht
der Fehler im Log. Mit Datenbank überstehen offene Mails einen Neustart. Angemeldet wird mit AUTH PLAIN oder LOGIN,
nur über TLS (außer mit `?tls=off`).

**Ohne `TEXO_SMTP_URL`** verschickt Texo nichts: die Mail erscheint mit Betreff und Textfassung im Log und im
Postausgang `Mail.outbox()` (die letzten 50). So lassen sich Links zum Bestätigen beim Entwickeln direkt aus dem Log
öffnen.

**Links zum Bestätigen und Zurücksetzen.** `Tokens.create(purpose, value, minutes = 60, bind = "")` signiert einen
Wert mit Ablaufzeit (Schlüssel aus `TEXO_SECRET`), `Tokens.check(purpose, token, bind = "")` liefert ihn zurück oder
`null`, wenn das Token gefälscht, abgelaufen oder für einen anderen Zweck ist. `bind` bindet es an einen Zustand: mit
dem aktuellen Passwort-Hash gilt ein Link zum Zurücksetzen nur, bis das Passwort geändert wurde, also genau einmal.

```texo
package konto

import texo.server.*
import texo.db.*

@Table
data class Konto(@Id id: Int = 0, @Unique @Email email: String, passwortHash: String)

@Api("/api/passwort")
service PasswortApi {
    @RateLimit(perMinute: 5)
    async fn vergessen(email: String): Void {
        let konto = await Konto.where(k => k.email == email).first()
        if (konto == null) return                      // nicht verraten, ob es die Adresse gibt
        let token = Tokens.create("reset", "${konto.id}", 30, konto.passwortHash)
        Mail.send(email, Mail("Passwort zurücksetzen", [
            MailHeading("Neues Passwort"),
            MailText("Mit dem Knopf legst du ein neues Passwort fest. Der Link gilt 30 Minuten."),
            MailButton("Passwort festlegen", this.request.link("/passwort/neu?id=${konto.id}&t=${token}")),
        ]))
    }

    async fn festlegen(id: Int, token: String, passwort: String): Boolean {
        let konto = await Konto.find(id)
        if (konto == null || Tokens.check("reset", token, konto.passwortHash) != "${id}") return false
        await Konto.update(konto.copy(passwortHash: await Password.hash(passwort)))
        return true
    }
}
```

- Der Wert steht lesbar im Token (base64), deshalb nur Kennungen oder Adressen hineinlegen, keine Geheimnisse.
- Ohne `TEXO_SECRET` gelten Tokens nur bis zum Neustart (beim ersten Token erscheint eine Warnung).
- `TEXO_PUBLIC_URL` gehört in jede Produktion mit Mails: ohne sie nimmt `req.link` den Host-Header der Anfrage, und
  ein Angreifer könnte sich Links auf seine eigene Domain schicken lassen.

**Testen.** In `texo test` gibt es kein SMTP; jede Mail landet in `Mail.outbox()`, und jeder Test beginnt mit einem
leeren Postausgang. `this.request` gibt es in Tests nicht, daher die Adresse als Parameter übergeben:

```texo
@Test("Bestätigungsmail")
async fn bestaetigungsmail() {
    sendeBestaetigung("Ada", "ada@example.com", "https://app.example/bestaetigen")
    let m = Mail.outbox()[0]
    expect(m.subject).toBe("Bitte bestätige deine Adresse")
    expect(m.text).toContain("Adresse bestätigen: https://app.example/bestaetigen?t=")
    let token = m.text.split("?t=")[1].split("\n")[0]
    expect(await KontoApi.bestaetigen(token)).toBe(true)
}
```

---

## Zwischenspeicher (`@Cache`)

Manche Methoden liefern lange dasselbe: eine Produktliste, eine Statistik, eine Antwort eines fremden Dienstes.
Mit `@Cache` merkt sich der Server das Ergebnis und gibt es bei gleichen Aufrufen direkt zurück, ohne die Methode
erneut auszuführen.

```texo
@Api("/api/laden")
service Laden {
    @Cache(ttl: 5.min)
    async fn suche(text: String, seite: Int): List<Produkt> =>
        await Produkt.where(p => p.name.lower().contains(text.lower())).page(seite, 20).list()

    @Cache(ttl: 1.h, shared: true)
    async fn kategorien(): List<String> => await ladeKategorien()

    async fn speichern(p: Produkt): Produkt {
        let neu = await Produkt.save(p)
        Cache.clear("Laden")   // niemand sieht danach eine alte Liste
        return neu
    }
}
```

- `ttl:` sagt, wie lange ein Ergebnis gilt (mindestens 1 s). Danach führt der nächste Aufruf die Methode wieder aus.
- **Gleich heißt:** gleiche Argumente und gleiche Sitzung. Jeder angemeldete Benutzer hat also seine eigenen
  Einträge, und niemand bekommt Daten eines anderen. Hängt das Ergebnis nicht vom Benutzer ab, legt
  `shared: true` einen Eintrag für alle an. Werte aus Kopfzeilen oder Cookies außerhalb der Sitzung fließen nicht
  in den Schlüssel ein. Methoden, die sie lesen, bekommen kein `@Cache`.
- Nicht gespeichert wird, was mit einem Fehler endet oder die Sitzung ändert (`request.session.set`, An- und
  Abmelden). Wächter und `@RateLimit` laufen bei jedem Aufruf, auch wenn das Ergebnis aus dem Speicher kommt.
- Kommen gleiche Aufrufe gleichzeitig an, läuft die Methode einmal, und die anderen warten auf ihr Ergebnis.
- `Cache.clear()` leert alles, `Cache.clear("Laden")` einen Service, `Cache.clear("Laden.suche")` eine Methode.
  Meist einfacher: `@Invalidates(Laden.suche)` an der Methode, die etwas ändert. Sie leert den Speicher nach jedem
  erfolgreichen Aufruf selbst, siehe [Server-Daten im Browser](#server-daten-im-browser-resource-und-invalidates).
- `@Cache` gehört an Methoden, die über die API aufgerufen werden und ein Ergebnis haben (keine `Stream`s).
  Formulare ohne JavaScript (`Form(…)`) gehen immer an die Methode selbst.

Der Speicher liegt im Arbeitsspeicher des Serverprozesses, höchstens 1000 Einträge je Methode. Bei mehreren
Instanzen hat jede ihren eigenen, außer mit `TEXO_KV_URL` (siehe unten). Mit dem Instanz-Bus ([`cluster`](#mehrere-instanzen-cluster)) leeren `Cache.clear`,
`@Invalidates` und „Cache leeren“ in der [Verwaltungskonsole](#betrieb-verwaltungskonsole-adminconsole) die Einträge
in allen Instanzen. Die Antwort trägt die Kopfzeile `X-Texo-Cache: hit` oder `miss`. In `texo test` rufen Tests die Methoden direkt auf, dort wirkt `@Cache`
nicht.

---

## Gemeinsamer Speicher mit anderen Programmen (`Kv`)

::: tip Eigene Seite
Alles zu Kv mit Schnellstart, API, Go-Beispielen und Betrieb steht gesammelt auf
[Kv: Valkey und Redis](kv.md).
:::

`@Cache` gehört einer Texo-Anwendung allein. Arbeitet sie mit einem anderen Programm zusammen, zum Beispiel einem
Go-Server, teilen sich beide mit `Kv` einen Schlüssel-Wert-Speicher: Valkey, Redis, KeyDB oder Dragonfly. Beide
lesen und schreiben dieselben Schlüssel, Zähler und Hashes und schicken sich Nachrichten über Pub/Sub.

```sh
TEXO_KV_URL=valkey://texo:geheim@valkey:6379/0 TEXO_KV_PREFIX=lager: texo start
```

```texo
package app

import texo.server.*

data class Bestand(sku: String, menge: Int, lager: Map<String, Int>)

@Api("/api/lager")
service Lager {
    // liest lager:bestand:<sku>; fehlt er, lädt die Funktion ihn und er bleibt 30 Sekunden
    async fn bestand(sku: String): Bestand =>
        await Kv.cached("bestand:${sku}", 30.s, async () => Bestand(sku, 0, [:]))

    async fn merken(sku: String): Boolean => await Kv.set("zuletzt", sku, ttl: 1.d)

    async fn aufrufe(): Int => await Kv.increment("aufrufe")

    async fn gebucht(sku: String): Int => await Kv.publish("buchungen", sku)
}
```

Dieselben Daten in Go, zum Beispiel mit valkey-go:

```go
var b Bestand // struct mit json:"sku", json:"menge", json:"lager"
s, _ := client.Do(ctx, client.B().Get().Key("lager:bestand:"+sku).Build()).ToString()
json.Unmarshal([]byte(s), &b)
client.Do(ctx, client.B().Del().Key("lager:bestand:"+sku).Build()) // Texo lädt beim nächsten Aufruf neu
```

| Variable | |
| --- | --- |
| `TEXO_KV_URL` | `valkey://benutzer:passwort@rechner:6379/0`, mit TLS `valkeys://…`; `redis://` und `rediss://` gehen auch. Ohne Benutzer `valkey://:passwort@…` |
| `TEXO_KV_PREFIX` | steht vor jedem Schlüssel und Kanal, z. B. `lager:`; Standard leer, damit Texo genau die Schlüssel sieht, die das andere Programm schreibt |
| `TEXO_KV_SESSIONS` | `1`: Sitzungen liegen in Kv, siehe [unten](#sitzungen-in-kv) |

**Kodierung.** Damit das andere Programm die Werte versteht, gilt eine feste Regel:

| Texo-Typ | im Speicher | in Go |
| --- | --- | --- |
| `String`, Enum-Fall | der Text, ohne Anführungszeichen | `string` |
| `Int`, `Float`, `Boolean` | Zahl bzw. `true`/`false` als Text | `strconv`, `INCRBY` |
| `DateTime` | ISO 8601 (`2026-11-08T12:00:00.000Z`) | `time.Parse(time.RFC3339, …)` |
| data class, `List`, `Map` | JSON mit den Feldnamen aus Texo, Maps als Objekte | `json.Unmarshal` |

Was ein anderes Programm geschrieben hat, sind fremde Daten. `Kv.get<T>` prüft sie wie die Antwort eines fremden
Dienstes: unbekannte Felder zählen nicht, fehlt ein Pflichtfeld oder passt ein Typ nicht, wirft es `KvError` mit dem
Schlüssel in der Meldung, statt falsche Daten weiterzugeben. `Kv.cached` lädt in diesem Fall neu.

- `Kv.cached(key, ttl, load)`: Kommen gleiche Aufrufe gleichzeitig an, auch auf verschiedenen Instanzen, lädt nur
  der erste. Die anderen warten auf seinen Wert (Sperre unter `<präfix>texo:lock:<schlüssel>`, höchstens 10 s).
- `Kv.set(key, null)` löscht den Schlüssel, `onlyIfAbsent: true` setzt ihn nur, wenn es ihn noch nicht gibt.
- `Kv.command("LPUSH", ["liste", "x"])` führt jeden anderen Befehl aus, ohne Präfix und ohne Prüfung.
- Jeder Befehl wird ein Abschnitt im Trace (`kv GET`, ohne Schlüssel und Werte). Nach 5 s ohne Antwort wirft er
  `KvError`.

Ohne `TEXO_KV_URL` liegt alles im Speicher dieser Instanz, mit denselben Befehlen. So laufen `texo dev` und
`texo test` ohne Valkey. Alle Backends (Texo, Node, Bun, Deno) sprechen das Protokoll selbst, ohne npm-Pakete.

Ein vollständiges Beispiel mit Go-Dienst (Cache, Bestände, Live-Buchungen, Sitzungen) liegt in
[`examples/lager-go`](beispiele/lager-go.md).

### Valkey bei `texo init`

Bei jedem Projekt mit Backend fragt `texo init`, ob Valkey dazukommen soll (direkt: `--kv valkey`, ohne: `--kv none`).
Dann schreibt es `TEXO_KV_URL=valkey://localhost:6379` in `.env` und `.env.example` und einen Valkey-Dienst in
`docker-compose.yml`, neben einer Datenbank, falls eine gewählt ist:

```sh
texo init umfrage --example umfrage --backend texo --kv valkey
cd umfrage && docker compose up -d && texo dev
```

Das Beispiel **Live-Umfrage** (`--example umfrage`) zeigt `Kv` als Baustein einer normalen Anwendung:

- Jede Antwort ist ein Zähler (`Kv.increment("umfrage:stimmen:Go")`), gelesen mit `Kv.getMany`.
- Das Ergebnis liegt als `@Cache(shared: true, key: "umfrage:ergebnis")` für alle Instanzen gemeinsam, `@Invalidates`
  leert es nach jeder Stimme.
- `Channel(topic: "umfrage:ergebnis")` schickt neue Ergebnisse live an alle offenen Seiten, auch auf anderen
  Instanzen. Jedes andere Programm liest mit `SUBSCRIBE umfrage:ergebnis` mit.
- `@RateLimit` zählt über alle Instanzen, die Sitzung merkt sich die eigene Stimme.
- Ein Besuchszähler je Tag verschwindet mit `Kv.expire` nach 24 Stunden von selbst.

Ohne Valkey läuft dasselbe Beispiel im Speicher der Instanz, auch in `texo test`.

### Kanäle mit anderen Programmen (`Channel(topic:)`)

```texo
@Api("/api/boerse")
service Boerse {
    // <präfix>preise in Kv: was Texo oder ein anderes Programm dort veröffentlicht, kommt bei allen Streams an
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
  erst von dort, damit alle Instanzen dieselbe Reihenfolge sehen. Was nicht zum Typ passt, landet im Log statt beim
  Browser.
- Ein Kanal mit `topic:` reicht ohne `"cluster"` über alle Instanzen. `replay` hebt jede Instanz für sich auf.
- Ist Kv nicht erreichbar, bekommen wenigstens die Zuschauer dieser Instanz die Werte.

### Weitere Daten in Kv

Mit `TEXO_KV_URL` liegt noch mehr im gemeinsamen Speicher, ohne dass sich am Code etwas ändert:

| Was | Wo | Für andere Programme |
| --- | --- | --- |
| `@RateLimit` | Zähler `<präfix>texo:rate:<client>\|<pfad>` für eine Minute | die Grenze gilt für alle Instanzen zusammen |
| Abmelden (`session.clear()`) | Hash `<präfix>texo:revoked` (Kennung → Ablauf in ms), angekündigt über `PUBLISH <präfix>texo:revoke` | `HGET` sagt, ob eine Sitzung gesperrt ist; neue Instanzen kennen die Sperren sofort |
| `@Cache` leeren | `PUBLISH <präfix>texo:cache-clear "Katalog.artikel"` | so leert ein anderes Programm den `@Cache` aller Instanzen (auch `local: true`) |

Ist Kv nicht erreichbar, zählt und sperrt jede Instanz für sich weiter.

### Sitzungen in Kv

Mit `TEXO_KV_SESSIONS=1` liegt jede Sitzung (`this.request.session`) zusätzlich unter `<präfix>texo:session:<kennung>`
als JSON `{"data": {"name": "ada"}, "expires": 1731100000000}`. Ein anderes Programm liest sie so, ändert Werte oder
meldet jemanden mit `DEL` ab. Die Kennung steht im Cookie `tx_session`: Base64url-JSON vor dem Punkt, Feld `i`.

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
- Wer `TEXO_KV_SESSIONS` einschaltet, meldet alle bisherigen Sitzungen einmal ab (sie stehen noch nicht in Kv).
- Ist Kv nicht erreichbar, gelten die Werte aus dem Cookie, das Log meldet es höchstens einmal je Minute.
- Die Kennung im Cookie ist nicht geheim, aber nur mit gültiger Signatur (`TEXO_SECRET`) nimmt Texo das Cookie an.
  Ein anderes Programm, das nur liest, braucht das Geheimnis nicht; es vertraut dem Eintrag in Kv.

### `@Cache` in Kv

Mit `TEXO_KV_URL` legt `@Cache` seine Einträge in Kv statt im Arbeitsspeicher. Alle Instanzen teilen sich dann einen
Speicher, und gleiche Aufrufe zur selben Zeit laufen auch über Instanzen hinweg nur einmal. `Cache.clear` und
`@Invalidates` leeren die Einträge in Kv, bevor die Antwort hinausgeht.

```texo
@Api("/api/katalog")
service Katalog {
    // liegt unter <präfix>artikel:42, so wie Kv.set ihn schreibt: Go liest ihn mit json.Unmarshal
    @Cache(ttl: 10.min, shared: true, key: "artikel:{id}")
    async fn artikel(id: String): Artikel => await Artikel.find(id)

    // bleibt im Arbeitsspeicher dieser Instanz, auch mit Kv
    @Cache(ttl: 5.s, local: true)
    async fn uhrzeit(): String => DateTime.now().toIso()
}
```

- `key: "artikel:{id}"` gibt dem Eintrag einen festen Namen, `{id}` ist ein Parameter der Methode (Text, Zahl,
  Wahrheitswert oder Enum). Nur mit `shared: true`, sonst sähe jeder Benutzer die Daten des anderen. Den Wert
  schreibt Texo wie `Kv.set` (Tabelle oben), was ein anderes Programm dort ablegt, prüft es wie `Kv.get`; passt es
  nicht, lädt die Methode neu.
- Ohne `key:` heißen Einträge `<präfix>texo:cache:<Service.methode>:<hash>`. Die Schlüssel einer Methode stehen im Set
  `<präfix>texo:cache-index:<Service.methode>`, die Methoden mit Einträgen in `<präfix>texo:cache-methods`.
- **Aus Go leeren:** `DEL <präfix>artikel:42` für einen festen Namen; für alle Einträge einer Methode
  `PUBLISH <präfix>texo:cache-clear Katalog.artikel` (oder `Katalog` für den ganzen Service, leer für alles).
- `local: true` lässt eine Methode im Arbeitsspeicher, etwa für sehr kurze Lebensdauern.
- Ist Kv nicht erreichbar, laufen die Methoden ohne Zwischenspeicher weiter, das Log meldet es höchstens einmal je
  Minute.

---

## Server-Daten im Browser (`Resource` und `@Invalidates`)

Daten nach dem Laden der Seite zu holen heißt ohne Hilfe: ein `State` für die Daten, eines für das Lade-Flag, eines
für den Fehler, dazu `onMount` mit `try` und `catch`. `Resource<T>` fasst das zusammen. Eine Service-Methode mit
`@Invalidates` sagt, welche Daten sie ändert. Danach laden alle betroffenen Resources im Browser von selbst neu, und
der Server leert den passenden `@Cache`.

```texo
package notizen

import texo.server.*
import texo.ui.*

data class Notiz(id: Int, text: String)

@Api("/api/notizen")
service Notizen {
    private var alle: List<Notiz> = []

    @Cache(ttl: 5.min)
    fn liste(suche: String): List<Notiz> => this.alle.filter(n => n.text.contains(suche))

    @Invalidates(Notizen.liste)
    fn anlegen(text: String): Notiz {
        let n = Notiz(this.alle.size + 1, text)
        this.alle = this.alle + [n]
        return n
    }
}

@Page(title: "Notizen", path: "/")
component NotizSeite {
    private State<String> suche = State("")
    private State<String> entwurf = State("")
    private Resource<List<Notiz>> notizen = Resource(() => Notizen.liste(this.suche.value))

    fn build(): View => Column(spacing: 8.px, [
        Input(bind: this.suche, placeholder: "Suchen …"),
        If(this.notizen.loading, Spinner()),
        Text(this.notizen.error?.message ?? ""),
        ForEach(this.notizen.value ?? [], n => Text(n.text)),
        Input(bind: this.entwurf).onSubmit(() => this.anlegen())
    ])

    async fn anlegen(): Void {
        let text = this.entwurf.value
        this.entwurf.value = ""
        await this.notizen.mutate(
            liste => liste + [Notiz(0, text)],   // sofort anzeigen
            () => Notizen.anlegen(text)          // danach auf dem Server, bei einem Fehler zurück
        )
    }
}
```

**`Resource(load)`** ruft `load` sofort auf und zeigt das Ergebnis reaktiv an:

| | |
| --- | --- |
| `value` | der zuletzt geladene Wert, `null` bis zur ersten Antwort. Er bleibt stehen, während neu geladen wird und wenn eine Anfrage scheitert. |
| `loading` | `true`, solange eine Anfrage läuft |
| `error` | der Fehler der letzten Anfrage, `null` nach einer erfolgreichen |
| `refresh()` | lädt neu; das `Future` ist fertig, wenn die Antwort da ist |
| `mutate(optimistisch, aktion)` | zeigt sofort `optimistisch(value)` an, führt dann `aktion` aus und lädt danach neu |

- **Abhängigkeiten:** Liest `load` einen `State` (oben den Suchtext), lädt die Resource neu, sobald er sich ändert.
  Kommt die Antwort einer älteren Anfrage zu spät, fällt sie weg. Der alte Wert bleibt bis zur neuen Antwort stehen.
- **Teilen:** Gibt `load` genau einen Service-Aufruf zurück, sind Methode und Argumente der Schlüssel. Komponenten mit
  gleichem Schlüssel teilen sich Wert und Anfrage, so wie Streams sich eine Verbindung teilen. Eine Funktion mit
  mehreren Schritten (`async () => await A.f() + 1`) hat ihren eigenen Wert.
- **`mutate`:** `optimistisch` bekommt den aktuellen Wert und gibt einen neuen zurück (eine neue Liste, nicht die
  alte verändert). Ist noch kein Wert da, entfällt dieser Schritt. Scheitert `aktion`, kommt der alte Wert zurück,
  `error` zeigt den Fehler und das Ergebnis ist `null`; `mutate` wirft also nicht. Sonst ist das Ergebnis das von
  `aktion`.
- **`initial:`** Hat die Seite einen [`@Load`](#seiten-mit-daten-vom-server-load), nimmt die Resource ihren ersten Wert
  aus den mitgeschickten Daten, ohne zweite Anfrage: `Resource(() => Notizen.liste(""), initial: this.start)`.
  Neu laden (`refresh`, `@Invalidates`) fragt danach wie gewohnt den Server.
- **`refreshOnFocus: true`** lädt neu, wenn man in den Tab zurückkehrt.
- **Vorrendern:** Beim Bauen fragt die Resource nicht. `loading` ist `true` und `value` `null` (oder `initial`), so
  passt die Seite beim Hydrieren zum ersten Stand im Browser.

**`@Invalidates(…)`** an einer Service-Methode nennt Methoden (`Notizen.liste`) oder ganze Services (`Notizen`).
Nach jedem erfolgreichen Aufruf passiert zweierlei:

1. Der Server leert den `@Cache` der genannten Methoden, wie `Cache.clear("Notizen.liste")`. Das manuelle
   `Cache.clear` entfällt.
2. Die Antwort trägt die Kopfzeile `X-Texo-Invalidate: Notizen.liste`. Der Browser lädt jede Resource neu, deren
   `load` eine der genannten Methoden aufgerufen hat, egal welche Komponente die Änderung ausgelöst hat. Gleiche
   Resources laden dabei nur einmal, und eine Anfrage, die vor der Änderung losging, zählt nicht mehr.

Scheitert die Methode, bleibt alles, wie es war. `@Invalidates` gehört an Methoden, die über die API aufgerufen werden
und einmal antworten (keine Streams). Beide Server (Node, Bun, Deno und `texo`) verhalten sich gleich. Formulare ohne
JavaScript leeren den Speicher ebenfalls.

Die Grenze zu Echtzeit: `@Invalidates` erreicht nur den Tab, der die Änderung ausgelöst hat. Andere Tabs und andere
Benutzer sehen neue Daten erst beim nächsten Laden (`refreshOnFocus` hilft beim Zurückkehren). Sollen alle sofort
sehen, was sich ändert, ist ein [`Stream`](#echtzeit-stream-und-channel) das Richtige.

---

## Betrieb: Verwaltungskonsole (`AdminConsole`)

Im Betrieb will man nachsehen und eingreifen: eine Zeile korrigieren, einen fehlgeschlagenen Job neu starten, einen
Zeitplan sofort laufen lassen, alle Sitzungen eines Benutzers beenden. Dafür bringt `texo.admin` eine fertige
Konsole mit. Sie gehört in eine eigene Seite, die ein **Server-Wächter** schützt:

```texo
package verwaltung

import texo.server.*
import texo.ui.*
import texo.admin.*

@Auth
data class Konto(id: Int, name: String, admin: Boolean)

@Table
data class Kunde(@Id id: Int = 0, @Required name: String, punkte: Int = 0)

@Table
data class Rechnung(@Id id: Int = 0, betrag: Float = 0.0)

@Server
fn nurAdmins(req: Request): Access {
    if (req.user == null) return Access.redirect("/login")
    return req.user?.admin == true ? Access.allow() : Access.deny(403, "Nur für Administratoren")
}

@Page(title: "Verwaltung", path: "/verwaltung")
@Guard(nurAdmins)
component Verwaltung {
    fn build(): View => AdminConsole(
        tables: [Kunde.table],
        readOnly: [Rechnung.table],
        jobs: true,
        schedules: true,
        mails: true,
        sessions: true,
        cache: true,
    )
}
```

| Bereich | Einstellung | was die Konsole zeigt und kann |
|---|---|---|
| Tabellen | `tables:`, `readOnly:` | blättern (50 Zeilen je Seite), suchen (Textfelder ohne Groß-/Kleinschreibung, Zahlenfelder bei einer Zahl), Zeilen anlegen, ändern und löschen |
| Jobs | `jobs: true` | wartende, laufende und fehlgeschlagene `@Job`s mit Fehlermeldung; erneut versuchen oder verwerfen |
| Zeitpläne | `schedules: true` | alle `@Cron`/`@Every`-Methoden mit letztem und nächstem Lauf, Dauer und letztem Fehler; einmal sofort ausführen |
| Mails | `mails: true` | Postausgang (ohne SMTP), wartende und fehlgeschlagene Mails; erneut versuchen oder verwerfen |
| Sitzungen | `sessions: true` | alle Sitzungen eines Benutzers auf allen Geräten beenden |
| Cache | `cache: true` | den Zwischenspeicher von `@Cache` leeren (wie `Cache.clear`): alles, einen Service oder eine Methode |
| Protokoll | immer | die letzten 50 Änderungen |

**Geschützt durch die Wächter der Seite.** Die Konsole holt ihre Daten über einen internen Service unter
`/__texo/admin/<paket.Seite>/…`. Der Compiler legt ihn mit genau den Server-Wächtern der Seite an: Wer die Seite
nicht sehen darf, kommt auch nicht an die Daten, auch nicht mit selbst gebauten Anfragen. Fehlt der Server-Wächter,
übersetzt Texo die Seite nicht:

```
AdminConsole braucht einen Server-Wächter: die Seite 'Verwaltung' ist nicht geschützt
AdminConsole braucht einen Server-Wächter: die Seite 'Verwaltung' hat nur Browser-Wächter, und die schützen die Verwaltung nicht
```

Die Einstellungen stehen beim Übersetzen fest: `tables:` und `readOnly:` sind feste Listen aus `@Table`-Klassen
(`Kunde.table`), die Bereiche `true` oder `false`. Der Server prüft jeden Zugriff dagegen. Eine Tabelle, die nicht in
der Liste steht, gibt es für die Konsole nicht (404), und ein abgeschalteter Bereich antwortet mit 403. Je Seite
gibt es eine Konsole, und sie steht direkt in der Seite, nicht in einer Unterkomponente. Ihr Aussehen bringt sie
selbst mit; Abstände und Breite gibst du dem umgebenden Element. Mit `"backend": "static"` gibt es keinen Server und
damit keine Konsole.

**Tabellen bearbeiten.** Gespeichert wird mit denselben Regeln wie `Kunde.save(…)` im Code: Standardwerte,
`@Required`, `@Email` und die anderen Regeln, eindeutige Werte, `@CreatedAt`/`@UpdatedAt`. Löschen markiert Zeilen
mit `@SoftDelete` nur. Tabellen in `readOnly:` lassen sich nur ansehen. Mit der Umgebungsvariable
`TEXO_ADMIN_READONLY=1` beim Start sind alle Tabellen schreibgeschützt, etwa für eine Konsole, die auf eine
Kopie der Produktionsdaten schaut.

**Zugriffsregeln und Änderungsprotokoll.** Die Konsole liest und schreibt als der angemeldete Benutzer, genau wie
eine Service-Methode in seiner Anfrage (siehe [Zugriffsregeln](datenbank.md#zugriffsregeln-und-änderungsprotokoll)).
`@Policy` und `@Tenant` gelten also auch hier: Zeilen, die er nicht lesen darf, fehlen in der Liste und in der
Zeilenzahl, und verbietet eine Schreibregel das Speichern oder Löschen, antwortet die Konsole mit 403
(„Keine Berechtigung für diese Änderung an Kunde“). Soll die Verwaltung alles sehen, gehört das in die Regel, etwa
`… || u?.admin == true`. Tabellen mit `@Audited` bekommen für jede Änderung aus der Konsole ihren gewohnten Eintrag
in `_texo_audit` mit der Id des Benutzers; `Kunde.history(id)` zeigt sie wie Änderungen aus dem Code.

**Protokoll.** Jede ändernde Aktion wird mit Benutzer, Aktion und Ziel festgehalten (Zeilen von `@Audited`-Tabellen
zusätzlich mit allen Feldern in `_texo_audit`), als Zeile im Log
(`Verwaltung: 1 (Ada) zeile.speichern kunde/7`) und in der Tabelle `_texo_admin_log` der Datenbank (Felder `id`,
`at`, `user`, `action`, `target`, `page`). Ohne Datenbank und mit der Speicher-Datenbank liegen die letzten 200
Einträge im Arbeitsspeicher. Der Benutzer ist der Schlüssel des `@Auth`-Benutzers (Feld `id`, sonst das erste Feld),
dazu sein `name`, wenn es eines gibt. Aktionen: `zeile.speichern`, `zeile.loeschen`, `job.wiederholen`,
`job.verwerfen`, `zeitplan.ausfuehren`, `sitzungen.sperren`, `cache.leeren`.

**Sitzungen beenden.** Die Konsole fragt nach dem Schlüssel des Benutzers, also der `id` aus der `@Auth`-Klasse.
Danach gilt keines seiner Cookies mehr, auf keinem Gerät; eine neue Anmeldung gilt wieder. Die Sperre liegt wie die
von `signOut()` in der Tabelle `_texo_revoked_sessions` und gilt mit Datenbank für alle Instanzen. So lässt sich
auch eine geänderte Rolle sofort durchsetzen (siehe [Anmeldung](#anmeldung-auth)).

**Jobs und Zeitpläne.** „Erneut versuchen“ stellt einen fehlgeschlagenen Job als neue Zeile wieder an den Anfang,
mit allen Wiederholungen; die letzte Fehlermeldung bleibt stehen, bis er gelingt. Ein Job, der gerade läuft, lässt
sich weder neu starten noch verwerfen. Ob ein Job gerade läuft, und die Läufe der Zeitpläne kennt jede Instanz nur
für sich: Bei mehreren Instanzen zeigt die Konsole die der Instanz, die die Anfrage beantwortet. „Jetzt ausführen“
startet einen Zeitplan in dieser Instanz, auch wenn eine andere ihn gleichzeitig planmäßig ausführt.

Die Oberfläche (`texo/admin.js`) wird erst geladen, wenn die Seite im Browser angezeigt wird; beim Vorrendern
erscheint „Verwaltung wird geladen …“. Sie ist auf allen Backends dieselbe.

Noch nicht in der Konsole zu sehen: Kennzahlen (Anfragen, Antwortzeiten), die Antwort von `info` hat dafür schon
das Feld `metrics`; bis dahin liefert sie `/__texo/metrics` (siehe
[Betrieb und Beobachtbarkeit](#betrieb-und-beobachtbarkeit)). Die Aufrufe der Konsole selbst sind Abschnitte im
Trace und zählen in den Kennzahlen wie andere Service-Aufrufe. Eine erneute Bestätigung mit Passkey vor gefährlichen Aktionen ist als nächster Schritt geplant; bis dahin
schützt allein der Wächter der Seite.

---

## Fremde Dienste (`@HttpApi` und `@Webhook`)

### Dienste aufrufen (`@HttpApi`)

Ein Interface mit `@HttpApi` beschreibt die Schnittstelle eines fremden Dienstes. Texo baut daraus einen Client: Pfad,
Query, Kopfzeilen und Rumpf werden aus den Parametern zusammengesetzt, die Antwort wird gegen den Rückgabetyp geprüft
und als data class geliefert. Rumpf und Antwort laufen über denselben Codec wie Service-Aufrufe.

```texo
package profil

import texo.server.*

data class Nutzer(login: String, id: Int, name: String?, followers: Int)
data class NeuesIssue(title: String, labels: List<String> = [])
data class Issue(number: Int, html_url: String)

@HttpApi("https://api.github.com", headers: ["Accept": "application/vnd.github+json"])
interface Github {
    @Get("/users/{name}")
    fn nutzer(name: String): Future<Nutzer>

    @Get("/search/users")
    fn suche(q: String, seite: Int = 1, @Header("X-Request-Id") spur: String? = null): Future<List<Nutzer>>

    @Post("/repos/{owner}/{repo}/issues")
    fn issue(owner: String, repo: String, @Body neu: NeuesIssue): Future<Issue>

    @Idempotent
    @Put("/user/starred/{owner}/{repo}")
    fn stern(owner: String, repo: String): Future<Void>
}

@Server
fn github(): Github => Github.create(bearer: Env.require("GITHUB_TOKEN"), timeout: 10.s, retries: 2)

@Api("/api/profil")
service Profil {
    async fn leser(name: String): Int {
        try {
            return (await github().nutzer(name)).followers
        } catch (e: HttpApiError) {
            if (e.status == 404) return 0
            throw e
        }
    }
}
```

**Methoden.** Jede Methode trägt genau eine von `@Get`, `@Post`, `@Put`, `@Patch` oder `@Delete` mit einem Pfad, der
mit `/` beginnt, und gibt `Future<T>` zurück. Die Parameter verteilen sich so:

- Ein Platzhalter `{name}` im Pfad nimmt den gleichnamigen Parameter auf (Text, Zahl, Wahrheitswert oder Enum, nicht
  `null`); der Wert wird für die Adresse kodiert. Jeder Platzhalter braucht einen Parameter.
- `@Body` sendet den Parameter als JSON. Es gibt höchstens einen, und nicht bei `@Get`.
- `@Header("X-Name")` setzt eine Kopfzeile aus einem `String` oder `String?`; bei `null` fehlt sie.
- Alle übrigen Parameter gehen in die Query (`?q=…&seite=1`). Sie sind Texte, Zahlen, Wahrheitswerte oder Enums,
  auch mit `?`; `null` lässt den Parameter weg.
- Standardwerte sind feste Werte wie `1`, `"de"` oder `null`.

Der Rückgabetyp ist eine data class, eine Liste, eine Map, ein einfacher Wert oder `Void` (die Antwort wird nicht
gelesen). `Future<String>` liefert den Rumpf als Text, ohne ihn als JSON zu lesen. Die Feldnamen der data class sind
die Schlüssel im JSON (deshalb `html_url`). Felder, die der Dienst zusätzlich schickt, werden übergangen; fehlt ein
Feld ohne Standardwert oder hat es den falschen Typ, ist das ein Fehler. Eine `Map` ist ein JSON-Objekt.

**`create`.** `Github.create(…)` liefert einen Client; alle Angaben sind optional:

| Parameter | Standard | Bedeutung |
|---|---|---|
| `bearer: String?` | `null` | setzt `Authorization: Bearer …` |
| `timeout: Duration` | `15.s` | Zeit für einen Versuch bis zur vollständigen Antwort |
| `retries: Int` | `0` | weitere Versuche (0 bis 10), nur für `@Get` und `@Idempotent` |
| `headers: Map<String, String>` | `[:]` | zusätzliche Kopfzeilen für jede Anfrage |
| `baseUrl: String?` | `null` | ersetzt die Adresse aus `@HttpApi`, z. B. für eine Testumgebung |

Jede Anfrage schickt `Accept: application/json` und `User-Agent: texo`, mit Rumpf auch `Content-Type:
application/json`. Kopfzeilen aus `@HttpApi(headers:)` überschreiben diese, darüber stehen die aus `create(headers:)`,
dann `bearer` und zuletzt die `@Header`-Parameter. Weiterleitungen werden nicht verfolgt, eine Antwort mit 3xx ist
ein Fehler. `@HttpApi`-Interfaces gibt es nur auf dem Server; im Browser-Code meldet der Compiler einen Fehler.

**Fehler.** Jeder Fehlschlag wirft `HttpApiError` mit `status`, `body` (Rumpf der Antwort, höchstens 10 000 Zeichen)
und einer Meldung, die Methode und Pfad nennt:

| Fall | `status` | `message` (Beispiel) |
|---|---|---|
| Antwort außerhalb 2xx | Status der Antwort | `GET /users/fehlt antwortete mit Status 404` |
| Antwort passt nicht zum Typ | Status der Antwort | `Feld 'followers' fehlt in der Antwort von GET /users/ada` |
| Antwort ist kein JSON | Status der Antwort | `GET /users/ada: Antwort ist kein JSON` |
| Zeit abgelaufen | `0` | `GET /users/ada: keine Antwort nach 10 s` |
| Dienst nicht erreichbar | `0` | `GET /users/ada: Dienst nicht erreichbar (…)` |

**Wiederholen.** Mit `retries: n` versucht Texo eine Anfrage bis zu n-mal erneut, wenn der Dienst nicht erreichbar
war, die Zeit ablief oder er mit 429 oder 5xx antwortete. Zwischen den Versuchen wartet es 200 ms, 400 ms, 800 ms und
so weiter, höchstens 5 s. Das gilt nur für `@Get` und für Methoden mit `@Idempotent`, denn ein wiederholtes `@Post`
könnte etwa eine Zahlung zweimal auslösen. Andere Methoden versuchen es genau einmal.

### Webhooks empfangen (`@Webhook`)

Eine Service-Methode mit `@Webhook` nimmt Ereignisse eines fremden Dienstes an. Texo prüft die Signatur über den
unveränderten Rumpf, bei Stripe und Standard Webhooks auch den Zeitstempel, und ruft die Methode für jedes Ereignis
nur einmal auf.

```texo
package hooks

import texo.server.*

data class Push(ref: String, after: String)
data class Zahlung(id: String, type: String)

@Job
fn bauen(ref: String, commit: String): Void { Console.log("baue ${ref} @ ${commit}") }

@Job
fn freischalten(zahlung: String): Void { Console.log("Zahlung ${zahlung}") }

@Api("/hooks")
service Hooks {
    @Webhook(WebhookScheme.github(Env.require("GITHUB_WEBHOOK_SECRET")))
    fn push(e: Push): Void {
        bauen.enqueue(e.ref, e.after)
    }

    @Webhook(WebhookScheme.stripe(Env.require("STRIPE_WEBHOOK_SECRET")))
    fn stripe(e: Zahlung): Void {
        if (e.type == "checkout.session.completed") freischalten.enqueue(e.id)
    }

    @Webhook(WebhookScheme.hmac("X-Signature", Env.require("SHOP_SECRET")))
    fn shop(roh: String): Void {
        Console.log("Shop: ${roh}")
    }
}
```

Die Adresse ist wie bei anderen Methoden `<@Api-Pfad>/<Methode>`, hier `/hooks/push`, und nimmt nur `POST` an. Eine
Webhook-Methode ist öffentlich und ohne CSRF-Prüfung erreichbar (wie `@Public`); Wächter und `@RateLimit` gelten
weiterhin. Sie hat höchstens einen Parameter: eine data class (oder ein anderer übertragbarer Typ) wird aus dem JSON
gelesen, wobei zusätzliche Felder übergangen werden; ein `String` bekommt den Rumpf als Text. Sie gibt `Void` zurück.
Längere Arbeit gehört in einen [Hintergrundjob](#hintergrundjobs-job), denn viele Dienste warten nur wenige Sekunden
auf die Antwort.

| Verfahren | Signatur | Zeitstempel | Kennung des Ereignisses |
|---|---|---|---|
| `WebhookScheme.github(secret)` | `X-Hub-Signature-256: sha256=<hex>` | keiner | `X-GitHub-Delivery` |
| `WebhookScheme.stripe(secret)` | `Stripe-Signature: t=…,v1=<hex>` über `t.rumpf` | `t`, höchstens 5 min Abweichung | Feld `id` im Rumpf |
| `WebhookScheme.standard(secret)` | `webhook-signature: v1,<base64>` über `id.zeit.rumpf` | `webhook-timestamp`, höchstens 5 min | `webhook-id` |
| `WebhookScheme.hmac(header, secret)` | `<header>: <hex>`, auch mit `sha256=` davor | keiner | keine |

Alle Verfahren nutzen HMAC-SHA256 und vergleichen in konstanter Zeit. Das Geheimnis steht nie im Quelltext, sondern
kommt mit `Env.require("NAME")` oder `Env.get("NAME")` aus der Umgebung; Texo liest es bei jeder Anfrage. Für
Standard Webhooks ist ein Geheimnis der Form `whsec_<base64>` üblich, ohne das Präfix gilt der Text selbst als
Schlüssel. Bei Stripe genügt eine der `v1`-Signaturen.

**Antworten.** Ist alles in Ordnung, antwortet Texo mit `200` und `{"ok":true}`. Eine falsche oder fehlende Signatur
ergibt `401` (`Webhook-Signatur ungültig`), ein zu alter Zeitstempel ebenfalls `401`, ein Rumpf, der nicht zum Typ
passt, `400`. Fehlt das Geheimnis in der Umgebung, antwortet Texo mit `500` und schreibt den Namen der Variablen ins
Log. Wirft die Methode, gibt es `500` (oder den Status eines `HttpError`), und der Absender versucht es später erneut.

**Jedes Ereignis einmal.** Dienste schicken ein Ereignis oft mehrfach. Texo merkt sich die Kennung 24 Stunden lang;
eine Wiederholung bekommt `200` mit `{"ok":true,"duplicate":true}`, ohne dass die Methode noch einmal läuft. Schlägt
die Methode fehl, vergisst Texo die Kennung wieder, damit der nächste Versuch durchkommt. Mit Datenbank liegen die
Kennungen in der Tabelle `_texo_webhooks` und gelten für alle Serverprozesse, sonst im Speicher. `WebhookScheme.hmac`
hat keine Kennung; dort prüft die Methode Wiederholungen bei Bedarf selbst.

---

## Sicherheitsmodell

Der erzeugte Server schützt jede Anwendung ohne zusätzlichen Code. Die folgenden Szenarien sind als Tests in
`tests/server.test.ts` und `tests/e2e/fullstack.mjs` abgesichert.

### 1. Jemand ruft die API direkt auf, ist aber nicht die Website

z. B. ein Skript, `curl`, eine fremde App:

```
$ curl -X POST https://app.example/api/notes/list -H 'Content-Type: application/json' -d '{"args":[]}'
{"ok":false,"error":"CSRF-Schutz: Anfrage stammt nicht von dieser Anwendung"}     ← 403
```

- Jede Seite setzt ein zufälliges Token-Cookie (`tx_csrf`, `SameSite=Strict`). Der Texo-Client sendet es bei jedem Aufruf
  zusätzlich im Header `X-Texo-CSRF`; der Server vergleicht beide (Double-Submit, zeitkonstanter Vergleich).
- Nur `POST` mit `application/json` wird angenommen; Größe begrenzt (1 MB), Methodennamen geprüft.
- Selbst mit gültigem Token kommt ohne Anmeldung niemand an geschützte Methoden vorbei: **Server-Wächter** laufen vor
  jeder Methode (`401`/`403`).
- Gegen massenhaftes Ausprobieren (z. B. Passwörter): `@RateLimit(perMinute: 10)` → `429 Too Many Requests`.

Ein Skript kann ein Token theoretisch selbst besorgen, indem es die Seite lädt – deshalb sind schützenswerte Methoden
**immer zusätzlich** durch Wächter (Anmeldung/Rolle) gesichert. Methoden, die bewusst für fremde Clients gedacht sind
(Monitoring, fremde Clients), markierst du mit `@Public`; Webhooks mit [`@Webhook`](#webhooks-empfangen-webhook), das
zusätzlich die Signatur prüft.

### 2. Eine gefälschte Seite / ein fremdes Backend schickt eine POST-Anfrage an deine Routen

Klassisches Cross-Site Request Forgery: Eine fremde Website versucht, im Namen eines angemeldeten Benutzers Aktionen
auszulösen.

- Der Browser sendet bei fremden Seiten `Origin: https://evil.example` und `Sec-Fetch-Site: cross-site` – der Server lehnt
  ab: `Fremde Herkunft (https://evil.example) ist nicht erlaubt` (`403`).
- Das CSRF-Token kann die fremde Seite nicht lesen (Same-Origin-Policy) – ohne Token kein Zugriff.
- Session-Cookies sind `HttpOnly` (für Skripte unsichtbar), `SameSite=Lax` und über HTTPS `Secure`.
- Seiten dürfen nicht in fremde Frames eingebettet werden (`X-Frame-Options: DENY`, `frame-ancestors 'none'` gegen
  Clickjacking).
- Umgekehrt prüft auch der **Browser** jede Antwort gegen den erwarteten Typ: Ein manipuliertes oder gefälschtes Backend
  kann keine Werte falschen Typs einschleusen (`Antwort: erwartet Int, erhalten string`). Mit HTTPS (TLS) ist zudem
  sichergestellt, dass der Browser wirklich mit deinem Server spricht.

Weitere vertrauenswürdige Herkünfte (z. B. ein Admin-Frontend auf einer anderen Domain) trägst du in
`server.allowedOrigins` ein.

### 3. Jemand will mit dem Browser Inhalte/Routen abrufen, die er nicht darf

- **Seiten** mit Server-Wächtern werden ohne Berechtigung gar nicht ausgeliefert: `303` zur Anmeldung oder eine
  `403`-Fehlerseite. Das vorgerenderte HTML verlässt den Server nicht; geschützte Seiten werden mit
  `Cache-Control: no-store, private` gesendet.
- **Daten** kommen ausschließlich über Services – und die prüfen ihre Wächter bei *jedem* Aufruf, unabhängig davon, was
  der Browser anzeigt.
- **Pfade** wie `/../server/main.js` oder kodierte Varianten (`%2e%2e`) werden abgewiesen; ausgeliefert wird nur der Ordner
  `public/`. Server-Code liegt getrennt in `server/`.
- **Manipulierte Sessions** (Cookie verändert, Rolle „admin“ selbst eingetragen) sind wertlos: Sessions sind mit
  HMAC-SHA256 signiert; eine ungültige Signatur ergibt eine leere Session.

### Was zusätzlich automatisch passiert

| Maßnahme | Detail |
|---|---|
| Eingabevalidierung | jedes Argument wird gegen seinen Texo-Typ geprüft; unbekannte Felder, falsche Typen, zu lange Texte oder zu viele Elemente → `400` |
| Content-Security-Policy | `script-src 'self'` plus SHA-256-Hashes der eingebetteten Skripte – eingeschleuste Skripte laufen nicht |
| Header | `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Cross-Origin-Opener-Policy`, `Permissions-Policy`, über HTTPS `Strict-Transport-Security` |
| Fehlerdetails | Interne Fehler erscheinen in Produktion nur als „Interner Serverfehler“ (Details im Server-Log) |
| Code-Schutz | `texo build` liefert nur minifizierten, verschleierten Browser-Code aus; `server/` wird nie ausgeliefert ([Details](compiler.md#code-schutz-minifizierung-und-verschleierung)) |

---

## Sessions, Passwörter, Umgebungsvariablen

Für die **Anmeldung** nimm `@Auth` mit `request.signIn` und `request.user` ([oben](#anmeldung-auth)). Der Weg über
`session.set("user", …)` im folgenden Beispiel ist der frühere: Er funktioniert weiter, liefert aber nur Texte und
gibt der Session beim Login keine neue Kennung. Die Session selbst bleibt für eigene kleine Werte da.

```texo
@Api("/api/auth")
service AuthApi {
    private let users: Map<String, String> = ["ada": "pbkdf2$210000$…"]

    @RateLimit(perMinute: 10)
    async fn login(name: String, password: String): Boolean {
        let hash = this.users.get(name)
        if (hash == null || !(await Password.verify(password, hash))) return false
        this.request.session.set("user", name)
        return true
    }

    fn logout(): Void { this.request.session.clear() }
}
```

| API | |
|---|---|
| `this.request.session.get/set/has/remove/clear` | signierte Cookie-Session (7 Tage), nur Strings |
| `Password.hash(pw)` / `Password.verify(pw, hash)` | PBKDF2-SHA256 mit 210 000 Iterationen und zufälligem Salt (WebCrypto) |
| `Env.get("DB_URL")`, `Env.require(…)`, `Env.isProduction` | Umgebungsvariablen – nur auf dem Server |
| `Env.secret("API_KEY")` | Pflicht-Variable als `Secret` (siehe [Konfiguration](#konfiguration-config-und-geheimnisse-secret)) |
| `Log.info/warn/error` | Server-Log (mit `TEXO_LOG_FORMAT=json` als JSON-Zeilen mit Trace-Id) |
| `Trace.span(…)`, `Trace.id`, `Metrics.counter/gauge/histogram(…)` | eigene Abschnitte und Kennzahlen, siehe [Beobachtbarkeit](#betrieb-und-beobachtbarkeit) |
| `this.request.header(…)`, `.cookie(…)`, `.query(…)`, `.ip`, `.origin`, `.path` | Anfrage-Details |

Der Schlüssel zum Signieren der Sessions kommt aus `TEXO_SECRET`. In Produktion (`NODE_ENV=production` oder
`TEXO_ENV=production`) startet der Server ohne ihn nicht, ebenso mit einem Schlüssel unter 32 Zeichen; erzeuge ihn
zufällig, etwa mit `openssl rand -hex 32`. Im Entwicklungsmodus wird automatisch ein stabiler Schlüssel
pro Projekt verwendet.

**Logout.** `this.request.session.clear()` beendet die Session auch für Kopien des Cookies: Jede Session hat eine
zufällige Kennung, und `clear()` setzt sie auf eine Sperrliste, bis das Cookie ohnehin abliefe (7 Tage). Ein neuer
Login bekommt eine neue Kennung. Hat die Anwendung eine Datenbank (`"database"` in `texo.json`), liegt die Liste in
der Tabelle `_texo_revoked_sessions`. Dann übersteht sie einen Neustart, und mehrere Instanzen sehen eine Sperre
nach spätestens 30 Sekunden – mit dem Instanz-Bus ([`cluster`](#mehrere-instanzen-cluster)) sofort. Ohne Datenbank
gilt sie bis zum Neustart des Servers.

---

## Konfiguration (`@Config`) und Geheimnisse (`Secret`)

`Env.get` liefert nur `String?`: Ein Tippfehler im Namen, eine fehlende Variable oder `PORT=abc` fallen erst auf, wenn
der Code läuft. Eine `data class` mit `@Config` beschreibt stattdessen alle Variablen der App mit Typ und Standardwert.
Der Server liest und prüft sie beim Start, `Config.get<T>()` liefert die fertigen Werte.

```texo
package shop

import texo.server.*
import texo.graphics.*

enum Tarif { Basis, Pro }

@Config
data class Einstellungen(
    /// Schlüssel für die Zahlungs-API
    stripeKey: Secret,
    shopUrl: Url,
    maxWarenkorb: Int = 50,
    @Env("FEATURE_GUTSCHEINE") gutscheine: Boolean = false,
    zahlungTimeout: Duration = 30.s,
    tarif: Tarif = Tarif.Basis,
    rabatt: Float? = null
)

service Kasse {
    fn grenze(): Int => Config.get<Einstellungen>().maxWarenkorb

    fn bezahlen(betrag: Float): Boolean {
        let cfg = Config.get<Einstellungen>()
        Log.info("Bezahlung über ${cfg.shopUrl} mit ${cfg.stripeKey}")   // im Log steht "… mit ***"
        let schluessel = cfg.stripeKey.reveal()                          // der echte Wert, nur im Server-Code
        return schluessel.isNotEmpty() && betrag > 0.0
    }
}
```

**Namen.** Jedes Feld liest die Variable, deren Name aus dem Feldnamen folgt: `maxWarenkorb` wird zu
`MAX_WARENKORB`, `stripeKey` zu `STRIPE_KEY`, `apiURL` zu `API_URL`. Mit `@Env("NAME")` am Feld gilt ein eigener Name.
Werte aus `.env` zählen wie beim Rest des Servers mit (die Umgebung geht vor).

**Typen und Umwandlung.** Leerzeichen am Rand werden bei Zahlen, Wahrheitswerten, Enums, Adressen und Dauern
übergangen. Eine leere Variable (`NAME=`) gilt als nicht gesetzt.

| Typ | erlaubte Werte |
|---|---|
| `String` | jeder Text, unverändert |
| `Int` | ganze Zahl, z. B. `50` oder `-3` |
| `Float` | Zahl mit Punkt oder Komma, z. B. `0.19` oder `0,19` |
| `Boolean` | `true`, `false`, `1`, `0`, `yes`, `no`, `on`, `off`, `ja`, `nein` (Groß- und Kleinschreibung egal) |
| Enum | der Name eines Falls, z. B. `Pro` (auch `pro`) |
| `Url` | absolute Adresse mit Schema, z. B. `https://shop.example` oder `postgres://db:5432/shop` |
| `Duration` | Zahl mit Einheit `ms`, `s`, `min`, `h` oder `d`, z. B. `15.min`, `30s`, `1.5.h` |
| `Secret` | jeder Text; zeigt sich überall nur als `***` (siehe unten) |

Fehlt eine Variable, gilt der Standardwert des Felds. Ohne Standardwert ist ein Feld mit `T?` dann `null`, alle
anderen Felder sind Pflicht. Andere Typen (Listen, `data class`es) lehnt der Compiler ab.

**Prüfung beim Start.** Der Server liest alle `@Config`-Klassen beim Start und meldet alle Probleme auf einmal:

```
Konfiguration fehlerhaft:
  - STRIPE_KEY fehlt (Einstellungen.stripeKey: Secret)
  - MAX_WARENKORB ist keine ganze Zahl: "viele" (Einstellungen.maxWarenkorb: Int)
```

In Produktion (`NODE_ENV=production` oder `TEXO_ENV=production`) startet der Server dann nicht. Sonst, etwa mit
`texo dev`, ist es eine Warnung, und erst `Config.get` für die betroffene Klasse wirft einen Fehler mit denselben
Zeilen. Die Werte werden einmal gelesen; spätere Änderungen an der Umgebung sieht erst ein Neustart.

**Docker Secrets.** Ist `NAME` nicht gesetzt, aber `NAME_FILE`, liest Texo den Wert aus dieser Datei (ohne den letzten
Zeilenumbruch). Das gilt für jedes Feld und für `Env.secret`.

**`Secret`.** Ein `Secret` gibt mit `toString()`, in Texttemplates, im Log und in `Json.stringify` nur `***` aus, auch
als Feld einer `data class`. An den Wert kommt nur `.reveal()`. Ohne `@Config` liest `Env.secret("NAME")` eine
Pflicht-Variable direkt als `Secret`. Der Compiler sorgt dafür, dass ein `Secret` den Server nie verlässt: Es kann
weder Rückgabe noch Parameter einer Service-Methode sein (auch nicht in einer Liste oder `data class`), nicht in einem
Stream, einem Loader (`@Load`), der Session (`@Auth`) oder der Job-Warteschlange stehen und nicht in einer `@Table`
gespeichert werden. `Secret`, `Config` und `@Config`-Klassen sind wie alles aus `texo.server` nur im Server-Code
erlaubt; eine eigene `data class` mit einem `Secret`-Feld markierst du mit `@Server`.

**Ohne Start prüfen.** `texo env check` prüft die `.env` des Projekts (oder eine andere Datei:
`texo env check prod.env`) mit denselben Regeln, ohne den Server zu starten; geprüft wird nur die Datei, nicht die
Umgebung des Terminals. `texo env example` schreibt `.env.example` mit allen Variablen, ihrem Typ, Standardwert und den
`///`-Kommentaren der Felder.

Die eingebauten Variablen (`TEXO_SECRET`, `TEXO_SMTP_URL`, `DATABASE_URL` …) gehören nicht zu dieser Prüfung. Eine
`@Config`-Klasse aus einer Bibliothek liest ihre Variablen mit denselben Namensregeln, ohne Präfix.

---

## Weitere Annotationen

| Annotation | Ort | Bedeutung |
|---|---|---|
| `@Api("/pfad")` | Service | URL-Präfix der Methoden (Standard `/api/<Name>`) |
| `@Auth` | `data class` | Typ des angemeldeten Benutzers (`request.user`), siehe [Anmeldung](#anmeldung-auth) |
| `@Guard(a, b)` | Seite, Service, Service-Methode | Wächter, siehe oben |
| `@Public` | Service oder Methode | ohne CSRF-Prüfung aufrufbar (Monitoring, fremde Clients). Wächter gelten weiterhin! |
| `@RateLimit(perMinute: n)` | Service oder Methode | höchstens `n` Aufrufe pro Minute und Client-IP |
| `@Server` | Funktion, Klasse, Objekt, Konstante | nur auf dem Server; wird nicht in den Browser ausgeliefert |
| `@Cron("0 3 * * *")` | private Service-Methode | läuft nach Zeitplan in der Ortszeit des Servers, siehe [Zeitpläne](#zeitpläne-cron-und-every) |
| `@Every(15.min)` | private Service-Methode | läuft in festem Abstand, siehe [Zeitpläne](#zeitpläne-cron-und-every) |
| `@Job(retries: 3, timeout: 5.min)` | Funktion | läuft über die Warteschlange im Hintergrund (`f.enqueue(…)`), siehe [Hintergrundjobs](#hintergrundjobs-job) |
| `@Cache(ttl: 5.min, shared: false)` | Service-Methode | gleiche Aufrufe kommen eine Zeit lang aus dem Speicher, siehe [Zwischenspeicher](#zwischenspeicher-cache); mit Kv auch `key: "artikel:{id}"` und `local: true`, siehe [`@Cache` in Kv](#cache-in-kv) |
| `@Config` | `data class` | Konfiguration aus Umgebungsvariablen, beim Start geprüft, siehe [Konfiguration](#konfiguration-config-und-geheimnisse-secret) |
| `@Env("NAME")` | Feld einer `@Config`-Klasse | eigener Name der Umgebungsvariable statt des abgeleiteten (`maxWarenkorb` → `MAX_WARENKORB`) |
| `@Invalidates(Notizen.liste, Laden)` | Service-Methode | nach einem erfolgreichen Aufruf: `@Cache` dieser Methoden leeren, passende `Resource`s im Browser neu laden, siehe [Server-Daten im Browser](#server-daten-im-browser-resource-und-invalidates) |
| `@Policy(read: f, write: g)` | `@Table`-Klasse | Zugriffsregeln für jede Abfrage, siehe [Datenbanken](datenbank.md#zugriffsregeln-und-änderungsprotokoll) |
| `@Tenant(feld)` | `@Table`-Klasse | nur Zeilen mit `feld == request.user.feld`, siehe [Datenbanken](datenbank.md#zugriffsregeln-und-änderungsprotokoll) |
| `@Audited(keep: 365.d)` | `@Table`-Klasse | Änderungsprotokoll (`Tabelle.history(id)`); `@NotAudited` nimmt ein Feld aus |
| `@Webhook(WebhookScheme.github(Env.require("NAME")))` | Service-Methode | nimmt signierte Ereignisse fremder Dienste an, siehe [Webhooks](#webhooks-empfangen-webhook) |
| `@HttpApi("https://…")` | Interface | Client für einen fremden Dienst, siehe [Dienste aufrufen](#dienste-aufrufen-httpapi) |

---

## Entwickeln, bauen, starten, HTTPS

```sh
texo dev                 # baut, startet das gewählte Backend, Live-Reload; Neustart bei jeder Änderung
texo build               # dist/public (Browser) + dist/server (Backend) + dist/package.json
cd dist && npm start     # Node, Bun oder Deno: startet dist/server/main.js (ohne Texo-CLI, z. B. auf dem Server)
texo start               # Backend texo: startet den nativen Server (ohne Texo-CLI: texo-server dist/server/app.json)
texo build --docker      # zusätzlich dist/Dockerfile: docker build -t meine-app dist (siehe docker.md)
texo container           # Docker oder Podman: Dockerfile + compose.yaml mit Datenbank, Valkey, Mail; auf Wunsch gleich starten
```

Konfiguration zur Laufzeit:

| Variable | |
|---|---|
| `PORT`, `HOST` | Adresse (Standard `3000`, `0.0.0.0`) |
| `TEXO_SECRET` | Schlüssel für Sessions (in Produktion Pflicht, mindestens 32 Zeichen) |
| `TLS_CERT`, `TLS_KEY` | Pfade zu Zertifikat und Schlüssel → der Server spricht **HTTPS** |
| `TRUST_PROXY` | Adressen oder Netze deiner Reverse Proxys, z. B. `10.0.0.0/8, ::1` oder `loopback` |
| `TEXO_PUBLIC_URL` | Adresse der App, z. B. `https://notizen.example.com` (Rückruf bei OAuth, `req.link` in E-Mails) |
| `TEXO_PASSKEY_USER_VERIFICATION` | `required` (Standard), `preferred` oder `discouraged` – ob Passkeys PIN oder Biometrie verlangen ([Passkeys](#passkeys)) |
| `TEXO_SMTP_URL`, `TEXO_MAIL_FROM` | Mailserver und Absender für `Mail.send` ([E-Mails verschicken](#e-mails-verschicken-mail-und-tokens)) |
| `NODE_ENV=production` | Produktionsmodus |
| `TEXO_OTLP_URL`, `TEXO_TRACE_SAMPLE`, `TEXO_METRICS_TOKEN`, `TEXO_LOG_FORMAT` | Tracing, Kennzahlen und JSON-Log, siehe [Betrieb und Beobachtbarkeit](#betrieb-und-beobachtbarkeit) |

**Betrieb:** `GET /__texo/health` antwortet mit `200 {"ok":true}`, wenn der Server läuft und die Datenbank
erreichbar ist, sonst mit `503` (den Grund schreibt der Server ins Log). Das ist der Health-Check für Docker,
Kubernetes oder einen Load Balancer (die Images von `texo build --docker` prüfen ihn von selbst, siehe
[Docker](docker.md)). Bei `SIGTERM` oder Strg+C nimmt der Server (alle Backends) keine neuen Verbindungen mehr
an, beantwortet laufende Anfragen noch (höchstens 10 s) und beendet sich dann.

**HTTPS lokal testen** (selbstsigniertes Zertifikat):

```sh
openssl req -x509 -newkey rsa:2048 -nodes -keyout key.pem -out cert.pem -days 30 -subj "/CN=localhost"
TLS_CERT=cert.pem TLS_KEY=key.pem TEXO_SECRET=$(openssl rand -hex 32) texo start
```

In Produktion verwendest du ein echtes Zertifikat (z. B. Let's Encrypt) oder betreibst den Server hinter einem
Reverse Proxy, der TLS übernimmt. Über HTTPS setzt Texo automatisch `Secure`-Cookies und HSTS.

Hinter einem Proxy trägst du dessen Adresse in `TRUST_PROXY` ein. Nur von diesen Adressen glaubt Texo
`X-Forwarded-Proto` (HTTPS, also `Secure`-Cookies und HSTS), `X-Forwarded-Host` (für die Herkunftsprüfung) und
`X-Forwarded-For` (für `@RateLimit` und `this.request.ip`). Aus `X-Forwarded-For` zählt der Eintrag ganz rechts, der
nicht zu einem eingetragenen Proxy gehört, denn alles links davon kann der Client selbst hineinschreiben. Ohne
`TRUST_PROXY` werden diese Kopfzeilen ignoriert.

---

## Mehrere Instanzen (`cluster`)

Läuft die App in mehreren Prozessen hinter einem Load Balancer (mehrere Container, `pm2 -i`, mehrere Rechner), hält
jeder Prozess seine Kanäle, seine Session-Sperren, seine Live-Abfragen und seinen `@Cache` im eigenen Speicher. Der Instanz-Bus
verbindet sie über die Datenbank, die die App ohnehin hat – ohne Redis oder einen anderen Zusatzdienst:

```json
{ "database": { "type": "postgres", "url": "env:DATABASE_URL" }, "cluster": { "bus": "database" } }
```

```texo
@Api("/api/chat")
service Chat {
    private let kanal: Channel<Nachricht> = Channel(replay: 50, shared: true)

    fn raum(): Stream<Nachricht> => this.kanal.stream()
    fn senden(text: String): Void => this.kanal.send(Nachricht(this.request.session.get("user") ?? "Gast", text))
}
```

Über den Bus laufen:

| Was | Wirkung |
| --- | --- |
| `Channel.send` eines Kanals mit `shared: true` | Die Zuschauer aller Instanzen bekommen den Wert. Ereignis-IDs (`Last-Event-ID`) kommen aus dem Bus und gelten auf jeder Instanz: `replay` holt Verpasstes auch nach, wenn der Browser nach einem Abbruch an einer anderen Instanz landet. |
| Live-Abfragen (`.live()`) | Schreibt eine Instanz eine Tabelle über Texo Data (oder meldet sie mit `Db.changed`), laufen die Live-Abfragen der anderen Instanzen ebenfalls neu. |
| Logout (`session.clear()`) | Die Sperre gilt in allen Instanzen sofort statt nach bis zu 30 Sekunden. |
| `Cache.clear(…)` und `@Invalidates(…)` | Die anderen Instanzen leeren dieselben Einträge ihres [`@Cache`](#zwischenspeicher-cache), niemand bekommt danach noch einen alten Wert. Die Einträge selbst bleiben je Instanz. |

Jede Instanz verteilt empfangene Nachrichten an ihre eigenen Zuschauer und überspringt ihre eigenen. Kanäle ohne
`shared: true` bleiben in ihrer Instanz; `shared` ist auch mit `"cluster"` kein Standard, weil nicht jeder Kanal über
die Datenbank laufen soll (z. B. Fortschrittsmeldungen an einen einzelnen Browser).

**Wie die Datenbank die Nachrichten trägt.** Jede Nachricht ist eine Zeile in der Tabelle `_texo_bus` (Texo legt sie
beim Start an):

| Datenbank | Weg |
| --- | --- |
| PostgreSQL | `LISTEN`/`NOTIFY`: `NOTIFY` trägt nur die Id der Zeile (die Grenze von 8000 Bytes stört so nicht), die Instanzen lesen die Zeile dann. Zur Sicherheit fragen sie zusätzlich alle 5 s nach. |
| MySQL, MariaDB | kurze Abfrage alle 200 ms |
| SQLite | kurze Abfrage alle 200 ms – nur für mehrere Prozesse auf demselben Rechner (eine Datei) |
| MongoDB | kurze Abfrage der Sammlung `_texo_bus` alle 200 ms (Change Streams nutzt Texo nicht, damit es auch ohne Replica Set geht) |

**Reihenfolge.** Werte eines Kanals kommen auf allen Instanzen in derselben Reihenfolge an, und Werte desselben
Absenders in Sendereihenfolge. Auch die sendende Instanz verteilt einen Wert erst, wenn er im Bus steht (gleiche Id
überall); dadurch kommt er dort einige Millisekunden später an als ohne Bus.

**Aufbewahrung.** Zeilen eines Kanals mit `replay` bleiben eine Stunde stehen (länger hilft auch ein großes `replay`
nicht), alle anderen eine Minute. Jede Instanz räumt einmal in der Minute auf.

**Kennung eines geteilten Kanals.** Instanzen erkennen denselben Kanal an seiner Stelle im Quelltext. Ein Kanal als
Feld eines Service ist damit überall derselbe. Entstehen an einer Stelle mehrere Kanäle (z. B. einer je Raum in einer
`Map`), zählt die Reihenfolge, in der sie entstehen – sie muss dann auf allen Instanzen gleich sein.

Ohne `"cluster"` bleibt alles wie oben beschrieben: keine Tabelle `_texo_bus`, keine Abfragen, `shared` wird
ignoriert. `"cluster"` ohne `"database"` ist ein Fehler beim Start. Beide Server (Node, Bun, Deno und `texo`)
verhalten sich gleich und nutzen dieselbe Tabelle.

**Bus über Kv.** Mit `"cluster": {"bus": "kv"}` laufen dieselben Nachrichten statt über die Datenbank über den Speicher
aus `TEXO_KV_URL` (siehe [`Kv`](#gemeinsamer-speicher-mit-anderen-programmen-kv)): ein Stream `<präfix>texo:bus`, den
jede Instanz mit `XREAD BLOCK` liest – ohne Abfragen alle 200 ms und ohne Datenbank. Ereignis-IDs sind die Ids der
Einträge, Werte von Kanälen mit `replay` bleiben eine Stunde im Stream. Ohne `TEXO_KV_URL` (z. B. in `texo dev`) bleibt
alles in der einen Instanz.

---

## Betrieb und Beobachtbarkeit

Was macht der Server gerade, wo ist er langsam, was geht im Browser schief? Texo beantwortet das ohne zusätzliche
Pakete und auf allen Backends (Texo, Node.js, Bun, Deno) gleich: jede Anfrage bekommt eine **Trace-Id**, die
wichtigen Schritte werden von selbst zu **Abschnitten** (Spans), es gibt **Kennzahlen** im Prometheus-Format, ein
**JSON-Log** und auf Wunsch **Fehlerberichte aus dem Browser**. Alles außer den Trace-Ids ist ausgeschaltet, bis du es
mit einer Umgebungsvariable oder in texo.json einschaltest.

| Variable | |
|---|---|
| `TEXO_OTLP_URL` | Collector für die Abschnitte (OTLP/HTTP mit JSON), z. B. `http://localhost:4318` – ohne Pfad hängt Texo `/v1/traces` an. Ohne die Variable wird nichts verschickt |
| `TEXO_OTLP_HEADERS` | zusätzliche Kopfzeilen für den Collector, z. B. `Authorization=Bearer abc,X-Scope-OrgID=team` |
| `TEXO_SERVICE_NAME` | Name des Dienstes in den Traces (auch `OTEL_SERVICE_NAME`; Standard `texo`) |
| `TEXO_TRACE_SAMPLE` | Anteil neuer Traces, die exportiert werden, von `0` bis `1` (Standard `1`, also alle) |
| `TEXO_METRICS_TOKEN` | schaltet `/__texo/metrics` ein; ohne die Variable antwortet der Pfad mit `404` |
| `TEXO_LOG_FORMAT=json` | Log als eine JSON-Zeile pro Meldung, mit Trace-Id |

### Trace-Id und Abschnitte

Kommt eine Anfrage mit einer gültigen W3C-Kopfzeile `traceparent` an (von einem Load Balancer, einem anderen Dienst
oder einem Browser mit OpenTelemetry), übernimmt Texo deren Trace-Id und die Sampling-Entscheidung; sonst würfelt der
Server eine neue Id aus und entscheidet mit `TEXO_TRACE_SAMPLE`. Die Id reist weiter:

- **ausgehende Aufrufe** – `Http`-Anfragen aus dem Server-Code, `@HttpApi`-Clients, OAuth und S3 schicken
  `traceparent` mit, so setzt der aufgerufene Dienst den Trace fort;
- **Jobs** – `f.enqueue(…)` merkt sich den Trace im Auftrag; läuft der Job später (auch nach einem Neustart oder auf
  einem anderen Server), hängt er am selben Trace;
- **Log** – jede Meldung während einer Anfrage, eines Jobs oder Zeitplans trägt die Id (im JSON-Log als `trace_id`);
- **Code** – `Trace.id` liefert sie, z. B. um sie einer Fehlermeldung an den Support mitzugeben.

Von selbst entstehen diese Abschnitte:

| Abschnitt | wann |
|---|---|
| `GET /pfad`, `POST /_rpc/Notizen/liste` … | jede Anfrage (die Wurzel des Traces); `/__texo/…` zählt nicht mit, außer den Aufrufen der AdminConsole |
| `guard <Name>` | jeder `@Guard`, der für die Anfrage geprüft wird |
| `load <Seite>` | ein `@Load` vor dem Ausliefern einer Seite |
| `Notizen.liste` | jede Service-Methode |
| `cache hit Notizen.liste` | ein Ergebnis aus `@Cache` (ein Fehlschlag ist einfach die Methode) |
| `db select Notiz`, `db insert Notiz`, `db sql` … | jede Datenbankabfrage |
| `enqueue <Job>` / `job <Job>` | Einreihen und Ausführen eines `@Job` |
| `schedule <Service.methode>` | ein Lauf von `@Cron` oder `@Every` |
| `mail send` | `Mail.send` |
| `HTTP GET api.example.com` | ein ausgehender Aufruf (`Http`, `@HttpApi` je Versuch, OAuth, S3) |

Ein Abschnitt hält **nur Name, Dauer und Status** (ok oder Fehler) fest, nie Parameter, Abfragewerte, Rückgabewerte
oder Kopfzeilen. In Traces landen also keine Passwörter, E-Mail-Adressen oder Tokens. Eigene Abschnitte setzt du mit
`Trace.span` um einen längeren Schritt; eine Ausnahme markiert ihn als Fehler und wird weitergeworfen:

```texo
package app

import texo.server.*
import texo.db.*

@Table data class Zeile(@Id id: Int = 0, text: String)

service Import {
    async fn csv(text: String): Int {
        val zeilen = text.split("\n")
        await Trace.span("csv-import", async () => {
            for (z in zeilen) { await Zeile.insert(Zeile(text: z)) }
        })
        Metrics.counter("import_zeilen", "Importierte Zeilen").add(zeilen.size.toFloat())
        return zeilen.size
    }
}
```

**Export:** Mit `TEXO_OTLP_URL` schickt der Server die Abschnitte gebündelt (bis 512 je Sendung, spätestens alle
2 Sekunden) als OTLP/HTTP-JSON an einen Collector – Jaeger, Grafana Tempo, Honeycomb, den OpenTelemetry Collector
oder jeden anderen Dienst, der OTLP versteht. Ist der Collector nicht erreichbar, verwirft Texo die Abschnitte
(höchstens 20 000 warten) und schreibt höchstens einmal pro Minute eine Warnung ins Log; die Anfragen merken davon
nichts. Beim Beenden (`texo start`) wird noch einmal bis zu 5 Sekunden lang verschickt.

```sh
docker run -d -p 16686:16686 -p 4318:4318 jaegertracing/all-in-one
TEXO_OTLP_URL=http://localhost:4318 texo start     # Traces unter http://localhost:16686
```

### Kennzahlen (`/__texo/metrics`)

Mit `TEXO_METRICS_TOKEN` liefert `GET /__texo/metrics` alle Kennzahlen im Prometheus-Textformat – nur mit der
Kopfzeile `Authorization: Bearer <Token>` (sonst `401`). Ohne die Variable gibt es den Pfad nicht (`404`), damit
niemand von außen die Last deiner App ablesen kann. Für Prometheus:

```yaml
scrape_configs:
  - job_name: meine-app
    authorization: { credentials: "das-token" }
    static_configs: [{ targets: ["app:3000"] }]
    metrics_path: /__texo/metrics
```

| Kennzahl | Art | |
|---|---|---|
| `texo_requests_total{method,status}` | Zähler | beantwortete Anfragen; `method` ist die Service-Methode (`Notizen.liste`), die Seite (`page:index.html`) oder `static` |
| `texo_request_duration_seconds{method}` | Histogramm | Antwortzeit in Sekunden |
| `texo_errors_total{source}` | Zähler | `server` (Antworten mit 5xx), `browser` (Fehlerberichte), `job` (endgültig gescheiterte Jobs) |
| `texo_open_streams` | Messwert | offene Streams (Server-Sent Events) |
| `texo_jobs_total{state}` | Zähler | Jobs: `enqueued`, `done`, `retry`, `failed` |
| `texo_jobs_running` | Messwert | gerade laufende Jobs |
| `texo_cache_requests_total{result}` | Zähler | Aufrufe von `@Cache`-Methoden: `hit` oder `miss` |
| `texo_cache_hit_ratio` | Messwert | Anteil der Treffer seit dem Start (erst nach dem ersten Aufruf) |

Eigene Kennzahlen legst du mit `Metrics.counter(name)`, `Metrics.gauge(name)` und `Metrics.histogram(name)` an (der
zweite Parameter ist ein Hilfetext). Namen bestehen aus Buchstaben, Ziffern, `_` und `:`; der Präfix `texo_` ist für die
eingebauten reserviert. Zähler wachsen nur (`add` mit einer negativen Zahl ist ein Fehler), Messwerte lassen sich
setzen und ändern, Histogramme verwenden die Grenzen 0.005 bis 10 (passend für Sekunden). Die Werte gelten je
Server-Prozess; mit mehreren Containern fragt Prometheus jeden einzeln ab.

### JSON-Log

Mit `TEXO_LOG_FORMAT=json` schreibt der Server jede Meldung als eine Zeile JSON – so, wie Loki, Elasticsearch, Datadog
oder CloudWatch sie erwarten:

```json
{"time":"2026-10-10T08:15:02.481Z","level":"warn","msg":"Langsame Abfrage (812 ms): …","trace_id":"4bf92f3577b34da6a3ce929d0e0e4736"}
```

`level` ist `info`, `warn` oder `error`; `trace_id` fehlt außerhalb von Anfragen, Jobs und Zeitplänen. Mit der Id
findest du zu einer Logzeile den ganzen Trace und umgekehrt.

### Fehlerberichte aus dem Browser

Was im Browser schiefgeht, sieht der Server normalerweise nie. Mit

```json
{ "errors": true }
```

in texo.json meldet die Seite unbehandelte Fehler, abgelehnte Promises und alles, was eine `ErrorBoundary` abfängt,
an `POST /__texo/errors`. Der Browser sammelt sie zwei Sekunden lang, schickt höchstens 20 je Seitenaufruf und doppelte
nur einmal; beim Verlassen der Seite geht der Rest noch mit. Der Server nimmt nur Berichte von der eigenen Herkunft an
(`403` sonst), höchstens 64 KB und 10 Berichte je Sendung und 30 je Minute und Client (`429` darüber), schreibt sie als
`Browser-Fehler (boundary) auf /seite: Meldung` mit Stack ins Log und zählt sie in `texo_errors_total{source="browser"}`.
Ohne die Einstellung gibt es den Pfad nicht und die Seite lädt keinen zusätzlichen Code. Beim Backend `static` gibt es
keinen Server und damit keine Berichte.

`texo build` verkürzt Dateinamen (mit Hash) und Namen exportierter Funktionen und Klassen. Die Zuordnung dazu legt
der Build in `dist/server/errors-map.json` ab, also nie in `public/`, wo sie jeder abrufen könnte. Der Server ersetzt
damit im Stack die Dateinamen mit Hash und die verkürzten Namen durch die aus dem Quelltext. Lokale Namen innerhalb
einer Funktion bleiben verkürzt, Zeilen und Spalten beziehen sich auf die ausgelieferte Datei.

### Entwicklung: `/__texo/dev`

Unter `texo dev` zeigt `http://localhost:3000/__texo/dev` die letzten 100 Anfragen als Zeitleiste: jede Anfrage mit
Status, Dauer und Trace-Id, darunter ihre Abschnitte (Wächter, Loader, Methoden, Abfragen, ausgehende Aufrufe) als
Balken an der Stelle, an der sie liefen. So siehst du ohne Collector, welche Abfrage eine Seite langsam macht oder ob
eine Schleife hundert Abfragen statt einer auslöst. In Produktion gibt es die Seite nicht.

---

## Erzeugte Dateien

```
dist/
  package.json            { "type": "module", "scripts": { "start": "node server/main.js" } }
  public/                 alles, was der Browser bekommt
    index.html, login.html, admin.html, app.css
    notes/Api.js          ← nur Stubs:  rpc.service("/api/notes", { list: [[], ["L",["C","notes.Note"]]] })
    texo/core.js std.js rpc.js …
  server/                 nur auf dem Server
    main.js               Einstieg: Seiten-Wächter, Konfiguration, Adapter
    notes/Api.js          die echten Service-Klassen + srv.service(…)-Registrierung
    texo/server.js        Routing, Sicherheit, Sessions
    texo/adapter.js       Node.js-, Bun- oder Deno-Adapter
```

Das vollständige Beispiel mit Anmeldung, geschützter Notizen-Seite und Admin-Bereich liegt in
[`examples/fullstack`](beispiele/fullstack.md):

```sh
texo build examples/fullstack/src && cd examples/fullstack/dist && npm start
# Demo-Zugänge: ada / texo123  und  admin / admin123
```

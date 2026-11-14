<!-- Übernommen aus LearNivram/Texo (docs/datenbank.md) mit scripts/docs-uebernehmen.mjs – bitte dort ändern. -->

# Datenbanken mit Texo Data

Texo Data ist die eingebaute Datenbankanbindung. Du beschreibst Tabellen als Datenklassen. Die Abfragen schreibst du
als normale, typgeprüfte Lambdas, und Texo übersetzt sie in SQL oder MongoDB-Filter. Dieselbe Datenklasse wandert
ohne weiteren Code vom Server in den Browser.

| Datenbank | `texo.json` | Treiber (npm) | Hinweis |
|---|---|---|---|
| SQLite | `"type": "sqlite"` | – (eingebaut) | eine Datei, ideal zum Start; Node ≥ 22.5, Bun, Deno |
| PostgreSQL | `"type": "postgres"` | `pg` | |
| MySQL / MariaDB | `"type": "mysql"` | `mysql2` | |
| MongoDB | `"type": "mongodb"` | `mongodb` | Transaktionen brauchen ein Replica Set |
| Speicher | `"type": "memory"` | – | für Prototypen; `texo test` benutzt sie automatisch |

## Schnellstart

```
$ texo init shop --backend node --db postgres
✔ Projekt 'shop' angelegt (Beispiel: Start, Backend: Node.js, Datenbank: PostgreSQL)
  src/server/      Server: Services, Wächter, Tabellen
  src/pages/       Seiten (@Page)
  src/components/  wiederverwendbare Komponenten
  tests/           Tests (texo test)
  public/          Bilder, Schriften, favicon
  cd shop && docker compose up -d   PostgreSQL starten (oder DATABASE_URL in .env anpassen)
  cd shop && texo dev
```

`texo init` fragt nach Beispiel, Backend und Datenbank. Es legt dann an:

- das gewählte Beispiel mit einer Tabelle unter `src/server/`, mit einem Test dazu: beim Beispiel **Start** einen
  Zähler (`src/server/Api.texo`), bei **Aufgabenliste** Konten mit Registrieren und Anmelden (`@Auth`) und die
  Aufgaben jedes Benutzers, bei **Chat** die Nachrichten (`texo init shop --example aufgaben --db postgres`);
- die Einstellung in der `texo.json`;
- eine `.env` mit `DATABASE_URL`, dazu `.env.example`;
- eine `docker-compose.yml` für den Datenbankserver;
- den Treiber, mit npm installiert.

Bei SQLite entfällt alles außer dem Beispiel: Die Datenbank ist die Datei `data/app.db`.

```json
{
  "backend": "node",
  "database": { "type": "postgres", "url": "env:DATABASE_URL" }
}
```

`"url": "env:NAME"` liest die Adresse aus einer Umgebungsvariablen. Der Server lädt eine `.env` im Startordner von
selbst. `TEXO_DB_URL` überschreibt die Adresse beim Deployment. Ohne `"database"` benutzt ein Projekt mit Tabellen
SQLite in `data/app.db`, relativ zum Startordner.

**Verschlüsselung bei PostgreSQL.** Ohne Angabe verbindet sich Texo wie `pg` unverschlüsselt. Liegt die Datenbank
auf einem anderen Rechner, warnt der Server beim Start. Hänge dann `?sslmode=verify-full` an die Adresse an: Das
Zertifikat wird gegen die üblichen öffentlichen CAs geprüft. Mit einer eigenen CA (etwa bei Cloud-Anbietern oder im
Firmennetz) nennt `&sslrootcert=/pfad/ca.pem` deren PEM-Datei, das schaltet TLS auch allein ein. `sslmode=no-verify`
verschlüsselt ohne Prüfung und ist nur ein Notbehelf.

## Tabellen

```texo
package shop

import texo.server.*
import texo.db.*

enum Status { Offen, Bezahlt, Versendet }

data class Adresse(strasse: String, ort: String)

@Table("produkte")
data class Produkt(
    @Id id: Int = 0,
    @Unique @MinLength(2) name: String,
    preis: Float,
    lager: Int = 0,
    aktiv: Boolean = true,
    tags: List<String> = [],
    erstelltAm: DateTime = DateTime.now()
)

@Table
data class Kunde(@Id id: Int = 0, @Unique @Email email: String, name: String)

@Table
data class Bestellung(
    @Id id: String = "",
    kunde: Relation<Kunde>,
    summe: Float,
    @Index status: Status = Status.Offen,
    lieferadresse: Adresse? = null
)
```

- **`@Table`** macht eine Datenklasse zur Tabelle. Der Name ist der Klassenname in snake_case (`BestellPosition` →
  `bestell_position`), oder du gibst ihn vor: `@Table("produkte")`. Spalten heißen wie die Felder in snake_case
  (`erstelltAm` → `erstellt_am`), eigene Namen vergibst du mit `@Column("…")`.
- **Die Id** ist das Feld mit `@Id`. Ohne `@Id` nimmt Texo ein Feld namens `id`. `Int`-Ids vergibt die Datenbank:
  Eine neue Zeile hat die Id `0`. `String`-Ids werden zu einer UUID, bei MongoDB zu einer ObjectId: Eine neue Zeile
  hat `""`.
- **`@Unique`** erzeugt einen eindeutigen Index, **`@Index`** einen normalen.
- **`@Searchable`** nimmt ein Textfeld in die [Volltextsuche](#volltextsuche) auf.
- **Typen**:
  - `Int`, `Float`, `String`, `Boolean`, `DateTime`;
  - Enums, gespeichert als Name;
  - `Relation<Tabelle>`;
  - Datenklassen, `List` und `Map`, gespeichert als JSON (in PostgreSQL `JSONB`).

  Nullbare Typen (`String?`) erlauben `null`.
- **Validierung** wie überall in Texo: `@Required`, `@Email`, `@MinLength`, `@MaxLength`, `@Min`, `@Max`,
  `@Pattern`. `insert`, `update` und `save` prüfen die Regeln, bevor etwas gespeichert wird, und werfen sonst eine
  `ValidationException`. `@MaxLength` bestimmt in MySQL auch die Spaltenlänge (`VARCHAR`).

Tabellen gibt es nur auf dem Server. Die Datenklasse selbst ist überall nutzbar. Ein Service kann `List<Produkt>`
zurückgeben, und der Browser bekommt die Werte geprüft und typisiert.

### Zeitstempel und Papierkorb

Drei Felder füllt der Server selbst, wenn du sie markierst:

```texo
package notizen

import texo.server.*
import texo.db.*

@Table
data class Notiz(
    @Id id: Int = 0,
    text: String,
    @CreatedAt erstelltAm: DateTime = DateTime.now(),
    @UpdatedAt geaendertAm: DateTime = DateTime.now(),
    @SoftDelete geloeschtAm: DateTime? = null
)

service Notizen {
    async fn liste(): List<Notiz> => await Notiz.all().orderByDescending(n => n.geaendertAm).list()

    async fn papierkorb(): List<Notiz> => await Notiz.withDeleted().where(n => n.geloeschtAm != null).list()

    async fn wegwerfen(id: Int): Boolean {
        let n = await Notiz.find(id)
        return n != null && await Notiz.delete(n)
    }

    async fn zurueckholen(id: Int): Notiz? {
        let n = await Notiz.withDeleted().where(x => x.id == id).first()
        return n == null ? null : await Notiz.restore(n)
    }

    async fn aufraeumen(): Int {
        let grenze = DateTime.now().addDays(-30)
        return await Notiz.withDeleted().where(n => n.geloeschtAm!!.isBefore(grenze)).forceDeleteAll()
    }
}
```

- **`@CreatedAt`** (`DateTime`): `insert` setzt die Zeit des Speicherns. `update` lässt den gespeicherten Wert stehen,
  auch wenn das Objekt einen anderen enthält.
- **`@UpdatedAt`** (`DateTime`): `insert` und jedes `update` setzen die aktuelle Zeit. `update` liefert die Zeile mit
  dem neuen Wert zurück.
- **`@SoftDelete`** (`DateTime?`): `delete`, `deleteWhere` und `deleteAll` löschen nicht, sondern tragen die Zeit
  ein. Solche Zeilen fehlen danach in allen Abfragen, in `find`, `count` und beim Laden von Beziehungen.
  `Notiz.withDeleted()` fragt alle Zeilen ab, `Notiz.restore(n)` holt eine zurück. `forceDelete(n)` und
  `forceDeleteAll()` löschen endgültig.

Die Zeit kommt immer vom Server. Was der Browser in diese Felder schickt, wird überschrieben. Jedes Feld gibt es
höchstens einmal je Tabelle. Bestehende Tabellen bekommen die neuen Spalten über eine [Migration](#migrationen).

## Abfragen

Abfragen stehen direkt an der Klasse. Sie sind nur im Server-Code erlaubt, also in `service`s, `@Server`- und
`@Seed`-Funktionen und in Tests.

```texo
package shop

import texo.server.*
import texo.db.*

@Table
data class Produkt(@Id id: Int = 0, @Unique name: String, preis: Float, lager: Int = 0, aktiv: Boolean = true)

service Laden {
    async fn suche(text: String, max: Float, seite: Int): List<Produkt> =>
        await Produkt
            .where(p => p.aktiv && p.preis <= max)
            .where(p => p.name.lower().contains(text.lower()))
            .orderBy(p => p.preis)
            .page(seite, 20)
            .list()

    async fn ausgewaehlte(ids: List<Int>): List<Produkt> => await Produkt.where(p => ids.contains(p.id)).list()

    async fn ausverkauft(): Int => await Produkt.where(p => p.lager == 0).count()

    async fn anlegen(name: String, preis: Float): Produkt => await Produkt.insert(Produkt(name: name, preis: preis))

    async fn teurer(id: Int, prozent: Float): Produkt? {
        let p = await Produkt.find(id)
        if (p == null) {
            return null
        }
        return await Produkt.update(p.copy(preis: p.preis * (1.0 + prozent / 100.0)))
    }
}
```

| An der Klasse | Ergebnis |
|---|---|
| `Produkt.all()`, `.where(p => …)`, `.orderBy(p => p.feld)`, `.orderByDescending(…)` | Abfrage (`Query<Produkt>`) |
| `Produkt.find(id)` | `Produkt?` (die Id ist typgeprüft) |
| `Produkt.count()` | `Int` |
| `Produkt.insert(p)`, `insertAll([…])` | gespeicherte Zeile(n) mit vergebener Id |
| `Produkt.update(p)` | schreibt die Zeile mit `p.id` zurück |
| `Produkt.save(p)` | `insert` bei leerer Id, sonst `update` |
| `Produkt.delete(p)`, `Produkt.deleteWhere(p => …)` | `true` bzw. Anzahl gelöschter Zeilen |
| `Produkt.withDeleted()`, `restore(p)`, `forceDelete(p)` | mit [`@SoftDelete`](#zeitstempel-und-papierkorb): auch gelöschte Zeilen, zurückholen, endgültig löschen |

| An einer Abfrage | |
|---|---|
| `.where(…)` | weitere Bedingung (UND) |
| `.orderBy(p => p.feld)`, `.orderByDescending(…)` | Sortierung, mehrfach möglich |
| `.limit(n)`, `.offset(n)`, `.page(nummer, größe)` | Ausschnitt (Seiten ab 1) |
| `.include(b => b.kunde)` | Beziehung gleich mitladen |
| `.groupBy(b => b.feld)`, `.select(…)` | [Auswertung](#auswertungen) |
| `.list()`, `.first()`, `.count()`, `.exists()`, `.deleteAll()`, `.forceDeleteAll()` | ausführen (`await`) |
| `.live()` | als `Stream<List<…>>`, der sich selbst aktualisiert ([Live-Abfragen](#live-abfragen)) |

Alles, was ausgeführt wird, ist asynchron (`Future<…>`). Davor steht deshalb `await`.

### Was in `where` stehen darf

Die Bedingung wird nicht im Server ausgeführt, sondern als Abfrage an die Datenbank geschickt. Erlaubt sind:

- Vergleiche eines Feldes mit einem Wert: `p.preis < max`, `p.name == "Tee"`, `p.notiz != null`, `10 <= p.lager`.
  Zeitpunkte mit `isBefore`/`isAfter`: `p.geliefertAm.isBefore(heute)`. Nullbare Felder vergleichst du mit `!!`:
  `p.geloeschtAm!!.isAfter(t)` (Zeilen mit `null` passen nicht);
- `&&`, `||`, `!` und Boolean-Felder: `p.aktiv`, `!p.aktiv`;
- Text: `p.name.contains(x)`, `startsWith`, `endsWith`. Mit `.lower()` (oder `.upper()`) auf beiden Seiten ohne
  Groß-/Kleinschreibung: `p.name.lower().contains(x.lower())`;
- Listen: `ids.contains(p.id)` (SQL `IN`);
- Beziehungen: `b.kunde == Relation.to(k)` oder `b.kunde.id == 5`.

Werte, die nicht von der Zeile abhängen, rechnet Texo vorher aus: Variablen, Konstanten und Ausdrücke wie
`heute.addDays(-7)`. Sie gehen als Parameter an die Datenbank, nie als Teil des SQL-Textes. SQL-Injection ist
deshalb ausgeschlossen. Alles andere ist ein Compile-Fehler, z. B. zwei Felder vergleichen, mit Feldern rechnen
oder eigene Funktionen aufrufen:

```
Shop.texo:9:24: Fehler: Ein Feld lässt sich nur mit einem Wert vergleichen, der nicht von der Zeile abhängt (zwei Felder oder Rechnungen mit Feldern gehen nicht)
 9 |     Produkt.where(p => p.preis > p.lager.toFloat())
```

Für Abfragen, die so nicht gehen, gibt es [eigenes SQL](#eigenes-sql).

## Auswertungen

`groupBy` fasst Zeilen nach einem Feld zusammen, `select` bestimmt, was herauskommt. Das Ergebnis ist eine eigene
Datenklasse, also typgeprüft wie jede andere Abfrage. Ausgewertet wird in der Datenbank: als SQL mit `GROUP BY` bei
SQLite, PostgreSQL und MySQL, als `$group` bei MongoDB und im Speicher bei `texo test`. Das Ergebnis ist überall
dasselbe.

```texo
package shop

import texo.server.*
import texo.db.*

enum Status { Offen, Bezahlt, Versendet }

@Table
data class Kunde(@Id id: Int = 0, name: String, umsatz: Float = 0.0)

@Table
data class Bestellung(@Id id: Int = 0, kunde: Relation<Kunde>, summe: Float, status: Status = Status.Offen)

data class Umsatz(status: Status, anzahl: Int, summe: Float, schnitt: Float)
data class KundeKurz(id: Int, name: String)

service Auswertung {
    async fn umsatzJeStatus(mindestens: Float): List<Umsatz> =>
        await Bestellung
            .where(b => b.summe >= mindestens)
            .groupBy(b => b.status)
            .select(g => Umsatz(g.key, g.count(), g.sum(b => b.summe), g.avg(b => b.summe)))
            .orderByDescending(u => u.summe)
            .list()

    // nur zwei Spalten laden statt ganzer Zeilen
    async fn kundenListe(): List<KundeKurz> =>
        await Kunde.all().orderBy(k => k.name).select(k => KundeKurz(k.id, k.name)).list()

    // eigenes SQL, aber mit Typ
    async fn topKunden(): List<KundeKurz> =>
        await Db.query<KundeKurz>("SELECT id, name FROM kunde ORDER BY umsatz DESC LIMIT ?", [10])
}
```

In `select` steht genau ein Aufruf des Konstruktors einer Datenklasse. Seine Argumente dürfen sein:

- **ohne `groupBy`**: Felder der Zeile (`k.id`, `k.name`). Es werden nur diese Spalten geladen;
- **nach `groupBy`**: `g.key`, der Wert des Felds aus `groupBy`, und Zusammenfassungen der Zeilen einer Gruppe:
  `g.count()`, `g.sum(b => b.feld)`, `g.avg(…)`, `g.min(…)` und `g.max(…)`.

Parameter mit Standardwert dürfen fehlen. Alles andere ist ein Compile-Fehler, wie bei `where`:

```
Shop.texo:12:46: Fehler: In select nach groupBy stehen nur g.key und Zusammenfassungen: g.count(), g.sum(b => b.feld), g.avg(…), g.min(…), g.max(…)
```

Dabei gilt:

- **`sum` und `avg`** gehen über Zahlenfelder (`Int`, `Float`), die nicht null sein können. Die Summe hat den Typ
  des Felds, der Durchschnitt ist immer `Float`, auch bei `Int`-Feldern.
- **`min` und `max`** gehen über Zahlen, Texte, `DateTime` und Enums. Nullbare Felder sind erlaubt: `null` zählt
  nicht mit, und eine Gruppe ganz ohne Wert ergibt `null`.
- **Gruppieren** lässt sich nach Feldern mit einfachem Typ, nach Enums und nach Beziehungen (`groupBy(b =>
  b.kunde)`, der Schlüssel ist dann eine `Relation` mit Id), nicht nach Listen, Maps oder Datenklassen.
- **Sortieren** hinter `select` geht nach den Feldern des Ergebnisses: `.orderByDescending(u => u.summe)`. Gruppen
  sind zusätzlich nach dem Schlüssel aufsteigend sortiert, damit die Reihenfolge auf jeder Datenbank gleich ist.
  `limit`, `offset`, `page`, `list()` und `first()` gibt es auch hinter `select`.
- **Bedingungen** mit `where` stehen vor `groupBy` und filtern die Zeilen. Bedingungen auf Gruppen (wie SQL
  `HAVING`) gibt es noch nicht, ebenso wenig mehrere Schlüssel oder Felder aus Beziehungen in `select`.
- Ohne `groupBy` gelten Sortierung, `limit` und `offset` der Abfrage davor weiter. Bei `groupBy` gehören `limit`,
  `offset` und `page` hinter `select`.

## Volltextsuche

Mit `@Searchable` markierst du die Textfelder, in denen gesucht werden soll. `search` findet dann Zeilen, in denen
alle Suchwörter vorkommen, und liefert sie nach Relevanz sortiert, die besten zuerst. Gesucht wird in der Datenbank
über ihren eigenen Suchindex: FTS5 bei SQLite, `tsvector` mit GIN-Index bei PostgreSQL, `FULLTEXT` bei MySQL und ein
Textindex bei MongoDB. Im Speicher (`texo test`) rechnet Texo selbst.

```texo
package blog

import texo.server.*
import texo.db.*
import texo.ui.*

@Table
data class Artikel(
    @Id id: Int = 0,
    @Searchable(weight: 3) titel: String,
    @Searchable text: String,
    autor: String
)

service Suche {
    async fn finden(q: String, seite: Int): List<Treffer<Artikel>> =>
        await Artikel.search(q).where(a => a.autor != "bot").page(seite, 20).list()

    async fn anzahl(q: String): Int => await Artikel.search(q).count()
}

component Ergebnis(t: Treffer<Artikel>) {
    fn build(): View => Column([
        Text(t.value.titel).bold(),
        Highlight(t.snippet)
    ])
}
```

- **`@Searchable`** gilt für `String`-Felder (auch `String?`), nicht für die Id. `weight:` (1 bis 4, Standard 1)
  gewichtet ein Feld: Ein Treffer im Titel mit `weight: 3` zählt mehr als einer im Text.
- **`search(query, language)`** zerlegt die Anfrage in Wörter. Jedes Wort muss in einem der Felder vorkommen, und zwar
  als Wortanfang: `garten` findet auch „Gartenarbeit“. Groß- und Kleinschreibung und Akzente zählen nicht (`Café`
  findet `cafe`). Wörter mit nur einem Zeichen fallen weg, höchstens 16 Wörter zählen. Eine Anfrage ohne Wörter
  findet nichts.
- **`language`** ist `"german"` (Standard), `"english"` oder `"simple"`. Bei den ersten beiden kürzt Texo die
  Suchwörter auf ihren Stamm, sodass `Häuser` auch `Haus` findet. `"simple"` sucht die Wörter, wie sie sind. Eine
  andere Sprache ist ein Compile-Fehler.
- **`where`**, `limit`, `offset` und `page` funktionieren wie bei Abfragen. `count()` zählt alle Treffer, `first()`
  liefert den besten. Sortiert wird immer nach Relevanz, bei gleicher Relevanz nach der Id. `orderBy` gibt es hier
  nicht. Die Suche sieht dieselben Zeilen wie `where(…)`: Mit `@SoftDelete` gelöschte Zeilen findet sie nicht, und
  `@Policy`/`@Tenant` gelten für den Benutzer der Anfrage (auch in `count()`), außer bei `unrestricted().search(…)`.
- **`Treffer<T>`** hat drei Felder: `value` ist die Zeile, `score` die Relevanz (größer ist besser) und `snippet` ein
  Ausschnitt von etwa 15 Wörtern aus dem Feld mit den meisten Fundstellen. Die Fundstellen stehen darin zwischen den
  Zeichen `\u0002` und `\u0003`. Ein Service kann Treffer an den Browser geben, wie eine Datenklasse.
- **`Highlight(snippet)`** zeigt einen solchen Ausschnitt an: als `<span>`, die Fundstellen in `<mark>`. Der Text wird
  nie als HTML gelesen, auch wenn er spitze Klammern enthält.

Der Suchindex entsteht mit der Tabelle, beim Start des Servers oder mit `texo db migrate`. Danach hält ihn die
Datenbank selbst aktuell: Neue, geänderte und gelöschte Zeilen sind sofort auffindbar.

| Datenbank | Index | Relevanz |
|---|---|---|
| SQLite | FTS5-Tabelle `<tabelle>__search` mit Triggern | BM25 |
| PostgreSQL | erzeugte Spalte `_texo_search` (`tsvector`) mit GIN-Index | `ts_rank` |
| MySQL | `FULLTEXT`-Indizes über die Felder | `MATCH … AGAINST` |
| MongoDB | Textindex `<tabelle>_search` mit den Gewichten | `textScore` |
| Speicher | keiner | BM25 wie SQLite |

Welche Zeilen gefunden werden, ist überall gleich, mit diesen Ausnahmen:

- **Die Reihenfolge** kann sich zwischen den Datenbanken unterscheiden, weil jede die Relevanz anders berechnet. Der
  Wert von `score` ist nur innerhalb einer Datenbank vergleichbar. SQLite und der Speicher rechnen gleich.
- **MongoDB** findet nur ganze Wörter (auf ihren Stamm gekürzt), keine Wortanfänge: `Garten` findet dort „Garten“,
  aber nicht „Gartenarbeit“. Der Textindex kürzt die Wörter der Felder immer deutsch, mit `"english"` oder
  `"simple"` findet die Suche dort deshalb nur Wörter, die sich dabei nicht ändern.
- **MySQL** übergeht Stoppwörter und sehr kurze Wörter (Standard bei InnoDB: unter drei Zeichen) im Index. Solche
  Wörter findet die Suche dort nicht.

Ein Tippfehler-tolerantes Suchen (z. B. über Trigramme) gibt es noch nicht.

## Beziehungen

Ein Feld `Relation<Kunde>` speichert die Id eines Kunden. Die Zeile selbst lädst du nur, wenn du sie brauchst:

```texo
package shop

import texo.server.*
import texo.db.*

@Table
data class Kunde(@Id id: Int = 0, name: String)

@Table
data class Bestellung(@Id id: Int = 0, kunde: Relation<Kunde>, summe: Float)

service Bestellungen {
    async fn neu(kundeId: Int, summe: Float): Bestellung =>
        await Bestellung.insert(Bestellung(kunde: Relation.of<Kunde>(kundeId), summe: summe))

    // eine Abfrage für die Bestellungen, eine für alle Kunden darin – nicht eine pro Zeile
    async fn liste(): List<Bestellung> => await Bestellung.all().include(b => b.kunde).orderByDescending(b => b.id).list()

    async fn vonKunde(k: Kunde): Int => await Bestellung.where(b => b.kunde == Relation.to(k)).count()

    async fn kundeVon(id: Int): String {
        let b = await Bestellung.find(id)
        if (b == null) {
            return "unbekannt"
        }
        let k = await b.kunde.load()
        return k?.name ?? "unbekannt"
    }
}
```

- `Relation.to(zeile)` verweist auf eine gespeicherte Zeile, `Relation.of<Kunde>(id)` auf eine Id.
- `rel.id` ist die Id (mit dem Typ der Id von `Kunde`, also hier `Int`), `rel.value` die geladene Zeile oder `null`.
  `await rel.load()` lädt sie. Deshalb geht auch `Bestellung.where(b => ids.contains(b.kunde.id))` mit `ids: List<Int>`.
- **Nullbare Beziehungen** wie `verantwortlich: Relation<Benutzer>? = null` sind erlaubt: `include(a => a.verantwortlich)`
  lädt sie mit (wo `null` steht, bleibt `null`), `a.verantwortlich?.value?.name` liest sie.
- Im Browser kommt eine Relation als `{ id, value }` an: `b.kunde.value?.name` funktioniert dort genauso.

## Transaktionen

```texo
package shop

import texo.server.*
import texo.db.*

@Table
data class Konto(@Id id: Int = 0, inhaber: String, stand: Float)

service Bank {
    async fn ueberweisen(von: Int, an: Int, betrag: Float): Void {
        await Db.transaction(async () => {
            let a = await Konto.find(von)
            let b = await Konto.find(an)
            if (a == null || b == null || a.stand < betrag) {
                throw HttpError(400, "Überweisung nicht möglich")
            }
            await Konto.update(a.copy(stand: a.stand - betrag))
            await Konto.update(b.copy(stand: b.stand + betrag))
        })
    }
}
```

Wirft die Aktion einen Fehler, wird alles zurückgenommen. Alle Abfragen innerhalb laufen über dieselbe Verbindung,
auch in aufgerufenen Funktionen. `Db.transaction` liefert den Rückgabewert der Aktion. MongoDB braucht für
Transaktionen ein Replica Set. Die `docker-compose.yml` von `texo init` richtet eins ein.

## Zugriffsregeln und Änderungsprotokoll

`@Guard` schützt Seiten und Methoden, aber nicht die Zeilen dahinter. Fehlt in einer Methode das
`where(n => n.autor == ich)`, kann jeder angemeldete Benutzer mit einer fremden Id fremde Zeilen lesen oder ändern.
Zugriffsregeln stehen deshalb an der Tabelle selbst und gelten für jede Abfrage:

```texo
package notizen

import texo.server.*
import texo.db.*

enum Rolle { Leser, Admin }

@Auth
data class Benutzer(id: Int, name: String, rolle: Rolle, firma: Int)

@Server
fn notizLesen(u: Benutzer?, n: Notiz): Boolean => n.oeffentlich || n.autor == u?.id

@Server
fn notizAendern(u: Benutzer?, n: Notiz): Boolean => n.autor == u?.id || u?.rolle == Rolle.Admin

@Table
@Policy(read: notizLesen, write: notizAendern)
@Audited(keep: 365.d)
data class Notiz(@Id id: Int = 0, autor: Int, text: String, oeffentlich: Boolean = false, @NotAudited entwurf: String = "")

@Table
@Tenant(firma)
data class Rechnung(@Id id: Int = 0, firma: Int = 0, betrag: Float)

service Notizen {
    // eine fremde, private Notiz: null
    async fn holen(id: Int): Notiz? => await Notiz.find(id)

    async fn verlauf(id: Int): List<Aenderung> => await Notiz.history(id)

    // nur die Rechnungen der eigenen Firma
    async fn rechnungen(): List<Rechnung> => await Rechnung.all().list()
}
```

**Regeln.** Eine Regel ist eine `@Server`-Funktion `(u: Benutzer?, zeile: T): Boolean`, wobei `Benutzer` die Klasse
mit `@Auth` ist. Ihr Rumpf ist ein einzelner Ausdruck, der in die Teilmenge von [`where`](#was-in-where-stehen-darf)
passt, denn Texo übersetzt ihn in die Abfrage. `u` gilt dabei als Wert, der nicht von der Zeile abhängt: `u?.id`
und `u?.rolle == Rolle.Admin` sind erlaubt. Passt eine Regel nicht, meldet der Compiler das an der Regel.

- **Leseregel** (`read:`): Texo hängt sie an jede Abfrage der Tabelle an, also an `all`, `where`, `find`, `count`,
  `exists` und an das Laden von Beziehungen mit `include` und `load()`. Eine Zeile, die der Benutzer nicht lesen darf,
  gibt es für ihn nicht: `find` liefert `null`.
- **Schreibregel** (`write:`): `insert` prüft sie gegen die neue Zeile, `update` gegen die gespeicherte und die neue
  Zeile, `delete` gegen die gespeicherte. Verbietet sie die Änderung, wirft Texo eine `ForbiddenException` (`e.table`),
  im Browser ein Fehler mit Status 403. `deleteWhere` und `deleteAll` löschen nur Zeilen, die Lese- und Schreibregel
  erlauben.
- **`@Tenant(feld)`** ist eine fertige Regel für Anwendungen mit mehreren Firmen: lesen und schreiben nur, wenn
  `zeile.feld == u.feld`. Die `@Auth`-Klasse braucht dafür ein Feld mit gleichem Namen und Typ. `insert` füllt das Feld
  selbst mit dem Wert des Benutzers. Ohne angemeldeten Benutzer gibt es keine Zeilen. `@Tenant` lässt sich mit
  `@Policy` kombinieren, dann gelten beide.

**Wann die Regeln gelten.** In einer Anfrage, also in Service-Methoden, Loadern (`@Load`) und Wächtern, mit
`request.user` als Benutzer, auch ohne Anmeldung (dann ist `u` `null`). Außerhalb einer Anfrage (Zeitpläne, Jobs,
`@Seed`, Tests ohne `TestClient`) gibt es keinen Benutzer, und die Regeln gelten nicht. Mit `Db.as` gelten sie dort
für einen bestimmten Benutzer:

```texo
// in einem Zeitplan oder Test
let sichtbar = await Db.as(benutzer, async () => await Notiz.all().list())
```

`Notiz.unrestricted()` umgeht die Regeln bewusst, etwa für eine Verwaltungsseite: `await
Notiz.unrestricted().find(id)`. Der Aufruf ist im Code leicht zu finden. Beziehungen, die eine solche Abfrage mit
`include` lädt, kommen ebenfalls ohne Regeln. Den Benutzer trägt dieselbe Verbindung durch die Aufrufe wie bei
`Db.transaction`, auch über Funktionsgrenzen hinweg.

**Änderungsprotokoll.** `@Audited` schreibt jede Änderung über `insert`, `update`, `save`, `delete`, `deleteWhere` und
`deleteAll` in die Tabelle `_texo_audit`: Tabelle, Id der Zeile, Aktion (`insert`, `update`, `delete`), die Id des
Benutzers (`request.user.id` oder aus `Db.as`, sonst `null`), Zeit und die geänderten Felder vorher und nachher.
`Notiz.history(id)` liest das als `List<Aenderung>` zurück, die älteste Änderung zuerst:

| `Aenderung` | |
|---|---|
| `tabelle`, `id` | Tabellenname und Id der Zeile als Text |
| `aktion` | `"insert"`, `"update"` oder `"delete"` |
| `benutzer` | Id des Benutzers als Text oder `null` |
| `zeit` | `DateTime` der Änderung |
| `felder` | `List<FeldAenderung>` mit `feld`, `vorher` und `nachher` (Werte im Netzformat als JSON-Text, `null` bei `insert` vorher und `delete` nachher) |

- Mit Regeln zeigt `history` nur den Verlauf von Zeilen, die der Benutzer lesen darf; sonst ist die Liste leer.
- `keep: 365.d` löscht ältere Einträge. Texo räumt beim Schreiben auf, höchstens einmal pro Stunde und Tabelle.
- `@NotAudited` an einem Feld nimmt es aus dem Protokoll aus, etwa für personenbezogene Daten, die beim Löschen eines
  Kontos verschwinden müssen.
- Ein `update`, das nichts ändert, erscheint nicht im Protokoll.

**Texo Studio** arbeitet ohne Benutzer: Dort gelten die Regeln nicht, und Änderungen im Studio stehen nicht im
Protokoll. Die [Verwaltungskonsole](backend.md#betrieb-verwaltungskonsole-adminconsole) (`AdminConsole`) dagegen
arbeitet als der angemeldete Benutzer: Für sie gelten die Regeln, und ihre Änderungen stehen mit seiner Id im
Protokoll.

## Live-Abfragen

Mit `.live()` statt `.list()` wird eine Abfrage zum `Stream<List<T>>`. Eine Service-Methode gibt ihn zurück, und die
Seite bleibt von selbst aktuell. Der erste Wert ist das Ergebnis der Abfrage, danach kommt ein neuer, sobald sich das
Ergebnis ändert. Ein `Channel` und ein `send` in jeder schreibenden Methode sind dafür nicht nötig.

```texo
package notizen

import texo.server.*
import texo.db.*
import texo.ui.*

@Table
data class Notiz(@Id id: Int = 0, autor: String, text: String, geaendertAm: DateTime = DateTime.now())

@Api("/api/notizen")
service Notizen {
    fn meine(): Stream<List<Notiz>> {
        let ich = this.request.session.get("user") ?? ""
        return Notiz.where(n => n.autor == ich).orderByDescending(n => n.geaendertAm).limit(100).live()
    }

    async fn anlegen(text: String): Notiz =>
        await Notiz.insert(Notiz(autor: this.request.session.get("user") ?? "", text: text))   // kein send nötig
}

@Page(title: "Notizen", path: "/")
component NotizListe {
    private State<List<Notiz>> notizen = Notizen.meine().latest([])

    fn build(): View => Column(spacing: 8.px, [
        ForEach(this.notizen.value, n => Text(n.text))
    ])
}
```

So funktioniert es:

- **Jeder Schreibzugriff über Texo Data meldet seine Tabelle.** Das sind `insert`, `insertAll`, `update`, `save`,
  `delete`, `deleteWhere` und `deleteAll`. In einer Transaktion kommt die Meldung erst nach dem `COMMIT`; wird sie
  zurückgenommen, gibt es keine.
- **Offene Live-Abfragen auf der Tabelle laufen neu**, gebündelt und höchstens alle 50 ms. Gesendet wird nur, wenn sich
  das Ergebnis wirklich geändert hat. Eine neue Notiz eines anderen Autors schickt im Beispiel also nichts.
- **Gleiche Abfragen mit gleichen Werten teilen sich einen Lauf.** Haben hundert Browser dieselbe Liste offen, fragt der
  Server die Datenbank nach einer Änderung einmal und schickt das Ergebnis an alle.
- **Nach einem Verbindungsabbruch** verbindet sich der Browser neu (wie bei jedem Stream) und bekommt wieder den vollen
  Stand. Es geht also nichts verloren.
- **Wächter** (`@Guard`, `@RateLimit`, Session) laufen beim Verbinden wie bei jedem Aufruf. Die Bedingung der Abfrage
  steht beim Verbinden fest. Ändern sich die Rechte eines Benutzers, gilt das erst ab der nächsten Verbindung.
- **Zugriffsregeln** ([`@Policy`, `@Tenant`](#zugriffsregeln-und-änderungsprotokoll)) gelten bei jedem Lauf wie bei
  `list()` für den Benutzer, der verbunden hat. Solche Abfragen teilen ihren Lauf nicht mit anderen Verbindungen.
- **Beziehungen mit `include(…)`**: Ändert sich die Tabelle der mitgeladenen Zeilen, läuft die Abfrage ebenfalls neu.
- **Gesendet wird immer die ganze Liste**, nicht nur die Änderung. Eine Live-Abfrage darf höchstens 10 000 Zeilen
  liefern. Bei mehr antwortet der Server mit einem Fehler, und läuft sie schon, endet der Stream. Begrenze große
  Listen deshalb mit `limit(…)` oder `page(…)`.

Schreibzugriffe über `Db.sql` sieht Texo nicht. Melde die Tabelle danach selbst mit `Db.changed("notiz")`. Erlaubt
sind der Tabellenname und der Klassenname, in einer Transaktion gilt die Meldung ebenfalls erst nach dem `COMMIT`.

Live-Abfragen gibt es in beiden Servern (Node, Bun, Deno und `texo`) und in `texo test`. Ohne Weiteres gelten sie
für einen Serverprozess. Laufen mehrere Prozesse hinter einem Load Balancer, schaltet `"cluster": { "bus": "database" }`
in der `texo.json` den Instanz-Bus ein: Dann melden alle Instanzen ihre geschriebenen Tabellen über die Datenbank, und
die Live-Abfragen der anderen laufen ebenfalls neu (siehe [Backend und Sicherheit](backend.md#mehrere-instanzen-cluster)).

## Fehler

| Fehler | wann |
|---|---|
| `ValidationException` (`e.errors`: Feld und Meldung) | eine Regel wie `@Email` oder `@MinLength` ist verletzt |
| `UniqueException` (`e.table`, `e.field`) | ein `@Unique`-Wert oder eine Id ist schon vergeben |
| `ForbiddenException` (`e.table`) | eine Schreibregel (`@Policy`, `@Tenant`) verbietet die Änderung; im Browser Status 403 |

```texo
// im Service
try {
    await Kunde.insert(Kunde(email: email, name: name))
} catch (e) {
    if (e is UniqueException) {
        throw HttpError(409, "Diese E-Mail ist schon registriert")
    }
    throw e
}
```

## Migrationen

Fehlt eine Tabelle, legt der Server sie beim Start an. Ändert sich eine bestehende Tabelle, z. B. durch ein neues
Feld oder einen anderen Typ, beschreibt eine Migration den Umbau:

```
$ texo db migrate preise
✔ migrations/20250101120000_preise.sql (2 Anweisung(en))
✔ angewendet: 20250101120000_preise
```

```sql
-- migrations/20250101120000_preise.sql
ALTER TABLE "produkte" ADD COLUMN "rabatt" DOUBLE PRECISION NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS "produkte_rabatt_idx" ON "produkte" ("rabatt");
```

- `texo db migrate [name]` vergleicht die Tabellen im Code mit `migrations/schema.json`, dem Stand der letzten
  Migration. Daraus schreibt es das SQL für deine Datenbank und wendet ausstehende Migrationen an. Die Dateien
  gehören ins Repository.
- **Erste Migration nach einer Weile ohne**: Hat der Server die Tabellen schon beim Start angelegt, nimmt
  `texo db migrate` ihren Stand aus der Datenbank. Ein neues Feld wird dann zu `ALTER TABLE … ADD COLUMN`. Davor
  stehen die vorhandenen Tabellen als `CREATE TABLE IF NOT EXISTS`, damit dieselbe Migration auch eine leere
  Datenbank aufbaut.
- **Neue Pflichtfelder** bekommen für vorhandene Zeilen einen Standardwert: `0`, `''`, `false`, `[]`, den ersten
  Enum-Wert oder die aktuelle Zeit.
- **Gelöschte Spalten und Tabellen** stehen nur als Kommentar in der Datei (`-- DROP …`). Texo löscht nie
  stillschweigend Daten. In solchen Fällen hält `texo db migrate` vor dem Anwenden an, damit du die Datei prüfen
  kannst. `-y` wendet sofort an.
- **Umbenennen**: Behalte den alten Spaltennamen mit `@Column("alter_name")`, sonst wird es Löschen und Neuanlegen.
- **SQLite** kann Spalten nicht ändern. Texo baut die Tabelle deshalb neu auf und kopiert die Daten.
- **Server-Start**: `texo build` packt `migrations/` mit in `dist/`, und der Server wendet ausstehende Migrationen
  beim Start an. Die Tabelle `_texo_migrations` merkt sich, was schon gelaufen ist. Mit `texo dev` gilt dasselbe;
  zusätzlich weist der Server darauf hin, wenn der Code neuer ist als die letzte Migration.
- `texo db status` zeigt angewendete und ausstehende Migrationen. Mit `"autoCreate": false` in `"database"` legt der
  Server nichts selbst an.
- **Volltextsuche**: Kommt `@Searchable` an ein Feld, ändert sich ein Gewicht oder fällt es weg, entfernt die
  Migration den alten Suchindex und legt den neuen an. Vorhandene Zeilen kommen dabei in den Index. Fehlt der Index
  einer SQLite- oder PostgreSQL-Tabelle, legt ihn auch der Server beim Start an.
- **MongoDB** braucht keine Migrationen. `texo db migrate` legt dort nur die Indizes an.

## Beispieldaten

```texo
package shop

import texo.server.*
import texo.db.*

@Table
data class Produkt(@Id id: Int = 0, @Unique name: String, preis: Float)

@Seed
async fn beispielProdukte(): Void {
    if (await Produkt.count() == 0) {
        await Produkt.insertAll([Produkt(name: "Tee", preis: 3.5), Produkt(name: "Kaffee", preis: 4.9)])
    }
}
```

`texo db seed` wendet ausstehende Migrationen an und ruft alle `@Seed`-Funktionen auf. `texo db seed
beispielProdukte` ruft nur diese eine auf.

**Beim Serverstart: `@Seed(onStart: true)`.** So eine Funktion läuft zusätzlich bei jedem Start des Servers, bevor er
die erste Anfrage beantwortet, z. B. für den ersten Admin. Sie muss deshalb mehrfach laufen dürfen (erst prüfen, dann
anlegen); ein Fehler darin steht im Log, der Server startet trotzdem.

```texo
package shop

import texo.server.*
import texo.db.*

@Table
data class Benutzer(@Id id: Int = 0, @Unique name: String, passwort: String, admin: Boolean = false)

@Seed(onStart: true)
async fn ersterAdmin(): Void {
    if (await Benutzer.count() == 0) {
        let pw = Env.get("ADMIN_PASSWORT") ?? "bitte-aendern"
        await Benutzer.insert(Benutzer(name: "admin", passwort: await Password.hash(pw), admin: true))
    }
}
```

## Texo Studio

```
$ texo db studio
Texo Studio: http://127.0.0.1:4983/#3f9c…  (postgres, Strg+C zum Beenden)
```

Das Studio zeigt alle Tabellen im Browser: blättern, suchen, Zeilen anlegen, bearbeiten und löschen, mit derselben
Validierung wie im Code. Es ist nur auf dem eigenen Rechner erreichbar und nur mit dem Schlüssel aus der Adresse.

## Testen

`texo test` gibt jedem Test eine eigene, leere Speicher-Datenbank. Tests dürfen Tabellen und Services direkt
benutzen, ohne Server und ohne HTTP:

```texo
// tests/LadenTest.texo
package shop.tests

import texo.test.*
import shop.*

@Test("Suche findet nur günstige, aktive Produkte")
async fn suche(): Void {
    await Produkt.insertAll([Produkt(name: "Tee", preis: 3.5), Produkt(name: "Teekanne", preis: 30.0)])
    let treffer = await Laden.suche("tee", 10.0, 1)
    expect(treffer.size).toBe(1)
    expect(treffer[0].name).toBe("Tee")
}
```

Ein Test läuft außerhalb einer Anfrage, deshalb gelten dort keine [Zugriffsregeln](#zugriffsregeln-und-änderungsprotokoll).
Über einen [`TestClient(user: …)`](testen.md) laufen Aufrufe dagegen wie echte Anfragen, mit den Regeln für diesen
Benutzer. So prüfst du, dass ein fremder Benutzer eine Zeile weder lesen noch ändern kann. Ohne Client gilt
`Db.as(benutzer, …)`. Rufe Clients nacheinander mit `await` auf: `texo test` kennt nur einen Benutzer zur selben Zeit.

## Eigenes SQL

```texo
// im Service – Parameter immer mit ?, auch bei PostgreSQL
let rows = await Db.sql("SELECT kategorie, AVG(preis) AS schnitt FROM produkte WHERE lager > ? GROUP BY kategorie", [0])
for (r in rows) {
    Log.info("${r.get("kategorie")}: ${r.get("schnitt")}")
}
```

`Db.sql` gibt es für SQLite, PostgreSQL und MySQL. Jede Zeile ist eine `Map<String, Any>`. `Db.kind()` sagt, welche
Datenbank verbunden ist.

Mit `Db.query<T>` bekommt das Ergebnis einen Typ. `T` ist eine Datenklasse. Jede Spalte wird dem Feld mit
demselben Namen oder dem Namen in snake_case zugeordnet (`erstelltAm` ← `erstellt_am`). Danach wird jede Zeile
geprüft wie ein Wert, der über RPC ankommt. `0`/`1` aus SQLite und MySQL werden dabei zu `Boolean`, Zeitpunkte zu
`DateTime` und JSON-Spalten zu Listen und Datenklassen. Spalten ohne passendes Feld bleiben unbeachtet.

```texo
// im Service
let produkte = await Db.query<ProduktKurz>("SELECT id, name, erstellt_am FROM produkte WHERE lager > ?", [0])
```

Fehlt eine Spalte, gibt es einen klaren Fehler statt eines `null` an falscher Stelle, ebenso bei einem falschen
Typ. Felder mit Standardwert dürfen fehlen.

```
Db.query<ProduktKurz>: Spalte 'erstellt_am' (Feld erstelltAm) fehlt im Ergebnis
ProduktKurz[0].id: erwartet Int, erhalten string
```

Offene [Live-Abfragen](#live-abfragen) merken Änderungen über `Db.sql` nicht von selbst. Rufe danach
`Db.changed("tabelle")` auf.

## Produktion

- `dist/package.json` enthält den Treiber. Auf dem Server reicht `npm install --omit=dev`.
- Die Adresse kommt aus der Umgebung: `DATABASE_URL=… npm start`, oder eine `.env` neben `server/` bzw. im
  Startordner.
- Ausstehende Migrationen laufen beim Start. Schlägt eine fehl, steht die Anweisung samt Fehler im Log, und die
  Migration bleibt ausstehend. Bei SQLite und PostgreSQL wird sie dabei vollständig zurückgenommen.
- Unter Deno startet der Server mit `--allow-write --allow-sys` (SQLite-Datei, Datenbanktreiber). Das steht schon im
  `npm start` der erzeugten `package.json`.
- Langsame Abfragen: Jede SQL-Anweisung, die länger als 500 ms dauert, steht als `Langsame Abfrage (… ms): …` im
  Log, mit ihrem Text, aber ohne Parameter. `TEXO_SLOW_QUERY_MS` ändert die Grenze, `0` schaltet die Meldung ab.
  MongoDB wird nicht gemessen.
- `GET /__texo/health` meldet `503`, wenn die Datenbank nicht erreichbar ist (siehe [Backend](backend.md)).

<!-- Übernommen aus LearNivram/Texo (docs/tutorial.md) mit scripts/docs-uebernehmen.mjs – bitte dort ändern. -->

# Tutorial: Ein Notizbuch mit Konto, Datenbank und Bildern

In diesem Tutorial baust du eine vollständige Anwendung: Man registriert sich, meldet sich an, legt Notizen an,
ändert und löscht sie und hängt Bilder an. Jeder sieht nur seine eigenen Notizen. Unterwegs lernst du alles, was eine
echte Anwendung braucht: Tabellen, Services, Anmeldung mit `@Auth`, Wächter, Prüfregeln, Datei-Uploads, Migrationen,
Tests und den Betrieb.

Du brauchst nur das Texo-Programm ([Installieren](installation.md)), kein Node.js. Die Grundlagen der Sprache
(Komponenten, `State`, Modifier) erklärt [Erste Schritte](erste-schritte.md); hier geht es um das Zusammenspiel.
Jede Datei dieser Seite wird in den Tests Schritt für Schritt übersetzt und am Ende mit `texo test` geprüft
(`tests/tutorial.test.mjs`), sie funktioniert also genau so.

**Inhalt**

1. [Projekt anlegen](#1-projekt-anlegen)
2. [Konten und Anmeldung auf dem Server](#2-konten-und-anmeldung-auf-dem-server)
3. [Die Anmeldeseite](#3-die-anmeldeseite)
4. [Notizen speichern](#4-notizen-speichern)
5. [Die Notizen-Seite](#5-die-notizen-seite)
6. [Bilder hochladen](#6-bilder-hochladen)
7. [Tests](#7-tests)
8. [Bauen und starten](#8-bauen-und-starten)
9. [Wie es weitergeht](#9-wie-es-weitergeht)

---

## 1. Projekt anlegen

```sh
texo init notizbuch --backend texo --db sqlite
cd notizbuch
```

`--backend texo` nimmt den Server, der im Texo-Programm steckt. `--db sqlite` legt die Datenbank als Datei unter
`data/app.db` an; für den Anfang ist das ideal, später reicht ein Wechsel in `texo.json` auf PostgreSQL, MySQL oder
MongoDB ([Datenbank](datenbank.md)). Das Projekt hat diese Ordner:

```text
src/server/       Server: Tabellen, Services, Wächter (läuft nur auf dem Server)
src/pages/        Seiten: jede Komponente mit @Page wird eine Seite
src/components/   Bausteine für die Seiten
tests/            Tests für texo test
public/           Bilder, Schriften, favicon
```

Jeder Ordner ist ein Paket (`src/server` → `app.server`). Dateien im selben Ordner sehen sich ohne Import, alles aus
einem anderen Ordner holt ein `import` herein.

Lösche die Beispieldateien, sie werden nicht gebraucht:

<!-- löschen: src/server/Api.texo, src/pages/Startseite.texo, src/components/Karte.texo, tests/ZaehlerTest.texo -->

```sh
rm src/server/Api.texo src/pages/Startseite.texo src/components/Karte.texo tests/ZaehlerTest.texo
```

## 2. Konten und Anmeldung auf dem Server

Die erste Datei beschreibt, wer angemeldet ist, wo Konten gespeichert werden und wie man sich registriert und
anmeldet.

<!-- datei: src/server/Konto.texo -->
```texo
package app.server

import texo.server.*
import texo.db.*

/// Der angemeldete Benutzer. Er steht in der signierten Session-Cookie und ist auf dem Server
/// als this.request.user da. Nur speichern, was Wächter brauchen, keine Geheimnisse.
@Auth
data class Benutzer(id: Int, name: String)

/// Ein Konto in der Datenbank. Das Passwort steht nur als Hash darin.
@Table
data class Konto(@Id id: Int = 0, @Unique name: String, hash: String)

/// Wächter für alles, was nur Angemeldete sehen dürfen: sonst weiter zur Anmeldung.
@Server
fn angemeldet(req: Request): Access => req.user != null ? Access.allow() : Access.redirect("/login")

/// Wächter für die Anmeldeseite: wer schon angemeldet ist, landet auf der Startseite.
@Server
fn abgemeldet(req: Request): Access => req.user == null ? Access.allow() : Access.redirect("/")

@Api("/api/konto")
service KontoApi {
    @RateLimit(perMinute: 10)
    async fn registrieren(name: String, passwort: String): Void {
        let n = name.trim().lower()
        if (n.length < 3 || n.length > 30) throw HttpError(400, "Name: 3 bis 30 Zeichen")
        if (passwort.length < 8) throw HttpError(400, "Passwort: mindestens 8 Zeichen")
        if (await Konto.where(k => k.name == n).exists()) throw HttpError(409, "Der Name ist schon vergeben")
        let k = await Konto.insert(Konto(name: n, hash: await Password.hash(passwort)))
        this.request.signIn(Benutzer(k.id, k.name))
    }

    @RateLimit(perMinute: 10)
    async fn anmelden(name: String, passwort: String): Void {
        let k = await Konto.where(k => k.name == name.trim().lower()).first()
        if (k == null || !(await Password.verify(passwort, k.hash))) throw HttpError(401, "Name oder Passwort falsch")
        this.request.signIn(Benutzer(k.id, k.name))
    }

    fn ich(): Benutzer? => this.request.user

    fn abmelden(): Void => this.request.signOut()
}
```

Was hier passiert:

- **`@Auth data class Benutzer`** ist das, was nach der Anmeldung in der Session steht. Texo signiert die Session
  (Cookie) mit `TEXO_SECRET`; auf dem Server ist der Benutzer als `this.request.user` da, in Wächtern als `req.user`.
  Halte die Klasse klein: Id, Name, vielleicht eine Rolle.
- **`@Table data class Konto`** ist eine Tabelle. `@Id` vergibt die Datenbank, `@Unique` verhindert doppelte Namen.
  Fehlt die Tabelle, legt der Server sie beim Start an.
- **`Password.hash` und `Password.verify`** speichern das Passwort nur als Hash.
- **`this.request.signIn(…)`** meldet an, `signOut()` meldet ab.
- **Wächter** sind Funktionen mit `@Server`, die `Access.allow()`, `Access.deny(…)` oder `Access.redirect(…)`
  liefern. Mit `@Guard(angemeldet)` schützt du gleich Seiten und Services damit.
- **`@RateLimit(perMinute: 10)`** bremst das Durchprobieren von Passwörtern.
- **`HttpError(status, meldung)`** kommt im Browser als Fehler mit genau dieser Meldung an.

## 3. Die Anmeldeseite

<!-- datei: src/pages/Login.texo -->
```texo
package app.pages

import texo.ui.*
import texo.graphics.*
import app.server.*

@Page(title: "Anmelden", path: "login")
@Guard(abgemeldet)
component Login {
    private State<String> name = State("")
    private State<String> passwort = State("")
    private State<String> fehler = State("")

    async fn senden(neu: Boolean): Void {
        this.fehler.value = ""
        try {
            if (neu) {
                await KontoApi.registrieren(this.name.value, this.passwort.value)
            } else {
                await KontoApi.anmelden(this.name.value, this.passwort.value)
            }
            Window.navigate("/")
        } catch (e) {
            this.fehler.value = e.message
        }
    }

    fn build(): View {
        return Column([
            Card(
                Heading("Notizbuch", level: 1),
                Input(bind: this.name, placeholder: "Name"),
                Input(bind: this.passwort, placeholder: "Passwort (mindestens 8 Zeichen)", type: InputType.Password)
                    .onSubmit(() => this.senden(false)),
                Button("Anmelden").onClick(() => this.senden(false)),
                Button("Neu registrieren")
                    .onClick(() => this.senden(true))
                    .background(Color.Transparent)
                    .textColor(Color.Indigo600),
                If(this.fehler.value.isNotEmpty(), Text(this.fehler.value).textColor(Color.Rose600))
            )
                .spacing(12.px)
                .width(340.px)
                .padding(32.px)
        ])
            .minHeight(100.vh)
            .alignment(Alignment.center)
            .crossAlignment(CrossAlignment.center)
            .background(Color.Slate100)
    }
}
```

Der Browser ruft `KontoApi.registrieren(…)` wie eine normale Funktion auf. Texo macht daraus eine Anfrage an den
Server, mit Schutz vor gefälschten Anfragen (CSRF) und geprüften Typen. Der Wächter `abgemeldet` läuft auf dem
Server, bevor die Seite ausgeliefert wird: Wer schon angemeldet ist, landet gleich auf `/`.

<!-- prüfen -->

Starte den Entwicklungsserver und öffne <http://localhost:3000/login>:

```sh
texo dev
```

Registrieren klappt schon. Danach führt `Window.navigate("/")` auf die Startseite, die es noch nicht gibt. Sie folgt
in Schritt 5. `texo dev` lädt den Browser bei jeder Änderung neu, du kannst ihn offen lassen.

## 4. Notizen speichern

Die Tabelle bekommt eine eigene Datei, weil sie in Schritt 6 wächst:

<!-- datei: src/server/Notiz.texo -->
```texo
package app.server

import texo.db.*

/// Eine Notiz in der Tabelle "notiz". Die Regeln (@Required, @MaxLength) prüft der Server bei jedem
/// insert und update; ein Verstoß kommt im Browser als ValidationException an.
@Table
data class Notiz(
    @Id id: Int = 0,
    @Index besitzer: Int,
    @Required @MaxLength(100) titel: String,
    @MaxLength(5000) text: String = "",
    geaendert: DateTime = DateTime.now()
)
```

`@Required` und `@MaxLength` sind **Prüfregeln**. Sie gelten bei jedem `insert` und `update`, du musst sie im Service
nicht noch einmal prüfen. `@Index` macht die Suche nach dem Besitzer schnell.

Der Service enthält alles, was der Browser mit Notizen tun darf:

<!-- datei: src/server/Notizen.texo -->
```texo
package app.server

import texo.server.*
import texo.db.*

/// Alle Methoden nur für Angemeldete; jeder sieht und ändert nur seine eigenen Notizen.
@Api("/api/notizen")
@Guard(angemeldet)
service NotizenApi {
    async fn liste(): List<Notiz> =>
        await Notiz.where(n => n.besitzer == this.ich()).orderByDescending(n => n.geaendert).list()

    async fn neu(titel: String, text: String): Notiz =>
        await Notiz.insert(Notiz(besitzer: this.ich(), titel: titel.trim(), text: text))

    async fn aendern(id: Int, titel: String, text: String): Notiz {
        let n = await this.eigene(id)
        return await Notiz.update(n.copy(titel: titel.trim(), text: text, geaendert: DateTime.now()))
    }

    async fn loeschen(id: Int): Void {
        await Notiz.delete(await this.eigene(id))
    }

    /// Id des angemeldeten Benutzers (der Wächter hat schon geprüft, dass es ihn gibt)
    private fn ich(): Int => this.request.user!!.id

    /// Eine Notiz des angemeldeten Benutzers; fremde Notizen gibt es für ihn nicht.
    private async fn eigene(id: Int): Notiz {
        let n = await Notiz.find(id)
        if (n == null || n.besitzer != this.ich()) throw HttpError(404, "Notiz nicht gefunden")
        return n
    }
}
```

- **`@Guard(angemeldet)`** am Service gilt für jede Methode. Ohne Anmeldung antwortet der Server, bevor die Methode
  läuft.
- **Abfragen** sind typgeprüft: `Notiz.where(n => n.besitzer == this.ich())` wird zu SQL, ein Tippfehler im Feldnamen
  ist ein Compilerfehler. `find`, `insert`, `update` und `delete` erledigen den Rest.
- **`n.copy(titel: …)`** erzeugt eine geänderte Kopie; Datenklassen sind unveränderlich.
- **`eigene(id)`** ist die wichtigste Zeile für die Sicherheit: Eine Id kommt vom Browser und kann jede sein. Darum
  prüft jede Methode, ob die Notiz dem Angemeldeten gehört. Fremde Notizen behandelt sie wie nicht vorhandene.
- **`private`** Methoden sind von außen nicht aufrufbar, nur für den Service selbst.

## 5. Die Notizen-Seite

Zuerst eine Komponente für eine einzelne Notiz:

<!-- datei: src/components/NotizKarte.texo -->
```texo
package app.components

import texo.ui.*
import texo.graphics.*
import app.server.*

/// Eine Notiz als Karte. Was Bearbeiten und Löschen tun, entscheidet die Seite.
component NotizKarte(notiz: Notiz, bearbeiten: () => Void, loeschen: () => Void) {
    fn build(): View {
        let n = this.notiz
        return Card(
            Row(spacing: 8.px, crossAlignment: CrossAlignment.center, [
                Heading(n.titel, level: 3),
                Spacer(),
                Button("Bearbeiten", icon: "edit")
                    .onClick(() => this.bearbeiten())
                    .background(Color.Transparent)
                    .textColor(Color.Indigo600),
                Button("Löschen", icon: "trash")
                    .onClick(() => this.loeschen())
                    .background(Color.Transparent)
                    .textColor(Color.Rose600)
            ]),
            Text(n.text).whiteSpace(WhiteSpace.PreWrap),
            Text(n.geaendert.format("dd.MM.yyyy HH:mm")).fontSize(12.px).textColor(Color.Slate500)
        )
            .spacing(8.px)
            .padding(16.px)
    }
}
```

Die Karte bekommt die Notiz und zwei Funktionen als Parameter. Sie weiß nicht, was beim Löschen passiert, das
entscheidet die Seite:

<!-- datei: src/pages/Notizen.texo -->
```texo
package app.pages

import texo.ui.*
import texo.graphics.*
import app.components.*
import app.server.*

@Page(title: "Notizen", path: "/")
@Guard(angemeldet)
public component Notizen {
    private State<String> ich = State("")
    private State<List<Notiz>> notizen = State([])
    // Formular: neue Notiz (bearbeitet == 0) oder die Notiz mit dieser Id
    private State<Int> bearbeitet = State(0)
    private State<String> titel = State("")
    private State<String> text = State("")
    private State<String> fehler = State("")

    async fn onMount(): Void {
        this.ich.value = (await KontoApi.ich())?.name ?? ""
        await this.laden()
    }

    async fn laden(): Void {
        this.notizen.value = await NotizenApi.liste()
    }

    async fn speichern(): Void {
        this.fehler.value = ""
        try {
            if (this.bearbeitet.value == 0) {
                await NotizenApi.neu(this.titel.value, this.text.value)
            } else {
                await NotizenApi.aendern(this.bearbeitet.value, this.titel.value, this.text.value)
            }
            this.leeren()
            await this.laden()
        } catch (e: ValidationException) {
            // Regeln aus der Tabelle, z. B. "titel: ist erforderlich"
            this.fehler.value = e.errors.map(f => "${f.field}: ${f.message}").join(", ")
        } catch (e) {
            this.fehler.value = e.message
        }
    }

    fn bearbeiten(n: Notiz): Void {
        this.bearbeitet.value = n.id
        this.titel.value = n.titel
        this.text.value = n.text
    }

    fn leeren(): Void {
        this.bearbeitet.value = 0
        this.titel.value = ""
        this.text.value = ""
    }

    async fn loeschen(n: Notiz): Void {
        if (!Window.confirm("'${n.titel}' löschen?")) return
        await NotizenApi.loeschen(n.id)
        await this.laden()
    }

    async fn abmelden(): Void {
        await KontoApi.abmelden()
        Window.navigate("/login")
    }

    fn build(): View {
        let neu = this.bearbeitet.value == 0
        return Column(spacing: 16.px, [
            Row(spacing: 8.px, crossAlignment: CrossAlignment.center, [
                Heading("Notizen", level: 1),
                Spacer(),
                Text(this.ich.value).textColor(Color.Slate500),
                Button("Abmelden").onClick(() => this.abmelden())
            ]),
            Card(
                Input(bind: this.titel, placeholder: "Titel"),
                TextArea(bind: this.text, placeholder: "Text", rows: 4),
                Row(spacing: 8.px, [
                    Button(neu ? "Hinzufügen" : "Speichern", icon: neu ? "plus" : "check").onClick(() => this.speichern()),
                    If(!neu, Button("Abbrechen").onClick(() => this.leeren()))
                ]),
                If(this.fehler.value.isNotEmpty(), Text(this.fehler.value).textColor(Color.Rose600))
            )
                .spacing(8.px)
                .padding(16.px),
            ForEach(this.notizen.value, n => NotizKarte(
                notiz: n,
                bearbeiten: () => this.bearbeiten(n),
                loeschen: () => this.loeschen(n)
            ), key: n => n.id)
        ])
            .width(Size.Full)
            .maxWidth(640.px)
            .margin(horizontal: Size.Auto)
            .padding(32.px)
    }
}
```

- **`onMount`** läuft im Browser, sobald die Seite steht, und lädt die Notizen.
- **Ein Formular für beides**: `bearbeitet` ist `0` für eine neue Notiz, sonst die Id der Notiz, die gerade
  bearbeitet wird. Je nachdem ruft `speichern` `neu` oder `aendern` auf.
- **`catch (e: ValidationException)`** fängt Verstöße gegen die Prüfregeln der Tabelle. `e.errors` nennt Feld und
  Meldung, hier „titel: ist erforderlich“, wenn der Titel leer ist. Alle anderen Fehler (wie der `HttpError` aus
  `eigene`) landen im zweiten `catch`.
- **`ForEach(…, key: n => n.id)`** zeichnet die Liste. Der Schlüssel sorgt dafür, dass nach einer Änderung nur die
  betroffenen Karten neu entstehen.

<!-- prüfen -->

Im Browser kannst du jetzt registrieren, Notizen anlegen, bearbeiten und löschen. Melde dich mit einem zweiten Konto
an: Die Notizen des ersten bleiben unsichtbar. Die Daten liegen in `data/app.db`; ansehen kannst du sie mit:

```sh
texo db studio
```

## 6. Bilder hochladen

Eine Notiz bekommt ein Bild. In der Tabelle steht dafür nur der **Schlüssel** der Datei, nicht der Link, denn Links
laufen ab:

<!-- datei: src/server/Notiz.texo -->
```texo
package app.server

import texo.db.*

/// Eine Notiz in der Tabelle "notiz". Die Regeln (@Required, @MaxLength) prüft der Server bei jedem
/// insert und update; ein Verstoß kommt im Browser als ValidationException an.
@Table
data class Notiz(
    @Id id: Int = 0,
    @Index besitzer: Int,
    @Required @MaxLength(100) titel: String,
    @MaxLength(5000) text: String = "",
    geaendert: DateTime = DateTime.now(),
    // Schlüssel des Bildes in Files (nicht der Link: Links laufen ab)
    bild: String? = null
)
```

Die Tabelle gibt es in der Datenbank schon, nur ohne die neue Spalte. Eine **Migration** fügt sie hinzu:

```sh
texo db migrate bild
```

```text
✔ migrations/20261016195704_bild.sql (4 Anweisung(en))
✔ angewendet: 20261016195704_bild
```

Die Datei in `migrations/` enthält `ALTER TABLE "notiz" ADD COLUMN "bild" TEXT`. Sie gehört ins Repository: Der
gebaute Server wendet sie beim Start auch auf der Datenbank im Betrieb an. `texo db status` zeigt jederzeit, ob Code
und Datenbank zusammenpassen. Neue Tabellen brauchen keine Migration, nur Änderungen an bestehenden.

Der Service bekommt zwei Methoden, und `loeschen` räumt das Bild mit weg:

<!-- datei: src/server/Notizen.texo -->
```texo
package app.server

import texo.server.*
import texo.db.*

/// Alle Methoden nur für Angemeldete; jeder sieht und ändert nur seine eigenen Notizen.
@Api("/api/notizen")
@Guard(angemeldet)
service NotizenApi {
    async fn liste(): List<Notiz> =>
        await Notiz.where(n => n.besitzer == this.ich()).orderByDescending(n => n.geaendert).list()

    async fn neu(titel: String, text: String): Notiz =>
        await Notiz.insert(Notiz(besitzer: this.ich(), titel: titel.trim(), text: text))

    async fn aendern(id: Int, titel: String, text: String): Notiz {
        let n = await this.eigene(id)
        return await Notiz.update(n.copy(titel: titel.trim(), text: text, geaendert: DateTime.now()))
    }

    async fn loeschen(id: Int): Void {
        let n = await this.eigene(id)
        let alt = n.bild
        if (alt != null) await Files.delete(alt)
        await Notiz.delete(n)
    }

    /// Speichert ein Bild zur Notiz (höchstens 5 MB) und ersetzt ein altes.
    async fn bildHochladen(id: Int, datei: Upload): Void {
        let n = await this.eigene(id)
        let key = await Files.save(datei, "bilder", maxSize: 5000000, types: ["image/*"])
        let alt = n.bild
        if (alt != null) await Files.delete(alt)
        await Notiz.update(n.copy(bild: key))
    }

    /// Link zum Bild der Notiz; er gilt nur mit dieser Anmeldung und eine Stunde lang.
    async fn bildLink(id: Int): String? {
        let key = (await this.eigene(id)).bild
        return key != null ? Files.privateUrl(key, this.request) : null
    }

    /// Id des angemeldeten Benutzers (der Wächter hat schon geprüft, dass es ihn gibt)
    private fn ich(): Int => this.request.user!!.id

    /// Eine Notiz des angemeldeten Benutzers; fremde Notizen gibt es für ihn nicht.
    private async fn eigene(id: Int): Notiz {
        let n = await Notiz.find(id)
        if (n == null || n.besitzer != this.ich()) throw HttpError(404, "Notiz nicht gefunden")
        return n
    }
}
```

- **`Upload`** als Parameter genügt, damit der Browser die Datei mitschickt.
- **`Files.save`** prüft Größe und Typ. Bei `image/*` muss die Datei auch wirklich wie ein Bild anfangen: Eine
  `.png`, die eigentlich HTML ist, lehnt der Server ab. Gespeichert wird unter `data/files`, mit S3 in einem Bucket
  ([Dateien hochladen](backend.md#dateien-hochladen-upload-und-files)).
- **`Files.privateUrl`** gibt einen Link aus, der nur mit derselben Anmeldung funktioniert. Weitergegeben oder nach
  dem Abmelden antwortet der Server mit 404.

Die Karte zeigt das Bild und bekommt einen Dateiwähler:

<!-- datei: src/components/NotizKarte.texo -->
```texo
package app.components

import texo.ui.*
import texo.graphics.*
import app.server.*

/// Eine Notiz als Karte mit Bild. Was Bearbeiten und Löschen tun, entscheidet die Seite.
component NotizKarte(notiz: Notiz, bearbeiten: () => Void, loeschen: () => Void) {
    private State<Url?> bild = State(null)
    private State<Upload?> datei = State(null)
    private State<String> fehler = State("")

    async fn onMount(): Void {
        await this.bildLaden()
    }

    async fn bildLaden(): Void {
        let link = await NotizenApi.bildLink(this.notiz.id)
        this.bild.value = link != null ? Url.parse(link) : null
    }

    async fn hochladen(): Void {
        let f = this.datei.value
        if (f == null) return
        this.fehler.value = ""
        try {
            await NotizenApi.bildHochladen(this.notiz.id, f)
            this.datei.value = null
            await this.bildLaden()
        } catch (e) {
            this.fehler.value = e.message
        }
    }

    fn build(): View {
        let n = this.notiz
        return Card(
            Row(spacing: 8.px, crossAlignment: CrossAlignment.center, [
                Heading(n.titel, level: 3),
                Spacer(),
                Button("Bearbeiten", icon: "edit")
                    .onClick(() => this.bearbeiten())
                    .background(Color.Transparent)
                    .textColor(Color.Indigo600),
                Button("Löschen", icon: "trash")
                    .onClick(() => this.loeschen())
                    .background(Color.Transparent)
                    .textColor(Color.Rose600)
            ]),
            Text(n.text).whiteSpace(WhiteSpace.PreWrap),
            If(this.bild.value != null, Image(src: this.bild.value!!, alt: n.titel).maxWidth(Size.Full).radius(8.px)),
            Row(spacing: 8.px, crossAlignment: CrossAlignment.center, [
                FilePicker(bind: this.datei, accept: "image/*"),
                If(this.datei.value != null, Button("Hochladen", icon: "upload").onClick(() => this.hochladen()))
            ]),
            If(this.fehler.value.isNotEmpty(), Text(this.fehler.value).textColor(Color.Rose600)),
            Text(n.geaendert.format("dd.MM.yyyy HH:mm")).fontSize(12.px).textColor(Color.Slate500)
        )
            .spacing(8.px)
            .padding(16.px)
    }
}
```

`FilePicker(bind: this.datei)` legt die gewählte Datei in den Zustand, `NotizenApi.bildHochladen(…)` schickt sie.
Den Link prüft `Url.parse`, bevor er in `Image` landet. Die Seite selbst ändert sich nicht.

<!-- prüfen -->

## 7. Tests

`texo test` startet keinen Browser und keinen Server. Jeder Test bekommt eine leere Datenbank im Speicher, und
`TestClient` schickt Aufrufe auf dem echten Weg, mit Wächtern, Session, CSRF und `@RateLimit`:

<!-- datei: tests/NotizenTest.texo -->
```texo
package app.tests

import texo.test.*
import app.server.*

// Jeder Test bekommt eine leere Speicher-Datenbank. TestClient schickt Anfragen auf dem echten Weg
// (Wächter, CSRF, Session, @RateLimit), wie der Browser.

@Test("Registrieren, Notiz anlegen und ändern")
async fn ablauf(): Void {
    let ada = TestClient()
    await ada.call(() => KontoApi.registrieren("Ada", "geheim1234"))
    let n = await ada.call(() => NotizenApi.neu("Einkauf", "Milch"))
    await ada.call(() => NotizenApi.aendern(n.id, "Einkauf", "Milch, Brot"))
    let liste = await ada.call(() => NotizenApi.liste())
    expect(liste.size).toBe(1)
    expect(liste[0].text).toBe("Milch, Brot")
}

@Test("Ohne Titel meldet der Server die Regel aus der Tabelle")
async fn ohneTitel(): Void {
    let ada = TestClient(user: Benutzer(1, "ada"))
    try {
        await ada.call(() => NotizenApi.neu("  ", ""))
        fail("hätte scheitern müssen")
    } catch (e: ValidationException) {
        expect(e.errors[0].field).toBe("titel")
    }
}

@Test("Fremde Notizen bleiben unsichtbar und unveränderbar")
async fn fremd(): Void {
    let n = await Notiz.insert(Notiz(besitzer: 1, titel: "geheim"))
    let bob = TestClient(user: Benutzer(2, "bob"))
    expect((await bob.call(() => NotizenApi.liste())).size).toBe(0)
    try {
        await bob.call(() => NotizenApi.loeschen(n.id))
        fail("hätte scheitern müssen")
    } catch (e) {
        expect(e.message).toBe("Notiz nicht gefunden")
    }
}

@Test("Bild hochladen")
async fn bild(): Void {
    let ada = TestClient(user: Benutzer(1, "ada"))
    let n = await ada.call(() => NotizenApi.neu("Urlaub", ""))
    expect(await ada.call(() => NotizenApi.bildLink(n.id))).toBe(null)
    // eine kleine GIF-Datei: Files.save prüft, ob der Inhalt zur Endung passt
    let gif = Upload("GIF89a", name: "strand.gif", type: "image/gif")
    await ada.call(() => NotizenApi.bildHochladen(n.id, gif))
    expect(await ada.call(() => NotizenApi.bildLink(n.id))).toContain("strand.gif")
}

@Test("Ohne Anmeldung leitet die Startseite zur Anmeldung")
async fn gast(): Void {
    let seite = await TestClient().page("/")
    expect(seite.status).toBe(303)
    expect(seite.header("location")).toBe("/login")
}
```

<!-- testen -->

```sh
texo test
```

```text
tests/NotizenTest.texo
  ✔ Registrieren, Notiz anlegen und ändern (91 ms)
  ✔ Ohne Titel meldet der Server die Regel aus der Tabelle (1 ms)
  ✔ Fremde Notizen bleiben unsichtbar und unveränderbar (2 ms)
  ✔ Bild hochladen (4 ms)
  ✔ Ohne Anmeldung leitet die Startseite zur Anmeldung (0 ms)

✔ 5 Test(s) bestanden (182 ms)
```

`TestClient(user: Benutzer(2, "bob"))` ist gleich angemeldet, ohne Registrierung. Der Test „Fremde Notizen“ ist der
wichtigste: Er beweist, dass die Prüfung in `eigene` wirkt. Mehr zu Tests: [Testen](testen.md).

## 8. Bauen und starten

```sh
texo build
texo start dist
```

`texo build` übersetzt alles nach `dist/`: die Seiten nach `dist/public`, den Server nach `dist/server`, die
Migrationen nach `dist/migrations`. Der Browser-Code ist dabei verkleinert und verschleiert. `texo start dist`
startet den Server; auf einem Rechner ohne Texo-Programm genügt `texo-server-<system> dist/server/app.json`.

Für den Betrieb setzt du diese Umgebungsvariablen:

| Variable | |
|---|---|
| `TEXO_ENV=production` | Betriebsmodus: ohne `TEXO_SECRET` startet der Server dann nicht |
| `TEXO_SECRET` | Schlüssel für Sessions und Datei-Links, mindestens 32 Zeichen, z. B. aus `openssl rand -hex 32`. Ändert er sich, sind alle abgemeldet. |
| `PORT` | Port, Standard 3000 |
| `TLS_CERT`, `TLS_KEY` | für HTTPS ohne vorgeschalteten Proxy |
| `TEXO_DB_URL` | eine andere Datenbank als in `texo.json` |

Als Docker-Image: `texo build --docker`, dann `docker build -t notizbuch dist` ([Docker](docker.md)). Der Ordner
`/app/data` gehört in ein benanntes Volume, sonst sind Datenbank und Bilder beim nächsten Container weg.

## 9. Wie es weitergeht

- **Anmelden ohne Passwort**: [Passkeys](backend.md#passkeys) oder
  [GitHub, Google, Microsoft](backend.md#anmelden-mit-github-google-microsoft-oder-gitlab-oauth).
- **Passwort vergessen, E-Mail bestätigen**: [E-Mails und Tokens](backend.md#e-mails-verschicken-mail-und-tokens).
- **Daten schon beim Laden der Seite**: [`@Load`](backend.md#seiten-mit-daten-vom-server-load) statt `onMount`.
- **Formulare ohne JavaScript**: [`Form`](backend.md#formulare-form).
- **Verwaltung im Browser**: [`AdminConsole`](backend.md#betrieb-verwaltungskonsole-adminconsole).
- **Suche**: [`@Searchable`](datenbank.md) für Volltextsuche in den Notizen.
- **Fehlermeldungen verstehen**: [Fehlermeldungen](fehlermeldungen.md).

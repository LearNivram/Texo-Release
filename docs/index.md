---
layout: home
title: Texo
titleTemplate: Eine Sprache für die ganze Web-App

hero:
  name: Texo
  text: Eine Sprache für die ganze Web-App.
  tagline: Oberfläche, Design, Backend und Datenbank in einer statisch typisierten Sprache – ohne HTML, CSS und JavaScript.
  image:
    src: /logo.svg
    alt: Texo
  actions:
    - theme: brand
      text: Erste Schritte
      link: /erste-schritte
    - theme: alt
      text: Installieren
      link: /installation
    - theme: alt
      text: Sprachreferenz
      link: /sprachreferenz

features:
  - icon: 🧩
    title: Typisierter Objektbaum statt HTML
    details: Elemente sind Klassen, Modifier sind Methoden, Farben, Längen und Dauern eigene Typen. <code>.width(360)</code> statt <code>.width(360.px)</code> ist ein Compilerfehler, kein stilles Fehlverhalten im Browser.
    link: /ui-und-styling
    linkText: UI und Styling
  - icon: ⚡
    title: Kein virtuelles DOM
    details: Jede Seite wird beim Bauen vorgerendert, im Browser hängen nur winzige reaktive Bindungen. Ändert sich ein State, wird genau der betroffene Knoten aktualisiert.
    link: /reaktivitaet
    linkText: Reaktivität
  - icon: 🖥️
    title: Backend in derselben Sprache
    details: Ein service läuft auf dem Server – im eingebauten nativen Server oder auf Node.js, Bun oder Deno. Der Browser ruft ihn typsicher auf, ohne fetch und JSON-Code.
    link: /backend
    linkText: Backend und Sicherheit
  - icon: 🗄️
    title: Datenbank als Datenklasse
    details: Tabellen sind @Table data classes, Abfragen werden vom Compiler geprüft. SQLite, PostgreSQL, MySQL/MariaDB und MongoDB, mit Migrationen und Texo Studio.
    link: /datenbank
    linkText: Texo Data
  - icon: 🔐
    title: Sicher von Anfang an
    details: Anmeldung mit Passwort, Passkeys und OAuth, Routen-Wächter, CSRF-Schutz, signierte Sessions, Rate-Limits und Eingabevalidierung sind eingebaut.
    link: /backend#sicherheitsmodell
    linkText: Sicherheitsmodell
  - icon: 🇩🇪
    title: Fehlermeldungen, die helfen
    details: Auf Deutsch, mit Codeausschnitt und Korrekturvorschlag („Meintest du …?“) – auch für Namen, die du aus JavaScript, CSS oder React kennst.
    link: /fehlermeldungen
    linkText: Fehlermeldungen
---

<div class="home-code">

## So sieht Texo aus

```texo
Card(
    Text("Aufrufe").fontSize(13.px),
    Text(this.views.value.formatNumber()).fontSize(36.px).fontWeight(FontWeight.Heavy),
    Button("Aktualisieren").onClick(() => this.views.value += 100)
)
    .padding(24.px)
    .radius(20.px)
    .background(LinearGradient.diagonal(Color.Indigo600, Color.Pink500))
    .hover(c => c.shadow(Shadow.Xl))
```

Der Compiler macht daraus HTML5, atomares CSS3 und ES6-JavaScript. Jede Stil-Kombination steht genau einmal im
Stylesheet, und nur wirklich dynamische Werte kosten Laufzeit.

## Full-Stack in einer Sprache

```texo
import texo.server.*

@Table
data class Note(@Id id: Int = 0, @Required text: String, erledigt: Boolean = false)

@Server
fn angemeldet(req: Request): Access =>
    req.session.has("user") ? Access.allow() : Access.redirect("/login")

@Api("/api/notes")
@Guard(angemeldet)
service NotesApi {
    async fn offene(): List<Note> => await Note.where(n => !n.erledigt).orderBy(n => n.id).list()
    async fn neu(text: String): Note => await Note.insert(Note(text: text))
}
```

```texo
// im Browser – typsicher, ohne fetch und JSON-Code
this.notes.value = await NotesApi.offene()
```

Der Browser erhält davon nur einen Stub; Logik und Geheimnisse bleiben auf dem Server.

## In 60 Sekunden

::: code-group

```sh [Linux und macOS]
curl -fsSL https://github.com/LearNivram/Texo-Release/releases/latest/download/install.sh | sh
```

```powershell [Windows]
irm https://github.com/LearNivram/Texo-Release/releases/latest/download/install.ps1 | iex
```

```sh [npm]
npm install -g https://github.com/LearNivram/Texo-Release/releases/latest/download/texo-lang.tgz
```

:::

```sh
texo init meine-app        # fragt nach Beispiel, Backend und Datenbank
cd meine-app
texo dev                   # http://localhost:3000 mit Live-Reload
```

Weiter geht es mit den [ersten Schritten](./erste-schritte.md) oder gleich dem
[Tutorial](./tutorial.md), in dem du ein Notizbuch mit Konto, Datenbank und Bildern baust.

</div>

<!-- Übernommen aus LearNivram/Texo (docs/erste-schritte.md) mit scripts/docs-uebernehmen.mjs – bitte dort ändern. -->

# Erste Schritte mit Texo

Diese Anleitung führt dich vom leeren Projekt bis zur veröffentlichten Website – mit Zustand, eigenen Komponenten,
mehreren Seiten und optional einem Backend. Alle `texo`-Codeblöcke dieser Seite werden in den Tests kompiliert, sie
funktionieren also genau so.

**Inhalt**

1. [Installieren](#1-installieren)
2. [Projekt anlegen](#2-projekt-anlegen)
3. [Die erste Seite verstehen](#3-die-erste-seite-verstehen)
4. [Elemente und Layout](#4-elemente-und-layout)
5. [Gestalten mit Modifiern](#5-gestalten-mit-modifiern)
6. [Zustand und Reaktivität](#6-zustand-und-reaktivität)
7. [Listen, Bedingungen und Eingaben](#7-listen-bedingungen-und-eingaben)
8. [Eigene Komponenten](#8-eigene-komponenten)
9. [Mehrere Seiten und Router](#9-mehrere-seiten-und-router)
10. [Daten laden und Timer](#10-daten-laden-und-timer)
11. [Backend hinzufügen](#11-backend-hinzufügen)
12. [Bibliotheken einbinden](#12-bibliotheken-einbinden)
13. [Bauen und veröffentlichen](#13-bauen-und-veröffentlichen)
14. [Spickzettel](#14-spickzettel)

---

## 1. Installieren

Eine einzige Programmdatei, kein Node.js nötig. Linux und macOS:

```sh
curl -fsSL https://github.com/LearNivram/Texo-Release/releases/latest/download/install.sh | sh
```

Windows (PowerShell):

```powershell
irm https://github.com/LearNivram/Texo-Release/releases/latest/download/install.ps1 | iex
```

Danach in einem neuen Terminal `texo version`. Für npm, die Installation von Hand und bei
Problemen: [Installation](installation.md).

Für den Editor gibt es die VS-Code-Erweiterung `texo-vscode.vsix` (im Release): Syntaxfarben, Fehler beim Tippen,
Autovervollständigung, Hover mit der Beschreibung jeder Funktion und Formatierung (`texo fmt`).

## 2. Projekt anlegen

```sh
texo init mein-projekt      # fragt nach Beispiel und Backend – für den Anfang "Start" und "Kein Backend" wählen
cd mein-projekt
texo dev                    # http://localhost:3000, lädt bei jeder Änderung neu
```

`texo init` bietet sechs Beispiele an (direkt wählbar mit `--example`):

| Beispiel | Inhalt | braucht |
|---|---|---|
| `start` | eine Seite und eine Komponente; mit Backend ein Zähler auf dem Server, mit Datenbank in einer Tabelle | – |
| `website` | mehrere Seiten (Start, Über uns, Kontakt) mit gemeinsamem Layout und Navigation | – |
| `api` | **Nur Backend**: eine Notizen-API ohne Webseite, für Apps, Skripte und andere Server, mit Tests ([mehr](backend.md#nur-backend-ohne-webseite)) | Backend (Datenbank freiwillig) |
| `aufgaben` | Registrieren, Anmelden (`@Auth`), jeder sieht nur seine eigenen Aufgaben, mit Tests | Backend und Datenbank |
| `chat` | Beitreten mit Namen, Nachrichten in der Datenbank, mit Tests | Backend und Datenbank |
| `umfrage` | **Live-Umfrage** mit `Kv`: Stimmen als Zähler in Valkey, gemeinsamer `@Cache`, Ergebnisse live auf allen Seiten, `@RateLimit`, mit Tests ([mehr](backend.md#valkey-bei-texo-init)) | Backend (Valkey freiwillig) |

Bei jedem Projekt mit Backend fragt `texo init` außerdem, ob **Valkey** dazukommen soll (direkt: `--kv valkey`).
Dann stehen `TEXO_KV_URL` in `.env` und ein Valkey-Dienst in `docker-compose.yml`, und `Kv`, `@Cache`, `@RateLimit`
und Kanäle mit `topic:` laufen über Valkey, gemeinsam für alle Instanzen und andere Programme.

Jedes Projekt hat dieselbe Ordnerstruktur. So sieht man von Anfang an, wohin was gehört:

```
mein-projekt/
├── texo.json                  Einstellungen
├── .gitignore
├── public/                    Bilder, Schriften, favicon … (werden unverändert mitkopiert)
├── src/
│   ├── server/                Server-Code: Services, Wächter, Tabellen (nur mit Backend)
│   ├── pages/                 Seiten: jede Komponente mit @Page wird zu einer HTML-Seite
│   │   └── Startseite.texo
│   └── components/            wiederverwendbare Bausteine für die Seiten
│       └── Karte.texo
└── tests/                     Tests für texo test (nur mit Backend)
```

Jeder Ordner ist ein Paket: `src/pages/` ist `package app.pages`, `src/server/` ist `package app.server`. Dateien im
selben Ordner sehen sich ohne Import; eine Seite holt Bausteine und Server-Code mit `import app.components.*` und
`import app.server.*` herein.

Ohne Backend entspricht das Projekt der Vorlage [`examples/starter`](beispiele/starter.md).

**Vertippt oder im falschen Ordner angelegt?** `texo remove` löscht das Projekt wieder:

```sh
texo remove              # sucht Projekte im aktuellen Ordner; bei mehreren fragt es, welches
texo remove mein-projekt # ein bestimmtes Projekt
texo remove --dry-run    # nur anzeigen, was gelöscht würde
```

Vor dem Löschen zeigt der Befehl genau an, was entfernt wird, und fragt nach (`j` = löschen, alles andere bricht
ab). Gelöscht wird nur, was zum Projekt gehört (`texo.json`, `src/`, `dist/`, `public/` …); eigene Dateien im selben
Ordner bleiben erhalten. Wurde das Projekt mit `texo init` ohne Namen direkt im aktuellen Ordner angelegt, bleibt der
Ordner selbst stehen.

`texo.json`:

```json
{
  "src": "src",
  "out": "dist",
  "backend": "static",
  "protect": "obfuscate"
}
```

| Schlüssel | Bedeutung |
|---|---|
| `src` / `out` | Quellordner und Ausgabeordner |
| `backend` | `static` (nur HTML/CSS/JS), `texo` (nativer Server im `texo`-Programm, ohne Node.js), `node`, `bun` oder `deno` |
| `protect` | Code-Schutz beim Bauen: `obfuscate` (Standard), `minify`, `none` |
| `public` | Ordner für Bilder, Schriften usw. (Standard `public`) |

## 3. Die erste Seite verstehen

```texo
package app.pages

import texo.ui.*
import texo.graphics.*

@Page(title: "Mein Texo-Projekt", path: "/")
public component Startseite {
    private State<Int> klicks = State(0)

    fn build(): View {
        return Column(spacing: 16.px, crossAlignment: CrossAlignment.center, [
            Heading("Hallo Texo", level: 1),
            Text("Geklickt: ${this.klicks.value}"),
            Button("Klick mich").onClick(() => this.klicks.value += 1)
        ])
            .padding(48.px)
    }
}
```

- **`package app.pages`** – jede Datei gehört zu einem Paket, am besten benannt wie ihr Ordner (`src/pages/`).
  Pakete werden zu Ordnern in der Ausgabe. Alles im selben Paket sieht sich gegenseitig ohne Import.
- **`import texo.ui.*`** – Elemente und Modifier; `texo.graphics.*` – Farben, Längen, Schatten. `texo.core` (Zahlen,
  Texte, Listen, `State`) ist immer importiert.
- **`@Page(title: …, path: "/")`** – macht die Komponente zu einer HTML-Seite; `path: "/"` ist die Startseite
  (`index.html`).
- **`component`** – ein Baustein der Oberfläche. Er braucht genau eine Methode `fn build(): View`.
- **`State<Int>`** – ein reaktiver Wert. Wird `.value` geändert, aktualisiert Texo nur die Stellen, die ihn lesen
  (hier den Text) – ohne virtuelles DOM.
- **`"Geklickt: ${…}"`** – Text mit eingesetzten Werten.
- **`() => …`** – eine Lambda-Funktion, hier für den Klick.

Beim Bauen wird die Seite schon **vorgerendert** (fertiges HTML für Suchmaschinen und schnellen Seitenaufbau); im
Browser wird sie dann „zum Leben erweckt“.

## 4. Elemente und Layout

| Element | Wofür |
|---|---|
| `Text("…")`, `Heading("…", level: 2)`, `Paragraph("…")` | Text, Überschriften, Absätze |
| `Button("Speichern", icon: "check")` | Schaltfläche (71 eingebaute Icons) |
| `Icon("star")`, `Image("bild.png", alt: "…")` | Icon und Bild |
| `Input(bind: …)`, `TextArea`, `Checkbox`, `Toggle`, `Slider`, `Select` | Eingaben (siehe Abschnitt 7) |
| `Column([...])`, `Row([...])` | untereinander / nebeneinander (`spacing:`, `alignment:`, `crossAlignment:`) |
| `Grid(..., columns: 3)` | Raster, optional `minColumnWidth:` für automatische Spaltenzahl |
| `Card(...)`, `Box(...)`, `ScrollView(...)` | Karte mit Schatten, neutraler Behälter, scrollbarer Bereich |
| `Spacer()`, `Divider()` | Platz füllen, Trennlinie |
| `Link("Text", to: "/pfad")` | Link (intern ohne Neuladen) |

```texo
package app

import texo.ui.*
import texo.graphics.*

component Layout {
    fn build(): View {
        return Column(spacing: 24.px, [
            Row(spacing: 12.px, crossAlignment: CrossAlignment.center, [
                Icon("package", size: 28.px),
                Heading("Mein Shop", level: 2),
                Spacer(),
                Button("Anmelden", icon: "user")
            ]),
            Divider(),
            Grid(
                Card(Text("Produkt A")),
                Card(Text("Produkt B")),
                Card(Text("Produkt C")),
                columns: 3,
                spacing: 16.px
            )
        ])
    }
}
```

Alle Elemente mit allen Parametern: [API-Referenz → texo.ui](api-referenz.md#texo-ui).

## 5. Gestalten mit Modifiern

Modifier werden angehängt und lassen sich beliebig verketten. Konstante Werte werden beim Kompilieren zu kleinen
CSS-Klassen (`.tx-p-16 { padding: 16px }`) – zur Laufzeit wird kein CSS berechnet.

```texo
package app

import texo.ui.*
import texo.graphics.*

component Gestaltet {
    fn build(): View {
        return Button("Jetzt starten")
            .padding(vertical: 12.px, horizontal: 24.px)
            .background(LinearGradient.horizontal(Color.Indigo500, Color.Violet500))
            .textColor(Color.White)
            .fontWeight(FontWeight.SemiBold)
            .radius(12.px)
            .shadow(Shadow.Lg)
            .animate(200.ms)
            .hover(s => s.scale(1.05).shadow(Shadow.Xl))
            .pressed(s => s.scale(0.98))
            .dark(s => s.background(Color.Indigo400))
            .md(s => s.padding(vertical: 16.px, horizontal: 32.px))
    }
}
```

| Gruppe | Beispiele |
|---|---|
| Größe und Abstand | `.width(200.px)`, `.maxWidth(600.px)`, `.width(Size.Full)`, `.padding(16.px)`, `.margin(top: 8.px)`, `.grow()` |
| Farbe und Fläche | `.background(Color.Slate50)`, `.textColor(Color.hex("#334155"))`, `.opacity(0.8)`, `.radius(8.px)`, `.border()`, `.shadow(Shadow.Md)` |
| Schrift | `.fontSize(18.px)`, `.bold()`, `.fontWeight(FontWeight.Medium)`, `.textAlign(TextAlign.Center)`, `.fontFamily(Font.named("Inter"))` |
| Bewegung | `.animate(250.ms)`, `.scale(1.1)`, `.rotate(45.deg)`, `.blur(4.px)` |
| Zustände (Varianten) | `.hover(…)`, `.focus(…)`, `.pressed(…)`, `.dark(…)` |
| Bildschirmbreite | `.sm(…)` ab 640 px, `.md(…)` ab 768 px, `.lg(…)` ab 1024 px, `.xl(…)` ab 1280 px |

Einheiten: `16.px`, `1.5.rem`, `50.percent`, `100.vh`, `1.fr`, `300.ms`, `2.s`, `45.deg`. Farben: ganze Tailwind-Palette
(`Color.Indigo50` … `Color.Indigo950`), `Color.hex("#…")`, `Color.rgb(…)`, `.opacity(0.5)`, `.lighten(0.1)`.

**Für die ganze Seite** (Mauszeiger, Schrift, Hauptfarbe der Buttons …) gibt es globale Stile. Bilder und Schriften
dafür legst du in den Ordner `public/`:

```texo
package app

import texo.ui.*
import texo.graphics.*

@Global
val Design = GlobalStyle()
    .cursor(Cursor.image("cursor/pfeil.png", x: 2, y: 2))
    .pointerCursor(Cursor.Pointer)
    .primaryColor(Color.Emerald600)
    .fontFamily(Font.named("Inter"))
    .background(Color.Slate50)
    .dark(GlobalStyle().background(Color.Slate950).textColor(Color.Slate100))
```

Mehr: [UI und Styling](ui-und-styling.md), [Globale Stile](ui-und-styling.md#globale-stile-global) und
[CSS in Texo](css-in-texo.md) – dort steht für jede CSS-Möglichkeit die Texo-Schreibweise.

## 6. Zustand und Reaktivität

```texo
package app

import texo.ui.*
import texo.graphics.*

component Warenkorb {
    private State<Int> anzahl = State(1)
    private State<Float> preis = State(19.99)
    // abgeleiteter Wert – wird automatisch neu berechnet
    private Computed<Float> summe = Computed(() => this.anzahl.value * this.preis.value)

    fn build(): View {
        return Column(spacing: 12.px, [
            Row(spacing: 8.px, [
                Button("-").onClick(() => this.anzahl.value = (this.anzahl.value - 1).clamp(1, 99)),
                Text("${this.anzahl.value} Stück"),
                Button("+").onClick(() => this.anzahl.value += 1)
            ]),
            Text("Summe: ${this.summe.value.formatCurrency()}").bold()
        ])
    }
}
```

- `State(start)` – Wert lesen/schreiben über `.value`; `.update(x => x + 1)`; `State.persisted("schluessel", start)`
  speichert im Browser (überlebt Neuladen).
- `Computed(() => …)` – abgeleiteter Wert, nur lesbar.
- `var`-Felder in Komponenten und `data class`es sind ebenfalls reaktiv.
- Listen in einem `State` darfst du direkt ändern (`this.liste.value.add(x)`) – Texo merkt das.

Mehr: [Reaktivität](reaktivitaet.md).

## 7. Listen, Bedingungen und Eingaben

```texo
package app

import texo.ui.*
import texo.graphics.*

data class Aufgabe(id: Int, titel: String, var erledigt: Boolean = false)

@Page(title: "Aufgaben", path: "aufgaben")
component Aufgaben {
    private State<List<Aufgabe>> liste = State([Aufgabe(1, "Texo lernen")])
    private State<String> entwurf = State("")
    private var naechsteId = 2

    fn hinzufuegen(): Void {
        if (this.entwurf.value.isBlank()) return
        this.liste.value.add(Aufgabe(this.naechsteId, this.entwurf.value.trim()))
        this.naechsteId += 1
        this.entwurf.value = ""
    }

    fn build(): View {
        return Column(spacing: 12.px, [
            Row(spacing: 8.px, [
                Input(bind: this.entwurf, placeholder: "Neue Aufgabe …")
                    .onSubmit(() => this.hinzufuegen())
                    .grow(),
                Button("Hinzufügen").onClick(() => this.hinzufuegen())
            ]),
            If(this.liste.value.isEmpty(), Text("Nichts zu tun 🎉")),
            ForEach(this.liste.value, a => Row(spacing: 8.px, [
                Checkbox(bind: State(a.erledigt)).onChange(v => a.erledigt = v),
                Text(a.titel).strikethrough(a.erledigt)
            ]), key: a => a.id),
            Text("${this.liste.value.count(a => !a.erledigt)} offen")
                .textColor(Color.Slate500)
        ])
            .padding(24.px)
    }
}
```

- `ForEach(liste, element => View, key: element => id)` – rendert Listen; mit `key` werden DOM-Knoten beim Umsortieren
  wiederverwendet.
- `If(bedingung, dann, sonst)` oder einfach `bedingung ? A : B` im Code.
- Eingaben binden an einen `State`: `Input(bind:)` (Text), `Checkbox(bind:)`/`Toggle(bind:)` (Boolean),
  `Slider(bind:)` (Float), `Select(optionen, bind:)` (String).
- Ereignisse: `.onClick`, `.onChange`, `.onInput`, `.onSubmit` (Enter), `.onHover`, `.onKeyDown` …

## 8. Eigene Komponenten

Eigenschaften stehen in Klammern hinter dem Namen – mit Typ, optional mit Standardwert. Ein `...kinder: View`-Parameter
nimmt beliebig viele Views auf, eine Funktion als Parameter meldet Ereignisse nach oben.

```texo
package app

import texo.ui.*
import texo.graphics.*

component Hinweis(titel: String, farbe: Color = Color.Indigo500, onSchliessen: (() => Void)? = null, ...inhalt: View) {
    fn build(): View {
        return Row(spacing: 12.px, [
            Column(spacing: 4.px, [
                Text(this.titel).bold().textColor(this.farbe),
                Column(this.inhalt)
            ]).grow(),
            Button.plain("✕").onClick(() => {
                let schliessen = this.onSchliessen
                if (schliessen != null) schliessen()
            })
        ])
            .padding(16.px)
            .radius(12.px)
            .background(this.farbe.opacity(0.08))
    }
}

component Benutzung {
    private State<Boolean> sichtbar = State(true)

    fn build(): View {
        return If(this.sichtbar.value,
            Hinweis("Gespeichert", farbe: Color.Emerald600, onSchliessen: () => this.sichtbar.value = false,
                Text("Deine Änderungen sind sicher."))
        )
    }
}
```

- Eigenschaften sind unveränderlich; für Werte, die sich ändern, übergib einen `State<T>`.
- `onMount()` läuft nach dem ersten Anzeigen im Browser (gut zum Laden von Daten), `onDestroy()` beim Entfernen.
- Modifier am Aufruf (`Hinweis(…).margin(8.px)`) gelten für das äußerste Element der Komponente.

**Inhalt in eine fertig gestaltete Komponente geben:** Setze `ChildPlaceholder()` in `build()`. Dort erscheint, was der
Aufrufer mit `.content(…)` übergibt; benannte Platzhalter füllt er mit `.slot("name", …)`:

```texo
package app

import texo.ui.*
import texo.graphics.*

component RundKnopf {
    fn build(): View => Button.plain()
        .content(Row(spacing: 6.px, [ChildPlaceholder("icon"), ChildPlaceholder(fallback: Text("OK"))]))
        .padding(vertical: 8.px, horizontal: 16.px)
        .pill()
        .background(Color.Indigo600)
        .textColor(Color.White)
}

component Leiste {
    fn build(): View => Row(spacing: 8.px, [
        RundKnopf().slot("icon", Icon("check", size: 16.px)).content(Text("Speichern")),
        RundKnopf()
    ])
}
```

## 9. Mehrere Seiten und Router

**Echte Seiten:** jede Komponente mit `@Page` wird zu einer eigenen HTML-Datei.

```texo
package app

import texo.ui.*
import texo.graphics.*

@Page(title: "Über uns", path: "ueber-uns")
component UeberUns {
    fn build(): View {
        return Column(spacing: 12.px, [
            Heading("Über uns", level: 1),
            Link("Zur Startseite", to: "/")
        ])
    }
}
```

**Router innerhalb einer Seite** (Single-Page-App, Adressen wie `index.html#/einstellungen`):

```texo
package app

import texo.ui.*
import texo.graphics.*

component Bereiche {
    fn build(): View {
        return Column(spacing: 16.px, [
            Row(spacing: 12.px, [
                Link("Start", to: "/"),
                Link("Profil 7", to: "/profil/7"),
                Link("Einstellungen", to: "/einstellungen")
            ]),
            Router(
                Route("/", _ => Text("Willkommen")),
                Route("/profil/:id", p => Text("Profil Nr. ${p.get("id")}")),
                Route("/einstellungen", _ => Text("Einstellungen")),
                fallback: Text("Seite nicht gefunden")
            )
        ])
    }
}
```

Navigieren aus Code: `Navigator.go("/profil/7")`, `Navigator.back()`, aktueller Pfad: `Navigator.path` (reaktiv).
Seiten schützen (Anmeldung, Rollen): [Backend → Routen-Wächter](backend.md#routen-wächter-guard).

## 10. Daten laden und Timer

```texo
package app

import texo.ui.*
import texo.graphics.*

data class Witz(setup: String, punchline: String)

component Witze {
    private State<Witz?> witz = State(null)
    private State<String> fehler = State("")
    private State<Int> sekunden = State(0)

    async fn onMount(): Void {
        Timer.every(1.s, () => this.sekunden.value += 1)
        await this.laden()
    }

    async fn laden(): Void {
        try {
            this.witz.value = await Http.getJson<Witz>("https://official-joke-api.appspot.com/random_joke")
        } catch (e) {
            this.fehler.value = "Laden fehlgeschlagen: ${e.message}"
        }
    }

    fn build(): View {
        let w = this.witz.value
        return Column(spacing: 8.px, [
            w == null ? Spinner() : Text("${w.setup} – ${w.punchline}"),
            If(this.fehler.value.isNotEmpty(), Text(this.fehler.value).textColor(Color.Rose600)),
            Text("Seit ${this.sekunden.value} s auf der Seite").fontSize(12.px),
            Button("Noch einer").onClick(() => this.laden())
        ])
    }
}
```

- `async fn` + `await` für alles, was dauert. `Http.get/getJson/postJson/putJson/delete`.
- `Timer.every(dauer, …)`, `Timer.after(dauer, …)`, `await Timer.delay(500.ms)`.
- `Storage.get/set/getJson/setJson` für den Browser-Speicher, `Clipboard`, `Window`, `DateTime`, `Random`, `Math`.
- Ereignisse des ganzen Fensters: `Window.onMessage<T>(…)`, `Window.onKeyDown(…)`, `onResize`, `onScroll`,
  `onVisibilityChange`, `onOnline/onOffline`, `onBeforeUnload`. Sie enden mit der Komponente. `Window.width`,
  `Window.online` und `Window.visible` sind reaktiv.

## 11. Backend hinzufügen

Mit einem Backend schreibst du Server-Code in derselben Sprache. In `texo.json` `"backend": "texo"` setzen (der
Server im Texo-Programm, ohne weitere Software; `node`, `bun` und `deno` gehen ebenso) – oder gleich
`texo init app --backend texo`. Ein vollständiges Beispiel mit Datenbank, Registrieren und Anmelden legt
`texo init app --example aufgaben` an. Schritt für Schritt aufgebaut, mit Bearbeiten, Löschen, Bild-Uploads, Tests und
Betrieb, zeigt es das [Tutorial](tutorial.md).

```texo
package app

import texo.ui.*
import texo.graphics.*
import texo.server.*

data class Nachricht(text: String, von: String)

/// Läuft nur auf dem Server – der Browser bekommt typisierte Aufrufe.
@Api("/api/gaestebuch")
service Gaestebuch {
    private var eintraege: List<Nachricht> = []

    @RateLimit(perMinute: 10)
    fn schreiben(text: String, von: String): Nachricht {
        if (text.isBlank() || text.length > 200) throw HttpError(400, "Text: 1–200 Zeichen")
        let n = Nachricht(text.trim(), von.trim())
        this.eintraege.add(n)
        return n
    }

    fn alle(): List<Nachricht> => this.eintraege
}

@Page(title: "Gästebuch", path: "gaestebuch")
component GaestebuchSeite {
    private State<List<Nachricht>> liste = State([])
    private State<String> text = State("")

    async fn onMount(): Void {
        this.liste.value = await Gaestebuch.alle()
    }

    async fn senden(): Void {
        await Gaestebuch.schreiben(this.text.value, "Gast")
        this.text.value = ""
        this.liste.value = await Gaestebuch.alle()
    }

    fn build(): View {
        return Column(spacing: 8.px, [
            Input(bind: this.text, placeholder: "Dein Eintrag").onSubmit(() => this.senden()),
            ForEach(this.liste.value, n => Text("${n.von}: ${n.text}"))
        ])
    }
}
```

Texo kümmert sich automatisch um Typprüfung aller Eingaben, CSRF-Schutz, signierte Sessions und Sicherheits-Header.
Anmeldung, `@Guard`, Sessions, Passwörter: [Backend & Sicherheit](backend.md). Eine ganze Anwendung mit Konten,
Datenbank und Uploads: [Tutorial](tutorial.md).

## 12. Bibliotheken einbinden

Fertige Komponenten bekommst du als **vorkompiliertes Paket** (`.texolib`). Darin stehen nur die Schnittstelle und
verschleierter Code, kein Quelltext. Das Projekt kompiliert die Bibliothek nicht neu und liefert nur die Teile aus, die
es benutzt.

```sh
texo lib add ../ui_kit/ui_kit-0.1.0.texolib    # oder eine https://-Adresse
texo lib list                                  # was ist eingebunden?
```

Danach reicht ein Import:

```texo
// src/pages/Startseite.texo
import ui_kit.*

// … Hinweis(titel: "Hallo", text: "Aus der Bibliothek")
```

Eigene Bibliotheken legst du mit `texo init ui_kit --library` an und packst sie mit `texo lib pack`.
Mehr dazu in [Bibliotheken](bibliotheken.md).

## 13. Bauen und veröffentlichen

```sh
texo build          # → dist/
texo serve dist     # ohne Backend: lokal ansehen
texo start          # Backend texo: Server starten (PORT, TEXO_SECRET, TLS_CERT/TLS_KEY für HTTPS);
                    # Node.js/Bun/Deno: cd dist && npm start
```

- **Ohne Backend** ist `dist/` eine fertige statische Website – hochladen auf GitHub Pages, Netlify, Cloudflare Pages,
  nginx o. ä.
- **Mit Backend** enthält `dist/` die Ordner `public/` (Browser) und `server/` sowie eine `package.json`
  (`npm start`). Für Produktion `TEXO_SECRET` setzen.
- **Als Docker-Image:** `texo build --docker` schreibt zusätzlich ein `Dockerfile`; dann
  `docker build -t meine-app dist && docker run -p 3000:3000 -e TEXO_SECRET=… meine-app` ([Docker](docker.md)).
- **Mit Datenbank & Co. im Container:** `texo container` fragt nach Docker oder Podman, schreibt eine fertige
  `compose.yaml` (App, Datenbank, Valkey, Mailpit) und startet alles auf Wunsch gleich ([texo container](docker.md#texo-container)).
- `texo build` liefert den Browser-Code **minifiziert und verschleiert** aus ([Details](compiler.md#code-schutz-minifizierung-und-verschleierung));
  `texo build --no-protect` für lesbaren Code.

### Code formatieren

```sh
texo fmt            # alle .texo-Dateien des Projekts (src/ und tests/) einheitlich formatieren
texo fmt src/pages/Startseite.texo
texo fmt --check    # nur prüfen, z. B. in CI: listet abweichende Dateien und endet mit Status 1
```

`texo fmt` rückt mit 4 Leerzeichen je Ebene ein, setzt Leerzeichen einheitlich (`a + b`, `x: Int`, `f(a, b)`,
`{ a }`, `List<Int>`, `0..<n`) und fasst mehrere Leerzeilen zu einer zusammen. Zeilenumbrüche, Kommentare und
Zeichenketten bleiben, wie sie sind – Kettenaufrufe (`.padding(…)`) stehen eine Ebene tiefer als ihr Anfang. Dateien
mit Syntaxfehlern werden nicht angefasst. In VS Code formatiert *Dokument formatieren* (<kbd>Umschalt</kbd>+<kbd>Alt</kbd>+<kbd>F</kbd>,
auch beim Speichern mit `"editor.formatOnSave": true`), in JetBrains-IDEs *Code → Reformat Code* dasselbe über den
Sprachserver.

## 14. Spickzettel

```
package app                          Paket der Datei
import texo.ui.*                     Elemente und Modifier
import texo.graphics.*               Farben, Längen, Schatten …

@Page(title: "…", path: "…")         Komponente → HTML-Seite
component Name(prop: Typ = Wert)     UI-Baustein mit Eigenschaften
  ChildPlaceholder("icon")           Stelle für Inhalt des Aufrufers: Name().slot("icon", …).content(…)
  @Command fn x(…): Void             von überall aufrufbar: Name.x(…), gezielt: Name().id("a") … Name.at("a").x(…)
  private State<Int> x = State(0)    reaktiver Zustand (x.value)
  Computed(() => …)                  abgeleiteter Wert
  fn onMount(): Void                 nach dem Anzeigen (async möglich)
  fn build(): View                   Oberfläche

let a = 1        var b = 2           Konstante / Variable
const C = 3                          Kompilierzeit-Konstante
fn f(a: Int, b: Int = 2): Int => a + b
x => x * 2       () => tu()          Lambdas
"Hallo ${name}"                      Text mit Werten
a ?? b   a?.b   a!!                  null-Behandlung
if / else  for (x in liste)  while   Kontrollfluss
match wert { A => …, else => … }     Fallunterscheidung
data class P(x: Int, var y: Int)     Datenklasse (var = reaktiv)
enum Farbe { Rot, Gruen }            Aufzählung
object Konfig { … }                  Singleton
interface Form { fn flaeche(): Float }
service Api { … }                    Server-Code (mit Backend)

Column/Row(spacing:, [ … ])          Layout
Text, Heading, Button, Icon, Image   Elemente
Input(bind:), Checkbox(bind:)        Eingaben
ForEach(liste, x => View, key:)      Listen
If(bed, dann, sonst)                 Bedingung
Router(Route("/p", _ => View))       Router
.padding .background .hover .md      Modifier
@Global val D = GlobalStyle()…       Stile für die ganze Seite
public/bild.png → Image("bild.png")  Dateien
texo lib add paket.texolib           Bibliothek einbinden (import name.*)
tr("schluessel", "Text")             übersetzbarer Text (Translations, I18n.locale)
@Test fn … { expect(x).toBe(y) }     Test in tests/, ausführen mit texo test
texo fmt                             Quelltext formatieren (--check: nur prüfen)
texo responsive                      Seiten fürs Handy prüfen (--write: umschreiben)
```

**Weiterlesen:** [API-Referenz (alle Funktionen)](api-referenz.md) · [Sprachreferenz](sprachreferenz.md) ·
[UI und Styling](ui-und-styling.md) · [Reaktivität](reaktivitaet.md) · [Backend](backend.md) ·
[Bibliotheken](bibliotheken.md) · [Testen](testen.md) · [Übersetzungen](uebersetzungen.md) · [Datenbanken](datenbank.md) · [npm-Pakete](npm.md) · [Compiler und CLI](compiler.md) · [Fehlermeldungen](fehlermeldungen.md)

<!-- Übernommen aus LearNivram/Texo (docs/ui-und-styling.md) mit scripts/docs-uebernehmen.mjs – bitte dort ändern. -->

# UI und Styling

> **Alle CSS-Möglichkeiten auf einen Blick:** [CSS in Texo](css-in-texo.md) ordnet jeder CSS-Eigenschaft, jedem Selektor
> und jeder At-Regel die Texo-Schreibweise zu.

In Texo schreibst du **weder HTML noch CSS**. Oberflächen sind ein typisierter Objektbaum aus Elementen
(`Card`, `Stack`, `Text`, …), die über verkettete **Modifier** (`.padding(24.px)`, `.background(…)`) gestaltet werden.
Der Compiler übersetzt den Baum in HTML5-Elemente, atomares CSS3 und ES6-Code. Dieses Dokument beschreibt alle Elemente und
Modifier sowie das erzeugte HTML/CSS. Alle Beispiele werden mit dem Compiler geprüft.

**Inhalt**

1. [Grundprinzip](#grundprinzip)
2. [Elemente und erzeugtes HTML](#elemente-und-erzeugtes-html)
3. [Einheiten](#einheiten)
4. [Modifier und erzeugtes CSS](#modifier-und-erzeugtes-css)
5. [Varianten (hover, dark, responsive …)](#varianten)
6. [Ereignisse](#ereignisse)
7. [Attribute und Barrierefreiheit](#attribute-und-barrierefreiheit)
8. [Statische und dynamische Stile](#statische-und-dynamische-stile)
9. [Farben](#farben)
10. [Verläufe, Schatten, Transformationen, Easing, Schriften](#verläufe-schatten-transformationen-easing-schriften)
11. [Icons](#icons)
12. [Mauszeiger (Cursor)](#mauszeiger-cursor)
13. [Globale Stile (@Global)](#globale-stile-global)
14. [Bilder, Schriften und andere Dateien (public/)](#bilder-schriften-und-andere-dateien-public)
15. [Enums der UI-Bibliothek](#enums-der-ui-bibliothek)

---

## Grundprinzip

```texo
component Karte {
    fn build(): View {
        return Card(
            Heading("Titel", level: 2),
            Text("Beschreibung").textColor(Color.Slate500)
        )
            .width(360.px)
            .padding(24.px)
            .radius(20.px)
            .shadow(Shadow.Lg)
    }
}
```

- Jedes Element ist ein `View`. Ein Modifier gibt immer den **gleichen Typ** zurück, die Kette bleibt also typsicher
  (`Text("x").spacing(4.px)` ist ein Fehler, weil nur `Container` `spacing` kennt).
- Einheiten sind Pflicht: `width(360)` wird abgelehnt (`Gib eine Einheit an, z. B. 360.px`), Farben sind `Color`-Werte, nie Strings.
- Kinder von Containern werden als Argumente (variadisch), als Liste (`Column([…])`) oder mit `.content(…)` übergeben.
- Der Ausdruck in `return …` bleibt **ein** Ausdruck: Modifier werden mit `.` am Zeilenanfang fortgesetzt.

## Elemente und erzeugtes HTML

Die HTML-Ausgabe stammt aus dem tatsächlichen Compiler (leicht gekürzt, nur die relevanten Elemente).
Eine `class="tx-…"`-Liste besteht aus der Basisklasse des Elements (siehe [Wie der Compiler arbeitet](compiler.md#css-schichten)) und den atomaren
Klassen der Modifier.

### Text und Inhalt

| Element | Parameter | Erzeugtes HTML |
|---|---|---|
| `Text(content: Any)` | beliebiger Wert, wird mit `toString()` ausgegeben | `<span class="tx-text">Hallo</span>` |
| `Heading(content, level: Int = 1)` | `level` 1–6, muss konstant sein | `<h2 class="tx-heading tx-h2">Titel</h2>` |
| `Paragraph(content)` | | `<p class="tx-p">Fließtext</p>` |
| `Icon(name, size = 20.px, strokeWidth = 2.0)` | Name aus der [Icon-Liste](#icons) | `<svg class="tx-icon" width="24px" height="24px" viewBox="0 0 24 24" fill="none" stroke="currentColor" …>…</svg>` |
| `Image(src, alt = "")` | `.fit(ImageFit)` | `<img class="tx-img" src="/logo.png" alt="Logo" loading="lazy" decoding="async">` |
| `Video(src, poster = null, controls = true)` | `.autoplay()`, `.muted()`, `.loop()`, `.preload(…)`, `.fit(ImageFit)`, `.onPlay`, `.onPause`, `.onEnded`, `.onTimeUpdate` | `<video class="tx-video" src="/film.mp4" controls preload="metadata" playsinline>` |
| `Video.live(name, poster = null, controls = true)` | wie `Video` | Livestream aus OBS, siehe [Livestreams mit OBS](backend.md#livestreams-mit-obs) |
| `Audio(src, controls = true)` | wie `Video`, ohne `.fit` | `<audio class="tx-audio" src="/folge.mp3" controls preload="metadata">` |
| `Link(label = "", to = "#", external = false)` | Pfade mit `/` navigieren im Router (`#/pfad`), außer sie gehören zu einer Seite (auch `/notiz/:id`); `external: true` öffnet neu; `to` ist eine geprüfte `Url` (siehe unten) | `<a class="tx-link" href="#/" aria-current="page">Start</a>` · extern: `<a … href="https://…" target="_blank" rel="noopener noreferrer">` |
| `Empty()` | rendert nichts | `<!---->` |

`Text`, `Heading` und `Paragraph` rendern konstante Inhalte direkt ins HTML. Enthält der Inhalt Zustand
(`Text("n = ${this.n.value}")`), entsteht eine Bindung, die nur den Textknoten aktualisiert.

### Layout-Container

| Element | Parameter | Erzeugtes HTML |
|---|---|---|
| `Stack.vertical(…children, spacing, alignment, crossAlignment)` / `Column(…)` | Spalte (Flexbox) | `<div class="tx-vbox tx-gap-8">…</div>` |
| `Stack.horizontal(…)` / `Row(…)` | Zeile (Flexbox, `align-items: center`) | `<div class="tx-hbox tx-gap-8">…</div>` |
| `Stack.layered(…children, alignment)` | übereinandergelegt (Grid-Stapel) | `<div class="tx-zstack">…</div>` |
| `Box(…children)` | neutraler Container, `position: relative` | `<div class="tx-box">…</div>` |
| `Card(…children)` | Fläche mit Hintergrund, Rundung, Schatten | `<div class="tx-card">…</div>` |
| `Grid(…children, columns = 2, spacing, minColumnWidth)` | CSS-Grid | `<div class="tx-grid tx-gtc-… tx-gap-12">…</div>` |
| `ScrollView(…children, axis = Axis.Vertical)` | scrollbarer Bereich | `<div class="tx-scroll">…</div>` (horizontal: `+ tx-ovx-auto tx-ovy-hidden`) |
| `Spacer(size?)` | flexibler Leerraum, mit `size` fest | `<div class="tx-spacer"></div>` |
| `Lazy(() => Komponente(…), placeholder?, whenVisible?)` | lädt eine Komponente aus einer anderen Datei erst bei Bedarf nach, [Details](reaktivitaet.md#nachladen-mit-lazy) | Platzhalter, später die Komponente |
| `ErrorBoundary(inhalt, fallback?)` | fängt Fehler des Inhalts ab und zeigt `fallback(e, retry)`, [Details](reaktivitaet.md#fehlergrenzen-mit-errorboundary) | der Inhalt, nach einem Fehler der `fallback` |
| `ChildPlaceholder(name?, fallback?)` | nur in Komponenten: Stelle für Inhalt des Aufrufers (`.content(…)` / `.slot(name, …)`), [Details](sprachreferenz.md#inhalt-übergeben-childplaceholder) | kein eigenes Element – der Inhalt landet im umgebenden Element |
| `Divider(color?, thickness?)` | Trennlinie | `<hr class="tx-divider">` |
| `Shape.circle(size)` / `Shape.rect(width, height)` / `Shape.capsule(width, height)` | Formen, `.fill(paint)`, `.stroke(width, color)` | `<div class="tx-shape tx-w-12 tx-h-12 tx-r-50p"></div>` |

`Column`, `Row` und `Stack.*` nehmen Kinder variadisch **oder** als Liste: `Column(Text("a"), Text("b"))` und
`Column([Text("a"), Text("b")])` sind gleichwertig; benannte Parameter wie `spacing:` stehen davor.

```texo
component Layouts {
    fn build(): View {
        return Column(spacing: 16.px, [
            Row(spacing: 8.px, alignment: Alignment.spaceBetween, [
                Text("Links"),
                Spacer(),
                Text("Rechts")
            ]),
            Grid(Text("A"), Text("B"), Text("C"), columns: 3, spacing: 12.px),
            Grid(Card(Text("1")), Card(Text("2")), minColumnWidth: 200.px),
            Stack.layered(
                Shape.rect(width: 120.px, height: 80.px).fill(Color.Indigo100),
                Text("Overlay").textColor(Color.Indigo700),
                alignment: Alignment.center
            ),
            ScrollView(Text("Lang …"), axis: Axis.Horizontal).maxWidth(200.px),
            Divider(color: Color.Slate200, thickness: 2.px)
        ])
    }
}
```

### Eingabe und Steuerelemente

| Element | Parameter | Erzeugtes HTML |
|---|---|---|
| `Button(label = "", icon: String? = null, submit = false)` | Container; `.onClick`, `.disabled`; `submit: true` sendet ein `Form` ab | `<button class="tx-btn" type="button">Speichern</button>`; mit Icon: `<button …><svg class="tx-icon" …/><span class="tx-text">Speichern</span></button>` |
| `Button.plain(label = "")` | Button ohne Standardstil | `<button class="tx-btn tx-btn-plain" type="button">Mehr</button>` |
| `Input(bind: State<String>? , placeholder, type: InputType = Text, name = "")` | Zwei-Wege-Bindung (auch bei `InputType.Number` steht der Text im State, leer = `""`; Zahl mit `toInt()`/`toFloat()`); `.onInput`, `.onChange`, `.onSubmit` (Enter); `name` macht es zum Feld eines `Form` | `<input class="tx-input" type="text" placeholder="Name">` |
| `TextArea(bind, placeholder, rows = 4, name = "")` | `name`: Feld eines `Form` | `<textarea class="tx-input tx-textarea" rows="3" placeholder="Text"></textarea>` |
| `Checkbox(bind: State<Boolean>? = null, label = "", name = "")` | `.onChange(Boolean)`; `name`: Feld eines `Form` (angehakt = `true`) | `<label class="tx-check"><input type="checkbox"><span class="tx-text">Zustimmen</span></label>` |
| `FilePicker(bind: State<Upload?>? = null, accept = "", name = "")` | Dateiauswahl; die gewählte Datei als `Upload` (siehe [Dateien hochladen](backend.md#dateien-hochladen-upload-und-files)); `name`: Feld eines `Form` | `<input class="tx-input" type="file" accept="image/*">` |
| `Toggle(bind: State<Boolean>, label = "")` | Schalter | `<label class="tx-check"><input class="tx-switch" type="checkbox" role="switch">…</label>` |
| `Slider(bind: State<Float>, min = 0.0, max = 100.0, step = 1.0)` | `.onChange(Float)` | `<input class="tx-slider" type="range" min="0" max="10" step="1" value="1">` |
| `Select(options: List<String>, bind?, name = "")` | `.onChange(String)`; `name`: Feld eines `Form` | `<select class="tx-input tx-select"><option value="A">A</option>…</select>` |
| `Select.of(options: List<T>, value: (T) => V, text: (T) => String, bind: State<V?>?, placeholder: String? = null, name = "")` | Auswahl aus Datensätzen: `bind` bekommt `value(eintrag)` (z. B. die Id), angezeigt wird `text(eintrag)`; der Platzhalter steht für `null` | `<select class="tx-input tx-select"><option value="">Kunde wählen</option><option value="7">Müller GmbH</option>…</select>` |
| `Label(text, …children)` | Beschriftung eines Felds; ein Klick darauf wählt es, Feldfehler im `Form` nennen diesen Text | `<label class="tx-label"><span class="tx-text">E-Mail</span><input class="tx-input" …></label>` |
| `Table(items: List<T>, …columns: TableColumn<T>, key?)` | Tabelle mit Kopfzeile, eine Zeile je Eintrag (über `key` wiederverwendet); `TableColumn(titel, e => View)` | `<table class="tx-table"><thead><tr><th scope="col">Name</th>…</tr></thead><tbody><tr><td>…</td></tr></tbody></table>` |
| `ProgressBar(value: Float, color?)` | 0.0 bis 1.0 | `<div class="tx-progress" role="progressbar"><div class="tx-w-40p"></div></div>` |
| `Spinner(size = 24.px, color?)` | | `<div class="tx-spinner" role="status" aria-label="Lädt…"></div>` |
| `Form(action: FormAction<T>, …children, onDone?, onError?)` | Container; schickt die Felder an eine Service-Methode (siehe unten) | `<form class="tx-form" method="post" action="/api/feier/anmelden"><input type="hidden" name="tx_csrf" value="…">…</form>` |

### Formulare (`Form`)

`Form(Feier.anmelden, …)` ist ein echtes `<form>`, das an eine Service-Methode sendet. Mit JavaScript ruft es die
Methode typisiert auf, ohne die Seite neu zu laden: Danach bekommt `onDone` das Ergebnis, und das Formular wird geleert.
Ohne JavaScript schickt der Browser es normal ab. Der Server ruft dieselbe Methode auf und leitet zur Seite zurück.

- **Felder** sind `Input`, `TextArea`, `Select`, `Checkbox` und `FilePicker` mit `name:`. Jeder Name gehört zu einem Parameter
  der Methode. Nimmt die Methode genau eine `data class`, sind deren Eigenschaften die Felder.
- **Erlaubte Typen** sind `String`, `Int`, `Float`, `Boolean` und `Upload` (Dateien), auch nullbar oder mit
  Standardwert. Andere Typen meldet der Compiler. Mit einem Dateifeld sendet das Formular `multipart/form-data`.
- **Fehler** wie „ist keine ganze Zahl“ oder eine verletzte Regel (`@Required`, `@Email` …) erscheinen neben dem Feld
  (`aria-invalid`, Meldung mit `role="alert"`). Steckt das Feld in einem `Label("E-Mail", …)` (oder hat es ein
  `.ariaLabel(…)`), nennt die Meldung es: „E-Mail: ist keine gültige E-Mail-Adresse“. Andere Fehler bekommt `onError`, ohne `onError` stehen sie unter dem
  Formular. Ohne JavaScript zeigt der Server eine schlichte Fehlerseite mit den Feldfehlern und einem Link zurück.
- **Sicherheit:** Das verdeckte Feld `tx_csrf` füllt der Server bei jedem Aufruf der Seite. Seiten mit Formular kommen
  deshalb nie aus einem Cache (`Cache-Control: no-store, private`).

Fehlt ein Feld für einen Pflichtparameter, gibt es einen Namen ohne passenden Parameter oder ist `submit` keine
Konstante, meldet das der Compiler. Wie der Server Formulare annimmt, steht in [Backend und Sicherheit](backend.md#formulare-form).


`bind:` erwartet den **State selbst** (`this.name`), nicht `.value`. Die Bindung liest und schreibt den State
(`tx.bind(...)`):

```texo
data class Kunde(id: Int, name: String)

component Formular {
    private State<String> name = State("")
    private State<Boolean> zustimmung = State(false)
    private State<Boolean> aktiv = State(true)
    private State<Float> lautstaerke = State(40.0)
    private State<String> farbe = State("Rot")
    private List<Kunde> kunden = [Kunde(1, "Müller GmbH"), Kunde(2, "Schmidt KG")]
    private State<Int?> kundeId = State(null)

    fn build(): View {
        return Column(spacing: 12.px, [
            Input(bind: this.name, placeholder: "Dein Name").onSubmit(() => print(this.name.value)),
            Input(bind: this.name, placeholder: "Passwort", type: InputType.Password),
            TextArea(bind: this.name, rows: 3),
            Checkbox(bind: this.zustimmung, label: "Ich stimme zu"),
            Toggle(bind: this.aktiv, label: "Aktiv"),
            Slider(bind: this.lautstaerke, min: 0.0, max: 100.0),
            Select(["Rot", "Grün", "Blau"], bind: this.farbe),
            Label("Kunde", Select.of(this.kunden, value: k => k.id, text: k => k.name, bind: this.kundeId, placeholder: "Bitte wählen")),
            Table(this.kunden, TableColumn("Name", k => Text(k.name)), TableColumn("Id", k => Text("${k.id}")), key: k => k.id),
            ProgressBar(this.lautstaerke.value / 100.0, color: Color.Indigo500),
            Button("Absenden", icon: "send")
                .disabled(!this.zustimmung.value || this.name.value.isBlank())
                .onClick(() => print("gesendet"))
        ])
    }
}
```

### Kontrollstrukturen als Views

| Element | Bedeutung |
|---|---|
| `If(condition, then, otherwise?)` | zeigt `then` oder `otherwise`; wechselt nur, wenn sich das **Ergebnis der Bedingung** ändert |
| `ForEach(items: List<T>, builder: (T, Int) => View, key: (T) => Any)` | Liste mit Schlüsseln; vorhandene DOM-Knoten werden wiederverwendet |
| `Router(…routes: Route, fallback?)` + `Route(path, (RouteParams) => View)` | hash-basiertes Routing |
| `Navigator` | `path` (reaktiv), `go(pfad)`, `back()`, `isActive(pfad)` |

Auch `cond ? ViewA : ViewB`, `match` und Funktionen mit Rückgabetyp `View` können als View verwendet werden.
Details: [Reaktivität und Routing](reaktivitaet.md).

```texo
component Liste {
    private State<List<String>> eintraege = State(["Eins", "Zwei"])
    private State<Boolean> leer = State(false)

    fn build(): View {
        return Column(spacing: 8.px, [
            If(this.eintraege.value.isEmpty(),
                Text("Nichts da"),
                otherwise: ForEach(this.eintraege.value, (e, i) => Text("${i + 1}. ${e}"), key: e => e)
            ),
            Router(
                Route("/", _ => Text("Start")),
                Route("/nutzer/:id", p => Text("Nutzer ${p.get("id")}")),
                fallback: Text("404")
            )
        ])
    }
}
```

### Dialoge, Menüs, Reiter, Vorschlagsfelder und Meldungen

Diese Bedienelemente folgen den Mustern der WAI-ARIA Authoring Practices. Fokus, Tastatur und ARIA-Attribute
übernimmt die Laufzeit, du schreibst nur, was angezeigt wird und was passieren soll.

| Element | Parameter | Erzeugtes HTML und Verhalten |
|---|---|---|
| `Dialog(open: State<Boolean>, …children, title = "")` | Container; offen, solange `open` `true` ist | `<dialog class="tx-dialog" aria-modal="true" aria-labelledby="…"><h2 class="tx-dialog-title">Titel</h2>…</dialog>`; öffnet mit `showModal()`, hält den Fokus im Dialog, sperrt das Scrollen der Seite, schließt mit Escape oder einem Klick daneben (beides setzt `open` auf `false`) und gibt den Fokus an das zuvor fokussierte Element zurück |
| `Tabs(…tabs: Tab, bind: State<Int>? = null)` + `Tab(label, () => View)` | `bind` hält die Nummer des gewählten Reiters (ab 0) | `<div class="tx-tabs"><div role="tablist"><button role="tab" aria-selected="true" aria-controls="…">…</button>…</div><div role="tabpanel" aria-labelledby="…">…</div>…</div>`; Pfeil links und rechts (mit Umlauf), Pos1 und Ende wählen und fokussieren; der Inhalt eines Reiters entsteht erst, wenn er zum ersten Mal gewählt wird, und bleibt danach erhalten |
| `Menu(label, …items: MenuItem)` + `MenuItem(label, () => Void, disabled = false)` | Button mit aufklappender Liste von Aktionen | `<div class="tx-menu"><button aria-haspopup="menu" aria-expanded="false">Aktionen</button><div role="menu" hidden><div role="menuitem" tabindex="-1">…</div>…</div></div>`; Enter, Leertaste und Pfeil runter öffnen beim ersten Eintrag, Pfeil hoch beim letzten; im Menü wandern die Pfeiltasten, Pos1, Ende und der Anfangsbuchstabe, Enter führt aus, Escape schließt und fokussiert wieder den Button, Tab und ein Klick daneben schließen |
| `Combobox(options: List<String>, bind: State<String>, label = "", placeholder = "", filter?)` | `bind` hält den getippten oder gewählten Text | `<div class="tx-combobox"><input role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="…"><ul role="listbox" hidden>…</ul></div>`; Tippen filtert (Standard: Teiltext ohne Groß- und Kleinschreibung), Pfeil runter und hoch bewegen die aktive Option (`aria-activedescendant`), Enter übernimmt, Escape schließt die Liste und leert bei geschlossener Liste das Feld |
| `Toast.show(message, kind = ToastKind.Info, duration = 4.s)` | Meldung am unteren rechten Rand | `<div class="tx-toasts"><div role="status" aria-live="polite">…</div><div role="alert" aria-live="assertive">…</div></div>`; Fehler (`ToastKind.Error`) landen in der Region mit `role="alert"` und werden sofort vorgelesen; jede Meldung hat einen Schließen-Button, steht still, solange Maus oder Fokus auf ihr liegen, und verschwindet nach `duration` (`0.ms`: erst beim Schließen); `Toast.clear()` entfernt alle |

Menüliste und Vorschlagsliste liegen über der Seite (Popover-API, wo vorhanden, sonst `position: fixed`) und
richten sich nach ihrem Button bzw. Eingabefeld, auch beim Scrollen. `options` einer Combobox darf aus einer
`Resource` oder einem `State` kommen, die Liste folgt den Änderungen. Die Reiter von `Tabs` und die Zahl der Einträge eines
`Menu` stehen beim Aufbau fest; Beschriftung und `disabled` eines `MenuItem` dürfen sich ändern.

**Vorrendern:** Auf dem Server steht der Dialog geschlossen im HTML, auch wenn `open` schon `true` ist; der Browser
öffnet ihn nach dem Laden. Menüliste und Vorschlagsliste sind `hidden`, von `Tabs` ist nur der gewählte Reiter
gebaut. `Toast.show` tut auf dem Server nichts.

**Prüfungen:** Der Compiler warnt bei einem `Dialog` ohne `title` (und ohne `.ariaLabel(…)`) und bei einer `Combobox`
ohne `label`, weil Screenreader sonst nicht sagen können, worum es geht.

**Ein- und Ausblenden:** `.transition(…)` an einem `Dialog` blendet ihn beim Öffnen ein und beim Schließen aus;
geschlossen wird erst nach dem Ende der Animation. Dasselbe gilt für `If`, `match` und `ForEach` (siehe
[Animation](#animation)).

```texo
package konto

import texo.ui.*
import texo.graphics.*

component Konto {
    private State<Int> reiter = State(0)
    private State<Boolean> loeschenFragen = State(false)
    private State<String> stadt = State("")

    fn build(): View => Column(spacing: 12.px, [
        Tabs(bind: this.reiter, [
            Tab("Profil", () => Combobox(["Berlin", "Bremen", "Köln"], bind: this.stadt, label: "Stadt")),
            Tab("Sicherheit", () => Text("Zwei-Faktor-Anmeldung ist aktiv"))
        ]),
        Menu("Aktionen", [
            MenuItem("Exportieren", () => Toast.show("Export gestartet")),
            MenuItem("Konto löschen", () => this.loeschenFragen.value = true)
        ]),
        Dialog(open: this.loeschenFragen, title: "Konto wirklich löschen?", [
            Text("Das lässt sich nicht rückgängig machen."),
            Row(spacing: 8.px, [
                Button("Abbrechen").onClick(() => this.loeschenFragen.value = false),
                Button("Löschen").onClick(() => this.loeschen())
            ])
        ]).transition(Transition.scale(200.ms))
    ])

    fn loeschen(): Void {
        this.loeschenFragen.value = false
        Toast.show("Konto gelöscht", kind: ToastKind.Success)
    }
}
```

In `texo test` gibt es dafür `s.isOpen(id)`, `s.pressEscape()`, `s.choose(id, "Eintrag")` und `s.toasts()`
(siehe [Testen](testen.md#render-und-screen)).

### Sichere URLs (`Url`)

`Link(to:)` und `Image(src:)` nehmen eine `Url`, keinen beliebigen `String`. So kann ein Wert wie `javascript:alert(1)` aus Nutzerdaten nicht in einem `href` landen; das ist ein Compilerfehler und kein Laufzeitfund.

- **Textliterale** prüft der Compiler. Erlaubt sind relative Pfade, `#anker`, `?abfragen` sowie `http:`, `https:`, `mailto:`, `tel:`, `sms:` und `data:image/`.
- **Interpolierte Texte** sind erlaubt, wenn ihr fester Anfang das Schema festlegt: `"/profil/${id}"` oder `"https://texo.dev/${seite}"`, aber nicht `"${adresse}"`.
- **Texte zur Laufzeit** gehen über `Url.parse(text)`. Es liefert `null` bei unsicheren Schemata, also meist `Url.parse(text) ?? "#"`.
- Felder in Datenklassen und Props können selbst den Typ `Url` haben; mit `.toString()` wird daraus wieder Text.

Zur Laufzeit ist eine `Url` ein einfacher String. Der Filter für `javascript:` in der Laufzeit bleibt als zweite Linie bestehen.

```texo
package beispiel

import texo.ui.*

data class Profil(name: String, website: String, bild: Url)

component Karte(profil: Profil) {
    fn build(): View {
        return Column([
            Image(this.profil.bild, alt: this.profil.name),
            Link("Profil", to: "/profil/${this.profil.name}"),
            Link("Website", to: Url.parse(this.profil.website) ?? "#", external: true)
        ])
    }
}
```

## Einheiten

Zahlen werden über Eigenschaften von `Int` und `Float` zu typisierten Werten:

| Schreibweise | Typ | CSS |
|---|---|---|
| `16.px`, `1.5.rem`, `2.em`, `50.percent`, `100.vw`, `100.vh`, `1.fr` | `Length` | `16px`, `1.5rem`, `2em`, `50%`, `100vw`, `100vh`, `1fr` |
| `Size.Full` / `Half` / `Third` / `Quarter` | `Length` | `100%` / `50%` / `33.3333%` / `25%` |
| `Size.Auto` / `FitContent` / `MinContent` / `MaxContent` | `Length` | `auto` / `fit-content` / `min-content` / `max-content` |
| `Size.ScreenWidth` / `ScreenHeight` / `Zero` | `Length` | `100vw` / `100vh` / `0` |
| `250.ms`, `2.s` | `Duration` | `250ms`, `2s` |
| `45.deg`, `0.25.turn` | `Angle` | `45deg`, `90deg` |

`Length` unterstützt Rechnen: `-4.px` (Negation), `.times(2.0)`, `.plus(8.px)`, `.minus(2.rem)`. Gleiche Einheiten werden
direkt verrechnet, verschiedene werden zu `calc(…)`.

## Modifier und erzeugtes CSS

Die Tabellen zeigen für jeden Modifier die Signatur, ein Beispiel und das **tatsächlich vom Compiler erzeugte CSS**
(je Zeile eine atomare Klasse; Präfixe wie `-webkit-` und die automatischen `transition-*`-Regeln sind weggelassen).
Parameter mit Standardwert sind in der Signatur als `= wert` angegeben.

### Layout

Gelten für jedes `View`.

| Modifier | Beispiel | Generiertes CSS |
|---|---|---|
| `width(value: Length)` | `.width(360.px)` | `width: 360px` |
| `height(value)` | `.height(2.rem)` | `height: 2rem` |
| `minWidth(value)` | `.minWidth(200.px)` | `min-width: 200px` |
| `maxWidth(value)` | `.maxWidth(560.px)` | `max-width: 560px` |
| `minHeight(value)` | `.minHeight(100.vh)` | `min-height: 100vh` |
| `maxHeight(value)` | `.maxHeight(50.percent)` | `max-height: 50%` |
| `size(all, width, height)` | `.size(all: 40.px)` | `width: 40px`<br>`height: 40px` |
| `fillWidth()` | `.fillWidth()` | `width: 100%` |
| `fillHeight()` | `.fillHeight()` | `height: 100%` |
| `padding(all, vertical, horizontal, top, right, bottom, left)` | `.padding(all: 16.px)` | `padding: 16px` |
| `padding` | `.padding(vertical: 8.px, horizontal: 12.px)` | `padding: 8px 12px` |
| `padding` | `.padding(top: 4.px, left: 8.px)` | `padding-top: 4px`<br>`padding-left: 8px` |
| `margin(...)` | `.margin(bottom: 12.px)` | `margin-bottom: 12px` |
| `margin` | `.margin(vertical: 4.px, horizontal: 8.px)` | `margin: 4px 8px` |
| `grow(factor = 1)` | `.grow()` | `flex-grow: 1` |
| `shrink(factor = 1)` | `.shrink(0)` | `flex-shrink: 0` |
| `basis(value)` | `.basis(200.px)` | `flex-basis: 200px` |
| `alignSelf(alignment: CrossAlignment)` | `.alignSelf(CrossAlignment.end)` | `align-self: flex-end` |
| `center()` | `.center()` | `margin-left: auto`<br>`margin-right: auto` |
| `gridSpan(columns = 1, rows = 1)` | `.gridSpan(columns: 2)` | `grid-column: span 2 / span 2` |
| `absolute(top, right, bottom, left, inset)` | `.absolute(top: 0.px, right: 0.px)` | `position: absolute`<br>`top: 0`<br>`right: 0` |
| `fixed(...)` | `.fixed(bottom: 16.px, right: 16.px)` | `position: fixed`<br>`right: 16px`<br>`bottom: 16px` |
| `relative(top, right, bottom, left, inset)` | `.relative(top: 4.px, left: -8.px)` | `position: relative`<br>`top: 4px`<br>`left: -8px` |
| `sticky(top, right, bottom, left, inset)` | `.sticky(bottom: 0.px)` | `position: sticky`<br>`bottom: 0` (ohne Angabe: `top: 0`) |
| `zIndex(value: Int)` | `.zIndex(10)` | `z-index: 10` |
| `overflow(value: Overflow)` | `.overflow(Overflow.Hidden)` | `overflow: hidden` |
| `clip()` | `.clip()` | `overflow: hidden` |
| `aspectRatio(ratio: Float)` | `.aspectRatio(1.5)` | `aspect-ratio: 1.5` |
| `hidden(when = true)` | `.hidden()` | `display: none` |
| `visible(when = true)` | `.visible(false)` | `visibility: hidden` |

### Container

Nur für `Container` (Stack, Row, Column, Box, Grid, Card, ScrollView, Button, Link).

| Modifier | Beispiel | Generiertes CSS |
|---|---|---|
| `spacing(value: Length)` | `.spacing(12.px)` | `gap: 12px` |
| `alignment(Alignment)` | `.alignment(Alignment.spaceBetween)` | `justify-content: space-between` |
| `crossAlignment(CrossAlignment)` | `.crossAlignment(CrossAlignment.center)` | `align-items: center` |
| `flexWrap(enabled = true)` | `.flexWrap()` | `flex-wrap: wrap` |
| `blur(radius)` | `.blur(12.px)` | `backdrop-filter: blur(12px)` |
| `glass(blur, tint, borderColor)` | `.glass()` | `background: rgba(255, 255, 255, 0.08)`<br>`border: 1px solid rgba(255, 255, 255, 0.18)`<br>`backdrop-filter: blur(16px) saturate(1.4)` |

`Grid` hat zusätzlich:

| Modifier | Beispiel | Generiertes CSS |
|---|---|---|
| `columns(count: Int)` | `.columns(3)` | `grid-template-columns: repeat(3, minmax(0, 1fr))` |
| `adaptive(minWidth: Length)` | `.adaptive(240.px)` | `grid-template-columns: repeat(auto-fill, minmax(min(240px, 100%), 1fr))` |

Beide sind in Varianten nutzbar: `Grid(…).columns(1).md(g => g.columns(3))`.

### Aussehen

| Modifier | Beispiel | Generiertes CSS |
|---|---|---|
| `background(fill: Paint)` | `.background(Color.Indigo500)` | `background: #6366f1` |
| `background` | `.background(LinearGradient.diagonal(Color.Indigo500, Color.Pink500))` | `background: linear-gradient(135deg, #6366f1, #ec4899)` |
| `textColor(color: Paint)` | `.textColor(Color.Slate700)` | `color: #334155` |
| `textColor (Verlauf)` | `.textColor(LinearGradient.horizontal(Color.Indigo500, Color.Pink500))` | `background: linear-gradient(90deg, #6366f1, #ec4899)`<br>`background-clip: text`<br>`color: transparent` |
| `foreground(color)` | `.foreground(Color.White)` | `color: #ffffff` |
| `opacity(value: Float)` | `.opacity(0.5)` | `opacity: 0.5` |
| `radius(all, top, bottom, topLeft, ...)` | `.radius(12.px)` | `border-radius: 12px` |
| `radius` | `.radius(top: 12.px)` | `border-top-left-radius: 12px`<br>`border-top-right-radius: 12px` |
| `pill()` | `.pill()` | `border-radius: 9999px` |
| `circle()` | `.circle()` | `border-radius: 50%` |
| `border(width, color, style, side)` | `.border(width: 1.px, color: Color.Gray300)` | `border: 1px solid #d1d5db` |
| `border` | `.border(color: Color.Gray300, style: BorderStyle.Dashed, side: Edge.Bottom)` | `border-bottom: 1px dashed #d1d5db` |
| `outline(width, color, offset)` | `.outline(color: Color.Indigo500)` | `outline: 2px solid #6366f1`<br>`outline-offset: 2px` |
| `shadow(preset: Shadow)` | `.shadow(Shadow.Lg)` | `box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)` |
| `shadow` | `.shadow(Shadow.SoftGlow(Color.Indigo500.opacity(0.35)))` | `box-shadow: 0 10px 25px -5px rgba(99, 102, 241, 0.35), 0 8px 10px -6px rgba(99, 102, 241, 0.21)` |
| `elevation(level: Length)` | `.elevation(4.px)` | `box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15)` |
| `filterBlur(radius)` | `.filterBlur(4.px)` | `--tx-blur: blur(4px)` + `filter: var(--tx-blur,) …` |
| `grayscale(amount = 1.0)` | `.grayscale()` | `--tx-grayscale: grayscale(1)` |
| `brightness(amount)` | `.brightness(1.2)` | `--tx-brightness: brightness(1.2)` |
| `saturate(amount)` | `.saturate(1.5)` | `--tx-saturate: saturate(1.5)` |
| `contrast(amount)` | `.contrast(1.1)` | `--tx-contrast: contrast(1.1)` |
| `hueRotate(angle)`, `invert(amount = 1.0)`, `sepia(amount = 1.0)`, `dropShadow(shadow)` | `.hueRotate(90.deg)`, `.dropShadow(Shadow.Md)` | jeweils eigene Variable |

Filter **kombinieren** sich: Jeder Filter-Modifier setzt eine eigene CSS-Variable, `filter` setzt sie zusammen
(`.brightness(1.1).grayscale(0.5)` ergibt `filter: brightness(1.1) grayscale(0.5)`), auch in Varianten wie
`.hover(s => s.brightness(1.3))`. Die Variablen werden in der Reset-Ebene für jedes Element zurückgesetzt und vererben
sich daher nicht.
| `transform(value: Transform)` | `.transform(Transform.rotate(45.deg).then(Transform.scale(1.1)))` | `transform: rotate(45deg) scale(1.1)` |
| `scale(factor)` | `.scale(1.05)` | `scale: 1.05` |
| `rotate(angle)` | `.rotate(15.deg)` | `rotate: 15deg` |
| `offset(x, y)` | `.offset(x: 4.px, y: -2.px)` | `translate: 4px -2px` |
| `cursor(value: Cursor)` | `.cursor(Cursor.Pointer)`, `.cursor(Cursor.image("hand.png", x: 8))` | `cursor: pointer`, `cursor: url("hand.png") 8 0, default` |
| `pointerEvents(enabled)` | `.pointerEvents(false)` | `pointer-events: none` |
| `selectable(enabled)` | `.selectable(false)` | `user-select: none` |
| `accentColor(color)` | `.accentColor(Color.Indigo500)` | `accent-color: #6366f1` |
| `css(property: String, value: String)` | `.css("mix-blend-mode", "multiply")` | `mix-blend-mode: multiply` |

`Shape` und `Image` haben zusätzliche Modifier:

| Modifier | Beispiel | Generiertes CSS |
|---|---|---|
| `Shape.fill(fill)` | `.fill(Color.Pink500)` | `background: #ec4899` |
| `Shape.stroke(width, color)` | `.stroke(width: 2.px, color: Color.Black)` | `border: 2px solid #000000` |
| `Image.fit(mode: ImageFit)` | `.fit(ImageFit.Cover)` | `object-fit: cover` |

### Typografie

| Modifier | Beispiel | Generiertes CSS |
|---|---|---|
| `fontSize(size: Length)` | `.fontSize(14.px)` | `font-size: 14px` |
| `fontWeight(weight: FontWeight)` | `.fontWeight(FontWeight.SemiBold)` | `font-weight: 600` |
| `fontFamily(font: Font)` | `.fontFamily(Font.Mono)` | `font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace` |
| `fontFamily` | `.fontFamily(Font.named("Inter"))` | `font-family: 'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif` |
| `letterSpacing(value)` | `.letterSpacing(1.2.px)` | `letter-spacing: 1.2px` |
| `lineHeight(value: Float)` | `.lineHeight(1.6)` | `line-height: 1.6` |
| `textAlign(align: TextAlign)` | `.textAlign(TextAlign.Center)` | `text-align: center` |
| `bold()` | `.bold()` | `font-weight: 700` |
| `italic(enabled = true)` | `.italic()` | `font-style: italic` |
| `underline(enabled = true)` | `.underline()` | `text-decoration: underline` |
| `strikethrough(enabled = true)` | `.strikethrough()` | `text-decoration: line-through` |
| `uppercase()` | `.uppercase()` | `text-transform: uppercase` |
| `lowercase()` | `.lowercase()` | `text-transform: lowercase` |
| `monospace()` | `.monospace()` | `font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace` |
| `truncate()` | `.truncate()` | `overflow: hidden`<br>`text-overflow: ellipsis`<br>`white-space: nowrap` |
| `lineClamp(lines: Int)` | `.lineClamp(3)` | `overflow: hidden`<br>`display: -webkit-box`<br>`-webkit-line-clamp: 3`<br>`-webkit-box-orient: vertical` |
| `noWrap()` | `.noWrap()` | `white-space: nowrap` |
| `textShadow(shadow)` | `.textShadow(Shadow(0.px, 1.px, 2.px, 0.px, Color.Black.opacity(0.3)))` | `text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3)` |

### Animation

`animate` aktiviert weiche Übergänge für **alle** Änderungen an diesem Element (z. B. durch Zustand oder `hover`).
Die übrigen Animationen laufen als CSS-`@keyframes`.

| Modifier | Beispiel | Generiertes CSS |
|---|---|---|
| `animate(duration = 200.ms, easing = EaseOut, delay = 0.ms)` | `.animate(duration: 250.ms, easing: Easing.Spring)` | `transition-property: all`<br>`transition-duration: 250ms`<br>`transition-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1)` |
| `pulse(repeat = true, duration = 2.s)` | `.pulse()` | `@keyframes tx-pulse`<br>`animation: tx-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite` |
| `spin(duration = 1.s)` | `.spin()` | `@keyframes tx-spin`<br>`animation: tx-spin 1s linear infinite` |
| `ping(duration = 1.s)` | `.ping()` | `@keyframes tx-ping`<br>`animation: tx-ping 1s cubic-bezier(0, 0, 0.2, 1) infinite` |
| `bounce(duration = 1.s)` | `.bounce()` | `@keyframes tx-bounce`<br>`animation: tx-bounce 1s ease infinite` |
| `shake(repeat = false, duration = 500.ms)` | `.shake()` | `@keyframes tx-shake`<br>`animation: tx-shake 500ms ease-in-out 1` |
| `float(duration = 3.s)` | `.float()` | `@keyframes tx-float`<br>`animation: tx-float 3s ease-in-out infinite` |
| `fadeIn(duration = 400.ms, delay = 0.ms)` | `.fadeIn()` | `@keyframes tx-fade-in`<br>`animation: tx-fade-in 400ms ease-out 1 both` |
| `scaleIn(duration = 300.ms, delay = 0.ms)` | `.scaleIn()` | `@keyframes tx-scale-in`<br>`animation: tx-scale-in 300ms cubic-bezier(0.34, 1.56, 0.64, 1) 1 both` |
| `slideIn(from = Edge.Bottom, distance = 16.px, duration = 400.ms, delay = 0.ms)` | `.slideIn(from: Edge.Left)` | `@keyframes tx-slide-in-left-16px`<br>`animation: tx-slide-in-left-16px 400ms cubic-bezier(0.16, 1, 0.3, 1) both` |

**Ein- und Ausblenden mit `.transition(…)`:** `fadeIn`, `scaleIn` und `slideIn` wirken nur beim Erscheinen.
`.transition(Transition.fade(200.ms))` animiert auch das Verschwinden: Die Laufzeit lässt den Knoten stehen, bis
die Animation zu Ende ist, und entfernt ihn erst dann. Solange er ausblendet, ist er `inert` und nicht mehr bedienbar.

| Wo | Wirkung |
|---|---|
| `Dialog(…).transition(t)` | beim Öffnen einblenden, beim Schließen ausblenden |
| `If(…).transition(t)`, `(cond ? A : B).transition(t)`, `(match x { … }).transition(t)` | jeder Wechsel blendet die alte Ansicht aus und die neue ein (beide stehen kurz gleichzeitig da) |
| `ForEach(…).transition(t)` | neue Zeilen blenden ein, entfernte aus |
| `ForEach(…).animateMoves(duration = 200.ms)` | Zeilen, deren Platz sich ändert (etwa nach dem Sortieren), gleiten an die neue Stelle |
| `Text("…").transition(t)` und andere Elemente | das Element blendet ein und aus, wenn ein `If`, `match` oder `ForEach` darüber es einfügt oder entfernt |

Übergänge: `Transition.fade(duration = 200.ms)`, `Transition.scale(duration = 200.ms)` (von 95 %) und
`Transition.slide(from = Edge.Bottom, duration = 250.ms)` (16 px von der Seite). Beim ersten Aufbau der Seite und
beim Vorrendern wird nichts animiert. Mit `prefers-reduced-motion: reduce` entfallen alle Übergänge, der Wechsel
passiert sofort.

Ändern sich konstante Stile über Varianten oder Ternäre (`hover`, `cond ? a : b`), ergänzt der Compiler automatisch einen
150-ms-Übergang für die betroffenen Eigenschaften (`transition-property`, `-duration`, `-timing-function`), sofern du nicht
selbst `.animate(…)` angibst.

### Varianten

Ein Varianten-Modifier nimmt einen **Stil-Lambda**: `.hover(s => s.background(…).scale(1.05))`. Innerhalb dürfen nur
Stil-Modifier stehen (keine Events, kein `content`); der Parameter muss am Anfang der Kette stehen. Varianten lassen
sich verschachteln (`dark(s => s.hover(h => …))`).

| Variante | CSS-Auslöser | Klassenpräfix |
|---|---|---|
| `hover` | `:hover` | `tx-h-` |
| `focus` | `:focus-visible` | `tx-f-` |
| `focusWithin` | `:focus-within` | `tx-fw-` |
| `pressed` | `:active` | `tx-a-` |
| `whenDisabled` | `:disabled` | `tx-dis-` |
| `placeholderStyle` | `::placeholder` | `tx-ph-` |
| `dark` | `@media (prefers-color-scheme: dark)` | `tx-dk-` |
| `sm` | `@media (min-width: 640px)` | `tx-sm-` |
| `md` | `@media (min-width: 768px)` | `tx-md-` |
| `lg` | `@media (min-width: 1024px)` | `tx-lg-` |
| `xl` | `@media (min-width: 1280px)` | `tx-xl-` |
| `printStyle` | `@media print` | `tx-pr-` |
| `responsive(Breakpoint, style)` | wie `sm`/`md`/`lg`/`xl` mit konstantem Breakpoint | wie oben |

Erzeugtes CSS (`&` steht für die jeweilige atomare Klasse, z. B. `.tx-h-bg-4f46e5`):

| Modifier | Beispiel | Generiertes CSS |
|---|---|---|
| `hover(style)` | `.hover(s => s.background(Color.Indigo600))` | `&:hover { background: #4f46e5 }` |
| `focus(style)` | `.focus(s => s.outline())` | `&:focus-visible { outline: 2px solid #6366f1 }`<br>`&:focus-visible { outline-offset: 2px }` |
| `focusWithin(style)` | `.focusWithin(s => s.border(color: Color.Indigo500))` | `&:focus-within { border: 1px solid #6366f1 }` |
| `pressed(style)` | `.pressed(s => s.scale(0.97))` | `&:active { scale: 0.97 }` |
| `whenDisabled(style)` | `.whenDisabled(s => s.opacity(0.5))` | `&:disabled { opacity: 0.5 }` |
| `placeholderStyle(style)` | `.placeholderStyle(s => s.textColor(Color.Gray400))` | `&::placeholder { color: #9ca3af }` |
| `dark(style)` | `.dark(s => s.background(Color.Slate900))` | `@media (prefers-color-scheme: dark) { & { background: #0f172a } }` |
| `sm(style)` | `.sm(s => s.padding(all: 24.px))` | `@media (min-width: 640px) { & { padding: 24px } }` |
| `md(style)` | `.md(s => s.padding(all: 32.px))` | `@media (min-width: 768px) { & { padding: 32px } }` |
| `lg(style)` | `.lg(s => s.padding(all: 40.px))` | `@media (min-width: 1024px) { & { padding: 40px } }` |
| `xl(style)` | `.xl(s => s.padding(all: 48.px))` | `@media (min-width: 1280px) { & { padding: 48px } }` |
| `printStyle(style)` | `.printStyle(s => s.hidden())` | `@media print { & { display: none } }` |
| `responsive(breakpoint, style)` | `.responsive(Breakpoint.lg, s => s.hidden())` | `@media (min-width: 1024px) { & { display: none } }` |
| `verschachtelt` | `.dark(s => s.hover(h => h.background(Color.Slate800)))` | `@media (prefers-color-scheme: dark) { &:hover { background: #1e293b } }` |
| `verschachtelt` | `.md(s => s.hover(h => h.scale(1.02)))` | `@media (min-width: 768px) { &:hover { scale: 1.02 } }` |

**Responsive Design** ist mobile-first: Basisstile gelten überall, `md`/`lg`/… überschreiben ab der jeweiligen Breite.
**Dunkelmodus** folgt der Systemeinstellung (`prefers-color-scheme`).

```texo
component Responsiv {
    fn build(): View {
        return Row(crossAlignment: CrossAlignment.stretch, [
            Column([Text("Navigation")])
                .width(240.px)
                .hidden(true)                      // mobil ausgeblendet …
                .md(s => s.hidden(false)),         // … ab 768px sichtbar
            Grid(Card(Text("1")), Card(Text("2")), Card(Text("3")), Card(Text("4")))
                .columns(1)
                .md(g => g.columns(2))
                .xl(g => g.columns(4))
                .grow()
        ])
            .padding(16.px)
            .md(s => s.padding(48.px))
            .background(Color.Slate50)
            .dark(s => s.background(Color.Slate950).textColor(Color.Slate100))
    }
}
```

`hidden(true)` erzeugt `display: none`; `hidden(false)` erzeugt `display: revert-layer`, fällt also auf die Basisanzeige des
Elements (z. B. `display: flex` eines Stacks) zurück.

### Schmale Bildschirme

Ohne eigene Breakpoints passt der Compiler drei Dinge von selbst an das Handy an:

- `Table` scrollt unter 640 px waagrecht, statt aus dem Rahmen zu laufen.
- Feste Breiten ab 200 px (`.width(600.px)`, `.size(width: 480.px)`) werden nie breiter als das Elternelement
  (`max-width: 100%` über die Klasse `tx-fit`). Ausnahmen: absolut oder fest positionierte Elemente, Dialoge und
  Kinder einer `ScrollView`. Ein eigenes `.maxWidth(…)` gilt immer vor dieser Grenze.
- `Grid` ohne Spaltenzahl hat unter 640 px eine Spalte, darüber zwei.

Alles andere zeigt `texo responsive`. Der Befehl sucht in `src/` nach Stellen, die auf 390 px zu groß oder zu breit
werden, und zeigt je Fund die alte und die neue Zeile:

```
$ texo responsive
src/pages/Start.texo:12:18 Schriftgröße 40 px bleibt auf dem Handy gleich groß: wächst jetzt mit der Breite
  - Text("Willkommen").fontSize(40.px),
  + Text("Willkommen").fontSize(Length.clamp(24.px, 3.1.vw, 40.px)),
1 Stelle(n) gefunden, 1 davon umschreibbar – übernehmen mit texo responsive --write
```

| Fund | Umschreibung mit `--write` |
|---|---|
| `.fontSize(N.px)` ab 32 px | `Length.clamp(…)`: etwa 60 % auf dem Handy, volle Größe ab 1280 px |
| `.padding(N.px)` ab 40 px | halber Abstand, ab `md` der volle: `.padding(24.px).md(s => s.padding(48.px))` |
| `Grid(…, columns: N)` oder `.columns(N)` ab 3 | eine Spalte, 3 Spalten ab `md`; ab 4 Spalten 2 ab `sm` und N ab `lg` |
| `Row` mit vier oder mehr Kindern oder `ForEach` | `.flexWrap()` |
| `.minWidth(N.px)` über 360 px, `.width(N.px)` über 360 px an `.absolute()`/`.fixed()` | nur Hinweis |

Ketten, die schon Breakpoints haben (`.md(…)`, `.below(…)` …), gelten als responsiv und bleiben unverändert.
Formatierte Dateien bleiben formatiert. `texo responsive --check` endet bei Funden mit Status 1 (für CI).

## Ereignisse

Handler sind Lambdas ohne Rückgabewert. Mehrere Handler pro Element und Ereignis sind möglich. Jeder Handler läuft in
einem `batch`: mehrere Zustandsänderungen lösen nur **ein** Update aus. Exceptions in Handlern werden in der Konsole
protokolliert und unterbrechen spätere Ereignisse nicht.

| Modifier | Lambda | DOM-Ereignis |
|---|---|---|
| `onClick(action)` | `() => Void` | `click` |
| `onDoubleClick(action)` | `() => Void` | `dblclick` |
| `onHover(action)` | `(Boolean) => Void` – `true` beim Betreten, `false` beim Verlassen | `mouseenter` / `mouseleave` |
| `onMouseEnter(action)` / `onMouseLeave(action)` | `() => Void` | `mouseenter` / `mouseleave` |
| `onFocus(action)` / `onBlur(action)` | `() => Void` | `focus` / `blur` |
| `onKeyDown(action)` / `onKeyUp(action)` | `(String) => Void` – der Tastenname (`"Enter"`, `"a"`, …) | `keydown` / `keyup` |
| `onAppear(action)` | `() => Void` – einmal nach dem Einfügen in die Seite | (Mikrotask nach dem Einfügen) |
| `Input.onInput` / `onChange` / `onSubmit` | `(String)`, `(String)`, `()` – Enter | `input`, `change`, `keydown` (Enter) |
| `TextArea.onInput` / `onChange` | `(String) => Void` | `input`, `change` |
| `Checkbox/Toggle.onChange` | `(Boolean) => Void` | `change` |
| `Slider.onChange` | `(Float) => Void` | `input` |
| `Select.onChange` | `(String) => Void` | `change` |

Auf dem Server (Pre-Rendering) werden keine Handler registriert.

```texo
component Ereignisse {
    private State<Boolean> hover = State(false)
    private State<String> taste = State("–")

    fn build(): View {
        return Column(spacing: 8.px, [
            Text("Taste: ${this.taste.value}"),
            Card(Text("Über mich fahren"))
                .onHover(h => this.hover.value = h)
                .onClick(() => print("Klick"))
                .onDoubleClick(() => print("Doppelklick"))
                .onKeyDown(k => this.taste.value = k)
                .transform(this.hover.value ? Transform.scale(1.03) : Transform.identity())
                .animate(duration: 250.ms, easing: Easing.Spring)
        ])
    }
}
```

## Attribute und Barrierefreiheit

| Modifier | HTML-Attribut |
|---|---|
| `tooltip(text)` | `title` |
| `ariaLabel(label)` | `aria-label` |
| `id(value)` | `id` |
| `role(value)` | `role` |
| `testId(value)` | `data-testid` |
| `disabled(when = true)` | `disabled` (reaktiv, wenn der Wert Zustand enthält) |

```texo
component Zugaenglich {
    private State<String> text = State("")
    fn build(): View {
        return Row(spacing: 8.px, [
            Input(bind: this.text).ariaLabel("Suche").testId("suche"),
            Button.plain().content(Icon("trash")).ariaLabel("Löschen").tooltip("Löschen").disabled(this.text.value.isEmpty())
        ])
    }
}
```

### Prüfungen beim Übersetzen

Der Compiler warnt bei fünf häufigen Fehlern. Es sind Warnungen, der Build läuft weiter:

| Warnung | Wann | Behebung |
|---|---|---|
| Bild ohne Alternativtext | `Image(src)` ohne `alt:` | `alt: "Beschreibung"`; reine Dekoration mit `alt: ""` |
| Button ohne Beschriftung | `Button` oder `Button.plain` ohne Text, `.content(…)`, `.ariaLabel(…)` oder `.tooltip(…)` | Text angeben oder `.ariaLabel("Löschen")` |
| Dialog ohne Titel | `Dialog(open: …)` ohne `title:` und ohne `.ariaLabel(…)` | `title: "Einstellungen"` |
| Combobox ohne Beschriftung | `Combobox(…)` ohne `label:` | `label: "Stadt"` |
| Zu wenig Kontrast | Text- und Hintergrundfarbe am selben Element sind feste Farben mit weniger als 4.5:1 (WCAG 2.1, Stufe AA) | dunklere Textfarbe oder hellerer Hintergrund |

Beim Kontrast zählt ein `Button` ohne eigene Textfarbe als weiße Schrift, wie er dargestellt wird. Farben aus
CSS-Variablen (`Color.variable`, `@Theme`) und durchscheinende Farben prüft der Compiler nicht, weil er sie erst im
Browser kennt.

Für CSS-Eigenschaften ohne eigenen Modifier gibt es den Ausweg `.css("eigenschaft", "wert")`, z. B.
`.css("mix-blend-mode", "multiply")` (erzeugt `mix-blend-mode: multiply`).

## Statische und dynamische Stile

Der Compiler unterscheidet, wie ein Modifier-Argument beschaffen ist:

1. **Konstant** (Literale, Top-Level-`const`s, reine Bibliotheksaufrufe wie `Color.hex("#4f46e5")`): Das CSS wird zur
   Compile-Zeit erzeugt. Jede CSS-Eigenschaft wird zu einer **atomaren Klasse** (`.tx-w-360 { width: 360px; }`),
   die in `app.css` genau einmal vorkommt und von allen Elementen geteilt wird. Kein Laufzeitaufwand.
2. **Ternär mit konstanten Zweigen** (`cond ? Color.A : Color.B`): Beide Klassensätze liegen statisch im CSS; zur Laufzeit
   wird nur die Klasse umgeschaltet (`tx.cls(n, "tx-c-22c55e", "tx-c-ef4444", () => this.aktiv.value)`). Das ist der
   schnellste Weg für zustandsabhängige Stile.
3. **Dynamisch** (beliebiger Laufzeitwert, z. B. `.width(this.breite.value.px)`): Das Element erhält eine Bindung
   `txs.dstyle(…)`. Bei jeder Änderung berechnet die Laufzeit die atomaren Klassen neu und fügt fehlende Regeln in ein
   `<style id="tx-dyn">`-Element ein. Dafür wird das Laufzeitmodul `texo/style.js` mitgeliefert (nur dann).

```texo
component Stile {
    private State<Boolean> aktiv = State(false)
    private State<Int> breite = State(100)

    fn build(): View {
        return Column(spacing: 8.px, [
            Text("Ternär (zwei statische Klassen)")
                .textColor(this.aktiv.value ? Color.Green500 : Color.Red500),
            Box()
                .height(20.px)
                .width(this.breite.value.px)          // dynamisch: Laufzeit-Klasse
                .background(Color.Indigo500),         // konstant: statische Klasse
            Slider(bind: State(1.0))
        ])
    }
}
```

Erzeugter JavaScript-Code dieses Beispiels:

```js
const n1 = tx.el("span", "tx-text tx-tp-color tx-tdur-150ms tx-tease-9hd3w1", n0, "Ternär (…)");
tx.cls(n1, "tx-c-22c55e", "tx-c-ef4444", () => this.aktiv.value);
const n2 = tx.el("div", "tx-box tx-h-20 tx-bg-6366f1", n0);
txs.dstyle(n2, "width", () => ({ value: std.px(this.breite.value) }));
```

Beim Pre-Rendering landen dynamische Regeln als `<style id="tx-ssr">` im HTML, damit die Seite ohne Flackern erscheint.

**Reihenfolge und Überschreiben**: Auf demselben Element überschreibt ein späterer Modifier der gleichen Eigenschaft den
früheren (`.padding(8.px).padding(16.px)` ergibt nur `padding: 16px`). Kurzschreibweisen (`padding`) werden im
CSS vor ihren Einzelwerten (`padding-top`) ausgegeben, sodass `padding(all: 8.px).padding(top: 0.px)` wie erwartet
funktioniert. Varianten stehen nach den Basisregeln; Medienabfragen nach den Pseudo-Klassen, größere Breakpoints später.

## Farben

`Color` ist ein sRGB-Wert mit Alpha. Farben werden zu Hex bzw. `rgba(…)` ausgegeben.

| Erzeugung | Beispiel |
|---|---|
| Hex | `Color.hex("#4f46e5")`, auch `#rgb`, `#rgba`, `#rrggbbaa` |
| RGB / HSL | `Color.rgb(79, 70, 229)`, `Color.rgb(0, 0, 0, 0.5)`, `Color.hsl(240, 0.7, 0.5)` |
| Palette | `Color.palette("indigo", 500)` oder `Color.Indigo500` |
| Basisfarben | `Color.White`, `Color.Black`, `Color.Transparent` und die 500er-Töne `Color.Red`, `Orange`, `Amber`, `Yellow`, `Lime`, `Green`, `Emerald`, `Teal`, `Cyan`, `Sky`, `Blue`, `Indigo`, `Violet`, `Purple`, `Fuchsia`, `Pink`, `Rose`, `Gray`, `Slate`, `Zinc` |

Methoden: `opacity(alpha)`, `lighten(x)`, `darken(x)`, `saturate(x)`, `mix(other, amount = 0.5)`, `contrastText()`
(Schwarz oder Weiß), `toHex()`, `at(position)` (Farbstopp für Verläufe) sowie die Eigenschaften `r g b a luminance`.

```texo
const Marke = Color.hex("#6366f1")

component Farben {
    fn build(): View {
        return Row(spacing: 8.px, [
            Text("A").background(Marke).textColor(Marke.contrastText()),
            Text("B").background(Marke.opacity(0.15)).textColor(Marke.darken(0.2)),
            Text("C").background(Color.Slate900).textColor(Color.Indigo300),
            Text("D").background(Color.rgb(250, 204, 21)).textColor(Color.Black.opacity(0.8))
        ])
    }
}
```

### Palette (Tailwind-Töne 50 – 950)

Jede Familie hat die Töne `50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950`, z. B. `Color.Indigo50` …
`Color.Indigo950`. Die Spalte listet die Hex-Werte in dieser Reihenfolge.

| Familie | 50 · 100 · 200 · 300 · 400 · 500 · 600 · 700 · 800 · 900 · 950 |
|---|---|
| `Slate` | `#f8fafc` `#f1f5f9` `#e2e8f0` `#cbd5e1` `#94a3b8` `#64748b` `#475569` `#334155` `#1e293b` `#0f172a` `#020617` |
| `Gray` | `#f9fafb` `#f3f4f6` `#e5e7eb` `#d1d5db` `#9ca3af` `#6b7280` `#4b5563` `#374151` `#1f2937` `#111827` `#030712` |
| `Zinc` | `#fafafa` `#f4f4f5` `#e4e4e7` `#d4d4d8` `#a1a1aa` `#71717a` `#52525b` `#3f3f46` `#27272a` `#18181b` `#09090b` |
| `Neutral` | `#fafafa` `#f5f5f5` `#e5e5e5` `#d4d4d4` `#a3a3a3` `#737373` `#525252` `#404040` `#262626` `#171717` `#0a0a0a` |
| `Stone` | `#fafaf9` `#f5f5f4` `#e7e5e4` `#d6d3d1` `#a8a29e` `#78716c` `#57534e` `#44403c` `#292524` `#1c1917` `#0c0a09` |
| `Red` | `#fef2f2` `#fee2e2` `#fecaca` `#fca5a5` `#f87171` `#ef4444` `#dc2626` `#b91c1c` `#991b1b` `#7f1d1d` `#450a0a` |
| `Orange` | `#fff7ed` `#ffedd5` `#fed7aa` `#fdba74` `#fb923c` `#f97316` `#ea580c` `#c2410c` `#9a3412` `#7c2d12` `#431407` |
| `Amber` | `#fffbeb` `#fef3c7` `#fde68a` `#fcd34d` `#fbbf24` `#f59e0b` `#d97706` `#b45309` `#92400e` `#78350f` `#451a03` |
| `Yellow` | `#fefce8` `#fef9c3` `#fef08a` `#fde047` `#facc15` `#eab308` `#ca8a04` `#a16207` `#854d0e` `#713f12` `#422006` |
| `Lime` | `#f7fee7` `#ecfccb` `#d9f99d` `#bef264` `#a3e635` `#84cc16` `#65a30d` `#4d7c0f` `#3f6212` `#365314` `#1a2e05` |
| `Green` | `#f0fdf4` `#dcfce7` `#bbf7d0` `#86efac` `#4ade80` `#22c55e` `#16a34a` `#15803d` `#166534` `#14532d` `#052e16` |
| `Emerald` | `#ecfdf5` `#d1fae5` `#a7f3d0` `#6ee7b7` `#34d399` `#10b981` `#059669` `#047857` `#065f46` `#064e3b` `#022c22` |
| `Teal` | `#f0fdfa` `#ccfbf1` `#99f6e4` `#5eead4` `#2dd4bf` `#14b8a6` `#0d9488` `#0f766e` `#115e59` `#134e4a` `#042f2e` |
| `Cyan` | `#ecfeff` `#cffafe` `#a5f3fc` `#67e8f9` `#22d3ee` `#06b6d4` `#0891b2` `#0e7490` `#155e75` `#164e63` `#083344` |
| `Sky` | `#f0f9ff` `#e0f2fe` `#bae6fd` `#7dd3fc` `#38bdf8` `#0ea5e9` `#0284c7` `#0369a1` `#075985` `#0c4a6e` `#082f49` |
| `Blue` | `#eff6ff` `#dbeafe` `#bfdbfe` `#93c5fd` `#60a5fa` `#3b82f6` `#2563eb` `#1d4ed8` `#1e40af` `#1e3a8a` `#172554` |
| `Indigo` | `#eef2ff` `#e0e7ff` `#c7d2fe` `#a5b4fc` `#818cf8` `#6366f1` `#4f46e5` `#4338ca` `#3730a3` `#312e81` `#1e1b4b` |
| `Violet` | `#f5f3ff` `#ede9fe` `#ddd6fe` `#c4b5fd` `#a78bfa` `#8b5cf6` `#7c3aed` `#6d28d9` `#5b21b6` `#4c1d95` `#2e1065` |
| `Purple` | `#faf5ff` `#f3e8ff` `#e9d5ff` `#d8b4fe` `#c084fc` `#a855f7` `#9333ea` `#7e22ce` `#6b21a8` `#581c87` `#3b0764` |
| `Fuchsia` | `#fdf4ff` `#fae8ff` `#f5d0fe` `#f0abfc` `#e879f9` `#d946ef` `#c026d3` `#a21caf` `#86198f` `#701a75` `#4a044e` |
| `Pink` | `#fdf2f8` `#fce7f3` `#fbcfe8` `#f9a8d4` `#f472b6` `#ec4899` `#db2777` `#be185d` `#9d174d` `#831843` `#500724` |
| `Rose` | `#fff1f2` `#ffe4e6` `#fecdd3` `#fda4af` `#fb7185` `#f43f5e` `#e11d48` `#be123c` `#9f1239` `#881337` `#4c0519` |

## Verläufe, Schatten, Transformationen, Easing, Schriften

### Verläufe

`LinearGradient`, `RadialGradient` und `ConicGradient` sind `Paint`-Werte und überall erlaubt, wo eine Farbe als
Hintergrund oder Textfarbe steht (`.textColor(Verlauf)` erzeugt Verlaufstext via `background-clip: text`).

| Erzeugung | CSS |
|---|---|
| `LinearGradient.diagonal(c1, c2, …)` | `linear-gradient(135deg, …)` |
| `LinearGradient.horizontal(…)` | `linear-gradient(90deg, …)` |
| `LinearGradient.vertical(…)` | `linear-gradient(180deg, …)` |
| `LinearGradient.angle(45.deg, …)` | `linear-gradient(45deg, …)` |
| `RadialGradient.circle(…)` / `.ellipse(…)` | `radial-gradient(circle at center, …)` |
| `RadialGradient.at(x, y, …)` | `radial-gradient(circle at x y, …)` |
| `ConicGradient.of(…)` | `conic-gradient(from 0deg, …)` |
| `Color.Red.at(30.percent)` | Farbstopp: `#ef4444 30%` |

### Schatten

`.shadow(Shadow)` setzt `box-shadow`. Voreinstellungen: `Shadow.None`, `Sm`, `Base`, `Md`, `Lg`, `Xl`, `Xxl`, `Inner`.

| Erzeugung | Bedeutung |
|---|---|
| `Shadow(x, y, blur, spread, color, inset)` | eigene Ebene (alle Parameter mit Standardwerten: `0.px, 4.px, 12.px, 0.px, schwarz 15 %, false`) |
| `Shadow.SoftGlow(color)` | weicher farbiger Schein (zweilagig) |
| `Shadow.Glow(color, radius = 24.px)` | gleichmäßiger Schein |
| `Shadow.Neon(color)` | drei gestapelte Leuchtringe |
| `Shadow.Elevation(level)` | Schatten aus einer Höhe (auch `.elevation(4.px)`) |
| `Shadow.Layered(…)`, `a.and(b)` | mehrere Schatten kombinieren |

### Transformationen

`.transform(Transform)` setzt `transform`. Mit `.then(…)` werden Transformationen verkettet. Für Einzelfälle gibt es
`.scale(f)`, `.rotate(angle)` und `.offset(x, y)` (eigenständige CSS-Eigenschaften `scale`, `rotate`, `translate`).

`Transform.identity()` (`none`), `scale(f)`, `scaleXY(x, y)`, `rotate(angle)`, `translate(x, y)`, `translateX(x)`,
`translateY(y)`, `skew(x, y)`, `perspective(d)`, `rotateX(angle)`, `rotateY(angle)`.

```texo
component Transformiert {
    fn build(): View {
        return Row(spacing: 24.px, [
            Box().size(all: 40.px).background(Color.Indigo500)
                .transform(Transform.rotate(45.deg).then(Transform.scale(1.1))),
            Box().size(all: 40.px).background(Color.Pink500).transform(Transform.translateY(-4.px)),
            Box().size(all: 40.px).background(Color.Amber500).rotate(15.deg).scale(1.2),
            Box().size(all: 40.px).background(Color.Emerald500)
                .shadow(Shadow.Neon(Color.Emerald400))
                .hover(b => b.shadow(Shadow.Glow(Color.Emerald300, radius: 32.px)))
        ])
    }
}
```

### Easing

`Easing.Linear` (`linear`), `Ease`, `EaseIn`, `EaseOut`, `EaseInOut`, `Spring` (`cubic-bezier(0.34, 1.56, 0.64, 1)`),
`Bounce` (`cubic-bezier(0.68, -0.55, 0.265, 1.55)`), `Smooth`, `Snappy`, `Easing.cubic(x1, y1, x2, y2)`,
`Easing.steps(n)`. Verwendung: `.animate(duration: 300.ms, easing: Easing.Spring)`.

### Schriften

`Font.Sans` (Systemschrift, Standard), `Font.Serif`, `Font.Mono`, `Font.Rounded` und `Font.named("Inter")` (benannte Familie
mit System-Fallback). Eigene Schriftdateien legst du in `public/` und bindest sie global mit
`GlobalStyle().fontFace("Inter", "fonts/Inter.woff2")` ein – siehe [Globale Stile](#globale-stile-global).

## Icons

`Icon("name")` zeichnet eines der eingebauten Icons (24×24, Strichstärke einstellbar, Farbe = aktuelle Textfarbe) als
Inline-SVG. Auch `Button("Text", icon: "name")` nimmt diese Namen. Konstante Namen werden zur Compile-Zeit eingesetzt und
geprüft (`Unbekanntes Icon 'trahs'` mit Vorschlag `trash`), auch wenn sie über Parameter einer Funktion oder Komponente
durchgereicht werden. Nur dynamische Namen laden das Modul `texo/icons.js`; ein unbekannter Name zeichnet dort einen Kreis
und meldet sich unter `texo dev` in der Browser-Konsole.

```texo
component Icons {
    private State<Boolean> gut = State(true)
    fn build(): View {
        return Row(spacing: 8.px, [
            Icon("star", size: 24.px, strokeWidth: 1.5).textColor(Color.Amber500),
            Icon(this.gut.value ? "check-circle" : "alert-triangle", size: 20.px),   // dynamischer Name
            Button("Neu", icon: "plus")
        ])
    }
}
```

Verfügbare Namen (71 Stück):

`check`, `x`, `plus`, `minus`, `chevron-right`, `chevron-left`, `chevron-down`, `chevron-up`, `arrow-right`, `arrow-left`, `arrow-up`, `arrow-down`, `search`, `menu`, `home`, `user`, `users`, `heart`, `star`, `bell`, `mail`, `settings`, `trash`, `edit`, `sun`, `moon`, `info`, `alert-circle`, `alert-triangle`, `check-circle`, `refresh`, `external-link`, `eye`, `calendar`, `clock`, `bar-chart`, `pie-chart`, `trending-up`, `trending-down`, `activity`, `play`, `pause`, `zap`, `globe`, `lock`, `log-in`, `log-out`, `cart`, `filter`, `download`, `upload`, `copy`, `send`, `message`, `grid`, `list`, `more`, `circle`, `square`, `dollar`, `package`, `map-pin`, `image`, `file`, `folder`, `bookmark`, `tag`, `layers`, `smile`, `award`, `target`

## Mauszeiger (Cursor)

`Cursor` enthält die Standard-Zeiger des Browsers und eigene Bilder:

| Zeiger | CSS |
|---|---|
| `Default`, `Auto`, `None` | `default`, `auto`, `none` |
| `Pointer`, `Text`, `Move`, `NotAllowed`, `Help`, `Crosshair` | `pointer`, `text`, `move`, `not-allowed`, `help`, `crosshair` |
| `Grab`, `Grabbing` | `grab`, `grabbing` |
| `Wait`, `Progress` | `wait`, `progress` |
| `ZoomIn`, `ZoomOut`, `Copy`, `ContextMenu`, `Cell` | `zoom-in`, `zoom-out`, `copy`, `context-menu`, `cell` |
| `ColResize`, `RowResize`, `EwResize`, `NsResize`, `NeswResize`, `NwseResize` | Größe ändern |
| `Cursor.image(src, x = 0, y = 0, fallback = Cursor.Default)` | `url("src") x y, fallback` |

```texo
component Zeiger {
    fn build(): View {
        return Row(spacing: 12.px, [
            Card(Text("Ziehen")).cursor(Cursor.Grab),
            Card(Text("Zielen")).cursor(Cursor.image("cursor/ziel.png", x: 16, y: 16, fallback: Cursor.Crosshair))
        ])
    }
}
```

- `src` ist ein Pfad relativ zum Ordner [`public/`](#bilder-schriften-und-andere-dateien-public) (oder eine volle URL / `data:`-URL).
- `x`/`y` ist der **Hotspot** – der Punkt im Bild, der „klickt“ (bei einem Pfeil oben links `0, 0`, bei einem Fadenkreuz die Mitte).
- `fallback` wird gezeigt, solange das Bild lädt oder wenn es fehlt. Browser zeigen Bild-Cursor nur bis etwa
  128 × 128 px an; üblich sind 32 × 32 px. Formate: PNG, SVG (mit `width`/`height`), CUR.

## Globale Stile (@Global)

Für Einstellungen, die die **ganze Seite** betreffen, gibt es `GlobalStyle`. Eine mit `@Global` markierte Konstante wird
beim Kompilieren ausgewertet und als eigene Ebene `tx-global` in `app.css` geschrieben – vor allen Modifiern, aber nach den
Grundstilen der Elemente. Einzelne Elemente können globale Werte also jederzeit mit Modifiern überschreiben.

```texo
package app

import texo.ui.*
import texo.graphics.*

@Global
val Design = GlobalStyle()
    .cursor(Cursor.image("cursor/pfeil.png", x: 2, y: 2))
    .pointerCursor(Cursor.image("cursor/hand.png", x: 10, y: 2, fallback: Cursor.Pointer))
    .fontFace("Inter", "fonts/Inter.woff2", weight: "100 900")
    .fontFamily(Font.named("Inter"))
    .primaryColor(Color.Emerald600)
    .background(Color.Slate50)
    .textColor(Color.Slate800)
    .selection(background: Color.Emerald200, color: Color.Emerald950)
    .smoothScroll()
    .scrollbar(Color.Slate400, Color.Slate100)
    .variable("radius", "14px")
    .rule("h1, h2", "text-wrap", "balance")
    .dark(GlobalStyle()
        .background(Color.Slate950)
        .textColor(Color.Slate100)
        .scrollbar(Color.Slate600, Color.Slate900))

@Page(title: "Mein Design")
component App {
    fn build(): View {
        return Column(spacing: 16.px, [
            Heading("Alles im eigenen Look"),
            Button("Speichern"),
            Link("Mehr erfahren", to: "/mehr"),
            Card(Text("Eigener Radius")).css("border-radius", "var(--radius)")
        ]).padding(32.px)
    }
}
```

| Methode | Wirkung | CSS |
|---|---|---|
| `cursor(Cursor)` | Mauszeiger der ganzen Seite | `html { cursor: … }` |
| `pointerCursor(Cursor)` | Zeiger über allem Klickbaren (Links, Buttons, Checkboxen, Schalter, Slider, Auswahllisten, Labels); deaktivierte Elemente behalten `not-allowed` | `a[href], button:not(:disabled), … { cursor: … }` |
| `background(Paint)`, `textColor(Paint)` | Seitenhintergrund und Textfarbe | `body { … }` |
| `fontFamily(Font)`, `lineHeight(Float)`, `letterSpacing(Length)` | Standardschrift | `body { … }` |
| `fontSize(Length)` | Basisgröße, alle `rem`-Werte richten sich danach | `html { font-size: … }` |
| `fontFace(name, datei, weight = "400", style = "normal")` | Schriftdatei aus `public/` einbinden | `@font-face { … font-display: swap }` |
| `primaryColor(Color)` | Hauptfarbe aller eingebauten Elemente: Buttons, Links, Fokus-Rahmen, Eingabefelder, Checkboxen, Schalter, Slider, Fortschrittsbalken, Spinner (Standard Indigo `#4f46e5`) | `:root { --tx-primary: … }` |
| `surfaceColor(Color)`, `borderColor(Color)`, `fieldTextColor(Color)`, `placeholderColor(Color)` | Hintergrund von Karten und Eingabefeldern, Rahmen, Text und Platzhalter in Eingabefeldern, Textbereichen und Auswahllisten | `:root { --tx-surface: …; --tx-border: …; --tx-field-text: …; --tx-placeholder: … }` |
| `selection(background, color)` | Farben für markierten Text | `::selection { … }` |
| `smoothScroll()` | weiches Scrollen zu Ankern | `html { scroll-behavior: smooth }` |
| `scrollbar(thumb, track)` | Farben der Scrollbalken | `html { scrollbar-color: … }` |
| `variable(name, wert)` | CSS-Variable, nutzbar mit `.css("…", "var(--name)")` | `:root { --name: … }` |
| `rule(selektor, eigenschaft, wert)` | beliebige CSS-Regel (z. B. für eingebettetes HTML) | `selektor { eigenschaft: wert }` |
| `dark(GlobalStyle)` | Werte nur im dunklen Farbschema | `@media (prefers-color-scheme: dark) { … }` |

- **Dunkelmodus der eingebauten Elemente:** Seitentext, Karten (`Card`) und Eingabefelder (`Input`, `TextArea`,
  `Select`) nutzen CSS-Variablen. Mit `.colorScheme("light dark")` wechseln sie im Dunkelmodus von selbst auf dunkle
  Werte (über `light-dark()`); ohne `colorScheme` bleiben sie hell. Eigene Werte setzt
  `.dark(GlobalStyle().surfaceColor(Color.Slate800).borderColor(Color.Slate600).fieldTextColor(Color.Slate100))`.
- Mehrere `@Global`-Konstanten (auch in verschiedenen Dateien) werden in Quellreihenfolge zusammengeführt; bei gleicher
  Eigenschaft gewinnt die spätere.
- Alle Werte müssen **Konstanten** sein (`Globale Stile müssen zur Compile-Zeit feststehen`). Für Werte, die sich zur
  Laufzeit ändern, nutze Modifier an der Wurzelkomponente.
- Selektoren und Werte werden geprüft: `{`, `}`, `;` und `<` sind nicht erlaubt (`Ungültiger Selektor …`).

## Design-Tokens (@Theme)

Ein `object` mit `@Theme` sammelt die Design-Entscheidungen eines Projekts oder einer Bibliothek: Farben (`Color`) und
Längen (`Length`). Jedes Token wird zu einer **CSS-Variable mit Standardwert**. Wer die Komponenten benutzt, kann es
überschreiben, ohne den Code der Komponenten zu kennen. Das ist der Weg, eine Style-Bibliothek an das eigene Design
anzupassen.

```texo
package design

import texo.ui.*
import texo.graphics.*

/// Design-Tokens – überschreibbar mit GlobalStyle().theme(…)
@Theme
public object Marke {
    /// Hauptfarbe für Buttons und Links.
    val primaer: Color = Color.Indigo600
    /// Rundung von Karten und Buttons.
    val radius: Length = 12.px
}

@Global
val Design = GlobalStyle()
    .theme(Marke.primaer, Color.Emerald600)                      // ganze Seite
    .dark(GlobalStyle().theme(Marke.primaer, Color.Emerald400))  // im Dunkelmodus

component Aktion {
    fn build(): View => Row(spacing: 8.px, [
        Button("Speichern").background(Marke.primaer).radius(Marke.radius),
        Button("Löschen").background(Marke.primaer).radius(Marke.radius)
            .theme(Marke.primaer, Color.Rose600)                 // nur dieses Element (und alles darin)
    ])
}
```

| Schreibweise | erzeugtes CSS |
|---|---|
| `.background(Marke.primaer)` | `background: var(--design-marke-primaer, #4f46e5)` |
| `GlobalStyle().theme(Marke.primaer, Color.Emerald600)` | `:root { --design-marke-primaer: #059669; }` |
| `.theme(Marke.primaer, Color.Rose600)` | Klasse mit `--design-marke-primaer: #e11d48` am Element: gilt für alle Nachfahren |

- Der Variablenname besteht aus Paket, Objekt und Feld (`--design-marke-primaer`). So kommen sich Bibliotheken nicht in
  die Quere.
- `.theme(…)` ist typgeprüft: Eine Farbe lässt sich nur mit einer Farbe überschreiben, eine Länge nur mit einer Länge.
  Werte, die keine Tokens sind, lehnt der Compiler ab (`… ist kein Theme-Token`).
- `.theme(token, wert)` darf auch dynamisch sein (`this.rot.value ? Color.Rose500 : Color.Blue500`).
- Tokens sind `val`-Felder mit konstantem Standardwert. Im Code verhalten sie sich wie normale Werte. Farb-Tokens
  lassen sich weiterverarbeiten: `Marke.primaer.opacity(0.1)` ergibt `color-mix(in srgb, var(--design-marke-primaer, …) 10%, transparent)`.

## Bilder, Schriften und andere Dateien (public/)

Dateien im Ordner `public/` neben `src/` (Bilder, Cursor, Schriften, `favicon.ico`, `robots.txt` …) übernimmt
`texo build` unverändert in die Ausgabe – bei statischen Projekten neben die Seiten, mit Backend nach `dist/public/`.
`texo dev` liefert sie direkt aus. Pfade in `Image(…)`, `Cursor.image(…)` und `fontFace(…)` sind relativ zu diesem Ordner:

```
mein-projekt/
├── public/
│   ├── logo.svg              → Image("logo.svg")
│   ├── cursor/hand.png       → Cursor.image("cursor/hand.png")
│   └── fonts/Inter.woff2     → GlobalStyle().fontFace("Inter", "fonts/Inter.woff2")
├── src/
└── texo.json                 "public": "public" (Standard; anderer Ordnername möglich)
```

Erzeugte Dateien haben Vorrang: Liegt in `public/` etwa eine `index.html`, wird sie nicht kopiert (mit Hinweis).

## Enums der UI-Bibliothek

| Enum | Werte |
|---|---|
| `FontWeight` | `Thin` (100), `ExtraLight` (200), `Light` (300), `Regular` (400), `Medium` (500), `SemiBold` (600), `Bold` (700), `ExtraBold` (800), `Heavy` (800), `Black` (900) |
| `Alignment` | `start`, `center`, `end`, `spaceBetween`, `spaceAround`, `spaceEvenly`, `stretch` (Verteilung entlang der Hauptachse, `justify-content`) |
| `CrossAlignment` | `start`, `center`, `end`, `stretch`, `baseline` (Ausrichtung quer, `align-items`/`align-self`) |
| `TextAlign` | `Left`, `Center`, `Right`, `Justify` |
| `ImageFit` | `Cover`, `Contain`, `Fill`, `None`, `ScaleDown` |
| `Overflow` | `Visible`, `Hidden`, `Scroll`, `Auto` |
| `Edge` | `All`, `Top`, `Bottom`, `Left`, `Right`, `Horizontal`, `Vertical` |
| `BorderStyle` | `Solid`, `Dashed`, `Dotted`, `Double`, `None` |
| `Axis` | `Vertical`, `Horizontal`, `Both` |
| `InputType` | `Text`, `Password`, `Email`, `Number`, `Search`, `Date`, `Time`, `Url`, `Tel`, `Color` |
| `Breakpoint` | `sm`, `md`, `lg`, `xl` |

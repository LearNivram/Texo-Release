<!-- Übernommen aus LearNivram/Texo (docs/api-referenz.md) mit scripts/docs-uebernehmen.mjs – bitte dort ändern. -->

# API-Referenz der Standardbibliothek

<!-- Generiert aus den `///`-Kommentaren in crates/texo-stdlib/std/*.texo – nicht von Hand bearbeiten. -->

Alle Klassen, Aufzählungen, Funktionen und Modifier, die Texo mitbringt – mit Signatur und Beschreibung.
Die gleichen Texte zeigt die VS-Code-Erweiterung beim Überfahren mit der Maus.

**Lesehilfe:**

- `fn name(a: Int, b: String = "x"): Rückgabe` – Methode; Parameter mit `=` sind optional und können benannt übergeben werden: `name(1, b: "y")`.
- `val` = nur lesbar, `var` = les- und schreibbar, `static` = über den Typ aufrufen (`Color.hex("#fff")`).
- `...children: View` – beliebig viele Argumente. `T?` – darf `null` sein. `(T) => R` – Funktion/Lambda.
- `Self` – Modifier geben das Element selbst zurück und lassen sich verketten: `Text("Hi").bold().padding(8.px)`.
- Markierungen: *Element* erzeugt ein HTML-Element, *Modifier* wird zu CSS, *Variante* gilt nur in einem Zustand
  (z. B. `hover`, `dark`, `md`), *Ereignis* reagiert auf Benutzeraktionen, *Übergang* blendet beim Erscheinen und Verschwinden ein und aus,
  *verändert das Objekt* ändert den Empfänger selbst.

Einführungen mit Beispielen: [Erste Schritte](erste-schritte.md) · [Sprachreferenz](sprachreferenz.md) ·
[UI und Styling](ui-und-styling.md) · [Reaktivität](reaktivitaet.md) · [Backend](backend.md)

## Inhalt

- [`texo.core`](#texo-core): [Any](#any) · [Void](#void) · [Nothing](#nothing) · [Boolean](#boolean) · [Int](#int) · [Float](#float) · [String](#string) · [Url](#url) · [List](#list) · [Map](#map) · [Pair](#pair) · [State](#state) · [Computed](#computed) · [Future](#future) · [Stream](#stream) · [Resource](#resource) · [Access](#access) · [Error](#error) · [I18n](#i18n) · [Translations](#translations) · [ValidationError](#validationerror) · [ValidationException](#validationexception) · [Math](#math) · [Random](#random) · [Console](#console) · [Json](#json) · [Storage](#storage) · [Http](#http) · [Timer](#timer) · [DateTime](#datetime) · [Upload](#upload) · [Clipboard](#clipboard) · [Passkey](#passkey) · [Listener](#listener) · [Window](#window)
- [`texo.graphics`](#texo-graphics): [Paint](#paint) · [Color](#color) · [Gradient](#gradient) · [LinearGradient](#lineargradient) · [RadialGradient](#radialgradient) · [ConicGradient](#conicgradient) · [Length](#length) · [Size](#size) · [Duration](#duration) · [Angle](#angle) · [Shadow](#shadow) · [Transform](#transform) · [Easing](#easing) · [Font](#font) · [Position](#position) · [ClipPath](#clippath)
- [`texo.ui`](#texo-ui): [FontWeight](#fontweight) · [Alignment](#alignment) · [CrossAlignment](#crossalignment) · [TextAlign](#textalign) · [ImageFit](#imagefit) · [Overflow](#overflow) · [Edge](#edge) · [BorderStyle](#borderstyle) · [Axis](#axis) · [InputType](#inputtype) · [Breakpoint](#breakpoint) · [Display](#display) · [FlexDirection](#flexdirection) · [BlendMode](#blendmode) · [WhiteSpace](#whitespace) · [WordBreak](#wordbreak) · [TextWrap](#textwrap) · [WritingMode](#writingmode) · [TextDirection](#textdirection) · [VerticalAlign](#verticalalign) · [DecorationStyle](#decorationstyle) · [TouchAction](#touchaction) · [SnapAlign](#snapalign) · [Overscroll](#overscroll) · [GridFlow](#gridflow) · [AnimationDirection](#animationdirection) · [FillMode](#fillmode) · [FloatSide](#floatside) · [BackgroundSize](#backgroundsize) · [ToastKind](#toastkind) · [View](#view) · [Container](#container) · [Text](#text) · [Heading](#heading) · [Paragraph](#paragraph) · [Button](#button) · [Icon](#icon) · [Image](#image) · [Media](#media) · [Video](#video) · [Audio](#audio) · [Input](#input) · [TextArea](#textarea) · [Checkbox](#checkbox) · [FilePicker](#filepicker) · [Toggle](#toggle) · [Slider](#slider) · [Select](#select) · [Label](#label) · [TableColumn](#tablecolumn) · [Table](#table) · [Combobox](#combobox) · [Stack](#stack) · [Row](#row) · [Column](#column) · [Box](#box) · [Grid](#grid) · [Card](#card) · [ScrollView](#scrollview) · [SlotHost](#slothost) · [ChildPlaceholder](#childplaceholder) · [Lazy](#lazy) · [ErrorBoundary](#errorboundary) · [Spacer](#spacer) · [Divider](#divider) · [Shape](#shape) · [Link](#link) · [FormAction](#formaction) · [Form](#form) · [ProgressBar](#progressbar) · [Spinner](#spinner) · [Empty](#empty) · [ForEach](#foreach) · [If](#if) · [Dialog](#dialog) · [Tabs](#tabs) · [Tab](#tab) · [Menu](#menu) · [MenuItem](#menuitem) · [Toast](#toast) · [Transition](#transition) · [Router](#router) · [Route](#route) · [RouteParams](#routeparams) · [Ref](#ref) · [Context](#context) · [Navigator](#navigator) · [Keyframe](#keyframe) · [Cursor](#cursor) · [GlobalStyle](#globalstyle)
- [`texo.server`](#texo-server): [Request](#request) · [Session](#session) · [Env](#env) · [Secret](#secret) · [Config](#config) · [Password](#password) · [Passkeys](#passkeys) · [PasskeyKey](#passkeykey) · [OAuthProvider](#oauthprovider) · [OAuth](#oauth) · [OAuthProfile](#oauthprofile) · [Files](#files) · [Mail](#mail) · [MailPart](#mailpart) · [SentMail](#sentmail) · [Tokens](#tokens) · [Jobs](#jobs) · [Cache](#cache) · [Kv](#kv) · [KvError](#kverror) · [Log](#log) · [Trace](#trace) · [Metrics](#metrics) · [MetricCounter](#metriccounter) · [MetricGauge](#metricgauge) · [MetricHistogram](#metrichistogram) · [Channel](#channel) · [HttpError](#httperror) · [HttpApiError](#httpapierror)
- [`texo.test`](#texo-test): [TestClient](#testclient) · [TestResponse](#testresponse) · [Clock](#clock)
- [`texo.db`](#texo-db): [Query](#query) · [GroupedQuery](#groupedquery) · [Group](#group) · [Selection](#selection) · [DbTable](#dbtable) · [SearchQuery](#searchquery) · [Treffer](#treffer) · [Aenderung](#aenderung) · [FeldAenderung](#feldaenderung) · [Relation](#relation) · [UniqueException](#uniqueexception) · [ForbiddenException](#forbiddenexception) · [Db](#db)
- [`texo.admin`](#texo-admin): [AdminConsole](#adminconsole) · [TableRef](#tableref)

<a id="texo-core"></a>

## Paket `texo.core`

Grundtypen, Collections, Reaktivität und Hilfsobjekte. Wird in jede Datei **automatisch importiert**.

<a id="any"></a>

### `class Any`

Obertyp aller Werte.

<a id="void"></a>

### `class Void`

Rückgabetyp von Funktionen, die nichts zurückgeben.

<a id="nothing"></a>

### `class Nothing`

Typ des Literals 'null'.

<a id="boolean"></a>

### `class Boolean`

Wahrheitswert: true oder false.

| Signatur | Beschreibung |
|---|---|
| `fn toString(): String` | Liefert "true" oder "false". |

<a id="int"></a>

### `class Int`

Ganzzahl (intern eine JavaScript-Zahl). Division schneidet ab: 7 / 2 → 3; Division durch 0 löst einen Fehler aus.

| Signatur | Beschreibung |
|---|---|
| `fn toString(): String` | Wandelt die Zahl in Text um: 42.toString() → "42" |
| `fn toFloat(): Float` | Liefert denselben Wert als Float. |

#### Formatierung

| Signatur | Beschreibung |
|---|---|
| `fn formatNumber(locale: String = "en-US"): String` | Formatiert mit Tausendertrennzeichen der Locale (Standard "en-US"): 1420 → "1,420" |
| `fn formatCompact(locale: String = "en-US"): String` | Kompakte Schreibweise mit höchstens einer Nachkommastelle: 15300 → "15.3K" |
| `fn formatCurrency(currency: String = "EUR", locale: String = "de-DE"): String` | Formatiert als Geldbetrag (Standard: Euro, "de-DE"): 1420.formatCurrency() → "1.420,00 €" |

#### Rechnen

| Signatur | Beschreibung |
|---|---|
| `fn abs(): Int` | Betrag der Zahl: (-5).abs() → 5 |
| `fn clamp(min: Int, max: Int): Int` | Begrenzt die Zahl auf den Bereich min..max: 15.clamp(0, 10) → 10 |
| `fn isEven(): Boolean` | true, wenn die Zahl gerade ist. |
| `fn isOdd(): Boolean` | true, wenn die Zahl ungerade ist. |
| `fn pad(width: Int, char: String = "0"): String` | Füllt links auf die Breite 'width' auf (Standard mit "0"): 7.pad(3) → "007" |

#### Einheiten

| Signatur | Beschreibung |
|---|---|
| `val px: Length` | Länge in Pixeln: 16.px → 16px |
| `val rem: Length` | Länge relativ zur Schriftgröße des Wurzelelements: 2.rem → 2rem |
| `val em: Length` | Länge relativ zur eigenen Schriftgröße: 2.em → 2em |
| `val percent: Length` | Länge in Prozent des Elternelements: 50.percent → 50% |
| `val vw: Length` | Länge in Prozent der Fensterbreite: 100.vw → 100vw |
| `val vh: Length` | Länge in Prozent der Fensterhöhe: 100.vh → 100vh |
| `val fr: Length` | Anteil des freien Platzes im Grid: 1.fr → 1fr |
| `val ch: Length` | Breite der Ziffer 0 in der aktuellen Schrift (ch) – ideal für Textbreiten: .maxWidth(65.ch) |
| `val ex: Length` | Höhe des kleinen x der aktuellen Schrift (ex). |
| `val pt: Length` | Typografischer Punkt (pt, 1/72 Zoll), vor allem für den Druck. |
| `val vmin: Length` | Prozent der kleineren Fensterseite (vmin). |
| `val vmax: Length` | Prozent der größeren Fensterseite (vmax). |
| `val dvh: Length` | Prozent der dynamischen Fensterhöhe (dvh) – berücksichtigt ein- und ausfahrende Browserleisten auf Handys. |
| `val svh: Length` | Prozent der kleinsten Fensterhöhe (svh, Browserleisten ausgefahren). |
| `val lvh: Length` | Prozent der größten Fensterhöhe (lvh, Browserleisten eingefahren). |
| `val dvw: Length` | Prozent der dynamischen Fensterbreite (dvw). |
| `val cqw: Length` | Prozent der Breite des Abfrage-Containers (cqw, siehe .queryContainer()). |
| `val cqh: Length` | Prozent der Höhe des Abfrage-Containers (cqh). |
| `val lh: Length` | Vielfaches der Zeilenhöhe (lh). |
| `val ms: Duration` | Dauer in Millisekunden: 300.ms |
| `val s: Duration` | Dauer in Sekunden: 2.s → 2000 ms |
| `val min: Duration` | Dauer in Minuten: 15.min |
| `val h: Duration` | Dauer in Stunden: 2.h |
| `val d: Duration` | Dauer in Tagen: 7.d |
| `val deg: Angle` | Winkel in Grad: 90.deg |
| `val turn: Angle` | Winkel in Umdrehungen: 1.turn → 360deg |
| `val rad: Angle` | Winkel im Bogenmaß (rad): 3.14.rad |

<a id="float"></a>

### `class Float`

Gleitkommazahl (intern eine JavaScript-Zahl).

| Signatur | Beschreibung |
|---|---|
| `fn toString(): String` | Wandelt die Zahl in Text um: 1.5.toString() → "1.5" |
| `fn toInt(): Int` | Schneidet die Nachkommastellen ab: 2.7.toInt() → 2, (-2.7).toInt() → -2 |
| `fn round(): Int` | Rundet kaufmännisch auf eine Ganzzahl: 2.5.round() → 3 |
| `fn floor(): Int` | Rundet ab: 2.7.floor() → 2 |
| `fn ceil(): Int` | Rundet auf: 2.1.ceil() → 3 |
| `fn abs(): Float` | Betrag der Zahl: (-1.5).abs() → 1.5 |
| `fn clamp(min: Float, max: Float): Float` | Begrenzt die Zahl auf den Bereich min..max: 1.4.clamp(0.0, 1.0) → 1.0 |

#### Formatierung

| Signatur | Beschreibung |
|---|---|
| `fn toFixed(digits: Int): String` | Text mit genau 'digits' Nachkommastellen (Punkt als Trenner): 3.14159.toFixed(2) → "3.14" |
| `fn formatNumber(locale: String = "en-US", digits: Int? = null): String` | Formatiert nach Locale (Standard "en-US"), optional mit festen Nachkommastellen: 1234.5.formatNumber("de-DE", 2) → "1.234,50" |
| `fn formatPercent(digits: Int = 0, locale: String = "en-US"): String` | Formatiert einen Anteil als Prozent (Standard: 0 Nachkommastellen): 0.25.formatPercent() → "25%" |
| `fn formatCompact(locale: String = "en-US"): String` | Kompakte Schreibweise mit höchstens einer Nachkommastelle: 15300.0.formatCompact() → "15.3K" |
| `fn formatCurrency(currency: String = "EUR", locale: String = "de-DE"): String` | Formatiert als Geldbetrag (Standard: Euro, "de-DE"): 9.99.formatCurrency() → "9,99 €" |

#### Einheiten

| Signatur | Beschreibung |
|---|---|
| `val px: Length` | Länge in Pixeln: 1.5.px → 1.5px |
| `val rem: Length` | Länge relativ zur Schriftgröße des Wurzelelements: 1.5.rem → 1.5rem |
| `val em: Length` | Länge relativ zur eigenen Schriftgröße: 1.5.em → 1.5em |
| `val percent: Length` | Länge in Prozent des Elternelements: 33.3.percent → 33.3% |
| `val vw: Length` | Länge in Prozent der Fensterbreite. |
| `val vh: Length` | Länge in Prozent der Fensterhöhe. |
| `val fr: Length` | Anteil des freien Platzes im Grid: 1.5.fr |
| `val ch: Length` | Breite der Ziffer 0 in der aktuellen Schrift (ch) – ideal für Textbreiten: .maxWidth(65.ch) |
| `val ex: Length` | Höhe des kleinen x der aktuellen Schrift (ex). |
| `val pt: Length` | Typografischer Punkt (pt, 1/72 Zoll), vor allem für den Druck. |
| `val vmin: Length` | Prozent der kleineren Fensterseite (vmin). |
| `val vmax: Length` | Prozent der größeren Fensterseite (vmax). |
| `val dvh: Length` | Prozent der dynamischen Fensterhöhe (dvh) – berücksichtigt ein- und ausfahrende Browserleisten auf Handys. |
| `val svh: Length` | Prozent der kleinsten Fensterhöhe (svh, Browserleisten ausgefahren). |
| `val lvh: Length` | Prozent der größten Fensterhöhe (lvh, Browserleisten eingefahren). |
| `val dvw: Length` | Prozent der dynamischen Fensterbreite (dvw). |
| `val cqw: Length` | Prozent der Breite des Abfrage-Containers (cqw, siehe .queryContainer()). |
| `val cqh: Length` | Prozent der Höhe des Abfrage-Containers (cqh). |
| `val lh: Length` | Vielfaches der Zeilenhöhe (lh). |
| `val ms: Duration` | Dauer in Millisekunden. |
| `val s: Duration` | Dauer in Sekunden: 0.5.s → 500 ms |
| `val min: Duration` | Dauer in Minuten: 1.5.min → 90 s |
| `val h: Duration` | Dauer in Stunden: 0.5.h → 30 min |
| `val d: Duration` | Dauer in Tagen: 0.5.d → 12 h |
| `val deg: Angle` | Winkel in Grad: 45.5.deg |
| `val turn: Angle` | Winkel in Umdrehungen: 0.5.turn → 180deg |
| `val rad: Angle` | Winkel im Bogenmaß (rad): 3.14.rad |

<a id="string"></a>

### `class String`

Text (unveränderlich; alle Methoden liefern einen neuen String).

| Signatur | Beschreibung |
|---|---|
| `val length: Int` | Anzahl der Zeichen (UTF-16-Einheiten): "abc".length → 3 |
| `fn toString(): String` | Liefert den Text selbst. |

#### Umwandeln

| Signatur | Beschreibung |
|---|---|
| `fn upper(): String` | Wandelt alle Buchstaben in Großbuchstaben um: "abc".upper() → "ABC" |
| `fn lower(): String` | Wandelt alle Buchstaben in Kleinbuchstaben um: "ABC".lower() → "abc" |
| `fn trim(): String` | Entfernt Leerraum am Anfang und Ende: "  hi ".trim() → "hi" |

#### Suchen

| Signatur | Beschreibung |
|---|---|
| `fn contains(text: String): Boolean` | true, wenn 'text' im String vorkommt: "Hallo".contains("all") → true |
| `fn startsWith(prefix: String): Boolean` | true, wenn der String mit 'prefix' beginnt. |
| `fn endsWith(suffix: String): Boolean` | true, wenn der String mit 'suffix' endet. |
| `fn split(separator: String): List<String>` | Zerlegt den String an jedem Vorkommen von 'separator': "a,b,c".split(",") → ["a", "b", "c"] |
| `fn replace(target: String, replacement: String): String` | Ersetzt alle Vorkommen von 'target': "a-b-c".replace("-", "+") → "a+b+c" |
| `fn substring(start: Int, end: Int? = null): String` | Teilstring von 'start' bis vor 'end' (ohne end: bis zum Ende): "Hallo".substring(1, 3) → "al" |
| `fn indexOf(text: String): Int` | Position des ersten Vorkommens von 'text', oder -1: "Hallo".indexOf("l") → 2 |
| `fn charAt(index: Int): String` | Zeichen an Position 'index'; außerhalb des Bereichs "": "abc".charAt(1) → "b" |

#### Zahlen

| Signatur | Beschreibung |
|---|---|
| `fn toInt(): Int?` | Liest eine Ganzzahl (Leerraum am Rand erlaubt), sonst null: "42".toInt() → 42, "4.2".toInt() → null |
| `fn toFloat(): Float?` | Liest eine Zahl, sonst null: "3.5".toFloat() → 3.5, "abc".toFloat() → null |

#### Prüfen

| Signatur | Beschreibung |
|---|---|
| `fn isEmpty(): Boolean` | true, wenn der String keine Zeichen enthält. |
| `fn isNotEmpty(): Boolean` | true, wenn der String mindestens ein Zeichen enthält. |
| `fn isBlank(): Boolean` | true, wenn der String leer ist oder nur Leerraum enthält: "  ".isBlank() → true |

#### Auffüllen & Zerlegen

| Signatur | Beschreibung |
|---|---|
| `fn padStart(width: Int, char: String = " "): String` | Füllt links mit 'char' (Standard: Leerzeichen) auf die Breite 'width' auf: "7".padStart(3, "0") → "007" |
| `fn padEnd(width: Int, char: String = " "): String` | Füllt rechts mit 'char' (Standard: Leerzeichen) auf die Breite 'width' auf: "ab".padEnd(4, ".") → "ab.." |
| `fn repeat(count: Int): String` | Wiederholt den String 'count'-mal: "ab".repeat(3) → "ababab" |
| `fn capitalize(): String` | Schreibt nur den ersten Buchstaben groß, der Rest bleibt unverändert: "hallo welt".capitalize() → "Hallo welt" |
| `fn chars(): List<String>` | Zerlegt den String in einzelne Zeichen: "abc".chars() → ["a", "b", "c"] |
| `fn lines(): List<String>` | Zerlegt den String an Zeilenumbrüchen (\n oder \r\n) in Zeilen. |
| `fn words(): List<String>` | Zerlegt den String an Leerraum in Wörter, ohne leere Einträge: " a  b ".words() → ["a", "b"] |

<a id="url"></a>

### `class Url`

Geprüfte URL für Link(to:) und Image(src:); zur Laufzeit ein String. Textliterale werden zur Compile-Zeit geprüft:
erlaubt sind relative Pfade, #anker, ?abfragen sowie http:, https:, mailto:, tel:, sms: und data:image/.
Bei interpolierten Texten legt der feste Anfang (etwa "/profil/") das Schema fest; Texte zur Laufzeit gehen über Url.parse(text) ?? "#".

| Signatur | Beschreibung |
|---|---|
| `fn toString(): String` | Die URL als Text. |
| `static fn parse(text: String): Url?` | Prüft einen Text zur Laufzeit; null bei unsicheren Schemata wie javascript:: Url.parse(profil.website) ?? "#" |

<a id="list"></a>

### `class List<T>`

Geordnete, veränderbare Liste (ein JavaScript-Array). Ist sie in einem State gespeichert, aktualisieren verändernde Methoden die UI automatisch.

| Signatur | Beschreibung |
|---|---|
| `List<T>()` | Erzeugt eine leere Liste: List&lt;Int&gt;() |

#### Größe & Zugriff

| Signatur | Beschreibung |
|---|---|
| `val size: Int` | Anzahl der Elemente. |
| `val indices: List<Int>` | Alle gültigen Indizes: ["a", "b"].indices → [0, 1] |
| `fn isEmpty(): Boolean` | true, wenn die Liste keine Elemente enthält. |
| `fn isNotEmpty(): Boolean` | true, wenn die Liste mindestens ein Element enthält. |
| `fn get(index: Int): T` | Element an Position 'index' (ab 0); löst einen Fehler aus, wenn der Index außerhalb liegt. |
| `fn first(): T?` | Erstes Element, oder null bei leerer Liste. |
| `fn last(): T?` | Letztes Element, oder null bei leerer Liste. |

#### Verändern (verändert die Liste selbst)

| Signatur | Beschreibung |
|---|---|
| `fn add(item: T): Void` | Hängt 'item' am Ende an (verändert die Liste selbst). *(verändert das Objekt)* |
| `fn addAll(items: List<T>): Void` | Hängt alle Elemente von 'items' am Ende an (verändert die Liste selbst). *(verändert das Objekt)* |
| `fn insert(index: Int, item: T): Void` | Fügt 'item' an Position 'index' ein; nachfolgende Elemente rücken auf (verändert die Liste selbst). *(verändert das Objekt)* |
| `fn removeAt(index: Int): T` | Entfernt das Element an Position 'index' und gibt es zurück; Fehler bei ungültigem Index (verändert die Liste selbst). *(verändert das Objekt)* |
| `fn remove(item: T): Boolean` | Entfernt das erste Element, das gleich (==) 'item' ist; true, wenn eines gefunden wurde (verändert die Liste selbst). *(verändert das Objekt)* |
| `fn removeWhere(predicate: (T) => Boolean): Int` | Entfernt alle Elemente, für die 'predicate' true liefert, und gibt deren Anzahl zurück (verändert die Liste selbst). *(verändert das Objekt)* |
| `fn clear(): Void` | Entfernt alle Elemente (verändert die Liste selbst). *(verändert das Objekt)* |
| `fn set(index: Int, item: T): Void` | Ersetzt das Element an Position 'index' durch 'item' (verändert die Liste selbst). *(verändert das Objekt)* |
| `fn sortBy<K>(selector: (T) => K): Void` | Sortiert aufsteigend nach dem Schlüssel aus 'selector' (verändert die Liste selbst): users.sortBy(u => u.name) *(verändert das Objekt)* |
| `fn reverse(): Void` | Kehrt die Reihenfolge um (verändert die Liste selbst); siehe auch reversed(). *(verändert das Objekt)* |

#### Suchen

| Signatur | Beschreibung |
|---|---|
| `fn contains(item: T): Boolean` | true, wenn ein Element gleich (==, strukturell) 'item' ist. |
| `fn indexOf(item: T): Int` | Index des ersten Elements, das gleich (==) 'item' ist, oder -1. |

#### Transformieren

| Signatur | Beschreibung |
|---|---|
| `fn map<R>(transform: (T, Int) => R): List<R>` | Wendet 'transform' (Element, Index) auf jedes Element an: [1, 2].map(x => x * 2) → [2, 4] |
| `fn filter(predicate: (T, Int) => Boolean): List<T>` | Neue Liste mit allen Elementen, für die 'predicate' (Element, Index) true liefert: [1, 2, 3].filter(x => x &gt; 1) → [2, 3] |
| `fn flatMap<R>(transform: (T) => List<R>): List<R>` | Bildet jedes Element auf eine Liste ab und fügt alle zu einer Liste zusammen: [1, 2].flatMap(x => [x, x]) → [1, 1, 2, 2] |
| `fn find(predicate: (T) => Boolean): T?` | Erstes Element, für das 'predicate' true liefert, oder null. |
| `fn findIndex(predicate: (T) => Boolean): Int` | Index des ersten Elements, für das 'predicate' true liefert, oder -1. |
| `fn any(predicate: (T) => Boolean): Boolean` | true, wenn 'predicate' für mindestens ein Element true liefert (false bei leerer Liste). |
| `fn all(predicate: (T) => Boolean): Boolean` | true, wenn 'predicate' für alle Elemente true liefert (true bei leerer Liste). |
| `fn count(predicate: (T) => Boolean): Int` | Anzahl der Elemente, für die 'predicate' true liefert. |
| `fn forEach(action: (T, Int) => Void): Void` | Führt 'action' (Element, Index) für jedes Element aus. |
| `fn reduce<R>(initial: R, operation: (R, T) => R): R` | Fasst alle Elemente ausgehend von 'initial' zusammen: [1, 2, 3].reduce(0, (acc, x) => acc + x) → 6 |

#### Aggregieren

| Signatur | Beschreibung |
|---|---|
| `fn sum(): T` | Summe aller Elemente (0 bei leerer Liste): [1, 2, 3].sum() → 6 |
| `fn sumOf<N>(selector: (T) => N): N` | Summe der Werte aus 'selector': items.sumOf(i => i.price) |
| `fn average(): Float` | Durchschnitt aller Elemente (0.0 bei leerer Liste). |
| `fn min(): T?` | Kleinstes Element, oder null bei leerer Liste (Strings alphabetisch). |
| `fn max(): T?` | Größtes Element, oder null bei leerer Liste (Strings alphabetisch). |
| `fn minBy<K>(selector: (T) => K): T?` | Element mit dem kleinsten Schlüssel aus 'selector', oder null bei leerer Liste. |
| `fn maxBy<K>(selector: (T) => K): T?` | Element mit dem größten Schlüssel aus 'selector', oder null bei leerer Liste: users.maxBy(u => u.age) |

#### Sortieren & Ausschnitte (neue Liste)

| Signatur | Beschreibung |
|---|---|
| `fn sorted(): List<T>` | Neue, aufsteigend sortierte Liste (Strings alphabetisch nach Locale); das Original bleibt unverändert. |
| `fn sortedBy<K>(selector: (T) => K): List<T>` | Neue Liste, aufsteigend sortiert nach dem Schlüssel aus 'selector': users.sortedBy(u => u.name) |
| `fn sortedByDescending<K>(selector: (T) => K): List<T>` | Neue Liste, absteigend sortiert nach dem Schlüssel aus 'selector'. |
| `fn reversed(): List<T>` | Neue Liste in umgekehrter Reihenfolge; das Original bleibt unverändert. |
| `fn take(count: Int): List<T>` | Die ersten 'count' Elemente: [1, 2, 3].take(2) → [1, 2] |
| `fn drop(count: Int): List<T>` | Alle Elemente außer den ersten 'count': [1, 2, 3].drop(1) → [2, 3] |
| `fn takeLast(count: Int): List<T>` | Die letzten 'count' Elemente: [1, 2, 3].takeLast(2) → [2, 3] |
| `fn slice(start: Int, end: Int? = null): List<T>` | Elemente von 'start' bis vor 'end' (ohne end: bis zum Ende); negative Werte zählen vom Ende. |
| `fn join(separator: String = ", "): String` | Verbindet alle Elemente als Text (Standard-Trenner ", "): [1, 2, 3].join("-") → "1-2-3" |
| `fn distinct(): List<T>` | Neue Liste ohne Duplikate (Vergleich mit ==), Reihenfolge des ersten Auftretens bleibt erhalten. |
| `fn copy(): List<T>` | Flache Kopie der Liste. |
| `fn groupBy<K>(selector: (T) => K): Map<K, List<T>>` | Gruppiert die Elemente nach dem Schlüssel aus 'selector': words.groupBy(w => w.length) |
| `fn chunked(size: Int): List<List<T>>` | Teilt die Liste in Stücke der Größe 'size'; das letzte kann kleiner sein: [1, 2, 3].chunked(2) → [[1, 2], [3]] |
| `fn shuffled(): List<T>` | Neue Liste in zufälliger Reihenfolge; das Original bleibt unverändert. |

<a id="map"></a>

### `class Map<K, V>`

Zuordnung von Schlüsseln zu Werten (eine JavaScript-Map); behält die Einfügereihenfolge bei. Objekt-Schlüssel werden per Identität verglichen.

| Signatur | Beschreibung |
|---|---|
| `Map<K, V>()` | Erzeugt eine leere Map: Map&lt;String, Int&gt;() |
| `val size: Int` | Anzahl der Einträge. |
| `fn get(key: K): V?` | Wert zu 'key', oder null, wenn der Schlüssel fehlt. |
| `fn getOrDefault(key: K, fallback: V): V` | Wert zu 'key', oder 'fallback', wenn der Schlüssel fehlt. |
| `fn set(key: K, value: V): Void` | Setzt den Wert zu 'key' (fügt hinzu oder überschreibt; verändert die Map selbst). *(verändert das Objekt)* |
| `fn has(key: K): Boolean` | true, wenn ein Eintrag für 'key' existiert. |
| `fn remove(key: K): Boolean` | Entfernt den Eintrag zu 'key'; true, wenn er existierte (verändert die Map selbst). *(verändert das Objekt)* |
| `fn clear(): Void` | Entfernt alle Einträge (verändert die Map selbst). *(verändert das Objekt)* |
| `fn keys(): List<K>` | Alle Schlüssel in Einfügereihenfolge. |
| `fn values(): List<V>` | Alle Werte in Einfügereihenfolge. |
| `fn entries(): List<Pair<K, V>>` | Alle Einträge als Paare (first = Schlüssel, second = Wert). |
| `fn forEach(action: (K, V) => Void): Void` | Führt 'action' (Schlüssel, Wert) für jeden Eintrag aus. |
| `fn isEmpty(): Boolean` | true, wenn die Map keine Einträge enthält. |

<a id="pair"></a>

### `class Pair<A, B>`

Unveränderliches Paar aus zwei Werten, z. B. ein Eintrag aus Map.entries(). Wird als "(a, b)" ausgegeben.

| Signatur | Beschreibung |
|---|---|
| `Pair<A, B>(first: A, second: B)` | Erzeugt ein Paar: Pair("x", 1) |
| `val first: A` | Erster Wert. |
| `val second: B` | Zweiter Wert. |

<a id="state"></a>

### `class State<T>`

Reaktiver Container: Ändert sich 'value', aktualisieren sich alle UI-Teile, die den Wert gelesen haben.

| Signatur | Beschreibung |
|---|---|
| `State<T>(initial: T)` | Erzeugt einen State mit dem Startwert 'initial': State(0) |
| `var value: T` | Aktueller Wert. Lesen abonniert Änderungen (reaktiv); Setzen benachrichtigt nur, wenn sich der Wert ändert. |
| `fn set(value: T): Void` | Setzt den Wert, wie 'value = ...'. |
| `fn update(transform: (T) => T): Void` | Berechnet den neuen Wert aus dem alten: count.update(n => n + 1) |
| `fn peek(): T` | Liest den Wert, ohne Änderungen zu abonnieren. |
| `fn notify(): Void` | Meldet eine Änderung, nachdem der Wert direkt verändert wurde (für Änderungen, die der Compiler nicht selbst erkennt). |
| `static fn persisted<V>(key: String, initial: V): State<V>` | State, der als JSON im localStorage (Schlüssel "texo:" + key) gespeichert und beim nächsten Besuch wiederhergestellt wird. |

<a id="computed"></a>

### `class Computed<T>`

Abgeleiteter reaktiver Wert, der neu berechnet wird, wenn sich die gelesenen States ändern.

| Signatur | Beschreibung |
|---|---|
| `Computed<T>(compute: () => T)` | Erzeugt den Wert aus 'compute' und berechnet ihn bei Änderungen neu: Computed(() => price.value * qty.value) |
| `val value: T` | Aktueller Wert (schreibgeschützt); Lesen abonniert Änderungen. |
| `fn peek(): T` | Liest den Wert, ohne Änderungen zu abonnieren. |

<a id="future"></a>

### `class Future<T>`

Ergebnis einer asynchronen Operation; den Wert erhält man mit 'await'.

<a id="stream"></a>

### `class Stream<T>`

Fortlaufende Werte vom Server. Eine Service-Methode 'fn chat(): Stream&lt;Nachricht&gt;' liefert im Browser einen Stream,
der verbunden bleibt. Die Verbindung öffnet sich beim ersten Abnehmer und endet mit der Komponente oder mit close().

| Signatur | Beschreibung |
|---|---|
| `fn collect(): State<List<T>>` | Alle empfangenen Werte als reaktive Liste: private State&lt;List&lt;Nachricht&gt;&gt; verlauf = Chat.raum().collect() |
| `fn latest(initial: T): State<T>` | Der zuletzt empfangene Wert, vorher 'initial'. |
| `fn onEach(action: (T) => Void): Void` | Ruft 'action' für jeden empfangenen Wert auf. |
| `fn close(): Void` | Beendet die Verbindung. |

<a id="resource"></a>

### `class Resource<T>`

Daten vom Server im Browser, reaktiv wie ein State: private Resource&lt;List&lt;Notiz&gt;&gt; notizen = Resource(() => Notizen.liste())
Lädt sofort und wieder, wenn sich States ändern, die 'load' liest; verspätete Antworten fallen weg. Komponenten, die
dieselbe Service-Methode mit denselben Argumenten laden, teilen sich Wert und Anfrage. Eine Methode mit
@Invalidates(Notizen.liste) lädt nach ihrem Aufruf alle passenden Resources neu. Siehe [Server-Daten im Browser](backend.md#server-daten-im-browser-resource-und-invalidates).

| Signatur | Beschreibung |
|---|---|
| `Resource<T>(load: () => Future<T>, initial: T? = null, refreshOnFocus: Boolean = false)` | 'load' ruft den Server auf. initial: der erste Wert ohne Anfrage, z. B. aus den Daten von @Load. refreshOnFocus: true lädt neu, wenn man in den Tab zurückkehrt. |
| `val value: T?` | Der zuletzt geladene Wert, null bis zur ersten Antwort. Bleibt beim Neuladen und nach Fehlern stehen. |
| `val loading: Boolean` | true, solange eine Anfrage läuft (auch beim Vorrendern). |
| `val error: Error?` | Der Fehler der letzten Anfrage, null nach einer erfolgreichen. |
| `fn refresh(): Future<Void>` | Lädt neu; fertig, wenn die Antwort da ist. |
| `fn mutate<R>(optimistic: (T) => T, action: () => Future<R>): Future<R?>` | Zeigt sofort optimistic(value) an und führt dann 'action' auf dem Server aus. Danach lädt die Resource neu; scheitert 'action', kommt der alte Wert zurück und 'error' zeigt den Fehler. Ergebnis von 'action' oder null. |

<a id="access"></a>

### `class Access`

Ergebnis eines Routen-Guards: erlauben, verweigern (mit HTTP-Status) oder umleiten.

| Signatur | Beschreibung |
|---|---|
| `static fn allow(): Access` | Erlaubt den Zugriff (Status 200). |
| `static fn deny(status: Int = 403, message: String = "Zugriff verweigert"): Access` | Verweigert den Zugriff mit HTTP-Status (Standard 403) und Meldung (Standard "Zugriff verweigert"). |
| `static fn redirect(to: String): Access` | Leitet auf 'to' um (Status 303): Access.redirect("/login") |
| `val allowed: Boolean` | true, wenn der Zugriff erlaubt ist. |
| `val status: Int` | HTTP-Status: 200 bei allow, der übergebene Status bei deny, 303 bei redirect. |
| `val message: String` | Meldung bei deny, sonst "". |
| `val location: String?` | Umleitungsziel (null, wenn keine Umleitung). |

<a id="error"></a>

### `class Error`

Fehlerobjekt, z. B. zum Auslösen mit 'throw'.

| Signatur | Beschreibung |
|---|---|
| `Error(message: String)` | Erzeugt einen Fehler mit der Meldung 'message'. |
| `val message: String` | Fehlermeldung. |

<a id="i18n"></a>

### `class I18n`

Sprache der Seite und Übersetzungen (Texte mit tr(…)). Übersetzungen kommen aus @Global val … = Translations(…).

| Signatur | Beschreibung |
|---|---|
| `static var locale: String` | Aktuelle Sprache (reaktiv), anfangs die der Seite (@Page(lang:)); setzen schaltet alle tr(…)-Texte um: I18n.locale = "en" |
| `static val locales: List<String>` | Sprachen, für die Übersetzungen vorhanden sind. |
| `static fn add(locale: String, texts: Map<String, String>): Void` | Fügt zur Laufzeit Übersetzungen hinzu (z. B. vom Server geladen): I18n.add("en", ["gruss": "Hello {0}!"]) |
| `static fn useBrowserLanguage(): Void` | Wechselt zur ersten Browsersprache, für die Übersetzungen vorhanden sind. |

<a id="translations"></a>

### `class Translations`

Übersetzungen für eine Sprache, beim Kompilieren eingesammelt:
@Global val Englisch = Translations("en", ["ui_kit.schliessen": "Close", "gruss": "Hello {0}!"])

| Signatur | Beschreibung |
|---|---|
| `Translations(locale: String, texts: Map<String, String>)` | Sprachcode ("en", "de-AT") und Texte (Schlüssel → Text). |

<a id="validationerror"></a>

### `class ValidationError`

Ein Verstoß gegen eine Prüfregel (@Required, @Email, @MinLength …) einer data class.

| Signatur | Beschreibung |
|---|---|
| `val field: String` | Name der Eigenschaft, z. B. "email". |
| `val message: String` | Meldung, z. B. "ist keine gültige E-Mail-Adresse". |

<a id="validationexception"></a>

### `class ValidationException: Error`

Fehler beim Speichern ungültiger Daten (insert/update in der Datenbank prüfen die Regeln automatisch).

| Signatur | Beschreibung |
|---|---|
| `val errors: List<ValidationError>` | Alle Verstöße. |

<a id="math"></a>

### `class Math`

Mathematische Konstanten und Funktionen; Winkel in Bogenmaß.

| Signatur | Beschreibung |
|---|---|
| `static val PI: Float` | Kreiszahl π ≈ 3.14159. |
| `static val E: Float` | Eulersche Zahl e ≈ 2.71828. |
| `static fn min<N>(a: N, b: N): N` | Kleinerer der beiden Werte: Math.min(3, 5) → 3 |
| `static fn max<N>(a: N, b: N): N` | Größerer der beiden Werte: Math.max(3, 5) → 5 |
| `static fn abs<N>(value: N): N` | Betrag: Math.abs(-4) → 4 |
| `static fn sqrt(value: Float): Float` | Quadratwurzel: Math.sqrt(9.0) → 3.0 |
| `static fn pow(base: Float, exponent: Float): Float` | Potenz: Math.pow(2.0, 10.0) → 1024.0 |
| `static fn floor(value: Float): Int` | Rundet ab: Math.floor(2.7) → 2 |
| `static fn ceil(value: Float): Int` | Rundet auf: Math.ceil(2.1) → 3 |
| `static fn round(value: Float): Int` | Rundet kaufmännisch: Math.round(2.5) → 3 |
| `static fn sin(value: Float): Float` | Sinus (Winkel in Bogenmaß). |
| `static fn cos(value: Float): Float` | Kosinus (Winkel in Bogenmaß). |
| `static fn tan(value: Float): Float` | Tangens (Winkel in Bogenmaß). |
| `static fn atan2(y: Float, x: Float): Float` | Winkel des Punkts (x, y) zur x-Achse in Bogenmaß (-π..π); beachte die Reihenfolge y, x. |
| `static fn log(value: Float): Float` | Natürlicher Logarithmus (Basis e). |
| `static fn exp(value: Float): Float` | e hoch 'value'. |
| `static fn sign(value: Float): Int` | Vorzeichen: -1, 0 oder 1. |
| `static fn clamp<N>(value: N, min: N, max: N): N` | Begrenzt 'value' auf den Bereich min..max: Math.clamp(15, 0, 10) → 10 |
| `static fn lerp(from: Float, to: Float, t: Float): Float` | Lineare Interpolation zwischen 'from' und 'to' (t von 0 bis 1): Math.lerp(0.0, 100.0, 0.25) → 25.0 |

<a id="random"></a>

### `class Random`

Zufallswerte (nicht kryptografisch sicher, außer uuid).

| Signatur | Beschreibung |
|---|---|
| `static fn int(min: Int, max: Int): Int` | Zufällige Ganzzahl von 'min' bis einschließlich 'max': Random.int(1, 6) |
| `static fn float(): Float` | Zufällige Zahl von 0 (einschließlich) bis 1 (ausschließlich). |
| `static fn bool(): Boolean` | true oder false mit je 50 % Wahrscheinlichkeit. |
| `static fn pick<T>(items: List<T>): T` | Zufälliges Element der Liste (die Liste darf nicht leer sein). |
| `static fn uuid(): String` | Zufällige UUID (Version 4), z. B. als eindeutige ID. |

<a id="console"></a>

### `class Console`

Ausgaben in der Entwicklerkonsole des Browsers bzw. im Server-Log.

| Signatur | Beschreibung |
|---|---|
| `static fn log(value: Any): Void` | Gibt 'value' als normale Meldung aus. |
| `static fn warn(value: Any): Void` | Gibt 'value' als Warnung aus. |
| `static fn error(value: Any): Void` | Gibt 'value' als Fehler aus. |

<a id="json"></a>

### `class Json`

Umwandlung zwischen Werten und JSON-Text.

| Signatur | Beschreibung |
|---|---|
| `static fn stringify(value: Any, pretty: Boolean = false): String` | Wandelt 'value' in JSON um (Maps werden zu Objekten); 'pretty' rückt mit 2 Leerzeichen ein. |
| `static fn parse<T>(text: String): T` | Liest JSON-Text; Fehler bei ungültigem JSON. Der Typ T wird zur Laufzeit nicht geprüft: Json.parse&lt;List&lt;Int&gt;&gt;("[1, 2]") |

<a id="storage"></a>

### `class Storage`

Dauerhafter Schlüssel-Wert-Speicher im Browser (localStorage); auf dem Server nur im Speicher.

| Signatur | Beschreibung |
|---|---|
| `static fn get(key: String): String?` | Gespeicherter Text zu 'key', oder null. |
| `static fn set(key: String, value: String): Void` | Speichert 'value' unter 'key'. |
| `static fn remove(key: String): Void` | Löscht den Eintrag zu 'key'. |
| `static fn getJson<T>(key: String): T?` | Liest den Eintrag zu 'key' als JSON; null, wenn er fehlt oder kein gültiges JSON ist. |
| `static fn setJson(key: String, value: Any): Void` | Speichert 'value' als JSON unter 'key'. |
| `static fn clear(): Void` | Löscht alle Einträge des localStorage (auch fremde, nicht nur eigene). |

<a id="http"></a>

### `class Http`

HTTP-Anfragen (fetch). Alle Methoden liefern ein Future und lösen bei einem Fehlerstatus (nicht 2xx) einen Fehler aus.

| Signatur | Beschreibung |
|---|---|
| `static fn get(url: String): Future<String>` | GET-Anfrage; liefert den Antworttext: await Http.get("/api/info") |
| `static fn getJson<T>(url: String): Future<T>` | GET-Anfrage; liefert die Antwort als JSON: await Http.getJson&lt;List&lt;User&gt;&gt;("/api/users") |
| `static fn postJson<T>(url: String, body: Any): Future<T>` | POST-Anfrage mit 'body' als JSON; liefert die JSON-Antwort (null bei leerer Antwort). |
| `static fn putJson<T>(url: String, body: Any): Future<T>` | PUT-Anfrage mit 'body' als JSON; liefert die JSON-Antwort (null bei leerer Antwort). |
| `static fn post(url: String, body: String): Future<String>` | POST-Anfrage mit 'body' als Text (Content-Type application/json); liefert den Antworttext. |
| `static fn delete(url: String): Future<String>` | DELETE-Anfrage; liefert den Antworttext. |

<a id="timer"></a>

### `class Timer`

Zeitgesteuerte Aktionen. Timer laufen nur im Browser (nicht beim Server-Rendering).

| Signatur | Beschreibung |
|---|---|
| `static fn every(interval: Duration, action: () => Void): Timer` | Führt 'action' wiederholt im Abstand 'interval' aus; stoppt automatisch, wenn die Komponente entfernt wird: Timer.every(1.s, () => tick()) |
| `static fn after(delay: Duration, action: () => Void): Timer` | Führt 'action' einmal nach 'delay' aus; wird mit der Komponente abgebrochen. |
| `static fn delay(duration: Duration): Future<Void>` | Wartet in einer async-Funktion: await Timer.delay(500.ms) |
| `fn stop(): Void` | Hält den Timer an; weitere Aufrufe haben keine Wirkung. |

<a id="datetime"></a>

### `class DateTime`

Zeitpunkt (Datum und Uhrzeit) in lokaler Zeitzone; unveränderlich, add-Methoden liefern einen neuen Wert.

#### Erzeugen

| Signatur | Beschreibung |
|---|---|
| `static fn now(): DateTime` | Aktueller Zeitpunkt. |
| `static fn of(timestamp: Int): DateTime` | Zeitpunkt aus Millisekunden seit 1.1.1970 (UTC). |
| `static fn parse(text: String): DateTime?` | Liest ein Datum (z. B. ISO "2024-05-17T10:30"), oder null, wenn der Text ungültig ist. |
| `static fn create(year: Int, month: Int, day: Int, hour: Int = 0, minute: Int = 0, second: Int = 0): DateTime` | Zeitpunkt aus Einzelwerten (Monat 1–12, lokale Zeit): DateTime.create(2024, 12, 24, 18) |

#### Bestandteile

| Signatur | Beschreibung |
|---|---|
| `val year: Int` | Jahr, z. B. 2024. |
| `val month: Int` | Monat von 1 (Januar) bis 12 (Dezember). |
| `val day: Int` | Tag im Monat (1–31). |
| `val hour: Int` | Stunde (0–23). |
| `val minute: Int` | Minute (0–59). |
| `val second: Int` | Sekunde (0–59). |
| `val weekday: Int` | Wochentag von 1 (Montag) bis 7 (Sonntag). |
| `val timestamp: Int` | Millisekunden seit 1.1.1970 (UTC). |

#### Rechnen & Vergleichen

| Signatur | Beschreibung |
|---|---|
| `fn addDays(days: Int): DateTime` | Neuer Zeitpunkt 'days' Tage später (negativ: früher). |
| `fn addHours(hours: Int): DateTime` | Neuer Zeitpunkt 'hours' Stunden später (negativ: früher). |
| `fn addMinutes(minutes: Int): DateTime` | Neuer Zeitpunkt 'minutes' Minuten später (negativ: früher). |
| `fn daysUntil(other: DateTime): Int` | Gerundete Anzahl Tage bis 'other' (negativ, wenn 'other' davor liegt). |
| `fn isBefore(other: DateTime): Boolean` | true, wenn dieser Zeitpunkt vor 'other' liegt. |
| `fn isAfter(other: DateTime): Boolean` | true, wenn dieser Zeitpunkt nach 'other' liegt. |

#### Formatierung

| Signatur | Beschreibung |
|---|---|
| `fn format(pattern: String = "dd.MM.yyyy HH:mm"): String` | Formatiert nach Muster mit den Platzhaltern yyyy MM M dd d HH H mm ss EEEE (Wochentag) MMMM (Monatsname, deutsch):<br>date.format("EEEE, d. MMMM yyyy") → "Freitag, 17. Mai 2024" |
| `fn toLocaleDate(locale: String = "de-DE"): String` | Datum im Format der Locale (Standard "de-DE"): "17.5.2024" |
| `fn toLocaleTime(locale: String = "de-DE"): String` | Uhrzeit im Format der Locale (Standard "de-DE"): "10:30:00" |
| `fn toIso(): String` | ISO-8601-Text in UTC: "2024-05-17T08:30:00.000Z" |

<a id="upload"></a>

### `class Upload`

Eine Datei, die der Browser hochlädt: aus FilePicker(bind: …) oder einem Formularfeld. Als Parameter einer
Service-Methode erlaubt (Upload, Upload?, List&lt;Upload&gt;); auf dem Server mit Files.save(datei) speichern.
Name und Typ kommen vom Browser und sind nur Angaben: Files.save prüft Größe und Dateityp selbst. Siehe [Dateien hochladen](backend.md#dateien-hochladen-upload-und-files).

| Signatur | Beschreibung |
|---|---|
| `constructor(name: String, type: String, text: String)` | Datei aus Text, z. B. für Tests oder zum Erzeugen im Browser: Upload("notiz.txt", "text/plain", "Hallo") |
| `val name: String` | Dateiname ohne Pfad, wie ihn der Browser meldet, z. B. "urlaub.jpg" |
| `val type: String` | Medientyp laut Browser, z. B. "image/jpeg" ("" wenn unbekannt) |
| `val size: Int` | Größe in Bytes |
| `fn text(): Future<String>` | Inhalt als Text (UTF-8) |

<a id="clipboard"></a>

### `class Clipboard`

Zugriff auf die Zwischenablage des Systems.

| Signatur | Beschreibung |
|---|---|
| `static fn copy(text: String): Future<Void>` | Kopiert 'text' in die Zwischenablage: await Clipboard.copy(link) |

<a id="passkey"></a>

### `class Passkey`

Passkeys im Browser (WebAuthn): zeigt den Dialog des Systems (Fingerabdruck, Gesichtserkennung, PIN).

| Signatur | Beschreibung |
|---|---|
| `static val supported: Boolean` | true, wenn der Browser Passkeys kann. |
| `static fn create(options: String): Future<String>` | Legt einen Passkey an: 'options' von Passkeys.registration, das Ergebnis geht an Passkeys.register. |
| `static fn get(options: String): Future<String>` | Meldet mit einem Passkey an: 'options' von Passkeys.authentication, das Ergebnis geht an Passkeys.verify. |

<a id="listener"></a>

### `class Listener`

Ein angemeldetes Fenster-Ereignis (Window.onMessage, Window.onKeyDown …). Es endet automatisch mit der Komponente,
die es angemeldet hat, oder vorher mit stop().

| Signatur | Beschreibung |
|---|---|
| `fn stop(): Void` | Meldet das Ereignis ab; weitere Aufrufe haben keine Wirkung. |

<a id="window"></a>

### `class Window`

Browserfenster: Größe, Titel, Dialoge, Navigation und Ereignisse des ganzen Fensters. Auf dem Server ohne Wirkung.
Die Werte (width, height, scrollY, online, visible, focused) sind reaktiv: Eine Ansicht, die sie liest, aktualisiert
sich bei Änderungen. Ereignisse (on…) enden mit der Komponente, die sie anmeldet.

#### Werte

| Signatur | Beschreibung |
|---|---|
| `static val width: Int` | Innere Breite des Fensters in Pixeln, reaktiv (auf dem Server 1280). |
| `static val height: Int` | Innere Höhe des Fensters in Pixeln, reaktiv (auf dem Server 800). |
| `static val scrollY: Float` | Wie weit die Seite nach unten gescrollt ist, in Pixeln; reaktiv (auf dem Server 0). |
| `static val online: Boolean` | true, solange der Browser eine Netzverbindung hat; reaktiv (auf dem Server true). |
| `static val visible: Boolean` | true, solange der Tab sichtbar ist (nicht im Hintergrund); reaktiv (auf dem Server true). |
| `static val focused: Boolean` | true, solange das Fenster den Fokus hat; reaktiv (auf dem Server true). |
| `static val url: String` | Vollständige Adresse der Seite, z. B. "https://example.com/shop?seite=2#/korb" (auf dem Server ""). |
| `static val host: String` | Rechnername der Adresse, z. B. "example.com" (auf dem Server ""). |
| `static val path: String` | Pfad der Adresse, z. B. "/shop" (auf dem Server "/"). |
| `static val query: String` | Abfrageteil der Adresse mit "?", z. B. "?seite=2" ("" ohne Abfrage). |

#### Aktionen

| Signatur | Beschreibung |
|---|---|
| `static fn setTitle(title: String): Void` | Setzt den Titel des Browser-Tabs. |
| `static fn open(url: String): Void` | Öffnet 'url' in einem neuen Tab. |
| `static fn alert(message: String): Void` | Zeigt einen einfachen Hinweisdialog mit 'message'. |
| `static fn confirm(message: String): Boolean` | Zeigt einen Bestätigungsdialog; true bei "OK" (auf dem Server immer false). |
| `static fn scrollToTop(): Void` | Scrollt sanft an den Seitenanfang. |
| `static fn navigate(url: String): Void` | Lädt eine andere Seite (vollständige Navigation): Window.navigate("/login") |
| `static fn reload(): Void` | Lädt die aktuelle Seite neu. |
| `static fn postMessage(message: Any, targetOrigin: String? = null): Void` | Schickt 'message' per postMessage an das übergeordnete Fenster (bei einem iframe) oder an dieses Fenster.<br>targetOrigin: Herkunft des Empfängers, Standard die eigene; "*" erlaubt jede. |

#### Ereignisse

| Signatur | Beschreibung |
|---|---|
| `static fn onMessage<T>(action: (T) => Void, origin: String? = null): Listener` | Nachricht per postMessage (message), z. B. von einem iframe, einem anderen Fenster oder einer einbettenden<br>Anwendung. 'origin' lässt nur Nachrichten dieser Herkunft durch ("https://partner.example"); null nimmt alle.<br>Der Typ T wird zur Laufzeit nicht geprüft (wie bei Json.parse): Window.onMessage&lt;Auftrag&gt;(a => this.zeigen(a)) |
| `static fn onKeyDown(action: (String) => Void): Listener` | Taste gedrückt, egal welches Element den Fokus hat; erhält den Tastennamen wie "Escape", "Enter" oder "a" (keydown). |
| `static fn onKeyUp(action: (String) => Void): Listener` | Taste losgelassen, egal welches Element den Fokus hat; erhält den Tastennamen (keyup). |
| `static fn onResize(action: () => Void): Listener` | Das Fenster hat seine Größe geändert (resize); Window.width und Window.height sind schon aktuell. |
| `static fn onScroll(action: (Float) => Void): Listener` | Die Seite wurde gescrollt (scroll); erhält Window.scrollY. |
| `static fn onFocus(action: () => Void): Listener` | Das Fenster hat den Fokus bekommen (focus). |
| `static fn onBlur(action: () => Void): Listener` | Das Fenster hat den Fokus verloren (blur). |
| `static fn onVisibilityChange(action: (Boolean) => Void): Listener` | Der Tab wurde sichtbar (true) oder ist in den Hintergrund gegangen (false) (visibilitychange). |
| `static fn onOnline(action: () => Void): Listener` | Die Netzverbindung ist wieder da (online). |
| `static fn onOffline(action: () => Void): Listener` | Die Netzverbindung ist weg (offline). |
| `static fn onBeforeUnload(ask: () => Boolean): Listener` | Vor dem Verlassen der Seite (beforeunload): Liefert 'ask' true, fragt der Browser nach, ob man die Seite<br>wirklich verlassen will: Window.onBeforeUnload(() => this.geaendert.value) |
| `static fn onHashChange(action: (String) => Void): Listener` | Der Teil nach "#" in der Adresse hat sich geändert (hashchange); erhält ihn mit "#". |

### Funktionen und Konstanten

| Signatur | Beschreibung |
|---|---|
| `fn tr(key: String, fallback: String, args: List<Any> = []): String` | Übersetzbarer Text: Eintrag 'key' der aktuellen Sprache, sonst 'fallback'; {0}, {1} … werden durch 'args' ersetzt.<br>Reaktiv: Wechselt I18n.locale, ändern sich alle Texte. tr("ui_kit.schliessen", "Schließen"), tr("gruss", "Hallo {0}!", [name]) |
| `fn validate(value: Any): List<ValidationError>` | Prüft die Regeln einer data class (@Required, @Email, @MinLength(8), @MaxLength, @Min, @Max, @Pattern) – im Browser<br>und auf dem Server gleich. Leere Liste = alles in Ordnung: validate(Anmeldung(email: "x", passwort: "123")) |
| `fn print(value: Any): Void` | Gibt 'value' als Text in der Konsole aus: print("Hallo") |
| `fn effect(action: () => Void): Void` | Führt 'action' sofort aus und erneut, sobald sich ein darin gelesener State ändert; endet mit der Komponente. |
| `fn batch(action: () => Void): Void` | Fasst mehrere State-Änderungen zusammen; die UI aktualisiert sich erst danach einmal. |
| `fn untrack<T>(compute: () => T): T` | Berechnet 'compute', ohne die darin gelesenen States zu abonnieren. |

<a id="texo-graphics"></a>

## Paket `texo.graphics`

Werte für das Aussehen: Farben, Längen, Schatten, Verläufe, Schriften, Animationen. Import: `import texo.graphics.*`

<a id="paint"></a>

### `class Paint`

Alles, womit sich eine Fläche füllen lässt: Farben (Color) und Verläufe (Gradient).

<a id="color"></a>

### `class Color: Paint`

sRGB-Farbe mit Alphakanal. Wird als Hex-Code bzw. rgba(...) in CSS ausgegeben.
Beispiel: Color.Indigo500, Color.hex("#4f46e5").opacity(0.5)

| Signatur | Beschreibung |
|---|---|
| `static fn hex(value: String): Color` | Farbe aus Hex-Code: Color.hex("#4f46e5"); auch #rgb, #rgba und #rrggbbaa.<br>Das # ist optional; ungültige Codes lösen einen Fehler aus. |
| `static fn rgb(red: Int, green: Int, blue: Int, alpha: Float = 1.0): Color` | Farbe aus RGB-Kanälen (je 0–255) und Deckkraft (0.0–1.0): Color.rgb(79, 70, 229)<br>Werte außerhalb des Bereichs werden begrenzt. |
| `static fn hsl(hue: Float, saturation: Float, lightness: Float, alpha: Float = 1.0): Color` | Farbe aus Farbton (Grad, 0–360), Sättigung und Helligkeit: Color.hsl(240, 0.6, 0.5)<br>Sättigung und Helligkeit wahlweise als Anteil (0.0–1.0) oder Prozent (0–100). |
| `static fn palette(name: String, shade: Int): Color` | Tailwind-Palettenfarbe nach Name und Stufe (50, 100 … 900, 950): Color.palette("indigo", 500)<br>Unbekannte Namen oder Stufen lösen einen Fehler aus. |
| `static fn oklch(lightness: Float, chroma: Float, hue: Float, alpha: Float = 1.0): Color` | Farbe im OKLCH-Raum (gleichmäßig empfundene Helligkeit): Helligkeit 0.0–1.0, Buntheit ca. 0.0–0.4, Farbton in Grad:<br>Color.oklch(0.7, 0.15, 250). Wird in sRGB umgerechnet. |
| `static fn variable(name: String, fallback: Color? = null): Color` | Farbe aus einer CSS-Variable (var()), z. B. aus GlobalStyle().variable(…): Color.variable("marke")<br>Abwandlungen wie opacity/lighten/mix berechnet dann der Browser (color-mix). |
| `static fn css(value: String): Color` | Beliebige CSS-Farbe, die der Browser versteht: Color.css("oklch(70% 0.15 200)"), Color.css("light-dark(#fff, #000)") |
| `static val Current: Color` | Die aktuelle Textfarbe (currentColor) – z. B. für Rahmen in Textfarbe. |

#### Grundfarben (White, Black, Transparent, Red …) und Farbpalette (Tailwind-Stufen 50–950, z. B. Color.Indigo500)

Konstanten: `White`, `Black`, `Red`, `Orange`, `Amber`, `Yellow`, `Lime`, `Green`, `Emerald`, `Teal`, `Cyan`, `Sky`, `Blue`, `Indigo`, `Violet`, `Purple`, `Fuchsia`, `Pink`, `Rose`, `Gray`, `Slate`, `Zinc`, `Transparent`

Abstufungen: `Slate`, `Gray`, `Zinc`, `Neutral`, `Stone`, `Red`, `Orange`, `Amber`, `Yellow`, `Lime`, `Green`, `Emerald`, `Teal`, `Cyan`, `Sky`, `Blue`, `Indigo`, `Violet`, `Purple`, `Fuchsia`, `Pink`, `Rose` – jeweils in den Stufen 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950
(hell → dunkel), z. B. `Slate500`.

#### Abwandlungen

| Signatur | Beschreibung |
|---|---|
| `fn opacity(alpha: Float): Color` | Dieselbe Farbe mit neuer Deckkraft (0.0–1.0): Color.Black.opacity(0.15) |
| `fn lighten(amount: Float): Color` | Hellt die Farbe auf, indem die HSL-Helligkeit um amount (0.0–1.0) erhöht wird: color.lighten(0.1) |
| `fn darken(amount: Float): Color` | Dunkelt die Farbe ab, indem die HSL-Helligkeit um amount (0.0–1.0) verringert wird: color.darken(0.1) |
| `fn saturate(amount: Float): Color` | Erhöht die HSL-Sättigung um amount (0.0–1.0); ein negativer Wert entsättigt. |
| `fn mix(other: Color, amount: Float = 0.5): Color` | Mischt mit einer anderen Farbe (inkl. Alpha): 0.0 ergibt diese Farbe, 1.0 die andere.<br>Beispiel: Color.Indigo500.mix(Color.White, 0.2) |
| `fn contrastText(): Color` | Schwarz oder Weiß – je nachdem, was auf dieser Farbe besser lesbar ist (nach Luminanz). |
| `fn at(position: Length): Color` | Farbstopp an einer Position innerhalb eines Verlaufs: Color.Red.at(30.percent) |

#### Umwandlung & Kanäle

| Signatur | Beschreibung |
|---|---|
| `fn toHex(): String` | Hex-Code der Farbe im Format #rrggbb (ohne Alphakanal). |
| `fn toCss(): String` | CSS-Darstellung: #rrggbb bei voller Deckkraft, sonst rgba(r, g, b, a). |
| `val r: Int` | Rotkanal (0–255). |
| `val g: Int` | Grünkanal (0–255). |
| `val b: Int` | Blaukanal (0–255). |
| `val a: Float` | Deckkraft (0.0 = transparent, 1.0 = deckend). |
| `val luminance: Float` | Relative Luminanz nach WCAG (0.0 = Schwarz, 1.0 = Weiß). |

<a id="gradient"></a>

### `class Gradient: Paint`

Gemeinsamer Obertyp aller Farbverläufe; überall nutzbar, wo ein Paint erwartet wird.

<a id="lineargradient"></a>

### `class LinearGradient: Gradient`

Linearer Farbverlauf entlang einer Richtung (CSS linear-gradient).
Farben können mit .at(...) positioniert werden: LinearGradient.horizontal(Color.Red, Color.Blue.at(80.percent))

| Signatur | Beschreibung |
|---|---|
| `static fn diagonal(...colors: Color): LinearGradient` | Diagonaler Verlauf (135°) von links oben nach rechts unten. |
| `static fn horizontal(...colors: Color): LinearGradient` | Horizontaler Verlauf (90°) von links nach rechts. |
| `static fn vertical(...colors: Color): LinearGradient` | Vertikaler Verlauf (180°) von oben nach unten. |
| `static fn angle(angle: Angle, ...colors: Color): LinearGradient` | Verlauf in beliebigem Winkel (0° = nach oben, 90° = nach rechts): LinearGradient.angle(45.deg, Color.Pink, Color.Violet) |
| `static fn repeating(angle: Angle, ...colors: Color): LinearGradient` | Sich wiederholender Verlauf, z. B. Streifen: LinearGradient.repeating(45.deg, Color.Slate100, Color.Slate100.at(10.px), Color.White.at(10.px), Color.White.at(20.px)) |

<a id="radialgradient"></a>

### `class RadialGradient: Gradient`

Kreisförmiger bzw. elliptischer Farbverlauf von einem Mittelpunkt nach außen (CSS radial-gradient).

| Signatur | Beschreibung |
|---|---|
| `static fn circle(...colors: Color): RadialGradient` | Kreisförmiger Verlauf vom Mittelpunkt des Elements aus. |
| `static fn ellipse(...colors: Color): RadialGradient` | Elliptischer Verlauf vom Mittelpunkt aus, passt sich dem Seitenverhältnis des Elements an. |
| `static fn at(x: Length, y: Length, ...colors: Color): RadialGradient` | Kreisförmiger Verlauf um einen frei gewählten Mittelpunkt: RadialGradient.at(20.percent, 0.px, Color.Sky, Color.Transparent) |
| `static fn repeating(...colors: Color): RadialGradient` | Sich wiederholende Ringe (repeating-radial-gradient); Farben mit .at(…) positionieren. |

<a id="conicgradient"></a>

### `class ConicGradient: Gradient`

Kegelförmiger Farbverlauf, der um den Mittelpunkt rotiert (CSS conic-gradient).

| Signatur | Beschreibung |
|---|---|
| `static fn of(...colors: Color): ConicGradient` | Kegelverlauf, beginnend oben (0°) im Uhrzeigersinn: ConicGradient.of(Color.Red, Color.Yellow, Color.Red) |
| `static fn from(angle: Angle, ...colors: Color): ConicGradient` | Kegelverlauf ab einem Startwinkel: ConicGradient.from(90.deg, Color.Red, Color.Blue) |
| `static fn at(x: Length, y: Length, ...colors: Color): ConicGradient` | Kegelverlauf um einen frei gewählten Mittelpunkt. |
| `static fn repeating(angle: Angle, ...colors: Color): ConicGradient` | Sich wiederholender Kegelverlauf, z. B. Schachbrett- oder Tortenmuster. |

<a id="length"></a>

### `class Length`

CSS-Längenangabe: 16.px, 2.rem, 50.percent, Size.Full …
Längen mit gleicher Einheit werden direkt verrechnet, sonst entsteht ein calc(...)-Ausdruck.

| Signatur | Beschreibung |
|---|---|
| `fn negate(): Length` | Negierte Länge: 8.px.negate() ergibt -8px. |
| `fn times(factor: Float): Length` | Multipliziert die Länge mit einem Faktor: 4.px.times(2.5) ergibt 10px. |
| `fn plus(other: Length): Length` | Summe zweier Längen; bei unterschiedlichen Einheiten als calc(a + b). |
| `fn minus(other: Length): Length` | Differenz zweier Längen; bei unterschiedlichen Einheiten als calc(a - b). |
| `fn div(divisor: Float): Length` | Durch eine Zahl teilen: 100.percent.div(3) |

#### CSS-Funktionen

| Signatur | Beschreibung |
|---|---|
| `static fn min(...values: Length): Length` | Kleinster Wert (min()): Length.min(600.px, 90.vw) |
| `static fn max(...values: Length): Length` | Größter Wert (max()): Length.max(320.px, 50.percent) |
| `static fn clamp(min: Length, preferred: Length, max: Length): Length` | Wert zwischen Minimum und Maximum, dazwischen fließend (clamp()) – ideal für responsive Schriftgrößen:<br>.fontSize(Length.clamp(1.rem, 4.vw, 3.rem)) |
| `static fn minmax(min: Length, max: Length): Length` | Mindest- und Höchstgröße einer Grid-Spur (minmax()): Length.minmax(200.px, 1.fr) |
| `static fn repeat(count: Int, size: Length): Length` | Wiederholte Grid-Spuren (repeat()): Length.repeat(3, 1.fr) |
| `static fn autoFill(size: Length): Length` | So viele Spalten wie hineinpassen, leere bleiben erhalten (repeat(auto-fill, …)). |
| `static fn autoFit(size: Length): Length` | So viele Spalten wie hineinpassen, leere fallen weg (repeat(auto-fit, …)). |
| `static fn fitContent(limit: Length): Length` | Inhaltsbreite, höchstens limit (fit-content()) – für Grid-Spuren. |
| `static fn variable(name: String, fallback: Length? = null): Length` | Länge aus einer CSS-Variable (var()): Length.variable("abstand", 16.px) |
| `static fn css(value: String): Length` | Beliebiger CSS-Längenausdruck: Length.css("calc(100% - 2rem)") |

<a id="size"></a>

### `class Size`

Vordefinierte Längen für Breite und Höhe: Size.Full, Size.Auto, Size.ScreenHeight …

| Signatur | Beschreibung |
|---|---|
| `static val Full: Length` | 100 % des Elternelements. |
| `static val Half: Length` | 50 % des Elternelements. |
| `static val Third: Length` | Ein Drittel (33,33 %) des Elternelements. |
| `static val Quarter: Length` | 25 % des Elternelements. |
| `static val Auto: Length` | Automatische Größe (CSS auto). |
| `static val FitContent: Length` | So groß wie der Inhalt, höchstens so groß wie der verfügbare Platz (CSS fit-content). |
| `static val MinContent: Length` | Kleinstmögliche Größe des Inhalts, z. B. Umbruch nach jedem Wort (CSS min-content). |
| `static val MaxContent: Length` | Größe des Inhalts ohne Umbrüche (CSS max-content). |
| `static val ScreenWidth: Length` | Volle Breite des Viewports (100vw). |
| `static val ScreenHeight: Length` | Volle Höhe des Viewports (100vh). |
| `static val Zero: Length` | Länge null (0px). |
| `static val DynamicScreenHeight: Length` | 100 % der sichtbaren Höhe auf Mobilgeräten, passt sich ein- und ausfahrenden Browserleisten an (100dvh). |
| `static val Stretch: Length` | Füllt den verfügbaren Platz inklusive Rand (stretch). |

<a id="duration"></a>

### `class Duration`

Zeitspanne, z. B. für Animationen und Übergänge: 250.ms, 2.s; für Zeitpläne auch 15.min, 2.h, 1.d

| Signatur | Beschreibung |
|---|---|
| `val ms: Float` | Dauer in Millisekunden. |
| `val seconds: Float` | Dauer in Sekunden: 1500.ms.seconds ergibt 1.5. |

<a id="angle"></a>

### `class Angle`

Winkel für Drehungen und Verläufe: 45.deg, 0.25.turn (eine Umdrehung = 360°).

| Signatur | Beschreibung |
|---|---|
| `val deg: Float` | Winkel in Grad. |
| `fn negate(): Angle` | Negierter Winkel (entgegengesetzte Drehrichtung): 15.deg.negate() |

<a id="shadow"></a>

### `class Shadow`

Schatten (CSS box-shadow) aus einer oder mehreren Ebenen; Stufen Sm bis Xxl wie in Tailwind.
Beispiel: Shadow.Md, Shadow(y: 8.px, blur: 24.px, color: Color.Indigo500.opacity(0.3))

| Signatur | Beschreibung |
|---|---|
| `Shadow(x: Length = 0.px, y: Length = 4.px, blur: Length = 12.px, spread: Length = 0.px, color: Color = Color.Black.opacity(0.15), inset: Boolean = false)` | Einzelner Schatten mit Versatz (x, y), Unschärfe, Ausdehnung und Farbe; inset = true zeichnet ihn nach innen. |
| `static val None: Shadow` | Kein Schatten (CSS none). |
| `static val Sm: Shadow` | Sehr dezenter, kleiner Schatten. |
| `static val Base: Shadow` | Standardschatten für leicht abgehobene Flächen (zweilagig). |
| `static val Md: Shadow` | Mittlerer Schatten, z. B. für Karten (zweilagig). |
| `static val Lg: Shadow` | Großer Schatten, z. B. für Dropdowns (zweilagig). |
| `static val Xl: Shadow` | Sehr großer Schatten, z. B. für Dialoge (zweilagig). |
| `static val Xxl: Shadow` | Größter, kräftiger Schatten für stark schwebende Elemente. |
| `static val Inner: Shadow` | Dezenter Innenschatten (inset), z. B. für vertiefte Eingabefelder. |
| `static fn SoftGlow(color: Color): Shadow` | Weicher, farbiger Schein unterhalb des Elements (zweilagig): Shadow.SoftGlow(Color.Indigo500.opacity(0.4)) |
| `static fn Glow(color: Color, radius: Length = 24.px): Shadow` | Gleichmäßiges Leuchten rund um das Element mit der angegebenen Unschärfe (radius). |
| `static fn Neon(color: Color): Shadow` | Neon-Effekt aus drei gestapelten Leuchtebenen (4px, 12px, 32px) in abnehmender Deckkraft. |
| `static fn Layered(...shadows: Shadow): Shadow` | Fasst mehrere Schatten zu einem mehrlagigen Schatten zusammen: Shadow.Layered(Shadow.Sm, Shadow.Glow(Color.Sky)) |
| `static fn Elevation(level: Length): Shadow` | Höhenschatten aus einem einzigen Wert: Versatz nach unten = level, Unschärfe = 3 × level (Zahlwert als px).<br>Beispiel: Shadow.Elevation(4.px) |
| `fn and(other: Shadow): Shadow` | Hängt die Ebenen eines weiteren Schattens an: Shadow.Md.and(Shadow.Inner) |

<a id="transform"></a>

### `class Transform`

2D/3D-Transformation (CSS transform) zum Skalieren, Drehen, Verschieben und Neigen.
Mehrere Transformationen werden mit then verkettet: Transform.scale(1.05).then(Transform.rotate(2.deg))

| Signatur | Beschreibung |
|---|---|
| `static fn identity(): Transform` | Keine Transformation (CSS none). |
| `static fn scale(factor: Float): Transform` | Gleichmäßige Skalierung (1.0 = Originalgröße): Transform.scale(1.1) |
| `static fn scaleXY(x: Float, y: Float): Transform` | Getrennte Skalierung in x- und y-Richtung. |
| `static fn rotate(angle: Angle): Transform` | Drehung in der Ebene (positiv = im Uhrzeigersinn): Transform.rotate(45.deg) |
| `static fn translate(x: Length, y: Length = 0.px): Transform` | Verschiebung um x und y: Transform.translate(0.px, -4.px) |
| `static fn translateX(x: Length): Transform` | Horizontale Verschiebung. |
| `static fn translateY(y: Length): Transform` | Vertikale Verschiebung (positiv = nach unten). |
| `static fn skew(x: Angle, y: Angle = 0.deg): Transform` | Neigung (Scherung) entlang der x- und y-Achse. |
| `static fn perspective(distance: Length): Transform` | Perspektive für nachfolgende 3D-Transformationen; kleinere Werte wirken stärker: Transform.perspective(600.px) |
| `static fn rotateX(angle: Angle): Transform` | 3D-Drehung um die horizontale x-Achse. |
| `static fn rotateY(angle: Angle): Transform` | 3D-Drehung um die vertikale y-Achse. |
| `static fn rotateZ(angle: Angle): Transform` | Drehung um die Z-Achse (wie rotate). |
| `static fn translateZ(z: Length): Transform` | Verschiebung in die Tiefe (translateZ); wirkt mit .perspective(…) am Elternelement. |
| `static fn translate3d(x: Length, y: Length, z: Length): Transform` | Verschiebung in alle drei Richtungen (translate3d). |
| `static fn scaleX(x: Float): Transform` | Nur horizontal skalieren (scaleX). |
| `static fn scaleY(y: Float): Transform` | Nur vertikal skalieren (scaleY). |
| `static fn skewX(angle: Angle): Transform` | Nur horizontal neigen (skewX). |
| `static fn skewY(angle: Angle): Transform` | Nur vertikal neigen (skewY). |
| `static fn matrix(a: Float, b: Float, c: Float, d: Float, e: Float, f: Float): Transform` | Beliebige 2D-Transformationsmatrix (matrix(a, b, c, d, e, f)). |
| `fn then(other: Transform): Transform` | Verkettet zwei Transformationen (erst diese, dann other). |

<a id="easing"></a>

### `class Easing`

Zeitverlauf (CSS timing function) für Übergänge und Animationen: Easing.EaseOut, Easing.Spring …

| Signatur | Beschreibung |
|---|---|
| `static val Linear: Easing` | Gleichmäßige Geschwindigkeit. |
| `static val Ease: Easing` | CSS-Standardkurve ease: schneller Start, sanftes Ende. |
| `static val EaseIn: Easing` | Langsamer Start, beschleunigt zum Ende. |
| `static val EaseOut: Easing` | Schneller Start, bremst zum Ende ab – gut für einblendende Elemente. |
| `static val EaseInOut: Easing` | Langsamer Start und langsames Ende. |
| `static val Spring: Easing` | Federnder Effekt, der leicht über das Ziel hinausschießt. |
| `static val Bounce: Easing` | Holt zu Beginn aus und schießt am Ende über das Ziel hinaus. |
| `static val Smooth: Easing` | Weiche, unauffällige Kurve (entspricht ease). |
| `static val Snappy: Easing` | Sehr schneller Start mit weichem Auslaufen – wirkt direkt und reaktionsfreudig. |
| `static fn cubic(x1: Float, y1: Float, x2: Float, y2: Float): Easing` | Eigene Bézierkurve (CSS cubic-bezier); x1 und x2 im Bereich 0.0–1.0: Easing.cubic(0.4, 0.0, 0.2, 1.0) |
| `static fn steps(count: Int): Easing` | Sprunghafter Verlauf in count gleich großen Schritten (CSS steps). |

<a id="font"></a>

### `class Font`

Schriftfamilie inklusive System-Fallbacks: Font.Sans, Font.Mono, Font.named("Inter") …

| Signatur | Beschreibung |
|---|---|
| `static val Sans: Font` | Serifenlose Systemschrift (Standard). |
| `static val Serif: Font` | Serifenschrift des Systems (z. B. Georgia). |
| `static val Mono: Font` | Nichtproportionale Systemschrift, z. B. für Code. |
| `static val Rounded: Font` | Abgerundete Systemschrift (z. B. SF Pro Rounded, Nunito), sonst serifenlos. |
| `static fn named(name: String): Font` | Benannte Schriftfamilie mit serifenloser System-Fallback-Kette: Font.named("Inter")<br>Die Schrift selbst muss separat eingebunden werden (z. B. per Webfont). |

<a id="position"></a>

### `class Position`

Ein Punkt in einer Box – für Hintergrundbilder, Bildausschnitte und den Bezugspunkt von Transformationen.

| Signatur | Beschreibung |
|---|---|
| `static val Center: Position` | Mitte. |
| `static val Top: Position` | Oben mittig. |
| `static val Bottom: Position` | Unten mittig. |
| `static val Left: Position` | Links mittig. |
| `static val Right: Position` | Rechts mittig. |
| `static val TopLeft: Position` | Ecke oben links. |
| `static val TopRight: Position` | Ecke oben rechts. |
| `static val BottomLeft: Position` | Ecke unten links. |
| `static val BottomRight: Position` | Ecke unten rechts. |
| `static fn at(x: Length, y: Length): Position` | Freie Position: Position.at(30.percent, 0.px) |

<a id="clippath"></a>

### `class ClipPath`

Form, auf die ein Element zugeschnitten wird (clip-path), für .clipShape(…).

| Signatur | Beschreibung |
|---|---|
| `static val None: ClipPath` | Kein Zuschnitt. |
| `static fn circle(radius: Length = 50.percent, at: Position = Position.Center): ClipPath` | Kreis (Standard: Radius 50 %, mittig): ClipPath.circle(), ClipPath.circle(40.percent, Position.Top) |
| `static fn ellipse(rx: Length = 50.percent, ry: Length = 50.percent, at: Position = Position.Center): ClipPath` | Ellipse mit zwei Radien. |
| `static fn inset(top: Length = 0.px, right: Length? = null, bottom: Length? = null, left: Length? = null, radius: Length? = null): ClipPath` | Rechteck mit Abständen zu den Kanten, optional abgerundet: ClipPath.inset(10.px, radius: 16.px) |
| `static fn polygon(points: List<Length>): ClipPath` | Vieleck aus x/y-Paaren, mindestens drei Punkte – ein Dreieck:<br>ClipPath.polygon([50.percent, 0.percent, 100.percent, 100.percent, 0.percent, 100.percent]) |
| `static fn css(value: String): ClipPath` | Beliebiger clip-path-Wert: ClipPath.css("path('M0 0 L100 0 L50 80 Z')") |

<a id="texo-ui"></a>

## Paket `texo.ui`

Views, Container, Bedienelemente, Modifier und Router. Import: `import texo.ui.*`

### Aufzählungen

| Enum | Werte | Beschreibung |
|---|---|---|
| <a id="fontweight"></a>`FontWeight` | `Thin`, `ExtraLight`, `Light`, `Regular`, `Medium`, `SemiBold`, `Bold`, `ExtraBold`, `Heavy`, `Black` | Schriftstärke für fontWeight: Thin (100) … Regular (400), Medium (500), SemiBold (600), Bold (700) … Black (900). |
| <a id="alignment"></a>`Alignment` | `start`, `center`, `end`, `spaceBetween`, `spaceAround`, `spaceEvenly`, `stretch` | Verteilung entlang der Hauptachse eines Stacks (justify-content): start, center, end, spaceBetween, spaceAround, spaceEvenly, stretch. |
| <a id="crossalignment"></a>`CrossAlignment` | `start`, `center`, `end`, `stretch`, `baseline` | Ausrichtung quer zur Hauptachse eines Stacks (align-items): start, center, end, stretch, baseline. |
| <a id="textalign"></a>`TextAlign` | `Left`, `Center`, `Right`, `Justify` | Textausrichtung für textAlign: Left, Center, Right, Justify (Blocksatz). |
| <a id="imagefit"></a>`ImageFit` | `Cover`, `Contain`, `Fill`, `None`, `ScaleDown` | Skalierung eines Bildes in seiner Box (object-fit): Cover, Contain, Fill, None, ScaleDown. |
| <a id="overflow"></a>`Overflow` | `Visible`, `Hidden`, `Clip`, `Scroll`, `Auto` | Verhalten bei überlaufendem Inhalt: Visible, Hidden, Scroll, Auto (Scrollbalken nur bei Bedarf). |
| <a id="edge"></a>`Edge` | `All`, `Top`, `Bottom`, `Left`, `Right`, `Horizontal`, `Vertical` | Seite bzw. Richtung, etwa für border(side:) und slideIn(from:): All, Top, Bottom, Left, Right, Horizontal (links + rechts), Vertical (oben + unten). |
| <a id="borderstyle"></a>`BorderStyle` | `Solid`, `Dashed`, `Dotted`, `Double`, `Groove`, `Ridge`, `Inset`, `Outset`, `Hidden`, `None` | Linienstil eines Rahmens: Solid, Dashed, Dotted, Double, None. |
| <a id="axis"></a>`Axis` | `Vertical`, `Horizontal`, `Both` | Scrollrichtung einer ScrollView: Vertical, Horizontal oder Both. |
| <a id="inputtype"></a>`InputType` | `Text`, `Password`, `Email`, `Number`, `Search`, `Date`, `Time`, `Url`, `Tel`, `Color` | Typ eines Eingabefelds (HTML-Attribut type), z. B. Text, Password, Email, Number, Date. |
| <a id="breakpoint"></a>`Breakpoint` | `sm`, `md`, `lg`, `xl`, `xxl` | Responsive Breakpoints (Mindestbreite): sm = 640 px, md = 768 px, lg = 1024 px, xl = 1280 px. |
| <a id="display"></a>`Display` | `Block`, `Inline`, `InlineBlock`, `Flex`, `InlineFlex`, `Grid`, `InlineGrid`, `Contents`, `FlowRoot`, `None` | Art der Box (display): Block, Inline, InlineBlock, Flex, InlineFlex, Grid, InlineGrid, Contents, FlowRoot, None. |
| <a id="flexdirection"></a>`FlexDirection` | `Row`, `Column`, `RowReverse`, `ColumnReverse` | Richtung eines Stacks (flex-direction): Row, Column, RowReverse, ColumnReverse. |
| <a id="blendmode"></a>`BlendMode` | `Normal`, `Multiply`, `Screen`, `Overlay`, `Darken`, `Lighten`, `ColorDodge`, `ColorBurn`, `HardLight`, `SoftLight`, `Difference`, `Exclusion`, `Hue`, `Saturation`, `Color`, `Luminosity`, `PlusLighter` | Mischmodus von Farben (mix-blend-mode / background-blend-mode), z. B. Multiply, Screen, Overlay, Difference. |
| <a id="whitespace"></a>`WhiteSpace` | `Normal`, `NoWrap`, `Pre`, `PreWrap`, `PreLine`, `BreakSpaces` | Umgang mit Leerzeichen und Zeilenumbrüchen (white-space): Normal, NoWrap, Pre, PreWrap, PreLine, BreakSpaces. |
| <a id="wordbreak"></a>`WordBreak` | `Normal`, `BreakAll`, `KeepAll`, `Anywhere` | Umbruch langer Wörter: Normal, BreakAll (überall), KeepAll (nie innerhalb), Anywhere (nur wenn nötig). |
| <a id="textwrap"></a>`TextWrap` | `Wrap`, `NoWrap`, `Balance`, `Pretty` | Zeilenumbruch-Strategie (text-wrap): Wrap, NoWrap, Balance (ausgeglichene Zeilen, für Überschriften), Pretty (keine Einzelwörter am Ende). |
| <a id="writingmode"></a>`WritingMode` | `Horizontal`, `VerticalRl`, `VerticalLr` | Schreibrichtung (writing-mode): Horizontal, VerticalRl, VerticalLr. |
| <a id="textdirection"></a>`TextDirection` | `Ltr`, `Rtl` | Textrichtung (direction): Ltr (links nach rechts), Rtl (rechts nach links, z. B. Arabisch). |
| <a id="verticalalign"></a>`VerticalAlign` | `Baseline`, `Top`, `Middle`, `Bottom`, `TextTop`, `TextBottom`, `Sub`, `Super` | Vertikale Ausrichtung in einer Textzeile (vertical-align): Baseline, Top, Middle, Bottom, TextTop, TextBottom, Sub, Super. |
| <a id="decorationstyle"></a>`DecorationStyle` | `Solid`, `Double`, `Dotted`, `Dashed`, `Wavy` | Linienstil für Unter-/Durchstreichungen: Solid, Double, Dotted, Dashed, Wavy. |
| <a id="touchaction"></a>`TouchAction` | `Auto`, `None`, `PanX`, `PanY`, `Manipulation`, `PinchZoom` | Erlaubte Touch-Gesten (touch-action): Auto, None, PanX, PanY, Manipulation (kein Doppeltipp-Zoom), PinchZoom. |
| <a id="snapalign"></a>`SnapAlign` | `Start`, `Center`, `End`, `None` | Einrastpunkt beim Scroll-Snapping: Start, Center, End, None. |
| <a id="overscroll"></a>`Overscroll` | `Auto`, `Contain`, `None` | Verhalten am Scroll-Ende (overscroll-behavior): Auto, Contain (Seite scrollt nicht mit), None (zusätzlich kein Pull-to-Refresh). |
| <a id="gridflow"></a>`GridFlow` | `Row`, `Column`, `RowDense`, `ColumnDense` | Automatisches Auffüllen eines Grids (grid-auto-flow): Row, Column, RowDense, ColumnDense (füllt Lücken auf). |
| <a id="animationdirection"></a>`AnimationDirection` | `Normal`, `Reverse`, `Alternate`, `AlternateReverse` | Abspielrichtung einer Animation: Normal, Reverse, Alternate (hin und her), AlternateReverse. |
| <a id="fillmode"></a>`FillMode` | `None`, `Forwards`, `Backwards`, `Both` | Zustand vor/nach einer Animation (animation-fill-mode): None, Forwards (Endzustand bleibt), Backwards, Both. |
| <a id="floatside"></a>`FloatSide` | `Left`, `Right`, `None` | Seite, an die ein Element umflossen wird (float): Left, Right, None. |
| <a id="backgroundsize"></a>`BackgroundSize` | `Cover`, `Contain`, `Auto`, `Fill` | Größe eines Hintergrundbilds: Cover (füllt, schneidet ab), Contain (ganz sichtbar), Auto (Originalgröße), Fill (verzerrt auf 100 %). |
| <a id="toastkind"></a>`ToastKind` | `Info`, `Success`, `Warning`, `Error` | Art einer Meldung von Toast.show: Info, Success (Erfolg), Warning (Warnung), Error (Fehler, wird sofort vorgelesen). |

<a id="view"></a>

### `class View`

Basistyp aller darstellbaren Elemente; stellt sämtliche Modifier bereit.
Jeder Modifier gibt denselben Typ zurück, Ketten bleiben typsicher: Text("Hi").padding(8.px).bold()

#### Größe

| Signatur | Beschreibung |
|---|---|
| `fn width(value: Length): Self` | Breite (width): .width(360.px), .width(Size.Full) *(Modifier)* |
| `fn height(value: Length): Self` | Höhe (height): .height(200.px), .height(100.vh) *(Modifier)* |
| `fn minWidth(value: Length): Self` | Mindestbreite (min-width). *(Modifier)* |
| `fn maxWidth(value: Length): Self` | Maximale Breite (max-width), z. B. für Textspalten: .maxWidth(640.px) *(Modifier)* |
| `fn minHeight(value: Length): Self` | Mindesthöhe (min-height), z. B. .minHeight(100.vh) für ganzseitige Layouts. *(Modifier)* |
| `fn maxHeight(value: Length): Self` | Maximale Höhe (max-height). *(Modifier)* |
| `fn size(all: Length? = null, width: Length? = null, height: Length? = null): Self` | Breite und Höhe auf einmal: .size(48.px) für ein Quadrat oder .size(width: 320.px, height: 200.px) *(Modifier)* |
| `fn fillWidth(): Self` | Volle Breite des Elternelements (width: 100%). *(Modifier)* |
| `fn fillHeight(): Self` | Volle Höhe des Elternelements (height: 100%). *(Modifier)* |

#### Abstände

| Signatur | Beschreibung |
|---|---|
| `fn padding(all: Length? = null, vertical: Length? = null, horizontal: Length? = null, top: Length? = null, right: Length? = null, bottom: Length? = null, left: Length? = null): Self` | Innenabstand; einzeln oder je Seite: .padding(16.px), .padding(vertical: 8.px, horizontal: 16.px), .padding(top: 4.px) *(Modifier)* |
| `fn margin(all: Length? = null, vertical: Length? = null, horizontal: Length? = null, top: Length? = null, right: Length? = null, bottom: Length? = null, left: Length? = null): Self` | Außenabstand, Parameter wie bei padding: .margin(bottom: 12.px); negative Werte mit -4.px *(Modifier)* |

#### Flexbox & Grid

| Signatur | Beschreibung |
|---|---|
| `fn grow(factor: Int = 1): Self` | Wächst im Stack in freien Platz hinein (flex-grow, Standard 1): .grow() *(Modifier)* |
| `fn shrink(factor: Int = 1): Self` | Darf im Stack schrumpfen (flex-shrink, Standard 1); .shrink(0) verhindert das Schrumpfen. *(Modifier)* |
| `fn basis(value: Length): Self` | Ausgangsgröße im Stack vor dem Wachsen/Schrumpfen (flex-basis). *(Modifier)* |
| `fn alignSelf(alignment: CrossAlignment): Self` | Eigene Querausrichtung in einem Stack, abweichend von dessen crossAlignment (align-self). *(Modifier)* |
| `fn center(): Self` | Zentriert das Element horizontal über automatische Außenabstände (margin-left/right: auto); braucht eine Breite. *(Modifier)* |
| `fn gridSpan(columns: Int = 1, rows: Int = 1): Self` | Lässt ein Grid-Kind mehrere Spalten/Zeilen überspannen: .gridSpan(columns: 2) *(Modifier)* |
| `fn order(value: Int): Self` | Reihenfolge im Stack oder Grid unabhängig von der Quellreihenfolge (order): .order(-1) stellt nach vorne. *(Modifier)* |
| `fn justifySelf(alignment: CrossAlignment): Self` | Ausrichtung des Elements in seiner Grid-Zelle quer zur Zeile (justify-self): .justifySelf(CrossAlignment.end) *(Modifier)* |
| `fn gridCell(column: Int? = null, row: Int? = null, columnSpan: Int = 1, rowSpan: Int = 1): Self` | Platziert das Element in bestimmten Grid-Zellen; Zählung ab 1: .gridCell(column: 2, row: 1, columnSpan: 2) *(Modifier)* |
| `fn gridArea(name: String): Self` | Legt das Element in einen benannten Bereich aus templateAreas: .gridArea("seitenleiste") *(Modifier)* |
| `fn floatTo(side: FloatSide): Self` | Lässt Text um das Element herumfließen (float), etwa um ein Bild: .floatTo(FloatSide.Left) *(Modifier)* |
| `fn clearFloat(): Self` | Beginnt unterhalb aller umflossenen Elemente (clear: both). *(Modifier)* |

#### Positionierung

| Signatur | Beschreibung |
|---|---|
| `fn absolute(top: Length? = null, right: Length? = null, bottom: Length? = null, left: Length? = null, inset: Length? = null): Self` | Absolut positioniert relativ zum nächsten positionierten Vorfahren (z. B. Box, Card): .absolute(top: 8.px, right: 8.px) *(Modifier)* |
| `fn fixed(top: Length? = null, right: Length? = null, bottom: Length? = null, left: Length? = null, inset: Length? = null): Self` | Fest am Browserfenster positioniert, scrollt nicht mit: .fixed(bottom: 24.px, right: 24.px) *(Modifier)* |
| `fn relative(top: Length? = null, right: Length? = null, bottom: Length? = null, left: Length? = null, inset: Length? = null): Self` | Relativ positioniert (position: relative): verschiebt das Element um top/right/bottom/left gegenüber seiner normalen Lage<br>und macht es zum Bezugspunkt für absolut positionierte Kinder: .relative(), .relative(top: 4.px, left: -8.px) *(Modifier)* |
| `fn sticky(top: Length? = null, right: Length? = null, bottom: Length? = null, left: Length? = null, inset: Length? = null): Self` | Haftet beim Scrollen am Rand (position: sticky): .sticky(), .sticky(top: 64.px), .sticky(bottom: 0.px).<br>Ohne Angabe gilt top = 0 px. *(Modifier)* |
| `fn zIndex(value: Int): Self` | Stapelreihenfolge überlappender Elemente (z-index); höhere Werte liegen oben. *(Modifier)* |
| `fn overflow(value: Overflow): Self` | Verhalten bei überlaufendem Inhalt: .overflow(Overflow.Auto) *(Modifier)* |
| `fn clip(): Self` | Schneidet überstehenden Inhalt ab (overflow: hidden), etwa für Bilder in abgerundeten Karten. *(Modifier)* |
| `fn aspectRatio(ratio: Float): Self` | Festes Seitenverhältnis Breite/Höhe (aspect-ratio): .aspectRatio(16.0 / 9.0) *(Modifier)* |
| `fn overflowX(value: Overflow): Self` | Überlauf nur horizontal (overflow-x), z. B. für breite Tabellen: .overflowX(Overflow.Auto) *(Modifier)* |
| `fn overflowY(value: Overflow): Self` | Überlauf nur vertikal (overflow-y). *(Modifier)* |
| `fn isolate(): Self` | Eigener Stapelkontext (isolation: isolate): z-Index und Mischmodi wirken nur innerhalb des Elements. *(Modifier)* |
| `fn queryContainer(name: String = ""): Self` | Markiert das Element als Container für .whenContainer(…)-Abfragen (container-type: inline-size), optional mit Namen. *(Modifier)* |

#### Sichtbarkeit

| Signatur | Beschreibung |
|---|---|
| `fn hidden(when: Boolean = true): Self` | Blendet das Element aus (display: none); hidden(false) stellt die normale Anzeige wieder her: .hidden(true).md(s => s.hidden(false)) *(Modifier)* |
| `fn visible(when: Boolean = true): Self` | Sichtbarkeit ohne Layoutänderung (visibility); visible(false) versteckt, der Platz bleibt reserviert. *(Modifier)* |
| `fn display(value: Display): Self` | Art der Box (display): .display(Display.InlineBlock), .display(Display.Grid) *(Modifier)* |
| `fn lazyRender(estimatedHeight: Length = 500.px): Self` | Rendert das Element erst, wenn es in die Nähe des sichtbaren Bereichs kommt (content-visibility: auto) –<br>beschleunigt lange Seiten. estimatedHeight hält bis dahin den Platz frei. *(Modifier)* |

#### Aussehen

| Signatur | Beschreibung |
|---|---|
| `fn background(fill: Paint): Self` | Hintergrund aus Farbe oder Verlauf: .background(Color.Indigo50), .background(LinearGradient(…)) *(Modifier)* |
| `fn textColor(color: Paint): Self` | Textfarbe (color); ein Verlauf erzeugt Verlaufstext per background-clip: .textColor(Color.Slate700) *(Modifier)* |
| `fn foreground(color: Paint): Self` | Vordergrundfarbe – gleichbedeutend mit textColor; färbt auch Icons (currentColor). *(Modifier)* |
| `fn opacity(value: Float): Self` | Deckkraft von 0.0 (unsichtbar) bis 1.0 (deckend): .opacity(0.6) *(Modifier)* |
| `fn radius(all: Length? = null, top: Length? = null, bottom: Length? = null, topLeft: Length? = null, topRight: Length? = null, bottomLeft: Length? = null, bottomRight: Length? = null): Self` | Eckenradius (border-radius), gesamt oder je Seite/Ecke: .radius(12.px), .radius(top: 16.px) *(Modifier)* |
| `fn pill(): Self` | Vollständig abgerundete Enden, Pillenform (border-radius: 9999px). *(Modifier)* |
| `fn circle(): Self` | Kreisform (border-radius: 50%); bei gleicher Breite und Höhe ein Kreis. *(Modifier)* |
| `fn border(width: Length = 1.px, color: Color = Color.Gray200, style: BorderStyle = BorderStyle.Solid, side: Edge = Edge.All): Self` | Rahmen, Standard 1 px durchgezogen in Gray200: .border(), .border(color: Color.Indigo500, side: Edge.Bottom) *(Modifier)* |
| `fn outline(width: Length = 2.px, color: Color = Color.Indigo500, offset: Length = 2.px, style: BorderStyle = BorderStyle.Solid): Self` | Umrisslinie außerhalb des Rahmens (outline), typisch für Fokus: .focus(s => s.outline()) *(Modifier)* |
| `fn shadow(preset: Shadow): Self` | Schatten aus einer Vorgabe (box-shadow): .shadow(Shadow.Lg), .shadow(Shadow.Glow(Color.Indigo500)) *(Modifier)* |
| `fn elevation(level: Length): Self` | Schatten, abgeleitet aus einer gedachten Höhe über der Fläche: .elevation(4.px) *(Modifier)* |
| `fn backgroundImage(src: String, size: BackgroundSize = BackgroundSize.Cover, position: Position = Position.Center, repeat: Boolean = false, fixed: Boolean = false, overlay: Paint? = null): Self` | Hintergrundbild aus public/ (background): Größe, Position, Wiederholung, fest beim Scrollen (Parallax)<br>und optional eine Farbe oder ein Verlauf darüber: .backgroundImage("bilder/held.jpg", overlay: Color.Black.opacity(0.4)) *(Modifier)* |
| `fn backgroundBlend(mode: BlendMode): Self` | Mischt den Hintergrund mit einem Hintergrundbild (background-blend-mode): .backgroundBlend(BlendMode.Multiply) *(Modifier)* |
| `fn blendMode(mode: BlendMode): Self` | Mischt das Element mit dem, was dahinter liegt (mix-blend-mode): .blendMode(BlendMode.Difference) *(Modifier)* |
| `fn clipShape(shape: ClipPath): Self` | Schneidet das Element in eine Form (clip-path): .clipShape(ClipPath.circle()), .clipShape(ClipPath.polygon([…])) *(Modifier)* |
| `fn mask(gradient: Gradient): Self` | Blendet das Element über einen Verlauf aus (mask-image), z. B. weicher Rand unten:<br>.mask(LinearGradient.vertical(Color.Black, Color.Transparent)) *(Modifier)* |
| `fn maskImage(src: String, size: BackgroundSize = BackgroundSize.Contain): Self` | Nutzt ein Bild aus public/ als Maske (nur dessen Alphakanal zählt), z. B. ein SVG-Symbol, eingefärbt mit .background(…). *(Modifier)* |

#### Filter

| Signatur | Beschreibung |
|---|---|
| `fn filterBlur(radius: Length): Self` | Zeichnet das Element selbst unscharf (filter: blur); für Milchglas-Hintergründe siehe Container.blur.<br>Alle Filter-Modifier lassen sich kombinieren (.brightness(1.1).grayscale(0.5)), auch in Varianten wie .hover(…). *(Modifier)* |
| `fn grayscale(amount: Float = 1.0): Self` | Graustufen (filter: grayscale), 1.0 = vollständig grau. *(Modifier)* |
| `fn brightness(amount: Float): Self` | Helligkeit (filter: brightness); 1.0 unverändert, größer heller: .hover(s => s.brightness(1.1)) *(Modifier)* |
| `fn saturate(amount: Float): Self` | Farbsättigung (filter: saturate); 1.0 unverändert, 0.0 farblos. *(Modifier)* |
| `fn contrast(amount: Float): Self` | Kontrast (filter: contrast); 1.0 unverändert. *(Modifier)* |
| `fn hueRotate(angle: Angle): Self` | Dreht alle Farbtöne (hue-rotate): .hueRotate(90.deg) *(Modifier)* |
| `fn invert(amount: Float = 1.0): Self` | Invertiert die Farben (0.0–1.0, Standard 1.0): .invert() *(Modifier)* |
| `fn sepia(amount: Float = 1.0): Self` | Sepia-Ton wie ein altes Foto (0.0–1.0, Standard 1.0). *(Modifier)* |
| `fn dropShadow(shadow: Shadow): Self` | Schatten, der der Form folgt (filter: drop-shadow) – ideal für Icons und Bilder mit Transparenz: .dropShadow(Shadow.Md) *(Modifier)* |
| `fn backdrop(blur: Length? = null, brightness: Float? = null, contrast: Float? = null, saturate: Float? = null, grayscale: Float? = null): Self` | Filter für alles hinter dem Element (backdrop-filter), kombinierbar: .backdrop(blur: 12.px, saturate: 1.5) *(Modifier)* |

#### Transformationen

| Signatur | Beschreibung |
|---|---|
| `fn transform(value: Transform): Self` | Beliebige Transformation (transform): .transform(Transform.scale(1.05).rotate(3.deg)) *(Modifier)* |
| `fn scale(factor: Float): Self` | Skaliert das Element (CSS scale), z. B. .hover(s => s.scale(1.05)) *(Modifier)* |
| `fn rotate(angle: Angle): Self` | Dreht das Element (CSS rotate): .rotate(45.deg) *(Modifier)* |
| `fn offset(x: Length = 0.px, y: Length = 0.px): Self` | Verschiebt das Element ohne Einfluss auf das Layout (CSS translate): .offset(y: -2.px) *(Modifier)* |
| `fn transformOrigin(position: Position): Self` | Bezugspunkt für Drehen und Skalieren (transform-origin): .transformOrigin(Position.TopLeft) *(Modifier)* |
| `fn perspective(distance: Length): Self` | 3D-Tiefe für die Kinder (perspective): kleinere Werte wirken stärker: .perspective(800.px) *(Modifier)* |
| `fn preserve3d(): Self` | Kinder behalten ihre 3D-Lage (transform-style: preserve-3d), z. B. für Karten zum Umdrehen. *(Modifier)* |
| `fn backfaceHidden(enabled: Boolean = true): Self` | Versteckt die Rückseite eines gedrehten Elements (backface-visibility: hidden). *(Modifier)* |

#### Interaktion

| Signatur | Beschreibung |
|---|---|
| `fn cursor(value: Cursor): Self` | Mauszeiger über dem Element: .cursor(Cursor.Pointer) *(Modifier)* |
| `fn pointerEvents(enabled: Boolean): Self` | pointerEvents(false) lässt Mausereignisse durch das Element hindurch (pointer-events: none). *(Modifier)* |
| `fn selectable(enabled: Boolean): Self` | Ob der Text markierbar ist (user-select); selectable(false) verhindert das Markieren. *(Modifier)* |
| `fn accentColor(color: Color): Self` | Akzentfarbe nativer Steuerelemente wie Checkbox und Slider (accent-color). *(Modifier)* |
| `fn css(property: String, value: String): Self` | Ausweg für CSS-Eigenschaften ohne eigenen Modifier: .css("mix-blend-mode", "multiply") *(Modifier)* |
| `fn provide<T>(context: Context<T>, value: T): Self` | Stellt einen Kontext-Wert für alles in diesem Element bereit (auch für Komponenten darin), auch reaktiv:<br>Column([...]).provide(Dichte, 8) |
| `fn ref(target: Ref<Self>): Self` | Nur für Komponenten: legt die Instanz in einem Ref ab, um ihre öffentlichen Methoden aufzurufen:<br>Dialog().ref(this.dialog), danach this.dialog.value?.oeffnen() |
| `fn part(name: String): Self` | Nur in Komponenten: benennt ein inneres Element, damit Aufrufer es gestalten können:<br>Icon("star").part("icon") → FancyButton().style("icon", s => s.textColor(Color.Amber400)) |
| `fn theme<T>(token: T, value: T): Self` | Überschreibt ein Design-Token (Wert aus einem @Theme-object) für dieses Element und alles darin:<br>Column([...]).theme(UiKit.primaer, Color.Emerald600) *(Modifier)* |
| `fn cssVariable(name: String, value: String): Self` | Setzt eine CSS-Variable für dieses Element und alle Nachfahren: .cssVariable("akzent", "#e11d48"),<br>gelesen mit Color.variable("akzent") oder Length.variable(…). *(Modifier)* |
| `fn pixelated(enabled: Boolean = true): Self` | Pixelgenaue Skalierung ohne Weichzeichnen (image-rendering: pixelated), z. B. für Pixel-Art. *(Modifier)* |
| `fn caretColor(color: Color): Self` | Farbe der Text-Einfügemarke in Eingabefeldern (caret-color). *(Modifier)* |
| `fn touchAction(mode: TouchAction): Self` | Erlaubte Touch-Gesten (touch-action), z. B. TouchAction.Manipulation gegen Doppeltipp-Zoom, None für eigene Gesten. *(Modifier)* |
| `fn resizable(axis: Axis = Axis.Both): Self` | Größe per Maus änderbar (resize, Ecke unten rechts): .resizable(Axis.Vertical) *(Modifier)* |

#### Scrollen

| Signatur | Beschreibung |
|---|---|
| `fn scrollSnap(axis: Axis = Axis.Vertical, mandatory: Boolean = true): Self` | Scroll-Snapping für einen scrollbaren Container: Kinder rasten beim Scrollen ein (scroll-snap-type).<br>mandatory = false rastet nur in der Nähe ein: .scrollSnap(Axis.Horizontal) *(Modifier)* |
| `fn snapAlign(align: SnapAlign = SnapAlign.Start): Self` | Einrastpunkt eines Kindes im Scroll-Snap-Container (scroll-snap-align): .snapAlign(SnapAlign.Center) *(Modifier)* |
| `fn snapStop(always: Boolean = true): Self` | Verhindert, dass schnelles Wischen dieses Kind überspringt (scroll-snap-stop: always). *(Modifier)* |
| `fn scrollMargin(all: Length? = null, vertical: Length? = null, horizontal: Length? = null, top: Length? = null, right: Length? = null, bottom: Length? = null, left: Length? = null): Self` | Abstand beim Hinscrollen zu diesem Element (scroll-margin), z. B. unter einer festen Kopfzeile: .scrollMargin(top: 80.px) *(Modifier)* |
| `fn scrollPadding(all: Length? = null, vertical: Length? = null, horizontal: Length? = null, top: Length? = null, right: Length? = null, bottom: Length? = null, left: Length? = null): Self` | Innerer Abstand für Scroll-Ziele und Snapping im Container (scroll-padding). *(Modifier)* |
| `fn overscroll(behavior: Overscroll): Self` | Verhalten am Scroll-Ende (overscroll-behavior): .overscroll(Overscroll.Contain) für Dialoge und Seitenleisten. *(Modifier)* |
| `fn smoothScroll(enabled: Boolean = true): Self` | Weiches Scrollen innerhalb dieses Containers (scroll-behavior: smooth). *(Modifier)* |
| `fn scrollbarColor(thumb: Color, track: Color = Color.Transparent): Self` | Farben der Scrollbalken dieses Elements (scrollbar-color). *(Modifier)* |
| `fn thinScrollbar(): Self` | Schmale Scrollbalken (scrollbar-width: thin). *(Modifier)* |
| `fn hideScrollbar(): Self` | Versteckt die Scrollbalken, Scrollen bleibt möglich (scrollbar-width: none). *(Modifier)* |

#### Typografie

| Signatur | Beschreibung |
|---|---|
| `fn fontSize(size: Length): Self` | Schriftgröße (font-size): .fontSize(18.px), .fontSize(1.25.rem) *(Modifier)* |
| `fn fontWeight(weight: FontWeight): Self` | Schriftstärke: .fontWeight(FontWeight.SemiBold) *(Modifier)* |
| `fn fontFamily(font: Font): Self` | Schriftfamilie: .fontFamily(Font.Serif), .fontFamily(Font.Mono) *(Modifier)* |
| `fn letterSpacing(value: Length): Self` | Zeichenabstand (letter-spacing): .letterSpacing(0.05.em) *(Modifier)* |
| `fn lineHeight(value: Float): Self` | Zeilenhöhe als Faktor der Schriftgröße (line-height): .lineHeight(1.5) *(Modifier)* |
| `fn textAlign(align: TextAlign): Self` | Horizontale Textausrichtung: .textAlign(TextAlign.Center) *(Modifier)* |
| `fn bold(): Self` | Fettschrift (font-weight: 700). *(Modifier)* |
| `fn italic(enabled: Boolean = true): Self` | Kursivschrift; italic(false) schaltet sie ab. *(Modifier)* |
| `fn underline(enabled: Boolean = true, color: Color? = null, style: DecorationStyle? = null, thickness: Length? = null, offset: Length? = null): Self` | Unterstreicht den Text; underline(false) entfernt die Unterstreichung (z. B. bei Links). *(Modifier)* |
| `fn strikethrough(enabled: Boolean = true, color: Color? = null, style: DecorationStyle? = null, thickness: Length? = null): Self` | Durchgestrichener Text (text-decoration: line-through). *(Modifier)* |
| `fn uppercase(): Self` | Text in Großbuchstaben (text-transform: uppercase). *(Modifier)* |
| `fn lowercase(): Self` | Text in Kleinbuchstaben (text-transform: lowercase). *(Modifier)* |
| `fn monospace(): Self` | Nichtproportionale Schrift (Font.Mono), etwa für Code oder Zahlen. *(Modifier)* |
| `fn truncate(): Self` | Kürzt einzeiligen Text mit „…“ ab, statt umzubrechen. *(Modifier)* |
| `fn lineClamp(lines: Int): Self` | Begrenzt Text auf n Zeilen und kürzt den Rest mit „…“: .lineClamp(3) *(Modifier)* |
| `fn noWrap(): Self` | Verhindert Zeilenumbrüche (white-space: nowrap). *(Modifier)* |
| `fn textShadow(shadow: Shadow): Self` | Textschatten aus einer Schatten-Vorgabe: .textShadow(Shadow.Sm) *(Modifier)* |
| `fn overline(enabled: Boolean = true, color: Color? = null, style: DecorationStyle? = null, thickness: Length? = null): Self` | Linie über dem Text (text-decoration: overline), Parameter wie bei underline. *(Modifier)* |
| `fn capitalize(): Self` | Großschreibung jedes Wortanfangs (text-transform: capitalize). *(Modifier)* |
| `fn normalCase(): Self` | Hebt uppercase/lowercase/capitalize auf (text-transform: none). *(Modifier)* |
| `fn textIndent(value: Length): Self` | Einzug der ersten Zeile (text-indent): .textIndent(2.em) *(Modifier)* |
| `fn wordSpacing(value: Length): Self` | Abstand zwischen Wörtern (word-spacing). *(Modifier)* |
| `fn whiteSpace(mode: WhiteSpace): Self` | Umgang mit Leerzeichen und Umbrüchen (white-space): .whiteSpace(WhiteSpace.PreWrap) erhält Zeilenumbrüche aus dem Text. *(Modifier)* |
| `fn wordBreak(mode: WordBreak): Self` | Umbruch langer Wörter oder URLs: .wordBreak(WordBreak.Anywhere) *(Modifier)* |
| `fn hyphenate(enabled: Boolean = true): Self` | Automatische Silbentrennung (hyphens: auto); die Sprache kommt aus @Page(lang: …). *(Modifier)* |
| `fn textWrap(mode: TextWrap): Self` | Zeilenumbruch-Strategie (text-wrap): .textWrap(TextWrap.Balance) für ausgeglichene Überschriften. *(Modifier)* |
| `fn writingMode(mode: WritingMode): Self` | Schreibrichtung (writing-mode), z. B. senkrechter Text: .writingMode(WritingMode.VerticalRl) *(Modifier)* |
| `fn textDirection(direction: TextDirection): Self` | Textrichtung (direction): .textDirection(TextDirection.Rtl) *(Modifier)* |
| `fn verticalAlign(align: VerticalAlign): Self` | Vertikale Ausrichtung in einer Textzeile (vertical-align), etwa für Icons im Fließtext. *(Modifier)* |
| `fn tabularNumbers(enabled: Boolean = true): Self` | Ziffern gleicher Breite (font-variant-numeric: tabular-nums) – Zahlen in Tabellen und Zählern springen nicht. *(Modifier)* |
| `fn smallCaps(enabled: Boolean = true): Self` | Kapitälchen (font-variant-caps: small-caps). *(Modifier)* |
| `fn fontFeatures(value: String): Self` | OpenType-Features der Schrift (font-feature-settings): .fontFeatures("\"ss01\", \"liga\" off") *(Modifier)* |
| `fn textStroke(width: Length = 1.px, color: Color = Color.Current): Self` | Kontur um die Buchstaben (-webkit-text-stroke), z. B. für Outline-Überschriften mit .textColor(Color.Transparent). *(Modifier)* |
| `fn textColumns(count: Int? = null, width: Length? = null, gap: Length? = null): Self` | Text in mehreren Spalten wie in einer Zeitung (columns): .textColumns(count: 2, gap: 32.px) *(Modifier)* |
| `fn contentText(value: String): Self` | Text für ::before/::after (content); nur in .before(…)/.after(…) sinnvoll: .before(s => s.contentText("→ ")) *(Modifier)* |

#### Animation

| Signatur | Beschreibung |
|---|---|
| `fn animate(duration: Duration = 200.ms, easing: Easing = Easing.EaseOut, delay: Duration = 0.ms, properties: List<String>? = null): Self` | Animiert jede Stiländerung dieses Elements weich (CSS-Transition), etwa bei zustandsabhängigen Werten:<br>.scale(this.aktiv.value ? 1.05 : 1.0).animate(duration: 300.ms, easing: Easing.Spring) *(Modifier)* |
| `fn pulse(repeat: Boolean = true, duration: Duration = 2.s): Self` | Pulsierende Deckkraft, z. B. für Lade-Platzhalter; standardmäßig endlos, 2 s pro Durchlauf.<br>Pro Element wirkt nur eine Keyframe-Animation (die zuletzt angegebene). *(Modifier)* |
| `fn spin(duration: Duration = 1.s): Self` | Endlose Drehung (linear), z. B. für Lade-Icons: Icon("refresh").spin() *(Modifier)* |
| `fn ping(duration: Duration = 1.s): Self` | Wiederholt sich vergrößernder und verblassender Impuls, etwa für Benachrichtigungspunkte. *(Modifier)* |
| `fn bounce(duration: Duration = 1.s): Self` | Endloses Auf- und Abhüpfen. *(Modifier)* |
| `fn shake(repeat: Boolean = false, duration: Duration = 500.ms): Self` | Kurzes horizontales Schütteln, z. B. bei Eingabefehlern; mit repeat: true endlos. *(Modifier)* |
| `fn float(duration: Duration = 3.s): Self` | Sanftes, endloses Schweben (6 px auf und ab). *(Modifier)* |
| `fn fadeIn(duration: Duration = 400.ms, delay: Duration = 0.ms): Self` | Einmaliges Einblenden beim Erscheinen: .fadeIn(delay: 100.ms) *(Modifier)* |
| `fn scaleIn(duration: Duration = 300.ms, delay: Duration = 0.ms): Self` | Einmaliges Hineinzoomen (von 95 %) mit Einblenden beim Erscheinen. *(Modifier)* |
| `fn slideIn(from: Edge = Edge.Bottom, distance: Length = 16.px, duration: Duration = 400.ms, delay: Duration = 0.ms): Self` | Gleitet beim Erscheinen von einer Seite herein und blendet ein: .slideIn(from: Edge.Left, distance: 24.px) *(Modifier)* |
| `fn transition(transition: Transition): Self` | Ein- und Ausblenden, wenn die View erscheint oder verschwindet: an Dialog, If, match, ForEach oder einem Element darin.<br>Beim Entfernen wartet die Laufzeit das Ende der Animation ab; bei prefers-reduced-motion entfällt sie:<br>If(this.offen.value, Text("Hallo")).transition(Transition.fade(150.ms)) *(Übergang)* |
| `fn keyframes(...frames: Keyframe, duration: Duration = 1.s, easing: Easing = Easing.Ease, delay: Duration = 0.ms, iterations: Int = 1, infinite: Boolean = false, direction: AnimationDirection = AnimationDirection.Normal, fill: FillMode = FillMode.Both): Self` | Eigene Animation aus Keyframes (@keyframes), beim Kompilieren erzeugt. Jeder Keyframe hat eine Position von 0.0 bis 1.0<br>und eine Stil-Funktion: .keyframes(Keyframe(0.0, s => s.opacity(0).scale(0.8)), Keyframe(1.0, s => s.opacity(1).scale(1.0)), duration: 600.ms) |
| `fn pauseAnimation(paused: Boolean = true): Self` | Hält laufende Animationen an (animation-play-state: paused), z. B. .hover(s => s.pauseAnimation()) *(Modifier)* |

#### Zustände & responsive Varianten

| Signatur | Beschreibung |
|---|---|
| `fn hover(style: (Self) => Self): Self` | Stile, die nur beim Überfahren mit der Maus gelten (:hover): .hover(s => s.background(Color.Indigo600))<br>Die betroffenen Eigenschaften erhalten automatisch eine kurze Transition. *(Variante)* |
| `fn focus(style: (Self) => Self): Self` | Stile bei Tastaturfokus (:focus-visible): .focus(s => s.outline()) *(Variante)* |
| `fn focusWithin(style: (Self) => Self): Self` | Stile, solange das Element oder ein Nachfahre den Fokus hat (:focus-within). *(Variante)* |
| `fn pressed(style: (Self) => Self): Self` | Stile, während das Element gedrückt wird (:active): .pressed(s => s.scale(0.97)) *(Variante)* |
| `fn whenDisabled(style: (Self) => Self): Self` | Stile für den deaktivierten Zustand (:disabled), passend zu .disabled(…): .whenDisabled(s => s.opacity(0.5)) *(Variante)* |
| `fn placeholderStyle(style: (Self) => Self): Self` | Stile für den Platzhaltertext eines Eingabefelds (::placeholder). *(Variante)* |
| `fn dark(style: (Self) => Self): Self` | Stile im Dunkelmodus des Systems (prefers-color-scheme: dark): .dark(s => s.background(Color.Slate900)) *(Variante)* |
| `fn sm(style: (Self) => Self): Self` | Stile ab 640 px Fensterbreite (mobile-first): .sm(s => s.padding(24.px)) *(Variante)* |
| `fn md(style: (Self) => Self): Self` | Stile ab 768 px Fensterbreite (Tablet): .md(s => s.padding(32.px)) *(Variante)* |
| `fn lg(style: (Self) => Self): Self` | Stile ab 1024 px Fensterbreite (Desktop). *(Variante)* |
| `fn xl(style: (Self) => Self): Self` | Stile ab 1280 px Fensterbreite (große Bildschirme). *(Variante)* |
| `fn printStyle(style: (Self) => Self): Self` | Stile nur beim Drucken (@media print): .printStyle(s => s.hidden()) *(Variante)* |
| `fn responsive(breakpoint: Breakpoint, style: (Self) => Self): Self` | Stile ab einem konstant angegebenen Breakpoint: .responsive(Breakpoint.lg, s => s.hidden()) *(Variante)* |
| `fn xxl(style: (Self) => Self): Self` | Stile ab 1536 px Breite (@media min-width: 1536px). *(Variante)* |
| `fn below(breakpoint: Breakpoint, style: (Self) => Self): Self` | Stile nur UNTER einem Breakpoint (@media max-width), z. B. nur auf dem Handy: .below(Breakpoint.md, s => s.padding(12.px)) *(Variante)* |
| `fn media(query: String, style: (Self) => Self): Self` | Stile für eine eigene Media-Abfrage: .media("(min-height: 800px)", s => s.padding(64.px)) *(Variante)* |
| `fn supports(condition: String, style: (Self) => Self): Self` | Stile nur, wenn der Browser eine CSS-Funktion kann (@supports): .supports("(backdrop-filter: blur(1px))", s => s.glass()) *(Variante)* |
| `fn whenContainer(style: (Self) => Self, minWidth: Length? = null, maxWidth: Length? = null, name: String? = null): Self` | Stile abhängig von der Breite des nächsten Containers (.queryContainer()) statt des Fensters (@container):<br>.whenContainer(minWidth: 480.px, s => s.flexDirection(FlexDirection.Row)) *(Variante)* |

#### Struktur-Varianten

| Signatur | Beschreibung |
|---|---|
| `fn first(style: (Self) => Self): Self` | Stile für das erste Kind seines Elternelements (:first-child), z. B. in ForEach-Listen. *(Variante)* |
| `fn last(style: (Self) => Self): Self` | Stile für das letzte Kind (:last-child): .last(s => s.border(width: 0.px, side: Edge.Bottom)) *(Variante)* |
| `fn odd(style: (Self) => Self): Self` | Stile für jedes ungerade Kind (:nth-child(odd)), z. B. Zebrastreifen in Tabellen. *(Variante)* |
| `fn even(style: (Self) => Self): Self` | Stile für jedes gerade Kind (:nth-child(even)). *(Variante)* |
| `fn nthChild(pattern: String, style: (Self) => Self): Self` | Stile für Kinder nach Muster (:nth-child): .nthChild("3n+1", s => …) *(Variante)* |
| `fn onlyChild(style: (Self) => Self): Self` | Stile, wenn das Element das einzige Kind ist (:only-child). *(Variante)* |
| `fn whenEmpty(style: (Self) => Self): Self` | Stile, wenn das Element leer ist (:empty). *(Variante)* |

#### Zustände

| Signatur | Beschreibung |
|---|---|
| `fn visited(style: (Self) => Self): Self` | Stile für bereits besuchte Links (:visited; Browser erlauben hier nur Farben). *(Variante)* |
| `fn whenChecked(style: (Self) => Self): Self` | Stile für angehakte Checkboxen/Schalter (:checked). *(Variante)* |
| `fn whenInvalid(style: (Self) => Self): Self` | Stile für ungültige Eingaben, nachdem der Nutzer sie bearbeitet hat (:user-invalid). *(Variante)* |
| `fn whenValid(style: (Self) => Self): Self` | Stile für gültige Eingaben nach der Bearbeitung (:user-valid). *(Variante)* |
| `fn whenTarget(style: (Self) => Self): Self` | Stile, wenn das Element Ziel des URL-Ankers ist (:target), etwa #kontakt. *(Variante)* |
| `fn focusAny(style: (Self) => Self): Self` | Stile bei jedem Fokus, auch per Maus (:focus) – .focus(…) reagiert nur auf Tastatur-Fokus. *(Variante)* |
| `fn groupHover(style: (Self) => Self): Self` | Stile, wenn ein Vorfahre mit .group() überfahren wird – z. B. Pfeil bewegen, wenn die ganze Karte gehovert wird. *(Variante)* |
| `fn groupFocus(style: (Self) => Self): Self` | Stile, wenn ein Vorfahre mit .group() den Fokus enthält. *(Variante)* |

#### Pseudo-Elemente

| Signatur | Beschreibung |
|---|---|
| `fn before(style: (Self) => Self): Self` | Gestaltet ein ::before-Pseudo-Element (erscheint vor dem Inhalt; content ist automatisch leer):<br>.before(s => s.contentText("★ ").textColor(Color.Amber500)) *(Variante)* |
| `fn after(style: (Self) => Self): Self` | Gestaltet ein ::after-Pseudo-Element, z. B. eine Unterstreichung: .after(s => s.absolute(bottom: 0.px, left: 0.px).height(2.px).fillWidth().background(Color.Indigo500)) *(Variante)* |
| `fn selectionStyle(style: (Self) => Self): Self` | Farben für markierten Text in diesem Element (::selection). *(Variante)* |
| `fn firstLetter(style: (Self) => Self): Self` | Stile für den ersten Buchstaben (::first-letter), z. B. Initialen. *(Variante)* |
| `fn firstLine(style: (Self) => Self): Self` | Stile für die erste Zeile (::first-line). *(Variante)* |

#### Nutzer-Einstellungen & Geräte

| Signatur | Beschreibung |
|---|---|
| `fn light(style: (Self) => Self): Self` | Stile im hellen Farbschema (prefers-color-scheme: light). *(Variante)* |
| `fn reducedMotion(style: (Self) => Self): Self` | Stile, wenn der Nutzer weniger Bewegung wünscht (prefers-reduced-motion): .reducedMotion(s => s.animate(duration: 0.ms)) *(Variante)* |
| `fn motionSafe(style: (Self) => Self): Self` | Stile nur ohne Wunsch nach weniger Bewegung (prefers-reduced-motion: no-preference), für Animationen. *(Variante)* |
| `fn highContrast(style: (Self) => Self): Self` | Stile bei erhöhtem Kontrast (prefers-contrast: more). *(Variante)* |
| `fn landscape(style: (Self) => Self): Self` | Stile im Querformat (orientation: landscape). *(Variante)* |
| `fn portrait(style: (Self) => Self): Self` | Stile im Hochformat (orientation: portrait). *(Variante)* |
| `fn touch(style: (Self) => Self): Self` | Stile auf Touch-Geräten (pointer: coarse), z. B. größere Tippflächen. *(Variante)* |
| `fn mouse(style: (Self) => Self): Self` | Stile nur mit Maus/Trackpad (hover: hover und pointer: fine) – verhindert „klebende“ Hover-Effekte auf Handys. *(Variante)* |

#### Ereignisse

| Signatur | Beschreibung |
|---|---|
| `fn onClick(action: () => Void): Self` | Wird bei einem Klick ausgeführt (click): .onClick(() => this.count.value += 1) *(Ereignis)* |
| `fn onDoubleClick(action: () => Void): Self` | Wird bei einem Doppelklick ausgeführt (dblclick). *(Ereignis)* |
| `fn onHover(action: (Boolean) => Void): Self` | Meldet Betreten (true) und Verlassen (false) mit der Maus: .onHover(h => this.hover.value = h) *(Ereignis)* |
| `fn onMouseEnter(action: () => Void): Self` | Wird ausgeführt, wenn die Maus das Element betritt (mouseenter). *(Ereignis)* |
| `fn onMouseLeave(action: () => Void): Self` | Wird ausgeführt, wenn die Maus das Element verlässt (mouseleave). *(Ereignis)* |
| `fn onFocus(action: () => Void): Self` | Wird ausgeführt, wenn das Element den Fokus erhält (focus). *(Ereignis)* |
| `fn onBlur(action: () => Void): Self` | Wird ausgeführt, wenn das Element den Fokus verliert (blur). *(Ereignis)* |
| `fn onKeyDown(action: (String) => Void): Self` | Taste gedrückt; erhält den Tastennamen wie "Enter", "Escape" oder "a" (keydown). *(Ereignis)* |
| `fn onKeyUp(action: (String) => Void): Self` | Taste losgelassen; erhält den Tastennamen (keyup). *(Ereignis)* |
| `fn onAppear(action: () => Void): Self` | Läuft einmal, nachdem das Element in die Seite eingefügt wurde (nicht beim Server-Rendering). *(Ereignis)* |

#### Attribute & Barrierefreiheit

| Signatur | Beschreibung |
|---|---|
| `fn tooltip(text: String): Self` | Tooltip beim Überfahren mit der Maus (HTML-Attribut title). *(Attribut)* |
| `fn ariaLabel(label: String): Self` | Zugänglicher Name für Screenreader (aria-label), wichtig bei Buttons, die nur ein Icon zeigen. *(Attribut)* |
| `fn id(value: String): Self` | HTML-Attribut id, z. B. als Sprungziel. *(Attribut)* |
| `fn role(value: String): Self` | ARIA-Rolle (HTML-Attribut role): .role("navigation") *(Attribut)* |
| `fn group(): Self` | Markiert das Element als Gruppe für .groupHover(…)/.groupFocus(…) seiner Nachfahren (Attribut data-group). *(Attribut)* |
| `fn testId(value: String): Self` | Kennung für automatisierte Tests (data-testid). *(Attribut)* |
| `fn disabled(when: Boolean = true): Self` | Deaktiviert Buttons und Eingabefelder (HTML-Attribut disabled), reaktiv: .disabled(this.name.value.isEmpty()) *(Attribut)* |

<a id="container"></a>

### `class Container: View`

Views, die andere Views enthalten; Basis von Stack, Row, Column, Grid, Card, Button, Link u. a.

#### Inhalt

| Signatur | Beschreibung |
|---|---|
| `fn content(...children: View): Self` | Fügt Kind-Views an (hinter den im Konstruktor übergebenen): Button.plain().content(Icon("trash")) *(Inhalt)* |

#### Aussehen

| Signatur | Beschreibung |
|---|---|
| `fn blur(radius: Length): Self` | Milchglas: zeichnet alles hinter dem Element unscharf (backdrop-filter): .blur(12.px) *(Modifier)* |
| `fn glass(blur: Length = 16.px, tint: Color = Color.White.opacity(0.08), borderColor: Color = Color.White.opacity(0.18)): Self` | Glas-Effekt aus halbtransparentem Hintergrund, Hintergrund-Unschärfe und feinem hellen Rahmen. *(Modifier)* |

#### Layout

| Signatur | Beschreibung |
|---|---|
| `fn spacing(value: Length): Self` | Abstand zwischen den Kindern (gap): .spacing(12.px) *(Modifier)* |
| `fn alignment(alignment: Alignment): Self` | Verteilung der Kinder entlang der Hauptachse (justify-content): .alignment(Alignment.spaceBetween) *(Modifier)* |
| `fn crossAlignment(alignment: CrossAlignment): Self` | Ausrichtung der Kinder quer zur Hauptachse (align-items): .crossAlignment(CrossAlignment.center) *(Modifier)* |
| `fn flexWrap(enabled: Boolean = true): Self` | Erlaubt den Umbruch der Kinder in mehrere Zeilen (flex-wrap: wrap). *(Modifier)* |
| `fn flexDirection(direction: FlexDirection): Self` | Richtung des Stacks (flex-direction), auch umgekehrt: .flexDirection(FlexDirection.RowReverse); mit .md(…) responsiv. *(Modifier)* |
| `fn alignContent(alignment: Alignment): Self` | Verteilung mehrerer Zeilen bei flexWrap bzw. im Grid (align-content). *(Modifier)* |
| `fn justifyItems(alignment: CrossAlignment): Self` | Ausrichtung aller Grid-Zellen-Inhalte quer zur Zeile (justify-items). *(Modifier)* |
| `fn rowGap(value: Length): Self` | Abstand nur zwischen Zeilen (row-gap). *(Modifier)* |
| `fn columnGap(value: Length): Self` | Abstand nur zwischen Spalten (column-gap). *(Modifier)* |
| `fn templateColumns(sizes: List<Length>): Self` | Eigene Spaltenbreiten im Grid (grid-template-columns): .templateColumns([240.px, 1.fr]),<br>.templateColumns([Length.repeat(3, 1.fr)]), .templateColumns([Length.autoFill(Length.minmax(200.px, 1.fr))]) *(Modifier)* |
| `fn templateRows(sizes: List<Length>): Self` | Eigene Zeilenhöhen im Grid (grid-template-rows): .templateRows([64.px, 1.fr, Size.Auto]) *(Modifier)* |
| `fn templateAreas(rows: List<String>): Self` | Benannte Bereiche (grid-template-areas), je Zeile ein Text; "." = leer:<br>.templateAreas(["kopf kopf", "menue inhalt"]) und an den Kindern .gridArea("kopf") *(Modifier)* |
| `fn autoRows(size: Length): Self` | Höhe automatisch erzeugter Zeilen (grid-auto-rows): .autoRows(Length.minmax(120.px, Size.Auto)) *(Modifier)* |
| `fn autoColumns(size: Length): Self` | Breite automatisch erzeugter Spalten (grid-auto-columns). *(Modifier)* |
| `fn autoFlow(flow: GridFlow): Self` | Reihenfolge beim automatischen Platzieren (grid-auto-flow): .autoFlow(GridFlow.RowDense) füllt Lücken. *(Modifier)* |

<a id="text"></a>

### `class Text: View`

Text; erzeugt ein &lt;span&gt;. Konstanter Inhalt landet direkt im HTML, reaktiver Inhalt aktualisiert nur den Textknoten.

| Signatur | Beschreibung |
|---|---|
| `Text(content: Any)` | Erzeugt Text aus einem beliebigen Wert (per toString): Text("Hallo"), Text("n = " + this.n.value) *(Element)* |

<a id="heading"></a>

### `class Heading: View`

Überschrift; erzeugt &lt;h1&gt; bis &lt;h6&gt; mit fetter Schrift und abgestuften Größen.

| Signatur | Beschreibung |
|---|---|
| `Heading(content: Any, level: Int = 1)` | Überschrift mit konstanter Ebene 1–6 (Standard 1): Heading("Titel", level: 2) *(Element)* |

<a id="paragraph"></a>

### `class Paragraph: View`

Absatz mit Fließtext; erzeugt ein &lt;p&gt; mit gut lesbarer Zeilenhöhe.

| Signatur | Beschreibung |
|---|---|
| `Paragraph(content: Any)` | Erzeugt einen Absatz aus einem beliebigen Wert. *(Element)* |

<a id="highlight"></a>

### `class Highlight: View`

Ausschnitt eines Suchtreffers mit hervorgehobenen Fundstellen: erzeugt ein &lt;span&gt;, die Fundstellen stehen in
&lt;mark&gt;. Der Text wird nie als HTML gelesen: Highlight(treffer.snippet)

| Signatur | Beschreibung |
|---|---|
| `Highlight(snippet: String)` | Text, in dem Fundstellen zwischen \u0002 und \u0003 stehen (wie Treffer.snippet). *(Element)* |

<a id="button"></a>

### `class Button: Container`

Schaltfläche; erzeugt ein &lt;button type="button"&gt; im Standardstil (Indigo, weiße Schrift, abgerundet).
Als Container kann sie mit .content(…) beliebigen Inhalt aufnehmen.

| Signatur | Beschreibung |
|---|---|
| `Button(label: String = "", icon: String? = null, submit: Boolean = false)` | Button mit Beschriftung und optionalem Icon vor dem Text: Button("Senden", icon: "send").onClick(…)<br>submit: true macht ihn zum Absende-Button eines Form(…) (type="submit"). *(Element)* |
| `static fn plain(label: String = ""): Button` | Button ohne Standardstil (transparent, ohne Innenabstand), z. B. für eigene Icon-Buttons. *(Element)* |

<a id="icon"></a>

### `class Icon: View`

Eingebautes Vektor-Icon als &lt;svg&gt;; nimmt die aktuelle Textfarbe an (currentColor).

| Signatur | Beschreibung |
|---|---|
| `Icon(name: String, size: Length = 20.px, strokeWidth: Float = 2.0)` | Icon nach Namen, z. B. "check", "search", "trash", "user"; unbekannte Namen sind ein Compilerfehler (auch über Parameter durchgereicht): Icon("heart", size: 24.px) *(Element)* |

<a id="image"></a>

### `class Image: View`

Bild; erzeugt ein &lt;img&gt; mit Lazy Loading, das nie breiter als sein Container wird.

| Signatur | Beschreibung |
|---|---|
| `Image(src: Url, alt: String = "")` | Bild aus einer URL mit Alternativtext für Screenreader: Image("/logo.png", alt: "Logo") *(Element)* |
| `fn fit(mode: ImageFit): Self` | Wie das Bild in seine Box eingepasst wird (object-fit): .fit(ImageFit.Cover) *(Modifier)* |

<a id="media"></a>

### `class Media: View`

Gemeinsame Steuerung von Video und Audio (&lt;video&gt;, &lt;audio&gt;).

| Signatur | Beschreibung |
|---|---|
| `fn autoplay(when: Boolean = true): Self` | Startet sofort; Browser erlauben das bei Videos nur stumm: .autoplay().muted() *(Attribut)* |
| `fn muted(when: Boolean = true): Self` | Ohne Ton (reaktiv, z. B. an einen State gebunden): .muted(this.stumm.value) *(Attribut)* |
| `fn loop(when: Boolean = true): Self` | Beginnt am Ende von vorn. *(Attribut)* |
| `fn preload(mode: String): Self` | Was vorab geladen wird: "none", "metadata" (Standard: Länge und erstes Bild) oder "auto". *(Attribut)* |
| `fn onPlay(action: () => Void): Self` | Wiedergabe beginnt (play). *(Ereignis)* |
| `fn onPause(action: () => Void): Self` | Wiedergabe angehalten (pause). *(Ereignis)* |
| `fn onEnded(action: () => Void): Self` | Am Ende angekommen (ended). *(Ereignis)* |
| `fn onTimeUpdate(action: (Float) => Void): Self` | Laufend während der Wiedergabe, mit der aktuellen Position in Sekunden (timeupdate). *(Ereignis)* |

<a id="video"></a>

### `class Video: Media`

Video; erzeugt ein &lt;video&gt;, das nie breiter als sein Container wird und auf dem iPhone in der Seite spielt.
Dateien aus public/ liefert der Server in Teilen (Range): Spulen geht sofort, auch bei großen Videos.

| Signatur | Beschreibung |
|---|---|
| `Video(src: Url, poster: Url? = null, controls: Boolean = true)` | Video mit Vorschaubild und Bedienleiste: Video("/filme/intro.mp4", poster: "/filme/intro.jpg") *(Element)* |
| `static fn live(name: String, poster: Url? = null, controls: Boolean = true): Video` | Live-Sendung aus OBS (Backend texo mit TEXO_LIVE_KEY, in OBS Stream-Schlüssel "name?key=…"). Spielt ab, sobald<br>gesendet wird, und wartet sonst darauf; über HLS, mit wenigen Sekunden Verzögerung: Video.live("kamera").autoplay().muted() *(Element)* |
| `fn fit(mode: ImageFit): Self` | Wie das Video in seine Box eingepasst wird (object-fit): .fit(ImageFit.Cover) *(Modifier)* |

<a id="audio"></a>

### `class Audio: Media`

Audio; erzeugt ein &lt;audio&gt; mit Bedienleiste in voller Breite.

| Signatur | Beschreibung |
|---|---|
| `Audio(src: Url, controls: Boolean = true)` | Audio aus einer URL: Audio("/podcast/folge1.mp3") *(Element)* |

<a id="input"></a>

### `class Input: View`

Einzeiliges Textfeld (&lt;input&gt;) in voller Breite. Ein State&lt;String&gt; als bind sorgt für Zwei-Wege-Bindung.

| Signatur | Beschreibung |
|---|---|
| `Input(bind: State<String>? = null, placeholder: String = "", type: InputType = InputType.Text, name: String = "")` | Textfeld mit Bindung, Platzhalter und Typ: Input(bind: this.name, placeholder: "Name", type: InputType.Email)<br>name: Feldname in einem Form(…), gleich dem Parameter der Service-Methode: Input(name: "text") *(Element)* |
| `fn onInput(action: (String) => Void): Self` | Wird bei jeder Eingabe mit dem aktuellen Text aufgerufen (input). *(Ereignis)* |
| `fn onChange(action: (String) => Void): Self` | Wird aufgerufen, wenn die Eingabe abgeschlossen ist, etwa beim Verlassen des Felds (change). *(Ereignis)* |
| `fn onSubmit(action: () => Void): Self` | Wird beim Drücken der Eingabetaste aufgerufen. *(Ereignis)* |

<a id="textarea"></a>

### `class TextArea: View`

Mehrzeiliges Textfeld (&lt;textarea&gt;), vertikal in der Größe veränderbar.

| Signatur | Beschreibung |
|---|---|
| `TextArea(bind: State<String>? = null, placeholder: String = "", rows: Int = 4, name: String = "")` | Textbereich mit Bindung, Platzhalter und sichtbarer Zeilenzahl (Standard 4). *(Element)* |
| `fn onInput(action: (String) => Void): Self` | Wird bei jeder Eingabe mit dem aktuellen Text aufgerufen (input). *(Ereignis)* |
| `fn onChange(action: (String) => Void): Self` | Wird aufgerufen, wenn die Eingabe abgeschlossen ist (change). *(Ereignis)* |

<a id="checkbox"></a>

### `class Checkbox: View`

Kontrollkästchen mit Beschriftung; erzeugt &lt;label&gt; mit &lt;input type="checkbox"&gt;.

| Signatur | Beschreibung |
|---|---|
| `Checkbox(bind: State<Boolean>? = null, label: String = "", name: String = "")` | Checkbox, zwei-wege-gebunden an einen State&lt;Boolean&gt;: Checkbox(bind: this.zustimmung, label: "Ich stimme zu") *(Element)* |
| `fn onChange(action: (Boolean) => Void): Self` | Wird mit dem neuen Zustand aufgerufen, wenn sich das Häkchen ändert. *(Ereignis)* |

<a id="filepicker"></a>

### `class FilePicker: View`

Dateiauswahl (&lt;input type="file"&gt;). Die gewählte Datei steht in bind (null, solange keine gewählt ist) oder geht
in einem Form(…) unter 'name' an die Service-Methode (Parameter vom Typ Upload).

| Signatur | Beschreibung |
|---|---|
| `FilePicker(bind: State<Upload?>? = null, accept: String = "", name: String = "")` | Auswahl, gebunden an einen State&lt;Upload?&gt;; 'accept' schränkt die Auswahl im Browser ein: FilePicker(bind: this.foto, accept: "image/*") *(Element)* |

<a id="toggle"></a>

### `class Toggle: View`

Ein-/Aus-Schalter; eine als Schalter gestaltete Checkbox mit role="switch".

| Signatur | Beschreibung |
|---|---|
| `Toggle(bind: State<Boolean>, label: String = "")` | Schalter, zwei-wege-gebunden an einen State&lt;Boolean&gt;: Toggle(bind: this.aktiv, label: "Aktiv") *(Element)* |
| `fn onChange(action: (Boolean) => Void): Self` | Wird mit dem neuen Zustand aufgerufen, wenn umgeschaltet wird. *(Ereignis)* |

<a id="slider"></a>

### `class Slider: View`

Schieberegler (&lt;input type="range"&gt;) für Zahlenwerte.

| Signatur | Beschreibung |
|---|---|
| `Slider(bind: State<Float>, min: Float = 0.0, max: Float = 100.0, step: Float = 1.0)` | Regler, gebunden an einen State&lt;Float&gt;, mit Bereich und Schrittweite (Standard 0 bis 100 in Schritten von 1). *(Element)* |
| `fn onChange(action: (Float) => Void): Self` | Wird beim Ziehen fortlaufend mit dem aktuellen Wert aufgerufen (input). *(Ereignis)* |

<a id="select"></a>

### `class Select: View`

Auswahlliste (&lt;select&gt;) mit einer &lt;option&gt; je Eintrag.

| Signatur | Beschreibung |
|---|---|
| `Select(options: List<String>, bind: State<String>? = null, name: String = "")` | Auswahl aus festen Texten, optional an einen State&lt;String&gt; gebunden: Select(["Rot", "Grün"], bind: this.farbe) *(Element)* |
| `static fn of<T, V>(options: List<T>, value: (T) => V, text: (T) => String, bind: State<V?>? = null, placeholder: String? = null, name: String = ""): Select` | Auswahl aus beliebigen Einträgen: value liefert den gebundenen Wert, text die Anzeige: Select.of(this.kunden.value, value: k => k.id, text: k => k.name, bind: this.kundeId, placeholder: "Kunde wählen"). Der Platzhalter steht für null; ohne Platzhalter ist nichts gewählt, solange bind keinen passenden Wert hat. In einem Form(…) geht der Wert unter 'name' an die Service-Methode. *(Element)* |
| `fn onChange(action: (String) => Void): Self` | Wird mit dem gewählten Eintrag aufgerufen (bei Select.of mit dem Wert als Text). *(Ereignis)* |

<a id="label"></a>

### `class Label: Container`

Beschriftung für ein Eingabefeld (&lt;label&gt;): der Text steht vor den Kindern, ein Klick darauf wählt das Feld.

| Signatur | Beschreibung |
|---|---|
| `Label(text: String, ...children: View)` | Beschriftung mit Text und dem beschrifteten Feld: Label("E-Mail", Input(bind: this.mail, name: "mail")) *(Element)* |

<a id="tablecolumn"></a>

### `class TableColumn<T>`

Spalte einer Table: Überschrift und Inhalt je Zeile.

| Signatur | Beschreibung |
|---|---|
| `TableColumn(title: String, cell: (T) => View)` | TableColumn("Name", k => Text(k.name)) |

<a id="table"></a>

### `class Table<T>: View`

Tabelle (&lt;table&gt;) mit Kopfzeile; je Eintrag eine Zeile, Zeilen werden über key wiederverwendet.

| Signatur | Beschreibung |
|---|---|
| `Table(items: List<T>, ...columns: TableColumn<T>, key: ((T) => Any)? = null)` | Table(this.kunden.value, TableColumn("Name", k => Text(k.name)), TableColumn("Ort", k => Text(k.ort)), key: k => k.id) *(Element)* |

<a id="combobox"></a>

### `class Combobox: View`

Eingabefeld mit Vorschlagsliste (ARIA-Muster Combobox): Tippen filtert die Einträge, Pfeiltasten wählen aus,
Enter übernimmt, Escape schließt. Der gewählte oder getippte Text steht in bind.

| Signatur | Beschreibung |
|---|---|
| `Combobox(options: List<String>, bind: State<String>, label: String = "", placeholder: String = "", filter: ((String, String) => Boolean)? = null)` | Combobox(this.staedte, bind: this.stadt, label: "Stadt"); filter ersetzt die Standardsuche (Teiltext ohne<br>Groß-/Kleinschreibung): filter: (eintrag, eingabe) => eintrag.startsWith(eingabe). options darf aus einer Resource kommen. *(Element)* |

<a id="stack"></a>

### `class Stack: Container`

Flexbox-Container, der Kinder untereinander, nebeneinander oder übereinander anordnet.
Kinder werden variadisch oder als Liste übergeben.

| Signatur | Beschreibung |
|---|---|
| `static fn vertical(...children: View, spacing: Length? = null, alignment: Alignment? = null, crossAlignment: CrossAlignment? = null): Stack` | Spalte: Kinder von oben nach unten (flex-direction: column). *(Element)* |
| `static fn horizontal(...children: View, spacing: Length? = null, alignment: Alignment? = null, crossAlignment: CrossAlignment? = null): Stack` | Zeile: Kinder von links nach rechts, standardmäßig vertikal zentriert. *(Element)* |
| `static fn layered(...children: View, alignment: Alignment? = null): Stack` | Kinder übereinandergelegt (Grid-Stapel), z. B. Text auf einem Bild; alignment positioniert alle Kinder. *(Element)* |

<a id="row"></a>

### `class Row: Container`

Zeile; Kurzform für Stack.horizontal (Kinder nebeneinander, vertikal zentriert).

| Signatur | Beschreibung |
|---|---|
| `Row(...children: View, spacing: Length? = null, alignment: Alignment? = null, crossAlignment: CrossAlignment? = null)` | Zeile mit Kindern, Abstand und Ausrichtung: Row(spacing: 8.px, [Text("A"), Spacer(), Text("B")]) *(Element)* |

<a id="column"></a>

### `class Column: Container`

Spalte; Kurzform für Stack.vertical (Kinder untereinander).

| Signatur | Beschreibung |
|---|---|
| `Column(...children: View, spacing: Length? = null, alignment: Alignment? = null, crossAlignment: CrossAlignment? = null)` | Spalte mit Kindern, Abstand und Ausrichtung: Column(spacing: 16.px, crossAlignment: CrossAlignment.center, [ … ]) *(Element)* |

<a id="box"></a>

### `class Box: Container`

Neutraler Container ohne Layoutregeln (&lt;div&gt;, position: relative), etwa als Bezug für absolut positionierte Kinder.

| Signatur | Beschreibung |
|---|---|
| `Box(...children: View)` | Box mit den angegebenen Kindern. *(Element)* |

<a id="grid"></a>

### `class Grid: Container`

CSS-Grid mit gleich breiten Spalten (Standard: 2 Spalten, 16 px Abstand).

| Signatur | Beschreibung |
|---|---|
| `Grid(...children: View, columns: Int = 2, spacing: Length? = null, minColumnWidth: Length? = null)` | Raster mit fester Spaltenzahl oder, mit minColumnWidth, so vielen Spalten wie passen: Grid(…, minColumnWidth: 200.px) *(Element)* |
| `fn columns(count: Int): Self` | Anzahl gleich breiter Spalten, nützlich in responsiven Varianten: .columns(1).md(g => g.columns(3)) *(Modifier)* |
| `fn adaptive(minWidth: Length): Self` | So viele Spalten, wie hineinpassen, jede mindestens minWidth breit. *(Modifier)* |

<a id="card"></a>

### `class Card: Container`

Fläche mit weißem Hintergrund, abgerundeten Ecken (16 px), Innenabstand (20 px) und leichtem Schatten; Kinder untereinander.

| Signatur | Beschreibung |
|---|---|
| `Card(...children: View)` | Karte mit den angegebenen Kindern. *(Element)* |

<a id="scrollview"></a>

### `class ScrollView: Container`

Scrollbarer Bereich; begrenze seine Größe mit height/maxHeight bzw. width/maxWidth.

| Signatur | Beschreibung |
|---|---|
| `ScrollView(...children: View, axis: Axis = Axis.Vertical)` | Scrollbereich mit Kindern, Standard vertikal: ScrollView(…, axis: Axis.Horizontal) *(Element)* |

<a id="slothost"></a>

### `class SlotHost: View`

Komponente mit ChildPlaceholder() oder benannten Teilen (.part("name")): nimmt Inhalt und Stile des Aufrufers auf.
Jede solche Komponente erbt automatisch davon.

| Signatur | Beschreibung |
|---|---|
| `fn style(part: String, style: (View) => View): Self` | Gestaltet ein benanntes Teil der Komponente (.part("icon") in ihrem build()); schlägt deren eigene Stile:<br>FancyButton().style("icon", s => s.textColor(Color.Amber400).hover(h => h.scale(1.2))) |
| `fn content(...children: View): Self` | Inhalt für den ChildPlaceholder() der Komponente: FancyButton().content(Icon("star"), Text("Speichern")) *(Inhalt)* |
| `fn slot(name: String, ...children: View): Self` | Inhalt für einen benannten Platzhalter ChildPlaceholder("icon"): FancyButton().slot("icon", Icon("star")) |

<a id="childplaceholder"></a>

### `class ChildPlaceholder: View`

Platzhalter in build() einer Komponente für Inhalt, den der Aufrufer übergibt – z. B. der Text und das Icon in
einem fertig gestalteten Button einer Bibliothek. Ohne Namen füllt ihn .content(…), mit Namen .slot(name, …).

| Signatur | Beschreibung |
|---|---|
| `ChildPlaceholder(name: String = "", fallback: View? = null)` | Platzhalter mit optionalem Namen und Ersatzinhalt, falls der Aufrufer nichts übergibt:<br>ChildPlaceholder(), ChildPlaceholder("icon"), ChildPlaceholder(fallback: Text("Los")) *(Element)* |

<a id="lazy"></a>

### `class Lazy: View`

Lädt eine Komponente aus einer anderen Datei erst, wenn sie gebraucht wird (eigene JS-Datei, nachgeladen) –
für große Teile wie Diagramme, Editoren oder Karten. Bis dahin (und beim Vorrendern) erscheint placeholder.

| Signatur | Beschreibung |
|---|---|
| `Lazy(content: () => View, placeholder: View? = null, whenVisible: Boolean = false)` | Lazy(() => Diagramm(this.daten), placeholder: Spinner()); whenVisible: erst laden, wenn der Platzhalter<br>in die Nähe des sichtbaren Bereichs kommt *(Element)* |

<a id="errorboundary"></a>

### `class ErrorBoundary: View`

Fängt Fehler beim Aufbauen und Aktualisieren des Inhalts ab: statt der ganzen Seite fällt nur dieser Teil aus
und zeigt fallback (ohne fallback einen kurzen Hinweis). retry baut den Inhalt neu auf.

| Signatur | Beschreibung |
|---|---|
| `ErrorBoundary(content: View, fallback: ((Error, () => Void) => View)? = null)` | ErrorBoundary(Diagramm(this.daten), fallback: (e, retry) => Column([Text("Fehler: ${e.message}"), Button("Nochmal").onClick(retry)])) *(Element)* |

<a id="spacer"></a>

### `class Spacer: View`

Flexibler Leerraum in Stacks, der freien Platz füllt und Nachbarn auseinanderschiebt.

| Signatur | Beschreibung |
|---|---|
| `Spacer(size: Length? = null)` | Ohne size dehnbar; mit size ein fester Abstand: Spacer(), Spacer(24.px) *(Element)* |

<a id="divider"></a>

### `class Divider: View`

Horizontale Trennlinie (&lt;hr&gt;), standardmäßig 1 px in Gray200.

| Signatur | Beschreibung |
|---|---|
| `Divider(color: Color? = null, thickness: Length? = null)` | Trennlinie mit optionaler Farbe und Stärke: Divider(color: Color.Slate200, thickness: 2.px) *(Element)* |

<a id="shape"></a>

### `class Shape: View`

Einfache geometrische Form (Kreis, Rechteck, Kapsel) zum Füllen und Umranden.

| Signatur | Beschreibung |
|---|---|
| `static fn circle(size: Length): Shape` | Kreis mit dem angegebenen Durchmesser. *(Element)* |
| `static fn rect(width: Length, height: Length): Shape` | Rechteck mit Breite und Höhe. *(Element)* |
| `static fn capsule(width: Length, height: Length): Shape` | Rechteck mit vollständig abgerundeten Enden (Pillenform). *(Element)* |
| `fn fill(fill: Paint): Self` | Füllung mit Farbe oder Verlauf (background): .fill(Color.Indigo100) *(Modifier)* |
| `fn stroke(width: Length = 1.px, color: Color = Color.Black): Self` | Umrandung (border), Standard 1 px schwarz. *(Modifier)* |

<a id="link"></a>

### `class Link: Container`

Hyperlink (&lt;a&gt;). Pfade mit führendem "/" navigieren ohne Neuladen im Router (href="#/pfad");
der Link zur aktuellen Route erhält aria-current="page".

| Signatur | Beschreibung |
|---|---|
| `Link(label: String = "", to: Url = "#", external: Boolean = false)` | Link mit Text und Ziel; external: true öffnet in neuem Tab: Link("Doku", to: "https://…", external: true) *(Element)* |

<a id="formaction"></a>

### `class FormAction<T>`

Aktion eines Formulars: eine Service-Methode als Wert, z. B. NotesApi.add (nur als Argument von Form).

<a id="form"></a>

### `class Form<T>: Container`

Formular (&lt;form method="post"&gt;), das eine Service-Methode aufruft. Die Felder (Input(name: …) usw.) heißen wie ihre
Parameter oder, bei einem einzigen data-class-Parameter, wie deren Eigenschaften. Mit JavaScript läuft es über den
typisierten Aufruf und zeigt Feldfehler am Feld; ohne JavaScript schickt der Browser es direkt an den Server.

| Signatur | Beschreibung |
|---|---|
| `Form<T>(action: FormAction<T>, ...children: View, onDone: ((T) => Void)? = null, onError: ((String) => Void)? = null)` | Form(NotesApi.add, onDone: n => this.notes.value.add(n), Input(name: "text"), Button("Speichern", submit: true)) *(Element)* |

<a id="progressbar"></a>

### `class ProgressBar: View`

Fortschrittsbalken (role="progressbar") mit Werten von 0.0 bis 1.0; Breitenänderungen werden animiert.

| Signatur | Beschreibung |
|---|---|
| `ProgressBar(value: Float, color: Color? = null)` | Balken mit Füllstand (wird auf 0.0–1.0 begrenzt) und optionaler Farbe (Standard Indigo). *(Element)* |

<a id="spinner"></a>

### `class Spinner: View`

Drehender Ladeindikator (role="status", aria-label "Lädt…").

| Signatur | Beschreibung |
|---|---|
| `Spinner(size: Length = 24.px, color: Color? = null)` | Spinner mit Durchmesser (Standard 24 px) und optionaler Farbe. *(Element)* |

<a id="empty"></a>

### `class Empty: View`

Rendert nichts; Platzhalter, wo eine View erwartet wird, z. B. in Bedingungen.

| Signatur | Beschreibung |
|---|---|
| `Empty()` | Erzeugt die leere View. *(Element)* |

<a id="foreach"></a>

### `class ForEach<T>: View`

Rendert eine (reaktive) Liste effizient; DOM-Knoten werden über Schlüssel wiederverwendet.

| Signatur | Beschreibung |
|---|---|
| `ForEach<T>(items: List<T>, builder: (T, Int) => View, key: ((T) => Any)? = null)` | builder erhält Element und Index; key liefert einen eindeutigen Schlüssel (Standard: das Element selbst):<br>ForEach(this.items.value, (e, i) => Text(e.name), key: e => e.id) *(Element)* |
| `fn animateMoves(duration: Duration = 200.ms): Self` | Lässt Zeilen, deren Platz sich ändert (etwa nach dem Sortieren), an die neue Stelle gleiten. *(Übergang)* |

<a id="if"></a>

### `class If: View`

Bedingte View: zeigt then oder otherwise und wechselt nur, wenn sich das Ergebnis der Bedingung ändert.

| Signatur | Beschreibung |
|---|---|
| `If(condition: Boolean, then: View, otherwise: View? = null)` | If(this.liste.value.isEmpty(), Text("Leer"), otherwise: Text("Gefüllt")) *(Element)* |

<a id="dialog"></a>

### `class Dialog: Container`

Modaler Dialog (&lt;dialog&gt;): hält den Fokus im Dialog, schließt mit Escape oder einem Klick daneben und gibt den Fokus
danach an das zuvor fokussierte Element zurück. Beim Vorrendern steht er geschlossen im HTML.

| Signatur | Beschreibung |
|---|---|
| `Dialog(open: State<Boolean>, ...children: View, title: String = "")` | Dialog(open: this.fragen, title: "Wirklich löschen?", [Text("…"), Button("Abbrechen").onClick(…)]); geöffnet ist er,<br>solange open true ist, Escape und ein Klick daneben setzen open auf false. title wird zur Überschrift (aria-labelledby). *(Element)* |

<a id="tabs"></a>

### `class Tabs: View`

Reiter mit Tastaturbedienung (Pfeiltasten, Pos1, Ende); der Inhalt eines Reiters entsteht erst, wenn er gewählt wird.

| Signatur | Beschreibung |
|---|---|
| `Tabs(...tabs: Tab, bind: State<Int>? = null)` | Tabs(bind: this.reiter, [Tab("Profil", () => Profil()), Tab("Sicherheit", () => Sicherheit())]); bind hält die<br>Nummer des gewählten Reiters (ab 0), ohne bind merkt sich Tabs die Wahl selbst. *(Element)* |

<a id="tab"></a>

### `class Tab`

Ein Reiter von Tabs: Beschriftung und eine Funktion, die den Inhalt baut.

| Signatur | Beschreibung |
|---|---|
| `Tab(label: String, content: () => View)` | Tab("Profil", () => Profil()) |

<a id="menu"></a>

### `class Menu: View`

Aufklappmenü (ARIA-Muster Menu Button): ein Button öffnet eine Liste von Aktionen, Pfeiltasten wählen aus,
Escape schließt und gibt den Fokus an den Button zurück.

| Signatur | Beschreibung |
|---|---|
| `Menu(label: String, ...items: MenuItem)` | Menu("Aktionen", [MenuItem("Umbenennen", () => this.umbenennen()), MenuItem("Löschen", () => this.loeschen())]) *(Element)* |

<a id="menuitem"></a>

### `class MenuItem`

Ein Eintrag eines Menu: Beschriftung, Aktion und ob er gerade gesperrt ist.

| Signatur | Beschreibung |
|---|---|
| `MenuItem(label: String, action: () => Void, disabled: Boolean = false)` | MenuItem("Löschen", () => this.loeschen(), disabled: this.leer.value) |

<a id="toast"></a>

### `class Toast`

Kurze Meldung am Bildschirmrand, die sich nach einiger Zeit selbst ausblendet. Screenreader lesen sie über eine
Live-Region vor (role="status", Fehler mit role="alert"). Beim Vorrendern auf dem Server passiert nichts.

| Signatur | Beschreibung |
|---|---|
| `static fn show(message: String, kind: ToastKind = ToastKind.Info, duration: Duration = 4.s): Void` | Toast.show("Gespeichert", kind: ToastKind.Success); duration: 0.ms lässt die Meldung stehen, bis sie geschlossen wird.<br>Solange der Mauszeiger oder der Fokus auf der Meldung liegt, bleibt sie stehen. |
| `static fn clear(): Void` | Entfernt alle Meldungen sofort. |

<a id="transition"></a>

### `class Transition`

Übergang zum Ein- und Ausblenden für .transition(…).

| Signatur | Beschreibung |
|---|---|
| `static fn fade(duration: Duration = 200.ms): Transition` | Blendet die Deckkraft ein und aus. |
| `static fn scale(duration: Duration = 200.ms): Transition` | Zoomt von 95 % herein und blendet dabei ein, beim Verschwinden umgekehrt. |
| `static fn slide(from: Edge = Edge.Bottom, duration: Duration = 250.ms): Transition` | Gleitet von einer Seite herein (16 px) und blendet ein: Transition.slide(from: Edge.Top) |

<a id="router"></a>

### `class Router: View`

Clientseitiger Router (hash-basiert, #/pfad); funktioniert auf jedem statischen Host. Die erste passende Route gewinnt.

| Signatur | Beschreibung |
|---|---|
| `Router(...routes: Route, fallback: View? = null)` | Router aus Routen; fallback erscheint, wenn keine Route passt oder ein Wächter den Zugriff verweigert:<br>Router(Route("/", _ => Start()), Route("/nutzer/:id", p => Nutzer(p.get("id"))), fallback: Text("404")) *(Element)* |

<a id="route"></a>

### `class Route`

Eine Route des Routers: Pfadmuster und die zugehörige View. ":name" markiert Parameter, "*" passt auf beliebige Restsegmente.

| Signatur | Beschreibung |
|---|---|
| `Route(path: String, view: (RouteParams) => View, guard: (() => Access)? = null)` | Route mit Pfad, View-Funktion und optionalem Wächter. Der Wächter (guard) läuft nur im Browser vor dem Anzeigen;<br>echten Schutz bieten Server-Wächter. Access.redirect(…) leitet um, sonst erscheint der fallback des Routers. |

<a id="routeparams"></a>

### `class RouteParams`

Parameter einer passenden Route, z. B. "id" aus "/nutzer/:id".

| Signatur | Beschreibung |
|---|---|
| `fn get(name: String): String` | Wert des Parameters; leerer String, wenn er fehlt. |
| `fn has(name: String): Boolean` | Prüft, ob der Parameter vorhanden ist. |

<a id="ref"></a>

### `class Ref<T>`

Verweis auf eine Komponente, um ihre öffentlichen Methoden von außen aufzurufen:
private val dialog = Ref&lt;Dialog&gt;() … Dialog().ref(this.dialog) … this.dialog.value?.oeffnen()

| Signatur | Beschreibung |
|---|---|
| `Ref<T>()` | Leerer Verweis; gesetzt wird er mit .ref(…) beim Aufruf der Komponente. |
| `val value: T?` | Die Komponente, solange sie angezeigt wird, sonst null (reaktiv). |

<a id="context"></a>

### `class Context<T>`

Wert, den ein Teil der Oberfläche allen Komponenten darin bereitstellt – ohne ihn durch jede Ebene zu reichen.
Bereitstellen mit .provide(Groesse, Groesse.Klein), lesen mit Groesse.value (in build() oder Feld-Initialisierern).

| Signatur | Beschreibung |
|---|---|
| `Context<T>(fallback: T)` | Kontext mit Standardwert, der gilt, wo nichts bereitgestellt wurde: val Dichte = Context&lt;Int&gt;(16) |
| `val value: T` | Der nächste bereitgestellte Wert (reaktiv), sonst der Standardwert. |
| `val fallback: T` | Der Standardwert. |

<a id="navigator"></a>

### `class Navigator`

Programmatische Navigation des hash-basierten Routers.

| Signatur | Beschreibung |
|---|---|
| `static val path: String` | Aktueller Routenpfad, z. B. "/nutzer/42" (reaktiv: Views aktualisieren sich bei jedem Routenwechsel). |
| `static fn go(path: String): Void` | Navigiert zum angegebenen Pfad: Navigator.go("/einstellungen") |
| `static fn back(): Void` | Geht im Browserverlauf einen Schritt zurück. |
| `static fn isActive(path: String): Boolean` | Prüft (reaktiv), ob der Pfad der aktuellen Route entspricht, etwa für aktive Menüeinträge. |

<a id="keyframe"></a>

### `class Keyframe`

Ein Schritt einer eigenen Animation für .keyframes(…): Position von 0.0 (Anfang) bis 1.0 (Ende) und die Stile an dieser Stelle.
Keyframe(0.5, s => s.scale(1.1).textColor(Color.Rose500))

| Signatur | Beschreibung |
|---|---|
| `Keyframe(at: Float, style: (View) => View)` | Keyframe an Position 'at' (0.0–1.0) mit einer Kette aus Stil-Modifiern; alle Werte müssen Konstanten sein. |

<a id="cursor"></a>

### `class Cursor`

Mauszeiger: ein Standard-Zeiger des Browsers (Cursor.Pointer, Cursor.Grab …) oder ein eigenes Bild (Cursor.image).

#### Standard-Zeiger

| Signatur | Beschreibung |
|---|---|
| `static val Default: Cursor` | Normaler Pfeil. |
| `static val Auto: Cursor` | Der Browser entscheidet (Text-Cursor über Text, Pfeil sonst). |
| `static val None: Cursor` | Kein Mauszeiger sichtbar. |
| `static val Pointer: Cursor` | Hand mit Zeigefinger – für Klickbares. |
| `static val Text: Cursor` | Text-Cursor (I-Balken). |
| `static val Move: Cursor` | Verschieben (Kreuz mit Pfeilen). |
| `static val NotAllowed: Cursor` | Nicht erlaubt (durchgestrichener Kreis). |
| `static val Grab: Cursor` | Offene Hand – ziehbar. |
| `static val Grabbing: Cursor` | Geschlossene Hand – wird gerade gezogen. |
| `static val Wait: Cursor` | Warten (Sanduhr/Kreisel), die Seite ist blockiert. |
| `static val Progress: Cursor` | Arbeitet im Hintergrund, die Seite bleibt bedienbar. |
| `static val Help: Cursor` | Hilfe (Pfeil mit Fragezeichen). |
| `static val Crosshair: Cursor` | Fadenkreuz. |
| `static val ZoomIn: Cursor` | Lupe zum Vergrößern. |
| `static val ZoomOut: Cursor` | Lupe zum Verkleinern. |
| `static val Copy: Cursor` | Kopieren (Pfeil mit Plus). |
| `static val ContextMenu: Cursor` | Kontextmenü verfügbar. |
| `static val Cell: Cursor` | Zelle auswählen (dickes Plus), etwa in Tabellen. |
| `static val ColResize: Cursor` | Spaltenbreite ändern. |
| `static val RowResize: Cursor` | Zeilenhöhe ändern. |
| `static val EwResize: Cursor` | Größe horizontal ändern (links/rechts). |
| `static val NsResize: Cursor` | Größe vertikal ändern (oben/unten). |
| `static val NeswResize: Cursor` | Größe diagonal ändern (rechts oben/links unten). |
| `static val NwseResize: Cursor` | Größe diagonal ändern (links oben/rechts unten). |

#### Eigene Zeiger

| Signatur | Beschreibung |
|---|---|
| `static fn image(src: String, x: Int = 0, y: Int = 0, fallback: Cursor = Cursor.Default): Cursor` | Eigenes Bild als Mauszeiger (PNG, SVG, CUR; empfohlen höchstens 32 × 32 px).<br>x/y = Klickpunkt im Bild (Hotspot), fallback = Zeiger, falls das Bild nicht lädt:<br>Cursor.image("cursor.png", x: 4, y: 2, fallback: Cursor.Pointer). Bilder liegen im Ordner public/ des Projekts. |

<a id="globalstyle"></a>

### `class GlobalStyle`

Seitenweite Stile, einmal mit @Global definiert und beim Kompilieren in app.css geschrieben:
@Global val Design = GlobalStyle().cursor(Cursor.image("zeiger.png")).fontFamily(Font.named("Inter")).primaryColor(Color.Emerald600)
Alle Werte müssen Konstanten sein. Einzelne Elemente können die Werte mit Modifiern überschreiben.

| Signatur | Beschreibung |
|---|---|
| `GlobalStyle()` | Leere Sammlung globaler Stile; Methoden anhängen: GlobalStyle().background(Color.Slate50) |

#### Mauszeiger

| Signatur | Beschreibung |
|---|---|
| `fn cursor(value: Cursor): GlobalStyle` | Mauszeiger für die ganze Seite (html): .cursor(Cursor.image("zeiger.png", x: 2, y: 2)) |
| `fn pointerCursor(value: Cursor): GlobalStyle` | Mauszeiger über allem Klickbaren (Links, Buttons, Checkboxen, Slider, Auswahllisten, Labels):<br>.pointerCursor(Cursor.image("hand.png", x: 8, y: 0, fallback: Cursor.Pointer)). Deaktivierte Elemente behalten NotAllowed. |

#### Farben und Schrift

| Signatur | Beschreibung |
|---|---|
| `fn background(fill: Paint): GlobalStyle` | Hintergrund der Seite (body): Farbe oder Verlauf. |
| `fn textColor(color: Paint): GlobalStyle` | Standard-Textfarbe der Seite (body). |
| `fn fontFamily(font: Font): GlobalStyle` | Standardschrift der Seite: .fontFamily(Font.named("Inter")). Die Schrift selbst muss eingebunden sein. |
| `fn fontSize(size: Length): GlobalStyle` | Basis-Schriftgröße (html); alle rem-Werte richten sich danach: .fontSize(18.px) |
| `fn lineHeight(value: Float): GlobalStyle` | Standard-Zeilenhöhe als Faktor der Schriftgröße: .lineHeight(1.6) |
| `fn letterSpacing(value: Length): GlobalStyle` | Standard-Zeichenabstand: .letterSpacing(0.2.px) |
| `fn fontFace(family: String, src: String, weight: String = "400", style: String = "normal"): GlobalStyle` | Bindet eine Schriftdatei aus public/ ein (@font-face, font-display: swap); danach mit Font.named nutzbar:<br>.fontFace("Inter", "fonts/Inter.woff2", weight: "100 900").fontFamily(Font.named("Inter")) |
| `fn primaryColor(color: Color): GlobalStyle` | Hauptfarbe aller eingebauten Elemente: Buttons, Links, Fokus-Rahmen, Checkboxen, Schalter, Slider, Fortschritt, Spinner.<br>Standard ist Indigo (#4f46e5): .primaryColor(Color.Emerald600) |
| `fn surfaceColor(color: Color): GlobalStyle` | Hintergrund von Karten, Eingabefeldern, Textbereichen und Auswahllisten (Standard Weiß, mit .colorScheme("light dark")<br>im Dunkelmodus #1f2937): .dark(GlobalStyle().surfaceColor(Color.Slate800)) |
| `fn borderColor(color: Color): GlobalStyle` | Rahmenfarbe von Eingabefeldern, Textbereichen und Auswahllisten (Standard #d1d5db): .borderColor(Color.Slate300) |
| `fn fieldTextColor(color: Color): GlobalStyle` | Textfarbe in Eingabefeldern, Textbereichen und Auswahllisten (Standard #111827): .fieldTextColor(Color.Slate900) |
| `fn placeholderColor(color: Color): GlobalStyle` | Farbe der Platzhalter in Eingabefeldern (Standard #9ca3af): .placeholderColor(Color.Slate400) |
| `fn selection(background: Color? = null, color: Color? = null): GlobalStyle` | Farben für markierten Text (::selection): .selection(background: Color.Indigo200, color: Color.Indigo950) |

#### Scrollen

| Signatur | Beschreibung |
|---|---|
| `fn smoothScroll(enabled: Boolean = true): GlobalStyle` | Weiches Scrollen bei Sprüngen zu Ankern (scroll-behavior: smooth). |
| `fn scrollbar(thumb: Color, track: Color = Color.Transparent): GlobalStyle` | Farben der Scrollbalken (scrollbar-color): .scrollbar(Color.Slate400, Color.Slate100) |

#### Freie Regeln

| Signatur | Beschreibung |
|---|---|
| `fn variable(name: String, value: String): GlobalStyle` | CSS-Variable auf :root, nutzbar mit .css("color", "var(--marke)"): .variable("marke", "#6366f1") |
| `fn theme<T>(token: T, value: T): GlobalStyle` | Überschreibt ein Design-Token einer Bibliothek (Wert aus einem @Theme-object) für die ganze Seite:<br>.theme(UiKit.primaer, Color.Emerald600).theme(UiKit.radius, 4.px); im Dunkelmodus über .dark(GlobalStyle().theme(…)) |
| `fn rule(selector: String, property: String, value: String): GlobalStyle` | Freie CSS-Regel für einen Selektor, z. B. für eingebettetes HTML: .rule("h1, h2", "text-wrap", "balance") |
| `fn importCss(url: String): GlobalStyle` | Bindet ein externes Stylesheet ein (@import), z. B. Google Fonts. Mit Backend erlaubt Texo die Herkunft automatisch in der CSP:<br>.importCss("https://fonts.googleapis.com/css2?family=Inter:wght@400;700&amp;display=swap") |
| `fn colorScheme(value: String = "light dark"): GlobalStyle` | Farbschemata, die die Seite unterstützt (color-scheme) – Formularfelder und Scrollbalken passen sich an: .colorScheme("light dark") |
| `fn dark(style: GlobalStyle): GlobalStyle` | Stile, die nur im dunklen Farbschema des Systems gelten: .dark(GlobalStyle().background(Color.Slate950).textColor(Color.Slate100)) |

<a id="texo-server"></a>

## Paket `texo.server`

Nur im Backend verfügbar (in `service`s und `@Server`-Funktionen). Import: `import texo.server.*` – siehe [Backend und Sicherheit](backend.md).

<a id="request"></a>

### `class Request`

Die aktuelle HTTP-Anfrage; im Service als this.request, in Server-Wächtern (@Server fn g(req: Request): Access) als Parameter.

| Signatur | Beschreibung |
|---|---|
| `val method: String` | HTTP-Methode der Anfrage, z. B. "GET" oder "POST" (Service-Aufrufe sind immer "POST"). |
| `val path: String` | Pfad der URL ohne Query-String, z. B. "/api/notes/add". |
| `val ip: String` | IP-Adresse des Clients laut Socket; hinter einem Reverse Proxy dessen Adresse (X-Forwarded-For wird nicht ausgewertet), ggf. leer. |
| `val origin: String?` | Wert des Origin-Headers; null bei Navigationen auf derselben Herkunft und bei Nicht-Browser-Clients. |
| `val session: Session` | Die signierte Cookie-Session dieser Anfrage; leer, wenn kein gültiges Session-Cookie vorliegt. |
| `fn header(name: String): String?` | Liest einen Request-Header (Name ohne Beachtung der Groß-/Kleinschreibung); null, wenn nicht vorhanden: req.header("user-agent") |
| `fn cookie(name: String): String?` | Liest ein Cookie der Anfrage (URL-dekodiert); null, wenn nicht gesetzt: req.cookie("lang") |
| `fn query(name: String): String?` | Liest den ersten Wert eines Query-Parameters der URL; null, wenn nicht vorhanden: req.query("page") |
| `fn param(name: String): String?` | Liest einen Routenparameter des Seitenpfads; null, wenn der Pfad ihn nicht hat: bei @Page(path: "/notiz/:id") req.param("id") |
| `fn link(path: String): String` | Volle Adresse zu einem Pfad dieser App, z. B. für Links in E-Mails: req.link("/passwort?t=${token}"). Davor steht TEXO_PUBLIC_URL, sonst die Herkunft der Anfrage (aus dem Host-Header – für Mails TEXO_PUBLIC_URL setzen). |
| `val user: AuthUser?` | Der angemeldete Benutzer (die Datenklasse mit @Auth) oder null: req.user?.rolle == Rolle.Admin |
| `fn signIn(user: AuthUser): Void` | Meldet einen Benutzer an: speichert ihn signiert in der Session und gibt ihr eine neue Kennung (gegen Session Fixation). |
| `fn signOut(): Void` | Meldet ab: leert die Session und sperrt ihre Kennung, damit Kopien des Cookies nicht mehr gelten. |

`AuthUser` steht für die eigene Datenklasse mit `@Auth`, z. B. `@Auth data class Benutzer(id: Int, name: String, rolle: Rolle)`.

<a id="session"></a>

### `class Session`

Cookie-Session, mit HMAC-SHA256 signiert (Schlüssel TEXO_SECRET), HttpOnly, SameSite=Lax, über HTTPS Secure; gültig 7 Tage.
Manipulierte oder abgelaufene Cookies ergeben eine leere Session. Änderungen werden nur nach erfolgreichem Service-Aufruf gespeichert.

| Signatur | Beschreibung |
|---|---|
| `fn get(key: String): String?` | Liest einen Wert aus der signierten Session; null, wenn nicht gesetzt: request.session.get("user") |
| `fn set(key: String, value: String): Void` | Speichert einen Wert in der Session (nur Strings); das Cookie wird mit der Antwort neu signiert gesetzt. |
| `fn has(key: String): Boolean` | Prüft, ob unter dem Schlüssel ein Wert in der Session steht: req.session.has("user") |
| `fn remove(key: String): Void` | Entfernt einen einzelnen Wert aus der Session. |
| `fn clear(): Void` | Entfernt alle Werte (Logout); eine leere Session löscht das Cookie im Browser. |

<a id="passkeys"></a>

### `class Passkeys`

Anmeldung ohne Passwort (WebAuthn): Optionen vom Server, Passkey.create/get im Browser, die Antwort prüft wieder der Server.
Die Aufgabe (Challenge) steht in der Session und gilt für genau einen Versuch.

| Signatur | Beschreibung |
|---|---|
| `static fn registration(req: Request, userId: String, userName: String, exclude: List<String> = []): String` | Optionen für Passkey.create im Browser; 'exclude' sind Kennungen, die der Benutzer schon hat. |
| `static fn register(req: Request, response: String): Future<PasskeyKey>` | Prüft die Antwort von Passkey.create: der neue Schlüssel zum Speichern beim Benutzer; HttpError(400), wenn sie nicht passt. |
| `static fn authentication(req: Request, allow: List<String> = []): String` | Optionen für Passkey.get im Browser; ohne 'allow' darf der Benutzer jeden Passkey dieser Seite wählen. |
| `static fn credentialId(response: String): String?` | Kennung des Passkeys in einer Antwort von Passkey.get, um den gespeicherten Schlüssel zu finden; null, wenn sie fehlt. |
| `static fn verify(req: Request, response: String, key: PasskeyKey): Future<Int?>` | Prüft die Antwort von Passkey.get gegen den gespeicherten Schlüssel: der neue Zähler zum Speichern oder null. |

<a id="passkeykey"></a>

### `class PasskeyKey`

Ein registrierter Passkey. Speichere die vier Felder beim Benutzer (z. B. in einer @Table-Klasse).

| Signatur | Beschreibung |
|---|---|
| `constructor(id: String, publicKey: String, algorithm: Int, counter: Int)` | Baut einen gespeicherten Schlüssel wieder zusammen: PasskeyKey(p.id, p.publicKey, p.algorithm, p.counter) |
| `val id: String` | Kennung des Passkeys (Base64url) |
| `val publicKey: String` | Öffentlicher Schlüssel (SPKI, Base64url) |
| `val algorithm: Int` | Verfahren nach COSE: -7 (ES256), -8 (Ed25519) oder -257 (RS256) |
| `val counter: Int` | Signaturzähler; nach jeder Anmeldung den Wert von Passkeys.verify speichern |

<a id="oauthprovider"></a>

### `class OAuthProvider`

Ein Anbieter für die Anmeldung mit OAuth 2.0 / OpenID Connect, z. B. OAuthProvider.github(Env.require("GITHUB_ID"), Env.require("GITHUB_SECRET")).
Die Rückruf-Adresse muss beim Anbieter eingetragen sein.

| Signatur | Beschreibung |
|---|---|
| `constructor(name: String, clientId: String, clientSecret: String, authorizeUrl: String, tokenUrl: String, userInfoUrl: String, scopes: List<String> = ["openid", "email", "profile"])` | Eigener Anbieter mit OpenID Connect: Adressen für Anmeldung, Token und Profil (userinfo) aus seiner Dokumentation. |
| `static fn github(clientId: String, clientSecret: String): OAuthProvider` | GitHub (OAuth-App oder GitHub-App); die bestätigte Haupt-E-Mail kommt über die Berechtigung user:email. |
| `static fn google(clientId: String, clientSecret: String): OAuthProvider` | Google (OpenID Connect). |
| `static fn microsoft(clientId: String, clientSecret: String, tenant: String = "common"): OAuthProvider` | Microsoft Entra ID; 'tenant' ist "common", "organizations", "consumers" oder die Kennung des Mandanten. |
| `static fn gitlab(clientId: String, clientSecret: String, url: String = "https://gitlab.com"): OAuthProvider` | GitLab, auch selbst betrieben: OAuthProvider.gitlab(id, secret, "https://git.firma.de") |
| `val name: String` | Name des Anbieters, z. B. "github" |

<a id="oauth"></a>

### `class OAuth`

Anmeldung über einen Anbieter (Authorization Code mit PKCE). Beide Schritte laufen in Server-Wächtern von Seiten:
OAuth.start leitet zum Anbieter, OAuth.finish nimmt den Rückruf an. Die offene Anmeldung (state, PKCE) steht in der Session und gilt für einen Versuch.

| Signatur | Beschreibung |
|---|---|
| `static fn start(req: Request, provider: OAuthProvider, callback: String): String` | Beginnt die Anmeldung und liefert die Adresse beim Anbieter: Access.redirect(OAuth.start(req, github, "/auth/github")). 'callback' ist ein Pfad dieser App (mit TEXO_PUBLIC_URL oder der Adresse der Anfrage davor) oder eine volle Adresse. |
| `static fn finish(req: Request, provider: OAuthProvider): Future<OAuthProfile?>` | Nimmt den Rückruf an (code und state aus der Adresse), holt Token und Profil beim Anbieter; null, wenn die Anmeldung nicht passt oder abgebrochen wurde. |

<a id="oauthprofile"></a>

### `class OAuthProfile`

Das Profil nach einer Anmeldung über einen Anbieter. Benutzer über provider + id wiedererkennen, nicht über die E-Mail.

| Signatur | Beschreibung |
|---|---|
| `val provider: String` | Name des Anbieters, z. B. "github" |
| `val id: String` | Kennung beim Anbieter (bleibt gleich, auch wenn sich Name oder E-Mail ändern) |
| `val email: String?` | E-Mail-Adresse, wenn der Anbieter sie herausgibt |
| `val emailVerified: Boolean` | true, wenn der Anbieter die E-Mail-Adresse bestätigt hat |
| `val name: String?` | Anzeigename (sonst Benutzername) |
| `val picture: String?` | Adresse des Profilbilds |

<a id="files"></a>

### `class Files`

Speichert hochgeladene Dateien (Upload) auf der Platte (TEXO_FILES, Standard data/files) oder in einem
S3-kompatiblen Speicher (TEXO_S3_BUCKET, TEXO_S3_REGION, TEXO_S3_ENDPOINT, TEXO_S3_ACCESS_KEY, TEXO_S3_SECRET_KEY).
Gespeichert wird ein Schlüssel wie "avatare/Xk3…/foto.jpg"; ausgeliefert wird nur über befristete Links (Files.url). Siehe [Dateien hochladen](backend.md#dateien-hochladen-upload-und-files).

| Signatur | Beschreibung |
|---|---|
| `static fn save(file: Upload, folder: String = "", maxSize: Int = 0, types: List<String> = []): Future<String>` | Prüft und speichert die Datei, liefert ihren Schlüssel. 'maxSize' in Bytes (0: nur die Grenze der Anfrage), 'types' z. B. ["image/*", ".pdf"]. Zu groß: HttpError 413, falscher Typ oder Inhalt: HttpError 415. |
| `static fn url(key: String, minutes: Int = 60): String` | Befristeter Link zum Anzeigen oder Herunterladen, Standard 60 Minuten (höchstens 7 Tage). |
| `static fn privateUrl(key: String, req: Request, minutes: Int = 60): String` | Befristeter Link, der nur für den in 'req' angemeldeten Benutzer gilt: ohne diese Anmeldung (abgemeldet, anderer Benutzer, weitergegebener Link) antwortet der Server 404. Läuft immer über den Server, auch bei S3. Niemand angemeldet: HttpError 401. Files.privateUrl(anhang.datei, req) |
| `static fn delete(key: String): Future<Boolean>` | Löscht die Datei; false, wenn es sie nicht gab. |
| `static fn exists(key: String): Future<Boolean>` | true, wenn es die Datei gibt. |

<a id="mail"></a>

### `class Mail`

Eine E-Mail aus Bausteinen. Texo macht daraus HTML, das in Mailprogrammen gleich aussieht (Tabellen, eingebettete
Stile), und eine Textfassung. Vorlagen sind gewöhnliche Funktionen:
`@Server fn willkommen(name: String, link: String): Mail => Mail("Willkommen", [MailHeading("Hallo ${name}!"), MailButton("Adresse bestätigen", link)])`.
Versand über SMTP mit TEXO_SMTP_URL (smtps://benutzer:passwort@host:465 oder smtp://…:587 mit STARTTLS) und
Absender TEXO_MAIL_FROM ("Notizen <noreply@example.com>"). Ohne TEXO_SMTP_URL landen Mails nur im Log und in Mail.outbox(). Siehe [E-Mails verschicken](backend.md#e-mails-verschicken-mail-und-tokens).

| Signatur | Beschreibung |
|---|---|
| `constructor(subject: String, parts: List<MailPart>, preview: String = "", accent: String = "#4f46e5")` | 'preview': Vorschauzeile in der Liste des Mailprogramms; 'accent': Farbe der Knöpfe und Links (#rrggbb). |
| `val subject: String` | Betreff |
| `fn html(): String` | Die HTML-Fassung, wie sie verschickt wird. |
| `fn text(): String` | Die Textfassung, wie sie verschickt wird. |
| `static fn send(to: String, mail: Mail, from: String? = null, replyTo: String? = null): Void` | Reiht die Mail zum Versand ein und kehrt sofort zurück. Mit SMTP läuft sie über die Job-Warteschlange (bei Fehlern neue Versuche nach 30 s, 2 min, 8 min …); 'to' wie "ada@example.com" oder "Ada <ada@example.com>". Ungültige Adressen: Fehler beim Aufruf. |
| `static fn outbox(): List<SentMail>` | Mails, die ohne TEXO_SMTP_URL nur protokolliert wurden (die letzten 50, älteste zuerst) – für Tests und Entwicklung. |

<a id="mailpart"></a>

### `class MailPart`

Ein Baustein einer Mail. Links und Bilder brauchen absolute Adressen (https://…), eine relative ist ein Fehler.

| Signatur | Beschreibung |
|---|---|
| `MailHeading(text: String, level: Int = 1)` | Überschrift; 'level' 1 bis 3. |
| `MailText(text: String, muted: Boolean = false)` | Absatz; Zeilenumbrüche bleiben erhalten. 'muted': kleiner und grau, z. B. für Hinweise am Ende. |
| `MailButton(label: String, url: String)` | Knopf mit Link in der Akzentfarbe; 'url' muss absolut sein (https://…), z. B. aus req.link(…). |
| `MailLink(label: String, url: String)` | Link als eigene Zeile; 'url' absolut (https://…) oder mailto:. |
| `MailImage(url: String, alt: String = "", width: Int = 0)` | Bild von einer absoluten Adresse; 'width' in Pixeln (0: volle Breite, höchstens 496). |
| `MailCode(text: String)` | Code zum Abtippen, groß und gesperrt, z. B. ein Bestätigungscode. |
| `MailDivider()` | Trennlinie. |
| `MailSpacer(height: Int = 16)` | Leerraum in Pixeln. |

<a id="sentmail"></a>

### `class SentMail`

Eine Mail im Postausgang (Mail.outbox()).

| Signatur | Beschreibung |
|---|---|
| `val to: String` | Empfänger |
| `val from: String` | Absender (leer ohne TEXO_MAIL_FROM und ohne from) |
| `val subject: String` | Betreff |
| `val text: String` | Textfassung |
| `val html: String` | HTML-Fassung |

<a id="tokens"></a>

### `class Tokens`

Signierte, befristete Werte für Links in E-Mails, z. B. zum Zurücksetzen des Passworts oder Bestätigen einer Adresse.
Der Schlüssel kommt aus TEXO_SECRET. Der Wert ist im Token lesbar, also keine Geheimnisse hineinlegen.

| Signatur | Beschreibung |
|---|---|
| `static fn create(purpose: String, value: String, minutes: Int = 60, bind: String = ""): String` | Ein Token für 'value', gültig 'minutes' Minuten (höchstens 30 Tage). 'purpose' trennt Verwendungen ("reset", "confirm"); 'bind' bindet das Token an einen Zustand: mit dem Passwort-Hash gilt ein Reset-Link nur bis zur Änderung. |
| `static fn check(purpose: String, token: String, bind: String = ""): String?` | Der Wert, wenn das Token echt ist, zu 'purpose' und 'bind' passt und nicht abgelaufen ist; sonst null. |

<a id="jobs"></a>

### `class Jobs`

Die Warteschlange der @Job-Funktionen. Einreihen mit funktion.enqueue(…); im Server arbeitet sie ein Hintergrund-Task
ab, in texo test diese Funktionen. Siehe [Hintergrundjobs](backend.md#hintergrundjobs-job).

| Signatur | Beschreibung |
|---|---|
| `static fn runPending(): Future<Int>` | Führt jeden offenen Job einmal aus, auch wartende (delay, neuer Versuch); die Anzahl der Läufe. Hat der Test die Uhr gestellt (Clock), nur die bis dahin fälligen Jobs und dazu die fällig gewordenen Zeitpläne (@Cron, @Every). |
| `static fn pending(): Future<List<String>>` | Namen der offenen Jobs, der nächste zuerst. |

<a id="cache"></a>

### `class Cache`

Gespeicherte Ergebnisse der Service-Methoden mit @Cache(ttl: …). Nach einer Änderung leeren, damit niemand alte
Werte sieht: Cache.clear("Laden") nach dem Speichern eines Produkts. Einfacher ist meist @Invalidates(Laden.suche) an
der ändernden Methode. Siehe [Zwischenspeicher](backend.md#zwischenspeicher-cache).

| Signatur | Beschreibung |
|---|---|
| `static fn clear(name: String = ""): Void` | Leert alles, einen Service (Cache.clear("Laden")) oder eine Methode (Cache.clear("Laden.suche")); mit dem<br>Instanz-Bus (texo.json "cluster") in allen Instanzen. |

<a id="kv"></a>

### `class Kv`

Schlüssel-Wert-Speicher, den Texo mit anderen Programmen teilt, z. B. einem Go-Server: Valkey, Redis, KeyDB oder
Dragonfly. TEXO_KV_URL verbindet ihn (valkey://benutzer:passwort@valkey:6379/0, mit TLS valkeys://…),
TEXO_KV_PREFIX steht vor jedem Schlüssel und Kanal. Ohne TEXO_KV_URL und in texo test liegt alles im Speicher
dieser Instanz. Werte: String als Text, Zahlen als Zahl, alles andere als JSON (Maps als Objekte), wie
json.Marshal in Go. Gelesene Werte werden wie Eingaben an eine API gegen ihren Typ geprüft. Siehe
[Gemeinsamer Speicher](backend.md#gemeinsamer-speicher-mit-anderen-programmen-kv).

| Signatur | Beschreibung |
|---|---|
| `static fn get<T>(key: String): Future<T?>` | Der Wert unter 'key', oder null; passt er nicht zu T, KvError: await Kv.get&lt;Artikel>("artikel:42") |
| `static fn set<T>(key: String, value: T, ttl: Duration? = null, onlyIfAbsent: Boolean = false): Future<Boolean>` | Speichert 'value' (null löscht den Schlüssel); 'ttl' lässt ihn ablaufen. Mit onlyIfAbsent nur, wenn es den<br>Schlüssel noch nicht gibt (eine einfache Sperre). true, wenn gespeichert. |
| `static fn cached<T>(key: String, ttl: Duration, load: () => Future<T>): Future<T>` | Der Wert unter 'key'; fehlt er, liefert 'load' ihn und er bleibt 'ttl' lang. Gleichzeitige Aufrufe, auch auf<br>anderen Instanzen, warten auf den ersten: await Kv.cached("bestand:${sku}", 30.s, () => ladeBestand(sku)) |
| `static fn delete(key: String): Future<Boolean>` | Löscht den Schlüssel; false, wenn es ihn nicht gab. |
| `static fn exists(key: String): Future<Boolean>` | true, wenn es den Schlüssel gibt. |
| `static fn expire(key: String, ttl: Duration): Future<Boolean>` | Lässt den Schlüssel nach 'ttl' ablaufen; false, wenn es ihn nicht gibt. |
| `static fn ttl(key: String): Future<Duration?>` | Restzeit bis zum Ablauf; null, wenn es den Schlüssel nicht gibt oder er nicht abläuft. |
| `static fn increment(key: String, by: Int = 1): Future<Int>` | Zählt um 'by' weiter (ein fehlender Schlüssel zählt als 0) und liefert den neuen Stand. |
| `static fn getMany<T>(keys: List<String>): Future<List<T?>>` | Mehrere Werte auf einmal, in der Reihenfolge der Schlüssel; null für fehlende. |
| `static fn hashGet<T>(key: String, field: String): Future<T?>` | Ein Feld eines Hash, oder null. |
| `static fn hashSet<T>(key: String, field: String, value: T): Future<Void>` | Setzt ein Feld eines Hash. |
| `static fn hashGetAll<T>(key: String): Future<Map<String, T>>` | Alle Felder eines Hash; leer, wenn es ihn nicht gibt. |
| `static fn hashDelete(key: String, field: String): Future<Boolean>` | Löscht ein Feld eines Hash; false, wenn es das Feld nicht gab. |
| `static fn publish<T>(channel: String, value: T): Future<Int>` | Veröffentlicht 'value' auf einem Kanal (Pub/Sub); liefert, wie viele Empfänger ihn bekommen haben. |
| `static fn command(name: String, args: List<String> = []): Future<Any>` | Ein beliebiger Befehl, ohne Präfix und ohne Prüfung des Ergebnisses: await Kv.command("LPUSH", ["liste", "x"]) |

<a id="kverror"></a>

### `class KvError: Error`

Fehler von Kv: der Server ist nicht erreichbar, antwortet mit einem Fehler, oder ein gelesener Wert passt nicht zum
erwarteten Typ. Fangen mit catch (e: KvError).

<a id="env"></a>

### `class Env`

Zugriff auf Umgebungsvariablen des Server-Prozesses; nur auf dem Server, Geheimnisse gelangen nie in den Browser.

| Signatur | Beschreibung |
|---|---|
| `static fn get(name: String): String?` | Liest eine Umgebungsvariable; null, wenn nicht gesetzt: Env.get("DB_URL") |
| `static fn require(name: String): String` | Liest eine Pflicht-Umgebungsvariable; wirft einen Fehler, wenn sie fehlt oder leer ist. |
| `static val isProduction: Boolean` | true, wenn NODE_ENV oder TEXO_ENV auf "production" steht. |
| `static fn secret(name: String): Secret` | Liest eine Pflicht-Umgebungsvariable als Secret (oder aus der Datei in NAME_FILE); wirft einen Fehler, wenn sie fehlt: Env.secret("API_KEY") |

<a id="secret"></a>

### `class Secret`

Ein geheimer Wert (Schlüssel, Passwort, Token). toString, Texttemplates, Log und Json.stringify zeigen nur "***".
Ein Secret verlässt den Server nie: Es kann nicht aus einem Service zurückgegeben oder in einer Tabelle gespeichert werden.
Siehe [Konfiguration](backend.md#konfiguration-config-und-geheimnisse-secret).

| Signatur | Beschreibung |
|---|---|
| `fn reveal(): String` | Der echte Wert, z. B. für den Aufruf einer fremden API: cfg.stripeKey.reveal() |
| `fn toString(): String` | Immer "***". |

<a id="config"></a>

### `class Config`

Die typisierte Konfiguration aus Umgebungsvariablen (data class mit @Config), beim Start einmal gelesen und geprüft.
Jedes Feld liest die Variable zu seinem Namen (maxWarenkorb → MAX_WARENKORB) oder den Namen aus @Env("NAME").
Siehe [Konfiguration](backend.md#konfiguration-config-und-geheimnisse-secret).

| Signatur | Beschreibung |
|---|---|
| `static fn get<T>(): T` | Die Werte einer @Config-Klasse: Config.get&lt;Einstellungen>(); wirft einen Fehler, wenn Variablen fehlen oder nicht passen. |

<a id="password"></a>

### `class Password`

Passwort-Hashing mit PBKDF2-SHA256 (WebCrypto), 210 000 Iterationen und zufälligem 16-Byte-Salt.

| Signatur | Beschreibung |
|---|---|
| `static fn hash(password: String): Future<String>` | Berechnet einen gesalzenen Hash zum Speichern, Format "pbkdf2$iterationen$salt$hash": await Password.hash(pw) |
| `static fn verify(password: String, hash: String): Future<Boolean>` | Prüft ein Passwort gegen einen gespeicherten Hash (constant-time Vergleich); false bei falschem Passwort oder unbekanntem Format. |

<a id="log"></a>

### `class Log`

Server-Log auf der Konsole, Meldungen mit dem Präfix "[texo]".

| Signatur | Beschreibung |
|---|---|
| `static fn info(message: String): Void` | Schreibt eine Info-Meldung auf die Standardausgabe. |
| `static fn warn(message: String): Void` | Schreibt eine Warnung auf die Fehlerausgabe. |
| `static fn error(message: String): Void` | Schreibt eine Fehlermeldung auf die Fehlerausgabe. |

<a id="trace"></a>

### `class Trace`

Abschnitte (Tracing): Jede Anfrage bekommt eine Trace-Id (ein eingehender traceparent wird übernommen). Wächter,
Loader, Service-Methoden, Abfragen, Cache-Treffer, Jobs, Zeitpläne, Mails und ausgehende Aufrufe werden von selbst
Abschnitte – mit Name, Dauer und Status, nie mit Werten. TEXO_OTLP_URL schickt sie an Jaeger, Grafana Tempo …
Siehe [Betrieb und Beobachtbarkeit](backend.md#betrieb-und-beobachtbarkeit).

| Signatur | Beschreibung |
|---|---|
| `static fn span<T>(name: String, action: () => Future<T>): Future<T>` | Ein eigener Abschnitt um 'action', z. B. für einen langen Import; liefert ihr Ergebnis, ein Fehler markiert ihn.<br>await Trace.span("csv-import", async () => { … }) |
| `static val id: String?` | Trace-Id der laufenden Anfrage (32 Hex-Zeichen, wie im JSON-Log), null außerhalb einer Anfrage, eines Jobs oder Zeitplans. |

<a id="metrics"></a>

### `class Metrics`

Eigene Kennzahlen für /__texo/metrics (Prometheus-Format, nur mit TEXO_METRICS_TOKEN). Namen aus Buchstaben,
Ziffern, _ und :; der Präfix texo_ gehört den eingebauten Kennzahlen.

| Signatur | Beschreibung |
|---|---|
| `static fn counter(name: String, help: String = ""): MetricCounter` | Ein Zähler, der nur wächst: Metrics.counter("import_zeilen").add(zeilen.size) |
| `static fn gauge(name: String, help: String = ""): MetricGauge` | Ein Messwert, der steigen und fallen kann: Metrics.gauge("warteschlange").set(n) |
| `static fn histogram(name: String, help: String = ""): MetricHistogram` | Verteilung von Messwerten (Grenzen 0.005 bis 10, z. B. Sekunden): Metrics.histogram("export_sekunden").observe(1.5) |

<a id="metriccounter"></a>

### `class MetricCounter`

Zähler aus Metrics.counter(…).

| Signatur | Beschreibung |
|---|---|
| `fn add(n: Float = 1.0): Void` | Zählt 'n' dazu (Standard 1, nie negativ). |

<a id="metricgauge"></a>

### `class MetricGauge`

Messwert aus Metrics.gauge(…).

| Signatur | Beschreibung |
|---|---|
| `fn set(value: Float): Void` | Setzt den Wert. |
| `fn add(n: Float): Void` | Ändert den Wert um 'n' (auch negativ). |

<a id="metrichistogram"></a>

### `class MetricHistogram`

Histogramm aus Metrics.histogram(…).

| Signatur | Beschreibung |
|---|---|
| `fn observe(value: Float): Void` | Nimmt einen Messwert auf. |

<a id="channel"></a>

### `class Channel<T>`

Verteilt Werte an alle offenen Streams, z. B. als Feld eines Service: private Channel&lt;Nachricht&gt; kanal = Channel()
Jeder Wert wird nur einmal in JSON umgewandelt, egal wie viele zuschauen.

| Signatur | Beschreibung |
|---|---|
| `Channel<T>(buffer: Int = 256, replay: Int = 0, dropOldest: Boolean = false, shared: Boolean = false)` | Ein Kanal. buffer: so viele Werte warten höchstens je Zuschauer (langsame Verbindung); ist das voll, endet<br>sein Stream und der Browser verbindet neu, mit dropOldest: true fallen stattdessen die ältesten Werte weg<br>(für Kurse, Positionen, Messwerte: nur der neueste zählt). replay: so viele letzte Werte hebt der Kanal auf und<br>schickt sie nach einer Neuverbindung nach, die der Browser verpasst hat: Channel(replay: 50). shared: true<br>verteilt die Werte über den Instanz-Bus an alle Instanzen der App (texo.json "cluster"; ohne ihn wie bisher) |
| `fn send(value: T): Void` | Schickt 'value' an alle verbundenen Streams. |
| `fn stream(): Stream<T>` | Ein neuer Stream dieses Kanals, als Ergebnis einer Service-Methode: fn raum(): Stream&lt;Nachricht&gt; => this.kanal.stream() |
| `val subscribers: Int` | Anzahl der verbundenen Streams. |

<a id="httperror"></a>

### `class HttpError: Error`

In einer Service-Methode geworfen, antwortet der Server mit diesem HTTP-Status und der Nachricht; im Browser wird ein Fehler mit genau dieser Nachricht ausgelöst.
Andere Ausnahmen ergeben 500 ohne Details (außer im Entwicklungsmodus).

| Signatur | Beschreibung |
|---|---|
| `HttpError(status: Int, message: String)` | Erzeugt einen HTTP-Fehler mit Statuscode und für den Client sichtbarer Nachricht: throw HttpError(404, "Nicht gefunden") |
| `val status: Int` | HTTP-Statuscode der Antwort, z. B. 400, 403 oder 404. |

<a id="httpapierror"></a>

### `class HttpApiError: Error`

Fehler beim Aufruf eines @HttpApi-Interface: ein Fehlerstatus, keine Antwort (Netzwerkfehler, Zeitlimit) oder eine
Antwort, die nicht zum Typ passt. Fangen mit catch (e: HttpApiError). Die Nachricht nennt Methode und Pfad, z. B.
"GET /users/ada antwortete mit Status 404". Siehe [Fremde Dienste](backend.md#dienste-aufrufen-httpapi).

| Signatur | Beschreibung |
|---|---|
| `val status: Int` | HTTP-Status der Antwort, z. B. 404 oder 503; 0, wenn keine Antwort kam. |
| `val body: String` | Antworttext (höchstens 10 000 Zeichen); leer, wenn keine Antwort kam. |

<a id="httpapi"></a>

### Annotation `@HttpApi`

Macht ein Interface zum Client eines fremden HTTP-Dienstes; nur auf dem Server. Siehe
[Dienste aufrufen](backend.md#dienste-aufrufen-httpapi).

| Signatur | Beschreibung |
|---|---|
| `@HttpApi(baseUrl: String, headers: Map<String, String> = [:])` | An einem Interface: Adresse des Dienstes (http oder https) und feste Kopfzeilen für jede Anfrage: @HttpApi("https://api.github.com", headers: ["Accept": "application/vnd.github+json"]) |
| `@Get(path)`, `@Post(path)`, `@Put(path)`, `@Patch(path)`, `@Delete(path)` | An jeder Methode genau eine: HTTP-Methode und Pfad mit Platzhaltern, z. B. @Get("/users/{name}"). Die Methode gibt Future&lt;T&gt; zurück (T übertragbar oder Void; String liefert den Rumpf als Text). |
| `@Body` | An höchstens einem Parameter (nicht bei @Get): wird als JSON gesendet. |
| `@Header(name: String)` | An einem Parameter vom Typ String oder String?: setzt die Kopfzeile, bei null fehlt sie. |
| `@Idempotent` | An einer Methode: erlaubt Wiederholungen (retries) auch für @Post, @Put, @Patch und @Delete. |
| `static fn create(bearer: String? = null, timeout: Duration = 15.s, retries: Int = 0, headers: Map<String, String> = [:], baseUrl: String? = null): Interface` | Ein Client: Github.create(bearer: Env.require("GITHUB_TOKEN"), retries: 2). retries (0 bis 10) gilt nur für @Get und @Idempotent: nach Netzwerkfehler, Zeitüberschreitung, 429 oder 5xx, mit 200 ms, 400 ms, … (höchstens 5 s) Pause. |

Platzhalter im Pfad nehmen gleichnamige Parameter auf (Text, Zahl, Wahrheitswert oder Enum). Alle übrigen Parameter
ohne @Body und @Header gehen in die Query; null lässt sie weg. Felder der Antwort, die die data class nicht kennt,
werden übergangen.

<a id="webhook"></a>

### Annotation `@Webhook`

An einer Service-Methode: nimmt signierte Ereignisse eines fremden Dienstes per POST an. Öffentlich ohne CSRF-Prüfung,
höchstens ein Parameter (das Ereignis aus dem JSON-Rumpf; String bekommt den Rumpf als Text), Rückgabe Void. Jedes
Ereignis läuft nur einmal (Kennungen 24 Stunden in `_texo_webhooks`). Siehe [Webhooks](backend.md#webhooks-empfangen-webhook).

| Signatur | Beschreibung |
|---|---|
| `WebhookScheme.github(secret)` | Prüft X-Hub-Signature-256 (HMAC-SHA256); Kennung aus X-GitHub-Delivery. |
| `WebhookScheme.stripe(secret)` | Prüft Stripe-Signature (t=…,v1=…) und den Zeitstempel (höchstens 5 Minuten); Kennung aus dem Feld id. |
| `WebhookScheme.standard(secret)` | Standard Webhooks: webhook-id, webhook-timestamp (höchstens 5 Minuten), webhook-signature; Geheimnis whsec_… |
| `WebhookScheme.hmac(header: String, secret)` | HMAC-SHA256 des Rumpfs als Hex in der Kopfzeile 'header' (auch mit sha256= davor); ohne Kennung. |

secret ist immer Env.require("NAME") oder Env.get("NAME"); ein Geheimnis als Text im Quelltext ist ein Fehler.
Antworten: 200 {"ok":true} (Wiederholung: {"ok":true,"duplicate":true}), 401 bei falscher Signatur oder altem
Zeitstempel, 400 bei falschem Rumpf, 500 ohne Geheimnis in der Umgebung oder wenn die Methode wirft.

<a id="texo-test"></a>

## Paket `texo.test`

Nur in Testdateien (`tests/`) verfügbar. Import: `import texo.test.*` – siehe [Testen](testen.md). Hier stehen der
Test-Client und die Uhr; `expect`, `render` und `Screen` beschreibt [Testen](testen.md#expect).

<a id="testclient"></a>

### `class TestClient`

Ein Client, der Anfragen auf demselben Weg wie ein Browser an die Anwendung schickt, nur ohne Netzwerk: Codec,
Herkunft und CSRF, Wächter, Prüfregeln, @RateLimit, Methode und Antwort. Er hat eigene Cookies (Session) und eine
eigene Adresse für @RateLimit. Siehe [Anfragen wie im Browser](testen.md#anfragen-wie-im-browser-testclient).

| Signatur | Beschreibung |
|---|---|
| `TestClient(user: AuthUser? = null, csrf: Boolean = true)` | Neuer Client. Mit `user` ist er vorher angemeldet (ein Wert der Datenklasse mit `@Auth`), mit `csrf: false` schickt er kein CSRF-Token mit (wie eine fremde Website). |
| `fn call<T>(action: () => Future<T>): Future<T>` | Schickt die Service-Aufrufe der Lambda über die Leitung; typisierte Fehler (`throws`) kommen als genau diese Klassen an, Dateien (`Upload("a.txt", "text/plain", "…")`) gehen wie aus dem Browser als multipart mit: `await client.call(() => Notizen.loeschen(1))` |
| `fn page(path: String): Future<TestResponse>` | Holt eine Seite samt Server-Wächtern und Loader (`@Load`); Weiterleitungen werden nicht verfolgt: `await client.page("/notiz/1")` |
| `fn form(path: String, fields: Map<String, String>): Future<TestResponse>` | Schickt ein Formular wie ein Browser ohne JavaScript (`application/x-www-form-urlencoded`) an eine Service-Methode: `await client.form("/api/feier/anmelden", ["name": "Ada"])` |

<a id="testresponse"></a>

### `class TestResponse`

Die Antwort auf `page(…)` oder `form(…)`.

| Signatur | Beschreibung |
|---|---|
| `val status: Int` | HTTP-Status, z. B. 200, 303 (Weiterleitung) oder 403. |
| `val text: String` | Der Inhalt der Antwort als Text (bei Seiten das HTML mit den Daten des Loaders). |
| `fn header(name: String): String?` | Wert eines Headers (Groß-/Kleinschreibung egal) oder null: `res.header("location")` |
| `fn screen(): Screen` | Zeigt die gelieferte Seite wie der Browser an (mit den Daten des Loaders) und gibt ihren Screen zurück. |

<a id="clock"></a>

### `class Clock`

Die Uhr eines Tests. `DateTime.now`, `Tokens`, Sessions, `@RateLimit`, verzögerte Jobs und Zeitpläne richten sich
danach. Nach `set` oder `advance` steht sie still, bis der Test sie weiterstellt; vor jedem Test gilt wieder die echte
Uhr. Siehe [Die Uhr stellen](testen.md#die-uhr-stellen-clock).

| Signatur | Beschreibung |
|---|---|
| `static fn advance(by: Duration): Void` | Stellt die Uhr vor: `Clock.advance(31.min)` |
| `static fn set(time: DateTime): Void` | Stellt die Uhr auf einen Zeitpunkt; Zeitpläne zählen ab dort: `Clock.set(DateTime.parse("2026-01-01T09:00:00")!!)` |
| `static fn reset(): Void` | Wieder die echte Uhr. |

<a id="texo-db"></a>

## Paket `texo.db`

Texo Data: Datenbank-Tabellen (`@Table data class`), typgeprüfte Abfragen, Beziehungen und Transaktionen. Nur im Backend. Import: `import texo.db.*` – siehe [Datenbanken](datenbank.md).

<a id="query"></a>

### `class Query<T>`

Eine Abfrage auf eine @Table-Klasse. Sie wird erst mit list(), first(), count(), exists() oder deleteAll()
ausgeführt: await Produkt.where(p => p.preis &lt; 10).orderBy(p => p.name).limit(20).list()

| Signatur | Beschreibung |
|---|---|
| `fn where(condition: (T) => Boolean): Query<T>` | Weitere Bedingung (mit den vorigen durch UND verknüpft). Erlaubt sind Vergleiche von Feldern mit Werten,<br>&amp;&amp;, \|\|, !, contains/startsWith/endsWith (mit .lower() ohne Groß-/Kleinschreibung) und liste.contains(p.feld). |
| `fn orderBy(field: (T) => Any?): Query<T>` | Sortiert aufsteigend nach einem Feld: orderBy(p => p.name) |
| `fn orderByDescending(field: (T) => Any?): Query<T>` | Sortiert absteigend nach einem Feld: orderByDescending(p => p.erstelltAm) |
| `fn limit(count: Int): Query<T>` | Höchstens 'count' Zeilen. |
| `fn offset(count: Int): Query<T>` | Überspringt die ersten 'count' Zeilen. |
| `fn page(number: Int, size: Int): Query<T>` | Seite 'number' (ab 1) mit 'size' Zeilen: page(2, 20) = Zeilen 21–40 |
| `fn include(relation: (T) => Any?): Query<T>` | Lädt eine Beziehung gleich mit (eine Abfrage pro Beziehung, nicht pro Zeile): include(b => b.kunde) |
| `fn groupBy<K>(key: (T) => K): GroupedQuery<T, K>` | Fasst die Zeilen nach einem Feld zusammen; select(…) bestimmt danach, was je Gruppe herauskommt:<br>groupBy(b => b.status).select(g => Umsatz(g.key, g.count(), g.sum(b => b.summe))) |
| `fn select<R>(selector: (T) => R): Selection<R>` | Lädt nur einzelne Felder in eine eigene Datenklasse: select(k => KundeKurz(k.id, k.name)) |
| `fn list(): Future<List<T>>` | Führt die Abfrage aus und liefert alle Zeilen. |
| `fn first(): Future<T?>` | Die erste Zeile oder null. |
| `fn count(): Future<Int>` | Anzahl der passenden Zeilen (limit/offset werden ignoriert). |
| `fn exists(): Future<Boolean>` | true, wenn mindestens eine Zeile passt. |
| `fn deleteAll(): Future<Int>` | Löscht alle passenden Zeilen und liefert ihre Anzahl. Hat die Tabelle ein @SoftDelete-Feld, werden sie nur als<br>gelöscht markiert. |
| `fn forceDeleteAll(): Future<Int>` | Löscht alle passenden Zeilen endgültig, auch bei @SoftDelete, und liefert ihre Anzahl:<br>await Notiz.withDeleted().where(n => n.geloeschtAm!!.isBefore(grenze)).forceDeleteAll() |
| `fn live(): Stream<List<T>>` | Die Abfrage als Live-Stream für eine Service-Methode: zuerst das Ergebnis, danach ein neuer Wert, sobald sich<br>das Ergebnis durch insert/update/delete/save (oder Db.changed) ändert. Höchstens 10 000 Zeilen.<br>fn meine(): Stream&lt;List&lt;Notiz&gt;&gt; => Notiz.where(n => n.autor == ich).live() |

<a id="groupedquery"></a>

### `class GroupedQuery<T, K>`

Eine nach einem Feld gruppierte Abfrage (groupBy). Erst select(…) macht daraus eine Auswertung.

| Signatur | Beschreibung |
|---|---|
| `fn select<R>(selector: (Group<T, K>) => R): Selection<R>` | Eine Ergebniszeile je Gruppe. Erlaubt sind g.key und Zusammenfassungen der Zeilen:<br>select(g => Umsatz(g.key, g.count(), g.sum(b => b.summe))) |

<a id="group"></a>

### `class Group<T, K>`

Eine Gruppe in select(…) nach groupBy: ihr Schlüssel und Zusammenfassungen ihrer Zeilen. Sie wird nicht im
Server ausgeführt, sondern an die Datenbank geschickt.

| Signatur | Beschreibung |
|---|---|
| `val key: K` | Der Wert des Felds aus groupBy. |
| `fn count(): Int` | Anzahl der Zeilen in der Gruppe. |
| `fn sum<N>(field: (T) => N): N` | Summe eines Zahlenfelds (Int oder Float, nicht nullbar): g.sum(b => b.summe) |
| `fn avg<N>(field: (T) => N): Float` | Durchschnitt eines Zahlenfelds (Int oder Float, nicht nullbar), immer als Float. |
| `fn min<V>(field: (T) => V): V` | Kleinster Wert eines Felds (Zahl, Text, DateTime oder Enum); null-Werte zählen nicht mit. |
| `fn max<V>(field: (T) => V): V` | Größter Wert eines Felds (Zahl, Text, DateTime oder Enum); null-Werte zählen nicht mit. |

<a id="selection"></a>

### `class Selection<R>`

Ergebnis von select(…): Zeilen einer eigenen Datenklasse. Sortiert wird nach ihren Feldern:
.select(g => Umsatz(g.key, g.count(), g.sum(b => b.summe))).orderByDescending(u => u.summe).list()

| Signatur | Beschreibung |
|---|---|
| `fn orderBy(field: (R) => Any?): Selection<R>` | Sortiert aufsteigend nach einem Feld des Ergebnisses. |
| `fn orderByDescending(field: (R) => Any?): Selection<R>` | Sortiert absteigend nach einem Feld des Ergebnisses. |
| `fn limit(count: Int): Selection<R>` | Höchstens 'count' Ergebniszeilen. |
| `fn offset(count: Int): Selection<R>` | Überspringt die ersten 'count' Ergebniszeilen. |
| `fn page(number: Int, size: Int): Selection<R>` | Seite 'number' (ab 1) mit 'size' Ergebniszeilen. |
| `fn list(): Future<List<R>>` | Führt die Auswertung aus und liefert alle Ergebniszeilen. |
| `fn first(): Future<R?>` | Die erste Ergebniszeile oder null. |

<a id="dbtable"></a>

### `class DbTable<T>`

Die Tabellen-Operationen einer @Table-Klasse. Man ruft sie direkt an der Klasse auf: Produkt.insert(p),
Produkt.find(3), Produkt.where(p => p.lager &gt; 0).

| Signatur | Beschreibung |
|---|---|
| `fn all(): Query<T>` | Alle Zeilen als Abfrage: Produkt.all().list() |
| `fn where(condition: (T) => Boolean): Query<T>` | Abfrage mit Bedingung: Produkt.where(p => p.preis &lt;= 20) |
| `fn orderBy(field: (T) => Any?): Query<T>` | Alle Zeilen aufsteigend sortiert. |
| `fn orderByDescending(field: (T) => Any?): Query<T>` | Alle Zeilen absteigend sortiert. |
| `fn find(id: Any): Future<T?>` | Die Zeile mit dieser Id oder null: await Produkt.find(3) |
| `fn count(): Future<Int>` | Anzahl aller Zeilen. |
| `fn insert(row: T): Future<T>` | Speichert eine neue Zeile (prüft vorher @Required, @Email …) und liefert sie mit vergebener Id zurück. |
| `fn insertAll(rows: List<T>): Future<List<T>>` | Speichert mehrere neue Zeilen. |
| `fn update(row: T): Future<T>` | Schreibt eine gespeicherte Zeile zurück (anhand ihrer Id): await Produkt.update(p.copy(preis: 9.99)) |
| `fn save(row: T): Future<T>` | insert, wenn die Id leer ist (0 oder ""), sonst update. |
| `fn delete(row: T): Future<Boolean>` | Löscht die Zeile; true, wenn es sie gab. Mit @SoftDelete wird sie nur als gelöscht markiert. |
| `fn deleteWhere(condition: (T) => Boolean): Future<Int>` | Löscht alle Zeilen, auf die die Bedingung passt, und liefert ihre Anzahl (mit @SoftDelete: markiert sie). |
| `fn withDeleted(): Query<T>` | Alle Zeilen einschließlich der mit @SoftDelete gelöschten: Notiz.withDeleted().where(n => n.geloeschtAm != null) |
| `fn restore(row: T): Future<T?>` | Holt eine mit @SoftDelete gelöschte Zeile zurück und liefert sie; null, wenn es sie nicht gibt. |
| `fn forceDelete(row: T): Future<Boolean>` | Löscht die Zeile endgültig, auch bei @SoftDelete; true, wenn es sie gab. |
| `fn unrestricted(): DbTable<T>` | Dieselbe Tabelle ohne Zugriffsregeln (@Policy, @Tenant), bewusst und im Code leicht zu finden:<br>await Notiz.unrestricted().find(id) |
| `fn history(id: Any): Future<List<Aenderung>>` | Das Änderungsprotokoll einer Zeile (nur mit @Audited), die älteste Änderung zuerst: await Notiz.history(id) |
| `fn search(query: String, language: String = "german"): SearchQuery<T>` | Volltextsuche über die @Searchable-Felder, die besten Treffer zuerst. Jedes Wort muss vorkommen (als<br>Wortanfang, ohne Groß-/Kleinschreibung und Akzente); 'language' ("german", "english" oder "simple") bestimmt<br>den Wortstamm der Suchwörter: await Artikel.search(q).where(a => a.autor != "bot").limit(20).list() |

<a id="searchquery"></a>

### `class SearchQuery<T>`

Eine Volltextsuche (search). Sie wird erst mit list(), first() oder count() ausgeführt, sortiert nach Relevanz.
Durchsucht werden die Felder mit @Searchable oder @Searchable(weight: n) mit n von 1 bis 4, siehe [Datenbanken](datenbank.md#volltextsuche).

| Signatur | Beschreibung |
|---|---|
| `fn where(condition: (T) => Boolean): SearchQuery<T>` | Weitere Bedingung wie bei Query.where: search(q).where(a => a.autor != "bot") |
| `fn limit(count: Int): SearchQuery<T>` | Höchstens 'count' Treffer. |
| `fn offset(count: Int): SearchQuery<T>` | Überspringt die ersten 'count' Treffer. |
| `fn page(number: Int, size: Int): SearchQuery<T>` | Seite 'number' (ab 1) mit 'size' Treffern. |
| `fn list(): Future<List<Treffer<T>>>` | Führt die Suche aus und liefert die Treffer, die relevantesten zuerst. |
| `fn first(): Future<Treffer<T>?>` | Der beste Treffer oder null. |
| `fn count(): Future<Int>` | Anzahl aller Treffer (limit/offset werden ignoriert). |

<a id="treffer"></a>

### `class Treffer<T>`

Ein Treffer der Volltextsuche. Er lässt sich wie eine Datenklasse an den Browser geben; dort zeigt
Highlight(t.snippet) den Ausschnitt mit markierten Fundstellen.

| Signatur | Beschreibung |
|---|---|
| `val value: T` | Die gefundene Zeile. |
| `val score: Float` | Relevanz: größer ist besser. Der Wert hängt von der Datenbank ab, nur die Reihenfolge zählt. |
| `val snippet: String` | Ausschnitt aus dem passendsten Feld; Fundstellen stehen zwischen den Zeichen \u0002 und \u0003. |

<a id="aenderung"></a>

### `data class Aenderung`

Ein Eintrag im Änderungsprotokoll einer Tabelle mit @Audited (Tabelle.history(id)). Geht wie jede Datenklasse über
das Netz und ist im Browser lesbar. Siehe [Zugriffsregeln und Änderungsprotokoll](datenbank.md#zugriffsregeln-und-änderungsprotokoll).

| Signatur | Beschreibung |
|---|---|
| `val tabelle: String` | Name der Tabelle, z. B. "notiz". |
| `val id: String` | Id der geänderten Zeile als Text. |
| `val aktion: String` | "insert", "update" oder "delete". |
| `val benutzer: String?` | Id des Benutzers (request.user bzw. Db.as) oder null. |
| `val zeit: DateTime` | Zeitpunkt der Änderung. |
| `val felder: List<FeldAenderung>` | Die geänderten Felder (bei insert und delete alle außer @NotAudited). |

<a id="feldaenderung"></a>

### `data class FeldAenderung`

Ein Feld einer Änderung.

| Signatur | Beschreibung |
|---|---|
| `val feld: String` | Name des Felds. |
| `val vorher: String?` | Wert vorher im Netzformat als JSON-Text, null bei insert. |
| `val nachher: String?` | Wert nachher im Netzformat als JSON-Text, null bei delete. |

<a id="relation"></a>

### `class Relation<T>`

Verweis auf eine Zeile einer anderen Tabelle. Gespeichert wird nur die Id; mit include(…) oder load() kommt
die Zeile dazu: data class Bestellung(@Id id: Int = 0, kunde: Relation&lt;Kunde&gt;, …)

| Signatur | Beschreibung |
|---|---|
| `static fn to<T>(row: T): Relation<T>` | Verweis auf eine (gespeicherte) Zeile: Relation.to(kunde) |
| `static fn of<T>(id: Any): Relation<T>` | Verweis über die Id: Relation.of&lt;Kunde&gt;(5) |
| `val id: Any` | Id der verwiesenen Zeile. |
| `val value: T?` | Die verwiesene Zeile, falls sie geladen ist (include oder load()), sonst null. |
| `fn load(): Future<T?>` | Lädt die verwiesene Zeile (nur einmal) und liefert sie. |

<a id="uniqueexception"></a>

### `class UniqueException: Error`

Wird von insert/update/save geworfen, wenn ein @Unique-Feld (oder die Id) einen schon vergebenen Wert bekäme.
try { await Nutzer.insert(n) } catch (e) { if (e is UniqueException) { … e.field … } }

| Signatur | Beschreibung |
|---|---|
| `val table: String` | Name der Tabellen-Klasse, z. B. "Nutzer". |
| `val field: String` | Das betroffene Feld, z. B. "email". |

<a id="forbiddenexception"></a>

### `class ForbiddenException: Error`

Wird geworfen, wenn eine Schreibregel (@Policy write, @Tenant) eine Änderung verbietet. Im Browser kommt sie als
Fehler mit Status 403 an.

| Signatur | Beschreibung |
|---|---|
| `val table: String` | Name der Tabellen-Klasse, z. B. "Notiz". |

<a id="db"></a>

### `class Db`

Die Datenbank des Projekts (texo.json "database").

| Signatur | Beschreibung |
|---|---|
| `static fn transaction<R>(action: () => Future<R>): Future<R>` | Führt 'action' in einer Transaktion aus: entweder alle Änderungen oder (bei einem Fehler) keine.<br>await Db.transaction(async () => { … }) |
| `static fn as<R>(user: Any?, action: () => Future<R>): Future<R>` | Führt 'action' im Namen eines Benutzers (der @Auth-Klasse) aus: die Zugriffsregeln (@Policy, @Tenant) gelten dann auch außerhalb<br>einer Anfrage, etwa in Zeitplänen, Jobs und Tests. await Db.as(benutzer, async () => await Notiz.all().list()) |
| `static fn sql(query: String, params: List<Any> = []): Future<List<Map<String, Any>>>` | Eigenes SQL mit Parametern (immer ?): await Db.sql("SELECT name FROM produkt WHERE preis &lt; ?", [10]) |
| `static fn query<T>(query: String, params: List<Any> = []): Future<List<T>>` | Eigenes SQL mit Typ: Die Spalten werden auf die Felder der Datenklasse T abgebildet (Name des Felds oder in<br>snake_case) und wie bei RPC geprüft. await Db.query&lt;KundeKurz&gt;("SELECT id, name FROM kunde WHERE id &gt; ?", [10]) |
| `static fn changed(table: String): Void` | Meldet eine Tabelle als geändert, nachdem sie mit Db.sql beschrieben wurde: offene Live-Abfragen auf ihr<br>laufen neu (in einer Transaktion erst nach dem COMMIT). Db.changed("notiz") |
| `static fn kind(): Future<String>` | Art der verbundenen Datenbank: "sqlite", "postgres", "mysql", "mongo" oder "memory". |

<a id="texo-admin"></a>

## Paket `texo.admin`

Fertige Verwaltungskonsole für den Betrieb. Import: `import texo.admin.*` – siehe [Backend und Sicherheit](backend.md#betrieb-verwaltungskonsole-adminconsole).

<a id="adminconsole"></a>

### `class AdminConsole: View`

Fertige Verwaltungskonsole für den Betrieb: Tabellen blättern, suchen und bearbeiten, Jobs, Zeitpläne, Mails,
Sitzungen und Cache. Die Daten kommen über einen internen Service, den der Compiler mit genau den Server-Wächtern
der Seite schützt; jede Änderung wird mit Benutzer protokolliert (Tabelle _texo_admin_log und Log).

| Signatur | Beschreibung |
|---|---|
| `AdminConsole(tables: List<TableRef> = [], readOnly: List<TableRef> = [], jobs: Boolean = false, schedules: Boolean = false, mails: Boolean = false, sessions: Boolean = false, cache: Boolean = false)` | Gehört direkt in eine Seite mit Server-Wächter (@Page, @Guard mit @Server-Funktion):<br>AdminConsole(tables: [Kunde.table], readOnly: [Rechnung.table], jobs: true, schedules: true, mails: true)<br>readOnly-Tabellen lassen sich nur ansehen; TEXO_ADMIN_READONLY=1 macht alle Tabellen schreibgeschützt. *(Element)* |

<a id="tableref"></a>

### `class TableRef`

Verweis auf eine @Table-Klasse für die Verwaltungskonsole: Kunde.table (nur als Argument von AdminConsole).

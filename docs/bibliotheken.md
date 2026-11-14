<!-- Übernommen aus LearNivram/Texo (docs/bibliotheken.md) mit scripts/docs-uebernehmen.mjs – bitte dort ändern. -->

# Bibliotheken: vorkompilierte Pakete (`.texolib`)

Mit Bibliotheken bindest du fertige Komponenten, Klassen, Funktionen und Design-Konstanten in ein Projekt ein, egal ob
selbst gebaut oder von anderen. Eine Bibliothek wird **einmal vorkompiliert** und als einzelne Datei `name-1.0.0.texolib`
weitergegeben. Das hat drei Vorteile:

- **Der Quellcode bleibt geschützt.** Im Paket stehen nur die öffentliche Schnittstelle (Signaturen und Doku) und der
  bereits kompilierte, minifizierte und verschleierte JavaScript-Code. Funktionsrümpfe, private und `internal` Teile,
  Texte und Eigenschaftsnamen sind nicht lesbar.
- **Schnelleres Bauen.** Das Projekt kompiliert die Bibliothek nicht noch einmal. Der Compiler prüft nur die Typen gegen
  die Schnittstelle und übernimmt den fertigen Code.
- **Schlanke Ausgabe.** Im Build landen nur die Module, die das Projekt tatsächlich importiert, und daraus nur die
  benutzten Komponenten, Klassen und Funktionen. Die CSS-Regeln der Bibliothek werden in die atomare `app.css` des
  Projekts übernommen; gleiche Regeln stehen nur einmal darin. Große Komponenten lassen sich mit
  [`Lazy`](reaktivitaet.md#nachladen-mit-lazy) erst bei Bedarf laden.

```
texo init ui_kit --library     # neues Bibliotheksprojekt
cd ui_kit && texo dev          # Vorschau mit Live-Reload (demo/)
texo lib pack                  # → ui_kit-0.1.0.texolib

cd ../meine-app
texo lib add ../ui_kit/ui_kit-0.1.0.texolib
texo dev                       # import ui_kit.* – fertig
```

## Inhalt

1. [Eine Bibliothek schreiben](#eine-bibliothek-schreiben)
2. [Packen](#packen)
3. [Einbinden und benutzen](#einbinden-und-benutzen)
4. [Abhängigkeiten](#abhängigkeiten)
5. [texo.lock](#texolock)
6. [Registry: Bibliotheken teilen und aktualisieren](#registry-bibliotheken-teilen-und-aktualisieren)
7. [Signieren](#signieren)
8. [Versionen und Breaking Changes](#versionen-und-breaking-changes)
9. [Was im Paket steht – und was nicht](#was-im-paket-steht--und-was-nicht)
10. [Befehle](#befehle)
11. [Grenzen](#grenzen)

## Eine Bibliothek schreiben

Eine Bibliothek ist ein normales Texo-Projekt mit einem Abschnitt `"library"` in der `texo.json`:

```json
{
  "src": "src",
  "out": "dist",
  "demo": "demo",
  "library": {
    "name": "ui_kit",
    "version": "0.1.0",
    "description": "Hinweise, Karten und Knöpfe",
    "license": "MIT",
    "author": "Dein Name"
  }
}
```

- **`name`**: Kleinbuchstaben, Ziffern und `_`, 2–40 Zeichen. Der Name ist zugleich das **Wurzel-Paket**: Jede Datei der
  Bibliothek gehört zu `package ui_kit` oder einem Unterpaket wie `package ui_kit.formulare`. So kommen sich Bibliotheken
  und Projekte nie in die Quere.
- **`version`**: im Format `1.2.3`, optional mit Zusatz (`1.0.0-beta.1`).
- **`demo`**: Ordner mit Vorschauseiten für `texo dev` (Standard `demo`). Er gehört **nicht** zum Paket.

### Was öffentlich ist

| Deklaration | sichtbar für Projekte? |
|---|---|
| ohne Angabe oder `public` | ja, Teil der Schnittstelle |
| `internal` | nein, nur innerhalb der Bibliothek (alle Pakete der Bibliothek dürfen es benutzen) |
| `private` | nein, nur in der eigenen Datei bzw. Klasse |

```texo
package ui_kit

import texo.ui.*
import texo.graphics.*

/// Hauptfarbe der Bibliothek. Konstanten setzt der Compiler beim Benutzer direkt ein.
public const Akzent = Color.hex("#4f46e5")

/// Ein Hinweis-Kasten mit Titel und Text.
public component Hinweis(titel: String, text: String, farbe: Color = Akzent) {
    private State<Boolean> offen = State(true)

    fn build(): View {
        if (!this.offen.value) return Spacer()
        return Row(spacing: 12.px, [
            Column(spacing: 4.px, [
                Text(this.titel).fontWeight(FontWeight.SemiBold).textColor(this.farbe),
                Text(beschnitten(this.text))
            ]).grow(),
            Button.plain()
                .content(Icon("x", size: 16.px))
                .ariaLabel("Schließen")
                .onClick(() => this.offen.value = false)
        ])
            .padding(16.px)
            .radius(12.px)
            .background(this.farbe.opacity(0.08))
    }
}

/// Nur innerhalb der Bibliothek benutzbar – taucht in keinem Projekt auf.
internal fn beschnitten(text: String): String => text.length <= 120 ? text : text.substring(0, 120) + "…"
```

Doku-Kommentare (`///`) kommen mit ins Paket. Sie erscheinen beim Benutzer im Editor als Hover-Text.

### Style-Bibliotheken: Aussehen liefern, Inhalt offen lassen

Mit `ChildPlaceholder()` gestaltest du z. B. einen Button komplett, lässt aber offen, was darin steht. Der Benutzer
füllt ihn mit `.content(…)` und benannte Platzhalter mit `.slot("name", …)`
([Sprachreferenz](sprachreferenz.md#inhalt-übergeben-childplaceholder)):

```texo
package ui_kit.knoepfe

import texo.ui.*
import texo.graphics.*

/// Primärer Button der Bibliothek: Icon (.slot("icon", …)) und Beschriftung (.content(…)) wählt der Benutzer.
public component PrimaerKnopf(farbe: Color = Color.hex("#4f46e5")) {
    fn build(): View => Button.plain()
        .content(Row(spacing: 8.px, [ChildPlaceholder("icon"), ChildPlaceholder(fallback: Text("OK"))]))
        .padding(vertical: 10.px, horizontal: 18.px)
        .radius(12.px)
        .background(this.farbe)
        .textColor(Color.White)
        .hover(b => b.elevation(4.px))
}
```

<!-- nocheck -->
```texo
// im Projekt, nach texo lib add
PrimaerKnopf()
    .slot("icon", Icon("download", size: 16.px))
    .content(Text("Herunterladen"))
    .onClick(() => this.laden())
```

Benennt die Bibliothek innere Elemente mit `.part("name")`, kann der Benutzer auch diese gestalten:
`PrimaerKnopf().style("icon", s => s.textColor(Color.Amber400))` ([Teile](sprachreferenz.md#teile-von-außen-gestalten-part-und-style)).

Komponenten können auch **Befehle** anbieten, die das Projekt von überall aufruft, z. B. eine Meldungsliste mit
`@Command(queue: true) fn zeigen(text: String)`, im Projekt `Toasts.zeigen("Gespeichert")`
([Befehle](sprachreferenz.md#befehle-command--komponenten-von-überall-ansprechen)).

Die Platzhalter landen als `@Slots("icon", "")` und die Teile als `@Parts(…)` in der Schnittstelle des Pakets. Deshalb prüft der Compiler auch beim
Benutzer, ob es die benutzten Platzhalter gibt, obwohl `build()` vorkompiliert ist.

### Design-Tokens: das Aussehen anpassbar machen

Konstanten (`public const Akzent = …`) setzt der Compiler beim Benutzer fest ein, die kann niemand ändern. Für alles,
was ein Projekt an sein Design anpassen soll, nimm ein `@Theme`-object
([Details](ui-und-styling.md#design-tokens-theme)):

```texo
package ui_kit.design

import texo.graphics.*

/// Design-Tokens von ui_kit – im Projekt mit GlobalStyle().theme(…) überschreibbar.
@Theme
public object UiKit {
    /// Hauptfarbe aller Buttons.
    val primaer: Color = Color.Indigo600
    /// Rundung von Buttons und Karten.
    val radius: Length = 12.px
}
```

Die Komponenten der Bibliothek benutzen `UiKit.primaer` und `UiKit.radius` wie normale Werte. Im Projekt:

<!-- nocheck -->
```texo
@Global
val Design = GlobalStyle().theme(UiKit.primaer, Color.Emerald600).theme(UiKit.radius, 4.px)
```

Die Standardwerte stehen mit in der Schnittstelle des Pakets. Ein Projekt, das nichts überschreibt, sieht die
Bibliothek also genau so, wie sie gestaltet wurde.

### Vorschau während der Entwicklung

`texo init --library` legt neben `src/` den Ordner `demo/` an. Dort steht eine normale `@Page`, die die Bibliothek
benutzt. `texo dev` im Bibliotheksordner kompiliert beides zusammen und zeigt die Vorschau mit Live-Reload. `texo check`
prüft ebenfalls beides.

### Dateien und Schriften aus `public/`

Bilder, Schriften oder Icons aus dem Ordner `public/` der Bibliothek werden mitgepackt und beim Bauen des Projekts unter
demselben Pfad ausgegeben. Sie müssen in einem Unterordner mit dem Namen der Bibliothek liegen
(`public/ui_kit/logo.svg`, im Code `Image("ui_kit/logo.svg")`). Sonst bricht `texo lib pack` ab. So überschneiden
sich Bibliotheken nie. Eine gleichnamige Datei im `public/` des Projekts hat Vorrang. So lässt sich etwa ein Logo
austauschen.

Schriften bindet die Bibliothek über einen globalen Stil ein. Die `@font-face`-Regel und die Datei kommen beim
Benutzer automatisch mit:

```texo
package ui_kit.schrift

import texo.ui.*

@Global
val UiKitSchrift = GlobalStyle().fontFace("UiKit Sans", "ui_kit/fonts/sans.woff2", weight: "400 700")
```

Danach nutzen die Komponenten `Font.named("UiKit Sans")`.

### Texte übersetzbar machen

Texte in Komponenten (Schaltflächen, Hinweise, „Keine Einträge“) schreibst du mit
`tr("ui_kit.schliessen", "Schließen")`. Übersetzungen packst du als `@Global … = Translations("en", […])` mit in die
Bibliothek. Das Projekt kann sie überschreiben und weitere Sprachen ergänzen ([Übersetzungen](uebersetzungen.md)).

### Testen und dokumentieren

```
texo test                    # Tests aus tests/ (texo init --library legt ein Beispiel an)
texo lib docs                # Dokumentation: ui_kit-docs/index.html, API.md und demo/ als Live-Beispiele
```

`texo lib docs` erzeugt aus der Schnittstelle eine Dokumentationsseite. Sie enthält jede Komponente mit Eigenschaften,
Platzhaltern, Teilen und Doku-Kommentaren sowie Design-Tokens mit Standardwerten, Klassen, Funktionen,
Installationszeile und Importen. Dazu kommt `API.md` für die README. Die Seiten aus `demo/` werden als Live-Beispiele
mitgebaut. Für ein fertiges Paket geht das auch ohne Quelltext: `texo lib docs ui_kit-1.2.0.texolib`.
[Tests](testen.md) schreibst du wie in jedem Projekt in `tests/`. Sie landen nicht im Paket.

### Fehlermeldungen

Auch verschleierter Code liefert lesbare Fehler: Stürzt eine Komponente der Bibliothek ab, lautet die Meldung z. B.
„Fehler in Komponente FancyButton (Bibliothek ui_kit): Index 5 außerhalb der Liste“. Fehler in `onMount` erscheinen
mit Komponentennamen in der Konsole, die Seite läuft weiter.

## Packen

```
texo lib pack                  # im Bibliotheksordner → ui_kit-0.1.0.texolib
texo lib pack pfad/zur/lib     # anderer Ordner
texo lib pack -o dist/ui.texolib
```

`texo lib pack` geht in diesen Schritten vor:

1. Es prüft die Bibliothek wie `texo check`: Typen, Paketnamen, Version.
2. Es erzeugt die **Schnittstelle**: Alle öffentlichen Deklarationen werden als Texo-Quelltext ausgegeben, jede
   Implementierung wird durch `extern` ersetzt. Die Schnittstelle wird anschließend für sich allein noch einmal geprüft.
   Verweist eine öffentliche Funktion auf einen `internal`- oder `private`-Typ, bekommst du eine verständliche Meldung.
3. Es kompiliert jede Datei zu einem ES-Modul, **minifiziert** es (oxc) und **verschlüsselt** alle Texte und
   Eigenschaftsnamen. Interne Exporte erhalten bedeutungslose Namen.
4. Es sammelt die CSS-Regeln, die Dateien aus `public/` und eine **SHA-256-Prüfsumme** über alles und schreibt das
   Paket gzip-komprimiert.

So sieht die Schnittstelle der Bibliothek oben im Paket aus:

<!-- nocheck -->
```texo
/// Hauptfarbe der Bibliothek. Konstanten setzt der Compiler beim Benutzer direkt ein.
public const Akzent: Color = Color.hex("#4f46e5")

/// Ein Hinweis-Kasten mit Titel und Text.
public component Hinweis(titel: String, text: String, farbe: Color = extern) {
    fn build(): View => extern
}
```

`extern` steht für „vorkompiliert“. Im eigenen Code ist es nicht erlaubt.

## Einbinden und benutzen

```
texo lib add ../ui_kit/ui_kit-0.1.0.texolib            # Datei
texo lib add https://example.com/ui_kit-0.1.0.texolib  # Download (nur https)
texo lib add ui_kit                                    # neueste Version aus der Registry
texo lib add ui_kit@^1.2.0                             # passende Version aus der Registry
```

`texo lib add` prüft das Paket (Format, Prüfsumme, Signatur), kopiert es nach `texo_libs/`, trägt es in die `texo.json`
ein und hält Version, Prüfsumme und Schlüssel in der [`texo.lock`](#texolock) fest:

```json
{
  "src": "src",
  "out": "dist",
  "libraries": {
    "ui_kit": "texo_libs/ui_kit-0.1.0.texolib"
  }
}
```

Eine neuere Version derselben Bibliothek ersetzt die alte. Braucht die Bibliothek andere Bibliotheken, werden diese
mitinstalliert ([Abhängigkeiten](#abhängigkeiten)). Danach importierst du die Bibliothek wie ein eigenes Paket:

```texo
// src/App.texo
package app

import texo.ui.*
import texo.graphics.*
import ui_kit.*

@Page(title: "Start")
component App {
    fn build(): View => Column(spacing: 16.px, [
        Hinweis(titel: "Willkommen", text: "Diese Komponente kommt aus ui_kit."),
        Text("Akzentfarbe").textColor(Akzent)
    ])
}
```

`texo build`, `texo dev`, `texo check` und die Editoren (VS Code, WebStorm/IntelliJ über `texo lsp`) kennen die
Bibliothek automatisch: Typfehler, Autovervollständigung und Hover mit Doku funktionieren wie bei eigenem Code.
Komponenten der Bibliothek werden beim Bauen **vorgerendert** und im Browser per Hydration übernommen, genau wie eigene.

`texo_libs/` und `texo.lock` gehören ins Versionsverwaltungssystem (Git), damit alle im Team und die CI dieselben
Pakete benutzen.

## Abhängigkeiten

Eine Bibliothek darf auf anderen Bibliotheken aufbauen. Im Bibliotheksprojekt bindest du sie wie in jedem Projekt mit
`texo lib add` ein. `texo lib pack` kompiliert dann gegen ihre Schnittstelle und vermerkt im Paket einen kompatiblen
Versionsbereich (`"dependencies": { "basis": "^1.2.0" }`). Ihr Code steckt **nicht** im eigenen Paket.

Beim Einbinden sucht `texo lib add` fehlende oder zu alte Abhängigkeiten in dieser Reihenfolge:

1. bereits eingebundene Versionen, wenn sie passen,
2. die Registry (falls angegeben),
3. Pakete im selben Ordner wie die eingebundene Datei (`basis-1.2.0.texolib` neben `aufbau-0.1.0.texolib`).

Passt etwas nicht zusammen (eine Bibliothek braucht `basis ^2`, eine andere `basis ^1`), bricht `texo lib add` ab, bevor
irgendetwas geschrieben wird. `texo lib remove basis` verweigert das Entfernen, solange eine andere Bibliothek `basis`
braucht. Auch `texo build` und `texo check` melden unerfüllte Abhängigkeiten.

Versionsbereiche:

| Bereich | bedeutet |
|---|---|
| `1.2.3` | genau diese Version |
| `^1.2.3` | kompatibel: ab 1.2.3, unter 2.0.0 (bei `0.x`: unter 0.3.0 – dort zählt die zweite Stelle als Hauptversion) |
| `~1.2.3` | nur Fehlerbehebungen: ab 1.2.3, unter 1.3.0 |
| `>=1.2.3` | diese oder jede neuere |
| `*` | jede (Vorabversionen wie `2.0.0-beta.1` nur, wenn es sonst keine gibt) |

## texo.lock

`texo lib add`, `update` und `remove` schreiben die Datei `texo.lock`: Für jede Bibliothek stehen dort Version, Datei,
Prüfsumme, Herkunft und – bei signierten Paketen – der Schlüssel.

```json
{
  "lockfileVersion": 1,
  "libraries": {
    "ui_kit": {
      "version": "1.2.0",
      "file": "texo_libs/ui_kit-1.2.0.texolib",
      "integrity": "sha256-…",
      "source": "registry:ui_kit/ui_kit-1.2.0.texolib",
      "publicKey": "ed25519:…"
    }
  }
}
```

Bei jedem Build prüft Texo die Pakete gegen die `texo.lock`. Wurde eine Datei in `texo_libs/` ausgetauscht, bricht der
Build ab (`… passt nicht zu texo.lock – die Datei wurde ausgetauscht`). Aktualisieren geht nur bewusst über
`texo lib add` oder `texo lib update`.

## Registry: Bibliotheken teilen und aktualisieren

Eine Registry ist ein Ordner mit einer `index.json` und den Paketen. Er kann lokal liegen, auf einem Netzlaufwerk oder
statisch im Internet (GitHub Pages, ein Webserver, ein Bucket). Einen zentralen Server braucht es nicht.

```
texo lib publish ui_kit-1.2.0.texolib --registry ../registry   # in einen Registry-Ordner veröffentlichen
```

Der Ordner sieht dann so aus und kann so hochgeladen werden:

```
registry/
  index.json                      Verzeichnis aller Pakete und Versionen (mit Prüfsummen und Schlüsseln)
  ui_kit/ui_kit-1.2.0.texolib
```

Projekte geben die Registry in der `texo.json` an (oder mit `--registry` bzw. der Umgebungsvariable `TEXO_REGISTRY`):

```json
{ "src": "src", "out": "dist", "registry": "https://meine-firma.github.io/texo-registry" }
```

```
texo lib search knopf        # Pakete suchen
texo lib add ui_kit          # neueste Version (mit Abhängigkeiten)
texo lib outdated            # was gibt es Neues?
texo lib update              # auf die neuesten kompatiblen Versionen (^)
texo lib update --latest     # auch neue Hauptversionen – können inkompatibel sein
```

- Veröffentlichte Versionen sind **unveränderlich**: Dieselbe Version mit anderem Inhalt lehnt `publish` ab.
- Geladene Pakete werden gegen den Index geprüft (Prüfsumme und Schlüssel). Weichen Index und Paket voneinander ab,
  bricht `texo lib add` ab.
- Hat ein Paket schon signierte Versionen, nimmt die Registry neue Versionen nur mit demselben Schlüssel an.

## Signieren

Die Prüfsumme erkennt beschädigte Pakete. Wer ein Paket gebaut hat, beweist erst eine **Signatur**:

```
texo lib keygen              # einmalig: Schlüsselpaar, privat in ~/.texo/signing.key
texo lib pack --sign         # Paket signieren (anderer Schlüssel: --sign=pfad/zum.key)
```

`texo lib keygen` gibt den öffentlichen Schlüssel aus (`ed25519:…`). Veröffentliche ihn, z. B. in der README der
Bibliothek. Benutzer können ihn beim Einbinden verlangen:

```
texo lib add ui_kit --key ed25519:AbCd…
```

Auch ohne `--key` merkt sich die `texo.lock` den Schlüssel beim ersten Einbinden. Ist eine spätere Version mit einem
**anderen** Schlüssel signiert (oder gar nicht), lehnt Texo sie ab. Hat der Autor seinen Schlüssel wirklich gewechselt,
musst du das ausdrücklich bestätigen (`--trust-new-key`). Ein ausgetauschtes oder untergeschobenes Paket fällt so auf.

Halte den privaten Schlüssel geheim und sichere ihn: Er gehört nicht ins Repository. Geht er verloren, können Benutzer
neue Versionen nur nach `--trust-new-key` annehmen.

## Versionen und Breaking Changes

`texo lib pack` vergleicht die Schnittstelle mit der **vorherigen Version**. Das ist das nächstältere Paket im
Projektordner, sonst die Registry oder die Datei aus `--previous datei`. Dann prüft es, ob der Versionssprung dazu
passt:

| Änderung | Beispiele | nötige Version |
|---|---|---|
| inkompatibel | Komponente/Funktion entfernt, Parameter entfernt oder Typ geändert, neuer Pflichtparameter, Platzhalter/Teil/Enum-Fall entfernt, neue Pflichtmethode in einem Interface | neue Hauptversion (`2.0.0`, bei `0.x`: `0.3.0`) |
| Erweiterung | neue Komponente, neuer optionaler Parameter, neuer Platzhalter | neue Nebenversion (`1.3.0`) – sonst ein Hinweis |
| nur Implementierung | Fehler behoben, Aussehen geändert | `1.2.4` |

Passt der Sprung nicht, bricht `pack` mit der Liste der inkompatiblen Änderungen ab. Ist der Bruch Absicht und du
willst die Version trotzdem nicht erhöhen: `--allow-breaking`. So landen Benutzer mit `^1.2.0` nie versehentlich auf
einer Version, die ihren Code bricht.

```
texo lib diff ui_kit-1.2.0.texolib ui_kit-1.3.0.texolib   # Änderungen zwischen zwei Paketen anzeigen
```

## Was im Paket steht – und was nicht

| im Paket | nicht im Paket |
|---|---|
| öffentliche Signaturen und `///`-Doku | `.texo`-Quelltext |
| Werte öffentlicher Konstanten | Funktionsrümpfe, Feld-Initialisierer, Standardwerte |
| kompilierter Code: minifiziert, Texte und Eigenschaftsnamen verschlüsselt | `private`- und `internal`-Deklarationen (nur als unlesbarer Code) |
| atomare CSS-Regeln, Dateien aus `public/` | der Ordner `demo/` |
| Name, Version, Autor, Lizenz, Prüfsumme | |

**Zum Schutz:** Code, der im Browser läuft, kann man grundsätzlich nie vollständig verbergen. Der Browser muss ihn
ausführen können. Verschleierung macht das Nachvollziehen und Kopieren aber sehr mühsam: Es gibt keine Namen, keine
lesbaren Texte und keine Struktur des Originals. Wirklich geheime Logik (Preise, Schlüssel, Prüfungen) gehört in einen
`service` auf dem Server ([Backend und Sicherheit](backend.md)).

**Zur Integrität:** Die Prüfsumme erkennt beschädigte oder nachträglich veränderte Pakete, eine [Signatur](#signieren)
zusätzlich, von wem ein Paket stammt. Binde trotzdem nur Pakete aus Quellen ein, denen du vertraust: Eine Bibliothek läuft
mit denselben Rechten wie dein eigener Code.

## Befehle

| Befehl | Wirkung |
|---|---|
| `texo init <ordner> --library` | neues Bibliotheksprojekt (`src/`, `demo/`, `texo.json` mit `"library"`) |
| `texo lib pack [ordner] [-o datei] [--sign[=schlüssel]] [--previous datei] [--allow-breaking]` | Bibliothek prüfen, kompilieren, verschleiern, mit der Vorversion vergleichen und als `.texolib` packen |
| `texo lib keygen [-o datei] [--force]` | Ed25519-Schlüsselpaar zum Signieren |
| `texo lib publish [paket] --registry <ordner>` | Paket in einen Registry-Ordner veröffentlichen |
| `texo lib diff <alt> <neu>` | Änderungen der Schnittstelle zwischen zwei Paketen |
| `texo lib docs [ordner \| paket \| name] [-o ordner]` | Dokumentation als HTML und Markdown, mit Live-Beispielen aus `demo/` |
| `texo test [filter]` | Tests aus `tests/` ausführen ([Testen](testen.md)) |
| `texo lib add <datei \| https-url \| name[@version]> [--key …] [--trust-new-key]` | Paket (mit Abhängigkeiten) prüfen, nach `texo_libs/` kopieren, in `texo.json` und `texo.lock` eintragen |
| `texo lib update [name] [--latest]` | auf neuere Versionen aus der Registry |
| `texo lib outdated` | eingebundene und verfügbare Versionen |
| `texo lib search [text]` | Pakete in der Registry |
| `texo lib list` | eingebundene Bibliotheken mit Version, Signatur, Abhängigkeiten |
| `texo lib info <datei \| name>` | Autor, Lizenz, Prüfsumme, Signatur, Abhängigkeiten und Schnittstelle |
| `texo lib remove <name>` | Bibliothek austragen und ihre Datei aus `texo_libs/` löschen |

## Grenzen

- `service`s, `@Server`-Funktionen und `@Page`-Seiten gehören ins Projekt, nicht in eine Bibliothek. Vorschauseiten
  kommen nach `demo/`.
- Pakete merken sich die Texo-Version, mit der sie gebaut wurden. Weicht die Haupt- oder Nebenversion ab, warnt der
  Compiler. Bei Problemen die Bibliothek mit der aktuellen Version neu packen.

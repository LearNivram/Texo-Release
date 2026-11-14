<!-- Übernommen aus LearNivram/Texo (docs/compiler.md) mit scripts/docs-uebernehmen.mjs – bitte dort ändern. -->

# Der Texo-Compiler

Dieses Dokument beschreibt die Architektur des Compilers (Rust, Cargo-Workspace unter `crates/`), die erzeugte Ausgabe
im Detail und die Kommandozeile (`texo.json`, Befehle).

**Inhalt**

1. [Pipeline](#pipeline)
2. [Crates](#crates)
3. [Die Phasen im Detail](#die-phasen-im-detail)
4. [Erzeugte Ausgabe](#erzeugte-ausgabe)
5. [Atomares CSS: Klassennamen und Reihenfolge](#atomares-css-klassennamen-und-reihenfolge)
6. [CSS-Schichten](#css-schichten)
7. [Server-Rendering über Mini-DOM](#server-rendering-über-mini-dom)
8. [Seiten und Einstiegspunkte](#seiten-und-einstiegspunkte)
9. [Kommandozeile und texo.json](#kommandozeile-und-texojson)
10. [Code-Schutz (Minifizierung und Verschleierung)](#code-schutz-minifizierung-und-verschleierung)
11. [Den Compiler einbetten](#den-compiler-einbetten)
12. [Tests und Entwicklung](#tests-und-entwicklung)

---

## Pipeline

```
 .texo-Quelltext
       │
       ▼
  ┌─────────┐   Tokens (inkl. Zeilenumbruch-Flag, Interpolations-Teile, Doku-Kommentare)
  │  Lexer  │   texo-syntax: lexer.rs
  └────┬────┘
       ▼
  ┌─────────┐   rekursiver Abstieg, Fehlerbehebung (Resynchronisation), spekulatives Parsen
  │ Parser  │   texo-syntax: parser.rs
  └────┬────┘
       ▼
  ┌─────────┐   Syntaxbaum in einer Arena, Knoten über IDs (texo-syntax: ast.rs)
  │   AST   │
  └────┬────┘
       ▼
  ┌──────────────┐  Symbole, Typen, Generics-Inferenz, Null-Sicherheit, Smart Casts,
  │  Typprüfer   │  match-Vollständigkeit, Komponentenregeln (texo-sema: checker/)
  │ (+ Stdlib)   │  Standardbibliothek = Texo-Deklarationen (texo-stdlib: std/*.texo)
  └──────┬───────┘
         │ AST + Seitentabellen (Typ je Ausdruck, aufgelöste Symbole und Aufrufe)
   ┌─────┼─────────────────────────┐
   ▼     ▼                         ▼
┌──────┐ ┌────────────┐      ┌─────────────┐
│ JS   │ │ CSS        │      │ Const-Eval  │  zur Compile-Zeit ausgewertete Designwerte
│ Gen  │ │ Registry   │◄─────┤ (consteval) │  (Farben, Längen, Verläufe …)
└──┬───┘ └─────┬──────┘      └─────────────┘
   │           │                texo-codegen
   │  ES6-Module   app.css + pro Komponente .css
   ▼           ▼
 ┌──────────────────────────────────────────┐
 │ SSR: Module in Mini-DOM ausführen        │  → <Komponente>.html, index.html mit
 │ (dieselbe Laufzeit wie im Browser)       │    vorgerendertem Inhalt + hydrate()-Aufruf
 └──────────────────────────────────────────┘
```

`compile()` im Crate `texo-compiler` verbindet die Phasen. Die Standardbibliothek (`texo.core`, `texo.graphics`,
`texo.server`, `texo.ui`, `texo.test`, `texo.db`) ist als Texo-Quelltext (`extern`-Deklarationen mit `@js`-Vorlagen) ins
Programm eingebettet, wird bei jeder Kompilierung geparst und zusammen mit den Benutzerdateien geprüft – Elemente,
Modifier und Methoden sind also **keine** Sonderfälle im Typprüfer, sondern ganz normale, typisierte Deklarationen.

### JavaScript im Compiler

Die Browser-Laufzeit bleibt JavaScript (`crates/texo-stdlib/runtime/*.js`). Der Compiler braucht sie an drei Stellen:
für Konstanten aus `extern`-Klassen (`Color.rgb(…)`, `@js`-Vorlagen) und die Stil-Mapper (Modifier → CSS), für das
Vorrendern der Seiten und für `texo test`. Dafür bettet `texo-codegen` die JavaScript-Engine **QuickJS** ein
(`host.rs`) und lädt genau die Dateien `core.js`, `std.js`, `style.js` und `minidom.js`, die auch jeder Build als
`texo/*.js` ausliefert. Compile-Zeit und Browser rechnen deshalb gleich: `Color.Indigo500.opacity(0.3)` ist zur
Compile-Zeit exakt das, was der Browser berechnen würde. QuickJS hat kein `Intl`; Zahlen, Beträge und Datumsangaben
formatiert `texo-codegen/js/intl.js`, Texte vergleicht Rust.

## Crates

| Crate | Aufgabe |
|---|---|
| `texo-syntax` | Quelldateien und Diagnosen (`diagnostics.rs`: Meldungen mit Codeausschnitt und Hinweis), Lexer (`lexer.rs`: Schlüsselwörter, Zahlen mit `_`/Hex/Exponent, Strings mit `${…}`, Kommentare inkl. `///`), Parser und Syntaxbaum (`parser.rs`, `ast.rs`), Besucher (`visit`) |
| `texo-sema` | Typen und Symbole (`types.rs`), Typprüfer (`checker/`: Deklarationen, Mitglieder, Ausdrücke, Aufrufe, Rümpfe und Narrowing, typisierte Fehler, Prüfungen von Anmerkungen), Ergebnis-Tabellen (`tables.rs`), Tabellenschema und Abfrage-Übersetzung von Texo Data (`data/`) |
| `texo-stdlib` | Standardbibliothek als Texo-Deklarationen (`std/*.texo`) mit Annotationen (`@element`, `@style`, `@variant`, `@event`, `@attr`, `@content`, `@js`, `@impure`, `@mutating`); Laufzeit als JavaScript (`runtime/`): `core.js` (Signale, DOM-Helfer, Hydration, Router), `std.js` (Wertetypen, Listen-/Text-Helfer, `DateTime`, `Http` …), `style.js` (Modifier → CSS, Varianten), `icons.js`, `rpc.js`, `minidom.js`, `testing.js` sowie Server, Datenbank und Adapter für die Backends Node.js, Bun und Deno (`server.js`, `db.js`, `adapter-*.js`) – alles per `include_str!` eingebettet |
| `texo-codegen` | JavaScript-Erzeugung (`jsgen/`: Module, Klassen, Ausdrücke, UI-Bäume), CSS-Registry mit Reset, Basisstilen und Reihenfolge (`css.rs`), Konstantenauswertung (`consteval.rs`), eingebettete JS-Engine (`host.rs`) |
| `texo-compiler` | `compile()`: Phasen, Seitenwahl, Vorrendern, Bibliotheken, npm-Brücken, Ausgabe als Pfad → Inhalt (`build.rs`); Hash-Dateinamen (`hashnames.rs`); öffentliche Schnittstelle für `texo lib pack` (`library.rs`). Ohne Dateisystem, damit er auch als WebAssembly läuft |
| `texo-protect` | Code-Schutz für `texo build` mit oxc: Minifizierung, umbenannte Exporte, verschlüsselte String-Tabelle |
| `texo-lib` | Bibliotheken: `.texolib` packen und lesen, `texo.lock`, Registry (Ordner oder https), Ed25519-Signaturen, SemVer, API-Vergleich, `texo lib docs` |
| `texo-eval` | Bytecode-VM für das Backend Texo: führt `service`-Methoden, `@Server`-Wächter und `@Seed`-Funktionen aus; Bytecode-Format `texo-vm@1` für Bibliotheken (`unit.rs`) |
| `texo-data` | Texo Data für den nativen Server: Treiber für SQLite, PostgreSQL, MySQL/MariaDB, MongoDB und Speicher, SQL mit gebundenen Parametern, Migrationen und Schema-Vergleich (`diff.rs`) |
| `texo-server` | nativer HTTP-Server für das Backend Texo: statische Dateien aus dem Speicher, Routing, signierte Sessions, CSRF-/Origin-Schutz, `@Guard`, `@RateLimit`, RPC mit Typvalidierung, Sicherheits-Header, HTTPS |
| `texo-lsp` | Sprachserver `texo lsp`: Diagnosen, Vervollständigung, Hover, Sprung zur Definition, Gliederung, Formatierung; rechnet Byte-Offsets in UTF-16-Positionen für LSP um |
| `texo-cli` | Programme `texo` (alle Befehle, `usage.rs` listet sie) und `texo-server` (nur der native Server) |
| `texo-wasm` | der Compiler als WebAssembly (`wasm32-wasip1`) für den Playground |

## Die Phasen im Detail

### Lexer und Parser

- Der Lexer markiert pro Token, ob davor ein Zeilenumbruch stand. Das ersetzt Semikolons: Eine Anweisung endet mit
  `;`, einem `}` oder einem Zeilenumbruch. Aufrufklammern, Indizes, `!!` und `++` müssen in derselben Zeile beginnen.
- Strings mit Interpolation werden zu Template-Token mit Teilen (Text oder Ausdruck samt Offset); der Parser parst jeden
  `${…}`-Ausdruck rekursiv mit korrekten Positionen für Fehlermeldungen.
- Mehrdeutigkeiten werden durch **spekulatives Parsen** mit Zurücksetzen gelöst: Java-Stil-Deklarationen (`Int x = 1`),
  Lambdas mit Klammern (`(a, b) => …`), explizite Typargumente (`xs.map<Int>(…)`).
- Bei Fehlern synchronisiert der Parser auf die nächste Deklaration, das nächste Mitglied bzw. die nächste Anweisung und
  macht weiter – Fehler werden gesammelt, nicht abgebrochen.
- Positionen sind Byte-Offsets; Spalten in Meldungen zählen Zeichen. `texo lex` und `texo parse` geben Tokens bzw.
  Syntaxbaum einer Datei aus (mit `--json` maschinenlesbar).

### Typprüfer

Reihenfolge in `Checker::check()` (jeder Schritt über alle Dateien):

1. `declare_file` – alle Klassen, Enums, Funktionen, Konstanten pro Paket anlegen (Doppeldeklarationen melden)
2. `build_file_scope` – Importe auflösen (`import paket.*`, `import paket.Name as Alias`)
3. `resolve_headers` – Obertypen, Interfaces, Typparameter; Komponenten erben von `View`
4. `resolve_members` – Felder, Methodensignaturen, Primärkonstruktor, `copy()`/`toString()` von Datenklassen,
   Enum-Mitglieder (`values()`, `name`)
5. träge aufgelöste Typen (Felder ohne Typangabe, Funktionen mit Ausdruckskörper); zyklische Abhängigkeiten werden gemeldet
6. `check_bodies` – Ausdrücke prüfen, Argumente zu Parametern zuordnen (benannt, Standardwerte, variadisch),
   Generics unifizieren, Narrowing, Zuweisbarkeit, Definitheit von `return`
7. `validate_file` – Anmerkungen an Komponenten, Services, Seiten, Tabellen, Themes, Tests und npm-Brücken
   (z. B. brauchen Komponenten `fn build(): View`)

Das Ergebnis steht nicht am Syntaxbaum, sondern in **Seitentabellen** (`Tables`: Typ je Ausdruck, aufgelöste Namen und
Aufrufe), die über Knoten-IDs adressiert werden. Die Generatoren lesen daraus.

### Konstantenauswertung

`ConstEvaluator` (`texo-codegen/src/consteval.rs`) wertet Ausdrücke aus, die nur aus Literalen, Top-Level-`const`s und
**reinen** Standardbibliotheksaufrufen bestehen; Aufrufe der `extern`-Klassen laufen in QuickJS mit der echten Laufzeit
(`std.js`). Alles andere ist „nicht konstant“. `@impure`-Klassen/Methoden (`State`, `Random`, `DateTime`, …) und
`@mutating` werden nie ausgewertet. Die Auswertung entscheidet, ob ein Modifier statisches CSS oder eine Laufzeitbindung
wird (siehe [UI und Styling](ui-und-styling.md#statische-und-dynamische-stile)).

### JavaScript-Erzeugung

Pro `.texo`-Datei entsteht ein ES-Modul (`package/Datei.js`):

| Texo | JavaScript |
|---|---|
| `component C(…)` | `class C extends tx.Component`; Props als Getter `get x() { return this.$p.x ? this.$p.x() : standard; }` |
| `State<T>`-Feld | `this.n = new tx.State(…)`, Zugriff über `.value` |
| `var`-Feld | `this.$f = new tx.State(…)` plus Getter/Setter `f` (daher reaktiv) |
| `data class` | Klasse mit `copy(…)`, `equals(o)` (strukturell), `toString()` |
| `object O` | `const O = new (class O { … })()` |
| `enum E` | `Object.freeze({ A: "A", …, values: () => [...] })` – Fälle sind Strings |
| `match` | geschachtelte bedingte Ausdrücke (`===` für Primitive/Enums, `std.eq` sonst) |
| `a / b` auf `Int` | `Math.trunc(a / b)` |
| `==` | `===` für Zahlen/Strings/Enums/Booleans, `std.eq(a, b)` strukturell sonst |
| `x?.f`, `??`, `!!`, `as` | `?.`, `??`, Ausdruck, Ausdruck |
| `async fn`, `await` | `async`/`await` |
| Methodenaufrufe der Stdlib | `@js`-Vorlagen, z. B. `xs.size` → `xs.length`, `s.upper()` → `s.toUpperCase()` |
| mutierende Listenmethoden auf `State`/reaktiven Feldern | `tx.mutS(state, () => state.value.push(x))` (meldet die Änderung) |
| JS-reservierte Namen | werden mit `_` suffigiert (`default` → `default_`) |

**UI-Bäume** werden *nicht* in Objekte, sondern direkt in DOM-Aufrufe übersetzt: jede Modifier-Kette wird zerlegt
(`analyze`), Stile gesammelt (`StyleSet`), und das Ergebnis sind `tx.el(tag, klassen, eltern, text)`-Aufrufe plus Bindungen.
Beispiel (gekürzt, aus `examples/spec/MetricCard.texo`):

```js
build() {
  const $n0 = tx.el("div", "tx-card tx-w-360 tx-p-24 tx-r-20 tx-bg-oyfvgu … tx-tf-none", null);
  tx.cls($n0, "tx-tf-whj56o", "tx-tf-none", () => this.isHovered.value);   // Ternär → Klassen-Umschalter
  tx.hover($n0, (entering) => this.isHovered.value = entering);
  …
  const $n6 = tx.el("span", "tx-text tx-fs-36 tx-fw-800 tx-c-ffffff", $n5);
  tx.text($n6, () => std.formatNumber(this.views.value, "en-US"));         // Bindung
  const $n8 = tx.el("button", "tx-btn tx-w-100p … tx-h-bg-4338ca tx-h-sh-10cscn", $n1, "Daten aktualisieren");
  tx.attr($n8, "type", "button");
  tx.on($n8, "click", () => this.refreshViews());
  return $n0;
}
```

## Erzeugte Ausgabe

`texo build examples/spec -o build/spec --no-hash` ergibt (ohne `--no-hash` tragen JS- und CSS-Dateien zusätzlich
einen Inhalts-Hash im Namen, siehe [unten](#ladezeit-hash-dateinamen-nachladen-tree-shaking)):

```
build/spec/
├── index.html                    Seite mit vorgerendertem HTML + hydrate()-Aufruf
├── app.css                       Reset, Basisstile, ALLE atomaren Klassen der Anwendung
├── app/dashboard/
│   ├── MetricCard.js             ES-Modul (Paket app.dashboard, Datei MetricCard.texo)
│   ├── MetricCard.css            nur die von dieser Komponente benutzten Klassen
│   └── MetricCard.html           vorgerendertes Fragment der Komponente
└── texo/                         Laufzeit
    ├── core.js                   Signale, DOM-Helfer, Hydration, Router      (~14 KB, ~6 KB gzip)
    ├── std.js                    Wertetypen und Hilfsfunktionen              (~36 KB, ~13 KB gzip)
    ├── style.js                  nur bei dynamischen Stilen                  (~27 KB, ~9 KB gzip)
    └── icons.js                  nur bei dynamischen Icon-Namen              (~9 KB, ~3 KB gzip)
```

- Die Größen gelten für den geschützten Build (Standard) und sind Obergrenzen: Er behält von der Laufzeit nur, was die
  Seiten erreichen (siehe [Code-Schutz](#code-schutz-minifizierung-und-verschleierung)); eine Aufgabenliste mit Login
  braucht z. B. `core.js` ~4 KB und `std.js` ~8 KB gzip. Mit `--no-protect` ist die Laufzeit lesbar, vollständig und
  deutlich größer (`core.js` ~37 KB, ~10 KB gzip).
- Modul- und Dateipfade folgen dem `package` (`app.dashboard` → `app/dashboard/`). Pro **Komponente** gibt es zusätzlich
  `<Name>.css` und `<Name>.html` im Verzeichnis ihres Moduls (die Dateinamen richten sich nach dem Komponentennamen, nicht
  nach dem Dateinamen: `Components.texo` mit `Badge` und `TaskRow` ergibt `Badge.css` und `TaskRow.css`).
- `app.css` ist die Datei, die die Seiten laden; die Komponenten-CSS-Dateien sind für Werkzeuge gedacht, die einzelne Komponenten
  einbetten möchten.
- `style.js` und `icons.js` werden nur geschrieben, wenn ein Modul sie braucht (dynamische Modifier-Argumente bzw.
  Icon-Namen, die erst zur Laufzeit feststehen).
- `texo build` **leert das Ausgabeverzeichnis** vor dem Schreiben und kopiert danach die Dateien aus `public/`
  (Bilder, Schriften, Cursor …) hinein – siehe [UI und Styling](ui-und-styling.md#bilder-schriften-und-andere-dateien-public).
  `texo dev` liefert `public/` und (wie bisher) Dateien neben den Quellen direkt aus.

Auszug des erzeugten HTML (`MetricCard.html`):

```html
<div id="app" data-tx-root="MetricCard">
  <div class="tx-card tx-w-360 tx-p-24 tx-r-20 tx-bg-oyfvgu tx-bdf-6dwjya tx-bd-f3kkoh tx-sh-wvftvg … tx-tf-none">
    <div class="tx-vbox tx-gap-16">
      <div class="tx-hbox tx-jc-space-between">
        <span class="tx-text tx-fs-11 tx-fw-700 tx-ls-1_2 tx-c-818cf8">LIVE ANALYTICS</span>
        <div class="tx-shape tx-w-8 tx-h-8 tx-r-50p tx-bg-22c55e tx-anim-se3pzu"></div>
      </div>
      …
```

und von `app.css`:

```css
@layer tx-reset, tx-base;
@layer tx-base {
  .tx-vbox { display: flex; flex-direction: column; min-width: 0; }
  .tx-card { display: flex; flex-direction: column; position: relative; background: #ffffff; … }
  …
}
@keyframes tx-pulse{0%,100%{opacity:1}50%{opacity:.45}}
.tx-p-24 { padding: 24px; }
.tx-bg-oyfvgu { background: linear-gradient(135deg, rgba(30, 30, 47, 0.8), rgba(18, 18, 23, 0.9)); }
.tx-bdf-6dwjya { -webkit-backdrop-filter: blur(16px);backdrop-filter: blur(16px); }
.tx-tf-whj56o { transform: scale(1.03); }
.tx-tf-none { transform: none; }
.tx-h-bg-4338ca:hover { background: #4338ca; }
```

## Atomares CSS: Klassennamen und Reihenfolge

Jede CSS-Eigenschaft eines Modifiers wird zu **einer** Klasse mit dem Muster

```
tx-[<variante>-]<kürzel>-<wert>
```

- **Kürzel**: Abkürzung der CSS-Eigenschaft (`width` → `w`, `padding-top` → `pt`, `background` → `bg`, `color` → `c`,
  `font-size` → `fs`, `border-radius` → `r`, `box-shadow` → `sh`, `transform` → `tf`, `justify-content` → `jc`, …; unbekannte
  Eigenschaften behalten ihren Namen, z. B. `tx-mix-blend-mode-multiply`).
- **Wert (Slug)**: Kurze, einfache Werte werden lesbar eingesetzt – in Kleinbuchstaben, `#` entfernt, `px` abgeschnitten,
  `%` → `p`, `.` → `_`, Leerzeichen → `_`, führendes `-` → `n` (`360px` → `360`, `#6366f1` → `6366f1`, `1.2px` → `1_2`,
  `50%` → `50p`, `8px 12px` → `8_12`, `-2px` → `n2`). Alles andere (Verläufe, Schatten, längere Werte, Sonderzeichen) wird zu
  einem **6-stelligen Hash** (FNV-1a, base36): `tx-bg-oyfvgu`.
- **Variante**: `h` (hover), `f` (focus), `fw` (focus-within), `a` (active), `dis` (disabled), `ph` (placeholder), `dk`
  (dark), `sm`/`md`/`lg`/`xl`, `pr` (print); verschachtelte werden mit `-` verbunden: `tx-dk-h-bg-1e293b`.
- Herstellerpräfixe (`-webkit-backdrop-filter`) werden mit der Standardeigenschaft in **einer** Klasse zusammengefasst.
- Gleiche Klasse = gleiche Regel: `tx-p-16` steht in `app.css` genau einmal, egal, wie oft sie benutzt wird. Das CSS wächst
  mit der Zahl **verschiedener** Eigenschaft-Wert-Paare, nicht mit der Größe der Anwendung.

**Reihenfolge im Stylesheet** (damit „spätere gewinnt“ korrekt funktioniert): `@keyframes` zuerst; dann nach Gewicht
`Media-Reihenfolge (dark < sm < md < lg < xl < print) × 100 + Pseudo-Reihenfolge (hover < focus < focus-within < active <
disabled < placeholder) × 10 + (Kurzschreibweise vor Einzelwert)`; innerhalb gleicher Gewichte in Reihenfolge der ersten
Verwendung. So überschreibt `padding-top` ein `padding`, `:hover` den Basiswert und `md` den Basiswert, ohne
Spezifitätskämpfe.

Mit `--minify` (bzw. `"minify": true`) wird das Stylesheet ohne Leerraum und Kommentare ausgegeben.

## CSS-Schichten

Reset und Basisstile der Elemente liegen in **CSS Cascade Layers**, die atomaren Klassen bewusst *außerhalb* (ungeschichtet):

```css
@layer tx-reset, tx-base, tx-global;
@layer tx-reset  { *, *::before, *::after { box-sizing: border-box; } body { margin: 0; … } … }
@layer tx-base   { .tx-card { … } .tx-btn { background: var(--tx-primary); … } … }
@layer tx-global { html { cursor: url("pfeil.png") 2 2, default; } :root { --tx-primary: #059669; } … }  /* @Global */
.tx-w-360 { width: 360px; }          /* ungeschichtet → schlägt immer die Schichten */
```

Ungeschichtete Regeln gewinnen gegen jede Schicht – unabhängig von der Spezifität. Ein Modifier überschreibt daher immer den
Basisstil des Elements (`Card().padding(8.px)` schlägt `.tx-card { padding: 20px }`), und die Basis muss nie „höher“ gewichtet
werden. Außerdem erlaubt das `display: revert-layer`: `.hidden(false)` fällt auf das `display` der Basisschicht zurück
(z. B. `flex` bei Stacks), statt einen festen Wert zu erzwingen. Es werden nur die Basisstile ausgegeben, deren Elemente
tatsächlich vorkommen (`app.css`: global, `<Komponente>.css`: pro Komponente).

Die Schicht `tx-global` enthält die [globalen Stile](ui-und-styling.md#globale-stile-global) aus `@Global`-Konstanten
(nur in `app.css`). Sie liegt über Reset und Basis, aber unter den Modifiern. Die Hauptfarbe der eingebauten Elemente ist
die CSS-Variable `--tx-primary` (Standard `#4f46e5`), abgeleitete Töne (Fokus-Rahmen, Schatten) entstehen mit `color-mix()`
– ältere Browser bekommen eine feste Ersatzfarbe.

Die Basisstile im Überblick: `tx-vbox`/`tx-hbox` (Flexbox, `min-width: 0`), `tx-zstack` (Grid-Stapel), `tx-box`, `tx-grid`
(2 Spalten, unter 640 px eine; 16 px Abstand), `tx-fit` (feste Breiten ab 200 px: `max-width: 100%`), `tx-table` (scrollt
unter 640 px waagrecht), `tx-card` (Weiß, 16 px Radius, 20 px Innenabstand, leichter Schatten), `tx-heading` (+ `tx-h1`…`tx-h6`),
`tx-btn` (Hauptfarbe, 10 px Radius, Hover-/Aktiv-/Fokus-/Disabled-Zustände), `tx-input`, `tx-check`/`tx-switch`, `tx-slider`,
`tx-spacer`, `tx-divider`, `tx-link`, `tx-scroll`, `tx-progress`, `tx-spinner`, `tx-icon`, `tx-img`, `tx-shape`, `tx-contents`
(`display: contents`, Hülle für Listen).

## Server-Rendering über Mini-DOM

`minidom.js` (in `crates/texo-stdlib/runtime/`) implementiert genau die DOM-Teilmenge, die die Laufzeit nutzt (Elemente,
Text, Kommentare, Attribute, `classList`, Ereignisse, `serialize`). Zum Vorrendern lädt der Compiler die erzeugten
Module in die eingebettete JS-Engine und macht für jede Seite:

1. `core.setDocument(new MDocument(), true)` – die Laufzeit schaltet in den Server-Modus (`isServer`: keine Ereignisse, kein
   `onMount`);
2. `core.mount(Komponente, <div id="app" data-tx-root="Name">)` und serialisieren;
3. Regeln dynamischer Stile (`style.takeSsrCss()`) als `<style id="tx-ssr">` in die Seite einfügen.

Schlägt das für eine Komponente fehl, entsteht eine Warnung („Server-Rendering übersprungen: …“), und die Seite enthält
nur einen leeren `<div id="app">` – sie wird dann im Browser gerendert. Der Browser ruft `hydrate()` auf, siehe
[Reaktivität und Routing](reaktivitaet.md#server-rendering-und-hydration).

## Seiten und Einstiegspunkte

Eine Komponente wird zur Seite durch `@Page(title:, path:, lang:, description:)` (alle Argumente konstant):

| Argument | Standard | Wirkung |
|---|---|---|
| `title` | Komponentenname | `<title>` |
| `path` | `index.html` für die erste/Index-Seite, sonst `kebab-case-name.html` | Ausgabedatei. `"docs/"` → `docs/index.html`; ohne `.html` wird es ergänzt; relative Pfade zu `app.css`, Laufzeit und Modul werden automatisch gesetzt |
| `lang` | `de` | `<html lang>` |
| `description` | – | `<meta name="description">` |

Auswahl der Seiten:

1. `--entry Name` (oder `"entry"` in `texo.json`) macht diese Komponente zu `index.html`; weitere `@Page`-Komponenten
   kommen hinzu.
2. Sonst alle `@Page`-Komponenten; die erste wird zu `index.html`, falls keine ausdrücklich `path: "index.html"` (oder `"/"`) hat.
3. Ohne `@Page`: die Komponente `App`, sonst `Main`, sonst die erste Komponente ohne Pflicht-Eigenschaften → `index.html`.

Eine Seite darf keine Pflicht-Eigenschaften haben, und zwei Seiten dürfen nicht denselben Pfad belegen.

```texo
@Page(title: "Start", path: "index.html", lang: "de", description: "Willkommen")
public component Start {
    fn build(): View => Link("Über uns", to: "about.html")
}

@Page(title: "Über uns", path: "about.html")
public component Ueber {
    fn build(): View => Text("Über uns")
}
```

## Kommandozeile und texo.json

Installation: siehe [README](installation.md); aus dem Quellcode `cargo build --release`, danach liegt das
Programm unter `target/release/texo`. `texo --help` listet alle Befehle, `texo <befehl> --help` zeigt die Optionen eines
Befehls; unbekannte Optionen brechen mit einem Vorschlag ab.

| Befehl | Wirkung |
|---|---|
| `texo build [pfad] [-o ausgabe] [--entry Name] [--protect obfuscate\|minify\|none] [--no-protect] [--no-ssr] [--no-hash] [--backend …] [--docker]` | kompiliert nach `ausgabe` (Standard: `dist`), Browser-Code standardmäßig verschleiert, Dateinamen mit Inhalts-Hash; `--docker` schreibt dazu `Dockerfile` und `.dockerignore` ([Docker](docker.md)); Exit-Code 1 bei Fehlern |
| `texo container [stop\|logs\|status] [--engine docker\|podman] [--start\|--no-start]` | fragt nach dem Containerdienst (Docker oder Podman, gemerkt in texo.json `container`), baut mit `--docker` und schreibt `container/compose.yaml` samt `container/.env` (Datenbank, Valkey, Mailpit, Volumes nach Bedarf); startet auf Wunsch gleich und wartet auf den Health-Check. `stop`, `logs`, `status` reichen an `compose down`, `logs -f`, `ps` weiter ([Docker](docker.md#texo-container)) |
| `texo check [pfad]` | nur Typprüfung, schreibt nichts |
| `texo responsive [pfade…] [--write] [--check]` | sucht Stellen, die auf dem Handy zu breit oder zu groß werden (große Schriften und Abstände ohne Breakpoint, Grids ab 3 Spalten, lange `Row`s ohne Umbruch, zu große Mindestbreiten), zeigt je Fund alte und neue Zeile; `--write` schreibt die eindeutigen Fälle auf mobile-first um, `--check` endet bei Funden mit Exit-Code 1 ([UI und Styling](ui-und-styling.md#schmale-bildschirme)) |
| `texo fmt [pfade…] [--check]` | formatiert `.texo`-Dateien einheitlich (ohne Pfade: `src` aus `texo.json` und `tests/`, ohne Projekt der aktuelle Ordner); `--check` ändert nichts, listet abweichende Dateien und endet dann mit Exit-Code 1; Dateien mit Syntaxfehlern bleiben unverändert (Alias: `format`) |
| `texo dev [pfad] [-o ausgabe] [--port 3000] [--host [adresse]]` | Dev-Server mit Live-Reload (Server-Sent Events); Fehler erscheinen als Overlay-Seite im Browser. Nur auf diesem Rechner erreichbar (`127.0.0.1`); `--host` öffnet ihn fürs Netz, etwa zum Testen am Handy |
| `texo serve [ordner] [--port 3000]` | liefert einen Ordner statisch aus (z. B. nach `build`) |
| `texo start [dist]` | startet eine mit Backend `texo` gebaute Anwendung im nativen Server (dasselbe wie `texo-server dist/server/app.json`); Node.js, Bun und Deno startet man mit `cd dist && npm start` – [Backend und Sicherheit](backend.md) |
| `texo init [ordner] [--example start\|website\|api\|aufgaben\|chat\|umfrage] [--backend node\|texo\|bun\|deno\|static] [--db sqlite\|postgres\|mysql\|mongodb\|none] [--kv valkey\|none] [--no-install]` | legt ein Projekt an, immer mit `src/server/` (Server-Code), `src/pages/` (Seiten), `src/components/` (Bausteine) und `tests/`. Beispiele: `start` (ohne Backend das Startprojekt aus `examples/starter`, mit Backend ein Zähler auf dem Server, mit Datenbank in einer Tabelle), `website` (mehrere Seiten mit Navigation), `api` (nur Backend ohne Webseite: Notizen-API mit `@Public`, ohne `src/pages/`, `src/components/` und `public/`; braucht ein Backend), `aufgaben` (Registrieren, Anmelden mit `@Auth`, eigene Aufgaben; braucht Backend und Datenbank), `chat` (braucht Backend und Datenbank), `umfrage` (Live-Umfrage mit `Kv`; braucht ein Backend). Mit Datenbank dazu `.env`, `docker-compose.yml`, Treiber – [Datenbanken](datenbank.md); mit `--kv valkey` `TEXO_KV_URL` in `.env` und ein Valkey-Dienst in `docker-compose.yml` – [Backend und Sicherheit](backend.md#valkey-bei-texo-init) |
| `texo remove [ordner] [-y] [--dry-run]` | löscht ein versehentlich angelegtes Projekt: zeigt, was gelöscht wird, und fragt nach; bei mehreren Projekten im Ordner wird gefragt, welches. Nur Ordner mit `texo.json` gelten als Projekt; fremde Dateien bleiben erhalten (Alias: `delete`, `uninstall`, `rm`) |
| `texo init [ordner] --library` | legt ein Bibliotheksprojekt an (`src/` = Bibliothek, `demo/` = Vorschau), siehe [Bibliotheken](bibliotheken.md) |
| `texo lib pack\|add\|update\|outdated\|search\|publish\|keygen\|diff\|docs\|list\|info\|remove` | vorkompilierte Bibliotheken (`.texolib`) bauen, signieren, veröffentlichen, einbinden und aktualisieren – [Bibliotheken](bibliotheken.md) |
| `texo test [filter]` | führt die `@Test`-Funktionen aus `tests/` aus (ohne Browser), Exit-Code 1 bei Fehlschlägen – [Testen](testen.md) |
| `texo add npm <paket…> [--server] [--no-bridge]` | installiert npm-Pakete (plus esbuild) und legt Brücken in `src/npm/` an, mit TypeScript-Typen typisiert – [npm-Pakete](npm.md) |
| `texo add framework <name>` | installiert die Adapter aus texo-frameworks und das JavaScript-Framework (react, preact, vue, svelte, svelte4, solid, dom) für `extern component` – [JS-Frameworks](js-frameworks.md) |
| `texo upgrade [--check] [--version tag] [--project-only] [--no-project]` | aktualisiert Texo auf das neueste (oder gewählte) Release – Programmdatei mit Prüfsumme bzw. npm-Paket – und danach das Projekt im aktuellen Ordner (`"texo"` in `texo.json`, Projekt-Anpassungen, `texo check`); Alias `texo update` |
| `texo version` | installierte Version mit Build-Nummer (`0.1.0-build.42`) |
| `texo db migrate [name] [--create-only] [-y]` | legt aus geänderten `@Table`-Klassen eine Migration in `migrations/` an und wendet ausstehende an – [Datenbanken](datenbank.md#migrationen) |
| `texo db status` | angewendete und ausstehende Migrationen, Änderungen ohne Migration |
| `texo db seed [funktion]` | ruft die `@Seed`-Funktionen auf (Beispieldaten) |
| `texo db studio [--port 4983]` | Tabellen im Browser ansehen und bearbeiten (nur lokal) |
| `texo env check [datei]` | prüft `.env` (oder `datei`) gegen die `@Config`-Klassen, ohne den Server zu starten – [Backend und Sicherheit](backend.md#konfiguration-config-und-geheimnisse-secret) |
| `texo env example` | schreibt `.env.example` mit allen Variablen der `@Config`-Klassen und ihren Kommentaren |
| `texo lsp` | startet den Sprachserver (Language Server Protocol über stdio) für VS Code, WebStorm, IntelliJ, Neovim, Zed … |
| `texo lex <datei> [--json]`, `texo parse <datei> [--json]` | Tokens bzw. Syntaxbaum einer Datei (zur Fehlersuche im Compiler) |

- `pfad` ist ein Ordner (alle `.texo`-Dateien rekursiv; `node_modules`, `dist`, `build` und versteckte Ordner werden
  übersprungen) oder eine einzelne Datei. Ohne `pfad` wird `texo.json` gelesen.
- Optionen akzeptieren `--port 4000` und `--port=4000`. Ist der Port belegt, probiert `dev`/`serve` den nächsten.
- `dev` kompiliert bei jeder Änderung neu (die Verzeichnisse werden überwacht, nicht einzelne Dateien – Editoren, die per
  Umbenennen speichern, funktionieren), hält das Ergebnis im Speicher, schreibt es auch nach `out` und lädt offene Tabs neu.
  Dateien, die nicht vom Compiler stammen, werden aus dem Quellordner ausgeliefert.

### texo.json

```json
{
  "src": "src",
  "out": "dist",
  "entry": "App",
  "minify": false,
  "ssr": true,
  "protect": "obfuscate"
}
```

| Schlüssel | Standard | Bedeutung |
|---|---|---|
| `src` | `src` | Quellordner oder -datei |
| `out` | `dist` | Ausgabeordner (wird vor jedem Build geleert) |
| `entry` | – | Einstiegskomponente für `index.html` |
| `backend` | `"static"` | `texo`, `node`, `bun`, `deno` oder `static` – [Backend und Sicherheit](backend.md) |
| `minify` | `false` | CSS minifizieren (bei `texo build` mit Code-Schutz immer an) |
| `ssr` | `true` | Pre-Rendering zur Compile-Zeit |
| `routing` | `"hash"` | Adressen des Routers: `hash` (`#/pfad`, läuft auf jedem Host) oder `path` (`/pfad`, die Server liefern dafür die Startseite) – [Reaktivität und Routing](reaktivitaet.md#echte-adressen-statt-) |
| `protect` | `"obfuscate"` | Code-Schutz von `texo build`: `obfuscate`, `minify` oder `none` |
| `public` | `"public"` | Ordner mit statischen Dateien, die unverändert in die Ausgabe kopiert werden |
| `libraries` | – | eingebundene Bibliotheken: Name → Paketdatei (`"ui_kit": "texo_libs/ui_kit-1.0.0.texolib"`), gepflegt von `texo lib add/update/remove`; Versionen, Prüfsummen und Schlüssel stehen in `texo.lock` |
| `registry` | – | Registry für `texo lib add name`, `update`, `outdated`, `search`: Ordner oder `https://…` (auch `--registry` oder `TEXO_REGISTRY`) |
| `library` | – | macht das Projekt zur Bibliothek: `name`, `version`, `description`, `license`, `author` (für `texo lib pack`) |
| `tests` | `"tests"` | Ordner mit Testdateien für `texo test` |
| `docker` | `false` | `texo build` schreibt `Dockerfile` und `.dockerignore` in den Ausgabeordner (wie `--docker`) – [Docker](docker.md) |
| `container` | – | Containerdienst für `texo container`: `"docker"` oder `"podman"` (setzt `texo container` bei der ersten Auswahl) |
| `hashNames` | `true` | `texo build`: Inhalts-Hash in den Namen von JS- und CSS-Dateien (für dauerhaftes Caching) |
| `texo` | – | Texo-Version, mit der das Projekt zuletzt benutzt wurde (setzen `texo init` und `texo upgrade`); ist sie neuer als die installierte, weist `texo build` auf `texo upgrade` hin |
| `database` | SQLite in `data/app.db` | Texo Data: `{ "type": "sqlite" \| "postgres" \| "mysql" \| "mongodb" \| "memory", "url": "env:DATABASE_URL", "autoCreate": true }` – [Datenbanken](datenbank.md) |
| `cluster` | – | mehrere Instanzen der App teilen sich Kanäle (`shared: true`), Session-Sperren und Live-Abfragen über die Datenbank: `{ "bus": "database" }` (braucht `database`) – [Backend und Sicherheit](backend.md#mehrere-instanzen-cluster) |
| `demo` | `"demo"` | nur Bibliotheksprojekte: Ordner mit Vorschauseiten, die `texo dev/build/check` mitkompilieren, die aber nicht ins Paket kommen |

Kommandozeilenoptionen überschreiben `texo.json`. Ein ungültiges JSON ergibt `texo.json ist ungültig: …`.

## Code-Schutz (Minifizierung und Verschleierung)

`texo build` liefert den Browser-Code standardmäßig **minifiziert und verschleiert** aus. `texo dev` bleibt lesbar,
damit Fehlermeldungen und Debugger verständlich sind.

| Stufe | Was passiert |
|---|---|
| `obfuscate` (Standard) | alles aus `minify`, dazu: Exportnamen werden in allen Modulen auf Kurznamen umbenannt (`MetricCard` → `T`); alle Strings und Eigenschaftsnamen des App-Codes wandern in eine XOR-verschlüsselte String-Tabelle, die beim ersten Zugriff entschlüsselt wird (`this.views.value += 100` → `this[b(3)][b(7)]+=100`) |
| `minify` | Minifier von [oxc](https://oxc.rs): Leerraum und Kommentare entfernt, lokale Namen gekürzt, Ausdrücke vereinfacht; CSS minifiziert |
| `none` | lesbare Ausgabe wie bei `texo dev` |

```sh
texo build                      # = --protect obfuscate
texo build --protect minify     # nur minifizieren
texo build --no-protect         # lesbar (zum Debuggen eines Produktions-Builds)
```

Code aus vorkompilierten [Bibliotheken](bibliotheken.md) ist bereits beim Packen verschleiert worden. Er greift auf die
Laufzeit über verschlüsselte Namen zu; deshalb behalten die Exporte der Laufzeit in Projekten mit Bibliotheken ihre
Namen, alle übrigen Exporte werden weiterhin umbenannt.

Betroffen sind nur Dateien, die der Browser erhält: die Module, die Laufzeit unter `texo/` (minifiziert, Exporte
umbenannt; ihre Strings bleiben im Klartext, weil sie quelloffen ist und in jedem Render-Pfad läuft) und die
`<script type="module">`-Blöcke der Seiten.

**Nur benötigter Laufzeit-Code (Tree-Shaking).** Bei `minify` und `obfuscate` entfernt der Build aus `texo/*.js`
alles, was weder die App noch eine Seite noch ein anderes Laufzeitmodul benutzt: Wer keine Passkeys, Uploads oder
Übergänge verwendet, lädt deren Code nicht. Der App-Code selbst bleibt vollständig. Greift Code über berechnete Namen
auf die Laufzeit zu (vorkompilierte Bibliotheken) oder lädt sie mit `import(…)`, bleibt das betroffene Modul ganz. Der Server-Code unter `server/` wird nie ausgeliefert und bleibt
unverändert. Source Maps werden nicht erzeugt. Die Hashes der Content-Security-Policy berechnet der Server aus den
ausgelieferten Seiten, sie passen also auch zu verschleierten Skripten.

Der Build gibt aus, wie viele Dateien geschützt wurden und wie sich die Größe ändert (typisch etwa −35 %):

```
✔ 1 Komponente(n) kompiliert in 38 ms → dist/
  Code-Schutz: minifiziert + verschleiert – 4 Browser-Datei(en), 97.7 KB → 52.1 KB
```

> **Wichtig:** Verschleierung erschwert das Lesen und Kopieren, ist aber **kein Schutz für Geheimnisse**. Alles, was
> der Browser ausführt, kann mit genug Aufwand rekonstruiert werden. Passwörter, API-Schlüssel, Preislogik oder
> Berechtigungsprüfungen gehören deshalb in einen `service` bzw. eine `@Server`-Funktion. Der Typprüfer erzwingt
> diese Trennung: Server-Code (`texo.server`, `@Server`, Service-Interna) gelangt nie in den Browser-Code.
> Siehe [Backend und Sicherheit](backend.md).

## Ladezeit: Hash-Dateinamen, Nachladen, Tree-Shaking

**Dateinamen mit Inhalts-Hash.** `texo build` hängt an jedes JavaScript-Modul und an `app.css` einen Hash ihres
Inhalts an (`app/App.3a819efa5f.js`, `app.5b2c57fc33.css`). Alle Importe, `import()`-Aufrufe und Verweise in den
Seiten werden angepasst. Eine Datei bekommt nur dann einen neuen Namen, wenn sich ihr Inhalt oder der eines Moduls
ändert, das sie importiert. Deshalb dürfen Browser und CDNs die Dateien unbegrenzt cachen. Der eingebaute Server
schickt für sie `Cache-Control: public, max-age=31536000, immutable`. Die Seiten selbst (`.html`) behalten ihre
Namen und werden bei jedem Besuch neu geprüft. Dabei hilft ein `ETag`: Ist die Seite unverändert, antwortet der Server
mit `304` ohne Inhalt. Textdateien ab 1 KB (HTML, JavaScript, CSS, JSON, SVG) schickt er gzip-komprimiert, wenn der
Browser das annimmt. Geschützte Seiten (mit `@Guard`) bekommen keinen `ETag`. Abschalten: `texo build --no-hash` oder `"hashNames": false` in der
`texo.json`. `texo dev` arbeitet immer ohne Hashes.

**Nachladen mit `Lazy`.** Große Teile einer Seite (Diagramme, Editoren, Karten) lädt der Browser erst, wenn sie
gebraucht werden ([Details](reaktivitaet.md#nachladen-mit-lazy)). Die Komponente bleibt in ihrer eigenen Datei und
wird nicht statisch importiert. Beim Vorrendern erscheint der Platzhalter.

**Tree-Shaking.** Ausgeliefert werden nur die Module, die eine Seite (auch über `Lazy`) erreicht. Bei
[Bibliotheken](bibliotheken.md) geht es feiner: Aus jedem Bibliotheksmodul werden nur die benutzten Exporte
übernommen. Beim Minifizieren (`texo build`) fallen Klassen und Funktionen weg, die niemand braucht. Bibliotheken
markieren ihre Klassen dafür beim Packen als nebenwirkungsfrei.

## Den Compiler einbetten

`texo-compiler` ist eine Rust-Bibliothek ohne Dateisystem-Zugriff: `compile(&[SourceInput], &CompileOptions) ->
CompileResult` bekommt die Quelltexte (`path`, `text`) und liefert Diagnosen, die Ausgabedateien als Pfad → Inhalt
(`files`, dazu `binary_files` für Dateien aus Bibliotheken), die erzeugten Module, Komponenten und Seiten
(`component`, `file`, `title`). Die wichtigsten Optionen in `CompileOptions` entsprechen der Kommandozeile: `entry`,
`ssr`, `minify`, `runtime` (Laufzeit nach `runtime_dir`, Standard `texo/`, kopieren), `check_only`, `inject_html`
(HTML vor `</body>`, z. B. Live-Reload), `backend`, `libraries`. Lesen und Schreiben der Dateien, `texo.json`, der
Code-Schutz (`texo-protect`) und das Umbenennen mit Inhalts-Hash (`texo_compiler::hashnames`) erledigt `texo-cli` nach
`compile()`.

Für JavaScript gibt es den Compiler als WebAssembly-Modul (`crates/texo-wasm`, so nutzt ihn der Playground): Eingabe
`{"sources": [{"path", "text"}], "ssr": bool}` als JSON, Antwort `{"ok", "diagnostics": [{"severity", "text"}],
"files": [[pfad, inhalt]], "pages": [{"component", "file", "title"}]}`. Laden und Aufruf zeigt
`playground/src/texo-wasm.ts`.

## Tests und Entwicklung

```sh
cargo build --release              # target/release/texo und target/release/texo-server
cargo test --workspace             # Tests aller Crates (Lexer, Parser, Typprüfer, Übersetzung, Server, Sprachserver …)
node tests/e2e/browser.mjs         # Playwright: baut die Beispiele mit target/release/texo, bedient sie in Chromium
```

Die Snapshot-Skripte unter `scripts/snapshots/` vergleichen die Ausgabe von `texo` (erzeugte Dateien, Meldungen,
Befehle) mit gespeicherten Ständen. Weitere E2E-Tests: `tests/e2e/fullstack.mjs` (Full-Stack mit jedem installierten
Backend) und `tests/e2e/db-runtimes.mjs` (Texo Data unter Node, Bun und Deno); `TEXO_BIN` wählt ein anderes Programm.
Die CI (Woodpecker, `.woodpecker/rust.yaml` und `.woodpecker/rust-node.yaml`) führt die Suiten aus.

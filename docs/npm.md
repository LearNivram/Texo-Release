<!-- Übernommen aus LearNivram/Texo (docs/npm.md) mit scripts/docs-uebernehmen.mjs – bitte dort ändern. -->

# npm-Pakete benutzen

Texo-Code kann jedes npm-Paket benutzen: Datumsbibliotheken, Diagramme, Markdown-Parser, Zahlungsanbieter.
Dazu schreibst du eine **Brücke**. Das ist eine `extern`-Deklaration mit `@npm("paket")`, die dem Typprüfer sagt,
welche Funktionen und Klassen das Paket hat und welche Typen sie verwenden. Der Rest geht automatisch:

- **Im Browser** bündelt Texo das Paket mit esbuild nach `texo/vendor/<paket>.js`. Gemeinsamer Code landet in
  gemeinsamen Teilen, und nur Pakete, die der Browser-Code wirklich benutzt, werden ausgeliefert.
- **Auf dem Server** (Services) wird das Paket direkt importiert. Unter Deno geschieht das mit `npm:`. Es steht in den
  `dependencies` der erzeugten `dist/package.json`.
- **Beim Vorrendern** benutzt der Compiler das echte Paket aus `node_modules`. Läuft es nur im Browser, rendert er mit
  einem Platzhalter vor.

## In drei Schritten

```
$ texo add npm dayjs
$ npm install dayjs
✔ dayjs installiert
  src/npm/Dayjs.texo ← Brücke angelegt: Typen eintragen, dann im Code benutzen
```

`texo add npm` installiert das Paket mit dem Paketmanager des Projekts (npm, pnpm, yarn oder bun) und beim ersten Mal
auch esbuild. Danach legt es die Brücke an. Bringt das Paket TypeScript-Typen mit (oder gibt es `@types/<paket>`),
übersetzt Texo sie in echte Texo-Typen, React-Komponenten darin als
[`extern component`](js-frameworks.md#brücken-aus-typescript-typen). Sonst untersucht es die Exporte des Pakets, und
als Typen stehen zunächst `Any`. Prüfe die Brücke, trage fehlende Typen ein und lösche, was du nicht brauchst:

```texo
package app

/// Datum lesen und formatieren – https://day.js.org
@npm("dayjs", name: "default")
extern fn dayjs(datum: String): DayJs

@npm("dayjs")
extern class DayJs {
    fn format(muster: String): String
    fn add(anzahl: Int, einheit: String): DayJs
    fn isBefore(anderes: DayJs): Boolean
}

@npm("nanoid")
extern fn nanoid(laenge: Int = 21): String
```

Ab jetzt sind das normale, typgeprüfte Texo-Funktionen. Sie funktionieren im Browser und in Services:

```texo
// src/App.texo – benutzt die Brücke von oben
package app

import texo.ui.*
import texo.server.*

service Termine {
    fn morgen(datum: String): String => dayjs(datum).add(1, "day").format("DD.MM.YYYY")
}

@Page(title: "Termine")
component App {
    private State<String> ergebnis = State("")

    fn build(): View => Column(spacing: 8.px, [
        Text("Heute: ${dayjs("2024-05-01").format("DD.MM.YYYY")}"),
        Text("Neue ID: ${nanoid(8)}"),
        Button("Morgen?").onClick(async () => this.ergebnis.value = await Termine.morgen("2024-05-01")),
        Text(this.ergebnis.value)
    ])
}
```

## Die Brücke

| Schreibweise | bedeutet |
|---|---|
| `@npm("paket") extern fn name(…): T` | der Export `name` des Pakets |
| `@npm("paket", name: "default") extern fn x(…): T` | der Default-Export (bei CommonJS: `module.exports`) |
| `@npm("paket") extern class K { … }` | die exportierte Klasse `K`: `K(…)` erzeugt mit `new`, Methoden, Felder, `static fn` |
| `@npm("paket/unterpfad")` | ein Unterpfad des Pakets, z. B. `@npm("lodash/debounce", name: "default")` |
| `@npm("@firma/paket")` | Pakete mit Scope |

Eine Klasse, die nur als Typ dient (z. B. das Ergebnis von `dayjs(…)`), deklarierst du ebenfalls mit `@npm`. Sie
wird nur importiert, wenn der Code sie als Wert benutzt, also mit `DayJs(…)` oder einem statischen Aufruf.

- Asynchrone Funktionen geben `Future<T>` zurück, das du mit `await` auswertest:
  `@npm("marked") extern fn parse(markdown: String): Future<String>`.
- Rückrufe sind Funktionstypen: `extern fn debounce(aktion: () => Void, ms: Int): () => Void`.
- Optionen-Objekte übergibst du als `Map<String, Any>`, z. B. `["responsive": true]`. Das Paket bekommt sie als
  einfaches JavaScript-Objekt (`{ responsive: true }`), auch verschachtelt und in Listen.
- `...args: Any` nimmt beliebig viele Argumente.

Der Typprüfer verlässt sich auf die Brücke. Stimmt sie nicht mit dem Paket überein, fällt das erst zur Laufzeit auf.

Fertige UI-Komponenten aus React, Vue, Svelte, Solid, Preact oder Web Components bindest du als `extern component`
ein, siehe [JavaScript-Frameworks](js-frameworks.md).

## Regeln und Fehlermeldungen

- Ohne Herkunft gibt es kein `extern`: Jede `extern class` und jede `extern fn` braucht `@npm("…")` oder `@js("…")`.
- Der Paketname muss als Text dastehen (`@npm("nanoid")`). Weitere Argumente außer `name:` gibt es nicht.
- Fehlt ein Paket in `node_modules`, bricht `texo build` mit
  `npm-Paket(e) nicht installiert: … – installiere sie mit 'npm install …'` ab.
- Für den Browser braucht Texo esbuild im Projekt (`npm install -D esbuild`). `texo add npm` installiert es mit.
  `texo add npm paket --server` lässt esbuild weg, wenn das Paket nur in Services benutzt wird.
- `texo add npm paket --no-bridge` installiert nur und legt keine Brücke an.

## Produktion

`texo build` schreibt die Browser-Bündel nach `dist/public/texo/vendor/` (bzw. `dist/texo/vendor/` bei statischen
Seiten). Sie bekommen Hash-Dateinamen wie der restliche Code, werden aber nicht verschleiert, weil esbuild sie bereits
minifiziert. Für das Backend stehen die Pakete in `dist/package.json`. Auf dem Server reicht deshalb:

```
cd dist && npm install --omit=dev && npm start
```

## In Bibliotheken

Bibliotheken dürfen Brücken enthalten. `texo lib pack` vermerkt die benutzten npm-Pakete samt Version (aus der
`package.json` der Bibliothek) im Paket. Wer die Bibliothek einbindet, bekommt einen Hinweis, falls ein Paket fehlt:

```
Hinweis: Bibliothek diagramme braucht das npm-Paket chart.js (^4.4.0) – installiere es mit: texo add npm chart.js@^4.4.0 --no-bridge
```

<!-- Übernommen aus LearNivram/Texo (docs/js-frameworks.md) mit scripts/docs-uebernehmen.mjs – bitte dort ändern. -->

# JavaScript-Frameworks einbinden: `extern component`

Texo-Seiten können fertige Komponenten aus **React, Preact, Vue, Svelte und Solid** sowie **Web Components** benutzen,
etwa einen Datumswähler, eine Karte, einen Editor oder ein Diagramm aus npm. Ein **Adapter** aus npm verbindet Texo mit
dem Framework: die für React, Preact, Vue, Svelte, Solid und DOM-Funktionen liegen im Paket
[texo-frameworks](https://github.com/LearNivram/texo-frameworks), für jedes andere Framework schreibst du einen kleinen
eigenen. Der Texo-Kern selbst kennt kein Framework. Die Komponente bleibt JavaScript. Texo beschreibt nur ihre Eigenschaften, prüft beim Aufruf
die Typen und gibt ihr bei jeder Änderung eines `State` die neuen Werte.

```
$ texo add framework react
$ texo add npm react-colorful
✔ react-colorful installiert
  src/npm/ReactColorful.texo ← Brücke aus den TypeScript-Typen angelegt: prüfen, dann benutzen
  React-Komponenten: HexColorPicker, HexColorInput, …
```

```texo
package app

import texo.ui.*
import texo.graphics.*

/// Farbwähler aus dem npm-Paket react-colorful (React)
@npm("react-colorful", name: "HexColorPicker")
@framework(adapter: "texo-frameworks/react")
extern component FarbWahl(color: String, onChange: ((String) => Void)? = null)

@Page(title: "Farbe")
component App {
    private State<String> farbe = State("#6366f1")

    fn build(): View => Column(spacing: 12.px, [
        FarbWahl(color: this.farbe.value, onChange: f => this.farbe.value = f).width(220.px),
        Text("Gewählt: ${this.farbe.value}").textColor(Color.Slate600)
    ])
}
```

`FarbWahl(…)` ist ab jetzt eine normale Ansicht: Sie steht in Spalten und Listen, nimmt Modifier wie `.width(…)`,
`.padding(…)` oder `.testId(…)` an und verschwindet mit `If(…)`, wobei React sauber abgebaut wird.

## Inhalt

1. [Eine Komponente beschreiben](#eine-komponente-beschreiben)
2. [Die Adapter aus texo-frameworks](#die-adapter-aus-texo-frameworks)
3. [Web Components](#web-components)
4. [Eigene Adapter für jedes andere Framework](#eigene-adapter-für-jedes-andere-framework)
5. [Brücken aus TypeScript-Typen](#brücken-aus-typescript-typen)
6. [Wie es funktioniert](#wie-es-funktioniert)
7. [Grenzen](#grenzen)

## Eine Komponente beschreiben

```
@npm("<paket>", name: "<export>")      // woher die Komponente kommt (wie bei npm-Brücken)
@framework(adapter: "<adapter-paket>") // wer sie zeichnet, z. B. "texo-frameworks/react"
extern component Name(<eigenschaften>)
```

Die Parameter sind die Eigenschaften (Props) der Komponente. Für sie gelten dieselben Regeln wie für Texo-Komponenten:

| Schreibweise | bedeutet |
|---|---|
| `titel: String` | Pflicht-Eigenschaft, beim Aufruf typgeprüft |
| `groesse: Int = 200` | mit Standardwert; der Wert wird mitgegeben, wenn der Aufrufer nichts angibt |
| `farbe: String? = null` | darf fehlen; ohne Wert gibt Texo die Eigenschaft gar nicht weiter (`undefined`) |
| `onChange: (String) => Void` | Rückruf: Texo-Lambdas werden zu JavaScript-Funktionen |
| `@prop("className") klasse: String` | anderer Name in JavaScript, auch für Namen wie `onUpdate:modelValue` |

Werte kommen so an, wie JavaScript sie erwartet: Texte, Zahlen, Wahrheitswerte und Listen unverändert, `Map<String, …>`
als einfaches Objekt (auch verschachtelt), Datenklassen als Objekte mit ihren Feldern. Sobald ein `State`, den ein
Aufruf liest, sich ändert, bekommt die Komponente alle Eigenschaften neu, genau wie bei einem Re-Render in React.

Eine `extern component` hat keinen Rumpf, keine Typparameter und keine `var`-Eigenschaften. Fehlt `@framework` oder
`@npm`, meldet der Compiler das mit einem Beispiel. Steht dort noch ein Framework-Name statt des Adapters (so sah es vor
texo-frameworks aus), sagt er, wie es heißt:

```
Fehler: @framework braucht den Adapter als npm-Paket: @framework(adapter: "paket")
  Hinweis: Für react: @framework(adapter: "texo-frameworks/react") – installieren mit 'texo add framework react'
```

## Die Adapter aus texo-frameworks

| `@framework(adapter: …)` | Framework | installieren mit | Hinweise |
|---|---|---|---|
| `"texo-frameworks/react"` | React 18/19 | `texo add framework react` | eine eigene Wurzel (`createRoot`) je Komponente; wird vorgerendert |
| `"texo-frameworks/preact"` | Preact 10 | `texo add framework preact` | |
| `"texo-frameworks/vue"` | Vue 3 | `texo add framework vue` | `onX`-Eigenschaften hört Vue als Ereignis `x`; `v-model` über `@prop("onUpdate:modelValue")`; wird vorgerendert |
| `"texo-frameworks/svelte"` | Svelte 5 | `texo add framework svelte` | über die Klassen-Schnittstelle aus `svelte/legacy` |
| `"texo-frameworks/svelte4"` | Svelte 3/4 | `texo add framework svelte4` | Komponenten sind Klassen (`new Komponente({ target, props })`) |
| `"texo-frameworks/solid"` | Solid | `texo add framework solid` | Eigenschaften sind Getter auf ein Signal, Solid aktualisiert nur das Nötige |
| `"texo-frameworks/dom"` | keins | `texo add framework dom` | eine Funktion `(element, props) => …`, siehe [unten](#ohne-framework-dom) |

`texo add framework <name>` installiert texo-frameworks und die Pakete des Frameworks mit dem Paketmanager des Projekts
(dazu esbuild für das Bündeln) und zeigt ein Beispiel. texo-frameworks kommt aus seinem GitHub-Repo
(`github:LearNivram/texo-frameworks`), nicht aus der npm-Registry; der Rechner braucht dafür Git-Zugang zu dem Repo. Welche Frameworks es gibt und welche Pakete sie brauchen, steht in
der `package.json` von texo-frameworks unter `"texo": { "frameworks": … }`.

Ein Beispiel mit Vue und `v-model`:

```texo
package app

import texo.ui.*

@npm("vue-slider-component", name: "default")
@framework(adapter: "texo-frameworks/vue")
extern component Regler(modelValue: Float, min: Float = 0.0, max: Float = 100.0, @prop("onUpdate:modelValue") onChange: (Float) => Void)

component Lautstaerke {
    private State<Float> wert = State(40.0)

    fn build(): View => Column([
        Regler(modelValue: this.wert.value, onChange: v => this.wert.value = v),
        Text("Lautstärke: ${this.wert.value}")
    ])
}
```

## Web Components

Custom Elements wie Shoelace, Lit-Komponenten oder `vanilla-colorful` brauchen kein Framework. Statt `@framework`
steht dort der Name des Elements:

```texo
package app

import texo.ui.*

@npm("@shoelace-style/shoelace/dist/components/rating/rating.js")
@customElement("sl-rating")
extern component Bewertung(value: Float, max: Int = 5, @event("sl-change") onWahl: (Any) => Void)

component Sterne {
    private State<Float> sterne = State(3.0)

    fn build(): View => Bewertung(value: this.sterne.value, onWahl: e => this.sterne.value = 4.0).padding(8.px)
}
```

- Texo erzeugt direkt das Element (`<sl-rating>`), ohne Hülle. Modifier gelten für das Element selbst.
- `@npm(…)` lädt das Paket nur, damit es das Element registriert. Wird es anders geladen (z. B. per `<script>`), lass
  `@npm` weg.
- Eigenschaften werden als DOM-Properties gesetzt (`element.value = …`), nicht als Attribute.
- Funktions-Eigenschaften sind Ereignisse. `@event("sl-change")` nennt das Ereignis genau. Ohne `@event` leitet Texo
  den Namen ab: `onChange` → `change`, `onValueChanged` → `value-changed`. Der Rückruf bekommt das Ereignis-Objekt.
- Ein `...children: View` als letzter Parameter nimmt Texo-Inhalte als Kinder des Elements auf (Slots):
  `Knopf(variant: "primary", Icon("check"), Text("Speichern"))`.

## Eigene Adapter für jedes andere Framework

Für ein Framework, für das texo-frameworks keinen Adapter hat (Mithril, Inferno, Riot, Lit-Templates, Alpine …),
schreibst du einen eigenen. Er ist eine einzige Funktion:

```js
// texo-adapter-mithril/index.js
import m from "mithril";

/** host: das <div> von Texo, Comp: die Komponente aus @npm(…), props: ihre Eigenschaften */
export default function mount(host, Comp, props) {
  let current = props;
  m.mount(host, { view: () => m(Comp, current) });
  return {
    update(p) { current = p; m.redraw(); },   // nach jeder Änderung eines States
    unmount() { m.mount(host, null); },       // wenn die Ansicht verschwindet
  };
}
```

Der Adapter liegt in einem npm-Paket (oder einem lokalen Ordner, installiert mit `npm install ./adapter`). Texo bindet
ihn mit `adapter:` ein:

```
@npm("mithril-komponenten", name: "Liste")
@framework(adapter: "texo-adapter-mithril")
extern component Liste(eintraege: List<String>)
```

Der Standardexport ist die Funktion selbst oder ein Objekt `{ mount, ssr }`. Fehler beim Einhängen, Aktualisieren
oder Abbauen landen mit dem Namen der Komponente in der Browser-Konsole, statt die Seite anzuhalten.

Soll die Komponente schon beim Vorrendern als HTML im Build stehen, exportiert der Adapter ein Objekt mit `mount` und
`ssr`. `ssr(Comp, props, load)` liefert das HTML als Text oder als Promise darauf. `load(paket)` lädt ein npm-Paket nur
beim Bauen, so landet der Server-Renderer nicht im Bündel für den Browser:

```js
export default {
  mount(host, Comp, props) { /* wie oben */ },
  ssr: (Comp, props, load) => load("mein-framework/server").renderToString(Comp, props),
};
```

Nennt der Adapter sein Framework in den `peerDependencies`, teilen sich beim Vorrendern alle Pakete eine Kopie davon –
wichtig für Frameworks mit Hooks wie React. Die Adapter in texo-frameworks sind genauso gebaut und ein gutes Vorbild.

### Ohne Framework: `dom`

Viele Bibliotheken zeichnen einfach in ein Element (Diagramme, Karten, Editoren). Dafür reicht eine Funktion
`(element, props) => …` mit `@framework(adapter: "texo-frameworks/dom")`. Sie gibt zurück, wie aufgeräumt wird:

- eine Aufräumfunktion, oder
- ein Objekt mit `update(props)` und `unmount()` bzw. `destroy()`.

Ohne `update` baut Texo die Ausgabe bei jeder Änderung neu auf (vorher wird aufgeräumt).

```js
// diagramm.js in einem eigenen npm-Paket
import { Chart } from "chart.js/auto";
export function zeichne(host, props) {
  const canvas = host.appendChild(document.createElement("canvas"));
  const chart = new Chart(canvas, { type: "bar", data: props.daten });
  return { update: (p) => { chart.data = p.daten; chart.update(); }, destroy: () => chart.destroy() };
}
```

## Brücken aus TypeScript-Typen

Bringt ein npm-Paket TypeScript-Typen mit (`"types"` in seiner `package.json` oder ein Paket `@types/<name>`), schreibt
`texo add npm` die Brücke daraus, mit echten Typen statt `Any`:

- Funktionen werden `extern fn`, Klassen `extern class` (Konstruktor, Methoden, statische Methoden).
- React-Komponenten (`FC<Props>`, `forwardRef`, `memo`, Funktionen, die `JSX.Element` liefern, Klassen, die von
  `Component<Props>` erben) werden `extern component` mit ihren Props als Parametern.
- Interfaces, die eine Funktion zurückgibt, werden Typ-Klassen mit `val`-Feldern und Methoden, z. B. `Dayjs` in
  `dayjs("2024-05-01").add(1, "day").format("DD.MM.YYYY")`.

| TypeScript | Texo |
|---|---|
| `string`, Text-Literale und deren Vereinigung | `String` |
| `number` | `Float` |
| `boolean` | `Boolean` |
| `T[]`, `Array<T>` | `List<T>` |
| `Promise<T>` | `Future<T>` |
| `(a: A) => R` | `(A) => R` |
| `T \| null`, `x?: T` | `T?` bzw. `x: T? = null` |
| Objekte, `Record<…>` als Parameter | `Map<String, Any>` |
| Generics, `ReactNode`, `Date`, alles Unklare | `Any` |

Die Brücke ist ein Vorschlag: Prüfe sie, lösche, was du nicht brauchst, und ersetze `Any`, wo du den Typ kennst.
Typen, die über mehrere Dateien des Pakets verteilt sind (`export * from "./teil"`), liest Texo mit.

## Wie es funktioniert

- **Bündeln:** Das Framework und die Komponenten kommen wie jede `@npm`-Brücke aus `texo/vendor/`. esbuild bündelt alle
  Pakete in einem Durchgang, gemeinsamer Code landet in gemeinsamen Teilen. React steht deshalb nur einmal im Build,
  auch wenn mehrere Pakete es benutzen.
- **Laufzeit:** Module mit einer `extern component` laden die kleine Laufzeit-Datei `texo/frameworks.js`, die den
  Adapter aufruft. Der Adapter selbst kommt wie jedes npm-Paket aus `texo/vendor/`. Seiten ohne fremde Komponenten
  laden beides nicht.
- **Vorrendern:** React- und Vue-Komponenten stehen schon als HTML im Build. Texo rendert sie mit `react-dom/server`
  bzw. `vue/server-renderer` aus `node_modules`, die nur beim Bauen geladen werden und nicht ins Bündel für den Browser
  kommen. Pakete, die in den `peerDependencies` eines Pakets aus der `package.json` des Projekts stehen (React, Vue …),
  lädt das Vorrendern nur einmal, so benutzen Komponente, Adapter und Server-Renderer dieselbe Kopie. Suchmaschinen sehen so den Inhalt, und die Seite springt beim Laden nicht. Preact, Svelte, Solid, `dom` und
  eigene Adapter ohne `ssr` lassen die Hülle beim Vorrendern leer. Braucht eine Komponente beim Rendern den Browser
  (`window`, Zeichenfläche) oder wartet sie auf Daten, bleibt ihre Hülle ebenfalls leer – der Rest der Seite wird
  trotzdem vorgerendert.
- **Im Browser:** Nach der Hydration hängt Texo die Komponente ein, sobald der Knoten im Dokument steht (wie
  `onMount`). Das Framework ersetzt dabei das vorgerenderte HTML durch seine eigene, sofort bedienbare Ausgabe.
- **Abbau:** Verschwindet die Ansicht (`If`, `Router`, `ForEach`), ruft Texo `unmount` des Adapters auf.

## Grenzen

- Komponenten aus React, Vue & Co. bekommen **keine Texo-Ansichten als Kinder**. Übergib Werte als Eigenschaften.
  Custom Elements nehmen Kinder auf (`...children: View`).
- Pakete, die nur `.vue`- oder `.svelte`-Quelldateien ausliefern, müssen vorher zu JavaScript übersetzt sein. Texo
  bündelt mit esbuild ohne Framework-Plugins. Die meisten veröffentlichten Pakete enthalten bereits JavaScript.
- `extern component` gibt es nur im Browser-Code; Services laufen auf dem Server.
- Komponenten, die beim Laden `window` oder `document` brauchen, funktionieren trotzdem: Beim Vorrendern ersetzt Texo
  sie durch einen Platzhalter, wie bei [npm-Paketen](npm.md).

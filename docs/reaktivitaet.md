<!-- Übernommen aus LearNivram/Texo (docs/reaktivitaet.md) mit scripts/docs-uebernehmen.mjs – bitte dort ändern. -->

# Reaktivität, Server-Rendering und Routing

Texo verwendet **feingranulare Reaktivität mit Signalen** und **kein virtuelles DOM**. `build()` läuft pro Komponente
im Normalfall genau **einmal**: Der Compiler hat daraus direkten DOM-Aufbau gemacht und jede Stelle, die Zustand liest,
mit einer kleinen Bindung versehen. Ändert sich ein `State`, werden nur die Bindungen neu berechnet, die ihn gelesen haben –
meist genau ein Textknoten, ein Attribut oder eine CSS-Klasse.

**Inhalt**

1. [State, Computed und `var`-Felder](#state-computed-und-var-felder)
2. [Was wird wann aktualisiert?](#was-wird-wann-aktualisiert)
3. [Listen mutieren und Schlüssel](#listen-mutieren-und-schlüssel)
4. [Bedingungen: If, match, Ternär](#bedingungen-if-match-ternär)
5. [Persistenter Zustand](#persistenter-zustand)
6. [effect, batch, untrack, Lebenszyklus](#effect-batch-untrack-lebenszyklus)
7. [Server-Rendering und Hydration](#server-rendering-und-hydration)
8. [Routing](#routing)
9. [Fallstricke und bekannte Einschränkungen](#fallstricke-und-bekannte-einschränkungen)

---

## State, Computed und `var`-Felder

```texo
@Page(title: "Zähler")
component Zaehler {
    private State<Int> n = State(0)
    private Computed<Int> doppelt = Computed(() => this.n.value * 2)

    fn build(): View {
        return Column(spacing: 8.px, [
            Text("Stand: ${this.n.value} (doppelt ${this.doppelt.value})"),
            Button("+1").onClick(() => this.n.value += 1)
        ])
    }
}
```

Das übersetzt der Compiler (echte Ausgabe, `Zaehler.js`) zu:

```js
class Zaehler extends tx.Component {
  constructor($p) {
    super($p);
    this.n = new tx.State(0);
  }

  build() {
    const n0 = tx.el("div", "tx-vbox tx-gap-8", null);
    const n1 = tx.el("span", "tx-text", n0);
    tx.text(n1, () => `Stand: ${this.n.value}`);          // Bindung: liest n → aktualisiert nur diesen Textknoten
    const n2 = tx.el("button", "tx-btn", n0, "+1");
    tx.attr(n2, "type", "button");
    tx.on(n2, "click", () => this.n.value += 1);
    return n0;
  }
}
```

| Baustein | Bedeutung |
|---|---|
| `State<T>(initial)` | veränderlicher, beobachtbarer Wert. `.value` lesen **abonniert**, `.value = x` schreibt und löst Updates aus |
| `state.set(x)`, `state.update(f)` | wie `.value = x` bzw. `.value = f(.value)` |
| `state.peek()` | liest ohne zu abonnieren |
| `state.notify()` | meldet eine Änderung, nachdem das Objekt **an Ort und Stelle** verändert wurde |
| `Computed<T>(() => …)` | abgeleiteter, zwischengespeicherter Wert; nur lesbar (`.value`, `.peek()`) |
| `var`-Felder | in Komponenten, Klassen, Datenklassen und Objekten **automatisch reaktiv** (hinter den Kulissen ein `State`) |

- Schreibt man denselben Wert (`Object.is`), passiert nichts.
- Ein Feld vom Typ `State<T>` wird nie neu zugewiesen (`this.n = State(1)` ist ein Fehler, der Hinweis lautet
  `Ändere den Wert über n.value = …`); man ändert `.value`.
- Komponenten-Eigenschaften (Props) sind unveränderlich. Soll das Kind den Zustand des Elternteils ändern,
  übergibt man den `State` selbst: `Zaehler2(this.menge)` mit `component Zaehler2(wert: State<Int>)`.
- `var`-Felder von Datenklassen sind pro Instanz reaktiv: In `data class Task(…, var done: Boolean)` aktualisiert
  `task.done = true` genau die Bindungen dieser einen Zeile. `object`-Felder sind globaler, geteilter Zustand
  (`Stats.created += 1`). `static`-Felder sind **nicht** reaktiv.

## Was wird wann aktualisiert?

| Stelle im Code | Erzeugte Bindung | Aktualisierung |
|---|---|---|
| `Text("… ${zustand} …")` | `tx.text` | nur der Textknoten |
| Modifier-Argument, Ternär mit konstanten Zweigen | `tx.cls` | Klasse wird umgeschaltet |
| Modifier-Argument mit Laufzeitwert | `txs.dstyle` | Klassen werden neu berechnet |
| `.disabled(…)`, `.ariaLabel(…)`, … mit Zustand | `tx.attr` | nur dieses Attribut |
| `Input(bind: s)`, `Checkbox(bind: s)`, … | `tx.bind` | Zwei-Wege-Bindung |
| `If(…)`, `a ? Viewa : ViewB`, `match` | `tx.when` / `tx.keyed` | tauscht den Zweig, wenn sich das **Ergebnis** ändert |
| `ForEach(liste, …)`, `liste.map(x => View)` | `tx.each` | Differenz nach Schlüsseln |
| Aufruf einer View-liefernden Methode / Variable | `tx.block` | neu berechnet, wenn gelesener Zustand sich ändert |
| Props an Kind-Komponenten | Thunk `() => wert` | Kind liest den Wert in seinen Bindungen |

**Faustregel**: Zustand direkt dort lesen, wo er angezeigt wird (in `Text(…)`, im Modifier, in der Bedingung).

Wird Zustand dagegen in einer `let`-Anweisung **vor** dem `return` von `build()` gelesen, hängt die ganze Komponente an
diesem Zustand und wird bei jeder Änderung vollständig neu aufgebaut. Das ist korrekt, aber gröber – verifiziert mit
zwei Varianten derselben Komponente (`print` in `build()` zählt die Aufrufe):

```texo
component Fein {
    private State<Int> n = State(0)
    fn build(): View {
        print("build-fein")                                  // läuft einmal
        return Column([
            Text("n = ${this.n.value}"),                     // Lesen innerhalb der Bindung
            Button("+").onClick(() => this.n.value += 1)
        ])
    }
}

component Grob {
    private State<Int> n = State(0)
    fn build(): View {
        print("build-grob")                                  // läuft bei jedem Klick erneut
        let v = this.n.value                                 // Lesen außerhalb einer Bindung
        return Column([
            Text("n = ${v}"),
            Button("+").onClick(() => this.n.value += 1)
        ])
    }
}
```

Methoden, die eine `View` zurückgeben, sind trotzdem praktisch: Der Aufruf (`this.filterButton(Filter.All, "Alle")`) wird
in eine `tx.block`-Bindung gepackt und nur dieser Teil neu aufgebaut, wenn sich der dort gelesene Zustand ändert.

## Listen mutieren und Schlüssel

Listen sind JavaScript-Arrays. Der Compiler erkennt **mutierende** Methoden (`add`, `addAll`, `insert`, `removeAt`,
`remove`, `removeWhere`, `clear`, `set`, `sortBy`, `reverse`, `xs[i] = v`, `m[k] = v`, …) auf einem Zustand und meldet die
Änderung automatisch. Du schreibst also einfach:

```texo
data class Aufgabe(id: Int, titel: String, var erledigt: Boolean = false)

@Page(title: "Aufgaben")
component Aufgaben {
    private State<List<Aufgabe>> liste = State([Aufgabe(1, "Eins"), Aufgabe(2, "Zwei", erledigt: true)])
    private State<String> entwurf = State("")
    private var naechsteId = 3

    fn hinzufuegen(): Void {
        if (this.entwurf.value.isBlank()) return
        this.liste.value.add(Aufgabe(this.naechsteId, this.entwurf.value))   // meldet die Änderung automatisch
        this.naechsteId += 1
        this.entwurf.value = ""
    }

    fn entfernen(a: Aufgabe): Void {
        this.liste.value.remove(a)
    }

    fn alleErledigt(): Void {
        this.liste.value = this.liste.value.map(a => a.copy(erledigt: true))   // oder: neue Liste zuweisen
    }

    fn build(): View {
        return Column(spacing: 8.px, [
            Row(spacing: 8.px, [
                Input(bind: this.entwurf, placeholder: "Neu …").onSubmit(() => this.hinzufuegen()),
                Button("+").onClick(() => this.hinzufuegen())
            ]),
            ForEach(this.liste.value, (a, i) =>
                Row(spacing: 8.px, [
                    Checkbox(bind: State(a.erledigt)).onChange(v => a.erledigt = v),
                    Text(a.titel).strikethrough(a.erledigt).grow(),
                    Button.plain("✕").onClick(() => this.entfernen(a))
                ]),
                key: a => a.id
            ),
            Text("${this.liste.value.size} Einträge")
        ])
    }
}
```

Regeln für Listen und `ForEach`:

- **Schlüssel**: `key: a => a.id` identifiziert Zeilen. Beim Update bleiben DOM-Knoten (und ihr lokaler Zustand,
  Fokus, Eingaben) für gleiche Schlüssel erhalten, neue Schlüssel erzeugen Zeilen, fehlende entfernen sie, die Reihenfolge
  wird per Verschieben angepasst. **Ohne `key`** gilt die Identität des Elements als Schlüssel.
- Ist der Schlüssel gleich, aber ein **anderes Objekt** (z. B. nach `copy()`), wird die Zeile neu erzeugt.
- Neue Listen zuweisen (`this.liste.value = …`) funktioniert immer; `filter`, `map`, `sorted` … liefern neue Listen.
  `ForEach(this.sichtbar(), …)` mit einer abgeleiteten Liste aktualisiert sich ebenfalls.
- `var`-Felder (`a.erledigt`) von Zeilenobjekten aktualisieren nur die betroffene Zeile.
- Mutiert eine **eigene Funktion** eine Liste, die ihr übergeben wurde (`fn f(xs: List<Int>) { xs.add(1) }`), kennt der
  Compiler den zugehörigen `State` nicht. Rufe danach `this.liste.notify()` auf oder weise eine neue Liste zu.
- Der Index-Parameter (`(a, i) => …`) ist beim ersten Rendern korrekt; für wiederverwendete Zeilen wird er **nicht**
  nachgeführt (siehe [Einschränkungen](#fallstricke-und-bekannte-einschränkungen)).
- `liste.map(x => View)` direkt in einer Kinderliste wird ebenfalls zu einer schlüssellosen `tx.each`-Liste.

## Bedingungen: If, match, Ternär

```texo
enum Ansicht { Liste, Raster, Leer }

component Ansichten {
    private State<Ansicht> ansicht = State(Ansicht.Liste)
    private State<Int> zahl = State(0)

    fn build(): View {
        return Column(spacing: 12.px, [
            If(this.zahl.value > 3, Text("groß"), otherwise: Text("klein")),
            this.zahl.value.isEven() ? Text("gerade") : Text("ungerade"),
            match this.ansicht.value {
                Ansicht.Liste => Text("Liste"),
                Ansicht.Raster => Text("Raster"),
                Ansicht.Leer => Empty()
            },
            Button("Weiter").onClick(() => this.zahl.value += 1)
        ])
    }
}
```

`If`, Ternär und `match` rendern **nur beim Wechsel** des Ergebnisses neu (`tx.when` merkt sich die Bedingung als
`Computed`; `tx.keyed` den `match`-Subjektwert). Die Zweige selbst laufen untracked: Zustand, der *innerhalb* eines
Zweigs gelesen wird, aktualisiert dort seine eigenen Bindungen, nicht den Zweigwechsel. `match` über ein Enum muss
vollständig sein.

Hinweis: Der Operator `??` mit einer View als rechter Seite (`this.body ?? Empty()`) erzeugt derzeit ungültiges
JavaScript – verwende `If(this.body != null, …)`.

## Persistenter Zustand

`State.persisted(schlüssel, startwert)` ist ein `State`, der im `localStorage` (Schlüssel `texo:<schlüssel>`, JSON)
gespeichert und beim nächsten Besuch wiederhergestellt wird:

```texo
component Einstellungen {
    private State<String> name = State.persisted("name", "Ada")
    private State<Boolean> dunkel = State.persisted("dunkel", false)

    fn build(): View {
        return Column(spacing: 8.px, [
            Input(bind: this.name),
            Toggle(bind: this.dunkel, label: "Dunkel"),
            Text("Hallo, ${this.name.value}!")
        ])
    }
}
```

Beim Pre-Rendering gilt der Startwert; im Browser ersetzt der gespeicherte Wert diesen sofort, und die Bindungen
aktualisieren den Text.

Erlaubt sind dieselben Typen wie bei Service-Methoden: `Int`, `Float`, `Boolean`, `String`, `DateTime`, Enums,
Datenklassen sowie `List`, `Map` und `Pair` daraus. Datenklassen kommen nach dem Neuladen als echte Instanzen zurück
(`copy()`, eigene Methoden, reaktive `var`-Felder und `==` funktionieren). Andere Typen (etwa eine normale `class`)
lehnt der Compiler ab: `State.persisted kann 'Zaehler' nicht speichern und wiederherstellen`. Passt der gespeicherte
Wert nicht mehr zum Typ (z. B. nach einem neuen Pflichtfeld), beginnt der State mit dem Startwert.

## effect, batch, untrack, Lebenszyklus

```texo
component Zusammenspiel {
    private State<Int> a = State(1)
    private State<Int> b = State(2)

    fn onMount(): Void {
        // Seiteneffekt: läuft sofort und bei jeder Änderung von a oder b erneut
        effect(() => print("Summe: ${this.a.value + this.b.value}"))
        // regelmäßig – wird automatisch gestoppt, wenn die Komponente entfernt wird
        Timer.every(1.s, () => this.a.value += 1)
    }

    fn zuruecksetzen(): Void {
        batch(() => {                         // mehrere Änderungen = ein Update
            this.a.value = 0
            this.b.value = 0
        })
    }

    fn momentaufnahme(): Int => untrack(() => this.a.value + this.b.value)   // liest ohne zu abonnieren

    fn build(): View {
        return Button("Reset").onClick(() => this.zuruecksetzen())
    }
}
```

- **`batch(f)`** bündelt Änderungen; jeder **Ereignis-Handler** läuft bereits in einem `batch`.
- **`effect(f)`** abonniert alles, was `f` liest. Er gehört der aktuellen Komponente und wird beim Entfernen beendet.
  Ein Effekt ohne gelesenen Zustand läuft nur einmal.
- **`untrack(f)`** liest ohne Abonnement.
- **`onMount()`** läuft im Browser nach dem ersten Rendern (nicht beim Pre-Rendering), **`onDestroy()`**, wenn die Komponente
  aus dem DOM entfernt wird (z. B. durch `If` oder `ForEach`). `Timer.every`/`Timer.after` werden dabei aufgeräumt.
- Aktualisierungen laufen synchron und nach Erstellungsreihenfolge (Eltern vor Kindern); entfernte Kinder werden
  übersprungen. Ein Effekt löst sich nicht selbst erneut aus. Eine Endlosschleife wird nach 100 000 Läufen mit
  `Texo: Endlosschleife in reaktiven Aktualisierungen erkannt` abgebrochen.

### Asynchrone Aktualisierung

```texo
data class Eintrag(id: Int, titel: String)

component Laden {
    private State<List<Eintrag>> daten = State(List<Eintrag>())
    private State<Boolean> laedt = State(false)
    private State<String> fehler = State("")

    async fn laden(): Void {
        this.laedt.value = true
        try {
            this.daten.value = await Http.getJson<List<Eintrag>>("/api/eintraege")
            this.fehler.value = ""
        } catch (e) {
            this.fehler.value = e.message
        } finally {
            this.laedt.value = false
        }
    }

    fn onMount(): Void {
        this.laden()
    }

    fn build(): View {
        return Column(spacing: 8.px, [
            If(this.laedt.value, Spinner()),
            Text(this.fehler.value).textColor(Color.Red500),
            ForEach(this.daten.value, (e, i) => Text(e.titel), key: e => e.id),
            Button("Neu laden").disabled(this.laedt.value).onClick(() => this.laden())
        ])
    }
}
```

Kommen die Daten von einem eigenen Service, erledigt `Resource<T>` das Lade-Flag, den Fehler und das Neuladen:
`private Resource<List<Eintrag>> daten = Resource(() => Eintraege.liste())` liefert `value`, `loading`, `error`,
`refresh()` und `mutate(…)`. Liest die Funktion einen `State`, lädt sie bei jeder Änderung neu und verwirft verspätete
Antworten. Mit `@Invalidates` am Service laden alle passenden Resources nach einer Änderung von selbst neu, siehe
[Server-Daten im Browser](backend.md#server-daten-im-browser-resource-und-invalidates).

## Server-Rendering und Hydration

Beim Kompilieren rendert Texo jede Seite (jede `@Page`-Komponente und jede Komponente ohne Pflichtparameter) **einmal
vorab**: Der Compiler führt den generierten Code in seiner eingebetteten JS-Engine in einem Mini-DOM (`minidom.js`)
mit denselben Laufzeitmodulen aus, die später im Browser laufen, und serialisiert das Ergebnis als HTML. Das Ergebnis:

- `index.html` enthält bereits den fertigen Inhalt (schneller erster Paint, Suchmaschinen, kein Layout-Sprung);
- `Komponente.html` enthält das Fragment der einzelnen Komponente.

```html
<div id="app" data-tx-root="Zaehler">
  <div class="tx-vbox tx-gap-8">
    <span class="tx-text">Stand: 0</span>
    <button class="tx-btn" type="button">+1</button>
  </div>
</div>
<script type="module">
  import { hydrate } from "./texo/core.js";
  import { Zaehler } from "./demo5/E.js";
  hydrate(Zaehler, document.getElementById("app"));
</script>
```

**Hydration**: `hydrate(Komponente, container)` führt `build()` im Browser erneut aus, **übernimmt** dabei aber die
vorhandenen DOM-Knoten (`tx.el` „beansprucht“ den nächsten passenden Knoten, statt einen zu erzeugen) und hängt nur noch
Bindungen und Ereignishandler an. Es entsteht kein zweiter DOM-Baum und kein Flackern.

- **Abweichungen** (Server- und Client-Baum passen nicht zusammen): Hydration weicht lokal aus – betroffene Bereiche
  (z. B. ein `Router`-Platz, dessen Hash-Route nicht der vorgerenderten entspricht) werden neu gerendert und ausgetauscht.
  Ist das nicht möglich, meldet die Konsole `[texo] Hydration fehlgeschlagen (…), rendere neu.` und die Komponente wird
  vollständig clientseitig gerendert.
- **Auf dem Server läuft**: Feldinitialisierung, `build()`, Bindungen (einmal), keine Ereignisse, kein `onMount`.
  Seiten mit Laufzeitwerten wie `DateTime.now()` im Feldinitialisierer erhalten daher die Zeit **zur Compile-Zeit** im HTML;
  im Browser korrigieren die Bindungen den Text.
- Scheitert das Pre-Rendering einer Komponente (z. B. wegen Browser-APIs im Initialisierer), gibt der Compiler eine Warnung
  `Server-Rendering von 'X' fehlgeschlagen (…) – die Seite wird im Browser gerendert` aus; die Seite funktioniert trotzdem.
- `texo build --no-ssr` (oder `"ssr": false` in `texo.json`) schaltet das Pre-Rendering ab.

## Nachladen mit Lazy

`Lazy(() => Komponente(…))` lädt eine Komponente aus einer **anderen Datei** erst, wenn sie angezeigt wird. Ihr
Modul wird nicht mit der Seite geladen, sondern per `import()`, sobald `Lazy` erscheint. Bis dahin (und beim
Vorrendern) zeigt es den Platzhalter.

```texo
// src/Bericht.texo – Kalender steht in src/kalender/Kalender.texo (package app.kalender)
import texo.ui.*
import texo.graphics.*
import app.kalender.*

component Bericht {
    private State<Boolean> details = State(false)

    fn build(): View => Column(spacing: 12.px, [
        Button("Details anzeigen").onClick(() => this.details.value = true),
        If(this.details.value, Lazy(() => Kalender(), placeholder: Spinner())),
        // erst laden, wenn der Platzhalter in die Nähe des sichtbaren Bereichs kommt
        Lazy(() => Kalender(), placeholder: Text("Kalender …"), whenVisible: true)
    ])
}
```

- Die nachgeladene Komponente verhält sich wie jede andere: Eigenschaften bleiben reaktiv (`Diagramm(titel: this.titel.value)`),
  Modifier am Aufruf gelten (`Lazy(() => Diagramm().padding(8.px))`), sie hat ihren eigenen Zustand.
- Nachgeladen werden kann nur eine Komponente aus einer anderen Datei. Steht sie in derselben Datei, warnt der Compiler
  und zeigt sie direkt an.
- `whenVisible: true` beobachtet den Platzhalter (IntersectionObserver, 200 px Vorlauf). Ohne Platzhalter wird sofort
  geladen.
- Mit `texo build` bekommt die nachgeladene Datei einen eigenen Hash-Namen; sie wird gecacht wie alle anderen.

## Fehlergrenzen mit ErrorBoundary

Ohne Fehlergrenze stoppt ein Fehler in einer Komponente die ganze Seite (beim ersten Aufbau) oder lässt den
betroffenen Teil stehen, ohne dass er sich weiter aktualisiert. `ErrorBoundary(inhalt, fallback: …)` fängt Fehler
beim Aufbauen **und** bei späteren Aktualisierungen des Inhalts ab und zeigt an dieser Stelle `fallback`. Der Rest
der Seite läuft weiter.

```texo
package app

import texo.ui.*

component Diagramm(werte: List<Int>) {
    fn build(): View {
        if (this.werte.isEmpty()) { throw Error("keine Werte") }
        return Text("${this.werte.size} Werte")
    }
}

component Uebersicht {
    private State<List<Int>> werte = State([])

    fn build(): View => Column([
        ErrorBoundary(
            Diagramm(this.werte.value),
            fallback: (e, retry) => Column([
                Text("Diagramm fehlt: ${e.message}"),
                Button("Nochmal").onClick(() => { this.werte.value = [1, 2, 3]; retry() })
            ])
        ),
        // ohne fallback: ein kurzer Hinweis mit role="alert"
        ErrorBoundary(Diagramm([]))
    ])
}
```

- `retry()` baut den Inhalt neu auf. Schlägt er wieder fehl, erscheint wieder `fallback`.
- Ein Fehler im `fallback` selbst geht an die nächste `ErrorBoundary` weiter oben.
- Fehler in Klick- und anderen Ereignis-Handlern landen weiterhin nur in der Konsole; die Ansicht bleibt dabei stehen.
  Erst wenn ein Handler einen Zustand ändert und der Inhalt beim Aktualisieren scheitert, greift die Fehlergrenze.
- Jeder abgefangene Fehler erscheint mit `console.error` in der Konsole.

## Routing

Texo bringt einen kleinen **hash-basierten Router** mit (`#/pfad`); er funktioniert auf jedem statischen Host ohne
Server-Konfiguration.

```texo
component Nutzer(id: String) {
    fn build(): View {
        return Column(spacing: 8.px, [
            Heading("Nutzer ${this.id}", level: 2),
            Button("Zurück").onClick(() => Navigator.back()),
            Button("Zur Startseite").onClick(() => Navigator.go("/"))
        ])
    }
}

@Page(title: "Router")
component App {
    fn build(): View {
        return Column(spacing: 16.px, [
            Row(spacing: 12.px, [
                Link("Start", to: "/"),
                Link("Nutzer 42", to: "/nutzer/42"),
                Text("Aktuell: ${Navigator.path}")
            ]),
            Router(
                Route("/", _ => Text("Willkommen")),
                Route("/nutzer/:id", p => Nutzer(p.get("id"))),
                Route("/doku/*", _ => Text("Dokumentation")),
                fallback: Text("404")
            )
        ])
    }
}
```

- `Route(pfad, p => View)`: Segmente mit `:name` sind Parameter (`p.get("name")`, `p.has("name")`); `*` am Ende
  passt auf beliebige weitere Segmente, ein Pfad `"*"` auf alles. Die erste passende Route gewinnt; `fallback` ist die
  Ansicht, wenn keine passt.
- `Link(label, to: "/pfad")` mit führendem `/` wird zu `href="#/pfad"` und navigiert ohne Neuladen. Der Link zur aktuellen
  Route bekommt automatisch `aria-current="page"`. `external: true` oder ein Ziel ohne `/` am Anfang (`"about.html"`,
  `"https://…"`) bleibt ein normaler Link.
- `Navigator.path` ist **reaktiv**: `Navigator.path == "/"` in einer Bedingung oder einem Modifier aktualisiert sich bei
  jedem Routenwechsel (z. B. für aktive Menüeinträge). `Navigator.go(pfad)`, `Navigator.back()`,
  `Navigator.isActive(pfad)`.
- Nach einem Routenwechsel springt die Seite nach oben und der Fokus geht auf die erste `h1` der neuen Ansicht (ohne
  `h1` auf die Ansicht selbst), damit Screenreader den Wechsel ansagen. Der erste Aufbau der Seite lässt Scrollposition
  und Fokus unverändert.
- Nur ein Hash mit `/` am Anfang ist eine Route. Anker wie `Link("Installation", to: "#installation")` oder ein
  Inhaltsverzeichnis springen wie gewohnt zum Abschnitt; Ansicht, `Navigator.path` und Fokus bleiben.
- Beim Pre-Rendering gilt der Pfad `/`; öffnet der Nutzer `#/nutzer/42` direkt, rendert die Hydration den Router-Bereich neu.
- Für **mehrere echte Seiten** (eigene HTML-Dateien) verwende mehrere `@Page`-Komponenten, siehe
  [Wie der Compiler arbeitet](compiler.md#seiten-und-einstiegspunkte).

### Echte Adressen statt `#/`

Mit `"routing": "path"` in der `texo.json` nutzt der Router echte Adressen: `/nutzer/42` statt `#/nutzer/42`. Solche
Links lassen sich teilen, und Suchmaschinen sehen sie als eigene Seiten. Am Texo-Quelltext ändert sich nichts.

```json
{ "src": "src", "out": "dist", "backend": "texo", "routing": "path" }
```

- `Link("Nutzer 42", to: "/nutzer/42")` wird zu `href="/nutzer/42"`. Ein Klick ändert die Adresse mit der History-API
  ohne Neuladen; Zurück und Vor im Browser wechseln die Route. Strg-, Cmd- und Mittelklick öffnen wie gewohnt einen
  neuen Tab.
- Die Server (`texo dev`, das Backend `texo` und Node, Bun und Deno) liefern für Pfade ohne eigene Datei und ohne
  Dateiendung die Startseite (`index.html`) aus, damit `/nutzer/42` auch beim direkten Aufruf und nach dem Neuladen
  funktioniert. Dateien wie `/logo.png` bleiben 404, wenn es sie nicht gibt; Seiten mit `@Guard` bleiben geschützt.
- Die erzeugten Seiten laden CSS und JavaScript ab der Wurzel (`/app.css`, `/texo/core.js`). Die App muss deshalb an
  der Wurzel einer Domain liegen, nicht in einem Unterordner. Eigene Dateien aus `public/` sprichst du ebenfalls mit
  `/` am Anfang an (`Image("/logo.png")`), sonst sucht der Browser sie unter `/nutzer/logo.png`.
- Ohne Server (statisches Hosting mit `"backend": "static"`) braucht der Host eine Umleitung aller unbekannten Pfade auf
  `/index.html` mit Status 200, z. B. bei Netlify `/* /index.html 200` in `public/_redirects`. Ohne diese Regel bleibt
  der Standard `"routing": "hash"` die sichere Wahl.

## Fallstricke und bekannte Einschränkungen

- **Zustand außerhalb von Bindungen lesen** (`let v = this.n.value` vor dem `return`) baut die gesamte Komponente bei
  jeder Änderung neu auf. Besser: direkt im `Text(…)`/Modifier lesen.
- **Mutation in fremden Funktionen** meldet keine Änderung (siehe oben) – `notify()` aufrufen.
- **`ForEach`-Index**: Der Index wird beim Erstellen einer Zeile gebunden und bei Umordnung/Verkleinern der Liste nicht
  nachgeführt (bekannte Einschränkung; Tests dafür sind als „BUG“ markiert). Zeige bei Bedarf eine Nummer als Teil des
  Datenobjekts an.
- **Smart Casts gelten nicht für Felder**, siehe [Sprachreferenz](sprachreferenz.md#10-null-sicherheit-und-smart-casts).
- **`??` mit View-Konstruktoren** auf der rechten Seite (`x ?? Empty()`) erzeugt derzeit ungültigen JavaScript-Code; nutze `If`.
- **`onDestroy` beim Pre-Rendering**: Der Compiler entsorgt die vorgerenderte Instanz am Ende des Server-Renderings; dabei
  läuft `onDestroy()` einmal zur Compile-Zeit mit (Ausgaben erscheinen in der Compiler-Konsole).
- **Fehler beim Pre-Rendering** (Laufzeitausnahmen im Initialisierer oder in `build()`) sind Warnungen, keine Fehler – die
  Seite wird dann clientseitig gerendert.

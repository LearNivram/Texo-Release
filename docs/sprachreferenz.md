<!-- Übernommen aus LearNivram/Texo (docs/sprachreferenz.md) mit scripts/docs-uebernehmen.mjs – bitte dort ändern. -->

# Texo – Sprachreferenz

Texo ist eine statisch typisierte, objektorientierte Sprache für Benutzeroberflächen. Dieses Dokument beschreibt die
Sprache selbst (Syntax, Typen, Semantik). Die UI-Bibliothek (Elemente und Modifier) steht in
[UI und Styling](ui-und-styling.md), die Reaktivität in [Reaktivität und Routing](reaktivitaet.md).

Alle Codebeispiele in dieser Referenz werden mit dem Compiler (`texo check`) geprüft.

**Inhalt**

1. [Lexik](#1-lexik)
2. [Dateien, Pakete und Importe](#2-dateien-pakete-und-importe)
3. [Typen](#3-typen)
4. [Variablen und Konstanten](#4-variablen-und-konstanten)
5. [Funktionen](#5-funktionen)
6. [Kontrollfluss](#6-kontrollfluss)
7. [Klassen, Datenklassen, Objekte, Enums, Interfaces](#7-klassen-datenklassen-objekte-enums-interfaces)
8. [Komponenten](#8-komponenten)
9. [Lambdas](#9-lambdas)
10. [Null-Sicherheit und Smart Casts](#10-null-sicherheit-und-smart-casts)
11. [Operatoren](#11-operatoren)
12. [Zeichenketten und Interpolation](#12-zeichenketten-und-interpolation)
13. [Eingebaute Typen und Funktionen (texo.core)](#13-eingebaute-typen-und-funktionen-texocore)
14. [Kompilierzeit-Auswertung](#14-kompilierzeit-auswertung)

---

## 1. Lexik

```texo
// Zeilenkommentar
/* Blockkommentar */
/// Dokumentationskommentar (gehört zur folgenden Deklaration)
/** Dokumentationskommentar im Blockstil */
const Zahl = 1_000_000      // Unterstriche in Zahlen sind erlaubt
const Hex = 0xFF
const Gleitkomma = 1.5e3
```

- **Anweisungsende**: ein Zeilenumbruch oder `;`. Semikolons sind optional. Beginnt eine neue Zeile mit `(`, `[`, `!!`,
  `++` oder `--`, ist das eine **neue** Anweisung. Methodenketten dürfen dagegen mit `.` oder `?.` am Zeilenanfang
  fortgesetzt werden (so sind die UI-Beispiele formatiert).
- **Bezeichner** beginnen mit Buchstabe oder `_`/`$`. Mit Backticks lassen sich reservierte Wörter als Namen
  verwenden: `` `match` ``.
- **Schlüsselwörter**: `package import as public private protected internal component class data enum object interface
  fn let var val const return if else for in while break continue true false null this async await extern static
  constructor new try catch finally throw match is`.
- **Annotationen** beginnen mit `@`, z. B. `@Page(title: "Start")`.
- Zahlen mit Einheit: `360.px`, `1.2.px`, `250.ms`, `45.deg` – die Einheit ist eine Eigenschaft von `Int`/`Float`
  (siehe [UI und Styling](ui-und-styling.md#einheiten)).

## 2. Dateien, Pakete und Importe

Eine Texo-Datei hat die Endung `.texo`. Sie beginnt optional mit einer `package`-Zeile, danach folgen Importe und
Deklarationen (Komponenten, Klassen, Enums, Objekte, Funktionen, Konstanten):

```texo
package app.dashboard

import texo.ui.*
import texo.graphics.*
import texo.graphics.Color as Farbe

public component Hallo {
    fn build(): View {
        return Text("Hallo").textColor(Farbe.Indigo500)
    }
}
```

- `texo.core` (Int, String, List, State, Math, Timer, …) ist **immer** importiert.
- `texo.ui` enthält alle Views und Modifier, `texo.graphics` Farben, Verläufe, Schatten, Transformationen usw.
- `texo.server` (Request, Session, Env, Password, Log, HttpError) ist nur in `service`-Deklarationen und `@Server`-Code
  verwendbar – siehe [Backend & Sicherheit](backend.md). `Access` (für Routen-Wächter) gehört zu `texo.core`.
- `import paket.*` importiert alle Namen eines Pakets, `import paket.Name` einen einzelnen,
  `import paket.Name as Alias` benennt ihn um.
- Alle Dateien mit demselben `package` teilen sich einen Namensraum: Deklarationen sind ohne Import sichtbar.
  Eigene Pakete lassen sich mit `import mein.paket.*` oder `import mein.paket.Name` einbinden.
- Aus `package app.dashboard` und der Datei `MetricCard.texo` entsteht das Ausgabemodul `app/dashboard/MetricCard.js`.
  Zwei Dateien dürfen nicht dasselbe Modul erzeugen.
- Sichtbarkeit: `public` (Standard), `private` (nur in der eigenen Klasse), `protected` (Klasse und Unterklassen),
  `internal` (in [Bibliotheken](bibliotheken.md): nur innerhalb der Bibliothek, nicht Teil der Schnittstelle).
- `extern` steht in den Schnittstellen vorkompilierter [Bibliotheken](bibliotheken.md) für „Implementierung liegt
  vorkompiliert vor“ (`fn f(): Int => extern`). Im eigenen Code ist es nicht erlaubt.

## 3. Typen

Texo ist statisch typisiert, Typen werden aber überall dort abgeleitet, wo es eindeutig ist.

| Typ | Bedeutung |
|---|---|
| `Int` | ganze Zahlen; Division schneidet ab (`7 / 2 == 3`) |
| `Float` | Gleitkommazahlen (`Double` ist ein Alias) |
| `Boolean` | `true` / `false` (`Bool` ist ein Alias) |
| `String` | Text |
| `Void` | Rückgabetyp von Funktionen ohne Ergebnis |
| `Any` | Obertyp aller Werte |
| `List<T>` | geordnete, veränderliche Liste |
| `Map<K, V>` | Schlüssel-Wert-Abbildung |
| `Pair<A, B>` | Paar mit `first` und `second` |
| `T?` | nullbarer Typ (`String?`, `Int?`) |
| `(A, B) => R` | Funktionstyp |
| `State<T>`, `Computed<T>` | reaktive Container, siehe [Reaktivität und Routing](reaktivitaet.md) |
| `Future<T>` | Ergebnis einer `async`-Funktion |
| `Stream<T>` | fortlaufende Werte vom Server, siehe [Backend und Sicherheit](backend.md#echtzeit-stream-und-channel) |
| `Error` | Fehlerobjekt: `Error("Nachricht")`, `.message` |
| `Length`, `Color`, `Duration`, `Angle`, … | Designwerte, siehe [UI und Styling](ui-und-styling.md) |

`Int` wird bei Bedarf automatisch zu `Float` erweitert (`let f: Float = 1`). Umgekehrt braucht es
`.toInt()`, `.round()`, `.floor()` oder `.ceil()`.

```texo
fn typen(): Void {
    let a: Int = 42
    let b: Float = 1.5
    let ok: Boolean = a > 3
    let name: String = "Texo"
    let namen: List<String> = ["Ada", "Linus"]
    let punkte: Map<String, Int> = ["Ada": 10, "Linus": 7]
    let leer: List<Int> = []                // der Typ muss bei leeren Literalen angegeben werden
    let keine: Map<String, Int> = [:]
    let paar = Pair(1, "eins")
    let unbekannt: String? = null
    let verdoppeln: (Int) => Int = x => x * 2
    let ganz = b.toInt()
}
```

### Generics

Klassen und Funktionen können Typparameter haben. Typargumente werden aus den Argumenten oder dem erwarteten Typ
abgeleitet, lassen sich aber auch explizit angeben:

```texo
class Kiste<T>(inhalt: T) {
    fn get(): T => this.inhalt
    fn map<R>(f: (T) => R): Kiste<R> => Kiste(f(this.inhalt))
}

fn ersterOder<T>(xs: List<T>, standard: T): T => xs.first() ?? standard

fn generics(): Void {
    let k = Kiste(21).map(x => x * 2)          // Kiste<Int>
    let n = ersterOder([1, 2, 3], 0)
    let s = ersterOder<String>([], "leer")
    let m = Map<String, Int>()
}
```

## 4. Variablen und Konstanten

| Schreibweise | Bedeutung |
|---|---|
| `let x = 1` / `val x = 1` | unveränderlich |
| `var x = 1` | veränderlich |
| `Int x = 1` | Java-Stil, veränderlich |
| `const X = 1` | Konstante (Top-Level oder Klassenmitglied), unveränderlich |

```texo
const Marke = Color.hex("#6366f1")     // Top-Level-Konstante, wird zur Compile-Zeit ausgewertet
const Radius = 12.px

fn variablen(): Void {
    let a = 1               // Typ Int abgeleitet
    var b: Int = 2
    Int c = 3               // Java-Stil
    b += a + c
    let titel: String? = null
}
```

Zuweisungen an `let` führen zu `'a' ist unveränderlich`. Ein Typ oder ein Startwert ist Pflicht; `let x = null` ist
nicht ableitbar und braucht eine Typangabe.

## 5. Funktionen

Funktionen stehen auf oberster Ebene (`fn`) oder in Klassen/Komponenten (Methoden). Der Rumpf ist ein Block oder ein
Ausdruck (`=>`). Parametertypen sind Pflicht; ohne Rückgabetyp ist die Funktion `Void`, bei Ausdruckskörpern wird der
Rückgabetyp abgeleitet.

```texo
fn addiere(a: Int, b: Int): Int {
    return a + b
}

fn verdoppele(x: Int) => x * 2                          // Rückgabetyp abgeleitet
fn gruss(name: String, titel: String = "Frau"): String => "Hallo ${titel} ${name}"

fn summe(...zahlen: Int): Int => zahlen.sum()           // variadischer Parameter

fn aufrufe(): Void {
    let a = addiere(1, 2)
    let b = gruss("Ada")                                 // Standardwert
    let c = gruss(titel: "Dr.", name: "Ada")             // benannte Argumente, beliebige Reihenfolge
    let d = summe(1, 2, 3)
    let e = summe([4, 5, 6])                             // eine Liste wird in den variadischen Parameter „gespreizt“
}
```

Funktionswerte (Lambdas) unterstützen keine benannten Argumente. Funktionen, die ein Ergebnis liefern, müssen auf allen
Pfaden `return` erreichen (`Funktion 'f' muss einen Wert vom Typ 'Int' zurückgeben`).

### async und await

Eine mit `async` markierte Funktion liefert ein `Future<T>`; der **deklarierte** Rückgabetyp ist `T`. `await` ist nur in
`async`-Funktionen erlaubt.

```texo
async fn laden(): String {
    await Timer.delay(500.ms)
    return "fertig"
}

data class Aufgabe(id: Int, titel: String)

async fn vomServer(): Int {
    let aufgaben = await Http.getJson<List<Aufgabe>>("/api/aufgaben")
    let text = await laden()
    print(text)
    return aufgaben.size
}
```

Lambdas können ebenfalls `async` sein: `async () => …`. Event-Handler dürfen asynchron aufgerufen werden:
`.onClick(() => this.neuLaden())`.

## 6. Kontrollfluss

```texo
fn kontrollfluss(n: Int, xs: List<String>): Void {
    // if / else
    if (n > 10) {
        print("groß")
    } else if (n > 5) {
        print("mittel")
    } else {
        print("klein")
    }

    // for-in über Listen, mit Index, über Bereiche
    for x in xs { print(x) }
    for (x in xs) { print(x) }                 // Klammern sind optional
    for x, i in xs { print("${i}: ${x}") }     // Element und Index
    for i in 0..<n { print(i) }                // 0 bis n-1 (exklusiv)
    for i in 1..3 { print(i) }                 // 1, 2, 3 (inklusiv)

    // while, break, continue
    var k = 0
    while k < 10 {
        k++
        if (k == 3) { continue }
        if (k > 6) { break }
    }

    // try / catch / finally, throw
    try {
        if (n < 0) { throw Error("negativ") }
    } catch (e) {
        print(e.message)
    } finally {
        print("fertig")
    }
}
```

- `for` iteriert über `List<T>`; bei einer `Map<K, V>` ist das Element ein `Pair<K, V>` (`for e in karte { e.first }`).
- Bereiche `a..b` und `a..<b` sind `List<Int>`; beide Grenzen müssen `Int` sein.
- Die Bedingung von `if`, `while` und `?:` muss `Boolean` sein (`Erwartet Boolean, gefunden …`). Es gibt keine
  „truthy“-Werte.
- `throw` ist eine **Anweisung**, kein Ausdruck.
- Eigene Fehler erben von `Error`: `data class NichtGefunden(id: Int): Error("Nicht gefunden: ${id}")`. Mit
  `catch (e: NichtGefunden)` fängt ein Zweig nur diesen Typ; mehrere solche Zweige werden der Reihe nach geprüft, ein
  `catch (e)` ohne Typ steht zuletzt. Funktionen können ihre Fehler mit `throws A | B` nach dem Rückgabetyp angeben
  (siehe [Backend: typisierte Fehler](backend.md#typisierte-fehler-throws)).

### match

`match` ist ein Ausdruck. Jeder Zweig hat ein oder mehrere Muster (Werte, durch Komma getrennt) und ein Ergebnis.
`else =>` (oder `_ =>`) ist der Auffangzweig. Über Enums prüft der Compiler die **Vollständigkeit**; bei allen anderen
Typen ist `else` Pflicht. Ein Block `{ … }` als Zweig muss sein Ergebnis mit `return` liefern.

```texo
enum Stufe { Niedrig, Mittel, Hoch }

fn zahlwort(n: Int): String => match n {
    1 => "eins",
    2, 3 => "zwei oder drei",
    else => "viele"
}

fn farbe(s: Stufe): Color => match s {
    Stufe.Niedrig => Color.Green,
    Stufe.Mittel => Color.Amber,
    Stufe.Hoch => Color.Red
}

fn mitBlock(n: Int): String => match n {
    0 => "null",
    else => {
        let doppelt = n * 2
        return "doppelt: ${doppelt}"
    }
}
```

`match` kann auch direkt als View verwendet werden (`return match this.filter.value { … }` in `build()`); dann rendert
der Compiler den passenden Zweig reaktiv, siehe [Reaktivität und Routing](reaktivitaet.md#bedingungen-if-match-ternär).

## 7. Klassen, Datenklassen, Objekte, Enums, Interfaces

### Klassen

Der **primäre Konstruktor** steht hinter dem Namen: jeder Parameter wird zu einem Feld. Mit `var` ist das Feld
veränderlich (und **reaktiv**, siehe unten). Weitere Felder und Methoden stehen im Rumpf, der bei `class` immer
vorhanden sein muss (`{ }` genügt). Konstruktoren mit eigenem Rumpf gibt es nicht.

```texo
class Konto(inhaber: String, var stand: Int = 0) {
    private var buchungen: Int = 0                 // ohne Startwert wäre nur ein nullbarer Typ erlaubt
    let waehrung = "EUR"                           // unveränderliches Feld mit Startwert
    static var anzahl: Int = 0                     // statisches Mitglied
    static const Limit = 1000                      // statische Konstante

    fn einzahlen(betrag: Int): Void {
        this.stand += betrag
        this.buchungen += 1
    }

    fn beschreibung(): String => "${this.inhaber}: ${this.stand} ${this.waehrung}"

    static fn eroeffne(name: String): Konto => Konto(name)
}

fn konten(): Void {
    let k = Konto("Ada", 100)
    k.einzahlen(50)
    let l = Konto.eroeffne("Linus")
    Konto.anzahl += 1
    print(k.beschreibung())
}
```

- Auf Instanzmitglieder greifst du mit `this.` zu (Konvention in allen Beispielen; ohne `this.` funktioniert es ebenfalls, solange
  kein lokaler Name sie verdeckt); statische Mitglieder über den Typnamen.
- Felder brauchen einen Startwert, außer sie sind nullbar. Primär-Konstruktor-Parameter zählen als initialisiert.
- Zwei Mitglieder mit demselben Namen sind ein Fehler.
- Klassen haben automatisch `toString()`.

#### Vererbung

Eine Klasse hat höchstens **eine Oberklasse** (`class` oder `data class`). Die Konstruktorargumente der Oberklasse
werden hinter dem Typnamen übergeben. Ohne eigenen Primär-Konstruktor erbt eine Unterklasse den Konstruktor der
Oberklasse. Methoden werden einfach durch Deklaration gleichen Namens überschrieben (kein `override`/`open` nötig).

```texo
class Tier(name: String) {
    fn laut(): String => "..."
    fn vorstellen(): String => "${this.name} sagt ${this.laut()}"
}

class Hund(name: String, rasse: String): Tier(name) {
    fn laut(): String => "Wuff"
}

class Welpe: Hund {
    fn laut(): String => "Wiff"
}

fn tiere(): Void {
    let h = Hund("Rex", "Schäfer")
    let w = Welpe("Bello", "Mops")             // erbt den Konstruktor von Hund
    let t: Tier = w
    print(t.vorstellen())
}
```

Fehlen die Argumente für eine Oberklasse mit Pflichtparametern, meldet der Compiler
`'Tier' braucht Konstruktorargumente: class Hund(…): Tier(…)`.

### Datenklassen

`data class` ist für reine Daten gedacht. Sie bekommt automatisch:

- **strukturelle Gleichheit** (`==` vergleicht alle Felder),
- `copy(…)` mit benannten Argumenten – nicht genannte Felder bleiben erhalten,
- `toString()` (`Task(id=1, title=…)`).

Der Rumpf ist optional.

```texo
data class Aufgabe(id: Int, titel: String, var erledigt: Boolean = false)

fn daten(): Void {
    let a = Aufgabe(1, "Doku schreiben")
    let b = a.copy(titel: "Doku lesen")
    let gleich = a == Aufgabe(1, "Doku schreiben")      // true
    a.erledigt = true                                      // `var`-Felder sind veränderlich und reaktiv
    print(b)
}
```

### Objekte (Singletons)

`object` deklariert genau eine Instanz, auf die direkt über den Namen zugegriffen wird. `var`-Felder sind reaktiv und
eignen sich daher als **globaler Zustand**.

```texo
object Einstellungen {
    var dunkel: Boolean = false
    var zaehler: Int = 0

    fn umschalten(): Void {
        this.dunkel = !this.dunkel
        this.zaehler += 1
    }
}

fn objekte(): Void {
    Einstellungen.umschalten()
    let modus = Einstellungen.dunkel
}
```

### Services

`service` ist wie ein `object`, läuft aber **ausschließlich auf dem Server**. Seine öffentlichen Methoden sind
API-Endpunkte; im Browser liefern sie ein `Future<T>` (oder einen `Stream<T>`, wenn die Methode einen liefert). Details, Wächter und Sicherheit: [Backend & Sicherheit](backend.md).

```texo
import texo.server.*

service Begruessung {
    fn hallo(name: String): String => "Hallo, ${name}!"
}

// im Browser:  let text = await Begruessung.hallo("Ada")
```

Objekte haben keine Konstruktorparameter und können nicht mit `Name()` erzeugt werden.

### Enums

Ein Enum ist eine feste Menge benannter Werte. Jeder Fall hat `.name`, `Typ.values()` liefert alle Fälle als Liste.
Enums werden mit `==` verglichen und in `match` auf Vollständigkeit geprüft. Sie können nicht instanziiert werden.

```texo
enum Richtung { Hoch, Runter, Links, Rechts }

fn enums(): Void {
    let r = Richtung.Links
    let text = r.name                        // "Links"
    for d in Richtung.values() { print(d.name) }
    let gleich = r == Richtung.Links
}
```

### Interfaces

Ein `interface` beschreibt Mitglieder, die implementierende Klassen bereitstellen müssen: Methoden ohne Rumpf und
Eigenschaften (`val name: String`). Methoden **mit** Rumpf sind Standardimplementierungen. Eine Klasse (auch
`data class`) kann beliebig viele Interfaces implementieren; sie stehen hinter der – optionalen – Oberklasse, durch
Komma getrennt. Interfaces können von anderen Interfaces erben, haben aber weder Konstruktor noch statische Mitglieder
noch Startwerte.

```texo
interface Form {
    val name: String
    fn flaeche(): Float
    fn beschreibung(): String => "${this.name}: ${this.flaeche().toFixed(1)}"
}

interface Faerbbar {
    fn farbe(): Color
}

class Kreis(r: Float): Form, Faerbbar {
    val name: String = "Kreis"
    fn flaeche(): Float => 3.14159 * this.r * this.r
    fn farbe(): Color => Color.Red
}

data class Rechteck(b: Float, h: Float): Form {
    val name: String = "Rechteck"
    fn flaeche(): Float => this.b * this.h
}

fn formen(): Void {
    let alle: List<Form> = [Kreis(1.0), Rechteck(2.0, 3.0)]
    for f in alle { print(f.beschreibung()) }
}
```

Fehlende oder inkompatible Implementierungen sind Compilerfehler:

```text
Beispiel.texo:7:7: Fehler: 'Quadrat' implementiert 'flaeche' aus dem Interface 'Form' nicht
Beispiel.texo:7:7: Fehler: 'Quadrat.flaeche' passt nicht zum Interface 'Form': erwartet '() => Float', gefunden '() => String'
Beispiel.texo:8:15: Fehler: Nur eine Oberklasse ist erlaubt – 'B' ist kein Interface
```

### Typprüfungen mit `is`

`x is Typ` und `x !is Typ` prüfen den Laufzeittyp (Klasse, Datenklasse oder Interface; nicht nullbar und ohne
Typargumente). Innerhalb von `if`, `&&`, `||` und `?:` wird die Variable automatisch auf den Typ **eingeengt**
(Smart Cast), nur bei lokalen Variablen und Parametern.

```texo
interface Form { fn flaeche(): Float }
class Kreis(r: Float): Form { fn flaeche(): Float => 3.14 * this.r * this.r }
class Rechteck(b: Float, h: Float): Form { fn flaeche(): Float => this.b * this.h }

fn beschreibe(f: Form): String {
    if (f is Kreis) {
        return "Radius ${f.r}"                 // f ist hier ein Kreis
    }
    if (f !is Rechteck) { return "unbekannt" }
    return "Breite ${f.b}"                     // und hier ein Rechteck
}

fn istGross(f: Form): Boolean => f is Kreis && f.r > 10.0
```

Unmögliche Prüfungen werden abgelehnt: `'Int' kann nie ein 'String' sein`.

## 8. Komponenten

Eine **Komponente** ist die Grundeinheit der Oberfläche. Sie ist eine Klasse, die automatisch von `View` erbt und
eine Methode `fn build(): View` besitzen **muss**.

```texo
public component Zaehler(start: Int = 0, titel: String = "Zähler") {
    // 1. Reaktiver Zustand
    private State<Int> anzahl = State(0)
    private Computed<Int> doppelt = Computed(() => this.anzahl.value * 2)
    var klicks: Int = 0                      // `var`-Felder sind ebenfalls reaktiv

    // 2. Lebenszyklus
    fn onMount(): Void {
        this.anzahl.value = this.start
    }
    fn onDestroy(): Void {
        print("Komponente entfernt")
    }

    // 3. Methoden mit Logik
    fn erhoehen(): Void {
        this.anzahl.value += 1
        this.klicks += 1
    }

    // 4. UI-Definition
    fn build(): View {
        return Column(spacing: 8.px, [
            Text("${this.titel}: ${this.anzahl.value} (doppelt ${this.doppelt.value})"),
            Button("+1").onClick(() => this.erhoehen())
        ])
    }
}
```

**Eigenschaften (Props)** werden im Primär-Konstruktor deklariert und beim Aufruf wie Funktionsargumente übergeben
(positional, benannt, mit Standardwerten, auch variadisch). Sie sind **unveränderlich** – `var` ist im
Komponenten-Konstruktor ein Fehler (`Komponenten-Eigenschaften sind unveränderlich – verwende State<T> für veränderliche
Werte`). Für geteilten Zustand übergibst du den `State` selbst:

```texo
component Zaehler2(wert: State<Int>) {
    fn build(): View {
        return Row(spacing: 8.px, [
            Button("-").onClick(() => this.wert.value -= 1),
            Text("${this.wert.value}"),
            Button("+").onClick(() => this.wert.value += 1)
        ])
    }
}

component Eltern {
    private State<Int> menge = State(1)
    fn build(): View {
        return Column([
            Zaehler2(this.menge),                          // gemeinsamer State
            Text("Menge: ${this.menge.value}")
        ])
    }
}
```

Weitere Regeln:

- **Zustand**: `State<T>` (siehe [Reaktivität und Routing](reaktivitaet.md)) und `var`-Felder sind reaktiv. Ein
  `State`-Feld selbst wird nie neu zugewiesen – du änderst `.value`.
- **Lebenszyklus**: `onMount()` läuft im Browser nach dem ersten Rendern, `onDestroy()` beim Entfernen. Beide haben keine
  Parameter. Beim Server-Rendering (Compile-Zeit) läuft `onMount` nicht.
- **Modifier am Aufrufort** (`Zaehler().padding(16.px)`) werden auf das Wurzelelement der Komponente angewendet.
- **Kinder**: ein variadischer Parameter `...kinder: View` nimmt beliebig viele Views entgegen. Für Inhalt, der in eine
  fertig gestaltete Komponente *hinein* soll, gibt es `ChildPlaceholder()` (siehe [unten](#inhalt-übergeben-childplaceholder)).
- Komponenten können keine statischen Methoden haben; wiederverwendbare View-Fabriken sind normale Funktionen:

```texo
component Rahmen(titel: String, ...kinder: View) {
    fn build(): View {
        return Card(
            Heading(this.titel, level: 3),
            Column(spacing: 8.px, this.kinder)
        )
    }
}

fn Etikett(text: String): View => Text(text).pill().padding(horizontal: 8.px).background(Color.Indigo100)

component Seite {
    fn build(): View {
        return Rahmen("Tags", Etikett("neu"), Etikett("beliebt")).padding(16.px)
    }
}
```

### Inhalt übergeben: ChildPlaceholder

Eine Komponente bestimmt das **Aussehen**, der Aufrufer den **Inhalt**. Das ist typisch für Style-Bibliotheken: Der
Button ist fertig gestaltet (Farbe, Rundung, Hover), aber was darin steht, entscheidet der Benutzer. `ChildPlaceholder()`
markiert in `build()` die Stelle, an der dieser Inhalt erscheint:

```texo
package beispiel

import texo.ui.*
import texo.graphics.*

/// Fertig gestalteter Button – Icon und Beschriftung kommen vom Aufrufer.
component FancyButton(farbe: Color = Color.Indigo600) {
    fn build(): View => Button.plain()
        .content(Row(spacing: 8.px, [
            ChildPlaceholder("icon"),                      // benannter Platzhalter
            ChildPlaceholder(fallback: Text("Los"))        // unbenannter Platzhalter mit Ersatzinhalt
        ]))
        .padding(vertical: 10.px, horizontal: 18.px)
        .radius(12.px)
        .background(this.farbe)
        .textColor(Color.White)
        .hover(b => b.elevation(4.px))
}

component Seite {
    private State<Int> gespeichert = State(0)

    fn build(): View => Row(spacing: 12.px, [
        FancyButton()
            .slot("icon", Icon("star", size: 16.px))       // → ChildPlaceholder("icon")
            .content(Text("Speichern (${this.gespeichert.value})"))   // → ChildPlaceholder()
            .onClick(() => this.gespeichert.value += 1),
        FancyButton(farbe: Color.Rose500)                  // ohne Inhalt: Ersatzinhalt "Los"
    ])
}
```

- `.content(…)` füllt den **unbenannten** Platzhalter, `.slot("name", …)` einen **benannten**. Beide nehmen beliebig
  viele Views, Listen (`this.liste.value.map(x => Text(x))`) und bedingte Views.
- Der Inhalt gehört dem **Aufrufer**: `this` darin ist die aufrufende Komponente, und Zustandsänderungen aktualisieren
  ihn reaktiv. Die gestaltende Komponente sieht nur, wo er hinkommt.
- `fallback:` wird angezeigt, wenn der Aufrufer nichts übergibt.
- Ein Platzhalter hat **kein eigenes Element**: Der Inhalt landet direkt im umgebenden Element (im Beispiel in der `Row`).
  Gestalte deshalb das umgebende Element, nicht den Platzhalter.
- Der Compiler prüft alles: `.content(…)` an einer Komponente ohne Platzhalter, ein unbekannter Name bei `.slot(…)` oder
  ein Name, der kein fester Text ist, sind Fehler. Die Autovervollständigung bietet `.content`/`.slot` nur an
  Komponenten mit Platzhaltern an.
- Mit Server-Rendering und Hydration funktioniert das wie bei jedem anderen Element. Auch in vorkompilierten
  [Bibliotheken](bibliotheken.md) bleiben die Platzhalter Teil der Schnittstelle.

### Teile von außen gestalten: .part und .style

Modifier am Aufruf (`FancyButton().padding(8.px)`) gelten nur für das äußerste Element. Soll der Aufrufer auch
**innere** Elemente gestalten können, benennt die Komponente sie mit `.part("name")`. Der Aufrufer gestaltet sie dann
mit `.style("name", s => …)`:

```texo
package beispiel.teile

import texo.ui.*
import texo.graphics.*

component Karte {
    fn build(): View => Card(
        Text("Titel").fontWeight(FontWeight.SemiBold).part("titel"),
        Column([ChildPlaceholder()]).part("inhalt")
    )
}

component Seite {
    fn build(): View => Karte()
        .style("titel", s => s.textColor(Color.Rose600).fontSize(20.px))
        .style("inhalt", s => s.padding(8.px).hover(h => h.background(Color.Slate50)))
        .content(Text("Hallo"))
}
```

- Die Stile des Aufrufers **gewinnen** gegen die der Komponente: Sie bekommen eine höhere Spezifität (`.klasse.klasse`).
- Erlaubt sind alle Stil-Modifier und Varianten (`hover`, `dark`, `md` …) mit **konstanten** Werten. Für Werte, die
  sich ändern, eignen sich [Design-Tokens](ui-und-styling.md#design-tokens-theme) oder eine Eigenschaft der Komponente.
- Ereignisse und Attribute (`onClick`, `testId`) gehören an die Komponente selbst, nicht in `.style(…)`.
- Unbekannte Teilnamen sind ein Compilerfehler, der die vorhandenen Teile nennt. In [Bibliotheken](bibliotheken.md)
  stehen die Teile als `@Parts(…)` in der Schnittstelle.

### Kontext: Werte an alles darin weitergeben

Manche Einstellungen gelten für einen ganzen Bereich, z. B. „kompakte Größe“, „Formular deaktiviert“ oder die aktuelle
Sprache. Statt sie durch jede Komponente zu reichen, stellt ein Element sie mit `.provide(kontext, wert)` bereit. Jede
Komponente darin liest sie mit `kontext.value`:

```texo
package beispiel.kontext

import texo.ui.*
import texo.graphics.*

enum Dichte { Kompakt, Normal }

/// Wie eng Elemente stehen – Standard: Normal.
val AktuelleDichte = Context(Dichte.Normal)

component Eintrag(text: String) {
    fn build(): View => Text(this.text)
        .padding(AktuelleDichte.value == Dichte.Kompakt ? 4.px : 12.px)
}

component Liste {
    private State<Boolean> kompakt = State(false)

    fn build(): View => Column([
        Toggle(bind: this.kompakt, label: "Kompakt"),
        Column([Eintrag("Eins"), Eintrag("Zwei")])
            .provide(AktuelleDichte, this.kompakt.value ? Dichte.Kompakt : Dichte.Normal)
    ])
}
```

- Wo nichts bereitgestellt ist, gilt der Standardwert aus `Context(…)`.
- Bereitgestellte Werte dürfen reaktiv sein: Ändert sich der Wert, aktualisieren sich alle Stellen, die ihn lesen.
- `.provide` wirkt auf alles im Element, auch auf tief verschachtelte Komponenten und solche, die erst später
  erscheinen (`If`, `ForEach`). An einer Komponente (`Eintrag("x").provide(…)`) gilt es für deren ganzes `build()`.
- Lies `kontext.value` in `build()` oder in Feld-Initialisierern. In Ereignis-Handlern (`onClick`) gilt der
  Standardwert. Brauchst du den Wert dort, merke ihn dir in einem Feld: `private val dichte = AktuelleDichte.value`.
- Bibliotheken können Kontexte anbieten (`public val …= Context(…)`). Das Projekt stellt sie für seine Seiten bereit.

### Refs: Methoden einer Komponente von außen aufrufen

Ein Dialog, ein Karussell oder ein Formular hat Aktionen, die der Aufrufer auslösen will (`oeffnen()`, `weiter()`,
`zuruecksetzen()`). Mit `Ref<T>` und `.ref(…)` bekommt er Zugriff auf die Komponente:

```texo
package beispiel.refs

import texo.ui.*
import texo.graphics.*

component Dialog(titel: String) {
    private State<Boolean> offen = State(false)

    fn oeffnen(): Void { this.offen.value = true }
    fn schliessen(): Void { this.offen.value = false }

    fn build(): View => If(this.offen.value,
        Card(Text(this.titel), Button("Schließen").onClick(() => this.schliessen())))
}

component Seite {
    private val dialog = Ref<Dialog>()

    fn build(): View => Column([
        Button("Hilfe").onClick(() => this.dialog.value?.oeffnen()),
        Dialog("Hilfe").ref(this.dialog)
    ])
}
```

- `ref.value` ist die Komponente, solange sie angezeigt wird, sonst `null`. Deshalb wird mit `?.` aufgerufen. Das Lesen
  ist reaktiv: Eine Anzeige, die `this.dialog.value` liest, aktualisiert sich, wenn die Komponente erscheint oder
  verschwindet.
- Aufrufbar sind nur **öffentliche** Methoden und Felder. Private bleiben privat (Compilerfehler).
- `Ref<Dialog>` passt nur zu `Dialog`. `.ref(…)` gibt es nur für Komponenten und muss direkt beim Aufruf stehen.

### Befehle: @Command – Komponenten von überall ansprechen

Manchmal muss eine Stelle der App etwas in einer **ganz anderen** Komponente auslösen. Ein Beispiel: Nach dem Login
kommen neue Menüpunkte, und die Navigationsleiste soll sie anzeigen. Statt die Liste global zu machen, bekommt die
Navigationsleiste einen **Befehl**. Die Liste bleibt ihr privater Zustand:

```texo
package beispiel.befehle

import texo.ui.*
import texo.graphics.*

data class NavItem(titel: String, pfad: Url)

component NavBar {
    private State<List<NavItem>> items = State([NavItem("Start", "/")])

    /// Fügt einen Menüpunkt hinzu – aufrufbar von überall mit NavBar.navHinzufuegen(…)
    @Command
    fn navHinzufuegen(item: NavItem): Void {
        this.items.value.add(item)
    }

    fn build(): View => Row(spacing: 16.px, this.items.value.map(i => Link(i.titel, to: i.pfad)))
}

component Login {
    private State<String> name = State("")

    fn anmelden(): Void {
        // … Antwort vom Server erhalten, dann:
        NavBar.navHinzufuegen(NavItem("Profil", "/profil"))
        NavBar.navHinzufuegen(NavItem("Abmelden", "/logout"))
    }

    fn build(): View => Column([
        Input(bind: this.name, placeholder: "Name"),
        Button("Anmelden").onClick(() => this.anmelden())
    ])
}
```

- `Komponente.befehl(…)` ruft die Methode bei **jeder gerade angezeigten** Instanz der Komponente auf. Ist keine da,
  passiert nichts.
- **Eine von mehreren ansprechen:** Gib der Komponente beim Aufruf eine Id mit `.id("…")` und wähle sie mit
  `Komponente.at("…")` aus:

  ```
  NavBar().id("haupt")                    // oben
  NavBar().id("fuss")                     // unten

  NavBar.at("haupt").navHinzufuegen(NavItem("Profil", "/profil"))   // nur die obere
  NavBar.navHinzufuegen(NavItem("Hilfe", "/hilfe"))                 // ohne at(…): alle
  ```

  Mehrere Instanzen mit derselben Id bilden eine Gruppe und bekommen den Befehl alle. Die Id darf auch berechnet
  sein (`NavBar.at(this.bereich)`). Über `at(…)` sind nur Befehle erreichbar, keine anderen Methoden oder Felder.
- `@Command(queue: true)`: Ist gerade keine Instanz da, wartet der Aufruf und kommt an, sobald eine erscheint. Das ist
  praktisch, wenn die Antwort schneller da ist als die Komponente. Mehrere wartende Aufrufe kommen in ihrer Reihenfolge
  an. Mit `at("…")` wartet er auf eine Instanz mit genau dieser Id.
- Alles ist typgeprüft: Argumente wie bei einem normalen Methodenaufruf, eine Methode ohne `@Command` lässt sich so
  nicht aufrufen. Befehle sind öffentlich (nicht `private`) und geben nichts zurück.
- Die Oberfläche aktualisiert sich wie bei jeder Zustandsänderung. Mehrere Änderungen in einem Befehl werden gebündelt.
- Bibliotheken können Befehle anbieten (z. B. `Toasts.zeigen("Gespeichert")`). `@Command` steht dann in ihrer
  Schnittstelle.

**Was wofür?** `@Command` löst eine Aktion in allen Instanzen einer Komponente aus (oder in denen mit einer Id),
egal wo sie stehen. Ein
[Ref](#refs-methoden-einer-komponente-von-außen-aufrufen) spricht genau **eine** bestimmte Instanz an. Ein
[Kontext](#kontext-werte-an-alles-darin-weitergeben) gibt **Werte** an alles darunter weiter.

### Seiten

Mit `@Page(title:, path:, lang:, description:)` wird eine Komponente zu einer eigenständigen HTML-Seite
(alle Argumente müssen Konstanten sein):

```texo
@Page(title: "Meine App", path: "index.html", lang: "de", description: "Eine Demo")
public component Start {
    fn build(): View => Heading("Willkommen")
}
```

Ohne `@Page` wird die Komponente `App` (sonst `Main`, sonst die erste ohne Pflichtparameter) zu `index.html`. Details in
[Wie der Compiler arbeitet](compiler.md#seiten-und-einstiegspunkte).

Ein Pfad mit Platzhaltern wie `path: "/notiz/:id"` macht die Seite zu einer Route. Ihre Daten lädt ein Loader auf dem
Server (`@Load(ladeNotiz)`), siehe [Backend und Sicherheit](backend.md#seiten-mit-daten-vom-server-load).

Feste Abschnitte gehen vor Platzhaltern: `/kunden/neu` ist eine eigene Seite und wird nicht von `/kunden/:id`
verdeckt, `/kunden/:id/bearbeiten` geht vor `/kunden/:id/:tab`. Das gilt auf dem Server, im `TestClient` und im
`Router`, unabhängig von der Reihenfolge im Code.

## 9. Lambdas

```texo
fn lambdas(): Void {
    let a = () => 1                                      // ohne Parameter
    let b = (x: Int) => x + 1                            // mit Typ
    let c: (Int, Int) => Int = (x, y) => x * y           // Typen aus dem erwarteten Typ
    let d = [1, 2, 3].map(x => x * 2)                    // einzelner Parameter ohne Klammern
    let e = [1, 2, 3].reduce(0, (summe, x) => summe + x)
    let f = (n: Int) => {                                // Block-Körper mit return
        let q = n * n
        return q + 1
    }
    let g = [10, 20].map((x, i) => x + i)                // viele Listenfunktionen liefern auch den Index
    let h: (String) => Void = s => print(s)
    let i = async () => 42
}
```

- Ein Lambda ohne erwarteten Typ braucht Parametertypen: `Typ des Lambda-Parameters 'x' kann nicht abgeleitet werden`.
- Ein Lambda darf **weniger** Parameter haben als der erwartete Funktionstyp.
- Lambdas erfassen Variablen ihrer Umgebung (Closures).
- Stil-Lambdas wie `.hover(s => s.background(…))` sind ein Sonderfall: nur eine Kette von Stil-Modifiern ist erlaubt
  (siehe [UI und Styling](ui-und-styling.md#varianten)).

## 10. Null-Sicherheit und Smart Casts

Typen sind standardmäßig **nicht nullbar**. `T?` erlaubt zusätzlich `null`. Der Compiler verhindert Zugriffe auf
möglicherweise `null`-Werte.

| Syntax | Bedeutung |
|---|---|
| `s?.length` | sicherer Zugriff: Ergebnis `Int?`, `null` wenn `s` `null` ist |
| `s ?? "Standard"` | Elvis: Standardwert, wenn die linke Seite `null` ist |
| `s!!` | Behauptung „nicht null“ (Laufzeitfehler wird nicht geprüft – mit Bedacht einsetzen) |
| `if (s != null) { … }` | **Smart Cast**: im Block ist `s` ein `String` |

```texo
fn nullsicher(s: String?): Int {
    let laenge = s?.length                      // Int?
    let oder = s ?? "leer"                      // String
    if (s == null) { return 0 }                 // frühes return engt den Rest des Blocks ein
    return s.length                             // s ist hier String
}

fn smartCasts(a: String?, b: String?): Boolean {
    let x = a != null && a.length > 3           // rechts von && ist a nicht null
    let y = b == null || b.isEmpty()            // rechts von || ist b nicht null
    let z = a != null ? a.length : 0
    return x || y || z > 1
}
```

Smart Casts gelten für **lokale Variablen und Parameter** (`let`, `var`, Funktionsparameter), nicht für Felder:
`if (this.name != null) { this.name.length }` ist ein Fehler. Kopiere das Feld in eine lokale Variable
(`let n = this.name`) oder verwende `?.`/`!!`.

Typische Fehlermeldungen: `'length' kann nicht direkt auf einem möglicherweise null-Wert ('String?') aufgerufen werden`,
`Typkonflikt: erwartet 'String', gefunden 'String?'` – siehe [Fehlermeldungen](fehlermeldungen.md).

## 11. Operatoren

Von höchster zu niedrigster Priorität:

| Stufe | Operatoren | Assoziativität |
|---|---|---|
| Postfix | `a.b`, `a?.b`, `a(…)`, `a[i]`, `a!!`, `a++`, `a--` | links |
| Präfix | `!a`, `-a`, `+a`, `await a` | rechts |
| Typumwandlung | `a as T` | links |
| Multiplikativ | `*`, `/`, `%` | links |
| Additiv | `+`, `-` | links |
| Bereich | `a..b` (inklusiv), `a..<b` (exklusiv) | – |
| Vergleich | `<`, `>`, `<=`, `>=`, `is`, `!is` | links |
| Gleichheit | `==`, `!=` | links |
| Logisch UND | `&&` | links |
| Logisch ODER | `\|\|` | links |
| Elvis | `??` | links |
| Ternär | `bedingung ? a : b` | rechts |
| Zuweisung | `=`, `+=`, `-=`, `*=`, `/=`, `%=` | rechts |

Hinweise:

- `??` bindet **schwächer** als `||`: `a ?? b || c` bedeutet `a ?? (b || c)`.
- `+` verkettet Strings (`"a" + 1` → `"a1"`) und Listen (`[1] + [2]`). `+=` funktioniert auch bei `String`.
- `/` auf zwei `Int` ist eine ganzzahlige Division (gegen 0 abgeschnitten), mit mindestens einem `Float` eine
  Gleitkommadivision. `%` ist der Rest.
- `==` ist **strukturell** für Datenklassen, Listen und Maps, ansonsten Wertvergleich (Zahlen, Strings, Enums) bzw.
  Identität. Der Vergleich unvereinbarer Typen (`1 == "x"`) ist ein Fehler.
- `<`, `>`, … funktionieren für Zahlen und Strings.
- `x as Typ` ist eine Typumwandlung zur Compile-Zeit (prüft nur Kompatibilität, keine Laufzeitprüfung).
- Unäres Minus gilt auch für `Length` und `Angle`: `Transform.translateY(-4.px)`.
- Zuweisungsziele: Variablen, Felder, Listen-/Map-Einträge (`xs[0] = 1`, `karte["a"] = 2`). `Float` kann nicht mit
  `+=` zu einem `Int` addiert werden.

## 12. Zeichenketten und Interpolation

- `"…"` und `'…'` sind einzeilige Strings, `"""…"""` ein mehrzeiliger String (Einrückung bleibt erhalten).
- Escapes: `\n \t \r \0 \\ \" \' \$ é \u{1F600}`.
- **Interpolation** mit `${ausdruck}` – nur in `"…"`- und `"""…"""`-Strings. Jeder Ausdruck ist erlaubt, auch
  Methodenaufrufe, `?:` und `??`. Werte werden wie bei `toString()` formatiert; `null` erscheint als `null`.
- Strings sind unveränderlich; `s[i]` liefert ein Zeichen als `String`.

```texo
fn strings(name: String, anzahl: Int, titel: String?): String {
    let einfach = "Hallo ${name}!"
    let rechnung = "In ${anzahl} Tagen sind es ${anzahl * 24} Stunden"
    let bedingt = "${anzahl == 1 ? "ein Tag" : "${anzahl} Tage"}"
    let standard = "Titel: ${titel ?? "ohne"}"
    let roh = 'Einfache Anführungszeichen: kein ${name}'
    let mehrzeilig = """
        Zeile 1: ${name}
        Zeile 2
    """
    let escape = "Preis: \${nicht interpoliert} und é"
    return einfach + rechnung + bedingt + standard + roh + mehrzeilig + escape
}
```

## 13. Eingebaute Typen und Funktionen (texo.core)

Die Methoden werden direkt zu JavaScript kompiliert (`@js`-Templates in `crates/texo-stdlib/std/core.texo`).

**`Int` / `Float`**: `toString()`, `toFloat()`, `toInt()`, `round()`, `floor()`, `ceil()`, `abs()`, `clamp(min, max)`,
`toFixed(n)` (Float), `isEven()`/`isOdd()`, `pad(width, char)`, Formatierung `formatNumber(locale)` (bei `Float`
zusätzlich `digits`: `formatNumber(locale, digits)`), `formatCompact()`, `formatCurrency(currency, locale)`,
`formatPercent(digits)` (Float); Einheiten `px rem em percent vw vh fr ms s
deg turn` (siehe [UI und Styling](ui-und-styling.md#einheiten)).

**`String`**: `length`, `upper()`, `lower()`, `trim()`, `contains()`, `startsWith()`, `endsWith()`, `split()`, `replace()`,
`substring(start, end?)`, `indexOf()`, `charAt()`, `toInt(): Int?`, `toFloat(): Float?`, `isEmpty()`, `isNotEmpty()`,
`isBlank()`, `padStart()`, `padEnd()`, `repeat()`, `capitalize()`, `chars()`, `lines()`, `words()`.

**`List<T>`**
- lesen: `size`, `indices`, `isEmpty()`, `isNotEmpty()`, `get(i)`, `xs[i]`, `first()`, `last()`, `contains()`, `indexOf()`,
  `find()`, `findIndex()`, `any()`, `all()`, `count()`, `min()`, `max()`, `minBy()`, `maxBy()`
- umformen (liefern neue Listen): `map()`, `filter()`, `flatMap()`, `sorted()`, `sortedBy()`, `sortedByDescending()`,
  `reversed()`, `take()`, `drop()`, `takeLast()`, `slice()`, `distinct()`, `copy()`, `groupBy()`, `chunked()`,
  `shuffled()`, `xs + ys`
- aggregieren: `forEach()`, `reduce(initial, op)`, `sum()`, `sumOf()`, `average()`, `join(sep)`
- **verändern** (mutierend, lösen Reaktivität aus): `add()`, `addAll()`, `insert()`, `removeAt()`, `remove()`,
  `removeWhere()`, `clear()`, `set()`, `sortBy()`, `reverse()`, `xs[i] = v`

**`Map<K, V>`**: `size`, `get(k): V?`, `m[k]` (ebenfalls `V?`), `getOrDefault()`, `set()`, `m[k] = v`, `has()`,
`remove()`, `clear()`, `keys()`, `values()`, `entries()`, `forEach()`, `isEmpty()`.

**Weitere Typen und Objekte**

| Name | Inhalt |
|---|---|
| `Math` | `PI`, `E`, `min`, `max`, `abs`, `sqrt`, `pow`, `floor`, `ceil`, `round`, `sin`, `cos`, `tan`, `atan2`, `log`, `exp`, `sign`, `clamp`, `lerp` |
| `Random` | `int(min, max)`, `float()`, `bool()`, `pick(liste)`, `uuid()` |
| `Console` | `log`, `warn`, `error`; `print(wert)` ist die Kurzform |
| `Json` | `stringify(wert, pretty)`, `parse<T>(text)` |
| `Storage` | `get`, `set`, `remove`, `getJson<T>`, `setJson`, `clear` (localStorage) |
| `Http` | `get`, `getJson<T>`, `postJson<T>`, `putJson<T>`, `post`, `delete` – alle liefern `Future<…>` |
| `Timer` | `every(dauer, aktion)`, `after(dauer, aktion)`, `delay(dauer)` (zum `await`en), `stop()` |
| `DateTime` | `now()`, `of(ts)`, `parse(text)`, `create(y, m, d, …)`, Felder `year month day hour minute second weekday timestamp`, `addDays/addHours/addMinutes`, `daysUntil`, `isBefore/isAfter`, `format(muster)`, `toLocaleDate/Time`, `toIso` |
| `Clipboard` | `copy(text)` |
| `Window` | `width`, `height`, `setTitle`, `open(url)`, `alert`, `confirm`, `scrollToTop` |
| `effect(f)`, `batch(f)`, `untrack(f)` | Reaktivitätsprimitive, siehe [Reaktivität und Routing](reaktivitaet.md) |

```texo
fn standardbibliothek(): Void {
    let xs = [3, 1, 2]
    let sortiert = xs.sorted()
    let summe = xs.sum()
    let gerade = xs.filter(x => x.isEven())
    let text = xs.map(x => "Nr. ${x}").join(", ")
    let gruppen = xs.groupBy(x => x % 2)
    let zahl = "42".toInt() ?? 0
    let preis = 1234.5.formatCurrency("EUR", "de-DE")
    let heute = DateTime.now().format("dd.MM.yyyy")
    let w = Math.max(1, 2)
    let id = Random.uuid()
    Timer.after(1.s, () => print("später"))
    Storage.set("schluessel", "wert")
}
```

## 14. Kompilierzeit-Auswertung

Der Compiler wertet **konstante Ausdrücke** bereits beim Übersetzen aus: Literale, Top-Level-`const`s, Operatoren,
reine Standardbibliotheksaufrufe (`Color.hex(…)`, `Color.Red.opacity(0.5)`, `LinearGradient.diagonal(…)`,
`Shadow.SoftGlow(…)`, `16.px`, …) und Ternäre mit konstanten Zweigen. Das Ergebnis ist statisches CSS statt
Laufzeitcode – ein Design-System aus `const`s kostet zur Laufzeit nichts:

```texo
const Akzent = Color.hex("#6366f1")
const Flaeche = Color.Slate900
const Leuchten = Shadow.SoftGlow(Akzent.opacity(0.35))
const Rundung = 18.px

component Kachel {
    fn build(): View {
        return Card(Text("Hallo"))
            .background(Flaeche)
            .radius(Rundung)
            .shadow(Leuchten)
    }
}
```

Nicht konstant sind lokale Variablen (`let`), Zustand, eigene Funktionen und `@impure`-Aufrufe
(`Random`, `DateTime.now()`, `Storage`, …). Werte, die sich zur Laufzeit ändern, werden an Bindings gehängt –
siehe [UI und Styling](ui-und-styling.md#statische-und-dynamische-stile).

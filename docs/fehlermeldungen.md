<!-- Übernommen aus LearNivram/Texo (docs/fehlermeldungen.md) mit scripts/docs-uebernehmen.mjs – bitte dort ändern. -->

# Fehlermeldungen und ihre Behebung

Der Texo-Compiler meldet Fehler auf Deutsch, mit Dateiname, Zeile und Spalte, einem Codeausschnitt und – wo möglich – einem
**Hinweis**. Mehrere Fehler werden auf einmal gemeldet (der Parser synchronisiert sich nach einem Fehler neu). Warnungen
brechen den Build nicht ab; Fehler lassen `texo build` mit Exit-Code 1 enden.

```text
src/Beispiel.texo:8:17: Fehler: Typkonflikt: erwartet 'String', gefunden 'String?'
 8 | let t: String = s
   |                 ^
   = Hinweis: Der Wert kann null sein – verwende '?? standardwert', '!!' oder prüfe auf null
```

Alle Meldungen unten stammen **unverändert aus dem Compiler** (`texo check`); jeder Fehlerfall ist mit einer korrigierten Fassung
versehen, die ebenfalls geprüft wurde. Die Quelltexte sind vollständige Dateien, die Zeilennummern entsprechen den gezeigten Listings
(Zeile 1 ist die `package`-Zeile).

**Inhalt**

- [Typen und Zuweisungen](#typen-und-zuweisungen)
- [Null-Sicherheit](#null-sicherheit)
- [Namen und Mitglieder](#namen-und-mitglieder)
- [Aufrufe und Argumente](#aufrufe-und-argumente)
- [Funktionen](#funktionen)
- [Komponenten und Zustand](#komponenten-und-zustand)
- [match, Klassen, Interfaces](#match-klassen-interfaces)
- [Stil-Lambdas und Icons](#stil-lambdas-und-icons)
- [Syntaxfehler](#syntaxfehler)

---

## Typen und Zuweisungen

### Typkonflikt

Ein Wert hat nicht den erwarteten Typ. Der Compiler konvertiert nie stillschweigend (nur `Int` → `Float` wird automatisch erweitert).

<!-- nocheck -->
```texo
package beispiel

import texo.ui.*
import texo.graphics.*

fn demo(): Void {
    let alter: Int = "zwölf"
}
```

```text
src/Beispiel.texo:7:22: Fehler: Typkonflikt: erwartet 'Int', gefunden 'String'
 7 |     let alter: Int = "zwölf"
   |                      ^^^^^^^
```

Behoben:

```texo
package beispiel

import texo.ui.*
import texo.graphics.*

fn demo(): Void {
    let alter: Int = 12
}
```

### Float statt Int

`Float` nach `Int` verliert Nachkommastellen und muss ausdrücklich gewählt werden: `.toInt()` (abschneiden), `.round()`, `.floor()` oder `.ceil()`.

<!-- nocheck -->
```texo
package beispiel

import texo.ui.*
import texo.graphics.*

fn demo(): Void {
    let preis = 19.99
    let euro: Int = preis
}
```

```text
src/Beispiel.texo:8:21: Fehler: Typkonflikt: erwartet 'Int', gefunden 'Float'
 8 |     let euro: Int = preis
   |                     ^^^^^
   = Hinweis: Verwende .toInt() oder .round()
```

Behoben:

```texo
package beispiel

import texo.ui.*
import texo.graphics.*

fn demo(): Void {
    let preis = 19.99
    let euro: Int = preis.floor()
}
```

### Zahl als Text

Zahlen werden nicht automatisch zu `String`. Interpolation oder `toString()` verwenden.

<!-- nocheck -->
```texo
package beispiel

import texo.ui.*
import texo.graphics.*

fn demo(): Void {
    let anzahl = 5
    let text: String = anzahl
}
```

```text
src/Beispiel.texo:8:24: Fehler: Typkonflikt: erwartet 'String', gefunden 'Int'
 8 |     let text: String = anzahl
   |                        ^^^^^^
   = Hinweis: Verwende .toString() oder eine Interpolation "${…}"
```

Behoben:

```texo
package beispiel

import texo.ui.*
import texo.graphics.*

fn demo(): Void {
    let anzahl = 5
    let text: String = "${anzahl}"
}
```

### Einheit vergessen

Längen, Dauern und Winkel sind eigene Typen. Eine nackte Zahl ist ein `Int`. Gib `.px`, `.rem`, `.percent`, `.ms`, `.deg` … an.

<!-- nocheck -->
```texo
package beispiel

import texo.ui.*
import texo.graphics.*

component Karte {
    fn build(): View {
        return Card(Text("x")).width(360)
    }
}
```

```text
src/Beispiel.texo:8:38: Fehler: Argument 'value' erwartet 'Length', erhalten 'Int'
 8 |         return Card(Text("x")).width(360)
   |                                      ^^^
   = Hinweis: Gib eine Einheit an, z. B. 360.px
```

Behoben:

```texo
package beispiel

import texo.ui.*
import texo.graphics.*

component Karte {
    fn build(): View {
        return Card(Text("x")).width(360.px)
    }
}
```

### Farbe als String

Farben sind `Color`-Werte, keine Strings. Hex-Farben mit `Color.hex("…")`, sonst Palette (`Color.Indigo500`).

<!-- nocheck -->
```texo
package beispiel

import texo.ui.*
import texo.graphics.*

component Karte {
    fn build(): View {
        return Text("x").textColor("red")
    }
}
```

```text
src/Beispiel.texo:8:36: Fehler: Argument 'color' erwartet 'Paint', erhalten 'String'
 8 |         return Text("x").textColor("red")
   |                                    ^^^^^
```

Behoben:

```texo
package beispiel

import texo.ui.*
import texo.graphics.*

component Karte {
    fn build(): View {
        return Text("x").textColor(Color.Red)
    }
}
```

### Unsichere oder ungeprüfte URL

`Link(to:)` und `Image(src:)` erwarten eine `Url`. Textliterale prüft der Compiler: Erlaubt sind relative Pfade, `#anker`, `?abfragen` sowie `http:`, `https:`, `mailto:`, `tel:`, `sms:` und `data:image/`. Bei einem interpolierten Text muss der feste Anfang das Schema festlegen (`"/profil/${id}"`, nicht `"${adresse}"`). Ein `String` aus Daten wird zur Laufzeit mit `Url.parse` geprüft, das bei `javascript:` und anderen Schemata `null` liefert.

<!-- nocheck -->
```texo
package beispiel

import texo.ui.*

data class Profil(name: String, website: String)

component Karte(profil: Profil) {
    fn build(): View {
        return Link(this.profil.name, to: this.profil.website)
    }
}
```

```text
src/Beispiel.texo:9:43: Fehler: Argument 'to' erwartet 'Url', erhalten 'String'
 9 |         return Link(this.profil.name, to: this.profil.website)
   |                                           ^^^^^^^^^^^^^^^^^^^
   = Hinweis: Prüfe den Text zur Laufzeit: Url.parse(text) ?? "#"
```

Behoben:

```texo
package beispiel

import texo.ui.*

data class Profil(name: String, website: String)

component Karte(profil: Profil) {
    fn build(): View {
        return Link(this.profil.name, to: Url.parse(this.profil.website) ?? "#")
    }
}
```

### Bedingung ist kein Boolean

`if`, `while`, `?:` und `!` verlangen `Boolean`; es gibt keine „truthy“-Werte.

<!-- nocheck -->
```texo
package beispiel

import texo.ui.*
import texo.graphics.*

fn demo(n: Int): Void {
    if (n) { print("an") }
}
```

```text
src/Beispiel.texo:7:8: Fehler: Erwartet Boolean, gefunden 'Int'
 7 |     if (n) { print("an") }
   |        ^^^
```

Behoben:

```texo
package beispiel

import texo.ui.*
import texo.graphics.*

fn demo(n: Int): Void {
    if (n != 0) { print("an") }
}
```

### Vergleich unvereinbarer Typen

`==` zwischen Typen, die nie gleich sein können, ist ein Fehler.

<!-- nocheck -->
```texo
package beispiel

import texo.ui.*
import texo.graphics.*

fn demo(n: Int): Boolean => n == "5"
```

```text
src/Beispiel.texo:6:29: Fehler: 'Int' und 'String' können nie gleich sein
 6 | fn demo(n: Int): Boolean => n == "5"
   |                             ^^^^^^^^
```

Behoben:

```texo
package beispiel

import texo.ui.*
import texo.graphics.*

fn demo(n: Int): Boolean => n == 5
```

### Unvereinbare Listenelemente

Alle Elemente einer Liste brauchen einen gemeinsamen Typ.

<!-- nocheck -->
```texo
package beispiel

import texo.ui.*
import texo.graphics.*

fn demo(): Void {
    let xs = [1, "zwei", 3]
}
```

```text
src/Beispiel.texo:7:18: Fehler: Listenelemente haben unvereinbare Typen: 'Int' und 'String'
 7 |     let xs = [1, "zwei", 3]
   |                  ^^^^^^
```

Behoben:

```texo
package beispiel

import texo.ui.*
import texo.graphics.*

fn demo(): Void {
    let xs: List<Any> = [1, "zwei", 3]
}
```

### Leere Liste oder Map ohne Typ

Aus `[]` bzw. `[:]` kann kein Elementtyp abgeleitet werden.

<!-- nocheck -->
```texo
package beispiel

import texo.ui.*
import texo.graphics.*

fn demo(): Void {
    let namen = []
}
```

```text
src/Beispiel.texo:7:17: Fehler: Der Elementtyp der leeren Liste ist unbekannt
 7 |     let namen = []
   |                 ^^
   = Hinweis: Gib den Typ an: let xs: List<Int> = [] oder List<Int>()
```

Behoben:

```texo
package beispiel

import texo.ui.*
import texo.graphics.*

fn demo(): Void {
    let namen: List<String> = []
}
```

### `null` ohne Typ

Aus dem Literal `null` lässt sich kein Typ ableiten.

<!-- nocheck -->
```texo
package beispiel

import texo.ui.*
import texo.graphics.*

fn demo(): Void {
    let titel = null
}
```

```text
src/Beispiel.texo:7:9: Fehler: Der Typ von 'titel' kann aus 'null' nicht abgeleitet werden
 7 |     let titel = null
   |         ^^^^^
   = Hinweis: Gib den Typ an, z. B. let titel: String? = null
```

Behoben:

```texo
package beispiel

import texo.ui.*
import texo.graphics.*

fn demo(): Void {
    let titel: String? = null
}
```

---

## Null-Sicherheit

### Zugriff auf einen möglicherweise null-Wert

Auf `T?` darf nur mit `?.` zugegriffen werden – oder nachdem eine Prüfung den Wert zu `T` eingeengt hat.

<!-- nocheck -->
```texo
package beispiel

import texo.ui.*
import texo.graphics.*

fn laenge(s: String?): Int {
    return s.length
}
```

```text
src/Beispiel.texo:7:14: Fehler: 'length' kann nicht direkt auf einem möglicherweise null-Wert ('String?') aufgerufen werden
 7 |     return s.length
   |              ^^^^^^
   = Hinweis: Verwende '?.' oder prüfe vorher mit 'if (x != null)'
```

Behoben:

```texo
package beispiel

import texo.ui.*
import texo.graphics.*

fn laenge(s: String?): Int {
    return s?.length ?? 0
}
```

### Nullbarer Wert für nicht-nullbaren Typ

`T?` ist nicht zu `T` zuweisbar. Standardwert mit `??`, Prüfung mit `if` oder (bewusst riskant) `!!`.

<!-- nocheck -->
```texo
package beispiel

import texo.ui.*
import texo.graphics.*

fn gruss(name: String?): String {
    let n: String = name
    return "Hallo " + n
}
```

```text
src/Beispiel.texo:7:21: Fehler: Typkonflikt: erwartet 'String', gefunden 'String?'
 7 |     let n: String = name
   |                     ^^^^
   = Hinweis: Der Wert kann null sein – verwende '?? standardwert', '!!' oder prüfe auf null
```

Behoben:

```texo
package beispiel

import texo.ui.*
import texo.graphics.*

fn gruss(name: String?): String {
    let n: String = name ?? "Gast"
    return "Hallo " + n
}
```

### Smart Cast gilt nicht für Felder

Die Prüfung `if (x != null)` engt nur lokale Variablen und Parameter ein, keine Felder (sie könnten sich zwischenzeitlich ändern). Kopiere das Feld in eine lokale Variable.

<!-- nocheck -->
```texo
package beispiel

import texo.ui.*
import texo.graphics.*

class Profil {
    var spitzname: String? = null

    fn laenge(): Int {
        if (this.spitzname != null) {
            return this.spitzname.length
        }
        return 0
    }
}
```

```text
src/Beispiel.texo:11:35: Fehler: 'length' kann nicht direkt auf einem möglicherweise null-Wert ('String?') aufgerufen werden
 11 |             return this.spitzname.length
    |                                   ^^^^^^
    = Hinweis: Verwende '?.' oder prüfe vorher mit 'if (x != null)'
```

Behoben:

```texo
package beispiel

import texo.ui.*
import texo.graphics.*

class Profil {
    var spitzname: String? = null

    fn laenge(): Int {
        let s = this.spitzname
        if (s != null) {
            return s.length
        }
        return 0
    }
}
```

### Überflüssiges `??` (Warnung)

Eine Warnung, kein Fehler: Die linke Seite kann nie `null` sein.

<!-- nocheck -->
```texo
package beispiel

import texo.ui.*
import texo.graphics.*

fn demo(): Void {
    let a = 1
    let b = a ?? 2
}
```

```text
src/Beispiel.texo:8:13: Warnung: Die linke Seite von '??' ist nie null
 8 |     let b = a ?? 2
   |             ^
```

Behoben:

```texo
package beispiel

import texo.ui.*
import texo.graphics.*

fn demo(): Void {
    let a = 1
    let b = a
}
```

---

## Namen und Mitglieder

### Unbekannter Name / fehlender Import

Der Compiler weiß, in welchem Paket der Name definiert ist, und schlägt den Import vor.

<!-- nocheck -->
```texo
package beispiel

component Gruss {
    fn build(): View {
        return Text("Hallo")
    }
}
```

```text
src/Beispiel.texo:4:17: Fehler: Unbekannter Typ 'View'
 4 |     fn build(): View {
   |                 ^^^^
   = Hinweis: 'View' ist in 'texo.ui' definiert – füge 'import texo.ui.*' hinzu
src/Beispiel.texo:5:16: Fehler: Unbekannter Name 'Text'
 5 |         return Text("Hallo")
   |                ^^^^
   = Hinweis: 'Text' ist in 'texo.ui' definiert – füge 'import texo.ui.*' hinzu
```

Behoben:

```texo
package beispiel

import texo.ui.*

component Gruss {
    fn build(): View {
        return Text("Hallo")
    }
}
```

### Tippfehler bei Typ, Methode oder Variable

Bei ähnlichen Namen erscheint ein „Meintest du …?“-Hinweis (Editierabstand inkl. Buchstabendreher).

<!-- nocheck -->
```texo
package beispiel

import texo.ui.*
import texo.graphics.*

fn demo(): Void {
    let titel: Strin = "x"
    let n = "abc".lenght
}
```

```text
src/Beispiel.texo:7:16: Fehler: Unbekannter Typ 'Strin'
 7 |     let titel: Strin = "x"
   |                ^^^^^
   = Hinweis: Meintest du 'String'?
src/Beispiel.texo:8:19: Fehler: Typ 'String' hat kein Mitglied 'lenght'
 8 |     let n = "abc".lenght
   |                   ^^^^^^
   = Hinweis: Meintest du 'length'?
```

Behoben:

```texo
package beispiel

import texo.ui.*
import texo.graphics.*

fn demo(): Void {
    let titel: String = "x"
    let n = "abc".length
}
```

### Namen aus JavaScript, CSS oder React

Wer aus einer anderen Sprache kommt, schreibt oft deren Namen. Texo kennt die häufigsten und schlägt das
Gegenstück vor, wenn der Typ es hat: `length` → `size` bei Listen, `push` → `add`, `toUpperCase` → `upper`,
`includes` → `contains`, `onPress` → `onClick`, `borderRadius` → `radius`, `color` → `textColor`,
`Input(value: …)` → `Input(bind: …)`. Für `parseInt`, `setTimeout`, `setInterval`, `Date`, `fetch` und `useState`
nennt der Hinweis den Texo-Weg. Ist ein Name ein Parameter des Elements, sagt der Hinweis das ebenfalls.

<!-- nocheck -->
```texo
package beispiel

import texo.ui.*
import texo.graphics.*

fn demo(namen: List<String>): View {
    let n = namen.length
    return Input().placeholder("Name")
}
```

```text
src/Beispiel.texo:7:19: Fehler: Typ 'List<String>' hat kein Mitglied 'length'
 7 |     let n = namen.length
   |                   ^^^^^^
   = Hinweis: Meintest du 'size'?
src/Beispiel.texo:8:20: Fehler: Typ 'Input' hat kein Mitglied 'placeholder'
 8 |     return Input().placeholder("Name")
   |                    ^^^^^^^^^^^
   = Hinweis: 'placeholder' ist ein Parameter, kein Modifier: Input(placeholder: …)
```

Behoben:

```texo
package beispiel

import texo.ui.*
import texo.graphics.*

fn demo(namen: List<String>): View {
    let n = namen.size
    return Input(placeholder: "Name")
}
```

### Modifier nicht für diesen Elementtyp

Layout-Modifier wie `spacing` oder `alignment` gibt es nur für Container (Stack, Row, Column, Box, Grid, Card, …). Der Hinweis nennt, wo der Modifier verfügbar ist.

<!-- nocheck -->
```texo
package beispiel

import texo.ui.*
import texo.graphics.*

component Karte {
    fn build(): View {
        return Text("x").spacing(4.px)
    }
}
```

```text
src/Beispiel.texo:8:26: Fehler: '.spacing()' ist für 'Text' nicht verfügbar
 8 |         return Text("x").spacing(4.px)
   |                          ^^^^^^^
   = Hinweis: '.spacing()' gibt es nur für: Container (z. B. Card, Stack, Box, Grid)
```

Behoben:

```texo
package beispiel

import texo.ui.*
import texo.graphics.*

component Karte {
    fn build(): View {
        return Column(spacing: 4.px, [Text("x")])
    }
}
```

### Unveränderliche Variable

`let` ist unveränderlich. Verwende `var`.

<!-- nocheck -->
```texo
package beispiel

import texo.ui.*
import texo.graphics.*

fn demo(): Void {
    let zaehler = 0
    zaehler += 1
}
```

```text
src/Beispiel.texo:8:5: Fehler: 'zaehler' ist unveränderlich
 8 |     zaehler += 1
   |     ^^^^^^^
   = Hinweis: Deklariere die Variable mit 'var' statt 'let'
```

Behoben:

```texo
package beispiel

import texo.ui.*
import texo.graphics.*

fn demo(): Void {
    var zaehler = 0
    zaehler += 1
}
```

### Doppelte Deklaration

Ein Name darf in einem Gültigkeitsbereich nur einmal deklariert werden.

<!-- nocheck -->
```texo
package beispiel

import texo.ui.*
import texo.graphics.*

fn demo(): Void {
    let a = 1
    let a = 2
}
```

```text
src/Beispiel.texo:8:9: Fehler: 'a' ist in diesem Gültigkeitsbereich bereits deklariert
 8 |     let a = 2
   |         ^
```

Behoben:

```texo
package beispiel

import texo.ui.*
import texo.graphics.*

fn demo(): Void {
    let a = 1
    let b = 2
}
```

### Zugriff auf privates Mitglied

`private` gilt nur innerhalb der Klasse; `protected` zusätzlich in Unterklassen.

<!-- nocheck -->
```texo
package beispiel

import texo.ui.*
import texo.graphics.*

class Konto {
    private var stand: Int = 0
}

fn demo(): Void {
    let k = Konto()
    k.stand = 5
}
```

```text
src/Beispiel.texo:12:7: Fehler: 'stand' ist privat in 'Konto'
 12 |     k.stand = 5
    |       ^^^^^
```

Behoben:

```texo
package beispiel

import texo.ui.*
import texo.graphics.*

class Konto {
    var stand: Int = 0
}

fn demo(): Void {
    let k = Konto()
    k.stand = 5
}
```

---

## Aufrufe und Argumente

### Fehlendes Argument

Parameter ohne Standardwert müssen übergeben werden.

<!-- nocheck -->
```texo
package beispiel

import texo.ui.*
import texo.graphics.*

component Bild {
    fn build(): View {
        return Image()
    }
}
```

```text
src/Beispiel.texo:8:16: Fehler: Fehlendes Argument 'src: String'
 8 |         return Image()
   |                ^^^^^^^
```

Behoben:

```texo
package beispiel

import texo.ui.*
import texo.graphics.*

component Bild {
    fn build(): View {
        return Image("/logo.png", alt: "Logo")
    }
}
```

### Unbekannter Parameter

Benannte Argumente müssen existieren; der Hinweis listet die gültigen Namen.

<!-- nocheck -->
```texo
package beispiel

import texo.ui.*
import texo.graphics.*

component Karte {
    fn build(): View {
        return Text("x").padding(oben: 1.px)
    }
}
```

```text
src/Beispiel.texo:8:34: Fehler: Unbekannter Parameter 'oben'
 8 |         return Text("x").padding(oben: 1.px)
   |                                  ^^^^^^^^^^
   = Hinweis: Parameter: all, vertical, horizontal, top, right, bottom, left
```

Behoben:

```texo
package beispiel

import texo.ui.*
import texo.graphics.*

component Karte {
    fn build(): View {
        return Text("x").padding(top: 1.px)
    }
}
```

### Zu viele Argumente

Mehr Argumente als Parameter.

<!-- nocheck -->
```texo
package beispiel

import texo.ui.*
import texo.graphics.*

fn demo(): Void {
    let t = Text("a", 1)
}
```

```text
src/Beispiel.texo:7:23: Fehler: Zu viele Argumente (erwartet 1)
 7 |     let t = Text("a", 1)
   |                       ^
```

Behoben:

```texo
package beispiel

import texo.ui.*
import texo.graphics.*

fn demo(): Void {
    let t = Text("a")
}
```

### Typargument nicht ableitbar

Bei generischen Aufrufen ohne Argumente, die den Typ festlegen, musst du ihn angeben.

<!-- nocheck -->
```texo
package beispiel

import texo.ui.*
import texo.graphics.*

fn demo(): Void {
    let m = Map()
}
```

```text
src/Beispiel.texo:7:13: Fehler: Typargument 'K' kann nicht abgeleitet werden
 7 |     let m = Map()
   |             ^^^^^
   = Hinweis: Gib es explizit an, z. B. Map<…>(…) oder annotiere die Variable
src/Beispiel.texo:7:13: Fehler: Typargument 'V' kann nicht abgeleitet werden
 7 |     let m = Map()
   |             ^^^^^
   = Hinweis: Gib es explizit an, z. B. Map<…>(…) oder annotiere die Variable
```

Behoben:

```texo
package beispiel

import texo.ui.*
import texo.graphics.*

fn demo(): Void {
    let m = Map<String, Int>()
}
```

### Nicht direkt erzeugbare Typen

`Stack` wird über seine Fabriken erzeugt (`Stack.vertical`, `.horizontal`, `.layered`) oder über `Column`/`Row`.

<!-- nocheck -->
```texo
package beispiel

import texo.ui.*
import texo.graphics.*

fn demo(): Void {
    let s = Stack()
}
```

```text
src/Beispiel.texo:7:13: Fehler: 'Stack' kann nicht direkt erzeugt werden
 7 |     let s = Stack()
   |             ^^^^^
   = Hinweis: Verwende Stack.vertical(…) oder Stack.horizontal(…) oder Stack.layered(…)
```

Behoben:

```texo
package beispiel

import texo.ui.*
import texo.graphics.*

fn demo(): Void {
    let s = Column()
}
```

### Lambda-Parametertyp nicht ableitbar

Ohne erwarteten Funktionstyp brauchen Lambda-Parameter eine Typangabe.

<!-- nocheck -->
```texo
package beispiel

import texo.ui.*
import texo.graphics.*

fn demo(): Void {
    let verdoppeln = x => x * 2
}
```

```text
src/Beispiel.texo:7:22: Fehler: Typ des Lambda-Parameters 'x' kann nicht abgeleitet werden
 7 |     let verdoppeln = x => x * 2
   |                      ^
   = Hinweis: Gib ihn an: (x: Typ) => …
```

Behoben:

```texo
package beispiel

import texo.ui.*
import texo.graphics.*

fn demo(): Void {
    let verdoppeln = (x: Int) => x * 2
}
```

---

## Funktionen

### Fehlendes return

Eine Funktion mit Rückgabetyp muss auf **jedem** Pfad einen Wert liefern.

<!-- nocheck -->
```texo
package beispiel

import texo.ui.*
import texo.graphics.*

fn vorzeichen(x: Int): Int {
    if (x > 0) { return 1 }
}
```

```text
src/Beispiel.texo:6:4: Fehler: Funktion 'vorzeichen' muss einen Wert vom Typ 'Int' zurückgeben
 6 | fn vorzeichen(x: Int): Int {
   |    ^^^^^^^^^^
   = Hinweis: Füge eine 'return'-Anweisung am Ende hinzu
```

Behoben:

```texo
package beispiel

import texo.ui.*
import texo.graphics.*

fn vorzeichen(x: Int): Int {
    if (x > 0) { return 1 }
    return 0
}
```

### Wert aus Void-Funktion

Ohne Rückgabetyp ist eine Funktion `Void`.

<!-- nocheck -->
```texo
package beispiel

import texo.ui.*
import texo.graphics.*

fn zaehle(): Void {
    return 1
}
```

```text
src/Beispiel.texo:7:12: Fehler: 'zaehle' gibt nichts zurück (Void), aber hier wird ein Wert zurückgegeben
 7 |     return 1
   |            ^
```

Behoben:

```texo
package beispiel

import texo.ui.*
import texo.graphics.*

fn zaehle(): Int {
    return 1
}
```

### await ohne async

`await` ist nur in `async`-Funktionen erlaubt.

<!-- nocheck -->
```texo
package beispiel

import texo.ui.*
import texo.graphics.*

fn warten(): Void {
    await Timer.delay(1.s)
}
```

```text
src/Beispiel.texo:7:5: Fehler: 'await' ist nur in async-Funktionen erlaubt
 7 |     await Timer.delay(1.s)
   |     ^^^^^^^^^^^^^^^^^^^^^^
   = Hinweis: Deklariere die Funktion mit 'async fn'
```

Behoben:

```texo
package beispiel

import texo.ui.*
import texo.graphics.*

async fn warten(): Void {
    await Timer.delay(1.s)
}
```

### break außerhalb einer Schleife

`break` und `continue` gehören in `for`/`while`.

<!-- nocheck -->
```texo
package beispiel

import texo.ui.*
import texo.graphics.*

fn demo(): Void {
    break
}
```

```text
src/Beispiel.texo:7:5: Fehler: 'break' ist nur innerhalb von Schleifen erlaubt
 7 |     break
   |     ^^^^^
```

Behoben:

```texo
package beispiel

import texo.ui.*
import texo.graphics.*

fn demo(): Void {
    while true { break }
}
```

---

## Komponenten und Zustand

### Komponente ohne build()

Jede Komponente braucht `fn build(): View`.

<!-- nocheck -->
```texo
package beispiel

import texo.ui.*
import texo.graphics.*

component Leer {
    private State<Int> n = State(0)
}
```

```text
src/Beispiel.texo:6:11: Fehler: Komponente 'Leer' braucht eine Methode 'fn build(): View'
 6 | component Leer {
   |           ^^^^
```

Behoben:

```texo
package beispiel

import texo.ui.*
import texo.graphics.*

component Leer {
    private State<Int> n = State(0)

    fn build(): View => Text("${this.n.value}")
}
```

### build() liefert keine View

Der Rückgabetyp von `build` muss `View` (oder ein Untertyp) sein.

<!-- nocheck -->
```texo
package beispiel

import texo.ui.*
import texo.graphics.*

component Falsch {
    fn build(): Int { return 1 }
}
```

```text
src/Beispiel.texo:7:8: Fehler: 'build' muss eine View zurückgeben, nicht 'Int'
 7 |     fn build(): Int { return 1 }
   |        ^^^^^
```

Behoben:

```texo
package beispiel

import texo.ui.*
import texo.graphics.*

component Falsch {
    fn build(): View { return Text("1") }
}
```

### Props sind unveränderlich

Eigenschaften einer Komponente dürfen weder als `var` deklariert noch zugewiesen werden. Veränderliches gehört in einen `State`.

<!-- nocheck -->
```texo
package beispiel

import texo.ui.*
import texo.graphics.*

component Gruss(name: String) {
    fn umbenennen(): Void {
        this.name = "Neu"
    }

    fn build(): View => Text(this.name)
}
```

```text
src/Beispiel.texo:8:14: Fehler: Komponenten-Eigenschaft 'name' ist unveränderlich
 8 |         this.name = "Neu"
   |              ^^^^
   = Hinweis: Verwende State<T> für veränderlichen Zustand
```

Behoben:

```texo
package beispiel

import texo.ui.*
import texo.graphics.*

component Gruss(start: String) {
    private State<String> name = State("")

    fn onMount(): Void {
        this.name.value = this.start
    }

    fn umbenennen(): Void {
        this.name.value = "Neu"
    }

    fn build(): View => Text(this.name.value)
}
```

### State neu zuweisen statt .value ändern

Das Feld selbst ist unveränderlich; ändere den Inhalt über `.value`.

<!-- nocheck -->
```texo
package beispiel

import texo.ui.*
import texo.graphics.*

component Zaehler {
    private State<Int> n = State(0)

    fn reset(): Void {
        this.n = State(0)
    }

    fn build(): View => Text("${this.n.value}")
}
```

```text
src/Beispiel.texo:10:14: Fehler: 'n' ist unveränderlich
 10 |         this.n = State(0)
    |              ^
    = Hinweis: Ändere den Wert über n.value = …
```

Behoben:

```texo
package beispiel

import texo.ui.*
import texo.graphics.*

component Zaehler {
    private State<Int> n = State(0)

    fn reset(): Void {
        this.n.value = 0
    }

    fn build(): View => Text("${this.n.value}")
}
```

### `.value` vergessen

Ein `State<Int>` ist keine Zahl. Rechnen und Vergleichen geht mit `.value`.

<!-- nocheck -->
```texo
package beispiel

import texo.ui.*
import texo.graphics.*

component Zaehler {
    private State<Int> n = State(0)

    fn build(): View => Text(this.n + 1)
}
```

```text
src/Beispiel.texo:9:30: Fehler: Operator '+' ist für 'State<Int>' und 'Int' nicht definiert
 9 |     fn build(): View => Text(this.n + 1)
   |                              ^^^^^^^^^^
```

Behoben:

```texo
package beispiel

import texo.ui.*
import texo.graphics.*

component Zaehler {
    private State<Int> n = State(0)

    fn build(): View => Text(this.n.value + 1)
}
```

### State statt Wert übergeben (oder umgekehrt)

`Input(bind:)`, `Checkbox(bind:)` usw. erwarten den **State selbst**, nicht seinen Wert.

<!-- nocheck -->
```texo
package beispiel

import texo.ui.*
import texo.graphics.*

component Formular {
    private State<String> name = State("")

    fn build(): View => Input(bind: this.name.value)
}
```

```text
src/Beispiel.texo:9:37: Fehler: Argument 'bind' erwartet 'State<String>?', erhalten 'String'
 9 |     fn build(): View => Input(bind: this.name.value)
   |                                     ^^^^^^^^^^^^^^^
```

Behoben:

```texo
package beispiel

import texo.ui.*
import texo.graphics.*

component Formular {
    private State<String> name = State("")

    fn build(): View => Input(bind: this.name)
}
```

### Seite mit Pflicht-Eigenschaften

`@Page`-Komponenten werden ohne Argumente gestartet. Gib den Eigenschaften Standardwerte.

<!-- nocheck -->
```texo
package beispiel

import texo.ui.*
import texo.graphics.*

@Page(title: "Start")
component Start(name: String) {
    fn build(): View => Text(this.name)
}
```

```text
src/Beispiel.texo:7:11: Fehler: Die Seite 'Start' darf keine Pflicht-Eigenschaften haben
 7 | component Start(name: String) {
   |           ^^^^^
```

Behoben:

```texo
package beispiel

import texo.ui.*
import texo.graphics.*

@Page(title: "Start")
component Start(name: String = "Welt") {
    fn build(): View => Text(this.name)
}
```

### Zwei Seiten, derselbe Pfad

Jede Seite braucht einen eigenen Ausgabepfad (`path:`).

<!-- nocheck -->
```texo
package beispiel

import texo.ui.*
import texo.graphics.*

@Page(title: "A", path: "index.html")
component A {
    fn build(): View => Text("A")
}

@Page(title: "B", path: "index.html")
component B {
    fn build(): View => Text("B")
}
```

```text
src/Beispiel.texo:12:11: Fehler: Zwei Seiten verwenden denselben Pfad 'index.html'
 12 | component B {
    |           ^
```

Behoben:

```texo
package beispiel

import texo.ui.*
import texo.graphics.*

@Page(title: "A", path: "index.html")
component A {
    fn build(): View => Text("A")
}

@Page(title: "B", path: "b.html")
component B {
    fn build(): View => Text("B")
}
```

---

### Formular ohne Feld für einen Parameter

Ein `Form(Service.methode, …)` braucht für jeden Parameter ohne Standardwert ein Feld mit passendem `name:`. Diese
Prüfung läuft beim Erzeugen des Codes, also bei `texo build` und `texo dev`. Genauso gemeldet werden ein Feld ohne
passenden Parameter („hat keinen Parameter“), Parametertypen, die ein Formular nicht senden kann (nur Text, Zahlen und
Wahrheitswerte), und ein `submit:`, das keine Konstante ist.

<!-- nocheck -->
```texo
package beispiel

import texo.server.*
import texo.ui.*

@Api("/api/gaeste")
service Gaeste {
    fn eintragen(name: String, personen: Int): Int => personen
}

component Eintrag {
    private State<String> name = State("")

    fn build(): View => Form(Gaeste.eintragen, [
        Input(bind: this.name, placeholder: "Name", name: "name"),
        Button("Eintragen", submit: true)
    ])
}
```

```text
src/Beispiel.texo:14:25: Fehler: Dem Formular fehlt das Feld 'personen' für 'Gaeste.eintragen'
 14 |     fn build(): View => Form(Gaeste.eintragen, [
    |                         ^^^^^^^^^^^^^^^^^^^^^^^^
    = Hinweis: z. B. Input(name: "personen")
```

Behoben:

```texo
package beispiel

import texo.server.*
import texo.ui.*

@Api("/api/gaeste")
service Gaeste {
    fn eintragen(name: String, personen: Int): Int => personen
}

component Eintrag {
    private State<String> name = State("")
    private State<String> personen = State("1")

    fn build(): View => Form(Gaeste.eintragen, [
        Input(bind: this.name, placeholder: "Name", name: "name"),
        Input(bind: this.personen, type: InputType.Number, name: "personen"),
        Button("Eintragen", submit: true)
    ])
}
```

### Angemeldeter Benutzer ohne `@Auth`

`request.user` und `request.signIn(…)` haben den Typ einer eigenen Datenklasse. Fehlt die Klasse mit `@Auth`, weiß der
Compiler nicht, was in der Session steht. Siehe [Anmeldung](backend.md#anmeldung-auth).

<!-- nocheck -->
```texo
package beispiel

import texo.server.*

@Server
fn angemeldet(req: Request): Access =>
    req.user != null ? Access.allow() : Access.redirect("/login")
```

```text
src/Beispiel.texo:7:9: Fehler: 'request.user' braucht eine Datenklasse mit @Auth
 7 |     req.user != null ? Access.allow() : Access.redirect("/login")
   |         ^^^^
   = Hinweis: z. B. @Auth data class Benutzer(id: Int, name: String, rolle: Rolle)
```

Behoben:

```texo
package beispiel

import texo.server.*

@Auth
data class Benutzer(id: Int, name: String)

@Server
fn angemeldet(req: Request): Access =>
    req.user != null ? Access.allow() : Access.redirect("/login")
```

## match, Klassen, Interfaces

### match über ein Enum ist nicht vollständig

Bei Enums müssen alle Fälle behandelt werden – oder ein `else =>`-Zweig steht am Ende.

<!-- nocheck -->
```texo
package beispiel

import texo.ui.*
import texo.graphics.*

enum Stufe { Niedrig, Mittel, Hoch }

fn text(s: Stufe): String => match s {
    Stufe.Niedrig => "niedrig",
    Stufe.Mittel => "mittel"
}
```

```text
src/Beispiel.texo:8:30: Fehler: match ist nicht vollständig: es fehlen Stufe.Hoch
 8 | fn text(s: Stufe): String => match s {
   |                              ^^^^^^^^^
   = Hinweis: Ergänze die Fälle oder einen 'else =>'-Zweig
```

Behoben:

```texo
package beispiel

import texo.ui.*
import texo.graphics.*

enum Stufe { Niedrig, Mittel, Hoch }

fn text(s: Stufe): String => match s {
    Stufe.Niedrig => "niedrig",
    Stufe.Mittel => "mittel",
    Stufe.Hoch => "hoch"
}
```

### match ohne else

Bei allen Typen außer Enums ist `else =>` Pflicht.

<!-- nocheck -->
```texo
package beispiel

import texo.ui.*
import texo.graphics.*

fn text(n: Int): String => match n {
    1 => "eins",
    2 => "zwei"
}
```

```text
src/Beispiel.texo:6:28: Fehler: match braucht einen 'else =>'-Zweig
 6 | fn text(n: Int): String => match n {
   |                            ^^^^^^^^^
```

Behoben:

```texo
package beispiel

import texo.ui.*
import texo.graphics.*

fn text(n: Int): String => match n {
    1 => "eins",
    2 => "zwei",
    else => "viele"
}
```

### Interface nicht implementiert

Eine Klasse muss alle Methoden und Eigenschaften ohne Standardimplementierung bereitstellen – mit passendem Typ.

<!-- nocheck -->
```texo
package beispiel

import texo.ui.*
import texo.graphics.*

interface Form {
    fn flaeche(): Float
}

class Quadrat(): Form {
}
```

```text
src/Beispiel.texo:10:7: Fehler: 'Quadrat' implementiert 'flaeche' aus dem Interface 'Form' nicht
 10 | class Quadrat(): Form {
    |       ^^^^^^^
    = Hinweis: Füge 'fn flaeche(…)' hinzu
```

Behoben:

```texo
package beispiel

import texo.ui.*
import texo.graphics.*

interface Form {
    fn flaeche(): Float
}

class Quadrat(seite: Float): Form {
    fn flaeche(): Float => this.seite * this.seite
}
```

### Inkompatible Interface-Implementierung

Signatur und Typ müssen zum Interface passen.

<!-- nocheck -->
```texo
package beispiel

import texo.ui.*
import texo.graphics.*

interface Form {
    fn flaeche(): Float
}

class Quadrat(): Form {
    fn flaeche(): String => "viel"
}
```

```text
src/Beispiel.texo:10:7: Fehler: 'Quadrat.flaeche' passt nicht zum Interface 'Form': erwartet '() => Float', gefunden '() => String'
 10 | class Quadrat(): Form {
    |       ^^^^^^^
```

Behoben:

```texo
package beispiel

import texo.ui.*
import texo.graphics.*

interface Form {
    fn flaeche(): Float
}

class Quadrat(): Form {
    fn flaeche(): Float => 4.0
}
```

### Konstruktorargumente der Oberklasse

Hat die Oberklasse Pflichtparameter, muss die Unterklasse sie weiterreichen.

<!-- nocheck -->
```texo
package beispiel

import texo.ui.*
import texo.graphics.*

class Tier(name: String) {
}

class Hund(): Tier {
}
```

```text
src/Beispiel.texo:9:15: Fehler: 'Tier' braucht Konstruktorargumente: class Hund(…): Tier(…)
 9 | class Hund(): Tier {
   |               ^^^^
```

Behoben:

```texo
package beispiel

import texo.ui.*
import texo.graphics.*

class Tier(name: String) {
}

class Hund(name: String): Tier(name) {
}
```

### Zwei Oberklassen

Nur die erste Oberklasse darf eine Klasse sein; weitere müssen Interfaces sein.

<!-- nocheck -->
```texo
package beispiel

import texo.ui.*
import texo.graphics.*

class A() {
}

class B() {
}

class C(): A, B {
}
```

```text
src/Beispiel.texo:12:15: Fehler: Nur eine Oberklasse ist erlaubt – 'B' ist kein Interface
 12 | class C(): A, B {
    |               ^
```

Behoben:

```texo
package beispiel

import texo.ui.*
import texo.graphics.*

class A() {
}

interface B {
}

class C(): A, B {
}
```

### Unmögliche Typprüfung

`x is T` ist nur sinnvoll, wenn `x` ein `T` sein kann.

<!-- nocheck -->
```texo
package beispiel

import texo.ui.*
import texo.graphics.*

fn demo(x: Int): Boolean => x is String
```

```text
src/Beispiel.texo:6:29: Fehler: 'Int' kann nie ein 'String' sein
 6 | fn demo(x: Int): Boolean => x is String
   |                             ^^^^^^^^^^^
```

Behoben:

```texo
package beispiel

import texo.ui.*
import texo.graphics.*

fn demo(x: Any): Boolean => x is String
```

### Enum instanziieren

Enums werden über ihre Fälle verwendet, nicht mit `Name()` erzeugt.

<!-- nocheck -->
```texo
package beispiel

import texo.ui.*
import texo.graphics.*

enum Farbe { Rot, Gruen }

fn demo(): Void {
    let f = Farbe()
}
```

```text
src/Beispiel.texo:9:13: Fehler: Enums können nicht instanziiert werden – verwende Farbe.Rot
 9 |     let f = Farbe()
   |             ^^^^^^^
```

Behoben:

```texo
package beispiel

import texo.ui.*
import texo.graphics.*

enum Farbe { Rot, Gruen }

fn demo(): Void {
    let f = Farbe.Rot
}
```

---

## Stil-Lambdas und Icons

### Nur Stil-Modifier in Varianten

In `hover`, `dark`, `md` … sind nur Stil-Modifier erlaubt – keine Ereignisse, keine Inhalte.

<!-- nocheck -->
```texo
package beispiel

import texo.ui.*
import texo.graphics.*

component Karte {
    fn build(): View {
        return Text("x").hover(s => s.onClick(() => print(1)))
    }
}
```

```text
src/Beispiel.texo:8:39: Fehler: In Stil-Lambdas sind nur Stil-Modifier erlaubt – '.onClick()' ist keiner
 8 |         return Text("x").hover(s => s.onClick(() => print(1)))
   |                                       ^^^^^^^
```

Behoben:

```texo
package beispiel

import texo.ui.*
import texo.graphics.*

component Karte {
    fn build(): View {
        return Text("x").hover(s => s.textColor(Color.Indigo500)).onClick(() => print(1))
    }
}
```

### Variante ohne Stil-Lambda

`hover` & Co. brauchen einen Lambda der Form `s => s.modifier(…)`.

<!-- nocheck -->
```texo
package beispiel

import texo.ui.*
import texo.graphics.*

component Karte {
    fn build(): View {
        return Text("x").hover(4)
    }
}
```

```text
src/Beispiel.texo:8:32: Fehler: Argument 'style' erwartet '(Text) => Text', erhalten 'Int'
 8 |         return Text("x").hover(4)
   |                                ^
src/Beispiel.texo:8:32: Fehler: '.hover()' erwartet einen Stil-Lambda, z. B. .hover(s => s.background(…))
 8 |         return Text("x").hover(4)
   |                                ^
```

Behoben:

```texo
package beispiel

import texo.ui.*
import texo.graphics.*

component Karte {
    fn build(): View {
        return Text("x").hover(s => s.opacity(0.8))
    }
}
```

### Unbekanntes Icon

Feste Icon-Namen prüft schon `texo check` (und damit der Editor). Das gilt auch, wenn der Text über Parameter von
Funktionen, Methoden oder Komponenten ankommt, etwa `Kachel("monitor")` mit `fn Kachel(icon: String) => Icon(icon)`,
und für `Button("…", icon: "…")`. Namen, die erst zur Laufzeit feststehen (Zustand, Daten), zeichnen einen Kreis;
unter `texo dev` steht dann eine Warnung in der Browser-Konsole.

<!-- nocheck -->
```texo
package beispiel

import texo.ui.*
import texo.graphics.*

component Knopf {
    fn build(): View => Icon("trahs")
}
```

```text
src/Beispiel.texo:7:30: Fehler: Unbekanntes Icon 'trahs'
 7 |     fn build(): View => Icon("trahs")
   |                              ^^^^^^^
   = Hinweis: Meintest du 'trash'? Verfügbar: check, x, plus, minus, chevron-right, chevron-left, chevron-down, chevron-up, arrow-right, arrow-left, arrow-up, arrow-down, search, menu, home, user, users, heart, star, bell, mail, settings, trash, edit, sun, moon, info, alert-circle, alert-triangle, check-circle, refresh, external-link, eye, calendar, clock, bar-chart, pie-chart, trending-up, trending-down, activity, play, pause, zap, globe, lock, log-in, log-out, cart, filter, download, upload, copy, send, message, grid, list, more, circle, square, dollar, package, map-pin, image, file, folder, bookmark, tag, layers, smile, award, target
```

Behoben:

```texo
package beispiel

import texo.ui.*
import texo.graphics.*

component Knopf {
    fn build(): View => Icon("trash")
}
```

---

## Syntaxfehler

### Name erwartet / reserviertes Wort

Schlüsselwörter können nicht als Namen dienen. Mit Backticks geht es trotzdem.

<!-- nocheck -->
```texo
package beispiel

import texo.ui.*
import texo.graphics.*

fn demo(): Void {
    let match = 1
}
```

```text
src/Beispiel.texo:7:9: Fehler: 'match' ist ein reserviertes Wort und kann nicht als Name verwendet werden (nach 'let')
 7 |     let match = 1
   |         ^^^^^
   = Hinweis: Verwende Backticks, z. B. `match`
```

Behoben:

```texo
package beispiel

import texo.ui.*
import texo.graphics.*

fn demo(): Void {
    let `match` = 1
}
```

### Parameter ohne Typ

Funktionsparameter brauchen immer einen Typ (nur bei Lambdas kann er entfallen).

<!-- nocheck -->
```texo
package beispiel

import texo.ui.*
import texo.graphics.*

fn quadrat(x) => x * x
```

```text
src/Beispiel.texo:6:13: Fehler: Erwartet ':' nach dem Parameter 'x' (Parameter brauchen einen Typ: name: Typ), gefunden ')'
 6 | fn quadrat(x) => x * x
   |             ^
```

Behoben:

```texo
package beispiel

import texo.ui.*
import texo.graphics.*

fn quadrat(x: Int) => x * x
```

### Fehlende Klammer

Der Parser nennt, was er erwartet hat und wo.

<!-- nocheck -->
```texo
package beispiel

import texo.ui.*
import texo.graphics.*

fn demo(): Void {
    print("a"
}
```

```text
src/Beispiel.texo:8:1: Fehler: Erwartet ')' nach den Argumenten, gefunden '}'
 8 | }
   | ^
```

Behoben:

```texo
package beispiel

import texo.ui.*
import texo.graphics.*

fn demo(): Void {
    print("a")
}
```

### Nicht geschlossene Zeichenkette

Einzeilige Strings enden vor dem Zeilenumbruch; mehrzeilige verwenden `"""`.

<!-- nocheck -->
```texo
package beispiel

import texo.ui.*
import texo.graphics.*

fn demo(): String {
    return "Hallo
}
```

```text
src/Beispiel.texo:7:12: Fehler: Nicht geschlossene Zeichenkette
 7 |     return "Hallo
   |            ^^^^^^
```

Behoben:

```texo
package beispiel

import texo.ui.*
import texo.graphics.*

fn demo(): String {
    return "Hallo"
}
```

### Unbekanntes Paket im Import

Verfügbare Pakete: `texo.core`, `texo.ui`, `texo.graphics` sowie deine eigenen.

<!-- nocheck -->
```texo
package beispiel

import texo.widgets.*

fn demo(): Void {}
```

```text
src/Beispiel.texo:3:1: Fehler: Paket 'texo.widgets' nicht gefunden
 3 | import texo.widgets.*
   | ^^^^^^^^^^^^^^^^^^^^^
   = Hinweis: Verfügbare Pakete: texo.core, texo.graphics, texo.ui, beispiel
```

Behoben:

```texo
package beispiel

import texo.ui.*

fn demo(): Void {}
```

### Klasse ohne Rumpf

`class` braucht einen Rumpf `{ … }` (nur `data class` darf ihn weglassen).

<!-- nocheck -->
```texo
package beispiel

import texo.ui.*
import texo.graphics.*

class Punkt(x: Int)

fn demo(): Void {}
```

```text
src/Beispiel.texo:8:1: Fehler: Erwartet '{' für den Rumpf von 'Punkt'
 8 | fn demo(): Void {}
   | ^^
```

Behoben:

```texo
package beispiel

import texo.ui.*
import texo.graphics.*

data class Punkt(x: Int)

fn demo(): Void {}
```

---

## Weitere Hinweise

- **Server-Rendering fehlgeschlagen** (`Server-Rendering von 'X' fehlgeschlagen (…) – die Seite wird im Browser gerendert`) ist eine
  Warnung: Beim Vorrendern ist eine Laufzeitausnahme aufgetreten (z. B. Zugriff auf eine Browser-API in einem Initialisierer).
  Die Seite funktioniert, wird aber erst im Browser gerendert.
- **`Zwei Dateien erzeugen dasselbe Modul`**: Zwei `.texo`-Dateien haben gleichen Paketnamen und Dateinamen (z. B. in
  verschiedenen Ordnern ohne unterschiedliches `package`).
- **`Argumente von @Page müssen Konstanten sein`**: `title`, `path`, `lang` und `description` dürfen nur Literale oder
  `const`-Werte sein.
- **`Einstiegskomponente 'X' nicht gefunden`**: `--entry` bzw. `"entry"` in `texo.json` nennt keine Komponente.
- **`texo.json ist ungültig: …`**: Die Konfiguration ist kein gültiges JSON.
- **`Quelle 'src' nicht gefunden`**: `texo build` ohne Pfad im falschen Ordner – lege ein Projekt mit `texo init` an oder gib den Pfad an.
- Läuft die Hydration im Browser auf eine Abweichung, erscheint in der Konsole `[texo] Hydration fehlgeschlagen (…), rendere neu.`
  (siehe [Reaktivität und Routing](reaktivitaet.md#server-rendering-und-hydration)).

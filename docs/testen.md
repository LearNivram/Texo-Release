<!-- Übernommen aus LearNivram/Texo (docs/testen.md) mit scripts/docs-uebernehmen.mjs – bitte dort ändern. -->

# Testen mit `texo test`

Tests schreibst du in Texo selbst, in Dateien unter `tests/`. `texo test` kompiliert sie zusammen mit dem Projekt
und führt sie aus. Das geht ohne Browser: Komponenten werden in einem eingebauten Test-Dokument angezeigt, angeklickt
und geprüft. Das funktioniert für Projekte genauso wie für [Bibliotheken](bibliotheken.md). `texo init --library`
legt gleich ein Beispiel an.

```
mein-projekt/
  src/App.texo
  tests/AppTest.texo     ← Tests (gehören nicht zur Website)
  texo.json
```

```texo
// tests/AppTest.texo
package app.tests

import texo.test.*
import texo.ui.*
import app.*

@Test("summe rechnet richtig")
fn summeTest(): Void {
    expect(summe(2, 3)).toBe(5)
    expect(summe(-1, 1)).toBe(0)
}

@Test("Zähler zählt Klicks")
fn zaehlerTest(): Void {
    let s = render(Zaehler("a"))
    expect(s.text("zaehler")).toBe("a: 0")
    s.click("zaehler")
    s.click("zaehler")
    expect(s.text("zaehler")).toBe("a: 2")
}

@Test("Daten werden geladen")
async fn ladenTest(): Void {
    let s = render(Liste())
    await settle(50)            // onMount, Promises und Timer laufen lassen
    expect(s.count("eintrag")).toBe(3)
}
```

```
$ texo test
tests/AppTest.texo
  ✔ summe rechnet richtig (1 ms)
  ✔ Zähler zählt Klicks (3 ms)
  ✖ Daten werden geladen
      erwartet 3, erhalten 2

1 von 3 Test(s) fehlgeschlagen (91 ms)
```

`texo test klick` führt nur Tests aus, deren Name „klick“ enthält. Der Exit-Code ist 1, sobald ein Test fehlschlägt
oder die Tests nicht kompilieren. So bricht auch eine CI ab.

## Regeln

- Testdateien liegen im Ordner `tests/` (anderer Ordner: `"tests": "pruefungen"` in der `texo.json`). Sie kommen nie
  in die Website und nie in ein Bibliothekspaket.
- `import texo.test.*` und `@Test` gibt es nur in Testdateien.
- Eine `@Test`-Funktion hat keine Parameter. Sie darf `async` sein (Zeitlimit: 5 Sekunden). `@Test("Name")` gibt ihr
  einen lesbaren Namen, sonst wird der Funktionsname gezeigt.
- Jeder Test bekommt ein frisches Dokument. Was ein Test mit `render` anzeigt, wird danach wieder entfernt.
- Elemente findest du über ihre `.testId("…")`.

## expect

| Prüfung | bestanden, wenn |
|---|---|
| `expect(x).toBe(y)` | `x == y` (Datenklassen, Listen, Maps inhaltlich) |
| `expect(x).not.toBe(y)` | das Gegenteil (`not` geht vor jeder Prüfung) |
| `toBeTrue()`, `toBeFalse()`, `toBeNull()` | Wert ist `true`, `false` bzw. `null` |
| `toContain(e)` | Liste enthält `e`, Text enthält den Teiltext, Map den Schlüssel |
| `toBeGreaterThan(n)`, `toBeLessThan(n)` | Zahlenvergleich |
| `toMatch("^Hallo")` | Text passt zum regulären Ausdruck |
| `expectError(() => …, "Teiltext")` | die Aktion wirft einen Fehler (mit diesem Text in der Meldung) |
| `await expectErrorAsync(async () => …, "Teiltext")` | dasselbe für asynchrone Aktionen, z. B. `client.call(…)`; `expectError` wartet nicht und meldet das |
| `fail("Meldung")` | lässt den Test sofort scheitern |

## render und Screen

`render(view)` zeigt eine Komponente oder beliebige View an und gibt einen `Screen` zurück:

| Methode | Wirkung |
|---|---|
| `s.text(id)` / `s.texts(id)` | Text des ersten / aller Elemente mit dieser testId |
| `s.count(id)`, `s.exists(id)` | Anzahl / gibt es eins? |
| `s.click(id)` | klicken (deaktivierte Buttons melden einen Fehler) |
| `s.type(id, "Text")` | in ein Eingabefeld tippen (löst `onInput` und Bindungen aus) |
| `s.check(id, true)` | Checkbox oder Schalter setzen |
| `s.press(id, "Enter")` | Taste drücken |
| `s.attribute(id, "aria-label")` | Attribut lesen |
| `s.hasClass(id, "tx-p-4")` | hat das Element diese CSS-Klasse? |
| `s.isOpen(id)` | ist der `Dialog`, das `Menu` oder die Vorschlagsliste der `Combobox` offen? |
| `s.pressEscape()` | Escape drücken, im fokussierten Element oder sonst im obersten offenen Dialog |
| `s.choose(id, "Konto")` | in `Tabs`, `Menu` oder `Combobox` den Eintrag mit diesem Text wählen (ein Menü wird dazu geöffnet, in die Combobox wird der Text getippt) |
| `s.toasts()` | Texte der gerade angezeigten Meldungen von `Toast.show` |
| `s.html()` | HTML der Anzeige (praktisch zur Fehlersuche) |

Alles ist reaktiv wie im Browser: Nach `s.click(…)` ist die Anzeige sofort aktualisiert. Nur Asynchrones (Laden,
Timer, `onMount`) braucht `await settle(ms)`.

## Bibliotheken testen

In einem Bibliotheksprojekt testen die Tests die Bibliothek aus `src/`. Benutzt die Bibliothek andere Bibliotheken
(`texo lib add`), sind diese in den Tests ebenfalls verfügbar. `texo lib pack` packt die Tests nicht mit.

## Services und Datenbank

Tests laufen im selben Prozess wie der Code, ohne HTTP. Sie dürfen Services direkt aufrufen
(`await Laden.suche("tee")`) und [Tabellen](datenbank.md) benutzen. Jeder Test bekommt eine eigene, leere
Speicher-Datenbank. Daten aus einem Test sind im nächsten also nicht mehr da.

```texo
// tests/ChatTest.texo
package app.tests

import texo.test.*
import app.*

@Test("Nachrichten werden gespeichert")
async fn speichern(): Void {
    await Message.insert(Message(text: "Hallo", author: "Ada"))
    expect(await Message.count()).toBe(1)
    expect((await ChatApi.list())[0].author).toBe("Ada")
}
```

Ein direkter Aufruf wie `await ChatApi.list()` läuft ohne Anfrage: Wächter, Prüfregeln und `@RateLimit` gelten dabei
nicht, und `this.request` gibt es nicht. Für alles, was an der Anfrage hängt, gibt es den `TestClient`.

## Anfragen wie im Browser: TestClient

Ein `TestClient` schickt Aufrufe auf demselben Weg an die Anwendung wie ein Browser, nur ohne Netzwerk. Die Argumente
gehen durch den Codec, der Server prüft Herkunft und CSRF-Token, führt die Wächter (`@Guard`) aus, prüft die Regeln der
Datenklassen und `@RateLimit`, ruft die Methode auf und schickt die Antwort durch den Codec zurück. So lassen sich
gerade die Sicherheitsfunktionen testen.

```texo
// tests/NotizenTest.texo
package notizen.tests

import texo.test.*
import notizen.*

@Test("Fremde Notizen lassen sich nicht löschen")
async fn fremdLoeschen(): Void {
    await Notiz.insert(Notiz(autor: 1, text: "geheim"))
    let bob = TestClient(user: Benutzer(2, "bob", Rolle.Leser))
    try {
        await bob.call(() => Notizen.loeschen(1))
        fail("hätte scheitern müssen")
    } catch (e: FremdeNotiz) {
        expect(e.id).toBe(1)
    }
    let gast = TestClient()
    let seite = await gast.page("/notiz/1")
    expect(seite.status).toBe(303)
    expect(seite.header("location")).toBe("/login")
}

@Test("Eigene Notiz wird angezeigt")
async fn eigeneNotiz(): Void {
    await Notiz.insert(Notiz(autor: 1, text: "geheim"))
    let ada = TestClient(user: Benutzer(1, "ada", Rolle.Admin))
    let seite = await ada.page("/notiz/1")
    expect(seite.status).toBe(200)
    expect(seite.screen().text("text")).toBe("geheim")
}
```

| | |
|---|---|
| `TestClient()` | ein Besucher ohne Anmeldung |
| `TestClient(user: b)` | ein angemeldeter Besucher; `b` ist ein Wert der Datenklasse mit `@Auth`, wie nach `request.signIn(b)` |
| `TestClient(csrf: false)` | schickt kein CSRF-Token mit, wie eine fremde Website: so prüfst du, dass der Schutz greift |
| `await c.call(() => Api.methode(…))` | schickt den Service-Aufruf der Lambda über die Leitung und liefert das Ergebnis |
| `await c.page("/pfad")` | holt eine Seite samt Server-Wächtern und Loader (`@Load`) |
| `await c.form("/api/x/methode", ["feld": "wert"])` | schickt ein Formular wie ein Browser ohne JavaScript |

`call(…)` leitet nur die Service-Aufrufe über den Client, die die Lambda sofort macht. Was die Methode auf dem Server
selbst aufruft, läuft wie im Server direkt. Für mehrere Aufrufe schreibst du mehrere `call(…)`. Ein typisierter Fehler
(`throws`) kommt als genau diese Klasse an, `catch (e: FremdeNotiz)` fängt ihn also wie im Browser. Verletzte
Prüfregeln (`@Required`, `@MaxLength` …) kommen als `ValidationException` mit `e.errors` an. Andere Fehler haben
die Meldung des Servers, etwa `"Anmeldung erforderlich"` (ein Wächter leitet um), `"Zugriff verweigert"`
oder `"Zu viele Anfragen – bitte später erneut versuchen"`. Stream-Methoden gehen nicht über
`call(…)`.

`page(…)` und `form(…)` liefern eine Antwort:

| | |
|---|---|
| `r.status` | HTTP-Status: 200, 303 (Weiterleitung), 403, 404 … |
| `r.header("location")` | ein Header oder `null` |
| `r.text` | der Inhalt; bei Seiten das HTML samt den Daten des Loaders |
| `r.screen()` | zeigt die Seite wie der Browser an (mit den Daten des Loaders) und gibt ihren [`Screen`](#render-und-screen) zurück |

Weiterleitungen verfolgt der Client nicht: Du siehst die 303 und ihr Ziel. Ein Formular, das klappt, antwortet mit 303
zurück zur zuletzt mit `page(…)` geholten Seite; eines, das scheitert, mit einer Fehlerseite (Status, Meldung,
Feldfehler).

**Was gilt.** Jeder Client ist ein eigener Browser: Er hat seine eigenen Cookies, also seine eigene Session, und eine
eigene Adresse für `@RateLimit`. Meldet eine Methode an (`request.signIn`) oder ab, gilt das für seine folgenden
Anfragen. CSRF-Schutz und `@RateLimit` gelten wie auf dem Server. Der Client verhält sich dabei wie die Seiten der
eigenen Anwendung und schickt das CSRF-Token mit; `csrf: false` lässt es weg. Sessions und Zähler von `@RateLimit`
beginnen in jedem Test neu. Der Client benutzt die Server-Laufzeit von Node, Bun und Deno; der native Server `texo`
verhält sich bei diesen Prüfungen gleich.

## Die Uhr stellen: Clock

`Clock` ersetzt in Tests die Uhr. Danach richten sich `DateTime.now()`, der Ablauf von `Tokens`, Sessions (sie gelten
sieben Tage), die Zeitfenster von `@RateLimit`, verzögerte und wiederholte [Jobs](backend.md#hintergrundjobs-job) und
die [Zeitpläne](backend.md#zeitpläne-cron-und-every). So prüfst du Zeitabhängiges ohne Warten.

```texo
// tests/ResetTest.texo
package konten.tests

import texo.test.*
import texo.server.*
import konten.*

@Test("Reset-Link gilt 30 Minuten")
fn resetLink(): Void {
    let t = Tokens.create("reset", "7", 30)
    Clock.advance(31.min)
    expect(Tokens.check("reset", t)).toBeNull()
}

@Test("Aufräumen läuft nachts")
async fn nachts(): Void {
    Clock.set(DateTime.parse("2026-03-01T12:00:00")!!)
    Clock.advance(1.d)
    expect(await Jobs.runPending()).toBe(1)
}
```

| | |
|---|---|
| `Clock.advance(31.min)` | stellt die Uhr vor |
| `Clock.set(zeitpunkt)` | stellt die Uhr auf einen `DateTime` |
| `Clock.reset()` | wieder die echte Uhr |

Nach `set` oder `advance` steht die Uhr still, bis der Test sie weiterstellt. Vor jedem Test gilt wieder die echte Uhr.
Timer und `settle(ms)` laufen weiter in echter Zeit.

Hat der Test die Uhr gestellt, führt `await Jobs.runPending()` nur die Jobs aus, die bis dahin fällig sind (`delay`,
neuer Versuch nach einem Fehler), und dazu die Zeitpläne (`@Cron`, `@Every`), deren nächster Termin erreicht ist. Ein
Zeitplan läuft dabei höchstens einmal je Aufruf, auch wenn mehrere Termine verstrichen sind, wie beim Server nach einer
Pause. Gezählt wird ab dem Start des Tests und nach `Clock.set` ab dem neuen Zeitpunkt. Die Rückgabe zählt Jobs und
Zeitpläne zusammen. Ohne gestellte Uhr bleibt alles wie zuvor: `runPending()` führt jeden offenen Job aus, Zeitpläne
laufen nicht.

<!-- Übernommen aus LearNivram/Texo (docs/uebersetzungen.md) mit scripts/docs-uebernehmen.mjs – bitte dort ändern. -->

# Übersetzungen (I18n)

Texte, die in mehreren Sprachen erscheinen sollen, schreibst du mit `tr(schlüssel, standardtext)`. Die Übersetzungen
stehen in `@Global`-Konstanten vom Typ `Translations`. Der Compiler sammelt sie ein und rendert die Seite in ihrer
Sprache (`@Page(lang: …)`, Standard `de`) vor. Im Browser lässt sich die Sprache jederzeit wechseln, und alle Texte
aktualisieren sich.

```texo
package app

import texo.ui.*
import texo.graphics.*

@Global
val Englisch = Translations("en", [
    "start.titel": "Welcome",
    "start.gruss": "Hello {0}, you have {1} new messages."
])

@Global
val Franzoesisch = Translations("fr", ["start.titel": "Bienvenue"])

@Page(title: "Start", lang: "de")
component Start {
    private State<String> name = State("Ada")

    fn build(): View => Column(spacing: 12.px, [
        Heading(tr("start.titel", "Willkommen")),
        Text(tr("start.gruss", "Hallo {0}, du hast {1} neue Nachrichten.", [this.name.value, 3])),
        Row(spacing: 8.px, [
            Button("Deutsch").onClick(() => I18n.locale = "de"),
            Button("English").onClick(() => I18n.locale = "en"),
            Button("Français").onClick(() => I18n.locale = "fr")
        ])
    ])
}
```

- **`tr(schlüssel, standardtext, [werte])`** liefert den Eintrag der aktuellen Sprache. Fehlt er, kommt der Eintrag
  der Basissprache (`de-AT` → `de`), sonst der Standardtext. `{0}`, `{1}` … werden durch die Werte ersetzt.
- **`I18n.locale`** ist die aktuelle Sprache und reaktiv: Setzen schaltet um, und Anzeigen, die sie lesen,
  aktualisieren sich. `I18n.locales` listet die vorhandenen Sprachen. `I18n.useBrowserLanguage()` wählt die erste
  Browsersprache, für die es Übersetzungen gibt.
- **`I18n.add("en", [...])`** fügt zur Laufzeit Übersetzungen hinzu, z. B. vom Server geladene.
- Beim Vorrendern wird die Sprache der Seite benutzt. Der Browser startet in derselben Sprache, deshalb passt das
  vorgerenderte HTML.

## In Bibliotheken

Bibliotheken schreiben ihre Texte ebenfalls mit `tr`, mit dem Bibliotheksnamen als Präfix (`"ui_kit.schliessen"`).
Ihre `@Global … = Translations(…)` kommen mit ins Paket. Ein Projekt kann einzelne Einträge überschreiben oder weitere
Sprachen ergänzen, indem es eigene `Translations` mit denselben Schlüsseln anlegt. Die des Projekts haben Vorrang.

```texo
// im Projekt: Englisch der Bibliothek anpassen, Spanisch ergänzen
@Global
val UiKitAnpassungen = Translations("en", ["ui_kit.schliessen": "Dismiss"])

@Global
val UiKitSpanisch = Translations("es", ["ui_kit.schliessen": "Cerrar"])
```

---
title: "Beispiel: Starter"
---

<!-- Übernommen aus LearNivram/Texo (examples/starter) mit scripts/docs-uebernehmen.mjs – bitte dort ändern. -->

# Leeres Texo-Projekt (Vorlage)

Ein minimales Projekt zum Loslegen: eine Seite, ein Zustand, eine eigene Komponente.

```
starter/
├── texo.json                  Projekteinstellungen (Quellordner, Ausgabe, Backend, Code-Schutz)
├── .gitignore                 dist/ wird nicht eingecheckt
├── public/                    Bilder, Schriften, Cursor … (werden unverändert mitkopiert)
└── src/
    ├── pages/                 Seiten (package app.pages)
    │   └── Startseite.texo    Startseite (@Page mit path: "/" → index.html)
    └── components/            Bausteine (package app.components)
        └── Karte.texo         wiederverwendbare Komponente mit Eigenschaften
```

Mit Backend kommt `src/server/` für Services, Wächter und Tabellen dazu, und `tests/` für `texo test`.

## Benutzen

```sh
# Vorlage kopieren (oder: texo init mein-projekt --example start --backend static)
cp -r examples/starter mein-projekt && cd mein-projekt

texo dev        # http://localhost:3000 – lädt bei jeder Änderung neu
texo check      # nur Typprüfung
texo build      # fertige Website in dist/ (Browser-Code minifiziert und verschleiert)
texo serve dist # gebaute Seite lokal ansehen
```

Den Ordner `dist/` kannst du auf jeden statischen Hoster legen (GitHub Pages, Netlify, nginx …).

## Nächste Schritte

- Weitere Seite: neue Datei in `src/pages/` mit `@Page(title: "Über uns", path: "ueber-uns")` – wird zu
  `ueber-uns.html`. Ein Beispiel mit mehreren Seiten und Navigation: `texo init --example website`.
- Mehrere Ansichten in einer Seite: `Router(Route("/", _ => Start()), Route("/info", _ => Info()))`.
- Eigener Look für die ganze Seite (Mauszeiger, Schrift, Hauptfarbe): `@Global val Design = GlobalStyle()…`
  – siehe [Globale Stile](../ui-und-styling.md#globale-stile-global).
- Backend dazu: in `texo.json` `"backend": "node"` (oder `texo`, `bun`, `deno`) setzen und einen `service` in
  `src/server/` schreiben. Mit Anmeldung und Datenbank: `texo init --example aufgaben`.

Anleitung Schritt für Schritt: [docs/erste-schritte.md](../erste-schritte.md) ·
alle Funktionen: [docs/api-referenz.md](../api-referenz.md)


## Quelltext

::: code-group

```texo [src/components/Karte.texo]
package app.components

import texo.ui.*
import texo.graphics.*

/// Wiederverwendbare Karte: Titel oben, beliebiger Inhalt darunter.
/// Aufruf: Karte(titel: "Hallo", [Text("Inhalt")])
component Karte(titel: String, ...inhalt: View) {
    fn build(): View {
        return Card(
            Text(this.titel)
                .fontSize(13.px)
                .fontWeight(FontWeight.SemiBold)
                .textColor(Color.Indigo600),
            Column(spacing: 12.px, this.inhalt)
        )
            .spacing(16.px)
            .padding(24.px)
            .width(320.px)
            .shadow(Shadow.Md)
    }
}
```

```texo [src/pages/Startseite.texo]
// ─────────────────────────────────────────────────────────────────────────────
//  Leeres Texo-Projekt – hier fängst du an.
//
//  src/pages/        Seiten: jede Komponente mit @Page wird zu einer HTML-Seite
//  src/components/   wiederverwendbare Bausteine für die Seiten
//  public/           Bilder, Schriften, favicon (werden unverändert mitkopiert)
//
//  texo dev     → Entwicklungsserver mit Live-Reload (http://localhost:3000)
//  texo build   → fertige Website in dist/ (Code minifiziert und verschleiert)
// ─────────────────────────────────────────────────────────────────────────────

// Jeder Ordner ist ein Paket (src/pages → app.pages); Dateien im selben Ordner sehen sich ohne Import,
// alles aus anderen Ordnern holt ein Import herein.
package app.pages

// texo.core (Int, String, List, State …) ist immer da; UI und Grafik importierst du.
import texo.ui.*
import texo.graphics.*
import app.components.*

/// Die Startseite. @Page macht aus der Komponente eine HTML-Seite, path: "/" ist index.html.
@Page(title: "Mein Texo-Projekt", path: "/")
public component Startseite {
    // Zustand: Ändert sich 'value', aktualisiert sich genau die Stelle der Oberfläche, die ihn liest.
    private State<Int> klicks = State(0)

    fn erhoehen(): Void {
        this.klicks.value += 1
    }

    // build() beschreibt die Oberfläche. Modifier wie .padding() werden zu CSS-Klassen.
    fn build(): View {
        return Column(spacing: 24.px, crossAlignment: CrossAlignment.center, [
            Heading("Willkommen bei Texo", level: 1)
                .fontSize(36.px),

            Text("Bearbeite src/pages/Startseite.texo – der Browser lädt automatisch neu.")
                .textColor(Color.Slate500),

            // Eine eigene Komponente aus src/components/Karte.texo
            Karte(titel: "Zähler", [
                Text("Du hast ${this.klicks.value}-mal geklickt.")
                    .fontSize(18.px),
                Button("Klick mich", icon: "plus")
                    .onClick(() => this.erhoehen())
            ])
        ])
            .padding(48.px)
            .minHeight(100.vh)
            .alignment(Alignment.center)
            .background(Color.Slate50)
            .dark(s => s.background(Color.Slate900).textColor(Color.White))
    }
}
```

```json [texo.json]
{
  "src": "src",
  "out": "dist",
  "backend": "static",
  "protect": "obfuscate"
}
```

:::

---
outline: [2, 3]
---

# Kommandozeile

Alles, was du für Texo brauchst, steckt in einer Programmdatei: `texo`. Sie enthält Compiler, Formatierer,
Entwicklungsserver, Testläufer, Sprachserver, Datenbankwerkzeuge und den nativen Backend-Server.

```sh
texo help                 # alle Befehle
texo <befehl> --help      # Aufruf und Optionen eines Befehls
texo version              # installierte Version, z. B. „texo 0.2.0 (Rust)“
```

Unbekannte Befehle und Optionen brechen mit einem Vorschlag ab, statt still ignoriert zu werden:

```text
$ texo biuld
Unbekannter Befehl 'biuld'. Meintest du 'texo build'?
$ texo build --protcet none
Unbekannte Option '--protcet' für texo build. Meintest du '--protect'?
```

Optionen schreibst du als `--port 4000` oder `--port=4000`. Optionen auf der Kommandozeile überschreiben die Werte aus
[`texo.json`](./projekt-anlegen.md#texojson).

## Übersicht

| Befehl | Wofür |
|---|---|
| [`texo init`](#texo-init) | neues Projekt oder neue Bibliothek anlegen |
| [`texo dev`](#texo-dev) | Entwicklungsserver mit Live-Reload |
| [`texo check`](#texo-check) | nur Typprüfung, schreibt nichts |
| [`texo build`](#texo-build) | Projekt für die Auslieferung übersetzen |
| [`texo start`](#texo-start) | gebaute App mit dem eingebauten Server starten |
| [`texo serve`](#texo-serve) | einen Ordner statisch ausliefern |
| [`texo test`](#texo-test) | Tests aus `tests/` ausführen |
| [`texo fmt`](#texo-fmt) | Quelltext einheitlich formatieren |
| [`texo responsive`](#texo-responsive) | Seiten fürs Handy prüfen und umschreiben |
| [`texo db`](#texo-db) | Migrationen, Beispieldaten, Texo Studio |
| [`texo env`](#texo-env) | Konfiguration (`@Config`) prüfen, `.env.example` schreiben |
| [`texo add`](#texo-add) | npm-Pakete und JS-Frameworks einbinden |
| [`texo lib`](#texo-lib) | Bibliotheken packen, einbinden, veröffentlichen |
| [`texo upgrade`](#texo-upgrade) | Texo und das Projekt aktualisieren |
| [`texo remove`](#texo-remove) | versehentlich angelegtes Projekt löschen |
| [`texo lsp`](#texo-lsp) | Sprachserver für Editoren |
| [`texo lex`, `texo parse`](#texo-lex-und-texo-parse) | Tokens und Syntaxbaum ausgeben (Fehlersuche) |
| `texo version` | Version ausgeben (auch `--version`, `-v`) |

Wo ein Befehl einen `pfad` nimmt, ist das ein Ordner (alle `.texo`-Dateien darin, ohne `node_modules`, `dist`,
`build` und versteckte Ordner) oder eine einzelne Datei. Ohne `pfad` liest Texo die `texo.json` im aktuellen Ordner.

## Projekt

### texo init

```text
texo init [ordner] [--example start|website|api|aufgaben|chat]
                   [--backend node|texo|bun|deno|static]
                   [--db sqlite|postgres|mysql|mongodb|none]
                   [--no-install]
texo init [ordner] --library
```

Legt ein neues Projekt an. Ohne Optionen fragt `texo init` im Terminal nach Beispiel, Backend und Datenbank; mit
Optionen läuft es ohne Rückfragen (zum Beispiel in Skripten). `--no-install` überspringt `npm install` bei den
Backends Node.js, Bun und Deno. `--library` legt statt einer App ein
[Bibliotheksprojekt](./bibliotheken.md) an.

Was die Beispiele enthalten und wie das Projekt aufgebaut ist, steht auf
[Projekt anlegen](./projekt-anlegen.md).

### texo dev

```text
texo dev [pfad] [-o ausgabe] [--port 3000] [--host [adresse]]
```

Startet den Entwicklungsserver auf `http://localhost:3000`. Bei jeder Änderung wird neu kompiliert, und offene Tabs
laden sich selbst neu. Prüffehler erscheinen als Seite im Browser, mit Codeausschnitt und Hinweis.

- Der Server ist nur auf diesem Rechner erreichbar (`127.0.0.1`). `--host` öffnet ihn fürs Netz, etwa zum Testen
  am Handy; `--host 192.168.1.20` bindet an eine bestimmte Adresse.
- Ist der Port belegt, nimmt `texo dev` den nächsten freien.
- Mit Backend startet `texo dev` den Server-Teil mit (Services, Datenbank, Jobs).
- Die übrigen Optionen sind dieselben wie bei [`texo build`](#texo-build).

### texo check

```text
texo check [pfad]
```

Prüft Typen, Namen, Icons, Stile und Server-Regeln, ohne etwas zu schreiben. Endet bei Fehlern mit Exit-Code 1 und
eignet sich deshalb für die CI. Die Fehlermeldungen erklärt die Seite [Fehlermeldungen](./fehlermeldungen.md).

### texo build

```text
texo build [pfad] [-o ausgabe] [--entry Name]
           [--protect obfuscate|minify|none] [--no-protect] [--minify]
           [--no-ssr] [--no-hash] [--backend node|texo|bun|deno|static] [--docker]
```

Übersetzt das Projekt nach `dist/` (oder `-o ausgabe`). Der Ausgabeordner wird vorher geleert.

| Option | Wirkung |
|---|---|
| `-o`, `--out` | Ausgabeordner (Standard `dist`) |
| `--entry Name` | Einstiegskomponente für `index.html` (sonst die Seiten mit `@Page`) |
| `--protect obfuscate` | Browser-Code minifizieren und verschleiern (Standard bei `texo build`) |
| `--protect minify` | nur minifizieren |
| `--protect none`, `--no-protect` | lesbarer Code, zum Beispiel zur Fehlersuche |
| `--minify` | CSS auch ohne Code-Schutz minifizieren |
| `--no-ssr` | Seiten nicht beim Bauen vorrendern |
| `--no-hash` | Dateinamen ohne Inhalts-Hash (`app.js` statt `app.3f2a91.js`) |
| `--backend …` | Backend für diesen Build überschreiben |
| `--docker` | dazu `Dockerfile` und `.dockerignore` schreiben, siehe [Docker](./docker.md) |

Was in `dist/` landet, erklären [Backend: Erzeugte Dateien](./backend.md#erzeugte-dateien) und
[Wie der Compiler arbeitet](./compiler.md#erzeugte-ausgabe).

### texo start

```text
texo start [dist]
```

Startet eine mit dem Backend `texo` gebaute App im eingebauten nativen Server. Das ist dasselbe wie
`texo-server dist/server/app.json`. Apps mit Node.js, Bun oder Deno startest du mit `cd dist && npm start`.
Konfiguriert wird der Server über Umgebungsvariablen, siehe [Backend](./backend.md#sessions-passwörter-umgebungsvariablen).

### texo serve

```text
texo serve [ordner] [--port 3000]
```

Liefert einen Ordner statisch aus, zum Beispiel `dist/` einer App ohne Backend.

### texo remove

```text
texo remove [ordner] [-y] [--dry-run]
```

Löscht ein versehentlich angelegtes Projekt. Der Befehl zeigt vorher, was gelöscht wird, und fragt nach. Nur Ordner mit
einer `texo.json` gelten als Projekt, fremde Dateien bleiben erhalten. `--dry-run` zeigt nur an, `-y` fragt nicht
nach. Aliase: `delete`, `uninstall`, `rm`.

## Qualität

### texo test

```text
texo test [filter]
```

Führt die `@Test`-Funktionen aus `tests/` aus, ohne Browser. Mit `filter` laufen nur Tests, deren Titel oder Name den
Text enthält (Groß- und Kleinschreibung egal). Exit-Code 1 bei Fehlschlägen. Alles Weitere: [Testen](./testen.md).

### texo fmt

```text
texo fmt [pfade…] [--check]
```

Formatiert `.texo`-Dateien einheitlich. Ohne Pfade nimmt es den Quellordner aus `texo.json` und `tests/`. `--check`
ändert nichts, listet abweichende Dateien und endet dann mit Exit-Code 1 (für die CI). Dateien mit Syntaxfehlern bleiben
unverändert. Alias: `format`.

### texo responsive

```text
texo responsive [pfade…] [--write] [--check]
```

Sucht Stellen, die auf dem Handy zu breit oder zu groß werden: große Schriften und Abstände ohne Breakpoint, Grids ab
drei Spalten, lange `Row`s ohne Umbruch, zu große Mindestbreiten. Für jeden Fund zeigt es die alte und die neue Zeile.
`--write` schreibt die eindeutigen Fälle auf mobile-first um, `--check` endet bei Funden mit Exit-Code 1. Mehr dazu in
[UI und Styling](./ui-und-styling.md#schmale-bildschirme).

## Daten und Konfiguration

### texo db

```text
texo db migrate [name] [--create-only] [-y]
texo db status
texo db seed [funktion]
texo db studio [--port 4983]
```

| Befehl | Wirkung |
|---|---|
| `texo db migrate [name]` | legt aus geänderten `@Table`-Klassen eine Migration in `migrations/` an und wendet ausstehende an; `--create-only` legt nur an, `-y` wendet eine Migration mit Warnungen (etwa wegfallenden Spalten) gleich an, statt erst zur Prüfung anzuhalten |
| `texo db status` | angewendete und ausstehende Migrationen sowie Änderungen ohne Migration |
| `texo db seed [funktion]` | ruft die `@Seed`-Funktionen auf (Beispieldaten) |
| `texo db studio` | Texo Studio: Tabellen im Browser ansehen und bearbeiten (nur lokal) |

Ausführlich: [Datenbanken](./datenbank.md#migrationen).

### texo env

```text
texo env check [datei]
texo env example
```

`check` prüft `.env` (oder `datei`) gegen die `@Config`-Klassen, ohne den Server zu starten. `example` schreibt eine
`.env.example` mit allen Variablen und ihren Kommentaren. Siehe
[Konfiguration und Geheimnisse](./backend.md#konfiguration-config-und-geheimnisse-secret).

## Pakete und Bibliotheken

### texo add

```text
texo add npm <paket…> [--server] [--no-bridge]
texo add framework <react|preact|vue|svelte|svelte4|solid|dom>
```

`texo add npm` installiert npm-Pakete und legt Brücken in `src/npm/` an, typisiert aus den TypeScript-Typen des
Pakets. `--server` bindet das Paket nur auf dem Server ein, `--no-bridge` installiert ohne Brücke. Siehe
[npm-Pakete](./npm.md).

`texo add framework` installiert ein JavaScript-Framework samt Adapter für `extern component`. Siehe
[JS-Frameworks](./js-frameworks.md).

### texo lib

Vorkompilierte Bibliotheken (`.texolib`): nur Schnittstelle und verschleierter Code, kein Quelltext.

| Befehl | Wirkung |
|---|---|
| `texo lib pack [ordner] [-o datei] [--sign[=schlüssel]] [--previous datei] [--allow-breaking]` | Bibliothek prüfen, kompilieren, verschleiern, mit der Vorversion vergleichen und packen |
| `texo lib keygen [-o datei] [--force]` | Ed25519-Schlüsselpaar zum Signieren |
| `texo lib publish [paket] --registry <ordner>` | Paket in eine Registry veröffentlichen |
| `texo lib add <datei \| https-url \| name[@version]> [--key …] [--trust-new-key]` | Paket mit Abhängigkeiten prüfen und einbinden |
| `texo lib update [name] [--latest]` | auf neuere Versionen aus der Registry aktualisieren |
| `texo lib outdated` | eingebundene und verfügbare Versionen vergleichen |
| `texo lib search [text]` | Pakete in der Registry suchen |
| `texo lib list` | eingebundene Bibliotheken mit Version, Signatur, Abhängigkeiten |
| `texo lib info <datei \| name>` | Autor, Lizenz, Prüfsumme, Signatur und Schnittstelle |
| `texo lib diff <alt> <neu>` | Änderungen der Schnittstelle zwischen zwei Paketen |
| `texo lib docs [ordner \| paket \| name] [-o ordner]` | Dokumentation als HTML und Markdown |
| `texo lib remove <name>` | Bibliothek austragen |

Die Registry kommt aus `--registry`, `"registry"` in `texo.json` oder der Umgebungsvariable `TEXO_REGISTRY`.
Ausführlich: [Bibliotheken](./bibliotheken.md).

## Texo selbst

### texo upgrade

```text
texo upgrade [--check] [--version tag] [--project-only] [--no-project]
```

Lädt das neueste Release (oder das mit `--version` gewählte), prüft die Prüfsumme und ersetzt die Programmdatei bzw.
das npm-Paket. Danach zieht es das Projekt im aktuellen Ordner nach: `"texo"` in `texo.json`, nötige Anpassungen und
ein `texo check`.

| Option | Wirkung |
|---|---|
| `--check` | nur nachsehen, ob es eine neuere Version gibt |
| `--version v0.2.0-build.300` | genau dieses Release installieren |
| `--project-only` | nur das Projekt nachziehen, Texo nicht neu laden |
| `--no-project` | nur Texo aktualisieren, das Projekt nicht anfassen |

Alias: `texo update`. Für private Spiegel liest `texo upgrade` ein Token aus `GITHUB_TOKEN`, `GH_TOKEN` oder `gh`.

### texo lsp

```text
texo lsp [--stdio]
```

Startet den Sprachserver (Language Server Protocol über stdio) mit Fehlern beim Tippen, Vervollständigung, Hover,
Sprung zur Definition, Gliederung und Formatieren. Die Erweiterungen für VS Code und JetBrains starten ihn selbst; andere Editoren
wie Neovim, Helix, Zed oder Sublime Text starten `texo lsp` als Sprachserver für Dateien mit der Endung `.texo`. Die
Erweiterungen stehen unter [Installation: Editoren](./installation.md#editoren).

### texo lex und texo parse

```text
texo lex <datei.texo> [--json]
texo parse <datei.texo> [--json]
```

Geben die Tokens bzw. den Syntaxbaum einer Datei aus. Nützlich, wenn du einen Fehler im Compiler melden willst.

## Umgebungsvariablen

Die wichtigsten Variablen für die Kommandozeile. Alle Variablen des Servers (Sessions, Datenbank, Mail, Uploads,
Valkey …) stehen in [Backend](./backend.md#sessions-passwörter-umgebungsvariablen).

| Variable | Wirkung |
|---|---|
| `TEXO_INSTALL_DIR` | Zielordner der Installer (Standard `~/.local/bin` bzw. `%LOCALAPPDATA%\texo\bin`) |
| `TEXO_REGISTRY` | Registry für `texo lib` |
| `TEXO_SIGNING_KEY` | Pfad zum Signierschlüssel für `texo lib` (Standard `~/.texo/signing.key`) |
| `GITHUB_TOKEN`, `GH_TOKEN` | optionales Token für `texo upgrade` |
| `NO_COLOR` | Ausgabe ohne Farben |

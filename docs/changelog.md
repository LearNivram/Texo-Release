<!-- Übernommen aus LearNivram/Texo (CHANGELOG.md) mit scripts/docs-uebernehmen.mjs – bitte dort ändern. -->

# Änderungen

Jede Version wird mit jedem Push auf `main` neu gebaut und als `v<version>-build.<nummer>` veröffentlicht
(https://github.com/LearNivram/Texo-Release/releases). Hier steht, was eine Version gegenüber der vorigen neu hat;
die Release-Notizen übernehmen den Abschnitt ihrer Version.

## 0.2.0

### Neu

- **Anmeldung über GitHub, Google, Microsoft und GitLab** (OAuth/OpenID Connect) (#36).
- **Datei-Uploads**: `Upload`, `FilePicker` und `Files`, gespeichert auf der Platte oder in S3, mit signierten Links
  und geschützten Downloads (#39, #87).
- **E-Mail-Versand**: Mails aus Bausteinen, SMTP über die Job-Warteschlange, Tokens für Bestätigungs- und
  Reset-Links (#40).
- **Kv**: gemeinsamer Schlüssel-Wert-Speicher mit anderen Programmen über Valkey oder Redis. `@Cache`, Kanäle
  (`Channel(topic:)`), Instanz-Bus, `@RateLimit` und Sitzungen (`TEXO_KV_SESSIONS`) lassen sich darüber mit einem
  Go-Dienst teilen; Beispiel `examples/lager-go` (#95).
- **Reines Backend ohne Webseite**: `texo init --example api`; Projekte ohne Seiten bauen keinen Browser-Code (#96).
- **`texo init`** legt eine feste Ordnerstruktur an (`src/server`, `src/pages`, `src/components`) und bietet vier
  Beispiele zur Auswahl: start, website, aufgaben, chat (#84).
- **Echte Adressen statt `#/`** im Router (`"routing": "path"` in `texo.json`) (#37).
- **Tabellen-Extras**: `@CreatedAt`, `@UpdatedAt`, `@SoftDelete` und der Zwischenspeicher `@Cache` (#38).
- **Zugriffsregeln an Tabellen**: `@Policy`, `@Tenant` und das Änderungsprotokoll `@Audited` (#65).
- **Auswertungen mit Typen**: `groupBy`, `select` und `Db.query` (#65).
- **Volltextsuche** mit `@Searchable`, `Tabelle.search` und `Highlight` (#73).
- **Live-Abfragen**: `query.live()` aktualisiert sich bei Änderungen selbst; mehrere Instanzen tauschen sich über
  einen Instanz-Bus in der Datenbank aus (#73).
- **Fremde Dienste typisiert anbinden**: `@HttpApi` und `@Webhook` (#73).
- **Verwaltungskonsole** für den Betrieb (`AdminConsole`) (#73).
- **Beobachtbarkeit**: Tracing, Kennzahlen und Fehlerberichte (#66).
- **Server-Daten im Browser**: `Resource` und `@Invalidates` (#65).
- **Typisierte Konfiguration**: `@Config` aus Umgebungsvariablen und der Typ `Secret` (#65).
- **Testen**: `TestClient` mit echtem Anfrageweg und steuerbarer Uhr (`Clock`) (#65).
- **Bausteine**: `Dialog`, `Menü`, `Tabs`, `Combobox` und `Toast` mit Ein- und Ausblenden (#65); `Select` mit Wert,
  `Label` und `Table` (#87); `Window` für Ereignisse des ganzen Fensters und reaktive Werte (#67).
- **Responsive**: Tabellen scrollen, feste Breiten passen sich an (`tx-fit`), Grids werden auf schmalen Bildschirmen
  einspaltig; neuer Befehl `texo responsive` (#91).
- **`texo build --docker`**: Dockerfile und Image für jedes Backend (#41).
- **JS-Frameworks als Notausgang**: `extern component`, `texo add framework`, Brücken aus TypeScript-Typen; React-
  und Vue-Komponenten werden beim Bauen vorgerendert (#81, #82, #83, #86).
- **Tutorial** „Notizbuch“ mit Anmeldung, Daten und Uploads (`docs/tutorial.md`) (#89).
- **Dunkelmodus** für Karten und Eingabefelder (Farben als CSS-Variablen) (#65).

### Verbessert

- **Sicherheit**: Passkeys verlangen die Nutzerverifikation; `texo dev` lauscht nur noch auf diesem Rechner
  (127.0.0.1) (#94). rustls mit Sicherheitskorrekturen; `@Pattern` mit Mustern, die der Server nicht kennt (Lookahead, Rückverweise),
  meldet `texo check` als Fehler statt sie durchzulassen; Loader-Daten in Node, Bun und Deno können keine Teile der
  Seite mehr in den Datenblock kopieren (#93).
- **Fehlermeldungen**: „Meintest du …?“ auch für Namen aus JavaScript, CSS und React (#89); unbekannte Icon-Namen
  meldet `texo check`, auch über Parameter und `Button(icon:)` (#92); Prüffehler erscheinen im Browser (#85).
- **Installation ohne Token**: Releases liegen zusätzlich im öffentlichen
  [LearNivram/Texo-Release](https://github.com/LearNivram/Texo-Release); abgelehnte Tokens werden übersprungen,
  403 und Anfragelimit verständlich gemeldet (#79). Anleitung für die Installation in der CI, `install.sh` läuft nie
  halb (#80). Download-Fehler blockieren das npm-Paket `texo-lang` nicht mehr (#74).
- **Laufzeit**: kleinere Browser-Laufzeit, gepackte Antworten (#85).
- **Editoren**: `texo lsp` gibt im Terminal einen Hinweis, versteht Windows-Pfade und folgt keinen Symlink-Kreisen
  (#88); Sprachdienst für Framework-Anmerkungen (#83).
- **CI** läuft auf Woodpecker statt GitHub Actions (#77).

### Behoben

- `Slider(bind:)` und `Input(type: InputType.Number)` schreiben eine Zahl statt Text in den State (#76, #65).
- `Link(to:)` mit dynamischem Ziel: der Lambda-Parameter `t` kollidiert nicht mehr (#65).
- Anker-Links (`#abschnitt`) lösen keinen Routenwechsel mehr aus (#65).
- Farbstopp `.at(…)` behält Theme-Token und CSS-Variablen (#65).
- `State.persisted` stellt Datenklassen als echte Instanzen wieder her (#65).
- Hilfe der Kommandozeile vollständig, `texo lsp --help` startet keinen Server mehr (#65).
- `texo db migrate`: die erste Migration hält den Stand auch ohne neue Spalten fest; `texo db status` vergleicht
  richtig mit den Migrationen (#89).

## 0.1.0

Erste Rust-Fassung von Texo (#34): Compiler, Sprachdienst, `texo fmt`, der native Server (Backend Texo) neben Node.js,
Bun und Deno, Texo Data (SQLite, PostgreSQL, MySQL, MongoDB), Auth mit Passkeys, Hintergrundjobs und Zeitpläne,
Echtzeit mit Stream und Channel, Videos und Livestreams, Installer mit Prüfsumme für Linux, macOS und Windows.

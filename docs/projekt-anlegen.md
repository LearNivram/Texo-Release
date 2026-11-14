---
outline: [2, 3]
---

# Projekt anlegen

Ein neues Projekt legst du mit `texo init` an. Ohne Optionen fragt Texo nacheinander:

1. **Womit möchtest du starten?** Ein Beispiel als Ausgangspunkt (siehe [unten](#die-beispiele)).
2. **Welches Backend soll das Projekt verwenden?** Node.js, Texo, Bun, Deno oder keins.
3. **Welche Datenbank soll das Projekt verwenden?** SQLite, PostgreSQL, MySQL/MariaDB, MongoDB oder keine.
4. **Soll Valkey dazukommen?** Nur bei Projekten mit Backend, siehe [Valkey](#valkey).

Eine leere Eingabe nimmt jeweils den ersten Vorschlag. Fragen, die nicht passen, entfallen: ein reines
Oberflächen-Beispiel fragt nicht nach einer Datenbank, und Beispiele, die einen Server brauchen, bieten „kein Backend“
nicht an. Läuft `texo init` nicht in einem Terminal (etwa in einem Skript), nimmt es ohne Optionen das Beispiel
`start` ohne Backend.

```sh
texo init meine-app
cd meine-app
texo dev
```

## Valkey

Bei jedem Projekt mit Backend fragt `texo init`, ob **Valkey** dazukommen soll (direkt: `--kv valkey`, ohne:
`--kv none`). Mit Valkey stehen `TEXO_KV_URL=valkey://localhost:6379` in `.env` und `.env.example` und ein Dienst
`valkey/valkey:8` in `docker-compose.yml`; mit einer Datenbank landen beide in derselben Datei. `docker compose up -d`
startet sie. Danach laufen [`Kv`](./kv.md), `@Cache(shared: true)`, `@RateLimit` und Kanäle mit `topic:` über Valkey,
gemeinsam für alle Instanzen und andere Programme. Ohne Valkey arbeitet `Kv` im Arbeitsspeicher.

## Ohne Rückfragen

Alle Antworten lassen sich auch als Optionen übergeben, etwa in Skripten oder in der CI:

```sh
texo init meine-app --example aufgaben --backend texo --db sqlite
texo init website --example website --backend static
texo init api --example api --backend node --db postgres --no-install
texo init umfrage --example umfrage --backend texo --kv valkey
```

| Option | Werte |
|---|---|
| `--example` | `start`, `website`, `api`, `aufgaben`, `chat`, `umfrage` |
| `--backend` | `texo`, `node`, `bun`, `deno`, `static` (kein Backend) |
| `--db` | `sqlite`, `postgres`, `mysql`, `mongodb`, `none` |
| `--kv` | `valkey`, `none` (nur mit Backend) |
| `--no-install` | bei Node.js, Bun und Deno kein `npm install` ausführen (Treiber später selbst installieren) |
| `--library` | eine [Bibliothek](#bibliothek-anlegen) statt einer App anlegen |

Ohne `ordner` legt `texo init` das Projekt im aktuellen Ordner an. Ein versehentlich angelegtes Projekt räumt
[`texo remove`](./kommandozeile.md#texo-remove) wieder weg.

## Die Beispiele

| Beispiel | Inhalt | braucht |
|---|---|---|
| `start` | eine Seite und eine Komponente: hier fängst du an. Mit Backend kommt ein Zähler auf dem Server dazu, mit Datenbank steht er in einer Tabelle. | – |
| `website` | mehrere Seiten (Startseite, Über uns, Kontakt) mit gemeinsamem Layout und Navigation | – |
| `api` | nur Backend, ohne Webseite: eine Notizen-API für Apps, Skripte und andere Server | Backend |
| `aufgaben` | Registrieren, Anmelden mit [`@Auth`](./backend.md#anmeldung-auth), eigene Aufgaben in der Datenbank | Backend und Datenbank |
| `chat` | Beitreten mit Namen, Nachrichten in der Datenbank | Backend und Datenbank |
| `umfrage` | Live-Umfrage mit [Kv](./kv.md): Stimmen als Zähler, gemeinsamer `@Cache`, Ergebnisse live auf allen Seiten, `@RateLimit` über alle Instanzen, mit Tests. Läuft ohne Valkey im Speicher. | Backend (Valkey freiwillig) |

So sieht zum Beispiel `aufgaben` mit Backend Texo und SQLite aus:

```text
meine-app/
├── texo.json                    Projekteinstellungen
├── .gitignore
├── public/                      Bilder, Schriften, favicon (unverändert mitkopiert)
├── src/
│   ├── server/                  Server: Services, Wächter, Tabellen
│   │   ├── Aufgaben.texo
│   │   └── Konto.texo
│   ├── pages/                   Seiten (@Page)
│   │   ├── Aufgaben.texo
│   │   └── Login.texo
│   └── components/              wiederverwendbare Komponenten
│       └── AufgabeZeile.texo
└── tests/                       Tests (texo test)
    └── AufgabenTest.texo
```

Das Beispiel `api` hat nur `src/server/` und `tests/`. Ein Projekt ohne Seiten baut keinen Browser-Code. `texo init`
zeigt am Ende, wie du die laufende API mit `curl` aufrufst:

```sh
curl -X POST http://localhost:3000/api/notizen/liste -H 'Content-Type: application/json' -d '{"args":[]}'
```

Wie Services aufgerufen werden und wie du sie absicherst, steht in
[Backend: Backend wählen](./backend.md#backend-wählen).

## Projektstruktur

Jedes Projekt hat dieselbe Ordnerstruktur. Jeder Ordner ist ein eigenes Paket (`package app.pages`,
`package app.components` …), die Dateien darin importieren sich gegenseitig.

| Ordner | Inhalt |
|---|---|
| `src/server/` | Code, der nur auf dem Server läuft: `service`, `@Guard`-Wächter, `@Table`-Klassen, `@Job`, `@Cron` |
| `src/pages/` | Seiten mit `@Page(path: "/…")`; jede wird beim Bauen vorgerendert |
| `src/components/` | Komponenten, die mehrere Seiten benutzen |
| `tests/` | `@Test`-Funktionen für [`texo test`](./testen.md) |
| `public/` | statische Dateien, die unverändert in die Ausgabe kopiert werden ([mehr](./ui-und-styling.md#bilder-schriften-und-andere-dateien-public)) |
| `migrations/` | entsteht mit `texo db migrate` ([Migrationen](./datenbank.md#migrationen)) |
| `data/` | die SQLite-Datei `app.db` (nicht einchecken) |
| `dist/` | Ergebnis von `texo build` (nicht einchecken) |

Die Struktur ist eine Empfehlung: Texo übersetzt alle `.texo`-Dateien unter `src`, egal in welchem Unterordner. Ob
Code auf dem Server oder im Browser läuft, entscheiden `service` und `@Server`, nicht der Ordner.

## Backend und Datenbank

| Backend | Wann |
|---|---|
| **Texo** | nativer Server in Rust, eine Programmdatei ohne Node.js; Datenbanktreiber sind eingebaut. Gestartet mit `texo start`. |
| **Node.js** | bewährt und überall verfügbar; npm-Pakete laufen direkt auf dem Server |
| **Bun** | sehr schneller Start, eingebauter TLS-Server |
| **Deno** | sicher per Standard (Berechtigungen) |
| **kein Backend** (`static`) | nur HTML, CSS und JavaScript für jedes Static Hosting (GitHub Pages, Netlify, ein Bucket …) |

Der Texo-Code ist für alle Backends derselbe. Wechseln heißt: `"backend"` in `texo.json` ändern. Unterschiede im
Betrieb beschreibt [Backend und Sicherheit](./backend.md#backend-wählen).

| Datenbank | Was `texo init` dazu anlegt |
|---|---|
| **SQLite** | nichts weiter: die Datei `data/app.db` entsteht beim ersten Start |
| **PostgreSQL**, **MySQL/MariaDB**, **MongoDB** | `docker-compose.yml` zum Starten der Datenbank, `.env` mit `DATABASE_URL` (nicht einchecken), `.env.example`; bei Node.js, Bun und Deno außerdem den Treiber (`pg`, `mysql2`, `mongodb`) |

```sh
docker compose up -d     # Datenbank starten (oder DATABASE_URL in .env auf eine vorhandene zeigen lassen)
texo dev
```

Tabellen beschreibst du als `@Table data class`; beim Entwickeln legt Texo fehlende Tabellen selbst an. Ab dem ersten
Release hältst du Änderungen mit `texo db migrate` fest. Alles dazu: [Datenbanken](./datenbank.md).

## texo.json

Die Projekteinstellungen. `texo init` schreibt zum Beispiel:

```json
{
  "texo": "0.2.0-build.300",
  "src": "src",
  "out": "dist",
  "backend": "texo",
  "protect": "obfuscate",
  "server": {
    "port": 3000,
    "allowedOrigins": []
  },
  "database": {
    "type": "sqlite",
    "url": "data/app.db"
  }
}
```

| Schlüssel | Standard | Bedeutung |
|---|---|---|
| `texo` | – | Texo-Version, mit der das Projekt zuletzt benutzt wurde (setzen `texo init` und `texo upgrade`); ist sie neuer als die installierte, weist `texo build` auf `texo upgrade` hin |
| `src` | `"src"` | Quellordner oder -datei |
| `out` | `"dist"` | Ausgabeordner (wird vor jedem Build geleert) |
| `entry` | – | Einstiegskomponente für `index.html`, wenn es keine `@Page`-Seiten gibt |
| `backend` | `"static"` | `texo`, `node`, `bun`, `deno` oder `static` |
| `server.port` | `3000` | Port des Servers (zur Laufzeit auch über `PORT`) |
| `server.allowedOrigins` | `[]` | weitere vertrauenswürdige Herkünfte, z. B. ein Admin-Frontend auf einer anderen Domain ([Sicherheitsmodell](./backend.md#sicherheitsmodell)) |
| `database` | SQLite in `data/app.db` | `{ "type": "sqlite" \| "postgres" \| "mysql" \| "mongodb" \| "memory", "url": "env:DATABASE_URL", "autoCreate": true }` – [Datenbanken](./datenbank.md) |
| `routing` | `"hash"` | Adressen des Routers: `hash` (`#/pfad`, läuft auf jedem Host) oder `path` (`/pfad`) – [Routing](./reaktivitaet.md#routing) |
| `protect` | `"obfuscate"` | Code-Schutz von `texo build`: `obfuscate`, `minify` oder `none` |
| `minify` | `false` | CSS minifizieren (bei `texo build` mit Code-Schutz immer an) |
| `ssr` | `true` | Seiten beim Bauen vorrendern |
| `hashNames` | `true` | Inhalts-Hash in den Namen von JS- und CSS-Dateien (dauerhaftes Caching) |
| `public` | `"public"` | Ordner mit statischen Dateien |
| `tests` | `"tests"` | Ordner mit Testdateien |
| `docker` | `false` | `texo build` schreibt `Dockerfile` und `.dockerignore` mit – [Docker](./docker.md) |
| `errors` | `false` | Fehler aus dem Browser gebündelt an den Server melden (nur mit Backend) – [Beobachtbarkeit](./backend.md#betrieb-und-beobachtbarkeit) |
| `cluster` | – | mehrere Instanzen teilen Kanäle, Sitzungen und Live-Abfragen: `{ "bus": "database" }` oder `{ "bus": "kv" }` – [Mehrere Instanzen](./backend.md#mehrere-instanzen-cluster) |
| `libraries` | – | eingebundene Bibliotheken (gepflegt von `texo lib add/update/remove`) – [Bibliotheken](./bibliotheken.md) |
| `registry` | – | Registry für `texo lib`: Ordner oder `https://…` |
| `library` | – | macht das Projekt zur Bibliothek: `name`, `version`, `description`, `license`, `author` |
| `demo` | `"demo"` | nur Bibliotheken: Ordner mit Vorschauseiten, die nicht ins Paket kommen |

Optionen auf der Kommandozeile überschreiben `texo.json`, z. B. `texo build --backend bun`. Ein ungültiges JSON meldet
Texo mit `texo.json ist ungültig: …`.

## Bibliothek anlegen

```sh
texo init meine_lib --library
```

```text
meine_lib/
├── texo.json            mit "library": { "name", "version", … } und "demo": "demo"
├── src/                 die Bibliothek
│   └── Komponenten.texo
├── demo/                Vorschau für texo dev (kommt nicht ins Paket)
│   └── Vorschau.texo
└── tests/
    └── Komponenten.texo
```

`texo dev` zeigt die Vorschau mit Live-Reload, `texo lib pack` baut daraus `meine_lib-0.1.0.texolib`. Wie du sie
teilst, signierst und einbindest, steht in [Bibliotheken](./bibliotheken.md).

## Wie es weitergeht

- [Erste Schritte](./erste-schritte.md): Elemente, Modifier, Zustand und Seiten der Reihe nach
- [Tutorial](./tutorial.md): ein Notizbuch mit Konto, Datenbank und Bildern
- [Kommandozeile](./kommandozeile.md): alle Befehle im Überblick

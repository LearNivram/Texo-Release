<!-- Übernommen aus LearNivram/Texo (docs/docker.md) mit scripts/docs-uebernehmen.mjs – bitte dort ändern. -->

# Docker

Mit `texo build --docker` schreibt Texo neben die gebaute Anwendung ein `Dockerfile` und eine `.dockerignore`. Ein
Befehl baut daraus das Image, ein zweiter startet es – auf jedem Rechner mit Docker, auch unter macOS und Windows:

```sh
texo build --docker
docker build -t meine-app dist
docker run -p 3000:3000 -e TEXO_SECRET=$(openssl rand -hex 32) meine-app
```

Statt der Option geht auch `"docker": true` in der `texo.json`; dann schreibt jedes `texo build` das Dockerfile mit.
Es wird bei jedem Build neu erzeugt (wie alles in `dist/`). Wer es von Hand anpassen will, kopiert es aus `dist/`
heraus und baut mit `docker build -f Dockerfile.eigen dist`.

**Am schnellsten mit allem Drum und Dran:** `texo container` fragt nach dem Containerdienst (Docker oder Podman),
baut das Projekt, schreibt eine fertige Compose-Datei mit Datenbank, Valkey und Mail-Testpostfach und startet auf
Wunsch alles gleich – siehe [texo container](#texo-container).

## Inhalt

1. [texo container](#texo-container)
2. [Was im Image steckt](#was-im-image-steckt)
3. [Konfiguration zur Laufzeit](#konfiguration-zur-laufzeit)
4. [Datenbank und Volume](#datenbank-und-volume)
5. [Backend Texo: woher `texo-server` kommt](#backend-texo-woher-texo-server-kommt)
6. [Mehrere Architekturen (amd64 und arm64)](#mehrere-architekturen-amd64-und-arm64)
7. [Health-Check](#health-check)
8. [Docker Compose](#docker-compose)

## texo container

```sh
texo container            # fragt nach Docker oder Podman, baut, schreibt container/compose.yaml, fragt „Jetzt starten?“
texo container --start    # ohne Rückfrage bauen und starten
texo container logs       # Log der App (logs -f app)
texo container status     # laufende Container (ps)
texo container stop       # anhalten und entfernen (down); die Daten in den Volumes bleiben
```

Beim ersten Aufruf fragt Texo, mit welchem Containerdienst das Projekt laufen soll, und zeigt, welcher installiert
ist. Die Wahl steht danach in der `texo.json` (`"container": "docker"` oder `"podman"`); `--engine podman` wählt
einmalig um und merkt sich das. Ohne Terminal (CI) nimmt Texo den ersten installierten Dienst.

| Dienst | Aufruf | |
|---|---|---|
| Docker | `docker compose` | Docker Engine, Docker Desktop, OrbStack, Colima, Rancher Desktop |
| Podman | `podman compose` (sonst `podman-compose`) | ohne Daemon, ohne root; alle Images haben volle Namen (`docker.io/…`), Podman fragt also nicht nach der Registry |

Was `texo container` schreibt:

- `dist/Dockerfile` und `dist/.dockerignore` wie `texo build --docker` (alle Optionen von `texo build` wie
  `--no-protect` gehen durch).
- `container/compose.yaml` – bei jedem Aufruf neu, passend zum Projekt. Eigene Ergänzungen (weitere Dienste,
  Labels für einen Reverse Proxy, andere Ports) gehören in `container/compose.override.yaml`; Compose liest sie von
  selbst mit.
- `container/.env` – einmal erzeugt, danach ergänzt Texo nur fehlende Einträge: ein zufälliges `TEXO_SECRET`,
  Datenbank-Passwörter, `APP_PORT` (Port auf dem eigenen Rechner) und `TEXO_PUBLIC_URL`. Einträge aus der `.env` des
  Projekts (OAuth-Schlüssel, `@Config`-Werte, `TEXO_MAIL_FROM` …) kommen mit; Adressen auf `localhost` nicht, die
  zeigen im Container auf den Container selbst (Texo nennt sie). Die Datei landet in der `.gitignore`.

Welche Dienste in die Compose-Datei kommen, liest Texo aus `texo.json` und dem Quelltext:

| Baustein | erkannt an | im Container |
|---|---|---|
| App | immer | Image aus `dist/`, Port `${APP_PORT}`, Health-Check `/__texo/health`, `restart: unless-stopped` |
| SQLite | `database.type` `sqlite` | Volume `app-daten` unter `/app/data` |
| PostgreSQL | `database.type` `postgres` | `postgres:17` mit Health-Check, Volume `db-daten`; die App bekommt `TEXO_DB_URL` |
| MySQL / MariaDB | `database.type` `mysql` | `mysql:8.4` mit Health-Check, Volume `db-daten` |
| MongoDB | `database.type` `mongodb` | `mongo:8` als Replica Set (für Transaktionen), richtet sich beim ersten Start selbst ein |
| Valkey | `Kv.` im Quelltext, `TEXO_KV_URL` in der `.env` oder `cluster.bus: "kv"` | `valkey/valkey:8`, Volume `kv-daten`; die App bekommt `TEXO_KV_URL` |
| Mail | `Mail.send` im Quelltext und kein `TEXO_SMTP_URL` | Mailpit als Testpostfach: alle Mails unter http://localhost:8025, nichts geht hinaus |
| Uploads | `Files.save` im Quelltext und kein `TEXO_S3_BUCKET` | Volume `app-daten` für `data/files` |

Die App startet erst, wenn Datenbank und Valkey gesund sind. Datenbank und Valkey sind nur im Netz des Projekts
erreichbar, nicht auf dem eigenen Rechner – sie stören also nicht die Datenbank aus der `docker-compose.yml` für
`texo dev`.

**Echte Mails:** `TEXO_SMTP_URL` (und `TEXO_MAIL_FROM`) in `container/.env` eintragen; beim nächsten
`texo container` fällt Mailpit weg. **S3 statt Platte:** `TEXO_S3_BUCKET` und die Zugangsdaten in `container/.env`.

Mit `--start` (oder „Jetzt starten?“ mit Enter) ruft Texo `docker compose up -d --build` bzw. `podman compose up -d
--build` im Ordner `container/` auf und wartet, bis die App unter `http://localhost:${APP_PORT}` antwortet. Von Hand
geht dasselbe mit `cd container && docker compose up -d --build`.

**Auf einen Server bringen:** Projekt (oder nur `dist/` und `container/`) auf den Server kopieren, dort
`TEXO_PUBLIC_URL` in `container/.env` auf die echte Adresse setzen und `docker compose up -d --build` im Ordner
`container/` aufrufen. HTTPS übernimmt am besten ein Reverse Proxy davor (Caddy, Traefik, nginx), dann gehört
`TRUST_PROXY` in die `.env`.

## Was im Image steckt

| Backend | Basis-Image | Startbefehl |
|---|---|---|
| `texo` | `gcr.io/distroless/cc-debian12:nonroot` (glibc, CA-Zertifikate, keine Shell) | `texo-server server/app.json` |
| `node` | `node:22-slim` (andere Version: `--build-arg NODE_VERSION=…`) | `node server/main.js` |
| `bun` | `oven/bun:1-slim` (`--build-arg BUN_VERSION=…`) | `bun server/main.js` |
| `deno` | `denoland/deno:2.9.7` (`--build-arg DENO_VERSION=…`) | `deno run --allow-… server/main.js` |
| `static` | `nginx:1.27-alpine` | nginx liefert die Seiten aus |

Ein Image mit Backend Texo ist rund 65 MB groß (Server und Laufzeit, ohne Node.js); mit Node.js sind es gut 300 MB.

- Der Startbefehl ist derselbe wie `npm start` in `dist/` (aus `dist/package.json`).
- Node.js, Bun, Deno: Hat `dist/package.json` Abhängigkeiten (npm-Pakete aus `@npm`-Brücken, Datenbanktreiber wie
  `pg`), installiert das Image sie ohne Entwicklungsabhängigkeiten (`npm install --omit=dev`, `bun install
  --production`, `deno install`).
- Der Server läuft nicht als root (Benutzer `nonroot`, `node`, `bun` bzw. `deno`); die Programmdateien gehören root,
  beschreibbar ist nur `data/` (SQLite, Uploads).
- Alle Images stehen mit vollem Namen im Dockerfile (`docker.io/library/node:…`), damit auch Podman sie ohne
  Rückfrage findet.
- Das Image setzt `TEXO_ENV=production` (Backend Texo) bzw. `NODE_ENV=production`. Ohne `TEXO_SECRET` startet der
  Server deshalb nicht.
- `.dockerignore` hält `.env`, eine lokale `data/` und `node_modules/` aus dem Image heraus; Zugangsdaten gibst du
  beim Start mit (`-e`, `--env-file`).
- Statisch (`static`): nginx lauscht auf Port 3000 und liefert `dist/` aus (außer `Dockerfile` und `.dockerignore`).

## Konfiguration zur Laufzeit

| Variable | |
|---|---|
| `TEXO_SECRET` | **Pflicht**: Schlüssel für Sessions, mindestens 32 Zeichen (`openssl rand -hex 32`). Für alle Container einer Anwendung gleich, sonst gelten Sessions nur auf einem |
| `PORT` | Port im Container (Standard `3000` bzw. `"server": { "port": … }` aus texo.json); `EXPOSE` und `-p` passen dazu |
| `HOST` | Adresse, an die der Server bindet (Standard `0.0.0.0`) |
| `TEXO_DB_URL` | Adresse der Datenbank, überschreibt texo.json – z. B. `postgres://app:…@db:5432/app` |
| `DATABASE_URL` o. ä. | wenn texo.json `"url": "env:DATABASE_URL"` sagt |
| `TRUST_PROXY` | Adressen des Reverse Proxys davor, z. B. `10.0.0.0/8` oder `172.16.0.0/12` (Docker-Netze), siehe [Backend und Sicherheit](backend.md#entwickeln-bauen-starten-https) |
| `TLS_CERT`, `TLS_KEY` | HTTPS direkt im Container (Dateien per `-v` einbinden); meist übernimmt das ein Reverse Proxy |
| `TEXO_OTLP_URL`, `TEXO_METRICS_TOKEN`, `TEXO_LOG_FORMAT=json` | Traces an einen Collector, Kennzahlen unter `/__texo/metrics`, Log als JSON-Zeilen, siehe [Backend und Sicherheit](backend.md#betrieb-und-beobachtbarkeit) |

```sh
docker run -d --name meine-app -p 3000:3000 \
  -e TEXO_SECRET=… \
  -e TEXO_DB_URL=postgres://app:geheim@db.example:5432/app \
  meine-app
```

Mehrere Variablen bequem aus einer Datei, die nicht im Image landet: `docker run --env-file .env.produktion …`.

## Datenbank und Volume

SQLite (Standard von Texo Data) liegt im Container unter `/app/data/app.db`. Das Dockerfile legt `/app/data` als
Volume an und gibt den Ordner dem Benutzer des Servers. Gib ihm einen Namen, damit die Daten neue Container
(Updates) überstehen:

```sh
docker run -d -p 3000:3000 -e TEXO_SECRET=… -v meine-app-daten:/app/data meine-app
```

Migrationen aus `migrations/` reisen im Image mit und werden beim Start angewendet (wie bei `texo start`). Für
PostgreSQL, MySQL oder MongoDB braucht es kein Volume, nur die Adresse (`TEXO_DB_URL` oder die Variable aus
texo.json).

## Backend Texo: woher `texo-server` kommt

Das Image braucht den nativen Server für **Linux** – auch wenn du unter macOS oder Windows baust. Deshalb lädt das
Dockerfile in einer ersten Stufe `texo-server-linux-x64` bzw. `texo-server-linux-arm64` aus dem GitHub-Release
**derselben Texo-Version**, mit der du gebaut hast (`ARG TEXO_VERSION=v0.1.0-build.N` im Dockerfile), und prüft die
SHA256-Summe gegen `SHA256SUMS.txt` des Releases. Eine veränderte oder beschädigte Datei bricht den Build ab.

**Privates Repository:** Das Token geht als BuildKit-Secret hinein – es landet weder im Image noch in dessen
Verlauf:

```sh
export GITHUB_TOKEN=…            # Token mit Lesezugriff, oder: export GITHUB_TOKEN=$(gh auth token)
docker build --secret id=github_token,env=GITHUB_TOKEN -t meine-app dist
```

**Ohne Internetzugang / eigener Spiegel:** ein Ordner (Webserver) mit `texo-server-linux-*` und `SHA256SUMS.txt`:

```sh
docker build --build-arg TEXO_DOWNLOAD_URL=https://intern.example/texo/v0.1.0-build.42 -t meine-app dist
```

Weitere Build-Argumente: `TEXO_VERSION` (anderes Release), `TEXO_REPO` (Fork), `TEXO_GITHUB_API` (GitHub Enterprise).

**Texo aus dem Quellcode gebaut** (`texo version` zeigt „aus dem Quellcode“): Diese Fassung kennt kein Release.

- Unter Linux (x64 oder arm64) legt `texo build --docker` den eigenen `texo-server` (neben dem Programm `texo`, also
  `target/release/texo-server` nach `cargo build --release`) nach `dist/` und das Image nimmt diesen. Er passt nur zur
  Architektur dieses Rechners.
- Sonst erzeugt Texo das Dockerfile ohne Version und sagt es; dann gibst du ein Release an:
  `docker build --build-arg TEXO_VERSION=v0.1.0-build.42 -t meine-app dist`.

## Mehrere Architekturen (amd64 und arm64)

Ein Image für Intel/AMD-Server und ARM (z. B. AWS Graviton, Raspberry Pi 4/5, Apple-Silicon-Rechner) zugleich:

```sh
docker buildx build --platform linux/amd64,linux/arm64 -t registry.example/meine-app:1.0 --push dist
```

Beim Backend Texo holt jede Plattform ihren eigenen `texo-server` (Docker setzt `TARGETARCH`). Mit einem lokal
gebauten `texo-server` (siehe oben) geht nur die Architektur des eigenen Rechners.

## Health-Check

Jedes Image hat einen `HEALTHCHECK` auf `GET /__texo/health` (200, wenn der Server läuft und die Datenbank antwortet,
siehe [Backend und Sicherheit](backend.md#entwickeln-bauen-starten-https)). `docker ps` zeigt dann `healthy` bzw. `unhealthy`.

- Backend Texo: Das distroless-Image hat weder Shell noch curl; der Check ist `texo-server --health`. Mit
  `TLS_CERT`/`TLS_KEY` prüft er nur, ob der Server Verbindungen annimmt.
- Node.js, Bun, Deno: ein kurzes `fetch` mit der Laufzeit selbst.
- statisch: `wget` auf die Startseite.

## Docker Compose

Fertig erzeugt von [`texo container`](#texo-container); von Hand sieht das Wesentliche so aus:

```yaml
services:
  app:
    build: dist
    ports: ["3000:3000"]
    environment:
      TEXO_SECRET: ${TEXO_SECRET}        # aus .env neben compose.yaml
      TEXO_DB_URL: postgres://app:geheim@db:5432/app
    depends_on: [db]
  db:
    image: postgres:17
    environment:
      POSTGRES_USER: app
      POSTGRES_PASSWORD: geheim
    volumes: [db-daten:/var/lib/postgresql/data]
volumes:
  db-daten:
```

Mit SQLite statt PostgreSQL entfällt `db`; dafür bekommt `app` ein Volume: `volumes: [app-daten:/app/data]`.

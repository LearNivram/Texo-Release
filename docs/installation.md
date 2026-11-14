<!-- Übernommen aus LearNivram/Texo (docs/installation.md) mit scripts/docs-uebernehmen.mjs – bitte dort ändern. -->

# Texo installieren

Texo ist **eine einzige Programmdatei** (`texo` bzw. `texo.exe`). Compiler, Entwicklungsserver, Sprachserver für
Editoren, Datenbankwerkzeuge und der native Server für das Backend Texo stecken darin. Für Projekte mit dem
Backend Texo oder ohne Backend braucht es **kein Node.js, kein npm und keine weiteren Abhängigkeiten**.

| System | Unterstützt | Datei im Release |
|---|---|---|
| Windows 10/11, x64 (ARM über die eingebaute x64-Emulation) | ✔ | `texo-windows-x64.exe` |
| macOS 11 oder neuer, Apple Silicon (M1 …) | ✔ | `texo-darwin-arm64` |
| macOS 11 oder neuer, Intel | ✔ | `texo-darwin-x64` |
| Linux x64 mit glibc 2.35 oder neuer (Ubuntu 22.04, Debian 12, Fedora 36 und neuer) | ✔ | `texo-linux-x64` |
| Linux ARM64 (z. B. Raspberry Pi 4/5 mit 64-Bit-System, AWS Graviton), glibc 2.35 oder neuer | ✔ | `texo-linux-arm64` |
| Linux mit musl (Alpine) oder älterer glibc | – | aus dem Quellcode bauen (siehe unten) |

Jedes Release enthält außerdem `SHA256SUMS.txt` (Prüfsummen aller Dateien), die Installer `install.sh` und
`install.ps1`, das npm-Paket `texo-lang.tgz`, die Editor-Erweiterungen `texo-vscode.vsix` und
`texo-jetbrains.zip` sowie `texo-server-<system>` (nur der Server, für Server ohne Texo-Programm).

Die Releases liegen im öffentlichen Repository [LearNivram/Texo-Release](https://github.com/LearNivram/Texo-Release)
(der Quellcode bleibt privat): Installation, npm-Paket und `texo upgrade` brauchen kein Token und keine Anmeldung.

## Windows

In **PowerShell** (Startmenü → „PowerShell“; Administratorrechte sind nicht nötig):

```powershell
irm https://github.com/LearNivram/Texo-Release/releases/latest/download/install.ps1 | iex
```

Der Installer

1. lädt `texo-windows-x64.exe` und `SHA256SUMS.txt` aus dem neuesten Release,
2. prüft die SHA256-Summe und bricht ab, wenn sie nicht stimmt,
3. legt das Programm als `%LOCALAPPDATA%\texo\bin\texo.exe` ab und trägt den Ordner in den `PATH` des Benutzers ein.

Danach in einem **neuen** Terminal prüfen:

```powershell
texo version
```

**„Der Computer wurde durch Windows geschützt“ (SmartScreen):** Das Programm ist noch nicht mit einem
Code-Signing-Zertifikat signiert. Wer die Datei über den Browser lädt und per Doppelklick startet, sieht diese
Warnung; über „Weitere Informationen“ → „Trotzdem ausführen“ geht es weiter. Mit dem Installer (oder im Terminal)
erscheint sie nicht.

**„Die Ausführung von Skripts ist auf diesem System deaktiviert“:** `irm … | iex` ist davon nicht betroffen. Wer
`install.ps1` als Datei startet, erlaubt Skripte einmalig mit
`powershell -ExecutionPolicy Bypass -File install.ps1`.

## macOS

Im **Terminal**:

```sh
curl -fsSL https://github.com/LearNivram/Texo-Release/releases/latest/download/install.sh | sh
```

Der Installer erkennt Apple Silicon oder Intel, prüft die SHA256-Summe und legt das Programm als
`~/.local/bin/texo` ab. Ist der Ordner nicht im `PATH`, sagt er, welche Zeile in `~/.zshrc` gehört:

```sh
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc && source ~/.zshrc
texo version
```

**„texo kann nicht geöffnet werden, da der Entwickler nicht verifiziert werden kann“ (Gatekeeper):** Das
passiert nur, wenn die Datei über den Browser geladen wurde (dann trägt macOS sie als „aus dem Internet“ ein). Mit
dem Installer oder `curl` erscheint die Meldung nicht. Für eine im Browser geladene Datei:

```sh
xattr -d com.apple.quarantine ~/Downloads/texo-darwin-arm64
```

## Linux

```sh
curl -fsSL https://github.com/LearNivram/Texo-Release/releases/latest/download/install.sh | sh
```

Ohne `curl` geht es mit `wget -qO- … | sh`. Das Programm landet in `~/.local/bin/texo` (bei den meisten Distributionen schon im `PATH`, sonst wie bei macOS in
`~/.bashrc` eintragen). Für alle Benutzer eines Rechners:

```sh
curl -fsSL https://github.com/LearNivram/Texo-Release/releases/latest/download/install.sh | sudo TEXO_INSTALL_DIR=/usr/local/bin sh
```

## Einstellungen der Installer

| Variable | Bedeutung | Standard |
|---|---|---|
| `TEXO_INSTALL_DIR` | Zielordner | `~/.local/bin` bzw. `%LOCALAPPDATA%\texo\bin` |
| `TEXO_VERSION` | bestimmtes Release statt des neuesten, z. B. `v0.1.0-build.42` | neuestes |
| `TEXO_DOWNLOAD_URL` | Ordner mit den Release-Dateien auf einem eigenen Server (Firmennetz, ohne Zugang zu GitHub) | GitHub |
| `TEXO_REPO` | anderes Repository mit den Releases (ein privates braucht `GITHUB_TOKEN` oder `gh auth login`) | `LearNivram/Texo-Release` |

Unter Windows werden sie vor dem Aufruf gesetzt, z. B. `$env:TEXO_VERSION = "v0.1.0-build.42"`.

Hinter einem Firmen-Proxy beachtet `texo` (für `texo upgrade` und Pakete) `HTTPS_PROXY` und `NO_PROXY`;
eigene Zertifikate kommen über `SSL_CERT_FILE` dazu.

## In der CI (Woodpecker, GitHub Actions, GitLab …)

Die Releases sind öffentlich, die CI braucht also **kein Token**. Damit ein fehlgeschlagener Download den Lauf sofort
abbricht, das Skript erst speichern und dann ausführen (bei `curl … | sh` bekäme `sh` sonst eine leere Eingabe und
endet erfolgreich). Mit `TEXO_VERSION` bleibt die Version fest, bis man sie bewusst anhebt.

**Woodpecker**

```yaml
steps:
  - name: texo
    image: debian:bookworm-slim
    environment:
      TEXO_VERSION: v0.1.0-build.110
    commands:
      - apt-get update -qq && apt-get install -y -qq curl ca-certificates
      - curl -fsSL https://github.com/LearNivram/Texo-Release/releases/latest/download/install.sh -o /tmp/install.sh
      - TEXO_INSTALL_DIR=/usr/local/bin sh /tmp/install.sh
      - texo check && texo fmt --check && texo build
```

**GitHub Actions**

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Texo installieren
        env:
          TEXO_VERSION: v0.1.0-build.110
        run: |
          curl -fsSL https://github.com/LearNivram/Texo-Release/releases/latest/download/install.sh -o install.sh
          sh install.sh
          echo "$HOME/.local/bin" >> "$GITHUB_PATH"
      - run: texo check && texo fmt --check && texo build
```

Ohne Installer (dann ohne Prüfung der SHA256-Summe) geht es auch direkt:

```sh
curl -fsSL -o /usr/local/bin/texo https://github.com/LearNivram/Texo-Release/releases/download/$TEXO_VERSION/texo-linux-x64
chmod +x /usr/local/bin/texo
```

Lautet die Meldung trotzdem 403 oder 404, steht dahinter fast immer ein Proxy der CI oder ein falsch geschriebenes
`TEXO_VERSION`; die Releases sind unter https://github.com/LearNivram/Texo-Release/releases aufgelistet.

## Mit Node.js (npm)

Wer ohnehin Node.js ≥ 18 benutzt, kann Texo auch als npm-Paket installieren. Es ist eine dünne Hülle: Beim ersten
Aufruf lädt sie die passende Programmdatei aus dem Release ihrer Version und prüft die SHA256-Summe.

```sh
npm install -g https://github.com/LearNivram/Texo-Release/releases/latest/download/texo-lang.tgz
```

## Von Hand

1. Im [neuesten Release](https://github.com/LearNivram/Texo-Release/releases/latest) die Datei für das System und
   `SHA256SUMS.txt` laden.
2. Prüfsumme vergleichen:
   - Linux: `sha256sum --check --ignore-missing SHA256SUMS.txt`
   - macOS: `shasum -a 256 --check --ignore-missing SHA256SUMS.txt`
   - Windows: `Get-FileHash texo-windows-x64.exe` und den Wert mit der Zeile in `SHA256SUMS.txt` vergleichen
3. Umbenennen in `texo` (`texo.exe`), unter Linux/macOS ausführbar machen (`chmod +x texo`) und in einen Ordner im
   `PATH` legen.

## Editoren

- **VS Code:** `texo-vscode.vsix` aus dem Release laden, dann `code --install-extension texo-vscode.vsix` (oder
  Erweiterungen → „…“ → *Aus VSIX installieren*). Die Erweiterung findet `texo` im `PATH` und in den Ordnern der
  Installer; sonst die Einstellung `texo.server.path` setzen.
- **IntelliJ IDEA, WebStorm, PhpStorm, PyCharm … (ab 2025.2):** `texo-jetbrains.zip` laden →
  *Einstellungen | Plugins | ⚙ | Plugin von Datenträger installieren…* (ZIP nicht entpacken).

Beide nutzen `texo lsp`: Fehler beim Tippen, Vervollständigung, Hover, Sprung zur Definition, Gliederung und
Formatieren.

## Backends

| Backend (`texo init --backend …`) | Braucht zusätzlich |
|---|---|
| `texo` (nativer Server) | nichts |
| `static` (nur Seiten, z. B. für GitHub Pages) | nichts |
| `node` | Node.js ≥ 18 |
| `bun` | Bun |
| `deno` | Deno |

Mit dem Backend Texo läuft auch der Betrieb ohne weitere Software: `texo build` und dann `texo start dist`. Auf
einem Server ohne Texo-Programm genügt `texo-server-<system> dist/server/app.json`.

Als Docker-Image (jedes Backend, auch von macOS oder Windows aus): `texo build --docker`, dann
`docker build -t meine-app dist` – siehe [Docker](docker.md).

## Aktualisieren

```sh
texo upgrade            # neuestes Release laden (Prüfsumme wird geprüft) und das Projekt im Ordner nachziehen
texo upgrade --check    # nur nachsehen, ob es etwas Neues gibt
```

Die Installer können auch einfach erneut ausgeführt werden.

## Deinstallieren

- Linux/macOS: `rm ~/.local/bin/texo` (bzw. die Datei in `TEXO_INSTALL_DIR`); die `PATH`-Zeile in `~/.zshrc`/`~/.bashrc`
  kann bleiben oder entfernt werden.
- Windows: Ordner `%LOCALAPPDATA%\texo` löschen und den Eintrag in *Einstellungen → System → Info → Erweiterte
  Systemeinstellungen → Umgebungsvariablen → Path* (Benutzer) entfernen.
- npm: `npm uninstall -g texo-lang`

Außerhalb von Projekten legt Texo nur mit `texo lib keygen` etwas an: den Signierschlüssel in `~/.texo/`. Wer
Bibliotheken signiert, sollte ihn vor dem Löschen sichern.

## Aus dem Quellcode bauen

Für Systeme ohne fertige Datei (z. B. Alpine) oder zum Mitentwickeln: Rust ≥ 1.97 (über [rustup](https://rustup.rs))
und ein C-Compiler (gcc/clang, unter Windows die „Build Tools für Visual Studio“).

```sh
git clone https://github.com/LearNivram/Texo.git && cd Texo
cargo build --release          # Ergebnis: target/release/texo
cargo install --path crates/texo-cli   # oder direkt nach ~/.cargo/bin installieren
```

## Probleme

| Meldung | Lösung |
|---|---|
| `texo: command not found` / „Die Benennung "texo" wurde nicht … erkannt“ | Neues Terminal öffnen; sonst den Installationsordner in den `PATH` eintragen (siehe oben). |
| „Prüfsumme stimmt nicht … Installation abgebrochen“ | Download unvollständig oder verändert. Erneut versuchen; tritt es wieder auf, nicht von Hand installieren und Bescheid geben. |
| „Download von … fehlgeschlagen“ | Gibt es das Release unter https://github.com/LearNivram/Texo-Release/releases? Für ein privates `TEXO_REPO` `gh auth login` ausführen oder `GITHUB_TOKEN` setzen. |
| `GitHub-Anfragelimit erreicht` | Ohne Token erlaubt GitHub 60 API-Anfragen pro Stunde je Adresse. Die Meldung sagt, wann es weitergeht; mit `gh auth login` oder `GITHUB_TOKEN` sofort. |
| `GitHub lehnt das Token aus … ab` | Das genannte Token ist abgelaufen oder darf das Repository nicht lesen. Die anderen Zugänge (`GH_TOKEN`, `gh`, ohne Token) probiert Texo von selbst; das Token neu ausstellen oder die Variable entfernen. |
| `texo-lang: GitHub nicht erreichbar: keine Verbindung zu api.github.com (…)` | Das npm-Paket kommt nicht an das Programm seiner Version (kein Netz, Proxy, Firmen-Zertifikat). In Klammern steht der Grund. Hinter einem Proxy hilft `curl` (die Hülle nimmt es von selbst, wenn `fetch` scheitert); sonst mit `TEXO_BINARY_PATH=<programm>` ein vorhandenes Programm angeben. Ein früher geladenes oder mit dem Installationsskript installiertes Programm startet die Hülle in dem Fall von selbst, mit einer Warnung. |
| `version 'GLIBC_2.35' not found` | Die Linux-Distribution ist zu alt: aus dem Quellcode bauen. |
| Editor: „texo wurde nicht gefunden“ | `texo version` im Terminal prüfen; in VS Code `texo.server.path` auf die Programmdatei setzen. |

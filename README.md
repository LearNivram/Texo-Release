<div align="center">

# ✦ Texo

**Eine Sprache für die ganze Web-App.**<br>
Oberfläche, Design, Backend und Datenbank in einer statisch typisierten Sprache, ohne HTML, CSS und JavaScript.

[![Neuestes Release](https://img.shields.io/github/v/release/LearNivram/Texo-Release?label=Release&color=6366f1&style=for-the-badge)](https://github.com/LearNivram/Texo-Release/releases/latest)
[![Downloads](https://img.shields.io/github/downloads/LearNivram/Texo-Release/total?label=Downloads&color=ec4899&style=for-the-badge)](https://github.com/LearNivram/Texo-Release/releases)
![Plattformen](https://img.shields.io/badge/Linux%20·%20macOS%20·%20Windows-22c55e?style=for-the-badge)

[Installieren](#-installieren) · [In 60 Sekunden](#-in-60-sekunden) · [Was Texo kann](#-was-texo-kann) · [Editoren](#-editoren) · [Downloads](#-was-im-release-steckt)

</div>

---

## Was ist Texo?

Du beschreibst deine Oberfläche als **typisierten Objektbaum**. Der Compiler macht daraus **HTML5, atomares CSS3 und
ES6-JavaScript**, rendert jede Seite schon beim Bauen vor und hängt im Browser nur noch winzige reaktive Bindungen an.
Kein virtuelles DOM, kein Framework, keine Konfigurationshölle.

```texo
Card(
    Text("Aufrufe").fontSize(13.px),
    Text(this.views.value.formatNumber()).fontSize(36.px).fontWeight(FontWeight.Heavy),
    Button("Aktualisieren").onClick(() => this.views.value += 100)
)
    .padding(24.px)
    .radius(20.px)
    .background(LinearGradient.diagonal(Color.Indigo600, Color.Pink500))
    .hover(c => c.shadow(Shadow.Xl))
```

`.width(360)` statt `.width(360.px)`? `.textColor("rot")`? Das sind bei Texo **Compilerfehler**, kein stilles
Fehlverhalten im Browser. Und die Fehlermeldung sagt dir auf Deutsch, was gemeint war.

## 🚀 Installieren

Eine einzige Programmdatei `texo`, ohne Node.js. Die Installer prüfen die SHA256-Summe und brechen ab, wenn sie nicht stimmt.

**Linux und macOS**

```sh
curl -fsSL https://github.com/LearNivram/Texo-Release/releases/latest/download/install.sh | sh
```

**Windows** (PowerShell, ohne Administratorrechte)

```powershell
irm https://github.com/LearNivram/Texo-Release/releases/latest/download/install.ps1 | iex
```

**Mit Node.js ≥ 18** als npm-Paket

```sh
npm install -g https://github.com/LearNivram/Texo-Release/releases/latest/download/texo-lang.tgz
```

Aktualisieren geht jederzeit mit `texo upgrade`. Das holt das neueste Release und zieht dein Projekt gleich mit nach.

## ⚡ In 60 Sekunden

```sh
texo init meine-app        # fragt nach dem Backend: Texo, Node.js, Bun, Deno oder keins
cd meine-app
texo dev                   # http://localhost:3000 mit Live-Reload
```

Fertig für die Auslieferung:

```sh
texo build                 # minifiziert und verschleiert den Browser-Code
texo start                 # startet die App mit dem eingebauten Server
texo build --docker        # oder gleich ein Docker-Image
```

## 🧩 Full-Stack in einer Sprache

Ein `service` läuft auf dem Server, der Browser ruft ihn **typsicher** auf: ohne `fetch`, ohne JSON-Code, ohne
doppelte Typdefinitionen.

```texo
import texo.server.*

@Table
data class Note(@Id id: Int = 0, @Required text: String, erledigt: Boolean = false)

@Api("/api/notes")
@Guard(loggedIn)
service NotesApi {
    async fn offene(): List<Note> => await Note.where(n => !n.erledigt).orderBy(n => n.id).list()
    async fn neu(text: String): Note => await Note.insert(Note(text: text))
}
```

```texo
// im Browser
this.notes.value = await NotesApi.offene()
```

Der Browser bekommt nur einen Stub. Logik, Zugangsdaten und Datenbank bleiben auf dem Server.

## ✨ Was Texo kann

| | |
|---|---|
| 🔒 **Typsicher bis zum Ende** | Klassen, `data class`, `enum`, `interface`, Generics, Lambdas, `async`/`await`, `match`, Null-Sicherheit mit `T?`, `?.`, `??` und Smart Casts |
| 🎨 **Design als Code** | über 120 Modifier, Verläufe, Schatten, Animationen, Dunkelmodus, responsive Varianten (`sm`/`md`/`lg`), konstante Stile werden zur Compile-Zeit zu atomarem CSS |
| ⚡ **Reaktiv ohne virtuelles DOM** | `State`, `Computed`, reaktive Listen: Ändert sich ein Wert, wird genau ein Textknoten oder eine Klasse aktualisiert |
| 🏎️ **Schnell sichtbar** | Vorrendern beim Bauen plus Hydration, Laufzeit `core.js` ≈ 6 KB gzip, Lazy Loading, Tree-Shaking, Dateinamen mit Inhalts-Hash |
| 🖥️ **Backend nach Wahl** | eingebauter nativer Server **Texo** (in Rust, ohne Node.js) oder Node.js, Bun und Deno |
| 🗄️ **Texo Data** | Tabellen als `@Table data class`, typgeprüfte Abfragen für SQLite, PostgreSQL, MySQL/MariaDB und MongoDB, Migrationen, `texo db studio` |
| 🛡️ **Sicher von Haus aus** | `@Guard`, CSRF-Schutz, signierte Sessions, `@RateLimit`, Validierung aller Eingaben, CSP mit Hashes, HSTS, Login mit Passkeys und OAuth |
| 📦 **Bibliotheken und npm** | vorkompilierte `.texolib`-Pakete mit Signatur und Registry, jedes npm-Paket über `@npm("paket")` |
| 🕵️ **Code-Schutz** | der Browser-Code wird minifiziert und verschleiert, der Server-Code verlässt den Server nie |
| 🧰 **Ein Werkzeug für alles** | Compiler, Formatierer, Dev-Server, Tests, Sprachserver und Backend-Server stecken in **einer** Programmdatei |

## 🛠️ Editoren

| Editor | Installation |
|---|---|
| **VS Code** | `texo-vscode.vsix` aus dem [Release](https://github.com/LearNivram/Texo-Release/releases/latest) laden, dann `code --install-extension texo-vscode.vsix` |
| **IntelliJ IDEA, WebStorm, PhpStorm, PyCharm …** (ab 2025.2) | `texo-jetbrains.zip` laden, dann *Einstellungen › Plugins › ⚙ › Plugin von Datenträger installieren* (ZIP nicht entpacken) |

Beide nutzen den Sprachserver `texo lsp`: Fehler direkt beim Tippen, Autovervollständigung und Hover.

## 📥 Was im Release steckt

| Datei | Inhalt |
|---|---|
| `texo-linux-x64`, `texo-linux-arm64`, `texo-darwin-x64`, `texo-darwin-arm64`, `texo-windows-x64.exe` | das komplette Programm `texo` |
| `texo-server-<system>` | nur der native Server, für Server ohne `texo` |
| `texo-lang.tgz` | npm-Paket, lädt beim ersten Aufruf das passende Programm |
| `texo-vscode.vsix`, `texo-jetbrains.zip` | Editor-Erweiterungen |
| `install.sh`, `install.ps1`, `SHA256SUMS.txt` | Installer und Prüfsummen |

Ohne Installer: Datei für dein System und `SHA256SUMS.txt` laden, Summe prüfen
(`sha256sum --check --ignore-missing SHA256SUMS.txt`), ausführbar machen und als `texo` in den `PATH` legen.

---

<div align="center">

Dieses Repository enthält nur die fertigen Releases von Texo. Jedes Release wird automatisch gebaut und getestet.

</div>

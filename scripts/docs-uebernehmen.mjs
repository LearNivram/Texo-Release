#!/usr/bin/env node
// Übernimmt die Dokumentation aus dem Hauptrepo LearNivram/Texo in diese Seite.
//
//   node scripts/docs-uebernehmen.mjs ../Texo
//
// Quelle der Wahrheit bleibt das Hauptrepo: docs/*.md, CHANGELOG.md, examples/ und die Grammatik aus
// editors/vscode. Die übernommenen Seiten werden hier überschrieben, also bitte im Hauptrepo ändern und dann neu
// übernehmen. Von Hand gepflegt (und hier nicht angefasst) sind: index.md, kommandozeile.md, projekt-anlegen.md, kv.md,
// beispiele/index.md und alles unter .vitepress/.

import fs from 'node:fs'
import path from 'node:path'

const quelle = path.resolve(process.argv[2] ?? '../Texo')
const ziel = path.resolve(import.meta.dirname, '..', 'docs')

if (!fs.existsSync(path.join(quelle, 'docs', 'sprachreferenz.md'))) {
  console.error(`Kein Texo-Hauptrepo unter ${quelle} (docs/sprachreferenz.md fehlt).`)
  console.error('Aufruf: node scripts/docs-uebernehmen.mjs <pfad-zum-Texo-Repo>')
  process.exit(1)
}

// Interne Planungsdokumente gehören nicht in die Benutzerdoku.
const AUSGELASSEN = new Set(['rust-neubau.md'])

// Beispiele, die auf der Seite erscheinen (Ordner in examples/ → Titel und Beschreibung).
const BEISPIELE = {
  starter: ['Starter', 'Das leere Startprojekt: eine Seite, ein Zustand, eine eigene Komponente.'],
  todo: ['Aufgabenliste', 'Zustand, Listen, Filter und eigene Komponenten, ganz ohne Backend.'],
  dashboard: ['Dashboard', 'Mehrere Seiten mit Router, Seitenleiste, Diagramm-Kacheln und Design-Tokens.'],
  landing: ['Landingpage', 'Eine gestaltete Produktseite mit Verläufen, Animationen und Preistabelle.'],
  fullstack: ['Full-Stack', 'Anmeldung, Routen-Wächter und eine Notizen-API mit Node.js-Backend.'],
  'lager-go': ['Lager mit Go', 'Texo und ein Go-Dienst teilen sich über Valkey Bestand, Cache, Kanäle und Sitzungen.'],
  spec: ['MetricCard', 'Die Karte aus der Sprachbeschreibung: State, Methoden, Hover und Verläufe.'],
}

// Links, die im Hauptrepo aus docs/ hinausführen (das Hauptrepo ist privat).
const LINKS = [
  [/\]\(\.\.\/README\.md#installation\)/g, '](installation.md)'],
  [/\]\(\.\.\/CHANGELOG\.md\)/g, '](changelog.md)'],
  [/\]\(\.\.\/examples\/([\w-]+)(?:\/README\.md)?\/?\)/g, '](beispiele/$1.md)'],
  // Anker, die auch auf GitHub ins Leere zeigen (bis sie im Hauptrepo korrigiert sind)
  [/\(#nullsicherheit\)/g, '(#null-sicherheit)'],
  [/\(#stillambdas-und-icons\)/g, '(#stil-lambdas-und-icons)'],
  [/#bedingungen-if-match-ternary\)/g, '#bedingungen-if-match-ternär)'],
]

const HINWEIS = (datei) =>
  `<!-- Übernommen aus LearNivram/Texo (${datei}) mit scripts/docs-uebernehmen.mjs – bitte dort ändern. -->\n\n`

// VitePress liest Markdown als Vue-Vorlage: ein `<Artikel>` oder `<=` im Fließtext (außerhalb von Code) wäre ein
// offenes HTML-Element. GitHub verschluckt so etwas still; hier wird es zu `&lt;`. Echte HTML-Tags, Kommentare und
// Autolinks (`<https://…>`) bleiben.
const HTML_TAGS = /^<\/?(?:div|a|br|kbd|details|summary|sup|sub|img|span|p|b|em|strong|table|tr|td|th|code|pre)\b/i
function spitzeKlammern(text) {
  const zeilen = text.split('\n')
  const out = []
  let zaun = null
  let absatz = []
  const absatzSchreiben = () => {
    if (absatz.length) out.push(...ohneCode(absatz.join('\n')).split('\n'))
    absatz = []
  }
  for (const z of zeilen) {
    const m = z.match(/^\s*(`{3,}|~{3,})/)
    if (zaun) {
      out.push(z)
      if (m && m[1][0] === zaun[0] && m[1].length >= zaun.length && z.trim() === m[1]) zaun = null
      continue
    }
    if (m) {
      absatzSchreiben()
      zaun = m[1]
      out.push(z)
      continue
    }
    if (z.trim() === '') {
      absatzSchreiben()
      out.push(z)
    } else absatz.push(z)
  }
  absatzSchreiben()
  return out.join('\n')
}
function ohneCode(absatz) {
  // Code-Spannen (auch über Zeilen) unverändert lassen, nur den Rest anfassen
  let out = ''
  let i = 0
  while (i < absatz.length) {
    if (absatz[i] === '`') {
      const lauf = absatz.slice(i).match(/^`+/)[0]
      const ende = absatz.indexOf(lauf, i + lauf.length)
      if (ende > 0) {
        out += absatz.slice(i, ende + lauf.length)
        i = ende + lauf.length
        continue
      }
      out += lauf
      i += lauf.length
      continue
    }
    if (absatz[i] === '<') {
      const rest = absatz.slice(i)
      const erlaubt = rest.startsWith('<!--') || HTML_TAGS.test(rest) || /^<(?:https?:\/\/|mailto:)[^>\s]+>/.test(rest) ||
        /^<[\w.+-]+@[\w.-]+>/.test(rest)
      out += erlaubt ? '<' : '&lt;'
      i++
      continue
    }
    out += absatz[i++]
  }
  return out
}

// Linktexte wie „[backend.md](backend.md)“ lesen sich auf der Website besser als Seitentitel.
const TITEL = {
  'api-referenz.md': 'Standardbibliothek',
  'backend.md': 'Backend und Sicherheit',
  'bibliotheken.md': 'Bibliotheken',
  'compiler.md': 'Wie der Compiler arbeitet',
  'css-in-texo.md': 'CSS in Texo',
  'datenbank.md': 'Datenbanken',
  'docker.md': 'Docker',
  'erste-schritte.md': 'Erste Schritte',
  'fehlermeldungen.md': 'Fehlermeldungen',
  'installation.md': 'Installation',
  'js-frameworks.md': 'JS-Frameworks',
  'npm.md': 'npm-Pakete',
  'reaktivitaet.md': 'Reaktivität und Routing',
  'sprachreferenz.md': 'Sprachreferenz',
  'testen.md': 'Testen',
  'tutorial.md': 'Tutorial',
  'uebersetzungen.md': 'Übersetzungen',
  'ui-und-styling.md': 'UI und Styling',
}

// Hinweise auf eigene Seiten der Website, die es im Hauptrepo nicht gibt
const HINWEISE = [
  [
    /^(## Gemeinsamer Speicher mit anderen Programmen \(`Kv`\)\n)/m,
    '$1\n::: tip Eigene Seite\nAlles zu Kv mit Schnellstart, API, Go-Beispielen und Betrieb steht gesammelt auf\n[Kv: Valkey und Redis](kv.md).\n:::\n',
  ],
]

function umschreiben(text, datei) {
  for (const [muster, ersatz] of LINKS) text = text.replace(muster, ersatz)
  for (const [muster, ersatz] of HINWEISE) text = text.replace(muster, ersatz)
  text = text.replace(/\[(?:docs\/)?([a-z-]+\.md)\]\(/g, (ganz, name) => (TITEL[name] ? `[${TITEL[name]}](` : ganz))
  text = spitzeKlammern(text)
  const rest = text.match(/\]\(\.\.\/[^)]*\)/g)
  if (rest) console.warn(`  ${datei}: Links aus docs/ hinaus bleiben: ${rest.join(', ')}`)
  return HINWEIS(datei) + text
}

let anzahl = 0
for (const name of fs.readdirSync(path.join(quelle, 'docs')).sort()) {
  if (!name.endsWith('.md') || AUSGELASSEN.has(name)) continue
  const text = fs.readFileSync(path.join(quelle, 'docs', name), 'utf8')
  fs.writeFileSync(path.join(ziel, name), umschreiben(text, `docs/${name}`))
  anzahl++
}

// Changelog: Release-Links zeigen schon auf Texo-Release.
{
  const text = fs.readFileSync(path.join(quelle, 'CHANGELOG.md'), 'utf8')
  fs.writeFileSync(path.join(ziel, 'changelog.md'), umschreiben(text, 'CHANGELOG.md'))
  anzahl++
}

// Beispiele: README (falls vorhanden) und alle Quelldateien als Code-Gruppe.
const SPRACHE = { '.texo': 'texo', '.json': 'json', '.go': 'go', '.mod': 'text', '.md': 'md' }
function dateien(ordner, basis = ordner) {
  const out = []
  for (const e of fs.readdirSync(ordner, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    if (e.name.startsWith('.') || ['node_modules', 'dist', 'public'].includes(e.name)) continue
    const p = path.join(ordner, e.name)
    if (e.isDirectory()) out.push(...dateien(p, basis))
    else if (SPRACHE[path.extname(e.name)] && e.name !== 'README.md' && e.name !== 'go.sum') out.push(path.relative(basis, p))
  }
  return out
}

fs.mkdirSync(path.join(ziel, 'beispiele'), { recursive: true })
for (const [id, [titel, beschreibung]] of Object.entries(BEISPIELE)) {
  const ordner = path.join(quelle, 'examples', id)
  if (!fs.existsSync(ordner)) {
    console.warn(`  Beispiel ${id} fehlt im Hauptrepo, übersprungen`)
    continue
  }
  let md = `---\ntitle: "Beispiel: ${titel}"\n---\n\n` + HINWEIS(`examples/${id}`)
  const readme = path.join(ordner, 'README.md')
  if (fs.existsSync(readme)) {
    md += fs.readFileSync(readme, 'utf8').replace(/\]\(\.\.\/\.\.\/docs\/([\w-]+\.md)/g, '](../$1') + '\n\n'
  } else {
    md += `# ${titel}\n\n${beschreibung}\n\n`
  }
  md += `## Quelltext\n\n::: code-group\n\n`
  for (const datei of dateien(ordner)) {
    const inhalt = fs.readFileSync(path.join(ordner, datei), 'utf8').trimEnd()
    const zaun = inhalt.includes('```') ? '````' : '```'
    md += `${zaun}${SPRACHE[path.extname(datei)]} [${datei.split(path.sep).join('/')}]\n${inhalt}\n${zaun}\n\n`
  }
  md += `:::\n`
  fs.writeFileSync(path.join(ziel, 'beispiele', `${id}.md`), md)
  anzahl++
}
fs.writeFileSync(
  path.join(ziel, '.vitepress', 'beispiele.json'),
  JSON.stringify(Object.entries(BEISPIELE).map(([id, [titel, text]]) => ({ id, titel, text })), null, 2) + '\n',
)

// Grammatik für die Syntaxhervorhebung (dieselbe wie in VS Code).
fs.copyFileSync(
  path.join(quelle, 'editors', 'vscode', 'syntaxes', 'texo.tmLanguage.json'),
  path.join(ziel, '.vitepress', 'texo.tmLanguage.json'),
)

console.log(`${anzahl} Seiten aus ${quelle} übernommen.`)

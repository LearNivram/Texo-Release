import fs from 'node:fs'
import { defineConfig } from 'vitepress'
import { slug } from 'github-slugger'

// Dieselbe Grammatik wie die VS-Code-Erweiterung (von scripts/docs-uebernehmen.mjs übernommen).
const texo = JSON.parse(fs.readFileSync(new URL('./texo.tmLanguage.json', import.meta.url), 'utf8'))
const beispiele: { id: string; titel: string }[] = JSON.parse(
  fs.readFileSync(new URL('./beispiele.json', import.meta.url), 'utf8'),
)

const REPO = 'https://github.com/LearNivram/Texo-Release'

export default defineConfig({
  lang: 'de-DE',
  title: 'Texo',
  description: 'Eine Sprache für die ganze Web-App: Oberfläche, Design, Backend und Datenbank in einer statisch typisierten Sprache.',
  base: '/Texo-Release/',
  cleanUrls: true,
  // http://localhost:3000 in Anleitungen ist gewollt
  ignoreDeadLinks: 'localhostLinks',
  lastUpdated: true,
  head: [
    ['link', { rel: 'icon', href: '/Texo-Release/logo.svg', type: 'image/svg+xml' }],
    ['meta', { name: 'theme-color', content: '#6366f1' }],
  ],

  markdown: {
    languages: [{ ...texo, name: 'texo', aliases: ['tx'] }],
    // Anker wie auf GitHub (Umlaute bleiben), damit die Links aus dem Hauptrepo weiter passen.
    anchor: { slugify: (s: string) => slug(s) },
    theme: { light: 'github-light', dark: 'github-dark' },
    lineNumbers: false,
  },

  themeConfig: {
    logo: '/logo.svg',
    siteTitle: 'Texo',
    nav: [
      { text: 'Loslegen', link: '/erste-schritte', activeMatch: '^/(installation|erste-schritte|tutorial|projekt-anlegen)' },
      { text: 'Sprache', link: '/sprachreferenz', activeMatch: '^/(sprachreferenz|reaktivitaet|ui-und-styling|css-in-texo|uebersetzungen)' },
      { text: 'Backend', link: '/backend', activeMatch: '^/(backend|datenbank|docker)' },
      { text: 'Referenz', link: '/api-referenz', activeMatch: '^/(api-referenz|kommandozeile|fehlermeldungen|compiler)' },
      { text: 'Beispiele', link: '/beispiele/', activeMatch: '^/beispiele' },
      {
        text: 'v0.2.0',
        items: [
          { text: 'Änderungen', link: '/changelog' },
          { text: 'Downloads', link: `${REPO}/releases/latest` },
        ],
      },
    ],

    sidebar: [
      {
        text: 'Loslegen',
        items: [
          { text: 'Installation', link: '/installation' },
          { text: 'Erste Schritte', link: '/erste-schritte' },
          { text: 'Projekt anlegen (texo init)', link: '/projekt-anlegen' },
          { text: 'Tutorial: Notizbuch', link: '/tutorial' },
        ],
      },
      {
        text: 'Sprache und Oberfläche',
        items: [
          { text: 'Sprachreferenz', link: '/sprachreferenz' },
          { text: 'Reaktivität und Routing', link: '/reaktivitaet' },
          { text: 'UI und Styling', link: '/ui-und-styling' },
          { text: 'CSS in Texo', link: '/css-in-texo' },
          { text: 'Übersetzungen', link: '/uebersetzungen' },
        ],
      },
      {
        text: 'Backend und Daten',
        items: [
          { text: 'Backend und Sicherheit', link: '/backend' },
          { text: 'Datenbanken (Texo Data)', link: '/datenbank' },
          { text: 'Docker', link: '/docker' },
        ],
      },
      {
        text: 'Werkzeuge',
        items: [
          { text: 'Kommandozeile', link: '/kommandozeile' },
          { text: 'Testen', link: '/testen' },
          { text: 'Bibliotheken', link: '/bibliotheken' },
          { text: 'npm-Pakete', link: '/npm' },
          { text: 'JS-Frameworks', link: '/js-frameworks' },
        ],
      },
      {
        text: 'Referenz',
        items: [
          { text: 'Standardbibliothek (API)', link: '/api-referenz' },
          { text: 'Fehlermeldungen', link: '/fehlermeldungen' },
          { text: 'Wie der Compiler arbeitet', link: '/compiler' },
          { text: 'Änderungen', link: '/changelog' },
        ],
      },
      {
        text: 'Beispiele',
        collapsed: true,
        items: [
          { text: 'Übersicht', link: '/beispiele/' },
          ...beispiele.map((b) => ({ text: b.titel, link: `/beispiele/${b.id}` })),
        ],
      },
    ],

    outline: { level: [2, 3], label: 'Auf dieser Seite' },
    socialLinks: [{ icon: 'github', link: REPO }],
    search: {
      provider: 'local',
      options: {
        translations: {
          button: { buttonText: 'Suchen', buttonAriaLabel: 'Suchen' },
          modal: {
            displayDetails: 'Details anzeigen',
            resetButtonTitle: 'Suche zurücksetzen',
            backButtonTitle: 'Suche schließen',
            noResultsText: 'Keine Treffer für',
            footer: { selectText: 'auswählen', navigateText: 'wechseln', closeText: 'schließen' },
          },
        },
      },
    },
    footer: {
      message: 'Texo – eine Sprache für die ganze Web-App.',
      copyright: `<a href="${REPO}/releases/latest">Neuestes Release</a>`,
    },
    docFooter: { prev: 'Zurück', next: 'Weiter' },
    lastUpdated: { text: 'Zuletzt geändert' },
    darkModeSwitchLabel: 'Darstellung',
    lightModeSwitchTitle: 'Hell',
    darkModeSwitchTitle: 'Dunkel',
    sidebarMenuLabel: 'Menü',
    returnToTopLabel: 'Nach oben',
    langMenuLabel: 'Sprache',
    notFound: {
      title: 'Seite nicht gefunden',
      quote: 'Diese Adresse gibt es nicht (mehr). Vielleicht hilft die Suche oben rechts.',
      linkText: 'Zur Startseite',
    },
  },
})

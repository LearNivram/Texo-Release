# Beispiele

Zum Lesen und Abschauen: vollständige Texo-Projekte mit ihrem ganzen Quelltext. Jede Seite zeigt alle Dateien
nebeneinander in Reitern.

| Beispiel | Was du darin siehst | Backend |
|---|---|---|
| [Starter](./starter.md) | das leere Startprojekt: eine Seite, ein Zustand, eine eigene Komponente | keins |
| [Aufgabenliste](./todo.md) | State, Listen mit `ForEach`, Filter, eigene Komponenten | keins |
| [Dashboard](./dashboard.md) | mehrere Seiten mit Router, Seitenleiste, Kacheln, Design-Tokens | keins |
| [Landingpage](./landing.md) | Verläufe, Animationen, Raster, Preistabelle | keins |
| [MetricCard](./spec.md) | die Karte aus der Sprachbeschreibung: State, Methoden, Hover, Verläufe | keins |
| [Full-Stack](./fullstack.md) | Anmeldung, Routen-Wächter (`@Guard`), eine Notizen-API als `service` | Node.js |
| [Lager mit Go](./lager-go.md) | `Kv` mit Valkey: Bestand, `@Cache`, Kanäle und Sitzungen gemeinsam mit einem Go-Dienst | Texo |

## Beispiele aus `texo init`

Fertige Startpunkte bringt `texo init` selbst mit. Sie laufen sofort mit `texo dev`:

```sh
texo init meine-app --example aufgaben --backend texo --db sqlite
```

| `--example` | Inhalt | braucht |
|---|---|---|
| `start` | eine Seite und eine Komponente: hier fängst du an | – |
| `website` | mehrere Seiten mit Navigation, Layout und Kontaktseite | – |
| `api` | eine API ohne Webseite, für Apps, Skripte und andere Server | Backend |
| `aufgaben` | Registrieren, Anmelden, eigene Aufgaben in der Datenbank | Backend und Datenbank |
| `chat` | Beitreten mit Namen, Nachrichten in der Datenbank | Backend und Datenbank |

Was dabei entsteht, zeigt [Projekt anlegen](../projekt-anlegen.md).

## Größere Beispiele in der Doku

- Das [Tutorial](../tutorial.md) baut Schritt für Schritt ein Notizbuch mit Konto, Datenbank, Bild-Uploads und Tests.
- [Erste Schritte](../erste-schritte.md) führt durch Elemente, Modifier, Zustand, Listen, Router und Backend.

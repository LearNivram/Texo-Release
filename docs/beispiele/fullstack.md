---
title: "Beispiel: Full-Stack"
---

<!-- Übernommen aus LearNivram/Texo (examples/fullstack) mit scripts/docs-uebernehmen.mjs – bitte dort ändern. -->

# Full-Stack

Anmeldung, Routen-Wächter und eine Notizen-API mit Node.js-Backend.

## Quelltext

::: code-group

```texo [src/Api.texo]
package notes

import texo.server.*

/// Anmeldung. Passwörter werden nur als PBKDF2-Hash gespeichert.
@Api("/api/auth")
service AuthApi {
    private let users: Map<String, String> = [
        "ada": "pbkdf2$210000$x5dR_sa0TP2SmfKXNz1KsQ$y-1ddS1qrRRBHxGO3FZqheEOG6UgM1qT8IO551qaqlw",
        "admin": "pbkdf2$210000$cO7Euo5OE2SwEmSHqmDmxQ$lo_mTvYCPZva0tKxUy7OXed7Nbi7QcTqVoCcx6nKu5E",
    ]

    /// Höchstens 10 Versuche pro Minute und IP (Schutz gegen Passwort-Raten).
    @RateLimit(perMinute: 10)
    async fn login(name: String, password: String): Boolean {
        let hash = this.users.get(name.trim().lower())
        if (hash == null) return false
        if (!(await Password.verify(password, hash))) return false
        let login = name.trim().lower()
        this.request.signIn(Account(login, login == "admin" ? Role.Admin : Role.User))
        Log.info("Login: ${name} von ${this.request.ip}")
        return true
    }

    /// Passkeys: Kennung → Schlüssel und Kennung → Benutzer. In echten Anwendungen in der Datenbank.
    private let passkeys: Map<String, PasskeyKey> = Map()
    private let passkeyOwners: Map<String, String> = Map()

    /// Optionen, um für den angemeldeten Benutzer einen Passkey anzulegen.
    fn passkeyOptions(): String {
        let me = this.request.user
        if (me == null) throw HttpError(401, "Anmeldung erforderlich")
        let own = this.passkeyOwners.keys().filter(id => this.passkeyOwners.get(id) == me.name)
        return Passkeys.registration(this.request, me.name, me.name, own)
    }

    /// Speichert den neuen Passkey beim angemeldeten Benutzer.
    async fn addPasskey(response: String): Void {
        let me = this.request.user
        if (me == null) throw HttpError(401, "Anmeldung erforderlich")
        let key = await Passkeys.register(this.request, response)
        this.passkeys.set(key.id, key)
        this.passkeyOwners.set(key.id, me.name)
    }

    /// Optionen für die Anmeldung mit einem Passkey (ohne Namen: der Browser zeigt die Passkeys dieser Seite).
    fn passkeyLoginOptions(): String => Passkeys.authentication(this.request)

    @RateLimit(perMinute: 10)
    async fn loginWithPasskey(response: String): Boolean {
        let id = Passkeys.credentialId(response) ?? ""
        let key = this.passkeys.get(id)
        let owner = this.passkeyOwners.get(id)
        if (key == null || owner == null) return false
        let counter = await Passkeys.verify(this.request, response, key)
        if (counter == null) return false
        this.passkeys.set(id, PasskeyKey(key.id, key.publicKey, key.algorithm, counter))
        this.request.signIn(Account(owner, owner == "admin" ? Role.Admin : Role.User))
        Log.info("Login mit Passkey: ${owner}")
        return true
    }

    fn logout(): Void {
        this.request.signOut()
    }

    fn me(): Account? => this.request.user

    fn isAdmin(): Boolean => this.request.user?.role == Role.Admin

    /// Öffentlich: ohne CSRF-Prüfung aufrufbar, z. B. für Monitoring (Wächter würden trotzdem gelten).
    @Public
    fn health(): String => "ok"
}

/// Notizen – jede Methode nur für angemeldete Benutzer.
@Api("/api/notes")
@Guard(loggedIn)
service NotesApi {
    private var notes: List<Note> = [Note(1, "Willkommen bei Texo! 👋", "system", pinned: true)]
    private var nextId: Int = 2
    private let started: Int = DateTime.now().timestamp
    private let added: Channel<Note> = Channel()

    fn list(): List<Note> => this.notes.sortedBy(n => n.pinned ? 0 : 1)

    /// Neue Notizen aller Benutzer in Echtzeit: die Verbindung bleibt offen, jede Notiz kommt als Ereignis.
    fn live(): Stream<Note> => this.added.stream()

    @RateLimit(perMinute: 30)
    fn add(text: String): Note {
        let clean = text.trim()
        if (clean.isEmpty() || clean.length > 280) throw HttpError(400, "Eine Notiz braucht 1–280 Zeichen")
        let note = Note(this.nextId, clean, this.request.user?.name ?? "?")
        this.nextId += 1
        this.notes.add(note)
        this.added.send(note)
        return note
    }

    /// Ein Anhang (Bild oder Text bis 1 MB): Files speichert ihn, zurück kommt ein Link, der eine Stunde gilt.
    async fn attach(file: Upload): String {
        let key = await Files.save(file, "anhaenge", 1000000, ["image/*", ".txt"])
        return Files.url(key)
    }

    /// Löscht eine eigene Notiz. Die möglichen Fehler stehen in der Signatur und sind im Browser typisiert.
    fn remove(id: Int): Void throws NoteNotFound | NotYours {
        let note = this.notes.find(n => n.id == id)
        if (note == null) throw NoteNotFound(id)
        let user = this.request.user?.name ?? "?"
        if (note.author != user) throw NotYours(id, note.author)
        this.notes.remove(note)
    }

    /// Nur Admins dürfen alles löschen.
    @Guard(isAdmin)
    fn clear(): Int {
        let n = this.notes.size
        this.notes.clear()
        return n
    }

    @Guard(isAdmin)
    fn stats(): Stats => Stats(this.notes.size, 2, (DateTime.now().timestamp - this.started) / 1000)
}

/// Loader der Notizseite: läuft auf dem Server, bevor /notiz/:id ausgeliefert wird (null → 404).
@Server
async fn loadNote(req: Request, id: Int): Note? {
    return (await NotesApi.list()).find(n => n.id == id)
}
```

```texo [src/Guards.texo]
package notes

import texo.server.*

// ── Server-Wächter: laufen auf dem Server, VOR der Seite bzw. API-Methode ──

/// Nur angemeldete Benutzer.
@Server
fn loggedIn(req: Request): Access {
    return req.user != null ? Access.allow() : Access.redirect("/login")
}

/// Nur Administratoren.
@Server
fn isAdmin(req: Request): Access {
    if (req.user?.role != Role.Admin) return Access.deny(403, "Nur für Administratoren")
    return Access.allow()
}

// ── Browser-Wächter: Komfort im Browser (der Schutz passiert auf dem Server) ──

/// Bereits angemeldete Benutzer brauchen die Login-Seite nicht.
async fn notLoggedInYet(): Access {
    let me = await AuthApi.me()
    return me == null ? Access.allow() : Access.redirect("/")
}
```

```texo [src/Model.texo]
package notes

enum Role { User, Admin }

/// Der angemeldete Benutzer: steht signiert in der Session, auf dem Server als request.user.
@Auth
data class Account(name: String, role: Role)

/// Wird zwischen Browser und Server übertragen – auf beiden Seiten typgeprüft.
data class Note(id: Int, text: String, author: String, pinned: Boolean = false)

data class Stats(notes: Int, users: Int, uptimeSeconds: Int)

/// Fehler, die NotesApi.remove deklariert; sie kommen im Browser als genau diese Klassen an.
data class NoteNotFound(id: Int): Error("Die Notiz ${id} gibt es nicht")

data class NotYours(id: Int, author: String): Error("Die Notiz ${id} gehört ${author}")
```

```texo [src/Pages.texo]
package notes

import texo.ui.*
import texo.graphics.*

const Accent = Color.Indigo500

component Shell(title: String, body: View) {
    fn build(): View {
        return Column(spacing: 24.px, crossAlignment: CrossAlignment.center, [
            Card(Heading(this.title, level: 1).fontSize(26.px), this.body)
                .spacing(18.px)
                .width(Size.Full)
                .maxWidth(560.px)
                .padding(28.px)
                .shadow(Shadow.Xl)
        ])
            .minHeight(100.vh)
            .padding(40.px)
            .background(LinearGradient.diagonal(Color.Indigo50, Color.Sky50))
    }
}

@Page(title: "Anmelden", path: "login.html")
@Guard(notLoggedInYet)
component LoginPage {
    private State<String> name = State("")
    private State<String> password = State("")
    private State<String> error = State("")
    private State<Boolean> busy = State(false)

    async fn submit(): Void {
        this.busy.value = true
        this.error.value = ""
        try {
            let ok = await AuthApi.login(this.name.value, this.password.value)
            if (ok) Window.navigate("/")
            else this.error.value = "Name oder Passwort falsch"
        } catch (e) {
            this.error.value = e.message
        }
        this.busy.value = false
    }

    /// Anmeldung ohne Passwort: der Browser fragt nach dem Passkey (Fingerabdruck, Gesicht oder PIN).
    async fn passkey(): Void {
        this.error.value = ""
        try {
            let answer = await Passkey.get(await AuthApi.passkeyLoginOptions())
            if (await AuthApi.loginWithPasskey(answer)) Window.navigate("/")
            else this.error.value = "Dieser Passkey ist hier nicht bekannt"
        } catch (e) {
            this.error.value = "Passkey abgebrochen"
        }
    }

    fn build(): View {
        return Shell("Anmelden", Column(spacing: 12.px, [
            Text("Demo: ada / texo123 oder admin / admin123").fontSize(13.px).textColor(Color.Slate500),
            Input(bind: this.name, placeholder: "Name").testId("name"),
            Input(bind: this.password, placeholder: "Passwort", type: InputType.Password).testId("password").onSubmit(() => this.submit()),
            Button(this.busy.value ? "…" : "Anmelden", icon: "log-in").onClick(() => this.submit()).disabled(this.busy.value).testId("login"),
            Button.plain("Mit Passkey anmelden").textColor(Accent).onClick(() => this.passkey()).testId("passkey-login"),
            If(this.error.value.isNotEmpty(), Text(this.error.value).textColor(Color.Rose600).testId("error"))
        ]))
    }
}

@Page(title: "Notizen", path: "index.html")
@Guard(loggedIn)
component NotesPage {
    private State<List<Note>> notes = State([])
    private State<String> draft = State("")
    private State<String> user = State("")
    private State<Boolean> admin = State(false)
    private State<String> message = State("")
    private State<Upload?> file = State(null)
    private State<String> attachment = State("")

    async fn onMount(): Void {
        // Notizen anderer Browser erscheinen sofort; die Verbindung endet mit der Seite
        NotesApi.live().onEach(n => this.arrived(n))
        this.user.value = (await AuthApi.me())?.name ?? ""
        this.admin.value = await AuthApi.isAdmin()
        await this.reload()
    }

    async fn reload(): Void {
        this.notes.value = await NotesApi.list()
    }

    fn added(n: Note): Void {
        this.arrived(n)
        this.message.value = ""
    }

    fn arrived(n: Note): Void {
        if (this.notes.value.find(x => x.id == n.id) == null) this.notes.value.add(n)
    }

    async fn remove(n: Note): Void {
        try {
            await NotesApi.remove(n.id)
            this.notes.value.remove(n)
            this.message.value = ""
        } catch (e: NotYours) {
            this.message.value = "Nur ${e.author} darf diese Notiz löschen"
        } catch (e: NoteNotFound) {
            this.notes.value.remove(n)
        }
    }

    /// Legt einen Passkey an, mit dem sich der Benutzer künftig ohne Passwort anmeldet.
    async fn addPasskey(): Void {
        try {
            await AuthApi.addPasskey(await Passkey.create(await AuthApi.passkeyOptions()))
            this.message.value = "Passkey gespeichert"
        } catch (e) {
            this.message.value = "Kein Passkey angelegt"
        }
    }

    /// Lädt die gewählte Datei hoch; der Server antwortet mit einem Link, der eine Stunde gilt.
    async fn attach(): Void {
        let f = this.file.value
        if (f == null) return
        try {
            this.attachment.value = await NotesApi.attach(f)
            this.file.value = null
        } catch (e) {
            this.message.value = e.message
        }
    }

    async fn logout(): Void {
        await AuthApi.logout()
        Window.navigate("/login")
    }

    fn build(): View {
        return Shell("Notizen", Column(spacing: 14.px, [
            Row(spacing: 8.px, [
                Text("Angemeldet als ${this.user.value}").textColor(Color.Slate500).testId("user"),
                Spacer(),
                If(this.admin.value, Link("Admin", to: "/admin").testId("admin-link")),
                Button.plain("Passkey hinzufügen").textColor(Accent).onClick(() => this.addPasskey()).testId("passkey-add"),
                Button.plain("Abmelden").textColor(Accent).onClick(() => this.logout()).testId("logout")
            ]),
            // ein echtes <form>: funktioniert auch ohne JavaScript, mit JavaScript über den typisierten Aufruf
            Form(NotesApi.add, onDone: n => this.added(n), onError: m => this.message.value = m,
                Row(spacing: 8.px, [
                    Input(bind: this.draft, placeholder: "Neue Notiz …", name: "text").testId("draft"),
                    Button("Speichern", icon: "plus", submit: true).testId("save")
                ])
            ),
            Row(spacing: 8.px, [
                FilePicker(bind: this.file, accept: "image/*,.txt").testId("file"),
                Button("Anhängen").onClick(() => this.attach()).testId("attach"),
                If(this.attachment.value.isNotEmpty(), Text(this.attachment.value).fontSize(12.px).textColor(Color.Slate500).testId("attachment"))
            ]),
            If(this.message.value.isNotEmpty(), Text(this.message.value).textColor(Color.Rose600).testId("message")),
            Column(spacing: 8.px, [
                ForEach(this.notes.value, n => Row(spacing: 10.px, [
                    Icon(n.pinned ? "bookmark" : "file", size: 16.px).textColor(Accent),
                    Text(n.text).grow().testId("note"),
                    Link("Öffnen", to: "/notiz/${n.id}").testId("open"),
                    Text(n.author).fontSize(12.px).textColor(Color.Slate400),
                    Button.plain("Löschen").textColor(Color.Slate400).onClick(() => this.remove(n)).testId("remove")
                ]).padding(12.px).radius(10.px).background(Color.Slate50), key: n => n.id)
            ])
        ]))
    }
}

/// Eine Notiz: die Daten lädt der Server (@Load) und schickt sie mit der Seite – kein Nachladen im Browser.
@Page(title: "Notiz", path: "/notiz/:id")
@Guard(loggedIn)
@Load(loadNote)
component NotePage(note: Note) {
    fn build(): View {
        return Shell("Notiz ${this.note.id}", Column(spacing: 12.px, [
            Text(this.note.text).testId("note-text"),
            Text("von ${this.note.author}").fontSize(13.px).textColor(Color.Slate500),
            Link("← Zurück", to: "/index.html")
        ]))
    }
}

@Page(title: "Admin", path: "admin.html")
@Guard(loggedIn, isAdmin)
component AdminPage {
    private State<String> info = State("Lade …")

    async fn onMount(): Void {
        let s = await NotesApi.stats()
        this.info.value = "${s.notes} Notizen · Server läuft seit ${s.uptimeSeconds} s"
    }

    async fn clearAll(): Void {
        let n = await NotesApi.clear()
        this.info.value = "${n} Notizen gelöscht"
    }

    fn build(): View {
        return Shell("Administration", Column(spacing: 12.px, [
            Text(this.info.value).testId("info"),
            Button("Alle Notizen löschen", icon: "trash").background(Color.Rose600).onClick(() => this.clearAll()).testId("clear"),
            Link("← Zurück", to: "/index.html")
        ]))
    }
}
```

```json [texo.json]
{
  "src": "src",
  "out": "dist",
  "backend": "node",
  "server": { "port": 3000 }
}
```

:::

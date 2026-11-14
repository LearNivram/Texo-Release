---
title: "Beispiel: Aufgabenliste"
---

<!-- Übernommen aus LearNivram/Texo (examples/todo) mit scripts/docs-uebernehmen.mjs – bitte dort ändern. -->

# Aufgabenliste

Zustand, Listen, Filter und eigene Komponenten, ganz ohne Backend.

## Quelltext

::: code-group

```texo [src/App.texo]
package todo

import texo.ui.*
import texo.graphics.*

@Page(title: "Texo Todo", description: "Aufgabenliste in Texo")
public component App {
    private State<List<Task>> tasks = State([
        Task(1, "Texo-Spezifikation lesen", done: true),
        Task(2, "Compiler bauen", priority: Priority.High),
        Task(3, "Kaffee trinken", priority: Priority.Low),
    ])
    private State<String> draft = State("")
    private State<Filter> filter = State(Filter.All)
    private State<Boolean> urgent = State(false)
    private var nextId = 4

    fn add(): Void {
        let title = this.draft.value.trim()
        if (title.isEmpty()) return
        this.tasks.value.add(Task(this.nextId, title, priority: this.urgent.value ? Priority.High : Priority.Normal))
        this.nextId += 1
        Stats.created += 1
        this.draft.value = ""
    }

    fn remove(task: Task): Void {
        this.tasks.value.remove(task)
    }

    fn visible(): List<Task> {
        return match this.filter.value {
            Filter.All => this.tasks.value,
            Filter.Open => this.tasks.value.filter(t => !t.done),
            Filter.Done => this.tasks.value.filter(t => t.done),
        }
    }

    fn openCount(): Int => this.tasks.value.count(t => !t.done)

    fn filterButton(f: Filter, label: String): View {
        let active = this.filter.value == f
        return Button.plain(label)
            .padding(vertical: 6.px, horizontal: 12.px)
            .radius(8.px)
            .fontSize(13.px)
            .background(active ? Brand : Color.Transparent)
            .textColor(active ? Color.White : Color.Slate600)
            .onClick(() => this.filter.value = f)
    }

    fn build(): View {
        return Column(crossAlignment: CrossAlignment.center, [
            Card(
                Row([
                    Heading("Aufgaben", level: 1).fontSize(28.px),
                    Spacer(),
                    Badge("${this.openCount()} offen")
                ]),
                Row(spacing: 8.px, [
                    Input(bind: this.draft, placeholder: "Was ist zu tun?")
                        .onSubmit(() => this.add())
                        .testId("new-task"),
                    Button("Hinzufügen", icon: "plus")
                        .onClick(() => this.add())
                        .disabled(this.draft.value.trim().isEmpty())
                ]),
                Toggle(bind: this.urgent, label: "Dringend"),
                Row(spacing: 4.px, [
                    this.filterButton(Filter.All, "Alle"),
                    this.filterButton(Filter.Open, "Offen"),
                    this.filterButton(Filter.Done, "Erledigt")
                ]),
                Divider(),
                If(this.visible().isEmpty(),
                    Text("Nichts zu tun 🎉").textColor(Color.Slate400).padding(16.px).textAlign(TextAlign.Center),
                    otherwise: Column(spacing: 2.px, [
                        ForEach(this.visible(), (task, i) => TaskRow(task, onRemove: t => this.remove(t)), key: t => t.id)
                    ])
                ),
                Text("Insgesamt ${this.tasks.value.size} Aufgaben").fontSize(12.px).textColor(Color.Slate400)
            )
                .spacing(16.px)
                .width(Size.Full)
                .maxWidth(560.px)
                .padding(28.px)
                .shadow(Shadow.Xl)
                .fadeIn()
                .dark(c => c.background(Color.Slate900).textColor(Color.Slate100))
        ])
            .minHeight(100.vh)
            .padding(24.px)
            .md(s => s.padding(64.px))
            .background(LinearGradient.diagonal(Color.Indigo50, Color.Sky50))
            .dark(s => s.background(Color.Slate950))
    }
}
```

```texo [src/Components.texo]
package todo

import texo.ui.*
import texo.graphics.*

const Brand = Color.hex("#6366f1")

/// Kleines farbiges Etikett.
component Badge(label: String, tone: Color = Brand) {
    fn build(): View {
        return Text(this.label)
            .fontSize(11.px)
            .fontWeight(FontWeight.SemiBold)
            .padding(vertical: 2.px, horizontal: 8.px)
            .pill()
            .textColor(this.tone)
            .background(this.tone.opacity(0.12))
    }
}

/// Eine Zeile der Aufgabenliste.
component TaskRow(task: Task, onRemove: (Task) => Void) {
    fn toneFor(p: Priority): Color => match p {
        Priority.High => Color.Rose500,
        Priority.Normal => Brand,
        Priority.Low => Color.Slate400,
    }

    fn build(): View {
        let t = this.task
        return Row(spacing: 12.px, [
            Checkbox(bind: State(t.done))
                .onChange(v => t.done = v),
            Text(t.title)
                .grow()
                .strikethrough(t.done)
                .textColor(t.done ? Color.Slate400 : Color.Slate800)
                .testId("title"),
            Badge(priorityLabel(t.priority), tone: this.toneFor(t.priority)),
            Button.plain()
                .content(Icon("trash", size: 16.px))
                .textColor(Color.Slate400)
                .hover(b => b.textColor(Color.Rose500))
                .ariaLabel("Löschen")
                .onClick(() => this.onRemove(t))
        ])
            .padding(vertical: 10.px, horizontal: 14.px)
            .radius(12.px)
            .hover(r => r.background(Color.Slate50))
            .dark(r => r.hover(h => h.background(Color.Slate800)))
    }
}
```

```texo [src/Model.texo]
package todo

/// Ein Eintrag der Liste. `var` macht das Feld reaktiv.
data class Task(id: Int, title: String, var done: Boolean = false, priority: Priority = Priority.Normal)

enum Priority { Low, Normal, High }

enum Filter { All, Open, Done }

fn priorityLabel(p: Priority): String => match p {
    Priority.Low => "Niedrig",
    Priority.Normal => "Normal",
    Priority.High => "Hoch",
}

/// Globaler Zustand (Singleton)
object Stats {
    var created: Int = 0
}
```

```json [texo.json]
{ "src": "src", "out": "dist" }
```

:::

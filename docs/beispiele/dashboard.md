---
title: "Beispiel: Dashboard"
---

<!-- Übernommen aus LearNivram/Texo (examples/dashboard) mit scripts/docs-uebernehmen.mjs – bitte dort ändern. -->

# Dashboard

Mehrere Seiten mit Router, Seitenleiste, Diagramm-Kacheln und Design-Tokens.

## Quelltext

::: code-group

```texo [src/App.texo]
package dashboard

import texo.ui.*
import texo.graphics.*

@Page(title: "Texo Dashboard", lang: "de")
public component App {
    fn build(): View {
        return Row(crossAlignment: CrossAlignment.stretch, [
            Column(spacing: 6.px, [
                Row(spacing: 10.px, [
                    Shape.circle(size: 12.px).fill(LinearGradient.diagonal(Accent, Color.Pink500)).pulse(),
                    Text("texo/dash").fontWeight(FontWeight.Bold).letterSpacing(0.5.px)
                ]).padding(bottom: 20.px),
                NavItem("Übersicht", icon: "grid", to: "/"),
                NavItem("Einstellungen", icon: "settings", to: "/settings"),
            ])
                .width(240.px)
                .padding(20.px)
                .background(Surface)
                .textColor(Color.White)
                .hidden(true)
                .md(s => s.hidden(false)),
            ScrollView(
                Router(
                    Route("/", _ => Overview()),
                    Route("/settings", _ => Settings()),
                    fallback: NotFound()
                )
            )
                .grow()
                .padding(32.px)
        ])
            .minHeight(100.vh)
            .background(Color.hex("#0b1020"))
            .fontFamily(Font.named("Inter"))
    }
}
```

```texo [src/Pages.texo]
package dashboard

import texo.ui.*
import texo.graphics.*

component Overview {
    private State<List<Metric>> metrics = State([
        Metric("Umsatz", 48210.5, "€", 12.4, "dollar"),
        Metric("Nutzer", 1832.0, "", 4.1, "users"),
        Metric("Konversion", 3.2, "%", -0.8, "target"),
        Metric("Latenz", 182.0, "ms", -6.3, "activity"),
    ])
    private State<Int> seconds = State(0)
    private State<Boolean> loading = State(false)
    private State<String> status = State("Bereit")

    fn onMount(): Void {
        Timer.every(1.s, () => this.seconds.value += 1)
    }

    async fn reload(): Void {
        this.loading.value = true
        this.status.value = "Lade …"
        await Timer.delay(400.ms)
        this.metrics.update(ms => ms.map(m => m.copy(value: m.value * 1.05, trend: m.trend + 0.5)))
        this.loading.value = false
        this.status.value = "Aktualisiert"
    }

    fn build(): View {
        return Column(spacing: 24.px, [
            Row([
                Column(spacing: 4.px, [
                    Heading("Übersicht", level: 2).textColor(Color.White),
                    Text("Seit ${this.seconds.value} s online · ${this.status.value}").textColor(Muted).fontSize(13.px).testId("status")
                ]),
                Spacer(),
                Button(this.loading.value ? "Lädt …" : "Aktualisieren", icon: "refresh")
                    .disabled(this.loading.value)
                    .background(Accent)
                    .onClick(() => this.reload())
                    .testId("reload")
            ]),
            Grid(columns: 1, spacing: 16.px, [
                ForEach(this.metrics.value, (m, i) => StatTile(m).fadeIn(delay: (i * 80).ms))
            ])
                .md(g => g.columns(2))
                .xl(g => g.columns(4))
        ])
    }
}

component Settings {
    private State<String> name = State.persisted("name", "Ada")
    private State<Float> volume = State(40.0)
    private State<String> theme = State("Dunkel")
    private State<Boolean> notify = State(true)

    fn build(): View {
        return Card(
            Heading("Einstellungen", level: 2),
            Column(spacing: 6.px, [Text("Name").fontSize(13.px).textColor(Muted), Input(bind: this.name).testId("name")]),
            Text("Hallo, ${this.name.value}!").testId("greeting"),
            Column(spacing: 6.px, [
                Text("Lautstärke: ${this.volume.value.round()} %").fontSize(13.px).textColor(Muted).testId("volume"),
                Slider(bind: this.volume, min: 0.0, max: 100.0)
            ]),
            Select(["Hell", "Dunkel", "System"], bind: this.theme),
            Toggle(bind: this.notify, label: "Benachrichtigungen"),
            ProgressBar(this.volume.value / 100.0, color: Accent)
        )
            .spacing(16.px)
            .maxWidth(520.px)
            .background(SurfaceRaised)
            .textColor(Color.White)
            .radius(Radius)
    }
}

component NotFound {
    fn build(): View {
        return Text("404 – Seite nicht gefunden").textColor(Muted)
    }
}
```

```texo [src/Theme.texo]
package dashboard

import texo.graphics.*

/// Design-Tokens – zur Compile-Zeit ausgewertet und als statisches CSS ausgegeben.
const Accent = Color.hex("#4f46e5")
const Surface = Color.hex("#111827")
const SurfaceRaised = Color.hex("#1f2937")
const Muted = Color.Slate400
const Radius = 18.px
const Glow = Shadow.SoftGlow(Accent.opacity(0.35))
```

```texo [src/Widgets.texo]
package dashboard

import texo.ui.*
import texo.graphics.*

data class Metric(label: String, value: Float, unit: String, trend: Float, icon: String)

/// Kachel mit Kennzahl und Trend.
component StatTile(metric: Metric) {
    private State<Boolean> hovered = State(false)

    fn trendColor(): Color => this.metric.trend >= 0.0 ? Color.Emerald400 : Color.Rose400

    fn build(): View {
        let m = this.metric
        return Card(
            Row(spacing: 10.px, [
                Box(Icon(m.icon, size: 18.px).textColor(Accent))
                    .padding(8.px)
                    .radius(10.px)
                    .background(Accent.opacity(0.15)),
                Text(m.label).fontSize(13.px).textColor(Muted),
            ]),
            Text("${m.value.formatNumber(digits: 1)} ${m.unit}")
                .fontSize(30.px)
                .fontWeight(FontWeight.Bold),
            Row(spacing: 6.px, [
                Icon(m.trend >= 0.0 ? "trending-up" : "trending-down", size: 16.px),
                Text("${m.trend >= 0.0 ? "+" : ""}${m.trend.toFixed(1)} %")
            ]).textColor(this.trendColor()).fontSize(13.px)
        )
            .spacing(12.px)
            .background(SurfaceRaised)
            .textColor(Color.White)
            .radius(Radius)
            .border(color: Color.White.opacity(0.06))
            .onHover(h => this.hovered.value = h)
            .shadow(this.hovered.value ? Glow : Shadow.None)
            .transform(this.hovered.value ? Transform.translateY(-4.px) : Transform.identity())
            .animate(duration: 300.ms, easing: Easing.Spring)
    }
}

/// Navigationslink in der Seitenleiste.
component NavItem(label: String, icon: String, to: Url) {
    fn build(): View {
        let active = Navigator.path == this.to.toString()
        return Link(to: this.to)
            .content(Icon(this.icon, size: 18.px), Text(this.label))
            .padding(vertical: 10.px, horizontal: 14.px)
            .radius(12.px)
            .textColor(active ? Color.White : Muted)
            .background(active ? Accent.opacity(0.2) : Color.Transparent)
            .underline(false)
            .hover(l => l.background(Color.White.opacity(0.06)).textColor(Color.White))
    }
}
```

```json [texo.json]
{ "src": "src", "out": "dist" }
```

:::

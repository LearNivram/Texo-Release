---
title: "Beispiel: Landingpage"
---

<!-- Übernommen aus LearNivram/Texo (examples/landing) mit scripts/docs-uebernehmen.mjs – bitte dort ändern. -->

# Landingpage

Eine gestaltete Produktseite mit Verläufen, Animationen und Preistabelle.

## Quelltext

::: code-group

```texo [src/Landing.texo]
package landing

import texo.ui.*
import texo.graphics.*

const Ink = Color.hex("#0b1020")
const Violet = Color.Violet500
const Pink = Color.Pink500
const Brand = LinearGradient.horizontal(Violet, Pink)

data class Feature(icon: String, title: String, text: String)
data class Plan(name: String, price: Int, perks: List<String>, highlight: Boolean = false)

component FeatureCard(feature: Feature, index: Int = 0) {
    fn build(): View {
        return Card(
            Box(Icon(this.feature.icon, size: 22.px))
                .padding(10.px)
                .radius(12.px)
                .textColor(Color.White)
                .background(Brand)
                .shadow(Shadow.Glow(Violet.opacity(0.4), radius: 18.px))
                .alignSelf(CrossAlignment.start),
            Heading(this.feature.title, level: 3).fontSize(18.px),
            Paragraph(this.feature.text).textColor(Color.Slate400).fontSize(15.px)
        )
            .spacing(14.px)
            .padding(24.px)
            .glass(blur: 12.px, tint: Color.White.opacity(0.04), borderColor: Color.White.opacity(0.08))
            .textColor(Color.White)
            .radius(20.px)
            .shadow(Shadow.None)
            .slideIn(delay: (this.index * 90).ms)
            .hover(c => c.transform(Transform.translateY(-6.px)).shadow(Shadow.SoftGlow(Violet.opacity(0.3))))
            .animate(duration: 350.ms, easing: Easing.Spring)
    }
}

component PlanCard(plan: Plan, yearly: Boolean) {
    fn price(): Int => this.yearly ? (this.plan.price * 10) : this.plan.price

    fn build(): View {
        let p = this.plan
        return Card(
            Row([
                Text(p.name).fontWeight(FontWeight.SemiBold),
                Spacer(),
                p.highlight ? Text("Beliebt").fontSize(11.px).bold().padding(vertical: 3.px, horizontal: 10.px).pill().background(Brand).textColor(Color.White) : Empty()
            ]),
            Row(crossAlignment: CrossAlignment.baseline, spacing: 6.px, [
                Text("${this.price()} €").fontSize(40.px).fontWeight(FontWeight.Heavy).testId("price"),
                Text(this.yearly ? "/ Jahr" : "/ Monat").textColor(Color.Slate400)
            ]),
            Column(spacing: 10.px, p.perks.map(perk => Row(spacing: 8.px, [Icon("check", size: 16.px).textColor(Color.Emerald400), Text(perk)]))),
            Button("Jetzt starten")
                .fillWidth()
                .background(p.highlight ? Brand : Color.White.opacity(0.08))
                .hover(b => b.scale(1.02))
                .animate(duration: 200.ms)
        )
            .spacing(20.px)
            .padding(28.px)
            .radius(24.px)
            .textColor(Color.White)
            .background(p.highlight ? Color.hex("#1a1235") : Color.White.opacity(0.03))
            .border(color: p.highlight ? Violet.opacity(0.6) : Color.White.opacity(0.08))
            .shadow(p.highlight ? Shadow.SoftGlow(Violet.opacity(0.35)) : Shadow.None)
    }
}

@Page(title: "Texo – UI als typisierte Objekte", description: "Landingpage, vollständig in Texo geschrieben")
public component Landing {
    private State<Boolean> yearly = State(false)

    private let features: List<Feature> = [
        Feature("grid", "Typisierte Komponenten", "Jede Oberfläche ist ein Objektbaum – mit Autovervollständigung und Fehlern zur Compile-Zeit."),
        Feature("zap", "Kein Virtual DOM", "Der Compiler erzeugt direkte DOM-Bindungen. Nur was sich ändert, wird aktualisiert."),
        Feature("layers", "Design-Engine", "Verläufe, Glas, Schatten und Animationen werden zu atomarem, deduplizierten CSS."),
        Feature("globe", "Server-Rendering", "Jede Seite wird beim Build vorgerendert und im Browser hydriert."),
        Feature("moon", "Dark Mode & Responsive", "Varianten wie .dark { } und .md { } sind Teil der Sprache."),
        Feature("package", "Null Abhängigkeiten", "Eine Laufzeit von wenigen KB – kein Framework, kein Bundler nötig."),
    ]

    private let plans: List<Plan> = [
        Plan("Hobby", 0, ["1 Projekt", "Community-Support", "Alle Komponenten"]),
        Plan("Pro", 19, ["Unbegrenzte Projekte", "Prioritäts-Support", "Team-Funktionen", "Analytics"], highlight: true),
        Plan("Enterprise", 99, ["SLA 99,9 %", "SSO & Audit-Log", "Persönlicher Ansprechpartner"]),
    ]

    fn build(): View {
        return Column([
            // ── Navigation ──
            Row([
                Text("◆ texo").fontWeight(FontWeight.Heavy).fontSize(20.px).textColor(Brand),
                Spacer(),
                Row(spacing: 24.px, [
                    Link("Features", to: "#features").textColor(Color.Slate300).underline(false),
                    Link("Preise", to: "#preise").textColor(Color.Slate300).underline(false),
                    Link("GitHub", to: "https://github.com", external: true).textColor(Color.Slate300).underline(false)
                ]).hidden(true).md(n => n.hidden(false))
            ])
                .padding(vertical: 18.px, horizontal: 24.px)
                .sticky()
                .zIndex(10)
                .blur(14.px)
                .background(Ink.opacity(0.6))
                .border(color: Color.White.opacity(0.06), side: Edge.Bottom),

            // ── Hero ──
            Column(spacing: 24.px, crossAlignment: CrossAlignment.center, [
                Text("Neu: Texo 0.1 ist da ✨")
                    .fontSize(13.px)
                    .padding(vertical: 6.px, horizontal: 14.px)
                    .pill()
                    .textColor(Color.Violet300)
                    .background(Violet.opacity(0.12))
                    .border(color: Violet.opacity(0.3))
                    .fadeIn(),
                Heading("UIs als typisierte Objekte.", level: 1)
                    .fontSize(40.px)
                    .md(h => h.fontSize(64.px))
                    .fontWeight(FontWeight.Heavy)
                    .letterSpacing(-1.5.px)
                    .textAlign(TextAlign.Center)
                    .textColor(LinearGradient.angle(100.deg, Color.White, Color.Violet300, Pink))
                    .slideIn(distance: 24.px),
                Paragraph("Kein HTML. Kein CSS. Kein JavaScript. Du beschreibst Komponenten – der Compiler erzeugt optimiertes HTML5, atomares CSS3 und schlankes ES6.")
                    .maxWidth(640.px)
                    .fontSize(18.px)
                    .textAlign(TextAlign.Center)
                    .textColor(Color.Slate400)
                    .fadeIn(delay: 150.ms),
                Row(spacing: 12.px, [
                    Button("Loslegen", icon: "arrow-right")
                        .background(Brand)
                        .padding(vertical: 14.px, horizontal: 24.px)
                        .radius(14.px)
                        .shadow(Shadow.SoftGlow(Violet.opacity(0.5)))
                        .hover(b => b.transform(Transform.translateY(-2.px)))
                        .animate(duration: 200.ms, easing: Easing.Spring),
                    Button("Dokumentation")
                        .background(Color.White.opacity(0.06))
                        .border(color: Color.White.opacity(0.12))
                        .padding(vertical: 14.px, horizontal: 24.px)
                        .radius(14.px)
                        .hover(b => b.background(Color.White.opacity(0.12)))
                ]).flexWrap().alignment(Alignment.center)
            ])
                .padding(vertical: 80.px, horizontal: 24.px)
                .md(h => h.padding(vertical: 120.px)),

            // ── Features ──
            Column(spacing: 32.px, crossAlignment: CrossAlignment.center, [
                Heading("Alles, was moderne UIs brauchen", level: 2).textAlign(TextAlign.Center).textColor(Color.White),
                Grid(ForEach(this.features, (f, i) => FeatureCard(f, index: i)), spacing: 20.px)
                    .adaptive(minWidth: 280.px)
                    .width(Size.Full)
                    .maxWidth(1100.px)
            ])
                .id("features")
                .padding(vertical: 64.px, horizontal: 24.px),

            // ── Pricing ──
            Column(spacing: 28.px, crossAlignment: CrossAlignment.center, [
                Heading("Faire Preise", level: 2).textColor(Color.White),
                Row(spacing: 12.px, [
                    Text("Monatlich").textColor(this.yearly.value ? Color.Slate500 : Color.White),
                    Toggle(bind: this.yearly).testId("yearly"),
                    Text("Jährlich (2 Monate gratis)").textColor(this.yearly.value ? Color.White : Color.Slate500)
                ]),
                Grid(ForEach(this.plans, (p, i) => PlanCard(p, yearly: this.yearly.value)), spacing: 20.px)
                    .adaptive(minWidth: 260.px)
                    .width(Size.Full)
                    .maxWidth(1000.px)
            ])
                .id("preise")
                .padding(vertical: 64.px, horizontal: 24.px),

            // ── Footer ──
            Text("Gebaut mit Texo – 100 % typisierte Objekte.")
                .textColor(Color.Slate500)
                .fontSize(13.px)
                .textAlign(TextAlign.Center)
                .padding(40.px)
        ])
            .minHeight(100.vh)
            .background(RadialGradient.at(50.percent, 0.px, Color.hex("#2a1d5c"), Ink.at(60.percent)))
            .fontFamily(Font.named("Inter"))
    }
}
```

```json [texo.json]
{ "src": "src", "out": "dist" }
```

:::

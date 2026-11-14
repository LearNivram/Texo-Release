---
title: "Beispiel: MetricCard"
---

<!-- Übernommen aus LearNivram/Texo (examples/spec) mit scripts/docs-uebernehmen.mjs – bitte dort ändern. -->

# MetricCard

Die Karte aus der Sprachbeschreibung: State, Methoden, Hover und Verläufe.

## Quelltext

::: code-group

```texo [MetricCard.texo]
package app.dashboard

import texo.ui.*
import texo.graphics.*

public component MetricCard {
    // 1. Reaktiver Zustand (verändert sich der Wert, aktualisiert der Compiler das DOM)
    private State<Int> views = State(1420);
    private State<Boolean> isHovered = State(false);

    // 2. Öffentliche Methode mit Business-Logik
    public fn refreshViews(): Void {
        this.views.value += 100;
    }

    // 3. UI-Definition als reiner, typisierter Objekt-Baum
    public fn build(): View {
        return Card()
            .width(360.px)
            .padding(24.px)
            .radius(20.px)
            // Modernstes Design: Farbverlauf + Blur-Effekt (Glassmorphism)
            .background(LinearGradient.diagonal(Color.hex("#1e1e2f").opacity(0.8), Color.hex("#121217").opacity(0.9)))
            .blur(16.px)
            .border(width: 1.px, color: Color.White.opacity(0.12))
            .shadow(preset: Shadow.SoftGlow(Color.hex("#6366f1").opacity(0.35)))
            
            // Hover-Transformationen direkt in der Sprache
            .onHover(entering => this.isHovered.value = entering)
            .transform(this.isHovered.value ? Transform.scale(1.03) : Transform.identity())
            .animate(duration: 250.ms, easing: Easing.Spring)
            
            // Inhalt
            .content(
                Stack.vertical(spacing: 16.px, [
                    // Obere Zeile: Badge & Icon
                    Stack.horizontal(alignment: Alignment.spaceBetween, [
                        Text("LIVE ANALYTICS")
                            .fontSize(11.px)
                            .fontWeight(FontWeight.Bold)
                            .letterSpacing(1.2.px)
                            .textColor(Color.hex("#818cf8")),
                        
                        Shape.circle(size: 8.px)
                            .fill(Color.hex("#22c55e"))
                            .pulse(repeat: true)
                    ]),

                    // Mittlere Zeile: Zähler mit Daten-Bindung
                    Stack.vertical(spacing: 4.px, [
                        Text(this.views.value.formatNumber())
                            .fontSize(36.px)
                            .fontWeight(FontWeight.Heavy)
                            .textColor(Color.White),

                        Text("Aufrufe in den letzten 24 Stunden")
                            .fontSize(13.px)
                            .textColor(Color.hex("#94a3b8"))
                    ]),

                    // Untere Zeile: Interaktiver Button
                    Button("Daten aktualisieren")
                        .width(Size.Full)
                        .padding(vertical: 12.px)
                        .radius(12.px)
                        .background(Color.hex("#4f46e5"))
                        .textColor(Color.White)
                        .fontWeight(FontWeight.Medium)
                        .onClick(() => this.refreshViews())
                        .hover(b => b.background(Color.hex("#4338ca")).elevation(4.px))
                ])
            );
    }
}
```

:::

<!-- Übernommen aus LearNivram/Texo (docs/css-in-texo.md) mit scripts/docs-uebernehmen.mjs – bitte dort ändern. -->

# CSS in Texo – vollständige Übersicht

Diese Seite ordnet jeder CSS-Möglichkeit ihre Texo-Schreibweise zu. Alle Modifier sind typisiert: Der Compiler prüft
Einheiten, Farben und Werte und schreibt konstante Stile beim Kompilieren als atomare Klassen in `app.css`.
Signaturen und Parameter stehen in der [API-Referenz](api-referenz.md), Hintergründe in [UI und Styling](ui-und-styling.md).

Für CSS, das (noch) keinen eigenen Modifier hat, gibt es drei Notausgänge:

| Notausgang | Beispiel |
|---|---|
| beliebige Eigenschaft an einem Element | `.css("mix-blend-mode", "luminosity")`, auch in Varianten: `.hover(s => s.css("filter", "url(#rauschen)"))` |
| CSS-Variable setzen / lesen | `.cssVariable("akzent", "#e11d48")` · `Color.variable("akzent")` · `Length.variable("abstand", 16.px)` |
| beliebige Regel für einen Selektor (global) | `GlobalStyle().rule("article :is(h2, h3)", "scroll-margin-top", "80px")` |
| beliebiger Wert eines Typs | `Length.css("calc(100% - 2rem)")` · `Color.css("light-dark(#fff, #111)")` · `ClipPath.css("path('M0 0 …')")` |

**Inhalt**

1. [Werte und Einheiten](#werte-und-einheiten)
2. [Box-Modell und Größe](#box-modell-und-größe)
3. [Layout: Flexbox, Grid, Positionierung](#layout-flexbox-grid-positionierung)
4. [Farben, Hintergründe, Rahmen, Schatten](#farben-hintergründe-rahmen-schatten)
5. [Typografie](#typografie)
6. [Effekte: Filter, Mischmodi, Clip, Maske](#effekte-filter-mischmodi-clip-maske)
7. [Transformationen und 3D](#transformationen-und-3d)
8. [Übergänge und Animationen](#übergänge-und-animationen)
9. [Scrollen und Interaktion](#scrollen-und-interaktion)
10. [Selektoren: Pseudo-Klassen und Pseudo-Elemente](#selektoren-pseudo-klassen-und-pseudo-elemente)
11. [At-Regeln: @media, @supports, @container, @keyframes, @font-face, @import](#at-regeln)
12. [Globale Stile (html, body, :root)](#globale-stile)
13. [Beispiel](#beispiel)
14. [Was bewusst fehlt](#was-bewusst-fehlt)

---

## Werte und Einheiten

| CSS | Texo |
|---|---|
| `px`, `rem`, `em`, `%`, `vw`, `vh`, `fr` | `16.px`, `1.5.rem`, `2.em`, `50.percent`, `100.vw`, `100.vh`, `1.fr` |
| `ch`, `ex`, `lh`, `pt` | `65.ch`, `1.ex`, `2.lh`, `12.pt` |
| `vmin`, `vmax`, `dvh`, `svh`, `lvh`, `dvw` | `50.vmin`, `100.vmax`, `100.dvh`, `100.svh`, `100.lvh`, `100.dvw` |
| `cqw`, `cqh` (Container-Einheiten) | `50.cqw`, `20.cqh` |
| `auto`, `fit-content`, `min-content`, `max-content`, `stretch` | `Size.Auto`, `Size.FitContent`, `Size.MinContent`, `Size.MaxContent`, `Size.Stretch` |
| `calc(a + b)`, `calc(a * 2)` | `a.plus(b)`, `a.minus(b)`, `a.times(2)`, `a.div(3)`, `-a` |
| `min()`, `max()`, `clamp()` | `Length.min(600.px, 90.vw)`, `Length.max(…)`, `Length.clamp(1.rem, 4.vw, 3.rem)` |
| `minmax()`, `repeat()`, `repeat(auto-fill/auto-fit, …)`, `fit-content()` | `Length.minmax(…)`, `Length.repeat(3, 1.fr)`, `Length.autoFill(…)`, `Length.autoFit(…)`, `Length.fitContent(…)` |
| `var(--x)` | `Length.variable("x")`, `Color.variable("x")` |
| `ms`, `s` | `200.ms`, `1.5.s` |
| `deg`, `turn`, `rad` | `45.deg`, `0.25.turn`, `3.14.rad` |
| Farben: Hex, `rgb()`, `hsl()`, `oklch()` | `Color.hex("#4f46e5")`, `Color.rgb(79, 70, 229)`, `Color.hsl(240, 0.6, 0.5)`, `Color.oklch(0.6, 0.2, 270)` |
| `currentColor`, `transparent`, Palette | `Color.Current`, `Color.Transparent`, `Color.Indigo500` (22 Farben × 11 Stufen) |
| `color-mix()` | `farbe.mix(andere, 0.3)`, `.lighten(0.1)`, `.darken(0.1)`, `.opacity(0.5)` |

## Box-Modell und Größe

| CSS | Texo |
|---|---|
| `width`, `height`, `min-*`, `max-*` | `.width(…)`, `.height(…)`, `.minWidth(…)`, `.maxWidth(…)`, `.minHeight(…)`, `.maxHeight(…)`, `.size(…)`, `.fillWidth()`, `.fillHeight()` |
| `padding`, `margin` (je Seite) | `.padding(16.px)`, `.padding(vertical: 8.px, horizontal: 16.px)`, `.margin(top: 4.px)`, `.center()` |
| `aspect-ratio` | `.aspectRatio(16.0 / 9.0)` |
| `display` | `.display(Display.InlineBlock)`, `.hidden()`, `.hidden(false)` |
| `visibility` | `.visible(false)` |
| `overflow`, `overflow-x/-y` | `.overflow(Overflow.Auto)`, `.overflowX(…)`, `.overflowY(…)`, `.clip()` |
| `box-sizing` | immer `border-box` (Reset); sonst `.css("box-sizing", "content-box")` |
| `content-visibility` | `.lazyRender(estimatedHeight: 400.px)` |

## Layout: Flexbox, Grid, Positionierung

| CSS | Texo |
|---|---|
| `display: flex`, Richtung | `Row([...])`, `Column([...])`, `Stack.layered(...)`, `.flexDirection(FlexDirection.RowReverse)` |
| `gap`, `row-gap`, `column-gap` | `spacing:` bzw. `.spacing(…)`, `.rowGap(…)`, `.columnGap(…)` |
| `justify-content`, `align-items`, `align-content` | `alignment:` / `.alignment(…)`, `crossAlignment:` / `.crossAlignment(…)`, `.alignContent(…)` |
| `align-self`, `justify-self`, `justify-items` | `.alignSelf(…)`, `.justifySelf(…)`, `.justifyItems(…)` |
| `flex-grow/-shrink/-basis`, `flex-wrap`, `order` | `.grow()`, `.shrink(0)`, `.basis(…)`, `.flexWrap()`, `.order(-1)` |
| `display: grid`, Spalten | `Grid(..., columns: 3, minColumnWidth: 200.px)`, `.columns(…)`, `.adaptive(…)` |
| `grid-template-columns/-rows` | `.templateColumns([240.px, 1.fr])`, `.templateRows([…])` |
| `grid-template-areas`, `grid-area` | `.templateAreas(["kopf kopf", "menue inhalt"])`, `.gridArea("kopf")` |
| `grid-column`, `grid-row` (span, Start) | `.gridSpan(columns: 2)`, `.gridCell(column: 2, row: 1, columnSpan: 2)` |
| `grid-auto-rows/-columns/-flow` | `.autoRows(…)`, `.autoColumns(…)`, `.autoFlow(GridFlow.RowDense)` |
| `position` + `top/right/bottom/left/inset` | `.absolute(top: 0.px, right: 0.px)`, `.fixed(…)`, `.relative(top: 4.px)`, `.sticky(top: 64.px)` |
| `z-index`, `isolation` | `.zIndex(10)`, `.isolate()` |
| `float`, `clear` | `.floatTo(FloatSide.Left)`, `.clearFloat()` |
| `columns` (Mehrspaltentext) | `.textColumns(count: 2, gap: 32.px)` |
| `container-type` | `.queryContainer()`, `.queryContainer("karte")` |

## Farben, Hintergründe, Rahmen, Schatten

| CSS | Texo |
|---|---|
| `color`, `background` | `.textColor(…)`, `.background(…)` (Farbe oder Verlauf); Verlauf als Textfarbe = Verlaufstext |
| `linear-/radial-/conic-gradient`, `repeating-*` | `LinearGradient.angle(45.deg, …)`, `.horizontal/.vertical/.diagonal`, `RadialGradient.circle/.ellipse/.at`, `ConicGradient.of/.from/.at`, `….repeating(…)`; Farbstopps: `Color.Red.at(30.percent)` |
| `background-image`, `-size`, `-position`, `-repeat`, `-attachment` | `.backgroundImage("held.jpg", size: BackgroundSize.Cover, position: Position.Top, repeat: false, fixed: true, overlay: Color.Black.opacity(0.4))` |
| `background-blend-mode` | `.backgroundBlend(BlendMode.Multiply)` |
| `opacity` | `.opacity(0.8)` |
| `border` (je Seite, Stil) | `.border(width: 2.px, color: …, style: BorderStyle.Dashed, side: Edge.Bottom)` |
| `border-radius` (je Ecke) | `.radius(12.px)`, `.radius(topLeft: …)`, `.pill()`, `.circle()` |
| `outline`, `outline-offset` | `.outline(width: 2.px, color: …, offset: 2.px, style: BorderStyle.Dotted)` |
| `box-shadow` (mehrere, inset) | `.shadow(Shadow.Lg)`, `Shadow(x: 0.px, y: 8.px, blur: 24.px, color: …, inset: true)`, `Shadow.Layered(…)`, `.elevation(4.px)` |
| `accent-color`, `caret-color` | `.accentColor(…)`, `.caretColor(…)` |
| `color-scheme` | `GlobalStyle().colorScheme("light dark")` |

## Typografie

| CSS | Texo |
|---|---|
| `font-family`, `font-size`, `font-weight`, `font-style` | `.fontFamily(Font.named("Inter"))`, `.fontSize(…)`, `.fontWeight(FontWeight.SemiBold)`, `.bold()`, `.italic()` |
| `@font-face` | `GlobalStyle().fontFace("Inter", "fonts/Inter.woff2", weight: "100 900")` |
| `line-height`, `letter-spacing`, `word-spacing` | `.lineHeight(1.6)`, `.letterSpacing(0.5.px)`, `.wordSpacing(2.px)` |
| `text-align`, `text-indent`, `vertical-align` | `.textAlign(TextAlign.Center)`, `.textIndent(2.em)`, `.verticalAlign(VerticalAlign.Middle)` |
| `text-transform` | `.uppercase()`, `.lowercase()`, `.capitalize()`, `.normalCase()` |
| `text-decoration` (Farbe, Stil, Dicke, Abstand) | `.underline(color: …, style: DecorationStyle.Wavy, thickness: 2.px, offset: 3.px)`, `.strikethrough(…)`, `.overline(…)` |
| `white-space`, `word-break`, `overflow-wrap`, `hyphens` | `.whiteSpace(WhiteSpace.PreWrap)`, `.noWrap()`, `.wordBreak(WordBreak.Anywhere)`, `.hyphenate()` |
| `text-overflow: ellipsis`, `line-clamp` | `.truncate()`, `.lineClamp(3)` |
| `text-wrap: balance/pretty` | `.textWrap(TextWrap.Balance)` |
| `writing-mode`, `direction` | `.writingMode(WritingMode.VerticalRl)`, `.textDirection(TextDirection.Rtl)` |
| `font-variant-numeric`, `font-variant-caps`, `font-feature-settings` | `.tabularNumbers()`, `.smallCaps()`, `.fontFeatures("\"ss01\", \"liga\" off")` |
| `text-shadow`, `-webkit-text-stroke` | `.textShadow(Shadow.Sm)`, `.textStroke(1.px, Color.Black)` |
| `font-family: monospace` | `.monospace()` |

## Effekte: Filter, Mischmodi, Clip, Maske

| CSS | Texo |
|---|---|
| `filter` (kombinierbar) | `.filterBlur(4.px)`, `.brightness(1.1)`, `.contrast(1.2)`, `.grayscale()`, `.saturate(1.5)`, `.sepia()`, `.invert()`, `.hueRotate(90.deg)`, `.dropShadow(Shadow.Md)` – mehrere Filter wirken zusammen, auch in `.hover(…)` |
| `backdrop-filter` | `.backdrop(blur: 12.px, saturate: 1.5)`, `.blur(…)`, `.glass()` |
| `mix-blend-mode` | `.blendMode(BlendMode.Difference)` |
| `clip-path` | `.clipShape(ClipPath.circle())`, `ClipPath.ellipse(…)`, `ClipPath.inset(10.px, radius: 16.px)`, `ClipPath.polygon([…])` |
| `mask-image` | `.mask(LinearGradient.vertical(Color.Black, Color.Transparent))`, `.maskImage("icon.svg")` |
| `object-fit`, `object-position` | `Image(…).fit(ImageFit.Cover)`, `.objectPosition(Position.Top)` |
| `image-rendering` | `.pixelated()` |

## Transformationen und 3D

| CSS | Texo |
|---|---|
| `scale`, `rotate`, `translate` | `.scale(1.05)`, `.rotate(45.deg)`, `.offset(x: 4.px, y: -2.px)` |
| `transform` (beliebig kombiniert) | `.transform(Transform.rotate(10.deg).then(Transform.skewX(5.deg)))` – auch `scaleX/Y`, `translateX/Y/Z`, `translate3d`, `rotateX/Y/Z`, `skew`, `perspective`, `matrix` |
| `transform-origin` | `.transformOrigin(Position.TopLeft)` |
| `perspective`, `transform-style`, `backface-visibility` | `.perspective(800.px)`, `.preserve3d()`, `.backfaceHidden()` |

## Übergänge und Animationen

| CSS | Texo |
|---|---|
| `transition` | `.animate(duration: 300.ms, easing: Easing.Spring, delay: 50.ms, properties: ["opacity", "transform"])`; Varianten wie `.hover(…)` bekommen automatisch einen kurzen Übergang |
| `transition-timing-function` | `Easing.EaseOut`, `Easing.Spring`, `Easing.cubic(…)`, `Easing.steps(4)` |
| `@keyframes` + `animation` | `.keyframes(Keyframe(0.0, s => s.opacity(0)), Keyframe(1.0, s => s.opacity(1)), duration: 1.s, iterations: 3, infinite: false, direction: AnimationDirection.Alternate, fill: FillMode.Both)` |
| fertige Animationen | `.fadeIn()`, `.scaleIn()`, `.slideIn(from: Edge.Left)`, `.pulse()`, `.spin()`, `.ping()`, `.bounce()`, `.shake()`, `.float()` |
| `animation-play-state` | `.pauseAnimation()`, z. B. `.hover(s => s.pauseAnimation())` |
| `prefers-reduced-motion` | `.reducedMotion(s => s.animate(duration: 0.ms))`, `.motionSafe(s => s.bounce())` |

## Scrollen und Interaktion

| CSS | Texo |
|---|---|
| `scroll-snap-type`, `-align`, `-stop` | `.scrollSnap(Axis.Horizontal)`, `.snapAlign(SnapAlign.Center)`, `.snapStop()` |
| `scroll-margin`, `scroll-padding` | `.scrollMargin(top: 80.px)`, `.scrollPadding(…)` |
| `scroll-behavior` | `.smoothScroll()`, global `GlobalStyle().smoothScroll()` |
| `overscroll-behavior` | `.overscroll(Overscroll.Contain)` |
| `scrollbar-color`, `scrollbar-width` | `.scrollbarColor(…)`, `.thinScrollbar()`, `.hideScrollbar()` |
| `cursor` (auch Bilder) | `.cursor(Cursor.Pointer)`, `.cursor(Cursor.image("hand.png", x: 8, y: 0))` |
| `pointer-events`, `user-select`, `touch-action`, `resize` | `.pointerEvents(false)`, `.selectable(false)`, `.touchAction(TouchAction.Manipulation)`, `.resizable(Axis.Vertical)` |

## Selektoren: Pseudo-Klassen und Pseudo-Elemente

Varianten nehmen eine Stil-Funktion und lassen sich verschachteln: `.dark(s => s.hover(h => h.textColor(Color.White)))`.

| CSS | Texo |
|---|---|
| `:hover`, `:focus-visible`, `:focus`, `:focus-within`, `:active`, `:disabled` | `.hover(…)`, `.focus(…)`, `.focusAny(…)`, `.focusWithin(…)`, `.pressed(…)`, `.whenDisabled(…)` |
| `:checked`, `:user-invalid`, `:user-valid`, `:visited`, `:target`, `:empty` | `.whenChecked(…)`, `.whenInvalid(…)`, `.whenValid(…)`, `.visited(…)`, `.whenTarget(…)`, `.whenEmpty(…)` |
| `:first-child`, `:last-child`, `:only-child`, `:nth-child(odd/even/An+B)` | `.first(…)`, `.last(…)`, `.onlyChild(…)`, `.odd(…)`, `.even(…)`, `.nthChild("3n+1", …)` |
| `.gruppe:hover .kind` | `.group()` am Vorfahren, `.groupHover(…)` / `.groupFocus(…)` am Kind |
| `::before`, `::after` | `.before(s => s.contentText("★ "))`, `.after(…)` – `content` ist automatisch gesetzt |
| `::placeholder`, `::selection`, `::first-letter`, `::first-line` | `.placeholderStyle(…)`, `.selectionStyle(…)`, `.firstLetter(…)`, `.firstLine(…)` |
| beliebige Selektoren (`:has()`, `:is()`, Attribute …) | `GlobalStyle().rule("…", "…", "…")` |

## At-Regeln

| CSS | Texo |
|---|---|
| `@media (min-width: …)` | `.sm(…)` 640 px, `.md(…)` 768 px, `.lg(…)` 1024 px, `.xl(…)` 1280 px, `.xxl(…)` 1536 px, `.responsive(Breakpoint.md, …)` |
| `@media (max-width: …)` | `.below(Breakpoint.md, s => …)` |
| `@media (prefers-color-scheme)` | `.dark(…)`, `.light(…)` |
| `@media` (Bewegung, Kontrast, Ausrichtung, Zeigegerät, Druck) | `.reducedMotion(…)`, `.motionSafe(…)`, `.highContrast(…)`, `.landscape(…)`, `.portrait(…)`, `.touch(…)`, `.mouse(…)`, `.printStyle(…)` |
| beliebige Media-Abfrage | `.media("(min-height: 800px)", s => …)` |
| `@supports` | `.supports("(backdrop-filter: blur(1px))", s => …)` |
| `@container` | `.queryContainer()` am Container, `.whenContainer(minWidth: 480.px, s => …)` am Kind |
| `@keyframes` | `.keyframes(Keyframe(…), …)` |
| `@font-face`, `@import` | `GlobalStyle().fontFace(…)`, `GlobalStyle().importCss("https://fonts.googleapis.com/…")` (mit Backend automatisch in der CSP erlaubt) |
| `@layer` | Texo ordnet selbst: Reset → Element-Grundstile → globale Stile → Modifier ([Details](compiler.md#css-schichten)) |

## Globale Stile

`@Global val Design = GlobalStyle()…` setzt Werte für `html`, `body` und `:root`: Mauszeiger, Hauptfarbe aller
Elemente (`primaryColor`), Schrift, Hintergrund, Markierungsfarbe, Scrollbalken, Farbschema, CSS-Variablen,
`@font-face`, `@import`, freie Regeln und Dunkelmodus – siehe [UI und Styling → Globale Stile](ui-und-styling.md#globale-stile-global).

## Beispiel

```texo
package app

import texo.ui.*
import texo.graphics.*

@Global
val Design = GlobalStyle()
    .importCss("https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap")
    .fontFamily(Font.named("Inter"))
    .colorScheme("light dark")
    .variable("akzent", "#e11d48")

component Kachel(titel: String) {
    fn build(): View {
        return Card(
            Text(this.titel)
                .fontSize(Length.clamp(1.rem, 2.5.vw, 1.5.rem))
                .textWrap(TextWrap.Balance)
                .groupHover(s => s.textColor(Color.variable("akzent"))),
            Text("Mehr →")
                .after(s => s.absolute(bottom: -2.px, left: 0.px).height(2.px).width(0.px).background(Color.variable("akzent")).animate())
                .relative()
                .groupHover(s => s.after(a => a.width(Size.Full)))
        )
            .group()
            .backgroundImage("kachel.jpg", overlay: LinearGradient.vertical(Color.Transparent, Color.Black.opacity(0.6)))
            .textColor(Color.White)
            .clipShape(ClipPath.inset(0.px, radius: 20.px))
            .hover(s => s.brightness(1.08).scale(1.02))
            .reducedMotion(s => s.animate(duration: 0.ms))
    }
}

@Page(title: "Galerie")
component Galerie {
    fn build(): View {
        return Grid(
            Kachel("Berge"), Kachel("Meer"), Kachel("Stadt"),
            columns: 3
        )
            .templateColumns([Length.autoFill(Length.minmax(240.px, 1.fr))])
            .autoRows(200.px)
            .spacing(16.px)
            .padding(24.px)
            .keyframes(Keyframe(0.0, s => s.opacity(0).offset(y: 12.px)), Keyframe(1.0, s => s.opacity(1)), duration: 500.ms)
    }
}
```

## Was bewusst fehlt

- **Vererbte Spezialfälle und Altlasten** wie `zoom`, `-webkit-box-reflect` oder `border-image` – über `.css(…)` weiter möglich.
- **Selektoren über mehrere Komponenten hinweg** (`.a > .b`, `:has()`): Stile gehören an das Element selbst; für Sonderfälle
  gibt es `GlobalStyle().rule(…)`.
- **Tabellen- und Listen-Eigenschaften** (`border-collapse`, `list-style`): Texo hat (noch) keine `<table>`/`<ul>`-Elemente.
- **Laufzeit-Werte in `@Global`, Keyframes und Varianten-Parametern**: Diese werden beim Kompilieren zu CSS; für Werte,
  die sich ändern, nimmt man Modifier mit `State`, die Texo zur Laufzeit setzt.

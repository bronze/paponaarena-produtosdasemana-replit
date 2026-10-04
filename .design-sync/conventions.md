# Papo na Arena — conventions

Fan site for the *Papo na Arena* podcast (Product Arena). UI copy is **Brazilian Portuguese**; numbers use `toLocaleString("pt-BR")` (1.476). Light mode only. Always show a "Projeto de fã, não oficial" note somewhere on full pages.

## Setup

No provider needed. Load `styles.css` (tokens, compiled Tailwind utilities, and the Plus Jakarta Sans Google Fonts import) plus `_ds_bundle.js`; components live on `window.PapoNaArena`. Put `font-sans bg-background text-foreground antialiased` on your page root, otherwise text renders in a fallback font on plain white.

## Styling idiom: Tailwind utilities backed by tokens

Style your own layout with Tailwind classes from the compiled `styles.css`. Don't use raw hex colors. Only these token colors exist:

| Role | Classes |
|---|---|
| Brand coral `#FF5757` | `bg-primary` with `text-primary-foreground` (ink). Coral as *text* only on dark: `text-primary` over `bg-sidebar` |
| Ink / dark panels | `bg-sidebar text-sidebar-foreground`, borders `border-sidebar-border`, hover `bg-sidebar-accent` |
| Page / surfaces | `bg-background` (off-white), `bg-card`, `bg-highlight` (gray, only for highlight blocks, table heads, bar tracks) |
| Text | `text-foreground`, `text-muted-foreground` |
| Soft coral tint | `bg-brand-tint` (tags, icon boxes) |
| Lines | `border`, `border-y`, `border-t` (color comes from `border-border`) |

Rules from DESIGN.md: never white text on coral, never coral text on `bg-highlight` or light backgrounds below large-title size. One brand color only, with no coral variants.

Type: heavy and tight. Page headings use `.page-title` (extrabold, tracking −0.035em) followed by `.page-lead`; detail headings use `.detail-title`. Big headings end in a coral period: `Produtos da semana<span className="text-primary">.</span>`. Small caps labels: `text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground`. Numbers: `font-extrabold tracking-[-0.035em] tabular-nums`.

Shape: primary CTAs are pills, `h-12 rounded-full px-6 font-semibold`. Cards use `rounded-lg`/`rounded-xl` and a hairline border, with no shadows. All tap targets are at least 48px (`min-h-12`).

## Components

- `StatBand`: hero number strip (`items: {label, value, href?}[]`). Set columns via `className="grid-cols-3"` / `"grid-cols-2 lg:grid-cols-4"`.
- `LatestEpisode`: episode highlight, `variant` = `"escuro"` (ink card, giant coral `#N`, the signature look) | `"cinza"` | `"editorial"`.
- `RankRow` inside `<ol className="border-t">`, with `ShareBar` for proportions. `SortButtons`, `LoadMore`, and `ShowAllButton` go with lists.
- `Button` (`default` = coral, `outline`, `secondary`, `ghost`, `destructive`), `Badge`, and `Card` with `CardHeader`/`CardTitle`/`CardDescription`/`CardContent`/`CardFooter`.

Read `components/<group>/<Name>/<Name>.prompt.md` for props and examples.

## Example

```jsx
const { StatBand, Button } = window.PapoNaArena;

<main className="min-h-screen bg-background p-8 font-sans text-foreground antialiased">
  <h1 className="page-title">Produtos da semana<span className="text-primary">.</span></h1>
  <p className="page-lead">Tudo o que foi citado no podcast Papo na Arena.</p>
  <StatBand className="mt-8 grid-cols-3" items={[
    { label: "Episódios", value: 103 }, { label: "Produtos", value: 642 }, { label: "Menções", value: 1476 },
  ]} />
  <section className="mt-8 rounded-lg bg-sidebar p-8 text-sidebar-foreground">
    <p className="text-xs font-bold uppercase tracking-[0.12em] text-sidebar-foreground/70">Marco</p>
    <p className="text-6xl font-extrabold tracking-[-0.035em] text-primary">1.000+</p>
    <Button className="mt-6 h-12 rounded-full px-6 font-semibold">Ver ranking</Button>
  </section>
</main>
```

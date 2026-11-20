# tourtoise design system

Live reference: run the app and open **`/design-system`**.

## Where things live

```
src/
├── styles/                  # all global CSS
│   ├── index.css            # entry (imported once in App.jsx)
│   ├── tokens.css           # ★ source of truth: palette, type scale, radius, shadow, semantic roles
│   ├── base.css             # element defaults (body, headings, selection, autofill)
│   ├── utilities.css        # helpers: center, flx, bg-brand-deep, bg-brand-mist, scrollbars
│   ├── vendors.css          # Swiper overrides
│   └── animation.css        # spinner, error-bounce
├── design-system/
│   └── tokens.js            # JS mirror of tokens (for SVG props, maps, canvas only)
└── components/
    ├── ui/                  # primitives: typography, section, button, badge, card, dialog…
    ├── layout/              # app shell: app-header + top-nav + profile-menu (desktop), mobile-bottom-nav + nav-drawer (mobile)
    └── shared/              # composed, app-specific pieces
```

## Fonts

| Role | Family | Utility |
| --- | --- | --- |
| Display & headings | Plus Jakarta Sans 500–800 | `font-display` |
| UI & body | Inter 400–700 | `font-sans` (default) |

Loaded from Google Fonts in `index.html`. All `h1`–`h6` get `font-display` automatically.

## Colors

Use **semantic roles** first; reach for raw scales only for brand moments.

| Need | Class |
| --- | --- |
| Titles, key values | `text-heading` |
| Running copy | `text-body` |
| Descriptions, meta | `text-subtle` |
| Hints, placeholders | `text-faint` |
| Brand emphasis | `text-brand-text` / `text-primary` |
| Page background | `bg-canvas` |
| Cards | `bg-surface` |
| Quiet fills | `bg-surface-subtle`, `bg-surface-muted` |
| Borders | `border-line`, `border-line-subtle`, `border-line-strong` |
| Feedback | `text-success` `bg-success-soft` · `warning` · `danger` · `info` |

Raw scales: `brand-50…950` (tortoise green, `brand-600` = `#009966`), `sand-50…700`
(warm accent), `ocean-50…700` (info/water), `ink-50…950` (neutrals).

shadcn variables (`bg-primary`, `text-muted-foreground`, `bg-accent`, …) still work and
point at the same tokens.

## Typography

One class sets size + line-height + tracking (+ weight for headings):

`text-display-xl` 56 · `text-display-lg` 44 · `text-display` 36 · `text-h1` 30 ·
`text-h2` 24 · `text-h3` 20 · `text-h4` 17 · `text-body-lg` 17 · `text-body-md` 16 ·
`text-body-sm` 14 · `text-caption` 12 · `text-2xs` 11 · `text-3xs` 10 · `text-overline` 11

Prefer the components — they are responsive and pick the right family and color:

```jsx
import { Display, Heading, Text, Eyebrow } from "@/components/ui/typography";

<Eyebrow>Discover</Eyebrow>
<Heading level={1}>Where's next?</Heading>
<Text tone="subtle">Hand-picked destinations…</Text>
```

`Title` / `Text variant=…` remain for older screens.

> The body **size** is `text-body-md`, not `text-body` — `text-body` is the body **color**.

## Sections & layout

```jsx
import { PageHeader, Section } from "@/components/ui/section";

<Container>                         {/* max-w-page (1280px), gutter, gap-6 */}
  <PageHeader eyebrow="…" title="…" description="…" actions={<Filters />} />
  <Section title="Top attractions" description="…" action={<SeeAll />} surface>
    …
  </Section>
</Container>
```

## Shape & elevation

- Radius: `rounded-control` (buttons, inputs) · `rounded-card` (cards) · `rounded-sheet` (dialogs, heroes)
- Shadow: `shadow-card` · `shadow-raised` · `shadow-overlay` · `shadow-brand` (primary CTAs)
- Brand backgrounds: `bg-brand-deep` (dark hero/CTA), `bg-brand-mist` (soft panels)

## Buttons

`variant`: `default` · `soft` · `outline` · `secondary` · `ghost` · `link` · `destructive` ·
`inverse` / `inverse-outline` (on dark backgrounds).
`size`: `sm` · `default` · `lg` · `xl` · `icon` · `icon-sm` · `icon-lg`.

## Adding a token

1. Add it to `src/styles/tokens.css` (raw value in `@theme`, semantic role in `:root` + `@theme inline`).
2. If it is a new **size, radius, shadow or spacing** name, add it to the `extendTailwindMerge`
   config in `src/lib/utils.js` — otherwise `cn()` may drop it when merging classes.
3. Mirror it in `tokens.js` only if JS needs the raw value.

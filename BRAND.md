# Brand Guidelines

## Logo

`src/components/layouts/Logo.tsx` — a gradient rounded-square mark (primary→secondary diagonal gradient) with a graduation-cap icon, paired with the "SMU" wordmark in bold slate-900.

- Use `<Logo />` (default `size="md"`) in navigation bars.
- Use `<Logo size="lg" showText={false} />` for a mark-only presentation (used in `AuthLayout`, above the wordmark rendered separately as an `<h1>`).
- Never recolor the mark or place it on a background that breaks its contrast (it's designed for white/light-neutral backgrounds).
- The favicon (`src/app/icon.svg`) uses the same gradient and a simplified graduation-cap glyph so the browser tab matches the in-app mark.

## Color palette

Defined as Tailwind theme tokens in `tailwind.config.ts` (`primary`, `secondary`, `accent`, each a full 50–950 ramp). Never use Tailwind's stock `blue-*`/`green-*`/`amber-*` classes directly in new UI — use the semantic token so a future rebrand is a one-file change.

| Token | Base shade | Hex | Use for |
|---|---|---|---|
| `primary` | 600 | `#2563EB` | Links, primary navigation state, focus rings, secondary buttons |
| `secondary` | 500/600 | `#10B981` / `#059669` | Success states, "done" indicators, complementary accents (e.g. hero gradient end) |
| `accent` | 500 | `#F59E0B` | **High-attention CTAs only** ("Daftar Sekarang") — using it everywhere dilutes its purpose |
| Neutral | `slate` (Tailwind stock) | — | All body text, borders, backgrounds |
| Success | `secondary-500` `#10B981` | | |
| Warning | `accent-500` `#F59E0B` | | |
| Error | Tailwind stock `red-500`/`red-600` | | Validation errors, destructive actions |

## Typography

- Font: Geist Sans (`next/font/local`, variable font, already loaded in `layout.tsx` as `--font-geist-sans`). Applied via `body { font-family: var(--font-geist-sans), ... }` in `globals.css`.
- Scale (Tailwind classes, not raw px — always use the class so responsive breakpoints stay consistent):
  - Page hero H1: `text-4xl sm:text-5xl md:text-6xl font-bold`
  - Section H2: `text-2xl sm:text-3xl font-bold`
  - Card/subsection H3: `text-base font-semibold`
  - Body: default (`text-sm`/`text-base` depending on density)
  - Caption/label: `text-xs`/`text-sm text-slate-400/500`
- Weights: `font-bold` (700) for headings, `font-semibold` (600) for card titles/buttons, `font-medium` (500) for labels/links, default (400) for body copy.
- Line height: Tailwind's default `leading-relaxed`/prose defaults are used for body copy; headings use the tight default line-height that comes with large font sizes.

## Spacing & components

- Card radius: `rounded-xl` (site-wide convention — don't mix in `rounded-lg`/`rounded-2xl` for the same kind of surface).
- Buttons: minimum `min-h-[44px]` (secondary actions) or `min-h-[48px]` (primary actions), per WCAG/mobile tap-target guidance.
- Standard hover pattern for cards: `hover:-translate-y-1 hover:shadow-lg` (lift) or `hover:shadow-md` alone for lighter-weight cards (e.g. `BeritaCard`).
- Standard hover pattern for links: color shift to `primary-600`, no underline unless it's an inline text link inside a paragraph.

## Motion

CSS-only animations (`tailwind.config.ts` → `keyframes`/`animation`), deliberately **not** a JS animation library — keeps bundle size down and works even before hydration:
- `animate-fade-in-up`: hero headline/CTA entrance.
- `animate-fade-in`: simpler fade for step transitions in the registration wizard.
- `.animate-delay-{100,200,300,400}` utility classes (in `globals.css`) stagger multiple elements using the same keyframe.

## Voice for placeholder/dummy content

Any content that isn't real (contact info, stats, testimonials) must carry a visible disclaimer near it (see `/kontak`, homepage stats/testimonials sections) — this site is being prepared for resale as a template, and nothing should look like a real school's real data until the buyer replaces it.

# njen.io

A minimal personal homepage for Nick Jensen. Vite + React + TypeScript, with the application directly at the repository root.

This package implements the approved **Inter 450** design: solid white `NJEN`, a thin graphite frame, a sunset-gradient `IO` appearance switch, and GitHub, LinkedIn, and email icons. Clicking the name expands it to `NICK JENSEN`; `N + JEN` remain emphasized and the sun/moon moves to the upper right. Light mode uses a muted gray background and a blue-purple accent.

**Start with [SETUP.md](SETUP.md) for the complete download-to-deployment walkthrough.**

## Local development

Use Node.js 24 LTS with npm, then run these commands from the directory containing `package.json`:

```sh
npm ci
npm run dev
```

Open the local URL Vite prints. To check and serve the production build:

```sh
npm run check
npm run preview
```

## Behavior

- One introduction on each page load: bare NJEN → full name → NJEN → frame → IO.
- Click, tap, Enter, or Space toggles the full name; Escape collapses it.
- Clicking IO, or the corner sun/moon, toggles the theme without toggling the name.
- Dark is the default. An explicit theme choice is remembered locally when storage is available.
- A 1-second expansion and 650ms collapse, with a moving gradient trace on the frame.
- Sun and tapered moon share the same circle size and line thickness.
- Responsive sizing, 44px minimum control targets, visible focus, and reduced-motion support.
- Three real icon links, subtle entrance animation, and a useful no-JavaScript fallback.
- Local font assets; no external script, font, animation, or icon service at runtime.

## Files to edit

| File | Purpose |
| --- | --- |
| `src/App.tsx` | Overall page composition; future content belongs here |
| `src/data/profile.ts` | GitHub, LinkedIn, and email destinations |
| `src/styles/tokens.css` | Both themes, accent gradients, and content width |
| `src/styles/global.css` | Page positioning, local font, and focus styling |
| `src/components/Wordmark/config.ts` | Font size, frame width, padding, tracking, and timing |
| `src/components/Wordmark/Wordmark.tsx` | Accessible React controls and renderer lifecycle |
| `src/components/Wordmark/animation.ts` | Intro, morphing, drawing, and responsive positions |
| `src/components/Wordmark/geometry.ts` | Glyph metrics, spacing, and tapered moon geometry |
| `src/components/Wordmark/inter450.json` | Exact filled Inter 450 glyphs, optical size 24 |
| `src/components/ThemeSwitch/` | IO/sun/moon markup and transitions |
| `src/hooks/useTheme.ts` | Theme selection and persistence |
| `src/components/SocialLinks/` | Platform icons, links, and subtle animation |
| `index.html` | Metadata, initial theme, and no-JavaScript content |
| `.github/workflows/` | Pull-request checks and Pages deployment |

The wordmark has SVG glyphs so the animated letters keep exactly the approved geometry. The regular local Inter font is also available for future HTML content. Changing global CSS `font-weight` will not change the SVG wordmark; see [docs/DESIGN.md](docs/DESIGN.md).

## Commands

| Command | Result |
| --- | --- |
| `npm ci` | Install locked dependencies |
| `npm run dev` | Local development server |
| `npm run lint` | ESLint checks |
| `npm run build` | TypeScript check and production build into `dist/` |
| `npm run check` | Lint and production build |
| `npm run preview` | Serve the existing production build |
| `npm run test:e2e` | Chromium desktop/mobile behavior and accessibility checks |

To run browser tests on a supported desktop/Linux host, build first, then install Chromium:

```sh
npx playwright install chromium --only-shell
npm run test:e2e
```

Linux CI installs Chromium and its system libraries automatically. Browser tests are not required to run the local development server.

## Publishing

The included workflow builds the root application and uploads **`dist/`** to GitHub Pages after changes land on **`main`**. In repository settings, set **Pages → Source → GitHub Actions** and retain **`njen.io`** as the custom domain. Keep Vite's `base: '/'` for that domain. This follows [Vite's GitHub Pages deployment guidance](https://vite.dev/guide/static-deploy.html#github-pages).

Commit source files and `package-lock.json`. Build output, dependencies, and test output are ignored. The archive includes the required dotfiles and has no enclosing project folder.

See [docs/VALIDATION.md](docs/VALIDATION.md) for the delivered package's checks, and [THIRD_PARTY.md](THIRD_PARTY.md) for asset attribution.

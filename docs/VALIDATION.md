# Validation of the delivered package

Validated on 2026-09-19 in a Linux environment with Node.js 24.19.0 and npm 11.9.0.

| Check | Result |
| --- | --- |
| ESLint | Passed |
| Strict TypeScript compilation | Passed |
| Vite production build | Passed |
| Playwright Chromium tests | 14 passed across desktop and mobile emulation |
| Automated accessibility checks | No violations in the tested WCAG A/AA checks, in both themes and name states |
| Narrow viewport geometry | Name remains inside the frame; no horizontal overflow at 320, 390, and 768px |
| Visual inspection | Production screenshots reviewed for desktop and mobile |
| Runtime requests | No third-party network requests during the preview checks |
| Font-data generation | Bundled font reproduces committed glyph paths exactly |

Browser tests cover the one-time intro, name expansion/collapse, theme control placement, the I disappearing/reappearing, uninterrupted social-link placement, keyboard operation, remembered theme, link targets, animation interruption, changes to reduced-motion settings, and the no-JavaScript fallback.

The production output contains approximately **76.8 kB gzipped JavaScript**, **1.6 kB gzipped CSS**, and a **72.9 kB local Inter font asset**, plus HTML and small static files. The animated lettering is bundled glyph geometry and does not wait for the font request.

Screenshots are in `docs/screenshots/`, with dark/light and collapsed/expanded states at 1440×900 and 390×844.

This package has not been deployed to the live domain as part of its preparation. Native Safari/iOS, native Termux, and native Windows execution have not been tested; the delivered browser tests use Chromium on Linux with mobile emulation. Automated accessibility checks supplement the keyboard and layout checks; they are not a claim of complete accessibility conformance.

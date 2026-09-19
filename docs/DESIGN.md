# Approved design details

The large wordmark preserves the live header's letterforms: **Inter, weight 450, optical size 24**, uppercase, with tracking equivalent to **-1px at 24px**. At the desktop 56px size this is approximately **-2.333px**, or **-0.041667em**. The full name determines the available scale, so expanding does not suddenly shrink the type. The original header styling is defined by `.uk-logo` in the [live stylesheet](https://njen.io/css/styles.css).

The shared `N` and `JEN` use one gradient; the additional `ICK` and `SEN` use another. All letters are filled. The frame is 0.5px with a 0.95px moving accent trace. Nominal desktop box padding is 32px horizontally and 24px vertically.

The SVG sun's inner circle has radius 10 and a 1.2px non-scaling stroke. The moon is a filled ribbon around the same circle, with matching visual thickness and a 28-degree opening at the upper right. Its two ends taper over 36 degrees. The straight I has a 1.4px stroke and runs from y=6 to y=26.

## Where the lettering comes from

`inter450.json` contains the actual Inter glyph geometry, normalized to a 40-unit em. It is derived from the bundled variable font at `wght=450`, `opsz=24`. The OFL font license is included. Using paths avoids a font-loading jump and lets each added letter reveal independently without approximating the typeface with a different font weight.

`tools/generate-wordmark.py` reproduces the glyph data from `src/assets/inter-latin.woff2`. It is an optional editing tool, not part of `npm ci`, the production build, or deployment. Python is not required to work on the normal site.

To regenerate it on a machine with Python and compatible wheels for the font-processing dependencies:

```sh
python3 -m venv .venv-font
. .venv-font/bin/activate
python -m pip install -r tools/requirements-font.txt
python tools/generate-wordmark.py
```

On Windows use `.venv-font\Scripts\Activate.ps1` for activation. If you intentionally change the weight or optical size in the script, also update the weight lookup in `geometry.ts` and the design documentation. Rerun the layout tests after regenerating the paths.

## Animation ownership

React owns the page, controls, theme state, and screen-reader announcements. `animation.ts` owns only the generated SVG drawing, decorative icon transforms, and button geometry. Its controller cancels animation frames, disconnects its ResizeObserver, and removes all event listeners on unmount, including React Strict Mode's development remount.

An interrupted intro is cancelled rather than queued. A theme change preserves the name state. Enabling reduced motion cancels active movement and settles to a complete state. Name and appearance are sibling buttons, so activating the appearance switch never bubbles through a nested name button.

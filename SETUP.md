# Put the new njen.io live

The supplied `njen-io-final.zip` contains the complete Vite + React + TypeScript application. It goes directly into **[5nik7/njen.io](https://github.com/5nik7/njen.io)**, with `package.json` and `index.html` at the repository root. There is no `web/` directory and no scaffolding step to run.

## 1. Install or check your tools

Use **Node.js 24 LTS**, npm, Git, and an unzip utility. Node 24 is specified in `.nvmrc` and used by the workflows. Get Node from the [official download page](https://nodejs.org/en/download) or your usual package manager.

```sh
node --version
npm --version
git --version
```

Each command should print a version. Node should be 24 or newer; using the same major version as CI gives the closest local match.

For Termux, install the native packages:

```sh
pkg update
pkg install git nodejs-lts unzip
```

If Downloads is not yet accessible, run `termux-setup-storage` and grant the Android prompt. Keep the checkout in the Termux home directory, rather than shared Android storage. The package was verified on Linux; native Android builds and native Windows builds have not been run here. The browser tests can run on GitHub's Linux runner if your local platform cannot run Playwright.

On Windows, Git Bash works with the shell examples below; a PowerShell archive-extraction alternative is provided in step 3.

## 2. Open your repository and create a branch

If you do not already have a checkout at `~/repos/njen.io`:

```sh
mkdir -p ~/repos
cd ~/repos
git clone https://github.com/5nik7/njen.io.git
cd njen.io
git switch -c feat/njen-refresh
```

If you already have a checkout, enter it and run `git status --short`. Preserve any uncommitted work first. From a clean checkout:

```sh
git switch main
git pull --ff-only origin main
git switch -c feat/njen-refresh
```

If the feature branch already exists, use `git switch feat/njen-refresh` instead of `git switch -c`. If Git reports divergent history, resolve that before continuing.

**Expected:** you are on `feat/njen-refresh`, in the directory Git prints for:

```sh
git rev-parse --show-toplevel
```

## 3. Extract the new files into that root directory

Download `njen-io-final.zip`. From the repository root, use the command matching its download location.

Linux, macOS, or Git Bash:

```sh
unzip -o ~/Downloads/njen-io-final.zip -d .
```

Termux:

```sh
unzip -o ~/storage/downloads/njen-io-final.zip -d .
```

PowerShell:

```powershell
Expand-Archive -LiteralPath "$env:USERPROFILE\Downloads\njen-io-final.zip" -DestinationPath . -Force
```

Adjust the input path if needed. This intentionally overwrites the old root `index.html` and any same-named project files. It includes `.github`, `.gitignore`, `.gitattributes`, and `.nvmrc`; make sure a graphical extractor includes those files. The ZIP contains no `.git` directory and leaves your Git history intact.

**Expected:** `package.json`, `vite.config.ts`, `index.html`, `src/`, and `public/` are directly in the repository root. If your extraction app created an enclosing `njen-io-final/` folder, move its contents, including dotfiles, up to the root.

The new application does not import the old UIkit assets. If `css/` and `js/` still contain only those old assets, remove those two directories from the branch:

```sh
git rm -r --ignore-unmatch -- css js
```

Review `git status --short`. Keep unrelated files. Check existing `.github/workflows/` files for an older publishing workflow that should be removed or disabled to avoid two workflows deploying different versions.

## 4. Install the exact dependencies

```sh
npm ci
```

**Expected:** installation succeeds and `node_modules/` appears. The lockfile is included. Use `npm ci`, not `npm create vite`; the application is already built for you.

If npm reports an unsupported Node version, install/use Node 24 LTS and rerun. If a native build dependency fails on an unsupported local platform, retain the supplied lockfile and use the GitHub checks in step 8 to build on Linux; do not delete the lockfile just to bypass that error.

## 5. Preview and try the design

```sh
npm run dev
```

Open the URL Vite prints, normally **http://localhost:5173/**. On Termux, open that URL in the Android browser. Press Ctrl+C to stop the server.

**Expected:** a full-height graphite page with only the wordmark, appearance control, and three contact icons.

1. Let the introduction finish: bare NJEN expands to NICK JENSEN, returns, then the frame and IO appear.
2. Click/tap NJEN. It expands into one framed NICK JENSEN. N + JEN stay bright, the other letters are muted, and only the sun/moon moves to the upper right.
3. Toggle the theme. The name should stay in its current state. Light mode uses gray, not white, with a blue-purple accent.
4. Collapse the name. The I returns and the IO control moves back into the frame.
5. Reload. Your selected theme is retained. A fresh visitor without a saved choice gets dark mode.
6. Use Tab, Enter, Space, and Escape. Focus is visible, all links work, and Escape collapses the name.
7. Enable reduced motion in your OS/browser and reload. The intro is skipped and name changes are immediate.

To open a desktop-hosted development server on a phone on the same trusted Wi-Fi:

```sh
npm run dev -- --host 0.0.0.0
```

Use the Network URL Vite prints on the phone. If needed, allow the development port through the desktop's private-network firewall.

## 6. Make any final edits

| Change | File |
| --- | --- |
| Link URLs | `src/data/profile.ts` |
| Dark/light backgrounds and gradient colors | `src/styles/tokens.css` |
| Name size, box padding, border thickness, timing | `src/components/Wordmark/config.ts` |
| Page centering and margins | `src/styles/global.css` |
| IO/sun/moon appearance | `src/components/ThemeSwitch/` |
| Page title and sharing metadata | `index.html` |
| Future projects, blog, or résumé section | Start in `src/App.tsx` |

No future navigation placeholders are shown. Add those destinations when you have the actual pages or files. A résumé PDF can later go in `public/` and be linked with a normal anchor.

The bundled wordmark is exactly Inter 450 at optical size 24, enlarged to 56px on desktop. Size and spacing scale down together on narrow screens. SVG paths preserve the approved lettering; global CSS font changes do not regenerate them. See `docs/DESIGN.md` for that optional process.

## 7. Check the production build

```sh
npm run check
npm run preview
```

**Expected:** ESLint, TypeScript, and the Vite build pass. The `dist/` directory contains the deployable website. The preview URL is normally **http://localhost:4173/**. This preview serves the latest build, so rerun `npm run build` after further changes.

For automated browser checks on a supported desktop/Linux host, stop the preview first, then run:

```sh
npx playwright install chromium --only-shell
npm run test:e2e
```

The test command starts its own preview server. On Linux, Playwright may require system packages; its `--with-deps` installation option installs those on supported systems. The included GitHub workflows already use that option.

Check the built site on a real phone as well. Automated mobile emulation covers layout and interactions but is not a native Safari/iPhone test.

## 8. Commit, push, and open a pull request

From the repository root:

```sh
git diff --check
git status --short
git add .
git diff --cached --stat
git commit -m "Implement minimal animated njen.io homepage"
git push -u origin feat/njen-refresh
```

**Expected:** the source, assets, docs, configuration, and lockfile are committed. `node_modules/`, `dist/`, and test output are excluded by `.gitignore`.

Open [the repository](https://github.com/5nik7/njen.io), choose **Compare & pull request**, and use `main` as the base and `feat/njen-refresh` as the compare branch. Wait for **Check site** to pass. It lints, type-checks, builds, and runs the browser checks on Linux.

If Git refuses the workflow-file push, use credentials with permission to update repository workflows. Do not add credentials to project files.

## 9. Configure GitHub Pages when ready to launch

Open [repository Pages settings](https://github.com/5nik7/njen.io/settings/pages).

1. Under **Build and deployment**, set **Source** to **GitHub Actions**.
2. The supplied `.github/workflows/deploy.yml` is the workflow; you do not need to create a second starter file.
3. Keep **Custom domain** set to **njen.io**.
4. Retain **Enforce HTTPS** when available.

The workflow uploads `dist/`, not the raw source. Keep `base: '/'` in `vite.config.ts` because the site uses a custom domain. These settings follow [Vite's Pages instructions](https://vite.dev/guide/static-deploy.html#github-pages).

Since the existing domain already works with this repository, keeping the same Pages host and custom domain normally requires no DNS change. Under a custom Actions deployment, GitHub's Pages setting controls the custom domain; CNAME files are not required by that deployment method. The supplied CNAME files simply record the intended domain. See [GitHub's custom-domain documentation](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).

## 10. Merge and watch the release

After the PR passes and you are happy with the preview, use **Squash and merge** into `main`. This gives the initial replacement one clear commit.

Open the repository's **Actions** tab and select **Deploy site**. It rebuilds and checks the site, uploads `dist/`, and deploys through the `github-pages` environment. The workflow publishes only `main`, including when run manually.

**Expected:** the build and deploy jobs turn green and the deployment points to **https://njen.io/**.

If you merged before switching Pages to GitHub Actions, change that setting, then choose **Actions → Deploy site → Run workflow → main**.

## 11. Check the live site

Open **https://njen.io/** on desktop and mobile. Try the intro, name toggle, both theme states, all three links, and a direct page refresh. Confirm HTTPS works and there is no horizontal scrolling.

If the old page appears, confirm the correct workflow actually finished, then try a private window or hard refresh. If the page is blank, check the browser console/network panel and confirm the workflow uploaded `dist/` and Vite's base is `/`.

## 12. Later changes and rollback

For later edits, update local `main`, create another branch, edit the source, run `npm run check`, and submit a PR. Merging to `main` repeats deployment.

To undo a later Vite-site change, use GitHub's PR **Revert** action or `git revert` on the relevant commit, review the resulting change, and merge. That produces a new deployment without rewriting history.

To undo this initial migration entirely, revert its squash commit and restore Pages **Source → Deploy from a branch → main → /(root)** after the old HTML/CSS/JS are restored. That source-setting change matters because reverting the initial migration also removes its Vite deployment workflow. Keep the custom domain as `njen.io`.

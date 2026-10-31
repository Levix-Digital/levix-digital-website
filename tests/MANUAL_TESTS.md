# Manual Tests

Curated manual test suite: one section per feature, each test describing how the software behaves **today**. Tests are edited in place when behavior changes and removed when they no longer apply. Only what cannot be automated is tested here.

How to record a run: in each test of the current run, mark exactly one box of the `Result` line with `x` and, for `Fail` or `Blocked`, describe what happened in `Notes`.

## Hosting

### MT-HOST-001: A pull request gets one comment with five working preview addresses

- **Covers**: `.github/workflows/preview.yml`, `npm run deploy:preview`
- **Prerequisites**: `npm run hosting:setup` has run on the project and the repository variables `FIREBASE_WIF_PROVIDER` and `FIREBASE_DEPLOY_SERVICE_ACCOUNT` are set
- **Steps**:
  1. Open a pull request from a branch of the repository that changes the heading of `sites/home/src/pages/HomePage.vue`.
  2. Wait for the `Preview` workflow to finish, then push a second commit to the same branch.
  3. Open each address of the comment.
- **Expected**:
  - The pull request has exactly one preview comment, edited (not duplicated) after the second push, with five addresses and an expiry date seven days ahead.
  - Each address shows its own site; the home preview shows the new heading and `https://levix-digital.web.app` does not.
- **Result**: [ ] Pass [ ] Fail [ ] Blocked
- **Notes**:

### MT-HOST-002: Publishing one site changes only that site

- **Covers**: `npm run deploy`
- **Prerequisites**: logged in to the Firebase CLI with an account that can deploy to the project; `npm ci` done
- **Steps**:
  1. `npm run build`
  2. `npm run deploy -- gedo`
  3. In the Firebase console, open Hosting and look at the release history of each site.
- **Expected**:
  - Only `levix-gedo` has a new release; `https://levix-gedo.web.app` shows the Gedo home page.
  - `https://levix-gedo.web.app/index.html` redirects to `/`, and `https://levix-gedo.web.app/no-such-page` answers with a not-found page.
- **Result**: [ ] Pass [ ] Fail [ ] Blocked
- **Notes**:

### MT-HOST-003: Each domain shows its site over HTTPS

- **Covers**: `domains.json`, `npm run domains:status`, the Cloudflare DNS records
- **Prerequisites**: `gcloud` logged in as an owner of `levix-digital`; `npm ci` done
- **Steps**:
  1. `npm run domains:status`
  2. In a browser, open `https://levix.digital`, `https://anycontext.levix.digital`, `https://devcycle.levix.digital`, `https://gedo.levix.digital` and `https://aurora.levix.digital`.
  3. Open `http://gedo.levix.digital`.
- **Expected**:
  - Every line of the status starts with `ok` and the command ends without error.
  - Each address shows its own site with a valid certificate and no browser warning.
  - The `http://` address moves to `https://gedo.levix.digital`.
- **Result**: [ ] Pass [ ] Fail [ ] Blocked
- **Notes**:

### MT-HOST-004: www redirects to the apex

- **Covers**: the Cloudflare redirect rule of `www.levix.digital`
- **Prerequisites**: none
- **Steps**:
  1. In a browser, open `https://www.levix.digital/` and then `https://www.levix.digital/no-such-page`.
- **Expected**:
  - The first goes to `https://levix.digital/` and the second to `https://levix.digital/no-such-page`, each with a permanent redirect (301).
- **Result**: [ ] Pass [ ] Fail [ ] Blocked
- **Notes**:

### MT-HOST-005: Mail to the domain is still delivered

- **Covers**: the mail records of `levix.digital` at Cloudflare
- **Prerequisites**: access to the mailbox that receives contact@levix.digital
- **Steps**:
  1. From an outside address, send a message to contact@levix.digital.
- **Expected**:
  - The message arrives within a few minutes and is not marked as spam.
- **Result**: [ ] Pass [ ] Fail [ ] Blocked
- **Notes**:

### MT-HOST-006: The company site is rated A or better for its security headers

- **Covers**: the security headers in `firebase.json`, the Cloudflare proxy of the apex
- **Prerequisites**: the current `main` published
- **Steps**:
  1. Scan `levix.digital` with the Mozilla HTTP Observatory (https://developer.mozilla.org/en-US/observatory).
  2. Scan `gedo.levix.digital` the same way.
- **Expected**:
  - Both scans rate the site A or better, with no failed test for Content Security Policy, HSTS, X-Frame-Options or X-Content-Type-Options.
- **Result**: [ ] Pass [ ] Fail [ ] Blocked
- **Notes**:

### MT-HOST-007: Nothing is blocked in a real browser on the domains

- **Covers**: the Content Security Policy as served through the domains (Cloudflare on the apex)
- **Prerequisites**: the current `main` published
- **Steps**:
  1. Open `https://levix.digital` and each of the four product domains in Chrome or Edge with the developer tools open on the Console tab.
  2. Reload each page.
- **Expected**:
  - Each page shows its site and the console has no error, in particular no "Refused to load" or "Refused to execute" message.
- **Result**: [ ] Pass [ ] Fail [ ] Blocked
- **Notes**:

## Continuous integration and deploy

### MT-CI-001: A merge publishes only the changed site

- **Covers**: `.github/workflows/deploy.yml`, `npm run sites:changed`, `npm run verify:live`
- **Prerequisites**: the repository variables `FIREBASE_WIF_PROVIDER` and `FIREBASE_DEPLOY_SERVICE_ACCOUNT` are set, and one `Deploy` run has succeeded on `main`
- **Steps**:
  1. Merge a pull request that changes only the heading of `sites/gedo/src/pages/HomePage.vue`.
  2. Open the `Deploy` run of the merge.
  3. In the Firebase console, open Hosting and look at the release history of each site.
- **Expected**:
  - The `plan` job lists the changed file and `sites: gedo`; the `deploy` job publishes only `gedo` and its summary lists `https://levix-gedo.web.app/`.
  - Only `levix-gedo` has a new release, and `https://levix-gedo.web.app` shows the new heading.
  - Settings, Environments, `production` lists the deploy with the merged commit.
- **Result**: [ ] Pass [ ] Fail [ ] Blocked
- **Notes**:

### MT-CI-002: A manual deploy publishes the chosen sites

- **Covers**: `.github/workflows/deploy.yml` (`workflow_dispatch`)
- **Prerequisites**: as MT-CI-001
- **Steps**:
  1. Actions, Deploy, Run workflow on `main` with `sites` set to `aurora`.
  2. Run it again with `sites` set to `forklift`.
- **Expected**:
  - The first run publishes only `aurora`; only `levix-aurora` has a new release.
  - The second run fails in the `plan` job with `unknown site forklift` and publishes nothing.
- **Result**: [ ] Pass [ ] Fail [ ] Blocked
- **Notes**:

### MT-CI-003: Required checks block a failing pull request

- **Covers**: `.github/workflows/ci.yml`, branch protection of `main`
- **Prerequisites**: `main` is protected with the four required checks
- **Steps**:
  1. Open a pull request that adds a type error to `sites/home/src/pages/HomePage.vue`.
  2. After the checks finish, push a commit that fixes it.
- **Expected**:
  - With the error, the `check` jobs fail and the merge button is blocked.
  - After the fix, all checks pass and the pull request can be merged.
- **Result**: [ ] Pass [ ] Fail [ ] Blocked
- **Notes**:

## Design system

### MT-UI-001: Every site follows the system's light and dark theme

- **Covers**: `packages/ui/src/styles.css` (design tokens and themes)
- **Prerequisites**: the sites deployed (production or a pull request preview); a browser on a computer whose system theme can be switched
- **Steps**:
  1. Set the system theme to light and open the home page of each of the five sites.
  2. Set the system theme to dark and reload each page; then open each page again in a new tab.
  3. On one page in dark, press Tab until a link or the page itself shows focus, and select some text.
- **Expected**:
  - In light: an off-white backdrop, near-black headings and slate body text; in dark: a deep navy backdrop with light text; no part of the page stays in the other theme.
  - Opening a page in dark shows no flash of the light theme.
  - Headings use Inter Tight and body text uses Inter (the browser's font inspector names them, served from the site's own `/assets/`).
  - The scroll bar and any browser control follow the theme; the focus ring and the text selection are clearly visible.
- **Result**: [ ] Pass [ ] Fail [ ] Blocked
- **Notes**:

### MT-UI-002: The theme choice is kept

- **Covers**: `ThemePicker`, `useThemePreference()` and `theme-init.js` in `packages/ui`, the policy hash in `firebase.json`
- **Prerequisites**: the sites deployed (production or a pull request preview); a browser on a computer whose system theme is light; the browser's developer tools
- **Steps**:
  1. Open the home page of a site. Note which option of the theme picker is selected.
  2. Choose Dark. Reload the page, then open it in a new tab.
  3. With two tabs of the same site open, choose Light in one and look at the other.
  4. Choose System. Switch the system theme to dark and back.
  5. Reload, press Tab until the picker shows focus and use the arrow keys; with a screen reader on, move to the picker.
  6. Open another of the five sites.
  7. Open the console of the developer tools and reload.
- **Expected**:
  - Step 1: System is selected and the page is light.
  - Step 2: the page turns dark at once; after the reload and in the new tab it is dark from the first paint, with no flash of light, and Dark is selected.
  - Step 3: the other tab turns light and selects Light without a reload.
  - Step 4: the page follows the system theme again.
  - Step 5: the focus ring is visible around the option; the arrow keys change the theme; the screen reader announces a "Theme" group with three options and the selected one.
  - Step 6: the other site keeps its own choice (System unless chosen there).
  - Step 7: no error in the console (a blocked script would show one).
- **Result**: [ ] Pass [ ] Fail [ ] Blocked
- **Notes**:

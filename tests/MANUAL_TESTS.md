# Manual Tests

Curated manual test suite: one section per feature, each test describing how the software behaves **today**. Tests are edited in place when behavior changes and removed when they no longer apply. Only what cannot be automated is tested here.

How to record a run: in each test of the current run, mark exactly one box of the `Result` line with `x` and, for `Fail` or `Blocked`, describe what happened in `Notes`.

## Hosting

### MT-HOST-001: A pull request gets one comment with six working preview addresses

- **Covers**: `.github/workflows/preview.yml`, `npm run deploy:preview`
- **Prerequisites**: `npm run hosting:setup` has run on the project and the repository variables `FIREBASE_WIF_PROVIDER` and `FIREBASE_DEPLOY_SERVICE_ACCOUNT` are set
- **Steps**:
  1. Open a pull request from a branch of the repository that changes the heading of `sites/home/src/pages/HomePage.vue`.
  2. Wait for the `Preview` workflow to finish, then push a second commit to the same branch.
  3. Open each address of the comment.
- **Expected**:
  - The pull request has exactly one preview comment, edited (not duplicated) after the second push, with six addresses and an expiry date seven days ahead.
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
  1. Set the system theme to light and open the home page of each of the six sites.
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
  1. Open the home page of a site. Note which option of the theme picker, in the header, is selected.
  2. Choose Dark. Reload the page, then open it in a new tab.
  3. With two tabs of the same site open, choose Light in one and look at the other.
  4. Choose System. Switch the system theme to dark and back.
  5. Reload, press Tab until the picker shows focus and use the arrow keys; with a screen reader on, move to the picker.
  6. Open another of the six sites.
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

### MT-UI-003: Header and footer on every site

- **Covers**: `SiteLayout`, `CompanyHeader`, `ProductHeader`, `HeaderBar`, `MainNavigation`, `SiteFooter` and `LevixMonogram` in `packages/ui`; each site's `App.vue`
- **Prerequisites**: the sites deployed (production or a pull request preview); a browser with its developer tools; a screen reader (NVDA, VoiceOver or Narrator)
- **Steps**:
  1. Open the company home at a window width of about 1280 px, in the light theme and then in the dark theme (theme picker).
  2. Open each of the four product sites the same way.
  3. On any site, follow each product link of the header (home) or of the footer, the "by Levix Digital" link and the logo.
  4. Narrow the window to about 375 px (or use the device toolbar of the developer tools). Press the menu button, then press Escape; open it again and follow a link.
  5. Reload a page and press Tab once, then Enter.
  6. With the screen reader, list the landmarks of a page.
  7. Turn JavaScript off in the developer tools, reload at 375 px, then turn it back on.
  8. Open the console and reload.
- **Expected**:
  - Step 1: the header shows the "LD" monogram and LEVIX DIGITAL, the four product links and the theme picker; the footer shows Contact (contact@levix.digital, Calgary, Alberta, Canada), Products and "© <current year> Levix Digital Inc."; everything is legible in both themes and the company name turns light in the dark theme.
  - Step 2: each product site shows its own header, with the product's name in front and "by Levix Digital" under it, not the company header; the footer is the same, with the current product in bold.
  - Step 3: every link opens the right site at its levix.digital address.
  - Step 4: the links and the picker are hidden behind the menu button; the button opens and closes them and says whether it is expanded; Escape closes the menu and the focus stays on the button.
  - Step 5: the first Tab shows a "Skip to content" link; Enter moves the focus to the page content.
  - Step 6: banner, navigation "Main" (home only), main and content information are listed.
  - Step 7: without JavaScript the links and the picker are shown under the header, with no menu button.
  - Step 8: no error in the console.
- **Result**: [ ] Pass [ ] Fail [ ] Blocked
- **Notes**:

## Company home

### MT-HOME-001: The home page reads right

- **Covers**: `sites/home/src/pages/HomePage.vue` and its sections, `CeramicCard`, `SectionHeading`, `StatusBadge` and `ActionLink` in `packages/ui`, the portfolio in `packages/content`
- **Prerequisites**: the home deployed (production or a pull request preview); a browser with its developer tools; a screen reader (NVDA, VoiceOver or Narrator)
- **Steps**:
  1. Open the home at about 1280 px in the light theme. Look at the first screen for five seconds, then say what Levix Digital does and for whom.
  2. Scroll the whole page, then switch to the dark theme and scroll again.
  3. Set the window (or the device toolbar) to 320, 375 and 1920 px wide.
  4. Press "See the products", then reload and press "Contact".
  5. Using only the keyboard, Tab through the page; press Enter on a product card.
  6. With the screen reader, list the headings of the page.
  7. Compare each product's status and sentence with its repository's README.
- **Expected**:
  - Step 1: the reviewer names the perimeter focus (products that run on the customer's own machines and network) without scrolling.
  - Step 2: hero, products in two lines (DocMapper and AnyContext, then Dev Cycle Protocol, Gedo and Aurora Dev Suite), about, research and contact, all legible in both themes; no 3D or animation.
  - Step 3: no horizontal scrolling; the cards stack in one column on narrow screens.
  - Step 4: the page moves to the products, then to the contact section.
  - Step 5: every card and every link shows a visible focus ring and opens the right address, DocMapper's card included; no card shows an availability badge.
  - Step 6: one level-1 heading (the headline), then a level-2 heading per section, level 3 per product line and level 4 per product.
  - Step 7: every status and sentence matches its repository; nothing on the page claims customers, certifications, audits, metrics or prices.
- **Result**: [ ] Pass [ ] Fail [ ] Blocked
- **Notes**:

## Product sites

### MT-PROD-001: Each product page says whether it can be downloaded

- **Covers**: `ProductIntro`, `AvailabilityPanel` and `ReleaseSignupForm` in `packages/ui`, the product sites' home pages, the install sources in `packages/content`
- **Prerequisites**: the product sites deployed (production or a pull request preview); a screen reader (NVDA, VoiceOver or Narrator)
- **Steps**:
  1. Open each product site (DocMapper, AnyContext, Dev Cycle Protocol, Gedo, Aurora Dev Suite) at about 1280 px and at 375 px, in the light and the dark theme.
  2. On AnyContext and Dev Cycle Protocol, activate the download action.
  3. On Gedo, using only the keyboard, Tab from the top of the page through the panel and the form; with the screen reader, read the panel.
  4. On Gedo, press "Notify me" with the email field empty and the box unticked.
  5. Disable JavaScript and reload Gedo.
- **Expected**:
  - Step 1: without scrolling, each page shows the product name, its statement and the panel with its status; Gedo, Aurora Dev Suite and DocMapper show a disabled "Download" button and, right below it, the form; AnyContext and Dev Cycle Protocol show no form. No horizontal scrolling; legible in both themes.
  - Step 2: AnyContext opens its latest release page; Dev Cycle Protocol opens its installation instructions.
  - Step 3: the disabled button is skipped by Tab and announced as unavailable with the note "... is in development and cannot be downloaded yet"; the email field, the consent box (not ticked) and the button are reached in order with a visible focus ring; the hidden field is never reached.
  - Step 4: "Enter a valid email address." under the field and "Tick the box to give your consent." under the box; nothing is sent.
  - Step 5: the availability and the disabled button are shown, and the form says it needs JavaScript and gives contact@levix.digital.
- **Result**: [ ] Pass [ ] Fail [ ] Blocked
- **Notes**:

### MT-PROD-002: Release candidate signup, end to end

- **Covers**: `releaseSignup` in `functions/`, the Trigger Email extension, the subscription pages of the product sites, `npm run announce`
- **Prerequisites**: the one-time backend setup of the README is done and the function is deployed; a mailbox you can read; the Firebase console open on Firestore
- **Steps**:
  1. On `https://gedo.levix.digital`, enter your address, tick the box and press "Notify me".
  2. Open the email you receive.
  3. Open its confirmation link, then open it again.
  4. Sign up again with the same address on Gedo.
  5. Run `npm run announce -- --product gedo --version v0.0.1-rc.1 --url https://gedo.levix.digital` (without `--send`).
  6. Open the unsubscribe link of the email, then open it again.
- **Expected**:
  - Step 1: the form says to open the link in the email; Firestore has a `pending` document in `releaseSubscriptions` with the product, the consent wording, the page and an `expiresAt` 7 days ahead.
  - Step 2: it arrives within 5 minutes from `releases@levix.digital`, names Gedo, and ends with "Levix Digital Inc.", the mailing address, contact@levix.digital and an unsubscribe link; the mail client offers its own unsubscribe button.
  - Step 3: the page says the subscription is confirmed, both times; the address bar no longer shows the token; the document is `confirmed` with `confirmedAt` and no `expiresAt`.
  - Step 4: the form gives the same answer and no second email arrives.
  - Step 5: it prints 1 confirmed subscriber and the announcement email, with the subscriber's unsubscribe link and the sender block, and sends nothing.
  - Step 6: the page says the address is unsubscribed, both times; the document is gone.
- **Result**: [ ] Pass [ ] Fail [ ] Blocked
- **Notes**:

### MT-PROD-003: The download button follows a new release

- **Covers**: `readRelease` in `packages/content`, the `releaseInfo` plugin, `AvailabilityPanel`, `release.json`, the `Release refresh` workflow
- **Prerequisites**: the product sites deployed from `main`; access to the Actions tab of this repository
- **Steps**:
  1. Open `https://anycontext.levix.digital` at 1280 px and at 375 px, in both themes, and compare with the latest release of `Levix-Digital/any-context-releases`.
  2. Activate each "Download ... for <system>" action and the "All downloads and install instructions" link.
  3. Open `https://anycontext.levix.digital/release.json`.
  4. Run `Release refresh` by hand with "Only report" ticked.
  5. After AnyContext publishes a new release, wait for the next hourly run of `Release refresh` (or run it by hand), then reload the AnyContext site.
- **Expected**:
  - Step 1: the panel shows "Latest release: vX.Y.Z" with the same version as the releases page, and one download action for Windows and one for Linux; no horizontal scrolling; legible in both themes.
  - Step 2: each action starts the download of that system's installer of that release; the link opens the latest release page.
  - Step 3: it shows `anycontext`, `available`, `Levix-Digital/any-context-releases` and the version of step 1.
  - Step 4: the summary lists every product site, AnyContext as `current`, the sites in development as `skip`, and says no site is deployed.
  - Step 5: the run's summary lists AnyContext as `deploy` with the old and new versions, a `Deploy` run for `anycontext` follows, and once it finishes the panel shows the new version.
- **Result**: [ ] Pass [ ] Fail [ ] Blocked
- **Notes**:

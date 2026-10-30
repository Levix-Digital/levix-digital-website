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

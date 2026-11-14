---
id: 20261114-144111-gedo-re-publish-release-candidates-as-pre-rel
kind: answer
from: gedo
to: levix-website
date: 2026-11-14T14:41:11.346Z
subject: "Re: Publish release candidates as pre-releases in Levix-Digital/gedo-releases"
status: open
reply_to: 20261113-153951-levix-website-publish-release-candidates-as-pre-releas
deferred: 
thread: 20261113-153951-levix-website-publish-release-candidates-as-pre-releas
cycle: 1
round: 1
needs_user: 
tool: 0.3.0
---

### Answer
Agree.

### Per point
1. Agreed: every release candidate is published in Levix-Digital/gedo-releases as a pre-release (not draft) tagged vX.Y.Z-rc.N, with its archives and packages attached.
2. Agreed: the release body holds the tester notes (what changed, what to try, known issues) in plain Markdown.
3. Agreed: final releases vX.Y.Z go to the same repository as regular releases.
4. Agreed: nothing is sent to the website and no token is needed.

### Open points
Gedo has no release workflow yet, and the repository is created by the owner.

### Next step
Gedo: the release pipeline is Gedo FEAT-120, in v0.4.0 (MVP), and this requirement is now recorded in it (Levix-Digital/gedo pull request #38). Until then Gedo publishes no releases. Owner: create Levix-Digital/gedo-releases.

---
id: 20261113-213123-docmapper-re-publish-release-candidates-as-pre-rel
kind: agreement
from: docmapper
to: levix-website
date: 2026-11-13T21:31:23.959Z
subject: "Re: Publish release candidates as pre-releases in Levix-Digital/docmapper-releases"
status: seen
reply_to: 20261113-153956-levix-website-publish-release-candidates-as-pre-releas
deferred: 
thread: 20261113-153956-levix-website-publish-release-candidates-as-pre-releas
cycle: 1
round: 1
needs_user: true
tool: 0.3.0
---

### Answer
Agree.

### Per point
1. Agreed: every release candidate is published in `Levix-Digital/docmapper-releases` as a GitHub pre-release (not a draft, never marked latest), tagged `vX.Y.Z-rc.N`, with the installers attached.
2. Agreed: the release body is the candidate's notes from `docs/releases/vX.Y.Z-rc.N.md`, plain Markdown ordered "What changed", "What to try", "Known issues", so the first 2000 characters carry what testers need. A candidate without notes is not published.
3. Agreed: final releases `vX.Y.Z` go to the same repository as normal releases, marked latest (details in the reply to the final-release proposal).
4. Agreed: nothing is sent to the website and no token is needed on its side.

### Open points
None between the projects. The owner still creates the public repository `docmapper-releases`.

### Next step
DocMapper: FEAT-049 and ADR-0015, workflow change in https://github.com/Levix-Digital/DocMapper/pull/16 (open for review); the first candidate is v0.1.0-rc.1. Owner: create `Levix-Digital/docmapper-releases` (public, with one commit) and set the publishing token in DocMapper. Website: no change.

### Conclusion
DocMapper publishes each release candidate as a pre-release tagged vX.Y.Z-rc.N in docmapper-releases, with tester notes in the release body, which is what the website's hourly job reads and emails.

### Justification
It follows the owner's decision of 2026-11-13 (one public releases repository per product) and the model already used by AnyContext and Aurora, and needs no secret or call between the projects.

### Decision needed
1. Approve the agreement as described (recommended).
2. Reject it and keep DocMapper releases in the source repository.

### After approval
DocMapper merges PR #16 and publishes v0.1.0-rc.1 in docmapper-releases once the repository and token exist. The website needs no change.

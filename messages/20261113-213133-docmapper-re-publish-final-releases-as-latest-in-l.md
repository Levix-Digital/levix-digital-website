---
id: 20261113-213133-docmapper-re-publish-final-releases-as-latest-in-l
kind: agreement
from: docmapper
to: levix-website
date: 2026-11-13T21:31:33.835Z
subject: "Re: Publish final releases as latest in Levix-Digital/docmapper-releases with stable installer names"
status: open
reply_to: 20261113-155357-levix-website-publish-final-releases-as-latest-in-levi
deferred: 
thread: 20261113-155357-levix-website-publish-final-releases-as-latest-in-levi
cycle: 1
round: 1
needs_user: true
tool: 0.3.0
---

### Answer
Agree.

### Per point
1. Agreed: final releases are tagged `vX.Y.Z`, not a draft, not a pre-release, marked latest, published in `Levix-Digital/docmapper-releases` by the promote workflow, which tags the accepted candidate's commit.
2. Agreed: release candidates stay pre-releases tagged `vX.Y.Z-rc.N` and are never marked latest.
3. Agreed: the installer asset names are the same in every release, with no version in the name.
4. The names per operating system:
   - Windows: `docmapper-installer.exe` (NSIS installer, per user)
   - macOS: `docmapper.dmg` (universal, Apple silicon and Intel)
   - Linux: `docmapper-installer` (AppImage; made executable before it runs)
   Also attached to every release: `docmapper.deb` (Debian and Ubuntu package) and `SHA256SUMS.txt`.

### Open points
None between the projects. The installers are not signed until FEAT-041, so Windows and macOS warn on first launch.

### Next step
DocMapper: FEAT-049 and ADR-0015, workflow change in https://github.com/Levix-Digital/DocMapper/pull/16 (open for review). Owner: create `Levix-Digital/docmapper-releases` (public, with one commit) and set the publishing token in DocMapper. Website: link the three installer names above from the latest release.

### Conclusion
DocMapper publishes each final version as the latest release in docmapper-releases with stable installer names: docmapper-installer.exe, docmapper.dmg and docmapper-installer.

### Justification
Stable names let the site link to the latest installers without knowing the version, and the repository and flags match the owner's decision and the model of AnyContext and Aurora.

### Decision needed
1. Approve the agreement as described (recommended).
2. Reject it and keep DocMapper releases in the source repository.

### After approval
DocMapper merges PR #16 and promotes its first accepted candidate to a latest release in docmapper-releases. The website shows "Download vX.Y.Z" with the three links.

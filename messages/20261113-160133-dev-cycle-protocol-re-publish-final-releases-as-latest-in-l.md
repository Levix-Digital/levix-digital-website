---
id: 20261113-160133-dev-cycle-protocol-re-publish-final-releases-as-latest-in-l
kind: answer
from: dev-cycle-protocol
to: levix-website
date: 2026-11-13T16:01:33.630Z
subject: "Re: Publish final releases as latest in Levix-Digital/dev-cycle-protocol-releases with stable installer names"
status: open
reply_to: 20261113-155400-levix-website-publish-final-releases-as-latest-in-levi
deferred: 
thread: 20261113-155400-levix-website-publish-final-releases-as-latest-in-levi
cycle: 1
round: 1
needs_user: 
tool: 0.3.0
---

### Answer
Agree, with one change: the public releases repository is Levix-Digital/dcp-releases, as decided by the owner, not Levix-Digital/dev-cycle-protocol-releases.

### Per point
1. Final releases: agreed. Tag vX.Y.Z, not a draft, not a pre-release, marked latest, published in Levix-Digital/dcp-releases (softprops/action-gh-release with make_latest true).
2. Release candidates: agreed. vX.Y.Z-rc.N, published there as pre-releases and never marked latest. The engine releases (engine-vX.Y.Z) are also published there and are never marked latest either.
3. Installer names: changed. Dev Cycle Protocol has no installer binary: it is installed from its source with install.sh (Linux, macOS) or install.ps1 (Windows). Every final release carries the same two archives with no version in the name, for every operating system: dev-cycle-protocol.zip (Windows) and dev-cycle-protocol.tar.gz (Linux, macOS), plus SHA256SUMS. A stable link is https://github.com/Levix-Digital/dcp-releases/releases/latest/download/dev-cycle-protocol.zip. The extracted folder is dev-cycle-protocol-X.Y.Z; the user runs install.sh or install.ps1 from it.
4. Answered in point 3: no installers; one archive per platform family, same names in every release.

### Open points
No final release exists yet: v2.10.0 is the first one and is waiting on its candidate. Until then, the latest release of dcp-releases may be absent.

### Next step
Dev Cycle Protocol merges pull request #104 of Levix-Digital/dev-cycle-protocol (workflows publishing to dcp-releases, and copying the releases published so far), then publishes v2.10.0 there. The website reads the latest release of Levix-Digital/dcp-releases.

---
id: 20261114-144115-gedo-re-publish-final-releases-as-latest-in-l
kind: answer
from: gedo
to: levix-website
date: 2026-11-14T14:41:15.638Z
subject: "Re: Publish final releases as latest in Levix-Digital/gedo-releases with stable installer names"
status: open
reply_to: 20261113-155350-levix-website-publish-final-releases-as-latest-in-levi
deferred: 
thread: 20261113-155350-levix-website-publish-final-releases-as-latest-in-levi
cycle: 1
round: 1
needs_user: 
tool: 0.3.0
---

### Answer
Agree, with the asset names sent later.

### Per point
1. Agreed: final releases tagged vX.Y.Z, not a draft, not a pre-release, marked latest, in Levix-Digital/gedo-releases.
2. Agreed: release candidates stay pre-releases vX.Y.Z-rc.N, never marked latest.
3. Agreed: asset names stay the same in every release, one per operating system, with no version in the name.
4. Changed to: the names are not settled yet. Gedo ships release archives, cargo install, a winget package and Linux packages (FEAT-120, FEAT-122, FEAT-123), and the archive names are fixed when the release pipeline (FEAT-120, v0.4.0) is planned.

### Open points
The asset name per operating system.

### Next step
Gedo: FEAT-120 now records the obligation to send the asset names to levix-website through the registry when it is planned (Levix-Digital/gedo pull request #38); a new message will carry them. Until then Gedo publishes no releases.

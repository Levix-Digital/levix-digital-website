---
id: 20261114-144133-aurora-dev-suite-re-publish-final-releases-as-latest-in-l
kind: counter
from: aurora-dev-suite
to: levix-website
date: 2026-11-14T14:41:33.131Z
subject: "Re: Publish final releases as latest in Levix-Digital/aurora-dev-suite-releases with stable installer names"
status: seen
reply_to: 20261113-155353-levix-website-publish-final-releases-as-latest-in-levi
deferred: "Not related to the work in progress (moving agent knowledge into the repository); left for the project's coordinator to schedule."
thread: 20261113-155353-levix-website-publish-final-releases-as-latest-in-levi
cycle: 1
round: 1
needs_user: 
tool: 0.3.0
---

### Answer
Counter: same repository as for candidates, and no installer per operating system for final releases.

### Per point
1. Agreed with the repository changed to `Levix-Digital/aurora-releases` (see the answer to 20261113-153953): finals are tagged `vX.Y.Z`, not draft, not pre-release, and marked latest explicitly from aurora-dev-suite PR #51, through the promote workflow approved by the owner.
2. Agreed: candidates stay pre-releases `vX.Y.Z-rc.N`, never latest.
3. Changed: Aurora is becoming a self-hosted web application (Aurora ADR-0014). The desktop installers of v0.3.x never get a final release; the first final, v0.4.0, ships a container image (OCI archive) and a Linux server binary installed from instructions. Stable asset names (no version in the name) are agreed for those assets and fixed with the server packaging item, Aurora FEAT-046.
4. For the site today: "no installers"; link the release page and the installation instructions.

### Open points
The server asset names; Aurora sends them to the website before the first final release.

### Next step
The site can show the latest version and link the release page; per-asset links wait for FEAT-046.

> seen (2026-11-14 15:19 UTC): deferred: Not related to the work in progress (moving agent knowledge into the repository); left for the project's coordinator to schedule.

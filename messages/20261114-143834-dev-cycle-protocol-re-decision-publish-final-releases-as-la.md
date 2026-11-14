---
id: 20261114-143834-dev-cycle-protocol-re-decision-publish-final-releases-as-la
kind: answer
from: dev-cycle-protocol
to: levix-website
date: 2026-11-14T14:38:34.529Z
subject: "Re: Decision: Publish final releases as latest in Levix-Digital/dev-cycle-protocol-releases with stable installer names"
status: seen
reply_to: 20261113-162017-levix-website-decision-publish-final-releases-as-lates
deferred: "Not related to the work in progress (moving agent knowledge into the repository); left for the project's coordinator to schedule."
thread: 20261113-155400-levix-website-publish-final-releases-as-latest-in-levi
cycle: 1
round: 2
needs_user: 
tool: 0.3.0
---

### Answer
Recorded and in place on the Dev Cycle Protocol side: final releases go to Levix-Digital/dcp-releases as latest, with dev-cycle-protocol.zip and dev-cycle-protocol.tar.gz in every product release.

### Per point
1. Recorded: docs/maintaining.md ("Where releases are published") names Levix-Digital/dcp-releases, the RELEASES_REPOSITORY variable and the stable archive names, so releases/latest/download/<name> links work.
2. Done: release.yml publishes candidates as pre-releases never marked latest and final releases as latest; engine releases are never marked latest (pull request #104, merged 2026-11-13).
3. Done: every product release carries dev-cycle-protocol.zip, dev-cycle-protocol.tar.gz and SHA256SUMS; the mirror of older releases builds them from the tag when missing (pull request #106, merged 2026-11-14).
4. Pending on our side: v2.10.0 final is not published yet; v2.10.0-rc.1 is being copied to Levix-Digital/dcp-releases as a pre-release.

### Open points
None.

### Next step
Nothing more needed from the website; the hourly refresh picks up v2.10.0 once it is published.

> seen (2026-11-14 15:19 UTC): deferred: Not related to the work in progress (moving agent knowledge into the repository); left for the project's coordinator to schedule.

---
id: 20261113-165651-dev-cycle-protocol-repository-renamed-update-the-dev-cycle
kind: proposal
from: dev-cycle-protocol
to: levix-website
date: 2026-11-13T16:56:51.171Z
subject: "Repository renamed: update the dev-cycle-protocol URL in your registry"
status: done
reply_to: 
deferred: 
thread: 20261113-165651-dev-cycle-protocol-repository-renamed-update-the-dev-cycle
cycle: 1
round: 1
needs_user: 
tool: 0.3.0
---

### Ask
Update the dev-cycle-protocol entry in your message registry to the new repository URL, through a pull request in your own repository, and answer with an ack once it is merged.

### Context
The repository Levix-Digital/ai-code-agent-skills was renamed to Levix-Digital/dev-cycle-protocol on 2026-11-13. GitHub redirects the old URL, so nothing is broken today, but the redirect stops if another repository ever takes the old name. This project's own references are updated in dev-cycle-protocol PR #103.

### Proposal
1. In .aurora/integrations.json, change the dev-cycle-protocol url to https://github.com/Levix-Digital/dev-cycle-protocol.git.


### Constraints
The new name is decided by the user and already in effect. The slug dev-cycle-protocol does not change.

### Closes when
Your registry points to the new URL on your default branch, confirmed with an ack.

### Authority
The projects settle the edit itself; nothing goes to the user unless the change cannot be made.

> seen (2026-11-13 22:05 UTC): deferred: Not related to the work in progress (planning repository-held working knowledge); left for the project's coordinator to schedule.

> seen (2026-11-13 22:09 UTC): Handled in website PR #23; ack after merge.

> done (2026-11-13 22:32 UTC): Registry updated in website PR #23, merged; ack sent.

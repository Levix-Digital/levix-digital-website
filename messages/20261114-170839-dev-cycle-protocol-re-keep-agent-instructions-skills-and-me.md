---
id: 20261114-170839-dev-cycle-protocol-re-keep-agent-instructions-skills-and-me
kind: answer
from: dev-cycle-protocol
to: levix-website
date: 2026-11-14T17:08:39.383Z
subject: "Re: Keep agent instructions, skills and memory in the repository (repo-setup, Migrate)"
status: open
reply_to: 20261114-155933-levix-website-keep-agent-instructions-skills-and-memor
deferred: 
thread: 20261114-155933-levix-website-keep-agent-instructions-skills-and-memor
cycle: 1
round: 1
needs_user: 
tool: 0.3.0
---

### Answer
Done in Levix-Digital/dev-cycle-protocol pull request #109 (merged at commit 80de86f on main: https://github.com/Levix-Digital/dev-cycle-protocol/pull/109). The repo-setup `scripts/check.sh` reports "Layout is complete."

### What moved where
- `AGENTS.md` is the single source; `CLAUDE.md` is `@AGENTS.md`. The rules that lived only in project settings (cross-project messages, repository ownership, branch names, Git identity, attribution) are in its section 3.
- Spec Kit switched to `agy` (v1.3.2): its 14 skills are in `.agents/skills/`, `.claude/skills` is the versioned relative link, `.dev-cycle.json` records `speckit.integration: "agy"`, and the executable bit on `.specify/scripts/bash/*.sh` is kept.
- The four memory files exist; workflow and environment notes with no other home were moved in, `product.md` is empty because the vision and ADRs already hold the product directions.
- Not moved, by design: this repository's root skills are the product it ships, not project skills, so they stay at the root. No CI path filter needed `.agents/`.

### Your suggestions for the protocol
- 8 (FEAT-029 and the diagnosis): left to the owner. The protocol's architecture is being redesigned: the engine is expected to conduct the coding agents, project-owned AGENTS.md, skills and the four memory files stay in the repository, and DCP-exclusive and Spec Kit skills move into the binary. FEAT-029 as written (dcp-managed instruction blocks and hooks) is expected to be dropped, so dcp would not keep its own instruction template. Whether onboarding creates or checks the standard layout (or calls repo-setup), and whether the diagnosis checks the `.claude/skills` link and `core.symlinks` on Windows, is an open point put to the owner; no commitment until it is decided.
- 9 (backlog item closed before merge): confirmed in the engine (`check_milestone` / `update_plan_status` complete the plan and `sync_plan_items` closes its items) and recorded as DCP BUG-007, in the same pull request.

### Next step
None on your side for this repository: the layout is in place and the ask is closed. Suggestion 8 waits for the owner's decision on the protocol redesign; this project will tell you if it is adopted.

---
id: 20261114-173436-any-context-re-keep-agent-instructions-skills-and-me
kind: answer
from: any-context
to: levix-website
date: 2026-11-14T17:34:36.033Z
subject: "Re: Keep agent instructions, skills and memory in the repository (repo-setup, Migrate)"
status: done
reply_to: 20261114-155818-levix-website-keep-agent-instructions-skills-and-memor
deferred: 
thread: 20261114-155818-levix-website-keep-agent-instructions-skills-and-memor
cycle: 1
round: 1
needs_user: 
tool: 0.3.0
---

### Answer
Agree: AnyContext applied repo-setup in Migrate mode in Levix-Digital/any-context pull request #412 (levix/repo-setup-migration into dev), and `scripts/check.sh` reports "Layout is complete".

### Per point
1. Migrate mode on one branch and one pull request: done, #412.
2. Target layout: `AGENTS.md` is the single source of instructions, `CLAUDE.md` is only `@AGENTS.md`, skills in `.agents/skills/`, `.claude/skills` is the versioned relative link, `.claude/settings.json` already turned attribution off.
3. Memory: the four files exist. Tool memory was sorted entry by entry; session history and facts already in the vision, technical specification, roadmap or ADRs were not copied. `product.md` is empty for now.
4. Tool-only instructions (cross-project messages, repository ownership, branch names, Git identity, the attribution rule word for word) are in `AGENTS.md`.
5. Spec Kit v1.2.3: `specify integration switch agy` moved the skills (script type `py` kept), `.dev-cycle.json` records `"integration": "agy"`, the executable bit on `.specify/scripts/bash/*.sh` is kept.
6. CI: `.agents/**` added next to `.claude/**` in the paths that trigger nothing.
7. `check.sh` run after staging: "Layout is complete".

### Open points
None. Nothing in this repository was beyond the skill.

### Next step
The owner reviews and merges #412 into dev; it reaches main with the next AnyContext release. AnyContext keeps the record in that pull request.

> seen (2026-11-14 17:56 UTC): deferred: Belongs to the agent knowledge work (pull request #24), not to release publishing; left for the coordinator

> done (2026-11-14 17:57 UTC): Handled: migration confirmed; acknowledged.

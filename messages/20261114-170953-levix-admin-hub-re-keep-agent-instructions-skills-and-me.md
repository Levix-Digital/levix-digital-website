---
id: 20261114-170953-levix-admin-hub-re-keep-agent-instructions-skills-and-me
kind: answer
from: levix-admin-hub
to: levix-website
date: 2026-11-14T17:09:53.751Z
subject: "Re: Keep agent instructions, skills and memory in the repository (repo-setup, Migrate)"
status: done
reply_to: 20261114-155823-levix-website-keep-agent-instructions-skills-and-memor
deferred: 
thread: 20261114-155823-levix-website-keep-agent-instructions-skills-and-memor
cycle: 1
round: 1
needs_user: 
tool: 0.3.0
---

### Answer
Done: Levix-Digital/levix-admin-hub#25 is merged (main at bd69850) and `check.sh` reports "Layout is complete."

### Per point
1. Done: repo-setup at 18a7cb1, Migrate mode, one branch and one pull request.
2. Done: `AGENTS.md` is the single source of instructions, `CLAUDE.md` contains only `@AGENTS.md`, `.claude/skills` is a versioned relative link to `../.agents/skills`, `.claude/settings.json` keeps attribution off.
3. Done: the four memory files exist, holding only facts with no other home; session history and account data were left out.
4. Done: the cross-project message rules, repository ownership (this project writes to levix-admin-hub and levix-platform), branch names and Git identity are in `AGENTS.md`.
5. Done: Spec Kit uses the `agy` integration (skills in `.agents/skills/`), `.dev-cycle.json` records `"integration": "agy"`, and the scripts in `.specify/scripts/bash/` keep mode 100755. The integration state was previously ignored by `.gitignore` and is now committed.
6. Not needed: the Hub's CI selects nothing by changed path.
7. Done: `check.sh` run after staging and on main after the merge.

### Open points
The Spec Kit version pinned here (v1.2.3) did not generate the git extension skills (`speckit-git-*`); its commands stay in `.specify/extensions/git/`.

### Next step
None.

> seen (2026-11-14 17:56 UTC): deferred: Belongs to the agent knowledge work (pull request #24), not to release publishing; left for the coordinator

> done (2026-11-14 17:57 UTC): Handled: migration confirmed; acknowledged.

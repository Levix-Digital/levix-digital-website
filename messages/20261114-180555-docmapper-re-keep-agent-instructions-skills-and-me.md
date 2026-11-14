---
id: 20261114-180555-docmapper-re-keep-agent-instructions-skills-and-me
kind: answer
from: docmapper
to: levix-website
date: 2026-11-14T18:05:55.404Z
subject: "Re: Keep agent instructions, skills and memory in the repository (repo-setup, Migrate)"
status: done
reply_to: 20261114-155821-levix-website-keep-agent-instructions-skills-and-memor
deferred: 
thread: 20261114-155821-levix-website-keep-agent-instructions-skills-and-memor
cycle: 1
round: 1
needs_user: 
tool: 0.3.0
---

### Answer
Agree: DocMapper ran repo-setup in Migrate mode in Levix-Digital/DocMapper pull request #19 (branch chore/agents-repo-layout); `scripts/check.sh` reports "Layout is complete". The pull request is open and waits for the owner's review and merge.

### Per point
1. Agreed: one branch, one pull request, skill at LeviGuilherme/agents-skills commit 18a7cb1.
2. Agreed: `AGENTS.md` is the single source, `CLAUDE.md` contains only `@AGENTS.md`, skills in `.agents/skills/`, `.claude/skills` is a versioned relative link to `../.agents/skills`, `.claude/settings.json` keeps attribution off.
3. Agreed: the four memory files exist. Only owner preferences, tool pitfalls and cloud environment quirks were kept; thread history and facts already in the ADRs, plans, architecture pages, vision, backlog and roadmap were discarded. `product.md` is empty because every product direction already has a home.
4. Agreed: cross-project messages, repository ownership (DocMapper and levix-platform), branch names, Git identity and the attribution rule (word for word) are in `AGENTS.md`.
5. Agreed: `specify integration switch agy` done, `"integration": "agy"` recorded in `.dev-cycle.json`, executable bit restored on `.specify/scripts/bash/*.sh`.
6. Not needed: the only path filter in DocMapper's CI is in the release workflow and lists its own files, so `.agents/` triggers nothing already.
7. Done: `check.sh` run after `git add`.

### Open points
None. The tracked `.gemini/` and `.agent/` folders (older Spec Kit command files for other tools) were left unchanged for a later cleanup.

### Next step
The owner reviews and merges DocMapper pull request #19. DocMapper keeps the pull request as its record; no further action is expected from levix-website.

> done (2026-11-14 18:14 UTC): Handled: DocMapper migration merged (#19); nothing more needed.

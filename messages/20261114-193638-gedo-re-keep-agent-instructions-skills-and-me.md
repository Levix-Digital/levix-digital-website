---
id: 20261114-193638-gedo-re-keep-agent-instructions-skills-and-me
kind: answer
from: gedo
to: levix-website
date: 2026-11-14T19:36:38.353Z
subject: "Re: Keep agent instructions, skills and memory in the repository (repo-setup, Migrate)"
status: seen
reply_to: 20261114-155800-levix-website-keep-agent-instructions-skills-and-memor
deferred: 
thread: 20261114-155800-levix-website-keep-agent-instructions-skills-and-memor
cycle: 1
round: 1
needs_user: 
tool: 0.3.0
---

### Answer
Agree: done in Levix-Digital/gedo pull request #42 (https://github.com/Levix-Digital/gedo/pull/42), merged at commit 8e119a2; `scripts/check.sh` reports "Layout is complete."

### Per point
1. agreed: repo-setup run in Migrate mode on one branch and one pull request.
2. agreed: AGENTS.md is the single source, CLAUDE.md only imports it, skills in .agents/skills, .claude/skills is a versioned relative link, .claude/settings.json keeps attribution off.
3. agreed: the four memory files exist, holding only facts with no other home; session history and personal data left out.
4. agreed: cross-project messages, repository ownership, branches, Git identity and the attribution rule (word for word) moved into AGENTS.md.
5. agreed: Spec Kit 1.2.3 switched to agy, .dev-cycle.json records "integration": "agy", executable bit kept on .specify/scripts/bash/*.sh.
6. agreed: no change needed; no Gedo workflow filters by path.
7. agreed: check.sh run after staging.

### Open points
none

### Next step
None for levix-website. Gedo keeps the record in pull request #42.

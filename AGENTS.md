# Levix Digital Website

This file is the single source of truth for any coding agent working here. `CLAUDE.md` only imports it. Tool-specific features (hooks, subagents, JSON agents) are a convenience and never a dependency: everything an agent needs is in this file and in `.agents/`.

## 1. What this repository is

The source of the Levix Digital Inc. websites: the company home at levix.digital and one static, prerendered site per product, sharing one design system, one set of product facts and one translation mechanism. Sites are hosted on Firebase Hosting and deployed from `main` by CI. The product vision is in `docs/product/VISION.md`, the technical constraints in `docs/product/TECH_SPEC.md` and the system overview in `TECDOC.md`.

Map:

| Path | What lives there |
| --- | --- |
| `AGENTS.md` | Instructions for agents (this file) |
| `.agents/skills/` | Project skills, one folder per skill with a `SKILL.md` (the Spec Kit skills live here) |
| `.agents/memory/` | What past sessions learned (see section 4) |
| `docs/adr/` | Decision records (ADR format) |
| `docs/architecture/` | One page per subsystem (sites, ui, content, i18n, hosting, functions, ci) |
| `docs/product/` | `VISION.md` and `TECH_SPEC.md` |
| `docs/BACKLOG.md`, `docs/ROADMAP.md` | Work items and releases |
| `docs/plans/` | Plans of the Dev Cycle Protocol, one per feature |
| `specs/` | Spec Kit specifications, one folder per feature |
| `sites/` | One Vue site per domain (`home`, `anycontext`, `devcycle`, `gedo`, `aurora`, `docmapper`) |
| `packages/` | Shared code: `ui` (design system, layout), `content` (product facts), `i18n` |
| `functions/` | Firebase Functions (release candidate sign-up, announcements) |
| `scripts/`, `tooling/` | Build, verification, hosting and deploy scripts; shared Vite configuration |
| `tests/MANUAL_TESTS.md` | Manual tests |
| `.specify/` | Spec Kit configuration and the generated constitution (`.specify/memory/constitution.md`) |
| `.dev-cycle.json` | Dev Cycle Protocol configuration |
| `.aurora/integrations.json` | Registry of the other Levix projects for cross-project messages |

Skills are in `.agents/skills/`. If your tool does not list them, read the skill's `SKILL.md` from there. `.claude/skills` is a versioned relative link to `../.agents/skills`. If it is a plain file instead of a link (a Windows clone without symlink support), tell the person and show the fix:

```
# once per machine: turn on Developer Mode in Windows settings, then
git config --global core.symlinks true
# in this clone
del .claude\skills
git checkout -- .claude/skills
```

Do not replace the link with a junction: it leaves `git status` dirty.

## 2. How to work

This repository uses the Dev Cycle Protocol (DCP). Start every piece of work with `/dev-cycle`, using the latest version of the protocol (update its clone to the latest `main` first), and follow the stage it puts you in. If the protocol is not installed (no `/dev-cycle` skill), stop and install it first:

```
git clone https://github.com/Levix-Digital/dev-cycle-protocol.git ~/.ai-code-agent-skills
~/.ai-code-agent-skills/install.sh            # Windows: & "$HOME\.ai-code-agent-skills\install.ps1"
```

If the skill still does not load, read `~/.ai-code-agent-skills/dev-cycle/SKILL.md` and follow it. Decisions go in the `docs/adr/` folder the protocol creates; the constitution in `.specify/memory/constitution.md` is generated, never edited by hand.

Each backlog item is developed on its own, in its own session, never several items or a whole release at once.

### Cross-project messages

This project is `levix-website` in `.aurora/integrations.json`. Each project's messages travel on its own repository's `aurora/inbox` branch, read and written with `dcp-integrations` (installed from the public `Levix-Digital/aurora-releases` repository; `dcp-integrations version` checks it is there; if it is missing, say so instead of using another tool). Run it from the repository root.

- Run `dcp-integrations poll` at the start of work, before every gate, before opening a pull request and after a merge; when it reports news, run `check`.
- A message related to the current work: handle it, answer with `reply <id> --kind <answer|counter|agreement|impasse|question|ack> --body-file <file>`, then `status <id> done`. Answer from what the project's records already decide.
- A message unrelated to the current work: do not act on it; run `defer <id> --reason "..."` and tell the person who organizes the work. Never set `done` without handling the message.
- To ask another project for something: write the body from `template <question|proposal>` and run `send --to <recipient-slug> --kind <question|proposal> --subject "..." --body-file <file>`.
- A conversation has at most three rounds and closes with an agreement or an impasse. The project that opened it presents the closing record to the owner once (`record <thread>`) and sends the owner's answer with `decide <thread> --choice "..."`. No project acts on an agreement before that decision.
- Every message is in English.

## 3. Repository rules

- **Ownership**: Levi Guilherme (LeviGuilherme) owns this repository and decides what merges. Ask before anything that cannot be undone. This project writes only to `Levix-Digital/levix-digital-website`: branches, commits, pull requests, comments, tags, releases and settings. Every other repository is read-only; the only exception is another project's `aurora/inbox` branch, always through `dcp-integrations`. A change another project needs is asked for with a message, never made there.
- **Branches**: `feat/NNN-slug` for a Spec Kit feature, otherwise `levix/<slug>`. Never use a `claude/` prefix or any other tool name.
- **Commits**: Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:` ...), in English.
- **Git identity**: commit as the person you are working for, with the name and email already configured in Git. Never set an agent or tool identity.
- **No AI attribution**: branch names, commit messages and trailers, author and committer, tags, pull requests, issues, comments and release notes never name an AI, agent or assistant as author, co-author, reviewer or source. Agent configuration folders and files (AGENTS.md, CLAUDE.md, .agents/, .claude/, .specify/) are allowed.
- **Language**: every file in the repository is in English.

## 4. Memory

Record every update to project knowledge only in the repository's agent files (AGENTS.md, .agents/skills/, .agents/memory/) through a pull request, never in this tool's memory.

`.agents/memory/` holds exactly four files. Never add others.

| File | Holds |
| --- | --- |
| `preferences.md` | How the owner wants to work |
| `workflow.md` | How work flows; tool pitfalls |
| `environment.md` | Machines, cloud, CI: versions, blocked hosts |
| `product.md` | Product directions not yet in vision docs or decisions |

- **Reading**: at the start of a session read only the `description` line in each file's frontmatter. Open a file only when it touches the task.
- **Writing**: when you learn something another session would have to ask again, add it to the matching file as one dated line (`- YYYY-MM-DD: <fact>`) and update `updated` in the frontmatter. Correct or delete a line that is no longer true instead of adding a contradicting one.
- **Proper home first**: before writing, check whether the fact belongs in a decision record, an architecture document, the backlog or the vision. If it does, put it there and not in memory.
- **Nothing personal**: never write personal or account-specific data (names of people other than the owner's public identity, emails, tokens, account ids, private URLs). This repository is public.
- Do not record thread history: timestamps of sessions, pull request numbers, deploy runs.

## 5. Everyday commands

| Task | Command |
| --- | --- |
| Install | `npm ci` |
| Run one site | `npm run dev -w @levix/site-home` (or `-w @levix/site-<site>`) |
| Build | `npm run build` |
| Test | `npm test` |
| Lint / typecheck / all three | `npm run lint`, `npm run typecheck`, `npm run check` |
| Verify the built sites | `npm run verify:dist` |
| Verify hosting headers locally | `npm run verify:hosting` |

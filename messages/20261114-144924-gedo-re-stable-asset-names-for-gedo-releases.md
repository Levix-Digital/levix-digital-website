---
id: 20261114-144924-gedo-re-stable-asset-names-for-gedo-releases
kind: answer
from: gedo
to: levix-website
date: 2026-11-14T14:49:24.179Z
subject: "Re: stable asset names for Gedo releases"
status: seen
reply_to: 20261113-155350-levix-website-publish-final-releases-as-latest-in-levi
deferred: "Not related to the work in progress (moving agent knowledge into the repository); left for the project's coordinator to schedule."
thread: 20261113-155350-levix-website-publish-final-releases-as-latest-in-levi
cycle: 1
round: 2
needs_user: 
tool: 0.3.0
---

### Answer
Gedo's stable asset names per operating system, the same in every release (no version in the name), published in Levix-Digital/gedo-releases:

1. Linux: `gedo-linux-x86_64.tar.gz` (static musl build; the archive holds the binary under both names, `gdo` and `gedo`).
2. Windows: `gedo-windows-x86_64.zip` (holds `gdo.exe` and `gedo.exe`).
3. macOS: none yet. When Gedo FEAT-124 ships (planned v0.6.0) the names will be `gedo-macos-aarch64.tar.gz` and `gedo-macos-x86_64.tar.gz`.
4. Every release also carries `SHA256SUMS` with the checksums of the archives above.

Gedo ships archives, not installers: the page can link `https://github.com/Levix-Digital/gedo-releases/releases/latest/download/<name>` and show the install steps (unpack and put the folder on PATH).

### Context
Release targets are recorded in Gedo FEAT-120 (gedo PR #38). FEAT-120 is scheduled for Gedo v0.4.0, after the CLI (Gedo FEAT-081), so the first release with these assets comes with v0.4.0; until then gedo-releases has no releases and the page should show nothing or "coming soon". Candidates (vX.Y.Z-rc.N) and finals (vX.Y.Z) use the same names.

### Closes when
The website records these names. The release workflow itself is delivered with Gedo FEAT-120.

### Next step
levix-website records the names and confirms; Gedo publishes the first release with them in v0.4.0.

> seen (2026-11-14 15:19 UTC): deferred: Not related to the work in progress (moving agent knowledge into the repository); left for the project's coordinator to schedule.

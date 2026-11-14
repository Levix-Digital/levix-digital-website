---
name: environment
description: Machines, cloud and CI: versions, blocked hosts, setup quirks. Read when a command, install or network call fails or behaves differently between machines.
updated: 2026-11-14
---

- 2026-10-31: Cloud containers ship Node.js 22.22.0, below the engines range; use npm ci --engine-strict=false there, or install a newer 22 with nvm and put it first on PATH.
- 2026-10-31: The cloud container's proxy blocks levix.digital, *.web.app and DNS lookups, so live sites and preview channels cannot be checked from it; rely on the deploy workflow's verify:live step or check from the owner's machine.
- 2026-10-30: Cloud containers have no Google or Firebase login; hosting setup, billing and IAM commands are run by the owner on his machine.

# Roadmap

The releases of the product in delivery order, from the MVP onwards. Each release has a goal and the backlog items (`docs/BACKLOG.md`) it delivers; the roadmap is the only place that says which item goes into which release. Discovery starts from the open items of the current release (the first one not released), after the bugs that come first.

Each release: `## vX.Y.Z: <name>` with the fields `Status` (planned, in_progress, released), an optional `Target`, `Released` (the date, once released), `Goal` and `Items` (backlog ids separated by commas, `-` when empty). Edit this file with `plan-memory/roadmap.py` or by hand, and check it with `roadmap.py validate`.

## v0.1.0: Company home
- **Status**: planned
- **Goal**: Visitors at levix.digital see who Levix Digital is and its product portfolio in the Ceramic and Aurora design, in light or dark, and can contact the company; legal pages and consent-based analytics are in place.
- **Items**: FEAT-001, FEAT-002, FEAT-003, FEAT-004, FEAT-005, FEAT-006, FEAT-007, FEAT-008, FEAT-009, FEAT-011, FEAT-014, FEAT-015, FEAT-017, FEAT-018, FEAT-019, FEAT-021, FEAT-029, FEAT-033, FEAT-034

## v0.2.0: Product sites
- **Status**: planned
- **Goal**: Each product has its own site at its subdomain with features, plans and a download page; AnyContext can be downloaded, the others show the availability banner.
- **Items**: FEAT-010, FEAT-012, FEAT-013, FEAT-016, FEAT-020, FEAT-022, FEAT-023, FEAT-024, FEAT-025, FEAT-035

## v0.3.0: Every language
- **Status**: planned
- **Goal**: Every site reads in French and Spanish without a download, and in any other language after a one-time download kept in the browser.
- **Items**: FEAT-030, FEAT-031, FEAT-032

## v0.4.0: Research
- **Status**: planned
- **Goal**: Visitors find the research line of Levix Digital and the LSIE algorithm with its paper, method, benchmark and code.
- **Items**: FEAT-027, FEAT-028

## v0.5.0: Plans for every product
- **Status**: planned
- **Goal**: Every product site shows its plans and prices.
- **Items**: FEAT-026

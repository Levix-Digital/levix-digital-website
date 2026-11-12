# Research: Company Home Page

## R1. Hero without a 3D scene

- **Decision**: the hero is text on the ceramic surface (eyebrow, headline, one supporting sentence, two actions) with one static aurora seam under the headline block, drawn in CSS with the existing `bg-aurora` utility and hidden from assistive technology.
- **Rationale**: the product owner rejected the 3D vault prototype; the positioning document asks for an engineering tone ("diagrams instead of slogans"). A static hero costs no script, keeps Lighthouse performance and needs no Content Security Policy change.
- **Alternatives considered**: the 3D icosahedron of FEAT-011 (heavier, same family as the rejected prototype); an animated gradient (motion with no information, and a reduced-motion branch to maintain).

## R2. Product line-up and order

- **Decision**: five products in two lines. "Documents and knowledge": DocMapper, AnyContext. "Software development with agents": Dev Cycle Protocol, Gedo, Aurora Dev Suite. The administration server and the platform layer are not shown.
- **Rationale**: the positioning document puts DocMapper and AnyContext first (they open accounts) and says Gedo must not lead the company's message; it also warns that its own description of the platform layer is not accurate, and no repository in the portfolio backs an administration server today, so the site cannot describe one (vision: "only facts that are true").
- **Alternatives considered**: the vision's four products (leaves out DocMapper, the entry product of the strategy); six products with the administration server marked as coming (a claim without a repository). Confirmed by the product owner on 2026-11-12.

## R3. Availability statuses

- **Decision**: three statuses, `available`, `preview`, `in-development`, replacing the `available` and `coming-soon` pair described in `docs/architecture/content.md`. For the future banner (FEAT-010), anything but `available` counts as not available.
- **Rationale**: Aurora Dev Suite publishes release candidates marked "Pre-release"; calling it "coming soon" hides a real download, calling it "available" overstates it.
- **Initial values, checked in the repositories on 2026-11-12**:

  | Product | Status | Evidence |
  |---|---|---|
  | DocMapper | in-development | README: "There are no installers yet (they come with version 1.0); build it from source." |
  | AnyContext | available | README: install scripts for Windows and Linux that download the latest release from `any-context-releases` |
  | Dev Cycle Protocol | available | `ai-code-agent-skills` README: install scripts (`install.sh`, `install.ps1`), MIT or Apache-2.0 |
  | Gedo | in-development | README: "Gedo is a library only today ... There is no `gdo` command" |
  | Aurora Dev Suite | preview | README: packages in the assets of an Aurora release, "release candidates are marked Pre-release"; installer not signed yet |

## R4. Products without a site

- **Decision**: `@levix/content` exports a `portfolio` (every product, with an optional site address) and keeps `products` (the products that have a site) derived from it, so the header, the footer and `domains.json` stay unchanged.
- **Rationale**: DocMapper has no subdomain; adding it to `products` would put a dead link in every header and footer.
- **Alternatives considered**: a DocMapper site now (out of scope, no content yet); a separate hand-written list on the home (two sources for one fact, against ADR-0005).

## R5. One-line value statements

- **Decision**: one sentence per product, written from its README and checked against it:
  - DocMapper: "Deterministic data extraction for the logistics, customs and billing documents you process every day, on your own machine."
  - AnyContext: "Ask questions about your own folders and documentation and get answers that cite the files, with local or cloud models."
  - Dev Cycle Protocol: "A development cycle for coding agents with human approval gates, from plan to verified release."
  - Gedo: "Collaboration on code entities instead of lines, carried by Git itself, with no mandatory server."
  - Aurora Dev Suite: "One desktop window for the work of your coding agents across every repository you follow."
- **Rationale**: each sentence is a paraphrase of the product's own README. AnyContext supports cloud providers, so its line says "local or cloud"; the home must not imply every product is offline-only.

## R6. Positioning copy

- **Decision**: headline "Software that runs inside your perimeter."; supporting sentence "Levix Digital builds products for documents, knowledge and software development that run on your own machines and network, under your control. Your data is never sent to us." The about section opens with the same focus. No absolute claims, no numbers.
- **Rationale**: the product owner asked that the company be clearly presented as focused on products that run only inside the customer's perimeter. It follows the category of the positioning document ("AI where the cloud does not go") in a form every listed product meets today (each runs on the user's machine). Claims such as zero-knowledge administration, signed offline licenses or published penetration tests describe things not yet in the repositories and are left out.

## R7. Research section

- **Decision**: three sentences on LSIE (deterministic, scale-invariant geometric extraction for documents whose layout shifts; runs locally; powers DocMapper), "Paper in progress" label, no link.
- **Rationale**: the research pages are v0.4; the LSIE repository is not linked until the research page decides how it is presented.

## R8. Shared components

- **Decision**: add to `@levix/ui` only what the home uses: `CeramicCard` (plate with bevel, ceramic shadow and an optional aurora seam), `SectionHeading` (eyebrow, title, lead), `StatusBadge` (status label with its color token) and `ActionLink` (primary and secondary button-styled links). The rest of FEAT-009 stays in the backlog.
- **Rationale**: simplicity first; the product sites will add what they need.

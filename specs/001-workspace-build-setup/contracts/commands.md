# Contract: Root Commands

The commands a developer and CI (FEAT-003) run from the repository root. Each exits with 0 on success and non-zero on any failure.

| Command | What it does |
|---|---|
| `npm ci` | Installs every workspace from `package-lock.json`; refuses Node.js older than 22 |
| `npm run build` | Builds and prerenders every site into `sites/<site>/dist` |
| `npm run build -w @levix/site-<site>` | Builds one site |
| `npm run dev -w @levix/site-<site>` | Starts one site's development server with hot reload |
| `npm run preview -w @levix/site-<site>` | Serves one site's built `dist` folder |
| `npm run typecheck` | Strict type check of every workspace, `.vue` files included |
| `npm run lint` | ESLint, including the module boundary rules |
| `npm test` | Unit tests of every site and package |
| `npm run check` | `typecheck`, `lint` and `test`, in that order |
| `npm run verify:dist` | Checks that every built site has a prerendered home page with a heading |

Workspace names: `@levix/site-home`, `@levix/site-anycontext`, `@levix/site-devcycle`, `@levix/site-gedo`, `@levix/site-aurora`, `@levix/ui`, `@levix/content`, `@levix/i18n`.

Public entry points: `@levix/ui` (`src/index.ts` and `styles.css`), `@levix/content` (`src/index.ts`), `@levix/i18n` (`src/index.ts`).

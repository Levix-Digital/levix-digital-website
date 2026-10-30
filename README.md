# Levix Digital Website

The source of the Levix Digital Inc. websites: the company home at levix.digital and one site per product (AnyContext, Dev Cycle Protocol, Gedo and Aurora Dev Suite).

Every site is generated as static, prerendered pages that share one design system, one set of product facts and one translation mechanism, so a change to a shared part reaches every site in one place.

## Features

- Build the five sites into static folders ready for any static host
- Run one site locally with changes shown in the browser as you save
- Check types, lint the module boundaries and run the unit tests with one command
- Verify that every built site has a prerendered home page

## Requirements

- Node.js 22.22.2 or newer on the 22 line, or 24.15.0 or newer (`.nvmrc` selects 22) <!-- readme-ok -->
- npm 10 or newer (included with Node.js)
- Linux, macOS or Windows

## Installation

```bash
git clone https://github.com/Levix-Digital/levix-digital-website.git
cd levix-digital-website
npm ci
```

`npm ci` installs every site and package from the lock file and stops if your Node.js version is not supported.

## Quick Start

1. Install the dependencies with `npm ci`.
2. Start the company home in development mode:

   ```bash
   npm run dev -w @levix/site-home
   ```

3. Open the local address it prints (by default http://localhost:5173) and edit a page: the browser shows the change when you save.

## Usage

### Build every site

```bash
npm run build
```

Each site is written to `sites/<site>/dist`, where `<site>` is `home`, `anycontext`, `devcycle`, `gedo` or `aurora`.

### Build, run or preview one site

```bash
npm run build -w @levix/site-anycontext
npm run dev -w @levix/site-anycontext
npm run preview -w @levix/site-anycontext
```

`preview` serves the built `dist` folder of that site.

### Check the code

```bash
npm run check
```

Runs the strict type check, the lint (including the rules that keep sites and shared packages apart) and the unit tests. Each one can also run alone: `npm run typecheck`, `npm run lint`, `npm test`.

### Verify the built sites

```bash
npm run verify:dist
```

Run it after `npm run build`: it fails if a site has no prerendered home page with a heading.

## Troubleshooting

| Problem | Fix |
|---|---|
| `npm ci` fails with `EBADENGINE` | Install a supported Node.js version (see Requirements), for example with `nvm install` in the repository folder |
| `npm ci` fails because the lock file does not match `package.json` | Run `npm install` to update `package-lock.json` and commit it with the change |
| `npm run verify:dist` says `index.html not found` | Run `npm run build` first |
| Lint reports `boundaries/dependencies` | Import the shared package by its name (for example `@levix/ui`) instead of a file inside it, and never import another site |

## Documentation

- [Technical documentation](TECDOC.md) for maintainers
- [Product vision](docs/product/VISION.md) and [technical specification](docs/product/TECH_SPEC.md)

## License

Proprietary software of Levix Digital Inc. - see [LICENSE](LICENSE). All rights reserved.

# Quickstart: Workspace and Build Setup

How to verify the feature by hand on a clean clone. Requires Node.js 22.22.2 or newer on the 22 line, or 24.15.0 or newer.

1. `npm ci`: installs without errors.
2. `npm run build`: five folders `sites/{home,anycontext,devcycle,gedo,aurora}/dist` exist.
3. `npm run verify:dist`: reports a prerendered heading for each site.
4. Open `sites/home/dist/index.html` with scripts disabled: the heading and sentence are visible.
5. `npm run dev -w @levix/site-home`: the site opens; edit `sites/home/src/pages/HomePage.vue` and `packages/ui/src/components/PageContainer.vue` and see both changes without a restart.
6. `npm run check`: passes.
7. Seed the three mistakes, one at a time, and run `npm run check` each time: a wrong type in a page, `import '../../anycontext/src/routes'` in a home page file, and `expect(1).toBe(2)` in a test. Each fails with the file named. Revert them.

import boundaries from 'eslint-plugin-boundaries'
import pluginVue from 'eslint-plugin-vue'
import globals from 'globals'
import tseslint from 'typescript-eslint'

// Public entry points of a package, relative to its folder (the `exports` of its package.json).
const PACKAGE_ENTRY_POINTS = ['src/index.ts', 'src/styles.css', 'src/theme/theme-init.js']

export default tseslint.config(
  { ignores: ['**/dist/**', '**/node_modules/**', '**/.vite-ssg-temp/**', 'coverage/**'] },
  tseslint.configs.recommended,
  pluginVue.configs['flat/recommended'],
  {
    files: ['**/*.vue'],
    languageOptions: { parserOptions: { parser: tseslint.parser } },
  },
  {
    files: ['**/*.{ts,vue}'],
    languageOptions: { globals: globals.browser },
  },
  {
    files: ['scripts/**', '**/*.config.{js,ts}', 'tooling/**'],
    languageOptions: { globals: globals.node },
  },
  {
    // The module boundaries of ADR-0001: a site imports packages only through their entry
    // points, a package imports other packages the same way, and nothing imports a site.
    files: ['sites/**/*.{ts,vue}', 'packages/**/*.{ts,vue}'],
    plugins: { boundaries },
    settings: {
      'import/resolver': {
        typescript: { project: ['sites/*/tsconfig.json', 'packages/*/tsconfig.json'], noWarnOnMultipleProjects: true },
      },
      'boundaries/elements': [
        { type: 'site', pattern: 'sites/*', capture: ['name'] },
        { type: 'package', pattern: 'packages/*', capture: ['name'] },
        { type: 'tooling', pattern: 'tooling' },
      ],
    },
    rules: {
      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          policies: [
            { allow: { to: { module: { origin: 'external' } } } },
            { allow: { dependency: { relationship: { to: 'internal' } } } },
            {
              from: { element: { types: { anyOf: ['site', 'package'] } } },
              allow: { to: { element: { type: 'package', fileInternalPath: PACKAGE_ENTRY_POINTS } } },
            },
            {
              from: { element: { type: 'site' } },
              allow: { to: { element: { type: 'tooling' } } },
            },
          ],
        },
      ],
    },
  },
)

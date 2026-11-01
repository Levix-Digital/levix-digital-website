// Replaced by the year of the build in the shared Vite configuration (tooling/vite-site.ts).
declare const __BUILD_YEAR__: number

/**
 * The year the pages were prerendered. The footer shows it until it has mounted, so the hydrated
 * markup matches the prerendered one, and then shows the visitor's current year.
 */
export const BUILD_YEAR: number = typeof __BUILD_YEAR__ === 'number' ? __BUILD_YEAR__ : new Date().getFullYear()

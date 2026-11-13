import type { PanelRelease } from '../release-signup/types'

// Set by the `releaseInfo` plugin of the shared Vite configuration while a product site is built (FEAT-016);
// null on the dev server, in tests and when the release could not be read.
declare const __LEVIX_RELEASE__: PanelRelease | null

/** The latest release of the site's product, read while the site was built; null when there is none. */
export const BUILD_RELEASE: PanelRelease | null = typeof __LEVIX_RELEASE__ === 'object' ? __LEVIX_RELEASE__ : null

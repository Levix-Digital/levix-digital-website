import type { Product } from '../types'

/** Sources: Gedo README ("Gedo is a library only today ... There is no gdo command") and docs/product/VISION.md. */
export const gedo: Product = {
  id: 'gedo',
  name: 'Gedo',
  line: 'development',
  statement:
    'Git, supercharged for teams and coding agents: it spots conflicts while the code is still being written, long before the merge, and merges by meaning instead of by line.',
  status: 'in-development',
  site: 'https://gedo.levix.digital',
  // Archives from Gedo's release workflow (Gedo FEAT-120, v0.4.0), the same names in every release; each holds the
  // gdo and gedo commands. No macOS archive until Gedo FEAT-124.
  releases: {
    repository: 'Levix-Digital/gedo-releases',
    downloads: { windows: 'gedo-windows-x86_64.zip', linux: 'gedo-linux-x86_64.tar.gz' },
  },
}

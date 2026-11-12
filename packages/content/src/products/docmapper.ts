import type { Product } from '../types'

/** Sources: DocMapper README ("There are no installers yet (they come with version 1.0)") and docs/product/VISION.md. */
export const docmapper: Product = {
  id: 'docmapper',
  name: 'DocMapper',
  line: 'documents',
  statement:
    'Map the fields of a sample PDF once, and DocMapper copies them from every similar document into your own documents and data files.',
  status: 'in-development',
}

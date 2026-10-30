import { ESLint } from 'eslint'
import { describe, expect, it } from 'vitest'

// Guards the module boundary rules of eslint.config.js (ADR-0001) against silent weakening.
const eslint = new ESLint({ cwd: new URL('..', import.meta.url).pathname })

async function boundaryErrors(filePath: string, code: string): Promise<string[]> {
  const [result] = await eslint.lintText(code, { filePath })
  return (result?.messages ?? [])
    .filter((message) => message.ruleId === 'boundaries/dependencies')
    .map((message) => message.message)
}

describe('module boundaries', () => {
  it('lets a site import packages through their entry points', async () => {
    const code = "import { PageContainer } from '@levix/ui'\nexport const used = PageContainer\n"

    expect(await boundaryErrors('sites/home/src/sample.ts', code)).toEqual([])
  })

  it('forbids a site importing another site', async () => {
    const code = "import { routes } from '../../anycontext/src/routes'\nexport const used = routes\n"

    expect(await boundaryErrors('sites/home/src/sample.ts', code)).toHaveLength(1)
  })

  it('forbids a package importing a site', async () => {
    const code = "import { routes } from '../../../sites/home/src/routes'\nexport const used = routes\n"

    expect(await boundaryErrors('packages/ui/src/sample.ts', code)).toHaveLength(1)
  })

  it('forbids a site importing a file inside a package', async () => {
    const code =
      "import PageContainer from '../../../packages/ui/src/components/PageContainer.vue'\nexport const used = PageContainer\n"

    expect(await boundaryErrors('sites/home/src/sample.ts', code)).toHaveLength(1)
  })
})

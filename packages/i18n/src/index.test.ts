import { describe, expect, it } from 'vitest'
import { SOURCE_LANGUAGE, layoutStrings } from './index'

describe('@levix/i18n', () => {
  it('uses English as the source language', () => {
    expect(SOURCE_LANGUAGE).toBe('en')
  })

  it('has the text of the shared layout, none of it empty', () => {
    expect(Object.keys(layoutStrings).sort()).toEqual(
      [
        'layout.by',
        'layout.contact',
        'layout.menu',
        'layout.nav',
        'layout.products',
        'layout.skip',
        'theme.dark',
        'theme.legend',
        'theme.light',
        'theme.system',
      ].sort(),
    )
    for (const text of Object.values(layoutStrings)) expect(text.trim()).not.toBe('')
  })
})

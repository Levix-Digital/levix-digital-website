import { describe, expect, it } from 'vitest'
import { SOURCE_LANGUAGE } from './index'

describe('@levix/i18n', () => {
  it('uses English as the source language', () => {
    expect(SOURCE_LANGUAGE).toBe('en')
  })
})

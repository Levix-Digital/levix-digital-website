import { describe, expect, it } from 'vitest'
import { company } from './index'

describe('@levix/content', () => {
  it('exposes the company facts', () => {
    expect(company.name).toBe('Levix Digital Inc.')
    expect(company.email).toBe('contact@levix.digital')
  })
})

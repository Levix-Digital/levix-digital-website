import { describe, expect, it } from 'vitest'
import { windowsCommandLine } from './run.mjs'

describe('windowsCommandLine', () => {
  it('keeps arguments with spaces and single quotes whole', () => {
    expect(windowsCommandLine('gcloud', ['--display-name=GitHub Actions', "--attribute-condition=assertion.repository_id=='1'"]))
      .toBe(`gcloud "--display-name=GitHub Actions" "--attribute-condition=assertion.repository_id=='1'"`)
  })

  it('refuses arguments cmd.exe would change', () => {
    expect(() => windowsCommandLine('gcloud', ['a"b'])).toThrow('cannot be passed')
    expect(() => windowsCommandLine('gcloud', ['%PATH%'])).toThrow('cannot be passed')
  })
})

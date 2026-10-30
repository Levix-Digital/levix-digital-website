import { describe, expect, it } from 'vitest'
import { FIREBASE_CLI, runCommand, windowsCommandLine } from './run.mjs'

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

describe('runCommand', () => {
  it('runs the pinned Firebase CLI without a shell', async () => {
    const result = await runCommand(FIREBASE_CLI, ['--version'])
    expect(result.code).toBe(0)
    expect(result.stdout.trim()).toMatch(/^\d+\.\d+\.\d+$/)
  })
})

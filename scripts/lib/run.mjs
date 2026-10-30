// Runs external commands. Scripts receive the runner as a parameter, so tests can replace it.
import { spawn } from 'node:child_process'

/**
 * @typedef {{ code: number, stdout: string, stderr: string }} CommandResult
 * @typedef {(command: string, args: string[], options?: { stream?: boolean }) => Promise<CommandResult>} Runner
 */

/** @type {Runner} */
export function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    // Windows starts npm-installed tools through their .cmd shims, which need a shell.
    const child = spawn(command, args, { shell: process.platform === 'win32' })
    let stdout = ''
    let stderr = ''
    child.stdout.on('data', (chunk) => {
      stdout += chunk
      if (options.stream) process.stdout.write(chunk)
    })
    child.stderr.on('data', (chunk) => {
      stderr += chunk
      if (options.stream) process.stderr.write(chunk)
    })
    child.on('error', reject)
    child.on('close', (code) => resolve({ code: code ?? 1, stdout, stderr }))
  })
}

/** The Firebase CLI pinned in package.json. */
export const FIREBASE_CLI = 'node_modules/.bin/firebase'

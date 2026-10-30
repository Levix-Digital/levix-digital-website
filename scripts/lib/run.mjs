// Runs external commands. Scripts receive the runner as a parameter, so tests can replace it.
import { spawn } from 'node:child_process'

/**
 * @typedef {{ code: number, stdout: string, stderr: string }} CommandResult
 * @typedef {(command: string, args: string[], options?: { stream?: boolean }) => Promise<CommandResult>} Runner
 */

/** @type {Runner} */
export function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    // Windows starts gcloud and npm-installed tools through .cmd shims, which need a shell; the
    // shell gets one quoted command line so arguments with spaces or quotes stay whole.
    const child = process.platform === 'win32'
      ? spawn(windowsCommandLine(command, args), { shell: true })
      : spawn(command, args)
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

/**
 * Quotes every argument for cmd.exe. Arguments with characters cmd.exe expands or ends quotes on
 * are refused rather than escaped, since none of the scripts' arguments needs them.
 * @param {string} command
 * @param {string[]} args
 */
export function windowsCommandLine(command, args) {
  const unsafe = args.find((arg) => /["%\r\n]/.test(arg))
  if (unsafe !== undefined) throw new Error(`argument cannot be passed through cmd.exe: ${unsafe}`)
  return [command, ...args.map((arg) => `"${arg}"`)].join(' ')
}

/** The Firebase CLI pinned in package.json. */
export const FIREBASE_CLI = 'node_modules/.bin/firebase'

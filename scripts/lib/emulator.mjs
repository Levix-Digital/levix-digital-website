// Finds where the hosting emulator serves each target. Used by scripts that run inside
// `firebase emulators:exec --only hosting`.
const HUB = process.env.FIREBASE_EMULATOR_HUB ?? '127.0.0.1:4400'

/**
 * The base address of each target, in firebase.json order: the emulator serves the first target
 * on its port and the others on its reserved ports.
 * @param {string[]} targets target names in firebase.json order
 * @returns {Promise<Map<string, string>>}
 */
export async function emulatorBases(targets) {
  const hub = await (await fetch(`http://${HUB}/emulators`)).json()
  const ports = [hub.hosting.port, ...(hub.hosting.reservedPorts ?? [])]
  return new Map(targets.map((name, index) => [name, `http://${hub.hosting.host}:${ports[index]}`]))
}

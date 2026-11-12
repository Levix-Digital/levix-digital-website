/**
 * The geometry of the product ring: where each logo sits and how far the ring turns to bring one
 * to the front. Pure functions, so the motion can be tested without a browser.
 */

const TAU = Math.PI * 2

/** The angle of item `index` on a ring of `count` items; item 0 starts at the front (angle 0). */
export function itemAngle(index: number, count: number): number {
  if (count <= 0) throw new RangeError('A ring needs at least one item')
  return (index / count) * TAU
}

/** Brings an angle into (-PI, PI]. */
export function normalizeAngle(angle: number): number {
  const wrapped = ((angle % TAU) + TAU) % TAU
  return wrapped > Math.PI ? wrapped - TAU : wrapped
}

/**
 * The ring rotation that puts item `index` at the front, reached from `current` by the shortest
 * turn. The ring turns by `rotation`, so the item is at the front when `rotation + itemAngle = 0`.
 */
export function rotationToFront(index: number, count: number, current: number): number {
  const target = -itemAngle(index, count)
  return current + normalizeAngle(target - current)
}

/** The item closest to the front for a given ring rotation. */
export function frontIndex(rotation: number, count: number): number {
  const step = TAU / count
  const index = Math.round(-rotation / step) % count
  return (index + count) % count
}

/** A position on the ring, in the ring's own space: x to the right, z towards the viewer. */
export function ringPosition(angle: number, radius: number): { x: number; z: number } {
  return { x: Math.sin(angle) * radius, z: Math.cos(angle) * radius }
}

/** Smooth start and end, for camera moves. */
export function easeInOutCubic(t: number): number {
  const clamped = Math.min(1, Math.max(0, t))
  return clamped < 0.5 ? 4 * clamped ** 3 : 1 - (-2 * clamped + 2) ** 3 / 2
}

/** Fast start, soft landing, for the door and the bolts. */
export function easeOutExpo(t: number): number {
  const clamped = Math.min(1, Math.max(0, t))
  return clamped === 1 ? 1 : 1 - 2 ** (-10 * clamped)
}

/** Linear interpolation. */
export function lerp(from: number, to: number, t: number): number {
  return from + (to - from) * t
}

/** The progress (0 to 1) of a step that runs from `start` to `end` seconds, at time `time`. */
export function stepProgress(time: number, start: number, end: number): number {
  if (end <= start) return time >= end ? 1 : 0
  return Math.min(1, Math.max(0, (time - start) / (end - start)))
}

import { describe, expect, it } from 'vitest'
import { easeInOutCubic, frontIndex, itemAngle, normalizeAngle, ringPosition, rotationToFront, stepProgress } from './orbit'

const QUARTER = Math.PI / 2

describe('the product ring', () => {
  it('spreads the items evenly, the first one at the front', () => {
    expect([0, 1, 2, 3].map((i) => itemAngle(i, 4))).toEqual([0, QUARTER, Math.PI, 3 * QUARTER])
    expect(ringPosition(0, 3).z).toBeCloseTo(3)
    expect(ringPosition(QUARTER, 3).x).toBeCloseTo(3)
  })

  it('refuses an empty ring', () => {
    expect(() => itemAngle(0, 0)).toThrow(RangeError)
  })

  it('keeps angles in (-PI, PI]', () => {
    expect(normalizeAngle(3 * Math.PI)).toBeCloseTo(Math.PI)
    expect(normalizeAngle(-3 * QUARTER)).toBeCloseTo(QUARTER)
    expect(normalizeAngle(3 * QUARTER)).toBeCloseTo(-QUARTER)
  })

  it('brings an item to the front by the shortest turn', () => {
    // From rest, the last of four items is a quarter turn away, not three quarters.
    expect(rotationToFront(3, 4, 0)).toBeCloseTo(QUARTER)
    expect(rotationToFront(1, 4, 0)).toBeCloseTo(-QUARTER)
    // After several turns the ring keeps its winding instead of spinning back.
    const wound = 4 * Math.PI + 0.1
    expect(Math.abs(rotationToFront(0, 4, wound) - wound)).toBeLessThan(Math.PI)
  })

  it('knows which item is at the front for any rotation', () => {
    for (let i = 0; i < 4; i++) {
      expect(frontIndex(rotationToFront(i, 4, 0), 4)).toBe(i)
      expect(frontIndex(rotationToFront(i, 4, 7.5), 4)).toBe(i)
    }
  })
})

describe('timing', () => {
  it('eases from 0 to 1 and clamps outside the range', () => {
    expect(easeInOutCubic(-1)).toBe(0)
    expect(easeInOutCubic(0.5)).toBeCloseTo(0.5)
    expect(easeInOutCubic(2)).toBe(1)
  })

  it('measures the progress of a step of the intro', () => {
    expect(stepProgress(0, 1, 3)).toBe(0)
    expect(stepProgress(2, 1, 3)).toBeCloseTo(0.5)
    expect(stepProgress(4, 1, 3)).toBe(1)
    expect(stepProgress(1, 1, 1)).toBe(1)
  })
})

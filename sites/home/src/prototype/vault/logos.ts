/**
 * The 3D product marks of the prototype: flat shapes extruded with a bevel. They are placeholders
 * drawn from what each product does (two linked contexts, a cycle, a graph of code entities, an
 * aurora), to be replaced by the products' real marks.
 */
import * as THREE from 'three'
import type { ProductId } from '@levix/content'

const TAU = Math.PI * 2

const EXTRUDE: THREE.ExtrudeGeometryOptions = {
  depth: 0.16,
  bevelEnabled: true,
  bevelThickness: 0.05,
  bevelSize: 0.035,
  bevelSegments: 5,
  curveSegments: 64,
}

/** A full ring: an outer circle with a round hole. */
function ring(cx: number, cy: number, outer: number, inner: number): THREE.Shape {
  const shape = new THREE.Shape()
  shape.absarc(cx, cy, outer, 0, TAU, false)
  const hole = new THREE.Path()
  hole.absarc(cx, cy, inner, 0, TAU, true)
  shape.holes.push(hole)
  return shape
}

/** A band between two radii, from `start` to `end` (radians, counter-clockwise). */
function arcBand(outer: number, inner: number, start: number, end: number): THREE.Shape {
  const shape = new THREE.Shape()
  shape.absarc(0, 0, outer, start, end, false)
  shape.absarc(0, 0, inner, end, start, true)
  shape.closePath()
  return shape
}

/** A regular polygon outline with `sides` sides. */
function polygonOutline(sides: number, outer: number, inner: number, rotation = 0): THREE.Shape {
  const corner = (radius: number, i: number): [number, number] => {
    const angle = rotation + (i / sides) * TAU
    return [Math.cos(angle) * radius, Math.sin(angle) * radius]
  }
  const shape = new THREE.Shape()
  shape.moveTo(...corner(outer, 0))
  for (let i = 1; i < sides; i++) shape.lineTo(...corner(outer, i))
  shape.closePath()
  const hole = new THREE.Path()
  hole.moveTo(...corner(inner, 0))
  for (let i = sides - 1; i > 0; i--) hole.lineTo(...corner(inner, i))
  hole.closePath()
  shape.holes.push(hole)
  return shape
}

/** A bar of `width` from point a to point b. */
function bar(ax: number, ay: number, bx: number, by: number, width: number): THREE.Shape {
  const length = Math.hypot(bx - ax, by - ay)
  const nx = (-(by - ay) / length) * (width / 2)
  const ny = ((bx - ax) / length) * (width / 2)
  const shape = new THREE.Shape()
  shape.moveTo(ax + nx, ay + ny)
  shape.lineTo(bx + nx, by + ny)
  shape.lineTo(bx - nx, by - ny)
  shape.lineTo(ax - nx, ay - ny)
  shape.closePath()
  return shape
}

function disc(cx: number, cy: number, radius: number): THREE.Shape {
  const shape = new THREE.Shape()
  shape.absarc(cx, cy, radius, 0, TAU, false)
  return shape
}

/** The flat shapes of each mark, about 1.3 units across, centered on the origin. */
function shapesFor(id: ProductId): THREE.Shape[] {
  switch (id) {
    case 'anycontext':
      // Two linked rings: your material and the answer, joined.
      return [ring(-0.24, 0, 0.5, 0.36), ring(0.24, 0, 0.5, 0.36)]
    case 'devcycle': {
      // A cycle with an arrow head: from idea to release, and again.
      const start = Math.PI * 0.62
      const end = Math.PI * 2.38
      const head = new THREE.Shape()
      const tip = (radius: number, angle: number): [number, number] => [Math.cos(angle) * radius, Math.sin(angle) * radius]
      head.moveTo(...tip(0.72, end))
      head.lineTo(...tip(0.3, end))
      head.lineTo(...tip(0.51, end + 0.42))
      head.closePath()
      return [arcBand(0.6, 0.42, start, end), head]
    }
    case 'gedo': {
      // A hexagon around a small graph: code entities and their links.
      const nodes: [number, number][] = [0, 1, 2].map((i) => {
        const angle = Math.PI / 2 + (i / 3) * TAU
        return [Math.cos(angle) * 0.27, Math.sin(angle) * 0.27]
      })
      return [
        polygonOutline(6, 0.66, 0.52, Math.PI / 6),
        disc(0, 0, 0.1),
        ...nodes.map(([x, y]) => disc(x, y, 0.075)),
        ...nodes.map(([x, y]) => bar(0, 0, x, y, 0.045)),
      ]
    }
    case 'aurora':
      // Three bands of an aurora rising over the horizon.
      return [
        arcBand(0.68, 0.56, 0, Math.PI),
        arcBand(0.48, 0.36, 0, Math.PI),
        arcBand(0.28, 0.16, 0, Math.PI),
        bar(-0.72, -0.08, 0.72, -0.08, 0.1),
      ]
  }
}

/** The extruded, centered geometry of a product's mark. */
export function createLogoGeometry(id: ProductId): THREE.BufferGeometry {
  const geometry = new THREE.ExtrudeGeometry(shapesFor(id), EXTRUDE)
  geometry.center()
  geometry.computeVertexNormals()
  return geometry
}

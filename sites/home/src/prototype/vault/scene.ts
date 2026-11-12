/**
 * The 3D vault of the home prototype: a ceramic vault door unlocks and swings open, the camera
 * flies through it, and the product marks rise and float on a ring inside. A mark is chosen by
 * clicking it (or from the page's buttons); the camera then travels to it.
 *
 * Loaded only in the browser, after the first paint, when WebGL is available (capability.ts).
 * Everything the visitor reads stays in the page's HTML; the scene only shows and points.
 */
import * as THREE from 'three'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import type { ProductId } from '@levix/content'
import type { ProductHue } from './content'
import { createLogoGeometry } from './logos'
import { easeInOutCubic, easeOutExpo, frontIndex, itemAngle, lerp, ringPosition, rotationToFront, stepProgress } from './orbit'

export interface VaultSceneProduct {
  readonly id: ProductId
  readonly hue: ProductHue
}

export interface VaultSceneOptions {
  readonly canvas: HTMLCanvasElement
  readonly products: readonly VaultSceneProduct[]
  readonly dark: boolean
  readonly skipIntro: boolean
  /** A mark was clicked. */
  readonly onSelect: (index: number) => void
  /** The pointer is over a mark (its index) or over none (null). */
  readonly onHover: (index: number | null) => void
  /** The intro finished (or was skipped): the ring is ready. */
  readonly onIntroDone: () => void
  /** The scene cannot go on (the WebGL context was lost): the page shows the static view. */
  readonly onFailure: () => void
}

export interface VaultScene {
  /** Turns the ring to a product and flies the camera to it. */
  focus(index: number): void
  /** Back to the whole ring. */
  release(): void
  /** Turns the ring by one product (1 or -1) and returns the product now at the front. */
  turn(step: 1 | -1): number
  /** Tilts the camera up to the panels above the ring, or back. */
  lookUp(up: boolean): void
  skipIntro(): void
  replayIntro(): void
  setDark(dark: boolean): void
  dispose(): void
}

const HUES: Record<ProductHue, number> = {
  cyan: 0x00f0ff,
  emerald: 0x00ffa3,
  purple: 0x9b4dff,
  magenta: 0xff2d95,
}
const AURORA = [HUES.cyan, HUES.emerald, HUES.purple, HUES.magenta]

/** The centre of the product ring, inside the vault, and its radius. */
const RING_CENTER = new THREE.Vector3(0, 0, -11)
const RING_RADIUS = 3.3
const DOOR_RADIUS = 2.98
/** The chamber stays behind the wall (the wall's back face is at z = -1.2). */
const CHAMBER_RADIUS = 9.6

/** The intro timeline, in seconds. */
const INTRO = {
  approach: [0, 1.6],
  unlock: [1.2, 2.9],
  open: [2.8, 4.5],
  glow: [2.9, 3.8],
  fly: [3.5, 6.0],
  rise: [4.6, 6.6],
  end: 6.6,
} as const

const FLY_PATH = new THREE.CatmullRomCurve3([
  new THREE.Vector3(0, 0.4, 13),
  new THREE.Vector3(0, 0.2, 8.6),
  new THREE.Vector3(0, 0.25, 3.2),
  new THREE.Vector3(0, 0.45, 0.2),
  new THREE.Vector3(0, 0.6, -3.4),
])

interface Theme {
  background: number
  door: number
  doorRoughness: number
  doorMetalness: number
  metal: number
  chamber: number
  floor: number
  dust: number
  bloomStrength: number
  bloomThreshold: number
  exposure: number
  fogNear: number
  fogFar: number
}

const THEMES: Record<'dark' | 'light', Theme> = {
  dark: {
    background: 0x04060b,
    door: 0x1b2333,
    doorRoughness: 0.32,
    doorMetalness: 0.75,
    metal: 0x8d99ae,
    chamber: 0x070b14,
    floor: 0x0b1120,
    dust: 0x7fe9ff,
    bloomStrength: 0.65,
    bloomThreshold: 0.86,
    exposure: 1.0,
    fogNear: 12,
    fogFar: 40,
  },
  light: {
    background: 0xd3dae4,
    door: 0xf5f7fa,
    doorRoughness: 0.42,
    doorMetalness: 0.05,
    metal: 0x6f7b8c,
    chamber: 0xb4bfce,
    floor: 0xdce2ea,
    dust: 0x0e7490,
    bloomStrength: 0.3,
    bloomThreshold: 0.95,
    exposure: 0.85,
    fogNear: 26,
    fogFar: 80,
  },
}

interface Mark {
  group: THREE.Group
  body: THREE.Mesh<THREE.BufferGeometry, THREE.MeshPhysicalMaterial>
  pedestal: THREE.Mesh<THREE.TorusGeometry, THREE.MeshBasicMaterial>
  hit: THREE.Mesh
  light: THREE.PointLight
  hover: number
  focus: number
}

interface CameraMove {
  fromPosition: THREE.Vector3
  fromTarget: THREE.Vector3
  toPosition: THREE.Vector3
  toTarget: THREE.Vector3
  start: number
  duration: number
}

type Stage = 'intro' | 'ring' | 'focus' | 'up'

export function createVaultScene(options: VaultSceneOptions): VaultScene {
  const { canvas, products } = options
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.outputColorSpace = THREE.SRGBColorSpace

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 80)
  const pmrem = new THREE.PMREMGenerator(renderer)
  const environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  scene.environment = environment
  scene.environmentIntensity = 0.55

  const composer = new EffectComposer(renderer)
  composer.addPass(new RenderPass(scene, camera))
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.8, 0.55, 0.8)
  composer.addPass(bloom)
  composer.addPass(new OutputPass())

  // Materials shared by the door, the frame and the chamber, recolored by setDark().
  const doorMaterial = new THREE.MeshPhysicalMaterial({ clearcoat: 0.6, clearcoatRoughness: 0.2 })
  const metalMaterial = new THREE.MeshStandardMaterial({ metalness: 1, roughness: 0.24 })
  const chamberMaterial = new THREE.MeshStandardMaterial({ side: THREE.BackSide, roughness: 0.9 })
  const floorMaterial = new THREE.MeshStandardMaterial({ roughness: 0.42, metalness: 0.2 })
  const dustMaterial = new THREE.PointsMaterial({ size: 0.035, transparent: true, opacity: 0.55, depthWrite: false })
  const fog = new THREE.Fog(0x000000, 12, 40)
  scene.fog = fog

  // Lights: a soft fill, a key light on the door and a light inside the vault.
  const hemisphere = new THREE.HemisphereLight(0xdfefff, 0x0b0f19, 0.6)
  const key = new THREE.DirectionalLight(0xffffff, 1.6)
  key.position.set(4, 6, 10)
  const vaultLight = new THREE.PointLight(0x9fe8ff, 0, 30, 1.6)
  vaultLight.position.set(0, 2.5, -6)
  scene.add(hemisphere, key, vaultLight)

  // The wall, with a round opening for the door.
  const wallShape = new THREE.Shape()
  wallShape.moveTo(-24, -14)
  wallShape.lineTo(24, -14)
  wallShape.lineTo(24, 14)
  wallShape.lineTo(-24, 14)
  wallShape.closePath()
  const opening = new THREE.Path()
  opening.absarc(0, 0, DOOR_RADIUS + 0.12, 0, Math.PI * 2, true)
  wallShape.holes.push(opening)
  const wall = new THREE.Mesh(new THREE.ExtrudeGeometry(wallShape, { depth: 1.2, bevelEnabled: false, curveSegments: 96 }), doorMaterial)
  wall.position.z = -1.2
  scene.add(wall)

  const frame = new THREE.Mesh(new THREE.TorusGeometry(DOOR_RADIUS + 0.14, 0.17, 24, 128), metalMaterial)
  frame.position.z = 0.02
  scene.add(frame)

  // The aurora seam around the frame, in four arcs that light up one after the other.
  const seamArcs = AURORA.map((color, i) => {
    const arc = new THREE.Mesh(
      new THREE.TorusGeometry(DOOR_RADIUS + 0.42, 0.028, 8, 64, Math.PI / 2 - 0.08),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.15 }),
    )
    arc.rotation.z = Math.PI / 2 + i * (Math.PI / 2) + 0.04
    arc.position.z = 0.05
    scene.add(arc)
    return arc
  })

  // The door turns on a hinge at its left edge.
  const hinge = new THREE.Group()
  hinge.position.set(-DOOR_RADIUS, 0, -0.35)
  scene.add(hinge)
  const door = new THREE.Group()
  door.position.x = DOOR_RADIUS
  hinge.add(door)

  const slab = new THREE.Mesh(new THREE.CylinderGeometry(DOOR_RADIUS, DOOR_RADIUS, 0.62, 128), doorMaterial)
  slab.rotation.x = Math.PI / 2
  door.add(slab)
  for (const [radius, tube] of [
    [2.6, 0.06],
    [1.78, 0.05],
  ] as const) {
    const ridge = new THREE.Mesh(new THREE.TorusGeometry(radius, tube, 16, 128), metalMaterial)
    ridge.position.z = 0.32
    door.add(ridge)
  }

  // Lock pins on the face, which slide towards the centre when the door unlocks.
  const pins = Array.from({ length: 12 }, (_, i) => {
    const pin = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.12, 0.12), metalMaterial)
    const angle = (i / 12) * Math.PI * 2
    pin.rotation.z = angle
    pin.position.set(Math.cos(angle) * 2.28, Math.sin(angle) * 2.28, 0.36)
    door.add(pin)
    return { pin, angle }
  })

  // The inner aurora ring of the door face, and the hub with its wheel.
  const faceSeam = new THREE.Mesh(
    new THREE.TorusGeometry(1.98, 0.022, 8, 160),
    new THREE.MeshBasicMaterial({ color: HUES.cyan, transparent: true, opacity: 0.2 }),
  )
  faceSeam.position.z = 0.33
  door.add(faceSeam)
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.78, 0.86, 0.3, 64), metalMaterial)
  hub.rotation.x = Math.PI / 2
  hub.position.z = 0.42
  door.add(hub)
  const wheel = new THREE.Group()
  wheel.position.z = 0.62
  door.add(wheel)
  for (let i = 0; i < 3; i++) {
    const spoke = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.15, 0.14), metalMaterial)
    spoke.rotation.z = (i / 3) * Math.PI
    wheel.add(spoke)
  }
  const rim = new THREE.Mesh(new THREE.TorusGeometry(1.15, 0.06, 16, 96), metalMaterial)
  wheel.add(rim)
  const coreMaterial = new THREE.MeshBasicMaterial({ color: HUES.cyan })
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.17, 32, 16), coreMaterial)
  core.position.z = 0.1
  wheel.add(core)

  // The light that floods out when the door opens.
  const glow = new THREE.Mesh(
    new THREE.PlaneGeometry(9, 9),
    new THREE.MeshBasicMaterial({
      map: radialTexture(),
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      fog: false,
    }),
  )
  glow.position.z = -1.6
  scene.add(glow)

  // The chamber: a round room with light strips, a floor and two rings of light under the marks.
  const chamber = new THREE.Mesh(new THREE.CylinderGeometry(CHAMBER_RADIUS, CHAMBER_RADIUS, 14, 64, 1, true), chamberMaterial)
  chamber.position.set(RING_CENTER.x, 3, RING_CENTER.z)
  scene.add(chamber)
  for (let i = 0; i < 28; i++) {
    const angle = (i / 28) * Math.PI * 2
    const strip = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 5 + (i % 3), 0.05),
      new THREE.MeshBasicMaterial({ color: AURORA[i % 4] ?? HUES.cyan, transparent: true, opacity: 0.35 }),
    )
    const { x, z } = ringPosition(angle, CHAMBER_RADIUS - 0.3)
    strip.position.set(RING_CENTER.x + x, 1.4, RING_CENTER.z + z)
    scene.add(strip)
  }
  const floor = new THREE.Mesh(new THREE.CircleGeometry(CHAMBER_RADIUS, 96), floorMaterial)
  floor.rotation.x = -Math.PI / 2
  floor.position.set(RING_CENTER.x, -1.6, RING_CENTER.z)
  scene.add(floor)
  const floorRings = [RING_RADIUS + 0.9, RING_RADIUS - 1.3].map((radius, i) => {
    const floorRing = new THREE.Mesh(
      new THREE.TorusGeometry(radius, 0.02, 8, 200),
      new THREE.MeshBasicMaterial({ color: i === 0 ? HUES.cyan : HUES.purple, transparent: true, opacity: 0 }),
    )
    floorRing.rotation.x = Math.PI / 2
    floorRing.position.set(RING_CENTER.x, -1.58, RING_CENTER.z)
    scene.add(floorRing)
    return floorRing
  })

  // The product marks on their ring.
  const ring = new THREE.Group()
  ring.position.copy(RING_CENTER)
  scene.add(ring)
  const marks: Mark[] = products.map((product, index) => {
    const color = HUES[product.hue]
    const group = new THREE.Group()
    const { x, z } = ringPosition(itemAngle(index, products.length), RING_RADIUS)
    group.position.set(x, 0, z)
    group.rotation.y = itemAngle(index, products.length)
    const body = new THREE.Mesh(
      createLogoGeometry(product.id),
      new THREE.MeshPhysicalMaterial({
        color,
        metalness: 0.7,
        roughness: 0.2,
        clearcoat: 1,
        clearcoatRoughness: 0.08,
        iridescence: 0.7,
        iridescenceIOR: 1.6,
        emissive: color,
        emissiveIntensity: 0.08,
      }),
    )
    group.add(body)
    const pedestal = new THREE.Mesh(
      new THREE.TorusGeometry(0.62, 0.018, 8, 96),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.7 }),
    )
    pedestal.rotation.x = Math.PI / 2
    pedestal.position.y = -1.05
    group.add(pedestal)
    const light = new THREE.PointLight(color, 0, 4.5, 1.8)
    light.position.set(0, -0.5, 0.6)
    group.add(light)
    const hit = new THREE.Mesh(
      new THREE.SphereGeometry(0.9, 12, 8),
      new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
    )
    hit.userData.index = index
    group.add(hit)
    ring.add(group)
    return { group, body, pedestal, hit, light, hover: 0, focus: 0 }
  })

  // Dust in the air, drifting slowly.
  const dustCount = 900
  const dustPositions = new Float32Array(dustCount * 3)
  for (let i = 0; i < dustCount; i++) {
    dustPositions[i * 3] = (Math.random() - 0.5) * 24
    dustPositions[i * 3 + 1] = Math.random() * 9 - 3
    dustPositions[i * 3 + 2] = Math.random() * 34 - 20
  }
  const dustGeometry = new THREE.BufferGeometry()
  dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3))
  const dust = new THREE.Points(dustGeometry, dustMaterial)
  scene.add(dust)

  // State.
  let stage: Stage = 'intro'
  let introTime = options.skipIntro ? INTRO.end : 0
  let introReported = false
  let ringRotation = 0
  let ringFrom = 0
  let ringTo = 0
  let ringTurnStart = -1
  let focused: number | null = null
  let hovered: number | null = null
  let clock = 0
  let cameraMove: CameraMove | null = null
  const cameraTarget = new THREE.Vector3()
  const pointer = new THREE.Vector2(0, 0)
  const pointerSmooth = new THREE.Vector2(0, 0)
  let pointerInside = false
  const raycaster = new THREE.Raycaster()
  let disposed = false
  let running = false
  let glowScale = 1

  setDark(options.dark)

  function setDark(dark: boolean): void {
    const theme = THEMES[dark ? 'dark' : 'light']
    scene.background = new THREE.Color(theme.background)
    fog.color.setHex(theme.background)
    fog.near = theme.fogNear
    fog.far = theme.fogFar
    doorMaterial.color.setHex(theme.door)
    doorMaterial.roughness = theme.doorRoughness
    doorMaterial.metalness = theme.doorMetalness
    metalMaterial.color.setHex(theme.metal)
    chamberMaterial.color.setHex(theme.chamber)
    floorMaterial.color.setHex(theme.floor)
    dustMaterial.color.setHex(theme.dust)
    dustMaterial.blending = dark ? THREE.AdditiveBlending : THREE.NormalBlending
    dustMaterial.needsUpdate = true
    hemisphere.intensity = dark ? 0.45 : 0.7
    key.intensity = dark ? 1.6 : 2.2
    bloom.enabled = dark
    bloom.strength = theme.bloomStrength
    bloom.threshold = theme.bloomThreshold
    renderer.toneMappingExposure = theme.exposure
    glowScale = dark ? 1 : 0.45
    scene.environmentIntensity = dark ? 0.55 : 0.35
  }

  /** The camera pose that shows the whole ring, adapted to narrow screens. */
  function ringPose(): { position: THREE.Vector3; target: THREE.Vector3 } {
    const narrow = camera.aspect < 0.9
    return {
      position: new THREE.Vector3(0, narrow ? 1.1 : 0.6, narrow ? -1.6 : -3.4),
      target: RING_CENTER.clone(),
    }
  }

  /** The camera pose close to the mark at the front, leaving room for the product panel. */
  function focusPose(): { position: THREE.Vector3; target: THREE.Vector3 } {
    const front = RING_CENTER.z + RING_RADIUS
    if (camera.aspect < 0.9) {
      // Narrow screens: the panel is a sheet at the bottom, so the mark sits high in the frame.
      return { position: new THREE.Vector3(0, 0.2, front + 3.3), target: new THREE.Vector3(0, -1.5, front) }
    }
    return { position: new THREE.Vector3(1.0, 0.2, front + 2.5), target: new THREE.Vector3(1.0, 0.05, front) }
  }

  function upPose(): { position: THREE.Vector3; target: THREE.Vector3 } {
    const pose = ringPose()
    return { position: pose.position.add(new THREE.Vector3(0, 0.4, 0.8)), target: new THREE.Vector3(0, 3.2, RING_CENTER.z) }
  }

  function moveCamera(pose: { position: THREE.Vector3; target: THREE.Vector3 }, duration = 1.3): void {
    cameraMove = {
      fromPosition: camera.position.clone(),
      fromTarget: cameraTarget.clone(),
      toPosition: pose.position,
      toTarget: pose.target,
      start: clock,
      duration,
    }
  }

  function turnRingTo(rotation: number): void {
    ringFrom = ringRotation
    ringTo = rotation
    ringTurnStart = clock
  }

  /** Places everything for a moment of the intro; the intro is a pure function of its time. */
  function applyIntro(t: number): void {
    const unlock = easeInOutCubic(stepProgress(t, ...INTRO.unlock))
    const open = easeInOutCubic(stepProgress(t, ...INTRO.open))
    const glowIn = stepProgress(t, ...INTRO.glow)
    const fly = easeInOutCubic(stepProgress(t, ...INTRO.fly))
    const approach = easeOutExpo(stepProgress(t, ...INTRO.approach))

    wheel.rotation.z = -unlock * Math.PI * 0.75
    for (const { pin, angle } of pins) {
      const radius = lerp(2.28, 1.98, unlock)
      pin.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0.36)
    }
    seamArcs.forEach((arc, i) => {
      arc.material.opacity = lerp(0.15, 1, stepProgress(t, INTRO.unlock[0] + i * 0.3, INTRO.unlock[0] + i * 0.3 + 0.4))
    })
    faceSeam.material.opacity = lerp(0.2, 1, unlock)
    coreMaterial.color.setHex(unlock > 0.98 ? HUES.emerald : HUES.cyan)
    hinge.rotation.y = -open * 1.8
    glow.material.opacity = glowIn * (1 - fly * 0.85) * glowScale
    vaultLight.intensity = glowIn * lerp(40, 10, fly)

    // The camera: a short push towards the door, then the flight through it.
    const pathT = fly > 0 ? 0.25 + fly * 0.75 : approach * 0.25
    camera.position.copy(FLY_PATH.getPoint(pathT))
    cameraTarget.set(0, 0, lerp(0, RING_CENTER.z, fly))

    // The marks rise one after the other.
    marks.forEach((mark, i) => {
      const rise = easeOutExpo(stepProgress(t, INTRO.rise[0] + i * 0.18, INTRO.rise[0] + i * 0.18 + 1.1))
      mark.group.scale.setScalar(Math.max(0.001, rise))
      mark.group.position.y = lerp(-1.4, 0, rise)
      mark.light.intensity = rise * 2.5
      mark.pedestal.material.opacity = rise * 0.7
    })
    for (const floorRing of floorRings) floorRing.material.opacity = stepProgress(t, INTRO.rise[0], INTRO.end) * 0.8
  }

  function resize(): void {
    const width = canvas.clientWidth
    const height = canvas.clientHeight
    if (width === 0 || height === 0) return
    camera.aspect = width / height
    camera.fov = camera.aspect < 0.9 ? 62 : 45
    camera.updateProjectionMatrix()
    renderer.setSize(width, height, false)
    composer.setSize(width, height)
    bloom.resolution.set(width, height)
    if (stage === 'ring') moveCamera(ringPose(), 0.6)
    if (stage === 'focus') moveCamera(focusPose(), 0.6)
  }

  let last = performance.now()
  function tick(now: number): void {
    const dt = Math.min(0.05, (now - last) / 1000)
    last = now
    clock += dt

    if (stage === 'intro') {
      introTime = Math.min(INTRO.end, introTime + dt)
      applyIntro(introTime)
      if (introTime >= INTRO.end && !introReported) {
        introReported = true
        stage = 'ring'
        cameraMove = null
        const pose = ringPose()
        if (!camera.position.equals(pose.position)) moveCamera(pose, 0.8)
        options.onIntroDone()
      }
    } else if (cameraMove) {
      const t = easeInOutCubic((clock - cameraMove.start) / cameraMove.duration)
      camera.position.lerpVectors(cameraMove.fromPosition, cameraMove.toPosition, t)
      cameraTarget.lerpVectors(cameraMove.fromTarget, cameraMove.toTarget, t)
      if (t >= 1) cameraMove = null
    }

    // The ring: turned on request, drifting slowly while nobody points at it.
    if (ringTurnStart >= 0) {
      const t = easeInOutCubic((clock - ringTurnStart) / 0.9)
      ringRotation = lerp(ringFrom, ringTo, t)
      if (t >= 1) ringTurnStart = -1
    } else if (stage === 'ring' && hovered === null && !pointerInside) {
      ringRotation += dt * 0.06
    }
    ring.rotation.y = ringRotation

    marks.forEach((mark, i) => {
      const isFocused = focused === i
      mark.hover = lerp(mark.hover, hovered === i ? 1 : 0, Math.min(1, dt * 8))
      mark.focus = lerp(mark.focus, isFocused ? 1 : 0, Math.min(1, dt * 5))
      if (stage !== 'intro') {
        mark.group.position.y = Math.sin(clock * 1.1 + i * 1.7) * 0.08
        mark.group.scale.setScalar(1 + mark.hover * 0.12 + mark.focus * 0.08)
      }
      // The focused mark turns slowly to show its depth; the others face outwards.
      mark.body.rotation.y = isFocused ? Math.sin(clock * 0.8) * 0.5 : Math.sin(clock * 0.6 + i) * 0.12
      mark.body.material.emissiveIntensity = 0.08 + mark.hover * 0.3 + mark.focus * 0.15
      const dimmed = focused !== null && !isFocused ? 0.35 : 1
      mark.pedestal.material.opacity = (stage === 'intro' ? mark.pedestal.material.opacity : 0.7) * dimmed
    })

    // Dust drifts upwards and wraps around.
    const positions = dustGeometry.attributes.position as THREE.BufferAttribute
    for (let i = 0; i < dustCount; i++) {
      let y = positions.getY(i) + dt * 0.08
      if (y > 6) y = -3
      positions.setY(i, y)
    }
    positions.needsUpdate = true

    // A small parallax that follows the pointer, for depth.
    pointerSmooth.lerp(pointer, Math.min(1, dt * 3))
    const parallax = stage === 'intro' ? 0.15 : 0.35
    camera.position.x += pointerSmooth.x * parallax
    camera.position.y += pointerSmooth.y * parallax * 0.5
    camera.lookAt(cameraTarget)
    composer.render(dt)
    camera.position.x -= pointerSmooth.x * parallax
    camera.position.y -= pointerSmooth.y * parallax * 0.5
  }

  function start(): void {
    if (running || disposed) return
    running = true
    last = performance.now()
    renderer.setAnimationLoop(tick)
  }

  function stop(): void {
    running = false
    renderer.setAnimationLoop(null)
  }

  // Interaction: hover and click on the marks.
  function markAt(event: PointerEvent): number | null {
    if (stage === 'intro') return null
    const rect = canvas.getBoundingClientRect()
    const ndc = new THREE.Vector2(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1)
    raycaster.setFromCamera(ndc, camera)
    const hit = raycaster.intersectObjects(marks.map((mark) => mark.hit), false)[0]
    return hit ? (hit.object.userData.index as number) : null
  }

  function onPointerMove(event: PointerEvent): void {
    const rect = canvas.getBoundingClientRect()
    pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1)
    pointerInside = true
    if (event.pointerType !== 'mouse') return
    const index = markAt(event)
    if (index !== hovered) {
      hovered = index
      canvas.style.cursor = index === null ? '' : 'pointer'
      options.onHover(index)
    }
  }

  function onPointerLeave(): void {
    pointerInside = false
    pointer.set(0, 0)
    if (hovered !== null) {
      hovered = null
      canvas.style.cursor = ''
      options.onHover(null)
    }
  }

  function onClick(event: PointerEvent): void {
    const index = markAt(event)
    if (index !== null) options.onSelect(index)
  }

  function onContextLost(event: Event): void {
    event.preventDefault()
    stop()
    options.onFailure()
  }

  canvas.addEventListener('pointermove', onPointerMove)
  canvas.addEventListener('pointerleave', onPointerLeave)
  canvas.addEventListener('click', onClick as EventListener)
  canvas.addEventListener('webglcontextlost', onContextLost)

  // Pause when the scene is off screen or the tab is hidden.
  const resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(canvas)
  let onScreen = true
  const intersection = new IntersectionObserver(([entry]) => {
    onScreen = entry?.isIntersecting ?? true
    if (onScreen && !document.hidden) start()
    else stop()
  })
  intersection.observe(canvas)
  function onVisibility(): void {
    if (document.hidden) stop()
    else if (onScreen) start()
  }
  document.addEventListener('visibilitychange', onVisibility)

  resize()
  applyIntro(introTime)
  start()

  return {
    focus(index) {
      if (stage === 'intro') skipIntroNow()
      focused = index
      stage = 'focus'
      turnRingTo(rotationToFront(index, products.length, ringRotation))
      moveCamera(focusPose())
    },
    release() {
      focused = null
      if (stage === 'intro') return
      stage = 'ring'
      moveCamera(ringPose())
    },
    turn(step) {
      if (stage === 'intro') skipIntroNow()
      const current = ringTurnStart >= 0 ? ringTo : ringRotation
      const next = (frontIndex(current, products.length) + step + products.length) % products.length
      turnRingTo(rotationToFront(next, products.length, current))
      if (focused !== null) focused = next
      return next
    },
    lookUp(up) {
      if (stage === 'intro') skipIntroNow()
      focused = null
      stage = up ? 'up' : 'ring'
      moveCamera(up ? upPose() : ringPose())
    },
    skipIntro: skipIntroNow,
    replayIntro() {
      focused = null
      introTime = 0
      introReported = false
      cameraMove = null
      stage = 'intro'
    },
    setDark,
    dispose() {
      disposed = true
      stop()
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerleave', onPointerLeave)
      canvas.removeEventListener('click', onClick as EventListener)
      canvas.removeEventListener('webglcontextlost', onContextLost)
      document.removeEventListener('visibilitychange', onVisibility)
      resizeObserver.disconnect()
      intersection.disconnect()
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Points) {
          object.geometry.dispose()
          const materials = Array.isArray(object.material) ? object.material : [object.material]
          for (const material of materials) {
            ;(material as THREE.MeshBasicMaterial).map?.dispose()
            material.dispose()
          }
        }
      })
      environment.dispose()
      pmrem.dispose()
      composer.dispose()
      renderer.dispose()
    },
  }

  function skipIntroNow(): void {
    if (stage !== 'intro') return
    introTime = INTRO.end
  }
}

/** A soft round light, drawn once on a small canvas. */
function radialTexture(): THREE.CanvasTexture {
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const context = canvas.getContext('2d')
  if (context) {
    const gradient = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
    gradient.addColorStop(0, 'rgba(220, 255, 255, 1)')
    gradient.addColorStop(0.25, 'rgba(0, 240, 255, 0.55)')
    gradient.addColorStop(0.6, 'rgba(121, 40, 202, 0.18)')
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
    context.fillStyle = gradient
    context.fillRect(0, 0, size, size)
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

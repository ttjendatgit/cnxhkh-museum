import { rooms, buildEndWall, type RoomConfig, type WallSpec } from './Museum'
import { WALL_THICKNESS } from './constants'

/**
 * Static collision data for the museum, built once from the exact same
 * layout math Museum.tsx renders from (see buildEndWall/rooms), plus a
 * hand-placed set of colliders for each room's freestanding exhibits
 * (pedestals, vitrines, kiosks, barriers, artifact-label stands, columns).
 * Everything here is 2D (X/Z only) — the player is treated as a vertical
 * circle, which is the standard, cheap simplification for FPS-style
 * walk-around collision when there's no need to duck, jump, or step over
 * anything.
 */

export interface BoxCollider {
  type: 'box'
  minX: number
  maxX: number
  minZ: number
  maxZ: number
}

export interface CircleCollider {
  type: 'circle'
  x: number
  z: number
  radius: number
}

export type Collider = BoxCollider | CircleCollider

function box(position: [number, number, number], sizeX: number, sizeZ: number): BoxCollider {
  return {
    type: 'box',
    minX: position[0] - sizeX / 2,
    maxX: position[0] + sizeX / 2,
    minZ: position[2] - sizeZ / 2,
    maxZ: position[2] + sizeZ / 2,
  }
}

function circle(x: number, z: number, radius: number): CircleCollider {
  return { type: 'circle', x, z, radius }
}

function wallSpecToBox(spec: WallSpec): BoxCollider {
  return box(spec.position, spec.size[0], spec.size[2])
}

/** Side + front/back wall colliders for one room, door gaps included exactly
 * as rendered (the lintel above a door doesn't reach the floor, so — same
 * as Museum.tsx's own baseboard logic — it's excluded here too). */
function roomWallColliders(room: RoomConfig): BoxCollider[] {
  const halfDepth = room.depth / 2
  const halfWidth = room.width / 2
  const innerWidth = room.width - WALL_THICKNESS

  const frontWalls = buildEndWall(room.front, room.centerZ + halfDepth, innerWidth, room.frontDoorX)
  const backWalls = buildEndWall(room.back, room.centerZ - halfDepth, innerWidth, room.backDoorX)
  const frontFloor = room.front === 'door' ? frontWalls.slice(0, 2) : frontWalls
  const backFloor = room.back === 'door' ? backWalls.slice(0, 2) : backWalls

  const sideWalls: WallSpec[] = [
    { position: [-halfWidth, 0, room.centerZ], size: [WALL_THICKNESS, 0, room.depth + WALL_THICKNESS] },
    { position: [halfWidth, 0, room.centerZ], size: [WALL_THICKNESS, 0, room.depth + WALL_THICKNESS] },
  ]

  return [...frontFloor, ...backFloor, ...sideWalls].map(wallSpecToBox)
}

// A small margin added around each hand-placed exhibit collider so the
// player's own radius doesn't let their view clip visually into the object
// before the collider stops them (see PLAYER_RADIUS in PlayerController.tsx).
const MARGIN = 0.04

/** Freestanding exhibit colliders, matching the exact positions/sizes used
 * in RoomProps.tsx (kept in sync by hand — these are hand-placed pieces of
 * furniture, not derived geometry like the walls). */
function roomExhibitColliders(room: RoomConfig): Collider[] {
  const halfWidth = room.width / 2
  const halfDepth = room.depth / 2

  switch (room.id) {
    case 'room1': {
      // The velvet-rope StanchionRing (radius 1.9) fully encloses the
      // pedestal (base half-extent 1.2 < 1.9), so one circle covers both
      // "Pedestal/plinth" and "Stanchion/barrier" for this room.
      return [
        circle(0, room.centerZ, 1.9 + MARGIN),
        // Floor-standing artifact label.
        circle(0, room.centerZ + 2.25, 0.12 + MARGIN),
      ]
    }
    case 'room2': {
      const pillarCount = 6
      const pillarRadius = 3
      const pillars: Collider[] = Array.from({ length: pillarCount }, (_, index) => {
        const angle = (index / pillarCount) * Math.PI * 2
        const x = Math.cos(angle) * pillarRadius
        const z = room.centerZ + Math.sin(angle) * pillarRadius
        return circle(x, z, 0.22 + MARGIN)
      })
      return [
        // Vitrine footprint (size=[2.0, 1.3, 1.5] -> X/Z = 2.0/1.5).
        box([0, 0, room.centerZ], 2.0 + MARGIN * 2, 1.5 + MARGIN * 2),
        ...pillars,
        circle(0, room.centerZ + 1.6, 0.12 + MARGIN),
      ]
    }
    case 'room3': {
      const kioskX = halfWidth - 1.6
      const kioskZ = room.centerZ + halfDepth - 2
      return [box([kioskX, 0, kioskZ], 0.7 + MARGIN * 2, 0.6 + MARGIN * 2)]
    }
    case 'final': {
      const screenZ = room.centerZ - halfDepth + 0.205
      const columnZ = screenZ + 1.3
      const columnX = 3.3
      return [
        box([-columnX, 0, columnZ], 0.22 + MARGIN * 2, 0.22 + MARGIN * 2),
        box([columnX, 0, columnZ], 0.22 + MARGIN * 2, 0.22 + MARGIN * 2),
      ]
    }
    default:
      return []
  }
}

let cachedColliders: Collider[] | null = null

/** Builds (and caches) the full static collider list for the museum. Safe to
 * call every frame — the layout never changes at runtime. */
export function getMuseumColliders(): Collider[] {
  if (cachedColliders) return cachedColliders
  const colliders: Collider[] = []
  for (const room of rooms) {
    colliders.push(...roomWallColliders(room), ...roomExhibitColliders(room))
  }
  cachedColliders = colliders
  return colliders
}

/** Resolves a desired (x, z) move for a circular player against every
 * collider, one axis at a time (classic "slide along walls" technique): the
 * X move is tried and reverted alone if it collides, then Z is tried from
 * whatever X ended up at. This lets the player slide smoothly along a wall
 * or exhibit edge instead of being hard-stopped on a diagonal approach. */
export function resolveMove(
  x: number,
  z: number,
  moveX: number,
  moveZ: number,
  radius: number,
  colliders: Collider[],
): [number, number] {
  let nextX = x
  let nextZ = z

  const triedX = x + moveX
  if (!collidesAt(triedX, nextZ, radius, colliders)) {
    nextX = triedX
  }

  const triedZ = z + moveZ
  if (!collidesAt(nextX, triedZ, radius, colliders)) {
    nextZ = triedZ
  }

  return [nextX, nextZ]
}

function collidesAt(x: number, z: number, radius: number, colliders: Collider[]): boolean {
  for (const collider of colliders) {
    if (collider.type === 'circle') {
      const dx = x - collider.x
      const dz = z - collider.z
      const minDist = radius + collider.radius
      if (dx * dx + dz * dz < minDist * minDist) return true
    } else {
      const closestX = Math.min(Math.max(x, collider.minX), collider.maxX)
      const closestZ = Math.min(Math.max(z, collider.minZ), collider.maxZ)
      const dx = x - closestX
      const dz = z - closestZ
      if (dx * dx + dz * dz < radius * radius) return true
    }
  }
  return false
}

import { useMemo } from 'react'
import RoomLabel from './components/RoomLabel'
import Wall from './components/Wall'
import Baseboard from './components/Baseboard'
import CeilingCove from './components/CeilingCove'
import CeilingShadowGap from './components/CeilingShadowGap'
import DoorFrame from './components/DoorFrame'
import ExhibitSpotlight from './components/ExhibitSpotlight'
import { TrackRail, TrackHead, RecessedSpot } from './components/CeilingFixture'
import { ImageFrame } from './components/WallPanels'
import { Room1Props, Room2Props, Room3Props, FinalRoomProps } from './components/RoomProps'
import { WALL_HEIGHT, WALL_THICKNESS, DOOR_WIDTH, DOOR_HEIGHT, WALL_MOUNT_GAP } from './constants'
import { createStoneFloorTexture, createStoneBumpTexture } from './utils/floorTexture'

const FLOOR_TILE_SIZE = 3

export type WallOpening = 'open' | 'door' | 'closed'

export interface RoomConfig {
  id: string
  title: string
  subtitle?: string
  centerZ: number
  width: number
  depth: number
  front: WallOpening
  frontDoorX: number
  back: WallOpening
  backDoorX: number
  accentColor?: string
  wallColor?: string
  lightColor?: string
  lightIntensity?: number
}

const WARM_ROOM_LIGHT = '#FFDFB0'
const WARM_GOLD_LIGHT = '#FFB35C'

// Ceiling track lights: 3 evenly spaced fixtures for a full gallery,
// 1 centered fixture for the smaller lobby.
function getTrackOffsets(depth: number): number[] {
  if (depth < 12) return [0]
  const spread = depth * 0.3
  return [-spread, 0, spread]
}

// Door offsets zigzag between rooms so the path jogs sideways at every
// transition — this keeps the sightline from reaching further than one
// room ahead instead of running straight down the whole museum.
export const rooms: RoomConfig[] = [
  {
    id: 'entrance',
    title: 'SẢNH',
    centerZ: 0,
    width: 16,
    depth: 8,
    front: 'open',
    frontDoorX: 0,
    back: 'door',
    backDoorX: -2.4,
  },
  {
    id: 'room1',
    title: 'PHÒNG I',
    subtitle: 'DÂN CHỦ XÃ HỘI CHỦ NGHĨA Ở VIỆT NAM',
    centerZ: -14,
    width: 16,
    depth: 14,
    front: 'door',
    frontDoorX: -2.4,
    back: 'door',
    backDoorX: 2.4,
    accentColor: '#7A1F2B',
  },
  {
    id: 'room2',
    title: 'PHÒNG II',
    subtitle: 'NHÀ NƯỚC PHÁP QUYỀN XÃ HỘI CHỦ NGHĨA Ở VIỆT NAM',
    centerZ: -31,
    width: 16,
    depth: 14,
    front: 'door',
    frontDoorX: 2.4,
    back: 'door',
    backDoorX: -2.4,
    accentColor: '#102A43',
  },
  {
    id: 'room3',
    title: 'PHÒNG III',
    subtitle: 'PHÁT HUY DÂN CHỦ & XÂY DỰNG\nNHÀ NƯỚC PHÁP QUYỀN',
    centerZ: -48,
    width: 16,
    depth: 14,
    front: 'door',
    frontDoorX: -2.4,
    back: 'door',
    backDoorX: 2.4,
    accentColor: '#1677FF',
  },
  {
    id: 'final',
    title: 'PHÒNG KẾT',
    centerZ: -65,
    width: 16,
    depth: 14,
    front: 'door',
    frontDoorX: 2.4,
    back: 'closed',
    backDoorX: 0,
    wallColor: '#1C1C1C',
    lightColor: WARM_GOLD_LIGHT,
    lightIntensity: 2.6,
  },
]

export interface WallSpec {
  position: [number, number, number]
  size: [number, number, number]
}

/** Exported alongside `rooms` so the collision system (see collision.ts) can
 * derive the exact same wall segments — including door gaps — that get
 * rendered, instead of re-deriving (and risking drifting from) this math. */
export function buildEndWall(type: WallOpening, z: number, width: number, doorX: number): WallSpec[] {
  if (type === 'open') return []

  if (type === 'closed') {
    return [{ position: [0, WALL_HEIGHT / 2, z], size: [width, WALL_HEIGHT, WALL_THICKNESS] }]
  }

  const halfWidth = width / 2
  const doorLeft = doorX - DOOR_WIDTH / 2
  const doorRight = doorX + DOOR_WIDTH / 2
  const leftSegWidth = doorLeft + halfWidth
  const rightSegWidth = halfWidth - doorRight
  const lintelHeight = WALL_HEIGHT - DOOR_HEIGHT

  return [
    { position: [-halfWidth + leftSegWidth / 2, WALL_HEIGHT / 2, z], size: [leftSegWidth, WALL_HEIGHT, WALL_THICKNESS] },
    { position: [halfWidth - rightSegWidth / 2, WALL_HEIGHT / 2, z], size: [rightSegWidth, WALL_HEIGHT, WALL_THICKNESS] },
    { position: [doorX, DOOR_HEIGHT + lintelHeight / 2, z], size: [DOOR_WIDTH, lintelHeight, WALL_THICKNESS] },
  ]
}

// How far the baseboard is nudged off the wall's own face, toward the room
// interior, so the two don't share a coincident plane (the z-fighting fix).
const BASEBOARD_INSET = 0.03
// Clearance left at a baseboard's door-facing end so its end cap doesn't sit
// exactly coincident with the door jamb's exposed wall face. Kept small (not
// zero — that would restore the coincident-plane z-fight) since a wider gap
// reads as a visible dark crevice at grazing angles through the doorway.
const DOOR_BASEBOARD_CLEARANCE = 0.0015
// A front/back wall segment's corner-facing end is built to land at an exact
// zero-gap plane against the side wall (see buildEndWall/RoomWalls below).
// Two independently-triangulated meshes that only TOUCH there — rather than
// truly overlap — can leave a hairline seam once floating-point rounding is
// involved: invisible up close, but visible as a dark sliver from a distance
// or a grazing angle, which is what showed up looking down the hallway
// through an aligned run of doorways. Growing the wall segments themselves
// to close that gap (an earlier attempt) also grew their shadow-casting
// silhouette at that exact spot, producing shadow acne at the doorway
// corner/floor junction instead. A separate filler patches the seam without
// touching either wall's own shadow footprint — see buildCornerFillers.
const WALL_CORNER_OVERLAP = 0.004

function insetTowardInterior(wall: WallSpec, axis: 'x' | 'z', sign: 1 | -1): WallSpec {
  const position: [number, number, number] = [...wall.position]
  if (axis === 'x') position[0] += sign * BASEBOARD_INSET
  else position[2] += sign * BASEBOARD_INSET
  return { position, size: wall.size }
}

// Shrinks a wall segment by `amount` along `axis`, pulling in only the end
// on the `endSign` side and leaving the opposite end fixed.
function shrinkSegmentEnd(wall: WallSpec, axis: 'x' | 'z', endSign: 1 | -1, amount: number): WallSpec {
  const axisIndex = axis === 'x' ? 0 : 2
  const size: [number, number, number] = [...wall.size]
  const position: [number, number, number] = [...wall.position]
  size[axisIndex] -= amount
  position[axisIndex] -= endSign * (amount / 2)
  return { position, size }
}

// A small patch dropped exactly on a front/back wall's corner seam with a
// side wall: it spans WALL_CORNER_OVERLAP into each wall's own footprint, so
// it's entirely embedded inside their combined solid volume (never itself
// exposed) except in any hairline rasterizer gap between the two real walls,
// which its own independent triangles cover regardless. It keeps
// receiveShadow on (so it shades like the wall surface around it) but
// disables castShadow: growing the wall's own casting silhouette to close
// this same seam, tried previously, grew its shadow footprint too and
// produced shadow acne at the doorway corner/floor junction instead.
function buildCornerFillers(type: WallOpening, wallZ: number, halfWidth: number): WallSpec[] {
  if (type === 'open') return []
  const size: [number, number, number] = [WALL_CORNER_OVERLAP * 2, WALL_HEIGHT, WALL_THICKNESS]
  return [
    { position: [-halfWidth + WALL_THICKNESS / 2, WALL_HEIGHT / 2, wallZ], size },
    { position: [halfWidth - WALL_THICKNESS / 2, WALL_HEIGHT / 2, wallZ], size },
  ]
}

// A door jamb's end cap, right at DOOR_BASEBOARD_CLEARANCE past the baseboard's
// own trimmed edge, faces almost edge-on to a camera looking through the
// doorway — confirmed by raycasting the exact on-screen artifact, which hit
// only that thin face, at the same near-black value with shadows on or off
// (ruling out shadow acne). A thin, nearly edge-on triangle is a classic
// rasterizer trouble spot independent of lighting. This adds a small,
// same-color, shadow-inert wall filler at each door jamb's inner corner —
// thick enough in the view direction not to suffer the same edge-on
// degeneracy — without touching the baseboard system at all.
const DOOR_CORNER_FILLER_WIDTH = 0.02
const DOOR_CORNER_FILLER_HEIGHT = 0.25

function buildDoorCornerFillers(type: WallOpening, wallZ: number, doorX: number): WallSpec[] {
  if (type !== 'door') return []
  const doorLeft = doorX - DOOR_WIDTH / 2
  const doorRight = doorX + DOOR_WIDTH / 2
  const size: [number, number, number] = [DOOR_CORNER_FILLER_WIDTH, DOOR_CORNER_FILLER_HEIGHT, WALL_THICKNESS]
  return [
    { position: [doorLeft, DOOR_CORNER_FILLER_HEIGHT / 2, wallZ], size },
    { position: [doorRight, DOOR_CORNER_FILLER_HEIGHT / 2, wallZ], size },
  ]
}

// Baseboards are laterally inset off their wall (see insetTowardInterior),
// which shifts the side-wall baseboards' inner faces BASEBOARD_INSET further
// into the room than the walls' own corner joint. Reusing the raw wall
// segment lengths for the front/back baseboards left them overlapping the
// side-wall baseboards in a real 3D volume at every corner — two coincident,
// same-colored boxes fighting for the same space. This re-trims each
// front/back floor segment so its side-wall-facing end lands exactly on the
// side-wall baseboard's (also inset) face instead: a flush butt joint, no
// overlap, no gap. A door-facing end instead gets a few mm of clearance,
// since that end's cap would otherwise be coincident with the door jamb's
// own exposed wall face.
function trimBaseboardEnds(segments: WallSpec[], type: WallOpening, axis: 'x' | 'z'): WallSpec[] {
  if (type === 'closed') {
    return segments.map((wall) => {
      const trimmed = shrinkSegmentEnd(wall, axis, -1, BASEBOARD_INSET)
      return shrinkSegmentEnd(trimmed, axis, 1, BASEBOARD_INSET)
    })
  }
  if (type === 'door') {
    // segments === [leftSeg, rightSeg]: leftSeg's outer (side-wall) end faces
    // -axis, rightSeg's outer end faces +axis; each segment's other end
    // faces the door instead.
    return segments.map((wall, index) => {
      const outerSign: 1 | -1 = index === 0 ? -1 : 1
      const outerTrimmed = shrinkSegmentEnd(wall, axis, outerSign, BASEBOARD_INSET)
      return shrinkSegmentEnd(outerTrimmed, axis, (-outerSign) as 1 | -1, DOOR_BASEBOARD_CLEARANCE)
    })
  }
  return segments
}

function RoomWalls({ room }: { room: RoomConfig }) {
  const { centerZ, width, depth, front, frontDoorX, back, backDoorX, wallColor } = room
  const halfDepth = depth / 2
  const halfWidth = width / 2

  // Corner joint: side walls run the full length out to the exterior corner
  // (extended by half the wall thickness at each end), and the front/back
  // walls are trimmed by the same amount so they terminate exactly at the
  // side walls' inner face — one continuous corner volume, no overlap, no gap.
  const frontWalls = buildEndWall(front, centerZ + halfDepth, width - WALL_THICKNESS, frontDoorX)
  const backWalls = buildEndWall(back, centerZ - halfDepth, width - WALL_THICKNESS, backDoorX)
  // Shadow-inert fillers patch the seam where a front/back wall meets a side
  // wall (see buildCornerFillers) without altering either wall's own
  // geometry or shadow-casting silhouette.
  const frontCornerFillers = buildCornerFillers(front, centerZ + halfDepth, halfWidth)
  const backCornerFillers = buildCornerFillers(back, centerZ - halfDepth, halfWidth)
  // Shadow-inert fillers patch the seam at each door jamb's inner corner
  // (see buildDoorCornerFillers) — wall geometry only, baseboard untouched.
  const frontDoorCornerFillers = buildDoorCornerFillers(front, centerZ + halfDepth, frontDoorX)
  const backDoorCornerFillers = buildDoorCornerFillers(back, centerZ - halfDepth, backDoorX)
  // The lintel above a door doesn't touch the floor, so baseboards skip it —
  // 'door' returns [left, right, lintel]; 'closed' returns a single full wall.
  const frontFloorSegments = front === 'door' ? frontWalls.slice(0, 2) : frontWalls
  const backFloorSegments = back === 'door' ? backWalls.slice(0, 2) : backWalls
  const sideWalls: WallSpec[] = [
    { position: [-halfWidth, WALL_HEIGHT / 2, centerZ], size: [WALL_THICKNESS, WALL_HEIGHT, depth + WALL_THICKNESS] },
    { position: [halfWidth, WALL_HEIGHT / 2, centerZ], size: [WALL_THICKNESS, WALL_HEIGHT, depth + WALL_THICKNESS] },
  ]

  // Each baseboard is nudged toward the room center along the axis its wall
  // faces, so its front face clears the wall's own inner face instead of
  // sitting exactly on it. Front/back segments are also re-trimmed lengthwise
  // (see trimBaseboardEnds) so they don't overlap the side-wall baseboards at
  // the corners, and clear the door jamb's wall face at door openings.
  const frontBaseboardSegments = trimBaseboardEnds(frontFloorSegments, front, 'x')
  const backBaseboardSegments = trimBaseboardEnds(backFloorSegments, back, 'x')
  const sideBaseboards: WallSpec[] = [
    insetTowardInterior(sideWalls[0], 'x', 1),
    insetTowardInterior(sideWalls[1], 'x', -1),
  ]
  const endBaseboards: WallSpec[] = [
    ...frontBaseboardSegments.map((wall) => insetTowardInterior(wall, 'z', -1)),
    ...backBaseboardSegments.map((wall) => insetTowardInterior(wall, 'z', 1)),
  ]

  return (
    <group>
      {sideWalls.map((wall, index) => (
        <Wall key={`side-${index}`} position={wall.position} size={wall.size} color={wallColor} />
      ))}
      {frontWalls.map((wall, index) => (
        <Wall key={`front-${index}`} position={wall.position} size={wall.size} color={wallColor} />
      ))}
      {backWalls.map((wall, index) => (
        <Wall key={`back-${index}`} position={wall.position} size={wall.size} color={wallColor} />
      ))}
      {[...frontCornerFillers, ...backCornerFillers].map((wall, index) => (
        <Wall
          key={`corner-filler-${index}`}
          position={wall.position}
          size={wall.size}
          color={wallColor}
          castShadow={false}
        />
      ))}
      {[...frontDoorCornerFillers, ...backDoorCornerFillers].map((wall, index) => (
        <Wall
          key={`door-corner-filler-${index}`}
          position={wall.position}
          size={wall.size}
          color={wallColor}
          castShadow={false}
        />
      ))}
      {sideBaseboards.map((wall, index) => (
        <Baseboard key={`base-side-${index}`} position={wall.position} size={wall.size} alongZ />
      ))}
      {endBaseboards.map((wall, index) => (
        <Baseboard key={`base-end-${index}`} position={wall.position} size={wall.size} />
      ))}
      {front === 'door' && (
        <DoorFrame
          wallZ={centerZ + halfDepth}
          doorX={frontDoorX}
          doorWidth={DOOR_WIDTH}
          doorHeight={DOOR_HEIGHT}
          wallThickness={WALL_THICKNESS}
        />
      )}
      {back === 'door' && (
        <DoorFrame
          wallZ={centerZ - halfDepth}
          doorX={backDoorX}
          doorWidth={DOOR_WIDTH}
          doorHeight={DOOR_HEIGHT}
          wallThickness={WALL_THICKNESS}
        />
      )}
    </group>
  )
}

function RoomExtras({ room }: { room: RoomConfig }) {
  const bounds = { centerZ: room.centerZ, width: room.width, depth: room.depth, accentColor: room.accentColor }
  switch (room.id) {
    case 'room1':
      return <Room1Props {...bounds} />
    case 'room2':
      return <Room2Props {...bounds} />
    case 'room3':
      return <Room3Props {...bounds} />
    case 'final':
      return <FinalRoomProps {...bounds} />
    default:
      return null
  }
}

const FLOOR_Z_START = 5
const FLOOR_Z_END = -73
const MUSEUM_WIDTH = 16

export default function Museum() {
  const spanLength = FLOOR_Z_START - FLOOR_Z_END
  const spanCenterZ = (FLOOR_Z_START + FLOOR_Z_END) / 2

  const floorTexture = useMemo(() => {
    const texture = createStoneFloorTexture()
    texture.repeat.set(MUSEUM_WIDTH / FLOOR_TILE_SIZE, spanLength / FLOOR_TILE_SIZE)
    return texture
  }, [spanLength])

  const floorBumpTexture = useMemo(() => {
    const texture = createStoneBumpTexture()
    texture.repeat.set(MUSEUM_WIDTH / FLOOR_TILE_SIZE, spanLength / FLOOR_TILE_SIZE)
    return texture
  }, [spanLength])

  return (
    <group>
      <mesh position={[0, 0, spanCenterZ]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[MUSEUM_WIDTH, spanLength]} />
        <meshStandardMaterial
          map={floorTexture}
          bumpMap={floorBumpTexture}
          bumpScale={0.03}
          roughness={0.54}
          metalness={0}
        />
      </mesh>

      <mesh position={[0, WALL_HEIGHT, spanCenterZ]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[MUSEUM_WIDTH, spanLength]} />
        <meshStandardMaterial color="#FAF8F2" />
      </mesh>

      {rooms.map((room) => {
        const trackOffsets = getTrackOffsets(room.depth)
        const perLightIntensity =
          (room.lightIntensity ?? 2.2) / (trackOffsets.length > 1 ? Math.sqrt(trackOffsets.length) : 1)

        return (
          <group key={room.id}>
            <RoomWalls room={room} />
            <RoomExtras room={room} />
            <CeilingCove centerZ={room.centerZ} width={room.width} depth={room.depth} />
            <CeilingShadowGap centerZ={room.centerZ} width={room.width} depth={room.depth} />
            {/* Environment tier — the weakest lights in the hierarchy (below
                panel accents), just enough so side walls and the floor
                between exhibits pick up a soft warm gradient instead of
                reading as flat/pure black. */}
            <pointLight
              position={[-(room.width / 2 - 0.35), 2.1, room.centerZ]}
              color={WARM_ROOM_LIGHT}
              intensity={0.2}
              distance={Math.max(room.depth * 0.7, 5)}
              decay={1.4}
            />
            <pointLight
              position={[room.width / 2 - 0.35, 2.1, room.centerZ]}
              color={WARM_ROOM_LIGHT}
              intensity={0.2}
              distance={Math.max(room.depth * 0.7, 5)}
              decay={1.4}
            />
            <pointLight
              position={[0, 0.35, room.centerZ]}
              color={WARM_ROOM_LIGHT}
              intensity={0.35}
              distance={Math.max(room.depth * 0.73, 5.6)}
              decay={1.4}
            />
            {room.id === 'entrance' && (
              <>
                <ImageFrame position={[-(room.width / 2 - WALL_MOUNT_GAP), 1.9, room.centerZ]} rotationY={Math.PI / 2} width={1.0} height={1.4} />
                <ImageFrame position={[-(room.width / 2 - WALL_MOUNT_GAP), 1.9, room.centerZ + 2.4]} rotationY={Math.PI / 2} width={1.0} height={1.4} />
                {/* Dedicated, deliberately weak accent light per frame — same
                    exhibition rhythm as the wall panels further into the museum. */}
                <pointLight position={[-(room.width / 2 - WALL_MOUNT_GAP - 0.5), 2.05, room.centerZ]} color={WARM_ROOM_LIGHT} intensity={0.36} distance={1.6} decay={2} />
                <pointLight position={[-(room.width / 2 - WALL_MOUNT_GAP - 0.5), 2.05, room.centerZ + 2.4]} color={WARM_ROOM_LIGHT} intensity={0.36} distance={1.6} decay={2} />
              </>
            )}
            {/* Ceiling track lights — soft, non-shadow, evenly spaced fixtures,
                with visible black/champagne housings matching the light direction */}
            {trackOffsets.length > 1 && (
              <TrackRail
                position={[0, WALL_HEIGHT, room.centerZ]}
                length={trackOffsets[trackOffsets.length - 1] - trackOffsets[0] + 1.2}
              />
            )}
            {trackOffsets.map((zOffset, index) => (
              <group key={`track-${index}`}>
                <ExhibitSpotlight
                  position={[0, WALL_HEIGHT - 0.3, room.centerZ + zOffset]}
                  targetPosition={[0, 0, room.centerZ + zOffset]}
                  intensity={perLightIntensity}
                  angle={0.6}
                  penumbra={0.8}
                  distance={11}
                  color={room.lightColor ?? WARM_ROOM_LIGHT}
                  castShadow={false}
                />
                {trackOffsets.length > 1 ? (
                  // TrackHead's housing cylinder is 0.14 tall (±0.07); mounting
                  // it at WALL_HEIGHT-0.075 keeps its top 5mm clear of the ceiling.
                  <TrackHead position={[0, WALL_HEIGHT - 0.075, room.centerZ + zOffset]} />
                ) : (
                  <RecessedSpot position={[0, WALL_HEIGHT - 0.02, room.centerZ + zOffset]} />
                )}
              </group>
            ))}
            <RoomLabel
              title={room.title}
              subtitle={room.subtitle}
              position={[room.width / 2 - 0.2, 2.4, room.centerZ]}
              rotationY={-Math.PI / 2}
            />
          </group>
        )
      })}
    </group>
  )
}

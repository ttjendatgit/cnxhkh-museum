import { useMemo } from 'react'
import { createLimestoneTexture, createLimestoneBumpTexture } from '../utils/surfaceTexture'
import { createChamferedBoxGeometry } from '../utils/chamferedBox'

const TRIM_METAL = '#A67C52'
const ROPE_COLOR = '#3A2E22'

// Subtle top/bottom chamfer size for the pedestal's base and riser — small
// enough to read as a refined cut edge, not a visibly beveled slab.
const BASE_BEVEL = 0.015
const RISER_BEVEL = 0.02

// Shared once across every Plinth instance — a fine micro texture that
// doesn't need to register precisely per pedestal size.
const limestoneTexture = createLimestoneTexture()
limestoneTexture.repeat.set(2, 2)
const limestoneBumpTexture = createLimestoneBumpTexture()
limestoneBumpTexture.repeat.set(2, 2)
// Raises solid display bases just clear of the floor plane.
const BASE_FLOOR_LIFT = 0.005
// Vertical air gap kept between two stacked opaque meshes so their faces
// never share an exact depth plane (real separation, not draw-order luck).
const STACK_GAP = 0.004
const REVEAL_HEIGHT = 0.008

interface PlinthProps {
  /** Floor-level center the plinth rises from. */
  position: [number, number, number]
  baseSize: [number, number]
  riserSize: [number, number]
  baseHeight?: number
  riserHeight?: number
  color?: string
}

/** A two-tier museum pedestal: a wide stone base with a bronze reveal line, topped by a narrower riser. */
export function Plinth({
  position,
  baseSize,
  riserSize,
  baseHeight = 0.1,
  riserHeight = 0.75,
  color = '#E8DEC4',
}: PlinthProps) {
  const [x, rawY, z] = position
  const y = rawY + BASE_FLOOR_LIFT

  // Chamfered geometry catches light along the visible top edges instead of
  // presenting a raw right-angle box edge — subtle, but reads as a
  // deliberately finished stone piece rather than a placeholder block.
  const baseGeometry = useMemo(
    () => createChamferedBoxGeometry(baseSize[0], baseHeight, baseSize[1], BASE_BEVEL),
    [baseSize[0], baseSize[1], baseHeight],
  )
  const riserGeometry = useMemo(
    () => createChamferedBoxGeometry(riserSize[0], riserHeight, riserSize[1], RISER_BEVEL),
    [riserSize[0], riserSize[1], riserHeight],
  )

  return (
    <group>
      <mesh position={[x, y + baseHeight / 2, z]} geometry={baseGeometry} castShadow receiveShadow>
        <meshStandardMaterial
          color={color}
          map={limestoneTexture}
          bumpMap={limestoneBumpTexture}
          bumpScale={0.008}
          roughness={0.4}
          metalness={0.05}
        />
      </mesh>
      {/* Reveal line floats a real 4mm above the base's top face instead of being
          embedded in it — was coincident with the base's top cap across the
          whole shelf (both faces up-facing, same height: a guaranteed z-fight). */}
      <mesh position={[x, y + baseHeight + STACK_GAP + REVEAL_HEIGHT / 2, z]}>
        <boxGeometry args={[baseSize[0] + 0.01, REVEAL_HEIGHT, baseSize[1] + 0.01]} />
        <meshStandardMaterial color={TRIM_METAL} metalness={0.5} roughness={0.3} />
      </mesh>
      <mesh position={[x, y + baseHeight + riserHeight / 2, z]} geometry={riserGeometry} castShadow receiveShadow>
        <meshStandardMaterial
          color={color}
          map={limestoneTexture}
          bumpMap={limestoneBumpTexture}
          bumpScale={0.008}
          roughness={0.35}
          metalness={0.05}
        />
      </mesh>
    </group>
  )
}

interface VitrineProps {
  /** Floor-level center the case rises from. */
  position: [number, number, number]
  size: [number, number, number]
  frameColor?: string
  glassColor?: string
}

// A faint, cool catch-light band just inside the glass's top edge — reads as
// a soft highlight where overhead light rakes the pane, without a mirror
// reflection strong enough to hide what's inside the case.
const EDGE_HIGHLIGHT_COLOR = '#F4FAFF'
// Very low, warm interior fill so the artifact inside the case isn't lost in
// shadow — deliberately far below the room's ArtifactSpotlight hero light.
const INTERIOR_FILL_COLOR = '#FFE9C7'

/** A framed glass display case: slender corner posts + top/base rims around a low-opacity glass volume. */
export function Vitrine({ position, size, frameColor = '#2B241D', glassColor = '#CFE3E6' }: VitrineProps) {
  const [x, rawY, z] = position
  // The posts and base rim rest directly on the floor; lift the whole case
  // clear of the floor plane so those bottom faces aren't coincident with it.
  const y = rawY + BASE_FLOOR_LIFT
  const [w, h, d] = size
  const post = 0.035
  const corners: [number, number][] = [
    [w / 2 - post / 2, d / 2 - post / 2],
    [w / 2 - post / 2, -(d / 2 - post / 2)],
    [-(w / 2 - post / 2), d / 2 - post / 2],
    [-(w / 2 - post / 2), -(d / 2 - post / 2)],
  ]

  return (
    <group>
      {/* Glass sits 5mm inside the frame envelope on every side — never coplanar with the posts/rims */}
      <mesh position={[x, y + h / 2, z]}>
        <boxGeometry args={[w - 0.01, h - 0.01, d - 0.01]} />
        <meshStandardMaterial
          color={glassColor}
          transparent
          opacity={0.19}
          roughness={0.08}
          metalness={0}
          depthWrite={false}
        />
      </mesh>
      {/* Subtle edge highlight — sits just inside the glass's own front face,
          a hair proud of it so it isn't a coincident/z-fighting plane. */}
      <mesh position={[x, y + h - 0.11, z + d / 2 - 0.03]}>
        <boxGeometry args={[w - 0.14, 0.01, 0.008]} />
        <meshStandardMaterial
          color={EDGE_HIGHLIGHT_COLOR}
          transparent
          opacity={0.3}
          roughness={0.05}
          metalness={0}
          depthWrite={false}
        />
      </mesh>
      {/* Very soft, low interior fill so whatever sits inside the case reads
          clearly through the glass rather than sinking into shadow. */}
      <pointLight
        position={[x, y + h * 0.55, z]}
        color={INTERIOR_FILL_COLOR}
        intensity={0.28}
        distance={1.4}
        decay={2}
      />
      {corners.map(([cx, cz], index) => (
        <mesh key={`post-${index}`} position={[x + cx, y + h / 2, z + cz]}>
          <boxGeometry args={[post, h, post]} />
          <meshStandardMaterial color={frameColor} metalness={0.6} roughness={0.34} />
        </mesh>
      ))}
      {/* Nudged 3mm above the glass box's own top face so the two don't share an exact coincident plane */}
      <mesh position={[x, y + h - 0.017, z]}>
        <boxGeometry args={[w + 0.02, 0.04, d + 0.02]} />
        <meshStandardMaterial color={frameColor} metalness={0.6} roughness={0.32} />
      </mesh>
      <mesh position={[x, y + 0.02, z]}>
        <boxGeometry args={[w + 0.02, 0.04, d + 0.02]} />
        <meshStandardMaterial color={frameColor} metalness={0.6} roughness={0.32} />
      </mesh>
    </group>
  )
}

interface StanchionRingProps {
  center: [number, number]
  radius: number
  postCount?: number
  color?: string
}

/** A velvet-rope style barrier ring around a protected exhibit. */
export function StanchionRing({ center, radius, postCount = 6, color = TRIM_METAL }: StanchionRingProps) {
  const [cx, cz] = center
  const postHeight = 0.75

  const posts: [number, number][] = Array.from({ length: postCount }, (_, index) => {
    const angle = (index / postCount) * Math.PI * 2
    return [cx + Math.cos(angle) * radius, cz + Math.sin(angle) * radius]
  })

  return (
    // Lifts every post/rope off the floor plane so the post base isn't
    // coincident with the floor mesh.
    <group position={[0, BASE_FLOOR_LIFT, 0]}>
      {posts.map(([px, pz], index) => (
        <group key={`post-${index}`}>
          {/* Flat foot disc — a grounded, intentional base rather than the
              post shaft simply meeting the floor. */}
          <mesh position={[px, 0.006, pz]}>
            <cylinderGeometry args={[0.055, 0.06, 0.012, 16]} />
            <meshStandardMaterial color={color} metalness={0.55} roughness={0.35} />
          </mesh>
          <mesh position={[px, postHeight / 2, pz]} castShadow>
            <cylinderGeometry args={[0.03, 0.035, postHeight, 12]} />
            <meshStandardMaterial color={color} metalness={0.7} roughness={0.22} />
          </mesh>
          {/* Collar just below the finial — the same reveal-line language
              used on the pedestal, so the post reads as a finished fixture. */}
          <mesh position={[px, postHeight + 0.02, pz]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.034, 0.005, 8, 16]} />
            <meshStandardMaterial color={color} metalness={0.7} roughness={0.2} />
          </mesh>
          <mesh position={[px, postHeight + 0.058, pz]}>
            <sphereGeometry args={[0.035, 12, 12]} />
            <meshStandardMaterial color={color} metalness={0.65} roughness={0.18} />
          </mesh>
        </group>
      ))}
      {posts.map(([px, pz], index) => {
        const [nx, nz] = posts[(index + 1) % posts.length]
        const dx = nx - px
        const dz = nz - pz
        const length = Math.hypot(dx, dz)
        const angle = Math.atan2(-dz, dx)
        return (
          <mesh
            key={`rope-${index}`}
            position={[(px + nx) / 2, postHeight * 0.72, (pz + nz) / 2]}
            rotation={[0, angle, 0]}
          >
            <boxGeometry args={[length * 0.94, 0.022, 0.022]} />
            <meshStandardMaterial color={ROPE_COLOR} roughness={0.75} metalness={0.02} />
          </mesh>
        )
      })}
    </group>
  )
}

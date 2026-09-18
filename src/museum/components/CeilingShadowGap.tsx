import { WALL_HEIGHT } from '../constants'

// A purely architectural recess line, not a light source — distinct from
// CeilingCove's glowing accent bar, which sits further inward. This one
// hugs the actual wall/ceiling corner and reads as a shallow shadow gap
// (the reveal joint a real premium gallery ceiling is built with), giving
// the ceiling plane a "floating" edge instead of meeting the wall flush.
const GAP_COLOR = '#17140F'

interface CeilingShadowGapProps {
  centerZ: number
  width: number
  depth: number
}

export default function CeilingShadowGap({ centerZ, width, depth }: CeilingShadowGapProps) {
  const y = WALL_HEIGHT - 0.016
  const inset = 0.06
  const w = width - inset * 2
  const d = depth - inset * 2
  const bar = 0.03
  const thickness = 0.018

  return (
    <group>
      <mesh position={[0, y, centerZ + d / 2]}>
        <boxGeometry args={[w, thickness, bar]} />
        <meshStandardMaterial color={GAP_COLOR} roughness={0.9} metalness={0} />
      </mesh>
      <mesh position={[0, y, centerZ - d / 2]}>
        <boxGeometry args={[w, thickness, bar]} />
        <meshStandardMaterial color={GAP_COLOR} roughness={0.9} metalness={0} />
      </mesh>
      {/* Side bars fit exactly between the front/back bars' inner edges,
          matching CeilingCove's flush-butt-joint approach at the corners. */}
      <mesh position={[w / 2, y, centerZ]}>
        <boxGeometry args={[bar, thickness, d - bar]} />
        <meshStandardMaterial color={GAP_COLOR} roughness={0.9} metalness={0} />
      </mesh>
      <mesh position={[-w / 2, y, centerZ]}>
        <boxGeometry args={[bar, thickness, d - bar]} />
        <meshStandardMaterial color={GAP_COLOR} roughness={0.9} metalness={0} />
      </mesh>
    </group>
  )
}

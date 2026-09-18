import { WALL_HEIGHT } from '../constants'

const COVE_COLOR = '#FFEBC8'

interface CeilingCoveProps {
  centerZ: number
  width: number
  depth: number
}

/** A faint glowing perimeter line just below the ceiling — a soft architectural cove-lighting accent. */
export default function CeilingCove({ centerZ, width, depth }: CeilingCoveProps) {
  const y = WALL_HEIGHT - 0.06
  const inset = 0.35
  const w = width - inset * 2
  const d = depth - inset * 2
  const bar = 0.05

  return (
    <group>
      <mesh position={[0, y, centerZ + d / 2]}>
        <boxGeometry args={[w, 0.025, bar]} />
        <meshStandardMaterial color={COVE_COLOR} emissive={COVE_COLOR} emissiveIntensity={0.55} />
      </mesh>
      <mesh position={[0, y, centerZ - d / 2]}>
        <boxGeometry args={[w, 0.025, bar]} />
        <meshStandardMaterial color={COVE_COLOR} emissive={COVE_COLOR} emissiveIntensity={0.55} />
      </mesh>
      {/* Side bars fit exactly between the front/back bars' inner edges
          (d - bar) instead of running the full depth — the two used to fully
          overlap in a bar x bar square at each corner (same y-range, both top
          faces exposed): a guaranteed z-fight. This is a flush butt joint
          with no gap and no overlap. */}
      <mesh position={[w / 2, y, centerZ]}>
        <boxGeometry args={[bar, 0.025, d - bar]} />
        <meshStandardMaterial color={COVE_COLOR} emissive={COVE_COLOR} emissiveIntensity={0.55} />
      </mesh>
      <mesh position={[-w / 2, y, centerZ]}>
        <boxGeometry args={[bar, 0.025, d - bar]} />
        <meshStandardMaterial color={COVE_COLOR} emissive={COVE_COLOR} emissiveIntensity={0.55} />
      </mesh>
    </group>
  )
}

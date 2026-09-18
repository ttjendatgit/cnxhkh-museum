const FIXTURE_METAL = '#1E1E1E'
const FIXTURE_ACCENT = '#A67C52'
const LENS_WARM = '#FFEBC8'

interface TrackRailProps {
  position: [number, number, number]
  length?: number
}

/** The black metal rail a row of track-light heads is mounted on. */
export function TrackRail({ position, length = 3.6 }: TrackRailProps) {
  // Hangs just below the ceiling plane (not above it) — top face clears the
  // ceiling by 5mm instead of poking through it.
  return (
    <mesh position={[position[0], position[1] - 0.03, position[2]]}>
      <boxGeometry args={[0.12, 0.05, length]} />
      <meshStandardMaterial color={FIXTURE_METAL} metalness={0.6} roughness={0.35} />
    </mesh>
  )
}

interface FixtureProps {
  position: [number, number, number]
}

/** A single track-mounted spotlight head, angled straight down. */
export function TrackHead({ position }: FixtureProps) {
  return (
    <group position={position}>
      <mesh>
        <cylinderGeometry args={[0.07, 0.09, 0.14, 12]} />
        <meshStandardMaterial color={FIXTURE_METAL} metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, -0.075, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.02, 12]} />
        <meshStandardMaterial color={LENS_WARM} emissive={LENS_WARM} emissiveIntensity={0.6} />
      </mesh>
      <mesh position={[0, 0.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.075, 0.01, 8, 16]} />
        <meshStandardMaterial color={FIXTURE_ACCENT} metalness={0.5} roughness={0.3} />
      </mesh>
    </group>
  )
}

/** A flush recessed ceiling spotlight, used for the single-fixture lobby and for focused exhibit spots. */
export function RecessedSpot({ position }: FixtureProps) {
  // Housing is 0.04 tall (±0.02); nudging the group down 5mm keeps its top
  // face clear of the ceiling plane instead of touching it exactly.
  const mountPosition: [number, number, number] = [position[0], position[1] - 0.005, position[2]]
  return (
    <group position={mountPosition}>
      <mesh>
        <cylinderGeometry args={[0.16, 0.16, 0.04, 20]} />
        <meshStandardMaterial color={FIXTURE_METAL} metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0, -0.026, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.015, 20]} />
        <meshStandardMaterial color={LENS_WARM} emissive={LENS_WARM} emissiveIntensity={0.8} />
      </mesh>
      <mesh position={[0, 0.021, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.16, 0.008, 8, 20]} />
        <meshStandardMaterial color={FIXTURE_ACCENT} metalness={0.6} roughness={0.25} />
      </mesh>
    </group>
  )
}

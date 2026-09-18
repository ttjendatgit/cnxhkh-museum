const BASEBOARD_HEIGHT = 0.16
// A refined warm dark stone tone instead of a flat near-black line — reads
// as a considered architectural material, not a stark strip along the wall.
const BASEBOARD_COLOR = '#3A342C'
const REVEAL_COLOR = '#A67C52'
// Lifts the whole baseboard clear of the floor plane so its bottom edge
// isn't coincident with the floor (wall offset and dimensions unchanged).
const FLOOR_LIFT = 0.004

// How far the reveal line's lip overhangs the main board on its safe axis —
// the one that never meets a neighboring segment's box.
const REVEAL_OVERHANG = 0.01
// A small inward recess used instead, on an axis that DOES sit on a flush
// corner butt joint: a side-wall run's x is both its thickness axis and the
// exact axis its corner joint sits on, so overhanging it would spill past
// the shared boundary into the perpendicular segment's box. Recessing
// instead keeps the trim strictly inside its own main board everywhere.
const REVEAL_INSET = 0.006

interface BaseboardProps {
  /** Wall-footprint center (x/z only matter — y is ignored, the board always sits on the floor). */
  position: [number, number, number]
  /** Wall footprint size — only the horizontal dimensions are used. */
  size: [number, number, number]
  /** True for a side-wall run (thin in x, long in z); false for a front/back
   * run (long in x, thin in z). Segments butt together exactly at corners
   * along x, so a side-wall run's reveal lip is recessed on x instead of
   * overhung there (see REVEAL_INSET); its z ends sit inside the sealed
   * wall corner joint either way, so they're left an exact match, safely
   * hidden. A front/back run's x already matches its main board exactly
   * (see trimBaseboardEnds), so only its safe z axis gets the outward lip. */
  alongZ?: boolean
}

/** A dark stone baseboard with a bronze reveal line, run along a wall's floor edge. */
export default function Baseboard({ position, size, alongZ = false }: BaseboardProps) {
  const [width, , depth] = size
  const revealWidth = alongZ ? width - REVEAL_INSET : width
  const revealDepth = alongZ ? depth : depth + REVEAL_OVERHANG

  return (
    <group>
      <mesh position={[position[0], FLOOR_LIFT + BASEBOARD_HEIGHT / 2, position[2]]} receiveShadow>
        <boxGeometry args={[width, BASEBOARD_HEIGHT, depth]} />
        <meshStandardMaterial color={BASEBOARD_COLOR} roughness={0.5} metalness={0.05} />
      </mesh>
      <mesh position={[position[0], FLOOR_LIFT + BASEBOARD_HEIGHT - 0.008, position[2]]}>
        <boxGeometry args={[revealWidth, 0.012, revealDepth]} />
        <meshStandardMaterial color={REVEAL_COLOR} metalness={0.4} roughness={0.3} />
      </mesh>
    </group>
  )
}

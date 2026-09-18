const FRAME_BRONZE = '#B08A4F'
const PANEL_BROWN = '#45372B'
const PANEL_IVORY = '#F1E7D4'
const PANEL_IVORY_DIM = '#E8D9BE'
const RULE_BRONZE = '#9C7C4E'
// A dark backing plate mounted close to the wall, behind every frame/panel
// below, with the rest of the piece floating forward of it on a small
// standoff — the same "mounted object, not a wall decal" language used on
// the room-title plaques, scaled down for these smaller wall pieces.
const BACKING_COLOR = '#1B160F'

interface PanelProps {
  position: [number, number, number]
  rotationY?: number
  width?: number
  height?: number
  accentColor?: string
}

/** Large wall-mounted information panel: bronze frame, charcoal mat, a thin
 * bronze rule dividing a caption zone from an ivory text field — a museum
 * label card, not a flat colored UI bar. */
export function InfoPanel({
  position,
  rotationY = 0,
  width = 2.6,
  height = 1.6,
  accentColor = RULE_BRONZE,
}: PanelProps) {
  const standoff = 0.025
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 0, -0.06]} receiveShadow>
        <boxGeometry args={[width + 0.1, height + 0.1, 0.015]} />
        <meshStandardMaterial color={BACKING_COLOR} roughness={0.85} metalness={0} />
      </mesh>
      <group position={[0, 0, standoff]}>
        <mesh position={[0, 0, -0.03]} castShadow receiveShadow>
          <boxGeometry args={[width, height, 0.04]} />
          <meshStandardMaterial color={FRAME_BRONZE} metalness={0.45} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0, -0.008]} receiveShadow>
          <boxGeometry args={[width - 0.14, height - 0.14, 0.02]} />
          <meshStandardMaterial color={PANEL_BROWN} />
        </mesh>
        <mesh position={[0, height / 2 - 0.32, 0.006]} receiveShadow>
          <boxGeometry args={[width - 0.3, 0.012, 0.012]} />
          <meshStandardMaterial color={accentColor} metalness={0.4} roughness={0.35} />
        </mesh>
        <mesh position={[0, -0.14, 0.01]} receiveShadow>
          <boxGeometry args={[width - 0.3, height - 0.62, 0.02]} />
          <meshStandardMaterial color={PANEL_IVORY} />
        </mesh>
      </group>
    </group>
  )
}

/** Framed image/exhibit-photo area: bronze frame around a recessed ivory inset. */
export function ImageFrame({
  position,
  rotationY = 0,
  width = 1.0,
  height = 1.4,
  accentColor = FRAME_BRONZE,
}: PanelProps) {
  const standoff = 0.025
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 0, -0.07]} receiveShadow>
        <boxGeometry args={[width + 0.08, height + 0.08, 0.015]} />
        <meshStandardMaterial color={BACKING_COLOR} roughness={0.85} metalness={0} />
      </mesh>
      <group position={[0, 0, standoff]}>
        <mesh position={[0, 0, -0.035]} castShadow receiveShadow>
          <boxGeometry args={[width, height, 0.05]} />
          <meshStandardMaterial color={accentColor} metalness={0.4} roughness={0.35} />
        </mesh>
        <mesh position={[0, 0, 0]} receiveShadow>
          <boxGeometry args={[width - 0.12, height - 0.12, 0.02]} />
          <meshStandardMaterial color={PANEL_IVORY_DIM} />
        </mesh>
      </group>
    </group>
  )
}

/** Small exhibit description placard: bronze frame, charcoal mat, a bronze
 * rule and an ivory caption field — scaled down from InfoPanel but the same
 * museum-label language, not a game-UI caption strip. */
export function ExhibitBoard({
  position,
  rotationY = 0,
  width = 1.0,
  height = 0.7,
  accentColor = RULE_BRONZE,
}: PanelProps) {
  const standoff = 0.02
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 0, -0.05]} receiveShadow>
        <boxGeometry args={[width + 0.06, height + 0.06, 0.012]} />
        <meshStandardMaterial color={BACKING_COLOR} roughness={0.85} metalness={0} />
      </mesh>
      <group position={[0, 0, standoff]}>
        <mesh position={[0, 0, -0.025]} receiveShadow>
          <boxGeometry args={[width, height, 0.03]} />
          <meshStandardMaterial color={FRAME_BRONZE} metalness={0.45} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0, -0.006]} receiveShadow>
          <boxGeometry args={[width - 0.08, height - 0.08, 0.015]} />
          <meshStandardMaterial color={PANEL_BROWN} />
        </mesh>
        <mesh position={[0, height / 2 - 0.17, 0.005]} receiveShadow>
          <boxGeometry args={[width - 0.16, 0.008, 0.008]} />
          <meshStandardMaterial color={accentColor} metalness={0.4} roughness={0.35} />
        </mesh>
        <mesh position={[0, -0.055, 0.008]} receiveShadow>
          <boxGeometry args={[width - 0.16, height - 0.3, 0.012]} />
          <meshStandardMaterial color={PANEL_IVORY} />
        </mesh>
      </group>
    </group>
  )
}

import { Text } from '@react-three/drei'

// Same bronze/charcoal/gold family as RoomLabel and WallPanels, kept to two
// relief layers (frame + panel) since this is a small secondary caption, not
// a room-title hero plaque.
const PANEL_BROWN = '#45372B'
const FRAME_BRONZE = '#B08A4F'
const STAND_METAL = '#2B241D'
const TITLE_GOLD = '#D8B56A'
const SUBTITLE_IVORY = '#F1E7D4'
const CAPTION_BRONZE = '#B08D5B'

const FRAME_MARGIN = 0.06
const FRAME_DEPTH = 0.025
const PANEL_DEPTH = 0.02

// Lectern-style forward tilt so the label reads naturally when looked down
// at, like a real museum floor caption stand.
const TILT = -0.35

interface ArtifactLabelProps {
  /** Vietnamese title, e.g. "HÒM PHIẾU BẦU CỬ". */
  title: string
  /** Optional English subtitle, e.g. "1946 General Election Ballot Box". */
  subtitleEn?: string
  year: string
  classification: string
  /** Floor-level position the stand rises from. */
  position: [number, number, number]
  rotationY?: number
  width?: number
  height?: number
}

/** A small floor-standing artifact caption: a thin stand rising to a compact
 * bronze-framed placard, tilted lectern-style for readability. */
export default function ArtifactLabel({
  title,
  subtitleEn,
  year,
  classification,
  position,
  rotationY = 0,
  width = 0.62,
  height = 0.4,
}: ArtifactLabelProps) {
  const [x, plaqueY, z] = position
  const standHeight = Math.max(plaqueY - 0.03, 0.1)

  return (
    <group position={[x, 0, z]} rotation={[0, rotationY, 0]}>
      <mesh position={[0, standHeight / 2, 0]}>
        <cylinderGeometry args={[0.012, 0.015, standHeight, 8]} />
        <meshStandardMaterial color={STAND_METAL} metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Small foot so the stand reads as a placed object, not a rod poking through the floor. */}
      <mesh position={[0, 0.005, 0]}>
        <cylinderGeometry args={[0.05, 0.055, 0.01, 16]} />
        <meshStandardMaterial color={STAND_METAL} metalness={0.55} roughness={0.35} />
      </mesh>

      <group position={[0, plaqueY, 0]} rotation={[TILT, 0, 0]}>
        <mesh position={[0, 0, -0.02]} castShadow receiveShadow>
          <boxGeometry args={[width + FRAME_MARGIN, height + FRAME_MARGIN, FRAME_DEPTH]} />
          <meshStandardMaterial color={FRAME_BRONZE} metalness={0.5} roughness={0.28} />
        </mesh>
        <mesh position={[0, 0, -0.006]} receiveShadow>
          <boxGeometry args={[width, height, PANEL_DEPTH]} />
          <meshStandardMaterial color={PANEL_BROWN} roughness={0.55} metalness={0} />
        </mesh>

        <Text
          fontSize={0.05}
          color={TITLE_GOLD}
          anchorX="center"
          anchorY="middle"
          maxWidth={width - 0.08}
          textAlign="center"
          position={[0, height / 2 - 0.08, 0.012]}
        >
          {title}
        </Text>
        {subtitleEn && (
          <Text
            fontSize={0.028}
            color={SUBTITLE_IVORY}
            anchorX="center"
            anchorY="middle"
            maxWidth={width - 0.08}
            textAlign="center"
            position={[0, height / 2 - 0.16, 0.012]}
          >
            {subtitleEn}
          </Text>
        )}
        <Text
          fontSize={0.026}
          color={CAPTION_BRONZE}
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.04}
          position={[0, -height / 2 + 0.06, 0.012]}
        >
          {`${year} · ${classification}`}
        </Text>
      </group>
    </group>
  )
}

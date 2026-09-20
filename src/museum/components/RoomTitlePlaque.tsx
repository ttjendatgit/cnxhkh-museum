import { Text } from '@react-three/drei'
import ExhibitSpotlight from './ExhibitSpotlight'

const PANEL_BLACK = '#0B0A09'
const BACKING_BLACK = '#050403'
const BRONZE = '#B08A4F'
const BRONZE_DIM = '#8B6A3E'
const GOLD = '#D8B56A'
const GOLD_SOFT = '#C9A26B'
const WARM_LIGHT = '#FFD9A0'

/** Sign size (m). The width is exported so the museum can hang it a fixed gap from a door. */
export const ROOM_PLAQUE_WIDTH = 1.2
const HEIGHT = 0.38

const PANEL_DEPTH = 0.035
const BORDER = 0.03
const BORDER_DEPTH = 0.05
const TEXT_Z = 0.045

export interface RoomTitlePlaqueContent {
  /** Line 1, e.g. "PHÒNG I". */
  roomNumber: string
  /** Line 2, e.g. "1945 – 1954". Leave out for a room with none — the name is then centred alone. */
  period?: string
}

interface RoomTitlePlaqueProps extends RoomTitlePlaqueContent {
  position: [number, number, number]
  rotationY?: number
}

/** The room's navigation sign, hung outside beside its door — orientation only:
 * which room this is, and its period. It introduces nothing; the room's theme
 * lives on the large interior intro board. */
export default function RoomTitlePlaque({ roomNumber, period, position, rotationY = 0 }: RoomTitlePlaqueProps) {
  const width = ROOM_PLAQUE_WIDTH

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <ExhibitSpotlight
        position={[0, HEIGHT / 2 + 0.6, 0.75]}
        targetPosition={[0, 0, 0.04]}
        color={WARM_LIGHT}
        intensity={1.1}
        angle={0.4}
        penumbra={0.75}
        distance={2.8}
        castShadow={false}
      />

      <mesh position={[0, 0, -0.035]} receiveShadow>
        <boxGeometry args={[width + 0.08, HEIGHT + 0.08, 0.016]} />
        <meshStandardMaterial color={BACKING_BLACK} roughness={0.9} metalness={0} />
      </mesh>
      <mesh position={[0, 0, -0.005]} castShadow receiveShadow>
        <boxGeometry args={[width, HEIGHT, PANEL_DEPTH]} />
        <meshStandardMaterial color={PANEL_BLACK} roughness={0.55} metalness={0.05} />
      </mesh>

      {[
        [0, HEIGHT / 2 - BORDER / 2, width, BORDER],
        [0, -(HEIGHT / 2 - BORDER / 2), width, BORDER],
        [-(width / 2 - BORDER / 2), 0, BORDER, HEIGHT],
        [width / 2 - BORDER / 2, 0, BORDER, HEIGHT],
      ].map(([x, y, railWidth, railHeight], index) => (
        <mesh key={`border-${index}`} position={[x, y, 0.02]} castShadow receiveShadow>
          <boxGeometry args={[railWidth, railHeight, BORDER_DEPTH]} />
          <meshStandardMaterial color={index < 2 ? BRONZE : BRONZE_DIM} emissive={GOLD} emissiveIntensity={0.08} metalness={0.5} roughness={0.28} />
        </mesh>
      ))}

      <Text fontSize={0.075} color={GOLD} anchorX="center" anchorY="middle" letterSpacing={0.12} position={[0, period ? 0.045 : 0, TEXT_Z]}>
        {roomNumber}
      </Text>
      {period && (
        <Text fontSize={0.043} color={GOLD_SOFT} anchorX="center" anchorY="middle" letterSpacing={0.1} position={[0, -0.08, TEXT_Z]}>
          {period}
        </Text>
      )}
    </group>
  )
}

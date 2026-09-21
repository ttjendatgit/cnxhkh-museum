import { Text } from '@react-three/drei'
import ExhibitSpotlight from './ExhibitSpotlight'
import RoomSignFrame, { SIGN_GOLD, SIGN_TEXT_Z } from './RoomSignFrame'

const GOLD_SOFT = '#B98F55'
const WARM_LIGHT = '#FFD9A0'

/** Sign size (m). The width is exported so the museum can hang it a fixed gap from a door. */
export const ROOM_PLAQUE_WIDTH = 1.2
const HEIGHT = 0.38

// RoomSignFrame's back face sits at local z 0 and its front at ~0.06; the sign used to span
// about -0.043 .. 0.045 around its mount point, so shift it back to keep the same standoff.
const FRAME_Z = -0.043

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
 * lives on the large interior intro board. Same refined black exhibition look
 * as that board (RoomSignFrame), with widely spaced gilded type. */
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

      <group position={[0, 0, FRAME_Z]}>
        <RoomSignFrame width={width} height={HEIGHT} rail={0.012} lineInset={0.03} lineWidth={0.003}>
          <Text fontSize={0.06} color={SIGN_GOLD} anchorX="center" anchorY="middle" letterSpacing={0.34} position={[0, period ? 0.05 : 0, SIGN_TEXT_Z]}>
            {roomNumber}
          </Text>
          {period && (
            <Text fontSize={0.034} color={GOLD_SOFT} anchorX="center" anchorY="middle" letterSpacing={0.34} position={[0, -0.06, SIGN_TEXT_Z]}>
              {period}
            </Text>
          )}
        </RoomSignFrame>
      </group>
    </group>
  )
}

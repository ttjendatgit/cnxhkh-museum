import { Text } from '@react-three/drei'
import { BoardFrame, BOARD_CHAMPAGNE, BOARD_GOLD, BOARD_IVORY, BOARD_TEXT_Z } from './InteriorRoomIntroBoard'

/** Board size (m). */
export const LOBBY_BOARD_SIZE = { width: 3.4, height: 1.4 }

const TITLE = 'QUYỀN LÀM CHỦ'
const INTRODUCTION = 'Không gian trưng bày số về quá trình hình thành,\nphát triển và thực hành quyền làm chủ của nhân dân.'

// The museum's route, one entry per room, in visiting order.
const ROOMS = [
  { name: 'PHÒNG I', theme: 'Sự ra đời của quyền làm chủ nhân dân' },
  { name: 'PHÒNG II', theme: 'Xây dựng nền dân chủ xã hội chủ nghĩa' },
  { name: 'PHÒNG III', theme: 'Phát huy dân chủ và xây dựng nhà nước pháp quyền' },
  { name: 'PHÒNG KẾT', theme: 'Thử thách quyền làm chủ' },
]

// Two columns of two entries under the introduction.
const COLUMN_X = 0.84
const ROW_Y = [-0.15, -0.45]

interface LobbyIntroductionBoardProps {
  position: [number, number, number]
  rotationY?: number
}

/** The lobby's introduction board: the museum's title, a short statement, and
 * the four rooms with their themes. Same board family as the rooms' intro
 * boards, hung on the lobby's main wall beside the flag and the map. */
export default function LobbyIntroductionBoard({ position, rotationY = 0 }: LobbyIntroductionBoardProps) {
  const { width, height } = LOBBY_BOARD_SIZE

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <BoardFrame width={width} height={height}>
        <Text fontSize={0.2} color={BOARD_CHAMPAGNE} anchorX="center" anchorY="middle" letterSpacing={0.16} position={[0, 0.42, BOARD_TEXT_Z]}>
          {TITLE}
        </Text>
        <Text fontSize={0.072} color={BOARD_IVORY} anchorX="center" anchorY="middle" textAlign="center" lineHeight={1.4} maxWidth={width - 0.6} position={[0, 0.2, BOARD_TEXT_Z]}>
          {INTRODUCTION}
        </Text>
        <mesh position={[0, 0.03, 0.053]}>
          <planeGeometry args={[1.6, 0.006]} />
          <meshBasicMaterial color={BOARD_GOLD} toneMapped={false} />
        </mesh>

        {ROOMS.map((room, index) => {
          const x = index % 2 === 0 ? -COLUMN_X : COLUMN_X
          const y = ROW_Y[Math.floor(index / 2)]
          return (
            <group key={room.name} position={[x, y, BOARD_TEXT_Z]}>
              <Text fontSize={0.075} color={BOARD_GOLD} anchorX="center" anchorY="middle" letterSpacing={0.14} position={[0, 0.07, 0]}>
                {room.name}
              </Text>
              <Text fontSize={0.06} color={BOARD_IVORY} anchorX="center" anchorY="top" textAlign="center" lineHeight={1.25} maxWidth={1.55} position={[0, -0.005, 0]}>
                {room.theme}
              </Text>
            </group>
          )
        })}
      </BoardFrame>
    </group>
  )
}

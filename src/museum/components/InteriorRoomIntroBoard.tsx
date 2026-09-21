import type { ReactNode } from 'react'
import { Text } from '@react-three/drei'
import ExhibitSpotlight from './ExhibitSpotlight'
import RoomSignFrame, { SIGN_TEXT_Z } from './RoomSignFrame'

// Premium museum exhibition board: matte black panel, a thick bronze/gold frame
// with a fine gold line inside it, its own warm spotlight, champagne-gold type.
export const BOARD_PANEL_BLACK = '#080706'
const BACKING_BLACK = '#040302'
const BRONZE = '#B08A4F'
const BRONZE_DIM = '#8B6A3E'
export const BOARD_GOLD = '#D8B56A'
export const BOARD_CHAMPAGNE = '#EAD9A8'
export const BOARD_IVORY = '#F4EBD3'
export const BOARD_BRONZE_TEXT = '#C9995A'
const WARM_LIGHT = '#FFD9A0'
// The room sign's own type colours: warm ivory for the theme, softened bronze for the period.
const SIGN_IVORY = '#EADFC4'
const SIGN_BRONZE = '#B98F55'

// Depth layout, in the board's local +z (0 = the board's back face). The museum
// mounts the group 4cm off the wall face (WALL_MOUNT_GAP), so the back face never
// touches the wall, and the whole board is ~7cm thick. No two faces share a plane:
//   backing plate 0 .. 0.012 | matte panel 0.012 .. 0.048 | frame rails 0.010 .. 0.070
//   fine gold lines at 0.052 | corner blocks 0.054 .. 0.074 | text at 0.056
const OUTER_RAIL = 0.07
const INNER_GAP = 0.06 // between the outer rail and the fine inner gold line
const LINE_WIDTH = 0.014
/** Text sits this far in front of the back face — clear of the panel (0.048) and the gold lines (0.052). */
export const BOARD_TEXT_Z = 0.058

interface BoardFrameProps {
  width: number
  height: number
  children: ReactNode
}

/** The board itself — backing, matte panel, double frame (thick bronze rail plus
 * a fine inner gold line), gold corner blocks and a dedicated warm spotlight —
 * with the text passed in as children. Shared by the room intro boards and the
 * lobby board so every large board reads as one family. */
export function BoardFrame({ width, height, children }: BoardFrameProps) {
  const inner = { width: width - OUTER_RAIL * 2, height: height - OUTER_RAIL * 2 }

  return (
    <group>
      {/* Its own spotlight from above, warm, in front of the board; no shadow map. */}
      <ExhibitSpotlight
        position={[0, height / 2 + 0.9, 1.7]}
        targetPosition={[0, 0, 0.05]}
        color={WARM_LIGHT}
        intensity={2.6}
        angle={0.55}
        penumbra={0.7}
        distance={6}
        castShadow={false}
      />
      <pointLight position={[0, height / 2 - 0.15, 0.7]} color={BOARD_GOLD} intensity={0.22} distance={3.2} decay={2} />

      <mesh position={[0, 0, 0.006]} receiveShadow>
        <boxGeometry args={[width - 0.02, height - 0.02, 0.012]} />
        <meshStandardMaterial color={BACKING_BLACK} roughness={0.9} metalness={0} />
      </mesh>
      <mesh position={[0, 0, 0.03]} castShadow receiveShadow>
        <boxGeometry args={[inner.width, inner.height, 0.036]} />
        <meshStandardMaterial color={BOARD_PANEL_BLACK} roughness={0.7} metalness={0.02} />
      </mesh>

      {/* Outer bronze rails, square and solid: bright top/bottom, deeper sides */}
      {[
        [0, height / 2 - OUTER_RAIL / 2, width, OUTER_RAIL],
        [0, -(height / 2 - OUTER_RAIL / 2), width, OUTER_RAIL],
        [-(width / 2 - OUTER_RAIL / 2), 0, OUTER_RAIL, height - OUTER_RAIL * 2],
        [width / 2 - OUTER_RAIL / 2, 0, OUTER_RAIL, height - OUTER_RAIL * 2],
      ].map(([x, y, railWidth, railHeight], index) => (
        <mesh key={`rail-${index}`} position={[x, y, 0.04]} castShadow receiveShadow>
          <boxGeometry args={[railWidth, railHeight, 0.06]} />
          <meshStandardMaterial color={index < 2 ? BRONZE : BRONZE_DIM} emissive={BOARD_GOLD} emissiveIntensity={0.1} metalness={0.55} roughness={0.26} />
        </mesh>
      ))}

      {/* Second, fine gold border set inside the rail */}
      {[
        [0, inner.height / 2 - INNER_GAP, inner.width - INNER_GAP * 2, LINE_WIDTH],
        [0, -(inner.height / 2 - INNER_GAP), inner.width - INNER_GAP * 2, LINE_WIDTH],
        [-(inner.width / 2 - INNER_GAP), 0, LINE_WIDTH, inner.height - INNER_GAP * 2],
        [inner.width / 2 - INNER_GAP, 0, LINE_WIDTH, inner.height - INNER_GAP * 2],
      ].map(([x, y, w, h], index) => (
        <mesh key={`line-${index}`} position={[x, y, 0.052]}>
          <planeGeometry args={[w, h]} />
          <meshBasicMaterial color={BOARD_GOLD} transparent opacity={0.7} toneMapped={false} />
        </mesh>
      ))}

      {/* Gold corner blocks, a few mm proud of the rails */}
      {[
        [-1, 1],
        [1, 1],
        [-1, -1],
        [1, -1],
      ].map(([sx, sy], index) => (
        <mesh key={`corner-${index}`} position={[sx * (width / 2 - OUTER_RAIL / 2), sy * (height / 2 - OUTER_RAIL / 2), 0.064]}>
          <boxGeometry args={[OUTER_RAIL * 1.4, OUTER_RAIL * 1.4, 0.02]} />
          <meshStandardMaterial color={BOARD_GOLD} emissive={BOARD_GOLD} emissiveIntensity={0.18} metalness={0.6} roughness={0.25} />
        </mesh>
      ))}

      {children}
    </group>
  )
}

/** Board size (m): a hero board that opens a display zone, far larger than the navigation sign outside the door. */
export const INTERIOR_BOARD_SIZE = { width: 3.2, height: 1.4 }

export interface InteriorRoomIntroBoardContent {
  /** Room name, e.g. "PHÒNG I". */
  roomNumber: string
  /** The room's theme. Use "\n" to choose the line breaks (up to three lines). */
  title: string
  /** Period, e.g. "1945 – 1954". Leave out for a room with none — no rule or period line is drawn. */
  period?: string
}

interface InteriorRoomIntroBoardProps extends InteriorRoomIntroBoardContent {
  position: [number, number, number]
  rotationY?: number
}

/** The main introduction board inside a room, hung on the wall to a visitor's right
 * as they step in: room name, theme, a fine rule, and the period. An exhibition
 * board — independent of the small navigation sign outside the door. Styled as a
 * refined black exhibition panel (RoomSignFrame) with widely spaced, softly gilded
 * type and plenty of air; the content is exactly what the room data supplies. */
export default function InteriorRoomIntroBoard({ roomNumber, title, period, position, rotationY = 0 }: InteriorRoomIntroBoardProps) {
  const { width, height } = INTERIOR_BOARD_SIZE
  const lines = title.split('\n')
  // Size the theme from its longest line (capitals with Vietnamese diacritics run about
  // 0.66em per character, plus the letter spacing), so a line break chosen in the data never
  // wraps a second time. Capped well below the room name's presence, and smaller for three lines.
  const longestLine = Math.max(...lines.map((line) => line.length))
  const themeFontSize = Math.min(lines.length > 2 ? 0.105 : 0.13, (width - 0.9) / (longestLine * 0.74))
  // Top to bottom: room name, a short ornamental rule, theme, a longer rule, period.
  const nameY = 0.4
  const ornamentY = 0.27
  const themeY = period ? -0.04 : -0.08
  const ruleY = -0.37
  const periodY = -0.5

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Its own spotlight from above, warm, in front of the board; no shadow map. */}
      <ExhibitSpotlight position={[0, height / 2 + 0.9, 1.7]} targetPosition={[0, 0, 0.05]} color={WARM_LIGHT} intensity={2.6} angle={0.55} penumbra={0.7} distance={6} castShadow={false} />
      <pointLight position={[0, height / 2 - 0.15, 0.7]} color={BOARD_GOLD} intensity={0.22} distance={3.2} decay={2} />

      <RoomSignFrame width={width} height={height} rail={0.022} lineInset={0.075} lineWidth={0.005}>
        <Text fontSize={0.17} color={BOARD_GOLD} anchorX="center" anchorY="middle" letterSpacing={0.42} position={[0, nameY, SIGN_TEXT_Z]}>
          {roomNumber}
        </Text>
        <mesh position={[0, ornamentY, 0.053]}>
          <planeGeometry args={[0.24, 0.004]} />
          <meshBasicMaterial color={BOARD_GOLD} transparent opacity={0.7} toneMapped={false} />
        </mesh>
        <Text
          fontSize={themeFontSize}
          color={SIGN_IVORY}
          anchorX="center"
          anchorY="middle"
          maxWidth={width - 0.7}
          textAlign="center"
          lineHeight={1.5}
          letterSpacing={0.07}
          position={[0, themeY, SIGN_TEXT_Z]}
        >
          {title}
        </Text>
        {period && (
          <>
            <mesh position={[0, ruleY, 0.053]}>
              <planeGeometry args={[0.95, 0.004]} />
              <meshBasicMaterial color={BOARD_GOLD} transparent opacity={0.6} toneMapped={false} />
            </mesh>
            <Text fontSize={0.095} color={SIGN_BRONZE} anchorX="center" anchorY="middle" letterSpacing={0.4} position={[0, periodY, SIGN_TEXT_Z]}>
              {period}
            </Text>
          </>
        )}
      </RoomSignFrame>
    </group>
  )
}

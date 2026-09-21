import type { ReactNode } from 'react'

// The room signs' shared look: a matte black exhibition panel, a slim bronze edge like a real
// museum board's metal trim, and one hairline of gold set inside it. No thick frame and no corner
// blocks — the black and the spaced-out type carry the premium feel. (The lobby board keeps
// BoardFrame from InteriorRoomIntroBoard.tsx; this frame is for the room name signs only.)
const PANEL_BLACK = '#070605'
const BACKING_BLACK = '#030302'
const EDGE_BRONZE = '#9A7842'
const EDGE_BRONZE_LIT = '#B08A4F'
export const SIGN_GOLD = '#D8B56A'

/** Text sits this far in front of the sign's back face — clear of the panel and the hairline. */
export const SIGN_TEXT_Z = 0.058

interface RoomSignFrameProps {
  width: number
  height: number
  /** Width of the bronze edge trim (m). */
  rail: number
  /** How far inside the edge the gold hairline runs (m). */
  lineInset: number
  /** Thickness of the gold hairline (m). */
  lineWidth: number
  children: ReactNode
}

// Depth layout in the sign's local +z (0 = its back face): backing 0 .. 0.012, matte panel
// 0.012 .. 0.048, edge trim 0.010 .. 0.060, hairline plane at 0.052, text at SIGN_TEXT_Z.
// No two faces share a plane, so nothing z-fights.
export default function RoomSignFrame({ width, height, rail, lineInset, lineWidth, children }: RoomSignFrameProps) {
  const inner = { width: width - rail * 2, height: height - rail * 2 }

  return (
    <group>
      <mesh position={[0, 0, 0.006]} receiveShadow>
        <boxGeometry args={[width - 0.01, height - 0.01, 0.012]} />
        <meshStandardMaterial color={BACKING_BLACK} roughness={0.9} metalness={0} />
      </mesh>
      <mesh position={[0, 0, 0.03]} castShadow receiveShadow>
        <boxGeometry args={[inner.width, inner.height, 0.036]} />
        <meshStandardMaterial color={PANEL_BLACK} roughness={0.78} metalness={0.02} />
      </mesh>

      {/* Slim bronze edge: a touch brighter along the top and bottom, deeper at the sides. */}
      {[
        [0, height / 2 - rail / 2, width, rail],
        [0, -(height / 2 - rail / 2), width, rail],
        [-(width / 2 - rail / 2), 0, rail, height - rail * 2],
        [width / 2 - rail / 2, 0, rail, height - rail * 2],
      ].map(([x, y, railWidth, railHeight], index) => (
        <mesh key={`edge-${index}`} position={[x, y, 0.035]} castShadow receiveShadow>
          <boxGeometry args={[railWidth, railHeight, 0.05]} />
          <meshStandardMaterial color={index < 2 ? EDGE_BRONZE_LIT : EDGE_BRONZE} emissive={SIGN_GOLD} emissiveIntensity={0.05} metalness={0.6} roughness={0.3} />
        </mesh>
      ))}

      {/* One fine gold line inside the edge */}
      {[
        [0, inner.height / 2 - lineInset, inner.width - lineInset * 2, lineWidth],
        [0, -(inner.height / 2 - lineInset), inner.width - lineInset * 2, lineWidth],
        [-(inner.width / 2 - lineInset), 0, lineWidth, inner.height - lineInset * 2],
        [inner.width / 2 - lineInset, 0, lineWidth, inner.height - lineInset * 2],
      ].map(([x, y, w, h], index) => (
        <mesh key={`line-${index}`} position={[x, y, 0.052]}>
          <planeGeometry args={[w, h]} />
          <meshBasicMaterial color={SIGN_GOLD} transparent opacity={0.7} toneMapped={false} />
        </mesh>
      ))}

      {children}
    </group>
  )
}

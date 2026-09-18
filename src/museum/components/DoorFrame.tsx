// A thin bronze door casing outlining a doorway opening on both wall
// faces — the same trim family as the baseboard's reveal line and the
// pedestal/stanchion bronze accents, so the opening reads as a deliberately
// finished architectural detail (real depth from the wall's own thickness)
// rather than a raw cut hole.
const FRAME_COLOR = '#A67C52'
const FRAME_WIDTH = 0.045
const FRAME_DEPTH = 0.012
// Small overlap into the wall's own face so the trim's back face is never
// coincident with the wall's front face (the standard z-fight fix used
// throughout this file).
const FACE_OVERLAP = 0.004

interface DoorFrameProps {
  /** Wall-plane Z position the door opening sits in. */
  wallZ: number
  doorX: number
  doorWidth: number
  doorHeight: number
  wallThickness: number
}

export default function DoorFrame({ wallZ, doorX, doorWidth, doorHeight, wallThickness }: DoorFrameProps) {
  const halfDoor = doorWidth / 2
  const jambHeight = doorHeight + FRAME_WIDTH
  const headerWidth = doorWidth + FRAME_WIDTH * 2
  const faceOffset = wallThickness / 2 + FRAME_DEPTH / 2 - FACE_OVERLAP

  const faces = [wallZ + faceOffset, wallZ - faceOffset]

  return (
    <>
      {faces.map((z, index) => (
        <group key={`door-frame-${index}`}>
          <mesh position={[doorX - halfDoor - FRAME_WIDTH / 2, jambHeight / 2, z]}>
            <boxGeometry args={[FRAME_WIDTH, jambHeight, FRAME_DEPTH]} />
            <meshStandardMaterial color={FRAME_COLOR} metalness={0.4} roughness={0.3} />
          </mesh>
          <mesh position={[doorX + halfDoor + FRAME_WIDTH / 2, jambHeight / 2, z]}>
            <boxGeometry args={[FRAME_WIDTH, jambHeight, FRAME_DEPTH]} />
            <meshStandardMaterial color={FRAME_COLOR} metalness={0.4} roughness={0.3} />
          </mesh>
          <mesh position={[doorX, doorHeight + FRAME_WIDTH / 2, z]}>
            <boxGeometry args={[headerWidth, FRAME_WIDTH, FRAME_DEPTH]} />
            <meshStandardMaterial color={FRAME_COLOR} metalness={0.4} roughness={0.3} />
          </mesh>
        </group>
      ))}
    </>
  )
}

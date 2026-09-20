import { useEffect, useRef } from 'react'
import { Text } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, Vector3, type Group, type MeshBasicMaterial } from 'three'
import ContactShadow from '../components/ContactShadow'
import ExhibitSpotlight from '../components/ExhibitSpotlight'
import { RecessedSpot } from '../components/CeilingFixture'
import { WALL_HEIGHT } from '../constants'
import { useFinalGameStore } from './useFinalGameStore'
import { FINAL_STATION_FOOTPRINT, FINAL_STATION_TRIGGER_RADIUS, finalStationPosition } from './finalStation'

// Same bronze / charcoal / gold language as the rest of the museum's fixtures.
const BASE_COLOR = '#0C0B0A'
const BODY_COLOR = '#0E0D0C' // matte black plinth
const BRONZE = '#B08A4F'
const BRONZE_DIM = '#8B6A3E'
const SCREEN_COLOR = '#0A0908'
const CHAMPAGNE = '#EAD9A8'
const GOLD = '#D8B56A'
const AMBER = '#FFB35C'
// Floor ring marking where to stand: just outside the collider's reach, so it
// is always visible around the podium without being walked on top of.
const RING_INNER = 0.62
const RING_OUTER = 0.68

// Small air gaps between stacked parts keep every pair of faces off a shared plane.
const BASE_HEIGHT = 0.06
const BODY_HEIGHT = 0.72 // plinth top ~0.79m; with the display head the terminal stands ~1.17m
/** Display tilt: 17 degrees back from vertical, so it reads from standing eye height. */
const HEAD_TILT = -0.297

interface FinalGameStationProps {
  /** The Final Room's centerZ — the station is positioned relative to it. */
  centerZ: number
}

/** The interactive game station in the Final Room, a museum terminal: matte
 * black plinth, bronze-trimmed display tilted ~17 degrees, a soft gold glow at
 * its foot, standing solid on the floor (see collision.ts).
 * It reports only whether the player is within reach; the E prompt and the
 * game overlay live in FinalGameOverlay. */
export default function FinalGameStation({ centerZ }: FinalGameStationProps) {
  const [x, , z] = finalStationPosition(centerZ)
  const ref = useRef<Group>(null)
  const worldPosition = useRef(new Vector3())
  const wasNearby = useRef(false)
  const ringMaterial = useRef<MeshBasicMaterial>(null)
  const glowMaterial = useRef<MeshBasicMaterial>(null)
  const setNearby = useFinalGameStore((state) => state.setNearby)

  useFrame(({ camera }) => {
    if (!ref.current) return
    ref.current.getWorldPosition(worldPosition.current)
    // Horizontal distance: the camera's eye height shouldn't count against reach.
    const distance = Math.hypot(camera.position.x - worldPosition.current.x, camera.position.z - worldPosition.current.z)
    const isNearby = distance <= FINAL_STATION_TRIGGER_RADIUS
    if (isNearby !== wasNearby.current) {
      wasNearby.current = isNearby
      setNearby(isNearby)
    }
  })

  // Purely visual: a slow, faint breathing on the floor ring/glow that brightens
  // once the player is in reach — the terminal's only sign of life.
  useFrame(({ clock }) => {
    const pulse = 0.5 + 0.5 * Math.sin(clock.elapsedTime * 1.6)
    const boost = wasNearby.current ? 1 : 0
    if (ringMaterial.current) ringMaterial.current.opacity = 0.2 + 0.08 * pulse + 0.3 * boost
    if (glowMaterial.current) glowMaterial.current.opacity = 0.08 + 0.04 * pulse + 0.1 * boost
  })

  // Don't leave a stale "Nhấn E" prompt behind if the station unmounts.
  useEffect(() => () => setNearby(false), [setNearby])

  return (
    <>
      <ContactShadow position={[x, 0, z]} radiusX={0.7} />

      {/* Interaction point: a bronze-gold ring and soft glow on the floor around the podium. */}
      <mesh position={[x, 0.008, z]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={2}>
        <ringGeometry args={[RING_INNER, RING_OUTER, 48]} />
        <meshBasicMaterial ref={ringMaterial} color={GOLD} transparent opacity={0.5} depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh position={[x, 0.006, z]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={2}>
        <circleGeometry args={[RING_OUTER, 48]} />
        <meshBasicMaterial ref={glowMaterial} color={AMBER} transparent opacity={0.12} depthWrite={false} blending={AdditiveBlending} toneMapped={false} />
      </mesh>

      {/* Subtle warm spotlight from the ceiling, angled in from the room side; no shadow map of its own. */}
      <ExhibitSpotlight position={[x + 0.9, WALL_HEIGHT - 0.4, z]} targetPosition={[x, 1.0, z]} color={AMBER} intensity={3.0} angle={0.3} penumbra={0.7} distance={6} castShadow={false} />
      <RecessedSpot position={[x + 0.9, WALL_HEIGHT - 0.02, z]} />
      {/* Rotated to face +X — toward the middle of the room. */}
      <group ref={ref} position={[x, 0, z]} rotation={[0, Math.PI / 2, 0]}>
        <mesh position={[0, 0.005 + BASE_HEIGHT / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[FINAL_STATION_FOOTPRINT, BASE_HEIGHT, FINAL_STATION_FOOTPRINT]} />
          <meshStandardMaterial color={BASE_COLOR} metalness={0.5} roughness={0.35} />
        </mesh>

        {/* Matte black plinth */}
        <mesh position={[0, 0.005 + BASE_HEIGHT + 0.0025 + BODY_HEIGHT / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.5, BODY_HEIGHT, 0.44]} />
          <meshStandardMaterial color={BODY_COLOR} roughness={0.85} metalness={0.02} />
        </mesh>
        {/* Bronze band near the foot and a cap on top of the plinth */}
        <mesh position={[0, 0.15, 0]}>
          <boxGeometry args={[0.52, 0.02, 0.46]} />
          <meshStandardMaterial color={BRONZE_DIM} metalness={0.6} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.802, 0]}>
          <boxGeometry args={[0.54, 0.025, 0.48]} />
          <meshStandardMaterial color={BRONZE} metalness={0.6} roughness={0.28} />
        </mesh>

        {/* Display head, tilted back ~17 degrees, on a short bronze hinge block */}
        <mesh position={[0, 0.83, -0.02]}>
          <boxGeometry args={[0.3, 0.05, 0.12]} />
          <meshStandardMaterial color={BRONZE_DIM} metalness={0.6} roughness={0.3} />
        </mesh>
        <group position={[0, 0.98, 0]} rotation={[HEAD_TILT, 0, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.62, 0.4, 0.06]} />
            <meshStandardMaterial color={BRONZE} emissive={GOLD} emissiveIntensity={0.06} metalness={0.6} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0, 0.033]}>
            <planeGeometry args={[0.54, 0.32]} />
            <meshStandardMaterial color={SCREEN_COLOR} emissive={GOLD} emissiveIntensity={0.1} roughness={0.5} />
          </mesh>
          <Text position={[0, 0.05, 0.037]} fontSize={0.046} color={CHAMPAGNE} anchorX="center" anchorY="middle" maxWidth={0.48} textAlign="center" lineHeight={1.3} letterSpacing={0.05}>
            THỬ THÁCH CUỐI CÙNG
          </Text>
          <mesh position={[0, -0.03, 0.036]}>
            <planeGeometry args={[0.3, 0.003]} />
            <meshBasicMaterial color={GOLD} toneMapped={false} />
          </mesh>
          <Text position={[0, -0.09, 0.037]} fontSize={0.028} color={GOLD} anchorX="center" anchorY="middle" letterSpacing={0.14}>
            NHẤN E ĐỂ BẮT ĐẦU
          </Text>
        </group>

        {/* Gold light at the foot, plus a faint accent so the terminal reads as the room's interactive point. */}
        <pointLight position={[0, 0.12, 0.45]} color={GOLD} intensity={0.35} distance={1.8} decay={2} />
        <pointLight position={[0, 1.4, 0.55]} color={GOLD} intensity={0.4} distance={2.6} decay={2} />
      </group>
    </>
  )
}

import { WALL_HEIGHT, WALL_MOUNT_GAP } from '../constants'
import ExhibitSpotlight from './ExhibitSpotlight'
import { RecessedSpot } from './CeilingFixture'
import FloorFrame from './FloorFrame'
import { Plinth, Vitrine, StanchionRing } from './Exhibit'
import { ExhibitBoard, ImageFrame, InfoPanel } from './WallPanels'
import ArtifactLabel from './ArtifactLabel'
import ArtifactSpotlight from './ArtifactSpotlight'
import ContactShadow from './ContactShadow'

interface RoomBounds {
  centerZ: number
  width: number
  depth: number
  accentColor?: string
}

const PEDESTAL_COLOR = '#E8DEC4'
const KIOSK_COLOR = '#2B2A28'
const FINAL_SCREEN_COLOR = '#141414'
const DEFAULT_ACCENT = '#8f8b80'
const GOLD_SPOT = '#FFC98A'

// A dedicated, deliberately weak accent light for a single wall panel — the
// "exhibition rhythm" of small pools of light along a gallery wall. Always
// weaker/shorter-throw than a RoomLabel plaque's own lighting, and non-
// shadow-casting so a wall of several panels doesn't stack up shadow cost.
const PANEL_ACCENT_COLOR = GOLD_SPOT
const PANEL_ACCENT_INTENSITY = 0.4
const PANEL_ACCENT_DISTANCE = 1.7

// Warm, low, non-shadow pool of light at floor level around a central
// exhibit — the visible "glow falloff on the floor" that separates the hero
// exhibit zone from the surrounding dark stone. A lower decay (softer
// falloff curve) than a typical point light spreads the pool wider without
// raising its peak brightness, so the gradient reads as cinematic rather
// than a small bright dot.
const FLOOR_GLOW_COLOR = GOLD_SPOT
function FloorGlow({
  position,
  intensity = 0.55,
  distance = 4.4,
  decay = 1.5,
}: {
  position: [number, number, number]
  intensity?: number
  distance?: number
  decay?: number
}) {
  return <pointLight position={position} color={FLOOR_GLOW_COLOR} intensity={intensity} distance={distance} decay={decay} />
}

function PanelAccentLight({
  position,
  intensity = PANEL_ACCENT_INTENSITY,
  distance = PANEL_ACCENT_DISTANCE,
}: {
  position: [number, number, number]
  intensity?: number
  distance?: number
}) {
  return (
    <pointLight position={position} color={PANEL_ACCENT_COLOR} intensity={intensity} distance={distance} decay={2} />
  )
}

export function Room1Props({ centerZ, width, depth, accentColor = DEFAULT_ACCENT }: RoomBounds) {
  const halfWidth = width / 2
  // Frames live on the left wall, the timeline on the right wall (which also
  // carries the room's title plaque) so none of the wall-mounted pieces overlap.
  const frameZOffsets = [-depth / 2 + 2.5, 0, depth / 2 - 2.5]
  const timelineZOffsets = [-depth / 2 + 1.5, -depth / 2 + 3.8, depth / 2 - 3.8, depth / 2 - 1.5]

  return (
    <group>
      {frameZOffsets.map((zOffset, index) => (
        <group key={`frame-${index}`}>
          <ImageFrame
            position={[-(halfWidth - WALL_MOUNT_GAP), 1.9, centerZ + zOffset]}
            rotationY={Math.PI / 2}
            width={0.9}
            height={1.3}
          />
          <PanelAccentLight position={[-(halfWidth - WALL_MOUNT_GAP - 0.5), 2.05, centerZ + zOffset]} />
        </group>
      ))}

      {timelineZOffsets.map((zOffset, index) => (
        <group key={`timeline-${index}`}>
          <ExhibitBoard
            position={[halfWidth - WALL_MOUNT_GAP, 1.4, centerZ + zOffset]}
            rotationY={-Math.PI / 2}
            width={1.0}
            height={0.65}
          />
          <PanelAccentLight position={[halfWidth - WALL_MOUNT_GAP - 0.5, 1.55, centerZ + zOffset]} intensity={0.32} distance={1.4} />
        </group>
      ))}

      {/* Central highlighted exhibit zone: the 1946 ballot box, roped off like a protected artifact */}
      <FloorFrame centerZ={centerZ} innerWidth={2.4} innerDepth={2.4} />
      <ContactShadow position={[0, 0, centerZ]} radiusX={1.4} />
      <Plinth
        position={[0, 0, centerZ]}
        baseSize={[2.4, 2.4]}
        riserSize={[0.9, 0.9]}
        baseHeight={0.15}
        riserHeight={0.85}
        color={PEDESTAL_COLOR}
      />
      {/* Riser top sits at 1.005 (5mm floor lift + 0.15 base + 0.85 riser);
          +0.005 more here is a real 5mm air gap above it, not a flush rest. */}
      <mesh position={[0, 1.21, centerZ]} castShadow receiveShadow>
        <boxGeometry args={[0.5, 0.4, 0.35]} />
        <meshStandardMaterial color="#5C4630" roughness={0.5} metalness={0.05} />
      </mesh>
      <StanchionRing center={[0, centerZ]} radius={1.9} />
      <ArtifactLabel
        title="HÒM PHIẾU BẦU CỬ"
        subtitleEn="1946 General Election Ballot Box"
        year="1946"
        classification="HIỆN VẬT PHỤC CHẾ"
        position={[0, 0.92, centerZ + 2.25]}
      />

      {/* Dedicated hero spotlight on the 1946 ballot box — the room's main focal point. */}
      <ArtifactSpotlight
        position={[0, WALL_HEIGHT - 0.4, centerZ]}
        targetPosition={[0, 0, centerZ]}
        intensity={4.0}
        angle={0.7}
        penumbra={0.78}
        distance={8}
      />
      <RecessedSpot position={[0, WALL_HEIGHT - 0.02, centerZ]} />
      {/* Warm floor-level glow pooling around the ballot-box pedestal. */}
      <FloorGlow position={[0, 0.3, centerZ]} intensity={0.55} distance={4.8} decay={1.5} />
      {/* Supporting fill so the side-wall frames/timeline boards aren't left in shadow. */}
      <pointLight position={[0, 1.6, centerZ - 1.6]} intensity={0.5} distance={5.5} color={accentColor} />
      <pointLight position={[0, 1.7, centerZ]} intensity={0.5} distance={6.5} color={GOLD_SPOT} />
    </group>
  )
}

export function Room2Props({ centerZ, width, accentColor = DEFAULT_ACCENT }: RoomBounds) {
  const halfWidth = width / 2
  const pillarCount = 6
  const radius = 3

  return (
    <group>
      <InfoPanel
        position={[-(halfWidth - WALL_MOUNT_GAP), 2.0, centerZ]}
        rotationY={Math.PI / 2}
        width={2.4}
        height={1.5}
      />
      <PanelAccentLight position={[-(halfWidth - WALL_MOUNT_GAP - 0.6), 2.15, centerZ]} intensity={0.45} distance={2.1} />

      {/* Constitution exhibit: pedestal + bound document, enclosed in a framed glass case */}
      <FloorFrame centerZ={centerZ} innerWidth={2.0} innerDepth={1.5} />
      <ContactShadow position={[0, 0, centerZ]} radiusX={1.2} radiusZ={0.95} />
      <Plinth
        position={[0, 0, centerZ]}
        baseSize={[1.8, 1.3]}
        riserSize={[1.5, 1.0]}
        baseHeight={0.12}
        riserHeight={0.75}
        color={PEDESTAL_COLOR}
      />
      {/* Riser top sits at 0.875 (5mm floor lift + 0.12 base + 0.75 riser);
          +0.005 more here is a real 5mm air gap above it, not a flush rest. */}
      <mesh position={[0, 0.92, centerZ]} castShadow receiveShadow>
        <boxGeometry args={[0.6, 0.08, 0.42]} />
        <meshStandardMaterial color="#4A3524" roughness={0.5} metalness={0.05} />
      </mesh>
      <Vitrine position={[0, 0, centerZ]} size={[2.0, 1.3, 1.5]} />
      <ArtifactLabel
        title="BẢN HIẾN PHÁP"
        subtitleEn="The Constitution (Document Replica)"
        year="1946"
        classification="HIỆN VẬT PHỤC CHẾ"
        position={[0, 0.95, centerZ + 1.6]}
      />

      {Array.from({ length: pillarCount }).map((_, index) => {
        const angle = (index / pillarCount) * Math.PI * 2
        const x = Math.cos(angle) * radius
        const z = centerZ + Math.sin(angle) * radius
        return (
          <group key={`pillar-${index}`}>
            {/* Shaved 5mm off the bottom (top held fixed at 1.2, well clear of
                the collar ring at 1.16) so the base isn't coincident with the floor. */}
            <mesh position={[x, 0.6025, z]} castShadow receiveShadow>
              <cylinderGeometry args={[0.22, 0.22, 1.195, 12]} />
              <meshStandardMaterial color={PEDESTAL_COLOR} roughness={0.4} metalness={0.05} />
            </mesh>
            <mesh position={[x, 1.16, z]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.225, 0.02, 8, 16]} />
              <meshStandardMaterial color={accentColor} metalness={0.5} roughness={0.3} />
            </mesh>
            <mesh position={[x, 0.04, z]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.225, 0.02, 8, 16]} />
              <meshStandardMaterial color={accentColor} metalness={0.5} roughness={0.3} />
            </mesh>
          </group>
        )
      })}

      {/* Dedicated hero spotlight on the constitution vitrine — soft/wide
          penumbra keeps the glass from throwing back a hard reflection. */}
      <ArtifactSpotlight
        position={[0, WALL_HEIGHT - 0.4, centerZ]}
        targetPosition={[0, 0, centerZ]}
        intensity={3.7}
        angle={0.66}
        penumbra={0.8}
        distance={8}
      />
      <RecessedSpot position={[0, WALL_HEIGHT - 0.02, centerZ]} />
      {/* Warm floor-level glow pooling around the constitution vitrine. */}
      <FloorGlow position={[0, 0.3, centerZ]} intensity={0.55} distance={4.8} decay={1.5} />
      {/* Supporting fill so the info panel and pillar ring aren't left in shadow. */}
      <pointLight position={[0, 1.4, centerZ + 1.6]} intensity={0.5} distance={5.5} color={accentColor} />
      <pointLight position={[0, 1.7, centerZ]} intensity={0.5} distance={6.5} color={GOLD_SPOT} />
    </group>
  )
}

export function Room3Props({ centerZ, width, depth, accentColor = DEFAULT_ACCENT }: RoomBounds) {
  const halfWidth = width / 2
  const screenZOffsets = [-depth / 2 + 3, 0, depth / 2 - 3]
  const kioskPosition: [number, number, number] = [halfWidth - 1.6, 0, centerZ + depth / 2 - 2]

  return (
    <group>
      {screenZOffsets.map((zOffset, index) => (
        <group key={`screen-${index}`}>
          {/* wall -> 5mm -> backing plate -> 3mm -> display surface */}
          <mesh position={[-(halfWidth - 0.205), 1.6, centerZ + zOffset]} receiveShadow>
            <boxGeometry args={[0.1, 1.14, 1.72]} />
            <meshStandardMaterial color={KIOSK_COLOR} />
          </mesh>
          <mesh position={[-(halfWidth - 0.273), 1.6, centerZ + zOffset]}>
            <boxGeometry args={[0.03, 1.0, 1.6]} />
            <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={0.75} />
          </mesh>
        </group>
      ))}

      {/* Placed at the far end of the right wall, clear of both the room
          label plaque (centered) and the kiosk (near the front). */}
      <InfoPanel
        position={[halfWidth - WALL_MOUNT_GAP, 2.0, centerZ - (depth / 2 - 1.8)]}
        rotationY={-Math.PI / 2}
        width={2.2}
        height={1.5}
      />
      <PanelAccentLight
        position={[halfWidth - WALL_MOUNT_GAP - 0.6, 2.15, centerZ - (depth / 2 - 1.8)]}
        intensity={0.45}
        distance={2.1}
      />

      {/* Terminal / kiosk placeholder with its own small display */}
      <FloorFrame
        centerX={kioskPosition[0]}
        centerZ={kioskPosition[2]}
        innerWidth={0.6}
        innerDepth={0.5}
        accentGap={0.15}
        borderGap={0.45}
      />
      {/* Top held fixed at 0.06; bottom shaved up 5mm so it isn't coincident with the floor. */}
      <mesh position={[kioskPosition[0], 0.0325, kioskPosition[2]]} castShadow receiveShadow>
        <boxGeometry args={[0.7, 0.055, 0.6]} />
        <meshStandardMaterial color="#1E1E1E" metalness={0.5} roughness={0.35} />
      </mesh>
      {/* Real 5mm air gap above the baseplate's top (0.06) instead of a flush rest. */}
      <mesh position={[kioskPosition[0], 0.615, kioskPosition[2]]} castShadow receiveShadow>
        <boxGeometry args={[0.6, 1.1, 0.5]} />
        <meshStandardMaterial color={KIOSK_COLOR} />
      </mesh>
      {/* kiosk body front face is at +0.25; back face of the display sits 3mm clear of it */}
      <mesh position={[kioskPosition[0], 0.91, kioskPosition[2] + 0.263]}>
        <boxGeometry args={[0.32, 0.22, 0.02]} />
        <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={0.8} />
      </mesh>

      {/* Room III intentionally has no hero artifact spotlight — the kiosk is
          interactive furniture, not the room's focal artifact, so it only
          gets a light accent instead of ArtifactSpotlight's hero treatment. */}
      <ExhibitSpotlight
        position={[kioskPosition[0], WALL_HEIGHT - 0.4, kioskPosition[2]]}
        targetPosition={kioskPosition}
        intensity={1.8}
        angle={0.28}
        penumbra={0.6}
        distance={7}
        color={GOLD_SPOT}
      />
      <RecessedSpot position={[kioskPosition[0], WALL_HEIGHT - 0.02, kioskPosition[2]]} />
      {/* Warm floor-level glow pooling around the kiosk. */}
      <FloorGlow position={[kioskPosition[0], 0.25, kioskPosition[2]]} intensity={0.48} distance={3.8} decay={1.5} />
      {/* Supporting fill so the info panel on the far wall isn't left in shadow. */}
      <pointLight position={[0, 1.7, centerZ]} intensity={0.5} distance={7} color={GOLD_SPOT} />
    </group>
  )
}

export function FinalRoomProps({ centerZ, depth }: RoomBounds) {
  // +0.15 reaches the closed back wall's own face exactly; +0.055 more
  // clears it by 5mm so the screen isn't centered on the wall surface.
  const screenZ = centerZ - depth / 2 + 0.205
  const spotZ = screenZ + 2.2
  const viewingPadZ = screenZ + 2.6
  const columnZ = screenZ + 1.3
  const columnX = 3.3

  return (
    <group>
      {/* Viewing pad in front of the screen — framed the same way as the other galleries' exhibit zones */}
      <FloorFrame centerZ={viewingPadZ} innerWidth={4.5} innerDepth={2.2} borderGap={0.7} />

      {/* Gold portal frame around the screen — a proscenium marking the museum's closing statement */}
      <mesh position={[0, 3.58, screenZ + 0.08]}>
        <boxGeometry args={[6.5, 0.16, 0.08]} />
        <meshStandardMaterial color="#B89B5E" metalness={0.55} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.42, screenZ + 0.08]}>
        <boxGeometry args={[6.5, 0.16, 0.08]} />
        <meshStandardMaterial color="#B89B5E" metalness={0.55} roughness={0.3} />
      </mesh>
      <mesh position={[-3.17, 2, screenZ + 0.08]}>
        <boxGeometry args={[0.16, 3.32, 0.08]} />
        <meshStandardMaterial color="#B89B5E" metalness={0.55} roughness={0.3} />
      </mesh>
      <mesh position={[3.17, 2, screenZ + 0.08]}>
        <boxGeometry args={[0.16, 3.32, 0.08]} />
        <meshStandardMaterial color="#B89B5E" metalness={0.55} roughness={0.3} />
      </mesh>

      <mesh position={[0, 2, screenZ]} castShadow receiveShadow>
        <boxGeometry args={[6, 3, 0.1]} />
        <meshStandardMaterial color={FINAL_SCREEN_COLOR} />
      </mesh>
      {/* Digital accent strip beneath the final screen, clear of the gold frame's bottom bar */}
      <mesh position={[0, 0.18, screenZ + 0.06]}>
        <boxGeometry args={[5.6, 0.06, 0.04]} />
        <meshStandardMaterial color="#1677FF" emissive="#1677FF" emissiveIntensity={0.9} />
      </mesh>

      {/* Flanking light columns for symmetry and gravitas */}
      {[-columnX, columnX].map((x) => (
        <group key={`column-${x}`}>
          {/* Top held fixed at 2.2 (keeps the 5mm gap to the cap above); bottom
              shaved up 5mm so it isn't coincident with the floor. */}
          <mesh position={[x, 1.1025, columnZ]} castShadow receiveShadow>
            <boxGeometry args={[0.22, 2.195, 0.22]} />
            <meshStandardMaterial color="#1C1C1C" roughness={0.4} metalness={0.15} />
          </mesh>
          <mesh position={[x, 2.22, columnZ]}>
            <boxGeometry args={[0.24, 0.03, 0.24]} />
            <meshStandardMaterial color="#B89B5E" metalness={0.5} roughness={0.3} />
          </mesh>
          <mesh position={[x, 2.32, columnZ]}>
            <sphereGeometry args={[0.09, 12, 12]} />
            <meshStandardMaterial color="#FFB35C" emissive="#FFB35C" emissiveIntensity={0.85} />
          </mesh>
        </group>
      ))}

      <ExhibitSpotlight
        position={[0, WALL_HEIGHT - 0.4, spotZ]}
        targetPosition={[0, 2, screenZ]}
        intensity={5.6}
        angle={0.32}
        penumbra={0.5}
        distance={9}
        color="#FFB35C"
      />
      <RecessedSpot position={[0, WALL_HEIGHT - 0.02, spotZ]} />
      {/* Warm floor-level glow pooling on the viewing pad, layered under the
          existing cool accent strip light for the closing room's own mood. */}
      <FloorGlow position={[0, 0.3, viewingPadZ]} intensity={0.5} distance={5.0} decay={1.5} />
      <pointLight position={[0, 1.0, viewingPadZ]} intensity={0.3} distance={5} color="#1677FF" />
    </group>
  )
}

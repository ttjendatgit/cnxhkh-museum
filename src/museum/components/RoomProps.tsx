import { Text } from '@react-three/drei'
import { WALL_HEIGHT, WALL_MOUNT_GAP } from '../constants'
import ExhibitSpotlight from './ExhibitSpotlight'
import { RecessedSpot } from './CeilingFixture'
import FloorFrame from './FloorFrame'
import { Plinth, Vitrine, StanchionRing } from './Exhibit'
import { ExhibitBoard, InfoPanel } from './WallPanels'
import ArtifactLabel from './ArtifactLabel'
import ArtifactSpotlight from './ArtifactSpotlight'
import ArtifactFrame from './ArtifactFrame'
import ArtifactTrigger from './ArtifactTrigger'
import BallotBox1946 from './BallotBox1946'
import GlassDisplay from './GlassDisplay'
import ContactShadow from './ContactShadow'
import FinalGameStation from '../final-room/FinalGameStation'
import FinalRoomScreen from '../final-room/FinalRoomScreen'
import LedVideoSurface from './LedVideoSurface'
import { VIDEO_COMMUNITY_SERVICES, VIDEO_VIETNAM_RISING, VIDEO_VIETNAM_THROUGH_PERIODS, type MuseumVideo } from '../data/room3Videos'
import KioskTrigger from './KioskTrigger'
import { BALLOT_BOX_1946, ROOM1_WALL_ARTIFACTS, ROOM2_ARTIFACTS, ROOM3_ARTIFACTS } from '../data/artifacts'

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
const BALLOT_BOX_SCALE = 0.494
const ROOM_1_PEDESTAL_TOP = 1.005

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
  const frameLightZOffsets = [-depth / 2 + 2.5, 0, depth / 2 - 2.5]
  const timelineZOffsets = [-depth / 2 + 1.5, -depth / 2 + 3.8, depth / 2 - 3.8, depth / 2 - 1.5]

  return (
    <group>
      {/* Every wall frame is its own artifact (own title/description/
          significance/gallery — see ROOM1_WALL_ARTIFACTS), in the same slots
          the room's frames always occupied. Walk up and press E. */}
      {ROOM1_WALL_ARTIFACTS.map((artifact) => (
        <ArtifactFrame key={artifact.id} artifact={artifact} />
      ))}

      {/* The ballot box on the pedestal is an artifact too: an invisible
          trigger at the model opens its panel with the 360° viewer. The
          model itself is not duplicated or replaced. */}
      <ArtifactTrigger artifact={BALLOT_BOX_1946} />

      {frameLightZOffsets.map((zOffset) => (
        <PanelAccentLight
          key={`frame-light-${zOffset}`}
          position={[-(halfWidth - WALL_MOUNT_GAP - 0.5), 2.05, centerZ + zOffset]}
        />
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
        riserSize={[1.56, 1.16]}
        baseHeight={0.15}
        riserHeight={0.85}
        color={PEDESTAL_COLOR}
      />
      <GlassDisplay position={[0, ROOM_1_PEDESTAL_TOP, centerZ]} size={[1.458, 0.975, 1.053]}>
        <BallotBox1946 position={[0, 0.005, 0]} rotation={[0, 0, 0]} scale={BALLOT_BOX_SCALE} />
      </GlassDisplay>
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

      {/* Four interactive artifacts on the side walls (2 left, 2 right),
          offset ±4.5 from centerZ so they clear the InfoPanel (left, near
          centerZ) and the room-title plaque (right, near centerZ) — walk up
          and press E, same interaction system as Room 1's ballot box. */}
      {ROOM2_ARTIFACTS.map((artifact) => (
        <ArtifactFrame key={artifact.id} artifact={artifact} />
      ))}

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

const LED_FRAME_COLOR = '#2A1F17'
const LED_TRIM_COLOR = '#9C7C4E'
const LED_GOLD = '#D8B56A'
// Width of the bronze trim around a screen's display: a thin line, not a thick frame.
const TRIM = 0.022
const LED_SURFACE_COLOR = '#0B0907'
const LED_LABEL_COLOR = '#2B241D'
const LED_LABEL_TEXT = '#F1E7D4'
const LED_LABEL_DIM = '#B08A4F'
const LED_LIGHT_COLOR = '#FFD9A0'

interface LedScreenProps {
  /** On the wall's centreline; `rotationY` turns the screen's +z to face into the room. */
  position: [number, number, number]
  rotationY: number
  /** Backing plate size in metres — the display is 0.12 narrower and 0.14 shorter. With a
   * `video` this is the largest the screen may be: it is shrunk to the video's own shape. */
  width: number
  height: number
  /** Caption plate under the screen: a title and a short descriptor. */
  label: string
  caption: string
  /** The video this screen plays. Its frame then takes the video's aspect ratio (within
   * `width` x `height`), so the picture fills the display with no bars, stretching or cropping. */
  video?: MuseumVideo
}

/** An LED media screen as an exhibition focal point: dark glass in a bronze
 * frame, washed by its own warm spotlight, with a caption plate beneath in the
 * same style as the artifact captions. Plays its video (muted, looping) when it has one. */
function LedScreen({ position, rotationY, width: maxWidth, height: maxHeight, label, caption, video }: LedScreenProps) {
  // Without a video the display fills the slot. With one, it takes the video's shape inside the
  // slot, so the thin frame hugs the picture the way a real portrait/landscape monitor would.
  const maxDisplayWidth = maxWidth - 0.12
  const maxDisplayHeight = maxHeight - 0.14
  const fit = video ? Math.min(maxDisplayWidth / video.width, maxDisplayHeight / video.height) : 1
  const displayWidth = video ? video.width * fit : maxDisplayWidth
  const displayHeight = video ? video.height * fit : maxDisplayHeight
  const width = displayWidth + 0.12
  const height = displayHeight + 0.14
  const displayZ = 0.273 // display centre: wall -> 5mm -> backing plate -> 3mm -> display surface
  const faceZ = displayZ + 0.015
  // Wide enough for the title even under a narrow portrait screen.
  const plateWidth = Math.max(Math.min(width, 2.4), 1.4)

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Warm wall-wash from the ceiling, no shadow map of its own — this is what makes the screen the focal point. */}
      <ExhibitSpotlight
        position={[0, WALL_HEIGHT - 0.4 - position[1], 1.7]}
        targetPosition={[0, 0, 0.3]}
        color={LED_LIGHT_COLOR}
        intensity={2.4}
        angle={0.55}
        penumbra={0.75}
        distance={7}
        castShadow={false}
      />
      <RecessedSpot position={[0, WALL_HEIGHT - 0.02 - position[1], 1.7]} />

      <mesh position={[0, 0, 0.205]} receiveShadow>
        <boxGeometry args={[width, height, 0.1]} />
        <meshStandardMaterial color={LED_FRAME_COLOR} metalness={0.25} roughness={0.55} />
      </mesh>
      <mesh position={[0, 0, displayZ]}>
        <boxGeometry args={[displayWidth, displayHeight, 0.03]} />
        <meshStandardMaterial color={LED_SURFACE_COLOR} emissive={LED_GOLD} emissiveIntensity={0.05} roughness={0.3} metalness={0.15} />
      </mesh>
      {/* Bronze trim just outside the display, with a fine glowing gold line along its inner edge */}
      {[
        [0, displayHeight / 2 + TRIM / 2, displayWidth + TRIM * 2, TRIM],
        [0, -(displayHeight / 2 + TRIM / 2), displayWidth + TRIM * 2, TRIM],
        [-(displayWidth / 2 + TRIM / 2), 0, TRIM, displayHeight],
        [displayWidth / 2 + TRIM / 2, 0, TRIM, displayHeight],
      ].map(([x, y, railWidth, railHeight], index) => (
        <mesh key={`trim-${index}`} position={[x, y, faceZ]}>
          <boxGeometry args={[railWidth, railHeight, 0.02]} />
          <meshStandardMaterial color={LED_TRIM_COLOR} emissive={LED_GOLD} emissiveIntensity={0.06} metalness={0.45} roughness={0.36} />
        </mesh>
      ))}
      <mesh position={[0, 0, faceZ + 0.001]}>
        <planeGeometry args={[displayWidth - 0.06, 0.006]} />
        <meshBasicMaterial color={LED_GOLD} transparent opacity={0.4} toneMapped={false} />
      </mesh>
      {video && <LedVideoSurface video={video} displayWidth={displayWidth} displayHeight={displayHeight} z={faceZ + 0.002} />}

      {/* Caption plate under the screen — same plate style as the artifact captions */}
      <group position={[0, -(height / 2 + 0.2), 0.26]}>
        <mesh position={[0, 0, -0.008]}>
          <boxGeometry args={[plateWidth, 0.26, 0.025]} />
          <meshStandardMaterial color={LED_LABEL_COLOR} metalness={0.28} roughness={0.5} />
        </mesh>
        <Text position={[0, 0.045, 0.008]} fontSize={0.055} color={LED_LABEL_TEXT} anchorX="center" anchorY="middle" maxWidth={plateWidth - 0.14} textAlign="center" letterSpacing={0.05}>
          {label}
        </Text>
        <Text position={[0, -0.055, 0.008]} fontSize={0.033} color={LED_LABEL_DIM} anchorX="center" anchorY="middle" maxWidth={plateWidth - 0.14} textAlign="center">
          {caption}
        </Text>
      </group>
    </group>
  )
}

export function Room3Props({ centerZ, width, depth, accentColor = DEFAULT_ACCENT }: RoomBounds) {
  const halfWidth = width / 2
  const kioskPosition: [number, number, number] = [halfWidth - 1.6, 0, centerZ + depth / 2 - 2]

  return (
    <group>
      {/* Room III's gallery plan — the intro board comes first, then the artifacts, then the
          LEDs, and no wall carries more than a couple of highlights:
            right wall  : the room's large intro board (Museum.tsx), centred, with the info
                          panel and the kiosk zone clear on either side of it
            left wall   : artifact 15, a video screen, artifact 16
                          — the screen keeps 1.5m of clear wall from each frame
            back wall   : a video screen straight ahead on the entry axis,
                          and artifact 18 beyond the exit door
            front wall  : artifact 17 beside the entrance door, and a video screen on the far side
                          of the door — well clear of the kiosk, which is a lookup point, not a screen
          Three video walls, one per wall: the timeline video on the left wall, the "rising" video
          on the back wall, the community / public-services video on the front wall. They play
          muted on a loop; E next to one opens the large player (VideoPlayerOverlay). */}
      <LedScreen
        position={[-2.4, 1.6, centerZ - depth / 2]}
        rotationY={0}
        width={2.4}
        height={1.3}
        label={VIDEO_VIETNAM_RISING.title}
        caption="Video tư liệu"
        video={VIDEO_VIETNAM_RISING}
      />
      <LedScreen
        position={[-halfWidth, 1.6, centerZ]}
        rotationY={Math.PI / 2}
        width={3.0}
        height={1.3}
        label={VIDEO_VIETNAM_THROUGH_PERIODS.title}
        caption="Video tư liệu"
        video={VIDEO_VIETNAM_THROUGH_PERIODS}
      />
      {/* Slot 2.0 x 1.14 — the front-wall screen's original size: a 16:9 picture fills it as a
          1.9 x 1.14 frame, between the portrait and the near-square screens in scale. */}
      <LedScreen
        position={[2.0, 1.6, centerZ + depth / 2]}
        rotationY={Math.PI}
        width={2.0}
        height={1.14}
        label={VIDEO_COMMUNITY_SERVICES.title}
        caption="Video tư liệu"
        video={VIDEO_COMMUNITY_SERVICES}
      />

      {/* The four primary exhibits — same artifact system as Rooms 1 and 2 (walk
          up and press E), spread over three walls: two on the left wall, one on
          the front wall left of the entrance door, one on the back wall right of
          the exit door. Positions come from the artifact data. */}
      {ROOM3_ARTIFACTS.map((artifact) => {
        // A weak accent light 0.5m in front of the frame, along the way it faces.
        const facing = artifact.rotation?.y ?? 0
        const lightPosition: [number, number, number] = [artifact.position.x + Math.sin(facing) * 0.5, 2.05, artifact.position.z + Math.cos(facing) * 0.5]
        return (
          <group key={artifact.id}>
            <ArtifactFrame artifact={artifact} />
            <PanelAccentLight position={lightPosition} />
          </group>
        )
      })}

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

      {/* The kiosk is a lookup point (sources, source ledger, FAQ) — E opens its panel (KioskPanel);
          it never plays video. Invisible: it adds no geometry to the kiosk model above. */}
      <KioskTrigger position={[kioskPosition[0], 0.95, kioskPosition[2] + 0.3]} />

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

export function FinalRoomProps({ centerZ, width, depth }: RoomBounds) {
  // +0.15 reaches the closed back wall's own face exactly; +0.055 more
  // clears it by 5mm so the screen isn't centered on the wall surface.
  const screenZ = centerZ - depth / 2 + 0.205
  const spotZ = screenZ + 2.2
  const viewingPadZ = screenZ + 2.6
  const columnZ = screenZ + 1.3
  const columnX = 3.3

  return (
    <group>
      {/* The interactive game station (press E) — solid, see collision.ts */}
      <FinalGameStation centerZ={centerZ} />

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
      {/* Public leaderboard shown on the screen face (waiting / live / final result) */}
      <FinalRoomScreen centerZ={centerZ} width={width} depth={depth} screenZ={screenZ} />
      {/* Bronze-gold accent strip beneath the final screen, clear of the gold frame's bottom bar */}
      <mesh position={[0, 0.18, screenZ + 0.06]}>
        <boxGeometry args={[5.6, 0.06, 0.04]} />
        <meshStandardMaterial color="#D8B56A" emissive="#D8B56A" emissiveIntensity={0.9} />
      </mesh>
      {/* Faint warm spill from the lit screen onto the floor and columns */}
      <pointLight position={[0, 2, screenZ + 1.0]} intensity={0.35} distance={6} decay={2} color="#D8B56A" />

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
        intensity={6.6}
        angle={0.32}
        penumbra={0.5}
        distance={9}
        color="#FFB35C"
      />
      <RecessedSpot position={[0, WALL_HEIGHT - 0.02, spotZ]} />
      {/* Warm floor-level glow pooling on the viewing pad, with a deeper bronze-amber
          fill above it so the closing room stays in the museum's bronze palette. */}
      <FloorGlow position={[0, 0.3, viewingPadZ]} intensity={0.5} distance={5.0} decay={1.5} />
      <pointLight position={[0, 1.0, viewingPadZ]} intensity={0.3} distance={5} color="#D89A4A" />
    </group>
  )
}

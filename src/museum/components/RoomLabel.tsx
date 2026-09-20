import { Text } from '@react-three/drei'
import ExhibitSpotlight from './ExhibitSpotlight'

const PANEL_BROWN = '#3D2F24' // deep inset panel
const FRAME_BRONZE = '#A9824A' // main frame body
const TRIM_BRONZE = '#D4AE6C' // brighter bronze — outer highlight edge + inner accent lip
const BEVEL_SHADOW = '#1C130D' // deep recessed groove
const BACKING_COLOR = '#120B06' // dark shadow plate mounted at the wall
const TITLE_GOLD = '#D8B56A'
const SUBTITLE_IVORY = '#F1E7D4'
const PERIOD_BRONZE = '#B08D5B'
const CHAPTER_BRONZE = '#C9A26B'

// Margins (total width/height added), largest to smallest. Six layers —
// backing, bright outer trim, main frame body, dark bevel groove, a bright
// inner accent lip, and the deep-set panel — read as a deliberate hierarchy
// of relief rather than a single flat plaque.
const BACKING_MARGIN = 0.7
const OUTER_TRIM_MARGIN = 0.62
const FRAME_MARGIN = 0.46
const BEVEL_MARGIN = 0.22
const INNER_LIP_MARGIN = 0.1

// Relief depth of each layer (box z-thickness) — noticeably deeper than a
// thin plaque so every step is legible at normal viewing distance.
const BACKING_DEPTH = 0.02
const OUTER_TRIM_DEPTH = 0.05
const FRAME_DEPTH = 0.06
const BEVEL_DEPTH = 0.05
const INNER_LIP_DEPTH = 0.025
const PANEL_DEPTH = 0.07

// Z-centers, back (at the wall) to front (facing the viewer). Real air gaps
// are left at the two major transitions — backing-to-trim and frame-to-bevel
// — so those steps pick up natural cast shadow from the room's existing
// lights; the trim/frame and lip/panel pairs overlap solidly instead, so
// they read as one continuous piece at each of those joins.
const BACKING_Z = -0.3
const OUTER_TRIM_Z = -0.24
const FRAME_BODY_Z = -0.205
const BEVEL_Z = -0.12
const INNER_LIP_Z = -0.085
const PANEL_Z = -0.02

// Text sits well clear of the panel's front face (-0.02 + 0.035 = -0.015)
// now that the panel itself is set deeper into the relief.
const TEXT_Z = 0.05

// Fill/shadow spotlight — a gallery pick light mounted above and in front of
// the plaque, aimed a little above center. This is the one that casts the
// plaque's shadow onto the backing plate. Strengthened this pass so the
// plaque reads as the room's strongest wall focal point.
const ACCENT_LIGHT_COLOR = '#FFD9A0'
const ACCENT_LIGHT_INTENSITY = 2.0
const ACCENT_LIGHT_ANGLE = 0.5
const ACCENT_LIGHT_PENUMBRA = 0.55
const ACCENT_LIGHT_DISTANCE = 2.8

// Top-down key light — mounted higher and closer to the wall than the fill
// spot above, so it rakes down more steeply across the frame/trim/title.
// This is what actually sells the bronze relief and gold typography as
// reflective, dimensional surfaces rather than a flat printed board. Kept
// shadow-free (it layers highlight only) so it doesn't double the shadow
// cost per plaque — the fill spot above remains the sole shadow-caster.
const KEY_LIGHT_COLOR = '#FFE3B8'
const KEY_LIGHT_INTENSITY = 1.6
const KEY_LIGHT_ANGLE = 0.32
const KEY_LIGHT_PENUMBRA = 0.6
const KEY_LIGHT_DISTANCE = 2.2

// Soft warm-bronze separation/rim light, tucked behind the backing plate
// (between it and the wall) so the relief layers pick up a clearer rim and
// the plaque visibly lifts off the wall, without the wall itself blowing out.
const SEPARATION_LIGHT_COLOR = '#C89B55'
const SEPARATION_LIGHT_INTENSITY = 0.4
const SEPARATION_LIGHT_DISTANCE = 1.6

/** Reads a trailing Roman numeral off a title ("PHÒNG III" -> "III") and
 * returns it as a zero-padded chapter number, or null if the title doesn't
 * end in one (e.g. "SẢNH", "PHÒNG KẾT") — those get no chapter indicator. */
function chapterFromTitle(title: string): string | null {
  const match = title.trim().match(/\b([IVXLCDM]+)$/)
  if (!match) return null
  const romanValues: Record<string, number> = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 }
  const roman = match[1]
  let total = 0
  for (let i = 0; i < roman.length; i++) {
    const current = romanValues[roman[i]]
    const next = romanValues[roman[i + 1]]
    total += next && current < next ? -current : current
  }
  return total > 0 ? String(total).padStart(2, '0') : null
}

interface RoomLabelProps {
  title: string
  subtitle?: string
  position: [number, number, number]
  rotationY?: number
  panelWidth?: number
  accentColor?: string
  periodLabel?: string
}

export default function RoomLabel({
  title,
  subtitle,
  position,
  rotationY = 0,
  panelWidth = 4.8,
  accentColor = SUBTITLE_IVORY,
  periodLabel,
}: RoomLabelProps) {
  const panelHeight = subtitle ? 2.2 : 0.7
  const chapter = subtitle ? chapterFromTitle(title) : null

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Fill/shadow pick light — plaque-only, does not touch room lighting. */}
      <ExhibitSpotlight
        position={[0, panelHeight / 2 + 0.5, 0.75]}
        targetPosition={[0, -0.15, 0.05]}
        color={ACCENT_LIGHT_COLOR}
        intensity={ACCENT_LIGHT_INTENSITY}
        angle={ACCENT_LIGHT_ANGLE}
        penumbra={ACCENT_LIGHT_PENUMBRA}
        distance={ACCENT_LIGHT_DISTANCE}
      />
      {/* Top-down key light — steeper, tighter, aimed at the upper frame/title
          so the bronze relief and gold typography pick up a real directional
          highlight instead of just an even wash. */}
      <ExhibitSpotlight
        position={[0, panelHeight / 2 + 0.85, 0.45]}
        targetPosition={[0, panelHeight / 2 - 0.35, 0.05]}
        color={KEY_LIGHT_COLOR}
        intensity={KEY_LIGHT_INTENSITY}
        angle={KEY_LIGHT_ANGLE}
        penumbra={KEY_LIGHT_PENUMBRA}
        distance={KEY_LIGHT_DISTANCE}
        castShadow={false}
      />
      {/* Subtle warm separation light behind the plaque, between the backing
          plate and the wall — a faint rim so the relief layers read apart
          from the wall without brightening the wall itself. */}
      <pointLight
        position={[0, 0, -0.4]}
        color={SEPARATION_LIGHT_COLOR}
        intensity={SEPARATION_LIGHT_INTENSITY}
        distance={SEPARATION_LIGHT_DISTANCE}
        decay={2}
      />
      {/* Dark backing/shadow plate, mounted close to the wall. */}
      <mesh position={[0, 0, BACKING_Z]} receiveShadow>
        <boxGeometry args={[panelWidth + BACKING_MARGIN, panelHeight + BACKING_MARGIN, BACKING_DEPTH]} />
        <meshStandardMaterial color={BACKING_COLOR} roughness={0.9} metalness={0} />
      </mesh>
      {/* Bright outer trim — a thin polished-bronze highlight peeking out
          around the main frame body, the first beat of the bronze hierarchy. */}
      <mesh position={[0, 0, OUTER_TRIM_Z]} castShadow receiveShadow>
        <boxGeometry args={[panelWidth + OUTER_TRIM_MARGIN, panelHeight + OUTER_TRIM_MARGIN, OUTER_TRIM_DEPTH]} />
        <meshStandardMaterial color={TRIM_BRONZE} metalness={0.75} roughness={0.14} />
      </mesh>
      {/* Main frame body, slightly deeper-toned than the trim so the edge reads as a lit molding. */}
      <mesh position={[0, 0, FRAME_BODY_Z]} castShadow receiveShadow>
        <boxGeometry args={[panelWidth + FRAME_MARGIN, panelHeight + FRAME_MARGIN, FRAME_DEPTH]} />
        <meshStandardMaterial color={FRAME_BRONZE} metalness={0.6} roughness={0.22} />
      </mesh>
      {/* Deep bevel groove — a real carved recess, matte so it reads purely as shadow. */}
      <mesh position={[0, 0, BEVEL_Z]} castShadow receiveShadow>
        <boxGeometry args={[panelWidth + BEVEL_MARGIN, panelHeight + BEVEL_MARGIN, BEVEL_DEPTH]} />
        <meshStandardMaterial color={BEVEL_SHADOW} metalness={0.05} roughness={0.85} />
      </mesh>
      {/* Bright inner accent lip — the second bronze beat, catching light right where the panel sinks in. */}
      <mesh position={[0, 0, INNER_LIP_Z]} castShadow receiveShadow>
        <boxGeometry args={[panelWidth + INNER_LIP_MARGIN, panelHeight + INNER_LIP_MARGIN, INNER_LIP_DEPTH]} />
        <meshStandardMaterial color={TRIM_BRONZE} metalness={0.75} roughness={0.14} />
      </mesh>
      {/* Deep-set inner panel */}
      <mesh position={[0, 0, PANEL_Z]} castShadow receiveShadow>
        <boxGeometry args={[panelWidth, panelHeight, PANEL_DEPTH]} />
        <meshStandardMaterial color={PANEL_BROWN} metalness={0} roughness={0.48} />
      </mesh>

      {chapter && (
        <Text
          fontSize={0.13}
          color={CHAPTER_BRONZE}
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.26}
          position={[0, panelHeight / 2 - 0.24, TEXT_Z]}
        >
          {chapter}
        </Text>
      )}
      <Text
        fontSize={0.44}
        color={TITLE_GOLD}
        anchorX="center"
        anchorY="middle"
        maxWidth={panelWidth - 0.3}
        textAlign="center"
        letterSpacing={0.02}
        position={[0, subtitle ? panelHeight / 2 - 0.56 : 0, TEXT_Z]}
      >
        {title}
      </Text>
      {subtitle && (
        <>
          <Text
            fontSize={0.19}
            color={accentColor}
            anchorX="center"
            anchorY="middle"
            maxWidth={panelWidth - 0.3}
            textAlign="center"
            lineHeight={1.6}
            letterSpacing={0.015}
            position={[0, -0.09, TEXT_Z]}
          >
            {subtitle}
          </Text>
          {periodLabel && (
            <Text
              fontSize={0.14}
              color={PERIOD_BRONZE}
              anchorX="center"
              anchorY="middle"
              maxWidth={panelWidth - 0.3}
              textAlign="center"
              letterSpacing={0.08}
              position={[0, -(panelHeight / 2 - 0.22), TEXT_Z]}
            >
              {periodLabel}
            </Text>
          )}
        </>
      )}
    </group>
  )
}

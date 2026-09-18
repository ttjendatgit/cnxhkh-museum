const CHARCOAL_STONE = '#343332'
const ACCENT_STONE = '#A67C52'

interface BarSpec {
  position: [number, number, number]
  size: [number, number, number]
}

function buildFrameBars(
  centerX: number,
  centerZ: number,
  innerWidth: number,
  innerDepth: number,
  outerWidth: number,
  outerDepth: number,
  y: number,
  boxHeight: number,
): BarSpec[] {
  const barThicknessZ = (outerDepth - innerDepth) / 2
  const barThicknessX = (outerWidth - innerWidth) / 2
  const offsetZ = innerDepth / 2 + barThicknessZ / 2
  const offsetX = innerWidth / 2 + barThicknessX / 2

  return [
    { position: [centerX, y, centerZ + offsetZ], size: [outerWidth, boxHeight, barThicknessZ] },
    { position: [centerX, y, centerZ - offsetZ], size: [outerWidth, boxHeight, barThicknessZ] },
    { position: [centerX + offsetX, y, centerZ], size: [barThicknessX, boxHeight, innerDepth] },
    { position: [centerX - offsetX, y, centerZ], size: [barThicknessX, boxHeight, innerDepth] },
  ]
}

interface FloorFrameProps {
  centerX?: number
  centerZ: number
  innerWidth: number
  innerDepth: number
  accentGap?: number
  borderGap?: number
}

/**
 * A thin charcoal-stone border with a champagne inlay, hugging a floor
 * exhibit footprint — marks major exhibit zones without moving anything.
 */
export default function FloorFrame({
  centerX = 0,
  centerZ,
  innerWidth,
  innerDepth,
  accentGap = 0.2,
  borderGap = 0.6,
}: FloorFrameProps) {
  const accentOuterW = innerWidth + accentGap
  const accentOuterD = innerDepth + accentGap
  const borderOuterW = accentOuterW + borderGap
  const borderOuterD = accentOuterD + borderGap

  // Lifted a bit further above the floor plane (was 0.006-0.007) to keep a
  // safer depth-buffer margin at typical viewing distance, without changing
  // how the inlay reads visually.
  const accentBars = buildFrameBars(centerX, centerZ, innerWidth, innerDepth, accentOuterW, accentOuterD, 0.012, 0.012)
  const borderBars = buildFrameBars(centerX, centerZ, accentOuterW, accentOuterD, borderOuterW, borderOuterD, 0.011, 0.01)

  return (
    <group>
      {accentBars.map((bar, index) => (
        <mesh key={`accent-${index}`} position={bar.position} receiveShadow>
          <boxGeometry args={bar.size} />
          <meshStandardMaterial color={ACCENT_STONE} roughness={0.35} metalness={0.4} />
        </mesh>
      ))}
      {borderBars.map((bar, index) => (
        <mesh key={`border-${index}`} position={bar.position} receiveShadow>
          <boxGeometry args={bar.size} />
          <meshStandardMaterial color={CHARCOAL_STONE} roughness={0.42} metalness={0.05} />
        </mesh>
      ))}
    </group>
  )
}

import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { useSafeTexture } from './ArtifactFrame'

// Local files from public/ (not Cloudinary). BASE_URL keeps them working if the app is served from a sub-path.
const ASSET_BASE = `${import.meta.env.BASE_URL}assests/`
const FLAG_URL = `${ASSET_BASE}Flag_of_Vietnam.svg`
const MAP_URL = `${ASSET_BASE}ban-do-viet-nam.webp`

// Same slim bronze frame language as the museum's wall pieces.
const BACKING_COLOR = '#17130F'
const RAIL_COLOR = '#9C7C4E'
const RAIL_EDGE_GLOW = '#D8B56A'
const RAIL = 0.04

const FLAG_SIZE = { width: 1.5, height: 1.0 } // the flag's own 3:2
const MAP_SIZE = { width: 1.13, height: 1.6 } // the map poster's 2480 x 3505
const FLAG_Y = 3.0
const MAP_Y = 1.32

interface FramedImageProps {
  url: string
  width: number
  height: number
  y: number
}

function FramedImage({ url, width, height, y }: FramedImageProps) {
  const texture = useSafeTexture(url)
  const { gl } = useThree()

  useEffect(() => {
    if (texture) texture.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy())
  }, [gl, texture])

  return (
    <group position={[0, y, 0]}>
      <mesh position={[0, 0, -0.012]} castShadow receiveShadow>
        <boxGeometry args={[width + RAIL * 2 + 0.05, height + RAIL * 2 + 0.05, 0.03]} />
        <meshStandardMaterial color={BACKING_COLOR} roughness={0.85} />
      </mesh>
      {[
        [0, height / 2 + RAIL / 2, width + RAIL * 2, RAIL],
        [0, -(height / 2 + RAIL / 2), width + RAIL * 2, RAIL],
        [-(width / 2 + RAIL / 2), 0, RAIL, height],
        [width / 2 + RAIL / 2, 0, RAIL, height],
      ].map(([x, railY, railWidth, railHeight], index) => (
        <mesh key={`rail-${index}`} position={[x, railY, 0.012]} castShadow receiveShadow>
          <boxGeometry args={[railWidth, railHeight, 0.045]} />
          <meshStandardMaterial color={RAIL_COLOR} emissive={RAIL_EDGE_GLOW} emissiveIntensity={0.05} metalness={0.45} roughness={0.32} />
        </mesh>
      ))}
      <mesh position={[0, 0, 0.005]} receiveShadow>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial map={texture ?? undefined} color={texture ? '#ffffff' : '#2B2721'} roughness={0.75} metalness={0} />
      </mesh>
    </group>
  )
}

interface NationalIdentityDisplayProps {
  /** Wall-mounted: `position` is on the wall's face, x = the display's vertical axis. */
  position: [number, number, number]
  rotationY?: number
}

/** The lobby's national identity display: the Vietnamese flag with a map of
 * Vietnam beneath it, on one vertical axis. Purely decorative — no artifact,
 * no interaction. */
export default function NationalIdentityDisplay({ position, rotationY = 0 }: NationalIdentityDisplayProps) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <FramedImage url={FLAG_URL} width={FLAG_SIZE.width} height={FLAG_SIZE.height} y={FLAG_Y} />
      <FramedImage url={MAP_URL} width={MAP_SIZE.width} height={MAP_SIZE.height} y={MAP_Y} />
    </group>
  )
}

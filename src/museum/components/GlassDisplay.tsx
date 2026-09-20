import type { ReactNode } from 'react'
import type { ThreeElements } from '@react-three/fiber'
import { DoubleSide } from 'three'

interface GlassDisplayProps extends Pick<ThreeElements['group'], 'position' | 'rotation'> {
  /** Width, height, and depth of the enclosure. */
  size: [number, number, number]
  children?: ReactNode
  glassColor?: string
}

/** A frameless glass enclosure whose origin sits at the center of its base. */
export default function GlassDisplay({
  position,
  rotation,
  size,
  children,
  glassColor = '#D8EEF1',
}: GlassDisplayProps) {
  const [width, height, depth] = size

  return (
    <group position={position} rotation={rotation}>
      {children}
      <mesh position={[0, height / 2, 0]} renderOrder={2}>
        <boxGeometry args={[width, height, depth]} />
        <meshPhysicalMaterial
          color={glassColor}
          transparent
          opacity={0.22}
          transmission={0.88}
          roughness={0.1}
          metalness={0}
          ior={1.45}
          thickness={0.015}
          clearcoat={0.35}
          clearcoatRoughness={0.12}
          reflectivity={0.25}
          depthWrite={false}
          side={DoubleSide}
        />
      </mesh>
    </group>
  )
}

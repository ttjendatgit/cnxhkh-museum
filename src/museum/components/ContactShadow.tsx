import { useMemo } from 'react'
import * as THREE from 'three'

/**
 * A soft radial-gradient dark decal — a faked ambient-occlusion/contact
 * shadow, not a real shadow map. Unlit (meshBasicMaterial) so it reads as a
 * consistent dark pool under an object regardless of the room's spotlight
 * angles, giving pedestals/vitrines the sense of resting weight on the
 * stone floor instead of floating just above it.
 */

let sharedTexture: THREE.CanvasTexture | null = null

function getContactShadowTexture(): THREE.CanvasTexture {
  if (sharedTexture) return sharedTexture
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0.55)')
  gradient.addColorStop(0.65, 'rgba(0, 0, 0, 0.25)')
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)
  sharedTexture = new THREE.CanvasTexture(canvas)
  return sharedTexture
}

interface ContactShadowProps {
  /** Floor-level center the object sits on (y is the floor datum, not the object's own lift). */
  position: [number, number, number]
  radiusX: number
  radiusZ?: number
  opacity?: number
}

export default function ContactShadow({ position, radiusX, radiusZ = radiusX, opacity = 0.7 }: ContactShadowProps) {
  const texture = useMemo(() => getContactShadowTexture(), [])

  return (
    <mesh
      position={[position[0], position[1] + 0.003, position[2]]}
      rotation={[-Math.PI / 2, 0, 0]}
      scale={[radiusX, radiusZ, 1]}
      renderOrder={1}
    >
      <circleGeometry args={[1, 32]} />
      <meshBasicMaterial map={texture} transparent opacity={opacity} depthWrite={false} />
    </mesh>
  )
}

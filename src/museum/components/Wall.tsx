import { createPlasterTexture, createPlasterBumpTexture } from '../utils/surfaceTexture'

// Generated once and shared by every Wall instance — many differently sized
// wall segments make up the museum, and this is a very large-scale, very
// low-contrast variation, not a pattern that needs to register precisely
// per-segment, so one shared texture (with a low repeat, so each tile
// covers a lot of physical wall and the gradients stay nearly invisible)
// keeps this cheap.
const plasterTexture = createPlasterTexture()
plasterTexture.repeat.set(2, 1)
const plasterBumpTexture = createPlasterBumpTexture()
plasterBumpTexture.repeat.set(2, 1)

interface WallProps {
  position: [number, number, number]
  size: [number, number, number]
  color?: string
  castShadow?: boolean
  receiveShadow?: boolean
}

export default function Wall({ position, size, color = '#F4F1E8', castShadow = true, receiveShadow = true }: WallProps) {
  return (
    <mesh position={position} castShadow={castShadow} receiveShadow={receiveShadow}>
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={color}
        map={plasterTexture}
        bumpMap={plasterBumpTexture}
        bumpScale={0.002}
        roughness={0.85}
        metalness={0}
      />
    </mesh>
  )
}

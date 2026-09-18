import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { PointerLockControls } from '@react-three/drei'
import * as THREE from 'three'
import { getMuseumColliders, resolveMove } from './collision'

const MOVE_SPEED = 4.5
const PLAYER_HEIGHT = 1.7
// Player treated as a vertical circle of this radius for collision — small
// enough to pass comfortably through every doorway (DOOR_WIDTH is much
// wider than 2x this) while still being blocked by walls and exhibits.
const PLAYER_RADIUS = 0.32

interface KeyState {
  forward: boolean
  backward: boolean
  left: boolean
  right: boolean
}

export default function PlayerController() {
  const keys = useRef<KeyState>({
    forward: false,
    backward: false,
    left: false,
    right: false,
  })

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'KeyW':
          keys.current.forward = true
          break
        case 'KeyS':
          keys.current.backward = true
          break
        case 'KeyA':
          keys.current.left = true
          break
        case 'KeyD':
          keys.current.right = true
          break
      }
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'KeyW':
          keys.current.forward = false
          break
        case 'KeyS':
          keys.current.backward = false
          break
        case 'KeyA':
          keys.current.left = false
          break
        case 'KeyD':
          keys.current.right = false
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  const forwardVector = useRef(new THREE.Vector3())
  const rightVector = useRef(new THREE.Vector3())
  const direction = useRef(new THREE.Vector3())
  // Built once — the museum layout is static, so this never needs to change
  // at runtime (see collision.ts for how it's derived from the same data
  // Museum.tsx renders from).
  const colliders = useRef(getMuseumColliders())

  useFrame((state, delta) => {
    const { camera } = state
    const { forward, backward, left, right } = keys.current

    camera.getWorldDirection(forwardVector.current)
    forwardVector.current.y = 0
    forwardVector.current.normalize()

    rightVector.current.set(-forwardVector.current.z, 0, forwardVector.current.x)

    direction.current.set(0, 0, 0)
    if (forward) direction.current.add(forwardVector.current)
    if (backward) direction.current.sub(forwardVector.current)
    if (right) direction.current.add(rightVector.current)
    if (left) direction.current.sub(rightVector.current)

    if (direction.current.lengthSq() > 0) {
      direction.current.normalize()
      const moveX = direction.current.x * MOVE_SPEED * delta
      const moveZ = direction.current.z * MOVE_SPEED * delta
      // Resolved one axis at a time so the player slides along a wall or
      // exhibit edge instead of being hard-stopped on a diagonal approach.
      const [nextX, nextZ] = resolveMove(
        camera.position.x,
        camera.position.z,
        moveX,
        moveZ,
        PLAYER_RADIUS,
        colliders.current,
      )
      camera.position.x = nextX
      camera.position.z = nextZ
    }

    camera.position.y = PLAYER_HEIGHT
  })

  return <PointerLockControls />
}

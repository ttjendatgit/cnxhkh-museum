import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { PointerLockControls } from '@react-three/drei'
import * as THREE from 'three'
import { getMuseumColliders, resolveMove } from './collision'
import { useArtifactStore } from './state/useArtifactStore'
import { useFinalGameStore } from './final-room/useFinalGameStore'
import { touchInput } from './input/touchInput'
import { useIsTouchDevice } from './input/useIsTouchDevice'

const MOVE_SPEED = 4.5
// Three's PointerLockControls default pointerSpeed is 1.0. A 40% reduction
// makes looking around feel closer to slow museum browsing than an FPS turn.
const LOOK_POINTER_SPEED = 0.6
// Radians of camera turn per CSS px of swipe (a 300px swipe turns about 75 degrees).
const LOOK_TOUCH_SPEED = 0.0044
// Same vertical limit as the mouse look: straight up / straight down at most (kept a hair short of the pole).
const MAX_PITCH = Math.PI / 2 - 0.01
// Camera FOV: the museum's own, and a wider one for a phone held upright, where 75 vertical
// leaves only ~40 degrees across and the rooms feel like looking through a tube.
const BASE_FOV = 75
const PORTRAIT_FOV = 90
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
  // On a phone there is no mouse to lock: the on-screen joystick moves and a swipe turns the camera.
  const touch = useIsTouchDevice()
  const { camera, size } = useThree()
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

  useEffect(() => {
    if (!touch || !(camera instanceof THREE.PerspectiveCamera)) return
    camera.fov = size.width < size.height ? PORTRAIT_FOV : BASE_FOV
    camera.updateProjectionMatrix()
    return () => {
      camera.fov = BASE_FOV
      camera.updateProjectionMatrix()
    }
  }, [touch, camera, size.width, size.height])

  const lookEuler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'))
  const forwardVector = useRef(new THREE.Vector3())
  const rightVector = useRef(new THREE.Vector3())
  const direction = useRef(new THREE.Vector3())
  // Built once — the museum layout is static, so this never needs to change
  // at runtime (see collision.ts for how it's derived from the same data
  // Museum.tsx renders from).
  const colliders = useRef(getMuseumColliders())

  useFrame((state, delta) => {
    // Frozen while an artifact detail panel is open — read imperatively
    // (not via a hook) so PlayerController doesn't re-render on every
    // proximity/open-state change, only the movement frame checks it.
    // Same freeze while the Final Room game overlay is open (typing answers).
    if (useArtifactStore.getState().activeArtifact || useFinalGameStore.getState().open) {
      // A swipe that arrived meanwhile must not turn the camera once the panel closes.
      touchInput.lookX = 0
      touchInput.lookY = 0
      return
    }

    const { camera } = state
    const { forward, backward, left, right } = keys.current

    if (touch && (touchInput.lookX !== 0 || touchInput.lookY !== 0)) {
      // Same yaw/pitch model PointerLockControls uses: yaw around Y, pitch around X, no roll.
      const euler = lookEuler.current.setFromQuaternion(camera.quaternion, 'YXZ')
      euler.y -= touchInput.lookX * LOOK_TOUCH_SPEED
      euler.x = Math.max(-MAX_PITCH, Math.min(MAX_PITCH, euler.x - touchInput.lookY * LOOK_TOUCH_SPEED))
      camera.quaternion.setFromEuler(euler)
      touchInput.lookX = 0
      touchInput.lookY = 0
    }

    camera.getWorldDirection(forwardVector.current)
    forwardVector.current.y = 0
    forwardVector.current.normalize()

    rightVector.current.set(-forwardVector.current.z, 0, forwardVector.current.x)

    direction.current.set(0, 0, 0)
    if (forward) direction.current.add(forwardVector.current)
    if (backward) direction.current.sub(forwardVector.current)
    if (right) direction.current.add(rightVector.current)
    if (left) direction.current.sub(rightVector.current)
    // Joystick: its direction only — the speed below is the same fixed MOVE_SPEED as on the keyboard.
    if (touchInput.moveX !== 0 || touchInput.moveY !== 0) {
      direction.current.addScaledVector(forwardVector.current, touchInput.moveY)
      direction.current.addScaledVector(rightVector.current, touchInput.moveX)
    }

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

  return touch ? null : <PointerLockControls pointerSpeed={LOOK_POINTER_SPEED} />
}

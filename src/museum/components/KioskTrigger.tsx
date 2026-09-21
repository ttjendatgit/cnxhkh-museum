import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Vector3, type Group } from 'three'
import { useKioskStore } from '../state/useKioskStore'

/** How close the player must be to the kiosk's screen to press E — comparable to an artifact. */
const KIOSK_RADIUS = 2.4

/** An invisible proximity trigger for the Room 3 reference kiosk: it adds no geometry (the
 * existing kiosk model stays exactly as it is) and only reports the player's distance to the
 * kiosk store, like ArtifactTrigger does for artifacts. Place it at the kiosk's screen. */
export default function KioskTrigger({ position }: { position: [number, number, number] }) {
  const ref = useRef<Group>(null)
  const worldPosition = useMemo(() => new Vector3(), [])
  const reportNearby = useKioskStore((state) => state.reportNearby)
  const clearNearby = useKioskStore((state) => state.clearNearby)

  useFrame(({ camera }) => {
    if (!ref.current) return
    ref.current.getWorldPosition(worldPosition)
    const distance = camera.position.distanceTo(worldPosition)
    if (distance <= KIOSK_RADIUS) reportNearby(distance)
    else clearNearby()
  })

  useEffect(() => () => clearNearby(), [clearNearby])

  return <group ref={ref} position={position} />
}

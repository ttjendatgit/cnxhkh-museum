/** Where the Final Room's game station stands. Shared by the 3D station
 * (FinalGameStation.tsx) and its collider (collision.ts) so the two can't drift.
 *
 * The station is offset from the room's center rather than hard-coded in world
 * coordinates, and sits on the left side of the room: clear of the viewing pad
 * and gold-framed screen at the back, the flanking columns, and the front door. */
export const FINAL_STATION_OFFSET = { x: -4.6, z: 0.5 }

/** Square footprint (meters) of the station's base plate. */
export const FINAL_STATION_FOOTPRINT = 0.7

/** How close (horizontally) the player must be for the "Nhấn E" prompt. The
 * station's collider keeps the player ~0.4m from its edge, so this is
 * comfortably reachable. */
export const FINAL_STATION_TRIGGER_RADIUS = 2.4

export function finalStationPosition(centerZ: number): [number, number, number] {
  return [FINAL_STATION_OFFSET.x, 0, centerZ + FINAL_STATION_OFFSET.z]
}

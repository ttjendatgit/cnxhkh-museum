export const WALL_HEIGHT = 4.2
export const WALL_THICKNESS = 0.3
export const DOOR_WIDTH = 3.2
export const DOOR_HEIGHT = 3

// Standoff (from the wall's centerline) for wall-mounted decor (ImageFrame,
// InfoPanel, ExhibitBoard, entrance frames). Clears the wall's own half
// thickness (0.15) plus each component's small internal backing offset
// (up to ~0.035), leaving a minimal ~5mm positive gap instead of embedding
// in the wall or floating unnecessarily far off it.
export const WALL_MOUNT_GAP = 0.19

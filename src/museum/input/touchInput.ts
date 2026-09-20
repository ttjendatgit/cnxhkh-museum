/**
 * Live state of the on-screen controls (see ui/TouchControls.tsx), read by PlayerController
 * every frame. Deliberately a plain mutable object, not React state: the joystick and the look
 * swipe change many times a second and must not re-render anything.
 */
export const touchInput = {
  /** Joystick, each axis -1..1 (already outside its dead zone): x = right, y = forward. */
  moveX: 0,
  moveY: 0,
  /** Swipe distance in CSS px since the last frame (x = right, y = down). PlayerController consumes it. */
  lookX: 0,
  lookY: 0,
}

/** Stops all touch movement and drops any pending swipe. Called when the controls go away
 * (a panel opened, the window lost focus) so the player never keeps walking on its own. */
export function resetTouchInput(): void {
  touchInput.moveX = 0
  touchInput.moveY = 0
  touchInput.lookX = 0
  touchInput.lookY = 0
}

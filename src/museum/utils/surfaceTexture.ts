import * as THREE from 'three'
import { paintCloudyPatch } from './floorTexture'

/**
 * These color maps are deliberately painted in near-neutral white (only a
 * few-percent-opacity darker/lighter patches) rather than the surface's
 * actual color. `meshStandardMaterial` multiplies `map` by `color`, so the
 * texture only contributes micro variation — the existing `color` prop on
 * Wall/Plinth keeps full control of the actual tint (including the final
 * room's dark wall override), exactly as before this pass.
 */

/**
 * Extremely low-contrast procedural plaster texture for walls: only a
 * handful of large, soft cloudy gradients — no fine speckle/dot grain at
 * all, since that read as noise/dirt rather than plaster. Meant to be
 * essentially invisible at normal viewing distance; a clean premium gallery
 * wall, not textured concrete.
 */
export function createPlasterTexture(): THREE.CanvasTexture {
  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(0, 0, size, size)

  // Only a few large, very soft gradients — broad tonal drift, no grain.
  for (let i = 0; i < 3; i++) {
    paintCloudyPatch(ctx, Math.random() * size, Math.random() * size, 220 + Math.random() * 140, '0, 0, 0', 0.012)
  }
  for (let i = 0; i < 3; i++) {
    paintCloudyPatch(ctx, Math.random() * size, Math.random() * size, 220 + Math.random() * 140, '255, 255, 255', 0.01)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  return texture
}

/**
 * Matching, even-fainter bump map for the plaster wall — large soft
 * gradients only, meant to be used with a very small bumpScale (or omitted
 * entirely) so it never reads as pitting or dirt.
 */
export function createPlasterBumpTexture(): THREE.CanvasTexture {
  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = '#808080'
  ctx.fillRect(0, 0, size, size)

  for (let i = 0; i < 4; i++) {
    const rgb = Math.random() > 0.5 ? '255, 255, 255' : '0, 0, 0'
    paintCloudyPatch(ctx, Math.random() * size, Math.random() * size, 200 + Math.random() * 150, rgb, 0.02)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  return texture
}

/**
 * Very low-contrast procedural limestone micro texture for pedestals/plinths
 * — a softer, slightly larger-grained cousin of the plaster texture, for a
 * solid-surface museum-stone feel rather than a flat painted block.
 */
export function createLimestoneTexture(): THREE.CanvasTexture {
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(0, 0, size, size)

  for (let i = 0; i < 4; i++) {
    paintCloudyPatch(ctx, Math.random() * size, Math.random() * size, 70 + Math.random() * 90, '0, 0, 0', 0.035)
  }
  for (let i = 0; i < 4; i++) {
    paintCloudyPatch(ctx, Math.random() * size, Math.random() * size, 70 + Math.random() * 90, '255, 255, 255', 0.03)
  }
  for (let i = 0; i < 100; i++) {
    const rgb = Math.random() > 0.5 ? '0, 0, 0' : '255, 255, 255'
    paintCloudyPatch(ctx, Math.random() * size, Math.random() * size, 3 + Math.random() * 5, rgb, 0.045)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  return texture
}

/** Matching low-contrast grayscale bump map for the limestone pedestal texture. */
export function createLimestoneBumpTexture(): THREE.CanvasTexture {
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = '#808080'
  ctx.fillRect(0, 0, size, size)

  for (let i = 0; i < 90; i++) {
    const rgb = Math.random() > 0.5 ? '255, 255, 255' : '0, 0, 0'
    paintCloudyPatch(ctx, Math.random() * size, Math.random() * size, 5 + Math.random() * 9, rgb, 0.045)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  return texture
}

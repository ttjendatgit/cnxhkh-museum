import * as THREE from 'three'

/**
 * Paints one soft, feathered mineral patch — a radial gradient fading to
 * fully transparent at its edge, rather than a hard-edged shape — so
 * overlapping patches read as quiet cloudy variation instead of a visible
 * repeated motif.
 */
export function paintCloudyPatch(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, rgb: string, alpha: number) {
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, r)
  gradient.addColorStop(0, `rgba(${rgb}, ${alpha})`)
  gradient.addColorStop(1, `rgba(${rgb}, 0)`)
  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.fill()
}

/**
 * Procedurally draws one large-format cool premium charcoal stone tile
 * (base color, soft feathered cloudy mineral-variation patches, and a grout
 * seam — darker than the stone but low-contrast, not near-black) onto a
 * canvas — no external image assets. Deliberately has no linear veining: a
 * stroked vein reads as marble or wood grain, which this stone is meant to
 * avoid — depth comes entirely from the layered cloudy patches instead. The
 * texture is meant to be tiled with RepeatWrapping; drawing the grout seam
 * only on the right/bottom edges means adjacent repeats meet without
 * doubling the grout line width.
 */
export function createStoneFloorTexture(): THREE.CanvasTexture {
  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = '#48473F'
  ctx.fillRect(0, 0, size, size)

  // Layered cloudy mineral variation — quiet, but visible enough to read as
  // real stone rather than a flat color fill. Kept close to neutral gray
  // (only a whisper of warmth) so it reads as charcoal stone, not wood.
  // Two passes at different scales (broad undertone + tighter detail) give
  // more believable depth than a single layer without adding any hard edges
  // or linear motifs.
  for (let i = 0; i < 5; i++) {
    const x = Math.random() * size
    const y = Math.random() * size
    const r = 110 + Math.random() * 150
    paintCloudyPatch(ctx, x, y, r, '86, 85, 80', 0.1)
  }
  for (let i = 0; i < 5; i++) {
    const x = Math.random() * size
    const y = Math.random() * size
    const r = 100 + Math.random() * 140
    paintCloudyPatch(ctx, x, y, r, '30, 29, 27', 0.1)
  }
  for (let i = 0; i < 6; i++) {
    const x = Math.random() * size
    const y = Math.random() * size
    const r = 40 + Math.random() * 50
    const lighter = Math.random() > 0.5
    paintCloudyPatch(ctx, x, y, r, lighter ? '86, 85, 80' : '30, 29, 27', 0.06)
  }

  // Grout is darker than the stone but closer in tone now — natural slab
  // seams, not a high-contrast grid line. A light blur softens the seam
  // edge instead of a hard-edged rectangle line.
  const grout = 3
  ctx.save()
  ctx.filter = 'blur(1px)'
  ctx.fillStyle = '#38372F'
  ctx.fillRect(size - grout, 0, grout, size)
  ctx.fillRect(0, size - grout, size, grout)
  ctx.restore()

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  return texture
}

/**
 * A matching low-contrast grayscale bump map for the stone floor — soft
 * mid-gray blotches (no hard edges, no noise) so the surface picks up a
 * faint, believable relief under the gallery spotlights without reading as
 * a distinct pattern of its own. Meant to be used as `bumpMap` with a very
 * small `bumpScale` alongside {@link createStoneFloorTexture}'s color map.
 */
export function createStoneBumpTexture(): THREE.CanvasTexture {
  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = '#808080'
  ctx.fillRect(0, 0, size, size)

  for (let i = 0; i < 12; i++) {
    const x = Math.random() * size
    const y = Math.random() * size
    const r = 70 + Math.random() * 120
    const lighter = Math.random() > 0.5
    paintCloudyPatch(ctx, x, y, r, lighter ? '255, 255, 255' : '0, 0, 0', 0.06)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  return texture
}

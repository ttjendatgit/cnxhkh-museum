import * as THREE from 'three'

/**
 * A box geometry with a small flat chamfer cut into every edge (top and
 * bottom), built from an extruded chamfered-rectangle profile rather than a
 * rounded bevel — reads as a crisp cut edge that catches light, not a soft
 * pillow. Centered on the origin exactly like `THREE.BoxGeometry(width,
 * height, depth)`, so it's a drop-in replacement wherever a plain box was
 * centered on its mesh position.
 */
export function createChamferedBoxGeometry(width: number, height: number, depth: number, bevel: number): THREE.BufferGeometry {
  const w = width / 2
  const d = depth / 2

  const shape = new THREE.Shape()
  shape.moveTo(-w + bevel, -d)
  shape.lineTo(w - bevel, -d)
  shape.lineTo(w, -d + bevel)
  shape.lineTo(w, d - bevel)
  shape.lineTo(w - bevel, d)
  shape.lineTo(-w + bevel, d)
  shape.lineTo(-w, d - bevel)
  shape.lineTo(-w, -d + bevel)
  shape.closePath()

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: Math.max(height - bevel * 2, 0.001),
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 1,
    curveSegments: 1,
  })

  // Extrude runs along +Z from the XY shape, from z=-bevel to z=height-bevel
  // once the end bevels are included; rotate so that extrusion becomes the
  // Y (height) axis, then re-center it on the origin.
  geometry.rotateX(-Math.PI / 2)
  geometry.translate(0, bevel - height / 2, 0)
  geometry.computeVertexNormals()

  return geometry
}

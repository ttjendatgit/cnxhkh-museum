import { useEffect, useMemo, useRef } from 'react'
import { Text, useTexture } from '@react-three/drei'
import { useFrame, useThree, type ThreeElements } from '@react-three/fiber'
import { Group, SRGBColorSpace, Vector3 } from 'three'

const FRAME_COLOR = '#3B2B22'
const FRAME_EDGE_COLOR = '#9C7C4E'
const BACKING_COLOR = '#17130F'
const LABEL_COLOR = '#2B241D'
const LABEL_TEXT_COLOR = '#F1E7D4'
const FRAME_RAIL = 0.065
const MAX_IMAGE_WIDTH = 1.65
const MAX_IMAGE_HEIGHT = 1.05
const DESCRIPTION_PROXIMITY = 3.2

export interface ImageFrameProps extends Pick<ThreeElements['group'], 'position' | 'rotation' | 'scale'> {
  imageUrl: string
  title?: string
  description?: string
}

/** A wall-mounted historical image with a permanent caption and proximity description. */
export default function ImageFrame({ imageUrl, position, rotation, scale = 1, title, description }: ImageFrameProps) {
  const texture = useTexture(imageUrl)
  const { gl } = useThree()
  const frameRef = useRef<Group>(null)
  const descriptionRef = useRef<Group>(null)
  const worldPosition = useMemo(() => new Vector3(), [])

  useEffect(() => {
    texture.colorSpace = SRGBColorSpace
    texture.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy())
    texture.needsUpdate = true
  }, [gl, texture])

  const [imageWidth, imageHeight] = useMemo(() => {
    const source = texture.image as { width?: number; height?: number }
    const aspect = source.width && source.height ? source.width / source.height : 3 / 2
    const maxAspect = MAX_IMAGE_WIDTH / MAX_IMAGE_HEIGHT

    return aspect >= maxAspect
      ? [MAX_IMAGE_WIDTH, MAX_IMAGE_WIDTH / aspect]
      : [MAX_IMAGE_HEIGHT * aspect, MAX_IMAGE_HEIGHT]
  }, [texture])

  const outerWidth = imageWidth + FRAME_RAIL * 2
  const outerHeight = imageHeight + FRAME_RAIL * 2

  useFrame(({ camera }) => {
    if (!frameRef.current || !descriptionRef.current || !description) return

    frameRef.current.getWorldPosition(worldPosition)
    descriptionRef.current.visible = camera.position.distanceTo(worldPosition) <= DESCRIPTION_PROXIMITY
  })

  return (
    <group
      ref={frameRef}
      position={position}
      rotation={rotation}
      scale={scale}
      userData={{ exhibitType: 'historical-image', imageUrl, title, description }}
    >
      <mesh position={[0, 0, -0.015]} castShadow receiveShadow>
        <boxGeometry args={[outerWidth + 0.04, outerHeight + 0.04, 0.04]} />
        <meshStandardMaterial color={BACKING_COLOR} roughness={0.82} metalness={0.05} />
      </mesh>

      {[
        [0, outerHeight / 2 - FRAME_RAIL / 2, outerWidth, FRAME_RAIL],
        [0, -(outerHeight / 2 - FRAME_RAIL / 2), outerWidth, FRAME_RAIL],
        [-(outerWidth / 2 - FRAME_RAIL / 2), 0, FRAME_RAIL, outerHeight - FRAME_RAIL * 2],
        [outerWidth / 2 - FRAME_RAIL / 2, 0, FRAME_RAIL, outerHeight - FRAME_RAIL * 2],
      ].map(([x, y, width, height], index) => (
        <mesh key={`rail-${index}`} position={[x, y, 0.018]} castShadow receiveShadow>
          <boxGeometry args={[width, height, 0.055]} />
          <meshStandardMaterial color={FRAME_COLOR} metalness={0.18} roughness={0.48} />
        </mesh>
      ))}

      <mesh position={[0, 0, 0.049]}>
        <planeGeometry args={[imageWidth + 0.015, imageHeight + 0.015]} />
        <meshStandardMaterial color={FRAME_EDGE_COLOR} metalness={0.38} roughness={0.32} />
      </mesh>
      <mesh position={[0, 0, 0.052]} receiveShadow>
        <planeGeometry args={[imageWidth, imageHeight]} />
        <meshStandardMaterial map={texture} roughness={0.72} metalness={0} />
      </mesh>

      {title && (
        <group position={[0, -outerHeight / 2 - 0.16, 0.045]}>
          <mesh position={[0, 0, -0.008]}>
            <boxGeometry args={[Math.min(outerWidth, 1.5), 0.19, 0.025]} />
            <meshStandardMaterial color={LABEL_COLOR} metalness={0.28} roughness={0.5} />
          </mesh>
          <Text
            position={[0, 0, 0.008]}
            fontSize={0.065}
            color={LABEL_TEXT_COLOR}
            anchorX="center"
            anchorY="middle"
            maxWidth={Math.min(outerWidth - 0.12, 1.38)}
            textAlign="center"
          >
            {title}
          </Text>
        </group>
      )}

      {description && (
        <group ref={descriptionRef} visible={false} position={[0, -outerHeight / 2 - 0.43, 0.047]}>
          <mesh position={[0, 0, -0.01]}>
            <boxGeometry args={[Math.min(outerWidth, 1.5), 0.3, 0.02]} />
            <meshStandardMaterial color={FRAME_EDGE_COLOR} metalness={0.38} roughness={0.34} />
          </mesh>
          <mesh position={[0, 0, 0.003]}>
            <boxGeometry args={[Math.min(outerWidth - 0.025, 1.475), 0.275, 0.018]} />
            <meshStandardMaterial color={LABEL_COLOR} metalness={0.22} roughness={0.55} />
          </mesh>
          <Text
            position={[0, 0, 0.018]}
            fontSize={0.045}
            color={LABEL_TEXT_COLOR}
            anchorX="center"
            anchorY="middle"
            maxWidth={Math.min(outerWidth - 0.16, 1.34)}
            textAlign="center"
            lineHeight={1.25}
          >
            {description}
          </Text>
        </group>
      )}
    </group>
  )
}

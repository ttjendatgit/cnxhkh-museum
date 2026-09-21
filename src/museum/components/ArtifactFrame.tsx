import { useEffect, useMemo, useRef, useState } from 'react'
import { Text } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { Group, MeshStandardMaterial, SRGBColorSpace, Texture, TextureLoader } from 'three'
import type { Mesh } from 'three'
import type { Artifact } from '../types/Artifact'
import { useArtifactProximity } from '../hooks/useArtifactProximity'

// Same bronze/charcoal frame language as the museum's existing wall pieces
// (ImageFrame.tsx / WallPanels.tsx) — this is the "keep current 3D frame
// style" requirement, just re-implemented to be driven by an Artifact
// record instead of raw imageUrl/title props.
const FRAME_COLOR = '#3B2B22'
const FRAME_EDGE_COLOR = '#9C7C4E'
const FRAME_EDGE_GLOW = '#D8B56A'
const BACKING_COLOR = '#17130F'
const LABEL_COLOR = '#2B241D'
const LABEL_TEXT_COLOR = '#F1E7D4'
const PLACEHOLDER_COLOR = '#2B2721'
const PERIOD_TEXT_COLOR = '#B08A4F'

const FRAME_RAIL = 0.065
const MAX_IMAGE_WIDTH = 1.3
const MAX_IMAGE_HEIGHT = 0.95
// How close the player has to be for this artifact to become "nearby" (able
// to press E) — tighter than the museum's older ambient description-reveal
// radius, since this is a deliberate interact prompt, not passive flavor text.
const PROXIMITY_RADIUS = 2.4
// Small description board under the title plate — period + at most two lines of description.
// It only shows once the player is close enough to interact (the same radius as the E prompt):
// from afar the wall shows just the artifact's name. It fades rather than pops.
const BOARD_FADE_SPEED = 0.16
const BOARD_MIN_WIDTH = 1.1
const BOARD_HEIGHT = 0.34
// ~54 characters fit on one line at this size and width; two lines is the cap.
const DESCRIPTION_MAX_CHARS = 104

/** The board is a caption, not a page: the artifact's first sentence, trimmed to two lines. */
function shortDescription(text: string): string {
  const firstSentence = text.split(/(?<=[.!?])\s/)[0].trim()
  if (firstSentence.length <= DESCRIPTION_MAX_CHARS) return firstSentence
  const cut = firstSentence.slice(0, DESCRIPTION_MAX_CHARS - 1)
  return `${cut.slice(0, cut.lastIndexOf(' '))}…`
}

/** Loads a texture without React Suspense — this module intentionally
 * avoids depending on a Suspense boundary existing above it in the tree
 * (none is currently set up in App.tsx), so ArtifactFrame degrades to a
 * plain placeholder panel instead of crashing if a thumbnail URL is slow,
 * missing, or wrong. */
export function useSafeTexture(url: string): Texture | null {
  const [texture, setTexture] = useState<Texture | null>(null)

  useEffect(() => {
    let cancelled = false
    const loader = new TextureLoader()
    setTexture(null)
    loader.load(
      url,
      (loaded) => {
        if (cancelled) return
        loaded.colorSpace = SRGBColorSpace
        loaded.needsUpdate = true
        setTexture(loaded)
      },
      undefined,
      (error) => {
        console.error(`[ArtifactFrame] Failed to load thumbnail: ${url}`, error)
      },
    )
    return () => {
      cancelled = true
    }
  }, [url])

  return texture
}

interface ArtifactFrameProps {
  artifact: Artifact
}

/** A wall-mounted interactive artifact trigger: shows a thumbnail + title,
 * detects player proximity, and reports itself to the shared artifact store
 * so a single global "Nhấn E để xem hồ sơ hiện vật" prompt + keydown handler
 * (see ArtifactDetailPanel.tsx) can open its ArtifactDetailPanel. */
export default function ArtifactFrame({ artifact }: ArtifactFrameProps) {
  const texture = useSafeTexture(artifact.thumbnail)
  const { gl } = useThree()
  const frameRef = useRef<Group>(null)
  const edgeMaterialRef = useRef<MeshStandardMaterial>(null)
  // The description board and how far it is revealed (0 hidden .. 1 shown), animated per frame
  // without React re-renders. Troika text fades through its own fillOpacity.
  const boardRef = useRef<Group>(null)
  const boardFrameMaterial = useRef<MeshStandardMaterial>(null)
  const boardPanelMaterial = useRef<MeshStandardMaterial>(null)
  const periodTextRef = useRef<Mesh & { fillOpacity: number }>(null)
  const descriptionTextRef = useRef<Mesh & { fillOpacity: number }>(null)
  const reveal = useRef(0)

  useEffect(() => {
    if (texture) texture.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy())
  }, [gl, texture])

  const [imageWidth, imageHeight] = useMemo(() => {
    const source = texture?.image as { width?: number; height?: number } | undefined
    const aspect = source?.width && source?.height ? source.width / source.height : 3 / 2
    const maxAspect = MAX_IMAGE_WIDTH / MAX_IMAGE_HEIGHT

    return aspect >= maxAspect
      ? [MAX_IMAGE_WIDTH, MAX_IMAGE_WIDTH / aspect]
      : [MAX_IMAGE_HEIGHT * aspect, MAX_IMAGE_HEIGHT]
  }, [texture])

  const outerWidth = imageWidth + FRAME_RAIL * 2
  const outerHeight = imageHeight + FRAME_RAIL * 2

  const position: [number, number, number] = [artifact.position.x, artifact.position.y, artifact.position.z]
  const rotation: [number, number, number] | undefined = artifact.rotation
    ? [artifact.rotation.x, artifact.rotation.y, artifact.rotation.z]
    : undefined

  useArtifactProximity(artifact, frameRef, PROXIMITY_RADIUS, (isNearby) => {
    // Imperative glow toggle (no re-render) — same pattern the existing
    // ImageFrame.tsx uses for its proximity description panel.
    if (edgeMaterialRef.current) {
      const targetIntensity = isNearby ? 0.55 : 0
      edgeMaterialRef.current.emissiveIntensity += (targetIntensity - edgeMaterialRef.current.emissiveIntensity) * 0.15
    }

    // Reveal / hide the description board with distance.
    const target = isNearby ? 1 : 0
    if (Math.abs(target - reveal.current) > 0.002) {
      reveal.current += (target - reveal.current) * BOARD_FADE_SPEED
      if (Math.abs(target - reveal.current) <= 0.002) reveal.current = target
      const opacity = reveal.current
      if (boardRef.current) boardRef.current.visible = opacity > 0.01
      if (boardFrameMaterial.current) boardFrameMaterial.current.opacity = opacity
      if (boardPanelMaterial.current) boardPanelMaterial.current.opacity = opacity
      if (periodTextRef.current) periodTextRef.current.fillOpacity = opacity
      if (descriptionTextRef.current) descriptionTextRef.current.fillOpacity = opacity
    }
  })

  const boardWidth = Math.max(Math.min(outerWidth, 1.3), BOARD_MIN_WIDTH)
  const period = artifact.year

  return (
    <group ref={frameRef} position={position} rotation={rotation} userData={{ artifactId: artifact.id }}>
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

      {/* Edge trim — glows softly (emissive) when the player is in range,
          the frame's own visual cue that E is available. */}
      <mesh position={[0, 0, 0.049]}>
        <planeGeometry args={[imageWidth + 0.015, imageHeight + 0.015]} />
        <meshStandardMaterial
          ref={edgeMaterialRef}
          color={FRAME_EDGE_COLOR}
          emissive={FRAME_EDGE_GLOW}
          emissiveIntensity={0}
          metalness={0.38}
          roughness={0.32}
        />
      </mesh>
      <mesh position={[0, 0, 0.052]} receiveShadow>
        <planeGeometry args={[imageWidth, imageHeight]} />
        <meshStandardMaterial map={texture ?? undefined} color={texture ? '#ffffff' : PLACEHOLDER_COLOR} roughness={0.72} metalness={0} />
      </mesh>

      <group position={[0, -outerHeight / 2 - 0.16, 0.045]}>
        <mesh position={[0, 0, -0.008]}>
          <boxGeometry args={[Math.min(outerWidth, 1.3), 0.19, 0.025]} />
          <meshStandardMaterial color={LABEL_COLOR} metalness={0.28} roughness={0.5} />
        </mesh>
        <Text
          position={[0, 0, 0.008]}
          fontSize={0.06}
          color={LABEL_TEXT_COLOR}
          anchorX="center"
          anchorY="middle"
          maxWidth={Math.min(outerWidth - 0.12, 1.2)}
          textAlign="center"
        >
          {artifact.title}
        </Text>
      </group>

      {/* Small description board directly under the title plate: period, then a
          short description (max two lines). Hidden until the player is close (see onFrame above). */}
      <group ref={boardRef} visible={false} position={[0, -outerHeight / 2 - 0.44, 0.045]}>
        <mesh position={[0, 0, -0.01]}>
          <boxGeometry args={[boardWidth, BOARD_HEIGHT, 0.02]} />
          <meshStandardMaterial ref={boardFrameMaterial} color={FRAME_EDGE_COLOR} metalness={0.38} roughness={0.34} transparent opacity={0} />
        </mesh>
        <mesh position={[0, 0, 0.003]}>
          <boxGeometry args={[boardWidth - 0.025, BOARD_HEIGHT - 0.025, 0.018]} />
          <meshStandardMaterial ref={boardPanelMaterial} color={LABEL_COLOR} metalness={0.22} roughness={0.55} transparent opacity={0} />
        </mesh>
        {period && (
          <Text ref={periodTextRef} fillOpacity={0} position={[0, 0.115, 0.018]} fontSize={0.034} color={PERIOD_TEXT_COLOR} anchorX="center" anchorY="middle" maxWidth={boardWidth - 0.12} textAlign="center" letterSpacing={0.05}>
            {period}
          </Text>
        )}
        <Text
          ref={descriptionTextRef}
          fillOpacity={0}
          position={[0, period ? -0.03 : 0, 0.018]}
          fontSize={0.036}
          color={LABEL_TEXT_COLOR}
          anchorX="center"
          anchorY="middle"
          maxWidth={boardWidth - 0.12}
          textAlign="center"
          lineHeight={1.25}
        >
          {shortDescription(artifact.description)}
        </Text>
      </group>
    </group>
  )
}

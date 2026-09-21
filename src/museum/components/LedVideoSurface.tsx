import { useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { SRGBColorSpace, VideoTexture, Vector3, type Group } from 'three'
import type { MuseumVideo } from '../data/room3Videos'
import { useVideoProximity } from '../hooks/useVideoProximity'

/** The video plays only while its screen is in the visitor's field of view and within this distance;
 * otherwise it is paused (and, until the first time, not even downloaded — the files are several MB).
 * Three videos decoding and uploading to the GPU at once is what a phone or a modest graphics card
 * cannot keep up with, so the ones nobody can see rest. */
const AMBIENT_RANGE = 22
/** Cosine of the angle off the view direction: the screen starts playing inside about 65 degrees of
 * where the visitor is looking (the view is wider than that), and rests beyond about 75 — the gap
 * keeps it from flickering on and off at the edge. Within CLOSE_RANGE it plays whichever way you face. */
const VIEW_ON = 0.42
const VIEW_OFF = 0.26
const CLOSE_RANGE = 2.5
/** How close the player must be to press E for the large player — the same as a wall artifact. */
const INTERACT_RADIUS = 2.4
/** A hair in front of the LED display surface. */
const PICTURE_TONE = '#EDEDED'

interface LedVideoSurfaceProps {
  video: MuseumVideo
  /** The display area inside the frame (m). The picture is fitted inside it, whole. */
  displayWidth: number
  displayHeight: number
  /** Local z of the picture plane. */
  z: number
}

/**
 * The picture on a wall LED screen: the video plays here as a background — muted, looping,
 * no controls — and the screen registers itself as something to walk up to (E opens the large
 * player, see VideoPlayerOverlay). The video is fitted inside the display like object-fit:
 * contain: its own aspect ratio, never stretched, never cropped. Until it has loaded, the
 * screen simply shows the dark idle glass it always had.
 */
export default function LedVideoSurface({ video, displayWidth, displayHeight, z }: LedVideoSurfaceProps) {
  const groupRef = useRef<Group>(null)
  const element = useRef<HTMLVideoElement | null>(null)
  const started = useRef(false)
  const inRange = useRef(false)
  const worldPosition = useRef(new Vector3())
  const toScreen = useRef(new Vector3())
  const viewDirection = useRef(new Vector3())
  const [texture, setTexture] = useState<VideoTexture | null>(null)
  const [ready, setReady] = useState(false)
  // Starts from the size recorded in the data; replaced by the file's real size once it is known.
  const [natural, setNatural] = useState({ width: video.width, height: video.height })

  useEffect(() => {
    const el = document.createElement('video')
    el.crossOrigin = 'anonymous' // WebGL may only sample a cross-origin video that allows it (Cloudinary does)
    el.muted = true
    el.defaultMuted = true
    el.loop = true
    el.playsInline = true
    el.controls = false
    el.preload = 'none'
    el.setAttribute('muted', '')
    el.setAttribute('playsinline', '')

    const onLoadedData = () => setReady(true)
    const onMetadata = () => {
      if (el.videoWidth > 0 && el.videoHeight > 0) setNatural({ width: el.videoWidth, height: el.videoHeight })
    }
    el.addEventListener('loadeddata', onLoadedData)
    el.addEventListener('loadedmetadata', onMetadata)

    const videoTexture = new VideoTexture(el)
    videoTexture.colorSpace = SRGBColorSpace
    element.current = el
    setTexture(videoTexture)

    return () => {
      el.removeEventListener('loadeddata', onLoadedData)
      el.removeEventListener('loadedmetadata', onMetadata)
      el.pause()
      el.removeAttribute('src')
      el.load()
      videoTexture.dispose()
      element.current = null
      started.current = false
      inRange.current = false
      setTexture(null)
      setReady(false)
    }
  }, [])

  useFrame(({ camera }) => {
    const el = element.current
    const group = groupRef.current
    if (!el || !group) return
    group.getWorldPosition(worldPosition.current)
    toScreen.current.subVectors(worldPosition.current, camera.position)
    const distance = toScreen.current.length()
    camera.getWorldDirection(viewDirection.current)
    const facing = distance > 0 ? viewDirection.current.dot(toScreen.current) / distance : 1
    const near = distance <= CLOSE_RANGE || (distance <= AMBIENT_RANGE && facing > (inRange.current ? VIEW_OFF : VIEW_ON))
    if (near === inRange.current) return
    inRange.current = near

    if (near) {
      if (!started.current) {
        el.src = video.url
        el.preload = 'auto'
        started.current = true
      }
      // Muted autoplay is always allowed; a rejected promise (say, mid-navigation) is harmless.
      void el.play().catch(() => undefined)
    } else {
      el.pause()
    }
  })

  useVideoProximity(video, groupRef, INTERACT_RADIUS)

  // object-fit: contain — the largest picture of the video's own shape that fits the display.
  const scale = Math.min(displayWidth / natural.width, displayHeight / natural.height)

  return (
    <group ref={groupRef} position={[0, 0, z]}>
      {texture && (
        <mesh visible={ready}>
          <planeGeometry args={[natural.width * scale, natural.height * scale]} />
          <meshBasicMaterial map={texture} color={PICTURE_TONE} toneMapped={false} />
        </mesh>
      )}
    </group>
  )
}

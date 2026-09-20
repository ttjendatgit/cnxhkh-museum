/** One image inside an artifact's gallery, with its own caption and an
 * optional image-level source credit — used by ArtifactGallery (navigation,
 * caption under the image) and ArtifactDetailPanel (source line). */
export interface ArtifactGalleryImage {
  url: string
  caption: string
  /** Where this specific image comes from, when it differs from the artifact's own source. */
  source?: string
}

/** A single interactive museum exhibit — the data contract shared by
 * ArtifactFrame (3D wall trigger), ArtifactTrigger (3D-object trigger),
 * ArtifactDetailPanel (2D archive page), and ArtifactGallery (image viewer
 * inside the panel). */
export interface Artifact {
  id: string

  roomId: string

  title: string
  subtitle?: string

  year?: string
  location?: string
  category?: string

  description: string
  significance: string
  source: string

  /** Main image shown on the wall frame and as the first item of the panel's gallery. */
  thumbnail: string
  /** Caption for the thumbnail when it appears as the first gallery item. */
  thumbnailCaption?: string
  /** Image-level source credit for the thumbnail, if any. */
  thumbnailSource?: string
  /** Additional archive images, each with its own caption/source. */
  gallery: ArtifactGalleryImage[]

  /** Set for artifacts that are real 3D objects in the scene: names an entry
   * in artifactModels.tsx, which the detail panel renders as an interactive
   * 360° viewer (drag to rotate, wheel to zoom). */
  modelId?: string
  /** Overrides the default "Nhấn E để xem hồ sơ hiện vật" proximity prompt. */
  interactionPrompt?: string

  position: {
    x: number
    y: number
    z: number
  }

  rotation?: {
    x: number
    y: number
    z: number
  }
}

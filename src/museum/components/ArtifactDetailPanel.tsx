import { useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useArtifactStore } from '../state/useArtifactStore'
import { useIsTouchDevice } from '../input/useIsTouchDevice'
import ArtifactGallery from './ArtifactGallery'
import ArtifactModelViewer from './ArtifactModelViewer'
import { ARTIFACT_MODELS } from './artifactModels'
import type { Artifact, ArtifactGalleryImage } from '../types/Artifact'
import '../styles/artifactPanel.css'

const DEFAULT_PROMPT = 'Nhấn E để xem hồ sơ hiện vật'

type MediaMode = 'model' | 'gallery'

/** Content of one open artifact. Mounted with `key={artifact.id}` so gallery
 * position and 3D/gallery mode reset naturally for each artifact. */
function ArtifactPanelBody({ artifact }: { artifact: Artifact }) {
  // The thumbnail is presented as the first gallery item so cover and
  // additional images share one navigation, caption and source path.
  const items = useMemo<ArtifactGalleryImage[]>(
    () => [
      { url: artifact.thumbnail, caption: artifact.thumbnailCaption ?? artifact.title, source: artifact.thumbnailSource },
      ...artifact.gallery,
    ],
    [artifact],
  )
  const count = items.length

  const modelId = artifact.modelId && ARTIFACT_MODELS[artifact.modelId] ? artifact.modelId : null
  const [mode, setMode] = useState<MediaMode>(modelId ? 'model' : 'gallery')
  const [index, setIndex] = useState(0)

  const goPrev = useCallback(() => setIndex((current) => (current - 1 + count) % count), [count])
  const goNext = useCallback(() => setIndex((current) => (current + 1) % count), [count])

  // ArrowLeft / ArrowRight browse images while the gallery is showing.
  useEffect(() => {
    if (mode !== 'gallery' || count < 2) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.code === 'ArrowLeft') {
        event.preventDefault()
        goPrev()
      } else if (event.code === 'ArrowRight') {
        event.preventDefault()
        goNext()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [mode, count, goPrev, goNext])

  const current = items[Math.min(index, count - 1)]

  return (
    <>
      <div className="artifact-panel__media">
        {modelId && (
          <div className="artifact-panel__tabs" role="tablist">
            <button type="button" role="tab" aria-selected={mode === 'model'} className={`artifact-panel__tab${mode === 'model' ? ' artifact-panel__tab--active' : ''}`} onClick={() => setMode('model')}>
              Mô hình 3D
            </button>
            <button type="button" role="tab" aria-selected={mode === 'gallery'} className={`artifact-panel__tab${mode === 'gallery' ? ' artifact-panel__tab--active' : ''}`} onClick={() => setMode('gallery')}>
              Hình ảnh tư liệu
            </button>
          </div>
        )}

        {mode === 'model' && modelId ? (
          <ArtifactModelViewer modelId={modelId} />
        ) : (
          <ArtifactGallery items={items} index={index} onPrev={goPrev} onNext={goNext} onSelect={setIndex} />
        )}
      </div>

      <div className="artifact-panel__info">
        {artifact.category && <p className="artifact-panel__eyebrow">{artifact.category}</p>}
        <h2 className="artifact-panel__title">{artifact.title}</h2>
        {artifact.subtitle && <p className="artifact-panel__subtitle">{artifact.subtitle}</p>}

        <div className="artifact-panel__divider" />

        {artifact.year && (
          <div className="artifact-panel__field">
            <span className="artifact-panel__field-label">Thời gian</span>
            <p className="artifact-panel__field-value">{artifact.year}</p>
          </div>
        )}

        {artifact.location && (
          <div className="artifact-panel__field">
            <span className="artifact-panel__field-label">Địa điểm</span>
            <p className="artifact-panel__field-value">{artifact.location}</p>
          </div>
        )}

        <div className="artifact-panel__field">
          <span className="artifact-panel__field-label">Nội dung</span>
          <p className="artifact-panel__field-value">{artifact.description}</p>
        </div>

        <div className="artifact-panel__field">
          <span className="artifact-panel__field-label">Ý nghĩa</span>
          <p className="artifact-panel__field-value">{artifact.significance}</p>
        </div>

        <div className="artifact-panel__divider" />

        <p className="artifact-panel__source">Nguồn tư liệu: {artifact.source}</p>
        {mode === 'gallery' && current?.source && <p className="artifact-panel__source">Nguồn ảnh: {current.source}</p>}
      </div>
    </>
  )
}

/**
 * The single, always-mounted DOM overlay for the artifact interaction
 * system: it renders the proximity prompt whenever the player is near any
 * artifact, and the full archive-page panel once opened. Also owns the one
 * global keydown listener (E to open, Esc to close) — ArtifactFrame /
 * ArtifactTrigger only ever report proximity, they never listen for keys, so
 * there's exactly one listener regardless of how many artifacts exist.
 * While a panel is open PlayerController freezes movement (it reads the same
 * store), so WASD stays disabled for the whole time a visitor is reading or
 * rotating the 3D model.
 */
export default function ArtifactDetailPanel() {
  const touch = useIsTouchDevice()
  const nearbyArtifact = useArtifactStore((state) => state.nearby?.artifact ?? null)
  const activeArtifact = useArtifactStore((state) => state.activeArtifact)
  const openNearest = useArtifactStore((state) => state.openNearest)
  const close = useArtifactStore((state) => state.close)

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.code === 'KeyE' && !activeArtifact) {
        openNearest()
      } else if (event.code === 'Escape' && activeArtifact) {
        close()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeArtifact, openNearest, close])

  // Keep the pointer free while the panel is open so the cursor works for
  // buttons, scrolling and dragging the 3D model. Anything that re-locks it
  // (PointerLockControls locks on document clicks) is undone immediately.
  useEffect(() => {
    if (!activeArtifact) return

    if (document.pointerLockElement) document.exitPointerLock()

    function handleLockChange() {
      if (document.pointerLockElement) document.exitPointerLock()
    }

    document.addEventListener('pointerlockchange', handleLockChange)
    return () => document.removeEventListener('pointerlockchange', handleLockChange)
  }, [activeArtifact])

  return (
    <>
      {/* On a phone the [TƯƠNG TÁC] button (ui/TouchControls) replaces this "press E" prompt. */}
      {!touch && nearbyArtifact && !activeArtifact && (
        <div className="artifact-prompt">
          <kbd>E</kbd>
          {nearbyArtifact.interactionPrompt ?? DEFAULT_PROMPT}
        </div>
      )}

      <AnimatePresence>
        {activeArtifact && (
          <motion.div
            className="artifact-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={(event) => {
              // Clicks in the overlay must not reach the document-level
              // click handler that PointerLockControls uses to re-lock the pointer.
              event.stopPropagation()
              if (event.target === event.currentTarget) close()
            }}
          >
            {/* Opacity + lift only (no scale): the 3D viewer canvas measures
                its box on mount, and a scaled ancestor would size it wrong. */}
            <motion.div
              className="artifact-panel"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              style={{ position: 'relative' }}
            >
              <button type="button" className="artifact-panel__close" onClick={close} aria-label="Đóng hồ sơ hiện vật">
                ✕
              </button>
              <ArtifactPanelBody key={activeArtifact.id} artifact={activeArtifact} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

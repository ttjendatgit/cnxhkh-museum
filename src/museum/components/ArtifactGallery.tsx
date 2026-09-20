import { useRef, useState } from 'react'
import type { ArtifactGalleryImage } from '../types/Artifact'

/** How far a finger must travel sideways for a swipe to count. */
const SWIPE_MIN_PX = 48

interface ArtifactGalleryProps {
  items: ArtifactGalleryImage[]
  index: number
  onPrev: () => void
  onNext: () => void
  onSelect: (index: number) => void
}

/** The image viewer inside ArtifactDetailPanel: the current image with
 * previous/next buttons and a "1/4" indicator, its caption underneath, and a
 * thumbnail strip for jumping straight to an image. Selection state lives in
 * the panel (so ArrowLeft/ArrowRight can drive it too) — this component is
 * fully controlled.
 *
 * Image format is the browser's concern (jpg/png/webp/gif all load through
 * plain `<img src>`); what this component owns is graceful failure: an image
 * whose URL fails swaps to a placeholder instead of a broken-image icon, and
 * never throws, so one bad asset can't take down the rest of the panel. */
export default function ArtifactGallery({ items, index, onPrev, onNext, onSelect }: ArtifactGalleryProps) {
  const [failed, setFailed] = useState<Set<string>>(() => new Set())
  const swipe = useRef<{ id: number; x: number; y: number } | null>(null)

  if (items.length === 0) return null

  const count = items.length
  const currentIndex = Math.min(index, count - 1)
  const current = items[currentIndex]
  const markFailed = (url: string) => setFailed((prev) => (prev.has(url) ? prev : new Set(prev).add(url)))

  return (
    <div className="artifact-viewer">
      <div
        className="artifact-viewer__stage"
        // Touch: swipe the image left/right for next/previous, like the ‹ › buttons. Vertical
        // drags stay ordinary scrolling (touch-action: pan-y in CSS).
        onPointerDown={(event) => {
          if (event.pointerType === 'touch' && count > 1) swipe.current = { id: event.pointerId, x: event.clientX, y: event.clientY }
        }}
        onPointerUp={(event) => {
          const start = swipe.current
          if (!start || start.id !== event.pointerId) return
          swipe.current = null
          const dx = event.clientX - start.x
          const dy = event.clientY - start.y
          if (Math.abs(dx) >= SWIPE_MIN_PX && Math.abs(dx) > Math.abs(dy) * 1.5) (dx < 0 ? onNext : onPrev)()
        }}
        onPointerCancel={() => {
          swipe.current = null
        }}
      >
        {failed.has(current.url) ? (
          <div className="artifact-panel__media-fallback">Không thể tải ảnh tư liệu</div>
        ) : (
          <img key={current.url} className="artifact-viewer__image" src={current.url} alt={current.caption} onError={() => markFailed(current.url)} />
        )}

        {count > 1 && (
          <>
            <button type="button" className="artifact-viewer__nav artifact-viewer__nav--prev" onClick={onPrev} aria-label="Ảnh trước">
              ‹
            </button>
            <button type="button" className="artifact-viewer__nav artifact-viewer__nav--next" onClick={onNext} aria-label="Ảnh sau">
              ›
            </button>
          </>
        )}
        <span className="artifact-viewer__counter" aria-live="polite">
          {currentIndex + 1}/{count}
        </span>
      </div>

      {current.caption && <p className="artifact-viewer__caption">{current.caption}</p>}

      {count > 1 && (
        <div className="artifact-gallery">
          {items.map((item, itemIndex) => {
            const isBroken = failed.has(item.url)
            return (
              <button
                key={item.url}
                type="button"
                className={`artifact-gallery__thumb${itemIndex === currentIndex ? ' artifact-gallery__thumb--active' : ''}${isBroken ? ' artifact-gallery__thumb--broken' : ''}`}
                onClick={() => onSelect(itemIndex)}
                aria-label={item.caption || `Xem ảnh ${itemIndex + 1}`}
                title={item.caption}
              >
                {isBroken ? (
                  <span className="artifact-gallery__fallback" aria-hidden="true">
                    ⚠
                  </span>
                ) : (
                  <img src={item.url} alt="" loading="lazy" onError={() => markFailed(item.url)} />
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

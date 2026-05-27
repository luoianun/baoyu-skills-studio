import { useEffect } from 'react'

interface LightboxProps {
  images: { url: string; filename: string }[]
  index: number
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}

export function Lightbox({ images, index, onClose, onPrev, onNext }: LightboxProps) {
  const img = images[index]

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onPrev()
      if (e.key === 'ArrowRight') onNext()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose, onPrev, onNext])

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
         onClick={onClose}>
      {/* Close button */}
      <button onClick={onClose}
        className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 rounded-full p-2">
        <span className="material-symbols-outlined">close</span>
      </button>

      {/* Download button */}
      <a href={img.url} download={img.filename}
        className="absolute top-4 left-4 text-white/70 hover:text-white bg-white/10 rounded-full p-2"
        onClick={e => e.stopPropagation()}>
        <span className="material-symbols-outlined">download</span>
      </a>

      {/* Counter */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
        {index + 1} / {images.length}
      </div>

      {/* Prev/Next */}
      {index > 0 && (
        <button onClick={e => { e.stopPropagation(); onPrev() }}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-white/10 rounded-full p-3">
          <span className="material-symbols-outlined">chevron_left</span>
        </button>
      )}
      {index < images.length - 1 && (
        <button onClick={e => { e.stopPropagation(); onNext() }}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-white/10 rounded-full p-3">
          <span className="material-symbols-outlined">chevron_right</span>
        </button>
      )}

      {/* Image */}
      <div className="max-w-5xl max-h-[85vh] px-16" onClick={e => e.stopPropagation()}>
        <img src={img.url} alt={img.filename} className="max-w-full max-h-[85vh] object-contain rounded-lg" />
      </div>
    </div>
  )
}

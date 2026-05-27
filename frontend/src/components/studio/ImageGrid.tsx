interface ImageGridProps {
  images: { url: string; filename: string }[]
  columns?: number
}
export function ImageGrid({ images, columns = 1 }: ImageGridProps) {
  const gridCols = ({
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3',
  } as Record<number, string>)[columns] ?? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'

  return (
    <div className={`grid ${gridCols} gap-4`}>
      {images.map((img, i) => (
        <div key={i} className="group relative rounded-xl overflow-hidden bg-surface-variant">
          <img src={img.url} alt={img.filename} className="w-full h-auto object-cover" />
          <div className="absolute inset-0 bg-black/10 md:bg-black/0 md:group-hover:bg-black/30 transition-colors flex items-start justify-end p-3 md:items-center md:justify-center">
            <a href={img.url} download={img.filename}
              className="bg-white/90 rounded-lg p-2 text-on-surface hover:bg-white transition-colors shadow-sm"
              onClick={e => e.stopPropagation()}>
              <span className="material-symbols-outlined text-xl">download</span>
            </a>
          </div>
        </div>
      ))}
    </div>
  )
}

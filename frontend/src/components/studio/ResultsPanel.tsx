import { Spinner } from './Spinner'
import { ImageGrid } from './ImageGrid'

interface ResultsPanelProps {
  images: { url: string; filename: string }[]
  isLoading: boolean
  columns?: number
}
export function ResultsPanel({ images, isLoading, columns = 1 }: ResultsPanelProps) {
  if (isLoading) return (
    <div className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6">
      <div className="text-center">
        <Spinner size="lg" />
        <p className="text-on-surface-variant text-sm mt-4">生成中...</p>
      </div>
    </div>
  )
  if (images.length === 0) return (
    <div className="flex-1 flex flex-col items-center justify-center text-on-surface-variant px-4 py-12 sm:px-6 sm:py-8">
      <span className="material-symbols-outlined text-5xl opacity-30 mb-3">image</span>
      <p className="text-sm">生成的图片将显示在这里</p>
    </div>
  )
  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 sm:p-6">
      <ImageGrid images={images} columns={columns} />
    </div>
  )
}

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { portfolioApi } from '../../api/portfolios'

const MODULE_COLORS: Record<string, string> = {
  cover_image: 'bg-indigo-100 text-indigo-700',
  infographic: 'bg-emerald-100 text-emerald-700',
  article_illustrator: 'bg-blue-100 text-blue-700',
  comic: 'bg-purple-100 text-purple-700',
  slide_deck: 'bg-amber-100 text-amber-700',
  xhs_images: 'bg-rose-100 text-rose-700',
}

const MODULE_LABELS: Record<string, string> = {
  cover_image: '封面图',
  infographic: '信息图',
  article_illustrator: '文章配图',
  comic: '知识漫画',
  slide_deck: '幻灯片',
  xhs_images: '小红书配图',
}

interface Portfolio {
  id: string
  module: string
  title: string
  status: string
  image_count: number
  created_at: string
  cover_url: string | null
  error_msg?: string | null
}

interface PortfolioCardProps {
  portfolio: Portfolio
  onTitleChange?: (id: string, title: string) => void
  onDelete?: (id: string) => void
}

export function PortfolioCard({ portfolio, onTitleChange, onDelete }: PortfolioCardProps) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(portfolio.title)
  const [deleting, setDeleting] = useState(false)
  const navigate = useNavigate()

  const saveTitle = async () => {
    if (title.trim() && title !== portfolio.title) {
      await portfolioApi.rename(portfolio.id, title.trim())
      onTitleChange?.(portfolio.id, title.trim())
    }
    setEditing(false)
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setDeleting(true)
    try {
      await portfolioApi.delete(portfolio.id)
      onDelete?.(portfolio.id)
    } finally {
      setDeleting(false)
    }
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    const diff = Date.now() - d.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    if (days === 0) return '今天'
    if (days === 1) return '昨天'
    if (days < 7) return `${days}天前`
    return d.toLocaleDateString()
  }

  return (
    <div className="group bg-white rounded-xl border border-surface-variant overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
         onClick={() => navigate(`/portfolios/${portfolio.id}`)}>
      {/* Cover image */}
      <div className="aspect-[4/3] bg-surface-container flex items-center justify-center overflow-hidden relative">
        {portfolio.status === 'pending' ? (
          <div className="flex flex-col items-center gap-2 text-on-surface-variant">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-xs">生成中...</span>
          </div>
        ) : portfolio.status === 'failed' ? (
          <div className="flex flex-col items-center gap-2 px-4 text-center">
            <span className="material-symbols-outlined text-3xl text-error">error_outline</span>
            <span className="text-xs text-error line-clamp-2">{portfolio.error_msg || '生成失败'}</span>
          </div>
        ) : portfolio.cover_url ? (
          <img src={portfolio.cover_url} alt={title} className="w-full h-full object-contain" />
        ) : (
          <span className="material-symbols-outlined text-4xl text-on-surface-variant/30">image</span>
        )}
        {/* Delete button overlay */}
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-error disabled:opacity-40"
          title="删除"
        >
          {deleting
            ? <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
            : <span className="material-symbols-outlined text-[14px]">delete</span>
          }
        </button>
      </div>

      {/* Card body */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${MODULE_COLORS[portfolio.module] ?? 'bg-gray-100 text-gray-600'}`}>
            {MODULE_LABELS[portfolio.module] ?? portfolio.module}
          </span>
        </div>

        {editing ? (
          <input
            autoFocus
            value={title}
            onChange={e => setTitle(e.target.value)}
            onBlur={saveTitle}
            onKeyDown={e => { if (e.key === 'Enter') saveTitle(); if (e.key === 'Escape') { setTitle(portfolio.title); setEditing(false) } }}
            onClick={e => e.stopPropagation()}
            className="w-full text-sm font-medium border-b border-primary outline-none pb-0.5"
          />
        ) : (
          <p
            className="text-sm font-medium text-on-surface truncate hover:text-primary"
            onDoubleClick={e => { e.stopPropagation(); setEditing(true) }}
            title="Double-click to rename"
          >
            {title}
          </p>
        )}

        <p className="text-xs text-on-surface-variant mt-1">
          {portfolio.image_count} 张图片 · {formatDate(portfolio.created_at)}
        </p>
      </div>
    </div>
  )
}

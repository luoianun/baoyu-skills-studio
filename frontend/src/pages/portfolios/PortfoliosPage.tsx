import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { portfolioApi } from '../../api/portfolios'
import { PortfolioCard } from '../../components/portfolio/PortfolioCard'
import { Spinner } from '../../components/studio/Spinner'

const MODULES = [
  { value: '', label: '全部模块' },
  { value: 'cover_image', label: '封面图' },
  { value: 'infographic', label: '信息图' },
  { value: 'article_illustrator', label: '文章配图' },
  { value: 'comic', label: '知识漫画' },
  { value: 'slide_deck', label: '幻灯片' },
  { value: 'xhs_images', label: '小红书配图' },
]

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

export default function PortfoliosPage() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [moduleFilter, setModuleFilter] = useState('')
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const location = useLocation()

  const fetchPortfolios = (p: number, silent = false) => {
    if (!silent) setLoading(true)
    portfolioApi.list(p, moduleFilter).then(data => {
      setPortfolios(data.items)
      setTotal(data.total)
      setLoading(false)
    }).catch(() => setLoading(false))
  }

  useEffect(() => {
    fetchPortfolios(page)
  }, [page, moduleFilter, location.key, (location.state as { ts?: number })?.ts])

  useEffect(() => {
    pollRef.current = setInterval(() => fetchPortfolios(page, true), 3000)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [page])

  const handleTitleChange = (id: string, newTitle: string) => {
    setPortfolios(ps => ps.map(p => p.id === id ? { ...p, title: newTitle } : p))
  }

  const handleDelete = (id: string) => {
    setPortfolios(ps => ps.filter(p => p.id !== id))
    setTotal(t => t - 1)
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-on-surface-variant text-sm">{total} 个合集</p>
        </div>
        <select value={moduleFilter} onChange={e => { setModuleFilter(e.target.value); setPage(1) }}
          className="border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface bg-white focus:outline-none focus:ring-2 focus:ring-primary/30">
          {MODULES.map(m => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : portfolios.length === 0 ? (
        <div className="text-center py-20">
          <span className="material-symbols-outlined text-6xl text-on-surface-variant/30 mb-4 block">folder_open</span>
          <p className="text-on-surface-variant text-sm">暂无作品集，生成你的第一张图片开始吧。</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {portfolios.map(p => (
            <PortfolioCard key={p.id} portfolio={p} onTitleChange={handleTitleChange} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {total > 20 && (
        <div className="flex justify-center gap-2 mt-8">
          <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}
            className="px-4 py-2 rounded-lg border border-outline-variant text-sm disabled:opacity-40 hover:bg-surface transition-colors">
            上一页
          </button>
          <span className="px-4 py-2 text-sm text-on-surface-variant">第 {page} 页</span>
          <button onClick={() => setPage(p => p+1)} disabled={page * 20 >= total}
            className="px-4 py-2 rounded-lg border border-outline-variant text-sm disabled:opacity-40 hover:bg-surface transition-colors">
            下一页
          </button>
        </div>
      )}
    </div>
  )
}

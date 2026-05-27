import { useState, useEffect } from 'react'
import { adminApi } from '../../api/admin'
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

export default function GenerationsPage() {
  const [items, setItems] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [moduleFilter, setModuleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    adminApi.generations({ page, module: moduleFilter || undefined, status: statusFilter || undefined })
      .then(data => {
        setItems(data.items)
        setTotal(data.total)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [page, moduleFilter, statusFilter])

  return (
    <div className="p-6">
      {/* Filters */}
      <div className="flex gap-2 mb-4 items-center">
        <div className="relative">
          <select value={moduleFilter} onChange={e => { setModuleFilter(e.target.value); setPage(1) }}
            className="appearance-none h-8 pl-3 pr-8 text-xs font-medium bg-surface-container border border-outline-variant rounded-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 cursor-pointer transition-colors hover:bg-surface-variant">
            {MODULES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant">
            <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none"><path d="M2.5 4.5L6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </span>
        </div>
        <div className="relative">
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
            className="appearance-none h-8 pl-3 pr-8 text-xs font-medium bg-surface-container border border-outline-variant rounded-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 cursor-pointer transition-colors hover:bg-surface-variant">
            <option value="">全部状态</option>
            <option value="success">成功</option>
            <option value="failed">失败</option>
            <option value="pending">处理中</option>
          </select>
          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant">
            <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none"><path d="M2.5 4.5L6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </span>
        </div>
        <span className="text-xs text-on-surface-variant ml-auto">{total} 条记录</span>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : (
        <div className="bg-white rounded-xl border border-surface-variant overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface-container border-b border-surface-variant">
              <tr>
                {['用户', '模块', '标题', '图片数', '状态', '时间'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((p, i) => (
                <tr key={i} className="border-t border-surface-variant">
                  <td className="px-4 py-3 text-on-surface-variant text-xs">#{p.user_id}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${MODULE_COLORS[p.module] ?? 'bg-gray-100 text-gray-600'}`}>
                      {MODULE_LABELS[p.module] ?? p.module.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-on-surface max-w-xs truncate">{p.title}</td>
                  <td className="px-4 py-3 text-on-surface">{p.image_count}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${p.status === 'success' ? 'bg-emerald-100 text-emerald-700' : p.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'}`}>
                      {p.status === 'success' ? '成功' : p.status === 'failed' ? '失败' : '处理中'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-on-surface-variant">{(() => { const d = new Date(p.created_at); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}` })()}</td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-on-surface-variant text-sm">暂无记录</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {total > 20 && (
        <div className="flex justify-center gap-2 mt-6">
          <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}
            className="px-4 py-2 rounded-lg border border-outline-variant text-sm disabled:opacity-40">上一页</button>
          <span className="px-4 py-2 text-sm text-on-surface-variant">第 {page} 页 / 共 {Math.ceil(total/20)} 页</span>
          <button onClick={() => setPage(p => p+1)} disabled={page * 20 >= total}
            className="px-4 py-2 rounded-lg border border-outline-variant text-sm disabled:opacity-40">下一页</button>
        </div>
      )}
    </div>
  )
}

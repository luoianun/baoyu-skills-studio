import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { adminApi } from '../../api/admin'
import { Spinner } from '../../components/studio/Spinner'

const MODULE_LABELS: Record<string, string> = {
  cover_image: '封面图',
  infographic: '信息图',
  article_illustrator: '文章配图',
  comic: '知识漫画',
  slide_deck: '幻灯片',
  xhs_images: '小红书配图',
}

interface User {
  id: number
  email: string
  username: string
  role: string
  credits: number
  is_active: boolean
  created_at: string
}

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [creditHistory, setCreditHistory] = useState<any[]>([])
  const [genHistory, setGenHistory] = useState<any[]>([])
  const [tab, setTab] = useState<'credits' | 'generations'>('credits')
  const [loading, setLoading] = useState(true)
  const [issueAmount, setIssueAmount] = useState(10)
  const [issueNote, setIssueNote] = useState('')
  const [issuing, setIssuing] = useState(false)

  useEffect(() => {
    if (!id) return
    const uid = parseInt(id)
    Promise.all([
      adminApi.getUser(uid),
      adminApi.creditHistory(uid),
      adminApi.userPortfolios(uid),
    ]).then(([u, credits, portfolios]) => {
      setUser(u)
      setCreditHistory(credits)
      setGenHistory(portfolios)
      setLoading(false)
    }).catch(() => navigate('/admin/users'))
  }, [id])

  const handleIssueCredits = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || issueAmount === 0) return
    setIssuing(true)
    try {
      const updated = await adminApi.issueCredits(user.id, issueAmount, issueNote)
      setUser(updated)
      const credits = await adminApi.creditHistory(user.id)
      setCreditHistory(credits)
      setIssueNote('')
    } finally {
      setIssuing(false)
    }
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>
  if (!user) return null

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 text-sm text-on-surface-variant">
        <button onClick={() => navigate('/admin/users')} className="hover:text-primary">用户</button>
        <span>/</span>
        <span>{user.email}</span>
      </div>

      <div className="flex gap-6">
        {/* Left: User info card */}
        <div className="w-72 flex-shrink-0">
          <div className="bg-white rounded-xl border border-surface-variant p-5">
            <div className="flex flex-col items-center text-center mb-5">
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-bold mb-3">
                {user.username[0]?.toUpperCase()}
              </div>
              <h2 className="font-bold text-on-surface">{user.username}</h2>
              <p className="text-on-surface-variant text-sm">{user.email}</p>
              <span className={`mt-2 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${user.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-surface-variant text-on-surface-variant'}`}>
                {user.role}
              </span>
            </div>

            <div className="border-t border-surface-variant pt-4 mb-5">
              <p className="text-xs text-on-surface-variant uppercase tracking-wide font-semibold mb-1">积分</p>
              <p className="text-3xl font-bold text-amber-600">{user.credits}</p>
            </div>

            {/* Issue Credits form */}
            <form onSubmit={handleIssueCredits} className="space-y-3">
              <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">发放积分</p>
              <input type="number" value={issueAmount}
                onChange={e => setIssueAmount(parseInt(e.target.value) || 0)}
                className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="数量（负数为扣除）" />
              <input type="text" value={issueNote} onChange={e => setIssueNote(e.target.value)}
                className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="备注（可选）" />
              <button type="submit" disabled={issuing || issueAmount === 0}
                className="w-full bg-primary text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-primary-dark disabled:opacity-60 transition-colors">
                {issuing ? '发放中...' : '发放积分'}
              </button>
            </form>
          </div>
        </div>

        {/* Right: Tabs */}
        <div className="flex-1">
          <div className="flex border-b border-surface-variant mb-4">
            {(['credits', 'generations'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${tab === t ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}>
                {t === 'credits' ? '积分记录' : '生成记录'}
              </button>
            ))}
          </div>

          {tab === 'credits' ? (
            <div className="bg-white rounded-xl border border-surface-variant overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-surface-container border-b border-surface-variant">
                  <tr>
                    {['日期', '类型', '数量', '变动后余额', '备注'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {creditHistory.map((t, i) => (
                    <tr key={i} className="border-t border-surface-variant">
                      <td className="px-4 py-3 text-on-surface-variant">{(() => { const d = new Date(t.created_at); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}` })()}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${t.type === 'admin_grant' ? 'bg-emerald-100 text-emerald-700' : t.type === 'generation' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                          {t.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className={`px-4 py-3 font-medium ${t.amount > 0 ? 'text-emerald-600' : 'text-error'}`}>
                        {t.amount > 0 ? '+' : ''}{t.amount}
                      </td>
                      <td className="px-4 py-3 text-on-surface">{t.balance_after}</td>
                      <td className="px-4 py-3 text-on-surface-variant">{t.note || '—'}</td>
                    </tr>
                  ))}
                  {creditHistory.length === 0 && (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-on-surface-variant text-sm">暂无记录</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-surface-variant overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-surface-container border-b border-surface-variant">
                  <tr>
                    {['日期', '模块', '标题', '图片数', '状态'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {genHistory.map((p, i) => (
                    <tr key={i} className="border-t border-surface-variant">
                      <td className="px-4 py-3 text-on-surface-variant">{(() => { const d = new Date(p.created_at); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}` })()}</td>
                      <td className="px-4 py-3 text-on-surface">{MODULE_LABELS[p.module] ?? p.module.replace('_', ' ')}</td>
                      <td className="px-4 py-3 text-on-surface truncate max-w-xs">{p.title}</td>
                      <td className="px-4 py-3 text-on-surface">{p.image_count}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${p.status === 'success' ? 'bg-emerald-100 text-emerald-700' : p.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'}`}>
                          {p.status === 'success' ? '成功' : p.status === 'failed' ? '失败' : '处理中'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {genHistory.length === 0 && (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-on-surface-variant text-sm">暂无生成记录</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

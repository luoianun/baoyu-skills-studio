import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminApi } from '../../api/admin'
import { Spinner } from '../../components/studio/Spinner'

interface User {
  id: number
  email: string
  username: string
  role: string
  credits: number
  is_active: boolean
  created_at: string
}

export default function UserListPage() {
  const [users, setUsers] = useState<User[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const navigate = useNavigate()

  const fetchUsers = () => {
    setLoading(true)
    adminApi.users({ page, search }).then(data => {
      setUsers(data.items)
      setTotal(data.total)
      setLoading(false)
    }).catch(() => setLoading(false))
  }

  useEffect(() => { fetchUsers() }, [page, search])

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <input
          type="text"
          placeholder="搜索邮箱或用户名..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          className="w-80 border border-outline-variant rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-primary text-white rounded-lg px-4 py-2.5 text-sm font-semibold hover:bg-primary-dark transition-colors">
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          创建用户
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : (
        <div className="bg-white rounded-xl border border-surface-variant overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface-container border-b border-surface-variant">
              <tr>
                {['用户', '用户名', '积分', '角色', '状态', '注册时间', '操作'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-t border-surface-variant hover:bg-surface-container-low cursor-pointer"
                    onClick={() => navigate(`/admin/users/${u.id}`)}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {u.username[0]?.toUpperCase()}
                      </div>
                      <span className="text-on-surface text-sm">{u.email}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-on-surface-variant">{u.username}</td>
                  <td className="px-4 py-3">
                    <span className={u.credits === 0 ? 'text-amber-600 font-semibold' : 'text-on-surface'}>
                      {u.credits}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                      {u.role === 'admin' ? '管理员' : '普通用户'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${u.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                      {u.is_active ? '正常' : '已禁用'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-on-surface-variant">
                    {(() => { const d = new Date(u.created_at); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}` })()}
                  </td>
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => navigate(`/admin/users/${u.id}`)}
                      className="text-primary text-xs font-medium hover:underline">
                      查看
                    </button>
                  </td>
                </tr>
              ))}
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

      {/* Create User Modal */}
      {showModal && (
        <CreateUserModal onClose={() => setShowModal(false)} onSuccess={() => { setShowModal(false); fetchUsers() }} />
      )}
    </div>
  )
}

function CreateUserModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({ email: '', username: '', password: '', role: 'user', initial_credits: 0 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await adminApi.createUser(form)
      onSuccess()
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } } }
      setError(e.response?.data?.detail ?? '创建用户失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
        <h2 className="text-lg font-bold text-on-surface mb-4">创建用户</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { key: 'email', label: '邮箱', type: 'email', placeholder: 'user@example.com' },
            { key: 'username', label: '用户名', type: 'text', placeholder: 'username' },
            { key: 'password', label: '密码', type: 'password', placeholder: '••••••••' },
          ].map(f => (
            <div key={f.key}>
              <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide block mb-1.5">{f.label}</label>
              <input type={f.type} placeholder={f.placeholder} required
                value={(form as Record<string, string | number>)[f.key] as string}
                onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                className="w-full border border-outline-variant rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          ))}
          <div>
            <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide block mb-1.5">角色</label>
            <div className="flex gap-3">
              {[{ value: 'user', label: '普通用户' }, { value: 'admin', label: '管理员' }].map(r => (
                <button key={r.value} type="button"
                  onClick={() => setForm(prev => ({ ...prev, role: r.value }))}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors ${form.role === r.value ? 'bg-primary text-white border-primary' : 'border-outline-variant text-on-surface hover:bg-surface'}`}>
                  {r.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide block mb-1.5">初始积分</label>
            <input type="text" inputMode="numeric" pattern="[0-9]*" placeholder="请输入积分数量" value={form.initial_credits || ''}
              onChange={e => setForm(prev => ({ ...prev, initial_credits: parseInt(e.target.value) || 0 }))}
              className="w-full border border-outline-variant rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          {error && <p className="text-error text-sm">{error}</p>}
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 border border-outline-variant rounded-lg text-sm hover:bg-surface">
              取消
            </button>
            <button type="submit" disabled={loading}
              className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-dark disabled:opacity-60">
              {loading ? '创建中...' : '创建用户'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

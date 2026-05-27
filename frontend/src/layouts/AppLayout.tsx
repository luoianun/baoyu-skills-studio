import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/auth'
import { useUIStore } from '../store/ui'
import { useEffect, useState } from 'react'
import { authApi } from '../api/auth'

const studioLinks = [
  { to: '/studio/cover-image', icon: 'image', label: '封面图' },
  { to: '/studio/infographic', icon: 'leaderboard', label: '信息图' },
  { to: '/studio/article-illustrator', icon: 'edit_note', label: '文章配图' },
  { to: '/studio/comic', icon: 'auto_stories', label: '知识漫画' },
  { to: '/studio/slide-deck', icon: 'present_to_all', label: '幻灯片' },
  { to: '/studio/xhs-images', icon: 'burst_mode', label: '小红书配图' },
]
const libraryLinks = [
  { to: '/portfolios', icon: 'folder_special', label: '我的作品集' },
]
const adminLinks = [
  { to: '/admin', icon: 'dashboard', label: '仪表盘' },
  { to: '/admin/users', icon: 'group', label: '用户' },
  { to: '/admin/generations', icon: 'image_search', label: '生成记录' },
]

export function AppLayout() {
  const { user, setUser, logout } = useAuthStore()
  const { portfolioModule } = useUIStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [showProfile, setShowProfile] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  useEffect(() => {
    if (!user) {
      authApi.me().then(u => { setUser(u); authApi.ping().catch(() => {}) }).catch(() => navigate('/login'))
    } else {
      authApi.ping().catch(() => {})
    }
  }, [])

  useEffect(() => {
    setMobileNavOpen(false)
  }, [location.pathname])

  const handleLogout = async () => {
    const rt = localStorage.getItem('refresh_token') || ''
    await authApi.logout(rt)
    logout()
    navigate('/login')
  }

  const PATH_LABELS: Record<string, string> = {
    studio: '创作台',
    'cover-image': '封面图',
    infographic: '信息图',
    'article-illustrator': '文章配图',
    comic: '知识漫画',
    'slide-deck': '幻灯片',
    'xhs-images': '小红书配图',
    portfolios: '作品库',
    admin: '管理后台',
    users: '用户',
    generations: '生成记录',
  }

  const crumb = (() => {
    const parts = location.pathname.split('/').filter(Boolean)
    if (parts[0] === 'portfolios' && parts.length === 2) {
      return ['作品库', '我的作品集', portfolioModule].filter(Boolean).join(' / ')
    }
    const labels = parts.map(s => PATH_LABELS[s] ?? s.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()))
    if (location.pathname === '/admin') labels.push('仪表盘')
    if (location.pathname === '/portfolios') labels.push('我的作品集')
    return labels.join(' / ')
  })()

  return (
    <>
      <div className="flex min-h-screen bg-surface md:h-screen md:overflow-hidden">
        {mobileNavOpen && (
          <button
            type="button"
            aria-label="关闭导航"
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
            onClick={() => setMobileNavOpen(false)}
          />
        )}

        <aside className={`fixed inset-y-0 left-0 z-50 w-64 max-w-[85vw] -translate-x-full bg-sidebar flex flex-col py-4 transition-transform duration-200 md:static md:z-auto md:w-56 md:max-w-none md:translate-x-0 md:flex-shrink-0 ${mobileNavOpen ? 'translate-x-0' : ''}`}>
          <div className="px-4 mb-6 flex items-center gap-2.5">
            <img src="/logo.svg" alt="baoyu-skills-studio" className="w-8 h-8 rounded-md object-contain" />
            <div>
              <span className="text-white font-bold text-sm tracking-wider">Baoyu Skills</span>
              <p className="text-white/40 text-xs">Studio</p>
            </div>
          </div>

          <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto">
            {studioLinks.map(l => (
              <NavLink key={l.to} to={l.to}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${isActive ? 'bg-primary/20 text-white border-l-2 border-primary' : 'text-white/50 hover:text-white hover:bg-white/5'}`
                }>
                <span className="material-symbols-outlined text-[18px]">{l.icon}</span>
                {l.label}
              </NavLink>
            ))}

            <div className="pt-3 pb-1 px-3">
              <p className="text-white/30 text-[10px] font-semibold tracking-widest uppercase">作品库</p>
            </div>
            {libraryLinks.map(l => (
              <button key={l.to}
                onClick={() => navigate(l.to, { state: { ts: Date.now() } })}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${location.pathname.startsWith(l.to) ? 'bg-primary/20 text-white border-l-2 border-primary' : 'text-white/50 hover:text-white hover:bg-white/5'}`}>
                <span className="material-symbols-outlined text-[18px]">{l.icon}</span>
                {l.label}
              </button>
            ))}

            {user?.role === 'admin' && (
              <>
                <div className="pt-3 pb-1 px-3 mt-2 border-t border-white/10">
                  <p className="text-white/30 text-[10px] font-semibold tracking-widest uppercase pt-2">管理后台</p>
                </div>
                {adminLinks.map(l => (
                  <NavLink key={l.to} to={l.to} end={l.to === '/admin'}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${isActive ? 'bg-primary/20 text-white border-l-2 border-primary' : 'text-white/50 hover:text-white hover:bg-white/5'}`
                    }>
                    <span className="material-symbols-outlined text-[18px]">{l.icon}</span>
                    {l.label}
                  </NavLink>
                ))}
              </>
            )}
          </nav>

          <div className="px-3 pt-3 border-t border-white/10">
            <div className="flex items-center gap-2.5 px-2 py-2">
              <button onClick={() => setShowProfile(true)}
                className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0 hover:bg-primary-dark transition-colors">
                {user?.username?.[0]?.toUpperCase()}
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-medium truncate">{user?.username}</p>
                <p className="text-amber-400 text-[11px]">{user?.credits} 积分</p>
              </div>
              <button onClick={handleLogout} className="text-white/30 hover:text-white">
                <span className="material-symbols-outlined text-[18px]">logout</span>
              </button>
            </div>
          </div>
        </aside>

        <div className="flex-1 flex min-w-0 flex-col md:overflow-hidden">
          <header className="h-14 flex items-center gap-3 px-4 sm:px-6 bg-white border-b border-surface-variant flex-shrink-0">
            <button
              type="button"
              className="md:hidden w-9 h-9 rounded-lg border border-surface-variant flex items-center justify-center text-on-surface"
              onClick={() => setMobileNavOpen(true)}
              aria-label="打开导航"
            >
              <span className="material-symbols-outlined text-[20px]">menu</span>
            </button>
            <p className="text-sm text-on-surface-variant truncate min-w-0">{crumb}</p>
          </header>

          <main className="flex-1 min-h-0 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
      {showProfile && user && (
        <ProfileModal user={user} onClose={() => setShowProfile(false)} onSaved={setUser} />
      )}
    </>
  )
}

function ProfileModal({ user, onClose, onSaved }: { user: { username: string; email: string; credits: number; role: string }, onClose: () => void, onSaved: (u: any) => void }) {
  const [username, setUsername] = useState(user.username)
  const [currentPwd, setCurrentPwd] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSave = async () => {
    setError('')
    setSuccess('')
    if (newPwd && newPwd !== confirmPwd) { setError('两次密码不一致'); return }
    if (newPwd && !currentPwd) { setError('请输入当前密码'); return }
    setLoading(true)
    try {
      const body: any = {}
      if (username !== user.username) body.username = username
      if (newPwd) { body.current_password = currentPwd; body.new_password = newPwd }
      if (!Object.keys(body).length) { setError('未做任何修改'); setLoading(false); return }
      const updated = await authApi.updateMe(body)
      onSaved(updated)
      setSuccess('保存成功')
      setCurrentPwd(''); setNewPwd(''); setConfirmPwd('')
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? '保存失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 sm:p-6" onClick={onClose}>
      <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-sm max-h-[calc(100vh-2rem)] overflow-y-auto shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white text-lg font-bold">
            {username[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-on-surface break-all">{user.email}</p>
            <p className="text-xs text-on-surface-variant">{user.role === 'admin' ? '管理员' : '普通用户'} · {user.credits} 积分</p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide block mb-1.5">用户名</label>
            <input value={username} onChange={e => setUsername(e.target.value)}
              className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div className="border-t border-surface-variant pt-3">
            <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-2">修改密码（选填）</p>
            <div className="space-y-2">
              <input type="password" placeholder="当前密码" value={currentPwd} onChange={e => setCurrentPwd(e.target.value)}
                className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              <input type="password" placeholder="新密码" value={newPwd} onChange={e => setNewPwd(e.target.value)}
                className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              <input type="password" placeholder="确认新密码" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)}
                className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
          </div>
        </div>

        {error && <p className="text-red-500 text-xs mt-3">{error}</p>}
        {success && <p className="text-emerald-600 text-xs mt-3">{success}</p>}

        <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end mt-5">
          <button onClick={onClose} className="px-4 py-2 border border-outline-variant rounded-lg text-sm hover:bg-surface">取消</button>
          <button onClick={handleSave} disabled={loading}
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-dark disabled:opacity-60">
            {loading ? '保存中...' : '保存'}
          </button>
        </div>
      </div>
    </div>
  )
}

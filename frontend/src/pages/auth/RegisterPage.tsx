import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authApi } from '../../api/auth'
import { useAuthStore } from '../../store/auth'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { setUser } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const tokens = await authApi.register(email, username, password)
      localStorage.setItem('access_token', tokens.access_token)
      localStorage.setItem('refresh_token', tokens.refresh_token)
      const me = await authApi.me()
      setUser(me)
      navigate('/studio/cover-image')
    } catch {
      setError('注册失败，邮箱可能已被使用。')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface flex items-start sm:items-center justify-center px-4 py-8 sm:p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-surface-variant p-6 sm:p-8">
        <div className="flex flex-col items-center mb-8">
          <img src="/logo.svg" alt="baoyu-skills-studio" className="w-16 h-16 rounded-xl object-cover mb-3" />
          <h1 className="text-on-surface font-semibold text-lg">baoyu-skills-studio</h1>
        </div>

        <h2 className="text-xl font-bold text-on-surface text-center mb-1">创建账号</h2>
        <p className="text-on-surface-variant text-sm text-center mb-6">申请访问以开始使用</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide block mb-1.5">
              邮箱地址
            </label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              className="w-full border border-outline-variant rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              placeholder="name@example.com" required />
          </div>

          <div>
            <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide block mb-1.5">
              用户名
            </label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)}
              className="w-full border border-outline-variant rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              placeholder="你的名字" required />
          </div>

          <div>
            <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide block mb-1.5">
              密码
            </label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full border border-outline-variant rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              placeholder="••••••••" required />
          </div>

          {error && <p className="text-error text-sm">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full bg-primary text-white rounded-lg py-2.5 font-semibold text-sm hover:bg-primary-dark transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
            {loading ? '创建中…' : (
              <>创建账号 <span className="material-symbols-outlined text-[18px]">arrow_forward</span></>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-on-surface-variant mt-6">
          已有账号？{' '}
          <Link to="/login" className="text-primary font-medium hover:underline">登录</Link>
        </p>
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { adminApi } from '../../api/admin'
import { Spinner } from '../../components/studio/Spinner'
import { LineChart } from '../../components/charts/LineChart'

interface Stats {
  total_users: number
  today_generations: number
  credits_issued: number
  credits_used: number
}

interface DailyPoint {
  date: string
  active_users: number
  generations: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [daily, setDaily] = useState<DailyPoint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      adminApi.stats(),
      adminApi.dailyStats(14),
    ]).then(([s, d]) => {
      setStats(s)
      setDaily(d)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  const statCards = [
    { label: '总用户数', value: stats?.total_users ?? 0, color: 'text-on-surface', icon: 'group' },
    { label: '今日生成', value: stats?.today_generations ?? 0, color: 'text-primary', icon: 'image' },
    { label: '已发放积分', value: stats?.credits_issued ?? 0, color: 'text-emerald-600', icon: 'add_circle' },
    { label: '已使用积分', value: stats?.credits_used ?? 0, color: 'text-amber-600', icon: 'payments' },
  ]

  const dauData = daily.map(d => ({ label: d.date, value: d.active_users }))
  const genData = daily.map(d => ({ label: d.date, value: d.generations }))

  return (
    <div className="p-6">
      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {statCards.map(card => (
          <div key={card.label} className="bg-white rounded-xl border border-surface-variant p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">{card.label}</span>
              <span className={`material-symbols-outlined text-[20px] ${card.color}`}>{card.icon}</span>
            </div>
            <p className={`text-3xl font-bold ${card.color}`}>{card.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Trend charts */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-surface-variant p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-[18px] text-primary">people</span>
            <p className="text-sm font-semibold text-on-surface">每日活跃用户 (近14天)</p>
          </div>
          <LineChart data={dauData} color="#6366f1" height={130} />
        </div>

        <div className="bg-white rounded-xl border border-surface-variant p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-[18px] text-amber-500">bar_chart</span>
            <p className="text-sm font-semibold text-on-surface">每日出图数量 (近14天)</p>
          </div>
          <LineChart data={genData} color="#f59e0b" height={130} />
        </div>
      </div>
    </div>
  )
}

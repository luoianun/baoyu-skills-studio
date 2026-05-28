interface DataPoint {
  label: string
  value: number
}

interface LineChartProps {
  data: DataPoint[]
  color?: string
  height?: number
}

export function LineChart({ data, color = '#6366f1', height = 120 }: LineChartProps) {
  if (!data.length) return null

  const w = 600
  const h = height
  const padX = 8
  const padTop = 12
  const padBottom = 24

  const values = data.map(d => d.value)
  const max = Math.max(...values, 1)
  const min = 0

  const toX = (i: number) => padX + (i / (data.length - 1)) * (w - padX * 2)
  const toY = (v: number) => padTop + (1 - (v - min) / (max - min)) * (h - padTop - padBottom)

  const points = data.map((d, i) => `${toX(i)},${toY(d.value)}`).join(' ')
  const areaPoints = [
    `${toX(0)},${h - padBottom}`,
    ...data.map((d, i) => `${toX(i)},${toY(d.value)}`),
    `${toX(data.length - 1)},${h - padBottom}`,
  ].join(' ')

  const step = data.length > 10 ? 2 : 1

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height }}>
      <defs>
        <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.15" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#grad-${color.replace('#', '')})`} />
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {data.map((d, i) => (
        <circle key={i} cx={toX(i)} cy={toY(d.value)} r="3" fill={color} />
      ))}
      {data.map((d, i) => i % step === 0 && (
        <text key={i} x={toX(i)} y={h - 4} textAnchor="middle" fontSize="9" fill="#94a3b8">
          {d.label}
        </text>
      ))}
    </svg>
  )
}

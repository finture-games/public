import { ASPECT_LIST, ASPECT_SHORT, type Aspect } from '../data/types'

export default function RadarChart({ scores }: { scores: Record<Aspect, number> }) {
  const cx = 120
  const cy = 112
  const R = 82
  const rings = [20, 40, 60, 80, 100]
  const angle = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / 5
  const point = (i: number, r: number) => ({
    x: cx + Math.cos(angle(i)) * r,
    y: cy + Math.sin(angle(i)) * r,
  })
  const ringPoints = (r: number) =>
    ASPECT_LIST.map((_, i) => {
      const p = point(i, (r / 100) * R)
      return p.x.toFixed(1) + ',' + p.y.toFixed(1)
    }).join(' ')
  const dataPoints = ASPECT_LIST.map((a, i) => {
    const p = point(i, (Math.max(0, Math.min(100, scores[a])) / 100) * R)
    return p.x.toFixed(1) + ',' + p.y.toFixed(1)
  }).join(' ')
  return (
    <svg viewBox="0 0 240 220" className="w-full">
      {rings.map((r) => (
        <polygon
          key={r}
          points={ringPoints(r)}
          fill="none"
          stroke="#1E1B3A"
          strokeOpacity={r === 100 ? 0.35 : 0.15}
          strokeWidth={1}
        />
      ))}
      {ASPECT_LIST.map((_, i) => {
        const p = point(i, R)
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={p.x}
            y2={p.y}
            stroke="#1E1B3A"
            strokeOpacity={0.15}
          />
        )
      })}
      <polygon points={dataPoints} fill="rgba(91,63,255,0.25)" stroke="#5B3FFF" strokeWidth={2} />
      {ASPECT_LIST.map((a, i) => {
        const p = point(i, (Math.max(0, Math.min(100, scores[a])) / 100) * R)
        return <circle key={a} cx={p.x} cy={p.y} r={3.5} fill="#5B3FFF" />
      })}
      {ASPECT_LIST.map((a, i) => {
        const p = point(i, R + 17)
        return (
          <text
            key={a}
            x={p.x}
            y={p.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={10}
            fontWeight={600}
            fill="#1E1B3A"
          >
            {ASPECT_SHORT[a]} {Math.round(scores[a])}
          </text>
        )
      })}
    </svg>
  )
}

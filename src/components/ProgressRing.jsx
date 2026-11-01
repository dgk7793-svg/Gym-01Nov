import { useId, useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const palettes = {
  neon: ['#C8FF2E', '#6CF07A'],
  aqua: ['#22E4F2', '#4D8DFF'],
  ember: ['#FFB03A', '#FF5A2F'],
  brand: ['#C8FF2E', '#22E4F2'],
}

export default function ProgressRing({ value, max = 100, size = 120, stroke = 10, color = 'neon', children, duration = 1.4, transition }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  const gid = 'ring' + useId().replace(/[^a-zA-Z0-9]/g, '')
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const pct = Math.max(0, Math.min(1, max ? value / max : 0))
  const [a, b] = palettes[color] ?? palettes.neon
  const target = inView ? c * (1 - pct) : c

  return (
    <div ref={ref} className="relative inline-grid shrink-0 place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" style={{ filter: `drop-shadow(0 0 8px ${a}66)` }}>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={a} />
            <stop offset="100%" stopColor={b} />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-line/10" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#${gid})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: target }}
          transition={transition ?? { duration, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  )
}

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Award, Medal, TrendingUp, Trophy } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import GlassCard from '../components/GlassCard'
import AnimatedCounter from '../components/AnimatedCounter'
import EmptyState from '../components/EmptyState'
import useChartTheme from '../hooks/useChartTheme'
import { lifts, personalRecords, progressSummary, strengthHistory } from '../data/mockData'

const tiers = {
  gold: { icon: Trophy, ring: 'from-[#FFE27A] to-[#E8A800]', glow: 'shadow-[0_0_30px_-6px_rgba(255,210,63,0.6)]', label: 'Gold' },
  silver: { icon: Medal, ring: 'from-[#F1F5F9] to-[#94A3B8]', glow: 'shadow-[0_0_30px_-8px_rgba(203,213,225,0.5)]', label: 'Silver' },
  bronze: { icon: Award, ring: 'from-[#F4B183] to-[#B8643A]', glow: 'shadow-[0_0_30px_-8px_rgba(205,127,50,0.5)]', label: 'Bronze' },
}

function StrengthTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-line/10 bg-bg/95 px-3 py-2 text-sm shadow-xl backdrop-blur">
      <p className="mb-1 font-semibold">Week {label.slice(1)}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ background: p.stroke }} />
          <span className="text-muted">{lifts.find((l) => l.key === p.dataKey)?.label}</span>
          <span className="ml-auto pl-3 font-semibold tabular-nums">{p.value} kg</span>
        </p>
      ))}
    </div>
  )
}

export default function Progress() {
  const chart = useChartTheme()
  const [visible, setVisible] = useState(() => new Set(lifts.map((l) => l.key)))
  // Neon lime washes out on the light background, so use a deeper lime there
  const colorOf = (l) => (!chart.dark && l.key === 'bench' ? '#6AAE00' : l.color)
  const [range, setRange] = useState(12)

  const data = strengthHistory.slice(-range)
  const toggle = (k) =>
    setVisible((prev) => {
      const next = new Set(prev)
      next.has(k) ? next.delete(k) : next.add(k)
      return next
    })

  return (
    <div>
      <PageHeader
        eyebrow="Progress"
        title="Stronger every week"
        subtitle="Your main lifts over the last 12 weeks, plus the records you’ve smashed."
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {progressSummary.map((s, i) => (
          <GlassCard key={s.label} delay={i * 0.05} hover className="!p-5">
            <p className="text-sm text-muted">{s.label}</p>
            <p className="mt-2 font-display text-3xl font-bold">
              <AnimatedCounter value={s.value} decimals={s.decimals ?? 0} suffix={s.suffix} />
            </p>
          </GlassCard>
        ))}
      </div>

      <GlassCard delay={0.1} className="mb-8">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <TrendingUp className="h-5 w-5 text-accent" /> Strength gains
            </h2>
            <p className="text-sm text-muted">Estimated 1-rep max (kg)</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {lifts.map((l) => {
              const on = visible.has(l.key)
              return (
                <button
                  key={l.key}
                  onClick={() => toggle(l.key)}
                  aria-pressed={on}
                  className={`chip flex items-center gap-2 border ${on ? 'border-line/20 bg-line/5' : 'border-line/10 text-muted opacity-60'}`}
                >
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: colorOf(l) }} />
                  {l.label}
                </button>
              )
            })}
            <div className="glass flex rounded-full p-1">
              {[6, 12].map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`relative min-h-[40px] min-w-[48px] rounded-full px-3.5 py-2 text-sm font-medium ${range === r ? 'text-[#07090D]' : 'text-muted'}`}
                >
                  {range === r && <motion.span layoutId="range-pill" className="absolute inset-0 rounded-full bg-neon" />}
                  <span className="relative">{r}W</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {visible.size === 0 ? (
          <div className="grid h-72 place-items-center text-center text-muted">
            <p>
              Pick at least one lift above to see your curve.
            </p>
          </div>
        ) : (
          <div className="h-72 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 8, left: -16, bottom: 0 }}>
                <defs>
                  {lifts.map((l) => (
                    <linearGradient key={l.key} id={`fill-${l.key}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={colorOf(l)} stopOpacity={0.28} />
                      <stop offset="100%" stopColor={colorOf(l)} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid vertical={false} stroke={chart.grid} />
                <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: chart.axis, fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: chart.axis, fontSize: 12 }} domain={['dataMin - 10', 'dataMax + 10']} />
                <Tooltip content={<StrengthTooltip />} cursor={{ stroke: chart.axis, strokeDasharray: '4 4' }} />
                {lifts
                  .filter((l) => visible.has(l.key))
                  .map((l) => (
                    <Area
                      key={l.key + range}
                      type="monotone"
                      dataKey={l.key}
                      stroke={colorOf(l)}
                      strokeWidth={3}
                      fill={`url(#fill-${l.key})`}
                      dot={false}
                      activeDot={{ r: 6, strokeWidth: 3, stroke: chart.dark ? '#06080C' : '#F3F5EF' }}
                      animationDuration={1400}
                    />
                  ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </GlassCard>

      <div className="mb-4 flex items-end justify-between">
        <h2 className="text-2xl font-bold">Personal records</h2>
        <span className="text-sm text-muted">{personalRecords.length} PRs</span>
      </div>

      {personalRecords.length === 0 ? (
        <EmptyState icon={Trophy} title="No PRs yet" message="Finish a few workouts and your personal records will show up here." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {personalRecords.map((pr, i) => {
            const t = tiers[pr.tier]
            return (
              <motion.div
                key={pr.lift}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ y: -5 }}
                className="glass relative overflow-hidden rounded-3xl p-5"
              >
                {pr.isNew && (
                  <span className="absolute right-4 top-4 rounded-full bg-neon px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[#07090D]">
                    New
                  </span>
                )}
                <div className="flex items-center gap-4">
                  <motion.span
                    initial={{ rotate: -30, scale: 0.5 }}
                    whileInView={{ rotate: 0, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: 'spring', delay: 0.1 + i * 0.06 }}
                    className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${t.ring} ${t.glow} text-[#07090D]`}
                  >
                    <t.icon className="h-7 w-7" />
                  </motion.span>
                  <div>
                    <p className="text-sm text-muted">{pr.lift}</p>
                    <p className="font-display text-3xl font-bold leading-tight">
                      {pr.value}
                      {pr.unit && <span className="ml-1 text-base font-medium text-muted">{pr.unit}</span>}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-line/10 pt-3 text-sm">
                  <span className="text-muted">
                    {t.label} · {pr.date}
                  </span>
                  <span className="font-semibold text-accent">{pr.delta}</span>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}

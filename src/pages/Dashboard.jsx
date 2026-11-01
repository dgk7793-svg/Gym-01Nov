import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ArrowRight, Calendar, CalendarX, CircleCheck, Clock, Dumbbell, Flame, Layers, Library, Play, Users, Zap } from 'lucide-react'
import GlassCard from '../components/GlassCard'
import ProgressRing from '../components/ProgressRing'
import AnimatedCounter from '../components/AnimatedCounter'
import QuoteCard from '../components/QuoteCard'
import DifficultyBadge from '../components/DifficultyBadge'
import ErrorState from '../components/ErrorState'
import { DashboardSkeleton } from '../components/Skeleton'
import useChartTheme from '../hooks/useChartTheme'
import useApi from '../hooks/useApi'
import { localDate } from '../lib/api'

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const difficultyRank = { Beginner: 1, Intermediate: 2, Advanced: 3 }

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

// Rough session length: ~45s of work per set plus the prescribed rest
function estimateMinutes(workout) {
  const secs = workout.exercises.reduce((s, e) => s + e.sets.length * (45 + e.restSeconds), 0)
  return Math.max(5, Math.round(secs / 60))
}

function ActivityTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="rounded-xl border border-line/10 bg-bg/95 px-3 py-2 text-sm shadow-xl backdrop-blur">
      <p className="font-semibold">
        {new Date(`${d.date}T00:00:00`).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
      </p>
      <p className="text-muted">{d.minutes ? `${d.minutes} active min` : 'Rest day'}</p>
    </div>
  )
}

function TodayCard({ workout }) {
  if (!workout) {
    return (
      <div className="relative flex h-full flex-col items-start">
        <p className="eyebrow">Today’s workout</p>
        <div className="my-auto py-8">
          <div className="relative mb-5 w-fit">
            <div className="absolute inset-0 rounded-full bg-neon/25 blur-2xl" />
            <div className="relative grid h-16 w-16 place-items-center rounded-2xl border border-line/10 bg-line/5">
              <Dumbbell className="h-7 w-7 text-accent" />
            </div>
          </div>
          <h2 className="text-3xl font-bold sm:text-4xl">No workout yet today.</h2>
          <p className="mt-2 max-w-md text-muted">Pick a few exercises from the Library and we’ll build today’s session for you.</p>
        </div>
        <Link to="/library" className="btn-primary group w-full py-4 text-lg sm:w-auto sm:px-10">
          <Library className="h-5 w-5" /> Open the Library
          <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
        </Link>
      </div>
    )
  }

  const done = workout.status === 'completed'
  const totalSets = workout.exercises.reduce((s, e) => s + e.sets.length, 0)
  const doneSets = workout.exercises.reduce((s, e) => s + e.sets.filter((x) => x.completed).length, 0)
  const hardest = workout.exercises.reduce(
    (h, e) => (difficultyRank[e.difficulty] > difficultyRank[h] ? e.difficulty : h),
    'Beginner'
  )

  return (
    <div className="relative">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="eyebrow">Today’s workout</p>
        {done ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-neon px-3 py-1 text-xs font-bold text-[#07090D]">
            <CircleCheck className="h-4 w-4" /> Completed
          </span>
        ) : (
          <DifficultyBadge level={hardest} />
        )}
      </div>
      <h2 className="mt-3 text-3xl font-bold sm:text-4xl">{workout.name}</h2>
      <p className="mt-1 text-muted">
        {done
          ? `Finished in ${workout.durationMinutes} min. Nice work!`
          : workout.status === 'in_progress'
            ? `In progress · ${doneSets} of ${totalSets} sets done`
            : 'Ready when you are'}
      </p>

      <div className="mt-5 flex flex-wrap gap-2 text-sm">
        {[
          [Clock, done ? `${workout.durationMinutes} min` : `~${estimateMinutes(workout)} min`],
          [Dumbbell, `${workout.exercises.length} exercise${workout.exercises.length === 1 ? '' : 's'}`],
          [Layers, `${totalSets} sets`],
        ].map(([Icon, t]) => (
          <span key={t} className="inline-flex items-center gap-1.5 rounded-full border border-line/10 bg-line/5 px-3 py-1.5">
            <Icon className="h-4 w-4 text-accent" /> {t}
          </span>
        ))}
      </div>

      <ul className="mt-6 grid gap-2 sm:grid-cols-2">
        {workout.exercises.map((e, i) => (
          <motion.li
            key={e.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.07 }}
            className="flex items-center gap-3 rounded-2xl border border-line/10 bg-line/[0.03] px-4 py-3"
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-neon/15 font-display text-sm font-bold text-accent">
              {i + 1}
            </span>
            <span className="flex-1 truncate font-medium">{e.name}</span>
            <span className="shrink-0 text-sm text-muted">
              {e.sets.length}×{e.reps}
            </span>
          </motion.li>
        ))}
      </ul>

      {done ? (
        <Link to="/library" className="btn-ghost mt-6 w-full py-4 sm:w-auto sm:px-8">
          <Library className="h-5 w-5" /> Plan another session
        </Link>
      ) : (
        <Link to="/workout" className="btn-primary group mt-6 w-full py-4 text-lg sm:w-auto sm:px-10">
          <Play className="h-5 w-5 fill-current" /> {workout.status === 'in_progress' ? 'Resume' : 'Start'}
          <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  )
}

export default function Dashboard() {
  const chart = useChartTheme()
  const today = useMemo(() => localDate(), [])
  const { data, error, loading, reload } = useApi(`/dashboard?date=${today}`)

  if (loading && !data) return <DashboardSkeleton />
  if (error) return <ErrorState error={error} onRetry={reload} />

  const { user, activity, streak, rings, nextClass } = data
  const firstName = user.fullName.split(' ')[0]
  const totalMinutes = activity.reduce((s, d) => s + d.minutes, 0)
  const activeDays = activity.filter((d) => d.minutes > 0).length
  const todayIdx = (new Date().getDay() + 6) % 7
  const left = rings.workouts.goal - rings.workouts.value

  const goals = [
    { key: 'workouts', label: 'Workouts', ...rings.workouts, color: 'neon' },
    { key: 'minutes', label: 'Active min', ...rings.minutes, color: 'aqua' },
    { key: 'goals', label: 'Goals hit', ...rings.goalsHit, color: 'ember' },
  ]

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <p className="text-sm text-muted">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
        <h1 className="mt-1 text-3xl font-bold sm:text-4xl">
          {greeting()}, <span className="text-gradient">{firstName}</span>
        </h1>
        <p className="mt-2 text-muted">
          {left <= 0
            ? 'You’ve hit this week’s workout goal. Absolute legend.'
            : `You’re ${left} workout${left === 1 ? '' : 's'} away from this week’s goal. Let’s go.`}
        </p>
      </motion.div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Today's workout */}
        <GlassCard className="relative overflow-hidden lg:col-span-2" delay={0.05}>
          <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-neon/20 blur-3xl" />
          <TodayCard workout={data.today} />
        </GlassCard>

        {/* Streak */}
        <GlassCard className="relative overflow-hidden" delay={0.1}>
          <div className="absolute -bottom-10 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-ember/25 blur-3xl" />
          <div className="relative flex h-full flex-col">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-600 dark:text-ember">Streak</p>
            <div className="flex flex-1 flex-col items-center justify-center py-6">
              <div className="relative">
                <div className="absolute inset-0 scale-150 rounded-full bg-ember/30 blur-2xl" />
                <Flame
                  className={`relative h-20 w-20 fill-ember/30 text-ember ${streak.current ? 'animate-flicker' : 'opacity-50'}`}
                  strokeWidth={1.5}
                />
              </div>
              <p className="mt-3 font-display text-6xl font-bold">
                <AnimatedCounter value={streak.current} />
              </p>
              <p className="text-muted">
                day streak · best {streak.best}
              </p>
              {streak.current === 0 && <p className="mt-1 text-center text-xs text-muted">Finish a workout today to light it up.</p>}
            </div>
            <div className="flex justify-between gap-1">
              {weekDays.map((d, i) => (
                <div key={d} className="flex flex-col items-center gap-1.5">
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4 + i * 0.05, type: 'spring' }}
                    className={`grid h-8 w-8 place-items-center rounded-full text-xs ${
                      streak.weekDone[i]
                        ? 'bg-gradient-to-br from-[#FFB03A] to-ember text-[#07090D]'
                        : i === todayIdx
                          ? 'border-2 border-dashed border-ember/60'
                          : 'border border-line/15'
                    }`}
                  >
                    {streak.weekDone[i] && <Zap className="h-3.5 w-3.5 fill-current" />}
                  </motion.span>
                  <span className={`text-[11px] ${i === todayIdx ? 'font-semibold text-fg' : 'text-muted'}`}>{d[0]}</span>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>

        {/* Rings */}
        <GlassCard className="lg:col-span-3" delay={0.15}>
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-lg font-semibold">This week</h3>
            <span className="text-sm text-muted">Resets Monday</span>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:gap-6">
            {goals.map((g, i) => (
              <div key={g.key} className="flex flex-col items-center text-center">
                <div className="hidden sm:block">
                  <ProgressRing value={g.value} max={g.goal} size={140} stroke={12} color={g.color} duration={1.4 + i * 0.2}>
                    <RingLabel g={g} />
                  </ProgressRing>
                </div>
                <div className="sm:hidden">
                  <ProgressRing value={g.value} max={g.goal} size={96} stroke={9} color={g.color} duration={1.4 + i * 0.2}>
                    <RingLabel g={g} small />
                  </ProgressRing>
                </div>
                <p className="mt-3 text-sm font-semibold sm:text-base">{g.label}</p>
                <p className="text-xs text-muted">{Math.min(100, Math.round((g.value / g.goal) * 100))}% of goal</p>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Weekly activity */}
        <GlassCard className="lg:col-span-2" delay={0.2}>
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold">Weekly activity</h3>
              <p className="text-sm text-muted">Active minutes, last 7 days</p>
            </div>
            <div className="flex gap-5 text-right">
              <div>
                <p className="font-display text-2xl font-bold">
                  <AnimatedCounter value={totalMinutes} />
                </p>
                <p className="text-xs text-muted">minutes</p>
              </div>
              <div>
                <p className="font-display text-2xl font-bold">
                  <AnimatedCounter value={activeDays} />
                </p>
                <p className="text-xs text-muted">active days</p>
              </div>
            </div>
          </div>
          <div className="relative h-56">
            {totalMinutes === 0 && (
              <p className="absolute inset-x-0 top-1/3 z-10 text-center text-sm text-muted">
                No active minutes yet. Your first workout will show up here.
              </p>
            )}
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activity} margin={{ top: 8, right: 0, left: -24, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#C8FF2E" />
                    <stop offset="100%" stopColor="#22E4F2" stopOpacity={0.7} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke={chart.grid} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: chart.axis, fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} allowDecimals={false} tick={{ fill: chart.axis, fontSize: 12 }} />
                <Tooltip content={<ActivityTooltip />} cursor={{ fill: chart.cursor, radius: 12 }} />
                <Bar dataKey="minutes" radius={[10, 10, 10, 10]} maxBarSize={38} animationDuration={1200}>
                  {activity.map((d, i) => (
                    <Cell key={d.date} fill={i === activity.length - 1 ? '#22E4F2' : 'url(#barGrad)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Next class */}
        <GlassCard hover delay={0.25} className="flex flex-col">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-600 dark:text-aqua">Next class</p>
          {nextClass ? (
            <>
              <h3 className="mt-3 text-2xl font-bold">{nextClass.title}</h3>
              <p className="text-muted">
                {nextClass.intensity} intensity · {nextClass.durationMinutes} min
              </p>
              <div className="mt-4 space-y-2 text-sm">
                <p className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-cyan-600 dark:text-aqua" />
                  {new Date(nextClass.startTime).toLocaleString('en-US', {
                    weekday: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
                <p className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-cyan-600 dark:text-aqua" /> with {nextClass.coach}
                </p>
              </div>
            </>
          ) : (
            <div className="mt-4 flex items-center gap-3 text-muted">
              <CalendarX className="h-6 w-6" />
              <p className="text-sm">No more classes this week. New ones drop on Monday.</p>
            </div>
          )}
          <div className="min-h-6 flex-1" />
          <Link to="/classes" className="btn-ghost w-full text-sm">
            Browse schedule <ArrowRight className="h-4 w-4" />
          </Link>
        </GlassCard>

        <QuoteCard className="lg:col-span-3" delay={0.3} />
      </div>
    </div>
  )
}

function RingLabel({ g, small }) {
  return (
    <div>
      <p className={`font-display font-bold leading-none ${small ? 'text-lg' : 'text-3xl'}`}>
        <AnimatedCounter value={g.value} />
      </p>
      <p className={`mt-1 text-muted ${small ? 'text-[10px]' : 'text-xs'}`}>/ {g.goal}</p>
    </div>
  )
}

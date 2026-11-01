import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Award,
  Bell,
  Crown,
  Dumbbell,
  Flame,
  HeartPulse,
  Lock,
  MapPin,
  Medal,
  Moon,
  Ruler,
  Sparkles,
  Sunrise,
  Trophy,
  Users,
  Weight,
  Zap,
} from 'lucide-react'
import GlassCard from '../components/GlassCard'
import AnimatedCounter from '../components/AnimatedCounter'
import { useTheme } from '../context/ThemeContext'
import { useToast } from '../context/ToastContext'
import { achievements, user } from '../data/mockData'
import { useAuth } from '../context/AuthContext'
import { initials } from '../lib/api'

const badgeIcons = { Dumbbell, Flame, Sunrise, Trophy, Users, Medal, Zap, Weight, HeartPulse }

function Switch({ on, onChange, label }) {
  return (
    // 44px tall hit area around the 28px visual track
    <button role="switch" aria-checked={on} aria-label={label} onClick={onChange} className="grid h-11 w-14 shrink-0 place-items-center">
      <span className={`relative h-7 w-12 rounded-full transition-colors ${on ? 'bg-neon' : 'bg-line/15'}`}>
        <motion.span
          layout
          transition={{ type: 'spring', stiffness: 600, damping: 32 }}
          className={`absolute top-1 h-5 w-5 rounded-full shadow ${on ? 'right-1 bg-[#07090D]' : 'left-1 bg-white'}`}
        />
      </span>
    </button>
  )
}

export default function Profile() {
  const { theme, toggle } = useTheme()
  const { user: me } = useAuth()
  const memberSince = new Date(me.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const toast = useToast()
  const [reminders, setReminders] = useState(true)
  const [metric, setMetric] = useState(true)
  const unlocked = achievements.filter((a) => a.unlocked).length
  const xpPct = (user.xp / user.xpNext) * 100

  return (
    <div className="space-y-4">
      {/* Header card */}
      <GlassCard className="relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-r from-neon/25 via-aqua/20 to-orchid/20" />
        <div className="relative flex flex-col items-center gap-5 pt-10 text-center sm:flex-row sm:items-end sm:text-left">
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 16 }}
            className="relative"
          >
            <div className="absolute -inset-1.5 animate-[spin_8s_linear_infinite] rounded-full bg-[conic-gradient(from_0deg,#C8FF2E,#22E4F2,#B48CFF,#C8FF2E)] opacity-80 blur-[2px]" />
            <div className="relative grid h-28 w-28 place-items-center rounded-full border-4 border-bg bg-gradient-to-br from-[#1b2210] to-[#0b1a1d] font-display text-4xl font-bold text-neon">
              {initials(me.fullName)}
            </div>
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full border-2 border-bg bg-neon px-2 py-0.5 text-xs font-bold text-[#07090D]">
              Lv {user.level}
            </span>
          </motion.div>

          <div className="flex-1">
            <h1 className="text-3xl font-bold">{me.fullName}</h1>
            <p className="text-muted">
              {me.email} · Member since {memberSince}
            </p>
            <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#FFE27A] to-[#E8A800] px-3 py-1 text-sm font-bold text-[#07090D]">
                <Crown className="h-4 w-4" /> {user.membership} Member
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-line/10 px-3 py-1 text-sm text-muted">
                <MapPin className="h-4 w-4" /> Goal: {me.weeklyGoalWorkouts} workouts · {me.weeklyGoalMinutes} min / week
              </span>
            </div>
          </div>
        </div>

        <div className="relative mt-6">
          <div className="mb-2 flex justify-between text-sm">
            <span className="font-medium">Level {user.level} → {user.level + 1}</span>
            <span className="text-muted tabular-nums">
              {user.xp.toLocaleString()} / {user.xpNext.toLocaleString()} XP
            </span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-line/10">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${xpPct}%` }}
              transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
              className="h-full rounded-full bg-gradient-brand shadow-glow"
            />
          </div>
        </div>

        <div className="relative mt-6 grid grid-cols-3 gap-2 sm:gap-4">
          {[
            ['Workouts', user.totals.workouts],
            ['Hours', user.totals.hours],
            ['PRs', user.totals.prs],
          ].map(([l, v]) => (
            <div key={l} className="rounded-2xl border border-line/10 bg-line/[0.03] py-4 text-center">
              <p className="font-display text-2xl font-bold sm:text-3xl">
                <AnimatedCounter value={v} />
              </p>
              <p className="text-xs text-muted sm:text-sm">{l}</p>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Achievements */}
      <GlassCard delay={0.1}>
        <div className="mb-5 flex items-end justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-semibold">
              <Sparkles className="h-5 w-5 text-accent" /> Achievements
            </h2>
            <p className="text-sm text-muted">
              {unlocked} of {achievements.length} unlocked
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {achievements.map((a, i) => {
            const Icon = badgeIcons[a.icon] ?? Award
            return (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, scale: 0.85 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, type: 'spring', stiffness: 220, damping: 18 }}
                whileHover={a.unlocked ? { y: -4, rotate: -1 } : undefined}
                className={`relative overflow-hidden rounded-2xl border p-4 text-center ${
                  a.unlocked ? 'border-line/10 bg-line/[0.03]' : 'border-dashed border-line/15'
                }`}
              >
                {a.unlocked && (
                  <div className="absolute left-1/2 top-2 h-16 w-16 -translate-x-1/2 rounded-full opacity-40 blur-2xl" style={{ background: a.color }} />
                )}
                <div
                  className={`relative mx-auto grid h-14 w-14 place-items-center rounded-2xl ${a.unlocked ? '' : 'bg-line/5 grayscale'}`}
                  style={a.unlocked ? { background: `linear-gradient(135deg, ${a.color}, ${a.color}99)`, boxShadow: `0 0 24px -6px ${a.color}` } : undefined}
                >
                  {a.unlocked ? <Icon className="h-7 w-7 text-[#07090D]" /> : <Lock className="h-6 w-6 text-muted" />}
                </div>
                <p className={`relative mt-3 font-semibold ${a.unlocked ? '' : 'text-muted'}`}>{a.name}</p>
                <p className="relative mt-0.5 text-xs text-muted">{a.desc}</p>
                {!a.unlocked && (
                  <div className="mt-3">
                    <div className="h-1.5 overflow-hidden rounded-full bg-line/10">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${(a.progress / a.goal) * 100}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.3 }}
                        className="h-full rounded-full"
                        style={{ background: a.color }}
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-muted tabular-nums">
                      {a.progress} / {a.goal.toLocaleString()}
                    </p>
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      </GlassCard>

      {/* Settings */}
      <GlassCard delay={0.15}>
        <h2 className="mb-2 text-xl font-semibold">Preferences</h2>
        <div className="divide-y divide-line/10">
          {[
            {
              icon: Moon,
              title: 'Dark mode',
              text: 'Easy on the eyes at 6 AM.',
              on: theme === 'dark',
              change: toggle,
            },
            {
              icon: Bell,
              title: 'Workout reminders',
              text: 'A nudge when it’s time to train.',
              on: reminders,
              change: () => {
                setReminders(!reminders)
                toast({ type: 'info', title: reminders ? 'Reminders off' : 'Reminders on', message: reminders ? 'We’ll stay quiet.' : 'We’ll ping you at 6:30 PM.' })
              },
            },
            {
              icon: Ruler,
              title: 'Metric units',
              text: metric ? 'Showing kilograms and kilometres.' : 'Showing pounds and miles.',
              on: metric,
              change: () => setMetric(!metric),
            },
          ].map((row) => (
            <div key={row.title} className="flex items-center gap-4 py-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-line/10 bg-line/5">
                <row.icon className="h-5 w-5 text-accent" />
              </span>
              <div className="flex-1">
                <p className="font-medium">{row.title}</p>
                <p className="text-sm text-muted">{row.text}</p>
              </div>
              <Switch on={row.on} onChange={row.change} label={row.title} />
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  )
}

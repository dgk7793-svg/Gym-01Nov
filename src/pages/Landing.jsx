import { Fragment } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Calendar,
  Dumbbell,
  Flame,
  HeartPulse,
  LayoutDashboard,
  LogOut,
  Play,
  Timer,
  TrendingUp,
  Trophy,
  User,
} from 'lucide-react'
import Logo from '../components/Logo'
import ThemeToggle from '../components/ThemeToggle'
import AnimatedCounter from '../components/AnimatedCounter'
import ProgressRing from '../components/ProgressRing'
import QuoteCard from '../components/QuoteCard'
import { Skeleton } from '../components/Skeleton'
import useApi from '../hooks/useApi'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

const statLabels = [
  { key: 'members', label: 'Members' },
  { key: 'workoutsCompleted', label: 'Workouts completed' },
  { key: 'classesThisWeek', label: 'Classes this week' },
]

const features = [
  { to: '/dashboard', icon: LayoutDashboard, title: 'Smart dashboard', text: 'Today’s plan, streaks and weekly rings at a glance.', tint: 'neon' },
  { to: '/library', icon: Dumbbell, title: 'Workout library', text: '20+ exercises filtered by muscle group and difficulty.', tint: 'aqua' },
  { to: '/workout', icon: Timer, title: 'Live workout mode', text: 'Tick off sets, auto-start rest timers, celebrate the finish.', tint: 'ember' },
  { to: '/progress', icon: TrendingUp, title: 'Progress tracking', text: 'Strength curves and trophy-worthy personal records.', tint: 'neon' },
  { to: '/classes', icon: Calendar, title: 'Class booking', text: 'Yoga, HIIT, Spin and Boxing. Book in one tap.', tint: 'aqua' },
  { to: '/profile', icon: User, title: 'Achievements', text: 'Level up, unlock badges and keep your streak alive.', tint: 'ember' },
]

const tintCls = {
  neon: 'text-accent bg-neon/10 border-neon/25',
  aqua: 'text-cyan-600 dark:text-aqua bg-aqua/10 border-aqua/25',
  ember: 'text-orange-600 dark:text-ember bg-ember/10 border-ember/25',
}

const marqueeWords = ['Strength', 'HIIT', 'Yoga', 'Spin', 'Boxing', 'Mobility', 'Cardio', 'Recovery']

function HeroVisual() {
  const float = (d) => ({
    animate: { y: [0, -10, 0] },
    transition: { duration: 5, repeat: Infinity, ease: 'easeInOut', delay: d },
  })

  return (
    <div className="relative mx-auto h-[420px] w-full max-w-[460px] sm:h-[480px]">
      <div className="absolute inset-10 rounded-full bg-neon/20 blur-[90px]" />
      <div className="absolute bottom-0 right-0 h-48 w-48 rounded-full bg-aqua/25 blur-[80px]" />

      {/* Main session card */}
      <div className="absolute inset-0 grid place-items-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, rotate: -4 }}
        animate={{ opacity: 1, scale: 1, rotate: -3 }}
        transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="w-[290px] sm:w-[320px]"
      >
        <motion.div {...float(0)} className="glass rounded-[28px] p-6 !bg-bg/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="eyebrow">Today</p>
              <p className="mt-1 font-display text-xl font-bold">Upper Body Power</p>
            </div>
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-brand text-[#07090D]">
              <Dumbbell className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-6 flex items-center gap-5">
            <ProgressRing value={72} max={100} size={112} stroke={11} color="brand" duration={2}>
              <div>
                <p className="font-display text-2xl font-bold">72%</p>
                <p className="text-[10px] uppercase tracking-wider text-muted">done</p>
              </div>
            </ProgressRing>
            <div className="flex-1 space-y-3 text-sm">
              {[
                ['Sets', '13 / 18'],
                ['Volume', '6.2 t'],
                ['Time', '32:10'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between border-b border-line/10 pb-2 last:border-0">
                  <span className="text-muted">{k}</span>
                  <span className="font-semibold tabular-nums">{v}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-6 flex h-14 items-end gap-1.5">
            {[40, 65, 30, 80, 55, 90, 70, 100, 60, 85].map((h, i) => (
              <motion.span
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                transition={{ delay: 0.8 + i * 0.06, duration: 0.6, ease: 'easeOut' }}
                className="flex-1 rounded-md bg-gradient-to-t from-neon/30 to-neon"
              />
            ))}
          </div>
        </motion.div>
      </motion.div>
      </div>

      {/* Heart rate */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="absolute right-0 top-2 sm:-right-4"
      >
        <motion.div {...float(1)} className="glass flex items-center gap-3 rounded-2xl !bg-bg/70 px-4 py-3">
          <HeartPulse className="h-6 w-6 text-[#FF4F8B]" />
          <div>
            <p className="font-display text-lg font-bold leading-none">
              142 <span className="text-xs font-medium text-muted">bpm</span>
            </p>
            <svg viewBox="0 0 100 24" className="mt-1 h-5 w-24">
              <motion.polyline
                points="0,12 18,12 24,4 30,20 36,8 40,12 60,12 66,2 72,22 78,12 100,12"
                fill="none"
                stroke="#FF4F8B"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: [0, 1, 1], opacity: [1, 1, 0] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              />
            </svg>
          </div>
        </motion.div>
      </motion.div>

      {/* Streak */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.75, duration: 0.6 }}
        className="absolute bottom-16 left-0 sm:-left-6"
      >
        <motion.div {...float(2)} className="glass flex items-center gap-3 rounded-2xl !bg-bg/70 px-4 py-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-ember/15">
            <Flame className="h-6 w-6 animate-flicker text-ember" />
          </span>
          <div>
            <p className="font-display text-lg font-bold leading-none">12-day</p>
            <p className="text-xs text-muted">streak</p>
          </div>
        </motion.div>
      </motion.div>

      {/* PR toast */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.6 }}
        className="absolute bottom-0 right-2"
      >
        <motion.div {...float(0.5)} className="glass flex items-center gap-3 rounded-2xl !bg-bg/70 px-4 py-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#FFD23F]/15">
            <Trophy className="h-5 w-5 text-[#E8B400] dark:text-[#FFD23F]" />
          </span>
          <div>
            <p className="text-sm font-semibold">New PR · Deadlift</p>
            <p className="text-xs text-muted">170 kg · +5 kg</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

const headline = [
  { text: 'Train', grad: false },
  { text: 'smarter.', grad: false },
  { text: 'Get', grad: true },
  { text: 'stronger.', grad: true },
]

export default function Landing() {
  const { user, logout } = useAuth()
  const { data: stats, error: statsError } = useApi('/stats')
  const toast = useToast()
  const navigate = useNavigate()
  const startTo = user ? '/dashboard' : '/signup'

  const onLogout = async () => {
    await logout().catch(() => {})
    toast({ type: 'info', title: 'Logged out', message: 'See you at your next session!' })
    navigate('/')
  }

  return (
    <div className="relative overflow-x-hidden">
      <div className="grid-bg pointer-events-none absolute inset-x-0 top-0 h-[900px]" />

      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-line/5 bg-bg/60 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <Logo />
          <nav className="hidden items-center gap-8 text-sm font-medium text-muted md:flex">
            <a href="#features" className="transition hover:text-fg">Features</a>
            <Link to="/classes" className="transition hover:text-fg">Classes</Link>
            <Link to="/progress" className="transition hover:text-fg">Progress</Link>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {user ? (
              <>
                <Link to="/dashboard" className="btn-ghost !px-3 !py-2.5 text-sm sm:!px-4">
                  <span className="hidden sm:inline">Hi, </span>
                  <span className="max-w-[7rem] truncate font-semibold">{user.fullName.split(' ')[0]}</span>
                </Link>
                <button
                  onClick={onLogout}
                  aria-label="Log out"
                  title="Log out"
                  className="glass grid h-10 w-10 place-items-center rounded-xl text-muted transition hover:border-ember/40 hover:text-ember"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hidden px-3 py-2.5 text-sm font-semibold text-muted transition hover:text-fg sm:inline-flex">
                  Log in
                </Link>
                <Link to="/signup" className="btn-ghost !px-4 !py-2.5 text-sm">
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pb-16 pt-12 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:pt-20">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neon opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-neon" />
            </span>
            <span className="text-muted">
              {stats ? (
                <>
                  <span className="font-semibold text-fg">{stats.workoutsCompleted.toLocaleString()}</span> workouts crushed by our
                  members
                </>
              ) : (
                'Your training, finally organised'
              )}
            </span>
          </motion.div>

          <h1 className="mt-6 text-[3.25rem] font-bold leading-[0.95] tracking-tighter sm:text-7xl lg:text-[5.5rem]">
            {headline.map((w, i) => (
              <Fragment key={w.text}>
                <motion.span
                  initial={{ opacity: 0, y: 40, filter: 'blur(8px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ delay: 0.1 + i * 0.12, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  className={`inline-block ${w.grad ? 'text-gradient pr-[0.06em]' : ''}`}
                >
                  {w.text}
                </motion.span>
                {i === 1 ? <br /> : ' '}
              </Fragment>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-6 max-w-lg text-lg text-muted"
          >
            PulseFit plans your workouts, times your rest, tracks every PR and books your favourite classes, so all you
            have to do is show up.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75 }}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <Link to={startTo} className="btn-primary group px-7 py-4 text-lg">
              <Play className="h-5 w-5 fill-current" />
              Start Your Workout
              <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
            </Link>
            <Link to={user ? '/library' : '/login'} className="btn-ghost px-7 py-4 text-lg">
              {user ? 'Browse exercises' : 'I have an account'}
            </Link>
          </motion.div>

          <div className="mt-12 grid grid-cols-3 gap-3 sm:gap-6">
            {statLabels.map((s, i) => (
              <motion.div
                key={s.key}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 + i * 0.1 }}
                className="border-l-2 border-neon/50 pl-3 sm:pl-4"
              >
                {stats ? (
                  <AnimatedCounter
                    value={stats[s.key]}
                    duration={2.2}
                    className="block font-display text-2xl font-bold sm:text-4xl"
                  />
                ) : statsError ? (
                  <span className="block font-display text-2xl font-bold text-muted sm:text-4xl" title={statsError.message}>
                    –
                  </span>
                ) : (
                  <Skeleton className="h-8 w-16 sm:h-10 sm:w-24" />
                )}
                <span className="mt-1 block text-xs text-muted sm:text-sm">{s.label}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <HeroVisual />
      </section>

      {/* Marquee */}
      <div className="relative border-y border-line/10 bg-line/[0.02] py-5">
        <div className="flex w-max animate-marquee gap-10">
          {[...marqueeWords, ...marqueeWords].map((w, i) => (
            <span key={i} className="flex items-center gap-10 font-display text-3xl font-bold uppercase tracking-tight text-fg/80 sm:text-4xl">
              {w}
              <span className="h-2.5 w-2.5 rounded-full bg-gradient-brand" />
            </span>
          ))}
        </div>
      </div>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-20 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl"
        >
          <p className="eyebrow">Everything in one app</p>
          <h2 className="mt-3 text-4xl font-bold sm:text-5xl">
            Your gym, your coach, your <span className="text-gradient">hype crew.</span>
          </h2>
        </motion.div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ delay: (i % 3) * 0.08, duration: 0.5 }}
              whileHover={{ y: -6 }}
            >
              <Link to={f.to} className="glass group block h-full rounded-3xl p-6 transition-shadow hover:shadow-glow">
                <span className={`grid h-12 w-12 place-items-center rounded-2xl border ${tintCls[f.tint]}`}>
                  <f.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 text-xl font-semibold">{f.title}</h3>
                <p className="mt-2 text-muted">{f.text}</p>
                <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-accent">
                  Explore <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Quote + CTA */}
      <section className="mx-auto grid max-w-7xl gap-4 px-4 pb-20 sm:px-6 lg:grid-cols-2">
        <QuoteCard />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl bg-gradient-brand p-8 text-[#07090D]"
        >
          <div className="absolute -bottom-16 -right-10 h-56 w-56 rounded-full bg-white/30 blur-3xl" />
          <h3 className="relative text-3xl font-bold leading-tight sm:text-4xl">Your next PR is one session away.</h3>
          <p className="relative mt-3 max-w-md font-medium opacity-80">
            Jump into today’s plan. We’ll handle the timers, you handle the weights.
          </p>
          <Link
            to={startTo}
            className="relative mt-6 inline-flex items-center gap-2 rounded-2xl bg-[#07090D] px-6 py-3.5 font-semibold text-neon transition hover:-translate-y-0.5"
          >
            <Play className="h-4 w-4 fill-current" /> Start Your Workout
          </Link>
        </motion.div>
      </section>

      <footer className="border-t border-line/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-muted sm:flex-row sm:px-6">
          <Logo />
          <p>© {new Date().getFullYear()} PulseFit. Train smarter. Get stronger.</p>
        </div>
      </footer>
    </div>
  )
}

import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Clock, Dumbbell, Eye, EyeOff, Loader2, Lock, Mail, User } from 'lucide-react'
import Logo from '../components/Logo'
import ThemeToggle from '../components/ThemeToggle'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

function AuthShell({ eyebrow, title, subtitle, children, footer }) {
  return (
    <div className="relative min-h-dvh overflow-hidden">
      <div className="grid-bg pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-96 w-96 -translate-x-1/2 rounded-full bg-neon/15 blur-[110px]" />
      <header className="relative mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <Logo />
        <ThemeToggle />
      </header>
      <main className="relative mx-auto flex max-w-md flex-col px-4 pb-16 pt-6 sm:pt-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="glass rounded-[28px] p-6 sm:p-8"
        >
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{title}</h1>
          <p className="mt-2 text-muted">{subtitle}</p>
          <div className="mt-7">{children}</div>
        </motion.div>
        <p className="mt-6 text-center text-sm text-muted">{footer}</p>
      </main>
    </div>
  )
}

function Field({ icon: Icon, label, hint, right, ...input }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      <span className="flex items-center gap-3 rounded-2xl border border-line/10 bg-line/[0.04] px-4 py-3 transition focus-within:border-accent/60 focus-within:shadow-glow">
        <Icon className="h-5 w-5 shrink-0 text-muted" />
        <input className="w-full min-w-0 bg-transparent outline-none placeholder:text-muted/70" {...input} />
        {right}
      </span>
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  )
}

function FormError({ message }) {
  if (!message) return null
  return (
    <motion.p
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      role="alert"
      className="rounded-xl border border-ember/30 bg-ember/10 px-4 py-3 text-sm text-orange-700 dark:text-[#FFB38A]"
    >
      {message}
    </motion.p>
  )
}

function PasswordToggle({ show, onToggle }) {
  return (
    <button type="button" onClick={onToggle} className="text-muted hover:text-fg" aria-label={show ? 'Hide password' : 'Show password'}>
      {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  )
}

export function Login() {
  const { user, login } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const dest = location.state?.from ?? '/dashboard'

  if (user && !busy) return <Navigate to={dest} replace />

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const u = await login(form.email, form.password)
      toast({ type: 'success', title: `Welcome back, ${u.fullName.split(' ')[0]}!`, message: 'Let’s make today count.' })
      navigate(dest, { replace: true })
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Log in to PulseFit"
      subtitle="Pick up right where you left off."
      footer={
        <>
          New here?{' '}
          <Link to="/signup" className="font-semibold text-accent hover:underline">
            Create a free account
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field
          icon={Mail}
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <Field
          icon={Lock}
          label="Password"
          type={show ? 'text' : 'password'}
          autoComplete="current-password"
          placeholder="••••••••"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          right={<PasswordToggle show={show} onToggle={() => setShow(!show)} />}
          required
        />
        <FormError message={error} />
        <button type="submit" disabled={busy} className="btn-primary w-full py-3.5 text-base">
          {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowRight className="h-5 w-5" />}
          {busy ? 'Logging in…' : 'Log in'}
        </button>
      </form>
    </AuthShell>
  )
}

export function Signup() {
  const { user, signup } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [form, setForm] = useState({ fullName: '', email: '', password: '', weeklyGoalWorkouts: 4, weeklyGoalMinutes: 150 })
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  if (user && !busy) return <Navigate to="/dashboard" replace />

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const u = await signup({
        ...form,
        weeklyGoalWorkouts: Number(form.weeklyGoalWorkouts),
        weeklyGoalMinutes: Number(form.weeklyGoalMinutes),
      })
      toast({ type: 'success', title: `You’re in, ${u.fullName.split(' ')[0]}! 🎉`, message: 'Add a few exercises to build today’s workout.' })
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <AuthShell
      eyebrow="Join PulseFit"
      title="Create your account"
      subtitle="Set your weekly goals and we’ll keep you on track."
      footer={
        <>
          Already a member?{' '}
          <Link to="/login" className="font-semibold text-accent hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field icon={User} label="Full name" autoComplete="name" placeholder="Alex Rivera" value={form.fullName} onChange={set('fullName')} required />
        <Field icon={Mail} label="Email" type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
        <Field
          icon={Lock}
          label="Password"
          type={show ? 'text' : 'password'}
          autoComplete="new-password"
          placeholder="At least 8 characters"
          value={form.password}
          onChange={set('password')}
          right={<PasswordToggle show={show} onToggle={() => setShow(!show)} />}
          required
        />

        <div className="rounded-2xl border border-neon/20 bg-neon/[0.06] p-4">
          <p className="mb-3 text-sm font-semibold text-accent">Your weekly goals</p>
          <div className="grid grid-cols-2 gap-3">
            <Field icon={Dumbbell} label="Workouts" type="number" min={1} max={14} inputMode="numeric" value={form.weeklyGoalWorkouts} onChange={set('weeklyGoalWorkouts')} hint="per week" />
            <Field icon={Clock} label="Active minutes" type="number" min={10} max={3000} step={10} inputMode="numeric" value={form.weeklyGoalMinutes} onChange={set('weeklyGoalMinutes')} hint="per week" />
          </div>
        </div>

        <FormError message={error} />
        <button type="submit" disabled={busy} className="btn-primary w-full py-3.5 text-base">
          {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowRight className="h-5 w-5" />}
          {busy ? 'Creating your account…' : 'Create account'}
        </button>
      </form>
    </AuthShell>
  )
}

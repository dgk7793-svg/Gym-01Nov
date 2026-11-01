import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { Check, Clock, Dumbbell, Flag, Layers, Library, Loader2, Pause, Play, SkipForward, Trophy } from 'lucide-react'
import GlassCard from '../components/GlassCard'
import ProgressRing from '../components/ProgressRing'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import { WorkoutSkeleton } from '../components/Skeleton'
import { useToast } from '../context/ToastContext'
import useApi from '../hooks/useApi'
import { api, localDate, notifyActivity } from '../lib/api'

const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

function celebrate() {
  const colors = ['#C8FF2E', '#22E4F2', '#FFFFFF', '#FF7A2F']
  confetti({ particleCount: 140, spread: 90, startVelocity: 45, origin: { y: 0.6 }, colors, zIndex: 200 })
  const end = Date.now() + 1600
  ;(function frame() {
    confetti({ particleCount: 4, angle: 60, spread: 60, origin: { x: 0, y: 0.7 }, colors, zIndex: 200 })
    confetti({ particleCount: 4, angle: 120, spread: 60, origin: { x: 1, y: 0.7 }, colors, zIndex: 200 })
    if (Date.now() < end) requestAnimationFrame(frame)
  })()
}

const setsOf = (w) => w.exercises.flatMap((e) => e.sets)

export default function LiveWorkout() {
  const toast = useToast()
  const today = useMemo(() => localDate(), [])
  const { data, error, loading, reload } = useApi(`/workouts?date=${today}`)
  const [workout, setWorkout] = useState(null)
  const [rest, setRest] = useState(null) // { total, remaining, paused }
  const [now, setNow] = useState(Date.now())
  const [showModal, setShowModal] = useState(false)
  const [finishing, setFinishing] = useState(false)
  const inflight = useRef(new Set())
  const startedRef = useRef(false)

  useEffect(() => {
    if (data) setWorkout(data.workout)
  }, [data])

  // Opening Live Workout Mode starts a planned workout (sets started_at once)
  useEffect(() => {
    if (!workout || workout.status !== 'planned' || startedRef.current) return
    startedRef.current = true
    api('/workouts', { method: 'PATCH', body: { id: workout.id, action: 'start' } })
      .then((r) => setWorkout(r.workout))
      .catch((err) => toast({ type: 'error', title: 'Couldn’t start the timer', message: err.message }))
  }, [workout, toast])

  const running = workout?.status === 'in_progress'
  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [running])

  useEffect(() => {
    if (!rest || rest.paused) return
    if (rest.remaining <= 0) {
      setRest(null)
      navigator.vibrate?.(200)
      toast({ type: 'info', title: 'Rest over. Let’s go!', message: 'Time for your next set.' })
      return
    }
    const id = setTimeout(() => setRest((r) => r && { ...r, remaining: r.remaining - 1 }), 1000)
    return () => clearTimeout(id)
  }, [rest, toast])

  const finish = useCallback(
    async (w) => {
      if (finishing) return
      setFinishing(true)
      setRest(null)
      // Let any set ticks still saving land before the workout is locked
      await Promise.allSettled([...inflight.current])
      try {
        const r = await api('/workouts', { method: 'PATCH', body: { id: w.id, action: 'complete' } })
        setWorkout(r.workout)
        setShowModal(true)
        celebrate()
        notifyActivity()
      } catch (err) {
        toast({ type: 'error', title: 'Couldn’t save your workout', message: `${err.message} Your sets are safe. Tap Finish to retry.` })
      } finally {
        setFinishing(false)
      }
    },
    [finishing, toast]
  )

  const patchSet = (setId, completed) =>
    setWorkout((w) => ({
      ...w,
      exercises: w.exercises.map((e) => ({
        ...e,
        sets: e.sets.map((s) => (s.id === setId ? { ...s, completed } : s)),
      })),
    }))

  const toggleSet = (exercise, set) => {
    if (workout.status === 'completed' || finishing) return
    const completed = !set.completed
    patchSet(set.id, completed) // optimistic

    const req = api('/sets', { method: 'PATCH', body: { id: set.id, completed } })
      .catch((err) => {
        patchSet(set.id, !completed)
        toast({ type: 'error', title: 'That set didn’t save', message: err.message })
        throw err
      })
      .finally(() => inflight.current.delete(req))
    inflight.current.add(req)
    req.catch(() => {}) // failure already handled above

    if (!completed) return
    const allDone = setsOf(workout).every((s) => s.id === set.id || s.completed)
    if (allDone) {
      req.then(() => finish(workout)).catch(() => {})
    } else if (exercise.restSeconds > 0) {
      setRest({ total: exercise.restSeconds, remaining: exercise.restSeconds, paused: false })
    }
  }

  const adjustRest = (delta) =>
    setRest((r) => r && { ...r, remaining: Math.max(0, r.remaining + delta), total: Math.max(r.total, r.remaining + delta) })

  if (loading && !workout) return <WorkoutSkeleton />
  if (error) return <ErrorState error={error} onRetry={reload} />

  if (!workout || workout.exercises.length === 0) {
    return (
      <EmptyState
        icon={Dumbbell}
        title="No workout yet today"
        message="Pick a few exercises from the Library to build today’s session, then come back here to train."
        action={
          <Link to="/library" className="btn-primary">
            <Library className="h-4 w-4" /> Pick from the Library
          </Link>
        }
      />
    )
  }

  const allSets = setsOf(workout)
  const totalSets = allSets.length
  const doneCount = allSets.filter((s) => s.completed).length
  const completed = workout.status === 'completed'

  if (completed && !showModal) {
    return (
      <EmptyState
        icon={Trophy}
        title="Today’s workout is done!"
        message={`${workout.name} · ${workout.durationMinutes} min · ${doneCount} sets. Recover well, or add more exercises for a bonus session.`}
        action={
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link to="/dashboard" className="btn-primary">
              View dashboard
            </Link>
            <Link to="/library" className="btn-ghost">
              Plan another session
            </Link>
          </div>
        }
      />
    )
  }

  const elapsed = workout.startedAt ? Math.max(0, Math.floor(((completed ? Date.parse(workout.completedAt) : now) - Date.parse(workout.startedAt)) / 1000)) : 0

  // Next set to perform: first unchecked set in plan order
  let next = null
  for (const ex of workout.exercises) {
    const s = ex.sets.find((x) => !x.completed)
    if (s) {
      next = { ex, set: s }
      break
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-2 flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neon opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-neon" />
            </span>
            Live workout
          </p>
          <h1 className="text-3xl font-bold sm:text-4xl">{workout.name}</h1>
        </div>
        <div className="flex gap-2">
          <div className="glass flex items-center gap-2 rounded-2xl px-4 py-2.5">
            <Clock className="h-4 w-4 text-accent" />
            <span className="font-display text-lg font-bold tabular-nums">{fmt(elapsed)}</span>
          </div>
          {doneCount > 0 && !completed && (
            <button
              onClick={() => finish(workout)}
              disabled={finishing}
              className="glass flex h-12 items-center gap-2 rounded-2xl px-4 text-sm font-semibold text-muted transition hover:border-accent/40 hover:text-fg disabled:opacity-60"
            >
              {finishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Flag className="h-4 w-4" />} Finish
            </button>
          )}
        </div>
      </div>

      {/* Overall progress */}
      <div className="mb-6">
        <div className="mb-2 flex justify-between text-sm">
          <span className="text-muted">
            {doneCount} of {totalSets} sets
          </span>
          <span className="font-semibold text-accent">{Math.round((doneCount / totalSets) * 100)}%</span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-line/10">
          <motion.div
            className="h-full rounded-full bg-gradient-brand shadow-glow"
            animate={{ width: `${(doneCount / totalSets) * 100}%` }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
          />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        {/* Timer */}
        <GlassCard className="relative overflow-hidden lg:sticky lg:top-10 lg:self-start">
          <div
            className={`absolute left-1/2 top-24 h-64 w-64 -translate-x-1/2 rounded-full blur-[80px] transition-colors duration-700 ${
              rest ? 'bg-aqua/25' : 'bg-neon/20'
            }`}
          />
          <div className="relative flex flex-col items-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              {rest ? (rest.paused ? 'Rest paused' : 'Rest timer') : next ? 'Up next' : 'All done'}
            </p>

            <div className="my-6">
              <ProgressRing
                value={rest ? rest.remaining : doneCount}
                max={rest ? rest.total : totalSets}
                size={260}
                stroke={16}
                color={rest ? 'aqua' : 'brand'}
                transition={{ duration: rest ? 1 : 0.6, ease: rest ? 'linear' : 'easeOut' }}
              >
                <AnimatePresence mode="wait">
                  {rest ? (
                    <motion.div key="rest" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                      <p className="font-display text-6xl font-bold tabular-nums">{fmt(rest.remaining)}</p>
                      <p className="mt-1 text-sm text-muted">breathe · hydrate</p>
                    </motion.div>
                  ) : (
                    <motion.div key="go" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="px-8">
                      <p className="font-display text-5xl font-bold text-gradient">{next ? 'GO' : 'DONE'}</p>
                      {next && <p className="mt-2 text-sm text-muted">{next.ex.reps} reps</p>}
                    </motion.div>
                  )}
                </AnimatePresence>
              </ProgressRing>
            </div>

            {next && (
              <div className="mb-5 text-center">
                <p className="text-xl font-semibold">{next.ex.name}</p>
                <p className="text-sm text-muted">
                  Set {next.set.setNumber} of {next.ex.sets.length} · {next.ex.restSeconds}s rest after
                </p>
              </div>
            )}

            {rest ? (
              <div className="flex items-center gap-3">
                <button onClick={() => adjustRest(-15)} className="btn-ghost h-12 w-16 !px-0 text-sm">
                  −15s
                </button>
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setRest((r) => r && { ...r, paused: !r.paused })}
                  className="grid h-16 w-16 place-items-center rounded-full bg-gradient-brand text-[#07090D] shadow-glow"
                  aria-label={rest.paused ? 'Resume rest timer' : 'Pause rest timer'}
                >
                  {rest.paused ? <Play className="h-7 w-7 fill-current" /> : <Pause className="h-7 w-7 fill-current" />}
                </motion.button>
                <button onClick={() => adjustRest(15)} className="btn-ghost h-12 w-16 !px-0 text-sm">
                  +15s
                </button>
                <button onClick={() => setRest(null)} className="btn-ghost h-12 w-12 !px-0" aria-label="Skip rest">
                  <SkipForward className="h-5 w-5" />
                </button>
              </div>
            ) : (
              next && (
                <button onClick={() => toggleSet(next.ex, next.set)} disabled={finishing} className="btn-primary w-full py-4 text-lg">
                  <Check className="h-5 w-5" /> Complete set
                </button>
              )
            )}
          </div>
        </GlassCard>

        {/* Exercise list */}
        <div className="space-y-3">
          {workout.exercises.map((ex, ei) => {
            const exDone = ex.sets.every((s) => s.completed)
            const isCurrent = next?.ex.id === ex.id
            return (
              <GlassCard
                key={ex.id}
                delay={0.05 * ei}
                className={`!p-4 transition-colors sm:!p-5 ${isCurrent ? '!border-neon/40 shadow-glow' : ''} ${exDone ? 'opacity-70' : ''}`}
              >
                <div className="mb-3 flex items-center gap-3">
                  <span
                    className={`grid h-10 w-10 place-items-center rounded-xl ${
                      exDone ? 'bg-neon text-[#07090D]' : 'border border-line/10 bg-line/5 text-accent'
                    }`}
                  >
                    {exDone ? <Check className="h-5 w-5" /> : <Dumbbell className="h-5 w-5" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{ex.name}</p>
                    <p className="text-xs text-muted">
                      {ex.muscleGroup} · {ex.sets.length} sets · {ex.restSeconds}s rest
                    </p>
                  </div>
                  {isCurrent && <span className="rounded-full bg-neon/15 px-2.5 py-1 text-xs font-semibold text-accent">Now</span>}
                </div>
                <div className="space-y-2">
                  {ex.sets.map((set) => (
                    <motion.button
                      key={set.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => toggleSet(ex, set)}
                      disabled={completed || finishing}
                      className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition ${
                        set.completed ? 'border-neon/30 bg-neon/10' : 'border-line/10 hover:border-line/25'
                      }`}
                      aria-pressed={set.completed}
                    >
                      <span className="w-12 text-sm text-muted">Set {set.setNumber}</span>
                      <span className={`flex-1 font-medium tabular-nums ${set.completed ? 'text-muted line-through' : ''}`}>
                        {ex.reps} reps
                      </span>
                      <span
                        className={`grid h-7 w-7 place-items-center rounded-lg border-2 transition ${
                          set.completed ? 'border-neon bg-neon text-[#07090D]' : 'border-line/20'
                        }`}
                      >
                        <AnimatePresence>
                          {set.completed && (
                            <motion.span initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }}>
                              <Check className="h-4 w-4" strokeWidth={3} />
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </span>
                    </motion.button>
                  ))}
                </div>
              </GlassCard>
            )
          })}
        </div>
      </div>

      {/* Completion modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] grid place-items-center bg-black/60 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8, y: 40, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              className="relative w-full max-w-md overflow-hidden rounded-3xl border border-line/10 bg-bg p-8 text-center shadow-2xl"
              role="dialog"
              aria-modal="true"
              aria-labelledby="done-title"
            >
              <div className="absolute -top-24 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-neon/30 blur-3xl" />
              <motion.div
                initial={{ rotate: -20, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
                className="relative mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-gradient-brand text-[#07090D] shadow-glow"
              >
                <Trophy className="h-10 w-10" />
              </motion.div>
              <h2 id="done-title" className="relative mt-5 text-3xl font-bold">
                Workout complete!
              </h2>
              <p className="relative mt-2 text-muted">Saved to your history. Your streak just got stronger.</p>
              <div className="relative mt-6 grid grid-cols-3 gap-2">
                {[
                  [Clock, `${workout.durationMinutes ?? 0} min`, 'Time'],
                  [Layers, doneCount, 'Sets'],
                  [Dumbbell, workout.exercises.length, 'Exercises'],
                ].map(([Icon, v, l]) => (
                  <div key={l} className="rounded-2xl border border-line/10 bg-line/5 py-3">
                    <Icon className="mx-auto h-4 w-4 text-accent" />
                    <p className="mt-1 font-display text-xl font-bold">{v}</p>
                    <p className="text-xs text-muted">{l}</p>
                  </div>
                ))}
              </div>
              <div className="relative mt-6 flex flex-col gap-2 sm:flex-row">
                <Link to="/dashboard" className="btn-primary flex-1">
                  View dashboard
                </Link>
                <button onClick={() => setShowModal(false)} className="btn-ghost flex-1">
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

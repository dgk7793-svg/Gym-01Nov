import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Activity, ArrowRight, Check, Dumbbell, Flame, Loader2, Play, Plus, SearchX, Search, Timer, X } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import DifficultyBadge from '../components/DifficultyBadge'
import { CardGridSkeleton } from '../components/Skeleton'
import { useToast } from '../context/ToastContext'
import useApi from '../hooks/useApi'
import { api, localDate } from '../lib/api'

const muscleGroups = ['Chest', 'Back', 'Legs', 'Arms', 'Core', 'Cardio']

const groupIcon = {
  Chest: Dumbbell,
  Back: Activity,
  Legs: Activity,
  Arms: Dumbbell,
  Core: Flame,
  Cardio: Timer,
}

const groupTint = {
  Chest: 'from-neon/25',
  Back: 'from-aqua/25',
  Legs: 'from-orchid/25',
  Arms: 'from-ember/25',
  Core: 'from-[#FFD23F]/25',
  Cardio: 'from-[#FF4F8B]/25',
}

export default function Library() {
  const [group, setGroup] = useState('All')
  const [query, setQuery] = useState('')
  const [pending, setPending] = useState(() => new Set())
  const toast = useToast()
  const today = useMemo(() => localDate(), [])

  const exercisesReq = useApi('/exercises')
  const todayReq = useApi(`/workouts?date=${today}`)
  const workout = todayReq.data?.workout
  const active = workout && workout.status !== 'completed' ? workout : null

  // exerciseId -> workout_exercise id for everything already in today's unfinished workout
  const inToday = useMemo(() => new Map((active?.exercises ?? []).map((e) => [e.exerciseId, e.id])), [active])

  const list = useMemo(() => {
    const q = query.trim().toLowerCase()
    return (exercisesReq.data?.exercises ?? []).filter(
      (e) =>
        (group === 'All' || e.muscleGroup === group) &&
        (!q || e.name.toLowerCase().includes(q) || e.description.toLowerCase().includes(q))
    )
  }, [exercisesReq.data, group, query])

  const toggleAdd = async (ex) => {
    if (pending.has(ex.id)) return
    setPending((p) => new Set(p).add(ex.id))
    const weId = inToday.get(ex.id)
    try {
      if (weId) {
        const { workout } = await api(`/workouts?workoutExerciseId=${weId}`, { method: 'DELETE' })
        todayReq.setData({ workout })
        toast({ type: 'info', title: 'Removed from today’s workout', message: ex.name })
      } else {
        const { workout } = await api('/workouts', { method: 'POST', body: { date: today, exerciseId: ex.id } })
        todayReq.setData({ workout })
        toast({ type: 'success', title: 'Added to today’s workout', message: `${ex.name} · ${ex.sets} × ${ex.reps}` })
      }
    } catch (err) {
      toast({ type: 'error', title: 'Couldn’t update your workout', message: err.message })
    } finally {
      setPending((p) => {
        const next = new Set(p)
        next.delete(ex.id)
        return next
      })
    }
  }

  const reset = () => {
    setGroup('All')
    setQuery('')
  }

  const error = exercisesReq.error || todayReq.error
  const loading = exercisesReq.loading || todayReq.loading
  const plannedCount = active?.exercises.length ?? 0

  return (
    <div>
      <PageHeader
        eyebrow="Workout library"
        title="Find your next move"
        subtitle="Browse exercises by muscle group, then add them to today’s workout."
      />

      <div className="sticky top-[65px] z-30 -mx-4 mb-6 space-y-3 bg-bg/70 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:top-0 lg:mx-0 lg:rounded-2xl lg:bg-transparent lg:px-0 lg:backdrop-blur-none">
        <label className="glass flex items-center gap-3 rounded-2xl px-4 py-3 focus-within:border-accent/50">
          <Search className="h-5 w-5 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search exercises…"
            className="w-full bg-transparent outline-none placeholder:text-muted"
          />
          {query && (
            <button onClick={() => setQuery('')} aria-label="Clear search" className="text-muted hover:text-fg">
              <X className="h-4 w-4" />
            </button>
          )}
        </label>
        <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1">
          {['All', ...muscleGroups].map((g) => {
            const isActive = g === group
            return (
              <button
                key={g}
                onClick={() => setGroup(g)}
                className={`chip ${isActive ? 'text-[#07090D]' : 'glass text-muted hover:text-fg'}`}
              >
                {isActive && (
                  <motion.span
                    layoutId="lib-chip"
                    className="absolute inset-0 rounded-full bg-gradient-brand"
                    transition={{ type: 'spring', stiffness: 450, damping: 34 }}
                  />
                )}
                <span className="relative">{g}</span>
              </button>
            )
          })}
        </div>
      </div>

      {error ? (
        <ErrorState
          error={error}
          onRetry={() => {
            exercisesReq.reload()
            todayReq.reload()
          }}
        />
      ) : loading && !exercisesReq.data ? (
        <CardGridSkeleton />
      ) : (
        <>
          <p className="mb-4 text-sm text-muted">
            {list.length} exercise{list.length === 1 ? '' : 's'}
            {group !== 'All' && ` for ${group}`}
          </p>

          {list.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="No exercises match that"
              message={
                query
                  ? `We couldn't find "${query}"${group !== 'All' ? ` in ${group}` : ''}. Try another word or clear the filters.`
                  : 'There are no exercises here yet. Run npm run db:setup to load the sample library.'
              }
              action={
                <button onClick={reset} className="btn-primary">
                  Clear filters
                </button>
              }
            />
          ) : (
            <motion.div layout className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {list.map((ex, i) => {
                  const Icon = groupIcon[ex.muscleGroup]
                  const isAdded = inToday.has(ex.id)
                  const isPending = pending.has(ex.id)
                  return (
                    <motion.article
                      key={ex.id}
                      layout
                      initial={{ opacity: 0, y: 16, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
                      transition={{ duration: 0.35, delay: Math.min(i, 8) * 0.03 }}
                      whileHover={{ y: -5 }}
                      className={`glass group relative flex flex-col overflow-hidden rounded-3xl p-5 transition-shadow hover:shadow-glow ${
                        isAdded ? '!border-neon/40' : ''
                      }`}
                    >
                      <div className={`pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b ${groupTint[ex.muscleGroup]} to-transparent opacity-60`} />
                      <div className="relative flex flex-1 flex-col">
                        <div className="flex items-start justify-between gap-3">
                          <span className="grid h-11 w-11 place-items-center rounded-2xl border border-line/10 bg-bg/40">
                            <Icon className="h-5 w-5 text-accent" />
                          </span>
                          <DifficultyBadge level={ex.difficulty} />
                        </div>
                        <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-muted">{ex.muscleGroup}</p>
                        <h3 className="mt-1 text-lg font-semibold">{ex.name}</h3>
                        <p className="mt-1 line-clamp-2 text-sm text-muted">{ex.description}</p>

                        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                          {[
                            ['Sets', ex.sets],
                            ['Reps', ex.reps],
                            ['Rest', `${ex.restSeconds}s`],
                          ].map(([k, v]) => (
                            <div key={k} className="rounded-xl border border-line/10 bg-line/[0.03] py-2">
                              <p className="font-display text-lg font-bold leading-tight">{v}</p>
                              <p className="text-[11px] text-muted">{k}</p>
                            </div>
                          ))}
                        </div>

                        <div className="min-h-4 flex-1" />
                        <motion.button
                          whileTap={{ scale: 0.97 }}
                          onClick={() => toggleAdd(ex)}
                          disabled={isPending}
                          aria-pressed={isAdded}
                          className={`flex w-full items-center justify-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition disabled:opacity-70 ${
                            isAdded ? 'bg-neon text-[#07090D]' : 'border border-line/15 hover:border-accent/50 hover:text-accent'
                          }`}
                        >
                          {isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : isAdded ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Plus className="h-4 w-4" />
                          )}
                          {isAdded ? 'In today’s workout' : 'Add to today’s workout'}
                        </motion.button>
                      </div>
                    </motion.article>
                  )
                })}
              </AnimatePresence>
            </motion.div>
          )}
        </>
      )}

      {/* Floating start bar once today's workout has exercises */}
      <AnimatePresence>
        {plannedCount > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="fixed inset-x-4 bottom-24 z-30 mx-auto max-w-md lg:bottom-6 lg:left-72 lg:right-0"
          >
            <Link
              to="/workout"
              className="flex items-center gap-3 rounded-2xl border border-neon/30 bg-bg/90 p-2 pl-4 shadow-glow backdrop-blur-xl"
            >
              <span className="flex-1 text-sm">
                <span className="font-semibold">{active.name}</span>
                <span className="block text-muted">
                  {plannedCount} exercise{plannedCount === 1 ? '' : 's'} ready
                </span>
              </span>
              <span className="btn-primary !rounded-xl !px-4 !py-2.5 text-sm">
                <Play className="h-4 w-4 fill-current" /> Start <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Bike, CalendarX, Check, Clock, Flame, Flower2, MapPin, Swords, Users, Zap } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import EmptyState from '../components/EmptyState'
import { useToast } from '../context/ToastContext'
import { classSchedule, classTypes, weekDays } from '../data/mockData'

const typeStyle = {
  Yoga: { icon: Flower2, cls: 'text-violet-600 dark:text-orchid bg-orchid/15', glow: 'bg-orchid/25' },
  HIIT: { icon: Zap, cls: 'text-accent bg-neon/15', glow: 'bg-neon/25' },
  Spin: { icon: Bike, cls: 'text-cyan-600 dark:text-aqua bg-aqua/15', glow: 'bg-aqua/25' },
  Boxing: { icon: Swords, cls: 'text-orange-600 dark:text-ember bg-ember/15', glow: 'bg-ember/25' },
}

const intensityDots = { Low: 1, Medium: 2, High: 3 }

// Dates for the current Mon–Sun week
function weekDates() {
  const now = new Date()
  const monday = new Date(now)
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7))
  return weekDays.map((_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d.getDate()
  })
}

export default function Classes() {
  const todayIdx = (new Date().getDay() + 6) % 7
  const dates = useMemo(weekDates, [])
  const [day, setDay] = useState(weekDays[todayIdx])
  const [type, setType] = useState('All')
  const [booked, setBooked] = useState(() => new Set())
  const toast = useToast()

  const list = classSchedule.filter((c) => c.day === day && (type === 'All' || c.type === type))

  const toggleBooking = (c) => {
    const isBooked = booked.has(c.id)
    const spots = c.spotsLeft - (isBooked ? 1 : 0)
    if (!isBooked && spots <= 0) {
      const alt = classSchedule.find((o) => o.type === c.type && o.id !== c.id && o.spotsLeft > 0)
      toast({
        type: 'error',
        title: `${c.name} is fully booked`,
        message: alt
          ? `No worries, ${alt.name} on ${alt.day} at ${alt.time} still has ${alt.spotsLeft} spots.`
          : 'Check back later. Spots often open up the day before.',
        duration: 5000,
      })
      return
    }
    const next = new Set(booked)
    if (isBooked) {
      next.delete(c.id)
      toast({ type: 'info', title: 'Booking cancelled', message: `Your spot in ${c.name} has been released.` })
    } else {
      next.add(c.id)
      toast({ type: 'success', title: 'You’re booked in! 🎉', message: `${c.name} · ${c.day} ${c.time} with ${c.coach}` })
    }
    setBooked(next)
  }

  return (
    <div>
      <PageHeader
        eyebrow="Class booking"
        title="Sweat with the crew"
        subtitle="Pick a day, find your vibe and grab a spot before they’re gone."
        action={
          booked.size > 0 && (
            <motion.span
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center gap-2 self-start rounded-full bg-neon/15 px-4 py-2 text-sm font-semibold text-accent"
            >
              <Check className="h-4 w-4" /> {booked.size} booked this week
            </motion.span>
          )
        }
      />

      {/* Day picker */}
      <div className="no-scrollbar -mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-7 sm:px-0">
        {weekDays.map((d, i) => {
          const active = d === day
          const count = classSchedule.filter((c) => c.day === d).length
          return (
            <button
              key={d}
              onClick={() => setDay(d)}
              className={`relative flex min-w-[64px] flex-col items-center rounded-2xl px-3 py-3 transition ${
                active ? 'text-[#07090D]' : 'glass hover:border-accent/30'
              }`}
            >
              {active && (
                <motion.span
                  layoutId="day-pill"
                  className="absolute inset-0 rounded-2xl bg-gradient-brand shadow-glow"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}
              <span className={`relative text-xs font-medium ${active ? '' : 'text-muted'}`}>{i === todayIdx ? 'Today' : d}</span>
              <span className="relative font-display text-2xl font-bold">{dates[i]}</span>
              <span className={`relative text-[10px] ${active ? 'opacity-70' : 'text-muted'}`}>{count} classes</span>
            </button>
          )
        })}
      </div>

      {/* Type filter */}
      <div className="no-scrollbar -mx-1 mb-6 flex gap-2 overflow-x-auto px-1">
        {['All', ...classTypes].map((t) => {
          const active = t === type
          const Icon = typeStyle[t]?.icon
          return (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`chip flex items-center gap-2 border ${active ? 'border-accent/50 bg-neon/10 text-fg' : 'border-line/10 text-muted hover:text-fg'}`}
            >
              {Icon && <Icon className="h-4 w-4" />}
              {t}
            </button>
          )
        })}
      </div>

      {list.length === 0 ? (
        <EmptyState
          icon={CalendarX}
          title={`No ${type === 'All' ? '' : type + ' '}classes on ${day}`}
          message="The studio’s taking a breather. Try another day or switch to all class types."
          action={
            <button onClick={() => setType('All')} className="btn-primary">
              Show all classes
            </button>
          }
        />
      ) : (
        <motion.div layout className="grid gap-4 md:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {list.map((c, i) => {
              const s = typeStyle[c.type]
              const isBooked = booked.has(c.id)
              const spots = c.spotsLeft - (isBooked ? 1 : 0)
              const full = spots <= 0 && !isBooked
              const fillPct = ((c.capacity - spots) / c.capacity) * 100
              const low = spots > 0 && spots <= 4
              return (
                <motion.article
                  key={c.id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
                  transition={{ delay: i * 0.04 }}
                  whileHover={{ y: -4 }}
                  className={`glass relative overflow-hidden rounded-3xl p-5 ${isBooked ? '!border-neon/40 shadow-glow' : ''}`}
                >
                  <div className={`pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full blur-3xl ${s.glow}`} />
                  <div className="relative flex gap-4">
                    <div className="flex w-16 shrink-0 flex-col items-center rounded-2xl border border-line/10 bg-line/[0.03] py-3">
                      <span className="font-display text-xl font-bold">{c.time}</span>
                      <span className="text-[11px] text-muted">{c.duration} min</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${s.cls}`}>
                          <s.icon className="h-3.5 w-3.5" /> {c.type}
                        </span>
                        <span className="flex items-center gap-0.5" title={`${c.intensity} intensity`}>
                          {[1, 2, 3].map((n) => (
                            <Flame key={n} className={`h-4 w-4 ${n <= intensityDots[c.intensity] ? 'text-ember' : 'text-line/20'}`} />
                          ))}
                        </span>
                      </div>
                      <h3 className="mt-2 truncate text-lg font-semibold">{c.name}</h3>
                      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" /> {c.coach}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" /> {c.room}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="relative mt-4">
                    <div className="mb-1.5 flex justify-between text-xs">
                      <span className={full ? 'font-semibold text-ember' : low ? 'font-semibold text-orange-600 dark:text-ember' : 'text-muted'}>
                        {full ? 'Fully booked' : `${spots} spot${spots === 1 ? '' : 's'} left`}
                        {low && ' · filling fast'}
                      </span>
                      <span className="text-muted">
                        {c.capacity - spots}/{c.capacity}
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-line/10">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${fillPct}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className={`h-full rounded-full ${full || low ? 'bg-ember' : 'bg-gradient-brand'}`}
                      />
                    </div>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => toggleBooking(c)}
                    className={`relative mt-4 flex w-full items-center justify-center gap-2 rounded-2xl py-3 font-semibold transition ${
                      isBooked
                        ? 'bg-neon text-[#07090D]'
                        : full
                          ? 'cursor-not-allowed border border-line/10 text-muted'
                          : 'btn-primary !shadow-none'
                    }`}
                    aria-disabled={full}
                  >
                    {isBooked ? (
                      <>
                        <Check className="h-4 w-4" /> Booked · tap to cancel
                      </>
                    ) : full ? (
                      'Class full'
                    ) : (
                      <>
                        <Clock className="h-4 w-4" /> Book spot
                      </>
                    )}
                  </motion.button>
                </motion.article>
              )
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}

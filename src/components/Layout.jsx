import { useEffect, useState } from 'react'
import { NavLink, Link, useLocation, useNavigate, useOutlet } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Calendar, Dumbbell, Flame, LayoutDashboard, LogIn, LogOut, Play, Timer, TrendingUp, User } from 'lucide-react'
import Logo from './Logo'
import ThemeToggle from './ThemeToggle'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { api, initials, localDate } from '../lib/api'

function useLogout() {
  const { logout } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  return async () => {
    await logout().catch(() => {})
    toast({ type: 'info', title: 'Logged out', message: 'See you at your next session!' })
    navigate('/')
  }
}

// Current streak for the sidebar. Refreshes when a workout changes.
function useStreak(enabled) {
  const [streak, setStreak] = useState(null)
  useEffect(() => {
    if (!enabled) return setStreak(null)
    let alive = true
    const load = () =>
      api(`/dashboard?date=${localDate()}`)
        .then((d) => alive && setStreak(d.streak.current))
        .catch(() => alive && setStreak(null))
    load()
    window.addEventListener('pulsefit:activity', load)
    return () => {
      alive = false
      window.removeEventListener('pulsefit:activity', load)
    }
  }, [enabled])
  return streak
}

const navItems = [
  { to: '/dashboard', label: 'Dashboard', short: 'Home', icon: LayoutDashboard },
  { to: '/library', label: 'Workout Library', short: 'Library', icon: Dumbbell },
  { to: '/workout', label: 'Live Workout', short: 'Train', icon: Timer },
  { to: '/progress', label: 'Progress', short: 'Progress', icon: TrendingUp },
  { to: '/classes', label: 'Classes', short: 'Classes', icon: Calendar },
  { to: '/profile', label: 'Profile', short: 'Profile', icon: User },
]

function Sidebar() {
  const { user } = useAuth()
  const streak = useStreak(!!user)
  const onLogout = useLogout()
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col border-r border-line/10 bg-bg/60 p-6 backdrop-blur-2xl lg:flex">
      <Logo to="/" />
      <nav className="mt-10 flex flex-col gap-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className="relative">
            {({ isActive }) => (
              <span
                className={`relative flex items-center gap-3 rounded-2xl px-4 py-3 font-medium transition-colors ${
                  isActive ? 'text-fg' : 'text-muted hover:text-fg'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-2xl border border-neon/30 bg-neon/10"
                    transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                  />
                )}
                <Icon className={`relative h-5 w-5 ${isActive ? 'text-accent' : ''}`} />
                <span className="relative">{label}</span>
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto space-y-4">
        {streak !== null && (
        <div className="glass relative overflow-hidden rounded-2xl p-4">
          <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-ember/30 blur-2xl" />
          <div className="relative flex items-center gap-3">
            <Flame className="h-8 w-8 animate-flicker text-ember" />
            <div>
              <p className="font-display text-xl font-bold">
                {streak} day{streak === 1 ? '' : 's'}
              </p>
              <p className="text-xs text-muted">{streak ? 'Current streak. Keep it alive!' : 'Finish a workout to start a streak.'}</p>
            </div>
          </div>
        </div>
        )}
        {user ? (
          <div className="flex items-center gap-2">
            <Link to="/profile" className="flex min-w-0 flex-1 items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-brand font-display font-bold text-[#07090D]">
                {initials(user.fullName)}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold">{user.fullName}</span>
                <span className="block truncate text-xs text-muted">{user.email}</span>
              </span>
            </Link>
            <button
              onClick={onLogout}
              aria-label="Log out"
              title="Log out"
              className="glass grid h-10 w-10 shrink-0 place-items-center rounded-xl text-muted transition hover:border-ember/40 hover:text-ember"
            >
              <LogOut className="h-5 w-5" />
            </button>
            <ThemeToggle />
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link to="/login" className="btn-primary flex-1 !py-2.5 text-sm">
              <LogIn className="h-4 w-4" /> Log in
            </Link>
            <ThemeToggle />
          </div>
        )}
      </div>
    </aside>
  )
}

function MobileTopBar() {
  const { user } = useAuth()
  const onLogout = useLogout()
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-line/10 bg-bg/70 px-4 py-3 backdrop-blur-2xl lg:hidden">
      <Logo to="/" />
      <div className="flex items-center gap-2">
        <ThemeToggle />
        {user ? (
          <>
            <button onClick={onLogout} aria-label="Log out" className="glass grid h-10 w-10 place-items-center rounded-xl text-muted hover:text-ember">
              <LogOut className="h-5 w-5" />
            </button>
            <Link
              to="/profile"
              aria-label={`Profile of ${user.fullName}`}
              className="grid h-10 w-10 place-items-center rounded-full bg-gradient-brand font-display text-sm font-bold text-[#07090D]"
            >
              {initials(user.fullName)}
            </Link>
          </>
        ) : (
          <Link to="/login" className="btn-primary !px-4 !py-2 text-sm">
            Log in
          </Link>
        )}
      </div>
    </header>
  )
}

function BottomNav() {
  const items = navItems.filter((i) => i.to !== '/profile')
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line/10 bg-bg/80 backdrop-blur-2xl lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="mx-auto flex max-w-md items-end justify-around px-2 pt-2">
        {items.map(({ to, short, icon: Icon }) =>
          to === '/workout' ? (
            <li key={to} className="-mt-7">
              <NavLink to={to} aria-label="Start live workout" className="flex flex-col items-center gap-1 pb-2">
                <motion.span
                  whileTap={{ scale: 0.9 }}
                  className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-brand text-[#07090D] shadow-glow ring-4 ring-bg"
                >
                  <Play className="h-6 w-6 fill-current" />
                </motion.span>
                <span className="text-[11px] font-semibold text-accent">{short}</span>
              </NavLink>
            </li>
          ) : (
            <li key={to}>
              <NavLink to={to} className="flex w-16 flex-col items-center gap-1 pb-2 pt-1">
                {({ isActive }) => (
                  <>
                    <span className="relative grid h-8 w-12 place-items-center">
                      {isActive && (
                        <motion.span
                          layoutId="bottom-active"
                          className="absolute inset-0 rounded-full bg-neon/15"
                          transition={{ type: 'spring', stiffness: 500, damping: 36 }}
                        />
                      )}
                      <Icon className={`relative h-5 w-5 ${isActive ? 'text-accent' : 'text-muted'}`} />
                    </span>
                    <span className={`text-[11px] font-medium ${isActive ? 'text-fg' : 'text-muted'}`}>{short}</span>
                  </>
                )}
              </NavLink>
            </li>
          )
        )}
      </ul>
    </nav>
  )
}

export default function Layout() {
  const location = useLocation()
  const outlet = useOutlet()

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [location.pathname])

  return (
    <div className="min-h-dvh">
      <Sidebar />
      <MobileTopBar />
      <main className="px-4 pb-32 pt-6 sm:px-6 lg:ml-72 lg:px-10 lg:pb-12 lg:pt-10">
        <div className="mx-auto max-w-6xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              {outlet}
            </motion.div>
          </AnimatePresence>
          <footer className="mt-16 flex flex-col items-center justify-between gap-2 border-t border-line/10 pt-6 text-sm text-muted sm:flex-row">
            <span>
              © {new Date().getFullYear()} <span className="font-display font-semibold text-fg">PulseFit</span>. Train smarter. Get stronger.
            </span>
            <span>Made for people who show up.</span>
          </footer>
        </div>
      </main>
      <BottomNav />
    </div>
  )
}

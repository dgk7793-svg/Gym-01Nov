import { Route, Routes, Link } from 'react-router-dom'
import { Compass } from 'lucide-react'
import Layout from './components/Layout'
import EmptyState from './components/EmptyState'
import RequireAuth from './components/RequireAuth'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import Library from './pages/Library'
import LiveWorkout from './pages/LiveWorkout'
import Progress from './pages/Progress'
import Classes from './pages/Classes'
import Profile from './pages/Profile'
import { Login, Signup } from './pages/AuthPages'

function NotFound() {
  return (
    <EmptyState
      icon={Compass}
      title="Lost between sets?"
      message="We couldn't find that page. Let's get you back to your training."
      action={
        <Link to="/dashboard" className="btn-primary">
          Back to dashboard
        </Link>
      }
    />
  )
}

const guard = (el) => <RequireAuth>{el}</RequireAuth>

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route element={<Layout />}>
        <Route path="/dashboard" element={guard(<Dashboard />)} />
        <Route path="/library" element={guard(<Library />)} />
        <Route path="/workout" element={guard(<LiveWorkout />)} />
        <Route path="/profile" element={guard(<Profile />)} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/classes" element={<Classes />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

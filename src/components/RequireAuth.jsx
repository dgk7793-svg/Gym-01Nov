import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ErrorState from './ErrorState'
import { Skeleton } from './Skeleton'

export default function RequireAuth({ children }) {
  const { user, loading, error, refresh } = useAuth()
  const location = useLocation()

  if (loading)
    return (
      <div className="space-y-4" aria-busy="true">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full rounded-3xl" />
      </div>
    )
  if (!user && error) return <ErrorState error={error} onRetry={refresh} />
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return children
}

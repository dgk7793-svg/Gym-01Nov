import { DatabaseZap, RefreshCw, ServerCrash, WifiOff } from 'lucide-react'
import EmptyState from './EmptyState'

const variants = {
  DB_UNREACHABLE: { icon: DatabaseZap, title: 'Can’t reach the database' },
  NETWORK: { icon: WifiOff, title: 'You seem to be offline' },
  SERVER_DOWN: { icon: ServerCrash, title: 'The server isn’t responding' },
}

export default function ErrorState({ error, onRetry }) {
  const v = variants[error?.code] ?? { icon: ServerCrash, title: 'Something went wrong' }
  return (
    <EmptyState
      icon={v.icon}
      title={v.title}
      message={error?.message ?? 'Please try again in a moment.'}
      action={
        onRetry && (
          <button onClick={onRetry} className="btn-primary">
            <RefreshCw className="h-4 w-4" /> Try again
          </button>
        )
      }
    />
  )
}

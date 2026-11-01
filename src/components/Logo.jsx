import { Link } from 'react-router-dom'

export function PulseMark({ className = 'h-9 w-9' }) {
  return (
    <span className={`relative grid shrink-0 place-items-center rounded-xl bg-gradient-brand shadow-glow ${className}`}>
      <svg
        viewBox="0 0 32 32"
        className="h-[62%] w-[62%]"
        fill="none"
        stroke="#07090D"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="2,17 9,17 12,9 17,25 20,14 22.5,17 30,17" />
      </svg>
    </span>
  )
}

export default function Logo({ to = '/', size = 'md' }) {
  const text = size === 'lg' ? 'text-3xl' : 'text-2xl'
  return (
    <Link to={to} className="inline-flex items-center gap-2.5" aria-label="PulseFit home">
      <PulseMark className={size === 'lg' ? 'h-11 w-11' : 'h-9 w-9'} />
      <span className={`font-display font-bold italic tracking-tighter ${text}`}>
        <span className="text-fg">Pulse</span>
        <span className="text-gradient pr-1">Fit</span>
      </span>
    </Link>
  )
}

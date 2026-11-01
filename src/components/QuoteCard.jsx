import { Quote } from 'lucide-react'
import GlassCard from './GlassCard'
import { quoteOfTheDay } from '../data/mockData'

export default function QuoteCard({ className = '', delay = 0 }) {
  const q = quoteOfTheDay()
  return (
    <GlassCard delay={delay} className={`relative overflow-hidden ${className}`}>
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-aqua/20 blur-3xl" />
      <div className="relative">
        <div className="mb-4 flex items-center gap-2 text-cyan-600 dark:text-aqua">
          <Quote className="h-5 w-5" />
          <span className="text-xs font-semibold uppercase tracking-[0.18em]">Quote of the day</span>
        </div>
        <p className="font-display text-xl font-semibold leading-snug sm:text-2xl">“{q.text}”</p>
        <p className="mt-3 text-sm text-muted">— {q.author}</p>
      </div>
    </GlassCard>
  )
}

const levels = {
  Beginner: { bars: 1, cls: 'text-accent bg-neon/10 border-neon/30' },
  Intermediate: { bars: 2, cls: 'text-cyan-700 dark:text-aqua bg-aqua/10 border-aqua/30' },
  Advanced: { bars: 3, cls: 'text-orange-600 dark:text-ember bg-ember/10 border-ember/30' },
}

export default function DifficultyBadge({ level }) {
  const l = levels[level] ?? levels.Beginner
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${l.cls}`}>
      <span className="flex items-end gap-0.5" aria-hidden>
        {[1, 2, 3].map((i) => (
          <span key={i} className={`w-1 rounded-sm bg-current ${i <= l.bars ? '' : 'opacity-25'}`} style={{ height: 3 + i * 3 }} />
        ))}
      </span>
      {level}
    </span>
  )
}

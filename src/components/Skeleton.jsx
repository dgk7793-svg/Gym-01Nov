export function Skeleton({ className = '' }) {
  return (
    <div className={`relative overflow-hidden rounded-xl bg-line/[0.07] ${className}`}>
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-line/[0.08] to-transparent" />
    </div>
  )
}

function GlassSkeleton({ className = '', children }) {
  return <div className={`glass rounded-3xl p-5 sm:p-6 ${className}`}>{children}</div>
}

export function DashboardSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading dashboard">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="mt-3 h-10 w-72" />
      <Skeleton className="mt-3 mb-8 h-4 w-80 max-w-full" />
      <div className="grid gap-4 lg:grid-cols-3">
        <GlassSkeleton className="lg:col-span-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="mt-4 h-9 w-64" />
          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-14 rounded-2xl" />
            ))}
          </div>
          <Skeleton className="mt-6 h-14 w-44 rounded-2xl" />
        </GlassSkeleton>
        <GlassSkeleton>
          <Skeleton className="mx-auto mt-6 h-20 w-20 rounded-full" />
          <Skeleton className="mx-auto mt-4 h-12 w-20" />
          <Skeleton className="mt-8 h-8 w-full" />
        </GlassSkeleton>
        <GlassSkeleton className="lg:col-span-3">
          <div className="grid grid-cols-3 gap-6">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="mx-auto aspect-square w-full max-w-[140px] rounded-full" />
            ))}
          </div>
        </GlassSkeleton>
        <GlassSkeleton className="lg:col-span-2">
          <Skeleton className="h-56 w-full" />
        </GlassSkeleton>
        <GlassSkeleton>
          <Skeleton className="h-56 w-full" />
        </GlassSkeleton>
      </div>
    </div>
  )
}

export function CardGridSkeleton({ count = 6 }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true" aria-label="Loading">
      {Array.from({ length: count }, (_, i) => (
        <GlassSkeleton key={i}>
          <div className="flex justify-between">
            <Skeleton className="h-11 w-11 rounded-2xl" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
          <Skeleton className="mt-5 h-3 w-24" />
          <Skeleton className="mt-2 h-6 w-48" />
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[0, 1, 2].map((j) => (
              <Skeleton key={j} className="h-14" />
            ))}
          </div>
          <Skeleton className="mt-4 h-10 w-full rounded-xl" />
        </GlassSkeleton>
      ))}
    </div>
  )
}

export function WorkoutSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading workout">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="mt-3 mb-8 h-10 w-72" />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <GlassSkeleton className="flex flex-col items-center">
          <Skeleton className="my-6 h-[260px] w-[260px] rounded-full" />
          <Skeleton className="h-14 w-full rounded-2xl" />
        </GlassSkeleton>
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <GlassSkeleton key={i}>
              <Skeleton className="h-10 w-56" />
              <Skeleton className="mt-3 h-11 w-full" />
              <Skeleton className="mt-2 h-11 w-full" />
            </GlassSkeleton>
          ))}
        </div>
      </div>
    </div>
  )
}

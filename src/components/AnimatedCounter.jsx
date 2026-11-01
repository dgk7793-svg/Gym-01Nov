import { useEffect, useRef } from 'react'
import { animate, useInView } from 'framer-motion'

export default function AnimatedCounter({ value, decimals = 0, duration = 1.6, prefix = '', suffix = '', className = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })

  useEffect(() => {
    if (!inView || !ref.current) return
    const fmt = (v) =>
      prefix + v.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix
    const controls = animate(0, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        if (ref.current) ref.current.textContent = fmt(v)
      },
    })
    return () => controls.stop()
  }, [inView, value, decimals, duration, prefix, suffix])

  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {prefix}0{suffix}
    </span>
  )
}

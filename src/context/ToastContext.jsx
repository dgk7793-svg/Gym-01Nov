import { createContext, useCallback, useContext, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CircleCheck, CircleAlert, Info, X } from 'lucide-react'

const ToastContext = createContext(() => {})

const styles = {
  success: { icon: CircleCheck, color: 'text-accent', bar: 'bg-neon' },
  error: { icon: CircleAlert, color: 'text-ember', bar: 'bg-ember' },
  info: { icon: Info, color: 'text-cyan-600 dark:text-aqua', bar: 'bg-aqua' },
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const idRef = useRef(0)

  const dismiss = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), [])

  const toast = useCallback(
    ({ type = 'success', title, message, duration = 3500 }) => {
      const id = ++idRef.current
      setToasts((t) => [...t.slice(-2), { id, type, title, message, duration }])
      setTimeout(() => dismiss(id), duration)
    },
    [dismiss]
  )

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-3 z-[100] flex flex-col items-center gap-2 px-4 lg:inset-x-auto lg:bottom-6 lg:right-6 lg:top-auto lg:items-end">
        <AnimatePresence initial={false}>
          {toasts.map((t) => {
            const s = styles[t.type] ?? styles.info
            const Icon = s.icon
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: -16, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
                role="status"
                className="pointer-events-auto relative w-full max-w-sm overflow-hidden rounded-2xl border border-line/10 bg-bg/95 p-4 pr-10 shadow-2xl backdrop-blur-xl"
              >
                <div className="flex gap-3">
                  <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${s.color}`} />
                  <div>
                    <p className="font-semibold">{t.title}</p>
                    {t.message && <p className="mt-0.5 text-sm text-muted">{t.message}</p>}
                  </div>
                </div>
                <button
                  onClick={() => dismiss(t.id)}
                  className="absolute right-3 top-3 rounded-lg p-1 text-muted hover:text-fg"
                  aria-label="Dismiss notification"
                >
                  <X className="h-4 w-4" />
                </button>
                <motion.div
                  className={`absolute bottom-0 left-0 h-0.5 ${s.bar}`}
                  initial={{ width: '100%' }}
                  animate={{ width: 0 }}
                  transition={{ duration: t.duration / 1000, ease: 'linear' }}
                />
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)

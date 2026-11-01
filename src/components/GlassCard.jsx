import { motion } from 'framer-motion'

export default function GlassCard({ children, className = '', hover = false, delay = 0, ...rest }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={hover ? { y: -4, transition: { duration: 0.2 } } : undefined}
      className={`glass rounded-3xl p-5 sm:p-6 ${hover ? 'transition-shadow hover:shadow-glow' : ''} ${className}`}
      {...rest}
    >
      {children}
    </motion.div>
  )
}

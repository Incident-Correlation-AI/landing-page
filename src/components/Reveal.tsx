import type { ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

export default function Reveal({ children, className }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion()
  if (reduce) return <div className={className}>{children}</div>
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-8% 0px' }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}

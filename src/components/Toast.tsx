import { AnimatePresence, motion } from 'framer-motion'
import { useGameStore } from '../store/game'

const toneClass: Record<string, string> = {
  positive: 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-2 border-white/90 shadow-[0_8px_24px_rgba(16,185,129,0.4)]',
  negative: 'bg-gradient-to-r from-rose-500 to-red-600 text-white border-2 border-white/90 shadow-[0_8px_24px_rgba(244,63,94,0.4)]',
  info: 'bg-slate-900/90 text-white border-2 border-slate-700/80 shadow-[0_8px_24px_rgba(0,0,0,0.4)]',
}

export default function Toasts() {
  const toasts = useGameStore((s) => s.toasts)
  return (
    <div className="pointer-events-none fixed inset-x-0 top-[92px] z-50 flex flex-col items-center gap-2 px-4">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: -20, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.9 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className={
              'rounded-2xl px-5 py-2.5 font-display font-extrabold text-sm sm:text-base tracking-wide backdrop-blur-md ' +
              (toneClass[t.tone] ?? toneClass.info)
            }
          >
            {t.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

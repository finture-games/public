import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatRp } from '../lib/format'

interface Particle {
  id: number
  icon: string
  startX: number
  startY: number
  delay: number
  rotation: number
  scale: number
}

interface PaydayParticlesProps {
  trigger: number
  amount: number
}

const MONEY_ICONS = ['💵', '💰', '💸', '🪙', '✨', '💵', '💰', '🌟']

export default function PaydayParticles({ trigger, amount }: PaydayParticlesProps) {
  const [particles, setParticles] = useState<Particle[]>([])
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    if (!trigger) return

    const screenW = typeof window !== 'undefined' ? window.innerWidth : 360
    const screenH = typeof window !== 'undefined' ? window.innerHeight : 640

    const newParticles: Particle[] = Array.from({ length: 8 }).map((_, i) => ({
      id: Date.now() + i,
      icon: MONEY_ICONS[i % MONEY_ICONS.length],
      startX: screenW * 0.5 + (Math.random() * 80 - 40),
      startY: screenH * 0.55 + (Math.random() * 40 - 20),
      delay: i * 0.07,
      rotation: Math.random() * 360,
      scale: 0.9 + Math.random() * 0.5,
    }))

    setParticles(newParticles)
    setShowBanner(true)

    const timer = setTimeout(() => {
      setParticles([])
      setShowBanner(false)
    }, 2200)

    return () => clearTimeout(timer)
  }, [trigger])

  if (!trigger) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {/* 1. Flying Money Particles (Flying to HUD top-left badge [x: 80px, y: 35px]) */}
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{
              x: p.startX,
              y: p.startY,
              opacity: 0,
              scale: 0.2,
              rotate: 0,
            }}
            animate={{
              x: [p.startX, p.startX + (p.id % 2 === 0 ? 40 : -40), 90],
              y: [p.startY, p.startY - 120, 35],
              opacity: [0, 1, 1, 0],
              scale: [0.2, p.scale, p.scale * 1.1, 0.3],
              rotate: [0, p.rotation, p.rotation + 180],
            }}
            transition={{
              duration: 1.15,
              delay: p.delay,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="absolute text-2xl drop-shadow-[0_4px_10px_rgba(0,0,0,0.25)] filter"
          >
            {p.icon}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* 2. Playful Chunky Finture-Themed Payday Toast */}
      <AnimatePresence>
        {showBanner && (
          <div className="absolute inset-x-0 top-20 flex justify-center p-3 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.6, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -30 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="bg-white/95 backdrop-blur-md border-2 border-ink shadow-[0_6px_0_0_#1E1B3A] rounded-2xl p-3 max-w-[310px] w-full flex items-center gap-3"
            >
              {/* Gold Coin Icon Box */}
              <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-amber-300 via-secondary to-amber-500 border-2 border-ink flex items-center justify-center text-xl shadow-sm shrink-0 animate-bounce">
                💰
              </div>

              {/* Text Stack */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="font-display font-extrabold text-[10px] text-primary uppercase tracking-wider">
                    🎉 Gajian Mingguan!
                  </span>
                  <span className="bg-emerald-100 border border-emerald-300 text-emerald-800 text-[8px] font-display font-black px-1.5 py-0.5 rounded uppercase">
                    +Masuk
                  </span>
                </div>
                <div className="font-display font-black text-base text-emerald-600 tracking-tight leading-tight">
                  +{formatRp(amount)}
                </div>
                <p className="font-body text-[9.5px] font-semibold text-ink/65 truncate">
                  Melunasi hutang &amp; menambah tabungan
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

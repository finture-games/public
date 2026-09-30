import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

const PIPS: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
}

const FACE_ANGLES: Record<number, { x: number; y: number }> = {
  1: { x: 0, y: 0 },
  2: { x: -90, y: 0 },
  3: { x: 0, y: -90 },
  4: { x: 0, y: 90 },
  5: { x: 90, y: 0 },
  6: { x: 0, y: 180 },
}

function Face({ n, transform }: { n: number; transform: string }) {
  return (
    <div
      className="absolute inset-0 grid grid-cols-3 grid-rows-3 rounded-xl bg-white border-2 border-ink/80 p-1.5 shadow-sm"
      style={{ transform, backfaceVisibility: 'hidden' }}
    >
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="flex items-center justify-center">
          {PIPS[n]?.includes(i) ? <div className="w-1.5 h-1.5 rounded-full bg-ink" /> : null}
        </div>
      ))}
    </div>
  )
}

export default function Dice({
  rolling,
  value,
  disabled,
  onRoll,
}: {
  rolling: boolean
  value: number
  disabled: boolean
  onRoll: () => void
}) {
  const [rotation, setRotation] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const turnsRef = useRef(0)

  useEffect(() => {
    if (rolling) {
      turnsRef.current += 1
      const face = FACE_ANGLES[value] ?? FACE_ANGLES[1]
      setRotation({
        x: turnsRef.current * 720 + face.x,
        y: turnsRef.current * 1080 + face.y,
      })
    }
  }, [rolling, value])

  return (
    <div className="flex flex-col items-center gap-3">
      <div style={{ perspective: 700 }} className="p-2">
        <motion.div
          className="relative h-16 w-16 shadow-2xl rounded-2xl"
          style={{ transformStyle: 'preserve-3d' }}
          animate={{
            rotateX: rotation.x,
            rotateY: rotation.y,
          }}
          transition={{
            duration: 0.7,
            ease: [0.15, 0.85, 0.35, 1],
          }}
        >
          <Face n={1} transform="translateZ(32px)" />
          <Face n={6} transform="rotateY(180deg) translateZ(32px)" />
          <Face n={2} transform="rotateX(90deg) translateZ(32px)" />
          <Face n={5} transform="rotateX(-90deg) translateZ(32px)" />
          <Face n={3} transform="rotateY(90deg) translateZ(32px)" />
          <Face n={4} transform="rotateY(-90deg) translateZ(32px)" />
        </motion.div>
      </div>

      <button
        disabled={disabled}
        onClick={onRoll}
        className="min-h-[52px] px-9 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-display font-bold text-lg shadow-lg hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center tracking-wider"
      >
        <span>{rolling ? 'Memutar Dadu...' : 'LEMPAR DADU'}</span>
      </button>
    </div>
  )
}

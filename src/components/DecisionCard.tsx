import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { ScenarioCard, TileType } from '../data/types'
import { TILE_COLORS } from '../data/types'
import { useGameStore } from '../store/game'
import { assetUrl } from '../lib/format'

export function getCharacterExpression(characterId: string, tileType: TileType): string {
  let exprName = '4_surprised'

  switch (tileType) {
    case 'fomo':
      exprName = '4_surprised'
      break
    case 'keinginan':
    case 'belanja':
      exprName = '2_angry'
      break
    case 'kebutuhan':
    case 'tabung':
    case 'gajian':
      if (characterId === 'alea') exprName = '5_excited'
      else if (characterId === 'angel') exprName = '5_confident'
      else if (characterId === 'mamad') exprName = '5_friendly'
      else exprName = '5_focus'
      break
    case 'kejutan':
      exprName = '3_sad'
      break
    default:
      exprName = '4_surprised'
  }

  return assetUrl(`/characters/${characterId}/${characterId}_${exprName}.png`)
}

export default function DecisionCard({
  card,
  reduceMotion,
  onChoose,
}: {
  card: ScenarioCard
  reduceMotion: boolean
  onChoose: (choiceId: string) => void
}) {
  const session = useGameStore((s) => s.session)
  const charId = session?.characterId ?? 'alep'
  const exprAvatarPath = getCharacterExpression(charId, card.tileType)

  const [flipped, setFlipped] = useState(reduceMotion)
  if (!flipped && !reduceMotion) {
    setTimeout(() => setFlipped(true), reduceMotion ? 0 : 600)
  }
  return (
    <div className="absolute inset-x-0 bottom-0 z-40 px-2.5 pb-3 font-display">
      <motion.div
        initial={{ y: 140, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 140, opacity: 0 }}
        transition={{ type: 'spring', damping: 24, stiffness: 260 }}
        className="relative rounded-[20px] bg-white border-2 border-primary/20 shadow-[0_12px_32px_rgba(30,27,58,0.25)] max-w-[420px] mx-auto"
        style={{ perspective: 1000 }}
      >
        {/* Offside Pop-Out Character Expression Avatar (Fine-tuned +4px higher) */}
        <div className="absolute -top-[80px] sm:-top-[88px] left-2.5 sm:left-3.5 z-30 w-20 h-22 sm:w-24 sm:h-26 pointer-events-none filter drop-shadow-[0_6px_12px_rgba(0,0,0,0.3)]">
          <img
            src={exprAvatarPath}
            alt="Ekspresi Karakter"
            className="w-full h-full object-contain object-bottom"
          />
        </div>

        {/* Top Header Banner with Left Indent for Offside Character Avatar */}
        <div
          className="px-3.5 py-2.5 rounded-t-[18px] flex items-center justify-between border-b border-black/10 relative overflow-hidden pl-24 sm:pl-28"
          style={{ backgroundColor: TILE_COLORS[card.tileType] }}
        >
          <div>
            <div className="font-extrabold text-white text-sm sm:text-base leading-none drop-shadow-sm">
              Situasi Petualangan
            </div>
            <div className="text-[10px] text-white/90 font-bold tracking-wide mt-1 font-body">
              Hari Ke-{session?.day ?? 1}
            </div>
          </div>
        </div>

        <motion.div
          initial={reduceMotion ? false : { rotateY: 180 }}
          animate={{ rotateY: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.6, delay: reduceMotion ? 0 : 0.15 }}
          className="p-3 space-y-2"
        >
          <div className="font-display font-bold text-ink text-base leading-snug">{card.title}</div>
          <div className="bg-sky/40 border border-primary/10 p-2.5 rounded-xl text-xs text-ink/90 font-body leading-relaxed font-medium">
            {card.story}
          </div>

          <AnimatePresence>
            {flipped && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="pt-0.5 space-y-1.5"
              >
                {card.choices.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => onChoose(c.id)}
                    className="w-full text-left bg-white hover:bg-sky/60 border border-primary/20 hover:border-primary text-ink font-display font-semibold text-xs p-2.5 rounded-xl transition-all shadow-sm flex items-center justify-between group active:scale-[0.99] cursor-pointer"
                  >
                    <span>{c.label}</span>
                    <span className="text-primary font-bold text-sm opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0 ml-1.5">
                      ➔
                    </span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  )
}

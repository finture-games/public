import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { ScenarioCard, TileType } from '../data/types'
import { TILE_COLORS } from '../data/types'
import { useGameStore } from '../store/game'
import { assetUrl } from '../lib/format'
import { CHARACTERS } from '../data/characters'
import { soundManager } from '../lib/sound'

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
  previewCharId,
  previewExpression,
  previewOffset,
}: {
  card: ScenarioCard
  reduceMotion: boolean
  onChoose: (choiceId: string) => void
  previewCharId?: string
  previewExpression?: string
  previewOffset?: { top: number; left: number; scale: number }
}) {
  const session = useGameStore((s) => s.session)
  const customOffsets = useGameStore((s) => s.customOffsets)
  const charId = previewCharId ?? session?.characterId ?? 'alep'
  const charDef = CHARACTERS.find((c) => c.id === charId)

  const activeCustom = customOffsets[charId]
  const topOffset = previewOffset?.top ?? activeCustom?.top ?? charDef?.decisionOffset ?? -72
  const leftOffset = previewOffset?.left ?? activeCustom?.left ?? charDef?.decisionLeftOffset ?? 10
  const scale = previewOffset?.scale ?? activeCustom?.scale ?? charDef?.decisionScale ?? 1

  const exprAvatarPath = previewExpression
    ? assetUrl(`/characters/${charId}/${charId}_${previewExpression}.png`)
    : getCharacterExpression(charId, card.tileType)

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
        {/* Offside Pop-Out Character Expression Avatar - Fixed position & size across all screen sizes */}
        <div
          style={{
            top: `${topOffset}px`,
            left: `${leftOffset}px`,
            transform: `scale(${scale})`,
            transformOrigin: 'bottom left',
          }}
          className="absolute z-30 w-24 h-26 pointer-events-none filter drop-shadow-[0_6px_12px_rgba(0,0,0,0.3)] transition-transform duration-75"
        >
          <img
            src={exprAvatarPath}
            alt="Ekspresi Karakter"
            className="w-full h-full object-contain object-bottom"
          />
        </div>

        {/* Top Header Banner with Fixed Left Indent for Offside Character Avatar */}
        <div
          className="px-3.5 py-2.5 rounded-t-[18px] flex items-center justify-between border-b border-black/10 relative overflow-hidden pl-28"
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
          {/* Question / Situation Title */}
          <div className="font-display font-black text-slate-800 text-base leading-snug tracking-tight">
            {card.title}
          </div>

          {/* Distinct Story/Question Card Box - Soft Indigo/Sky Gradient */}
          <div className="bg-gradient-to-br from-sky-50 to-blue-100/70 border-2 border-sky-200/80 p-3 rounded-2xl text-xs text-slate-800 font-body leading-relaxed font-semibold shadow-inner">
            <div className="text-[10px] uppercase tracking-wider font-extrabold text-sky-700 mb-1 flex items-center gap-1">
              <span>📖</span> Situasi:
            </div>
            {card.story}
          </div>

          <AnimatePresence>
            {flipped && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="pt-1 space-y-2"
              >
                <div className="text-[10px] uppercase tracking-wider font-extrabold text-amber-700 px-0.5 flex items-center gap-1">
                  <span>👉</span> Pilih Keputusanmu:
                </div>
                {card.choices.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      soundManager.playSFX('click')
                      if (c.moneyDelta > 0 || c.savingsDelta > 0) {
                        soundManager.playSFX('positive')
                      } else if (c.moneyDelta < 0 || c.savingsDelta < 0) {
                        soundManager.playSFX('negative')
                      }
                      onChoose(c.id)
                    }}
                    className="w-full text-left bg-gradient-to-r from-amber-50 via-yellow-50/80 to-amber-100/60 hover:from-amber-100 hover:to-yellow-100 border-2 border-amber-300/80 hover:border-amber-400 text-slate-900 font-display font-bold text-xs p-3 rounded-xl transition-all shadow-sm flex items-center justify-between group active:scale-[0.99] cursor-pointer"
                  >
                    <span className="leading-snug pr-2">{c.label}</span>
                    <span className="w-6 h-6 rounded-full bg-amber-400 text-blue-950 font-black text-xs flex items-center justify-center group-hover:scale-110 group-hover:bg-amber-500 transition-all shrink-0 shadow-xs">
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

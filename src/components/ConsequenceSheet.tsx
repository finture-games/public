import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { signRp } from '../lib/format'
import Button from './Button'
import type { CardChoice, DecisionRecord } from '../data/types'
import { useGameStore } from '../store/game'

export default function ConsequenceSheet({
  choice,
  decision,
  onContinue,
}: {
  choice: CardChoice
  decision: DecisionRecord
  onContinue: () => void
}) {
  const session = useGameStore((s) => s.session)
  const charId = session?.characterId ?? 'alep'
  const [displayMoney, setDisplayMoney] = useState(decision.moneyDelta)
  const [displaySavings, setDisplaySavings] = useState(decision.savingsDelta)
  const negative = decision.moneyDelta < 0 || decision.savingsDelta < 0

  let exprName = negative ? '3_sad' : '5_excited'
  if (!negative) {
    if (charId === 'angel') exprName = '5_confident'
    else if (charId === 'mamad') exprName = '5_friendly'
    else if (charId === 'alep' || charId === 'wawan') exprName = '5_focus'
  }
  const exprAvatarPath = `/characters/${charId}/${charId}_${exprName}.png`

  useEffect(() => {
    const start = performance.now()
    const dur = 900
    let raf = 0
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur)
      const eased = 1 - Math.pow(1 - p, 3)
      setDisplayMoney(Math.round(decision.moneyDelta * eased))
      setDisplaySavings(Math.round(decision.savingsDelta * eased))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [decision])

  return (
    <div className="absolute inset-x-0 bottom-0 z-40 px-3 pb-4 font-display">
      <motion.div
        initial={{ y: 120, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 120, opacity: 0 }}
        transition={{ type: 'spring', damping: 24, stiffness: 260 }}
        className={
          'rounded-card border-2 shadow-xl overflow-hidden bg-white ' +
          (negative ? 'border-danger/40' : 'border-success/40')
        }
      >
        <div
          className={
            'px-4 py-2 font-semibold text-white text-sm flex items-center justify-between ' +
            (negative ? 'bg-danger' : 'bg-success')
          }
        >
          <span>{negative ? 'Dampak Keputusanmu' : 'Keputusanmu Berdampak Baik!'}</span>
          <div className="w-8 h-8 rounded-full bg-white/20 border border-white/40 overflow-hidden flex items-center justify-center p-0.5 shrink-0">
            <img src={exprAvatarPath} alt="Ekspresi" className="w-full h-full object-contain object-bottom" />
          </div>
        </div>
        <div className="px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <span className="text-2xl">{negative ? '💸' : '🪙'}</span>
            <div className="flex flex-col">
              {decision.moneyDelta !== 0 && (
                <span className={negative ? 'text-danger' : 'text-success'}>
                  {signRp(displayMoney)} uang saku
                </span>
              )}
              {decision.savingsDelta !== 0 && (
                <span className={decision.savingsDelta < 0 ? 'text-danger' : 'text-save'}>
                  {signRp(displaySavings)} tabungan
                </span>
              )}
            </div>
          </div>
          <p className="mt-2 text-sm text-ink/80 leading-relaxed">{choice.explanation}</p>
          <Button className="mt-3 w-full" onClick={onContinue}>
            Lanjut
          </Button>
        </div>
      </motion.div>
    </div>
  )
}

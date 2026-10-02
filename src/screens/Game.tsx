import { useEffect, useRef, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import Board3D from '../components/Board3D'
import HUD from '../components/HUD'
import Dice from '../components/Dice'
import DecisionCard from '../components/DecisionCard'
import ConsequenceSheet from '../components/ConsequenceSheet'
import RiskWarning from '../components/RiskWarning'
import Button from '../components/Button'
import { useGameStore } from '../store/game'
import { BOARD, CHARACTERS, randomCardForType } from '../data/characters'
import { SCENARIO_CARDS } from '../data/cards'
import { formatRp } from '../lib/format'
import { isBrokeNow, needsBankruptChoice } from '../lib/engine'
import { soundManager } from '../lib/sound'

const ROLL_MS = 700
const LANDED_STATIONARY_PAUSE_MS = 400
const HOP_MS = 450

export default function Game() {
  const session = useGameStore((s) => s.session)
  const phase = useGameStore((s) => s.phase)
  const diceValue = useGameStore((s) => s.diceValue)
  const currentCard = useGameStore((s) => s.currentCard)
  const lastDecision = useGameStore((s) => s.lastDecision)
  const pendingRisk = useGameStore((s) => s.pendingRisk)
  const settings = useGameStore((s) => s.settings)
  const navigate = useGameStore((s) => s.navigate)

  const [paused, setPaused] = useState(false)
  const [isSpinning, setIsSpinning] = useState(false)
  const [muted, setMuted] = useState(() => soundManager.isMuted())
  const timers = useRef<number[]>([])

  useEffect(() => {
    const charId = session?.characterId || 'alep'
    soundManager.playBGMForCharacter(charId)
    const ts = timers.current
    return () => {
      ts.forEach((t) => clearTimeout(t))
    }
  }, [session?.characterId])

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Button onClick={() => navigate('home')}>Kembali ke Beranda</Button>
      </div>
    )
  }

  const ch = CHARACTERS.find((c) => c.id === session.characterId) ?? CHARACTERS[0]
  const reduceMotion = settings.reduceMotion

  function schedule(fn: () => void, ms: number) {
    const t = window.setTimeout(fn, ms)
    timers.current.push(t)
  }

  function clearTimers() {
    timers.current.forEach((t) => clearTimeout(t))
    timers.current = []
  }

  function resolveArrival() {
    const st = useGameStore.getState()
    const snap = st.session
    if (!snap) return
    if (snap.position >= 30) {
      st.endSession('finished')
      return
    }
    const type = BOARD[snap.position - 1].type
    if (isBrokeNow(snap, type)) {
      st.endSession('broke')
      return
    }
    if (type === 'gajian') {
      soundManager.playSFX('gajian_claim')
      st.triggerPayday(ch.weeklyAllowance)
      st.setPhase('idle')
      return
    }
    if (needsBankruptChoice(snap, type)) {
      st.setPhase('idle') // overlay bangkrut muncul lewat kondisi UI
      return
    }
    const card = randomCardForType(SCENARIO_CARDS, type, snap.usedCardIds, snap.characterId)
    if (!card) {
      st.setPhase('idle')
      return
    }
    st.drawCard(card)
  }

  function onRoll() {
    const st = useGameStore.getState()
    if (st.phase !== 'idle') return
    soundManager.playSFX('dice_roll')
    clearTimers()
    const value = roll()
    st.setDice(value)
    st.setPhase('rolling')
    setIsSpinning(true)

    // Step 1: 3D dice spins smoothly and decelerates over ROLL_MS (1100ms) directly to landed face
    schedule(() => {
      // Step 2: 3D dice comes to a dead stop on the table (isSpinning = false)
      setIsSpinning(false)

      // Step 3: Pause for 1.5s with the 3D dice completely motionless on screen
      schedule(() => {
        // Step 4: Now start character movement phase on board automatically
        const s2 = useGameStore.getState()
        s2.setPhase('moving')
        const snap = s2.session
        if (!snap) return
        const from = snap.position
        const to = Math.min(30, from + value)
        let step = from

        const hop = () => {
          const s3 = useGameStore.getState()
          if (!s3.session) return
          step += 1
          soundManager.playSFX('step')
          s3.moveTo(step)
          if (BOARD[step - 1].type === 'gajian' && step < to) {
            soundManager.playSFX('gajian_claim')
            s3.triggerPayday(ch.weeklyAllowance)
          }
          if (step >= to) {
            // Step 5: Pause 1.2s on target tile so player can see final location before card opens
            schedule(resolveArrival, reduceMotion ? 400 : 1200)
          } else {
            schedule(hop, reduceMotion ? 90 : HOP_MS)
          }
        }
        schedule(hop, reduceMotion ? 90 : HOP_MS)
      }, reduceMotion ? 300 : LANDED_STATIONARY_PAUSE_MS)
    }, reduceMotion ? 200 : ROLL_MS)
  }

  function roll(): 1 | 2 | 3 {
    const st = useGameStore.getState()
    const snap = st.session
    if (!snap) return 1

    const currentPos = snap.position
    const usedIds = snap.usedCardIds
    const charId = snap.characterId

    // Cari semua kartu khusus karakter yang BELUM pernah dijawab di sesi ini
    const unusedCharCards = SCENARIO_CARDS.filter(
      (c) => c.characterId === charId && !usedIds.includes(c.id),
    )

    if (unusedCharCards.length > 0) {
      const targetTileTypes = new Set(unusedCharCards.map((c) => c.tileType))
      const priorityValues: (1 | 2 | 3)[] = []
      const possibleSteps: (1 | 2 | 3)[] = [1, 2, 3]

      for (const step of possibleSteps) {
        const targetPos = Math.min(30, currentPos + step)
        if (targetPos <= 30) {
          const tileType = BOARD[targetPos - 1].type
          if (targetTileTypes.has(tileType)) {
            priorityValues.push(step)
          }
        }
      }

      // Jika ada langkah dadu yang akan mendarat di petak pertanyaan karakter yang belum dijawab, gunakan langkah tersebut!
      if (priorityValues.length > 0) {
        return priorityValues[Math.floor(Math.random() * priorityValues.length)]
      }
    }

    // Jika semua 6 kartu karakter sudah dijawab, dadu berjalan acak 1..3
    const r = Math.random()
    if (r < 0.33) return 1
    if (r < 0.66) return 2
    return 3
  }

  const bankruptOverlay =
    needsBankruptChoice(session, BOARD[session.position - 1].type) && phase === 'idle'

  return (
    <div className="absolute inset-0">
      <div className="absolute inset-0">
        <Board3D />
      </div>
      <HUD />
      <div className="absolute top-3.5 right-3.5 z-40 flex items-center gap-2">
        <button
          onClick={() => setPaused(true)}
          className="h-11 w-11 rounded-2xl bg-white/95 backdrop-blur-md border-2 border-primary/20 font-display font-bold text-ink shadow-md flex items-center justify-center hover:bg-sky active:scale-95 transition-all text-base cursor-pointer"
        >
          ⏸
        </button>
      </div>

      {(phase === 'idle' || phase === 'rolling') && !bankruptOverlay && (
        <div className="absolute bottom-6 inset-x-0 z-30 flex justify-center">
          <Dice
            rolling={isSpinning}
            value={diceValue}
            disabled={phase !== 'idle'}
            onRoll={onRoll}
          />
        </div>
      )}

      <AnimatePresence>
        {phase === 'card' && currentCard && (
          <DecisionCard
            key={currentCard.id}
            card={currentCard}
            reduceMotion={reduceMotion}
            onChoose={(choiceId) => useGameStore.getState().choose(choiceId)}
          />
        )}
        {phase === 'consequence' && currentCard && lastDecision && (
          <ConsequenceSheet
            key="consequence"
            choice={currentCard.choices.find((c) => c.id === lastDecision.choiceId)!}
            decision={lastDecision}
            onContinue={() => {
              const st = useGameStore.getState()
              if (st.session && st.session.position >= 30) {
                st.endSession('finished')
                return
              }
              st.setPhase('idle')
            }}
          />
        )}
      </AnimatePresence>

      {pendingRisk && phase === 'idle' && (
        <RiskWarning
          tileType={pendingRisk}
          decisions={session.decisions}
          onContinue={() => useGameStore.getState().dismissRisk()}
        />
      )}

      {bankruptOverlay && (
        <div className="absolute inset-0 z-50 bg-ink/70 flex items-end">
          <div className="w-full bg-white rounded-t-card p-5 space-y-3">
            <div className="text-4xl">🚨</div>
            <h3 className="font-display font-semibold text-xl text-ink">Uang saku kamu Rp0!</h3>
            <p className="text-sm text-ink/70 font-body">
              Tapi kamu punya tabungan {formatRp(session.savings)}. Kamu bisa memakai tabungan
              (Prioritas -8) atau mengakhiri sesi di sini.
            </p>
            <div className="flex gap-2">
              <Button
                className="flex-1"
                onClick={() => {
                  useGameStore.getState().useBankruptSavings()
                  useGameStore.getState().setPhase('idle')
                }}
              >
                Pakai tabungan
              </Button>
              <Button
                variant="danger"
                className="flex-1"
                onClick={() => useGameStore.getState().endSession('broke')}
              >
                Akhiri sesi
              </Button>
            </div>
          </div>
        </div>
      )}

      {paused && (
        <div className="absolute inset-0 z-50 bg-ink/70 flex items-end">
          <div className="w-full bg-white rounded-t-card p-5 space-y-3">
            <h3 className="font-display font-semibold text-xl text-ink text-center">Jeda</h3>
            <Button variant="ghost" className="w-full" onClick={() => setPaused(false)}>
              ▶️ Lanjutkan bermain
            </Button>
            <Button
              variant="ghost"
              className="w-full flex items-center justify-center gap-2"
              onClick={() => {
                const next = soundManager.toggleMute()
                setMuted(next)
              }}
            >
              {muted ? '🔊 Buka Suara (Unmute)' : '🔇 Matikan Suara (Mute)'}
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => {
                setPaused(false)
                navigate('rules')
              }}
            >
              📜 Peraturan bermain
            </Button>
            <Button
              variant="primary"
              className="w-full"
              onClick={() => {
                setPaused(false)
                navigate('home')
              }}
            >
              🏠 Keluar ke Beranda
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

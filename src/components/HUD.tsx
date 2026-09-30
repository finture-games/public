import { CHARACTERS } from '../data/characters'
import { formatRp } from '../lib/format'
import { targetPct } from '../lib/engine'
import { useGameStore } from '../store/game'
import PaydayParticles from './PaydayParticles'

const CHAR_THEMES: Record<string, { gradient: string; ribbon: string; border: string }> = {
  alep: {
    gradient: 'bg-gradient-to-br from-red-500 via-rose-600 to-red-800',
    ribbon: 'bg-red-600 text-white',
    border: 'border-red-400/40',
  },
  angel: {
    gradient: 'bg-gradient-to-br from-pink-400 via-pink-600 to-purple-700',
    ribbon: 'bg-pink-600 text-white',
    border: 'border-pink-400/40',
  },
  alea: {
    gradient: 'bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-800',
    ribbon: 'bg-purple-600 text-white',
    border: 'border-purple-400/40',
  },
  wawan: {
    gradient: 'bg-gradient-to-br from-emerald-400 via-green-600 to-teal-800',
    ribbon: 'bg-emerald-600 text-white',
    border: 'border-emerald-400/40',
  },
  mamad: {
    gradient: 'bg-gradient-to-br from-amber-400 via-orange-500 to-amber-700',
    ribbon: 'bg-amber-600 text-white',
    border: 'border-amber-400/40',
  },
}

export default function HUD() {
  const session = useGameStore((s) => s.session)
  const paydayTrigger = useGameStore((s) => s.paydayTrigger)
  const lastPaydayAmount = useGameStore((s) => s.lastPaydayAmount)

  if (!session) return null
  const ch = CHARACTERS.find((c) => c.id === session.characterId)
  if (!ch) return null

  const pct = targetPct(session.money, ch.targetAmount)
  const theme = CHAR_THEMES[ch.id] || CHAR_THEMES.alep

  return (
    <>
      {/* Flying Payday Suction Effect */}
      <PaydayParticles trigger={paydayTrigger} amount={lastPaydayAmount} />

      <div className="absolute top-2 left-2 right-12 z-30 pointer-events-none">
        <div className="pointer-events-auto inline-flex items-center bg-white/95 backdrop-blur-md rounded-2xl border-2 border-ink/15 p-1.5 shadow-[0_6px_16px_rgba(30,27,58,0.12)] max-w-[400px]">
          {/* 1. Left Character Avatar Box (With Unique Character Gradient) */}
          <div className={`relative h-12 w-12 rounded-xl ${theme.gradient} p-0.5 shadow-sm flex-shrink-0 transition-colors duration-300`}>
            <div className="h-full w-full rounded-[8px] bg-white/20 overflow-hidden relative border border-white/30">
              <img
                src={`/characters/${ch.id}/${ch.id}_1_normal.png`}
                alt={ch.name}
                className="h-full w-full object-cover object-top scale-125 translate-y-0.5 filter drop-shadow"
              />
            </div>
            {/* Bottom Name Ribbon */}
            <div className={`absolute -bottom-1 inset-x-0 ${theme.ribbon} font-display font-extrabold text-[8px] text-center rounded py-0.2 shadow-sm border border-white/40 truncate px-0.5 leading-tight`}>
              {ch.name}
            </div>
          </div>

          {/* 2. Middle Stats Stack (Tabungan/Hutang + Target Progress Bar + Target Goal Description) */}
          <div className="ml-2.5 pr-1.5 flex-1 space-y-1 min-w-[160px]">
            {/* Tabungan / Hutang Row */}
            <div className="flex items-center justify-between gap-1.5">
              <span
                className={
                  session.money < 0
                    ? 'bg-rose-100 border border-rose-300 text-rose-800 font-display font-extrabold text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider leading-none animate-pulse'
                    : 'bg-emerald-100 border border-emerald-300/80 text-emerald-800 font-display font-extrabold text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider leading-none'
                }
              >
                {session.money < 0 ? '⚠️ Hutang' : 'Tabungan'}
              </span>
              <span
                className={
                  session.money < 0
                    ? 'font-display font-black text-sm text-rose-600 tracking-wide drop-shadow-sm'
                    : 'font-display font-black text-sm text-emerald-600 tracking-wide drop-shadow-sm'
                }
              >
                {formatRp(session.money)}
              </span>
            </div>

            {/* Target Progress Bar */}
            <div className="w-full flex items-center gap-1.5">
              <div className="flex-1 h-2 rounded-full bg-sky border border-ink/10 overflow-hidden relative">
                <div
                  className="h-full bg-gradient-to-r from-secondary to-amber-500 rounded-full transition-all duration-500 shadow-sm"
                  style={{ width: `${Math.min(100, pct)}%` }}
                />
              </div>
              <span className="text-[10px] font-display font-black text-primary shrink-0">
                🎯 {Math.round(pct)}%
              </span>
            </div>

            {/* NEW: Target Description Label (Menjelaskan barang impian yang ingin dibeli) */}
            <div className="text-[9.5px] font-body font-semibold text-ink/75 truncate flex items-center gap-1 leading-none">
              <span className="opacity-70">Target:</span>
              <span className="font-bold text-ink truncate">{ch.targetName}</span>
              <span className="text-primary/90 font-bold text-[8.5px] shrink-0">({formatRp(ch.targetAmount)})</span>
            </div>
          </div>

          {/* 3. Right Day Badge (Compact Circle) */}
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-amber-400 via-secondary to-amber-500 border-2 border-white shadow-sm flex flex-col items-center justify-center text-ink flex-shrink-0 ml-0.5">
            <span className="text-[7px] font-display font-black uppercase leading-none opacity-80 tracking-tighter">HARI</span>
            <span className="font-display font-black text-[11px] leading-none tracking-tight">{session.day}/30</span>
          </div>
        </div>
      </div>
    </>
  )
}

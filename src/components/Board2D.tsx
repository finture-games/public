import { BOARD } from '../data/characters'
import { TILE_COLORS } from '../data/types'
import { useGameStore } from '../store/game'

export default function Board2D() {
  const position = useGameStore((s) => s.session?.position ?? 1)
  return (
    <div className="absolute inset-0 overflow-y-auto px-4 pt-20 pb-32">
      <div className="mx-auto max-w-[340px]">
        <div className="text-center font-display font-semibold text-ink/70 text-sm mb-3">
          Papan Mode Ringan (2D)
        </div>
        <div className="grid grid-cols-5 gap-2">
          {BOARD.map((t) => {
            const isCurrent = t.index === position
            return (
              <div
                key={t.index}
                className={
                  'relative flex flex-col items-center justify-center rounded-xl border-2 py-2 transition-all ' +
                  (isCurrent
                    ? 'border-secondary scale-110 shadow-chunky z-10'
                    : 'border-ink/10')
                }
                style={{ backgroundColor: TILE_COLORS[t.type] + '33' }}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: TILE_COLORS[t.type] }}
                />
                <span className="text-[10px] font-bold text-ink/70 mt-0.5">{t.index}</span>
                {isCurrent && <span className="absolute -top-3 text-lg">pawn</span>}
              </div>
            )
          })}
        </div>
        <div className="mt-4 text-center text-xs text-ink/50 font-body">
          Finis di petak 30! 🏁
        </div>
      </div>
    </div>
  )
}

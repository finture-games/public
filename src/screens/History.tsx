import { CHARACTERS } from '../data/characters'
import { useGameStore } from '../store/game'
import { formatScore } from '../lib/format'
import Button from '../components/Button'

export default function History() {
  const navigate = useGameStore((s) => s.navigate)
  const history = useGameStore((s) => s.history)

  return (
    <div className="min-h-screen flex flex-col px-5 py-7 gap-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('home')}
          className="text-sm font-semibold text-ink/60 font-body"
        >
          ← Beranda
        </button>
        <h1 className="font-display font-bold text-xl text-ink">Riwayat</h1>
        <div className="w-14" />
      </div>

      {history.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center">
          <div className="text-5xl">🏆</div>
          <p className="font-body text-sm text-ink/60">
            Belum ada sesi selesai. Main dulu, nanti rekamannya muncul di sini!
          </p>
          <Button onClick={() => navigate('character')}>Main Sekarang</Button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {history.map((h) => {
            const ch = CHARACTERS.find((c) => c.id === h.characterId)
            return (
              <div
                key={h.id + h.date}
                className="rounded-card bg-white border-2 border-ink/10 p-3.5 font-body"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{ch?.emoji ?? '🎲'}</span>
                    <div>
                      <div className="font-display font-semibold text-ink text-sm">
                        {ch?.name ?? 'Petualang'}
                      </div>
                      <div className="text-[11px] text-ink/50">
                        {new Date(h.date).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={
                        'font-display font-bold text-xl ' +
                        (h.score >= 80
                          ? 'text-success'
                          : h.score >= 60
                            ? 'text-primary'
                            : h.score >= 40
                              ? 'text-secondary'
                              : 'text-danger')
                      }
                    >
                      {formatScore(h.score)}
                    </div>
                    <div className="text-[11px] text-ink/50 font-semibold">
                      {h.profileLabel}
                    </div>
                  </div>
                </div>
                <div className="mt-2 text-[11px] text-ink/60 flex justify-between">
                  <span>
                    {h.targetReached ? '✅' : '❌'} Target {h.targetName}
                  </span>
                  <span>{h.decisionsCount} keputusan</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

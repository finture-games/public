import { useEffect } from 'react'
import { CHARACTERS } from '../data/characters'
import { LEARNING_MATERIALS } from '../data/materials'
import { ASPECT_LABEL, ASPECT_LIST } from '../data/types'
import { formatRp } from '../lib/format'
import { weakestAspect } from '../lib/engine'
import { useGameStore } from '../store/game'
import { soundManager } from '../lib/sound'
import RadarChart from '../components/RadarChart'
import Button from '../components/Button'

export default function Evaluation() {
  const navigate = useGameStore((s) => s.navigate)
  const session = useGameStore((s) => s.session)
  const history = useGameStore((s) => s.history)
  const summary = history[0]

  useEffect(() => {
    soundManager.playSFX('win')
  }, [])

  if (!summary || !session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 px-6 text-center">
        <div className="text-5xl">📊</div>
        <p className="font-body text-sm text-ink/60">
          Belum ada data evaluasi. Selesaikan satu sesi permainan dulu, ya!
        </p>
        <Button onClick={() => navigate('home')}>Kembali ke Beranda</Button>
      </div>
    )
  }

  const ch = CHARACTERS.find((c) => c.id === session.characterId) ?? CHARACTERS[0]
  const worst = weakestAspect(summary.aspectScores)
  const material = LEARNING_MATERIALS.find((m) => m.aspect === worst)
  const best = ASPECT_LIST.reduce((a, b) =>
    summary.aspectScores[a] >= summary.aspectScores[b] ? a : b,
  )

  return (
    <div className="min-h-screen flex flex-col px-5 py-7 gap-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('home')}
          className="text-sm font-semibold text-ink/60 font-body"
        >
          ← Beranda
        </button>
        <h1 className="font-display font-bold text-xl text-ink">Evaluasi</h1>
        <div className="w-14" />
      </div>

      <div className="rounded-card bg-white border-2 border-ink/10 shadow p-3">
        <RadarChart scores={summary.aspectScores} />
      </div>

      <div className="rounded-card border-2 p-4 text-center bg-white border-ink/10">
        <div className="text-[11px] uppercase tracking-wide text-ink/50 font-semibold font-body">
          Profil Finansial Kamu
        </div>
        <div className="mt-1 font-display font-bold text-2xl text-primary">
          {summary.profileLabel}
        </div>
        <div className="mt-1 font-body text-sm text-ink/70">
          Skor total <b className="text-ink">{Math.round(summary.score)}/100</b>
        </div>
      </div>

      <div className="rounded-card bg-white border-2 border-ink/10 p-4 font-body text-sm space-y-1.5">
        {ASPECT_LIST.map((a) => (
          <div key={a} className="flex items-center gap-2">
            <span className="w-40 shrink-0 text-ink/70">{ASPECT_LABEL[a]}</span>
            <div className="flex-1 h-2.5 rounded-full bg-sky overflow-hidden">
              <div
                className={
                  'h-full rounded-full ' +
                  (a === worst ? 'bg-danger' : a === best ? 'bg-success' : 'bg-primary')
                }
                style={{ width: Math.round(summary.aspectScores[a]) + '%' }}
              />
            </div>
            <b className="w-8 text-right text-ink">{Math.round(summary.aspectScores[a])}</b>
          </div>
        ))}
      </div>

      <div className="rounded-card bg-white border-2 border-ink/10 p-4 font-body text-sm">
        <div className="text-[11px] uppercase tracking-wide text-ink/50 font-semibold">
          Kekuatanmu
        </div>
        <p className="mt-1 text-ink/80">
          <b>{ASPECT_LABEL[best]}</b> paling menonjol. Pertahankan kebiasaan ini, ya!
        </p>
      </div>

      {material && (
        <div className="rounded-card bg-white border-2 border-primary/30 p-4 font-body">
          <div className="text-[11px] uppercase tracking-wide text-primary font-semibold">
            Materi untuk aspek terlemahmu
          </div>
          <h3 className="mt-1 font-display font-semibold text-ink">{material.title}</h3>
          <p className="mt-2 text-sm text-ink/80 leading-relaxed">{material.body}</p>
          <div className="mt-3 rounded-chunky bg-secondary/15 border border-secondary px-3 py-2">
            <b className="text-ink text-sm">💡 Tips praktis:</b>
            <p className="text-sm text-ink/80">{material.tip}</p>
          </div>
        </div>
      )}

      <div className="rounded-card bg-white border-2 border-ink/10 p-4 font-body text-sm">
        <div className="text-[11px] uppercase tracking-wide text-ink/50 font-semibold">
          Ringkasan Sesi
        </div>
        <div className="mt-1 flex justify-between">
          <span className="text-ink/60">Target {ch.targetName}</span>
          <b className={summary.targetReached ? 'text-success' : 'text-danger'}>
            {summary.targetReached ? 'Tercapai ✅' : 'Belum tercapai ❌'}
          </b>
        </div>
        <div className="flex justify-between">
          <span className="text-ink/60">Tabungan akhir</span>
          <b className="text-save">{formatRp(summary.savings)}</b>
        </div>
        <div className="flex justify-between">
          <span className="text-ink/60">Jumlah keputusan</span>
          <b className="text-ink">{summary.decisionsCount}</b>
        </div>
      </div>

      <Button className="w-full" onClick={() => navigate('home')}>
        Selesai — Kembali ke Beranda
      </Button>
    </div>
  )
}

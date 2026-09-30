import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CHARACTERS } from '../data/characters'
import { useGameStore } from '../store/game'
import { formatRp } from '../lib/format'
import Button from '../components/Button'

export default function Result() {
  const navigate = useGameStore((s) => s.navigate)
  const session = useGameStore((s) => s.session)
  const history = useGameStore((s) => s.history)
  const setReflection = useGameStore((s) => s.setReflection)
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Button onClick={() => navigate('home')}>Kembali ke Beranda</Button>
      </div>
    )
  }
  const ch = CHARACTERS.find((c) => c.id === session.characterId) ?? CHARACTERS[0]
  const summary = history[0]
  const targetReached = session.money >= ch.targetAmount
  const broke = session.status === 'broke'
  const celebrate = targetReached && !broke

  return (
    <div className="min-h-screen flex flex-col px-5 py-8 gap-4">
      {celebrate && <Confetti />}
      <div className="text-center mt-2">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 12 }}
          className="text-6xl"
        >
          {broke ? '😵' : targetReached ? '🎉' : '😅'}
        </motion.div>
        <h1 className="mt-2 font-display font-bold text-2xl text-ink">
          {broke
            ? 'Saldo habis!'
            : targetReached
              ? 'Target tercapai!'
              : 'Sesi selesai'}
        </h1>
        <p className="mt-1 text-sm text-ink/70 font-body">
          {broke
            ? 'Tidak apa-apa — gagal itu bagian dari latihan. Coba strategi baru!'
            : targetReached
              ? 'Kamu berhasil capai ' + ch.targetName + ' dalam 30 hari. Keren!'
              : 'Target belum tercapai, tapi perjalananmu tetap berharga. Coba lagi!'}
        </p>
      </div>

      <div className="rounded-card bg-white border-2 border-ink/10 shadow p-4 space-y-2 font-body text-sm">
        <Row label="Karakter" value={ch.emoji + ' ' + ch.name} />
        <Row label="Tabungan Tersisa" value={formatRp(session.money)} highlight />
        <Row
          label={`Target: ${ch.targetName}`}
          value={formatRp(ch.targetAmount) + (targetReached ? ' ✅' : ' ❌')}
        />
        {summary && (
          <>
            <Row
              label="Skor total"
              value={Math.round(summary.score) + ' / 100'}
              highlight
            />
            <Row label="Profil" value={summary.profileLabel} />
            <Row label="Keputusan diambil" value={String(summary.decisionsCount)} />
          </>
        )}
      </div>

      <Button
        className="w-full"
        onClick={() => {
          setReflection('momen', '')
          setReflection('pilihan', '')
          setReflection('isian', '')
          navigate('reflection')
        }}
      >
        Lanjut ke Refleksi
      </Button>
    </div>
  )
}

function Row({
  label,
  value,
  highlight,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-ink/60">{label}</span>
      <b className={highlight ? 'text-secondary' : 'text-ink'}>{value}</b>
    </div>
  )
}

function Confetti() {
  const [pieces] = useState(() =>
    Array.from({ length: 40 }).map(() => ({
      left: Math.random() * 100,
      delay: Math.random() * 1.2,
      dur: 2 + Math.random() * 1.5,
      color: ['#5B3FFF', '#FFB020', '#22C55E', '#F43F5E', '#3B82F6'][
        Math.floor(Math.random() * 5)
      ],
      size: 6 + Math.random() * 6,
    })),
  )
  const [on, setOn] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setOn(true), 100)
    return () => clearTimeout(t)
  }, [])
  if (!on) return null
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-20">
      {pieces.map((p, i) => (
        <motion.div
          key={i}
          initial={{ y: -30, opacity: 1, rotate: 0 }}
          animate={{ y: '110vh', opacity: 0.9, rotate: 360 }}
          transition={{ duration: p.dur, delay: p.delay, ease: 'linear' }}
          className="absolute rounded-sm"
          style={{
            left: p.left + '%',
            width: p.size,
            height: p.size * 0.6,
            backgroundColor: p.color,
          }}
        />
      ))}
    </div>
  )
}

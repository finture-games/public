import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CHARACTERS } from '../data/characters'
import { LEARNING_MATERIALS } from '../data/materials'
import { ASPECT_LABEL, ASPECT_LIST, Aspect } from '../data/types'
import { assetUrl, formatRp } from '../lib/format'
import { weakestAspect } from '../lib/engine'
import { useGameStore } from '../store/game'
import { soundManager } from '../lib/sound'
import Button from '../components/Button'

export default function Evaluation() {
  const navigate = useGameStore((s) => s.navigate)
  const session = useGameStore((s) => s.session)
  const history = useGameStore((s) => s.history)
  const [copied, setCopied] = useState(false)

  const summary = history[0]

  useEffect(() => {
    soundManager.playSFX('win')
  }, [])

  if (!summary || !session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 px-6 text-center bg-sky-50 font-body">
        <div className="text-6xl animate-bounce">📊</div>
        <p className="font-semibold text-slate-600">
          Belum ada data evaluasi. Selesaikan satu sesi permainan dulu, ya!
        </p>
        <Button onClick={() => navigate('home')}>Kembali ke Beranda</Button>
      </div>
    )
  }

  const ch = CHARACTERS.find((c) => c.id === session.characterId) ?? CHARACTERS[0]
  const worst = weakestAspect(summary.aspectScores)
  const material = LEARNING_MATERIALS.find((m) => m.aspect === worst)

  const roundedScore = Math.round(summary.score)
  let letterGrade = 'B'
  let scoreSubtitle = 'Kamu sudah menunjukkan dirimu yang luar biasa!'

  if (roundedScore >= 90) {
    letterGrade = 'A+'
    scoreSubtitle = 'Luar biasa! Hasil finansialmu sangat menginspirasi!'
  } else if (roundedScore >= 80) {
    letterGrade = 'A-'
    scoreSubtitle = 'Kamu sudah menunjukkan dirimu yang luar biasa!'
  } else if (roundedScore >= 70) {
    letterGrade = 'B+'
    scoreSubtitle = 'Sangat baik! Terus pertahankan pengelolaan finansialmu!'
  } else if (roundedScore >= 60) {
    letterGrade = 'B'
    scoreSubtitle = 'Cukup baik! Ada beberapa aspek yang bisa ditingkatkan.'
  } else {
    letterGrade = 'C'
    scoreSubtitle = 'Belajar dari pengalaman & tetap semangat mencoba lagi!'
  }

  const getAspectIcon = (aspect: Aspect) => {
    switch (aspect) {
      case 'kebutuhanVsKeinginan':
        return '💬'
      case 'kendaliImpuls':
        return '💡'
      case 'tahanFomo':
        return '❤️'
      case 'prioritas':
        return '🎯'
      case 'menabung':
        return '💰'
      default:
        return '⭐'
    }
  }

  const handleShare = async () => {
    const text = `🏆 Skor Finansial Finture Saya: ${roundedScore} (${letterGrade}) - ${summary.profileLabel}!\nTarget ${ch.targetName}: ${summary.targetReached ? 'Tercapai ✅' : 'Belum Tercapai ❌'}.\nAyo mainkan Finture!`

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Hasil Evaluasi Finture',
          text,
          url: window.location.href,
        })
        return
      } catch {
        // Fallback to clipboard
      }
    }

    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-400 via-sky-200 to-sky-100 flex flex-col items-center justify-start pb-12 font-body select-none">
      {/* Top Mobile Container */}
      <div className="w-full max-w-md px-4 pt-5 flex flex-col gap-4">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between z-10">
          <button
            onClick={() => navigate('home')}
            className="px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-sky-900 font-bold text-xs shadow-sm border border-white/60 hover:bg-white active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
          >
            ← Beranda
          </button>
          <span className="font-black text-white text-sm tracking-wide drop-shadow-md">
            RESULT & EVALUATION
          </span>
          <div className="w-16" />
        </div>

        {/* Brand Header Banner */}
        <div className="flex flex-col items-center text-center -mt-1">
          <div className="flex items-center gap-1.5">
            <span className="font-black text-2xl tracking-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
              FINTURE
            </span>
            <span className="text-[10px] bg-yellow-400 text-slate-900 font-black px-2 py-0.5 rounded-full shadow-sm uppercase">
              Play • Learn • Grow
            </span>
          </div>

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mt-2 inline-flex items-center gap-1.5 bg-gradient-to-r from-yellow-300 via-amber-300 to-yellow-400 border-2 border-white px-4 py-1.5 rounded-full shadow-lg text-slate-900 font-black text-xs uppercase tracking-wide"
          >
            <span>👑 Selamat! Perjuangan Selesai!</span>
          </motion.div>
        </div>

        {/* Hero Group Characters Banner (Using existing assets) */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="relative w-full h-44 rounded-2xl overflow-hidden bg-gradient-to-b from-sky-300/40 via-sky-200/50 to-white/90 border-2 border-white/80 shadow-md flex items-end justify-center pt-2 px-2"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-200/30 via-transparent to-transparent pointer-events-none" />

          {/* 5 Character Overlapping Avatars */}
          <div className="flex items-end justify-center -space-x-4 z-10 w-full h-full pb-0">
            {CHARACTERS.map((charItem, idx) => (
              <motion.img
                key={charItem.id}
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 + idx * 0.06 }}
                src={assetUrl(`/characters/${charItem.id}/${charItem.id}_half.png`)}
                alt={charItem.name}
                className={`h-36 sm:h-40 object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.25)] ${
                  charItem.id === ch.id
                    ? 'z-20 scale-110 filter brightness-105'
                    : 'z-10 opacity-90 hover:opacity-100'
                }`}
              />
            ))}
          </div>
        </motion.div>

        {/* Skor Parameter Card Container */}
        <motion.div
          initial={{ y: 25, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="w-full bg-white/95 backdrop-blur-md rounded-3xl border-4 border-white p-5 shadow-[0_15px_35px_rgba(14,165,233,0.2)] flex flex-col gap-4 relative"
        >
          {/* Section Header Pill */}
          <div className="self-center -mt-8 bg-sky-500 text-white font-black text-xs px-4 py-1.5 rounded-full border-2 border-white shadow-md flex items-center gap-1 uppercase tracking-wider">
            <span>⚡ Skor Parameter</span>
          </div>

          {/* Main Score Hero Badge */}
          <div className="flex flex-col items-center text-center pt-1">
            <div className="flex items-center gap-3">
              {/* Cute Golden Star Badge */}
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 border-2 border-white shadow-md flex items-center justify-center text-3xl animate-pulse">
                ⭐
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-slate-800 tracking-tight">
                  {roundedScore}
                </span>
                <span className="text-3xl font-black text-emerald-600">
                  {letterGrade}
                </span>
              </div>
            </div>

            <p className="mt-2 text-xs font-bold text-slate-600 max-w-[260px] leading-snug">
              {scoreSubtitle}
            </p>

            <div className="mt-2 inline-block px-3 py-1 bg-sky-100 text-sky-800 font-extrabold text-xs rounded-full border border-sky-200">
              Profil: {summary.profileLabel}
            </div>
          </div>

          {/* Parameter Breakdown List */}
          <div className="flex flex-col gap-2.5 pt-2 border-t border-slate-100">
            {ASPECT_LIST.map((aspect) => {
              const scoreVal = Math.round(summary.aspectScores[aspect])
              const icon = getAspectIcon(aspect)
              const label = ASPECT_LABEL[aspect]

              return (
                <div
                  key={aspect}
                  className="flex items-center justify-between bg-slate-50 border border-slate-200/80 rounded-2xl px-3.5 py-2.5 hover:bg-sky-50/60 transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-base shadow-sm">
                      {icon}
                    </div>
                    <span className="font-bold text-xs text-slate-700">
                      {label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 sm:w-24 h-2.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          aspect === worst
                            ? 'bg-rose-500'
                            : scoreVal >= 80
                            ? 'bg-emerald-500'
                            : 'bg-sky-500'
                        }`}
                        style={{ width: `${scoreVal}%` }}
                      />
                    </div>
                    <span className="font-black text-xs text-slate-800 w-6 text-right">
                      {scoreVal}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* Mentor Advice Card (Pesan untukmu) */}
        <motion.div
          initial={{ y: 25, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="w-full bg-white/95 backdrop-blur-md rounded-3xl border-4 border-white p-4 shadow-md flex flex-col gap-3 relative"
        >
          <div className="self-start bg-amber-400 text-slate-900 font-black text-[11px] px-3 py-1 rounded-full border border-amber-300 shadow-sm flex items-center gap-1 uppercase tracking-wider">
            <span>⚡ Pesan Untukmu</span>
          </div>

          <div className="flex items-start gap-3">
            {/* Mentor / Selected Character Avatar */}
            <img
              src={assetUrl(`/characters/${ch.id}/${ch.id}_half.png`)}
              alt={ch.name}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-sky-300 shadow-sm shrink-0 bg-sky-100"
            />
            {/* Speech Bubble */}
            <div className="flex-1 bg-sky-50 border border-sky-200 rounded-2xl p-3 text-xs font-semibold text-slate-700 relative leading-relaxed">
              <div className="absolute top-4 -left-2 w-3 h-3 bg-sky-50 border-b border-l border-sky-200 rotate-45" />
              "{material?.tip || 'Kamu sudah melakukan yang terbaik! Teruslah menjadi versi terbaik dari dirimu ya!'}"
              <div className="mt-1.5 font-bold text-[11px] text-sky-800 text-right">
                — Kakak Mentor ({ch.name})
              </div>
            </div>
          </div>
        </motion.div>

        {/* Summary Details */}
        <div className="w-full bg-white/80 rounded-2xl p-3.5 border border-white flex justify-around text-center text-xs font-bold text-slate-700">
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-extrabold">Target {ch.targetName}</div>
            <div className={summary.targetReached ? 'text-emerald-600 font-black' : 'text-rose-600 font-black'}>
              {summary.targetReached ? 'Tercapai ✅' : 'Belum ❌'}
            </div>
          </div>
          <div className="w-px bg-slate-200" />
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-extrabold">Tabungan Akhir</div>
            <div className="text-amber-700 font-black">{formatRp(summary.savings)}</div>
          </div>
          <div className="w-px bg-slate-200" />
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-extrabold">Keputusan</div>
            <div className="text-sky-700 font-black">{summary.decisionsCount} Kali</div>
          </div>
        </div>

        {/* Social Share & Action CTAs */}
        <div className="flex flex-col gap-2.5 pt-2">
          <button
            onClick={handleShare}
            className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 text-white font-black text-sm uppercase tracking-wider shadow-[0_4px_0_#059669] active:shadow-[0_1px_0_#059669] active:translate-y-1 border-2 border-emerald-200 hover:brightness-105 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>📸</span>
            <span>{copied ? 'Tersalin ke Clipboard! ✨' : 'Bagikan Skor ke Sosmed'}</span>
          </button>

          <button
            onClick={() => navigate('home')}
            className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-sky-500 via-blue-500 to-sky-600 text-white font-black text-sm uppercase tracking-wider shadow-[0_4px_0_#1D4ED8] active:shadow-[0_1px_0_#1D4ED8] active:translate-y-1 border-2 border-sky-300 hover:brightness-105 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>🏠 Kembali ke Beranda</span>
          </button>
        </div>
      </div>
    </div>
  )
}

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

  // Robust summary selection with store fallback
  const summary = history.length > 0 ? history[0] : null

  useEffect(() => {
    soundManager.playSFX('win')
  }, [])

  if (!summary || !session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center bg-slate-50 font-body">
        <div className="w-16 h-16 rounded-3xl bg-sky-100 border border-sky-200 flex items-center justify-center text-3xl shadow-sm">
          📊
        </div>
        <div className="space-y-1">
          <h2 className="font-display font-bold text-lg text-slate-800">
            Belum Ada Data Evaluasi
          </h2>
          <p className="font-body text-xs text-slate-500 max-w-xs">
            Selesaikan satu sesi permainan di Finture untuk melihat ringkasan evaluasi finansialmu.
          </p>
        </div>
        <Button onClick={() => navigate('home')}>Kembali ke Beranda</Button>
      </div>
    )
  }

  const ch = CHARACTERS.find((c) => c.id === session.characterId) ?? CHARACTERS[0]
  
  // Pick exactly 3 characters for the hero banner to prevent cropping:
  // Active character in center, and 2 side companions
  const otherChars = CHARACTERS.filter((c) => c.id !== ch.id)
  const heroDisplayChars = [
    otherChars[0] ?? CHARACTERS[1],
    ch, // Center active character
    otherChars[1] ?? CHARACTERS[2],
  ]

  const worst = weakestAspect(summary.aspectScores)
  const material = LEARNING_MATERIALS.find((m) => m.aspect === worst)

  const roundedScore = Math.round(summary.score || 0)
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
    <div className="min-h-screen bg-gradient-to-b from-sky-400 via-sky-100 to-slate-50 flex flex-col items-center justify-start pb-14 font-body select-none">
      {/* Container Box */}
      <div className="w-full max-w-md px-4 pt-5 flex flex-col gap-4">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between z-10">
          <button
            onClick={() => navigate('home')}
            className="px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-slate-700 font-bold text-xs shadow-sm border border-slate-200/80 hover:bg-white active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
          >
            ← Beranda
          </button>
          <span className="font-display font-black text-white text-xs tracking-wider uppercase drop-shadow-sm">
            Hasil & Evaluasi
          </span>
          <div className="w-16" />
        </div>

        {/* Brand Header Banner */}
        <div className="flex flex-col items-center text-center -mt-1">
          <div className="flex items-center gap-1.5">
            <span className="font-black text-2xl tracking-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)]">
              FINTURE
            </span>
            <span className="text-[10px] bg-amber-400 text-slate-900 font-extrabold px-2 py-0.5 rounded-full shadow-sm uppercase">
              Play • Learn • Grow
            </span>
          </div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mt-2 inline-flex items-center gap-1.5 bg-white border border-slate-200 px-4 py-1.5 rounded-full shadow-sm text-slate-800 font-bold text-xs"
          >
            <span>👑 Selamat! Perjuangan Selesai!</span>
          </motion.div>
        </div>

        {/* Hero Group Characters Banner (Exactly 3 characters, uncropped) */}
        <motion.div
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.35 }}
          className="relative w-full h-44 rounded-3xl overflow-hidden bg-gradient-to-b from-sky-200/60 via-sky-100 to-white border-2 border-white shadow-md flex items-end justify-center pt-2 px-4"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-100/40 via-transparent to-transparent pointer-events-none" />

          {/* 3 Character Uncropped Display */}
          <div className="flex items-end justify-center gap-2 z-10 w-full h-full pb-0">
            {heroDisplayChars.map((charItem, idx) => {
              const isMain = charItem.id === ch.id
              return (
                <motion.img
                  key={`hero-${charItem.id}-${idx}`}
                  initial={{ y: 25, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.08 + idx * 0.08 }}
                  src={assetUrl(`/characters/${charItem.id}/${charItem.id}_half.png`)}
                  alt={charItem.name}
                  className={`object-contain transition-all duration-300 ${
                    isMain
                      ? 'h-40 sm:h-44 z-20 scale-105 filter drop-shadow-[0_6px_10px_rgba(0,0,0,0.2)]'
                      : 'h-32 sm:h-36 z-10 opacity-80 filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.15)]'
                  }`}
                />
              )
            })}
          </div>
        </motion.div>

        {/* Skor Parameter Card Container */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="w-full bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xl shadow-slate-200/60 flex flex-col gap-4 relative"
        >
          {/* Section Header Pill */}
          <div className="self-center -mt-8 bg-slate-900 text-white font-bold text-xs px-4 py-1.5 rounded-full border-2 border-white shadow-sm flex items-center gap-1.5 uppercase tracking-wider">
            <span>⚡ Skor Parameter</span>
          </div>

          {/* Main Score Hero Badge */}
          <div className="flex flex-col items-center text-center pt-1">
            <div className="flex items-center gap-3">
              {/* Cute Golden Star Badge */}
              <div className="w-13 h-13 rounded-2xl bg-amber-400 border-2 border-white shadow-sm flex items-center justify-center text-2xl">
                ⭐
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-slate-900 tracking-tight">
                  {roundedScore}
                </span>
                <span className="text-3xl font-black text-emerald-600">
                  {letterGrade}
                </span>
              </div>
            </div>

            <p className="mt-2 text-xs font-semibold text-slate-600 max-w-[260px] leading-relaxed">
              {scoreSubtitle}
            </p>

            <div className="mt-2.5 inline-block px-3 py-1 bg-slate-100 text-slate-800 font-extrabold text-xs rounded-full border border-slate-200">
              Profil Finansial: {summary.profileLabel}
            </div>
          </div>

          {/* Parameter Breakdown List */}
          <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
            {ASPECT_LIST.map((aspect) => {
              const scoreVal = Math.round(summary.aspectScores?.[aspect] || 0)
              const icon = getAspectIcon(aspect)
              const label = ASPECT_LABEL[aspect]

              return (
                <div
                  key={aspect}
                  className="flex items-center justify-between bg-slate-50/80 border border-slate-200/70 rounded-2xl px-3.5 py-2.5 hover:bg-slate-100/60 transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-sm shadow-2xs">
                      {icon}
                    </div>
                    <span className="font-semibold text-xs text-slate-700">
                      {label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 sm:w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
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
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="w-full bg-white rounded-3xl border border-slate-200/90 p-4 shadow-md flex flex-col gap-3 relative"
        >
          <div className="self-start bg-amber-400 text-slate-900 font-extrabold text-[11px] px-3 py-1 rounded-full shadow-2xs flex items-center gap-1 uppercase tracking-wider">
            <span>⚡ Pesan Untukmu</span>
          </div>

          <div className="flex items-start gap-3">
            {/* Mentor / Selected Character Avatar */}
            <img
              src={assetUrl(`/characters/${ch.id}/${ch.id}_half.png`)}
              alt={ch.name}
              className="w-13 h-13 rounded-2xl object-cover border border-slate-200 shadow-2xs shrink-0 bg-slate-100"
            />
            {/* Speech Bubble */}
            <div className="flex-1 bg-slate-50 border border-slate-200/80 rounded-2xl p-3 text-xs font-medium text-slate-700 relative leading-relaxed">
              "{material?.tip || 'Kamu sudah melakukan yang terbaik! Teruslah menjadi versi terbaik dari dirimu ya!'}"
              <div className="mt-1.5 font-bold text-[11px] text-slate-900 text-right">
                — Mentor ({ch.name})
              </div>
            </div>
          </div>
        </motion.div>

        {/* Summary Details */}
        <div className="w-full bg-white rounded-2xl p-3.5 border border-slate-200/80 flex justify-around text-center text-xs font-bold text-slate-700 shadow-2xs">
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-extrabold">Target {ch.targetName}</div>
            <div className={summary.targetReached ? 'text-emerald-600 font-black' : 'text-rose-600 font-black'}>
              {summary.targetReached ? 'Tercapai ✅' : 'Belum ❌'}
            </div>
          </div>
          <div className="w-px bg-slate-200" />
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-extrabold">Tabungan Akhir</div>
            <div className="text-amber-700 font-black">{formatRp(summary.savings || 0)}</div>
          </div>
          <div className="w-px bg-slate-200" />
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-extrabold">Keputusan</div>
            <div className="text-sky-700 font-black">{summary.decisionsCount || 0} Kali</div>
          </div>
        </div>

        {/* Sleek Modern Premium Action CTAs (Clean, Non-Cheesy AI Style) */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col gap-2.5 pt-1"
        >
          {/* Share Button: Sleek Dark Slate Theme */}
          <button
            onClick={handleShare}
            className="w-full py-3.5 px-5 rounded-2xl bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white font-bold text-sm tracking-wide shadow-lg shadow-slate-900/20 border border-slate-700 transition-all cursor-pointer flex items-center justify-center gap-2.5"
          >
            <svg
              className="w-4 h-4 text-amber-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
              />
            </svg>
            <span>{copied ? 'Link Tersalin ke Clipboard! ✨' : 'Bagikan Hasil Evaluasi'}</span>
          </button>

          {/* Home Button: Clean White Glassmorphism Outline */}
          <button
            onClick={() => navigate('home')}
            className="w-full py-3.5 px-5 rounded-2xl bg-white hover:bg-slate-50 active:scale-[0.98] text-slate-800 font-bold text-sm tracking-wide shadow-sm border border-slate-200 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <svg
              className="w-4 h-4 text-slate-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            <span>Kembali ke Beranda</span>
          </button>
        </motion.div>
      </div>
    </div>
  )
}

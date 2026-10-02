import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useGameStore } from '../store/game'
import { CHARACTERS } from '../data/characters'
import Board3D from '../components/Board3D'
import { formatRp, assetUrl } from '../lib/format'
import { soundManager } from '../lib/sound'

export default function Home() {
  const navigate = useGameStore((s) => s.navigate)
  const session = useGameStore((s) => s.session)
  const abandonSession = useGameStore((s) => s.abandonSession)
  const profile = useGameStore((s) => s.profile)
  const authUser = useGameStore((s) => s.authUser)
  const [confirmNew, setConfirmNew] = useState(false)
  const hasActive = session?.status === 'active'

  useEffect(() => {
    soundManager.playBGM('menu')
  }, [])

  // Find character from active session, fallback to Alep as default showcase
  const activeChar = (session?.characterId
    ? CHARACTERS.find((c) => c.id === session.characterId)
    : CHARACTERS[0]) ?? CHARACTERS[0]

  const charAvatarPath = activeChar
    ? activeChar.avatar ? assetUrl(activeChar.avatar) : assetUrl(`/characters/${activeChar.id}/${activeChar.id}_1_normal.png`)
    : assetUrl(`/characters/alep/alep_1_normal.png`)

  return (
    <div className="relative w-full h-[100dvh] min-h-[100dvh] flex flex-col justify-between items-center px-4 py-4 overflow-x-hidden overflow-y-auto font-display select-none">
      {/* Background Image - Full Viewport Cover */}
      <img
        src={assetUrl('/theme/background.jpeg')}
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover object-center z-0 pointer-events-none"
      />

      {/* Floating Animated Money Bills */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: -30, opacity: 0, rotate: 0 }}
            animate={{
              y: [0, 850],
              opacity: [0, 0.7, 0.7, 0],
              rotate: [0, i % 2 === 0 ? 140 : -140],
            }}
            transition={{
              duration: 7 + (i % 3) * 2,
              repeat: Infinity,
              delay: i * 1.1,
              ease: 'linear',
            }}
            style={{ left: `${6 + i * 12}%` }}
            className="absolute top-0 text-2xl opacity-60 select-none"
          >
            💵
          </motion.div>
        ))}
      </div>

      {/* Main Container */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-[360px] my-auto gap-3.5 py-2">
        {/* Header Logo Badge */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', damping: 15 }}
          className="flex flex-col items-center text-center"
        >
          <div className="flex items-center text-5xl sm:text-6xl font-black tracking-tight text-white drop-shadow-[0_4px_8px_rgba(15,23,42,0.4)]">
            <span
              style={{
                WebkitTextStroke: '2.5px #1E3A8A',
                paintOrder: 'stroke fill',
                textShadow: '0 5px 0 #1E3A8A, 0 7px 14px rgba(30, 58, 138, 0.4)',
              }}
            >
              F
            </span>
            <div className="relative flex flex-col items-center justify-end h-[1em] px-0.5">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                className="absolute -top-1 z-10 drop-shadow-sm"
              >
                <path
                  d="M6 18 L17 7 M17 7 H10 M17 7 V14"
                  stroke="#FACC15"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M6 18 L17 7 M17 7 H10 M17 7 V14"
                  stroke="#B45309"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span
                style={{
                  WebkitTextStroke: '2.5px #1E3A8A',
                  paintOrder: 'stroke fill',
                  textShadow: '0 5px 0 #1E3A8A, 0 7px 14px rgba(30, 58, 138, 0.4)',
                }}
              >
                i
              </span>
            </div>
            <span
              style={{
                WebkitTextStroke: '2.5px #1E3A8A',
                paintOrder: 'stroke fill',
                textShadow: '0 5px 0 #1E3A8A, 0 7px 14px rgba(30, 58, 138, 0.4)',
              }}
            >
              NTURE
            </span>
          </div>

          <div className="mt-1 bg-amber-50/95 border-2 border-amber-200/90 px-4 py-1 rounded-full shadow-md flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-blue-950">
              Play <span className="text-amber-500">•</span> Learn <span className="text-amber-500">•</span> Grow Your Future
            </span>
          </div>
        </motion.div>

        {/* User Profile & Active Character Financial Card */}
        <motion.div
          initial={{ y: 15, opacity: 0, scale: 0.96 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ delay: 0.05, type: 'spring', damping: 18 }}
          className="w-full bg-white/95 backdrop-blur-md rounded-3xl p-3.5 border-4 border-white shadow-[0_12px_30px_rgba(14,165,233,0.25)] flex flex-col gap-2.5"
        >
          <div className="flex items-center gap-3">
            {/* Character Face Avatar Badge (No Ribbon Overlay) */}
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-b from-sky-200 via-blue-400 to-sky-500 border-2 border-white shadow-md flex-shrink-0 overflow-hidden flex items-center justify-center p-1">
              <img
                src={charAvatarPath}
                alt={activeChar.name}
                className="w-full h-full max-w-full max-h-full object-contain object-bottom drop-shadow-md"
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <div className="font-extrabold text-slate-800 text-sm sm:text-base truncate leading-tight">
                  {profile.nickname || authUser?.name || 'Petualang'}
                </div>
                {hasActive && session && (
                  <div className="text-[10px] text-amber-800 font-extrabold bg-amber-100/90 border border-amber-300 rounded-full px-2 py-0.5 flex-shrink-0">
                    Hari Ke-{session.day}/30
                  </div>
                )}
              </div>
              <div className="text-xs text-sky-800 font-semibold font-body truncate mt-0.5">
                Karakter: <b className="text-blue-950 font-black">{activeChar.name}</b>
              </div>
            </div>
          </div>

          {/* Financial Target & Allowance Info Chips */}
          <div className="w-full bg-slate-50/90 border border-slate-200/90 rounded-2xl p-2.5 flex flex-col gap-1.5 text-xs font-body">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 font-medium flex items-center gap-1">
                💵 Uang Saku:
              </span>
              <b className="text-emerald-700 font-bold">
                {formatRp(activeChar.weeklyAllowance)} / minggu
              </b>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-slate-200/80">
              <span className="text-slate-600 font-medium flex items-center gap-1">
                🎯 Target 30 Hari:
              </span>
              <b className="text-amber-700 font-bold truncate max-w-[170px]" title={activeChar.targetName}>
                {activeChar.targetName} ({formatRp(activeChar.targetAmount)})
              </b>
            </div>
          </div>
        </motion.div>

        {/* 3D Board Preview Card */}
        <motion.div
          initial={{ y: 20, opacity: 0, scale: 0.96 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', damping: 18 }}
          className="w-full h-52 sm:h-56 rounded-3xl overflow-hidden border-4 border-white shadow-[0_12px_30px_rgba(14,165,233,0.25)] relative bg-sky-950/20"
        >
          <div className="absolute inset-0 z-0 opacity-95">
            <Board3D isPreview={true} />
          </div>
          <div className="absolute top-2.5 left-3 z-10 bg-blue-950/75 backdrop-blur-md px-3 py-1 rounded-full border border-white/40 text-white text-[10px] font-bold shadow-sm">
            🎲 Papan Petualangan 3D
          </div>
        </motion.div>

        {/* Main CTA Section */}
        <motion.div
          initial={{ y: 25, opacity: 0, scale: 0.96 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, type: 'spring', damping: 18 }}
          className="w-full flex flex-col gap-2.5"
        >
          {hasActive ? (
            <>
              <button
                onClick={() => navigate('game')}
                className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-b from-yellow-300 via-amber-400 to-yellow-500 text-blue-950 font-black text-base uppercase tracking-wider shadow-[0_5px_0_#D97706] active:shadow-[0_2px_0_#D97706] active:translate-y-1 border-2 border-yellow-100 hover:brightness-105 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>LANJUTKAN SESI</span>
                <span className="text-xs bg-blue-950/15 px-2 py-0.5 rounded-md font-extrabold">
                  HARI {session!.day}
                </span>
              </button>
              <button
                onClick={() => setConfirmNew(true)}
                className="w-full py-2.5 px-4 rounded-2xl bg-white/90 hover:bg-white text-slate-800 font-bold text-xs uppercase tracking-wide border-2 border-white shadow-sm active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                Ganti / Pilih Karakter Baru
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate('character')}
              className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-b from-yellow-300 via-amber-400 to-yellow-500 text-blue-950 font-black text-base uppercase tracking-wider shadow-[0_5px_0_#D97706] active:shadow-[0_2px_0_#D97706] active:translate-y-1 border-2 border-yellow-100 hover:brightness-105 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              PILIH KARAKTER &amp; MAIN
            </button>
          )}
        </motion.div>

        {/* 2x2 Feature Buttons Grid */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 gap-2.5 w-full mt-0.5"
        >
          <button
            onClick={() => navigate('rules')}
            className="py-3 px-3 rounded-2xl bg-white/90 hover:bg-white text-slate-800 font-bold text-xs border-2 border-white shadow-md active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>📜</span> Peraturan
          </button>
          <button
            onClick={() => navigate('history')}
            className="py-3 px-3 rounded-2xl bg-white/90 hover:bg-white text-slate-800 font-bold text-xs border-2 border-white shadow-md active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>🏆</span> Riwayat
          </button>
          <button
            onClick={() => navigate('profile')}
            className="py-3 px-3 rounded-2xl bg-white/90 hover:bg-white text-slate-800 font-bold text-xs border-2 border-white shadow-md active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>👤</span> Profil
          </button>
          <button
            onClick={() => navigate('evaluation')}
            className="py-3 px-3 rounded-2xl bg-white/90 hover:bg-white text-slate-800 font-bold text-xs border-2 border-white shadow-md active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>📊</span> Evaluasi
          </button>
        </motion.div>
      </div>

      {/* Confirmation Modal for Starting New Session */}
      {confirmNew && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end justify-center p-4">
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="w-full max-w-[360px] bg-white rounded-3xl p-5 border-4 border-white shadow-2xl space-y-3.5"
          >
            <div className="text-center space-y-1">
              <h3 className="font-extrabold text-slate-800 text-lg">
                Ada sesi yang belum selesai!
              </h3>
              <p className="text-xs text-slate-500 font-body leading-relaxed">
                Mulai baru akan menghapus progres (Hari Ke-{session?.day}). Apakah kamu yakin mau mengganti karakter?
              </p>
            </div>
            <div className="flex gap-2.5 pt-1">
              <button
                onClick={() => navigate('game')}
                className="flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer"
              >
                Lanjutkan Sesi
              </button>
              <button
                onClick={() => {
                  abandonSession()
                  setConfirmNew(false)
                  navigate('character')
                }}
                className="flex-1 py-3 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                Mulai Baru
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

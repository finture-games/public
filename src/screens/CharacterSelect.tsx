import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CHARACTERS } from '../data/characters'
import { useGameStore } from '../store/game'
import { formatRp, assetUrl } from '../lib/format'
import Button from '../components/Button'

export default function CharacterSelect() {
  const navigate = useGameStore((s) => s.navigate)
  const startNewSession = useGameStore((s) => s.startNewSession)
  const session = useGameStore((s) => s.session)
  const hasActive = session?.status === 'active'
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const selectedChar = CHARACTERS.find((c) => c.id === selectedId)

  // Layout arrangement: Row 1 (alep, angel), Row 2 (alea, wawan), Row 3 (mamad)
  const alep = CHARACTERS.find((c) => c.id === 'alep') || CHARACTERS[0]
  const angel = CHARACTERS.find((c) => c.id === 'angel') || CHARACTERS[1]
  const alea = CHARACTERS.find((c) => c.id === 'alea') || CHARACTERS[2]
  const wawan = CHARACTERS.find((c) => c.id === 'wawan') || CHARACTERS[3]
  const mamad = CHARACTERS.find((c) => c.id === 'mamad') || CHARACTERS[4]

  const handleSelectCharacter = (charId: string) => {
    setSelectedId(charId)
  }

  const handleConfirmStart = () => {
    if (selectedId) {
      startNewSession(selectedId)
      navigate('game')
    }
  }

  return (
    <div className="relative w-full h-[100dvh] min-h-[100dvh] flex flex-col justify-between items-center px-4 py-4 overflow-hidden font-display select-none">
      {/* Theme Background Image */}
      <img
        src={assetUrl('/theme/background.jpeg')}
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover object-center z-0 pointer-events-none"
      />

      {/* Floating Money Bills */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: -20, opacity: 0 }}
            animate={{
              y: [0, 850],
              opacity: [0, 0.7, 0.7, 0],
              rotate: [0, i % 2 === 0 ? 120 : -120],
            }}
            transition={{
              duration: 8 + (i % 3) * 2,
              repeat: Infinity,
              delay: i * 1.3,
              ease: 'linear',
            }}
            style={{ left: `${8 + i * 16}%` }}
            className="absolute top-0 text-xl opacity-60 select-none"
          >
            💵
          </motion.div>
        ))}
      </div>

      {/* Back Button */}
      {navigate && (
        <button
          onClick={() => navigate('home')}
          className="absolute top-4 left-4 z-30 bg-white/90 hover:bg-white text-slate-700 font-bold text-xs px-3 py-1.5 rounded-full border border-slate-200 shadow-sm transition-all cursor-pointer flex items-center gap-1"
        >
          ← Beranda
        </button>
      )}

      {/* Header Section */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-[340px] pt-6 sm:pt-8 pb-2">
        {/* Main Title FiNTURE */}
        <div className="relative flex items-center justify-center select-none">
          <div className="flex items-center text-4xl sm:text-5xl font-black tracking-tight text-white drop-shadow-[0_4px_8px_rgba(15,23,42,0.4)]">
            <span
              style={{
                WebkitTextStroke: '2px #1E3A8A',
                paintOrder: 'stroke fill',
                textShadow: '0 4px 0 #1E3A8A, 0 6px 12px rgba(30, 58, 138, 0.4)',
              }}
            >
              F
            </span>
            <div className="relative flex flex-col items-center justify-end h-[1em] px-0.5">
              <motion.svg
                initial={{ y: -3, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
                width="18"
                height="18"
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
              </motion.svg>
              <span
                style={{
                  WebkitTextStroke: '2px #1E3A8A',
                  paintOrder: 'stroke fill',
                  textShadow: '0 4px 0 #1E3A8A, 0 6px 12px rgba(30, 58, 138, 0.4)',
                }}
              >
                i
              </span>
            </div>
            <span
              style={{
                WebkitTextStroke: '2px #1E3A8A',
                paintOrder: 'stroke fill',
                textShadow: '0 4px 0 #1E3A8A, 0 6px 12px rgba(30, 58, 138, 0.4)',
              }}
            >
              NTURE
            </span>
          </div>
        </div>

        {/* Subtitle Pill Banner */}
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mt-1.5 bg-[#FFF8E7] border-2 border-[#5C3B1E] px-5 py-1 rounded-full shadow-md flex items-center justify-center gap-1.5"
        >
          <span className="font-extrabold text-xs text-[#2A1807] tracking-medium font-body flex items-center gap-1">
            Pilih Karakter Kamu
          </span>
        </motion.div>
      </div>

      {/* Character Cards Section */}
      <div className="relative z-10 w-full max-w-[350px] my-auto flex flex-col gap-6 sm:gap-7 items-center px-1">
        {/* Row 1: Alep & Angel */}
        <div className="grid grid-cols-2 gap-4 sm:gap-5 w-full">
          <CharacterCard
            character={alep}
            isSelected={selectedId === alep.id}
            onSelect={() => handleSelectCharacter(alep.id)}
          />
          <CharacterCard
            character={angel}
            isSelected={selectedId === angel.id}
            onSelect={() => handleSelectCharacter(angel.id)}
          />
        </div>

        {/* Row 2: Alea & Wawan */}
        <div className="grid grid-cols-2 gap-4 sm:gap-5 w-full">
          <CharacterCard
            character={alea}
            isSelected={selectedId === alea.id}
            onSelect={() => handleSelectCharacter(alea.id)}
          />
          <CharacterCard
            character={wawan}
            isSelected={selectedId === wawan.id}
            onSelect={() => handleSelectCharacter(wawan.id)}
          />
        </div>

        {/* Row 3: Mamad (Centered) */}
        <div className="w-[48%] flex justify-center">
          <CharacterCard
            character={mamad}
            isSelected={selectedId === mamad.id}
            onSelect={() => handleSelectCharacter(mamad.id)}
          />
        </div>
      </div>

      {/* Modal Bottom Sheet for Character Confirmation */}
      <AnimatePresence>
        {selectedChar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end justify-center p-4"
            onClick={() => setSelectedId(null)}
          >
            <motion.div
              initial={{ y: 100, scale: 0.95 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 100, scale: 0.95 }}
              transition={{ type: 'spring', damping: 20 }}
              className="w-full max-w-[380px] bg-white rounded-3xl p-5 border-4 border-white shadow-2xl flex flex-col gap-3.5 relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedId(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold flex items-center justify-center text-sm"
              >
                ✕
              </button>

              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-sky-100 border-2 border-sky-300 p-1 flex-shrink-0 flex items-center justify-center overflow-hidden">
                  <img
                    src={selectedChar.avatar ? assetUrl(selectedChar.avatar) : assetUrl(`/characters/${selectedChar.id}/${selectedChar.id}_1_normal.png`)}
                    alt={selectedChar.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-800 flex items-center gap-1.5">
                    {selectedChar.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-body leading-tight mt-0.5">
                    {selectedChar.background}
                  </p>
                </div>
              </div>

              {/* Stats Box */}
              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3 text-xs font-body space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Uang Saku / Minggu:</span>
                  <b className="text-slate-800 font-semibold">{formatRp(selectedChar.weeklyAllowance)}</b>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Uang Tabungan Awal:</span>
                  <b className="text-slate-800 font-semibold">{formatRp(selectedChar.startMoney)}</b>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200">
                  <span className="text-slate-500">Target 30 Hari:</span>
                  <b className="text-amber-600 font-bold">
                    {selectedChar.targetName} ({formatRp(selectedChar.targetAmount)})
                  </b>
                </div>
              </div>

              {hasActive && (
                <div className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-2 text-center font-medium">
                  ⚠️ Memulai sesi baru akan menggantikan progres sesi Hari Ke-{session.day} saat ini.
                </div>
              )}

              {/* Start Button */}
              <Button className="w-full text-base py-3" onClick={handleConfirmStart}>
                {hasActive ? `Mulai Sesi Baru dengan ${selectedChar.name}` : `Mulai Bermain dengan ${selectedChar.name}`}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function CharacterCard({
  character,
  isSelected,
  onSelect,
}: {
  character: any
  isSelected: boolean
  onSelect: () => void
}) {
  const avatarPath = character.avatar
    ? assetUrl(character.avatar)
    : assetUrl(`/characters/${character.id}/${character.id}_half.png`)

  return (
    <motion.div
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      onClick={onSelect}
      className={`relative w-full h-36 sm:h-40 rounded-2xl bg-white border-3 shadow-md flex flex-col items-center justify-between overflow-hidden cursor-pointer transition-all duration-150 ${
        isSelected
          ? 'border-amber-400 ring-4 ring-amber-300/60 shadow-xl scale-[1.03]'
          : 'border-white hover:border-sky-200'
      }`}
    >
      {/* Background Soft Glow */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-sky-50/70 to-white z-0 pointer-events-none overflow-hidden" />

      {/* Character Image */}
      <div className="relative z-10 w-full h-[78%] flex items-end justify-center pt-1 pb-1 overflow-hidden">
        <img
          src={avatarPath}
          alt={character.name}
          className="w-full h-full object-contain object-bottom drop-shadow-md transform hover:scale-105 transition-transform duration-200"
        />
      </div>

      {/* Clean Character Name Badge at Bottom (No Ribbon) */}
      <div className="relative z-20 w-full bg-slate-900/85 text-white font-extrabold text-xs tracking-wide py-1 px-2 text-center">
        {character.name}
      </div>
    </motion.div>
  )
}

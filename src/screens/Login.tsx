import { useState } from 'react'
import { motion } from 'framer-motion'
import { useGameStore } from '../store/game'
import { emailToUserId } from '../lib/firebase'
import { assetUrl } from '../lib/format'

export default function Login() {
  const setAuth = useGameStore((s) => s.setAuth)
  const updateProfile = useGameStore((s) => s.updateProfile)
  const loadUserCloudData = useGameStore((s) => s.loadUserCloudData)
  const navigate = useGameStore((s) => s.navigate)
  const consentGiven = useGameStore((s) => s.settings.consentGiven)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!username.trim()) {
      setNotice('Masukkan Username / Nama Panggilan dulu, ya!')
      return
    }
    if (!email.trim() || !email.includes('@')) {
      setNotice('Masukkan alamat email yang valid dulu, ya!')
      return
    }

    const cleanId = emailToUserId(email)
    const displayUsername = username.trim()

    setLoading(true)

    setAuth(
      {
        id: cleanId,
        email: email.trim(),
        name: displayUsername,
      },
      'magic',
    )
    updateProfile({ nickname: displayUsername })

    const restoredSession = await loadUserCloudData(cleanId)
    setLoading(false)

    if (restoredSession) {
      navigate(consentGiven ? 'home' : 'consent')
    } else {
      const currentSession = useGameStore.getState().session
      navigate(consentGiven ? (currentSession ? 'home' : 'character') : 'consent')
    }
  }

  return (
    <div className="relative w-full h-[100dvh] min-h-[100dvh] flex flex-col justify-between items-center px-4 py-6 overflow-hidden font-display select-none">
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
      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-[360px] my-auto gap-4">
        {/* Header Logo Badge */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', damping: 15 }}
          className="flex flex-col items-center text-center -mt-6"
        >
          <div className="flex items-center text-5xl sm:text-6xl font-black tracking-tight text-white drop-shadow-[0_4px_8px_rgba(15,23,42,0.4)]">
            <span
              style={{
                WebkitTextStroke: '2.5px #1E3A8A',
                paintOrder: 'stroke fill',
                textShadow: '0 5px 0 #1E3A8A, 0 7px 14px rgba(30, 58, 138, 0.4)',
              }}
            >
              Finture
            </span>
          </div>
          <p className="mt-2 text-xs font-semibold text-blue-950 bg-white/85 backdrop-blur-md px-3.5 py-1 rounded-full border border-white/60 shadow-sm">
            Latihan jalan 30 hari: atur uang, tahan FOMO!
          </p>
        </motion.div>

        {/* Username & Email Entry Card */}
        <motion.div
          initial={{ y: 25, opacity: 0, scale: 0.96 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', damping: 18 }}
          className="w-full bg-white/95 backdrop-blur-md rounded-3xl p-5 border-4 border-white shadow-[0_15px_35px_rgba(14,165,233,0.25)] flex flex-col gap-3.5"
        >
          <div className="text-center space-y-1">
            <h2 className="font-black text-slate-800 text-xl tracking-tight">
              Masuk Akun Pemain
            </h2>
            <p className="text-xs text-slate-500 font-body leading-tight">
              Isi username &amp; email untuk menyimpan data progres ke cloud.
            </p>
          </div>

          <form onSubmit={handleEmailLogin} className="flex flex-col gap-3">
            {/* Username Input */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-700">Username / Nama Panggilan</label>
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value)
                  if (notice) setNotice('')
                }}
                placeholder="Contoh: AlepGamer"
                required
                className="w-full rounded-2xl bg-slate-50 border-2 border-slate-200 px-4 py-2.5 text-sm font-body outline-none focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-all text-slate-800 font-medium"
              />
            </div>

            {/* Email Input */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-700">Alamat Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (notice) setNotice('')
                }}
                placeholder="nama@email.com"
                required
                className="w-full rounded-2xl bg-slate-50 border-2 border-slate-200 px-4 py-2.5 text-sm font-body outline-none focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-all text-slate-800 font-medium"
              />
            </div>

            {/* Primary Aesthetic Chunky Yellow Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 px-6 rounded-2xl bg-gradient-to-b from-yellow-300 via-amber-400 to-yellow-500 text-blue-950 font-black text-base uppercase tracking-wider shadow-[0_5px_0_#D97706] active:shadow-[0_2px_0_#D97706] active:translate-y-1 border-2 border-yellow-100 hover:brightness-105 transition-all cursor-pointer flex items-center justify-center disabled:opacity-70"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin text-lg">⏳</span> MEMUAT SESI...
                </span>
              ) : (
                'MASUK'
              )}
            </button>
          </form>

          {notice && (
            <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl p-2.5 font-body text-center font-semibold animate-shake">
              {notice}
            </p>
          )}
        </motion.div>

        {/* Footnote Privacy Disclaimer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="text-[11px] text-blue-950 font-semibold bg-white/80 backdrop-blur-sm px-4 py-2 rounded-2xl border border-white/50 text-center leading-tight shadow-xs"
        >
          Finture hanya menyimpan progres permainan — tanpa nomor HP atau data sensitif.
        </motion.p>
      </div>
    </div>
  )
}

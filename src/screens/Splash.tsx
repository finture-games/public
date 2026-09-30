import { motion } from 'framer-motion'
import { useGameStore } from '../store/game'

interface CharConfig {
  id: string
  name: string
  src: string
  x: number
  y: number
  scale: number
  rotate: number
  zIndex: number
  clipBottom?: boolean
}

const CHARACTERS: CharConfig[] = [
  { id: 'alep', name: 'Alep (Tengah)', src: '/characters/alep/alep_1_normal.png', x: -13, y: -76, scale: 1, rotate: 0, zIndex: 10 },
  { id: 'mamad', name: 'Mamad (Kiri Atas)', src: '/characters/mamad/mamad_1_normal.png', x: -121, y: -32, scale: 0.9, rotate: -3, zIndex: 12 },
  { id: 'wawan', name: 'Wawan (Kanan Atas)', src: '/characters/wawan/wawan_1_normal.png', x: 115, y: -32, scale: 0.9, rotate: 3, zIndex: 12 },
  { id: 'angel', name: 'Angel (Kiri Depan)', src: '/characters/angel/angel_1_normal.png', x: -60, y: 72, scale: 1, rotate: 0, zIndex: 20, clipBottom: true },
  { id: 'alea', name: 'Alea (Kanan Depan)', src: '/characters/alea/alea_1_normal.png', x: 43, y: 42, scale: 1, rotate: 0, zIndex: 21, clipBottom: true },
]

export default function Splash() {
  const navigate = useGameStore((s) => s.navigate)
  const authUser = useGameStore((s) => s.authUser)
  const session = useGameStore((s) => s.session)

  const handleStart = () => {
    try {
      if (document.documentElement.requestFullscreen) {
        void document.documentElement.requestFullscreen().catch(() => {})
      }
    } catch {
      // ignore fullscreen rejection
    }
    navigate(authUser ? (session ? 'home' : 'character') : 'login')
  }

  return (
    <div className="relative w-full h-[100dvh] min-h-[100dvh] flex flex-col justify-between items-center px-4 py-6 overflow-hidden font-display select-none">
      {/* Background Image - Full Viewport Cover */}
      <img
        src="/theme/background.jpeg"
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

      {/* Main Illustration Badge Section */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-[340px] my-auto">
        {/* Circle Badge Wrapper */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', damping: 15, stiffness: 90 }}
          className="relative flex items-center justify-center shrink-0"
        >
          {/* Circular Frame Background - Fixed 280px for identical scaling on all screens */}
          <div className="relative w-[280px] h-[280px] rounded-full border-4 border-white bg-gradient-to-b from-sky-300/80 via-blue-400/70 to-sky-500/80 shadow-[0_12px_35px_rgba(14,165,233,0.35)] flex items-center justify-center overflow-visible">
            {/* Yellow Upward Arrow */}
            <div className="absolute -top-3 -right-1 z-0 pointer-events-none">
              <svg
                width="72"
                height="72"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="drop-shadow-[0_4px_8px_rgba(0,0,0,0.2)]"
              >
                <path
                  d="M25 75 L68 32 L58 32 L58 20 L90 20 L90 52 L78 52 L78 42 L35 85 Z"
                  fill="url(#yellowGradientTop)"
                  stroke="#FFFFFF"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                />
                <defs>
                  <linearGradient id="yellowGradientTop" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#FACC15" />
                    <stop offset="100%" stopColor="#F59E0B" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Characters Container */}
            <div className="relative w-full h-full z-10 flex items-center justify-center overflow-visible pointer-events-none">
              {/* Unclipped Characters (Alep, Mamad, Wawan) - Heads pop out top */}
              {CHARACTERS.filter((c) => !c.clipBottom).map((c) => (
                <div
                  key={c.id}
                  style={{
                    transform: `translate(${c.x}px, ${c.y}px) scale(${c.scale}) rotate(${c.rotate}deg)`,
                    zIndex: c.zIndex,
                  }}
                  className="absolute w-36"
                >
                  <img
                    src={c.src}
                    alt={c.name}
                    className="w-full h-auto object-contain drop-shadow-lg select-none"
                  />
                </div>
              ))}

              {/* Clipped Characters Container (Angel, Alea) - Bottom masked cleanly within circle badge */}
              <div className="absolute inset-0 rounded-full overflow-hidden flex items-center justify-center pointer-events-none z-20">
                {CHARACTERS.filter((c) => c.clipBottom).map((c) => (
                  <div
                    key={c.id}
                    style={{
                      transform: `translate(${c.x}px, ${c.y}px) scale(${c.scale}) rotate(${c.rotate}deg)`,
                      zIndex: c.zIndex,
                    }}
                    className="absolute w-36"
                  >
                    <img
                      src={c.src}
                      alt={c.name}
                      className="w-full h-auto object-contain drop-shadow-lg select-none"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Left Badge - Growth Chart */}
          <div className="absolute -left-2 bottom-6 z-30 bg-white p-2 rounded-2xl shadow-xl border-2 border-sky-100 flex items-center justify-center pointer-events-none">
            <img src="/item/grafik_pertumbuhan.png" alt="Grafik" className="w-10 h-10 object-contain" />
          </div>

          {/* Right Badge - Gold Coin */}
          <div className="absolute -right-2 bottom-6 z-30 bg-white p-2 rounded-2xl shadow-xl border-2 border-amber-100 flex items-center justify-center pointer-events-none">
            <img src="/item/koin_emas.png" alt="Koin" className="w-10 h-10 object-contain" />
          </div>
        </motion.div>

        {/* Title and Subtitle Section */}
        <div className="flex flex-col items-center -mt-6 sm:-mt-7 z-30 relative pointer-events-none">
          <div className="relative flex items-center justify-center select-none">
            <span className="text-yellow-300 text-2xl animate-pulse mr-1 drop-shadow-md">✨</span>
            <div className="flex items-center text-5xl sm:text-6xl font-black tracking-tight text-white drop-shadow-[0_6px_10px_rgba(15,23,42,0.5)]">
              <span style={{ WebkitTextStroke: '2.5px #1E3A8A', paintOrder: 'stroke fill' }}>F</span>
              <div className="relative flex flex-col items-center justify-end h-[1em] px-0.5">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="absolute -top-1 z-10 drop-shadow-sm">
                  <path d="M6 18 L17 7 M17 7 H10 M17 7 V14" stroke="#FACC15" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M6 18 L17 7 M17 7 H10 M17 7 V14" stroke="#B45309" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span style={{ WebkitTextStroke: '2.5px #1E3A8A', paintOrder: 'stroke fill' }}>i</span>
              </div>
              <span style={{ WebkitTextStroke: '2.5px #1E3A8A', paintOrder: 'stroke fill' }}>NTURE</span>
            </div>
            <span className="text-yellow-300 text-2xl animate-pulse ml-1 drop-shadow-md">✨</span>
          </div>

          <div className="mt-2 bg-amber-50/95 border-2 border-amber-200/90 px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
            <span className="text-xs font-bold text-blue-950">
              Play <span className="text-amber-500">•</span> Learn <span className="text-amber-500">•</span> Grow Your Future
            </span>
          </div>
        </div>
      </div>

      {/* Start Button */}
      <div className="w-full max-w-[320px] mb-4 z-20 flex flex-col items-center">
        <button
          onClick={handleStart}
          className="w-full py-4 px-6 rounded-full bg-gradient-to-b from-yellow-300 via-amber-400 to-yellow-500 text-blue-950 font-black text-xl uppercase shadow-lg border-2 border-yellow-100 flex items-center justify-center cursor-pointer hover:brightness-105 active:scale-95 transition-all"
        >
          MULAI PERMAINAN
        </button>
      </div>
    </div>
  )
}

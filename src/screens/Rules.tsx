import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useGameStore } from '../store/game'
import Button from '../components/Button'

const SLIDES = [
  {
    emoji: '🎯',
    title: 'Tujuannya',
    text: 'Jalani 30 hari (30 petak) dan capai target tabungan karaktermu sebelum sampai garis finish. Setiap petak = satu hari.',
  },
  {
    emoji: '🎲',
    title: 'Lempar Dadu',
    text: 'Tekan dadu (angka 1-3) dan pionmu akan melompat petak demi petak. Petak tempat berhenti memicu kartu keputusan.',
  },
  {
    emoji: '🃏',
    title: 'Kartu Keputusan',
    text: 'Setiap kartu berisi cerita dan 2-3 pilihan. Dampak uangnya tersembunyi sampai kamu memilih. Tidak bisa dibatalkan!',
  },
  {
    emoji: '💰',
    title: 'Gajian & Kejutan',
    text: 'Melewati petak Gajian emas = uang saku mingguan masuk otomatis. Petak oranye adalah kejutan: bisa untung, bisa rugi.',
  },
  {
    emoji: '📊',
    title: 'Skor & Profil',
    text: 'Keputusanmu membentuk 5 aspek kebiasaan finansial. Di akhir permainan kamu dapat skor, profil, dan materi belajar.',
  },
]

export default function Rules() {
  const navigate = useGameStore((s) => s.navigate)
  const [idx, setIdx] = useState(0)
  const slide = SLIDES[idx]
  const next = () => (idx < SLIDES.length - 1 ? setIdx(idx + 1) : navigate('home'))
  return (
    <div className="min-h-screen flex flex-col px-6 py-8">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('home')}
          className="text-sm font-semibold text-ink/60 font-body"
        >
          Lewati
        </button>
        <div className="flex gap-1.5">
          {SLIDES.map((_, i) => (
            <div
              key={i}
              className={
                'h-2 rounded-full transition-all ' +
                (i === idx ? 'w-6 bg-primary' : 'w-2 bg-ink/20')
              }
            />
          ))}
        </div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -40, opacity: 0 }}
            className="flex flex-col items-center gap-3"
          >
            <div className="text-7xl animate-bob">{slide.emoji}</div>
            <h2 className="font-display font-bold text-2xl text-ink">{slide.title}</h2>
            <p className="text-sm text-ink/70 font-body leading-relaxed max-w-[300px]">
              {slide.text}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
      <Button className="w-full" onClick={next}>
        {idx < SLIDES.length - 1 ? 'Lanjut' : 'Mengerti, mulai!'}
      </Button>
    </div>
  )
}

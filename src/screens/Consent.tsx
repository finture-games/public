import { useGameStore } from '../store/game'
import Button from '../components/Button'

export default function Consent() {
  const updateSettings = useGameStore((s) => s.updateSettings)
  const navigate = useGameStore((s) => s.navigate)
  return (
    <div className="min-h-screen flex flex-col justify-center px-6 py-10 gap-4">
      <div className="text-center">
        <div className="text-5xl">🔒</div>
        <h1 className="mt-2 font-display font-bold text-2xl text-ink">Persetujuan Data</h1>
      </div>
      <div className="rounded-card bg-white border-2 border-ink/10 p-4 shadow-chunky text-sm text-ink/80 font-body leading-relaxed space-y-2">
        <p>
          <b>Kenapa ini ada?</b> Karena banyak pengguna Finture di bawah 18 tahun, data yang
          kami simpan sengaja dibuat seminimal mungkin.
        </p>
        <p>
          <b>Yang disimpan:</b> nama panggilan, progres permainan, keputusan dalam game, dan
          jawaban refleksi. Semua untuk melihat perkembangan belajarmu.
        </p>
        <p>
          <b>Yang TIDAK disimpan:</b> nomor HP, alamat, atau data transaksi sungguhan.
          Finture tidak memakai uang asli sama sekali.
        </p>
      </div>
      <Button
        className="w-full"
        onClick={() => {
          updateSettings({ consentGiven: true })
          navigate('character')
        }}
      >
        Aku setuju, ayo main!
      </Button>
    </div>
  )
}

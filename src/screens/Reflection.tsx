import { useGameStore } from '../store/game'
import Button from '../components/Button'

const QUESTIONS = [
  {
    key: 'momen',
    label: 'Momen apa yang paling menantang buat kamu?',
    options: ['Tahan FOMO dari teman', 'Godaan diskon & flash sale', 'Kebutuhan mendadak', 'Menabung rutin'],
  },
  {
    key: 'pilihan',
    label: 'Keputusan mana yang paling nyesel / paling bangga?',
    options: ['Yang paling bangga: nabung', 'Yang paling nyesel: beli impulsif', 'Yang paling nyesel: ikut-ikut teman', 'Tidak ada penyesalan'],
  },
]

export default function Reflection() {
  const answers = useGameStore((s) => s.reflectionAnswers)
  const setReflection = useGameStore((s) => s.setReflection)
  const finishReflection = useGameStore((s) => s.finishReflection)

  return (
    <div className="min-h-screen flex flex-col px-5 py-8 gap-4">
      <div className="text-center">
        <div className="text-5xl">🪞</div>
        <h1 className="mt-1 font-display font-bold text-2xl text-ink">Refleksi</h1>
        <p className="text-sm text-ink/60 font-body">
          Jawab santai aja — ini bukan ujian.
        </p>
      </div>

      {QUESTIONS.map((q) => (
        <div key={q.key} className="rounded-card bg-white border-2 border-ink/10 p-4">
          <p className="font-display font-semibold text-ink text-sm">{q.label}</p>
          <div className="mt-2 flex flex-col gap-2">
            {q.options.map((opt) => (
              <button
                key={opt}
                onClick={() => setReflection(q.key, opt)}
                className={
                  'rounded-chunky border-2 px-3 py-2.5 text-left text-sm font-body font-semibold transition-all ' +
                  (answers[q.key] === opt
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-ink/10 bg-white text-ink/80')
                }
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      ))}

      <div className="rounded-card bg-white border-2 border-ink/10 p-4">
        <p className="font-display font-semibold text-ink text-sm">
          Satu hal yang mau kamu ubah periode depan? (opsional)
        </p>
        <textarea
          value={answers['isian'] ?? ''}
          onChange={(e) => setReflection('isian', e.target.value)}
          rows={3}
          placeholder="Tulis di sini..."
          className="mt-2 w-full rounded-chunky border-2 border-ink/10 px-3 py-2 text-sm font-body outline-none focus:border-primary"
        />
      </div>

      <Button className="w-full" onClick={finishReflection}>
        Lihat Hasil Evaluasi
      </Button>
    </div>
  )
}

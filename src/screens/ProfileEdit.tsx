import { useState } from 'react'
import { useGameStore } from '../store/game'
import { upsertProfile } from '../lib/supabaseSync'
import Button from '../components/Button'

export default function ProfileEdit() {
  const profile = useGameStore((s) => s.profile)
  const updateProfile = useGameStore((s) => s.updateProfile)
  const settings = useGameStore((s) => s.settings)
  const updateSettings = useGameStore((s) => s.updateSettings)
  const authUser = useGameStore((s) => s.authUser)
  const setAuth = useGameStore((s) => s.setAuth)
  const navigate = useGameStore((s) => s.navigate)

  const [nickname, setNickname] = useState(profile.nickname)
  const [school, setSchool] = useState(profile.school)
  const [saved, setSaved] = useState(false)

  function save() {
    updateProfile({ nickname: nickname.trim() || 'Petualang', school: school.trim(), avatar: profile.avatar })
    if (authUser) {
      void upsertProfile(authUser, {
        nickname: nickname.trim() || 'Petualang',
        school: school.trim(),
        avatar: profile.avatar,
      })
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  return (
    <div className="min-h-screen flex flex-col px-5 py-7 gap-4 font-display select-none">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('home')}
          className="text-sm font-semibold text-ink/60 font-body"
        >
          ← Beranda
        </button>
        <h1 className="font-display font-bold text-xl text-ink">Profil</h1>
        <div className="w-14" />
      </div>

      <div className="rounded-card bg-white border-2 border-ink/10 p-4 space-y-3 font-body">
        <div>
          <label className="text-xs font-semibold text-ink/60">Nama panggilan</label>
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="mis. Raka"
            className="mt-1 w-full rounded-chunky border-2 border-ink/10 px-3 py-2.5 text-sm outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-ink/60">Sekolah (opsional)</label>
          <input
            value={school}
            onChange={(e) => setSchool(e.target.value)}
            placeholder="mis. SMA 5 Jakarta"
            className="mt-1 w-full rounded-chunky border-2 border-ink/10 px-3 py-2.5 text-sm outline-none focus:border-primary"
          />
        </div>
        <Button className="w-full" onClick={save}>
          {saved ? 'Tersimpan ✓' : 'Simpan Profil'}
        </Button>
      </div>

      <div className="rounded-card bg-white border-2 border-ink/10 p-4 space-y-3 font-body">
        <div className="text-xs font-semibold text-ink/60">Pengaturan</div>
        <Toggle
          label="Getar (haptic)"
          desc="Getaran kecil saat keputusan berdampak"
          on={settings.haptics}
          onChange={(v) => updateSettings({ haptics: v })}
        />
        <Toggle
          label="Suara"
          desc="Efek suara dadu dan koin"
          on={settings.sound}
          onChange={(v) => updateSettings({ sound: v })}
        />
      </div>

      {authUser && (
        <div className="rounded-card bg-white border-2 border-ink/10 p-4 font-body text-sm">
          <div className="text-xs font-semibold text-ink/60">Akun</div>
          <p className="mt-1 text-ink/70">
            Masuk sebagai {authUser.email}
          </p>
          <Button
            variant="ghost"
            className="mt-2 w-full"
            onClick={() => {
              setAuth(null, 'guest')
              navigate('home')
            }}
          >
            Keluar Akun
          </Button>
        </div>
      )}
    </div>
  )
}

function Toggle({
  label,
  desc,
  on,
  onChange,
}: {
  label: string
  desc: string
  on: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <button onClick={() => onChange(!on)} className="flex items-center justify-between w-full">
      <span className="text-left">
        <span className="block text-sm font-semibold text-ink">{label}</span>
        <span className="block text-[11px] text-ink/50">{desc}</span>
      </span>
      <span
        className={
          'shrink-0 w-11 h-6 rounded-full p-0.5 transition-colors ' +
          (on ? 'bg-primary' : 'bg-ink/20')
        }
      >
        <span
          className={
            'block h-5 w-5 rounded-full bg-white shadow transition-transform ' +
            (on ? 'translate-x-5' : '')
          }
        />
      </span>
    </button>
  )
}

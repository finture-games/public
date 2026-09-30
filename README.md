# Finture — Financial Adventure 🐷🎲

Game papan 3D berbasis web (PWA) untuk melatih remaja 15–19 tahun mengambil keputusan
keuangan dan melihat konsekuensinya. Dibangun sesuai `PRD_Games.md`.

## Teknologi

- **React 18 + Vite + TypeScript** — frontend
- **React Three Fiber + Three.js** — papan & pion 3D (low-poly, MeshToonMaterial)
- **Zustand (+ persist)** — state game; sesi otomatis tersimpan setiap giliran ke localStorage
- **Framer Motion** — flip kartu, transisi layar, angka menghitung
- **Tailwind CSS** — token warna & komponen sesuai style guide PRD
- **Supabase (opsional)** — login Google/magic link + sinkronisasi sesi; tanpa konfigurasi, game jalan mode tamu
- **vite-plugin-pwa** — bisa "Tambahkan ke layar utama", cache aset

## Menjalankan

```bash
npm install
npm run dev        # buka http://localhost:5173 (pakai mode perangkat mobile di DevTools)
npm run build      # typecheck + build produksi ke dist/
npm run preview    # preview hasil build
```

### Mengaktifkan Supabase (opsional)

1. Buat proyek di [supabase.com](https://supabase.com)
2. Jalankan `supabase/schema.sql` di SQL Editor
3. Salin `.env.example` → `.env`, isi `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY`
4. Untuk login Google: aktifkan provider Google di Authentication → Providers

Tanpa langkah ini, aplikasi otomatis fallback ke **mode tamu** (progres lokal, tetap lengkap).

## Deploy

Statis — tinggal deploy folder `dist/` ke Vercel/Netlify (import repo, framework Vite,
build `npm run build`, output `dist`). PWA manifest & service worker ikut ter-build.

## Pemetaan fitur PRD → implementasi

| ID | Fitur | Lokasi |
|----|-------|--------|
| F0 | Login & Profil | `src/screens/Login.tsx`, `src/screens/Consent.tsx`, `src/screens/ProfileEdit.tsx`, `src/lib/supabase.ts` |
| F1 | Halaman Utama | `src/screens/Home.tsx` (latar papan 3D berputar) |
| F2 | Peraturan | `src/screens/Rules.tsx` (5 slide, bisa dilewati) |
| F3 | Pemilihan Karakter | `src/screens/CharacterSelect.tsx` (4 karakter + preview 3D) |
| F4 | Peta 3D | `src/components/Board3D.tsx` (pulau melayang, 30 petak, HUD) |
| F5 | Kartu Keputusan | `src/components/DecisionCard.tsx` (flip + bottom sheet) |
| F6 | Penentuan Keputusan | `src/screens/Game.tsx` + `choose()` di store (dampak tersembunyi, tak bisa dibatalkan) |
| F7 | Konsekuensi | `src/components/ConsequenceSheet.tsx` (angka menghitung + penjelasan) |
| F8 | Risiko Jangka Panjang | `src/components/RiskWarning.tsx` (3× pola sama → proyeksi 1 bulan/1 tahun) |
| F9 | Refleksi | `src/screens/Reflection.tsx` (3 pertanyaan) |
| F10 | Hasil Akhir | `src/screens/Result.tsx` (confetti + rangkuman) |
| F11 | Evaluasi | `src/screens/Evaluation.tsx` + `src/components/RadarChart.tsx` + `src/data/materials.ts` |
| F12 | Riwayat | `src/screens/History.tsx` |

## Mekanik (ringkas)

- 30 petak = 30 hari; dadu bernilai 1–3 (rata-rata ±15 giliran ≈ 10–15 menit)
- Melewati/menjakuh petak **Gajian** emas → uang saku mingguan masuk otomatis
- 48 kartu skenario (8 per jenis petak), diambil acak tanpa pengulangan
- 5 aspek tersembunyi (mulai 50, skala 0–100); setiap pilihan mengubah uang/tabungan + aspek
- Skor total = rata-rata aspek × 0,7 + persentase target × 0,3 → profil Si Boros / Si Galau / Si Cermat / Si Bijak Finansial
- Bangkrut: uang Rp0 saat kartu Kebutuhan → pakai tabungan (Prioritas −8) atau sesi berakhir

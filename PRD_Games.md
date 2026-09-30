PRD Finture — Web Game Mobile

1. Ringkasan Produk
Finture (Financial Adventure) adalah game board 3D berbasis web untuk HP, dimainkan solo, yang melatih remaja 15–19 tahun mengambil keputusan keuangan dan melihat konsekuensinya. Dibuat sebagai web mobile (PWA), bukan aplikasi Android/iOS, agar bisa langsung diakses lewat link tanpa proses review Play Store/App Store.
Masalah: indeks literasi keuangan usia 15–17 tahun hanya 51,68% (SNLIK 2025, OJK–BPS). Remaja sering tahu teorinya, tetapi kalah oleh FOMO, ajakan teman, dan pembelian impulsif.
Solusi: pemain memilih karakter, menjalankan pion di papan 3D, menghadapi kartu skenario, memilih tindakan, lalu melihat dampaknya pada uang saku, tabungan, dan target. Di akhir permainan pemain mendapat skor, profil kebiasaan finansial, refleksi, dan materi belajar.
Item
Keputusan
Platform
Web mobile (PWA), portrait, diakses via browser HP
Mode
Solo, 1 pemain
Visual
3D penuh dengan Three.js (papan, pion, dadu, kartu)
Akun
Login + database (Supabase)
Bahasa
Bahasa Indonesia
Tim
Tim Finture, FEB Universitas Negeri Jakarta
2. Tujuan, Metrik, dan Batasan
Target MVP: satu sesi permainan lengkap (±10–15 menit) yang bisa dimainkan lancar di HP kelas menengah dan dipakai untuk uji pengguna di sekolah.
Tujuan
• Pemain berlatih membedakan kebutuhan dan keinginan, menahan FOMO dan pembelian impulsif, menentukan prioritas, dan menabung.
• Pemain memahami hubungan "pilihan → konsekuensi" melalui umpan balik langsung dan evaluasi akhir.
• Prototipe siap diuji ke siswa SMA/SMK tanpa instalasi aplikasi.
Metrik keberhasilan (uji pengguna)
Metrik
Target
Pemain yang menyelesaikan 1 sesi penuh
≥ 70%
Kenaikan skor kuis pre-test → post-test
≥ 20%
Skor kemudahan (SUS)
≥ 70
Waktu muat awal di jaringan 4G
≤ 4 detik
Frame rate papan 3D di HP menengah
≥ 30 fps
Pemain yang bermain lebih dari 1 kali
≥ 40%
Di luar cakupan MVP (non-goals)
• Multiplayer (lokal maupun online).
• Aplikasi native Android/iOS dan publikasi ke store.
• Transaksi uang sungguhan, pembelian dalam game, atau iklan.
• Dashboard guru (kandidat fase berikutnya).
3. Target Pengguna
Pengguna utama adalah siswa SMA/SMK usia 15–19 tahun yang sudah mengelola uang saku sendiri, aktif di media sosial, dan mudah terpengaruh tren serta teman sebaya.
Persona
Gambaran
Kebutuhan dari Finture
Raka, 16, siswa SMA
Uang saku harian, sering ikut nongkrong, suka beli barang viral
Latihan menolak ajakan tanpa merasa tertinggal
Salsa, 17, siswi SMK
Paham menabung, tapi tergoda flash sale skincare
Melihat dampak pembelian kecil yang berulang
Bu Rina, guru ekonomi (pengguna sekunder)
Butuh media ajar literasi keuangan yang menarik
Game yang bisa dimainkan siswa di kelas lewat link
Konteks penggunaan: HP Android kelas menengah (RAM 3–4 GB), layar 360–430 px, kuota internet terbatas, dimainkan di kelas atau di rumah.
4. Alur Pengguna
Satu sesi berjalan dari login sampai evaluasi; pemain bisa melanjutkan sesi yang belum selesai karena progres disimpan di database.
flowchart TD
  A[Splash & Login] --> B[Halaman Utama]
  B --> C[Peraturan Bermain]
  B --> D[Pilih Karakter]
  C --> D
  D --> E[Peta / Papan 3D]
  E --> F[Lempar Dadu & Pion Jalan]
  F --> G[Kartu Keputusan]
  G --> H[Pilih Tindakan]
  H --> I[Konsekuensi]
  I --> J{Garis finish?}
  J -- Belum --> E
  J -- Ya --> K[Hasil Akhir]
  K --> L[Refleksi]
  L --> M[Evaluasi & Materi]
  M --> B
Risiko jangka panjang muncul sebagai peringatan setelah pola keputusan yang sama terjadi 3 kali (misalnya 3 kali membeli karena FOMO).
5. Kebutuhan Fitur
Semua 11 fitur dari proposal masuk MVP; ditambah fitur Login (P0) karena data disimpan di Supabase. P0 = wajib ada saat uji pengguna, P1 = pendukung.
ID
Fitur
Prioritas
Kriteria diterima
F0
Login & Profil
P0
Login Google atau email magic link; profil berisi nama panggilan, sekolah (opsional), avatar
F1
Halaman Utama
P0
Tombol Main, Lanjutkan (jika ada sesi aktif), Peraturan, Riwayat, Profil; latar 3D ringan berputar
F2
Peraturan Bermain
P0
Maksimal 5 slide geser dengan ilustrasi; bisa dilewati; tersedia lagi dari menu jeda
F3
Pemilihan Karakter
P0
4 karakter 3D bisa diputar; tampil uang saku, kebutuhan, keinginan, target; tombol Pilih
F4
Peta Permainan
P0
Papan 3D 30 petak, kamera mengikuti pion, HUD berisi uang, tabungan, progres target, hari ke-n
F5
Kartu Keputusan
P0
Kartu 3D terbalik dengan animasi flip; berisi judul, cerita singkat, kategori, dan ilustrasi
F6
Penentuan Keputusan
P0
2–3 pilihan dengan dampak tersembunyi sampai dipilih; tidak bisa dibatalkan setelah konfirmasi
F7
Konsekuensi Keputusan
P0
Animasi koin naik/turun, perubahan angka, dan 1 kalimat penjelasan "kenapa"
F8
Risiko Jangka Panjang
P1
Peringatan muncul setelah pola yang sama 3 kali, berisi proyeksi dampak 1 bulan/1 tahun
F9
Refleksi
P0
3 pertanyaan singkat (pilihan + isian opsional) tentang keputusan terbesar di sesi
F10
Hasil Akhir
P0
Uang tersisa, tabungan, target tercapai atau tidak, skor total, animasi selebrasi
F11
Evaluasi
P0
Grafik radar 5 aspek, profil/julukan pemain, rekomendasi dan materi singkat sesuai aspek terlemah
F12
Riwayat Permainan
P1
Daftar sesi sebelumnya dengan skor dan tanggal
Aturan umum
• Sesi otomatis tersimpan setiap giliran; menutup browser tidak menghilangkan progres.
• Semua teks memakai bahasa santai remaja, tanpa menggurui.
6. Mekanik Game
Pemain punya 30 hari (30 petak) untuk mencapai target tabungan karakter tanpa kehabisan uang; setiap petak adalah satu hari.
Giliran
1. Tekan dadu 3D (nilai 1–3, agar pemain tetap melewati banyak skenario).
2. Pion melompat petak demi petak; uang saku harian otomatis masuk setiap melewati petak "Gajian" (tiap 7 hari).
3. Petak tempat berhenti memicu kartu sesuai jenisnya.
4. Pemain memilih tindakan, lalu melihat konsekuensi.
Jenis petak
Petak
Warna
Jumlah
Isi
Kebutuhan
Hijau
7
Kebutuhan sekolah, makan, transportasi
Keinginan
Kuning
6
Barang/aktivitas yang diinginkan
FOMO
Ungu
5
Tren viral, ajakan teman, konser
Belanja / Flash sale
Merah muda
4
Diskon, checkout impulsif
Tabung
Biru
3
Kesempatan menyisihkan uang
Kejutan
Oranye
3
Pengeluaran/pemasukan tak terduga
Gajian
Emas
2
Uang saku mingguan masuk
Statistik pemain
• Uang saku (Rp), Tabungan (Rp), Progres target (%).
• 5 skor aspek tersembunyi (0–100, mulai 50): Kebutuhan vs Keinginan, Kendali Impuls, Tahan FOMO, Prioritas, Kebiasaan Menabung.
• Setiap pilihan mengubah uang/tabungan dan 1–2 skor aspek.
Kondisi akhir
• Menang: sampai petak 30 dengan tabungan ≥ target.
• Selesai tanpa target: sampai petak 30 tetapi tabungan kurang.
• Bangkrut: uang Rp0 saat kartu Kebutuhan muncul; pemain boleh memakai tabungan (skor Prioritas turun) atau sesi berakhir.
Skor total = rata-rata 5 aspek × 0,7 + persentase target × 0,3 (skala 0–100).
Profil evaluasi berdasarkan skor total: Si Boros (<40), Si Galau (40–59), Si Cermat (60–79), Si Bijak Finansial (≥80).
7. Konten
MVP butuh 4 karakter dan minimal 40 kartu skenario (sekitar 8 per jenis petak) agar sesi ulang tidak terasa sama.
Karakter
Karakter
Latar
Uang saku/minggu
Uang awal
Target
Dimas, anak gamer
SMA, suka top-up game
Rp150.000
Rp50.000
Headset Rp300.000
Nayla, beauty enthusiast
SMA, ikut tren skincare
Rp175.000
Rp75.000
Laptop bekas (DP) Rp400.000
Bima, anak SMK
Ongkos transport tinggi
Rp200.000
Rp25.000
Alat praktik Rp350.000
Kirana, anak organisasi
Sering ada iuran & acara
Rp160.000
Rp60.000
Study tour Rp450.000
Contoh kartu skenario
Petak
Situasi
Pilihan → dampak
FOMO
Teman-teman mau nonton konser, tiket Rp250.000
Ikut (−Rp250.000, Tahan FOMO −15) · Tolong titip merch saja (−Rp50.000, −5) · Tolak, ajak nobar gratis (Tahan FOMO +10)
Belanja
Flash sale sepatu 60% sisa 5 menit
Checkout sekarang (−Rp180.000, Kendali Impuls −15) · Masukkan wishlist dulu (+10)
Kebutuhan
Buku paket wajib Rp85.000
Beli (−Rp85.000, Prioritas +10) · Tunda, beli jajan dulu (Prioritas −15, risiko denda di kartu berikutnya)
Keinginan
Boba baru launching Rp28.000
Beli (−Rp28.000, Kebutuhan vs Keinginan −5) · Bawa minum dari rumah (+5)
Tabung
Sisa uang minggu ini Rp40.000
Tabung semua (+Rp40.000 ke tabungan, Menabung +10) · Tabung separuh (+5) · Tidak (−5)
Kejutan
HP jatuh, layar retak Rp120.000
Pakai uang saku · Pakai tabungan (dampak berbeda ke Prioritas)
Isi kartu disimpan di tabel database agar tim bisa menambah atau mengubah skenario tanpa mengubah kode.
Materi evaluasi: 5 kartu materi (1 per aspek), masing-masing ±150 kata + 1 tips praktis, ditampilkan sesuai aspek terlemah pemain.
8. Desain Visual & Style Guide
Arah visual: "toy-like 3D adventure" — papan dan pion bergaya low-poly membulat seperti mainan, warna cerah, UI kartu tebal yang mudah disentuh. Bagian ini draf awal dan akan disesuaikan dengan mockup acuan tim setelah gambar dibagikan.
Palet warna
Token
Hex
Pemakaian
primary
#5B3FFF
Tombol utama, aksen brand
secondary
#FFB020
Koin, uang, highlight
success
#22C55E
Petak Kebutuhan, dampak positif
danger
#F43F5E
Dampak negatif, peringatan
fomo
#A855F7
Petak FOMO
save
#3B82F6
Petak Tabung, tabungan
bg-sky
#EAF2FF → #C7DBFF
Latar gradasi langit
ink
#1E1B3A
Teks utama
card
#FFFFFF
Permukaan kartu & panel
Tipografi
• Judul: Fredoka (600–700), ukuran 24–32 px — bulat dan ramah.
• Isi: Plus Jakarta Sans (400–600), ukuran 14–16 px.
• Angka uang: Plus Jakarta Sans tabular, format Rp dengan titik ribuan.
Komponen UI
• Tombol: tinggi min. 48 px, radius 16 px, bayangan bawah tebal 4 px (efek "chunky"), tekan = turun 2 px.
• Kartu keputusan: radius 24 px, header berwarna sesuai jenis petak, ikon besar di tengah.
• HUD: bar atas transparan berisi avatar, uang, tabungan, dan progres target berbentuk bar.
• Bottom sheet untuk pilihan keputusan agar mudah dijangkau jempol.
• Ikon: Lucide (garis tebal) + ikon 3D kecil untuk koin dan celengan.
Gaya 3D (Three.js)
• Papan: pulau melayang berbentuk jalur berliku, 30 petak silinder pendek berwarna sesuai jenis, dekorasi toko, sekolah, kafe, dan bank sesuai tema petak.
• Pion: karakter chibi low-poly (≤ 3.000 poligon) dengan animasi idle, lompat, senang, sedih.
• Material: MeshToonMaterial / flat shading, bayangan lembut, tanpa tekstur berat.
• Kamera: sudut isometrik 45°, mengikuti pion dengan easing; cubit untuk zoom, geser untuk melihat papan.
Animasi kunci
Momen
Animasi
Lempar dadu
Dadu 3D berputar dengan fisika sederhana, 1–1,5 detik
Pion jalan
Lompat per petak dengan squash & stretch
Kartu muncul
Kartu terbang ke tengah layar lalu flip
Uang berubah
Koin 3D memancar/tersedot + angka menghitung naik/turun
Target tercapai
Confetti 3D + celengan pecah berisi bintang
Risiko jangka panjang
Layar sedikit gelap, awan badai di atas papan
Aksesibilitas: kontras teks ≥ 4.5:1, opsi "kurangi animasi", getar HP (haptic) opsional, suara bisa dimatikan.
9. Arsitektur Teknis
Rekomendasi stack: React + Vite dengan React Three Fiber (Three.js) untuk 3D, Supabase untuk login dan database, dan hosting statis di Vercel atau Netlify.
Lapisan
Teknologi
Catatan
Frontend
React + Vite + TypeScript
Build cepat, bundle kecil
3D
Three.js via React Three Fiber + drei
Model .glb terkompresi Draco
Animasi UI
Framer Motion / GSAP
Transisi layar, angka uang
State game
Zustand
Satu store: pemain, posisi, statistik
Styling
Tailwind CSS
Token warna dari style guide
Auth & DB
Supabase (Auth + Postgres + RLS)
Login Google & magic link
PWA
vite-plugin-pwa
Bisa "Tambahkan ke layar utama", cache aset
Hosting
Vercel / Netlify
Gratis untuk skala prototipe
Analitik
Supabase tabel event atau Umami
Untuk metrik uji pengguna
flowchart LR
  A[Browser HP<br/>React + Three.js] -->|Auth| B[Supabase Auth]
  A -->|Baca kartu & karakter| C[(Supabase Postgres)]
  A -->|Simpan sesi & jawaban| C
  D[Vercel CDN] -->|HTML, JS, model .glb| A
Logika game (dadu, skor, konsekuensi) berjalan di client; setiap giliran disimpan ke database agar sesi bisa dilanjutkan.
Model data
Tabel
Kolom utama
profiles
id (= auth user), nickname, school, avatar, created_at
characters
id, name, background, weekly_allowance, start_money, target_name, target_amount, model_url
tiles
index (1–30), type
scenario_cards
id, tile_type, title, story, image_url, is_active
card_choices
id, card_id, label, money_delta, savings_delta, aspect_deltas (jsonb), explanation
game_sessions
id, user_id, character_id, position, day, money, savings, aspect_scores (jsonb), status, started_at, finished_at
session_decisions
id, session_id, card_id, choice_id, created_at
reflections
id, session_id, answers (jsonb)
learning_materials
id, aspect, title, body, tip
Semua tabel milik pengguna memakai Row Level Security: pemain hanya bisa membaca dan menulis datanya sendiri; tabel konten hanya bisa dibaca.
10. Non-Fungsional, Timeline, Risiko
Kebutuhan non-fungsional
• Performa: bundle JS awal ≤ 1 MB (gzip), total model 3D ≤ 5 MB, 30 fps di HP RAM 3 GB.
• Kompatibilitas: Chrome Android 100+ dan Safari iOS 15+; orientasi portrait terkunci, layar 360–430 px.
• Fallback: jika WebGL tidak tersedia, tampilkan papan 2D sederhana.
• Privasi: pengguna di bawah 18 tahun, jadi data dibatasi (tanpa nomor HP/alamat) dan ada persetujuan di awal.
• Keandalan: progres tersimpan per giliran; jika offline, simpan sementara lalu sinkron saat online.
Timeline (mengikuti rencana proposal ±3,5 minggu)
Tahap
Aktivitas
Durasi
PIC
Perancangan
Finalisasi PRD, style guide, konten kartu
2 hari
Kafkia
Pembuatan
Setup Supabase, UI, papan 3D, logika game, evaluasi
2 minggu
Aisyah
Uji internal
Uji alur, bug, performa di beberapa HP
3 hari
Dzakiyyah
Uji pengguna
Uji ke siswa SMA/SMK, pre/post-test, SUS
3 hari
Sania
Penyempurnaan
Perbaikan dari feedback, rilis final
2 hari
Nadia
Risiko
Risiko
Mitigasi
3D berat di HP murah
Low-poly, Draco, batasi bayangan, mode grafis rendah
Pembuatan model 3D memakan waktu
Pakai aset gratis (Kenney, Quaternius) lalu ubah warna
Tim non-programmer
Gunakan Claude Code/AI coding + template React Three Fiber
Konten kartu kurang variatif
Kartu diambil acak dari database, target 40+ kartu
Pertanyaan terbuka
[ ] Mockup acuan tim (lampiran proposal) perlu dibagikan untuk menyesuaikan warna, font, dan layout.
[ ] Apakah skor aspek ditampilkan selama bermain atau hanya di akhir?
[ ] Apakah perlu musik latar dan efek suara di MVP?
[ ] Domain apa yang dipakai (misalnya finture.id atau subdomain gratis)?

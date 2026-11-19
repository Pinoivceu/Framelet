# Product Requirements Document (PRD): Widget Embedding Platform

## 1. Problem Statement
Kreator konten Notion dan pemilik website umum kesulitan menyematkan elemen fungsional ringan (seperti jam, countdown, kutipan, cuaca, atau tracker progres) yang memiliki visual selaras dengan tema halaman mereka. 
* **Siapa yang dirugikan:** Kreator template Notion dan pengelola website mandiri (blog, portofolio, landing page).
* **Kenapa:** 
  1. Widget gratisan yang ada saat ini umumnya menyertakan *watermark* besar, iklan mengganggu, atau mengunci kustomisasi dasar (seperti *dark mode* dan pemilihan *font*) di balik paywall.
  2. Membangun dan meng-hosting komponen mandiri membutuhkan kemampuan coding dan infrastruktur sendiri, sementara menempelkan kode mentah secara langsung di Notion tidak didukung sehingga wajib melalui mekanisme `<iframe>` eksternal yang responsif dan ringan.

---

## 2. Target User (2 Persona)

### Persona A: Kreator Template Notion (Rina, 24 tahun)
* **Profil:** Desainer produk dan penjual template produktivitas Notion di Gumroad/Lynk.id.
* **Kebutuhan:** Membutuhkan widget estetik (jam minimalis, *countdown* peluncuran/deadline, *daily quotes*) yang memiliki dukungan *dark mode* sejati dan pilihan tipografi bersih agar menyatu mulus dengan *aesthetic* workspace Notion-nya.
* **Pain Point:** Frustrasi saat pembeli templatenya mengeluhkan widget bawaan pihak ketiga rusak, lambat dimuat, atau memiliki background putih mencolok saat Notion diubah ke mode gelap.

### Persona B: Pemilik Website / Portofolio Mandiri (Dimas, 27 tahun)
* **Profil:** Freelancer/developer yang mengelola blog pribadi dan landing page menggunakan static site generator atau website builder.
* **Kebutuhan:** Ingin menyisipkan elemen dinamis (seperti status waktu lokal, *countdown* ketersediaan proyek, atau *habit/goal progress bar*) cukup dengan menyalin satu baris kode `<iframe>` tanpa perlu menulis komponen frontend tambahan.
* **Pain Point:** Tidak mau menghabiskan waktu untuk konfigurasi backend atau membayar langganan bulanan hanya untuk menyematkan elemen UI sederhana.

---

## 3. Goals & Non-Goals

### Goals (MVP)
1. Menyediakan alur *end-to-end* pembuatan, kustomisasi visual, hingga penyalinan link/kode embed `<iframe>` dalam waktu kurang dari 2 menit.
2. Menyediakan 5 jenis widget fungsional yang mendukung konfigurasi tipografi (*font*) dan tema (*light/dark/auto mode*).
3. Memastikan seluruh fitur MVP dapat diakses 100% gratis tanpa sistem *paywall* atau batasan kuota akun.
4. Menyediakan autentikasi cepat dan aman menggunakan Google OAuth dan Magic Link melalui Supabase Auth.
5. Mencapai status *production-ready* bebas bug pada seluruh *critical user flow* (autentikasi, CRUD widget, pratinjau *real-time*, dan rendering publik via `<iframe>`).

### Non-Goals (MVP)
1. **Monetisasi & Billing:** Tidak ada integrasi payment gateway, paket langganan, atau penguncian fitur (*feature gating*).
2. **Injeksi Script Langsung (`<script>`):** Tidak mendukung *DOM injection* langsung ke host website; rendering publik eksklusif menggunakan `<iframe>`.
3. **Analitik Lanjutan:** Tidak ada pelacakan *pageviews*, *impression*, atau *click-through rate* (CTR) pada widget yang di-embed.
4. **Custom Domain & Custom CSS:** User tidak dapat menautkan domain sendiri atau menulis kode CSS/JS mentah di dalam editor.
5. **Kolaborasi Tim:** Tidak ada fitur *multi-user workspace*, manajemen peran (*RBAC*), atau berbagi akses edit antar akun.

---

## 4. User Stories
1. **Sebagai** kreator Notion, **saya ingin** masuk ke platform menggunakan akun Google atau Magic Link email, **supaya** saya tidak perlu mengingat password baru dan bisa langsung mengelola koleksi widget saya.
2. **Sebagai** user terdaftar, **saya ingin** memilih dari 5 template widget dasar (Clock, Countdown, Quote, Progress Bar, dan Pomodoro/Focus Timer), **supaya** saya bisa langsung membuat elemen fungsional sesuai kebutuhan halaman saya.
3. **Sebagai** kreator yang peduli estetika, **saya ingin** mengubah jenis *font* dan mengatur mode warna (*Light*, *Dark*, atau *System/Transparent*) dengan pratinjau langsung, **supaya** tampilan widget menyatu sempurna dengan desain Notion atau website saya.
4. **Sebagai** pengguna Notion dan website umum, **saya ingin** mendapatkan URL langsung (untuk Notion `/embed`) sekaligus potongan kode HTML `<iframe>` siap pakai, **supaya** saya bisa menyematkannya di platform mana pun hanya dengan sekali klik salin.
5. **Sebagai** pemilik widget, **saya ingin** mengedit konfigurasi widget yang sudah pernah saya sematkan dan melihat perubahannya otomatis terbarui di Notion/website tanpa perlu mengganti link embed, **supaya** pemeliharaan konten menjadi praktis.
6. **Sebagai** user, **saya ingin** menghapus widget yang sudah tidak digunakan dari dashboard saya, **supaya** daftar proyek saya tetap rapi.

---

## 5. Daftar Fitur (MVP vs v2 vs Nanti)

| Kategori | MVP (Rilis Awal) | v2 (Iterasi Berikutnya) | Nanti (Future Roadmap) |
| :--- | :--- | :--- | :--- |
| **Autentikasi & Akun** | Login via Google OAuth & Email Magic Link (Supabase Auth); manajemen profil dasar. | Hapus akun mandiri; integrasi login GitHub. | Multi-user team workspace & transfer kepemilikan widget. |
| **Katalog Widget** | **5 Widget Simple:**<br>1. Digital/Analog Clock<br>2. Event Countdown<br>3. Daily/Custom Quote<br>4. Goal Progress Bar<br>5. Minimalist Pomodoro Timer | Tambahan widget berbasis data eksternal (Cuaca/Weather, Spotify Now Playing, GitHub Contribution). | Custom HTML/CSS/JS sandbox widget builder. |
| **Kustomisasi Visual** | Pemilihan *Font* (Sans, Serif, Mono, Rounded); pengaturan *Theme Mode* (Light, Dark, System Auto); kustomisasi warna aksen & konten spesifik widget. | Custom palet warna penuh (*background*, *border*, *text color*), pengaturan *border-radius* dan *padding*. | Custom CSS editor & upload font eksternal. |
| **Distribusi & Embed** | Salin URL Embed (untuk Notion) & kode `<iframe src="...">`; halaman render publik ringan (`/embed/[id]`). | Parameter URL override (misal `?theme=dark` langsung di URL embed); generator ukuran responsif otomatis. | Custom domain (`widgets.domainanda.com`) & injeksi `<script>` ringan. |
| **Manajemen & Data** | Dashboard daftar widget; *real-time live preview* di editor; simpan, edit, dan hapus widget. | Duplikasi (clone) widget; folder/tag pengelompokan widget. | Analitik tampilan (*views* & interaksi) per widget; API publik untuk update data dinamis (misal update angka Progress Bar via webhook). |

---

## 6. Functional Requirements (Detail per Fitur MVP)

### 6.1. Autentikasi (Supabase Auth)
* **FR-1.1:** Sistem menyediakan halaman `/login` dengan dua opsi: tombol *"Continue with Google"* dan form input email untuk *"Send Magic Link"*.
* **FR-1.2:** Jika email tidak valid, sistem menampilkan pesan validasi inline sebelum mengirim permintaan ke Supabase.
* **FR-1.3:** Setelah klik Magic Link atau otorisasi Google berhasil, sesi disimpan secara aman via HTTP-only cookies (Next.js SSR/Middleware) dan user diarahkan ke `/dashboard`.
* **FR-1.4:** Route `/dashboard` dan `/editor/*` wajib dilindungi middleware; akses tanpa sesi aktif otomatis diarahkan ke `/login`.

### 6.2. Dashboard Manajemen Widget
* **FR-2.1:** Menampilkan daftar seluruh widget milik user yang sedang login (menampilkan nama widget, tipe widget, tanggal terakhir diubah, dan tombol aksi: *Edit*, *Copy Link*, *Delete*).
* **FR-2.2:** Menampilkan *empty state* dengan tombol CTA *"Buat Widget Pertama"* jika user belum memiliki widget.
* **FR-2.3:** Menghapus widget wajib menampilkan dialog konfirmasi karena aksi ini akan membuat URL embed terkait berhenti menampilkan widget.

### 6.3. Katalog & Konfigurasi 5 Widget MVP
Setiap widget memiliki konfigurasi global (**Judul Widget**, **Font Family**: `Inter`, `Playfair Display`, `JetBrains Mono`, `Nunito`; **Theme Mode**: `Light`, `Dark`, `System`) ditambah konfigurasi spesifik berikut:
1. **Clock Widget:** Format waktu (12-jam / 24-jam), tampilkan detik (Ya/Tidak), tampilkan tanggal (Ya/Tidak), pilihan zona waktu (Auto Local / IANA Timezone).
2. **Countdown Widget:** Judul acara/target, tanggal & waktu target, teks pesan saat waktu habis (*completion message*).
3. **Quote Widget:** Mode sumber (Daftar kutipan acak harian atau teks kutipan & nama penulis kustom), perataan teks (kiri/tengah).
4. **Progress Bar Widget:** Label target, nilai saat ini (*current value*), nilai target (*max value*), format tampilan angka (persentase `%` atau rasio `X/Y`), warna aksen bar.
5. **Pomodoro Timer Widget:** Durasi fokus (default 25 menit), durasi istirahat singkat (default 5 menit), kontrol interaktif Start/Pause/Reset langsung di dalam area render widget.

### 6.4. Live Editor & Mekanisme Embed
* **FR-4.1:** Halaman editor terbagi menjadi dua panel: Panel Kiri (form konfigurasi) dan Panel Kanan (pratinjau *real-time* yang merefleksikan perubahan *font*, *dark mode*, dan data widget secara instan tanpa reload).
* **FR-4.2:** Menyediakan tombol toggle di panel pratinjau untuk mensimulasikan tampilan host dalam mode Terang (*Light*) maupun Gelap (*Dark*).
* **FR-4.3:** Saat tombol *"Simpan"* diklik, konfigurasi disimpan ke database Supabase dan menghasilkan/memperbarui ID unik widget.
* **FR-4.4:** Modal/panel *"Embed"* menyediakan dua opsi salin sekali klik:
  * **Direct URL:** `https://[domain]/embed/[widget_id]` (untuk ditempel langsung ke blok `/embed` di Notion).
  * **HTML Iframe Snippet:** `<iframe src="https://[domain]/embed/[widget_id]" width="100%" height="200" frameborder="0" style="border:none; overflow:hidden;"></iframe>`.

### 6.5. Public Embed Renderer (`/embed/[widget_id]`)
* **FR-5.1:** Halaman `/embed/[widget_id]` dapat diakses secara publik tanpa memerlukan login.
* **FR-5.2:** Halaman ini merender komponen widget murni tanpa navbar, footer, atau chrome dashboard aplikasi.
* **FR-5.3:** Header HTTP response pada route `/embed/*` dikonfigurasi agar mengizinkan penyematan lintas origin (`X-Frame-Options` dihapus atau diganti `Content-Security-Policy: frame-ancestors *`).
* **FR-5.4:** Konfigurasi `Theme Mode: System` mendeteksi preferensi warna browser/OS melalui `prefers-color-scheme` dan menyesuaikan tampilan latar belakang serta warna teks widget secara otomatis.

---

## 7. Sketsa Data Model (Supabase / PostgreSQL)

### Tabel 1: `profiles` (Terhubung ke `auth.users`)
* `id` (`uuid`, Primary Key, Foreign Key -> `auth.users.id`, `ON DELETE CASCADE`)
* `email` (`text`, Not Null)
* `full_name` (`text`, Nullable)
* `avatar_url` (`text`, Nullable)
* `created_at` (`timestamptz`, Default `now()`)

### Tabel 2: `widgets`
* `id` (`uuid`, Primary Key, Default `gen_random_uuid()`) — *Digunakan sebagai identifier publik pada URL `/embed/[id]`*
* `user_id` (`uuid`, Foreign Key -> `profiles.id`, `ON DELETE CASCADE`, Indexed)
* `title` (`text`, Not Null, Default `'Untitled Widget'`)
* `type` (`enum`: `'clock' | 'countdown' | 'quote' | 'progress' | 'pomodoro'`, Not Null)
* `theme_mode` (`enum`: `'light' | 'dark' | 'system'`, Not Null, Default `'system'`)
* `font_family` (`enum`: `'sans' | 'serif' | 'mono' | 'rounded'`, Not Null, Default `'sans'`)
* `config` (`jsonb`, Not Null) — *Menyimpan properti spesifik tiap tipe widget (misal: `{"targetDate": "...", "showSeconds": true}`)*
* `created_at` (`timestamptz`, Default `now()`)
* `updated_at` (`timestamptz`, Default `now()`)

### Row Level Security (RLS) Policies:
* `profiles`: User hanya dapat membaca dan memperbarui baris dengan `auth.uid() = id`.
* `widgets`: 
  * `SELECT`: Terbuka untuk publik (`true`) agar route `/embed/[id]` dapat membaca konfigurasi widget tanpa autentikasi (pastikan query hanya mengekspos kolom publik, bukan `user_id` di payload klien jika tidak diperlukan).
  * `INSERT`, `UPDATE`, `DELETE`: Hanya diizinkan jika `auth.uid() = user_id`.

---

## 8. Edge Case & Failure State

| Skenario / Edge Case | Perilaku Sistem & Penanganan Error |
| :--- | :--- |
| **Widget ID tidak ditemukan / sudah dihapus** saat dibuka di Notion atau website eksternal (`/embed/invalid-id`). | Jangan tampilkan halaman 404 bawaan Next.js yang berantakan. Render komponen fallback minimalis berukuran kecil dengan pesan netral: *"Widget tidak tersedia atau telah dihapus."* |
| **Perbedaan kontras background di Notion Dark Mode** saat user memilih latar transparan/adaptif. | Pastikan warna teks dan elemen UI memiliki rasio kontras memadai (minimal WCAG AA) baik pada latar `#FFFFFF` (Notion Light) maupun `#191919` (Notion Dark). |
| **Magic Link kadaluarsa atau sudah pernah diklik** (masalah umum *email link prefetching* oleh scanner keamanan email). | Tangani error callback Supabase Auth secara eksplisit di halaman `/login` dengan pesan jelas: *"Link login sudah kadaluarsa atau tidak valid. Silakan minta link baru."* |
| **Target waktu Countdown sudah lewat** saat halaman embed dimuat. | Widget tidak menampilkan angka negatif (`-1 hari -2 jam`). Otomatis beralih ke *completion state* (menampilkan `00:00:00` atau pesan selesai yang dikonfigurasi user). |
| **Nilai Progress Bar di luar batas wajar** (misal `current_value > max_value` atau `max_value <= 0`). | Validasi di form input agar `max_value` minimal `1`. Jika `current_value > max_value`, visual bar dikunci penuh di `100%` sementara label rasio tetap menampilkan angka aktual (misal `120/100`). |
| **Koneksi terputus saat user menekan tombol Simpan** di Editor. | Nonaktifkan tombol simpan selama request berjalan (*loading state*), tangkap error jaringan, tampilkan notifikasi toast gagal simpan, dan pertahankan state form di browser agar pekerjaan user tidak hilang. |
| **Ukuran container iframe terlalu sempit** di perangkat mobile atau kolom sempit Notion. | Seluruh 5 komponen widget wajib menggunakan layout responsif fleksibel (*flexbox/grid* dengan satuan relatif) sehingga tidak memunculkan *horizontal scrollbar* pada lebar minimal `250px`. |

---

## 9. Success Metrics (Kriteria Keberhasilan & Definition of Done)

Karena rilis ini berfokus pada kesiapan fungsional penuh (*bug-free end-to-end flow*), keberhasilan diukur melalui **Technical & Functional Acceptance Metrics** berikut:
1. **100% Critical Flow Completion (QA Pass Rate):** Seluruh alur utama (Login Google/Magic Link -> Buat 5 jenis widget -> Ubah Font & Dark Mode -> Simpan -> Embed di halaman Notion & HTML statis -> Edit ulang & verifikasi auto-update -> Hapus widget) berjalan sukses tanpa error console atau HTTP 500.
2. **Zero Cross-Origin Embed Blockers:** 100% dari 5 widget berhasil di-render di dalam Notion web/desktop app serta browser modern (Chrome, Firefox, Safari) tanpa pemblokiran CSP/`X-Frame-Options`.
3. **Widget Load Performance:** Waktu muat awal halaman publik `/embed/[id]` (Time to First Byte & First Contentful Paint) di bawah **1.0 detik** pada koneksi standar.
4. **Activation Rate (Pasca-Rilis Awal):** Minimal **70%** user yang berhasil login menyelesaikan pembuatan minimal 1 widget dan menyalin kode/URL embed-nya.

---

## 10. Open Questions
1. **Background Transparan vs Solid pada Tema Dark/Light:** Pada halaman Notion, warna latar belakang *dark mode* spesifik adalah `#191919` (bukan hitam pekat `#000000`). Apakah opsi tema widget di MVP akan menggunakan latar belakang **transparan penuh** (mengikuti warna latar container Notion/website secara otomatis) atau menggunakan **warna latar solid** bawaan masing-masing tema?
2. **Persistensi State pada Widget Interaktif (Pomodoro):** Saat pengunjung menekan tombol *Start* pada Pomodoro Timer di dalam halaman Notion/website yang di-embed, apakah status timer cukup berjalan di memori browser lokal pengunjung (*client-side only*, reset saat halaman di-refresh), atau perlu disimpan di `localStorage` browser pengunjung agar tidak reset saat pindah halaman?
3. **Tinggi Default Iframe (`height`):** Setiap jenis widget memiliki kebutuhan tinggi vertikal berbeda (misalnya Progress Bar hanya butuh ~100px, sedangkan Clock + Tanggal atau Pomodoro butuh ~220px). Apakah snippet HTML `<iframe>` yang digenerate harus menyesuaikan nilai atribut `height` secara otomatis berdasarkan jenis widget yang dipilih?
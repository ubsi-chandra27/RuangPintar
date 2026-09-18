import React from "react";
import Link from "next/link";
import Image from "next/image";
import { getCurrentUser } from "@/shared/infrastructure/auth/auth-guard";
import { logoutAction } from "@/app/actions/auth-actions";
import {
  Sparkles,
  Camera,
  BookOpen,
  Users,
  CheckCircle2,
  Star,
  ShieldCheck,
  ArrowRight,
  Smartphone,
  School,
  Clock,
  FileSpreadsheet,
  Award,
  MessageCircle,
  HelpCircle,
  LogOut,
  LayoutDashboard,
  Check,
  Zap,
} from "lucide-react";

export default async function LandingPage() {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 selection:bg-blue-600 selection:text-white font-sans antialiased">
      {/* 1. STICKY TOP NAVBAR */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 sm:h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="size-10 sm:size-11 rounded-xl bg-white border border-slate-200/90 p-1.5 shadow-sm shadow-blue-500/10 flex items-center justify-center transition-transform group-hover:scale-105">
              <Image
                src="/images/brand/ruang-pintar-mark.png"
                alt="Logo Ruang Pintar"
                width={32}
                height={32}
                priority
                className="size-auto object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight leading-tight">
                Ruang Pintar
              </span>
              <span className="text-[11px] font-medium text-blue-600 tracking-wide uppercase">
                School Digital Platform
              </span>
            </div>
          </Link>

          {/* Center Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#fitur" className="hover:text-blue-600 transition-colors">
              Fitur Unggulan
            </a>
            <a href="#testimoni" className="hover:text-blue-600 transition-colors">
              Testimoni Guru
            </a>
            <a href="#biaya" className="hover:text-blue-600 transition-colors">
              Coba Gratis & Lisensi
            </a>
            <a href="#faq" className="hover:text-blue-600 transition-colors">
              FAQ
            </a>
          </nav>

          {/* Auth Action Buttons */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold shadow-md shadow-blue-600/20 transition-all hover:shadow-blue-600/30"
                >
                  <LayoutDashboard className="size-4" />
                  <span>Dashboard Saya</span>
                </Link>
                <form action={logoutAction} className="hidden sm:inline-block">
                  <button
                    type="submit"
                    className="size-10 flex items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-rose-50 hover:border-rose-200 text-slate-600 hover:text-rose-600 transition-colors cursor-pointer"
                    title="Keluar"
                  >
                    <LogOut className="size-4" />
                  </button>
                </form>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-blue-600 px-3 py-2 transition-colors"
                >
                  Masuk Akun
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold shadow-md shadow-blue-600/20 transition-all hover:shadow-blue-600/30 active:scale-95"
                >
                  <Sparkles className="size-3.5 text-blue-200" />
                  <span>Coba Gratis 30 Hari</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
        {/* Decorative Background Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[500px] sm:size-[700px] bg-gradient-to-tr from-blue-400/20 via-sky-300/15 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-10 right-10 size-72 bg-amber-300/10 rounded-full blur-2xl pointer-events-none -z-10" />

        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-blue-50/90 px-3.5 py-1 text-xs font-semibold text-blue-700 shadow-sm backdrop-blur-md mb-6">
            <span className="flex size-2 rounded-full bg-blue-600 animate-pulse" />
            <span>Platform SaaS Operasional Sekolah & Asisten AI Guru</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15] sm:leading-[1.12]">
            Otomasi Absensi & Nilai Sekolah{" "}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              dalam 5 Detik.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mt-5 sm:mt-6 max-w-3xl text-sm sm:text-lg text-slate-600 leading-relaxed">
            Membantu ribuan guru dan pimpinan sekolah di Indonesia bebas dari tumpukan kertas. Cukup{" "}
            <strong>foto lembar absensi kelas</strong> dengan HP, asisten AI Ruang Pintar otomatis
            membuat rombel, merekap presensi, dan mengolah buku nilai berstandar Kurikulum Merdeka.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4">
            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white px-7 py-4 text-base font-bold shadow-xl shadow-blue-600/25 transition-all hover:shadow-blue-600/35 hover:-translate-y-0.5"
            >
              <span>Mulai Coba Gratis 30 Hari</span>
              <ArrowRight className="size-5 text-blue-200" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200/90 bg-white/90 hover:bg-slate-50 text-slate-800 px-6 py-4 text-base font-bold shadow-sm transition-all hover:border-slate-300"
            >
              <span>Sudah Punya Akun? Masuk</span>
            </Link>
          </div>

          {/* Trust Guarantees */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs sm:text-sm text-slate-500 font-medium">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-emerald-600" />
              <span>Tanpa Kartu Kredit</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-emerald-600" />
              <span>Aktivasi 30 Detik</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-emerald-600" />
              <span>Standar Kurikulum Merdeka</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-emerald-600" />
              <span>Data Aman & Terisolasi</span>
            </div>
          </div>

          {/* Interactive Feature Mockup Banner */}
          <div className="mt-12 sm:mt-16 rounded-3xl border border-slate-200/90 bg-white/95 p-4 sm:p-7 shadow-2xl shadow-slate-900/10 backdrop-blur-xl">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-3 text-left">
                <div className="size-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-xs">
                  <Camera className="size-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                      Vision AI Onboarding
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                      ⚡ 5 Detik Selesai
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    Foto Absensi Kertas ➔ Menjadi Kelas Digital Siap Pakai
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200">
                  Didukung Gemini Multimodal AI
                </span>
              </div>
            </div>

            {/* Mockup Preview Grid */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                <span className="text-xs font-bold text-slate-400">LANGKAH 1</span>
                <p className="mt-1 text-sm font-semibold text-slate-800">1. Foto Lembar Absensi</p>
                <p className="text-xs text-slate-500 mt-1">
                  Ambil foto kertas daftar hadir kelas Anda menggunakan kamera HP biasa.
                </p>
              </div>
              <div className="rounded-2xl border border-blue-200 bg-blue-50/40 p-4 shadow-xs">
                <span className="text-xs font-bold text-blue-600">LANGKAH 2 (OTOMATIS)</span>
                <p className="mt-1 text-sm font-semibold text-slate-900">2. AI Ekstraksi Data</p>
                <p className="text-xs text-slate-500 mt-1">
                  AI membaca nama murid, jenis kelamin, dan nomor absen secara instan.
                </p>
              </div>
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-xs">
                <span className="text-xs font-bold text-emerald-700">LANGKAH 3</span>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  3. Kelas Siap Digunakan!
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Langsung lakukan presensi harian, jurnal mengajar, dan isi buku nilai.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CORE FEATURES SECTION */}
      <section id="fitur" className="py-16 sm:py-24 bg-white border-y border-slate-200/80">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Solusi Terpadu
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Dibuat Khusus untuk Menyelesaikan Kerumitan Guru & Sekolah
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Satu ekosistem lengkap yang menghubungkan guru, wali kelas, kurikulum, dan kepala
              sekolah tanpa kerja dobel.
            </p>
          </div>

          <div className="mt-12 sm:mt-16 grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {/* Feature 1 */}
            <div className="group rounded-3xl border border-slate-200/90 bg-slate-50/50 p-6 sm:p-8 hover:bg-white hover:shadow-xl hover:shadow-blue-500/5 transition-all">
              <div className="size-12 rounded-2xl bg-blue-100/70 border border-blue-200 flex items-center justify-center text-blue-700 mb-5 group-hover:scale-110 transition-transform">
                <Camera className="size-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                Photo-to-Class Vision AI Agent
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Tidak perlu mengetik satu per satu nama 36 siswa di kelas. Cukup foto lembar kertas
                absensi Anda, kecerdasan buatan kami langsung mengubahnya menjadi daftar siswa
                digital lengkap dengan opsi pratinjau sebelum disimpan.
              </p>
              <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-blue-600">
                <span>Ekstraksi Cerdas</span>
                <span>•</span>
                <span>Anti Typo</span>
                <span>•</span>
                <span>Hemat 2 Jam Waktu Ketik</span>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group rounded-3xl border border-slate-200/90 bg-slate-50/50 p-6 sm:p-8 hover:bg-white hover:shadow-xl hover:shadow-blue-500/5 transition-all">
              <div className="size-12 rounded-2xl bg-emerald-100/70 border border-emerald-200 flex items-center justify-center text-emerald-700 mb-5 group-hover:scale-110 transition-transform">
                <FileSpreadsheet className="size-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                Buku Nilai (Leger) & TP Kurikulum Merdeka
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Leger nilai terpadu 3-tier standar nasional. Menghitung rata-rata kelas, persentase
                ketuntasan Tujuan Pembelajaran (TP), dan rekomendasi tindak lanjut secara otomatis.
                Bisa diunduh ke format Excel dengan satu klik.
              </p>
              <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-emerald-700">
                <span>Kalkulasi Otomatis</span>
                <span>•</span>
                <span>Export Excel / CSV</span>
                <span>•</span>
                <span>Cetak A4 Siap Pakai</span>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group rounded-3xl border border-slate-200/90 bg-slate-50/50 p-6 sm:p-8 hover:bg-white hover:shadow-xl hover:shadow-blue-500/5 transition-all">
              <div className="size-12 rounded-2xl bg-amber-100/70 border border-amber-200 flex items-center justify-center text-amber-700 mb-5 group-hover:scale-110 transition-transform">
                <Smartphone className="size-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                Desain Mobile-First untuk di Ruang Kelas
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Dibuat khusus agar nyaman dioperasikan dari layar HP sambil berdiri mengajar di
                depan kelas. Tombol presensi hadir, izin, sakit, dan alpa berukuran besar, cepat
                disentuh, dan langsung tersimpan secara instan.
              </p>
              <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-amber-700">
                <span>Ringan & Cepat</span>
                <span>•</span>
                <span>Hemat Kuota</span>
                <span>•</span>
                <span>Mudah untuk Guru Senior</span>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="group rounded-3xl border border-slate-200/90 bg-slate-50/50 p-6 sm:p-8 hover:bg-white hover:shadow-xl hover:shadow-blue-500/5 transition-all">
              <div className="size-12 rounded-2xl bg-indigo-100/70 border border-indigo-200 flex items-center justify-center text-indigo-700 mb-5 group-hover:scale-110 transition-transform">
                <School className="size-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                Skala Institusi & Rapor Resmi Sekolah
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Ketika sekolah Anda berlangganan resmi, semua data terintegrasi. Cetak Rapor Resmi
                Sekolah, pantau keterlaksanaan KBM oleh Kepala Sekolah, atur jadwal pelajaran
                anti-bentrok, dan kirim rekap kehadiran otomatis via WhatsApp ke nomor orang tua.
              </p>
              <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-indigo-700">
                <span>Multi-Role Institusi</span>
                <span>•</span>
                <span>WhatsApp Gateway</span>
                <span>•</span>
                <span>Subdomain Resmi Sekolah</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. REAL TESTIMONIALS SECTION */}
      <section id="testimoni" className="py-16 sm:py-24 bg-[#F8FAFC]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Kata Mereka yang Sudah Memakai
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Pengalaman Nyata Guru & Pimpinan Sekolah
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Dengarkan langsung cerita bagaimana Ruang Pintar mengembalikan waktu istirahat guru
              dan meningkatkan kedisiplinan sekolah.
            </p>
          </div>

          <div className="mt-12 sm:mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Testimonial 1 */}
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="size-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-700 leading-relaxed italic">
                  &ldquo;Dulu tiap akhir semester saya stres sampai begadang rekap absen dan nilai
                  dari lembar kertas ke Excel. Di Ruang Pintar, tinggal foto lembar kertas absen, 5
                  detik langsung jadi data rapi. Waktu istirahat bersama keluarga jadi tidak
                  terganggu lagi!&rdquo;
                </p>
              </div>

              <div className="mt-6 pt-5 border-t border-slate-100 flex items-center gap-3">
                <div className="size-11 rounded-full bg-gradient-to-tr from-pink-500 to-rose-400 text-white font-bold text-sm flex items-center justify-center shadow-xs">
                  WU
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Ibu Wardah Ulfah Fauzziyah, S.Pd.
                  </h4>
                  <p className="text-xs text-slate-500">Guru Matematika • SMA PGRI 1 Bekasi</p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="rounded-3xl border border-blue-200 bg-white p-6 sm:p-7 shadow-md shadow-blue-500/5 hover:shadow-lg transition-shadow flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full pointer-events-none -z-1" />
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="size-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-700 leading-relaxed italic">
                  &ldquo;Aplikasi ini luar biasa ringan dibuka lewat HP di ruang kelas bengkel dan
                  lab. Tampilan hurufnya jelas, tombolnya besar dan ramah sentuhan. Guru senior pun
                  langsung lancar pakai tanpa pusing urusan teknis.&rdquo;
                </p>
              </div>

              <div className="mt-6 pt-5 border-t border-slate-100 flex items-center gap-3">
                <div className="size-11 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-bold text-sm flex items-center justify-center shadow-xs">
                  EC
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Pak Eri Chandra Apriyadi, S.Kom.
                  </h4>
                  <p className="text-xs text-slate-500">Guru Kejuruan & Kaprog • SMK Otomindo</p>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="size-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-700 leading-relaxed italic">
                  &ldquo;Sebagai kepala sekolah, saya sangat terbantu karena jurnal mengajar guru
                  dan absensi siswa bisa dipantau real-time dari meja kerja. Sangat layak
                  dianggarkan secara resmi melalui Dana BOS sekolah.&rdquo;
                </p>
              </div>

              <div className="mt-6 pt-5 border-t border-slate-100 flex items-center gap-3">
                <div className="size-11 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold text-sm flex items-center justify-center shadow-xs">
                  SY
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Drs. H. Suryadi, M.M.</h4>
                  <p className="text-xs text-slate-500">Kepala Sekolah Mitra • Jawa Barat</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. PRICING & 30-DAY FREE TRIAL TRANSPARENCY */}
      <section id="biaya" className="py-16 sm:py-24 bg-white border-t border-slate-200/80">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Pilihan Lisensi & Biaya
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Mulai Gratis 30 Hari, Lanjut Sesuai Kebutuhan
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Transparan, tanpa biaya tersembunyi. Data Anda tetap aman tersimpan setelah masa coba
              berakhir.
            </p>
          </div>

          <div className="mt-12 sm:mt-16 grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
            {/* Plan 1: 30-Day Free Trial */}
            <div className="rounded-3xl border border-slate-200/90 bg-slate-50/50 p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Coba Gratis
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 text-xs font-bold">
                    30 Hari Penuh
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mt-2">Guru Starter (Trial)</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Untuk guru mandiri yang ingin mencoba kehebatan aplikasi di kelasnya.
                </p>

                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-slate-900">Rp 0</span>
                  <span className="text-xs text-slate-500 font-medium">/ 30 hari pertama</span>
                </div>

                <ul className="mt-6 space-y-3 text-xs sm:text-sm text-slate-600">
                  <li className="flex items-start gap-2.5">
                    <Check className="size-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>Maksimal 5 Rombel / Kelas Aktif</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="size-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>Photo-to-Class Vision AI (5x Scan)</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="size-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>Presensi & Jurnal Harian Lengkap</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="size-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>Buku Nilai & Ekspor ke Excel</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-slate-400">
                    <span>— Ujian Online (CBT) & WA Gateway</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8">
                <Link
                  href="/register"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white py-3 text-sm font-bold shadow-sm transition-all"
                >
                  <span>Daftar Coba Gratis Sekarang</span>
                </Link>
              </div>
            </div>

            {/* Plan 2: Guru Pro Mandiri */}
            <div className="rounded-3xl border border-blue-300 bg-blue-50/20 p-6 sm:p-8 flex flex-col justify-between shadow-md relative">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                    Mandiri Pendidik
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
                    Paling Terjangkau
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mt-2">Paket Guru Pro</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Untuk guru aktif yang ingin fitur lengkap tanpa menunggu keputusan sekolah.
                </p>

                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-blue-600">Rp 15.000</span>
                  <span className="text-xs text-slate-500 font-medium">/ bulan (ramah guru)</span>
                </div>

                <ul className="mt-6 space-y-3 text-xs sm:text-sm text-slate-700">
                  <li className="flex items-start gap-2.5 font-medium">
                    <Check className="size-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>Kelas & Jumlah Siswa Tanpa Batas</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="size-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>Vision AI Scan Absensi Tanpa Batas</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="size-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>CBT Ujian Online dengan Anti-Curang</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="size-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>Analisis Butir Soal & Diagnostik Remedial</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="size-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>Cetak Rapor Kemajuan Belajar Siswa</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8">
                <Link
                  href="/register"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white py-3 text-sm font-bold shadow-md shadow-blue-500/20 transition-all"
                >
                  <span>Mulai dengan Guru Pro</span>
                </Link>
              </div>
            </div>

            {/* Plan 3: Lisensi Sekolah Resmi (BOS) */}
            <div className="rounded-3xl border border-indigo-200 bg-gradient-to-b from-indigo-50/50 to-white p-6 sm:p-8 flex flex-col justify-between shadow-lg relative">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-indigo-600 text-white text-[11px] font-bold tracking-wide shadow-sm">
                REKOMENDASI PENGADAAN SEKOLAH
              </div>

              <div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">
                    Institusi Sekolah
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold">
                    Dana BOS Ready
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mt-2">Lisensi Sekolah Resmi</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Solusi penuh satu sekolah untuk Kepsek, Waka, TU, Guru, dan Orang Tua.
                </p>

                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-indigo-700">
                    Rp 1,5 Juta - 3 Juta
                  </span>
                  <span className="text-xs text-slate-500 font-medium">/ tahun per sekolah</span>
                </div>

                <ul className="mt-6 space-y-3 text-xs sm:text-sm text-slate-700">
                  <li className="flex items-start gap-2.5 font-bold text-indigo-900">
                    <Zap className="size-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <span>Semua Guru Otomatis Jadi Pro Tanpa Bayar</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="size-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <span>Jadwal Pelajaran Otomatis Anti-Bentrok</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="size-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <span>Cetak Rapor Resmi Nasional Kurikulum Merdeka</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="size-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <span>Notifikasi Presensi WhatsApp Otomatis ke Wali</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="size-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <span>Dokumen SPJ Resmi (Invoice, Kuitansi, BAST)</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8">
                <a
                  href="https://wa.me/6281234567890?text=Halo%20Tim%20Ruang%20Pintar,%20sekolah%20kami%20tertarik%20mengajukan%20pengadaan%20Lisensi%20Sekolah%20Resmi%20lewat%20Dana%20BOS."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white py-3 text-sm font-bold shadow-md shadow-indigo-500/20 transition-all"
                >
                  <MessageCircle className="size-4" />
                  <span>Konsultasi Pengadaan via WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FAQ SECTION */}
      <section id="faq" className="py-16 sm:py-24 bg-[#F8FAFC]">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Tanya Jawab (FAQ)
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Pertanyaan yang Sering Diajukan
            </h2>
          </div>

          <div className="space-y-4 text-left">
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs">
              <h4 className="text-base font-bold text-slate-900 flex items-center gap-2.5">
                <HelpCircle className="size-5 text-blue-600 flex-shrink-0" />
                <span>Apakah benar-benar gratis selama 30 hari?</span>
              </h4>
              <p className="mt-2 text-sm text-slate-600 pl-7.5 leading-relaxed">
                Ya, 100% gratis dengan akses penuh ke fitur mengajar. Anda tidak diminta memasukkan
                nomor kartu kredit maupun komitmen biaya apapun saat mendaftar.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs">
              <h4 className="text-base font-bold text-slate-900 flex items-center gap-2.5">
                <HelpCircle className="size-5 text-blue-600 flex-shrink-0" />
                <span>
                  Apa yang terjadi jika masa coba 30 hari selesai? Apakah data saya hilang?
                </span>
              </h4>
              <p className="mt-2 text-sm text-slate-600 pl-7.5 leading-relaxed">
                <strong>Data Anda dijamin 100% aman dan TIDAK AKAN PERNAH DIHAPUS.</strong> Anda
                tetap bisa masuk ke akun dan mengunduh seluruh rekap nilai maupun absensi ke format
                Excel kapan saja. Anda cukup memilih untuk berlangganan mandiri (Guru Pro) atau
                mengajukan pengadaan ke sekolah.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs">
              <h4 className="text-base font-bold text-slate-900 flex items-center gap-2.5">
                <HelpCircle className="size-5 text-blue-600 flex-shrink-0" />
                <span>Apakah sekolah kami bisa membayar menggunakan Dana BOS?</span>
              </h4>
              <p className="mt-2 text-sm text-slate-600 pl-7.5 leading-relaxed">
                Sangat bisa. Kami menyediakan berkas pengadaan resmi lengkap berupa Surat Penawaran,
                Invoice, Kuitansi bermeterai, dan Berita Acara Serah Terima (BAST) yang sesuai
                dengan juknis pertanggungjawaban Dana BOS Kemendikbud.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs">
              <h4 className="text-base font-bold text-slate-900 flex items-center gap-2.5">
                <HelpCircle className="size-5 text-blue-600 flex-shrink-0" />
                <span>Bagaimana jika di sekolah saya ada beberapa guru yang ikut mendaftar?</span>
              </h4>
              <p className="mt-2 text-sm text-slate-600 pl-7.5 leading-relaxed">
                Setiap guru dapat mengelola kelasnya secara mandiri. Ketika sekolah Anda memutuskan
                berlangganan resmi, seluruh data kelas guru-guru tersebut dapat langsung
                diintegrasikan secara otomatis ke dalam sistem pusat sekolah tanpa harus input
                ulang.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. BOTTOM CALL TO ACTION */}
      <section className="py-16 sm:py-20 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white text-center relative overflow-hidden">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-snug">
            Siap Bebas dari Beban Administrasi Kertas?
          </h2>
          <p className="text-sm sm:text-base text-blue-100 max-w-2xl mx-auto">
            Bergabunglah bersama ribuan pendidik yang kini mengajar lebih tenang, rapi, dan bahagia
            bersama Ruang Pintar.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-white text-blue-700 hover:bg-blue-50 px-8 py-4 text-base font-bold shadow-xl shadow-black/10 transition-all hover:scale-105"
            >
              <span>Daftar Sekarang — Coba Gratis 30 Hari</span>
              <ArrowRight className="size-5 text-blue-600" />
            </Link>
          </div>
        </div>
      </section>

      {/* 8. FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800 text-xs sm:text-sm">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-lg bg-white/10 p-1.5 flex items-center justify-center">
              <Image
                src="/images/brand/ruang-pintar-mark.png"
                alt="Logo"
                width={24}
                height={24}
                className="size-auto object-contain"
              />
            </div>
            <div>
              <span className="font-bold text-white text-sm">Ruang Pintar</span>
              <p className="text-xs text-slate-500">School Digital Operating Platform</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-400">
            <Link href="/login" className="hover:text-white transition-colors">
              Masuk
            </Link>
            <Link href="/register" className="hover:text-white transition-colors">
              Pendaftaran Mandiri
            </Link>
            <a
              href="https://wa.me/6281234567890"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              Bantuan WhatsApp
            </a>
          </div>

          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} Ruang Pintar. Hak Cipta Dilindungi Undang-Undang.
          </p>
        </div>
      </footer>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  BookOpen,
  Share2,
  Copy,
  Check,
  Printer,
  Sparkles,
  Camera,
  CheckCircle2,
  Users,
  Smartphone,
  School,
  ArrowRight,
  MessageCircle,
  FileText,
  BadgeCheck,
} from "lucide-react";

export function MarketingKitView() {
  const [activeTab, setActiveTab] = useState<"guide" | "broadcast">("guide");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const broadcastTemplates = [
    {
      title: "Variasi 1: Untuk Rekan Guru Perorangan",
      badge: "Pendekatan Solusi Kelelahan Guru",
      description: "Cocok untuk dikirim ke chat pribadi rekan guru atau sahabat satu sekolah.",
      content: `Assalamu'alaikum / Halo Bapak/Ibu Guru hebat... 🙏

Sering ngerasa capek dan stres gak sih tiap akhir semester harus begadang berhari-hari cuma buat rekap absen kertas dan salin nilai siswa ke Excel? 

Kemarin saya baru coba aplikasi baru buatan anak bangsa namanya *Ruang Pintar*. Keren banget! 
Tinggal foto lembar kertas absen kelas pakai kamera HP biasa, dalam 5 detik nama-nama siswa langsung otomatis jadi data kelas digital siap pakai! 🚀

Fiturnya lengkap:
✅ Foto lembar absen kertas langsung jadi rombel digital (Vision AI)
✅ Tombol presensi hadir/izin/sakit ramah sentuhan di HP
✅ Rekapitulasi nilai & kehadiran otomatis berstandar Kurikulum Merdeka
✅ Bisa ekspor ke Excel dengan sekali klik

Ada fasilitas *Coba Gratis 30 Hari Penuh* tanpa kartu kredit:
👉 Daftar mandiri cuma 30 detik di: https://ruangpintar.id/register

Semoga bermanfaat meringankan beban administrasi mengajar kita! Semangat mendidik! ✨`,
    },
    {
      title: "Variasi 2: Untuk Komunitas MGMP / KKG / Forum Guru",
      badge: "Pendekatan Inovasi & Komunitas",
      description:
        "Cocok untuk disebar ke grup WhatsApp MGMP mata pelajaran atau forum guru daerah.",
      content: `Yth. Bapak/Ibu Pendidik di Forum MGMP/KKG,

Izin berbagi informasi inovasi teknologi pendidikan terkini untuk mendukung implementasi Kurikulum Merdeka: *Platform Ruang Pintar*.

Platform ini dirancang khusus untuk membebaskan guru dari rutinitas administratif manual yang memakan waktu:
1. *Photo-to-Class Vision AI*: Pemindaian instan lembar presensi kelas konvensional menjadi basis data digital dalam hitungan detik.
2. *Mobile-First Attendance*: Presensi harian yang sangat ringan dibuka lewat peramban HP di kelas tanpa menguras kuota.
3. *CBT & Bank Ujian Online*: Ujian digital dengan perlindungan anti-curang (deteksi buka tab baru) dan analisis butir soal otomatis.
4. *Buku Nilai & Rapor*: Kalkulasi otomatis nilai formatif dan sumatif siap cetak.

Rekan-rekan guru dapat langsung mencoba akun mandiri secara gratis selama 30 hari:
🔗 Akses Portal: https://ruangpintar.id
📝 Pendaftaran Guru: https://ruangpintar.id/register

Mari wujudkan tata kelola kelas digital yang efektif dan humanis! Salam pendidikan! 🇮🇩`,
    },
    {
      title: "Variasi 3: Untuk Kepala Sekolah & Tim Dana BOS",
      badge: "Format Formal Pengadaan Institusi",
      description:
        "Cocok untuk diajukan ke Kepala Sekolah, Wakil Kepala Sekolah, atau Bendahara BOS.",
      content: `Kepada Yth. 
Bapak/Ibu Kepala Sekolah & Tim BOS Sekolah

Perihal: Rekomendasi Digitalisasi Administrasi Sekolah & Pembelajaran Berbasis Kurikulum Merdeka

Dengan hormat,
Sehubungan dengan pemenuhan standar digitalisasi sekolah sesuai Juknis Pemanfaatan Dana BOS Kemendikbudristek (Komponen Pembelajaran & Administrasi), kami ingin merekomendasikan adopsi platform *Ruang Pintar*.

Manfaat Utama bagi Institusi Sekolah:
• Monitoring KBM real-time dari meja kerja Kepala Sekolah (pemantauan kehadiran guru & siswa harian).
• Pembuat jadwal pelajaran otomatis anti-bentrok guru dan ruang kelas.
• Cetak Rapor Resmi Nasional Kurikulum Merdeka tanpa pekerjaan ganda.
• Notifikasi presensi otomatis via WhatsApp Gateway ke nomor wali murid.
• Kelengkapan administrasi SPJ Dana BOS resmi (Faktur Pajak, Kuitansi Bermeterai, BAST).

Investasi resmi institusi sangat terjangkau:
Mulai dari Rp 1.500.000 – Rp 3.000.000 / tahun untuk seluruh warga sekolah (semua guru otomatis berlisensi Pro).

Dokumen usulan penawaran resmi dan demo platform dapat diakses melalui:
🌐 Website: https://ruangpintar.id
📄 Pratinjau Usulan Resmi: https://ruangpintar.id/panduan

Terima kasih atas perhatian dan dukungan Bapak/Ibu terhadap kemajuan mutu pendidikan sekolah kita.`,
    },
  ];

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => {
      setCopiedIndex(null);
    }, 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 selection:bg-blue-600 selection:text-white font-sans antialiased pb-16">
      {/* Header Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-xl print:hidden">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-white border border-slate-200 p-1 shadow-xs flex items-center justify-center">
              <Image
                src="/images/brand/ruang-pintar-mark.png"
                alt="Logo"
                width={28}
                height={28}
                className="size-auto object-contain"
              />
            </div>
            <span className="font-extrabold text-base text-slate-900">Ruang Pintar</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors"
            >
              Kembali ke Beranda
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition-all"
            >
              <span>Coba Gratis 30 Hari</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-5xl px-4 sm:px-6 pt-8 sm:pt-12">
        {/* Title Section */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold">
            <Sparkles className="size-3.5 text-blue-600" />
            <span>Pusat Sumber Daya & Alat Pemasaran</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Panduan Pengguna & Materi Promosi
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Gunakan panduan operasional cepat dan draf pesan promosi siap sebar di bawah ini untuk
            memperkenalkan Ruang Pintar ke rekan pendidik di seluruh Indonesia.
          </p>
        </div>

        {/* Tab Selector (Print: Hidden) */}
        <div className="mt-8 flex justify-center print:hidden">
          <div className="inline-flex p-1 rounded-2xl bg-slate-200/70 border border-slate-300/60 shadow-inner">
            <button
              onClick={() => setActiveTab("guide")}
              className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === "guide"
                  ? "bg-white text-blue-600 shadow-md shadow-slate-300/50"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <BookOpen className="size-4" />
              <span>Panduan Cepat Guru (1 Halaman)</span>
            </button>
            <button
              onClick={() => setActiveTab("broadcast")}
              className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === "broadcast"
                  ? "bg-white text-blue-600 shadow-md shadow-slate-300/50"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Share2 className="size-4" />
              <span>Template Siaran WhatsApp (3 Variasi)</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: PANDUAN CEPAT GURU (PRINTABLE 1-PAGE QUICK START GUIDE) */}
        {/* ========================================================================= */}
        {activeTab === "guide" && (
          <div className="mt-8 space-y-6 animate-in fade-in duration-200">
            {/* Action Bar */}
            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm print:hidden">
              <div className="flex items-center gap-2">
                <BadgeCheck className="size-5 text-emerald-600" />
                <span className="text-xs sm:text-sm font-semibold text-slate-700">
                  Format Ringkas Resmi Siap Diberikan kepada Guru Baru
                </span>
              </div>
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                <Printer className="size-4" />
                <span>Cetak / Simpan PDF</span>
              </button>
            </div>

            {/* Printable Document Box */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-lg print:border-none print:shadow-none print:p-0">
              {/* Document Header */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-6 mb-8">
                <div className="flex items-center gap-3.5">
                  <div className="size-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-xl shadow-md">
                    RP
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 leading-tight">
                      Panduan Operasional Kilat Guru
                    </h2>
                    <p className="text-xs text-slate-500">
                      Ruang Pintar — School Digital Operating Platform • Kurikulum Merdeka
                    </p>
                  </div>
                </div>
                <div className="text-right hidden sm:block">
                  <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                    Aktivasi 30 Detik
                  </span>
                  <p className="text-[11px] text-slate-400 mt-1">Versi 2.0 • 2026/2027</p>
                </div>
              </div>

              {/* 4 Steps Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Step 1 */}
                <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-5 relative overflow-hidden">
                  <div className="flex items-center gap-3">
                    <span className="flex size-8 items-center justify-center rounded-xl bg-blue-600 text-white font-extrabold text-xs">
                      1
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm">
                      Daftar Mandiri Tanpa Kartu Kredit
                    </h3>
                  </div>
                  <p className="mt-3 text-xs text-slate-600 leading-relaxed">
                    Buka peramban HP Anda ke alamat <strong>ruangpintar.id/register</strong>. Cukup
                    isi 4 kolom: Nama Lengkap & Gelar, Email/No. WhatsApp, Password, dan Nama Asal
                    Sekolah. Akun aktif seketika dengan masa coba gratis 30 hari penuh.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-5 relative overflow-hidden">
                  <div className="flex items-center gap-3">
                    <span className="flex size-8 items-center justify-center rounded-xl bg-blue-600 text-white font-extrabold text-xs">
                      2
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm">
                      Foto Lembar Absensi Kertas (AI Scanner)
                    </h3>
                  </div>
                  <p className="mt-3 text-xs text-slate-600 leading-relaxed">
                    Di dashboard Anda, klik tombol{" "}
                    <strong>&ldquo;+ Buat Kelas via Foto AI&rdquo;</strong>. Ambil foto kertas
                    absensi kelas yang sudah ada. Kecerdasan multimodal AI otomatis membaca seluruh
                    nama siswa, jenis kelamin, dan nomor urut dalam 5 detik!
                  </p>
                </div>

                {/* Step 3 */}
                <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-5 relative overflow-hidden">
                  <div className="flex items-center gap-3">
                    <span className="flex size-8 items-center justify-center rounded-xl bg-blue-600 text-white font-extrabold text-xs">
                      3
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm">
                      Pratinjau & Terbitkan Kelas Digital
                    </h3>
                  </div>
                  <p className="mt-3 text-xs text-slate-600 leading-relaxed">
                    Layar pratinjau tabel akan menampilkan daftar siswa hasil pemindaian. Anda dapat
                    memperbaiki nama atau mengubah status jenis kelamin (L/P) dengan cepat. Klik{" "}
                    <strong>&ldquo;Terbitkan Kelas&rdquo;</strong> dan rombel digital Anda langsung
                    siap digunakan mengajar.
                  </p>
                </div>

                {/* Step 4 */}
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5 relative overflow-hidden">
                  <div className="flex items-center gap-3">
                    <span className="flex size-8 items-center justify-center rounded-xl bg-emerald-600 text-white font-extrabold text-xs">
                      4
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm">
                      Presensi di Kelas & Ekspor Buku Nilai
                    </h3>
                  </div>
                  <p className="mt-3 text-xs text-slate-600 leading-relaxed">
                    Gunakan HP Anda saat mengajar di kelas. Tap tombol Hadir, Sakit, Izin, atau Alpa
                    yang berukuran besar dan ramah sentuhan. Seluruh rekap kehadiran dan buku nilai
                    Kurikulum Merdeka langsung tersusun rapi dan dapat diunduh ke format Excel kapan
                    saja.
                  </p>
                </div>
              </div>

              {/* Pro Tips Footer Box */}
              <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-900 text-white p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                  <h4 className="text-sm font-bold flex items-center justify-center sm:justify-start gap-2">
                    <Smartphone className="size-4 text-sky-400" />
                    <span>Dirancang Ramah Guru Senior & Hemat Kuota</span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    Aplikasi sangat ringan dibuka lewat HP tanpa perlu download di Play Store. Cukup
                    buka dari browser Chrome atau Safari.
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <span className="px-3.5 py-1.5 rounded-xl bg-blue-600 text-white font-mono text-xs font-bold">
                    https://ruangpintar.id
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: TEMPLATE SIARAN WHATSAPP (3 PERSUASIVE BROADCAST COPYWRITING) */}
        {/* ========================================================================= */}
        {activeTab === "broadcast" && (
          <div className="mt-8 space-y-6 animate-in fade-in duration-200">
            <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-4 text-xs text-blue-800 flex items-start gap-3">
              <MessageCircle className="size-5 shrink-0 text-blue-600 mt-0.5" />
              <div>
                <span className="font-bold">Tips Pemasaran Cepat:</span> Pilih template di bawah
                sesuai target penerima pesan Anda, klik tombol <strong>Salin Pesan</strong>, lalu
                langsung tempel (*paste*) ke chat WhatsApp grup sekolah atau rekan guru.
              </div>
            </div>

            <div className="space-y-6">
              {broadcastTemplates.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-md transition-shadow hover:shadow-lg"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                          {item.badge}
                        </span>
                      </div>
                      <h3 className="text-base font-extrabold text-slate-900 mt-1">{item.title}</h3>
                      <p className="text-xs text-slate-500">{item.description}</p>
                    </div>

                    <button
                      onClick={() => handleCopy(item.content, idx)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-xs font-bold shadow-sm shadow-blue-500/20 transition-all active:scale-95 cursor-pointer"
                    >
                      {copiedIndex === idx ? (
                        <>
                          <Check className="size-4 text-emerald-300" />
                          <span>Pesan Disalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="size-4" />
                          <span>Salin Pesan (1-Click)</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Preformatted Box */}
                  <div className="mt-4 rounded-xl bg-slate-50 border border-slate-200/70 p-4 font-mono text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
                    {item.content}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

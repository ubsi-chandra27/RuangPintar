"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Printer,
  X,
  FileText,
  CheckCircle2,
  Building2,
  ShieldCheck,
  MessageCircle,
  Clock,
  Sparkles,
  Zap,
} from "lucide-react";

export interface SchoolProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  namaSekolah?: string;
  namaPengusul?: string;
}

export function SchoolProposalModal({
  isOpen,
  onClose,
  namaSekolah = "SMA / SMK / SMP Mitra",
  namaPengusul = "Pendidik & Tim Guru",
}: SchoolProposalModalProps) {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="proposal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-fadeIn overflow-y-auto"
    >
      <div className="relative w-full max-w-3xl rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Toolbar (Screen only) */}
        <div className="print:hidden flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-2 text-slate-800">
            <FileText className="size-5 text-blue-600" />
            <h3 id="proposal-title" className="text-sm sm:text-base font-bold text-slate-900">
              Dokumen Usulan Pengadaan Lisensi Sekolah (Dana BOS)
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              <Printer className="size-4" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              onClick={onClose}
              className="size-8 rounded-xl bg-slate-200/80 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              title="Tutup"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Formal Proposal Document (Printable) */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-6 text-slate-800 text-xs sm:text-sm font-sans print:p-0 print:m-0 print:overflow-visible">
          {/* KOP Surat Perusahaan / Platform */}
          <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-xl bg-blue-50 border border-blue-200 p-1.5 flex items-center justify-center shrink-0 print:border-slate-400">
                <Image
                  src="/images/brand/ruang-pintar-mark.png"
                  alt="Logo Ruang Pintar"
                  width={36}
                  height={36}
                  className="size-auto object-contain"
                />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 uppercase">
                  RUANG PINTAR EDUTECH INDONESIA
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  School Digital Operating Platform • Mitra Digitalisasi Pendidikan Nasional
                </p>
                <p className="text-[11px] text-slate-400">
                  Layanan Pengadaan & Kemitraan Sekolah • WhatsApp: 0812-3456-7890 •
                  www.ruangpintar.id
                </p>
              </div>
            </div>

            <div className="text-right text-[11px] text-slate-500 shrink-0 hidden sm:block">
              <span className="font-semibold block">Format: DANA BOS B2B</span>
              <span>Nomor: 024/RP-B2B/PROP/2026</span>
            </div>
          </div>

          {/* Header Surat Penawaran */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 pt-2">
            <div>
              <table className="text-xs">
                <tbody>
                  <tr>
                    <td className="pr-4 py-0.5 font-semibold text-slate-500">Nomor</td>
                    <td className="font-mono">: 024/RP-B2B/PROP/2026</td>
                  </tr>
                  <tr>
                    <td className="pr-4 py-0.5 font-semibold text-slate-500">Lampiran</td>
                    <td>: 1 (satu) Berkas Penawaran Resmi & Kelengkapan SPJ</td>
                  </tr>
                  <tr>
                    <td className="pr-4 py-0.5 font-semibold text-slate-500">Perihal</td>
                    <td className="font-bold text-blue-700">
                      : Usulan Pengadaan Lisensi Sistem Digitalisasi Sekolah & Kurikulum Merdeka
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="text-right text-xs">
              <p className="text-slate-500">Kepada Yang Terhormat:</p>
              <p className="font-bold text-slate-900 text-sm mt-0.5">
                Bapak/Ibu Kepala Sekolah & Tim BOS
              </p>
              <p className="font-semibold text-blue-600">{namaSekolah}</p>
              <p className="text-slate-400 text-[11px]">Di Tempat</p>
            </div>
          </div>

          {/* Isi Surat */}
          <div className="space-y-3.5 leading-relaxed text-slate-700">
            <p>Dengan hormat,</p>
            <p>
              Sehubungan dengan implementasi digitalisasi administrasi pendidikan dan penegakan
              standar Kurikulum Merdeka, perkenankan kami mengajukan permohonan pengadaan{" "}
              <strong>Lisensi Resmi Sekolah &ldquo;Ruang Pintar&rdquo;</strong> untuk mendukung
              operasional akademik di lingkungan <strong>{namaSekolah}</strong>.
            </p>
            <p>
              Saat ini, tim pendidik di sekolah telah memanfaatkan fitur mandiri Ruang Pintar untuk
              keperluan presensi dan pembukuan nilai kelas. Agar data akademik seluruh tingkatan
              dapat terintegrasi secara utuh dan resmi di tingkat institusi, pengadaan Lisensi
              Sekolah akan memberikan manfaat sebagai berikut:
            </p>

            {/* List 4 Keunggulan Utama Institusi */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-3">
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 flex items-start gap-2.5">
                <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">
                    1. Otomasi Leger & Cetak Rapor Resmi
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Kompilasi nilai formatif & sumatif seluruh rombel langsung tersusun menjadi buku
                    leger dan format Rapor Resmi Kurikulum Merdeka tanpa kerja dobel.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 flex items-start gap-2.5">
                <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">
                    2. Jadwal Pelajaran Otomatis Anti-Bentrok
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Generator jadwal pelajaran sekolah cerdas yang memvalidasi ketersediaan guru,
                    beban jam mengajar (JP), dan kapasitas ruang kelas secara real-time.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 flex items-start gap-2.5">
                <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">
                    3. WhatsApp Gateway Otomatis ke Wali Murid
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Kirim laporan ketidakhadiran dan rekap capaian belajar murid langsung ke nomor
                    WhatsApp orang tua tanpa guru harus mengetik satu per satu.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 flex items-start gap-2.5">
                <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">
                    4. Photo-to-Class Vision AI Scanner
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Pendidik dapat memotret lembar kertas absensi kelas dengan kamera HP dan
                    mengubahnya menjadi data rombel digital dalam waktu 5 detik.
                  </p>
                </div>
              </div>
            </div>

            {/* Rincian Anggaran & Legalitas Dana BOS */}
            <div className="mt-4 p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80">
              <h4 className="font-bold text-blue-950 text-xs uppercase tracking-wider mb-2">
                Skema Pembiayaan & Kepatuhan SPJ Dana BOS
              </h4>
              <p className="text-xs text-slate-700">
                Pengadaan lisensi ini memenuhi kriteria{" "}
                <strong>Komponen Pengelolaan Sekolah Berbasis Digital</strong> dalam petunjuk teknis
                (Juknis) Bantuan Operasional Sekolah (BOS) Kemendikbudristek.
              </p>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-white p-2 rounded-xl border border-blue-200">
                  <span className="text-[10px] text-slate-500 block">Investasi Lisensi</span>
                  <span className="font-extrabold text-blue-700">Rp 1,5 Jt - 3 Jt / Tahun</span>
                </div>
                <div className="bg-white p-2 rounded-xl border border-blue-200">
                  <span className="text-[10px] text-slate-500 block">Cakupan Pengguna</span>
                  <span className="font-bold text-slate-800">Semua Guru, Siswa & TU</span>
                </div>
                <div className="bg-white p-2 rounded-xl border border-blue-200">
                  <span className="text-[10px] text-slate-500 block">Berkas SPJ Resmi</span>
                  <span className="font-bold text-emerald-700">Invoice, Kuitansi & BAST</span>
                </div>
              </div>
            </div>

            {/* Penutup */}
            <p className="pt-2">
              Demikian surat penawaran dan usulan ini kami sampaikan. Besar harapan kami agar sistem
              ini dapat segera diaktifkan secara resmi di {namaSekolah} demi kemajuan pendidikan dan
              keringanan beban kerja para pendidik kita bersama.
            </p>
          </div>

          {/* Tanda Tangan */}
          <div className="pt-6 border-t border-slate-200 flex items-end justify-between">
            <div>
              <p className="text-xs text-slate-500">Diajukan secara resmi oleh:</p>
              <p className="font-bold text-slate-800 text-xs mt-1">{namaPengusul}</p>
              <p className="text-[11px] text-slate-500">{namaSekolah}</p>
            </div>

            <div className="text-right">
              <p className="text-xs text-slate-500">Penyedia Platform SaaS:</p>
              <div className="my-2 inline-flex items-center justify-center px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-blue-700 font-bold text-xs tracking-wider">
                [ TERCAP & DIVERIFIKASI SISTEM ]
              </div>
              <p className="font-bold text-slate-800 text-xs">Tim Kemitraan Ruang Pintar</p>
              <p className="text-[11px] text-slate-400">PT Ruang Pintar Edutech Indonesia</p>
            </div>
          </div>
        </div>

        {/* Modal Footer (Screen only) */}
        <div className="print:hidden px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <p className="text-xs text-slate-500 text-center sm:text-left">
            💡 Serahkan proposal ini kepada Kepala Sekolah atau Bendahara BOS saat rapat anggaran
            sekolah.
          </p>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <a
              href="https://wa.me/6281234567890?text=Halo%20Tim%20Ruang%20Pintar,%20kami%20ingin%20mengajukan%20pengadaan%20Lisensi%20Sekolah%20Resmi%20berdasarkan%20dokumen%20proposal."
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <MessageCircle className="size-4" />
              <span>Tanya via WhatsApp</span>
            </a>
            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              <Printer className="size-4" />
              <span>Cetak / Print PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import * as React from "react";
import { Printer, X, Building2, Calendar, CheckCircle2, AlertTriangle } from "lucide-react";
import { ExecutiveReportData } from "../domain/reporting-types";

interface ExecutivePrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportData: ExecutiveReportData | null;
}

export function ExecutivePrintModal({ isOpen, onClose, reportData }: ExecutivePrintModalProps) {
  if (!isOpen || !reportData) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      {/* Modal Card */}
      <div className="relative w-full max-w-4xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden print:border-none print:shadow-none print:w-full print:max-w-none">
        {/* Header - Screen only */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Printer className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Pratinjau Lembar Ringkasan Eksekutif
              </h2>
              <p className="text-xs text-slate-500">
                Format resmi A4 siap cetak untuk laporan manajemen sekolah
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <Printer className="h-4 w-4" />
              <span>Cetak Sekarang</span>
            </button>
            <button
              onClick={onClose}
              aria-label="Tutup"
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Area (A4 layout styling) */}
        <div className="p-8 sm:p-12 text-slate-900 print:p-0 print:m-0 print:text-black">
          {/* KOP SURAT RESMI */}
          <div className="border-b-2 border-slate-900 pb-4 mb-6 text-center relative">
            <div className="flex items-center justify-center gap-4 mb-1">
              <div className="h-14 w-14 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center font-bold text-slate-700 text-lg">
                RP
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-slate-900">
                  {reportData.sekolah.nama}
                </h1>
                <p className="text-xs text-slate-600 font-medium">
                  {reportData.sekolah.alamat} • Telp: {reportData.sekolah.telepon}
                </p>
                <p className="text-xs text-slate-500">
                  NPSN: {reportData.sekolah.npsn ?? "-"} • Email: {reportData.sekolah.email ?? "-"}
                </p>
              </div>
            </div>
          </div>

          {/* JUDUL LAPORAN */}
          <div className="text-center mb-6">
            <h2 className="text-base sm:text-lg font-bold uppercase tracking-wide underline underline-offset-4">
              Laporan Ringkasan Eksekutif Pimpinan Sekolah
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Tahun Ajaran {reportData.periode.tahun_ajaran} — {reportData.periode.semester}
            </p>
          </div>

          {/* 1. INDIKATOR UTAMA SEKOLAH */}
          <div className="mb-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 border-b border-slate-200 pb-1">
              I. Ringkasan Key Performance Indicators (KPI)
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 text-center">
              <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 print:bg-transparent">
                <div className="text-[10px] text-slate-500 font-medium">Total Siswa</div>
                <div className="text-base font-extrabold text-slate-900">
                  {reportData.ringkasan.total_siswa}
                </div>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 print:bg-transparent">
                <div className="text-[10px] text-slate-500 font-medium">Total Guru</div>
                <div className="text-base font-extrabold text-slate-900">
                  {reportData.ringkasan.total_guru}
                </div>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 print:bg-transparent">
                <div className="text-[10px] text-slate-500 font-medium">Rombel</div>
                <div className="text-base font-extrabold text-slate-900">
                  {reportData.ringkasan.total_rombel}
                </div>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 print:bg-transparent">
                <div className="text-[10px] text-slate-500 font-medium">Presensi Global</div>
                <div className="text-base font-extrabold text-blue-600">
                  {reportData.ringkasan.tingkat_kehadiran_global}%
                </div>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 print:bg-transparent">
                <div className="text-[10px] text-slate-500 font-medium">Ketuntasan KKTP</div>
                <div className="text-base font-extrabold text-emerald-600">
                  {reportData.ringkasan.persentase_tuntas_kktp}%
                </div>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 print:bg-transparent">
                <div className="text-[10px] text-slate-500 font-medium">Isu Perhatian</div>
                <div className="text-base font-extrabold text-amber-600">
                  {reportData.ringkasan.siswa_kritis_alpha}
                </div>
              </div>
            </div>
          </div>

          {/* 2. DISTRIBUSI CAPAIAN PER TINGKAT KELAS */}
          <div className="mb-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 border-b border-slate-200 pb-1">
              II. Distribusi Kohort Tingkat Kelas
            </h3>
            <table className="w-full text-xs text-left border border-slate-300">
              <thead className="bg-slate-100 print:bg-slate-200 font-bold text-slate-800">
                <tr>
                  <th className="p-2 border border-slate-300">Tingkat Kelas</th>
                  <th className="p-2 border border-slate-300 text-center">Jumlah Rombel</th>
                  <th className="p-2 border border-slate-300 text-center">Jumlah Siswa</th>
                  <th className="p-2 border border-slate-300 text-center">Rerata Presensi</th>
                  <th className="p-2 border border-slate-300 text-center">Rerata Nilai</th>
                  <th className="p-2 border border-slate-300 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {reportData.distribusi_tingkat.map((item, idx) => (
                  <tr key={idx} className="border-b border-slate-200">
                    <td className="p-2 border border-slate-300 font-semibold">{item.tingkat}</td>
                    <td className="p-2 border border-slate-300 text-center">
                      {item.total_rombel} Rombel
                    </td>
                    <td className="p-2 border border-slate-300 text-center">
                      {item.total_siswa} Siswa
                    </td>
                    <td className="p-2 border border-slate-300 text-center">
                      {item.rerata_kehadiran}%
                    </td>
                    <td className="p-2 border border-slate-300 text-center font-mono">
                      {item.rerata_nilai}
                    </td>
                    <td className="p-2 border border-slate-300 text-center">
                      <span className="font-semibold text-emerald-700">Memenuhi Target</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 3. ISU STRATEGIS & PERHATIAN */}
          <div className="mb-8">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 border-b border-slate-200 pb-1">
              III. Catatan Strategis & Anomali Operasional
            </h3>
            <div className="space-y-2 text-xs">
              {reportData.perhatian_strategis.map((p, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/30 print:bg-transparent"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        p.tingkat_urgensi === "KRITIS"
                          ? "bg-rose-100 text-rose-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {p.tingkat_urgensi}
                    </span>
                    <span className="font-bold text-slate-800">{p.judul}</span>
                  </div>
                  <p className="text-slate-600 mt-1 pl-1 text-[11px]">{p.deskripsi}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 4. TANDA TANGAN & PENGESAHAN */}
          <div className="mt-12 pt-4 flex justify-between items-end text-xs">
            <div className="text-slate-500">
              <p>Dokumen resmi ini dicetak dari sistem Ruang Pintar.</p>
              <p>Waktu Cetak: {reportData.periode.tanggal_cetak}</p>
            </div>

            <div className="text-center w-56">
              <p className="mb-1">Jakarta, {reportData.periode.tanggal_cetak}</p>
              <p className="font-bold text-slate-800 mb-16">Kepala Sekolah,</p>
              <p className="font-bold underline text-slate-900">
                {reportData.sekolah.kepala_sekolah_nama}
              </p>
              <p className="text-slate-500 text-[11px]">NIP. 19680512 199203 1 004</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

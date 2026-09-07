"use client";

/**
 * Ruang Pintar — Official Report Card Printable Modal (Phase 15 / M15)
 *
 * Lembar Rapor Resmi Kurikulum Merdeka Cetak Standar A4:
 * - Kop Sekolah Resmi & Identitas Lengkap Siswa
 * - Matriks Capaian Belajar (Formatif, Sumatif, Nilai Akhir, Predikat, Deskripsi CP)
 * - Rekapitulasi Presensi & Catatan Wali Kelas
 * - Kolom Tanda Tangan Orang Tua, Wali Kelas, dan Kepala Sekolah
 * - Kompatibel 1-Click Print A4 & Save PDF
 */

import React from "react";
import { Printer, X, Award, CheckCircle2 } from "lucide-react";
import { StudentReportCardCompilation } from "../domain/student-experience-types";

export interface ReportCardPrintModalProps {
  reportCard: StudentReportCardCompilation | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ReportCardPrintModal({ reportCard, isOpen, onClose }: ReportCardPrintModalProps) {
  if (!isOpen || !reportCard) return null;

  const {
    siswa,
    sekolahNama,
    sekolahAlamat,
    sekolahNpsn,
    kepalaSekolahNama,
    kepalaSekolahNip,
    tahunAjaran,
    semester,
    mataPelajaranList,
    rerataKeseluruhan,
    presensi,
    catatanWaliKelas,
    tanggalCetak,
  } = reportCard;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-4xl max-h-[92vh] overflow-y-auto p-4 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-2xl flex flex-col print:p-0 print:m-0 print:max-w-none print:shadow-none print:border-none">
        {/* Print Action Toolbar (Hidden on actual print) */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 print:hidden">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-[#2563EB]" />
            <h2 className="text-base sm:text-lg font-bold text-[#0F172A]">
              Pratinjau Lembar Rapor Resmi Siswa
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
            >
              <Printer className="h-4 w-4" />
              Cetak / Simpan PDF
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs cursor-pointer transition-all"
            >
              Tutup
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* OFFICIAL PRINT-READY A4 DOCUMENT CONTENT */}
        {/* ========================================================================= */}
        <div className="print-content bg-white p-4 sm:p-6 text-slate-900 text-xs font-serif leading-normal space-y-5 flex-1">
          {/* Official School Header / Kop Sekolah */}
          <div className="text-center pb-3 border-b-2 border-slate-900 space-y-1">
            <h2 className="text-sm sm:text-base font-bold tracking-wide uppercase">
              {sekolahNama}
            </h2>
            <p className="text-[11px] text-slate-600 font-sans">
              {sekolahAlamat || "Jl. Pendidikan Cerdas No. 128, Jakarta"} • NPSN:{" "}
              {sekolahNpsn || "20100001"}
            </p>
            <p className="text-xs font-bold font-sans tracking-widest text-slate-800 uppercase pt-1">
              LAPORAN HASIL BELAJAR PESERTA DIDIK (RAPOR KURIKULUM MERDEKA)
            </p>
          </div>

          {/* Student & Academic Metadata Grid */}
          <div className="grid grid-cols-2 gap-y-1 gap-x-6 text-[11px] font-sans pb-1">
            <div className="flex gap-2">
              <span className="w-32 font-semibold text-slate-600">Nama Peserta Didik</span>
              <span className="font-bold text-slate-900">: {siswa.namaLengkap}</span>
            </div>
            <div className="flex gap-2">
              <span className="w-28 font-semibold text-slate-600">Kelas / Rombel</span>
              <span className="font-bold text-slate-900">: {siswa.rombelNama}</span>
            </div>

            <div className="flex gap-2">
              <span className="w-32 font-semibold text-slate-600">NIS / NISN</span>
              <span className="font-bold text-slate-900">
                : {siswa.nis} / {siswa.nisn || "-"}
              </span>
            </div>
            <div className="flex gap-2">
              <span className="w-28 font-semibold text-slate-600">Semester / Fase</span>
              <span className="font-bold text-slate-900">: {semester} / Fase E</span>
            </div>

            <div className="flex gap-2">
              <span className="w-32 font-semibold text-slate-600">Tahun Ajaran</span>
              <span className="font-bold text-slate-900">: {tahunAjaran}</span>
            </div>
            <div className="flex gap-2">
              <span className="w-28 font-semibold text-slate-600">Wali Kelas</span>
              <span className="font-bold text-slate-900">
                : {siswa.waliKelasNama || "Wali Kelas"}
              </span>
            </div>
          </div>

          {/* Table Capaian Hasil Belajar Siswa */}
          <div className="space-y-1.5 font-sans">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              A. Capaian Hasil Pembelajaran
            </h3>

            <div className="border border-slate-300 rounded-lg overflow-hidden">
              <table className="w-full text-[11px] border-collapse">
                <thead>
                  <tr className="bg-slate-100/90 border-b border-slate-300 text-slate-800 font-bold text-center">
                    <th className="py-2 px-2 border-r border-slate-300 w-8">No</th>
                    <th className="py-2 px-3 border-r border-slate-300 text-left">
                      Mata Pelajaran
                    </th>
                    <th className="py-2 px-2 border-r border-slate-300 w-12">KKTP</th>
                    <th className="py-2 px-2 border-r border-slate-300 w-14">Formatif</th>
                    <th className="py-2 px-2 border-r border-slate-300 w-14">Sumatif</th>
                    <th className="py-2 px-2 border-r border-slate-300 w-14">Nilai Akhir</th>
                    <th className="py-2 px-2 border-r border-slate-300 w-12">Predikat</th>
                    <th className="py-2 px-3 text-left">Capaian Kompetensi</th>
                  </tr>
                </thead>
                <tbody>
                  {mataPelajaranList.map((mapel, index) => (
                    <tr
                      key={mapel.mataPelajaranId}
                      className="border-b border-slate-200 hover:bg-slate-50/50"
                    >
                      <td className="py-2 px-2 text-center border-r border-slate-200 font-semibold text-slate-600">
                        {index + 1}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-200 font-bold text-slate-900">
                        {mapel.mataPelajaranNama}
                      </td>
                      <td className="py-2 px-2 text-center border-r border-slate-200 text-slate-600">
                        {mapel.kkmKktp}
                      </td>
                      <td className="py-2 px-2 text-center border-r border-slate-200 font-medium">
                        {mapel.rerataFormatif !== null ? mapel.rerataFormatif : "-"}
                      </td>
                      <td className="py-2 px-2 text-center border-r border-slate-200 font-medium">
                        {mapel.rerataSumatif !== null ? mapel.rerataSumatif : "-"}
                      </td>
                      <td className="py-2 px-2 text-center border-r border-slate-200 font-extrabold text-slate-900">
                        {mapel.nilaiAkhir !== null ? mapel.nilaiAkhir : "-"}
                      </td>
                      <td className="py-2 px-2 text-center border-r border-slate-200 font-bold text-[#2563EB]">
                        {mapel.predikat}
                      </td>
                      <td className="py-2 px-3 text-[10px] text-slate-700 leading-snug">
                        <p>{mapel.deskripsiCapaianTertinggi}</p>
                        {mapel.deskripsiPerluPeningkatan && (
                          <p className="text-slate-500 mt-0.5">{mapel.deskripsiPerluPeningkatan}</p>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50 border-t border-slate-300 font-bold text-slate-900">
                    <td colSpan={5} className="py-2 px-3 text-right border-r border-slate-300">
                      Rata-Rata Nilai Akhir Semester:
                    </td>
                    <td className="py-2 px-2 text-center border-r border-slate-300 text-sm font-extrabold text-[#2563EB]">
                      {rerataKeseluruhan !== null ? rerataKeseluruhan : "-"}
                    </td>
                    <td colSpan={2} className="py-2 px-3 text-[10px] text-slate-500 font-medium">
                      Status Capaian: Tuntas & Memenuhi Kriteria Kelulusan Semester
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Grid Rekapitulasi Presensi & Catatan Wali Kelas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans pt-1">
            {/* Tabel Ketidakhadiran */}
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                B. Rekapitulasi Ketidakhadiran
              </h3>
              <div className="border border-slate-300 rounded-lg overflow-hidden">
                <table className="w-full text-[11px] border-collapse">
                  <tbody>
                    <tr className="border-b border-slate-200">
                      <td className="py-1.5 px-3 font-semibold text-slate-600 w-44">Sakit (S)</td>
                      <td className="py-1.5 px-3 font-bold text-slate-900">
                        : {presensi.sakit} hari
                      </td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="py-1.5 px-3 font-semibold text-slate-600">Izin (I)</td>
                      <td className="py-1.5 px-3 font-bold text-slate-900">
                        : {presensi.izin} hari
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1.5 px-3 font-semibold text-slate-600">
                        Tanpa Keterangan (A)
                      </td>
                      <td className="py-1.5 px-3 font-bold text-slate-900">
                        : {presensi.tanpaKeterangan} hari
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Catatan Wali Kelas */}
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                C. Catatan Wali Kelas
              </h3>
              <div className="p-3 border border-slate-300 rounded-lg text-[11px] text-slate-700 leading-relaxed min-h-[85px] bg-slate-50/50">
                {catatanWaliKelas}
              </div>
            </div>
          </div>

          {/* Signature Block (Tanda Tangan Resmi) */}
          <div className="pt-8 font-sans text-[11px] text-slate-900">
            <div className="text-right pb-4 text-slate-700">Jakarta, {tanggalCetak}</div>

            <div className="grid grid-cols-3 text-center gap-4">
              <div className="space-y-16">
                <p>
                  Mengetahui,
                  <br />
                  Orang Tua / Wali Siswa
                </p>
                <p className="font-bold underline">
                  ( ............................................ )
                </p>
              </div>

              <div className="space-y-16">
                <p>Wali Kelas {siswa.rombelNama}</p>
                <p className="font-bold underline">{siswa.waliKelasNama || "( Wali Kelas )"}</p>
              </div>

              <div className="space-y-16">
                <p>
                  Mengetahui,
                  <br />
                  Kepala Sekolah
                </p>
                <div>
                  <p className="font-bold underline">{kepalaSekolahNama}</p>
                  {kepalaSekolahNip && (
                    <p className="text-[10px] text-slate-500">NIP: {kepalaSekolahNip}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="print:hidden border-t border-slate-100 pt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs cursor-pointer hover:bg-slate-100 transition-all"
          >
            Tutup
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-5 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
          >
            <Printer className="h-4 w-4" />
            Cetak Lembar Rapor Resmi
          </button>
        </div>
      </div>
    </div>
  );
}

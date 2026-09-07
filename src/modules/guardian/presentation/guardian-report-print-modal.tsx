"use client";

/**
 * Ruang Pintar — Modal Pratinjau Cetak Rapor Siswa Resmi untuk Wali (Phase 16)
 * Format A4 Siap Cetak (window.print()) & Simpan PDF Kurikulum Merdeka.
 */

import * as React from "react";
import { X, Printer, Download, Award, School } from "lucide-react";
import { ChildReportCardSummary } from "../domain/guardian-types";

export interface GuardianReportPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportCard: ChildReportCardSummary;
}

export function GuardianReportPrintModal({
  isOpen,
  onClose,
  reportCard,
}: GuardianReportPrintModalProps) {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      data-testid="guardian-report-print-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200 print:p-0 print:bg-white print:static"
    >
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col my-auto print:shadow-none print:border-none print:max-w-none print:rounded-none">
        {/* Modal Toolbar (Disembunyikan saat window.print) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-blue-100 text-[#2563EB] flex items-center justify-center font-bold">
              <Award className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                Pratinjau Lembar e-Rapor Resmi — {reportCard.nama_siswa}
              </h2>
              <p className="text-xs text-slate-500">
                Dokumen Hasil Belajar Kurikulum Merdeka • {reportCard.semester_nama}{" "}
                {reportCard.tahun_ajaran}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              data-testid="print-button"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Sheet (A4 Dimensions) */}
        <div className="p-6 sm:p-10 overflow-y-auto bg-white text-slate-900 text-xs font-sans print:p-0">
          {/* Header Sekolah Resmi */}
          <div className="border-b-2 border-slate-900 pb-4 mb-6 text-center">
            <div className="flex items-center justify-center gap-3 mb-1">
              <School className="h-7 w-7 text-slate-800" />
              <h1 className="text-lg sm:text-xl font-extrabold tracking-tight uppercase">
                SMK NEGERI OTOMINDO JAKARTA
              </h1>
            </div>
            <p className="text-[11px] text-slate-600">
              Jl. Pendidikan No. 123, Jakarta • Telp: (021) 7890123 • Website:
              https://otomindo.sch.id
            </p>
            <h2 className="text-xs sm:text-sm font-bold tracking-wider uppercase mt-3 text-slate-800">
              LAPORAN HASIL CAPAIAN KOMPETENSI PESERTA DIDIK
            </h2>
          </div>

          {/* Identitas Siswa */}
          <div className="grid grid-cols-2 gap-y-1.5 gap-x-6 mb-6 p-4 rounded-xl bg-slate-50/50 border border-slate-200 print:bg-transparent print:p-2 text-xs">
            <div className="flex">
              <span className="w-32 font-semibold text-slate-600">Nama Siswa</span>
              <span className="font-bold text-slate-900">: {reportCard.nama_siswa}</span>
            </div>
            <div className="flex">
              <span className="w-32 font-semibold text-slate-600">Fase / Kelas</span>
              <span className="font-bold text-slate-900">
                : {reportCard.fase} / {reportCard.rombel_nama}
              </span>
            </div>
            <div className="flex">
              <span className="w-32 font-semibold text-slate-600">NIS / NISN</span>
              <span className="font-bold text-slate-900">
                : {reportCard.nis} / {reportCard.nisn || "-"}
              </span>
            </div>
            <div className="flex">
              <span className="w-32 font-semibold text-slate-600">Semester</span>
              <span className="font-bold text-slate-900">: {reportCard.semester_nama}</span>
            </div>
            <div className="flex">
              <span className="w-32 font-semibold text-slate-600">Sekolah</span>
              <span className="font-bold text-slate-900">: SMK OTOMINDO</span>
            </div>
            <div className="flex">
              <span className="w-32 font-semibold text-slate-600">Tahun Ajaran</span>
              <span className="font-bold text-slate-900">: {reportCard.tahun_ajaran}</span>
            </div>
          </div>

          {/* Tabel Nilai Capaian Kompetensi */}
          <div className="mb-6 overflow-hidden rounded-xl border border-slate-300">
            <table className="w-full text-left border-collapse text-[11px]">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                  <th className="py-2.5 px-3 w-8 text-center border-r border-slate-300">No</th>
                  <th className="py-2.5 px-3 w-44 border-r border-slate-300">Mata Pelajaran</th>
                  <th className="py-2.5 px-2 w-14 text-center border-r border-slate-300">KKTP</th>
                  <th className="py-2.5 px-2 w-16 text-center border-r border-slate-300">
                    Nilai Akhir
                  </th>
                  <th className="py-2.5 px-2 w-14 text-center border-r border-slate-300">
                    Predikat
                  </th>
                  <th className="py-2.5 px-3">Capaian Kompetensi Resmi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {reportCard.mata_pelajaran.map((item, idx) => (
                  <tr key={item.mata_pelajaran_id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 text-center border-r border-slate-200">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-semibold border-r border-slate-200">
                      <div>{item.mata_pelajaran_nama}</div>
                      <div className="text-[10px] text-slate-500 font-normal">{item.guru_nama}</div>
                    </td>
                    <td className="py-2.5 px-2 text-center border-r border-slate-200 font-mono">
                      {item.kktp}
                    </td>
                    <td className="py-2.5 px-2 text-center border-r border-slate-200 font-bold font-mono">
                      {item.nilai_akhir !== null ? item.nilai_akhir : "-"}
                    </td>
                    <td className="py-2.5 px-2 text-center border-r border-slate-200 font-bold">
                      {item.predikat}
                    </td>
                    <td className="py-2.5 px-3 text-[10px] text-slate-700 leading-relaxed">
                      {item.capaian_tertinggi && (
                        <div>
                          <strong className="text-emerald-700">Tuntas Optimal: </strong>
                          {item.capaian_tertinggi}
                        </div>
                      )}
                      {item.capaian_terendah && (
                        <div className="mt-0.5 text-slate-500">
                          <strong className="text-amber-700">Perlu Peningkatan: </strong>
                          {item.capaian_terendah}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Rekapitulasi Presensi & Ekstrakurikuler */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="p-3.5 rounded-xl border border-slate-200">
              <h4 className="font-bold text-slate-900 mb-2 border-b pb-1 text-xs">
                Ketidakhadiran Semester
              </h4>
              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-600">Sakit (S)</span>
                  <span className="font-bold">{reportCard.rekap_presensi.sakit} hari</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Izin (I)</span>
                  <span className="font-bold">{reportCard.rekap_presensi.izin} hari</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Tanpa Keterangan (A)</span>
                  <span className="font-bold">{reportCard.rekap_presensi.alpa} hari</span>
                </div>
                <div className="flex justify-between pt-1 border-t text-emerald-700 font-bold">
                  <span>Tingkat Kehadiran</span>
                  <span>{reportCard.rekap_presensi.persentase_kehadiran}%</span>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200">
              <h4 className="font-bold text-slate-900 mb-2 border-b pb-1 text-xs">
                Catatan Wali Kelas
              </h4>
              <p className="text-[11px] text-slate-700 leading-relaxed italic">
                &ldquo;{reportCard.catatan_wali_kelas}&rdquo;
              </p>
              {reportCard.status_kenaikan && (
                <div className="mt-2 pt-2 border-t text-[11px] font-bold text-blue-800">
                  Keputusan: {reportCard.status_kenaikan}
                </div>
              )}
            </div>
          </div>

          {/* Tanda Tangan */}
          <div className="grid grid-cols-3 gap-4 pt-6 text-center text-[11px]">
            <div>
              <p className="text-slate-600">Mengetahui,</p>
              <p className="text-slate-600">Orang Tua / Wali Siswa</p>
              <div className="h-16" />
              <p className="font-bold border-t border-slate-400 pt-1 inline-block min-w-[140px]">
                ( ..................................... )
              </p>
            </div>

            <div>
              <p className="text-slate-600">Jakarta, 20 Desember 2026</p>
              <p className="text-slate-600">Wali Kelas</p>
              <div className="h-16" />
              <p className="font-bold border-t border-slate-400 pt-1 inline-block min-w-[140px]">
                {reportCard.wali_kelas_nama}
              </p>
              {reportCard.wali_kelas_nip && (
                <p className="text-[10px] text-slate-500">NIP. {reportCard.wali_kelas_nip}</p>
              )}
            </div>

            <div>
              <p className="text-slate-600">Mengetahui,</p>
              <p className="text-slate-600">Kepala Sekolah</p>
              <div className="h-16" />
              <p className="font-bold border-t border-slate-400 pt-1 inline-block min-w-[140px]">
                {reportCard.kepala_sekolah_nama}
              </p>
              {reportCard.kepala_sekolah_nip && (
                <p className="text-[10px] text-slate-500">NIP. {reportCard.kepala_sekolah_nip}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

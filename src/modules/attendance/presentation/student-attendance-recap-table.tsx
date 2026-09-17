"use client";

/**
 * Ruang Pintar — M12 Student Attendance Recap Table Component
 *
 * Menampilkan tabel matriks rekapitulasi kehadiran seluruh siswa dalam rombel:
 * - Ringkasan KPI kehadiran kelas (Total siswa, total sesi terekam, rerata kehadiran, siswa perlu perhatian)
 * - Pencarian nama / NISN dan filter status kehadiran
 * - Tabel roster siswa lengkap: Hadir, Sakit, Izin, Alpha, Dispensasi, Terlambat, %, Status Evaluasi
 * - Ekspor berkas CSV rekapitulasi kelas instan dan tombol cetak A4
 */

import React, { useState, useMemo } from "react";
import Image from "next/image";
import {
  Users,
  Search,
  Download,
  Printer,
  CheckCircle2,
  AlertTriangle,
  Calendar,
} from "lucide-react";
import { ClassAttendanceRecapDTO } from "../domain/attendance-types";

interface StudentAttendanceRecapTableProps {
  recap: ClassAttendanceRecapDTO;
  title?: string;
  showExportButtons?: boolean;
}

export function StudentAttendanceRecapTable({
  recap,
  title,
  showExportButtons = true,
}: StudentAttendanceRecapTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ATTENTION" | "GOOD">("ALL");

  // Filter siswa
  const filteredStudents = useMemo(() => {
    return recap.daftar_siswa.filter((s) => {
      // Filter teks
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        s.nama_lengkap.toLowerCase().includes(q) ||
        (s.nisn && s.nisn.toLowerCase().includes(q)) ||
        (s.nis && s.nis.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      // Filter status
      if (statusFilter === "ATTENTION") {
        return (
          s.status_evaluasi === "Perlu Perhatian" || s.alpha > 0 || s.persentase_kehadiran < 75
        );
      }
      if (statusFilter === "GOOD") {
        return s.status_evaluasi === "Sangat Baik" || s.status_evaluasi === "Baik";
      }

      return true;
    });
  }, [recap.daftar_siswa, searchQuery, statusFilter]);

  // Statistik ringkasan
  const totalAlphaCases = useMemo(
    () => recap.daftar_siswa.reduce((acc, s) => acc + s.alpha, 0),
    [recap.daftar_siswa]
  );
  const totalSakitCases = useMemo(
    () => recap.daftar_siswa.reduce((acc, s) => acc + s.sakit, 0),
    [recap.daftar_siswa]
  );
  const totalIzinCases = useMemo(
    () => recap.daftar_siswa.reduce((acc, s) => acc + s.izin, 0),
    [recap.daftar_siswa]
  );

  // Ekspor CSV
  const handleExportCsv = () => {
    const headers = [
      "No",
      "No. Absen",
      "NISN",
      "NIS",
      "Nama Siswa",
      "Rombel",
      "Mata Pelajaran",
      "Hadir",
      "Sakit",
      "Izin",
      "Alpha",
      "Dispensasi",
      "Terlambat",
      "Total Sesi Tercatat",
      "Persentase Kehadiran",
      "Status Capaian",
    ];

    const lines = [headers.join(",")];

    recap.daftar_siswa.forEach((s, idx) => {
      const line = [
        idx + 1,
        s.nomor_absen ?? "-",
        `"${s.nisn ?? "-"}"`,
        `"${s.nis ?? "-"}"`,
        `"${s.nama_lengkap.replace(/"/g, '""')}"`,
        `"${recap.rombel_nama}"`,
        `"${recap.mata_pelajaran_nama}"`,
        s.hadir,
        s.sakit,
        s.izin,
        s.alpha,
        s.dispensasi,
        s.terlambat,
        s.total_sesi_tercatat,
        `"${s.persentase_kehadiran}%"`,
        `"${s.status_evaluasi}"`,
      ];
      lines.push(line.join(","));
    });

    const csvContent = lines.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const filename = `Rekap_Presensi_${recap.rombel_nama.replace(/\s+/g, "_")}_${recap.mata_pelajaran_kode}_${Date.now()}.csv`;

    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const getEvaluationBadge = (status: string) => {
    switch (status) {
      case "Sangat Baik":
        return "bg-emerald-50 text-emerald-700 border-emerald-200/80";
      case "Baik":
        return "bg-blue-50 text-blue-700 border-blue-200/80";
      case "Cukup":
        return "bg-amber-50 text-amber-700 border-amber-200/80";
      case "Perlu Perhatian":
        return "bg-rose-50 text-rose-700 border-rose-200/80 font-bold";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. KPI Metrik Ringkasan Rekapitulasi */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Siswa */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Total Siswa
            </span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-[#2563EB]">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900">
            {recap.total_siswa} Siswa
          </div>
          <p className="text-[10px] text-slate-400">Rombel: {recap.rombel_nama}</p>
        </div>

        {/* Total Sesi Tercatat */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Sesi Diabsen
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-700">
            {recap.total_sesi_tercatat}{" "}
            <span className="text-xs font-semibold text-slate-400">
              / {recap.total_sesi_terjadwal} sesi
            </span>
          </div>
          <p className="text-[10px] text-slate-400">Terekam di sistem</p>
        </div>

        {/* Rerata Kehadiran Kelas */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Rerata Kehadiran
            </span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-[#2563EB]">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#2563EB]">
            {recap.rerata_kehadiran_kelas}%
          </div>
          <p className="text-[10px] text-slate-400">Kehadiran seluruh siswa</p>
        </div>

        {/* Perlu Perhatian */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Perlu Perhatian
            </span>
            <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-rose-700">
            {recap.jumlah_perlu_perhatian} Siswa
          </div>
          <p className="text-[10px] text-slate-400">Kehadiran &lt; 75% atau Alpha &ge; 3</p>
        </div>
      </div>

      {/* 2. Toolbar Kontrol, Filter & Tombol Aksi */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama siswa atau NISN..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
        </div>

        {/* Filter & Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status Filter Buttons */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setStatusFilter("ALL")}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                statusFilter === "ALL"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Semua ({recap.daftar_siswa.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("ATTENTION")}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                statusFilter === "ATTENTION"
                  ? "bg-rose-600 text-white shadow-2xs"
                  : "text-rose-700 hover:bg-rose-50"
              }`}
            >
              Perhatian ({recap.jumlah_perlu_perhatian})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("GOOD")}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                statusFilter === "GOOD"
                  ? "bg-emerald-600 text-white shadow-2xs"
                  : "text-emerald-700 hover:bg-emerald-50"
              }`}
            >
              Baik
            </button>
          </div>

          {/* Export CSV & Print */}
          {showExportButtons && (
            <div className="flex items-center gap-1.5 ml-auto sm:ml-0">
              <button
                type="button"
                onClick={handleExportCsv}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-bold transition-all cursor-pointer"
                title="Unduh Rekapitulasi Presensi Format CSV"
              >
                <Download className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Ekspor CSV</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                title="Cetak Rekapitulasi Presensi Kelas"
              >
                <Printer className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Cetak</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3. Tabel Matriks Rekapitulasi Presensi Siswa */}
      <div className="overflow-hidden rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/85 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-3 text-center w-12">No</th>
                <th className="py-3 px-3 text-center w-16">Absen</th>
                <th className="py-3 px-4 min-w-[200px]">Identitas Siswa</th>
                <th
                  className="py-3 px-2 text-center text-emerald-700 bg-emerald-50/40 w-12"
                  title="Hadir"
                >
                  H
                </th>
                <th
                  className="py-3 px-2 text-center text-amber-700 bg-amber-50/40 w-12"
                  title="Sakit"
                >
                  S
                </th>
                <th className="py-3 px-2 text-center text-sky-700 bg-sky-50/40 w-12" title="Izin">
                  I
                </th>
                <th
                  className="py-3 px-2 text-center text-rose-700 bg-rose-50/40 w-12"
                  title="Alpha (Tanpa Keterangan)"
                >
                  A
                </th>
                <th
                  className="py-3 px-2 text-center text-purple-700 bg-purple-50/40 w-12"
                  title="Dispensasi"
                >
                  D
                </th>
                <th
                  className="py-3 px-2 text-center text-orange-700 bg-orange-50/40 w-12"
                  title="Terlambat"
                >
                  T
                </th>
                <th className="py-3 px-3 text-center w-16">Total Sesi</th>
                <th className="py-3 px-4 text-center min-w-[120px]">% Kehadiran</th>
                <th className="py-3 px-3 text-center w-28">Status Capaian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-slate-400">
                    Tidak ada data siswa yang cocok dengan kriteria pencarian / filter.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s, idx) => {
                  const initial = s.nama_lengkap.charAt(0).toUpperCase();

                  return (
                    <tr
                      key={s.siswa_id}
                      className={`hover:bg-slate-50/90 transition-colors ${
                        s.alpha >= 3 ? "bg-rose-50/30" : ""
                      }`}
                    >
                      {/* Nomor Urut */}
                      <td className="py-3 px-3 text-center font-mono text-slate-400 text-[11px]">
                        {idx + 1}
                      </td>

                      {/* Nomor Absen */}
                      <td className="py-3 px-3 text-center font-mono font-bold text-slate-700 text-xs">
                        {s.nomor_absen ?? "-"}
                      </td>

                      {/* Identitas Siswa */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {s.foto_url ? (
                            <Image
                              src={s.foto_url}
                              alt={s.nama_lengkap}
                              width={36}
                              height={36}
                              className="w-9 h-9 rounded-full object-cover shrink-0 aspect-square border border-slate-200/80 shadow-2xs"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                              {initial}
                            </div>
                          )}
                          <div className="min-w-0">
                            <span className="font-bold text-slate-900 block truncate hover:text-[#2563EB] transition-colors">
                              {s.nama_lengkap}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono block">
                              NISN: {s.nisn || "-"} {s.nis ? `• NIS: ${s.nis}` : ""}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Hadir (H) */}
                      <td className="py-3 px-2 text-center font-mono font-bold text-emerald-700 bg-emerald-50/20">
                        {s.hadir}
                      </td>

                      {/* Sakit (S) */}
                      <td className="py-3 px-2 text-center font-mono font-bold text-amber-700 bg-amber-50/20">
                        {s.sakit > 0 ? (
                          <span className="px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800">
                            {s.sakit}
                          </span>
                        ) : (
                          <span className="text-slate-300">0</span>
                        )}
                      </td>

                      {/* Izin (I) */}
                      <td className="py-3 px-2 text-center font-mono font-bold text-sky-700 bg-sky-50/20">
                        {s.izin > 0 ? (
                          <span className="px-1.5 py-0.5 rounded-md bg-sky-100 text-sky-800">
                            {s.izin}
                          </span>
                        ) : (
                          <span className="text-slate-300">0</span>
                        )}
                      </td>

                      {/* Alpha (A) */}
                      <td className="py-3 px-2 text-center font-mono font-bold text-rose-700 bg-rose-50/20">
                        {s.alpha > 0 ? (
                          <span className="px-1.5 py-0.5 rounded-md bg-rose-600 text-white font-black animate-pulse">
                            {s.alpha}
                          </span>
                        ) : (
                          <span className="text-slate-300">0</span>
                        )}
                      </td>

                      {/* Dispensasi (D) */}
                      <td className="py-3 px-2 text-center font-mono font-bold text-purple-700 bg-purple-50/20">
                        {s.dispensasi > 0 ? (
                          s.dispensasi
                        ) : (
                          <span className="text-slate-300">0</span>
                        )}
                      </td>

                      {/* Terlambat (T) */}
                      <td className="py-3 px-2 text-center font-mono font-bold text-orange-700 bg-orange-50/20">
                        {s.terlambat > 0 ? s.terlambat : <span className="text-slate-300">0</span>}
                      </td>

                      {/* Total Sesi */}
                      <td className="py-3 px-3 text-center font-mono text-slate-600 text-xs">
                        {s.total_sesi_tercatat}
                      </td>

                      {/* Persentase Kehadiran */}
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px] font-mono font-bold">
                            <span
                              className={
                                s.persentase_kehadiran >= 85
                                  ? "text-emerald-700"
                                  : s.persentase_kehadiran >= 75
                                    ? "text-amber-700"
                                    : "text-rose-700"
                              }
                            >
                              {s.persentase_kehadiran}%
                            </span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                s.persentase_kehadiran >= 85
                                  ? "bg-emerald-500"
                                  : s.persentase_kehadiran >= 75
                                    ? "bg-amber-500"
                                    : "bg-rose-500"
                              }`}
                              style={{ width: `${s.persentase_kehadiran}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Status Capaian */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-bold border ${getEvaluationBadge(
                            s.status_evaluasi
                          )}`}
                        >
                          {s.status_evaluasi}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {/* Table Footer: Rangkuman */}
            {recap.daftar_siswa.length > 0 && (
              <tfoot>
                <tr className="bg-slate-50/90 border-t-2 border-slate-200 text-slate-700 font-bold text-xs">
                  <td colSpan={3} className="py-3 px-4 text-slate-800">
                    Rangkuman Akumulasi Kelas ({recap.daftar_siswa.length} Siswa)
                  </td>
                  <td className="py-3 px-2 text-center text-emerald-700 font-mono">
                    {recap.daftar_siswa.reduce((acc, s) => acc + s.hadir, 0)}
                  </td>
                  <td className="py-3 px-2 text-center text-amber-700 font-mono">
                    {totalSakitCases}
                  </td>
                  <td className="py-3 px-2 text-center text-sky-700 font-mono">{totalIzinCases}</td>
                  <td className="py-3 px-2 text-center text-rose-700 font-mono">
                    {totalAlphaCases}
                  </td>
                  <td className="py-3 px-2 text-center text-purple-700 font-mono">
                    {recap.daftar_siswa.reduce((acc, s) => acc + s.dispensasi, 0)}
                  </td>
                  <td className="py-3 px-2 text-center text-orange-700 font-mono">
                    {recap.daftar_siswa.reduce((acc, s) => acc + s.terlambat, 0)}
                  </td>
                  <td className="py-3 px-3 text-center text-slate-500 font-mono">
                    {recap.total_sesi_tercatat}
                  </td>
                  <td className="py-3 px-4 text-center font-mono text-[#2563EB]">
                    Rerata: {recap.rerata_kehadiran_kelas}%
                  </td>
                  <td className="py-3 px-3 text-center text-[11px] text-slate-500">
                    {recap.jumlah_perlu_perhatian} Perhatian
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}

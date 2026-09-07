"use client";

/**
 * Ruang Pintar — Student Report Card View (Phase 15 / M15)
 *
 * Buku Nilai & Kompilasi e-Rapor Resmi Kurikulum Merdeka:
 * - Tab 1: Kompilasi Rapor Semester (Formatif, Sumatif, NA, Predikat, Deskripsi CP)
 * - Tab 2: Rincian Seluruh Nilai Asesmen Terpublikasi (Strict Non-Leakage of Drafts)
 * - Dukungan Cetak Lembar Rapor Resmi A4 (ReportCardPrintModal)
 */

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Filter,
  GraduationCap,
  Printer,
  Search,
  Sparkles,
  TrendingUp,
  UserCheck,
  Layers,
  AlertCircle,
} from "lucide-react";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import {
  StudentReportCardCompilation,
  StudentPublishedGradeItem,
} from "../domain/student-experience-types";
import { ReportCardPrintModal } from "./report-card-print-modal";

export interface StudentReportCardViewProps {
  reportCard: StudentReportCardCompilation;
  grades: StudentPublishedGradeItem[];
}

export function StudentReportCardView({ reportCard, grades }: StudentReportCardViewProps) {
  const [activeTab, setActiveTab] = useState<"rapor" | "rincian">("rapor");
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);

  const tabs = [
    {
      id: "rapor" as const,
      label: "Kompilasi e-Rapor Semester",
      icon: FileSpreadsheet,
    },
    {
      id: "rincian" as const,
      label: `Rincian Asesmen Terpublikasi (${grades.length})`,
      icon: Award,
    },
  ];

  // Filter Rincian Asesmen
  const [gradeSearch, setGradeSearch] = useState("");
  const [gradeCategoryFilter, setGradeCategoryFilter] = useState<string>("SEMUA");

  const {
    siswa,
    sekolahNama,
    tahunAjaran,
    semester,
    mataPelajaranList,
    rerataKeseluruhan,
    presensi,
    catatanWaliKelas,
  } = reportCard;

  const totalMapelDinilai = mataPelajaranList.filter((m) => m.nilaiAkhir !== null).length;

  const tuntasCount = mataPelajaranList.filter((m) => m.isTuntas).length;
  const persentaseTuntas =
    totalMapelDinilai > 0 ? Math.round((tuntasCount / totalMapelDinilai) * 100) : 100;

  // Filtered individual published grades
  const filteredGrades = useMemo(() => {
    return grades.filter((g) => {
      const matchSearch =
        g.judulAsesmen.toLowerCase().includes(gradeSearch.toLowerCase()) ||
        g.mataPelajaranNama.toLowerCase().includes(gradeSearch.toLowerCase()) ||
        g.guruNama.toLowerCase().includes(gradeSearch.toLowerCase()) ||
        (g.tpDeskripsi && g.tpDeskripsi.toLowerCase().includes(gradeSearch.toLowerCase()));

      if (!matchSearch) return false;

      if (gradeCategoryFilter !== "SEMUA") {
        return g.kategori === gradeCategoryFilter;
      }

      return true;
    });
  }, [grades, gradeSearch, gradeCategoryFilter]);

  return (
    <div className="space-y-6 pb-12">
      {/* 3D Hero Pop-out Banner */}
      <div className="relative rounded-3xl bg-white border border-slate-100/90 p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.03)] overflow-visible">
        <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-emerald-50/60 to-transparent rounded-r-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="w-full md:max-w-[65%] space-y-3">
            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
              <Link href="/dashboard" className="hover:text-[#2563EB] transition-colors">
                Dashboard
              </Link>
              <span>/</span>
              <span className="text-slate-700 font-semibold">Buku Nilai & Rapor</span>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
                  Buku Nilai & e-Rapor Siswa
                </h1>
                <span className="px-2.5 py-0.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-xs">
                  {siswa.rombelNama} • {semester}
                </span>
              </div>
              <p className="text-slate-500 text-xs sm:text-sm leading-relaxed max-w-2xl">
                Transkrip capaian kompetensi Kurikulum Merdeka, evaluasi formatif dan sumatif, serta
                lembar cetak rapor resmi.
              </p>
            </div>

            {/* Print CTA Button */}
            <div className="pt-2">
              <Button
                type="button"
                onClick={() => setIsPrintModalOpen(true)}
                className="rounded-2xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs sm:text-sm px-5 py-2.5 shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
              >
                <Printer className="h-4 w-4" />
                Cetak Lembar Rapor Resmi (Print / PDF)
              </Button>
            </div>
          </div>

          <div className="hidden md:flex flex-col items-center justify-center shrink-0 relative pr-4">
            <div className="relative w-40 h-36 lg:w-48 lg:h-40 transition-transform duration-500 hover:scale-105">
              <Image
                src="/images/illustrations/academic-structure-3d.png"
                alt="Report Card 3D"
                fill
                sizes="(max-width: 1024px) 160px, 192px"
                className="object-contain drop-shadow-xl"
                priority
              />
            </div>
          </div>
        </div>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Rerata Nilai Akhir</span>
            <Award className="h-5 w-5 text-[#2563EB]" />
          </div>
          <p className="text-3xl font-extrabold text-[#0F172A]">
            {rerataKeseluruhan !== null ? rerataKeseluruhan : "-"}
          </p>
          <p className="text-[11px] text-emerald-600 font-semibold">Standar Kelulusan KKTP: 75.0</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Mapel Dinilai</span>
            <BookOpen className="h-5 w-5 text-indigo-600" />
          </div>
          <p className="text-3xl font-extrabold text-[#0F172A]">
            {totalMapelDinilai} / {mataPelajaranList.length}
          </p>
          <p className="text-[11px] text-slate-400 font-medium">Mata Pelajaran Kurikulum</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Ketuntasan KKTP</span>
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          </div>
          <p className="text-3xl font-extrabold text-emerald-700">{persentaseTuntas}%</p>
          <p className="text-[11px] text-emerald-600 font-semibold">
            {tuntasCount} Mapel Memenuhi KKTP
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Ketidakhadiran</span>
            <UserCheck className="h-5 w-5 text-amber-600" />
          </div>
          <p className="text-3xl font-extrabold text-[#0F172A]">
            {presensi.sakit + presensi.izin + presensi.tanpaKeterangan} Hari
          </p>
          <p className="text-[11px] text-slate-400 font-medium">
            Sakit: {presensi.sakit} • Izin: {presensi.izin} • Alpa: {presensi.tanpaKeterangan}
          </p>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="space-y-6">
        <div className="rounded-3xl bg-white/80 backdrop-blur-md border border-slate-200/80 p-1.5 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#2563EB] text-white shadow-xs"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: KOMPILASI e-RAPOR SEMESTER */}
        {/* ========================================================================= */}
        {activeTab === "rapor" && (
          <div className="space-y-6">
            <div className="rounded-3xl bg-white border border-slate-200/80 p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-extrabold text-[#0F172A]">
                    Tabel Hasil Pembelajaran Mata Pelajaran
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Kurikulum Merdeka • Kelas {siswa.rombelNama} • Tahun Ajaran {tahunAjaran}
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsPrintModalOpen(true)}
                  className="rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                >
                  <Printer className="h-3.5 w-3.5" />
                  Cetak Rapor Resmi
                </Button>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-3 text-center w-10">No</th>
                      <th className="py-3 px-4">Mata Pelajaran</th>
                      <th className="py-3 px-3 text-center w-14">KKTP</th>
                      <th className="py-3 px-3 text-center w-16">Formatif</th>
                      <th className="py-3 px-3 text-center w-16">Sumatif</th>
                      <th className="py-3 px-3 text-center w-20">Nilai Akhir</th>
                      <th className="py-3 px-3 text-center w-14">Predikat</th>
                      <th className="py-3 px-4">Deskripsi Capaian Kompetensi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {mataPelajaranList.map((mapel, idx) => (
                      <tr
                        key={mapel.mataPelajaranId}
                        className="hover:bg-slate-50/60 transition-colors"
                      >
                        <td className="py-3 px-3 text-center font-bold text-slate-500">
                          {idx + 1}
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-bold text-slate-900 text-xs sm:text-sm">
                            {mapel.mataPelajaranNama}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">{mapel.guruNama}</p>
                        </td>
                        <td className="py-3 px-3 text-center font-semibold text-slate-600">
                          {mapel.kkmKktp}
                        </td>
                        <td className="py-3 px-3 text-center text-slate-700">
                          {mapel.rerataFormatif !== null ? mapel.rerataFormatif : "-"}
                        </td>
                        <td className="py-3 px-3 text-center text-slate-700">
                          {mapel.rerataSumatif !== null ? mapel.rerataSumatif : "-"}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`px-2.5 py-1 rounded-lg text-xs font-extrabold inline-block border ${
                              mapel.nilaiAkhir === null
                                ? "bg-slate-50 text-slate-400 border-slate-200"
                                : mapel.isTuntas
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : "bg-amber-50 text-amber-700 border-amber-200"
                            }`}
                          >
                            {mapel.nilaiAkhir !== null ? mapel.nilaiAkhir : "-"}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center font-extrabold text-[#2563EB]">
                          {mapel.predikat}
                        </td>
                        <td className="py-3 px-4 text-[11px] text-slate-700 max-w-xs leading-relaxed">
                          <p className="font-medium text-slate-800">
                            {mapel.deskripsiCapaianTertinggi}
                          </p>
                          {mapel.deskripsiPerluPeningkatan && (
                            <p className="text-slate-500 mt-1">{mapel.deskripsiPerluPeningkatan}</p>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Catatan Wali Kelas Card */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-50/80 to-indigo-50/50 border border-blue-100 shadow-2xs space-y-2">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-[#2563EB]" />
                <h3 className="text-sm font-bold text-[#0F172A]">
                  Catatan Wali Kelas ({siswa.waliKelasNama || "Wali Kelas"})
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
                &ldquo;{catatanWaliKelas}&rdquo;
              </p>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: RINCIAN NILAI ASESMEN TERPUBLIKASI */}
        {/* ========================================================================= */}
        {activeTab === "rincian" && (
          <div className="space-y-4">
            <div className="p-3 sm:p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Cari asesmen berdasarkan judul, topik TP, atau mata pelajaran..."
                  value={gradeSearch}
                  onChange={(e) => setGradeSearch(e.target.value)}
                  className="pl-10 rounded-xl border-slate-200 text-xs sm:text-sm focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                  <Filter className="h-3.5 w-3.5 text-slate-400" /> Kategori:
                </span>
                {(
                  [
                    ["SEMUA", "Semua"],
                    ["FORMATIF", "Formatif"],
                    ["SUMATIF", "Sumatif"],
                  ] as const
                ).map(([cat, label]) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setGradeCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      gradeCategoryFilter === cat
                        ? "bg-[#2563EB] text-white border-[#2563EB] shadow-2xs"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {filteredGrades.length === 0 ? (
              <div className="py-12 text-center rounded-3xl bg-white border border-slate-100 shadow-2xs space-y-2">
                <Award className="h-10 w-10 text-slate-300 mx-auto" />
                <h3 className="text-sm font-bold text-slate-700">
                  Tidak Ada Nilai Asesmen Terpublikasi
                </h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Sesuai aturan sistem, hanya nilai asesmen yang telah dirilis resmi oleh guru yang
                  akan ditampilkan di portal ini.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredGrades.map((g) => (
                  <div
                    key={g.asesmenId}
                    className="p-5 rounded-3xl bg-white border border-slate-100/90 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-md transition-all flex flex-col justify-between gap-4"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2.5 py-0.5 rounded-lg bg-blue-50 text-[#2563EB] text-[11px] font-bold truncate max-w-[180px]">
                          {g.mataPelajaranNama}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                          {g.kategori}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-sm font-extrabold text-[#0F172A] tracking-tight line-clamp-2">
                          {g.judulAsesmen}
                        </h3>
                        {g.tpDeskripsi && (
                          <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                            {g.tpKode ? `${g.tpKode} • ` : ""}
                            {g.tpDeskripsi}
                          </p>
                        )}
                        <p className="text-xs text-slate-400 mt-1 font-medium">
                          Guru: {g.guruNama}
                        </p>
                      </div>

                      {g.capaianKompetensi && (
                        <p className="text-xs text-emerald-800 bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-100 leading-snug">
                          {g.capaianKompetensi}
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div className="text-[11px] text-slate-500">
                        KKTP: <strong>{g.kkmKktp}</strong>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-base font-extrabold px-3 py-1 rounded-xl border ${
                            g.isTuntas
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          {g.nilaiAngka !== null ? g.nilaiAngka : "-"}
                        </span>
                        <span className="text-xs font-bold text-slate-700">
                          ({g.nilaiHuruf || "-"})
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal Cetak Rapor Resmi */}
      <ReportCardPrintModal
        reportCard={reportCard}
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
      />
    </div>
  );
}

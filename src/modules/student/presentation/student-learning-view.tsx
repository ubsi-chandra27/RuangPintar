"use client";

/**
 * Ruang Pintar — Student Learning View (Phase 15 / M15)
 *
 * Tampilan Terpadu Aktivitas Belajar Siswa:
 * - Tab 1: Tugas & Pengumpulan (Assignment Submission & Tracking)
 * - Tab 2: Direktori Materi Pembelajaran (Reading, Download, Links)
 * - Tab 3: Presensi Kehadiran Kelas (Attendance History & Recap)
 */

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BookOpen,
  Calendar,
  Clock,
  CheckCircle2,
  FileText,
  Search,
  Download,
  ExternalLink,
  Filter,
  Layers,
  Sparkles,
  AlertCircle,
  FileCheck,
  UserCheck,
  GraduationCap,
} from "lucide-react";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import {
  StudentProfileContext,
  StudentAssignmentItem,
  StudentMaterialItem,
  StudentAttendanceSummary,
} from "../domain/student-experience-types";
import { SubmitAssignmentModal } from "./submit-assignment-modal";
import { MaterialDetailModal } from "./material-detail-modal";

export interface StudentLearningViewProps {
  profile: StudentProfileContext;
  materials: StudentMaterialItem[];
  assignments: StudentAssignmentItem[];
  attendance: StudentAttendanceSummary;
}

export function StudentLearningView({
  profile,
  materials,
  assignments,
  attendance,
}: StudentLearningViewProps) {
  const [activeTab, setActiveTab] = useState<"tugas" | "materi" | "presensi">("tugas");

  // Filter & Search Tugas
  const [assignmentSearch, setAssignmentSearch] = useState("");
  const [assignmentStatusFilter, setAssignmentStatusFilter] = useState<string>("SEMUA");

  // Filter & Search Materi
  const [materialSearch, setMaterialSearch] = useState("");
  const [materialSubjectFilter, setMaterialSubjectFilter] = useState<string>("SEMUA");

  // Modals state
  const [selectedAssignment, setSelectedAssignment] = useState<StudentAssignmentItem | null>(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  const [selectedMaterial, setSelectedMaterial] = useState<StudentMaterialItem | null>(null);
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);

  // Filtered Assignments
  const filteredAssignments = useMemo(() => {
    return assignments.filter((item) => {
      const matchSearch =
        item.judul.toLowerCase().includes(assignmentSearch.toLowerCase()) ||
        item.mataPelajaranNama.toLowerCase().includes(assignmentSearch.toLowerCase()) ||
        item.guruNama.toLowerCase().includes(assignmentSearch.toLowerCase());

      if (!matchSearch) return false;

      if (assignmentStatusFilter === "PERLU_DIKERJAKAN") {
        return item.statusPengerjaan !== "SUDAH_DIKUMPULKAN";
      }
      if (assignmentStatusFilter === "SUDAH_DIKUMPULKAN") {
        return item.statusPengerjaan === "SUDAH_DIKUMPULKAN";
      }
      if (assignmentStatusFilter === "TERLAMBAT") {
        return item.statusPengerjaan === "TERLAMBAT";
      }

      return true;
    });
  }, [assignments, assignmentSearch, assignmentStatusFilter]);

  // Unique Subjects for Material Filter
  const materialSubjects = useMemo(() => {
    return Array.from(new Set(materials.map((m) => m.mataPelajaranNama)));
  }, [materials]);

  // Filtered Materials
  const filteredMaterials = useMemo(() => {
    return materials.filter((item) => {
      const matchSearch =
        item.judul.toLowerCase().includes(materialSearch.toLowerCase()) ||
        item.mataPelajaranNama.toLowerCase().includes(materialSearch.toLowerCase()) ||
        item.guruNama.toLowerCase().includes(materialSearch.toLowerCase()) ||
        (item.babJudul && item.babJudul.toLowerCase().includes(materialSearch.toLowerCase()));

      if (!matchSearch) return false;

      if (materialSubjectFilter !== "SEMUA") {
        return item.mataPelajaranNama === materialSubjectFilter;
      }

      return true;
    });
  }, [materials, materialSearch, materialSubjectFilter]);

  const handleOpenSubmit = (assignment: StudentAssignmentItem) => {
    setSelectedAssignment(assignment);
    setIsSubmitModalOpen(true);
  };

  const handleOpenMaterial = (material: StudentMaterialItem) => {
    setSelectedMaterial(material);
    setIsMaterialModalOpen(true);
  };

  const tabs = [
    {
      id: "tugas" as const,
      label: `Tugas Kelas (${assignments.length})`,
      icon: BookOpen,
    },
    {
      id: "materi" as const,
      label: `Materi Pelajaran (${materials.length})`,
      icon: FileText,
    },
    {
      id: "presensi" as const,
      label: `Presensi Kelas (${attendance.persentaseKehadiran}%)`,
      icon: UserCheck,
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Pop-out 3D Hero Banner (Academic Glass UI) */}
      <div className="relative rounded-3xl bg-white border border-slate-100/90 p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.03)] overflow-visible">
        <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-indigo-50/60 to-transparent rounded-r-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="w-full md:max-w-[65%] space-y-3">
            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
              <Link href="/dashboard" className="hover:text-[#2563EB] transition-colors">
                Dashboard
              </Link>
              <span>/</span>
              <span className="text-slate-700 font-semibold">Materi & Tugas</span>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
                  Materi & Tugas Pembelajaran
                </h1>
                <span className="px-2.5 py-0.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold text-xs">
                  {profile.rombelNama}
                </span>
              </div>
              <p className="text-slate-500 text-xs sm:text-sm leading-relaxed max-w-2xl">
                Akses modul pembelajaran, kumpulkan tugas mandiri, dan pantau rekam presensi kelas
                Anda secara terpadu.
              </p>
            </div>

            {/* Quick Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200/80 text-xs font-semibold text-slate-700">
                <BookOpen className="h-3.5 w-3.5 text-[#2563EB]" />
                <span>
                  Total Tugas: <strong>{assignments.length}</strong>
                </span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700">
                <FileText className="h-3.5 w-3.5 text-emerald-600" />
                <span>
                  Materi Pembelajaran: <strong>{materials.length}</strong>
                </span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-semibold text-[#2563EB]">
                <UserCheck className="h-3.5 w-3.5 text-[#2563EB]" />
                <span>
                  Kehadiran: <strong>{attendance.persentaseKehadiran}%</strong>
                </span>
              </div>
            </div>
          </div>

          <div className="hidden md:flex flex-col items-center justify-center shrink-0 relative pr-4">
            <div className="relative w-40 h-36 lg:w-48 lg:h-40 transition-transform duration-500 hover:scale-105">
              <Image
                src="/images/illustrations/learning-materials-3d.png"
                alt="Learning Materials 3D"
                fill
                sizes="(max-width: 1024px) 160px, 192px"
                className="object-contain drop-shadow-xl"
                priority
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="space-y-6">
        <div className="rounded-3xl bg-white/80 backdrop-blur-md border border-slate-200/80 p-1.5 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
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
        {/* TAB 1: TUGAS KELAS (ASSIGNMENTS) */}
        {/* ========================================================================= */}
        {activeTab === "tugas" && (
          <div className="space-y-4">
            {/* Toolbar Search & Status Filter */}
            <div className="p-3 sm:p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Cari tugas berdasarkan judul, mata pelajaran, atau guru..."
                  value={assignmentSearch}
                  onChange={(e) => setAssignmentSearch(e.target.value)}
                  className="pl-10 rounded-xl border-slate-200 text-xs sm:text-sm focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                  <Filter className="h-3.5 w-3.5 text-slate-400" /> Filter:
                </span>
                {(
                  [
                    ["SEMUA", "Semua Status"],
                    ["PERLU_DIKERJAKAN", "Perlu Dikerjakan"],
                    ["SUDAH_DIKUMPULKAN", "Sudah Dikumpulkan"],
                    ["TERLAMBAT", "Terlambat"],
                  ] as const
                ).map(([val, label]) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAssignmentStatusFilter(val)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      assignmentStatusFilter === val
                        ? "bg-[#2563EB] text-white border-[#2563EB] shadow-2xs"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid Tugas */}
            {filteredAssignments.length === 0 ? (
              <div className="py-12 text-center rounded-3xl bg-white border border-slate-100 shadow-2xs space-y-2">
                <BookOpen className="h-10 w-10 text-slate-300 mx-auto" />
                <h3 className="text-sm font-bold text-slate-700">
                  Tidak Ada Tugas yang Sesuai Filter
                </h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Silakan ubah kata kunci pencarian atau ganti filter status di atas.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredAssignments.map((tugas) => {
                  const isSubmitted = tugas.statusPengerjaan === "SUDAH_DIKUMPULKAN";
                  const isLate = tugas.statusPengerjaan === "TERLAMBAT";

                  return (
                    <div
                      key={tugas.id}
                      className="p-5 rounded-3xl bg-white border border-slate-100/90 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-md transition-all flex flex-col justify-between gap-4"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <span className="px-2.5 py-0.5 rounded-lg bg-blue-50 border border-blue-200/80 text-[#2563EB] text-xs font-bold truncate max-w-[200px]">
                            {tugas.mataPelajaranNama}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-lg text-xs font-bold border shrink-0 ${
                              isSubmitted
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : isLate
                                  ? "bg-rose-50 text-rose-700 border-rose-200"
                                  : "bg-blue-50 text-blue-700 border-blue-200"
                            }`}
                          >
                            {isSubmitted
                              ? "✓ Sudah Dikumpulkan"
                              : isLate
                                ? "Terlambat"
                                : "Perlu Dikerjakan"}
                          </span>
                        </div>

                        <div>
                          <h3 className="text-sm sm:text-base font-extrabold text-[#0F172A] tracking-tight line-clamp-1">
                            {tugas.judul}
                          </h3>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Guru: <strong>{tugas.guruNama}</strong>
                          </p>
                        </div>

                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                          {tugas.petunjuk}
                        </p>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-[#2563EB]" />
                            <span>Batas: {tugas.batasWaktuFormatted}</span>
                          </div>
                          {tugas.lampiranBerkas && (
                            <div className="flex items-center gap-1 text-emerald-600 font-semibold">
                              <FileCheck className="h-3.5 w-3.5" />
                              <span>Ada Lampiran Guru</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                        {tugas.pengumpulan ? (
                          <div className="text-[11px] text-slate-500 truncate">
                            Dikumpul: {tugas.pengumpulan.tanggalKumpulFormatted}
                          </div>
                        ) : (
                          <div className="text-[11px] text-amber-700 font-medium">
                            Belum mengumpulkan
                          </div>
                        )}

                        <Button
                          type="button"
                          onClick={() => handleOpenSubmit(tugas)}
                          className={`rounded-xl text-xs font-bold cursor-pointer transition-all ${
                            isSubmitted
                              ? "bg-slate-100 hover:bg-slate-200 text-slate-800"
                              : "bg-[#2563EB] hover:bg-blue-700 text-white shadow-xs"
                          }`}
                        >
                          {isSubmitted ? "Lihat / Edit Jawaban" : "Kerjakan Tugas Sekarang →"}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: MATERI PEMBELAJARAN */}
        {/* ========================================================================= */}
        {activeTab === "materi" && (
          <div className="space-y-4">
            {/* Toolbar Search & Subject Filter */}
            <div className="p-3 sm:p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Cari materi pembelajaran, BAB, atau nama guru..."
                  value={materialSearch}
                  onChange={(e) => setMaterialSearch(e.target.value)}
                  className="pl-10 rounded-xl border-slate-200 text-xs sm:text-sm focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                  <Layers className="h-3.5 w-3.5 text-slate-400" /> Mapel:
                </span>
                <button
                  type="button"
                  onClick={() => setMaterialSubjectFilter("SEMUA")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    materialSubjectFilter === "SEMUA"
                      ? "bg-[#2563EB] text-white border-[#2563EB] shadow-2xs"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  Semua Mapel
                </button>
                {materialSubjects.map((sub) => (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => setMaterialSubjectFilter(sub)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      materialSubjectFilter === sub
                        ? "bg-[#2563EB] text-white border-[#2563EB] shadow-2xs"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid Materi */}
            {filteredMaterials.length === 0 ? (
              <div className="py-12 text-center rounded-3xl bg-white border border-slate-100 shadow-2xs space-y-2">
                <FileText className="h-10 w-10 text-slate-300 mx-auto" />
                <h3 className="text-sm font-bold text-slate-700">
                  Tidak Ada Materi Pembelajaran Ditemukan
                </h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Guru mata pelajaran belum menerbitkan modul atau silakan ubah kata kunci
                  pencarian.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMaterials.map((materi) => (
                  <div
                    key={materi.id}
                    className="p-5 rounded-3xl bg-white border border-slate-100/90 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-md transition-all flex flex-col justify-between gap-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2.5 py-0.5 rounded-lg bg-blue-50 text-[#2563EB] text-[11px] font-bold truncate max-w-[170px]">
                          {materi.mataPelajaranNama}
                        </span>
                        <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                          {materi.tipeKonten}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-sm font-extrabold text-[#0F172A] tracking-tight line-clamp-2">
                          {materi.judul}
                        </h3>
                        {materi.babJudul && (
                          <p className="text-[11px] text-slate-500 font-semibold mt-1">
                            {materi.babJudul}
                          </p>
                        )}
                        <p className="text-xs text-slate-500 mt-0.5">{materi.guruNama}</p>
                      </div>

                      {materi.deskripsi && (
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                          {materi.deskripsi}
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-400">
                        {materi.tanggalPublikasiFormatted}
                      </span>

                      <Button
                        type="button"
                        onClick={() => handleOpenMaterial(materi)}
                        className="rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                      >
                        Buka Materi →
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: PRESENSI KEHADIRAN KELAS */}
        {/* ========================================================================= */}
        {activeTab === "presensi" && (
          <div className="space-y-6">
            {/* Top 4 Attendance Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="p-4 rounded-2xl bg-white border border-slate-200/80 text-center space-y-1 shadow-2xs">
                <span className="text-[11px] font-bold text-slate-500">Persentase</span>
                <p className="text-xl font-extrabold text-[#2563EB]">
                  {attendance.persentaseKehadiran}%
                </p>
                <span className="text-[10px] text-emerald-600 font-semibold">Tingkat Hadir</span>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200/80 text-center space-y-1 shadow-2xs">
                <span className="text-[11px] font-bold text-slate-500">Total Sesi</span>
                <p className="text-xl font-extrabold text-slate-900">{attendance.totalSesi}</p>
                <span className="text-[10px] text-slate-400">KBM Terjadwal</span>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-center space-y-1 shadow-2xs">
                <span className="text-[11px] font-bold text-emerald-800">Hadir</span>
                <p className="text-xl font-extrabold text-emerald-700">{attendance.hadir}</p>
                <span className="text-[10px] text-emerald-600">Sesi Diikuti</span>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 text-center space-y-1 shadow-2xs">
                <span className="text-[11px] font-bold text-blue-800">Izin</span>
                <p className="text-xl font-extrabold text-blue-700">{attendance.izin}</p>
                <span className="text-[10px] text-blue-600">Dispensasi Resmi</span>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-center space-y-1 shadow-2xs">
                <span className="text-[11px] font-bold text-amber-800">Sakit</span>
                <p className="text-xl font-extrabold text-amber-700">{attendance.sakit}</p>
                <span className="text-[10px] text-amber-600">Keterangan Medis</span>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50/80 border border-rose-200 text-center space-y-1 shadow-2xs">
                <span className="text-[11px] font-bold text-rose-800">Alpha</span>
                <p className="text-xl font-extrabold text-rose-700">{attendance.alpha}</p>
                <span className="text-[10px] text-rose-600">Tanpa Keterangan</span>
              </div>
            </div>

            {/* Riwayat Presensi Tabel */}
            <div className="rounded-3xl bg-white border border-slate-200/80 p-5 sm:p-6 shadow-2xs space-y-4">
              <h3 className="text-base font-bold text-[#0F172A]">
                Riwayat Presensi Sesi Kelas Pembelajaran
              </h3>

              {attendance.riwayatPresensi.length === 0 ? (
                <div className="py-8 text-center rounded-2xl bg-slate-50 text-xs text-slate-500">
                  Belum ada data presensi sesi kelas yang tercatat untuk siswa ini.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">Tanggal</th>
                        <th className="py-3 px-4">Mata Pelajaran</th>
                        <th className="py-3 px-4">Guru Pengampu</th>
                        <th className="py-3 px-4 text-center">Status Kehadiran</th>
                        <th className="py-3 px-4">Catatan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {attendance.riwayatPresensi.map((rec) => (
                        <tr key={rec.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3 px-4 font-semibold text-slate-800 whitespace-nowrap">
                            {rec.tanggalFormatted}
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-900">
                            {rec.mataPelajaranNama}
                          </td>
                          <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                            {rec.guruNama}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold inline-block ${
                                rec.status === "HADIR"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : rec.status === "IZIN"
                                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                                    : rec.status === "SAKIT"
                                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                                      : "bg-rose-50 text-rose-700 border border-rose-200"
                              }`}
                            >
                              {rec.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-500">{rec.catatan || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal Penyerahan Tugas */}
      <SubmitAssignmentModal
        assignment={selectedAssignment}
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onSuccess={() => {
          window.location.reload();
        }}
      />

      {/* Modal Detail Materi */}
      <MaterialDetailModal
        material={selectedMaterial}
        isOpen={isMaterialModalOpen}
        onClose={() => setIsMaterialModalOpen(false)}
      />
    </div>
  );
}

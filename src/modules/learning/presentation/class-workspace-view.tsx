"use client";

/**
 * Ruang Pintar — M11 Class Workspace View (WORKSPACE-KELAS)
 * Academic Glass UI v1.2
 */

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Layers,
  BookOpen,
  Calendar,
  Users,
  Target,
  FileText,
  ClipboardList,
  BookCheck,
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  Clock,
  PlayCircle,
  GraduationCap,
  LayoutDashboard,
  UserCheck,
  Compass,
  ChevronRight,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Link as LinkIcon,
  FileCode,
  AlignLeft,
} from "lucide-react";
import {
  TeacherClassWorkspaceDTO,
  LingkupMateriDTO,
  TujuanPembelajaranDTO,
} from "../domain/learning-types";
import { Toast, ToastType } from "@/shared/components/ui/toast";
import { CreateBABModal } from "./create-bab-modal";
import { EditBABModal } from "./edit-bab-modal";
import { CreateTPModal } from "./create-tp-modal";
import { EditTPModal } from "./edit-tp-modal";
import { CreateMateriModal } from "./create-materi-modal";
import { CreateTugasModal } from "./create-tugas-modal";
import { CreateJurnalModal } from "./create-jurnal-modal";
import {
  deleteAdministrasiAction,
  deleteLingkupMateriAction,
  deleteMateriAction,
  deleteTugasAction,
  deleteTujuanPembelajaranAction,
} from "@/app/actions/learning-actions";
import { SessionAttendanceHistoryItemDTO } from "@/modules/attendance/domain/attendance-types";
import { ClassAttendanceTabView } from "@/modules/attendance/presentation/class-attendance-tab-view";
import { SessionAttendanceModal } from "@/modules/attendance/presentation/session-attendance-modal";
import {
  DefinisiAsesmenDTO,
  ClassGradebookDTO,
} from "@/modules/assessment/domain/assessment-types";
import { ClassAssessmentTabView } from "@/modules/assessment/presentation/class-assessment-tab-view";
import { UjianCbtDTO } from "@/modules/cbt/domain/cbt-types";
import { ClassCbtTabView } from "@/modules/cbt/presentation/class-cbt-tab-view";

type WorkspaceTab =
  | "RINGKASAN"
  | "JADWAL"
  | "BAB_TP"
  | "MATERI"
  | "JURNAL"
  | "TUGAS"
  | "PRESENSI"
  | "PENILAIAN"
  | "CBT";

interface ClassWorkspaceViewProps {
  workspace: TeacherClassWorkspaceDTO;
  canManage: boolean;
  attendanceHistory?: SessionAttendanceHistoryItemDTO[];
  attendanceStats?: {
    total_sesi_terjadwal: number;
    total_sesi_selesai: number;
    total_presensi_diambil: number;
    rata_rata_kehadiran: number;
  };
  assessments?: DefinisiAsesmenDTO[];
  gradebook?: ClassGradebookDTO;
  exams?: UjianCbtDTO[];
  initialTab?: WorkspaceTab;
}

export function ClassWorkspaceView({
  workspace,
  canManage,
  attendanceHistory = [],
  attendanceStats = {
    total_sesi_terjadwal: 0,
    total_sesi_selesai: 0,
    total_presensi_diambil: 0,
    rata_rata_kehadiran: 0,
  },
  assessments = [],
  gradebook,
  exams = [],
  initialTab,
}: ClassWorkspaceViewProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<WorkspaceTab>(initialTab || "RINGKASAN");
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [isPending, startTransition] = useTransition();

  // Modals state
  const [attendanceModalSesiId, setAttendanceModalSesiId] = useState<string | null>(null);
  const [isBABModalOpen, setIsBABModalOpen] = useState(false);
  const [tpModalTarget, setTpModalTarget] = useState<{ id: string; judul: string } | null>(null);
  const [isMateriModalOpen, setIsMateriModalOpen] = useState(false);
  const [isTugasModalOpen, setIsTugasModalOpen] = useState(false);
  const [isJurnalModalOpen, setIsJurnalModalOpen] = useState(false);
  const [editBabTarget, setEditBabTarget] = useState<LingkupMateriDTO | null>(null);
  const [editTpTarget, setEditTpTarget] = useState<{
    tp: TujuanPembelajaranDTO;
    babJudul: string;
  } | null>(null);

  const {
    penugasan,
    total_siswa,
    lingkup_materi,
    materi_list,
    tugas_list,
    administrasi_list,
    jadwal_list,
  } = workspace;

  const handleDeleteBAB = (id: string) => {
    if (!confirm("Hapus BAB ini beserta seluruh Tujuan Pembelajaran di dalamnya?")) return;
    startTransition(async () => {
      const res = await deleteLingkupMateriAction(id, penugasan.id);
      if (res.success) {
        setToast({ message: res.message, type: "success" });
        router.refresh();
      } else {
        setToast({ message: res.message, type: "error" });
      }
    });
  };

  const handleDeleteTP = (id: string) => {
    if (!confirm("Hapus Tujuan Pembelajaran ini?")) return;
    startTransition(async () => {
      const res = await deleteTujuanPembelajaranAction(id, penugasan.id);
      if (res.success) {
        setToast({ message: res.message, type: "success" });
        router.refresh();
      } else {
        setToast({ message: res.message, type: "error" });
      }
    });
  };

  const handleDeleteMateri = (id: string) => {
    if (!confirm("Hapus materi pembelajaran ini?")) return;
    startTransition(async () => {
      const res = await deleteMateriAction(id, penugasan.id);
      if (res.success) {
        setToast({ message: res.message, type: "success" });
        router.refresh();
      } else {
        setToast({ message: res.message, type: "error" });
      }
    });
  };

  const handleDeleteTugas = (id: string) => {
    if (!confirm("Hapus tugas ini beserta publikasinya?")) return;
    startTransition(async () => {
      const res = await deleteTugasAction(id, penugasan.id);
      if (res.success) {
        setToast({ message: res.message, type: "success" });
        router.refresh();
      } else {
        setToast({ message: res.message, type: "error" });
      }
    });
  };

  const handleDeleteJurnal = (id: string) => {
    if (!confirm("Hapus catatan jurnal KBM pertemuan ini?")) return;
    startTransition(async () => {
      const res = await deleteAdministrasiAction(id, penugasan.id);
      if (res.success) {
        setToast({ message: res.message, type: "success" });
        router.refresh();
      } else {
        setToast({ message: res.message, type: "error" });
      }
    });
  };

  const totalTP = lingkup_materi.reduce((sum, lm) => sum + lm.tujuan_pembelajaran.length, 0);

  const tabs = [
    {
      id: "RINGKASAN" as const,
      label: "Ringkasan",
      icon: LayoutDashboard,
    },
    {
      id: "JADWAL" as const,
      label: "Jadwal",
      count: jadwal_list.length,
      icon: Calendar,
    },
    {
      id: "BAB_TP" as const,
      label: "Lingkup Materi & TP",
      count: lingkup_materi.length,
      icon: BookOpen,
    },
    {
      id: "MATERI" as const,
      label: "Materi",
      count: materi_list.length,
      icon: FileText,
    },
    {
      id: "TUGAS" as const,
      label: "Tugas",
      count: tugas_list.length,
      icon: ClipboardList,
    },
    {
      id: "JURNAL" as const,
      label: "Jurnal KBM",
      count: administrasi_list.length,
      icon: BookCheck,
    },
    {
      id: "PRESENSI" as const,
      label: "Presensi",
      count: attendanceHistory.length,
      icon: UserCheck,
    },
    {
      id: "PENILAIAN" as const,
      label: "Penilaian & Buku Nilai",
      count: assessments.length,
      icon: GraduationCap,
    },
    {
      id: "CBT" as const,
      label: "CBT (Ujian)",
      count: exams.length,
      icon: Layers,
    },
  ];

  return (
    <div className="space-y-6 pb-24">
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
          duration={4000}
        />
      )}

      {/* Header Workspace Kelas (Academic Glass Hero) */}
      <div className="rounded-3xl bg-white border border-slate-200/80 p-4 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
          <div className="space-y-1 sm:space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold">
              <Link href="/kelas-saya" className="hover:text-[#2563EB] transition-colors">
                Kelas Saya
              </Link>
              <span>/</span>
              <span className="text-slate-700 font-bold">{penugasan.rombel_nama}</span>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
              <h1 className="text-lg sm:text-2xl font-black text-[#0F172A] tracking-tight">
                {penugasan.mata_pelajaran_nama}
              </h1>
              <span className="px-2.5 py-0.5 rounded-lg bg-blue-50 border border-blue-200/80 text-[#2563EB] font-bold text-xs">
                {penugasan.mata_pelajaran_kode}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-500 flex items-center flex-wrap gap-1.5 sm:gap-2 pt-0.5">
              <span>
                Pengampu: <strong>{penugasan.guru_nama}</strong>
              </span>
              <span>•</span>
              <span>
                Rombel: <strong>{penugasan.rombel_nama}</strong>
              </span>
              {penugasan.tingkat_nama && <span>({penugasan.tingkat_nama})</span>}
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline">
                Tahun Ajaran: <strong>{penugasan.tahun_ajaran_nama}</strong>
              </span>
              {penugasan.semester_nama && (
                <span className="hidden sm:inline">- {penugasan.semester_nama}</span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap self-start md:self-center">
            <span className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold">
              {penugasan.jumlah_jam_minggu} JP / Minggu
            </span>
            <span className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs font-bold flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              <span>{total_siswa} Siswa</span>
            </span>
          </div>
        </div>
      </div>

      {/* Responsive Tab Bar matching UI Kit (Academic Glass UI v1.2) */}
      <div className="rounded-2xl sm:rounded-3xl bg-white/80 backdrop-blur-md border border-slate-200/80 p-1.5 sm:p-2 shadow-xs">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:flex md:flex-wrap md:items-center gap-1 sm:gap-1.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                data-tab={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`w-full md:w-auto flex items-center justify-center md:justify-start gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl sm:rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "bg-[#2563EB] text-white shadow-md shadow-blue-500/20"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                }`}
              >
                <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                <span>
                  {tab.id === "BAB_TP" ? (
                    <>
                      <span className="hidden xl:inline">Lingkup </span>
                      <span>Materi & TP</span>
                    </>
                  ) : tab.id === "PENILAIAN" ? (
                    <span>Penilaian</span>
                  ) : tab.id === "CBT" ? (
                    <span>CBT</span>
                  ) : (
                    tab.label
                  )}
                </span>
                {tab.count !== undefined && (
                  <span
                    className={`text-[10px] sm:text-[10.5px] px-1.5 py-0.5 rounded-full font-bold shrink-0 ${
                      isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
                {tab.id === "PENILAIAN" && (
                  <span
                    className={`text-[9.5px] px-1.5 py-0.5 rounded-full font-bold shrink-0 ${
                      isActive ? "bg-white/20 text-white" : "bg-blue-50 text-blue-700"
                    }`}
                  >
                    P13
                  </span>
                )}
                {tab.id === "CBT" && (
                  <span
                    className={`text-[9.5px] px-1.5 py-0.5 rounded-full font-bold shrink-0 ${
                      isActive ? "bg-white/20 text-white" : "bg-indigo-50 text-indigo-700"
                    }`}
                  >
                    P14
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================== */}
      {/* TAB 1: RINGKASAN KELAS                     */}
      {/* ========================================== */}
      {activeTab === "RINGKASAN" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3.5">
            <div className="p-3 sm:p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-blue-300 hover:-translate-y-1 transition-all duration-300 group cursor-default">
              <span className="text-xs font-semibold text-slate-400 block group-hover:text-slate-600 transition-colors truncate">
                Total BAB
              </span>
              <span className="text-xl sm:text-2xl font-black text-slate-800 mt-1 block group-hover:text-[#2563EB] transition-colors">
                {lingkup_materi.length}
              </span>
              <span className="text-[11px] text-slate-500 block truncate">{totalTP} TP</span>
            </div>

            <div className="p-3 sm:p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-blue-300 hover:-translate-y-1 transition-all duration-300 group cursor-default">
              <span className="text-xs font-semibold text-slate-400 block group-hover:text-slate-600 transition-colors truncate">
                Materi Terbit
              </span>
              <span className="text-xl sm:text-2xl font-black text-[#2563EB] mt-1 block group-hover:text-blue-700 transition-colors">
                {materi_list.length}
              </span>
              <span className="text-[11px] text-slate-500 block truncate">Bahan ajar kelas</span>
            </div>

            <div className="p-3 sm:p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-purple-300 hover:-translate-y-1 transition-all duration-300 group cursor-default">
              <span className="text-xs font-semibold text-slate-400 block group-hover:text-slate-600 transition-colors truncate">
                Tugas Aktif
              </span>
              <span className="text-xl sm:text-2xl font-black text-purple-600 mt-1 block group-hover:text-purple-700 transition-colors">
                {tugas_list.length}
              </span>
              <span className="text-[11px] text-slate-500 block truncate">Penugasan siswa</span>
            </div>

            <div className="p-3 sm:p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-emerald-300 hover:-translate-y-1 transition-all duration-300 group cursor-default">
              <span className="text-xs font-semibold text-slate-400 block group-hover:text-slate-600 transition-colors truncate">
                Jurnal KBM
              </span>
              <span className="text-xl sm:text-2xl font-black text-emerald-600 mt-1 block group-hover:text-emerald-700 transition-colors">
                {administrasi_list.length}
              </span>
              <span className="text-[11px] text-slate-500 block truncate">Pertemuan tercatat</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Kartu Jadwal KBM Terjadwal */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-2xs space-y-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[#2563EB]" />
                  <h3 className="text-sm font-bold text-slate-800">Alokasi Jadwal Kelas</h3>
                </div>
                <span className="text-xs font-bold text-slate-500">
                  {jadwal_list.length} Slot Waktu
                </span>
              </div>

              {jadwal_list.length === 0 ? (
                <p className="text-xs text-slate-400 italic">
                  Belum ada alokasi jadwal resmi terpublikasi untuk rombel dan mapel ini.
                </p>
              ) : (
                <div className="space-y-2">
                  {jadwal_list.map((j, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-blue-200 hover:bg-blue-50/40 transition-all flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-lg bg-blue-100 text-[#2563EB] font-bold text-xs">
                          {j.hari}
                        </span>
                        <span className="text-xs font-semibold text-slate-700">
                          {j.jam_mulai} - {j.jam_selesai}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 font-medium">
                        {j.slot_nama} {j.ruangan ? `• ${j.ruangan}` : ""}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Aksi Cepat Guru */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-2xs space-y-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Compass className="h-4 w-4 text-[#2563EB]" />
                <h3 className="text-sm font-bold text-slate-800">Aksi Cepat Pembelajaran</h3>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsBABModalOpen(true)}
                  className="p-3.5 rounded-2xl bg-slate-50 hover:bg-blue-50/80 border border-slate-200/80 hover:border-blue-300 hover:-translate-y-1 hover:shadow-sm text-left transition-all duration-200 cursor-pointer group"
                >
                  <BookOpen className="h-5 w-5 text-[#2563EB] mb-2 group-hover:scale-110 transition-transform duration-200" />
                  <div className="text-xs font-bold text-slate-800 group-hover:text-[#2563EB] transition-colors">
                    Tambah BAB
                  </div>
                  <div className="text-[11px] text-slate-500">Susun unit materi</div>
                </button>

                <button
                  type="button"
                  onClick={() => setIsMateriModalOpen(true)}
                  className="p-3.5 rounded-2xl bg-slate-50 hover:bg-blue-50/80 border border-slate-200/80 hover:border-blue-300 hover:-translate-y-1 hover:shadow-sm text-left transition-all duration-200 cursor-pointer group"
                >
                  <FileText className="h-5 w-5 text-[#2563EB] mb-2 group-hover:scale-110 transition-transform duration-200" />
                  <div className="text-xs font-bold text-slate-800 group-hover:text-[#2563EB] transition-colors">
                    Bagikan Materi
                  </div>
                  <div className="text-[11px] text-slate-500">Upload modul/teks</div>
                </button>

                <button
                  type="button"
                  onClick={() => setIsTugasModalOpen(true)}
                  className="p-3.5 rounded-2xl bg-slate-50 hover:bg-purple-50/80 border border-slate-200/80 hover:border-purple-300 hover:-translate-y-1 hover:shadow-sm text-left transition-all duration-200 cursor-pointer group"
                >
                  <ClipboardList className="h-5 w-5 text-purple-600 mb-2 group-hover:scale-110 transition-transform duration-200" />
                  <div className="text-xs font-bold text-slate-800 group-hover:text-purple-700 transition-colors">
                    Buat Tugas
                  </div>
                  <div className="text-[11px] text-slate-500">Tenggat batas waktu</div>
                </button>

                <button
                  type="button"
                  onClick={() => setIsJurnalModalOpen(true)}
                  className="p-3.5 rounded-2xl bg-slate-50 hover:bg-emerald-50/80 border border-slate-200/80 hover:border-emerald-300 hover:-translate-y-1 hover:shadow-sm text-left transition-all duration-200 cursor-pointer group"
                >
                  <BookCheck className="h-5 w-5 text-emerald-600 mb-2 group-hover:scale-110 transition-transform duration-200" />
                  <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">
                    Isi Jurnal KBM
                  </div>
                  <div className="text-[11px] text-slate-500">Catat agenda pertemuan</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* TAB 2: JADWAL KBM                         */}
      {/* ========================================== */}
      {activeTab === "JADWAL" && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Jadwal Pembelajaran Kelas</h3>
              <p className="text-xs text-slate-500">
                Alokasi resmi berdasarkan versi jadwal kurikulum yang aktif
              </p>
            </div>
          </div>

          {jadwal_list.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">Belum ada alokasi jadwal.</div>
          ) : (
            <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
              {jadwal_list.map((j, idx) => (
                <div
                  key={idx}
                  className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-xl bg-blue-50 text-[#2563EB] font-bold text-xs">
                      {j.hari}
                    </span>
                    <div>
                      <div className="text-sm font-bold text-slate-800">
                        {j.jam_mulai} - {j.jam_selesai}
                      </div>
                      <div className="text-xs text-slate-400">{j.slot_nama}</div>
                    </div>
                  </div>
                  {j.ruangan && (
                    <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                      {j.ruangan}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================== */}
      {/* TAB 3: LINGKUP MATERI & TUJUAN PEMBELAJARAN */}
      {/* ========================================== */}
      {activeTab === "BAB_TP" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Lingkup Materi (BAB) & Tujuan Pembelajaran
              </h3>
              <p className="text-xs text-slate-500">
                Struktur capaian kurikulum terorganisir per unit BAB
              </p>
            </div>
            {canManage && (
              <button
                type="button"
                onClick={() => setIsBABModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Tambah BAB</span>
              </button>
            )}
          </div>

          {lingkup_materi.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white border border-slate-200/80">
              <BookOpen className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-slate-700">Belum ada Lingkup Materi (BAB)</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Mulai dengan menambahkan unit materi (misal: BAB 1, BAB 2) untuk mengorganisasikan
                Tujuan Pembelajaran dan bahan ajar.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {lingkup_materi.map((bab) => (
                <div
                  key={bab.id}
                  className="rounded-3xl bg-white border border-slate-200/80 shadow-2xs overflow-hidden"
                >
                  {/* Header BAB */}
                  <div className="p-4 sm:p-5 bg-slate-50/60 border-b border-slate-100 flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        {bab.kode && (
                          <span className="px-2 py-0.5 rounded-lg bg-blue-100 text-[#2563EB] font-bold text-xs">
                            {bab.kode}
                          </span>
                        )}
                        <h4 className="text-base font-bold text-slate-900">{bab.judul}</h4>
                      </div>
                      {bab.deskripsi && (
                        <p className="text-xs text-slate-500 mt-1">{bab.deskripsi}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {canManage && (
                        <>
                          <button
                            type="button"
                            onClick={() => setTpModalTarget({ id: bab.id, judul: bab.judul })}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs transition-colors cursor-pointer"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            <span>Tambah TP</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditBabTarget(bab)}
                            title="Edit BAB"
                            className="p-1.5 rounded-xl text-slate-500 hover:text-[#2563EB] hover:bg-blue-50 transition-colors cursor-pointer"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteBAB(bab.id)}
                            title="Hapus BAB"
                            className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* List Tujuan Pembelajaran (TP) */}
                  <div className="p-4 sm:p-5">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                      Tujuan Pembelajaran ({bab.tujuan_pembelajaran.length})
                    </div>

                    {bab.tujuan_pembelajaran.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">
                        Belum ada Tujuan Pembelajaran yang ditambahkan pada BAB ini.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {bab.tujuan_pembelajaran.map((tp) => (
                          <div
                            key={tp.id}
                            className="p-3 rounded-2xl bg-white border border-slate-100 hover:border-slate-200 flex items-start justify-between gap-3 transition-colors"
                          >
                            <div className="flex items-start gap-2.5">
                              <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-extrabold text-[11px] shrink-0 mt-0.5">
                                {tp.kode || "TP"}
                              </span>
                              <p className="text-xs font-medium text-slate-800 leading-relaxed">
                                {tp.deskripsi}
                              </p>
                            </div>

                            {canManage && (
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => setEditTpTarget({ tp, babJudul: bab.judul })}
                                  title="Edit TP"
                                  className="p-1 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-colors cursor-pointer"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteTP(tp.id)}
                                  title="Hapus TP"
                                  className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================== */}
      {/* TAB 4: MATERI PEMBELAJARAN                 */}
      {/* ========================================== */}
      {activeTab === "MATERI" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Materi Pembelajaran</h3>
              <p className="text-xs text-slate-500">
                Bahan ajar teks, modul dokumen, atau tautan video/web
              </p>
            </div>
            {canManage && (
              <button
                type="button"
                onClick={() => setIsMateriModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Terbitkan Materi</span>
              </button>
            )}
          </div>

          {materi_list.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white border border-slate-200/80">
              <FileText className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-slate-700">Belum ada Materi Pembelajaran</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Bagikan materi atau modul bacaan agar siswa dapat mengakses bahan ajar secara
                mandiri.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {materi_list.map((m) => (
                <div
                  key={m.id}
                  className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-2xs flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg bg-blue-50 text-[#2563EB] font-bold text-[11px]">
                        {m.tipe_konten}
                      </span>
                      {m.lingkup_materi_judul && (
                        <span className="text-[11px] font-semibold text-slate-400 truncate max-w-[150px]">
                          {m.lingkup_materi_judul}
                        </span>
                      )}
                    </div>

                    <h4 className="text-base font-bold text-slate-900 leading-snug">{m.judul}</h4>
                    {m.deskripsi && (
                      <p className="text-xs text-slate-500 line-clamp-2">{m.deskripsi}</p>
                    )}

                    {m.tautan_url && (
                      <a
                        href={m.tautan_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2563EB] hover:underline"
                      >
                        <LinkIcon className="h-3.5 w-3.5" />
                        <span>Buka Tautan Materi</span>
                      </a>
                    )}

                    {m.berkas_id && (
                      <a
                        href={`/api/berkas/${m.berkas_id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-[#2563EB] hover:bg-blue-100 text-xs font-bold transition-colors w-fit"
                      >
                        <FileCode className="h-3.5 w-3.5" />
                        <span>Buka / Unduh Dokumen</span>
                      </a>
                    )}

                    {m.konten_teks && (
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 max-h-28 overflow-y-auto">
                        {m.konten_teks}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      {new Date(m.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    {canManage && (
                      <button
                        type="button"
                        onClick={() => handleDeleteMateri(m.id)}
                        title="Hapus Materi"
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================== */}
      {/* TAB 5: JURNAL KBM (ADMINISTRASI GURU)      */}
      {/* ========================================== */}
      {activeTab === "JURNAL" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Jurnal Administrasi Pembelajaran KBM
              </h3>
              <p className="text-xs text-slate-500">
                Rekam jejak materi, aktivitas, dan evaluasi setiap pertemuan kelas
              </p>
            </div>
            {canManage && (
              <button
                type="button"
                onClick={() => setIsJurnalModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Isi Jurnal KBM</span>
              </button>
            )}
          </div>

          {administrasi_list.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white border border-slate-200/80">
              <BookCheck className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-slate-700">Belum ada Catatan Jurnal KBM</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Setiap kali Anda selesai mengajar, catat materi yang dibahas dan evaluasi kelas di
                sini sebagai rekam jejak resmi administrasi sekolah.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {administrasi_list.map((adm) => (
                <div
                  key={adm.id}
                  className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-2xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                      <span className="px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-700 font-extrabold text-xs">
                        Pertemuan {adm.pertemuan_ke}
                      </span>
                      <span className="text-xs font-semibold text-slate-400">
                        {new Date(adm.tanggal).toLocaleDateString("id-ID", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold">
                        {adm.status_realisasi}
                      </span>
                    </div>

                    {canManage && (
                      <button
                        type="button"
                        onClick={() => handleDeleteJurnal(adm.id)}
                        title="Hapus Jurnal"
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                      Materi Pokok
                    </div>
                    <div className="text-sm font-bold text-slate-900">{adm.materi_disampaikan}</div>
                  </div>

                  {adm.tp_terkait && adm.tp_terkait.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                        TP Terkait
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {adm.tp_terkait.map((t) => (
                          <span
                            key={t.id}
                            className="px-2 py-1 rounded-lg bg-purple-50 border border-purple-100 text-purple-700 text-xs font-semibold"
                          >
                            {t.kode ? `${t.kode}: ` : ""}
                            {t.deskripsi}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {adm.kegiatan_pembelajaran && (
                    <div className="space-y-1">
                      <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                        Kegiatan KBM
                      </div>
                      <div className="text-xs text-slate-600 leading-relaxed">
                        {adm.kegiatan_pembelajaran}
                      </div>
                    </div>
                  )}

                  {adm.catatan_refleksi && (
                    <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/70 text-xs text-amber-900 space-y-1">
                      <strong className="block text-amber-800">Catatan Refleksi & Kendala:</strong>
                      <p>{adm.catatan_refleksi}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================== */}
      {/* TAB 6: TUGAS PEMBELAJARAN                  */}
      {/* ========================================== */}
      {activeTab === "TUGAS" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Tugas Pembelajaran</h3>
              <p className="text-xs text-slate-500">
                Penugasan mandiri, proyek praktikum, dan pengumpulan jawaban
              </p>
            </div>
            {canManage && (
              <button
                type="button"
                onClick={() => setIsTugasModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Terbitkan Tugas</span>
              </button>
            )}
          </div>

          {tugas_list.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white border border-slate-200/80">
              <ClipboardList className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-slate-700">Belum ada Tugas</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Berikan tugas latihan atau asesmen formatif bagi siswa kelas ini.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tugas_list.map((t) => (
                <div
                  key={t.id}
                  className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-2xs flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg bg-purple-50 text-purple-700 font-bold text-[11px]">
                        {t.tipe_penyerahan}
                      </span>
                      {t.lingkup_materi_judul && (
                        <span className="text-[11px] font-semibold text-slate-400 truncate max-w-[150px]">
                          {t.lingkup_materi_judul}
                        </span>
                      )}
                    </div>

                    <h4 className="text-base font-bold text-slate-900 leading-snug">{t.judul}</h4>
                    <p className="text-xs text-slate-600 line-clamp-3">{t.petunjuk}</p>

                    {t.publikasi_aktif?.batas_waktu && (
                      <div className="flex items-center gap-1.5 text-xs text-rose-600 font-semibold pt-1">
                        <Clock className="h-3.5 w-3.5" />
                        <span>
                          Tenggat:{" "}
                          {new Date(t.publikasi_aktif.batas_waktu).toLocaleString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">
                      {t.publikasi_aktif?.submission_count || 0} Pengumpulan
                    </span>

                    {canManage && (
                      <button
                        type="button"
                        onClick={() => handleDeleteTugas(t.id)}
                        title="Hapus Tugas"
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================== */}
      {/* TAB 7: PRESENSI KELAS (M12)                */}
      {/* ========================================== */}
      {activeTab === "PRESENSI" && (
        <ClassAttendanceTabView
          canManage={canManage}
          history={attendanceHistory}
          stats={attendanceStats}
          onOpenAttendance={(sesiId) => setAttendanceModalSesiId(sesiId)}
          onOpenNewSession={() => router.push("/sesi-pembelajaran")}
        />
      )}

      {/* ========================================== */}
      {/* TAB 8: PENILAIAN & BUKU NILAI (M13)        */}
      {/* ========================================== */}
      {activeTab === "PENILAIAN" && (
        <ClassAssessmentTabView
          penugasanId={penugasan.id}
          canManage={canManage}
          assessments={assessments}
          gradebook={
            gradebook || {
              penugasan_id: penugasan.id,
              sekolah_id: penugasan.sekolah_id,
              rombel_id: penugasan.rombel_id,
              rombel_nama: penugasan.rombel_nama,
              mata_pelajaran_id: penugasan.mata_pelajaran_id,
              mata_pelajaran_nama: penugasan.mata_pelajaran_nama,
              kkm_default: 75,
              columns: [],
              rows: [],
              statistics: {
                total_siswa: 0,
                total_asesmen: 0,
                total_formatif: 0,
                total_sumatif: 0,
                rata_rata_kelas: null,
                persentase_tuntas_kktp: null,
              },
            }
          }
          lingkupMateriList={lingkup_materi}
          onRefresh={() => router.refresh()}
          onShowToast={(message, type) => setToast({ message, type })}
        />
      )}

      {/* ========================================== */}
      {/* TAB 9: CBT UJIAN (PHASE 14)                */}
      {/* ========================================== */}
      {activeTab === "CBT" && (
        <ClassCbtTabView
          penugasanId={penugasan.id}
          sekolahId={penugasan.sekolah_id}
          mapelId={penugasan.mata_pelajaran_id}
          canManage={canManage}
          exams={exams}
          onRefresh={() => router.refresh()}
          onShowToast={(message, type) => setToast({ message, type })}
        />
      )}

      {/* Modals */}
      <CreateBABModal
        penugasanId={penugasan.id}
        isOpen={isBABModalOpen}
        onClose={() => setIsBABModalOpen(false)}
        nextUrutan={lingkup_materi.length + 1}
        onSuccess={(msg) => {
          setToast({ message: msg, type: "success" });
          router.refresh();
        }}
        onError={(msg) => setToast({ message: msg, type: "error" })}
      />

      {tpModalTarget && (
        <CreateTPModal
          penugasanId={penugasan.id}
          lingkupMateriId={tpModalTarget.id}
          babJudul={tpModalTarget.judul}
          isOpen={true}
          onClose={() => setTpModalTarget(null)}
          nextUrutan={
            (lingkup_materi.find((lm) => lm.id === tpModalTarget.id)?.tujuan_pembelajaran.length ||
              0) + 1
          }
          onSuccess={(msg) => {
            setToast({ message: msg, type: "success" });
            router.refresh();
          }}
          onError={(msg) => setToast({ message: msg, type: "error" })}
        />
      )}

      <EditBABModal
        penugasanId={penugasan.id}
        bab={editBabTarget}
        isOpen={!!editBabTarget}
        onClose={() => setEditBabTarget(null)}
        onSuccess={(msg) => {
          setToast({ message: msg, type: "success" });
          router.refresh();
        }}
        onError={(msg) => setToast({ message: msg, type: "error" })}
      />

      <EditTPModal
        penugasanId={penugasan.id}
        babJudul={editTpTarget?.babJudul || ""}
        tp={editTpTarget?.tp || null}
        isOpen={!!editTpTarget}
        onClose={() => setEditTpTarget(null)}
        onSuccess={(msg) => {
          setToast({ message: msg, type: "success" });
          router.refresh();
        }}
        onError={(msg) => setToast({ message: msg, type: "error" })}
      />

      <CreateMateriModal
        penugasanId={penugasan.id}
        guruId={penugasan.guru_id}
        mapelId={penugasan.mata_pelajaran_id}
        lingkupMateriList={lingkup_materi}
        isOpen={isMateriModalOpen}
        onClose={() => setIsMateriModalOpen(false)}
        onSuccess={(msg) => {
          setToast({ message: msg, type: "success" });
          router.refresh();
        }}
        onError={(msg) => setToast({ message: msg, type: "error" })}
      />

      <CreateTugasModal
        penugasanId={penugasan.id}
        guruId={penugasan.guru_id}
        mapelId={penugasan.mata_pelajaran_id}
        lingkupMateriList={lingkup_materi}
        isOpen={isTugasModalOpen}
        onClose={() => setIsTugasModalOpen(false)}
        onSuccess={(msg) => {
          setToast({ message: msg, type: "success" });
          router.refresh();
        }}
        onError={(msg) => setToast({ message: msg, type: "error" })}
      />

      <CreateJurnalModal
        penugasanId={penugasan.id}
        guruId={penugasan.guru_id}
        lingkupMateriList={lingkup_materi}
        isOpen={isJurnalModalOpen}
        onClose={() => setIsJurnalModalOpen(false)}
        nextPertemuan={administrasi_list.length + 1}
        onSuccess={(msg) => {
          setToast({ message: msg, type: "success" });
          router.refresh();
        }}
        onError={(msg) => setToast({ message: msg, type: "error" })}
      />

      <SessionAttendanceModal
        sesiId={attendanceModalSesiId}
        isOpen={Boolean(attendanceModalSesiId)}
        onClose={() => setAttendanceModalSesiId(null)}
        onSuccess={(msg) => {
          setToast({ message: msg, type: "success" });
          router.refresh();
        }}
        onError={(msg) => setToast({ message: msg, type: "error" })}
      />
    </div>
  );
}

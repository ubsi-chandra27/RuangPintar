"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  Plus,
  Search,
  School,
  BookOpen,
  Layers,
  ChevronRight,
  Filter,
  CheckCircle2,
  XCircle,
  Mail,
  Phone,
  User,
  X,
  AlertCircle,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { createTeacherAction } from "@/app/actions/teacher-actions";

export interface GlobalTeacherItem {
  id: string;
  sekolah_id: string;
  nama_lengkap: string;
  gelar_depan: string | null;
  gelar_belakang: string | null;
  nip: string | null;
  nuptk: string | null;
  jenis_kelamin: string;
  email: string | null;
  telepon: string | null;
  status_kepegawaian: string;
  status_aktif: boolean;
  foto_url: string | null;
  created_at: Date | string;
  sekolah: {
    id: string;
    nama: string;
    jenjang: string;
  };
  pengguna: {
    username: string;
    email: string | null;
    status_akun: string;
  } | null;
  penugasan_mengajar: Array<{
    mata_pelajaran: {
      nama: string;
      kode: string;
    };
    rombel: {
      nama: string;
    };
  }>;
}

export interface SchoolOption {
  id: string;
  nama: string;
  jenjang: string;
}

interface SuperAdminTeacherDirectoryViewProps {
  teachers: GlobalTeacherItem[];
  schools: SchoolOption[];
  totalTeachingAssignments: number;
}

export function SuperAdminTeacherDirectoryView({
  teachers,
  schools,
  totalTeachingAssignments,
}: SuperAdminTeacherDirectoryViewProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedSchoolId, setSelectedSchoolId] = React.useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = React.useState<string>("ALL");
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);

  // Metrics
  const totalTeachers = teachers.length;
  const activeTeachers = teachers.filter((t) => t.status_aktif).length;
  const totalSchoolsWithTeachers = new Set(teachers.map((t) => t.sekolah_id)).size;

  // Filtered list
  const filteredTeachers = React.useMemo(() => {
    return teachers.filter((teacher) => {
      const fullName = [teacher.gelar_depan, teacher.nama_lengkap, teacher.gelar_belakang]
        .filter(Boolean)
        .join(" ");

      const matchesSearch =
        fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (teacher.nip && teacher.nip.includes(searchQuery)) ||
        (teacher.nuptk && teacher.nuptk.includes(searchQuery)) ||
        teacher.sekolah.nama.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSchool =
        selectedSchoolId === "ALL" || teacher.sekolah_id === selectedSchoolId;

      const matchesStatus =
        selectedStatus === "ALL" ||
        (selectedStatus === "AKTIF" && teacher.status_aktif) ||
        (selectedStatus === "NONAKTIF" && !teacher.status_aktif);

      return matchesSearch && matchesSchool && matchesStatus;
    });
  }, [teachers, searchQuery, selectedSchoolId, selectedStatus]);

  return (
    <div className="space-y-6 pb-12">
      {/* Hero Banner with Academic Glass UI */}
      <div className="relative rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-full bg-gradient-to-l from-blue-500/10 via-indigo-500/5 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            {/* Breadcrumb */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400 font-medium">
              <Link href="/dashboard" className="hover:text-[#2563EB] transition-colors">
                Dashboard
              </Link>
              <span>/</span>
              <span className="text-slate-700 dark:text-slate-300 font-semibold">
                Kontrol Platform SaaS
              </span>
              <span>/</span>
              <span className="text-blue-600 dark:text-blue-400 font-semibold">
                Guru & Penugasan
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Direktori Guru & Penugasan Pendidik SaaS
              </h1>
              <span className="px-2.5 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-bold text-xs whitespace-nowrap">
                Pendidik SaaS Control
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Pusat orkestrasi seluruh dewan guru, mata pelajaran yang diampu, dan penugasan mengajar di seluruh institusi sekolah mitra ekosistem Ruang Pintar.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer whitespace-nowrap"
          >
            <Plus className="size-4" />
            <span>Daftarkan Guru Baru</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Guru */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Total Pendidik Terdaftar
            </span>
            <div className="size-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-400 flex items-center justify-center">
              <GraduationCap className="size-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {totalTeachers}
            </span>
            <span className="text-xs text-slate-400 font-medium">Guru</span>
          </div>
        </div>

        {/* Guru Aktif */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Pendidik Aktif Mengajar
            </span>
            <div className="size-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="size-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {activeTeachers}
            </span>
            <span className="text-xs text-slate-400 font-medium">Aktif</span>
          </div>
        </div>

        {/* Penugasan Mengajar */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Penugasan KBM Aktif
            </span>
            <div className="size-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <BookOpen className="size-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {totalTeachingAssignments}
            </span>
            <span className="text-xs text-slate-400 font-medium">Alokasi Mapel</span>
          </div>
        </div>

        {/* Sekolah Mitra */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Institusi Sekolah Terhubung
            </span>
            <div className="size-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <School className="size-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {schools.length}
            </span>
            <span className="text-xs text-slate-400 font-medium">Sekolah Mitra</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari berdasarkan nama guru, NIP, NUPTK, atau nama sekolah..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
            />
          </div>

          {/* School Dropdown Filter */}
          <div className="flex items-center gap-2">
            <select
              value={selectedSchoolId}
              onChange={(e) => setSelectedSchoolId(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
            >
              <option value="ALL">Semua Sekolah Mitra</option>
              {schools.map((school) => (
                <option key={school.id} value={school.id}>
                  {school.nama} ({school.jenjang})
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <div className="flex items-center gap-1">
              {[
                { label: "Semua", value: "ALL" },
                { label: "Aktif", value: "AKTIF" },
                { label: "Nonaktif", value: "NONAKTIF" },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setSelectedStatus(tab.value)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    selectedStatus === tab.value
                      ? "bg-[#2563EB] text-white shadow-xs"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      {filteredTeachers.length === 0 ? (
        /* Empty State */
        <div className="rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 p-12 text-center shadow-xs">
          <div className="size-16 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-400 flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="size-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
            {teachers.length === 0
              ? "Belum Ada Data Guru Terdaftar"
              : "Tidak Ada Guru yang Sesuai Filter"}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
            {teachers.length === 0
              ? schools.length === 0
                ? "Platform SaaS Ruang Pintar belum memiliki sekolah mitra. Daftarkan sekolah terlebih dahulu sebelum menambahkan dewan guru."
                : "Belum ada akun guru yang tercatat di platform SaaS Ruang Pintar. Anda dapat mulai menambahkan akun guru ke salah satu sekolah mitra aktif."
              : "Coba sesuaikan kata kunci pencarian atau reset filter sekolah dan status."}
          </p>

          {teachers.length === 0 && (
            schools.length === 0 ? (
              <Link
                href="/sekolah"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/25 transition-all active:scale-95"
              >
                <School className="size-4" />
                <span>Daftarkan Sekolah Mitra Terlebih Dahulu</span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/25 transition-all active:scale-95 cursor-pointer"
              >
                <Plus className="size-4" />
                <span>Daftarkan Guru Pertama</span>
              </button>
            )
          )}
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden sm:block rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-5">Nama Guru & Akun</th>
                  <th className="py-3.5 px-4">NIP / NUPTK</th>
                  <th className="py-3.5 px-4">Asal Sekolah Mitra</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Penugasan KBM</th>
                  <th className="py-3.5 px-5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs sm:text-sm">
                {filteredTeachers.map((teacher) => {
                  const displayName = [teacher.gelar_depan, teacher.nama_lengkap, teacher.gelar_belakang]
                    .filter(Boolean)
                    .join(" ");

                  return (
                    <tr
                      key={teacher.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      {/* Nama & Akun */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="size-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
                            {teacher.nama_lengkap.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">
                              {displayName}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5 text-slate-400 text-xs">
                              {teacher.pengguna ? (
                                <span className="font-mono text-[11px]">@{teacher.pengguna.username}</span>
                              ) : (
                                <span className="italic text-[11px]">Belum aktivasi login</span>
                              )}
                              <span>•</span>
                              <span>{teacher.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* NIP / NUPTK */}
                      <td className="py-4 px-4">
                        <div className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200">
                          {teacher.nip || teacher.nuptk || (
                            <span className="text-slate-400 font-sans italic">Tanpa NIP</span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          Status: {teacher.status_kepegawaian}
                        </div>
                      </td>

                      {/* Asal Sekolah */}
                      <td className="py-4 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <School className="size-3.5 text-[#2563EB] shrink-0" />
                          <span className="truncate max-w-[180px]">{teacher.sekolah.nama}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Jenjang {teacher.sekolah.jenjang}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        {teacher.status_aktif ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
                            <CheckCircle2 className="size-3" /> Aktif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-medium">
                            <XCircle className="size-3" /> Nonaktif
                          </span>
                        )}
                      </td>

                      {/* Penugasan Mengajar */}
                      <td className="py-4 px-4">
                        {teacher.penugasan_mengajar.length > 0 ? (
                          <div className="space-y-1">
                            {teacher.penugasan_mengajar.slice(0, 2).map((pm, idx) => (
                              <div
                                key={idx}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-[10px] font-semibold mr-1"
                              >
                                <span>{pm.mata_pelajaran.kode}</span>
                                <span className="opacity-60">•</span>
                                <span>{pm.rombel.nama}</span>
                              </div>
                            ))}
                            {teacher.penugasan_mengajar.length > 2 && (
                              <span className="text-[10px] text-slate-400">
                                +{teacher.penugasan_mengajar.length - 2} lainnya
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-xs">Belum ada penugasan</span>
                        )}
                      </td>

                      {/* Aksi */}
                      <td className="py-4 px-5 text-right">
                        <Link
                          href={`/guru-pengajaran?sekolahId=${teacher.sekolah_id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/50 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 text-xs font-semibold transition-all"
                        >
                          <span>Kelola di Sekolah</span>
                          <ChevronRight className="size-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View (sm:hidden) */}
          <div className="sm:hidden space-y-3">
            {filteredTeachers.map((teacher) => {
              const displayName = [teacher.gelar_depan, teacher.nama_lengkap, teacher.gelar_belakang]
                .filter(Boolean)
                .join(" ");

              return (
                <div
                  key={teacher.id}
                  className="p-4 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      <div className="size-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        {teacher.nama_lengkap.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                          {displayName}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-400">
                          <span>{teacher.sekolah.nama}</span>
                          <span>•</span>
                          <span className="font-mono text-[10px]">{teacher.nip || "Tanpa NIP"}</span>
                        </div>
                      </div>
                    </div>

                    <span className="shrink-0">
                      {teacher.status_aktif ? (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                          Aktif
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-[10px] font-bold">
                          Nonaktif
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 text-[10px]">
                      {teacher.penugasan_mengajar.length} Penugasan KBM
                    </span>
                    <Link
                      href={`/guru-pengajaran?sekolahId=${teacher.sekolah_id}`}
                      className="inline-flex items-center gap-1 text-[#2563EB] dark:text-blue-400 font-bold hover:underline"
                    >
                      <span>Kelola di Sekolah</span>
                      <ChevronRight className="size-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Modal Dialog Daftarkan Guru Baru */}
      <CreateTeacherTenantModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        schools={schools}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}

// Sub-component Modal Pendaftaran Guru Baru
interface CreateTeacherTenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  schools: SchoolOption[];
  onSuccess: () => void;
}

function CreateTeacherTenantModal({
  isOpen,
  onClose,
  schools,
  onSuccess,
}: CreateTeacherTenantModalProps) {
  const [sekolahId, setSekolahId] = React.useState(schools[0]?.id || "");
  const [namaLengkap, setNamaLengkap] = React.useState("");
  const [gelarDepan, setGelarDepan] = React.useState("");
  const [gelarBelakang, setGelarBelakang] = React.useState("");
  const [nip, setNip] = React.useState("");
  const [jenisKelamin, setJenisKelamin] = React.useState<"L" | "P">("L");
  const [statusKepegawaian, setStatusKepegawaian] = React.useState("TETAP");
  const [email, setEmail] = React.useState("");
  const [telepon, setTelepon] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const activeSekolahId = sekolahId || schools[0]?.id || "";

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!activeSekolahId) {
      setErrorMessage("Silakan pilih sekolah mitra tujuan.");
      return;
    }

    if (namaLengkap.trim().length < 3) {
      setErrorMessage("Nama lengkap guru minimal 3 karakter.");
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.set("sekolah_id", activeSekolahId);
      formData.set("nama_lengkap", namaLengkap.trim());
      if (gelarDepan.trim()) formData.set("gelar_depan", gelarDepan.trim());
      if (gelarBelakang.trim()) formData.set("gelar_belakang", gelarBelakang.trim());
      if (nip.trim()) formData.set("nip", nip.trim());
      formData.set("jenis_kelamin", jenisKelamin);
      formData.set("status_kepegawaian", statusKepegawaian);
      if (email.trim()) formData.set("email", email.trim());
      if (telepon.trim()) formData.set("telepon", telepon.trim());

      const res = await createTeacherAction(null, formData);
      if (res.success) {
        onClose();
        onSuccess();
      } else {
        setErrorMessage(res.message || "Gagal menambahkan guru.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Terjadi kesalahan internal.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-white/60 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-400 flex items-center justify-center font-bold text-xs shadow-2xs">
              <GraduationCap className="size-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Daftarkan Pendidik Baru
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Registrasi profil guru ke sekolah mitra platform Ruang Pintar
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
          {errorMessage && (
            <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs">
              <AlertCircle className="size-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Pilih Sekolah Mitra */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Sekolah Mitra Penempatan <span className="text-rose-500">*</span>
            </label>
            <select
              value={sekolahId}
              onChange={(e) => setSekolahId(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
            >
              {schools.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nama} ({s.jenjang})
                </option>
              ))}
            </select>
          </div>

          {/* Nama Lengkap & Gelar */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Nama Lengkap Guru <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={namaLengkap}
              onChange={(e) => setNamaLengkap(e.target.value)}
              placeholder="Contoh: Ahmad Dahlan"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Gelar Depan
              </label>
              <input
                type="text"
                value={gelarDepan}
                onChange={(e) => setGelarDepan(e.target.value)}
                placeholder="Drs. / Dr."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Gelar Belakang
              </label>
              <input
                type="text"
                value={gelarBelakang}
                onChange={(e) => setGelarBelakang(e.target.value)}
                placeholder="S.Pd. / M.Kom."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              />
            </div>
          </div>

          {/* NIP & Gender */}
          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                NIP / NUPTK
              </label>
              <input
                type="text"
                value={nip}
                onChange={(e) => setNip(e.target.value)}
                placeholder="1985xxxx..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Jenis Kelamin
              </label>
              <select
                value={jenisKelamin}
                onChange={(e) => setJenisKelamin(e.target.value as "L" | "P")}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              >
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
            </div>
          </div>

          {/* Status Kepegawaian */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Status Kepegawaian
            </label>
            <select
              value={statusKepegawaian}
              onChange={(e) => setStatusKepegawaian(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
            >
              <option value="TETAP">Guru Tetap Yayasan / Sekolah</option>
              <option value="HONORER">Guru Honorer</option>
              <option value="KONTRAK">Kontrak</option>
              <option value="PNS">PNS (Pegawai Negeri Sipil)</option>
              <option value="PPPK">PPPK</option>
            </select>
          </div>

          {/* Kontak Email & Telepon */}
          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Email Kontak
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="guru@sekolah.sch.id"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Nomor Telepon
              </label>
              <input
                type="tel"
                value={telepon}
                onChange={(e) => setTelepon(e.target.value)}
                placeholder="0812xxxx..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors active:scale-95 cursor-pointer"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#2563EB] hover:bg-blue-700 text-white transition-all shadow-md shadow-blue-500/20 active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <GraduationCap className="size-3.5" />
              )}
              <span>Daftarkan Guru</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

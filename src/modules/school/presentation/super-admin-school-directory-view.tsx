"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  Plus,
  Search,
  School,
  ShieldCheck,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  ChevronRight,
  Clock,
  Filter,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { CreateSchoolModal } from "./create-school-modal";

export interface SchoolTenantItem {
  id: string;
  nama: string;
  npsn: string | null;
  jenjang: string;
  tipe_lisensi: string;
  trial_berakhir_pada: Date | string | null;
  status_aktif: boolean;
  alamat: string | null;
  telepon: string | null;
  email: string | null;
  created_at: Date | string;
}

interface SuperAdminSchoolDirectoryViewProps {
  schools: SchoolTenantItem[];
}

export function SuperAdminSchoolDirectoryView({ schools }: SuperAdminSchoolDirectoryViewProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedJenjang, setSelectedJenjang] = React.useState<string>("ALL");
  const [selectedLicense, setSelectedLicense] = React.useState<string>("ALL");
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);

  // Metrics
  const totalSchools = schools.length;
  const totalFullLicense = schools.filter((s) => s.tipe_lisensi === "SEKOLAH").length;
  const totalFreemium = schools.filter((s) => s.tipe_lisensi === "FREEMIUM").length;
  const totalActive = schools.filter((s) => s.status_aktif).length;

  // Filtered List
  const filteredSchools = React.useMemo(() => {
    return schools.filter((school) => {
      const matchesSearch =
        school.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (school.npsn && school.npsn.includes(searchQuery)) ||
        (school.alamat && school.alamat.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesJenjang = selectedJenjang === "ALL" || school.jenjang === selectedJenjang;
      const matchesLicense = selectedLicense === "ALL" || school.tipe_lisensi === selectedLicense;

      return matchesSearch && matchesJenjang && matchesLicense;
    });
  }, [schools, searchQuery, selectedJenjang, selectedLicense]);

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero Card with Academic Glass */}
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
                Sekolah & Lisensi
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Direktori Sekolah & Lisensi Multi-Tenant
              </h1>
              <span className="px-2.5 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-bold text-xs whitespace-nowrap">
                SaaS Control Center
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Pusat orkestrasi seluruh institusi sekolah mitra yang terdaftar dalam ekosistem Ruang
              Pintar. Kelola pendaftaran tenant baru, paket langganan lisensi, dan status
              operasional.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer whitespace-nowrap"
          >
            <Plus className="size-4" />
            <span>Daftarkan Sekolah Baru</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Sekolah */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Total Tenant Terdaftar
            </span>
            <div className="size-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-400 flex items-center justify-center">
              <Building2 className="size-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {totalSchools}
            </span>
            <span className="text-xs text-slate-400 font-medium">Institusi</span>
          </div>
        </div>

        {/* Lisensi Penuh */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Lisensi Penuh Institusi
            </span>
            <div className="size-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="size-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {totalFullLicense}
            </span>
            <span className="text-xs text-slate-400 font-medium">Sekolah</span>
          </div>
        </div>

        {/* Freemium Trial */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Paket Freemium
            </span>
            <div className="size-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="size-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {totalFreemium}
            </span>
            <span className="text-xs text-slate-400 font-medium">Trial Aktif</span>
          </div>
        </div>

        {/* Status Operasional */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Sekolah Aktif Berjalan
            </span>
            <div className="size-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Sparkles className="size-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {totalActive}
            </span>
            <span className="text-xs text-slate-400 font-medium">Operasional</span>
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
              placeholder="Cari berdasarkan nama sekolah, NPSN, atau kota..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
            />
          </div>

          {/* License Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { label: "Semua Lisensi", value: "ALL" },
              { label: "Lisensi Penuh", value: "SEKOLAH" },
              { label: "Freemium", value: "FREEMIUM" },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setSelectedLicense(tab.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedLicense === tab.value
                    ? "bg-[#2563EB] text-white shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Jenjang Filter Pills */}
        <div className="flex items-center gap-1.5 pt-1 overflow-x-auto pb-1">
          <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="size-3" /> Jenjang:
          </span>
          {["ALL", "SD", "SMP", "SMA", "SMK", "UMUM"].map((j) => (
            <button
              key={j}
              onClick={() => setSelectedJenjang(j)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                selectedJenjang === j
                  ? "bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold"
                  : "bg-slate-50 dark:bg-slate-800/60 text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {j === "ALL" ? "Semua" : j}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area: Table on Desktop, Cards on Mobile */}
      {filteredSchools.length === 0 ? (
        /* Empty State */
        <div className="rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 p-12 text-center shadow-xs">
          <div className="size-16 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-400 flex items-center justify-center mx-auto mb-4">
            <Building2 className="size-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
            {schools.length === 0
              ? "Belum Ada Institusi Sekolah Terdaftar"
              : "Tidak Ada Sekolah yang Sesuai Filter"}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
            {schools.length === 0
              ? "Platform SaaS Ruang Pintar saat ini belum memiliki tenant sekolah terdaftar. Daftarkan sekolah mitra pertama Anda untuk memulai konfigurasi akademik."
              : "Coba sesuaikan kata kunci pencarian atau reset filter jenjang dan lisensi."}
          </p>
          {schools.length === 0 && (
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/25 transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="size-4" />
              <span>Daftarkan Sekolah Pertama</span>
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden sm:block rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-5">Nama Sekolah</th>
                  <th className="py-3.5 px-4">NPSN & Wilayah</th>
                  <th className="py-3.5 px-4">Lisensi & Trial</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Kontak</th>
                  <th className="py-3.5 px-5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs sm:text-sm">
                {filteredSchools.map((school) => (
                  <tr
                    key={school.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    {/* Nama & Jenjang */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
                          <School className="size-4" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">
                            {school.nama}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-semibold">
                              Jenjang {school.jenjang}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              ID: {school.id.slice(0, 8)}...
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* NPSN & Alamat */}
                    <td className="py-4 px-4">
                      <div className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {school.npsn || (
                          <span className="text-slate-400 font-sans italic">Tanpa NPSN</span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[200px] mt-0.5">
                        {school.alamat || "-"}
                      </div>
                    </td>

                    {/* Lisensi */}
                    <td className="py-4 px-4">
                      <div className="flex flex-col gap-1">
                        <div>
                          {school.tipe_lisensi === "SEKOLAH" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800 text-[11px] font-bold">
                              <ShieldCheck className="size-3" /> Lisensi Penuh
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800 text-[11px] font-bold">
                              <Clock className="size-3" /> Freemium
                            </span>
                          )}
                        </div>
                        {school.trial_berakhir_pada && (
                          <span className="text-[10px] text-slate-400">
                            Trial s.d{" "}
                            {new Date(school.trial_berakhir_pada).toLocaleDateString("id-ID")}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4">
                      {school.status_aktif ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
                          <CheckCircle2 className="size-3" /> Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-medium">
                          <XCircle className="size-3" /> Nonaktif
                        </span>
                      )}
                    </td>

                    {/* Kontak */}
                    <td className="py-4 px-4">
                      <div className="space-y-0.5 text-xs text-slate-500 dark:text-slate-400">
                        {school.email && (
                          <div className="flex items-center gap-1 truncate max-w-[160px]">
                            <Mail className="size-3 shrink-0 text-slate-400" />
                            <span>{school.email}</span>
                          </div>
                        )}
                        {school.telepon && (
                          <div className="flex items-center gap-1">
                            <Phone className="size-3 shrink-0 text-slate-400" />
                            <span className="font-mono">{school.telepon}</span>
                          </div>
                        )}
                        {!school.email && !school.telepon && (
                          <span className="text-slate-400 italic text-xs">-</span>
                        )}
                      </div>
                    </td>

                    {/* Aksi */}
                    <td className="py-4 px-5 text-right">
                      <Link
                        href={`/sekolah?sekolahId=${school.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/50 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 text-xs font-semibold transition-all"
                      >
                        <span>Kelola</span>
                        <ChevronRight className="size-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View (sm:hidden) */}
          <div className="sm:hidden space-y-3">
            {filteredSchools.map((school) => (
              <div
                key={school.id}
                className="p-4 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <div className="size-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      <School className="size-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                        {school.nama}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-semibold whitespace-nowrap">
                          Jenjang {school.jenjang}
                        </span>
                        {school.npsn && (
                          <span className="font-mono text-[10px] text-slate-500 whitespace-nowrap">
                            NPSN: {school.npsn}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  <span className="shrink-0">
                    {school.status_aktif ? (
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

                {/* Lisensi & Info */}
                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs border-t border-slate-100 dark:border-slate-800">
                  {school.tipe_lisensi === "SEKOLAH" ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold whitespace-nowrap">
                      <ShieldCheck className="size-3" /> Lisensi Penuh
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-[10px] font-bold whitespace-nowrap">
                      <Clock className="size-3" /> Freemium
                    </span>
                  )}
                  {school.alamat && (
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[200px]">
                      {school.alamat}
                    </span>
                  )}
                </div>

                {/* Footer Link */}
                <div className="pt-2 flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[10px]">
                    Terdaftar: {new Date(school.created_at).toLocaleDateString("id-ID")}
                  </span>
                  <Link
                    href={`/sekolah?sekolahId=${school.id}`}
                    className="inline-flex items-center gap-1 text-[#2563EB] dark:text-blue-400 font-bold hover:underline"
                  >
                    <span>Kelola</span>
                    <ChevronRight className="size-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Modal Dialog */}
      <CreateSchoolModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          router.refresh();
        }}
      />
    </div>
  );
}

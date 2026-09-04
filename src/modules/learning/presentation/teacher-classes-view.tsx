"use client";

/**
 * Ruang Pintar — M11 Teacher Classes Directory & Academic Supervision View (/kelas-saya)
 * Academic Glass UI v1.2
 *
 * Fitur Navigasi Modern:
 * 1. Tab Perspektif (Semua Kelas / Per Rombel / Per Guru)
 * 2. Toggle Tampilan (Grid Kartu Modern vs Tabel Ringkas / Compact Table)
 * 3. Filter Cepat Tingkat (Semua, Kelas X, XI, XII)
 * 4. Paginasi Cerdas (12 / 24 / 48 per halaman) tanpa scroll panjang
 */

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Layers,
  BookOpen,
  Users,
  Clock,
  Search,
  ArrowRight,
  GraduationCap,
  Filter,
  LayoutGrid,
  Table2,
  ChevronLeft,
  ChevronRight,
  School,
} from "lucide-react";
import { TeacherClassCardDTO } from "../domain/learning-types";

export interface TeacherSimpleDTO {
  id: string;
  nama_lengkap: string;
  gelar_depan: string | null;
  gelar_belakang: string | null;
  total_kelas: number;
}

interface TeacherClassesViewProps {
  classes: TeacherClassCardDTO[];
  teacherName?: string;
  isAdmin?: boolean;
  teachersList?: TeacherSimpleDTO[];
  initialSelectedGuruId?: string | null;
}

export function TeacherClassesView({
  classes,
  teacherName,
  isAdmin = false,
  teachersList = [],
  initialSelectedGuruId = null,
}: TeacherClassesViewProps) {
  // 1. State Navigasi & Tampilan
  const [perspective, setPerspective] = useState<"ALL" | "ROMBEL" | "GURU">("ALL");
  const [viewMode, setViewMode] = useState<"GRID" | "TABLE">("GRID");
  const [search, setSearch] = useState("");
  const [selectedGuruId, setSelectedGuruId] = useState<string>(initialSelectedGuruId || "ALL");
  const [selectedTingkat, setSelectedTingkat] = useState<string>("ALL");
  const [selectedRombelFilter, setSelectedRombelFilter] = useState<string>("ALL");

  // 2. State Paginasi
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(12);

  // Filter Tingkat Unik
  const uniqueTingkats = useMemo(() => {
    const set = new Set<string>();
    classes.forEach((c) => {
      if (c.tingkat_nama) set.add(c.tingkat_nama);
    });
    return Array.from(set).sort();
  }, [classes]);

  // Filter Rombel Unik
  const uniqueRombelsList = useMemo(() => {
    const map = new Map<string, { id: string; nama: string; tingkat: string | null }>();
    classes.forEach((c) => {
      if (!map.has(c.rombel_id)) {
        map.set(c.rombel_id, {
          id: c.rombel_id,
          nama: c.rombel_nama,
          tingkat: c.tingkat_nama || null,
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => a.nama.localeCompare(b.nama));
  }, [classes]);

  // Data terfilter secara reaktif
  const filtered = useMemo(() => {
    return classes.filter((c) => {
      // Filter guru
      if (isAdmin && selectedGuruId !== "ALL" && c.guru_id !== selectedGuruId) {
        return false;
      }
      // Filter tingkat
      if (selectedTingkat !== "ALL" && c.tingkat_nama !== selectedTingkat) {
        return false;
      }
      // Filter rombel spesifik
      if (selectedRombelFilter !== "ALL" && c.rombel_id !== selectedRombelFilter) {
        return false;
      }
      // Filter pencarian teks
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchRombel = c.rombel_nama.toLowerCase().includes(query);
        const matchMapel = c.mata_pelajaran_nama.toLowerCase().includes(query);
        const matchKode = c.mata_pelajaran_kode.toLowerCase().includes(query);
        const matchGuru = c.guru_nama && c.guru_nama.toLowerCase().includes(query);
        if (!matchRombel && !matchMapel && !matchKode && !matchGuru) {
          return false;
        }
      }
      return true;
    });
  }, [classes, isAdmin, selectedGuruId, selectedTingkat, selectedRombelFilter, search]);

  // Metrik terhitung
  const totalJP = filtered.reduce((sum, c) => sum + c.jumlah_jam_minggu, 0);
  const totalSiswa = filtered.reduce((sum, c) => sum + c.total_siswa, 0);
  const totalBAB = filtered.reduce((sum, c) => sum + c.total_bab, 0);
  const uniqueRombelsCount = new Set(filtered.map((c) => c.rombel_id)).size;
  const uniqueTeachersCount = new Set(filtered.map((c) => c.guru_id)).size;

  // Data Paginasi
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const pagedClasses = filtered.slice(startIndex, startIndex + pageSize);

  // Grouping untuk mode PER_ROMBEL
  const rombelGroups = useMemo(() => {
    const map = new Map<
      string,
      {
        rombel_id: string;
        rombel_nama: string;
        tingkat_nama: string | null;
        total_siswa: number;
        classes: TeacherClassCardDTO[];
        total_jp: number;
      }
    >();

    filtered.forEach((c) => {
      if (!map.has(c.rombel_id)) {
        map.set(c.rombel_id, {
          rombel_id: c.rombel_id,
          rombel_nama: c.rombel_nama,
          tingkat_nama: c.tingkat_nama || null,
          total_siswa: c.total_siswa,
          classes: [],
          total_jp: 0,
        });
      }
      const g = map.get(c.rombel_id)!;
      g.classes.push(c);
      g.total_jp += c.jumlah_jam_minggu;
    });

    return Array.from(map.values()).sort((a, b) => a.rombel_nama.localeCompare(b.rombel_nama));
  }, [filtered]);

  // Grouping untuk mode PER_GURU
  const guruGroups = useMemo(() => {
    const map = new Map<
      string,
      {
        guru_id: string;
        guru_nama: string;
        classes: TeacherClassCardDTO[];
        total_jp: number;
        unique_rombels: Set<string>;
      }
    >();

    filtered.forEach((c) => {
      if (!map.has(c.guru_id)) {
        map.set(c.guru_id, {
          guru_id: c.guru_id,
          guru_nama: c.guru_nama,
          classes: [],
          total_jp: 0,
          unique_rombels: new Set(),
        });
      }
      const g = map.get(c.guru_id)!;
      g.classes.push(c);
      g.total_jp += c.jumlah_jam_minggu;
      g.unique_rombels.add(c.rombel_nama);
    });

    return Array.from(map.values()).sort((a, b) => a.guru_nama.localeCompare(b.guru_nama));
  }, [filtered]);

  const handleSelectRombel = (rombelId: string) => {
    setSelectedRombelFilter(rombelId);
    setPerspective("ALL");
    setCurrentPage(1);
  };

  const handleSelectGuru = (guruId: string) => {
    setSelectedGuruId(guruId);
    setPerspective("ALL");
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearch("");
    setSelectedGuruId("ALL");
    setSelectedTingkat("ALL");
    setSelectedRombelFilter("ALL");
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* 1. Top Metric Cards — Ringkas & Sempurna di Mobile (2x2) & Tablet/Desktop (4 Col) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3.5">
        <div className="p-3 sm:p-4 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-blue-300 hover:-translate-y-1 transition-all duration-300 group cursor-default">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-600 transition-colors truncate">
              Total Kelas
            </span>
            <div className="p-1.5 rounded-xl bg-blue-50 text-[#2563EB] group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-2xs shrink-0">
              <Layers className="h-4 w-4 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <div className="mt-1.5 flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-black text-slate-800 group-hover:text-[#2563EB] transition-colors">
              {filtered.length}
            </span>
            <span className="text-xs font-bold text-slate-500">Kelas</span>
          </div>
          <span className="text-[11px] text-slate-400 block mt-0.5 truncate">Penugasan aktif</span>
        </div>

        <div className="p-3 sm:p-4 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-indigo-300 hover:-translate-y-1 transition-all duration-300 group cursor-default">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-600 transition-colors truncate">
              Beban KBM
            </span>
            <div className="p-1.5 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-2xs shrink-0">
              <Clock className="h-4 w-4 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <div className="mt-1.5 flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-black text-indigo-600 group-hover:text-indigo-700 transition-colors">
              {totalJP}
            </span>
            <span className="text-xs font-bold text-indigo-600">JP</span>
          </div>
          <span className="text-[11px] text-slate-400 block mt-0.5 truncate">per minggu</span>
        </div>

        <div className="p-3 sm:p-4 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-emerald-300 hover:-translate-y-1 transition-all duration-300 group cursor-default">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-600 transition-colors truncate">
              {isAdmin && selectedGuruId === "ALL" ? "Rombel" : "Siswa Binaan"}
            </span>
            <div className="p-1.5 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-2xs shrink-0">
              <Users className="h-4 w-4 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <div className="mt-1.5 flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-black text-emerald-600 group-hover:text-emerald-700 transition-colors">
              {isAdmin && selectedGuruId === "ALL" ? uniqueRombelsCount : totalSiswa}
            </span>
            <span className="text-xs font-bold text-emerald-600">
              {isAdmin && selectedGuruId === "ALL" ? "Rombel" : "Siswa"}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 block mt-0.5 truncate">
            {isAdmin && selectedGuruId === "ALL" ? "sekolah" : "terlayani"}
          </span>
        </div>

        <div className="p-3 sm:p-4 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-purple-300 hover:-translate-y-1 transition-all duration-300 group cursor-default">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-600 transition-colors truncate">
              {isAdmin && selectedGuruId === "ALL" ? "Guru Pengampu" : "Lingkup Materi"}
            </span>
            <div className="p-1.5 rounded-xl bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300 shadow-2xs shrink-0">
              {isAdmin && selectedGuruId === "ALL" ? (
                <GraduationCap className="h-4 w-4 group-hover:scale-110 transition-transform" />
              ) : (
                <BookOpen className="h-4 w-4 group-hover:scale-110 transition-transform" />
              )}
            </div>
          </div>
          <div className="mt-1.5 flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-black text-purple-600 group-hover:text-purple-700 transition-colors">
              {isAdmin && selectedGuruId === "ALL" ? uniqueTeachersCount : totalBAB}
            </span>
            <span className="text-xs font-bold text-purple-600">
              {isAdmin && selectedGuruId === "ALL" ? "Guru" : "BAB"}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 block mt-0.5 truncate">
            {isAdmin && selectedGuruId === "ALL" ? "penugasan" : "kurikulum"}
          </span>
        </div>
      </div>

      {/* 2. Bilah Tab Perspektif & Toggle Tampilan */}
      {/* 2. Bilah Tab Perspektif (Khusus Supervisi Admin) */}
      {isAdmin && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 p-1.5 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-2xs">
          {/* Tab Perspektif */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => {
                setPerspective("ALL");
                setCurrentPage(1);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                perspective === "ALL"
                  ? "bg-[#2563EB] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Semua Kelas</span>
              <span className="text-[10px] opacity-80">({filtered.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setPerspective("ROMBEL")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                perspective === "ROMBEL"
                  ? "bg-[#2563EB] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <School className="h-3.5 w-3.5" />
              <span>Per Rombel</span>
              <span className="text-[10px] opacity-80">({rombelGroups.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setPerspective("GURU")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                perspective === "GURU"
                  ? "bg-[#2563EB] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <GraduationCap className="h-3.5 w-3.5" />
              <span>Per Guru</span>
              <span className="text-[10px] opacity-80">({guruGroups.length})</span>
            </button>
          </div>

          {/* Toggle Mode Grid vs Tabel di mode Supervisi */}
          {perspective === "ALL" && (
            <div className="flex items-center gap-1 self-end md:self-auto bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setViewMode("GRID")}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === "GRID"
                    ? "bg-white text-[#2563EB] shadow-2xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
                title="Tampilan Kartu Grid"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Grid Kartu</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode("TABLE")}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === "TABLE"
                    ? "bg-white text-[#2563EB] shadow-2xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
                title="Tampilan Tabel Ringkas"
              >
                <Table2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Tabel Ringkas</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* 3. Toolbar Filter & Pencarian Terpadu */}
      <div className="p-3 sm:p-4 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-2xs space-y-2.5 sm:space-y-3">
        <div className="flex flex-row items-center justify-between gap-2">
          {/* Kolom Pencarian */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder={
                isAdmin
                  ? "Cari rombel, mata pelajaran, kode, atau guru..."
                  : "Cari rombel atau mata pelajaran..."
              }
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB] transition-all"
            />
          </div>

          {/* Mode Switcher untuk Guru di dalam Toolbar */}
          {!isAdmin && (
            <div className="flex items-center gap-0.5 bg-slate-100 p-1 rounded-xl shrink-0">
              <button
                type="button"
                onClick={() => setViewMode("GRID")}
                className={`p-1.5 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === "GRID"
                    ? "bg-white text-[#2563EB] shadow-2xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
                title="Tampilan Kartu Grid"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span className="text-xs">Grid</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode("TABLE")}
                className={`p-1.5 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === "TABLE"
                    ? "bg-white text-[#2563EB] shadow-2xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
                title="Tampilan Tabel Ringkas"
              >
                <Table2 className="h-3.5 w-3.5" />
                <span className="text-xs">Tabel</span>
              </button>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Guru (Admin) */}
            {isAdmin && (
              <div className="relative min-w-[200px]">
                <select
                  value={selectedGuruId}
                  onChange={(e) => {
                    setSelectedGuruId(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB] transition-all cursor-pointer"
                >
                  <option value="ALL">Semua Guru ({teachersList.length} Pengampu)</option>
                  {teachersList.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.gelar_depan ? `${t.gelar_depan} ` : ""}
                      {t.nama_lengkap}
                      {t.gelar_belakang ? `, ${t.gelar_belakang}` : ""} ({t.total_kelas})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Filter Rombel (Admin) */}
            {isAdmin && (
              <div className="relative min-w-[150px]">
                <select
                  value={selectedRombelFilter}
                  onChange={(e) => {
                    setSelectedRombelFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB] transition-all cursor-pointer"
                >
                  <option value="ALL">Semua Rombel ({uniqueRombelsList.length})</option>
                  {uniqueRombelsList.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.nama}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Reset Filter Button */}
            {(selectedGuruId !== "ALL" ||
              selectedTingkat !== "ALL" ||
              selectedRombelFilter !== "ALL" ||
              search) && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-600 transition-all cursor-pointer"
              >
                Reset Filter
              </button>
            )}
          </div>
        </div>

        {/* Filter Cepat Tingkat (Chips) */}
        {uniqueTingkats.length > 0 && (
          <div className="flex items-center gap-1.5 pt-1 border-t border-slate-100 overflow-x-auto scrollbar-none">
            <span className="text-[11px] font-bold text-slate-400 mr-1 shrink-0">Tingkat:</span>
            <button
              type="button"
              onClick={() => {
                setSelectedTingkat("ALL");
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
                selectedTingkat === "ALL"
                  ? "bg-slate-800 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Semua
            </button>
            {uniqueTingkats.map((tk) => (
              <button
                key={tk}
                type="button"
                onClick={() => {
                  setSelectedTingkat(tk);
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  selectedTingkat === tk
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {tk}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 4. Konten Utama Sesuai Perspektif */}

      {/* A. PERSPEKTIF: PER ROMBEL */}
      {perspective === "ROMBEL" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rombelGroups.map((rg) => (
            <div
              key={rg.rombel_id}
              className="group relative rounded-3xl bg-white border border-slate-200/80 p-5 shadow-2xs hover:shadow-[0_16px_36px_rgba(37,99,235,0.10)] hover:border-blue-300 hover:-translate-y-1.5 transition-all duration-300 ease-out flex flex-col justify-between overflow-hidden"
            >
              {/* Animated Top Accent Bar */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-xl bg-blue-50 text-[#2563EB] font-black text-sm border border-blue-200/80 group-hover:bg-[#2563EB] group-hover:text-white transition-colors duration-300">
                    {rg.rombel_nama}
                  </span>
                  {rg.tingkat_nama && (
                    <span className="text-xs font-bold text-slate-400">{rg.tingkat_nama}</span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 p-2.5 rounded-2xl bg-slate-50 border border-slate-100 text-center group-hover:bg-blue-50/40 transition-colors">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Mapel</span>
                    <span className="text-sm font-black text-slate-800">{rg.classes.length}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Beban</span>
                    <span className="text-sm font-black text-indigo-600">{rg.total_jp} JP</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Siswa</span>
                    <span className="text-sm font-black text-emerald-600">{rg.total_siswa}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 block">Contoh Mapel:</span>
                  <div className="flex flex-wrap gap-1">
                    {rg.classes.slice(0, 4).map((c) => (
                      <span
                        key={c.id}
                        className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium group-hover:border group-hover:border-slate-200 transition-all"
                      >
                        {c.mata_pelajaran_nama}
                      </span>
                    ))}
                    {rg.classes.length > 4 && (
                      <span className="px-2 py-0.5 rounded-md bg-blue-50 text-[#2563EB] text-[11px] font-bold">
                        +{rg.classes.length - 4} lainnya
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => handleSelectRombel(rg.rombel_id)}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-[#2563EB] text-[#2563EB] hover:text-white font-bold text-xs transition-all duration-200 flex items-center gap-1.5 cursor-pointer shadow-2xs group-hover:shadow-blue-500/20"
                >
                  <span>Buka Kelas Rombel ({rg.classes.length})</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* B. PERSPEKTIF: PER GURU */}
      {perspective === "GURU" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {guruGroups.map((gg) => (
            <div
              key={gg.guru_id}
              className="group relative rounded-3xl bg-white border border-slate-200/80 p-5 shadow-2xs hover:shadow-[0_16px_36px_rgba(37,99,235,0.10)] hover:border-blue-300 hover:-translate-y-1.5 transition-all duration-300 ease-out flex flex-col justify-between overflow-hidden"
            >
              {/* Animated Top Accent Bar */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-50 border border-blue-100 text-[#2563EB] flex items-center justify-center font-bold text-sm shrink-0 group-hover:bg-blue-600 group-hover:text-white group-hover:scale-105 transition-all duration-300 shadow-2xs">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <div className="overflow-hidden">
                    <h4
                      className="text-sm font-bold text-slate-800 truncate group-hover:text-[#2563EB] transition-colors"
                      title={gg.guru_nama}
                    >
                      {gg.guru_nama}
                    </h4>
                    <span className="text-[11px] text-slate-400 block font-medium">
                      Mengajar di {gg.unique_rombels.size} Rombel
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-2xl bg-slate-50 border border-slate-100 text-center group-hover:bg-blue-50/40 transition-colors">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">
                      Kelas Diampu
                    </span>
                    <span className="text-sm font-black text-slate-800">{gg.classes.length}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">
                      Beban Mengajar
                    </span>
                    <span className="text-sm font-black text-indigo-600">{gg.total_jp} JP</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 block">Rombel:</span>
                  <div className="flex flex-wrap gap-1">
                    {Array.from(gg.unique_rombels).map((r) => (
                      <span
                        key={r}
                        className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-bold group-hover:border group-hover:border-slate-200 transition-all"
                      >
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => handleSelectGuru(gg.guru_id)}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-[#2563EB] text-[#2563EB] hover:text-white font-bold text-xs transition-all duration-200 flex items-center gap-1.5 cursor-pointer shadow-2xs group-hover:shadow-blue-500/20"
                >
                  <span>Lihat {gg.classes.length} Kelas Guru</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* C. PERSPEKTIF: SEMUA KELAS (DENGAN PAGINASI) */}
      {perspective === "ALL" && (
        <>
          {filtered.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white/80 backdrop-blur-md border border-slate-200/80">
              <BookOpen className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-slate-700">Tidak ada kelas yang ditemukan</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                {search
                  ? `Tidak ada penugasan kelas yang cocok dengan kata kunci '${search}'.`
                  : "Belum ada penugasan mengajar aktif untuk filter yang dipilih."}
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-3 px-4 py-2 rounded-xl bg-blue-50 text-[#2563EB] text-xs font-bold hover:bg-blue-100 transition-all cursor-pointer"
              >
                Reset Semua Filter
              </button>
            </div>
          ) : viewMode === "GRID" ? (
            /* Mode 1: GRID KARTU (Dibatasi per Halaman) */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {pagedClasses.map((c) => (
                <div
                  key={c.id}
                  className="group relative rounded-3xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-[0_18px_40px_rgba(37,99,235,0.12)] hover:border-blue-400 hover:-translate-y-1.5 transition-all duration-300 ease-out flex flex-col justify-between overflow-hidden"
                >
                  {/* Animated Top Accent Bar on Hover */}
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="p-4 sm:p-5 space-y-3 sm:space-y-3.5">
                    {/* Header Kartu: Kode Mapel + Badge JP */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-xl bg-blue-50 border border-blue-200/80 text-[#2563EB] font-bold text-xs group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                          {c.mata_pelajaran_kode}
                        </span>
                        <span className="text-[11px] sm:text-xs font-semibold text-slate-400">
                          {c.tahun_ajaran_nama}
                        </span>
                      </div>

                      <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                        {c.jumlah_jam_minggu} JP / Mgg
                      </span>
                    </div>

                    {/* Info Utama: Nama Mapel & Rombel */}
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-[#0F172A] leading-snug group-hover:text-[#2563EB] transition-colors duration-200">
                        {c.mata_pelajaran_nama}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-800 text-xs font-extrabold group-hover:bg-blue-100 group-hover:text-blue-900 transition-colors">
                          {c.rombel_nama}
                        </span>
                        {c.tingkat_nama && (
                          <span className="text-xs text-slate-400">({c.tingkat_nama})</span>
                        )}
                      </div>
                    </div>

                    {/* Info Guru Pengampu — Hanya Ditampilkan Saat Supervisi Admin */}
                    {isAdmin && (
                      <div className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100/90 text-xs group-hover:bg-blue-50/50 group-hover:border-blue-100 transition-colors">
                        <GraduationCap className="h-3.5 w-3.5 text-[#2563EB] shrink-0 group-hover:scale-110 transition-transform" />
                        <span className="text-slate-600 truncate">
                          Guru: <strong className="text-slate-800 font-bold">{c.guru_nama}</strong>
                        </span>
                      </div>
                    )}

                    {/* Ringkasan Konten Kelas (BAB, Materi, Tugas, Jurnal) */}
                    <div className="grid grid-cols-4 gap-1 sm:gap-1.5 pt-2 border-t border-slate-100 text-center">
                      <div className="p-1.5 sm:p-2 rounded-xl bg-slate-50/80 group-hover:bg-slate-50 transition-colors">
                        <span className="text-[10px] text-slate-400 block font-semibold">BAB</span>
                        <span className="text-xs font-black text-slate-700">{c.total_bab}</span>
                      </div>
                      <div className="p-1.5 sm:p-2 rounded-xl bg-slate-50/80 group-hover:bg-slate-50 transition-colors">
                        <span className="text-[10px] text-slate-400 block font-semibold">
                          Materi
                        </span>
                        <span className="text-xs font-black text-slate-700">{c.total_materi}</span>
                      </div>
                      <div className="p-1.5 sm:p-2 rounded-xl bg-slate-50/80 group-hover:bg-slate-50 transition-colors">
                        <span className="text-[10px] text-slate-400 block font-semibold">
                          Tugas
                        </span>
                        <span className="text-xs font-black text-slate-700">{c.total_tugas}</span>
                      </div>
                      <div className="p-1.5 sm:p-2 rounded-xl bg-slate-50/80 group-hover:bg-slate-50 transition-colors">
                        <span className="text-[10px] text-slate-400 block font-semibold">
                          Jurnal
                        </span>
                        <span className="text-xs font-black text-slate-700">{c.total_jurnal}</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer Aksi — Ringkas, Elegan, dan Selalu 1 Baris Sejajar */}
                  <div className="px-4 py-2.5 sm:px-5 sm:py-3.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 shrink-0">
                      <Users className="h-3.5 w-3.5 text-slate-400" />
                      <span>{c.total_siswa} Siswa</span>
                    </span>

                    <Link
                      href={`/kelas-saya/${c.id}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs shadow-xs transition-all duration-200 cursor-pointer group-hover:shadow-md group-hover:shadow-blue-500/25 group/btn active:scale-[0.98]"
                    >
                      <span>Buka Workspace</span>
                      <ArrowRight className="h-3.5 w-3.5 group-hover/btn:translate-x-1 transition-transform duration-200" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Mode 2: TABEL RINGKAS (COMPACT DATA TABLE) */
            <div className="overflow-hidden rounded-3xl bg-white border border-slate-200/80 shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/90 border-b border-slate-200 text-slate-500 font-bold tracking-wider uppercase text-[11px]">
                    <tr>
                      <th className="py-3 px-4 w-12 text-center">No</th>
                      <th className="py-3 px-4">Rombel</th>
                      <th className="py-3 px-4">Mata Pelajaran</th>
                      <th className="py-3 px-4">Guru Pengampu</th>
                      <th className="py-3 px-4 text-center">Beban</th>
                      <th className="py-3 px-4 text-center">Progres KBM</th>
                      <th className="py-3 px-4 text-center">Siswa</th>
                      <th className="py-3 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {pagedClasses.map((c, index) => (
                      <tr key={c.id} className="hover:bg-blue-50/40 transition-colors">
                        <td className="py-3 px-4 text-center text-slate-400 font-mono">
                          {startIndex + index + 1}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-900 font-extrabold text-xs">
                            {c.rombel_nama}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 leading-tight">
                            {c.mata_pelajaran_nama}
                          </div>
                          <span className="text-[11px] text-[#2563EB] font-bold">
                            {c.mata_pelajaran_kode}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-800">{c.guru_nama}</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold text-xs">
                            {c.jumlah_jam_minggu} JP
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                            <span>{c.total_bab} BAB</span>
                            <span className="text-slate-300">•</span>
                            <span>{c.total_materi} Mat</span>
                            <span className="text-slate-300">•</span>
                            <span>{c.total_tugas} Tug</span>
                            <span className="text-slate-300">•</span>
                            <span>{c.total_jurnal} Jur</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="text-xs font-semibold text-slate-600">
                            {c.total_siswa}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Link
                            href={`/kelas-saya/${c.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs shadow-2xs transition-all cursor-pointer"
                          >
                            <span>Buka</span>
                            <ArrowRight className="h-3 w-3" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 5. Kontrol Paginasi Cerdas */}
          {filtered.length > 0 && (
            <div className="p-4 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="text-slate-500 font-semibold">
                Menampilkan <strong className="text-slate-800">{startIndex + 1}</strong> –{" "}
                <strong className="text-slate-800">
                  {Math.min(startIndex + pageSize, filtered.length)}
                </strong>{" "}
                dari <strong className="text-slate-800">{filtered.length}</strong> kelas
              </div>

              <div className="flex items-center gap-3">
                {/* Pilihan Page Size */}
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400">Tampilkan:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="px-2 py-1 rounded-lg border border-slate-200 bg-slate-50 font-bold text-slate-700 cursor-pointer"
                  >
                    <option value={12}>12 kartu</option>
                    <option value={24}>24 kartu</option>
                    <option value={48}>48 kartu</option>
                    <option value={100}>100 kartu</option>
                  </select>
                </div>

                {/* Navigasi Halaman */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={safeCurrentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                    title="Halaman Sebelumnya"
                  >
                    <ChevronLeft className="h-4 w-4 text-slate-600" />
                  </button>

                  <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-[#2563EB] font-bold">
                    {safeCurrentPage} / {totalPages}
                  </span>

                  <button
                    type="button"
                    disabled={safeCurrentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                    title="Halaman Berikutnya"
                  >
                    <ChevronRight className="h-4 w-4 text-slate-600" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

"use client";

/**
 * Ruang Pintar — M11 Teacher Classes Directory & Academic Supervision View (/kelas-saya)
 * Academic Glass UI v1.2
 *
 * Fitur Navigasi Modern:
 * 1. Tab Perspektif (Semua Kelas / Per Rombel / Per Guru)
 * 2. Toggle Tampilan (Grid Kartu Modern vs Tabel Ringkas / Compact Table)
 * 3. Filter Cepat Tingkat (Semua, Kelas X, XI, XII)
 * 4. Aksi Tambah Kelas Manual & Foto Absen AI
 * 5. Paginasi Cerdas (12 / 24 / 48 per halaman) tanpa scroll panjang
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
  PlusCircle,
  Camera,
} from "lucide-react";
import { TeacherClassCardDTO } from "../domain/learning-types";
import { ManualCreateClassModal } from "./manual-create-class-modal";

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

  const handleOpenAiPhoto = () => {
    window.dispatchEvent(new CustomEvent("open-ai-photo-modal"));
  };

  const handleOpenManualClass = () => {
    window.dispatchEvent(new CustomEvent("open-manual-class-modal"));
  };

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
  const uniqueMapelsCount = new Set(filtered.map((c) => c.mata_pelajaran_id)).size;
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
        classes: TeacherClassCardDTO[];
        total_jp: number;
        total_siswa: number;
      }
    >();

    filtered.forEach((c) => {
      const existing = map.get(c.rombel_id);
      if (!existing) {
        map.set(c.rombel_id, {
          rombel_id: c.rombel_id,
          rombel_nama: c.rombel_nama,
          tingkat_nama: c.tingkat_nama || null,
          classes: [c],
          total_jp: c.jumlah_jam_minggu,
          total_siswa: c.total_siswa,
        });
      } else {
        existing.classes.push(c);
        existing.total_jp += c.jumlah_jam_minggu;
      }
    });

    return Array.from(map.values()).sort((a, b) => a.rombel_nama.localeCompare(b.rombel_nama));
  }, [filtered]);

  // Grouping untuk mode PER_GURU (Supervisi Admin)
  const guruGroups = useMemo(() => {
    if (!isAdmin) return [];
    const map = new Map<
      string,
      {
        guru_id: string;
        guru_nama: string;
        classes: TeacherClassCardDTO[];
        total_jp: number;
        total_siswa: number;
        rombel_count: number;
      }
    >();

    filtered.forEach((c) => {
      const gId = c.guru_id || "UNASSIGNED";
      const gNama = c.guru_nama || "Tanpa Guru Pengampu";
      const existing = map.get(gId);
      if (!existing) {
        map.set(gId, {
          guru_id: gId,
          guru_nama: gNama,
          classes: [c],
          total_jp: c.jumlah_jam_minggu,
          total_siswa: c.total_siswa,
          rombel_count: 1,
        });
      } else {
        existing.classes.push(c);
        existing.total_jp += c.jumlah_jam_minggu;
        existing.rombel_count = new Set(existing.classes.map((x) => x.rombel_id)).size;
      }
    });

    return Array.from(map.values()).sort((a, b) => a.guru_nama.localeCompare(b.guru_nama));
  }, [filtered, isAdmin]);

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
      {/* Modal Manager for Manual Class Creation */}
      <ManualCreateClassModal />

      {/* 1. Top Metric Cards — Ringkas & Sempurna di Mobile (2x2) & Tablet/Desktop (4 Col) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3.5">
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900/75 dark:backdrop-blur-xl border border-slate-200/80 dark:border-blue-500/20 shadow-2xs dark:shadow-[0_0_25px_-5px_rgba(37,99,235,0.16)] hover:shadow-md hover:border-blue-300 dark:hover:border-blue-500/40 hover:-translate-y-0.5 transition-all duration-300 group cursor-default">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors truncate">
              Total Rombel / Kelas
            </span>
            <div className="p-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-2xs shrink-0">
              <Layers className="h-4 w-4 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <div className="mt-1.5 flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white group-hover:text-[#2563EB] dark:group-hover:text-blue-400 transition-colors">
              {uniqueRombelsCount}
            </span>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Kelas</span>
          </div>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 block mt-0.5 truncate">
            {uniqueMapelsCount} Mapel • {filtered.length} Penugasan
          </span>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900/75 dark:backdrop-blur-xl border border-slate-200/80 dark:border-blue-500/20 shadow-2xs dark:shadow-[0_0_25px_-5px_rgba(37,99,235,0.16)] hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-500/40 hover:-translate-y-0.5 transition-all duration-300 group cursor-default">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors truncate">
              Beban KBM
            </span>
            <div className="p-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-2xs shrink-0">
              <Clock className="h-4 w-4 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <div className="mt-1.5 flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-black text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-700 transition-colors">
              {totalJP}
            </span>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">JP</span>
          </div>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 block mt-0.5 truncate">
            per minggu
          </span>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900/75 dark:backdrop-blur-xl border border-slate-200/80 dark:border-blue-500/20 shadow-2xs dark:shadow-[0_0_25px_-5px_rgba(37,99,235,0.16)] hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-500/40 hover:-translate-y-0.5 transition-all duration-300 group cursor-default">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors truncate">
              {isAdmin && selectedGuruId === "ALL" ? "Rombel" : "Siswa Binaan"}
            </span>
            <div className="p-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-2xs shrink-0">
              <Users className="h-4 w-4 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <div className="mt-1.5 flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-700 transition-colors">
              {isAdmin && selectedGuruId === "ALL" ? uniqueRombelsCount : totalSiswa}
            </span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              {isAdmin && selectedGuruId === "ALL" ? "Rombel" : "Siswa"}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 block mt-0.5 truncate">
            {isAdmin && selectedGuruId === "ALL" ? "sekolah" : "terlayani"}
          </span>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900/75 dark:backdrop-blur-xl border border-slate-200/80 dark:border-blue-500/20 shadow-2xs dark:shadow-[0_0_25px_-5px_rgba(37,99,235,0.16)] hover:shadow-md hover:border-purple-300 dark:hover:border-purple-500/40 hover:-translate-y-0.5 transition-all duration-300 group cursor-default">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors truncate">
              {isAdmin && selectedGuruId === "ALL" ? "Guru Pengampu" : "Lingkup Materi"}
            </span>
            <div className="p-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300 shadow-2xs shrink-0">
              {isAdmin && selectedGuruId === "ALL" ? (
                <GraduationCap className="h-4 w-4 group-hover:scale-110 transition-transform" />
              ) : (
                <BookOpen className="h-4 w-4 group-hover:scale-110 transition-transform" />
              )}
            </div>
          </div>
          <div className="mt-1.5 flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-black text-purple-600 dark:text-purple-400 group-hover:text-purple-700 transition-colors">
              {isAdmin && selectedGuruId === "ALL" ? uniqueTeachersCount : totalBAB}
            </span>
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
              {isAdmin && selectedGuruId === "ALL" ? "Guru" : "BAB"}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 block mt-0.5 truncate">
            {isAdmin && selectedGuruId === "ALL" ? "penugasan" : "kurikulum"}
          </span>
        </div>
      </div>

      {/* 2. Bilah Tab Perspektif & Toggle Tampilan */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 p-1.5 rounded-2xl bg-white dark:bg-slate-900/75 dark:backdrop-blur-xl border border-slate-200/80 dark:border-blue-500/20 shadow-2xs">
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
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Semua Penugasan</span>
            <span className="text-[10px] opacity-80">({filtered.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setPerspective("ROMBEL")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
              perspective === "ROMBEL"
                ? "bg-[#2563EB] text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <School className="h-3.5 w-3.5" />
            <span>Per Rombel</span>
            <span className="text-[10px] opacity-80">({rombelGroups.length} Kelas)</span>
          </button>

          {isAdmin && (
            <button
              type="button"
              onClick={() => setPerspective("GURU")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                perspective === "GURU"
                  ? "bg-[#2563EB] text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <GraduationCap className="h-3.5 w-3.5" />
              <span>Per Guru Pengampu</span>
              <span className="text-[10px] opacity-80">({guruGroups.length} Guru)</span>
            </button>
          )}
        </div>

        {/* Toggle Tampilan (Hanya relevan di mode Semua Penugasan) */}
        {perspective === "ALL" && (
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 self-end md:self-auto shrink-0">
            <button
              type="button"
              onClick={() => setViewMode("GRID")}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === "GRID"
                  ? "bg-white dark:bg-slate-900 text-[#2563EB] dark:text-blue-400 shadow-2xs"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
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
                  ? "bg-white dark:bg-slate-900 text-[#2563EB] dark:text-blue-400 shadow-2xs"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
              title="Tampilan Tabel Ringkas"
            >
              <Table2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Tabel Ringkas</span>
            </button>
          </div>
        )}
      </div>

      {/* 3. Toolbar Filter & Pencarian Terpadu & Aksi Cepat */}
      <div className="p-3.5 sm:p-4 rounded-[24px] bg-white dark:bg-slate-900/75 dark:backdrop-blur-xl border border-slate-200/80 dark:border-blue-500/20 shadow-2xs dark:shadow-[0_0_25px_-5px_rgba(37,99,235,0.16)] flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Kolom Pencarian & Filter */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          <div className="relative w-full sm:w-72 md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder={
                isAdmin ? "Cari rombel, mapel, kode, guru..." : "Cari rombel atau mapel..."
              }
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs font-medium text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB] transition-all"
            />
          </div>

          {/* Filter Guru (Admin) */}
          {isAdmin && (
            <div className="relative min-w-[180px]">
              <select
                value={selectedGuruId}
                onChange={(e) => {
                  setSelectedGuruId(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs font-bold text-slate-800 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB] transition-all cursor-pointer"
              >
                <option value="ALL">Semua Guru ({teachersList.length})</option>
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
            <div className="relative min-w-[140px]">
              <select
                value={selectedRombelFilter}
                onChange={(e) => {
                  setSelectedRombelFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs font-bold text-slate-800 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB] transition-all cursor-pointer"
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

          {/* Reset Filter */}
          {(selectedGuruId !== "ALL" ||
            selectedTingkat !== "ALL" ||
            selectedRombelFilter !== "ALL" ||
            search) && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>

        {/* Action Buttons: + Tambah Kelas Manual & + Foto Absen AI */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleOpenManualClass}
            className="px-3.5 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-mono text-xs font-bold shadow-xs shadow-blue-500/20 flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
          >
            <PlusCircle className="h-4 w-4" />
            <span>+ Tambah Kelas Manual</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAiPhoto}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-blue-500/20 font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
            title="Scan Foto Absensi dengan AI"
          >
            <Camera className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span>+ Foto Absen AI</span>
          </button>
        </div>
      </div>

      {/* Filter Chips Tingkat (Hanya muncul bila ada >1 tingkat) */}
      {uniqueTingkats.length > 1 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <span className="text-xs font-bold text-slate-400 dark:text-slate-500 mr-1 flex items-center gap-1">
            <Filter className="h-3 w-3" />
            <span>Tingkat:</span>
          </span>

          <button
            type="button"
            onClick={() => {
              setSelectedTingkat("ALL");
              setCurrentPage(1);
            }}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
              selectedTingkat === "ALL"
                ? "bg-[#2563EB] text-white shadow-2xs"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            Semua Tingkat
          </button>

          {uniqueTingkats.map((tk) => (
            <button
              key={tk}
              type="button"
              onClick={() => {
                setSelectedTingkat(tk);
                setCurrentPage(1);
              }}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                selectedTingkat === tk
                  ? "bg-[#2563EB] text-white shadow-2xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {tk}
            </button>
          ))}
        </div>
      )}

      {/* 4. Konten Utama Sesuai Perspektif */}

      {/* A. PERSPEKTIF: PER ROMBEL */}
      {perspective === "ROMBEL" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rombelGroups.map((rg) => (
            <div
              key={rg.rombel_id}
              className="group relative rounded-[24px] bg-white dark:bg-slate-900/75 dark:backdrop-blur-xl border border-slate-200/80 dark:border-blue-500/20 p-4 sm:p-5 shadow-xs dark:shadow-[0_0_25px_-5px_rgba(37,99,235,0.16)] hover:shadow-md hover:border-blue-300 dark:hover:border-blue-500/40 transition-all duration-200 flex flex-col justify-between overflow-hidden"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight group-hover:text-[#2563EB] dark:group-hover:text-blue-400 transition-colors">
                    {rg.rombel_nama}
                  </h3>
                  {rg.tingkat_nama && (
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold">
                      {rg.tingkat_nama}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 p-2 rounded-xl bg-slate-50/70 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 text-center">
                  <div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-400 block font-semibold">
                      Mapel
                    </span>
                    <span className="text-sm font-black text-slate-800 dark:text-white">
                      {rg.classes.length}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-400 block font-semibold">
                      Beban
                    </span>
                    <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                      {rg.total_jp} JP
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-400 block font-semibold">
                      Siswa
                    </span>
                    <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                      {rg.total_siswa}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 dark:text-slate-400 block">
                    Daftar Mata Pelajaran:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {rg.classes.slice(0, 4).map((c) => (
                      <span
                        key={c.id}
                        className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-medium border border-slate-200/60 dark:border-slate-700/60"
                      >
                        {c.mata_pelajaran_nama}
                      </span>
                    ))}
                    {rg.classes.length > 4 && (
                      <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-400 text-[11px] font-bold">
                        +{rg.classes.length - 4} lainnya
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => handleSelectRombel(rg.rombel_id)}
                  className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-[#2563EB] dark:bg-blue-950/60 dark:hover:bg-blue-600 text-[#2563EB] hover:text-white dark:text-blue-400 font-bold text-xs transition-all duration-200 flex items-center gap-1.5 cursor-pointer shadow-2xs"
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
              className="group relative rounded-[24px] bg-white dark:bg-slate-900/75 dark:backdrop-blur-xl border border-slate-200/80 dark:border-blue-500/20 p-4 sm:p-5 shadow-xs dark:shadow-[0_0_25px_-5px_rgba(37,99,235,0.16)] hover:shadow-md hover:border-blue-300 dark:hover:border-blue-500/40 transition-all duration-200 flex flex-col justify-between overflow-hidden"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-400 shrink-0">
                    <GraduationCap className="h-4 w-4" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight group-hover:text-[#2563EB] dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                    {gg.guru_nama}
                  </h3>
                </div>

                <div className="grid grid-cols-3 gap-2 p-2 rounded-xl bg-slate-50/70 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 text-center">
                  <div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-400 block font-semibold">
                      Penugasan
                    </span>
                    <span className="text-sm font-black text-slate-800 dark:text-white">
                      {gg.classes.length}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-400 block font-semibold">
                      Beban
                    </span>
                    <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                      {gg.total_jp} JP
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-400 block font-semibold">
                      Rombel
                    </span>
                    <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                      {gg.rombel_count}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => handleSelectGuru(gg.guru_id)}
                  className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-[#2563EB] dark:bg-blue-950/60 dark:hover:bg-blue-600 text-[#2563EB] hover:text-white dark:text-blue-400 font-bold text-xs transition-all duration-200 flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <span>Buka Kelas Guru ({gg.classes.length})</span>
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
            <div className="p-10 text-center rounded-[28px] bg-white dark:bg-slate-900/75 dark:backdrop-blur-xl border border-slate-200/80 dark:border-blue-500/20 shadow-xs dark:shadow-[0_0_30px_-5px_rgba(37,99,235,0.16)] space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/50 flex items-center justify-center text-[#2563EB] dark:text-blue-400 mx-auto shadow-2xs">
                <BookOpen className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {classes.length === 0
                    ? "Belum Ada Kelas yang Diampu"
                    : "Tidak Ada Kelas yang Ditemukan"}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                  {classes.length === 0
                    ? "Mulai dengan menambahkan rombel pertama Anda. Anda dapat mengunggah foto lembar absensi kertas untuk diekstrak AI otomatis, atau mengisi manual."
                    : search
                      ? `Tidak ada kelas yang cocok dengan kata kunci '${search}'.`
                      : "Belum ada penugasan kelas yang cocok dengan filter yang dipilih."}
                </p>
              </div>

              <div className="flex items-center justify-center gap-2.5 pt-2 flex-wrap">
                {classes.length === 0 ? (
                  <>
                    <button
                      type="button"
                      onClick={handleOpenManualClass}
                      className="px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-mono text-xs font-bold shadow-xs shadow-blue-500/20 flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                    >
                      <PlusCircle className="h-4 w-4" />
                      <span>+ Tambah Kelas Manual</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleOpenAiPhoto}
                      className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white border border-slate-200/80 dark:border-blue-500/20 font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                    >
                      <Camera className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span>+ Foto Absen AI</span>
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-400 border border-blue-200 dark:border-blue-900/50 text-xs font-bold hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-all cursor-pointer"
                  >
                    Reset Semua Filter
                  </button>
                )}
              </div>
            </div>
          ) : viewMode === "GRID" ? (
            /* Mode 1: GRID KARTU (Dibatasi per Halaman) */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {pagedClasses.map((c) => (
                <div
                  key={c.id}
                  className="group relative rounded-[24px] bg-white dark:bg-slate-900/75 dark:backdrop-blur-xl border border-slate-200/80 dark:border-blue-500/20 shadow-xs dark:shadow-[0_0_25px_-5px_rgba(37,99,235,0.16)] hover:shadow-md hover:border-blue-300 dark:hover:border-blue-500/40 transition-all duration-200 flex flex-col justify-between overflow-hidden"
                >
                  <div className="p-4 sm:p-5 space-y-3 sm:space-y-3.5">
                    {/* Header Kartu: Kode Mapel + Tingkat + Badge JP */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <span className="px-2 sm:px-2.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-900/50 text-[#2563EB] dark:text-blue-400 font-black text-xs">
                          {c.mata_pelajaran_kode}
                        </span>
                        {c.tingkat_nama && (
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-[11px]">
                            {c.tingkat_nama}
                          </span>
                        )}
                        <span className="text-[11px] font-medium text-slate-400">
                          {c.tahun_ajaran_nama}
                        </span>
                      </div>

                      <span className="px-2 sm:px-2.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs font-bold">
                        {c.jumlah_jam_minggu} JP / mgg
                      </span>
                    </div>

                    {/* Info Utama: NAMA KELAS SEBAGAI JUDUL UTAMA + Mapel sebagai Subtitle Terbaca */}
                    <div className="space-y-1">
                      <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight group-hover:text-[#2563EB] dark:group-hover:text-blue-400 transition-colors leading-tight">
                        {c.rombel_nama}
                      </h3>
                      <p
                        className="text-xs sm:text-[13px] font-semibold text-slate-600 dark:text-slate-300 line-clamp-1"
                        title={c.mata_pelajaran_nama}
                      >
                        {c.mata_pelajaran_nama}
                      </p>
                    </div>

                    {/* Info Guru Pengampu — Hanya Ditampilkan Saat Supervisi Admin */}
                    {isAdmin && (
                      <div className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 text-xs">
                        <GraduationCap className="h-3.5 w-3.5 text-[#2563EB] dark:text-blue-400 shrink-0" />
                        <span className="text-slate-600 dark:text-slate-300 truncate">
                          Guru:{" "}
                          <strong className="text-slate-800 dark:text-white font-bold">
                            {c.guru_nama}
                          </strong>
                        </span>
                      </div>
                    )}

                    {/* Ringkasan Konten Kelas (BAB, Materi, Tugas, Jurnal) */}
                    <div className="grid grid-cols-4 gap-1 sm:gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
                      <div className="p-1.5 sm:p-2 rounded-xl bg-slate-50/70 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
                        <span className="text-[10px] text-slate-400 dark:text-slate-400 block font-semibold">
                          BAB
                        </span>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                          {c.total_bab}
                        </span>
                      </div>
                      <div className="p-1.5 sm:p-2 rounded-xl bg-slate-50/70 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
                        <span className="text-[10px] text-slate-400 dark:text-slate-400 block font-semibold">
                          Materi
                        </span>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                          {c.total_materi}
                        </span>
                      </div>
                      <div className="p-1.5 sm:p-2 rounded-xl bg-slate-50/70 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
                        <span className="text-[10px] text-slate-400 dark:text-slate-400 block font-semibold">
                          Tugas
                        </span>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                          {c.total_tugas}
                        </span>
                      </div>
                      <div className="p-1.5 sm:p-2 rounded-xl bg-slate-50/70 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
                        <span className="text-[10px] text-slate-400 dark:text-slate-400 block font-semibold">
                          Jurnal
                        </span>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                          {c.total_jurnal}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Footer Aksi — Ringkas, Elegan, dan Selalu 1 Baris Sejajar */}
                  <div className="px-4 py-2.5 sm:px-5 sm:py-3.5 bg-slate-50/70 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 shrink-0">
                      <Users className="h-3.5 w-3.5 text-slate-400" />
                      <span>{c.total_siswa} Siswa</span>
                    </span>

                    <Link
                      href={`/kelas-saya/${c.id}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs shadow-2xs transition-all duration-200 cursor-pointer"
                    >
                      <span>Buka Workspace</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Mode 2: TABEL RINGKAS (COMPACT DATA TABLE) */
            <div className="overflow-hidden rounded-[24px] bg-white dark:bg-slate-900/75 dark:backdrop-blur-xl border border-slate-200/80 dark:border-blue-500/20 shadow-xs dark:shadow-[0_0_25px_-5px_rgba(37,99,235,0.16)]">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/90 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold tracking-wider uppercase text-[11px]">
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
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
                    {pagedClasses.map((c, index) => (
                      <tr
                        key={c.id}
                        className="hover:bg-blue-50/40 dark:hover:bg-blue-950/30 transition-colors"
                      >
                        <td className="py-3 px-4 text-center text-slate-400 font-mono">
                          {startIndex + index + 1}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-extrabold text-xs">
                            {c.rombel_nama}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 dark:text-white leading-tight">
                            {c.mata_pelajaran_nama}
                          </div>
                          <span className="text-[11px] text-[#2563EB] dark:text-blue-400 font-bold">
                            {c.mata_pelajaran_kode}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-800 dark:text-white">
                            {c.guru_nama}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold text-xs">
                            {c.jumlah_jam_minggu} JP
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 px-2.5 py-1 rounded-lg border border-slate-100 dark:border-slate-700/60">
                            <span>{c.total_bab} BAB</span>
                            <span className="text-slate-300 dark:text-slate-600">•</span>
                            <span>{c.total_materi} Mat</span>
                            <span className="text-slate-300 dark:text-slate-600">•</span>
                            <span>{c.total_tugas} Tug</span>
                            <span className="text-slate-300 dark:text-slate-600">•</span>
                            <span>{c.total_jurnal} Jur</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                            {c.total_siswa}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Link
                            href={`/kelas-saya/${c.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
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
            <div className="p-4 rounded-[20px] bg-white dark:bg-slate-900/75 dark:backdrop-blur-xl border border-slate-200/80 dark:border-blue-500/20 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="text-slate-500 dark:text-slate-400 font-semibold">
                Menampilkan{" "}
                <strong className="text-slate-800 dark:text-white">{startIndex + 1}</strong> –{" "}
                <strong className="text-slate-800 dark:text-white">
                  {Math.min(startIndex + pageSize, filtered.length)}
                </strong>{" "}
                dari <strong className="text-slate-800 dark:text-white">{filtered.length}</strong>{" "}
                kelas
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
                    className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-200 cursor-pointer"
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
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                    title="Halaman Sebelumnya"
                  >
                    <ChevronLeft className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                  </button>

                  <span className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-400 font-bold">
                    {safeCurrentPage} / {totalPages}
                  </span>

                  <button
                    type="button"
                    disabled={safeCurrentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                    title="Halaman Berikutnya"
                  >
                    <ChevronRight className="h-4 w-4 text-slate-600 dark:text-slate-300" />
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

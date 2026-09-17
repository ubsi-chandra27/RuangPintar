"use client";

/**
 * Ruang Pintar — Daily Teacher Cockpit (TeacherTodaySchedule)
 *
 * Desain Jordan-Inspired Cockpit:
 * - Card Utama (Kiri): Sesi Kelas Aktif yang ramping dan minimalis, berganti otomatis
 *   setiap pergantian jam. Di kanan atas ada icon elipsis titik 3 (...) yang jika diklik
 *   membuka menu aksi: Buka Sesi (KBM), Presensi / Absensi, Workspace Kelas.
 * - 3 Card Samping (Kanan): Sesi-sesi lainnya hari ini, murni tanpa elipsis atau icon door.
 */

import React, { useState, useEffect, useRef, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar,
  MoreHorizontal,
  PlayCircle,
  Users,
  BookOpen,
  ArrowRight,
  Sparkles,
  Clock,
  GraduationCap,
} from "lucide-react";
import { MergedScheduleBlock } from "@/modules/schedule/domain/schedule-merger";
import { ClassSessionDTO, ScheduleEntryDTO } from "@/modules/schedule/domain/schedule-types";
import { openClassSessionAction } from "@/app/actions/class-session-actions";
import { Toast, ToastType } from "@/shared/components/ui/toast";

export interface TeacherTodayScheduleProps {
  mergedBlocks: MergedScheduleBlock[];
  actualSessions: ClassSessionDTO[];
  todayHari: string;
  totalJamHariIni: number;
  currentTimeOverride?: string;
  currentDateOverride?: string;
}

export function TeacherTodaySchedule({
  mergedBlocks,
  actualSessions,
  todayHari,
  totalJamHariIni,
  currentTimeOverride,
  currentDateOverride,
}: TeacherTodayScheduleProps) {
  const router = useRouter();
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [currentTimeStr, setCurrentTimeStr] = useState<string>(currentTimeOverride || "");
  const [formattedDateStr, setFormattedDateStr] = useState<string>(currentDateOverride || "");
  const [formattedTimeStr, setFormattedTimeStr] = useState<string>(
    currentTimeOverride ? `${currentTimeOverride} WIB` : ""
  );

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (currentTimeOverride && currentDateOverride) return;

    const updateDateTime = () => {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, "0");
      const mm = String(now.getMinutes()).padStart(2, "0");
      if (!currentTimeOverride) {
        setCurrentTimeStr(`${hh}:${mm}`);
        setFormattedTimeStr(`${hh}:${mm} WIB`);
      }
      if (!currentDateOverride) {
        setFormattedDateStr(
          now.toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        );
      }
    };

    updateDateTime();
    const timer = setInterval(updateDateTime, 10000);
    return () => clearInterval(timer);
  }, [currentTimeOverride, currentDateOverride]);

  // Logika Pergantian Jam Otomatis:
  // 1. Cari sesi yang sedang berlangsung saat ini
  let activeIndex = 0;
  if (currentTimeStr && mergedBlocks.length > 0) {
    const ongoingIdx = mergedBlocks.findIndex(
      (b) => currentTimeStr >= b.jam_mulai && currentTimeStr <= b.jam_selesai
    );
    if (ongoingIdx !== -1) {
      activeIndex = ongoingIdx;
    } else {
      const upcomingIdx = mergedBlocks.findIndex((b) => currentTimeStr < b.jam_mulai);
      if (upcomingIdx !== -1) {
        activeIndex = upcomingIdx;
      } else {
        // Jika semua sesi telah lewat hari ini, tetap tampilkan sesi pertama atau terakhir
        activeIndex = 0;
      }
    }
  }

  const activeBlock = mergedBlocks[activeIndex];
  const companionBlocks = mergedBlocks.filter((_, idx) => idx !== activeIndex);

  const getActualSessionForBlock = (block: MergedScheduleBlock) => {
    return actualSessions.find(
      (s) =>
        s.penugasan_mengajar_id === block.penugasan_mengajar_id ||
        (s.jadwal_pelajaran_id && block.entries.some((e) => e.id === s.jadwal_pelajaran_id))
    );
  };

  const handleOpenSession = (entry: ScheduleEntryDTO) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("jadwal_pelajaran_id", entry.id);
      formData.set("penugasan_mengajar_id", entry.penugasan_mengajar_id);
      formData.set("rombel_id", entry.rombel_id);
      formData.set("mata_pelajaran_id", entry.mata_pelajaran_id);
      formData.set("guru_id", entry.guru_id);
      formData.set("tahun_ajaran_id", entry.tahun_ajaran_id);
      if (entry.semester_id) formData.set("semester_id", entry.semester_id);
      if (entry.ruangan) formData.set("ruangan_aktual", entry.ruangan);

      const res = await openClassSessionAction(null, formData);
      if (res.success) {
        setToast({ message: res.message, type: "success" });
        router.push("/sesi-pembelajaran");
      } else {
        setToast({ message: res.message, type: "error" });
      }
    });
  };

  const displayDate = formattedDateStr || `Hari ${todayHari}`;
  const displayTime = formattedTimeStr || (currentTimeStr ? `${currentTimeStr} WIB` : "");

  const isOngoing = Boolean(
    activeBlock &&
    currentTimeStr &&
    currentTimeStr >= activeBlock.jam_mulai &&
    currentTimeStr <= activeBlock.jam_selesai
  );

  const formatSlotLabel = (entry: ScheduleEntryDTO, idx: number) => {
    if (entry.slot_waktu_nama) {
      const trimmed = entry.slot_waktu_nama.trim();
      if (trimmed.toUpperCase().includes(`(${todayHari.toUpperCase()})`)) {
        return trimmed.toUpperCase();
      }
      return `${trimmed.toUpperCase()} (${todayHari.toUpperCase()})`;
    }
    const jamKe = entry.slot_waktu_urutan
      ? entry.slot_waktu_urutan > 100
        ? entry.slot_waktu_urutan % 100
        : entry.slot_waktu_urutan
      : idx + 1;
    return `JAM KE-${jamKe} (${todayHari.toUpperCase()})`;
  };

  return (
    <div className="space-y-3">
      {/* Toast Notifikasi */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
          duration={4000}
        />
      )}

      {/* Header Widget: Jadwal Hari Ini • Tanggal */}
      <div className="flex items-center justify-between gap-2 pb-1">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 rounded-lg bg-blue-50 text-[#2563EB] shrink-0">
            <Calendar className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h2 className="text-xs sm:text-sm font-black text-[#0F172A] tracking-tight">
                Jadwal Hari Ini
              </h2>
              <span className="text-slate-300 font-normal hidden sm:inline">•</span>
              <span className="text-[11px] text-slate-500 font-semibold hidden sm:inline">
                {displayDate}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium sm:hidden truncate">
              {displayDate}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {mergedBlocks.length > 0 && (
            <span className="px-2 py-0.5 rounded-md bg-blue-50 text-[#2563EB] text-[11px] font-bold border border-blue-100">
              {mergedBlocks.length} Sesi ({totalJamHariIni} JP)
            </span>
          )}
          <Link
            href="/jadwal-saya"
            className="text-xs font-semibold text-slate-500 hover:text-[#2563EB] p-1 rounded-md hover:bg-slate-50 transition-colors flex items-center gap-1"
            title="Lihat Jadwal Mingguan Lengkap"
          >
            <span className="hidden sm:inline">Jadwal Mingguan</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* State Jika Tidak Ada Jadwal Mengajar */}
      {mergedBlocks.length === 0 ? (
        <div className="py-8 px-4 rounded-2xl bg-white border border-dashed border-slate-200 text-center text-slate-400 space-y-1">
          <Calendar className="h-6 w-6 text-slate-300 mx-auto mb-1" />
          <p className="text-xs font-bold text-slate-600">
            Tidak Ada Jadwal Mengajar Hari Ini ({todayHari})
          </p>
          <p className="text-[11px] text-slate-400">
            Gunakan waktu luang untuk evaluasi tugas murid, persiapan materi, atau bimbingan kelas.
          </p>
        </div>
      ) : (
        /* The Jordan-Style 4-Card Cockpit (Card Utama Hero + 3 Card Pendamping Horisontal Sejajar) */
        <div className="flex flex-col lg:flex-row gap-3.5 items-stretch">
          {/* 1. CARD UTAMA (KIRI): Sesi Kelas Aktif (Hero Cockpit: Diperbesar Proporsional, Tegas & Profesional) */}
          <div className="relative overflow-hidden w-full sm:w-[340px] lg:w-[360px] shrink-0 rounded-2xl bg-white border border-slate-200/80 p-5 shadow-xs transition-all hover:border-slate-300 flex flex-col justify-between">
            {/* Watermark / Ghost Ambient Silhouette Icon di Latar Belakang Kanan */}
            <div className="pointer-events-none absolute -right-3 -top-2 select-none opacity-[0.06] text-slate-800 transition-opacity">
              <GraduationCap className="h-32 w-32 -rotate-12" />
            </div>

            {/* Header Card Utama: Rombel Besar & Titik 3 Elipsis */}
            <div className="relative z-10 flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                {/* XII RPL: Font BOLD dan BESAR UTAMA (Hero Size) */}
                <h2 className="text-3xl sm:text-[32px] font-black text-[#0B1527] tracking-tight leading-none">
                  {activeBlock.rombel_nama}
                </h2>
                {/* Nama Mapel: Tidak bold, abu-abu (slate-500), ukuran proporsional (text-sm) */}
                <p className="text-xs sm:text-sm font-normal text-slate-500 mt-1.5 leading-tight truncate">
                  {activeBlock.mata_pelajaran_nama}
                  {activeBlock.ruangan ? (
                    <span className="text-slate-400 text-xs"> • {activeBlock.ruangan}</span>
                  ) : null}
                </p>
              </div>

              {/* Titik 3 Elipsis (Action Menu) */}
              <div className="relative shrink-0 -mr-1.5 -mt-1" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Pilihan Aksi Sesi Ini"
                  aria-label="Menu Aksi Sesi"
                >
                  <MoreHorizontal className="h-5 w-5" />
                </button>

                {/* Dropdown Popover */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-1.5 w-52 rounded-xl bg-white border border-slate-200/90 shadow-xl py-1.5 z-30 animate-in fade-in zoom-in-95 duration-150">
                    <button
                      type="button"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        handleOpenSession(activeBlock.primary_entry);
                      }}
                      disabled={isPending}
                      className="w-full px-3.5 py-2 text-left text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-[#2563EB] flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <PlayCircle className="h-4 w-4 text-[#2563EB]" />
                      <span>Buka Sesi (KBM)</span>
                    </button>

                    <Link
                      href="/sesi-pembelajaran"
                      onClick={() => setIsDropdownOpen(false)}
                      className="w-full px-3.5 py-2 text-left text-xs font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-2 transition-colors"
                    >
                      <Users className="h-4 w-4 text-emerald-600" />
                      <span>Presensi / Absensi</span>
                    </Link>

                    <Link
                      href={`/kelas-saya/${activeBlock.penugasan_mengajar_id}`}
                      onClick={() => setIsDropdownOpen(false)}
                      className="w-full px-3.5 py-2 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2 transition-colors border-t border-slate-100 mt-1 pt-1.5"
                    >
                      <BookOpen className="h-4 w-4 text-slate-400" />
                      <span>Workspace Kelas</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Garis Pemisah (Divider Halus) */}
            <div className="my-3.5 border-t border-slate-200/60" />

            {/* Rincian Jam Pelajaran (Sub-kolom Diperbesar Proporsional & Jelas) */}
            <div className="flex items-start gap-6 sm:gap-7">
              {activeBlock.entries.slice(0, 2).map((entry, idx) => (
                <div key={entry.id || idx} className="min-w-0">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block leading-none">
                    {formatSlotLabel(entry, idx)}
                  </span>
                  <span className="text-sm sm:text-base font-black text-[#0B1527] font-mono block mt-1.5 leading-none">
                    {entry.slot_waktu_jam_mulai}–{entry.slot_waktu_jam_selesai}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 2. CARD PENDAMPING (KANAN): Grid Horisontal yang Ramping, Sejajar Rata & Menyesuaikan Jumlah Sesi */}
          <div
            className={`grid grid-cols-1 sm:grid-cols-2 ${
              companionBlocks.length >= 3
                ? "lg:grid-cols-3"
                : companionBlocks.length === 2
                  ? "lg:grid-cols-2"
                  : "lg:grid-cols-1 max-w-md"
            } gap-3 flex-1 min-w-0`}
          >
            {companionBlocks.length === 0 ? (
              <div className="col-span-full h-full py-8 px-4 rounded-2xl bg-white border border-dashed border-slate-200 flex flex-col items-center justify-center text-center text-slate-400">
                <Sparkles className="h-5 w-5 text-slate-300 mb-1" />
                <p className="text-xs font-bold text-slate-600">Satu-Satunya Sesi Hari Ini</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Tidak ada sesi mengajar lain yang terjadwal untuk hari ini.
                </p>
              </div>
            ) : (
              companionBlocks.slice(0, 3).map((block) => (
                <div
                  key={block.key}
                  className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/80 p-4 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Header Card Pendamping: Rombel & Badge Waktu */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <h4 className="text-base font-black text-[#0B1527] tracking-tight leading-none truncate">
                          {block.rombel_nama}
                        </h4>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 leading-none shrink-0">
                          {block.total_jp} JP
                        </span>
                      </div>

                      {/* Badge Waktu Bersih */}
                      <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-blue-50 text-[#2563EB] text-xs font-bold border border-blue-100/80 font-mono tracking-tight shrink-0">
                        {block.jam_mulai}–{block.jam_selesai}
                      </span>
                    </div>

                    {/* Mapel Abu-abu Lembut di Bawahnya */}
                    <p
                      className="text-xs font-normal text-slate-500 mt-1.5 leading-tight line-clamp-1"
                      title={block.mata_pelajaran_nama}
                    >
                      {block.mata_pelajaran_nama}
                    </p>
                  </div>

                  {/* Divider Halus */}
                  <div className="my-2.5 border-t border-slate-100" />

                  {/* Footer: Detail Slot & Ruangan */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 gap-2">
                    <span className="font-medium truncate">
                      {block.entries.length > 1
                        ? `${block.entries[0]?.slot_waktu_nama || `Jam Ke-${block.entries[0]?.slot_waktu_urutan > 100 ? block.entries[0]?.slot_waktu_urutan % 100 : block.entries[0]?.slot_waktu_urutan}`} s/d ${block.entries[block.entries.length - 1]?.slot_waktu_nama || `Jam Ke-${block.entries[block.entries.length - 1]?.slot_waktu_urutan > 100 ? block.entries[block.entries.length - 1]?.slot_waktu_urutan % 100 : block.entries[block.entries.length - 1]?.slot_waktu_urutan}`}`
                        : block.entries[0]?.slot_waktu_nama ||
                          `Jam Ke-${block.entries[0]?.slot_waktu_urutan > 100 ? block.entries[0]?.slot_waktu_urutan % 100 : block.entries[0]?.slot_waktu_urutan}`}
                    </span>
                    {block.ruangan && (
                      <span className="font-semibold text-slate-500 shrink-0 truncate max-w-[120px]">
                        {block.ruangan}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

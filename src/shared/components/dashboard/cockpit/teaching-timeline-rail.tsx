"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Calendar as CalendarIcon,
  Clock,
  PlayCircle,
  CheckCircle2,
  ChevronRight,
  MoreVertical,
  BookOpen,
  Bell,
  Sparkles,
} from "lucide-react";
import { MergedScheduleBlock } from "@/modules/schedule/domain/schedule-merger";
import { ClassSessionDTO } from "@/modules/schedule/domain/schedule-types";
import { AnnouncementItem } from "@/modules/communication/domain/communication-types";

interface TeachingTimelineRailProps {
  mergedBlocks: MergedScheduleBlock[];
  actualSessions: ClassSessionDTO[];
  announcements?: AnnouncementItem[];
}

export function TeachingTimelineRail({
  mergedBlocks,
  actualSessions,
  announcements = [],
}: TeachingTimelineRailProps) {
  // Hitung status sesi aktif
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const parseTimeToMinutes = (timeStr: string) => {
    const [h, m] = timeStr.split(":").map(Number);
    return (h || 0) * 60 + (m || 0);
  };

  const blocksWithStatus = mergedBlocks.map((block) => {
    const startM = parseTimeToMinutes(block.jam_mulai);
    const endM = parseTimeToMinutes(block.jam_selesai);
    const isCurrent = currentMinutes >= startM && currentMinutes <= endM;
    const isPast = currentMinutes > endM;
    const isFuture = currentMinutes < startM;

    // Cek sesi aktual
    const actual = actualSessions.find(
      (s) => s.rombel_id === block.rombel_id && s.mata_pelajaran_id === block.mata_pelajaran_id
    );

    return {
      ...block,
      isCurrent,
      isPast,
      isFuture,
      actualSessionId: actual?.id,
      actualStatus: actual?.status || (isPast ? "SELESAI" : "TERJADWAL"),
    };
  });

  // Urutkan sesi aktif pertama, lalu yang mendatang
  const activeBlock = blocksWithStatus.find((b) => b.isCurrent) || blocksWithStatus[0];
  const otherBlocks = blocksWithStatus.filter((b) => b !== activeBlock);

  return (
    <div className="space-y-6 sm:space-y-7">
      {/* 1. Card Linimasa Jadwal Mengajar Hari Ini */}
      <div className="rounded-[28px] bg-white dark:bg-slate-900/75 dark:backdrop-blur-xl border border-slate-200/80 dark:border-blue-500/20 p-6 shadow-xs dark:shadow-[0_0_30px_-5px_rgba(37,99,235,0.16)] space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-mono text-sm sm:text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
              Jadwal Mengajar
            </h3>
            <span className="text-[11px] text-slate-400 dark:text-slate-500">
              {mergedBlocks.length > 0
                ? `${mergedBlocks.length} sesi mengajar hari ini`
                : "Tidak ada jadwal hari ini"}
            </span>
          </div>

          <span className="font-mono text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            Hari Ini
          </span>
        </div>

        {/* Timeline Items */}
        {mergedBlocks.length === 0 ? (
          <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50/50 via-slate-50 to-indigo-50/30 dark:from-blue-950/40 dark:via-slate-900/70 dark:to-blue-900/30 border border-dashed border-blue-200/80 dark:border-blue-500/30 text-center space-y-2">
            <CalendarIcon className="h-8 w-8 text-blue-500/70 dark:text-blue-400 mx-auto" />
            <h4 className="font-mono text-xs font-bold text-slate-800 dark:text-white">
              Tidak Ada Jadwal Mengajar Hari Ini
            </h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
              Manfaatkan waktu luang untuk menyusun modul ajar, asesmen formatif, atau evaluasi
              jurnal KBM.
            </p>
          </div>
        ) : (
          <div className="space-y-3 relative pl-4 border-l-2 border-dashed border-blue-200 dark:border-slate-700">
            {/* Sesi Utama / Aktif (Tampilan Bold Solid Blue seperti pada Mockup) */}
            {activeBlock && (
              <div className="relative group">
                {/* Timeline Dot Indicator */}
                <div className="absolute -left-[23px] top-4 h-3.5 w-3.5 rounded-full bg-blue-600 ring-4 ring-white dark:ring-slate-900 shadow-sm" />

                <div className="p-4 rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] text-white shadow-lg shadow-blue-500/20 dark:shadow-[0_0_25px_rgba(37,99,235,0.35)] space-y-3 transition-transform hover:-translate-y-0.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-blue-200 block">
                        {activeBlock.isCurrent ? "Sedang Berlangsung" : "Sesi Berikutnya"}
                      </span>
                      <h4 className="text-sm sm:text-base font-extrabold line-clamp-1">
                        {activeBlock.mata_pelajaran_nama}
                      </h4>
                      <p className="text-xs text-blue-100 font-medium">
                        Kelas {activeBlock.rombel_nama} • {activeBlock.ruangan || "Ruang Kelas"}
                      </p>
                    </div>

                    <div className="p-2 rounded-xl bg-white/15 backdrop-blur-md shrink-0">
                      <BookOpen className="h-4 w-4 text-white" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/20 text-xs">
                    <div className="flex items-center gap-1.5 text-blue-100 font-mono font-semibold">
                      <Clock className="h-3.5 w-3.5" />
                      <span>
                        {activeBlock.jam_mulai} - {activeBlock.jam_selesai}
                      </span>
                    </div>

                    <Link
                      href={
                        activeBlock.actualSessionId
                          ? `/sesi-pembelajaran/${activeBlock.actualSessionId}`
                          : `/presensi-kelas`
                      }
                      className="px-3.5 py-1.5 rounded-full bg-white hover:bg-blue-50 text-[#2563EB] font-mono font-extrabold text-[11px] shadow-xs transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                    >
                      <PlayCircle className="h-3.5 w-3.5" />
                      <span>{activeBlock.actualSessionId ? "Buka Sesi" : "Mulai Presensi"}</span>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Sesi-sesi Lainnya (Tampilan Soft Neutral Card) */}
            {otherBlocks.map((block) => (
              <div key={block.key} className="relative group">
                <div className="absolute -left-[21px] top-3.5 h-2.5 w-2.5 rounded-full bg-slate-300 dark:bg-slate-600 ring-4 ring-white dark:ring-slate-900" />

                <div className="p-3.5 rounded-2xl bg-slate-50/80 hover:bg-slate-100/90 dark:bg-gradient-to-r dark:from-slate-900/80 dark:to-blue-950/40 dark:hover:to-blue-900/50 border border-slate-200/70 dark:border-blue-500/20 transition-all flex items-center justify-between gap-3 shadow-2xs">
                  <div className="min-w-0">
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {block.mata_pelajaran_nama}
                    </h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Kelas {block.rombel_nama} • {block.ruangan || "Ruang Kelas"}
                    </p>
                  </div>

                  <div className="text-right shrink-0 font-mono">
                    <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block">
                      {block.jam_mulai}
                    </span>
                    <span className="text-[10px] text-slate-400">s/d {block.jam_selesai}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Card Agenda & Pengumuman Sekolah */}
      <div className="rounded-[28px] bg-white dark:bg-slate-900/75 dark:backdrop-blur-xl border border-slate-200/80 dark:border-blue-500/20 p-6 shadow-xs dark:shadow-[0_0_30px_-5px_rgba(37,99,235,0.16)] space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-mono text-sm sm:text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
              Agenda & Pengumuman
            </h3>
            <span className="text-[11px] text-slate-400 dark:text-slate-500">
              Kegiatan akademik dan informasi resmi sekolah
            </span>
          </div>

          <Link
            href="/kalender-akademik"
            className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
          >
            <span>Semua</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Event Items */}
        <div className="space-y-3">
          {/* Event 1: PTS Deadline */}
          <div className="p-3 rounded-2xl bg-slate-50/80 hover:bg-blue-50/50 dark:bg-gradient-to-r dark:from-slate-900/80 dark:to-blue-950/40 dark:hover:to-blue-900/50 border border-slate-200/70 dark:border-blue-500/20 transition-all flex items-center gap-3 shadow-2xs">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold shrink-0 shadow-xs relative overflow-hidden">
              <Sparkles className="h-5 w-5 text-cyan-200" />
            </div>

            <div className="min-w-0 flex-1">
              <h5 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                Batas Penginputan Nilai PTS Gasal
              </h5>
              <p className="font-mono text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                24 Sep 2026 • 23:59 WIB
              </p>
            </div>

            <button
              type="button"
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
              aria-label="Opsi Agenda"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>

          {/* Event 2: Rapat Dinas Guru */}
          <div className="p-3 rounded-2xl bg-slate-50/80 hover:bg-blue-50/50 dark:bg-gradient-to-r dark:from-slate-900/80 dark:to-blue-950/40 dark:hover:to-blue-900/50 border border-slate-200/70 dark:border-blue-500/20 transition-all flex items-center gap-3 shadow-2xs">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
              <CalendarIcon className="h-5 w-5 text-white" />
            </div>

            <div className="min-w-0 flex-1">
              <h5 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                Rapat Koordinasi Evaluasi Kurikulum
              </h5>
              <p className="font-mono text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                28 Sep 2026 • 13:00 WIB
              </p>
            </div>

            <button
              type="button"
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
              aria-label="Opsi Agenda"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>

          {/* Event 3: Pengumuman dari Komunikasi jika ada */}
          {announcements.length > 0 && (
            <div className="p-3 rounded-2xl bg-slate-50/80 hover:bg-blue-50/50 dark:bg-gradient-to-r dark:from-slate-900/80 dark:to-blue-950/40 dark:hover:to-blue-900/50 border border-slate-200/70 dark:border-blue-500/20 transition-all flex items-center gap-3 shadow-2xs">
              <div className="h-11 w-11 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                <Bell className="h-5 w-5 text-white" />
              </div>

              <div className="min-w-0 flex-1">
                <h5 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                  {announcements[0].judul}
                </h5>
                <p className="font-mono text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {new Date(
                    announcements[0].dipublikasikan_pada || announcements[0].created_at
                  ).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>

              <button
                type="button"
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
                aria-label="Opsi Pengumuman"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

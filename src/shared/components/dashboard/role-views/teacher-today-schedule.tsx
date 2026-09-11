"use client";

/**
 * Ruang Pintar — Daily Teacher Cockpit (TeacherTodaySchedule)
 *
 * Versi Ringkas & Kompak (Low-Scroll / Single-Viewport Ready)
 * Menggabungkan jam pelajaran berurutan, mendeteksi sesi aktif real-time,
 * dan menampilkan baris jadwal berdensitas tinggi yang efisien.
 */

import React, { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  MapPin,
  PlayCircle,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  Users,
  Timer,
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
}

export function TeacherTodaySchedule({
  mergedBlocks,
  actualSessions,
  todayHari,
  totalJamHariIni,
}: TeacherTodayScheduleProps) {
  const router = useRouter();
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [isPending, startTransition] = useTransition();
  const [currentTimeStr, setCurrentTimeStr] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, "0");
      const mm = String(now.getMinutes()).padStart(2, "0");
      setCurrentTimeStr(`${hh}:${mm}`);
    };

    updateTime();
    const timer = setInterval(updateTime, 30000);
    return () => clearInterval(timer);
  }, []);

  const activeCurrentBlock = mergedBlocks.find((b) => {
    if (!currentTimeStr) return false;
    return currentTimeStr >= b.jam_mulai && currentTimeStr <= b.jam_selesai;
  });

  const nextUpcomingBlock = mergedBlocks.find((b) => {
    if (!currentTimeStr) return false;
    return currentTimeStr < b.jam_mulai;
  });

  const isAllPassed =
    mergedBlocks.length > 0 &&
    currentTimeStr !== "" &&
    mergedBlocks.every((b) => currentTimeStr > b.jam_selesai);

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

  return (
    <div className="rounded-2xl bg-white border border-slate-200/90 p-4 sm:p-5 shadow-2xs space-y-3.5 flex flex-col justify-between">
      {/* Toast Notifikasi */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
          duration={4000}
        />
      )}

      {/* Header Widget Ringkas */}
      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-50 text-[#2563EB]">
            <Calendar className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-extrabold text-[#0F172A] tracking-tight">
              Jadwal & Agenda Mengajar Hari Ini
            </h2>
            <p className="text-[11px] text-slate-500">
              Hari <strong className="text-slate-700">{todayHari}</strong> • Sesi tatap muka resmi
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-[#2563EB] text-xs font-bold border border-blue-100">
            {mergedBlocks.length} Sesi Terpadu ({totalJamHariIni} JP)
          </span>
          <Link
            href="/jadwal-saya"
            className="text-xs font-bold text-slate-500 hover:text-[#2563EB] p-1.5 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1"
            title="Lihat Jadwal Mingguan Lengkap"
          >
            <span className="hidden sm:inline">Mingguan</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Hero Banner Kompak (Live Now / Next Class) */}
      {mergedBlocks.length > 0 && (
        <div>
          {activeCurrentBlock ? (
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 p-3.5 text-white shadow-sm">
              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="space-y-1 min-w-0">
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-extrabold tracking-wide uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>Sedang Berlangsung Sekarang</span>
                  </div>

                  <div className="truncate">
                    <h3 className="text-sm sm:text-base font-black tracking-tight truncate">
                      {activeCurrentBlock.mata_pelajaran_nama}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-blue-100">
                      <span className="font-bold bg-white/20 px-1.5 py-0.5 rounded">
                        {activeCurrentBlock.rombel_nama}
                      </span>
                      <span>•</span>
                      <span>
                        {activeCurrentBlock.jam_mulai} - {activeCurrentBlock.jam_selesai} (
                        {activeCurrentBlock.total_jp} JP)
                      </span>
                      {activeCurrentBlock.ruangan && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {activeCurrentBlock.ruangan}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenSession(activeCurrentBlock.primary_entry)}
                  disabled={isPending}
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-blue-50 text-blue-700 font-extrabold text-xs shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0 self-start sm:self-center"
                >
                  <PlayCircle className="h-3.5 w-3.5 text-blue-600" />
                  <span>Buka Presensi / KBM</span>
                </button>
              </div>
            </div>
          ) : nextUpcomingBlock ? (
            <div className="rounded-xl bg-blue-50/60 border border-blue-100 p-2.5 sm:p-3 flex items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-1.5 rounded-lg bg-blue-100 text-[#2563EB] shrink-0">
                  <Timer className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase text-[#2563EB] tracking-wider">
                      Sesi Berikutnya
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-100 text-blue-700">
                      {nextUpcomingBlock.jam_mulai} WIB
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-800 truncate">
                    {nextUpcomingBlock.mata_pelajaran_nama} —{" "}
                    <span className="text-[#2563EB]">{nextUpcomingBlock.rombel_nama}</span>
                    {nextUpcomingBlock.ruangan ? ` (${nextUpcomingBlock.ruangan})` : ""}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleOpenSession(nextUpcomingBlock.primary_entry)}
                disabled={isPending}
                className="px-2.5 py-1.5 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs shadow-2xs transition-all cursor-pointer shrink-0"
              >
                <span>Buka Sekarang</span>
              </button>
            </div>
          ) : isAllPassed ? (
            <div className="rounded-xl bg-emerald-50/70 border border-emerald-200/60 p-2.5 flex items-center gap-2 text-emerald-900 text-xs">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Semua Sesi Selesai!</strong> Seluruh {mergedBlocks.length} sesi (
                {totalJamHariIni} JP) hari ini telah tuntas.
              </span>
            </div>
          ) : null}
        </div>
      )}

      {/* Daftar Sesi Hari Ini Berdensitas Tinggi (High-Density List) */}
      {mergedBlocks.length === 0 ? (
        <div className="p-6 rounded-xl bg-slate-50/70 border border-dashed border-slate-200 text-center space-y-2">
          <Calendar className="h-6 w-6 text-slate-300 mx-auto" />
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-700">
              Tidak Ada Jadwal Mengajar Hari {todayHari}
            </h4>
            <p className="text-[11px] text-slate-400">
              Anda tidak memiliki jam tatap muka hari ini.
            </p>
          </div>
          <Link
            href="/jadwal-saya"
            className="inline-flex items-center gap-1 text-xs font-bold text-[#2563EB] hover:underline"
          >
            <span>Lihat Jadwal Mingguan Lengkap</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      ) : (
        <div className="space-y-2 max-h-[360px] overflow-y-auto pr-0.5 scrollbar-thin">
          {mergedBlocks.map((block, idx) => {
            const actual = getActualSessionForBlock(block);
            const isOngoing = actual?.status === "DIMULAI";
            const isFinished = actual?.status === "SELESAI";
            const isCurrentTimeSlot =
              currentTimeStr !== "" &&
              currentTimeStr >= block.jam_mulai &&
              currentTimeStr <= block.jam_selesai;

            return (
              <div
                key={block.key || idx}
                className={`p-2.5 sm:p-3 rounded-xl border transition-all flex items-center justify-between gap-2.5 ${
                  isOngoing || isCurrentTimeSlot
                    ? "bg-blue-50/70 border-blue-200 shadow-2xs"
                    : isFinished
                      ? "bg-slate-50/60 border-slate-100 opacity-80"
                      : "bg-white border-slate-200/70 hover:border-blue-200 hover:bg-slate-50/40"
                }`}
              >
                {/* Waktu + Identitas Kelas */}
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  {/* Slot Jam */}
                  <div
                    className={`px-2 py-1 rounded-lg text-center shrink-0 min-w-[68px] ${
                      isOngoing || isCurrentTimeSlot
                        ? "bg-[#2563EB] text-white shadow-2xs"
                        : "bg-slate-100 text-slate-800"
                    }`}
                  >
                    <span className="text-[11px] font-black block leading-none">
                      {block.jam_mulai}
                    </span>
                    <span
                      className={`text-[9px] font-medium leading-none ${
                        isOngoing || isCurrentTimeSlot ? "text-blue-100" : "text-slate-400"
                      }`}
                    >
                      {block.jam_selesai}
                    </span>
                  </div>

                  {/* Detail Mapel & Rombel */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-blue-100 text-[#2563EB]">
                        {block.mata_pelajaran_kode}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {block.mata_pelajaran_nama}
                      </h4>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                      <span className="font-bold text-slate-700 bg-slate-100 px-1.5 py-0.2 rounded text-[10px]">
                        {block.rombel_nama}
                      </span>
                      <span>•</span>
                      <span>{block.total_jp} JP</span>
                      {block.ruangan && (
                        <>
                          <span>•</span>
                          <span className="text-blue-600 font-medium truncate">
                            {block.ruangan}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status & Tombol Aksi */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {isOngoing ? (
                    <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Sesi Berlangsung</span>
                    </span>
                  ) : isFinished ? (
                    <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold">
                      <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                      <span>Selesai</span>
                    </span>
                  ) : null}

                  {isOngoing ? (
                    <Link
                      href="/sesi-pembelajaran"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs transition-all"
                    >
                      <Users className="h-3 w-3" />
                      <span>Presensi / KBM</span>
                    </Link>
                  ) : isFinished ? (
                    <Link
                      href="/sesi-pembelajaran"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold"
                    >
                      <span>Lihat Riwayat Sesi</span>
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleOpenSession(block.primary_entry)}
                      disabled={isPending}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#2563EB] hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs shadow-2xs transition-all cursor-pointer"
                      title="Buka sesi kelas ini"
                    >
                      <PlayCircle className="h-3 w-3" />
                      <span>Buka Kelas (KBM)</span>
                    </button>
                  )}

                  <Link
                    href={`/kelas-saya/${block.penugasan_mengajar_id}`}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-[#2563EB] hover:bg-blue-50 transition-colors"
                    title="Buka Workspace Kelas"
                  >
                    <BookOpen className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

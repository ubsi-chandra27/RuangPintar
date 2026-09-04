"use client";

/**
 * Ruang Pintar — M12 Class Attendance Tab View (Workspace Kelas Integrated)
 *
 * Menampilkan ringkasan kehadiran rombel pada penugasan mengajar,
 * riwayat sesi KBM, dan tombol aksi pencatatan presensi siswa.
 */

import React from "react";
import {
  Users,
  CheckCircle2,
  Clock,
  Calendar,
  PlayCircle,
  AlertCircle,
  Sparkles,
  ArrowRight,
  UserCheck,
  TrendingUp,
} from "lucide-react";
import { SessionAttendanceHistoryItemDTO } from "../domain/attendance-types";

interface ClassAttendanceTabViewProps {
  canManage: boolean;
  history: SessionAttendanceHistoryItemDTO[];
  stats: {
    total_sesi_terjadwal: number;
    total_sesi_selesai: number;
    total_presensi_diambil: number;
    rata_rata_kehadiran: number;
  };
  onOpenAttendance: (sesiId: string) => void;
  onOpenNewSession?: () => void;
}

export function ClassAttendanceTabView({
  canManage,
  history,
  stats,
  onOpenAttendance,
  onOpenNewSession,
}: ClassAttendanceTabViewProps) {
  const { total_sesi_terjadwal, total_sesi_selesai, total_presensi_diambil, rata_rata_kehadiran } =
    stats;

  return (
    <div className="space-y-6">
      {/* KPI Ringkasan Kehadiran Kelas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Sesi */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Sesi
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-[#2563EB]">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{total_sesi_terjadwal}</div>
            <p className="text-[11px] text-slate-400 mt-0.5">Sesi KBM pada penugasan ini</p>
          </div>
        </div>

        {/* Sesi Diabsen */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Presensi Terekam
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <UserCheck className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-700">{total_presensi_diambil}</div>
            <p className="text-[11px] text-slate-400 mt-0.5">Sesi dengan data absensi siswa</p>
          </div>
        </div>

        {/* Sesi Selesai */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Sesi Selesai
            </span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-700">{total_sesi_selesai}</div>
            <p className="text-[11px] text-slate-400 mt-0.5">Pertemuan yang telah ditutup</p>
          </div>
        </div>

        {/* Rata-Rata Kehadiran */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/80 shadow-2xs space-y-2 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Rata-rata Kehadiran
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-[#2563EB]">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#2563EB]">{rata_rata_kehadiran}%</div>
            <p className="text-[11px] text-slate-400 mt-0.5">Rasio kehadiran seluruh pertemuan</p>
          </div>
        </div>
      </div>

      {/* Action Header */}
      <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Riwayat Presensi Sesi Kelas</h3>
          <p className="text-xs text-slate-500">
            Catatan kehadiran siswa per kejadian sesi kelas aktual
          </p>
        </div>

        {canManage && onOpenNewSession && (
          <button
            type="button"
            onClick={onOpenNewSession}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <PlayCircle className="h-4 w-4" />
            <span>Mulai Sesi Kelas</span>
          </button>
        )}
      </div>

      {/* Session List */}
      {history.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
          <Users className="h-10 w-10 text-slate-300 mx-auto" />
          <h4 className="text-sm font-bold text-slate-700">Belum Ada Sesi Kelas Terbuka</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Mulai sesi pembelajaran baru atau buka sesi dari jadwal hari ini untuk mulai melakukan
            presensi kehadiran siswa.
          </p>
          {canManage && onOpenNewSession && (
            <div className="pt-2">
              <button
                type="button"
                onClick={onOpenNewSession}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2563EB] text-white font-bold text-xs shadow-xs hover:bg-blue-700 transition-all cursor-pointer"
              >
                <PlayCircle className="h-4 w-4" />
                <span>Buka Sesi Kelas Sekarang</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((s) => {
            const formattedDate = new Intl.DateTimeFormat("id-ID", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            }).format(new Date(s.tanggal));

            return (
              <div
                key={s.sesi_id}
                className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                {/* Info Sesi */}
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg bg-blue-50 text-[#2563EB] font-bold text-xs flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formattedDate}
                    </span>

                    <span
                      className={`px-2 py-0.5 rounded-lg text-[11px] font-bold ${
                        s.status_sesi === "DIMULAI"
                          ? "bg-emerald-100 text-emerald-700"
                          : s.status_sesi === "SELESAI"
                            ? "bg-slate-100 text-slate-600"
                            : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {s.status_sesi}
                    </span>

                    {s.ruangan && (
                      <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg">
                        Ruang: {s.ruangan}
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 truncate">
                    {s.topik_pembelajaran || "Pembelajaran Reguler Tatap Muka"}
                  </h4>

                  {/* Statistik Presensi */}
                  {s.sudah_diabsen ? (
                    <div className="flex flex-wrap items-center gap-2 pt-0.5">
                      <span className="px-2 py-0.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-xs">
                        {s.jumlah_hadir} Hadir ({s.persentase_kehadiran}%)
                      </span>
                      {s.jumlah_izin > 0 && (
                        <span className="px-2 py-0.5 rounded-lg bg-sky-50 text-sky-700 font-semibold text-xs">
                          {s.jumlah_izin} Izin
                        </span>
                      )}
                      {s.jumlah_sakit > 0 && (
                        <span className="px-2 py-0.5 rounded-lg bg-amber-50 text-amber-700 font-semibold text-xs">
                          {s.jumlah_sakit} Sakit
                        </span>
                      )}
                      {s.jumlah_alpha > 0 && (
                        <span className="px-2 py-0.5 rounded-lg bg-rose-50 text-rose-700 font-semibold text-xs">
                          {s.jumlah_alpha} Alpha
                        </span>
                      )}
                      {s.jumlah_dispensasi > 0 && (
                        <span className="px-2 py-0.5 rounded-lg bg-purple-50 text-purple-700 font-semibold text-xs">
                          {s.jumlah_dispensasi} Disp.
                        </span>
                      )}
                      {s.jumlah_terlambat > 0 && (
                        <span className="px-2 py-0.5 rounded-lg bg-orange-50 text-orange-700 font-semibold text-xs">
                          {s.jumlah_terlambat} Terlambat
                        </span>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-amber-600 font-semibold flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5" />
                      Presensi belum dicatat untuk pertemuan ini
                    </p>
                  )}
                </div>

                {/* Tombol Aksi Presensi */}
                <div className="shrink-0 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenAttendance(s.sesi_id)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      s.sudah_diabsen
                        ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                        : "bg-[#2563EB] hover:bg-blue-700 text-white shadow-xs"
                    }`}
                  >
                    <UserCheck className="h-4 w-4" />
                    <span>
                      {s.sudah_diabsen ? "Buka / Koreksi Presensi" : "Catat Presensi Siswa"}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

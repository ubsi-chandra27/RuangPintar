"use client";

/**
 * Ruang Pintar — M10 Personal Teacher / Student Schedule View (Academic Glass UI v1.2)
 *
 * Menggabungkan slot berurutan (misal: 2 JP berturut-turut pada hari & rombel yang sama)
 * menjadi 1 Card Sesi Pembelajaran Terpadu yang informatif dan ramah perangkat bergerak.
 */

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  BookOpen,
  Users,
  Sparkles,
  PlayCircle,
  Download,
  MapPin,
  CheckCircle2,
} from "lucide-react";
import { openClassSessionAction } from "@/app/actions/class-session-actions";
import { HariBelajar, ScheduleEntryDTO } from "../domain/schedule-types";
import { Toast, ToastType } from "@/shared/components/ui/toast";

interface MyScheduleViewProps {
  entries: ScheduleEntryDTO[];
  teacherName?: string;
  isTeacher: boolean;
}

export interface MergedScheduleBlock {
  key: string;
  hari: HariBelajar;
  mata_pelajaran_id: string;
  mata_pelajaran_nama: string;
  mata_pelajaran_kode: string;
  rombel_id: string;
  rombel_nama: string;
  tingkat_nama?: string | null;
  guru_id: string;
  guru_nama: string;
  ruangan?: string | null;
  tahun_ajaran_id: string;
  semester_id?: string | null;
  penugasan_mengajar_id: string;
  jam_mulai: string;
  jam_selesai: string;
  total_jp: number;
  slot_range_label: string;
  entries: ScheduleEntryDTO[];
  primary_entry: ScheduleEntryDTO;
}

const HARI_ORDER: Record<string, number> = {
  SENIN: 1,
  SELASA: 2,
  RABU: 3,
  KAMIS: 4,
  JUMAT: 5,
  SABTU: 6,
  MINGGU: 7,
};

/**
 * Menggabungkan slot waktu berurutan (consecutive slots) untuk hari, rombel,
 * mapel, dan ruangan yang sama menjadi 1 unified block kartu.
 */
export function mergeConsecutiveScheduleEntries(
  rawEntries: ScheduleEntryDTO[]
): MergedScheduleBlock[] {
  if (!rawEntries || rawEntries.length === 0) return [];

  const sorted = [...rawEntries].sort((a, b) => {
    const dayDiff = (HARI_ORDER[a.hari] || 99) - (HARI_ORDER[b.hari] || 99);
    if (dayDiff !== 0) return dayDiff;

    const timeDiff = (a.slot_waktu_jam_mulai || "").localeCompare(b.slot_waktu_jam_mulai || "");
    if (timeDiff !== 0) return timeDiff;

    return (a.slot_waktu_urutan || 0) - (b.slot_waktu_urutan || 0);
  });

  const blocks: MergedScheduleBlock[] = [];

  for (const entry of sorted) {
    const prevBlock = blocks[blocks.length - 1];

    const isSameDay = prevBlock && prevBlock.hari === entry.hari;
    const isSameSubject = prevBlock && prevBlock.mata_pelajaran_id === entry.mata_pelajaran_id;
    const isSameRombel = prevBlock && prevBlock.rombel_id === entry.rombel_id;
    const isSameRuangan = prevBlock && (prevBlock.ruangan || "") === (entry.ruangan || "");

    const lastEntry = prevBlock?.entries[prevBlock.entries.length - 1];
    const isConsecutiveTime =
      prevBlock &&
      (prevBlock.jam_selesai === entry.slot_waktu_jam_mulai ||
        (entry.slot_waktu_urutan &&
          lastEntry?.slot_waktu_urutan &&
          entry.slot_waktu_urutan === lastEntry.slot_waktu_urutan + 1));

    if (isSameDay && isSameSubject && isSameRombel && isSameRuangan && isConsecutiveTime) {
      // Perpanjang jam selesai dan jumlah JP blok
      prevBlock.jam_selesai = entry.slot_waktu_jam_selesai;
      prevBlock.total_jp += 1;
      prevBlock.entries.push(entry);

      const firstSlotNum = prevBlock.entries[0].slot_waktu_urutan || 1;
      const lastSlotNum = entry.slot_waktu_urutan || firstSlotNum + prevBlock.total_jp - 1;
      prevBlock.slot_range_label = `Jam ke-${firstSlotNum} – ${lastSlotNum}`;
    } else {
      // Buat blok jadwal baru
      const slotNum = entry.slot_waktu_urutan || 1;
      blocks.push({
        key: `${entry.id}_${entry.hari}_${entry.mata_pelajaran_id}_${entry.rombel_id}_${entry.slot_waktu_jam_mulai}`,
        hari: entry.hari,
        mata_pelajaran_id: entry.mata_pelajaran_id,
        mata_pelajaran_nama: entry.mata_pelajaran_nama,
        mata_pelajaran_kode: entry.mata_pelajaran_kode,
        rombel_id: entry.rombel_id,
        rombel_nama: entry.rombel_nama,
        tingkat_nama: entry.tingkat_nama,
        guru_id: entry.guru_id,
        guru_nama: entry.guru_nama,
        ruangan: entry.ruangan,
        tahun_ajaran_id: entry.tahun_ajaran_id,
        semester_id: entry.semester_id,
        penugasan_mengajar_id: entry.penugasan_mengajar_id,
        jam_mulai: entry.slot_waktu_jam_mulai,
        jam_selesai: entry.slot_waktu_jam_selesai,
        total_jp: 1,
        slot_range_label: entry.slot_waktu_nama || `Jam ke-${slotNum}`,
        entries: [entry],
        primary_entry: entry,
      });
    }
  }

  return blocks;
}

export function MyScheduleView({ entries, teacherName, isTeacher }: MyScheduleViewProps) {
  const router = useRouter();
  const [selectedHari, setSelectedHari] = useState<string>("ALL");
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [isPending, startTransition] = useTransition();

  // Map hari ini
  const hariMap: Record<number, HariBelajar> = {
    1: "SENIN",
    2: "SELASA",
    3: "RABU",
    4: "KAMIS",
    5: "JUMAT",
    6: "SABTU",
    0: "MINGGU",
  };
  const todayDayName = hariMap[new Date().getDay()] || "SENIN";

  // Data gabungan per blok
  const allMergedBlocks = mergeConsecutiveScheduleEntries(entries);

  // Filter berdasarkan hari
  const filteredBlocks = allMergedBlocks.filter(
    (b) => selectedHari === "ALL" || b.hari === selectedHari
  );

  // Metrik Hari Ini
  const todayEntries = entries.filter((e) => e.hari === todayDayName);
  const todayBlocks = allMergedBlocks.filter((b) => b.hari === todayDayName);
  const uniqueRombels = new Set(entries.map((e) => e.rombel_id));

  const handleQuickOpenSession = (entry: ScheduleEntryDTO) => {
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

  const handleExportCSV = () => {
    if (entries.length === 0) {
      setToast({ message: "Tidak ada jadwal untuk diekspor.", type: "error" });
      return;
    }

    const headers = [
      "No",
      "Hari",
      "Jam Mulai",
      "Jam Selesai",
      "Durasi JP",
      "Rombel",
      "Mata Pelajaran",
      "Ruangan",
      "Catatan",
    ];
    const escapeCsv = (val: unknown) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = allMergedBlocks.map((b, idx) => [
      idx + 1,
      escapeCsv(b.hari),
      escapeCsv(b.jam_mulai),
      escapeCsv(b.jam_selesai),
      escapeCsv(`${b.total_jp} JP`),
      escapeCsv(b.rombel_nama),
      escapeCsv(b.mata_pelajaran_nama),
      escapeCsv(b.ruangan || "-"),
      escapeCsv(b.slot_range_label),
    ]);

    const delimiter = ";";
    const csvContent =
      "\uFEFF" + [headers.join(delimiter), ...rows.map((r) => r.join(delimiter))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `jadwal_mengajar_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setToast({
      message: `Berhasil mengekspor ${allMergedBlocks.length} blok jadwal mengajar ke CSV.`,
      type: "success",
    });
  };

  const daysList: HariBelajar[] = ["SENIN", "SELASA", "RABU", "KAMIS", "JUMAT", "SABTU"];

  return (
    <div className="space-y-4 sm:space-y-6 pb-24 sm:pb-12">
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
          duration={4000}
        />
      )}

      {/* KPI Metric Summary — Tampilan Ringkas & Responsif Mobile (1 Baris 3 Kolom) */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {/* Metric 1: Total JP */}
        <div className="p-3 sm:p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-400 block truncate">
              Total Mengajar
            </span>
            <div className="p-1.5 sm:p-2 rounded-xl bg-blue-50 text-[#2563EB] hidden sm:block">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-1 sm:mt-2">
            <span className="text-sm sm:text-xl font-black text-slate-800 tracking-tight block">
              {entries.length} JP / Minggu
            </span>
          </div>
        </div>

        {/* Metric 2: Kelas Hari Ini */}
        <div className="p-3 sm:p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-400 block truncate">
              Hari Ini ({todayDayName})
            </span>
            <div className="p-1.5 sm:p-2 rounded-xl bg-emerald-50 text-emerald-600 hidden sm:block">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-1 sm:mt-2">
            <div className="flex items-baseline gap-1">
              <span className="text-lg sm:text-2xl font-black text-emerald-600 tracking-tight">
                {todayBlocks.length}
              </span>
              <span className="text-[10px] sm:text-xs font-bold text-emerald-600">Kelas</span>
            </div>
            <span className="text-[10px] sm:text-[11px] text-slate-400 block truncate">
              {todayEntries.length} JP terjadwal
            </span>
          </div>
        </div>

        {/* Metric 3: Rombel Terampu */}
        <div className="p-3 sm:p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-400 block truncate">
              Rombel
            </span>
            <div className="p-1.5 sm:p-2 rounded-xl bg-purple-50 text-purple-600 hidden sm:block">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-1 sm:mt-2">
            <div className="flex items-baseline gap-1">
              <span className="text-lg sm:text-2xl font-black text-purple-600 tracking-tight">
                {uniqueRombels.size}
              </span>
              <span className="text-[10px] sm:text-xs font-bold text-purple-600">Kelas</span>
            </div>
            <span className="text-[10px] sm:text-[11px] text-slate-400 block truncate">
              Rombongan belajar
            </span>
          </div>
        </div>
      </div>

      {/* Day Filter Switcher & Export — Single Row Terpadu (Mobile & Desktop) */}
      <div className="flex items-center justify-between gap-2 p-2 sm:p-3 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-2xs">
        {/* Horizontal Chips Filter: Mengisi sisa ruang dan dapat digeser (scroll) */}
        <div className="flex-1 flex items-center gap-1.5 overflow-x-auto py-0.5 scrollbar-none min-w-0 pr-1">
          <button
            type="button"
            onClick={() => setSelectedHari("ALL")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
              selectedHari === "ALL"
                ? "bg-[#2563EB] text-white shadow-xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <span>Semua Hari</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold ${
                selectedHari === "ALL" ? "bg-white/20 text-white" : "bg-slate-200/80 text-slate-600"
              }`}
            >
              {entries.length} JP
            </span>
          </button>

          {daysList.map((d) => {
            const dayEntries = entries.filter((e) => e.hari === d);
            const isToday = d === todayDayName;
            if (dayEntries.length === 0) return null;

            return (
              <button
                key={d}
                type="button"
                onClick={() => setSelectedHari(d)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  selectedHari === d
                    ? "bg-[#2563EB] text-white shadow-xs"
                    : isToday
                      ? "bg-blue-50 text-[#2563EB] border border-blue-300 ring-1 ring-blue-400/20"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <span>{d}</span>
                {isToday && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />}
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold ${
                    selectedHari === d ? "bg-white/20 text-white" : "bg-slate-200/80 text-slate-600"
                  }`}
                >
                  {dayEntries.length} JP
                </span>
              </button>
            );
          })}
        </div>

        {/* Separator Garis Vertikal */}
        <div className="h-6 w-px bg-slate-200 shrink-0" />

        {/* Tombol Ekspor CSV — Selalu Sejajar di Kanan Bar */}
        <button
          type="button"
          onClick={handleExportCSV}
          title="Ekspor Jadwal ke CSV"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200/90 bg-slate-50 hover:bg-white text-slate-700 font-bold text-xs transition-colors cursor-pointer shrink-0 shadow-2xs"
        >
          <Download className="h-3.5 w-3.5 text-slate-500 shrink-0" />
          <span className="hidden sm:inline">Ekspor CSV</span>
          <span className="sm:hidden text-[11px]">CSV</span>
        </button>
      </div>

      {/* Schedule List / Cards */}
      {filteredBlocks.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white/80 backdrop-blur-md border border-slate-200/80">
          <Calendar className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-slate-700">Tidak ada jadwal pembelajaran</h4>
          <p className="text-xs text-slate-400 mt-1">
            {selectedHari === "ALL"
              ? "Anda belum memiliki alokasi jadwal pada versi jadwal resmi aktif."
              : `Tidak ada jadwal mengajar pada hari ${selectedHari}.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {filteredBlocks.map((block) => {
            const isToday = block.hari === todayDayName;

            return (
              <div
                key={block.key}
                className={`p-4 sm:p-5 rounded-2xl bg-white border transition-all duration-200 flex flex-col justify-between group ${
                  isToday
                    ? "border-blue-300 bg-gradient-to-b from-blue-50/30 via-white to-white ring-2 ring-blue-500/10 shadow-md hover:shadow-lg hover:border-blue-400 hover:-translate-y-0.5"
                    : "border-slate-200/80 shadow-2xs hover:border-blue-300 hover:shadow-md hover:-translate-y-0.5"
                }`}
              >
                <div>
                  {/* Top Bar: Hari + Waktu Pelajaran */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-lg text-xs font-bold ${
                          isToday ? "bg-blue-600 text-white shadow-xs" : "bg-blue-50 text-[#2563EB]"
                        }`}
                      >
                        {block.hari}
                      </span>
                      {/* Badge JP & Rentang Slot (misal: 2 JP • Jam ke-1 – 2) */}
                      <span className="px-2 py-0.5 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 text-[11px] font-bold">
                        {block.total_jp} JP ({block.slot_range_label})
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-xs font-semibold text-slate-600">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      <span>
                        {block.jam_mulai} - {block.jam_selesai}
                      </span>
                    </div>
                  </div>

                  {/* Body: Mata Pelajaran & Kelas */}
                  <div className="space-y-1.5 mb-4">
                    <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                      {block.mata_pelajaran_nama}
                    </h4>

                    <div className="flex items-center flex-wrap gap-2 text-xs text-slate-600 pt-0.5">
                      <span className="inline-flex items-center gap-1 font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
                        {block.rombel_nama}
                      </span>
                      {block.ruangan && (
                        <span className="inline-flex items-center gap-1 text-blue-600 font-medium bg-blue-50/70 px-2 py-0.5 rounded-md border border-blue-100">
                          <MapPin className="h-3 w-3 text-blue-500" />
                          <span>{block.ruangan}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer: Tombol Buka Kelas / Informasi Status Hari */}
                {isTeacher && (
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    {isToday ? (
                      <>
                        <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          Sesi Hari Ini
                        </span>
                        <button
                          type="button"
                          onClick={() => handleQuickOpenSession(block.primary_entry)}
                          disabled={isPending}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                          title="Buka kelas pembelajaran dan mulai presensi siswa untuk sesi ini"
                        >
                          <PlayCircle className="h-3.5 w-3.5" />
                          <span>Buka Kelas</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Terjadwal hari {block.hari}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleQuickOpenSession(block.primary_entry)}
                          disabled={isPending}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-[#2563EB] hover:border-blue-300 disabled:opacity-50 text-xs font-semibold transition-all cursor-pointer"
                          title="Buka sesi pembelajaran untuk kelas ini"
                        >
                          <PlayCircle className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#2563EB]" />
                          <span>Buka Kelas</span>
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

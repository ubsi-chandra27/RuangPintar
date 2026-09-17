"use client";

/**
 * Ruang Pintar — TeacherDigitalClockCalendar
 *
 * Widget Jam Digital Real-Time & Mini Kalender Bulanan Interaktif.
 * Memberikan referensi waktu akurat (WIB) bagi guru saat mengajar di kelas,
 * serta tampilan mini kalender dengan highlight tanggal hari ini.
 */

import React, { useState, useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import { Clock, CalendarDays, ChevronLeft, ChevronRight, ArrowRight, Timer } from "lucide-react";

const emptySubscribe = () => () => {};

interface TeacherDigitalClockCalendarProps {
  initialTime?: string;
  initialDate?: string;
}

const HARI_NAMES = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const BULAN_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export function TeacherDigitalClockCalendar({
  initialTime,
  initialDate,
}: TeacherDigitalClockCalendarProps) {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [viewDate, setViewDate] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format Jam Digital: HH:MM:SS
  const hours = mounted
    ? String(currentTime.getHours()).padStart(2, "0")
    : initialTime?.slice(0, 2) || "07";
  const minutes = mounted
    ? String(currentTime.getMinutes()).padStart(2, "0")
    : initialTime?.slice(3, 5) || "00";
  const seconds = mounted ? String(currentTime.getSeconds()).padStart(2, "0") : "00";

  // Format Tanggal Hari Ini
  const dateFormatted = mounted
    ? currentTime.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : initialDate || "Rabu, 16 September 2026";

  // Perhitungan Kalender Bulanan
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Grid Tanggal
  const calendarCells: Array<{ day: number; isCurrentMonth: boolean; isToday: boolean }> = [];

  // Padding hari bulan lalu
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    calendarCells.push({
      day: daysInPrevMonth - i,
      isCurrentMonth: false,
      isToday: false,
    });
  }

  // Hari bulan ini
  const todayDate = currentTime.getDate();
  const isCurrentMonthView = currentTime.getFullYear() === year && currentTime.getMonth() === month;

  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push({
      day: d,
      isCurrentMonth: true,
      isToday: isCurrentMonthView && d === todayDate,
    });
  }

  // Padding hari bulan depan agar pas baris 7 kolom
  const remainingCells = 7 - (calendarCells.length % 7);
  if (remainingCells < 7) {
    for (let d = 1; d <= remainingCells; d++) {
      calendarCells.push({
        day: d,
        isCurrentMonth: false,
        isToday: false,
      });
    }
  }

  const handlePrevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  const handleResetToToday = () => {
    setViewDate(new Date(currentTime.getFullYear(), currentTime.getMonth(), 1));
  };

  return (
    <div className="rounded-xl bg-white border border-slate-200/80 p-3.5 sm:p-4 shadow-xs space-y-3">
      {/* Header Widget */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-1.5 min-w-0">
          <Clock className="h-4 w-4 text-[#2563EB] shrink-0" />
          <h3 className="text-xs sm:text-sm font-extrabold text-[#0F172A] truncate">
            Jam Digital & Kalender
          </h3>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200/70">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>WIB</span>
          </span>
        </div>
      </div>

      {/* Tampilan Jam Digital Utama (Hero Digital Display) */}
      <div className="p-3 sm:p-3.5 rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden">
        {/* Glow effect background */}
        <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-blue-500/20 blur-xl pointer-events-none" />
        <div className="absolute -left-6 -top-6 w-24 h-24 rounded-full bg-indigo-500/20 blur-xl pointer-events-none" />

        <span className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider mb-0.5">
          Waktu Indonesia Barat (WIB)
        </span>

        {/* Live Digital Digits */}
        <div className="flex items-center justify-center gap-1 font-mono text-2xl sm:text-3xl font-black tracking-tight text-white py-0.5">
          <span className="bg-white/10 px-2 py-0.5 rounded-lg border border-white/15 min-w-[42px]">
            {hours}
          </span>
          <span className="text-blue-400 font-bold animate-pulse">:</span>
          <span className="bg-white/10 px-2 py-0.5 rounded-lg border border-white/15 min-w-[42px]">
            {minutes}
          </span>
          <span className="text-blue-400 font-bold animate-pulse">:</span>
          <span className="bg-white/10 px-2 py-0.5 rounded-lg border border-white/15 min-w-[42px] text-blue-200">
            {seconds}
          </span>
        </div>

        {/* Tanggal Lengkap */}
        <p className="text-xs font-semibold text-slate-300 mt-1.5 capitalize">{dateFormatted}</p>
      </div>

      {/* Mini Kalender Bulanan */}
      <div className="space-y-2 pt-0.5">
        {/* Kontrol Navigasi Bulan */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5 text-slate-500" />
            <span className="text-xs font-bold text-slate-900">
              {BULAN_NAMES[month]} {year}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleResetToToday}
              className="px-1.5 py-0.5 rounded text-[10px] font-bold text-[#2563EB] hover:bg-blue-50 transition-colors"
              title="Kembali ke Bulan Berjalan"
            >
              Hari Ini
            </button>
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Bulan sebelumnya"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Bulan berikutnya"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Header Hari (Min - Sab) */}
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 border-b border-slate-100 pb-1">
          {HARI_NAMES.map((h, i) => (
            <span key={h} className={i === 0 ? "text-rose-500" : ""}>
              {h}
            </span>
          ))}
        </div>

        {/* Grid Sel Tanggal */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs">
          {calendarCells.map((cell, idx) => (
            <div
              key={idx}
              className={`py-1 text-[11px] rounded-md transition-all flex items-center justify-center ${
                cell.isToday
                  ? "bg-[#2563EB] text-white font-extrabold shadow-2xs scale-105"
                  : cell.isCurrentMonth
                    ? "text-slate-700 hover:bg-slate-100 font-medium cursor-default"
                    : "text-slate-300 pointer-events-none"
              }`}
            >
              {cell.day}
            </div>
          ))}
        </div>
      </div>

      {/* Footer Tautan Kalender Akademik */}
      <div className="pt-1 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[10px] text-slate-400 font-medium">Agenda Sekolah</span>
        <Link
          href="/kalender-akademik"
          className="text-[11px] font-bold text-[#2563EB] hover:underline flex items-center gap-1 transition-colors"
        >
          <span>Buka Kalender Akademik</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}

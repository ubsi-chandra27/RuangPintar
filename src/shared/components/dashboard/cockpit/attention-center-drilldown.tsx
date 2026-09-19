"use client";

import * as React from "react";
import {
  AlertTriangle,
  ClipboardList,
  GraduationCap,
  ChevronRight,
  UserCheck,
  Bell,
  ArrowUpRight,
  CheckCircle2,
} from "lucide-react";
import { SlideOverDrawer } from "@/shared/components/motion/slide-over-drawer";
import { AnimatedCounter } from "@/shared/components/motion/animated-counter";

export interface AttentionItem {
  id: string;
  nama: string;
  rombel: string;
  keterangan: string;
  badge: string;
  badgeColor: string;
}

export interface AttentionCenterProps {
  alphaCount: number;
  jurnalTertundaCount: number;
  remedialCount: number;
  alphaList?: AttentionItem[];
  jurnalList?: AttentionItem[];
  remedialList?: AttentionItem[];
}

export function AttentionCenterDrilldown({
  alphaCount,
  jurnalTertundaCount,
  remedialCount,
  alphaList = [],
  jurnalList = [],
  remedialList = [],
}: AttentionCenterProps) {
  const [activeDrawer, setActiveDrawer] = React.useState<"alpha" | "jurnal" | "remedial" | null>(
    null
  );
  const [actionDoneMsg, setActionDoneMsg] = React.useState<string | null>(null);

  const handleQuickAction = (msg: string) => {
    setActionDoneMsg(msg);
    setTimeout(() => setActionDoneMsg(null), 3000);
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Card 1: Siswa Alpha Kritis */}
        <div className="rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 p-4 sm:p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                  <AlertTriangle className="w-4 h-4" />
                </span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Siswa Alpha Kritis
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-rose-100/70 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 text-[10px] font-extrabold uppercase">
                Perlu Tindakan
              </span>
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                <AnimatedCounter value={alphaCount} duration={1.2} />
              </span>
              <span className="text-xs text-slate-400">Kasus Pekan Ini</span>
            </div>
          </div>

          <button
            onClick={() => setActiveDrawer("alpha")}
            className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 cursor-pointer group"
          >
            <span>Tinjau Kasus Siswa</span>
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* Card 2: Jurnal KBM Tertunda */}
        <div className="rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 p-4 sm:p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                  <ClipboardList className="w-4 h-4" />
                </span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Jurnal KBM Tertunda
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-amber-100/70 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-[10px] font-extrabold uppercase">
                Monitoring
              </span>
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                <AnimatedCounter value={jurnalTertundaCount} duration={1.2} />
              </span>
              <span className="text-xs text-slate-400">Sesi Belum Terisi</span>
            </div>
          </div>

          <button
            onClick={() => setActiveDrawer("jurnal")}
            className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 cursor-pointer group"
          >
            <span>Kirim Pengingat Guru</span>
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* Card 3: Evaluasi KKTP / Remedial */}
        <div className="rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 p-4 sm:p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                  <GraduationCap className="w-4 h-4" />
                </span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Capaian di Bawah KKTP
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-blue-100/70 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-[10px] font-extrabold uppercase">
                Kurikulum
              </span>
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                <AnimatedCounter value={remedialCount} duration={1.2} />
              </span>
              <span className="text-xs text-slate-400">Rombel Perlu Remedial</span>
            </div>
          </div>

          <button
            onClick={() => setActiveDrawer("remedial")}
            className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-[#2563EB] dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 cursor-pointer group"
          >
            <span>Lihat Analisis Rombel</span>
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>

      {/* Action Done Toast Notification */}
      {actionDoneMsg && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-slate-900 text-white shadow-2xl border border-emerald-500/40 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold">{actionDoneMsg}</span>
        </div>
      )}

      {/* 1. Drawer Siswa Alpha */}
      <SlideOverDrawer
        isOpen={activeDrawer === "alpha"}
        onClose={() => setActiveDrawer(null)}
        title="Daftar Siswa Alpha Kritis"
        subtitle="Siswa dengan akumulasi ketidakhadiran tanpa keterangan > 3 hari"
        badge={
          <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-xs font-bold">
            {alphaCount} Siswa
          </span>
        }
        footer={
          <button
            onClick={() =>
              handleQuickAction("Notifikasi panggilan wali murid dikirim via WA Gateway!")
            }
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Panggil Wali Murid (WA Gateway)
          </button>
        }
      >
        <div className="space-y-3">
          {alphaList.length > 0 ? (
            alphaList.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between gap-3"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {item.nama}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {item.rombel} • {item.keterangan}
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-600 text-[10px] font-extrabold border border-rose-200">
                  {item.badge}
                </span>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-xs text-slate-500">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
              Alhamdulillah, tidak ada siswa dengan alpha kritis saat ini.
            </div>
          )}
        </div>
      </SlideOverDrawer>

      {/* 2. Drawer Jurnal KBM */}
      <SlideOverDrawer
        isOpen={activeDrawer === "jurnal"}
        onClose={() => setActiveDrawer(null)}
        title="Jurnal KBM Belum Terisi"
        subtitle="Daftar guru pengampu yang belum menyelesaikan administrasi jurnal KBM hari ini"
        badge={
          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">
            {jurnalTertundaCount} Sesi
          </span>
        }
        footer={
          <button
            onClick={() =>
              handleQuickAction("Pengingat jurnal KBM berhasil dikirim ke seluruh guru!")
            }
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Kirim Broadcast Pengingat
          </button>
        }
      >
        <div className="space-y-3">
          {jurnalList.length > 0 ? (
            jurnalList.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between gap-3"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {item.nama}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {item.rombel} • {item.keterangan}
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-600 text-[10px] font-extrabold border border-amber-200">
                  {item.badge}
                </span>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-xs text-slate-500">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
              Seluruh guru pengampu telah menyelesaikan pengisian jurnal KBM hari ini.
            </div>
          )}
        </div>
      </SlideOverDrawer>

      {/* 3. Drawer Remedial KKTP */}
      <SlideOverDrawer
        isOpen={activeDrawer === "remedial"}
        onClose={() => setActiveDrawer(null)}
        title="Evaluasi Ketuntasan KKTP Rombel"
        subtitle="Rombongan belajar yang memiliki ketuntasan kompetensi di bawah target"
        badge={
          <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
            {remedialCount} Rombel
          </span>
        }
      >
        <div className="space-y-3">
          {remedialList.length > 0 ? (
            remedialList.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between gap-3"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {item.nama}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {item.rombel} • {item.keterangan}
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 text-[10px] font-extrabold border border-blue-200">
                  {item.badge}
                </span>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-xs text-slate-500">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
              Seluruh rombel berada di atas standar ketercapaian KKTP.
            </div>
          )}
        </div>
      </SlideOverDrawer>
    </>
  );
}

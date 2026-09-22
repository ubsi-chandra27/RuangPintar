"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CalendarClock, Camera, Clock3, School, Users, X } from "lucide-react";
import {
  createTeacherInitialScheduleAction,
  getTeacherInitialScheduleOptionsAction,
} from "@/app/actions/smart-onboarding-actions";

type ScheduleOptions = {
  rombelNama: string;
  mataPelajaran: string;
  slots: Array<{ id: string; nama: string; jam_mulai: string; jam_selesai: string }>;
};

const HARI = [
  ["SENIN", "Senin"],
  ["SELASA", "Selasa"],
  ["RABU", "Rabu"],
  ["KAMIS", "Kamis"],
  ["JUMAT", "Jumat"],
  ["SABTU", "Sabtu"],
] as const;

export function TeacherFirstClassSetupModal({ shouldOpen }: { shouldOpen: boolean }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);
  const [rombelId, setRombelId] = React.useState<string | null>(null);
  const [options, setOptions] = React.useState<ScheduleOptions | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [hari, setHari] = React.useState<(typeof HARI)[number][0]>("SENIN");
  const [slotWaktuId, setSlotWaktuId] = React.useState("");

  const openScheduleSetup = React.useCallback(async (nextRombelId: string) => {
    setRombelId(nextRombelId);
    setOptions(null);
    setError(null);
    setIsOpen(true);
    setIsLoading(true);
    const result = await getTeacherInitialScheduleOptionsAction(nextRombelId);
    if (result.success && result.data) {
      setOptions(result.data);
      setSlotWaktuId(result.data.slots[0]?.id ?? "");
    } else {
      setError(result.error ?? "Pilihan jadwal belum dapat disiapkan.");
    }
    setIsLoading(false);
  }, []);

  React.useEffect(() => {
    if (!shouldOpen || sessionStorage.getItem("rp_first_class_setup_seen")) return;
    const openTimer = window.setTimeout(() => setIsOpen(true), 0);
    return () => window.clearTimeout(openTimer);
  }, [shouldOpen]);

  React.useEffect(() => {
    const handleClassCreated = (event: Event) => {
      const detail = (event as CustomEvent<{ rombelId?: string }>).detail;
      if (detail?.rombelId) void openScheduleSetup(detail.rombelId);
    };
    const handleOpenSchedule = (event: Event) => {
      const detail = (event as CustomEvent<{ rombelId?: string }>).detail;
      if (detail?.rombelId) void openScheduleSetup(detail.rombelId);
    };
    window.addEventListener("manual-class-created", handleClassCreated);
    window.addEventListener("open-teacher-schedule-setup", handleOpenSchedule);
    return () => {
      window.removeEventListener("manual-class-created", handleClassCreated);
      window.removeEventListener("open-teacher-schedule-setup", handleOpenSchedule);
    };
  }, [openScheduleSetup]);

  const close = () => {
    sessionStorage.setItem("rp_first_class_setup_seen", "1");
    setIsOpen(false);
    setError(null);
  };

  const chooseClassMethod = (eventName: "open-manual-class-modal" | "open-ai-photo-modal") => {
    close();
    window.dispatchEvent(new CustomEvent(eventName));
  };

  const saveSchedule = async () => {
    if (!rombelId || !slotWaktuId) return;
    setIsSaving(true);
    setError(null);
    const result = await createTeacherInitialScheduleAction({ rombelId, slotWaktuId, hari });
    setIsSaving(false);
    if (!result.success) {
      setError(result.error ?? "Jadwal awal belum dapat disimpan.");
      return;
    }
    router.push("/jadwal-saya");
  };

  if (!isOpen) return null;

  const isScheduleStep = !!rombelId;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="teacher-setup-title"
        className="w-full max-w-lg rounded-[24px] border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-700 dark:bg-slate-900 sm:p-7"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#2563EB] dark:bg-blue-950/50 dark:text-blue-300">
              {isScheduleStep ? (
                <CalendarClock className="size-5" />
              ) : (
                <School className="size-5" />
              )}
            </div>
            <div>
              <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                {isScheduleStep ? "Langkah 2 dari 2" : "Mulai mengajar"}
              </p>
              <h2
                id="teacher-setup-title"
                className="mt-0.5 text-lg font-bold text-slate-900 dark:text-white"
              >
                {isScheduleStep
                  ? "Tentukan jadwal mengajar pertama"
                  : "Siapkan rombel pertama Anda"}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Tutup setup awal"
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="size-5" />
          </button>
        </div>

        {!isScheduleStep ? (
          <>
            <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
              Mulai dengan satu rombel dan mata pelajaran. Setelah itu, pilih hari serta jam
              mengajar agar presensi dan perangkat ajar siap digunakan.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => chooseClassMethod("open-manual-class-modal")}
                className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-left transition-colors hover:border-blue-300 hover:bg-blue-100/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:border-blue-900/60 dark:bg-blue-950/30 dark:hover:bg-blue-950/55"
              >
                <Users className="size-5 text-[#2563EB]" />
                <span className="mt-3 block text-sm font-bold text-slate-900 dark:text-white">
                  Isi rombel manual
                </span>
                <span className="mt-1 block text-xs leading-5 text-slate-600 dark:text-slate-300">
                  Ketik kelas, mapel, serta daftar siswa.
                </span>
              </button>
              <button
                type="button"
                onClick={() => chooseClassMethod("open-ai-photo-modal")}
                className="rounded-2xl border border-slate-200 bg-white p-4 text-left transition-colors hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:bg-slate-800"
              >
                <Camera className="size-5 text-slate-700 dark:text-slate-200" />
                <span className="mt-3 block text-sm font-bold text-slate-900 dark:text-white">
                  Foto daftar hadir
                </span>
                <span className="mt-1 block text-xs leading-5 text-slate-600 dark:text-slate-300">
                  Pindai daftar siswa dari lembar kertas.
                </span>
              </button>
            </div>
            <button
              type="button"
              onClick={close}
              className="mt-5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            >
              Saya isi nanti
            </button>
          </>
        ) : (
          <>
            <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
              Jadwal ini hanya untuk <strong>{options?.rombelNama ?? "rombel Anda"}</strong> pada
              mata pelajaran <strong>{options?.mataPelajaran ?? "Anda"}</strong>.
            </p>
            {isLoading ? (
              <div className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                Menyiapkan pilihan jam mengajar...
              </div>
            ) : (
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Hari mengajar
                  <select
                    value={hari}
                    onChange={(event) => setHari(event.target.value as typeof hari)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {HARI.map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Jam mengajar
                  <select
                    value={slotWaktuId}
                    onChange={(event) => setSlotWaktuId(event.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {options?.slots.map((slot) => (
                      <option key={slot.id} value={slot.id}>
                        {slot.nama} ({slot.jam_mulai}–{slot.jam_selesai})
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            )}
            {error && (
              <p
                role="alert"
                className="mt-4 rounded-xl bg-rose-50 px-3 py-2.5 text-xs font-medium text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
              >
                {error}
              </p>
            )}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={close}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              >
                Atur nanti
              </button>
              <button
                type="button"
                onClick={saveSchedule}
                disabled={isLoading || isSaving || !slotWaktuId}
                className="inline-flex items-center gap-2 rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Clock3 className="size-4" />
                {isSaving ? "Menyimpan..." : "Simpan jadwal awal"}
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

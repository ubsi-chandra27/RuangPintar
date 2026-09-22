"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  X,
  PlusCircle,
  School,
  BookOpen,
  Users,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Upload,
} from "lucide-react";
import { createManualClassAction } from "@/app/actions/smart-onboarding-actions";

export interface ManualCreateClassModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function ManualCreateClassModal({
  isOpen: controlledIsOpen,
  onClose: controlledOnClose,
}: ManualCreateClassModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [siswaText, setSiswaText] = useState<string>("");

  const isModalOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalOpen;

  const handleClose = () => {
    if (controlledOnClose) {
      controlledOnClose();
    } else {
      setInternalOpen(false);
    }
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  useEffect(() => {
    const handleOpenEvent = () => {
      setInternalOpen(true);
      setErrorMsg(null);
      setSuccessMsg(null);
    };

    window.addEventListener("open-manual-class-modal", handleOpenEvent);
    return () => {
      window.removeEventListener("open-manual-class-modal", handleOpenEvent);
    };
  }, []);

  const handleDownloadTemplate = () => {
    const csvContent =
      "\uFEFFsep=,\r\nNIS,Nama Siswa,Jenis Kelamin (L/P)\r\n1001,Ahmad Fauzi,L\r\n1002,Dewi Sartika,P\r\n1003,Rian Hidayat,L\r\n";
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "template_siswa_rombel.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;
      const lines = content
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((line) => line && !/^sep\s*=\s*[,;|\t]$/i.test(line));
      const dataLines =
        lines.length > 0 &&
        (lines[0].toLowerCase().includes("nama") || lines[0].toLowerCase().includes("nis"))
          ? lines.slice(1)
          : lines;
      setSiswaText((prev) => (prev ? prev + "\n" + dataLines.join("\n") : dataLines.join("\n")));
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  if (!isModalOpen) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const res = await createManualClassAction(formData);
      if (res.success && res.data) {
        const createdClass = res.data;
        setSuccessMsg(`Kelas ${createdClass.namaRombel} berhasil dibuat!`);
        setTimeout(() => {
          handleClose();
          window.dispatchEvent(
            new CustomEvent("manual-class-created", {
              detail: { rombelId: createdClass.rombelId, namaRombel: createdClass.namaRombel },
            })
          );
        }, 1200);
      } else {
        setErrorMsg(res.error || "Gagal membuat kelas.");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-[28px] bg-white dark:bg-slate-900/95 dark:backdrop-blur-xl border border-slate-200/80 dark:border-blue-500/25 shadow-2xl p-6 sm:p-7 relative space-y-5 overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-10 w-48 h-32 bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-400 border border-blue-100 dark:border-blue-900/50 shadow-2xs">
              <PlusCircle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-mono text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                Tambah Kelas Manual
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Buat rombel dan mata pelajaran secara mandiri untuk seluruh jenjang
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Feedback Alert */}
        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
            <span className="font-bold">{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Nama Kelas */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <School className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                <span>Nama Rombel / Kelas</span>
              </label>
              <input
                type="text"
                name="nama_kelas"
                required
                placeholder="Misal: 10-A, X RPL 1, 7-B, 1-A"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB] transition-all"
              />
            </div>

            {/* Tingkat Kelas (SD, SMP, SMA) */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                Tingkat &amp; Fase
              </label>
              <select
                name="tingkat_kelas"
                defaultValue="10"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs font-bold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB] transition-all cursor-pointer"
              >
                <optgroup label="Jenjang SD / MI (Fase A - C)">
                  <option value="1">Kelas 1 (Fase A)</option>
                  <option value="2">Kelas 2 (Fase A)</option>
                  <option value="3">Kelas 3 (Fase B)</option>
                  <option value="4">Kelas 4 (Fase B)</option>
                  <option value="5">Kelas 5 (Fase C)</option>
                  <option value="6">Kelas 6 (Fase C)</option>
                </optgroup>
                <optgroup label="Jenjang SMP / MTs (Fase D)">
                  <option value="7">Kelas 7 (Fase D)</option>
                  <option value="8">Kelas 8 (Fase D)</option>
                  <option value="9">Kelas 9 (Fase D)</option>
                </optgroup>
                <optgroup label="Jenjang SMA / SMK / MA (Fase E - F)">
                  <option value="10">Kelas 10 (Fase E)</option>
                  <option value="11">Kelas 11 (Fase F)</option>
                  <option value="12">Kelas 12 (Fase F)</option>
                </optgroup>
              </select>
            </div>

            {/* Mata Pelajaran */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                <span>Mata Pelajaran</span>
              </label>
              <input
                type="text"
                name="mata_pelajaran"
                required
                placeholder="Misal: Pemrograman Web, Matematika"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB] transition-all"
              />
            </div>
          </div>

          {/* Daftar Siswa & Helper Download Excel */}
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
              <label className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                <span>Daftar Siswa &amp; NIS (Opsional)</span>
              </label>

              {/* Action Tools: Download Template & Import File */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px] font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Unduh file format Excel/CSV rapi untuk diisi"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Format Excel</span>
                </button>

                <label
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 text-[11px] font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Muat data siswa dari berkas CSV/Excel"
                >
                  <Upload className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Impor CSV</span>
                  <input
                    type="file"
                    accept=".csv,.tsv,.txt"
                    onChange={handleFileImport}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <textarea
              name="siswa_list"
              rows={4}
              value={siswaText}
              onChange={(e) => setSiswaText(e.target.value)}
              placeholder={
                "Format per baris: NIS, Nama Siswa, L/P\nContoh:\n1001, Ahmad Fauzi, L\n1002, Dewi Sartika, P\n1003, Rian Hidayat, L\n(Atau langsung copy-paste 2 kolom dari Excel)"
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB] transition-all resize-none font-mono"
            />
            <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-tight">
              Tips: Anda bisa langsung menyalin 2 kolom (NIS &amp; Nama) dari spreadsheet Excel lalu
              tempelkan di kotak di atas.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={handleClose}
              disabled={isPending}
              className="px-4 py-2 rounded-xl text-xs font-mono font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-mono font-bold shadow-xs shadow-blue-500/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span>Terbitkan Kelas</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

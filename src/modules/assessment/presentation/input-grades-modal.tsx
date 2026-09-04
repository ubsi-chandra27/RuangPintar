"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  X,
  Award,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  RotateCcw,
  Save,
  Send,
  HelpCircle,
} from "lucide-react";
import {
  getAssessmentGradesAction,
  saveAssessmentGradesAction,
  publishAssessmentAction,
} from "@/app/actions/assessment-actions";
import { DefinisiAsesmenDTO, NilaiSiswaDTO } from "../domain/assessment-types";

interface InputGradesModalProps {
  asesmenId: string;
  penugasanId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}

export function InputGradesModal({
  asesmenId,
  penugasanId,
  isOpen,
  onClose,
  onSuccess,
  onError,
}: InputGradesModalProps) {
  const [isPending, startTransition] = useTransition();
  const [loadedAsesmenId, setLoadedAsesmenId] = useState<string | null>(null);
  const [asesmen, setAsesmen] = useState<DefinisiAsesmenDTO | null>(null);
  const [grades, setGrades] = useState<NilaiSiswaDTO[]>([]);
  const [alasanKoreksi, setAlasanKoreksi] = useState("");
  const [showCorrectionInput, setShowCorrectionInput] = useState(false);

  const isLoadingData = loadedAsesmenId !== asesmenId;

  const handleClose = () => {
    setLoadedAsesmenId(null);
    onClose();
  };

  // Load grades when modal opens
  useEffect(() => {
    if (!isOpen || !asesmenId) return;
    if (loadedAsesmenId === asesmenId) return;

    let isMounted = true;

    getAssessmentGradesAction(asesmenId)
      .then((res) => {
        if (!isMounted) return;
        if (res.success && res.data) {
          setAsesmen(res.data.asesmen);
          setGrades(res.data.grades);
          setLoadedAsesmenId(asesmenId);
          // Jika ada nilai yang sudah tersimpan sebelumnya, tampilkan field catatan koreksi
          const hasExistingGrades = res.data.grades.some((g) => g.nilai_angka !== null);
          if (hasExistingGrades) {
            setShowCorrectionInput(true);
          }
        } else {
          onError(res.message);
          onClose();
        }
      })
      .catch((err) => {
        if (isMounted) onError(err.message || "Gagal memuat data asesmen");
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, asesmenId, loadedAsesmenId, onClose, onError]);

  if (!isOpen) return null;

  const kktp = asesmen?.kkm_kktp || 75;

  const handleGradeChange = (siswaId: string, value: string) => {
    setGrades((prev) =>
      prev.map((g) => {
        if (g.siswa_id !== siswaId) return g;
        if (value.trim() === "") {
          return { ...g, nilai_angka: null, is_tercapai_kktp: null };
        }
        const num = Number(value);
        if (isNaN(num)) return g;
        const clamped = Math.max(0, Math.min(100, num));
        return {
          ...g,
          nilai_angka: clamped,
          is_tercapai_kktp: clamped >= kktp,
        };
      })
    );
  };

  const handleCompetenceChange = (siswaId: string, text: string) => {
    setGrades((prev) =>
      prev.map((g) => (g.siswa_id === siswaId ? { ...g, capaian_kompetensi: text } : g))
    );
  };

  // Quick Action: Isi KKTP ke yang belum dinilai
  const fillKktpToEmpty = () => {
    setGrades((prev) =>
      prev.map((g) =>
        g.nilai_angka === null ? { ...g, nilai_angka: kktp, is_tercapai_kktp: true } : g
      )
    );
  };

  // Quick Action: Kosongkan nilai semua siswa
  const resetAllGrades = () => {
    if (confirm("Kosongkan seluruh nilai siswa pada lembar asesmen ini?")) {
      setGrades((prev) => prev.map((g) => ({ ...g, nilai_angka: null, is_tercapai_kktp: null })));
    }
  };

  // Simpan nilai (Draf atau Publish)
  const handleSave = (shouldPublish = false) => {
    startTransition(async () => {
      const payload = {
        asesmen_id: asesmenId,
        grades: grades.map((g) => ({
          siswa_id: g.siswa_id,
          penempatan_rombel_id: g.penempatan_rombel_id,
          nilai_angka: g.nilai_angka,
          capaian_kompetensi: g.capaian_kompetensi,
          catatan: g.catatan,
          status: shouldPublish ? ("PUBLISHED" as const) : ("DRAFT" as const),
          alasan_koreksi: alasanKoreksi || null,
        })),
        alasan_koreksi: alasanKoreksi || null,
      };

      const res = await saveAssessmentGradesAction(payload, penugasanId);
      if (!res.success) {
        onError(res.message);
        return;
      }

      if (shouldPublish) {
        const pubRes = await publishAssessmentAction(
          {
            asesmen_id: asesmenId,
            target_audience: "SEMUA",
          },
          penugasanId
        );
        if (pubRes.success) {
          onSuccess("Nilai berhasil disimpan dan resmi dipublikasikan.");
          handleClose();
        } else {
          onError(pubRes.message);
        }
      } else {
        onSuccess(res.message);
        handleClose();
      }
    });
  };

  // Hitung ringkasan live
  const totalDinilai = grades.filter((g) => g.nilai_angka !== null).length;
  const tuntasKktp = grades.filter((g) => g.nilai_angka !== null && g.nilai_angka >= kktp).length;
  const rataRata =
    totalDinilai > 0
      ? (grades.reduce((acc, curr) => acc + (curr.nilai_angka || 0), 0) / totalDinilai).toFixed(1)
      : "-";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="input-grades-title"
    >
      <div className="w-full max-w-4xl rounded-3xl bg-white border border-slate-200/80 shadow-2xl overflow-hidden flex flex-col h-[90vh]">
        {/* Header Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="input-grades-title" className="text-base font-bold text-slate-800">
                  {asesmen?.judul || "Lembar Penilaian Siswa"}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                  {asesmen?.kategori}
                </span>
                {asesmen?.is_published && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                    PUBLISHED
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                KKTP: <span className="font-bold text-slate-700">{kktp}</span> • Bobot:{" "}
                <span className="font-bold text-slate-700">{asesmen?.bobot || 1}</span> •{" "}
                {asesmen?.tp_kode ? `${asesmen.tp_kode}: ` : ""}
                {asesmen?.tp_deskripsi || "Penilaian Sesi Pembelajaran"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Tutup"
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Quick Toolbar & Live Stats */}
        <div className="px-6 py-2.5 bg-slate-50/40 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fillKktpToEmpty}
              className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-blue-300 hover:text-[#2563EB] font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5 text-blue-500" />
              Isi KKTP ({kktp}) ke yang Belum Dinilai
            </button>
            <button
              type="button"
              onClick={resetAllGrades}
              className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-rose-300 hover:text-rose-600 font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5 text-rose-500" />
              Kosongkan Nilai
            </button>
          </div>

          <div className="flex items-center gap-4 text-slate-600">
            <div>
              Dinilai:{" "}
              <span className="font-bold text-slate-800">
                {totalDinilai}/{grades.length}
              </span>
            </div>
            <div>
              Tuntas KKTP:{" "}
              <span className="font-bold text-emerald-600">
                {tuntasKktp} ({totalDinilai > 0 ? Math.round((tuntasKktp / totalDinilai) * 100) : 0}
                %)
              </span>
            </div>
            <div>
              Rata-rata: <span className="font-bold text-[#2563EB]">{rataRata}</span>
            </div>
          </div>
        </div>

        {/* Tabel Siswa & Input Nilai */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {isLoadingData ? (
            <div className="py-20 text-center text-slate-400 text-xs">
              Memuat data siswa dan nilai...
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold">
                      <th className="py-3 px-3 w-12 text-center">No</th>
                      <th className="py-3 px-4 w-28">NIS</th>
                      <th className="py-3 px-4">Nama Lengkap</th>
                      <th className="py-3 px-4 w-32 text-center">Nilai (0-100)</th>
                      <th className="py-3 px-4 w-32 text-center">Status KKTP</th>
                      <th className="py-3 px-4">Capaian Kompetensi / Catatan Guru</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {grades.map((g, idx) => {
                      const isAssessed = g.nilai_angka !== null;
                      const isPassed = isAssessed && g.nilai_angka! >= kktp;

                      return (
                        <tr
                          key={g.siswa_id}
                          className="hover:bg-blue-50/30 transition-colors group"
                        >
                          <td className="py-2.5 px-3 text-center text-slate-400 font-medium">
                            {g.nomor_absen || idx + 1}
                          </td>
                          <td className="py-2.5 px-4 font-mono text-slate-600 font-medium">
                            {g.siswa_nis}
                          </td>
                          <td className="py-2.5 px-4 font-bold text-slate-800">{g.siswa_nama}</td>
                          <td className="py-2.5 px-4 text-center">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="1"
                              value={g.nilai_angka !== null ? g.nilai_angka : ""}
                              onChange={(e) => handleGradeChange(g.siswa_id, e.target.value)}
                              placeholder="-"
                              className={`w-20 h-9 px-2 text-center font-bold rounded-xl border transition-all text-sm outline-none ${
                                !isAssessed
                                  ? "border-slate-200 text-slate-400 placeholder:text-slate-300"
                                  : isPassed
                                    ? "border-emerald-300 bg-emerald-50/40 text-emerald-800 focus:ring-2 focus:ring-emerald-500/20"
                                    : "border-amber-300 bg-amber-50/40 text-amber-800 focus:ring-2 focus:ring-amber-500/20"
                              }`}
                            />
                          </td>
                          <td className="py-2.5 px-4 text-center">
                            {!isAssessed ? (
                              <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-400">
                                Belum dinilai
                              </span>
                            ) : isPassed ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700">
                                <CheckCircle2 className="h-3 w-3" />
                                Tuntas
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700">
                                <AlertCircle className="h-3 w-3" />
                                Perlu Bimbingan
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-4">
                            <input
                              type="text"
                              value={g.capaian_kompetensi || ""}
                              onChange={(e) => handleCompetenceChange(g.siswa_id, e.target.value)}
                              placeholder="Cth: Menguasai algoritma percabangan..."
                              className="w-full h-8 px-2.5 rounded-lg border border-slate-200/80 text-xs text-slate-700 placeholder:text-slate-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-400/30 outline-none transition-all"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Catatan / Alasan Koreksi Audit */}
              {showCorrectionInput && (
                <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/70 text-xs space-y-1.5">
                  <div className="flex items-center gap-1.5 text-amber-800 font-bold">
                    <HelpCircle className="h-4 w-4 text-amber-600" />
                    Catatan Perubahan / Koreksi Nilai (Audit Trail)
                  </div>
                  <input
                    type="text"
                    value={alasanKoreksi}
                    onChange={(e) => setAlasanKoreksi(e.target.value)}
                    placeholder="Contoh: Koreksi remedial siswa, input nilai susulan ulangan harian..."
                    className="w-full h-8 px-3 rounded-lg border border-amber-300 bg-white text-xs text-slate-800 focus:ring-2 focus:ring-amber-500/20 outline-none"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-slate-500">
            * Invariant: <span className="font-semibold">Missing Grade ≠ Zero Grade</span>. Kolom
            kosong berarti belum dinilai (bukan nilai nol).
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isPending}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>

            <button
              type="button"
              onClick={() => handleSave(false)}
              disabled={isPending || isLoadingData}
              className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 active:scale-98 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {isPending ? "Menyimpan..." : "Simpan Draf"}
            </button>

            <button
              type="button"
              onClick={() => handleSave(true)}
              disabled={isPending || isLoadingData}
              className="px-5 py-2 text-xs font-bold text-white bg-[#2563EB] hover:bg-blue-700 active:scale-98 rounded-xl shadow-xs shadow-blue-500/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              {isPending ? "Memproses..." : "Simpan & Publikasikan"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

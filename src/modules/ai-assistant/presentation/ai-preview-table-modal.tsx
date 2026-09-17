"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import { useSyncExternalStore } from "react";
import { Sparkles, CheckCircle2, Trash2, Plus, User, AlertCircle, Loader2, X } from "lucide-react";
import { StudentDraftFromAi, ClassExtractionResult } from "../domain/ai-types";
import { confirmClassCreationAction } from "@/app/actions/smart-onboarding-actions";

interface AiPreviewTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (rombelId: string, namaRombel: string) => void;
  extractionData: ClassExtractionResult | null;
}

export function AiPreviewTableModal({
  isOpen,
  onClose,
  onSuccess,
  extractionData,
}: AiPreviewTableModalProps) {
  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  if (!isMounted || !isOpen || !extractionData) return null;

  return createPortal(
    <AiPreviewModalDialog
      key={extractionData.requestId}
      onClose={onClose}
      onSuccess={onSuccess}
      extractionData={extractionData}
    />,
    document.body
  );
}

interface AiPreviewModalDialogProps {
  onClose: () => void;
  onSuccess: (rombelId: string, namaRombel: string) => void;
  extractionData: ClassExtractionResult;
}

function AiPreviewModalDialog({ onClose, onSuccess, extractionData }: AiPreviewModalDialogProps) {
  const [namaKelas, setNamaKelas] = useState(extractionData.nama_kelas || "X MIPA 1");
  const [mataPelajaran, setMataPelajaran] = useState(extractionData.mata_pelajaran || "Matematika");
  const [tingkatKelas, setTingkatKelas] = useState("10");
  const [students, setStudents] = useState<StudentDraftFromAi[]>(extractionData.siswa || []);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function handleNameChange(index: number, val: string) {
    const next = [...students];
    next[index].nama_lengkap = val;
    setStudents(next);
  }

  function handleGenderToggle(index: number) {
    const next = [...students];
    next[index].jenis_kelamin = next[index].jenis_kelamin === "L" ? "P" : "L";
    setStudents(next);
  }

  function handleDeleteStudent(index: number) {
    setStudents(students.filter((_, i) => i !== index));
  }

  function handleAddEmptyRow() {
    setStudents([
      ...students,
      {
        nama_lengkap: `Siswa Baru ${students.length + 1}`,
        jenis_kelamin: "L",
      },
    ]);
  }

  async function handleConfirm() {
    if (!namaKelas.trim()) {
      setErrorMessage("Nama kelas tidak boleh kosong.");
      return;
    }
    if (!mataPelajaran.trim()) {
      setErrorMessage("Mata pelajaran tidak boleh kosong.");
      return;
    }
    if (students.length === 0) {
      setErrorMessage("Minimal harus ada 1 orang siswa terdaftar.");
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    const payload = {
      requestId: extractionData?.requestId,
      nama_kelas: namaKelas.trim(),
      mata_pelajaran: mataPelajaran.trim(),
      tingkat_kelas: tingkatKelas,
      siswa: students,
    };

    const res = await confirmClassCreationAction(payload);
    setSubmitting(false);

    if (!res.success || !res.data) {
      setErrorMessage(res.error || "Gagal menerbitkan kelas.");
      return;
    }

    onSuccess(res.data.rombelId, res.data.namaRombel);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-start justify-between bg-slate-900/90">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Hasil Ekstraksi Asisten AI
            </div>
            <h2 className="text-xl font-bold text-white">
              Pratinjau & Konfirmasi Kelas ({students.length} Siswa Terdeteksi)
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Periksa nama siswa di bawah ini. Anda dapat mengedit nama atau mengubah gender sebelum
              menyimpan ke database.
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="mx-6 mt-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form Inputs (Nama Kelas & Mapel) */}
        <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-slate-800 bg-slate-950/40">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Nama Kelas <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={namaKelas}
              onChange={(e) => setNamaKelas(e.target.value)}
              placeholder="Contoh: X MIPA 1"
              className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Mata Pelajaran <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={mataPelajaran}
              onChange={(e) => setMataPelajaran(e.target.value)}
              placeholder="Contoh: Matematika"
              className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Tingkat Kelas
            </label>
            <select
              value={tingkatKelas}
              onChange={(e) => setTingkatKelas(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="10">Kelas 10 (Fase E)</option>
              <option value="11">Kelas 11 (Fase F)</option>
              <option value="12">Kelas 12 (Fase F)</option>
            </select>
          </div>
        </div>

        {/* Table of Extracted Students */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Daftar Siswa ({students.length})
            </span>
            <button
              onClick={handleAddEmptyRow}
              type="button"
              className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-sky-500/10 border border-sky-500/20"
            >
              <Plus className="w-3.5 h-3.5" />
              Tambah Baris
            </button>
          </div>

          <div className="border border-slate-800 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3 w-12 text-center">No</th>
                  <th className="py-2.5 px-3">Nama Siswa</th>
                  <th className="py-2.5 px-3 w-28 text-center">L / P</th>
                  <th className="py-2.5 px-3 w-12 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                {students.map((st, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2 px-3 text-center text-slate-500 font-medium">{idx + 1}</td>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={st.nama_lengkap}
                        onChange={(e) => handleNameChange(idx, e.target.value)}
                        className="w-full bg-slate-950/50 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-sky-500"
                      />
                    </td>
                    <td className="py-2 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleGenderToggle(idx)}
                        className={`px-2.5 py-0.5 rounded-md font-bold text-[11px] transition-colors ${
                          st.jenis_kelamin === "L"
                            ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                            : "bg-pink-500/20 text-pink-300 border border-pink-500/30"
                        }`}
                      >
                        {st.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"}
                      </button>
                    </td>
                    <td className="py-2 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleDeleteStudent(idx)}
                        className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors"
                        title="Hapus baris"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 sm:p-6 border-t border-slate-800 bg-slate-900/95 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400 text-center sm:text-left">
            Kelas akan diterbitkan ke daftar jadwal KBM dan siap langsung diabsen.
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="w-full sm:w-auto px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={submitting}
              className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-sky-500 hover:from-emerald-400 hover:to-sky-400 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Menerbitkan Kelas...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Setujui & Terbitkan Kelas ({students.length} Siswa)
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

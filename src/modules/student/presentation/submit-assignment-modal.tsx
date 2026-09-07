"use client";

/**
 * Ruang Pintar — Submit Assignment Modal (Phase 15 / M15)
 *
 * Modal dialog penyerahan tugas mandiri siswa:
 * - Dukungan jawaban teks & unggahan berkas dropzone
 * - Validasi batas waktu & penanda keterlambatan otomatis
 * - Peninjauan lampiran tugas guru & umpan balik koreksi
 */

import React, { useState, useTransition, useRef } from "react";
import {
  BookOpen,
  Calendar,
  Clock,
  Download,
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  X,
  FileCheck,
} from "lucide-react";
import { StudentAssignmentItem } from "../domain/student-experience-types";
import { submitStudentAssignmentAction } from "@/app/actions/student-experience-actions";

export interface SubmitAssignmentModalProps {
  assignment: StudentAssignmentItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface SubmitAssignmentModalContentProps {
  assignment: StudentAssignmentItem;
  onClose: () => void;
  onSuccess?: () => void;
}

function SubmitAssignmentModalContent({
  assignment,
  onClose,
  onSuccess,
}: SubmitAssignmentModalContentProps) {
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [teksJawaban, setTeksJawaban] = useState<string>(assignment.pengumpulan?.teksJawaban || "");
  const [catatanSiswa, setCatatanSiswa] = useState<string>(
    assignment.pengumpulan?.catatanSiswa || ""
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isSubmitted = assignment.statusPengerjaan === "SUDAH_DIKUMPULKAN";
  const isPastDeadline = assignment.isPastDeadline;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!teksJawaban.trim() && !selectedFile && !assignment.pengumpulan?.berkas) {
      setErrorMsg("Harap masukkan teks jawaban atau unggah berkas pengumpulan tugas.");
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append("publikasi_tugas_id", assignment.id);
      formData.append("teks_jawaban", teksJawaban);
      formData.append("catatan_siswa", catatanSiswa);

      if (selectedFile) {
        formData.append("file", selectedFile);
      } else if (assignment.pengumpulan?.berkas) {
        formData.append("berkas_id", assignment.pengumpulan.berkas.id);
      }

      const res = await submitStudentAssignmentAction(null, formData);

      if (res.success) {
        setSuccessMsg(res.message);
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 1200);
      } else {
        setErrorMsg(res.message);
      }
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrorMsg("Ukuran berkas melebihi batas maksimal 10 MB.");
        return;
      }
      setSelectedFile(file);
      setErrorMsg(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white border border-slate-200/80 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4 border-b border-slate-100 bg-slate-50/50">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-lg bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-bold">
                {assignment.mataPelajaranNama}
              </span>
              {isPastDeadline && (
                <span className="px-2.5 py-0.5 rounded-lg bg-rose-50 border border-rose-200/80 text-rose-700 text-xs font-bold">
                  Lewat Batas Waktu
                </span>
              )}
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-[#0F172A] tracking-tight">
              {assignment.judul}
            </h2>
            <p className="text-xs text-slate-500">
              Guru Pengampu: <strong>{assignment.guruNama}</strong>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Informational Cards & Petunjuk Guru */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-2.5">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Petunjuk Pengerjaan Tugas:
            </h4>
            <div className="text-xs sm:text-sm text-slate-600 whitespace-pre-line leading-relaxed">
              {assignment.petunjuk}
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-200/60 text-xs text-slate-500 font-medium">
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-[#2563EB]" />
                <span>Batas: {assignment.batasWaktuFormatted}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-[#2563EB]" />
                <span>Metode: {assignment.tipePenyerahan}</span>
              </div>
              {assignment.izinkanTerlambat && (
                <span className="text-emerald-700 font-semibold">✓ Keterlambatan Ditoleransi</span>
              )}
            </div>
          </div>

          {/* Lampiran Soal dari Guru (Jika Ada) */}
          {assignment.lampiranBerkas && (
            <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-200/70 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <FileCheck className="h-5 w-5 text-[#2563EB] shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {assignment.lampiranBerkas.namaFileAsli}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Lampiran Panduan Guru •{" "}
                    {Math.round(assignment.lampiranBerkas.ukuranByte / 1024)} KB
                  </p>
                </div>
              </div>
              <a
                href={`/api/berkas/${assignment.lampiranBerkas.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-blue-50 border border-blue-200 text-[#2563EB] text-xs font-bold shadow-2xs transition-all flex items-center gap-1 shrink-0"
              >
                <Download className="h-3.5 w-3.5" />
                Unduh
              </a>
            </div>
          )}

          {/* Status Penyerahan Sebelumnya (Jika Pernah Mengumpulkan) */}
          {assignment.pengumpulan && (
            <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-800 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Status:{" "}
                  {assignment.pengumpulan.status === "TERLAMBAT"
                    ? "Dikumpulkan Terlambat"
                    : "Telah Dikumpulkan"}
                </span>
                <span className="text-emerald-700">
                  {assignment.pengumpulan.tanggalKumpulFormatted}
                </span>
              </div>
              {assignment.pengumpulan.catatanGuru && (
                <div className="pt-2 mt-1 border-t border-emerald-200 text-emerald-900">
                  <strong>Catatan Guru:</strong> {assignment.pengumpulan.catatanGuru}
                </div>
              )}
            </div>
          )}

          {/* Form Submission */}
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Input Teks Jawaban */}
            <div className="space-y-1.5">
              <label htmlFor="teksJawaban" className="text-xs font-bold text-slate-700 block">
                Teks Jawaban / Uraian Siswa:
              </label>
              <textarea
                id="teksJawaban"
                rows={5}
                placeholder="Tuliskan jawaban, penjelasan, atau ringkasan tugas Anda di sini..."
                value={teksJawaban}
                onChange={(e) => setTeksJawaban(e.target.value)}
                className="w-full p-3.5 rounded-2xl border border-slate-200 text-xs sm:text-sm focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] outline-none"
              />
            </div>

            {/* Dropzone Unggah Berkas Jawaban */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Lampiran Berkas Jawaban (PDF, DOCX, ZIP, Gambar maks. 10 MB):
              </label>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.docx,.doc,.zip,.png,.jpg,.jpeg"
              />

              {selectedFile ? (
                <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileText className="h-5 w-5 text-[#2563EB] shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {selectedFile.name}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {Math.round(selectedFile.size / 1024)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="p-1 rounded-lg hover:bg-blue-100 text-slate-500 transition-colors cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : assignment.pengumpulan?.berkas ? (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileText className="h-5 w-5 text-emerald-600 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {assignment.pengumpulan.berkas.namaFileAsli} (Berkas Tersimpan)
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {Math.round(assignment.pengumpulan.berkas.ukuranByte / 1024)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
                  >
                    Ganti Berkas
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="p-6 rounded-2xl border-2 border-dashed border-slate-200 hover:border-[#2563EB] hover:bg-blue-50/40 text-center transition-all cursor-pointer space-y-1.5"
                >
                  <UploadCloud className="h-8 w-8 text-slate-400 mx-auto" />
                  <p className="text-xs font-bold text-slate-700">
                    Klik untuk Memilih Berkas Tugas
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Format didukung: PDF, Word (.docx), Arsip (.zip), Gambar
                  </p>
                </div>
              )}
            </div>

            {/* Catatan Siswa */}
            <div className="space-y-1.5">
              <label htmlFor="catatanSiswa" className="text-xs font-bold text-slate-700 block">
                Catatan untuk Guru (Opsional):
              </label>
              <textarea
                id="catatanSiswa"
                rows={2}
                placeholder="Tuliskan kendala atau catatan tambahan jika ada..."
                value={catatanSiswa}
                onChange={(e) => setCatatanSiswa(e.target.value)}
                className="w-full p-3 rounded-2xl border border-slate-200 text-xs focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] outline-none"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isPending}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
              >
                Tutup
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="px-5 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
              >
                {isPending
                  ? "Menyimpan..."
                  : isSubmitted
                    ? "Perbarui Jawaban Tugas"
                    : "Kumpulkan Tugas Sekarang"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export function SubmitAssignmentModal({
  assignment,
  isOpen,
  onClose,
  onSuccess,
}: SubmitAssignmentModalProps) {
  if (!isOpen || !assignment) return null;

  return (
    <SubmitAssignmentModalContent
      key={assignment.id}
      assignment={assignment}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  );
}

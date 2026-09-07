"use client";

/**
 * Ruang Pintar — Modal Pengajuan Izin / Sakit oleh Wali Murid (Phase 16)
 * Formulir pengajuan dispensasi, surat sakit, atau koreksi data anak.
 */

import * as React from "react";
import { X, FileText, Upload, Calendar, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { LinkedChildSummary, TipePengajuanWali } from "../domain/guardian-types";
import { submitPengajuanWaliAction } from "@/app/actions/guardian-actions";

export interface PengajuanIzinModalProps {
  isOpen: boolean;
  onClose: () => void;
  linkedChildren: LinkedChildSummary[];
  activeChildId: string;
}

export function PengajuanIzinModal({
  isOpen,
  onClose,
  linkedChildren,
  activeChildId,
}: PengajuanIzinModalProps) {
  const [selectedChildId, setSelectedChildId] = React.useState(activeChildId);
  const [tipe, setTipe] = React.useState<TipePengajuanWali>("SAKIT");
  const [judul, setJudul] = React.useState("");
  const [deskripsi, setDeskripsi] = React.useState("");
  const [tanggalMulai, setTanggalMulai] = React.useState(new Date().toISOString().split("T")[0]);
  const [tanggalSelesai, setTanggalSelesai] = React.useState(
    new Date().toISOString().split("T")[0]
  );
  const [file, setFile] = React.useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!judul.trim()) {
      setErrorMessage("Judul permohonan wajib diisi.");
      return;
    }

    if (!deskripsi.trim() || deskripsi.trim().length < 10) {
      setErrorMessage("Uraian permohonan minimal 10 karakter.");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("siswa_id", selectedChildId);
      formData.append("tipe", tipe);
      formData.append("judul", judul);
      formData.append("deskripsi", deskripsi);
      if (tanggalMulai) formData.append("tanggal_mulai", tanggalMulai);
      if (tanggalSelesai) formData.append("tanggal_selesai", tanggalSelesai);
      if (file) formData.append("file", file);

      const res = await submitPengajuanWaliAction(null, formData);

      if (!res.success) {
        setErrorMessage(res.message);
      } else {
        setSuccessMessage("Permohonan berhasil dikirim ke sekolah.");
        setTimeout(() => {
          onClose();
          setSuccessMessage(null);
          setJudul("");
          setDeskripsi("");
          setFile(null);
        }, 1500);
      }
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Terjadi kesalahan saat mengirim formulir."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      data-testid="pengajuan-izin-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Pengajuan Izin & Keterangan</h2>
              <p className="text-xs text-slate-500">
                Layanan komunikasi resmi orang tua / wali ke pihak sekolah
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-700">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-700">
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Child Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Putra / Putri Terkait
            </label>
            <select
              value={selectedChildId}
              onChange={(e) => setSelectedChildId(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
            >
              {linkedChildren.map((child) => (
                <option key={child.siswa_id} value={child.siswa_id}>
                  {child.nama_lengkap} ({child.rombel_nama})
                </option>
              ))}
            </select>
          </div>

          {/* Request Type */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Jenis Permohonan
            </label>
            <select
              value={tipe}
              onChange={(e) => setTipe(e.target.value as TipePengajuanWali)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
            >
              <option value="SAKIT">Surat Izin Sakit (Keterangan Dokter)</option>
              <option value="IZIN_KETIDAKHADIRAN">Izin Tidak Hadir (Acara / Keluarga)</option>
              <option value="CATATAN_KESEHATAN">Catatan Kondisi Kesehatan / Alergi</option>
              <option value="KOREKSI_DATA">Permohonan Koreksi Biodata Siswa</option>
              <option value="LAINNYA">Lainnya</option>
            </select>
          </div>

          {/* Date Range */}
          {(tipe === "SAKIT" || tipe === "IZIN_KETIDAKHADIRAN") && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Mulai Tanggal
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={tanggalMulai}
                    onChange={(e) => setTanggalMulai(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Sampai Tanggal
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={tanggalSelesai}
                    onChange={(e) => setTanggalSelesai(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Subject / Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Judul Permohonan
            </label>
            <input
              type="text"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              placeholder="Contoh: Izin Sakit Demam 2 Hari"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Uraian / Keterangan Lengkap
            </label>
            <textarea
              rows={3}
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              placeholder="Jelaskan kondisi atau alasan permohonan secara jelas..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 resize-none"
            />
          </div>

          {/* Attachment upload */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Lampiran Dokumen / Surat Dokter (Opsional)
            </label>
            <div className="relative border-2 border-dashed border-slate-200 hover:border-[#2563EB]/50 rounded-2xl p-4 text-center transition-colors">
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
              />
              <div className="flex flex-col items-center justify-center gap-1.5 pointer-events-none">
                <Upload className="h-5 w-5 text-slate-400" />
                <span className="text-xs font-bold text-slate-700">
                  {file ? file.name : "Klik atau seret berkas ke sini"}
                </span>
                <span className="text-[10px] text-slate-400">PDF, JPG, atau PNG (Maks. 10 MB)</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#2563EB] hover:bg-[#1D4ED8] shadow-md shadow-blue-500/20 transition-all disabled:opacity-60 flex items-center gap-1.5 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Mengirim...</span>
                </>
              ) : (
                <span>Kirim Permohonan</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

/**
 * Ruang Pintar — M14 Create CBT Exam Modal (Academic Glass UI v1.2)
 *
 * Menyusun Blueprint Ujian CBT:
 * - Konfigurasi Durasi, KKTP, Pengacakan, Jadwal
 * - Pemilihan Butir Soal dari Bank Soal & Penentuan Bobot
 */

import React, { useState, useEffect, useTransition } from "react";
import {
  X,
  Plus,
  Clock,
  Award,
  Shuffle,
  Eye,
  Calendar,
  Layers,
  CheckCircle2,
  FileCheck,
  AlertCircle,
  HelpCircle,
  Key,
  RefreshCw,
} from "lucide-react";
import { BankSoalDTO } from "../domain/cbt-types";
import { getQuestionsAction, createExamAction } from "@/app/actions/cbt-actions";

interface CreateExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  penugasanId: string;
  mapelId?: string;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export function CreateExamModal({
  isOpen,
  onClose,
  penugasanId,
  mapelId,
  onSuccess,
  onError,
}: CreateExamModalProps) {
  const [isPending, startTransition] = useTransition();
  const [bankSoalList, setBankSoalList] = useState<BankSoalDTO[]>([]);
  const [isLoadingBank, setIsLoadingBank] = useState(false);

  // Exam Form
  const [judul, setJudul] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [durasiMenit, setDurasiMenit] = useState(60);
  const [kktp, setKktp] = useState(75);
  const [acakSoal, setAcakSoal] = useState(true);
  const [acakOpsi, setAcakOpsi] = useState(true);
  const [gunakanToken, setGunakanToken] = useState(false);
  const [tokenMasuk, setTokenMasuk] = useState("");
  const [tampilkanNilai, setTampilkanNilai] = useState(true);
  const [waktuMulai, setWaktuMulai] = useState("");
  const [waktuSelesai, setWaktuSelesai] = useState("");

  const generateRandomToken = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let t = "";
    for (let i = 0; i < 6; i++) {
      t += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setTokenMasuk(t);
  };

  // Blueprint Selected Questions
  const [selectedItems, setSelectedItems] = useState<
    Record<string, { selected: boolean; bobot: number }>
  >({});

  const resetForm = () => {
    setJudul("");
    setDeskripsi("");
    setDurasiMenit(60);
    setKktp(75);
    setAcakSoal(true);
    setAcakOpsi(true);
    setGunakanToken(false);
    setTokenMasuk("");
    setTampilkanNilai(true);
    setWaktuMulai("");
    setWaktuSelesai("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;

    getQuestionsAction({ mapelId })
      .then((res) => {
        if (!isMounted) return;
        if (res.success && res.data) {
          setBankSoalList(res.data);
          const initMap: Record<string, { selected: boolean; bobot: number }> = {};
          res.data.forEach((q: BankSoalDTO) => {
            const calculatedBobot =
              (typeof q.versi_aktif === "object" && q.versi_aktif !== null
                ? (q.versi_aktif as any).bobot
                : undefined) ??
              q.bobot_default ??
              1;
            initMap[q.id] = {
              selected: true,
              bobot: calculatedBobot,
            };
          });
          setSelectedItems(initMap);
        }
      })
      .finally(() => {
        if (isMounted) setIsLoadingBank(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, mapelId]);

  const toggleSelect = (questionId: string) => {
    setSelectedItems((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        selected: !prev[questionId]?.selected,
      },
    }));
  };

  const handleBobotChange = (questionId: string, bobot: number) => {
    setSelectedItems((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        bobot: Math.max(1, bobot),
      },
    }));
  };

  const selectedQuestionsCount = Object.values(selectedItems).filter((i) => i.selected).length;
  const totalBobot = Object.values(selectedItems)
    .filter((i) => i.selected)
    .reduce((acc, curr) => acc + curr.bobot, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!judul.trim()) {
      onError("Judul ujian wajib diisi.");
      return;
    }
    if (selectedQuestionsCount === 0) {
      onError("Pilih minimal satu butir soal untuk menyusun ujian.");
      return;
    }

    startTransition(async () => {
      // Build blueprint items
      let nomor = 1;
      const blueprintItems = bankSoalList
        .filter((q) => selectedItems[q.id]?.selected)
        .map((q) => ({
          bank_soal_id: q.id,
          nomor_urut: nomor++,
          bobot_kustom: selectedItems[q.id]?.bobot ?? 1,
        }));

      const payload = {
        penugasan_mengajar_id: penugasanId,
        judul,
        deskripsi: deskripsi || undefined,
        durasi_menit: Number(durasiMenit),
        kktp: Number(kktp),
        acak_soal: acakSoal,
        acak_opsi: acakOpsi,
        gunakan_token: gunakanToken,
        token_masuk:
          gunakanToken && tokenMasuk.trim() ? tokenMasuk.trim().toUpperCase() : undefined,
        tampilkan_nilai: tampilkanNilai,
        waktu_mulai: waktuMulai ? new Date(waktuMulai) : undefined,
        waktu_selesai: waktuSelesai ? new Date(waktuSelesai) : undefined,
        blueprint_soal: blueprintItems,
      };

      const res = await createExamAction(payload);
      if (res.success) {
        onSuccess(res.message);
        handleClose();
      } else {
        onError(res.message);
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-600">
              <FileCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Susun Ujian CBT Baru</h2>
              <p className="text-xs text-slate-500">
                Konfigurasi parameter ujian dan pemilihan butir soal dari Bank Soal
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Main Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Judul Ujian <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={judul}
                onChange={(e) => setJudul(e.target.value)}
                placeholder="Contoh: Penilaian Sumatif Tengah Semester Genap"
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Petunjuk / Deskripsi Ujian
              </label>
              <textarea
                rows={2}
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
                placeholder="Petunjuk pengerjaan bagi siswa..."
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-blue-600" />
                  Durasi (Menit) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min={5}
                  max={300}
                  required
                  value={durasiMenit}
                  onChange={(e) => setDurasiMenit(Number(e.target.value))}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Award className="h-3.5 w-3.5 text-blue-600" />
                  KKTP Kelulusan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  required
                  value={kktp}
                  onChange={(e) => setKktp(Number(e.target.value))}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-blue-600" />
                  Jadwal Mulai (Opsional)
                </label>
                <input
                  type="datetime-local"
                  value={waktuMulai}
                  onChange={(e) => setWaktuMulai(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>
            </div>

            {/* Toggle Rules */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              <label className="flex items-center gap-2.5 p-3 rounded-2xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={acakSoal}
                  onChange={(e) => setAcakSoal(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Acak Urutan Soal</span>
                  <span className="text-[11px] text-slate-500">
                    Tiap siswa dapat urutan berbeda
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-2xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={acakOpsi}
                  onChange={(e) => setAcakOpsi(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Acak Urutan Opsi</span>
                  <span className="text-[11px] text-slate-500">Pilihan A/B/C/D diacak</span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-2xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={tampilkanNilai}
                  onChange={(e) => setTampilkanNilai(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Rilis Nilai Instan</span>
                  <span className="text-[11px] text-slate-500">Siswa lihat skor usai submit</span>
                </div>
              </label>

              {/* Token Ujian Masuk Setting */}
              <div className="md:col-span-3 p-4 rounded-2xl border border-blue-200/70 bg-blue-50/30 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={gunakanToken}
                      onChange={(e) => {
                        setGunakanToken(e.target.checked);
                        if (e.target.checked && !tokenMasuk) generateRandomToken();
                      }}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Key className="h-3.5 w-3.5 text-blue-600" />
                        Wajibkan Token Ujian Masuk (ANBK / Sinkronisasi Pengawas)
                      </span>
                      <p className="text-[11px] text-slate-500">
                        Siswa wajib memasukkan 6 karakter token sebelum dapat membuka soal ujian
                      </p>
                    </div>
                  </label>
                  {gunakanToken && (
                    <button
                      type="button"
                      onClick={generateRandomToken}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-blue-200 text-xs font-bold text-blue-700 hover:bg-blue-50 shadow-2xs transition"
                    >
                      <RefreshCw className="h-3 w-3" />
                      Acak Token Baru
                    </button>
                  )}
                </div>

                {gunakanToken && (
                  <div className="flex items-center gap-3 pt-1">
                    <label className="text-xs font-bold text-slate-700 shrink-0">
                      Token Ujian Aktif:
                    </label>
                    <input
                      type="text"
                      maxLength={8}
                      value={tokenMasuk}
                      onChange={(e) => setTokenMasuk(e.target.value.toUpperCase())}
                      placeholder="Misal: KRYZQA"
                      className="w-36 text-center font-mono font-bold text-sm tracking-widest px-3 py-1.5 rounded-xl border border-blue-300 bg-white text-blue-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
                    />
                    <span className="text-[11px] text-slate-500">
                      Tuliskan kode ini di papan tulis kelas saat ujian dimulai.
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* BLUEPRINT SOAL SELECTION */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-blue-600" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Pilih Butir Soal ({selectedQuestionsCount} terpilih, Total Bobot: {totalBobot})
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">
                Snapshot soal akan dibekukan saat ujian dipublikasikan
              </span>
            </div>

            {isLoadingBank ? (
              <div className="py-8 text-center text-xs text-slate-400">Memuat bank soal...</div>
            ) : bankSoalList.length === 0 ? (
              <div className="p-6 text-center rounded-2xl border border-dashed border-slate-200 text-xs text-slate-500">
                Bank soal belum memiliki butir soal untuk mata pelajaran ini. Silakan tambahkan
                butir soal terlebih dahulu di modal Bank Soal.
              </div>
            ) : (
              <div className="max-h-60 overflow-y-auto space-y-2 pr-1 divide-y divide-slate-100">
                {bankSoalList.map((q, idx) => {
                  const isChecked = selectedItems[q.id]?.selected ?? false;
                  const currentBobot = selectedItems[q.id]?.bobot ?? q.bobot_default ?? 1;
                  const activeVer =
                    (typeof q.versi_aktif === "object" ? q.versi_aktif : null) ||
                    (Array.isArray(q.versi) ? q.versi[0] : null);

                  return (
                    <div
                      key={q.id}
                      className={`p-3 rounded-xl border transition flex items-center justify-between gap-3 ${
                        isChecked ? "bg-blue-50/40 border-blue-200" : "bg-white border-slate-200"
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelect(q.id)}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                              #{idx + 1}
                            </span>
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100/80">
                              {(q.jenis_soal || q.tipe_soal || "").replace(/_/g, " ")}
                            </span>
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                              {q.tingkat_kesulitan}
                            </span>
                          </div>
                          <p className="text-xs text-slate-800 line-clamp-1">
                            {activeVer?.pertanyaan || q.pertanyaan || q.judul || "Pertanyaan"}
                          </p>
                        </div>
                      </div>

                      {isChecked && (
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[11px] text-slate-500 font-medium">Bobot:</span>
                          <input
                            type="number"
                            min={1}
                            max={100}
                            value={currentBobot}
                            onChange={(e) => handleBobotChange(q.id, Number(e.target.value))}
                            className="w-14 text-center text-xs px-2 py-1 rounded-lg border border-blue-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isPending || selectedQuestionsCount === 0}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-xs hover:bg-blue-700 transition disabled:opacity-50"
            >
              {isPending ? (
                "Menyimpan..."
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Buat Ujian CBT (Draft)
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

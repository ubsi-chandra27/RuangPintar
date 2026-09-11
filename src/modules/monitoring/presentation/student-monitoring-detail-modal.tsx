"use client";

import * as React from "react";
import Image from "next/image";
import {
  X,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  BookOpen,
  GraduationCap,
  FileText,
  Clock,
  User,
  Plus,
  ArrowRight,
  TrendingUp,
  Award,
  AlertCircle,
  Phone,
} from "lucide-react";
import {
  getStudentMonitoringDetailAction,
  updateFollowUpStatusAction,
} from "@/app/actions/monitoring-actions";
import { StudentMonitoringDetailDTO } from "../domain/monitoring-types";

export interface StudentMonitoringDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  rombelId: string;
  siswaId: string | null;
  onOpenCreateNote: (siswaId: string) => void;
  onOpenCreateFollowUp: (catatanId: string, catatanJudul: string, siswaNama: string) => void;
  onRefreshOverview: () => void;
}

export function StudentMonitoringDetailModal({
  isOpen,
  onClose,
  rombelId,
  siswaId,
  onOpenCreateNote,
  onOpenCreateFollowUp,
  onRefreshOverview,
}: StudentMonitoringDetailModalProps) {
  const [data, setData] = React.useState<StudentMonitoringDetailDTO | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState<"presensi" | "tugas" | "nilai" | "catatan">(
    "presensi"
  );
  const [isUpdatingStatus, setIsUpdatingStatus] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!isOpen || !siswaId) return;

    let isMounted = true;

    getStudentMonitoringDetailAction(rombelId, siswaId)
      .then((res) => {
        if (!isMounted) return;
        if (res.success && res.data) {
          setData(res.data as StudentMonitoringDetailDTO);
        } else {
          setErrorMsg(res.message || "Gagal memuat rincian siswa.");
        }
      })
      .catch(() => {
        if (isMounted) setErrorMsg("Terjadi kendala jaringan saat memuat rincian siswa.");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, rombelId, siswaId]);

  if (!isOpen || !siswaId) return null;

  const handleToggleFollowUp = async (followUpId: string, currentStatus: string) => {
    setIsUpdatingStatus(followUpId);
    try {
      const newStatus = currentStatus === "SELESAI" ? "PROSES" : "SELESAI";
      const res = await updateFollowUpStatusAction({
        id: followUpId,
        status: newStatus,
        hasil: newStatus === "SELESAI" ? "Telah diselesaikan oleh wali kelas." : null,
      });

      if (res.success) {
        const refreshRes = await getStudentMonitoringDetailAction(rombelId, siswaId);
        if (refreshRes.success && refreshRes.data) {
          setData(refreshRes.data as StudentMonitoringDetailDTO);
        }
        onRefreshOverview();
      }
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Modal */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-600/30 border border-blue-400/40 text-blue-200 font-black text-sm flex items-center justify-center shrink-0 overflow-hidden">
              {data?.siswa.foto_url ? (
                <Image
                  src={data.siswa.foto_url}
                  alt={data.siswa.nama_lengkap}
                  width={40}
                  height={40}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span>
                  {data?.siswa.nama_lengkap
                    ? data.siswa.nama_lengkap.slice(0, 2).toUpperCase()
                    : "SW"}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-white truncate">
                  {data?.siswa.nama_lengkap || "Memuat siswa..."}
                </h2>
                {data && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      data.status_perhatian === "KRITIS"
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                        : data.status_perhatian === "PERHATIAN"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          : data.status_perhatian === "BERPRESTASI"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                    }`}
                  >
                    {data.status_perhatian}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                NIS: {data?.siswa.nis || "-"} • NISN: {data?.siswa.nisn || "-"} • Rombel:{" "}
                {data?.rombel.nama || "-"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onOpenCreateNote(siswaId)}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Beri Catatan</span>
            </button>
            <button
              onClick={onClose}
              type="button"
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 border-b border-slate-200 bg-slate-50/70 flex items-center gap-2 overflow-x-auto shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("presensi")}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all shrink-0 ${
              activeTab === "presensi"
                ? "border-blue-600 text-blue-600 bg-white shadow-2xs"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Clock className="h-4 w-4" />
            <span>Presensi Sesi ({data?.presensi.persentase_kehadiran ?? 0}%)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("tugas")}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all shrink-0 ${
              activeTab === "tugas"
                ? "border-blue-600 text-blue-600 bg-white shadow-2xs"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>Tugas ({data?.tugas.persentase_tuntas ?? 0}%)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("nilai")}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all shrink-0 ${
              activeTab === "nilai"
                ? "border-blue-600 text-blue-600 bg-white shadow-2xs"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <GraduationCap className="h-4 w-4" />
            <span>Nilai Asesmen ({data?.nilai.rerata_nilai ?? "-"})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("catatan")}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all shrink-0 ${
              activeTab === "catatan"
                ? "border-blue-600 text-blue-600 bg-white shadow-2xs"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>Pembinaan & Tindak Lanjut ({data?.catatan_list.length ?? 0})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {isLoading && (
            <div className="py-16 text-center space-y-2">
              <div className="h-8 w-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin mx-auto" />
              <p className="text-xs text-slate-400 font-medium">Memuat data holistik siswa...</p>
            </div>
          )}

          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {!isLoading && data && (
            <>
              {/* Alert Rekomendasi jika ada perhatian */}
              {data.rekomendasi_perhatian.length > 0 && (
                <div
                  className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                    data.status_perhatian === "KRITIS"
                      ? "bg-rose-50 border-rose-200 text-rose-900"
                      : "bg-amber-50 border-amber-200 text-amber-900"
                  }`}
                >
                  <AlertCircle
                    className={`h-5 w-5 shrink-0 mt-0.5 ${
                      data.status_perhatian === "KRITIS" ? "text-rose-600" : "text-amber-600"
                    }`}
                  />
                  <div className="space-y-1 min-w-0">
                    <h4 className="text-xs font-bold">
                      Sorotan Perhatian Wali Kelas ({data.status_perhatian}):
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {data.rekomendasi_perhatian.map((rek, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-white/80 border border-current text-[11px] font-semibold"
                        >
                          • {rek}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Data Wali / Orang Tua */}
              {(data.siswa.nama_wali || data.siswa.telepon_wali) && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-slate-500" />
                    <span>
                      Wali: <strong>{data.siswa.nama_wali || "Tidak tercatat"}</strong>
                    </span>
                  </div>
                  {data.siswa.telepon_wali && (
                    <a
                      href={`https://wa.me/${data.siswa.telepon_wali.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold border border-emerald-200 flex items-center gap-1.5 transition-colors"
                    >
                      <Phone className="h-3 w-3" />
                      <span>{data.siswa.telepon_wali}</span>
                    </a>
                  )}
                </div>
              )}

              {/* SUB-TAB 1: PRESENSI */}
              {activeTab === "presensi" && (
                <div className="space-y-4">
                  {/* KPI Presensi Bar */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
                      <span className="text-[10px] font-bold text-blue-600 uppercase">
                        Kehadiran
                      </span>
                      <span className="text-xl font-black text-blue-900 block mt-0.5">
                        {data.presensi.persentase_kehadiran}%
                      </span>
                      <span className="text-[10px] text-blue-700">
                        {data.presensi.hadir} dari {data.presensi.total_sesi} sesi
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-100">
                      <span className="text-[10px] font-bold text-rose-600 uppercase">
                        Alpha (Tanpa Ket.)
                      </span>
                      <span className="text-xl font-black text-rose-900 block mt-0.5">
                        {data.presensi.alpha} Sesi
                      </span>
                      <span className="text-[10px] text-rose-700">
                        {data.presensi.alpha >= 2 ? "Perlu Pemanggilan" : "Waspada"}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
                      <span className="text-[10px] font-bold text-amber-600 uppercase">
                        Izin & Sakit
                      </span>
                      <span className="text-xl font-black text-amber-900 block mt-0.5">
                        {data.presensi.izin + data.presensi.sakit} Sesi
                      </span>
                      <span className="text-[10px] text-amber-700">
                        Izin: {data.presensi.izin}, Sakit: {data.presensi.sakit}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100">
                      <span className="text-[10px] font-bold text-indigo-600 uppercase">
                        Terlambat / Disp.
                      </span>
                      <span className="text-xl font-black text-indigo-900 block mt-0.5">
                        {data.presensi.terlambat + data.presensi.dispensasi} Sesi
                      </span>
                      <span className="text-[10px] text-indigo-700">
                        Terlambat: {data.presensi.terlambat}
                      </span>
                    </div>
                  </div>

                  {/* Riwayat Sesi */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-800">
                      Riwayat 20 Sesi KBM Terakhir
                    </h4>
                    {data.presensi_breakdown.length === 0 ? (
                      <p className="text-xs text-slate-400 p-4 text-center bg-slate-50 rounded-xl">
                        Belum ada riwayat sesi presensi untuk rombel ini.
                      </p>
                    ) : (
                      <div className="rounded-xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
                        {data.presensi_breakdown.map((item, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 bg-white hover:bg-slate-50 flex items-center justify-between text-xs gap-3"
                          >
                            <div className="min-w-0">
                              <span className="font-bold text-slate-900 block truncate">
                                {item.mata_pelajaran}
                              </span>
                              <span className="text-[11px] text-slate-500">
                                {new Date(item.tanggal).toLocaleDateString("id-ID", {
                                  weekday: "short",
                                  day: "numeric",
                                  month: "short",
                                })}{" "}
                                • Pengampu: {item.guru_nama}
                              </span>
                            </div>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-black uppercase shrink-0 ${
                                item.status === "HADIR"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : item.status === "ALPHA"
                                    ? "bg-rose-100 text-rose-800 font-bold"
                                    : item.status === "SAKIT"
                                      ? "bg-amber-100 text-amber-800"
                                      : item.status === "IZIN"
                                        ? "bg-blue-100 text-blue-800"
                                        : "bg-purple-100 text-purple-800"
                              }`}
                            >
                              {item.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SUB-TAB 2: TUGAS */}
              {activeTab === "tugas" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
                      <span className="text-[10px] font-bold text-blue-600 uppercase">
                        Ketuntasan Tugas
                      </span>
                      <span className="text-xl font-black text-blue-900 block mt-0.5">
                        {data.tugas.persentase_tuntas}%
                      </span>
                      <span className="text-[10px] text-blue-700">
                        {data.tugas.dikumpulkan} dari {data.tugas.total_tugas} tugas terkumpul
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                      <span className="text-[10px] font-bold text-emerald-600 uppercase">
                        Tepat Waktu
                      </span>
                      <span className="text-xl font-black text-emerald-900 block mt-0.5">
                        {data.tugas.tepat_waktu} Tugas
                      </span>
                      <span className="text-[10px] text-emerald-700">
                        Terlambat: {data.tugas.terlambat}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-100">
                      <span className="text-[10px] font-bold text-rose-600 uppercase">
                        Belum Mengumpulkan
                      </span>
                      <span className="text-xl font-black text-rose-900 block mt-0.5">
                        {data.tugas.belum_mengumpulkan} Tugas
                      </span>
                      <span className="text-[10px] text-rose-700">
                        {data.tugas.belum_mengumpulkan > 0 ? "Perlu Ditagih" : "Semua Tuntas"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-800">
                      Daftar Tugas Lintas Mata Pelajaran
                    </h4>
                    {data.tugas_breakdown.length === 0 ? (
                      <p className="text-xs text-slate-400 p-4 text-center bg-slate-50 rounded-xl">
                        Belum ada tugas yang diterbitkan untuk rombel ini.
                      </p>
                    ) : (
                      <div className="rounded-xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
                        {data.tugas_breakdown.map((t, idx) => (
                          <div
                            key={idx}
                            className="p-3 bg-white hover:bg-slate-50 flex items-center justify-between text-xs gap-3"
                          >
                            <div className="min-w-0">
                              <span className="font-bold text-slate-900 block truncate">
                                {t.judul}
                              </span>
                              <span className="text-[11px] text-slate-500">
                                {t.mata_pelajaran} • Tenggat:{" "}
                                {t.batas_waktu
                                  ? new Date(t.batas_waktu).toLocaleDateString("id-ID", {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                    })
                                  : "Tidak ada"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {t.nilai !== null && (
                                <span className="font-bold text-blue-700 px-2 py-0.5 rounded bg-blue-50">
                                  Nilai: {t.nilai}
                                </span>
                              )}
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                  t.status_pengumpulan === "DIKUMPULKAN"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : t.status_pengumpulan === "TERLAMBAT"
                                      ? "bg-amber-100 text-amber-800"
                                      : "bg-rose-100 text-rose-800"
                                }`}
                              >
                                {t.status_pengumpulan}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SUB-TAB 3: NILAI ASESMEN */}
              {activeTab === "nilai" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
                      <span className="text-[10px] font-bold text-blue-600 uppercase">
                        Rerata Nilai Asesmen
                      </span>
                      <span className="text-xl font-black text-blue-900 block mt-0.5">
                        {data.nilai.rerata_nilai !== null ? data.nilai.rerata_nilai : "-"}
                      </span>
                      <span className="text-[10px] text-blue-700">
                        Dari {data.nilai.dinilai} asesmen dinilai
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                      <span className="text-[10px] font-bold text-emerald-600 uppercase">
                        Ketuntasan KKTP
                      </span>
                      <span className="text-xl font-black text-emerald-900 block mt-0.5">
                        {data.nilai.persentase_kktp}%
                      </span>
                      <span className="text-[10px] text-emerald-700">
                        {data.nilai.jumlah_tuntas_kktp} tuntas, {data.nilai.jumlah_belum_tuntas}{" "}
                        belum
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100">
                      <span className="text-[10px] font-bold text-indigo-600 uppercase">
                        Status Asesmen
                      </span>
                      <span className="text-xl font-black text-indigo-900 block mt-0.5">
                        {data.nilai.jumlah_belum_tuntas === 0 && data.nilai.dinilai > 0
                          ? "Semua Tuntas"
                          : `${data.nilai.jumlah_belum_tuntas} Remedial`}
                      </span>
                      <span className="text-[10px] text-indigo-700">
                        Total {data.nilai.total_asesmen} asesmen resmi
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-800">
                      Daftar Capaian Asesmen Terpublikasi
                    </h4>
                    {data.nilai_breakdown.length === 0 ? (
                      <p className="text-xs text-slate-400 p-4 text-center bg-slate-50 rounded-xl">
                        Belum ada nilai asesmen yang dipublikasikan untuk rombel ini.
                      </p>
                    ) : (
                      <div className="rounded-xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
                        {data.nilai_breakdown.map((nb, idx) => (
                          <div
                            key={idx}
                            className="p-3 bg-white hover:bg-slate-50 flex items-center justify-between text-xs gap-3"
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-900 truncate">
                                  {nb.judul}
                                </span>
                                <span className="px-1.5 py-0.2 rounded bg-slate-100 text-[9px] font-bold text-slate-600">
                                  {nb.kategori}
                                </span>
                              </div>
                              <span className="text-[11px] text-slate-500">
                                {nb.mata_pelajaran} • KKTP: {nb.kktp}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-sm font-black text-slate-900">
                                {nb.nilai_angka !== null ? nb.nilai_angka : "-"}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                  nb.nilai_angka === null
                                    ? "bg-slate-100 text-slate-500"
                                    : nb.apakah_tuntas
                                      ? "bg-emerald-100 text-emerald-800"
                                      : "bg-rose-100 text-rose-800"
                                }`}
                              >
                                {nb.nilai_angka === null
                                  ? "Belum Dinilai"
                                  : nb.apakah_tuntas
                                    ? "Tuntas"
                                    : "Belum Tuntas"}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SUB-TAB 4: CATATAN PEMBINAAN & TINDAK LANJUT */}
              {activeTab === "catatan" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-800">
                      Riwayat Catatan & Tindak Lanjut Pembinaan
                    </h4>
                    <button
                      type="button"
                      onClick={() => onOpenCreateNote(siswaId)}
                      className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold flex items-center gap-1 transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Tambah Catatan Baru</span>
                    </button>
                  </div>

                  {data.catatan_list.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
                      <FileText className="h-8 w-8 text-slate-300 mx-auto" />
                      <p className="text-xs text-slate-500 font-medium">
                        Belum ada catatan pembinaan khusus untuk siswa ini.
                      </p>
                      <button
                        type="button"
                        onClick={() => onOpenCreateNote(siswaId)}
                        className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700"
                      >
                        Buat Catatan Sekarang
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {data.catatan_list.map((note) => (
                        <div
                          key={note.id}
                          className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h5 className="text-xs font-bold text-slate-900">{note.judul}</h5>
                                <span
                                  className={`px-2 py-0.2 rounded text-[10px] font-black uppercase ${
                                    note.tingkat_urgensi === "KRITIS"
                                      ? "bg-rose-100 text-rose-800"
                                      : note.tingkat_urgensi === "TINGGI"
                                        ? "bg-amber-100 text-amber-800"
                                        : "bg-blue-100 text-blue-800"
                                  }`}
                                >
                                  {note.tingkat_urgensi}
                                </span>
                                <span className="px-1.5 py-0.2 rounded bg-slate-100 text-[10px] font-bold text-slate-600">
                                  {note.kategori}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                Dicatat oleh {note.penulis_nama} ({note.penulis_peran}) •{" "}
                                {new Date(note.created_at).toLocaleDateString("id-ID", {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                })}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                onOpenCreateFollowUp(note.id, note.judul, data.siswa.nama_lengkap)
                              }
                              className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-[10px] font-bold text-slate-600 shrink-0 flex items-center gap-1 transition-colors"
                            >
                              <Plus className="h-3 w-3" />
                              <span>Tindak Lanjut</span>
                            </button>
                          </div>

                          <p className="text-xs text-slate-700 bg-slate-50/70 p-3 rounded-lg leading-relaxed">
                            {note.isi}
                          </p>

                          {/* Tindak Lanjut List */}
                          {note.tindak_lanjut.length > 0 && (
                            <div className="pt-2 border-t border-slate-100 space-y-2">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                Rencana Tindak Lanjut ({note.tindak_lanjut.length})
                              </span>
                              <div className="space-y-1.5">
                                {note.tindak_lanjut.map((tl) => (
                                  <div
                                    key={tl.id}
                                    className="p-2.5 rounded-lg bg-blue-50/40 border border-blue-100 flex items-center justify-between gap-3 text-xs"
                                  >
                                    <div className="min-w-0">
                                      <span className="font-semibold text-slate-800 block">
                                        {tl.tindakan}
                                      </span>
                                      {tl.target_tanggal && (
                                        <span className="text-[10px] text-slate-500">
                                          Target:{" "}
                                          {new Date(tl.target_tanggal).toLocaleDateString("id-ID", {
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric",
                                          })}
                                        </span>
                                      )}
                                      {tl.hasil && (
                                        <p className="text-[11px] text-emerald-800 italic mt-0.5">
                                          Hasil: {tl.hasil}
                                        </p>
                                      )}
                                    </div>

                                    <button
                                      type="button"
                                      disabled={isUpdatingStatus === tl.id}
                                      onClick={() => handleToggleFollowUp(tl.id, tl.status)}
                                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase transition-all shrink-0 ${
                                        tl.status === "SELESAI"
                                          ? "bg-emerald-600 text-white hover:bg-emerald-700"
                                          : "bg-amber-100 text-amber-800 hover:bg-emerald-100 hover:text-emerald-800"
                                      }`}
                                    >
                                      {isUpdatingStatus === tl.id ? (
                                        <span>...</span>
                                      ) : tl.status === "SELESAI" ? (
                                        "✓ Selesai"
                                      ) : (
                                        "Tandai Selesai"
                                      )}
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

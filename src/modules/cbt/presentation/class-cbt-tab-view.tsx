"use client";

/**
 * Ruang Pintar — M14 Class CBT Tab View (Academic Glass UI v1.2)
 *
 * Tab CBT di Ruang Kelas Guru (/kelas-saya/[id]):
 * - Manajemen Ujian CBT Kelas
 * - Bank Soal Terpadu
 * - Publikasi Ujian & Pembekuan Snapshot
 * - Monitoring Peserta & Jembatan Buku Nilai (M13)
 */

import React, { useState, useTransition } from "react";
import {
  Layers,
  Plus,
  Clock,
  Award,
  CheckCircle2,
  AlertTriangle,
  Play,
  FileCheck,
  Send,
  Eye,
  Archive,
  Copy,
  ExternalLink,
  BookOpen,
  Key,
  RefreshCw,
  Printer,
} from "lucide-react";
import { UjianCbtDTO } from "../domain/cbt-types";
import {
  publishExamAction,
  archiveExamAction,
  refreshExamTokenAction,
} from "@/app/actions/cbt-actions";
import { QuestionBankModal } from "./question-bank-modal";
import { CreateExamModal } from "./create-exam-modal";
import { ExamResultsModal } from "./exam-results-modal";

interface ClassCbtTabViewProps {
  penugasanId: string;
  sekolahId: string;
  mapelId?: string;
  canManage: boolean;
  exams: UjianCbtDTO[];
  onRefresh: () => void;
  onShowToast: (message: string, type: "success" | "error" | "info") => void;
}

export function ClassCbtTabView({
  penugasanId,
  sekolahId,
  mapelId,
  canManage,
  exams,
  onRefresh,
  onShowToast,
}: ClassCbtTabViewProps) {
  const [isPending, startTransition] = useTransition();

  // Modals state
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedResultsExamId, setSelectedResultsExamId] = useState<string | null>(null);

  const handlePublish = (ujianId: string) => {
    if (
      !confirm(
        "Publikasikan ujian ini? Snapshot butir soal akan dibekukan secara permanen (immutable) untuk menjaga konsistensi nilai."
      )
    ) {
      return;
    }

    startTransition(async () => {
      const res = await publishExamAction(ujianId, penugasanId);
      if (res.success) {
        onShowToast(res.message, "success");
        onRefresh();
      } else {
        onShowToast(res.message, "error");
      }
    });
  };

  const handleArchive = (ujianId: string) => {
    if (!confirm("Arsipkan ujian ini? Siswa tidak akan dapat mengakses ujian lagi.")) {
      return;
    }

    startTransition(async () => {
      const res = await archiveExamAction(ujianId, penugasanId);
      if (res.success) {
        onShowToast(res.message, "success");
        onRefresh();
      } else {
        onShowToast(res.message, "error");
      }
    });
  };

  const handleCopyExamLink = (ujianId: string) => {
    const link = `${window.location.origin}/cbt/start?ujianId=${ujianId}`;
    navigator.clipboard.writeText(link);
    onShowToast("Tautan pengerjaan ujian disalin ke clipboard.", "info");
  };

  const handleRefreshToken = (examId: string) => {
    startTransition(async () => {
      const res = await refreshExamTokenAction(examId, penugasanId);
      if (res.success && res.data) {
        onShowToast(`Token berhasil diacak ulang: ${res.data.newToken}`, "success");
        onRefresh();
      } else {
        onShowToast(res.message || "Gagal mengacak ulang token.", "error");
      }
    });
  };

  const totalExams = exams.length;
  const activeExams = exams.filter((e) => e.status === "DIPUBLIKASI").length;
  const draftExams = exams.filter((e) => e.status === "DRAFT").length;
  const archivedExams = exams.filter((e) => e.status === "DIARSIPKAN").length;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Total Ujian CBT</span>
            <Layers className="h-4 w-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{totalExams}</div>
          <p className="text-[11px] text-slate-400 mt-1">Ujian terdaftar di kelas</p>
        </div>

        <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-700 text-xs font-semibold mb-2">
            <span>Ujian Dipublikasi</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-900">{activeExams}</div>
          <p className="text-[11px] text-emerald-600 mt-1">Siap dikerjakan siswa</p>
        </div>

        <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-blue-700 text-xs font-semibold mb-2">
            <span>Draft Ujian</span>
            <FileCheck className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{draftExams}</div>
          <p className="text-[11px] text-blue-600 mt-1">Belum dipublikasikan</p>
        </div>

        <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Ujian Diarsipkan</span>
            <Archive className="h-4 w-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-700">{archivedExams}</div>
          <p className="text-[11px] text-slate-400 mt-1">Pelaksanaan selesai</p>
        </div>
      </div>

      {/* Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-3xl bg-white border border-slate-200/80 shadow-2xs">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Ujian Berbasis Komputer (CBT)</h3>
          <p className="text-xs text-slate-500">
            Penyusunan tes daring, bank soal terenkripsi server, timer otomatis, dan jembatan buku
            nilai
          </p>
        </div>

        {canManage && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsBankModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 text-xs font-bold transition shadow-2xs"
            >
              <Layers className="h-4 w-4 text-blue-600" />
              Bank Soal
            </button>
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-blue-600 text-white hover:bg-blue-700 text-xs font-bold transition shadow-xs"
            >
              <Plus className="h-4 w-4" />
              Susun Ujian Baru
            </button>
          </div>
        )}
      </div>

      {/* Exams List */}
      {exams.length === 0 ? (
        <div className="py-16 text-center rounded-3xl bg-white border border-dashed border-slate-200 p-8">
          <Layers className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-slate-800">Belum Ada Ujian CBT</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Mulai dengan menyusun butir soal di Bank Soal, lalu buat ujian CBT untuk rombel kelas
            ini.
          </p>
          {canManage && (
            <div className="mt-4 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsBankModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition"
              >
                Buka Bank Soal
              </button>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition shadow-xs"
              >
                <Plus className="h-4 w-4" />
                Susun Ujian
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {exams.map((exam) => {
            const isDraft = exam.status === "DRAFT";
            const isPublished = exam.status === "DIPUBLIKASI" || exam.status === "DITERBITKAN";
            const isArchived = exam.status === "DIARSIPKAN" || exam.status === "ARSIP";
            const blueprintCount = Array.isArray(exam.blueprint_soal)
              ? exam.blueprint_soal.length
              : 0;

            return (
              <div
                key={exam.id}
                className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-xs transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        isPublished
                          ? "bg-emerald-100 text-emerald-800"
                          : isDraft
                            ? "bg-amber-100 text-amber-800"
                            : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {exam.status}
                    </span>

                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      <Clock className="h-3 w-3 text-blue-500" />
                      {exam.durasi_menit} Menit
                    </span>

                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      <Award className="h-3 w-3 text-blue-500" />
                      KKTP: {exam.kktp ?? exam.kkm_kktp}
                    </span>

                    <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      {blueprintCount} Butir Soal
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{exam.judul}</h4>
                    {exam.deskripsi && (
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{exam.deskripsi}</p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                    <span>Acak Soal: {exam.acak_soal ? "Ya" : "Tidak"}</span>
                    <span>•</span>
                    <span>Acak Opsi: {exam.acak_opsi ? "Ya" : "Tidak"}</span>
                    <span>•</span>
                    <span>Rilis Skor: {exam.tampilkan_nilai ? "Instan" : "Ditahan"}</span>
                  </div>

                  {exam.gunakan_token && (
                    <div className="flex items-center gap-2 p-1.5 px-3 rounded-2xl bg-amber-50 border border-amber-200/90 text-amber-900 w-fit">
                      <Key className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                      <span className="text-[11px] font-semibold text-amber-800">Token Masuk:</span>
                      <span className="font-mono font-bold tracking-widest text-xs text-amber-950 bg-white/90 px-2 py-0.5 rounded-md border border-amber-200">
                        {exam.token_masuk || "BELUM_DISET"}
                      </span>
                      {canManage && (
                        <div className="flex items-center gap-1 pl-1 border-l border-amber-200">
                          <button
                            type="button"
                            onClick={() => {
                              if (exam.token_masuk) {
                                navigator.clipboard.writeText(exam.token_masuk);
                                onShowToast(
                                  `Token ${exam.token_masuk} disalin ke clipboard.`,
                                  "info"
                                );
                              }
                            }}
                            title="Salin Token Ujian"
                            className="p-1 hover:bg-amber-100 rounded-md text-amber-700 transition"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRefreshToken(exam.id)}
                            title="Acak Ulang Token Baru"
                            disabled={isPending}
                            className="p-1 hover:bg-amber-100 rounded-md text-amber-700 transition disabled:opacity-50"
                          >
                            <RefreshCw className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {canManage && isDraft && (
                    <button
                      type="button"
                      onClick={() => handlePublish(exam.id)}
                      disabled={isPending}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition shadow-2xs disabled:opacity-50"
                    >
                      <Play className="h-3.5 w-3.5" />
                      Publikasikan
                    </button>
                  )}

                  {canManage && isPublished && (
                    <>
                      <button
                        type="button"
                        onClick={() => setSelectedResultsExamId(exam.id)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition shadow-2xs"
                      >
                        <Award className="h-3.5 w-3.5" />
                        Monitor & Hasil
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          window.open(`/cbt/cetak/${exam.id}?penugasanId=${penugasanId}`, "_blank")
                        }
                        title="Cetak Naskah Soal Kertas A4 (Ujian Susulan / Cetak Fisik)"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 transition shadow-2xs"
                      >
                        <Printer className="h-3.5 w-3.5 text-slate-600" />
                        <span>Cetak A4</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCopyExamLink(exam.id)}
                        title="Salin Tautan Pengerjaan Ujian"
                        className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                      >
                        <Copy className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleArchive(exam.id)}
                        disabled={isPending}
                        title="Arsipkan Ujian"
                        className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                      >
                        <Archive className="h-4 w-4" />
                      </button>
                    </>
                  )}

                  {isArchived && (
                    <button
                      type="button"
                      onClick={() => setSelectedResultsExamId(exam.id)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition"
                    >
                      <Award className="h-3.5 w-3.5 text-blue-600" />
                      Lihat Rekap Hasil
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <QuestionBankModal
        isOpen={isBankModalOpen}
        onClose={() => setIsBankModalOpen(false)}
        mapelId={mapelId}
        onShowToast={onShowToast}
      />

      <CreateExamModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        penugasanId={penugasanId}
        mapelId={mapelId}
        onSuccess={(msg) => {
          onShowToast(msg, "success");
          onRefresh();
        }}
        onError={(msg) => onShowToast(msg, "error")}
      />

      {selectedResultsExamId && (
        <ExamResultsModal
          isOpen={true}
          onClose={() => setSelectedResultsExamId(null)}
          ujianId={selectedResultsExamId}
          penugasanId={penugasanId}
          onSuccess={(msg) => {
            onShowToast(msg, "success");
            onRefresh();
          }}
          onError={(msg) => onShowToast(msg, "error")}
        />
      )}
    </div>
  );
}

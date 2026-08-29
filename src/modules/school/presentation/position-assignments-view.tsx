"use client";

/**
 * Ruang Pintar — Position Assignments Management Component (Academic Glass UI v1.2)
 */

import React, { useState } from "react";
import { PersonilOptionDTO, PositionAssignmentDTO, PositionDTO } from "../domain/school-types";
import {
  assignPositionAction,
  cancelPositionAssignmentAction,
  endPositionAssignmentAction,
} from "@/app/actions/school-actions";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { EmptyState } from "@/shared/components/ui/empty-state";

interface PositionAssignmentsViewProps {
  initialAssignments: PositionAssignmentDTO[];
  positions: PositionDTO[];
  personnel: PersonilOptionDTO[];
  canManage: boolean;
}

export function PositionAssignmentsView({
  initialAssignments,
  positions,
  personnel,
  canManage,
}: PositionAssignmentsViewProps) {
  const [assignments, setAssignments] = useState<PositionAssignmentDTO[]>(initialAssignments);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [modalMode, setModalMode] = useState<"assign" | "end" | "cancel" | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<PositionAssignmentDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const filteredAssignments = assignments.filter((a) => {
    if (filterStatus === "ALL") return true;
    return a.status === filterStatus;
  });

  function openAssignModal() {
    setSelectedAssignment(null);
    setFieldErrors({});
    setModalMode("assign");
  }

  function openEndModal(assignment: PositionAssignmentDTO) {
    setSelectedAssignment(assignment);
    setFieldErrors({});
    setModalMode("end");
  }

  function openCancelModal(assignment: PositionAssignmentDTO) {
    setSelectedAssignment(assignment);
    setFieldErrors({});
    setModalMode("cancel");
  }

  function closeModal() {
    setModalMode(null);
    setSelectedAssignment(null);
    setFieldErrors({});
  }

  async function handleAssignSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canManage) return;

    setLoading(true);
    setToastMessage(null);
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);
    const res = await assignPositionAction(formData);

    if (res.success) {
      setToastMessage({
        type: "success",
        text: res.message ?? "Penugasan personil berhasil dicatat.",
      });
      setAssignments((prev) => [res.data as PositionAssignmentDTO, ...prev]);
      closeModal();
    } else if (!res.success) {
      setToastMessage({ type: "error", text: res.error });
      if (res.details) {
        setFieldErrors(res.details);
      }
    }
    setLoading(false);
  }

  async function handleEndSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedAssignment || !canManage) return;

    setLoading(true);
    setToastMessage(null);
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);
    const res = await endPositionAssignmentAction(selectedAssignment.id, formData);

    if (res.success) {
      setToastMessage({
        type: "success",
        text: res.message ?? "Penugasan jabatan berhasil diakhiri.",
      });
      const updated = res.data as PositionAssignmentDTO;
      setAssignments((prev) => prev.map((a) => (a.id === updated.id ? { ...a, ...updated } : a)));
      closeModal();
    } else if (!res.success) {
      setToastMessage({ type: "error", text: res.error });
      if (res.details) {
        setFieldErrors(res.details);
      }
    }
    setLoading(false);
  }

  async function handleCancelSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedAssignment || !canManage) return;

    setLoading(true);
    setToastMessage(null);
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);
    const res = await cancelPositionAssignmentAction(selectedAssignment.id, formData);

    if (res.success) {
      setToastMessage({
        type: "success",
        text: res.message ?? "Penugasan jabatan berhasil dibatalkan.",
      });
      const updated = res.data as PositionAssignmentDTO;
      setAssignments((prev) => prev.map((a) => (a.id === updated.id ? { ...a, ...updated } : a)));
      closeModal();
    } else if (!res.success) {
      setToastMessage({ type: "error", text: res.error });
      if (res.details) {
        setFieldErrors(res.details);
      }
    }
    setLoading(false);
  }

  function getStatusBadgeVariant(status: string): "success" | "neutral" | "danger" {
    if (status === "AKTIF") return "success";
    if (status === "SELESAI") return "neutral";
    return "danger";
  }

  function formatDate(d: Date | string | null | undefined): string {
    if (!d) return "-";
    const date = new Date(d);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <div className="space-y-6">
      <Card variant="glassElevated">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-bold text-slate-900">
                Penugasan Jabatan Struktural
              </CardTitle>
              <CardDescription className="text-slate-600 mt-1">
                Alokasi personil sekolah ke jabatan struktural beserta riwayat masa berlaku efektif.
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center rounded-xl bg-slate-100/90 p-1 border border-slate-200 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setFilterStatus("ALL")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    filterStatus === "ALL"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Semua ({assignments.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterStatus("AKTIF")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    filterStatus === "AKTIF"
                      ? "bg-white text-emerald-700 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Aktif ({assignments.filter((a) => a.status === "AKTIF").length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterStatus("SELESAI")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    filterStatus === "SELESAI"
                      ? "bg-white text-slate-700 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Selesai ({assignments.filter((a) => a.status === "SELESAI").length})
                </button>
              </div>

              {canManage && (
                <Button variant="cobalt" onClick={openAssignModal}>
                  + Tugaskan Personil
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {toastMessage && (
            <div
              role="alert"
              className={`mb-6 p-4 rounded-xl text-sm font-medium border transition-all ${
                toastMessage.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : "bg-rose-50 text-rose-800 border-rose-200"
              }`}
            >
              {toastMessage.text}
            </div>
          )}

          {filteredAssignments.length === 0 ? (
            <EmptyState
              title="Belum Ada Rekam Penugasan Jabatan"
              description="Tugaskan personil tenaga kependidikan atau guru ke jabatan struktural yang tersedia."
              action={
                canManage ? (
                  <Button variant="cobalt" onClick={openAssignModal}>
                    Buat Penugasan Pertama
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200/80 bg-white/60">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-50/90 text-xs uppercase font-bold text-slate-500 tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4">Nama Personil</th>
                    <th className="py-3.5 px-4">Jabatan Struktural</th>
                    <th className="py-3.5 px-4">Periode Masa Berlaku</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Catatan</th>
                    {canManage && <th className="py-3.5 px-4 text-right">Aksi</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredAssignments.map((assignment) => (
                    <tr key={assignment.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">
                          {assignment.personil_nama}
                        </div>
                        <div className="text-xs font-mono text-slate-500">
                          @{assignment.personil_username}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">
                          {assignment.jabatan_nama}
                        </div>
                        <div className="text-xs font-mono text-slate-500">
                          {assignment.jabatan_kode}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600">
                        <div>
                          Mulai:{" "}
                          <span className="font-semibold text-slate-800">
                            {formatDate(assignment.berlaku_mulai)}
                          </span>
                        </div>
                        <div>
                          Sampai:{" "}
                          <span className="font-semibold text-slate-800">
                            {formatDate(assignment.berlaku_sampai)}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant={getStatusBadgeVariant(assignment.status)}>
                          {assignment.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500 max-w-xs truncate">
                        {assignment.catatan ?? "-"}
                      </td>
                      {canManage && (
                        <td className="py-3.5 px-4 text-right space-x-2">
                          {assignment.status === "AKTIF" ? (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEndModal(assignment)}
                                aria-label={`Akhiri penugasan ${assignment.personil_nama}`}
                              >
                                Akhiri
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => openCancelModal(assignment)}
                                aria-label={`Batalkan penugasan ${assignment.personil_nama}`}
                              >
                                Batalkan
                              </Button>
                            </>
                          ) : (
                            <span className="text-xs text-slate-400 italic">Arsip Historis</span>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* MODAL ASSIGN POSITION */}
      {modalMode === "assign" && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="assign-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in"
        >
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 id="assign-modal-title" className="text-lg font-bold text-slate-900">
                Tugaskan Personil ke Jabatan
              </h3>
              <button
                type="button"
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors text-lg"
                aria-label="Tutup modal"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="assign-personil"
                  className="block text-sm font-semibold text-slate-800 mb-1"
                >
                  Pilih Personil (Staf / Guru) <span className="text-rose-500">*</span>
                </label>
                <select
                  id="assign-personil"
                  name="personil_id"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 outline-none"
                >
                  <option value="">-- Pilih Akun Personil --</option>
                  {personnel.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nama_lengkap} (@{p.username} — {p.peran_dasar})
                    </option>
                  ))}
                </select>
                {fieldErrors.personil_id && (
                  <p className="text-xs text-rose-600 mt-1 font-medium">
                    {fieldErrors.personil_id[0]}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="assign-jabatan"
                  className="block text-sm font-semibold text-slate-800 mb-1"
                >
                  Jabatan Struktural <span className="text-rose-500">*</span>
                </label>
                <select
                  id="assign-jabatan"
                  name="jabatan_id"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 outline-none"
                >
                  <option value="">-- Pilih Jabatan --</option>
                  {positions.map((pos) => (
                    <option key={pos.id} value={pos.id}>
                      {pos.nama_jabatan} ({pos.kode_jabatan})
                    </option>
                  ))}
                </select>
                {fieldErrors.jabatan_id && (
                  <p className="text-xs text-rose-600 mt-1 font-medium">
                    {fieldErrors.jabatan_id[0]}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="assign-mulai"
                    className="block text-sm font-semibold text-slate-800 mb-1"
                  >
                    Berlaku Mulai <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="assign-mulai"
                    name="berlaku_mulai"
                    type="date"
                    required
                    defaultValue={new Date().toISOString().split("T")[0]}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 outline-none"
                  />
                  {fieldErrors.berlaku_mulai && (
                    <p className="text-xs text-rose-600 mt-1 font-medium">
                      {fieldErrors.berlaku_mulai[0]}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="assign-sampai"
                    className="block text-sm font-semibold text-slate-800 mb-1"
                  >
                    Berlaku Sampai (Opsional)
                  </label>
                  <input
                    id="assign-sampai"
                    name="berlaku_sampai"
                    type="date"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 outline-none"
                  />
                  {fieldErrors.berlaku_sampai && (
                    <p className="text-xs text-rose-600 mt-1 font-medium">
                      {fieldErrors.berlaku_sampai[0]}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="assign-catatan"
                  className="block text-sm font-semibold text-slate-800 mb-1"
                >
                  Catatan / Nomor SK Penugasan (Opsional)
                </label>
                <textarea
                  id="assign-catatan"
                  name="catatan"
                  rows={2}
                  placeholder="Contoh: SK Pengangkatan No. 421/08/SK/2026"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 outline-none"
                />
                {fieldErrors.catatan && (
                  <p className="text-xs text-rose-600 mt-1 font-medium">{fieldErrors.catatan[0]}</p>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={closeModal} disabled={loading}>
                  Batal
                </Button>
                <Button type="submit" variant="cobalt" disabled={loading}>
                  {loading ? "Menyimpan..." : "Simpan Penugasan"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL END ASSIGNMENT */}
      {modalMode === "end" && selectedAssignment && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="end-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in"
        >
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4">
            <h3 id="end-modal-title" className="text-lg font-bold text-slate-900">
              Akhiri Masa Penugasan
            </h3>

            <p className="text-sm text-slate-600">
              Akhiri penugasan jabatan{" "}
              <strong className="text-slate-900 font-semibold">
                {selectedAssignment.jabatan_nama}
              </strong>{" "}
              untuk personil{" "}
              <strong className="text-slate-900 font-semibold">
                {selectedAssignment.personil_nama}
              </strong>
              . Status akan diperbarui menjadi <strong>SELESAI</strong>.
            </p>

            <form onSubmit={handleEndSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="end-sampai"
                  className="block text-sm font-semibold text-slate-800 mb-1"
                >
                  Tanggal Selesai Penugasan <span className="text-rose-500">*</span>
                </label>
                <input
                  id="end-sampai"
                  name="berlaku_sampai"
                  type="date"
                  required
                  defaultValue={new Date().toISOString().split("T")[0]}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="end-catatan"
                  className="block text-sm font-semibold text-slate-800 mb-1"
                >
                  Catatan Penutupan (Opsional)
                </label>
                <textarea
                  id="end-catatan"
                  name="catatan"
                  rows={2}
                  defaultValue={selectedAssignment.catatan ?? ""}
                  placeholder="Catatan purna tugas atau serah terima..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={closeModal} disabled={loading}>
                  Batal
                </Button>
                <Button type="submit" variant="cobalt" disabled={loading}>
                  {loading ? "Memproses..." : "Konfirmasi Selesai"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CANCEL ASSIGNMENT */}
      {modalMode === "cancel" && selectedAssignment && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cancel-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in"
        >
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-rose-100 p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center font-bold text-lg">
                ⚠️
              </div>
              <h3 id="cancel-modal-title" className="text-lg font-bold text-slate-900">
                Batalkan Penugasan Jabatan
              </h3>
            </div>

            <p className="text-sm text-slate-600">
              Batalkan penugasan jabatan{" "}
              <strong className="text-slate-900 font-semibold">
                {selectedAssignment.jabatan_nama}
              </strong>{" "}
              untuk personil{" "}
              <strong className="text-slate-900 font-semibold">
                {selectedAssignment.personil_nama}
              </strong>
              . Status akan diubah menjadi <strong>DIBATALKAN</strong>.
            </p>

            <form onSubmit={handleCancelSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="cancel-catatan"
                  className="block text-sm font-semibold text-slate-800 mb-1"
                >
                  Alasan Pembatalan <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id="cancel-catatan"
                  name="catatan"
                  required
                  rows={2}
                  placeholder="Sebutkan alasan resmi pembatalan penugasan ini..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 outline-none"
                />
                {fieldErrors.catatan && (
                  <p className="text-xs text-rose-600 mt-1 font-medium">{fieldErrors.catatan[0]}</p>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={closeModal} disabled={loading}>
                  Kembali
                </Button>
                <Button type="submit" variant="destructive" disabled={loading}>
                  {loading ? "Membatalkan..." : "Ya, Batalkan Penugasan"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

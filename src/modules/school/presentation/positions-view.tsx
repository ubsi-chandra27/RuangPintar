"use client";

/**
 * Ruang Pintar — Master Positions Management Component (Academic Glass UI v1.2)
 */

import React, { useState } from "react";
import { OrganizationUnitDTO, PositionDTO } from "../domain/school-types";
import {
  createPositionAction,
  deletePositionAction,
  updatePositionAction,
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

interface PositionsViewProps {
  initialPositions: PositionDTO[];
  units: OrganizationUnitDTO[];
  canManage: boolean;
}

export function PositionsView({ initialPositions, units, canManage }: PositionsViewProps) {
  const [positions, setPositions] = useState<PositionDTO[]>(initialPositions);
  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<PositionDTO | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PositionDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  function openCreateModal() {
    setSelectedPosition(null);
    setFieldErrors({});
    setModalMode("create");
  }

  function openEditModal(pos: PositionDTO) {
    setSelectedPosition(pos);
    setFieldErrors({});
    setModalMode("edit");
  }

  function closeModal() {
    setModalMode(null);
    setSelectedPosition(null);
    setFieldErrors({});
  }

  async function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canManage) return;

    setLoading(true);
    setToastMessage(null);
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);
    let res;

    if (modalMode === "create") {
      res = await createPositionAction(formData);
    } else if (modalMode === "edit" && selectedPosition) {
      res = await updatePositionAction(selectedPosition.id, formData);
    }

    if (res?.success) {
      setToastMessage({ type: "success", text: res.message ?? "Operasi berhasil." });
      closeModal();
      if (modalMode === "create") {
        setPositions((prev) => [...prev, res.data as PositionDTO]);
      } else if (modalMode === "edit") {
        const updated = res.data as PositionDTO;
        setPositions((prev) => prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p)));
      }
    } else if (res && !res.success) {
      setToastMessage({ type: "error", text: res.error });
      if (res.details) {
        setFieldErrors(res.details);
      }
    }
    setLoading(false);
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget || !canManage) return;

    setLoading(true);
    setToastMessage(null);

    const res = await deletePositionAction(deleteTarget.id);

    if (res.success) {
      setToastMessage({
        type: "success",
        text: res.message ?? "Jabatan struktural berhasil dihapus.",
      });
      setPositions((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      setDeleteTarget(null);
    } else if (!res.success) {
      setToastMessage({ type: "error", text: res.error });
    }
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <Card variant="glassElevated">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-bold text-slate-900">
                Master Jabatan Struktural
              </CardTitle>
              <CardDescription className="text-slate-600 mt-1">
                Katalog posisi jabatan organisasi sekolah (Kepala Sekolah, Wakasek, Kepala Program,
                Koordinator, dsb).
              </CardDescription>
            </div>
            {canManage && (
              <Button
                variant="cobalt"
                onClick={openCreateModal}
                className="self-start sm:self-auto"
              >
                + Tambah Jabatan
              </Button>
            )}
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

          {positions.length === 0 ? (
            <EmptyState
              title="Belum Ada Jabatan Struktural"
              description="Daftarkan master jabatan struktural sekolah untuk mengalokasikan penugasan personil."
              action={
                canManage ? (
                  <Button variant="cobalt" onClick={openCreateModal}>
                    Tambah Jabatan Pertama
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200/80 bg-white/60">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-50/90 text-xs uppercase font-bold text-slate-500 tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4">Nama Jabatan</th>
                    <th className="py-3.5 px-4">Kode Jabatan</th>
                    <th className="py-3.5 px-4">Unit Terkait</th>
                    <th className="py-3.5 px-4">Tingkat Akses Scope</th>
                    <th className="py-3.5 px-4 text-center">Rekam Penugasan</th>
                    {canManage && <th className="py-3.5 px-4 text-right">Aksi</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {positions.map((pos) => (
                    <tr key={pos.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{pos.nama_jabatan}</div>
                        {pos.is_canonical && (
                          <span className="text-xs text-blue-600 font-normal">Kanonikal Inti</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-700">
                        <Badge variant={pos.is_canonical ? "cobalt" : "neutral"}>
                          {pos.kode_jabatan}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {pos.unit_nama ? (
                          <Badge variant="academic">{pos.unit_nama}</Badge>
                        ) : (
                          <span className="text-slate-400 text-xs italic">
                            Lintas Unit / Sekolah
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-mono">
                        <Badge variant="info">{pos.tingkat_akses ?? "SCHOOL_WIDE"}</Badge>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Badge variant={pos.penugasan_count ? "success" : "neutral"}>
                          {pos.penugasan_count ?? 0} Personil
                        </Badge>
                      </td>
                      {canManage && (
                        <td className="py-3.5 px-4 text-right space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(pos)}
                            aria-label={`Edit ${pos.nama_jabatan}`}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setDeleteTarget(pos)}
                            aria-label={`Hapus ${pos.nama_jabatan}`}
                          >
                            Hapus
                          </Button>
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

      {/* MODAL CREATE / EDIT */}
      {modalMode && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="position-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in"
        >
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 id="position-modal-title" className="text-lg font-bold text-slate-900">
                {modalMode === "create" ? "Tambah Jabatan Struktural" : "Edit Jabatan Struktural"}
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

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="pos-nama"
                  className="block text-sm font-semibold text-slate-800 mb-1"
                >
                  Nama Jabatan <span className="text-rose-500">*</span>
                </label>
                <input
                  id="pos-nama"
                  name="nama_jabatan"
                  type="text"
                  required
                  defaultValue={selectedPosition?.nama_jabatan ?? ""}
                  placeholder="Contoh: Wakil Kepala Sekolah Bidang Sarpras"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 outline-none"
                />
                {fieldErrors.nama_jabatan && (
                  <p className="text-xs text-rose-600 mt-1 font-medium">
                    {fieldErrors.nama_jabatan[0]}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="pos-kode"
                  className="block text-sm font-semibold text-slate-800 mb-1"
                >
                  Kode Jabatan (Identifier Unik) <span className="text-rose-500">*</span>
                </label>
                <input
                  id="pos-kode"
                  name="kode_jabatan"
                  type="text"
                  required
                  disabled={modalMode === "edit"}
                  defaultValue={selectedPosition?.kode_jabatan ?? ""}
                  placeholder="Contoh: WAKASEK_SARPRAS, KAPROGLI_RPL"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono uppercase focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 outline-none disabled:bg-slate-100 disabled:opacity-70"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Format uppercase snake_case unik per sekolah. Kode tidak dapat diubah setelah
                  dibuat demi stabilitas otorisasi.
                </p>
                {fieldErrors.kode_jabatan && (
                  <p className="text-xs text-rose-600 mt-1 font-medium">
                    {fieldErrors.kode_jabatan[0]}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="pos-unit"
                  className="block text-sm font-semibold text-slate-800 mb-1"
                >
                  Unit Organisasi Terkait
                </label>
                <select
                  id="pos-unit"
                  name="unit_id"
                  defaultValue={selectedPosition?.unit_id ?? ""}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 outline-none"
                >
                  <option value="">-- Lintas Unit / Sekolah --</option>
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nama} {u.kode ? `(${u.kode})` : ""}
                    </option>
                  ))}
                </select>
                {fieldErrors.unit_id && (
                  <p className="text-xs text-rose-600 mt-1 font-medium">{fieldErrors.unit_id[0]}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="pos-tingkat"
                  className="block text-sm font-semibold text-slate-800 mb-1"
                >
                  Tingkat Akses Scope
                </label>
                <select
                  id="pos-tingkat"
                  name="tingkat_akses"
                  defaultValue={selectedPosition?.tingkat_akses ?? "SCHOOL_WIDE"}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 outline-none"
                >
                  <option value="SCHOOL_WIDE">SCHOOL_WIDE — Seluruh Lingkup Sekolah</option>
                  <option value="UNIT_WIDE">UNIT_WIDE — Terbatas pada Unit Organisasi</option>
                  <option value="PROGRAM_WIDE">
                    PROGRAM_WIDE — Terbatas pada Program Keahlian
                  </option>
                </select>
                {fieldErrors.tingkat_akses && (
                  <p className="text-xs text-rose-600 mt-1 font-medium">
                    {fieldErrors.tingkat_akses[0]}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={closeModal} disabled={loading}>
                  Batal
                </Button>
                <Button type="submit" variant="cobalt" disabled={loading}>
                  {loading ? "Menyimpan..." : "Simpan"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DESTRUCTIVE CONFIRMATION MODAL */}
      {deleteTarget && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-pos-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in"
        >
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-rose-100 p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center font-bold text-lg">
                ⚠️
              </div>
              <h3 id="delete-pos-modal-title" className="text-lg font-bold text-slate-900">
                Konfirmasi Hapus Jabatan
              </h3>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              Apakah Anda yakin ingin menghapus master jabatan{" "}
              <strong className="text-slate-900 font-semibold">{deleteTarget.nama_jabatan}</strong>{" "}
              ({deleteTarget.kode_jabatan})?
            </p>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 font-medium">
              Sistem menerapkan aturan <em>History-Preserving</em>: jabatan tidak dapat dihapus jika
              pernah memiliki rekam penugasan personil (aktif maupun historis).
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={loading}>
                Batal
              </Button>
              <Button variant="destructive" onClick={handleDeleteConfirm} disabled={loading}>
                {loading ? "Menghapus..." : "Ya, Hapus Jabatan"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

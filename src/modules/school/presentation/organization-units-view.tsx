"use client";

/**
 * Ruang Pintar — Organization Units Management Component (Academic Glass UI v1.2)
 */

import React, { useState } from "react";
import { OrganizationUnitDTO } from "../domain/school-types";
import {
  createOrganizationUnitAction,
  deleteOrganizationUnitAction,
  updateOrganizationUnitAction,
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

interface OrganizationUnitsViewProps {
  initialUnits: OrganizationUnitDTO[];
  canManage: boolean;
}

export function OrganizationUnitsView({ initialUnits, canManage }: OrganizationUnitsViewProps) {
  const [units, setUnits] = useState<OrganizationUnitDTO[]>(initialUnits);
  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<OrganizationUnitDTO | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<OrganizationUnitDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  function openCreateModal() {
    setSelectedUnit(null);
    setFieldErrors({});
    setModalMode("create");
  }

  function openEditModal(unit: OrganizationUnitDTO) {
    setSelectedUnit(unit);
    setFieldErrors({});
    setModalMode("edit");
  }

  function closeModal() {
    setModalMode(null);
    setSelectedUnit(null);
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
      res = await createOrganizationUnitAction(formData);
    } else if (modalMode === "edit" && selectedUnit) {
      res = await updateOrganizationUnitAction(selectedUnit.id, formData);
    }

    if (res?.success) {
      setToastMessage({ type: "success", text: res.message ?? "Operasi berhasil." });
      closeModal();
      // Optimistic refresh
      if (modalMode === "create") {
        setUnits((prev) => [...prev, res.data as OrganizationUnitDTO]);
      } else if (modalMode === "edit") {
        const updated = res.data as OrganizationUnitDTO;
        setUnits((prev) => prev.map((u) => (u.id === updated.id ? { ...u, ...updated } : u)));
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

    const res = await deleteOrganizationUnitAction(deleteTarget.id);

    if (res.success) {
      setToastMessage({
        type: "success",
        text: res.message ?? "Unit organisasi berhasil dihapus.",
      });
      setUnits((prev) => prev.filter((u) => u.id !== deleteTarget.id));
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
                Unit & Bagian Organisasi
              </CardTitle>
              <CardDescription className="text-slate-600 mt-1">
                Kelola bagian struktural sekolah seperti Kurikulum, Kesiswaan, Tata Usaha, dan
                Program Keahlian.
              </CardDescription>
            </div>
            {canManage && (
              <Button
                variant="cobalt"
                onClick={openCreateModal}
                className="self-start sm:self-auto"
              >
                + Tambah Unit
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

          {units.length === 0 ? (
            <EmptyState
              title="Belum Ada Unit Organisasi"
              description="Tambahkan unit atau bagian organisasi sekolah untuk menstrukturkan hierarki tata kelola."
              action={
                canManage ? (
                  <Button variant="cobalt" onClick={openCreateModal}>
                    Tambah Unit Pertama
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200/80 bg-white/60">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-50/90 text-xs uppercase font-bold text-slate-500 tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4">Nama Unit</th>
                    <th className="py-3.5 px-4">Kode</th>
                    <th className="py-3.5 px-4">Induk Unit</th>
                    <th className="py-3.5 px-4 text-center">Sub-Unit</th>
                    <th className="py-3.5 px-4 text-center">Jabatan</th>
                    {canManage && <th className="py-3.5 px-4 text-right">Aksi</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {units.map((unit) => (
                    <tr key={unit.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900">{unit.nama}</td>
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-600">
                        {unit.kode ? (
                          <Badge variant="neutral">{unit.kode}</Badge>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {unit.induk_unit_nama ? (
                          <Badge variant="cobalt">{unit.induk_unit_nama}</Badge>
                        ) : (
                          <span className="text-slate-400 text-xs italic">Unit Utama</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Badge variant={unit.sub_unit_count ? "academic" : "neutral"}>
                          {unit.sub_unit_count ?? 0}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Badge variant={unit.jabatan_count ? "info" : "neutral"}>
                          {unit.jabatan_count ?? 0}
                        </Badge>
                      </td>
                      {canManage && (
                        <td className="py-3.5 px-4 text-right space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(unit)}
                            aria-label={`Edit ${unit.nama}`}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setDeleteTarget(unit)}
                            aria-label={`Hapus ${unit.nama}`}
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
          aria-labelledby="unit-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in"
        >
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 id="unit-modal-title" className="text-lg font-bold text-slate-900">
                {modalMode === "create" ? "Tambah Unit Organisasi" : "Edit Unit Organisasi"}
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
                  htmlFor="unit-nama"
                  className="block text-sm font-semibold text-slate-800 mb-1"
                >
                  Nama Unit <span className="text-rose-500">*</span>
                </label>
                <input
                  id="unit-nama"
                  name="nama"
                  type="text"
                  required
                  defaultValue={selectedUnit?.nama ?? ""}
                  placeholder="Contoh: Bidang Kurikulum & Akademik"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 outline-none"
                />
                {fieldErrors.nama && (
                  <p className="text-xs text-rose-600 mt-1 font-medium">{fieldErrors.nama[0]}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="unit-kode"
                  className="block text-sm font-semibold text-slate-800 mb-1"
                >
                  Kode Singkatan (Opsional)
                </label>
                <input
                  id="unit-kode"
                  name="kode"
                  type="text"
                  defaultValue={selectedUnit?.kode ?? ""}
                  placeholder="Contoh: KUR, KSW, TU"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm uppercase font-mono focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 outline-none"
                />
                {fieldErrors.kode && (
                  <p className="text-xs text-rose-600 mt-1 font-medium">{fieldErrors.kode[0]}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="unit-induk"
                  className="block text-sm font-semibold text-slate-800 mb-1"
                >
                  Induk Unit (Hierarki)
                </label>
                <select
                  id="unit-induk"
                  name="induk_unit_id"
                  defaultValue={selectedUnit?.induk_unit_id ?? ""}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 outline-none"
                >
                  <option value="">-- Unit Utama (Tanpa Induk) --</option>
                  {units
                    .filter((u) => u.id !== selectedUnit?.id)
                    .map((parent) => (
                      <option key={parent.id} value={parent.id}>
                        {parent.nama} {parent.kode ? `(${parent.kode})` : ""}
                      </option>
                    ))}
                </select>
                {fieldErrors.induk_unit_id && (
                  <p className="text-xs text-rose-600 mt-1 font-medium">
                    {fieldErrors.induk_unit_id[0]}
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
          aria-labelledby="delete-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in"
        >
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-rose-100 p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center font-bold text-lg">
                ⚠️
              </div>
              <h3 id="delete-modal-title" className="text-lg font-bold text-slate-900">
                Konfirmasi Hapus Unit
              </h3>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              Apakah Anda yakin ingin menghapus unit organisasi{" "}
              <strong className="text-slate-900 font-semibold">{deleteTarget.nama}</strong>?
            </p>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 font-medium">
              Sistem menerapkan aturan <em>History-Preserving</em>: unit tidak dapat dihapus jika
              masih memiliki sub-unit atau dirujuk oleh jabatan.
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={loading}>
                Batal
              </Button>
              <Button variant="destructive" onClick={handleDeleteConfirm} disabled={loading}>
                {loading ? "Menghapus..." : "Ya, Hapus Unit"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

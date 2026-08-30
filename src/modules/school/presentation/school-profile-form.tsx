"use client";

/**
 * Ruang Pintar — School Profile Form Component (Academic Glass UI v1.2)
 */

import React, { useState } from "react";
import { SchoolProfileDTO } from "../domain/school-types";
import { updateSchoolProfileAction } from "@/app/actions/school-actions";
import { Button } from "@/shared/components/ui/button";
import { Toast } from "@/shared/components/ui/toast";

interface SchoolProfileFormProps {
  initialProfile: SchoolProfileDTO;
  canManage: boolean;
}

export function SchoolProfileForm({ initialProfile, canManage }: SchoolProfileFormProps) {
  const [profile, setProfile] = useState<SchoolProfileDTO>(initialProfile);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canManage) return;

    setLoading(true);
    setToastMessage(null);
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);
    const res = await updateSchoolProfileAction(formData);

    if (res.success && res.data) {
      setProfile(res.data as SchoolProfileDTO);
      setToastMessage({
        type: "success",
        text: res.message ?? "Profil sekolah berhasil diperbarui.",
      });
    } else if (!res.success) {
      setToastMessage({ type: "error", text: res.error });
      if (res.details) {
        setFieldErrors(res.details);
      }
    }
    setLoading(false);
  }

  return (
    <div className="rounded-3xl bg-white border border-slate-100/90 p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.03)] w-full">
      {/* Floating Toast Notification */}
      {toastMessage && (
        <Toast
          type={toastMessage.type}
          message={toastMessage.text}
          onClose={() => setToastMessage(null)}
        />
      )}

      {/* Header Form */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Identitas & Profil Sekolah</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Data resmi entitas institusi pendidikan untuk konteks operasional platform.
          </p>
        </div>
        <span className="self-start sm:self-auto px-3 py-1 rounded-xl bg-blue-50 text-blue-700 font-bold text-xs border border-blue-200/80">
          Jenjang: {profile.jenjang}
        </span>
      </div>

      <div className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nama Sekolah */}
            <div className="md:col-span-2">
              <label
                htmlFor="nama"
                className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5"
              >
                Nama Resmi Sekolah <span className="text-rose-500">*</span>
              </label>
              <input
                id="nama"
                name="nama"
                type="text"
                required
                disabled={!canManage || loading}
                defaultValue={profile.nama}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-slate-900 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#2563EB] transition-all disabled:opacity-60 disabled:bg-slate-100"
              />
              {fieldErrors.nama && (
                <p className="text-xs text-rose-600 mt-1 font-medium">{fieldErrors.nama[0]}</p>
              )}
            </div>

            {/* NPSN */}
            <div>
              <label
                htmlFor="npsn"
                className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5"
              >
                NPSN (Nomor Pokok Sekolah Nasional)
              </label>
              <input
                id="npsn"
                name="npsn"
                type="text"
                maxLength={8}
                disabled={!canManage || loading}
                defaultValue={profile.npsn ?? ""}
                placeholder="Contoh: 20101234"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-slate-900 font-mono text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#2563EB] transition-all disabled:opacity-60 disabled:bg-slate-100"
              />
              {fieldErrors.npsn && (
                <p className="text-xs text-rose-600 mt-1 font-medium">{fieldErrors.npsn[0]}</p>
              )}
            </div>

            {/* Jenjang */}
            <div>
              <label
                htmlFor="jenjang"
                className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5"
              >
                Jenjang Pendidikan <span className="text-rose-500">*</span>
              </label>
              <select
                id="jenjang"
                name="jenjang"
                required
                disabled={!canManage || loading}
                defaultValue={profile.jenjang}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-slate-900 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#2563EB] transition-all disabled:opacity-60 disabled:bg-slate-100"
              >
                <option value="SD">SD (Sekolah Dasar)</option>
                <option value="SMP">SMP (Sekolah Menengah Pertama)</option>
                <option value="SMA">SMA (Sekolah Menengah Atas)</option>
                <option value="SMK">SMK (Sekolah Menengah Kejuruan)</option>
                <option value="UMUM">UMUM / Lainnya</option>
              </select>
              {fieldErrors.jenjang && (
                <p className="text-xs text-rose-600 mt-1 font-medium">{fieldErrors.jenjang[0]}</p>
              )}
            </div>

            {/* Nomor Telepon */}
            <div>
              <label
                htmlFor="telepon"
                className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5"
              >
                Nomor Telepon
              </label>
              <input
                id="telepon"
                name="telepon"
                type="tel"
                disabled={!canManage || loading}
                defaultValue={profile.telepon ?? ""}
                placeholder="Contoh: (021) 7891234"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-slate-900 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#2563EB] transition-all disabled:opacity-60 disabled:bg-slate-100"
              />
              {fieldErrors.telepon && (
                <p className="text-xs text-rose-600 mt-1 font-medium">{fieldErrors.telepon[0]}</p>
              )}
            </div>

            {/* Email Sekolah */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5"
              >
                Alamat Email Resmi
              </label>
              <input
                id="email"
                name="email"
                type="email"
                disabled={!canManage || loading}
                defaultValue={profile.email ?? ""}
                placeholder="Contoh: info@sekolah.sch.id"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-slate-900 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#2563EB] transition-all disabled:opacity-60 disabled:bg-slate-100"
              />
              {fieldErrors.email && (
                <p className="text-xs text-rose-600 mt-1 font-medium">{fieldErrors.email[0]}</p>
              )}
            </div>

            {/* Zona Waktu */}
            <div>
              <label
                htmlFor="zona_waktu"
                className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5"
              >
                Zona Waktu <span className="text-rose-500">*</span>
              </label>
              <select
                id="zona_waktu"
                name="zona_waktu"
                required
                disabled={!canManage || loading}
                defaultValue={profile.zona_waktu}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-slate-900 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#2563EB] transition-all disabled:opacity-60 disabled:bg-slate-100"
              >
                <option value="Asia/Jakarta">WIB — Asia/Jakarta (UTC+7)</option>
                <option value="Asia/Makassar">WITA — Asia/Makassar (UTC+8)</option>
                <option value="Asia/Jayapura">WIT — Asia/Jayapura (UTC+9)</option>
              </select>
            </div>

            {/* Logo URL */}
            <div>
              <label
                htmlFor="logo_url"
                className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5"
              >
                URL / Path Logo Sekolah
              </label>
              <input
                id="logo_url"
                name="logo_url"
                type="text"
                disabled={!canManage || loading}
                defaultValue={profile.logo_url ?? ""}
                placeholder="Contoh: /images/brand/logo.png"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-slate-900 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#2563EB] transition-all disabled:opacity-60 disabled:bg-slate-100"
              />
              {fieldErrors.logo_url && (
                <p className="text-xs text-rose-600 mt-1 font-medium">{fieldErrors.logo_url[0]}</p>
              )}
            </div>

            {/* Alamat Lengkap */}
            <div className="md:col-span-2">
              <label
                htmlFor="alamat"
                className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5"
              >
                Alamat Lengkap Institusi
              </label>
              <textarea
                id="alamat"
                name="alamat"
                rows={3}
                disabled={!canManage || loading}
                defaultValue={profile.alamat ?? ""}
                placeholder="Alamat jalan, nomor, RT/RW, kelurahan, kecamatan, kota/kabupaten, provinsi..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-slate-900 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#2563EB] transition-all disabled:opacity-60 disabled:bg-slate-100 resize-y"
              />
              {fieldErrors.alamat && (
                <p className="text-xs text-rose-600 mt-1 font-medium">{fieldErrors.alamat[0]}</p>
              )}
            </div>
          </div>

          {canManage && (
            <div className="pt-6 border-t border-slate-100 flex items-center justify-end">
              <Button
                type="submit"
                variant="cobalt"
                disabled={loading}
                className="min-w-[160px] cursor-pointer"
              >
                {loading ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

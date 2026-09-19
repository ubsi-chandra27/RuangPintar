"use client";

import * as React from "react";
import { X, Building2, School, Sparkles, AlertCircle, Loader2 } from "lucide-react";
import { createSchoolTenantAction } from "@/app/actions/school-actions";

interface CreateSchoolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateSchoolModal({ isOpen, onClose, onSuccess }: CreateSchoolModalProps) {
  const [nama, setNama] = React.useState("");
  const [npsn, setNpsn] = React.useState("");
  const [jenjang, setJenjang] = React.useState<"SD" | "SMP" | "SMA" | "SMK" | "UMUM">("SMA");
  const [tipeLisensi, setTipeLisensi] = React.useState<"FREEMIUM" | "SEKOLAH">("FREEMIUM");
  const [alamat, setAlamat] = React.useState("");
  const [telepon, setTelepon] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (nama.trim().length < 3) {
      setErrorMessage("Nama sekolah minimal 3 karakter.");
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.set("nama", nama.trim());
      if (npsn.trim()) formData.set("npsn", npsn.trim());
      formData.set("jenjang", jenjang);
      formData.set("tipe_lisensi", tipeLisensi);
      if (alamat.trim()) formData.set("alamat", alamat.trim());
      if (telepon.trim()) formData.set("telepon", telepon.trim());
      if (email.trim()) formData.set("email", email.trim());

      const res = await createSchoolTenantAction(formData);
      if (res.success) {
        onClose();
        if (onSuccess) onSuccess();
      } else {
        setErrorMessage(res.error || "Gagal mendaftarkan sekolah baru.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Terjadi kesalahan internal.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-white/60 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-400 flex items-center justify-center font-bold text-xs shadow-2xs">
              <Building2 className="size-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Daftarkan Sekolah Baru
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Registrasi tenant institusi baru ke ekosistem SaaS Ruang Pintar
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
          {errorMessage && (
            <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs">
              <AlertCircle className="size-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Nama Sekolah */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Nama Lengkap Sekolah <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Contoh: SMA Negeri 1 Jakarta"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
            />
          </div>

          {/* Grid NPSN & Jenjang */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                NPSN (Nomor Pokok Sekolah)
              </label>
              <input
                type="text"
                value={npsn}
                onChange={(e) => setNpsn(e.target.value)}
                placeholder="Contoh: 20101234"
                maxLength={10}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Jenjang Pendidikan
              </label>
              <select
                value={jenjang}
                onChange={(e) => setJenjang(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              >
                <option value="SD">SD / Madrasah Ibtidaiyah</option>
                <option value="SMP">SMP / Madrasah Tsanawiyah</option>
                <option value="SMA">SMA / Madrasah Aliyah</option>
                <option value="SMK">SMK (Kejuruan)</option>
                <option value="UMUM">Institusi Umum / Pelatihan</option>
              </select>
            </div>
          </div>

          {/* Tipe Lisensi */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Paket Lisensi SaaS Awal
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                onClick={() => setTipeLisensi("FREEMIUM")}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                  tipeLisensi === "FREEMIUM"
                    ? "border-amber-400 bg-amber-50/50 dark:bg-amber-950/40 ring-2 ring-amber-400/20"
                    : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300"
                }`}
              >
                <input
                  type="radio"
                  name="lisensi"
                  checked={tipeLisensi === "FREEMIUM"}
                  onChange={() => setTipeLisensi("FREEMIUM")}
                  className="mt-0.5 text-amber-600"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Freemium
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 text-[10px] font-bold">
                      Uji Coba 30 Hari
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Akses uji coba mandiri fitur KBM dan absensi
                  </p>
                </div>
              </div>

              <div
                onClick={() => setTipeLisensi("SEKOLAH")}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                  tipeLisensi === "SEKOLAH"
                    ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 ring-2 ring-blue-500/20"
                    : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300"
                }`}
              >
                <input
                  type="radio"
                  name="lisensi"
                  checked={tipeLisensi === "SEKOLAH"}
                  onChange={() => setTipeLisensi("SEKOLAH")}
                  className="mt-0.5 text-blue-600"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Lisensi Penuh
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 text-[10px] font-bold">
                      Institusi
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Akses komprehensif seluruh modul dan CBT sekolah
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Alamat & Kontak */}
          <div className="space-y-3 pt-1">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Alamat Sekolah (Opsional)
              </label>
              <textarea
                rows={2}
                value={alamat}
                onChange={(e) => setAlamat(e.target.value)}
                placeholder="Jalan, Kota/Kabupaten, Provinsi..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Email Kontak Sekolah
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@sekolah.sch.id"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Nomor Telepon
                </label>
                <input
                  type="tel"
                  value={telepon}
                  onChange={(e) => setTelepon(e.target.value)}
                  placeholder="021-xxxxxxxx"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors active:scale-95 cursor-pointer"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#2563EB] hover:bg-blue-700 text-white transition-all shadow-md shadow-blue-500/20 active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <School className="size-3.5" />
              )}
              <span>Daftarkan Sekolah</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

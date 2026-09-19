"use client";

/**
 * Ruang Pintar — Self-Service Profile View & Form Component
 * Academic Glass UI v1.2
 */

import React, { useState, useTransition } from "react";
import Link from "next/link";
import {
  User,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  KeyRound,
  GraduationCap,
  School,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
  BookOpen,
  Calendar,
  Camera,
  Upload,
  Trash2,
} from "lucide-react";
import { updateProfileSelfAction } from "@/app/actions/profile-actions";

export interface ProfileViewProps {
  user: {
    id: string;
    username: string;
    email: string | null;
    nama_lengkap: string;
    peran_dasar: string;
    status_akun: string;
    created_at: Date | string;
    terakhir_login_pada: Date | string | null;
    foto_url?: string | null;
  };
  schoolName: string;
  teacherProfile?: {
    id: string;
    nip: string | null;
    nuptk: string | null;
    gelar_depan: string | null;
    gelar_belakang: string | null;
    jenis_kelamin: string;
    status_kepegawaian: string;
    telepon: string | null;
    alamat: string | null;
    tempat_lahir: string | null;
    tanggal_lahir: Date | string | null;
    foto_url?: string | null;
    penugasan_mengajar: Array<{
      id: string;
      mata_pelajaran: { nama: string; kode: string };
      rombel: { nama: string; tingkat: { nama: string } };
      jumlah_jam_minggu: number;
    }>;
  } | null;
}

export function ProfileView({ user, schoolName, teacherProfile }: ProfileViewProps) {
  const [activeTab, setActiveTab] = useState<"KONTAK" | "AKADEMIK">("KONTAK");
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Form local states
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState<string | null>(
    user.foto_url || teacherProfile?.foto_url || null
  );
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email || "");
  const [telepon, setTelepon] = useState(teacherProfile?.telepon || "");
  const [alamat, setAlamat] = useState(teacherProfile?.alamat || "");

  // Sync state if user.foto_url changes from server revalidation
  const [prevPhotoProp, setPrevPhotoProp] = useState(user.foto_url);
  if (user.foto_url !== prevPhotoProp) {
    setPrevPhotoProp(user.foto_url);
    setPhoto(user.foto_url || teacherProfile?.foto_url || null);
  }

  // Client-side image compression & optimization helper
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const maxDim = 512;
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(e.target?.result as string);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.85));
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setFeedback({ type: "error", message: "Ukuran berkas foto maksimal 5MB." });
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp", "image/jpg"].includes(file.type)) {
      setFeedback({ type: "error", message: "Format foto harus JPG, PNG, atau WebP." });
      return;
    }

    try {
      const compressed = await compressImage(file);
      setPhoto(compressed);
      setFeedback({
        type: "success",
        message: "Foto dipilih. Klik 'Simpan Perubahan Profil' di bawah untuk menyimpan permanen.",
      });
    } catch {
      setFeedback({ type: "error", message: "Gagal memproses gambar foto profil." });
    } finally {
      e.target.value = "";
    }
  };

  const handleRemovePhoto = () => {
    setPhoto(null);
    setFeedback({
      type: "success",
      message:
        "Foto dihapus (kembali ke inisial). Klik 'Simpan Perubahan Profil' untuk mengonfirmasi.",
    });
  };

  // Format full display name with titles (avoid duplicating title if already in name)
  const formattedTeacherName = React.useMemo(() => {
    let name = user.nama_lengkap;
    if (
      teacherProfile?.gelar_depan &&
      !name.toLowerCase().startsWith(teacherProfile.gelar_depan.toLowerCase())
    ) {
      name = `${teacherProfile.gelar_depan} ${name}`;
    }
    if (
      teacherProfile?.gelar_belakang &&
      !name.toLowerCase().includes(teacherProfile.gelar_belakang.toLowerCase())
    ) {
      name = `${name}, ${teacherProfile.gelar_belakang}`;
    }
    return name;
  }, [user.nama_lengkap, teacherProfile?.gelar_depan, teacherProfile?.gelar_belakang]);

  // Initials
  const initials = user.nama_lengkap
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFeedback(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await updateProfileSelfAction(null, formData);
      if (res.success) {
        setFeedback({ type: "success", message: res.message });
      } else {
        setFeedback({ type: "error", message: res.message });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Alert Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl border flex items-center gap-3 transition-all ${
            feedback.type === "success"
              ? "bg-emerald-50/90 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
              : "bg-rose-50/90 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0" />
          )}
          <span className="text-xs font-semibold">{feedback.message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ========================================== */}
        {/* LEFT COLUMN: IDENTITAS & QUICK SHORTCUTS    */}
        {/* ========================================== */}
        <div className="lg:col-span-4 space-y-6">
          {/* Identity Card — Centered Avatar + No Role Badge + Status aligned with @username */}
          <div className="p-6 sm:p-7 rounded-[28px] bg-white dark:bg-slate-900/75 dark:backdrop-blur-xl border border-slate-200/80 dark:border-blue-500/20 shadow-xs dark:shadow-[0_0_30px_-5px_rgba(37,99,235,0.16)] space-y-5 text-center flex flex-col items-center">
            {/* Centered Large Circle Avatar */}
            <div className="relative group mx-auto">
              <div className="size-28 sm:size-32 rounded-full bg-gradient-to-tr from-[#1E40AF] via-[#2563EB] to-[#3B82F6] text-white flex items-center justify-center text-3xl sm:text-4xl font-extrabold shadow-xl shadow-blue-500/25 ring-4 ring-blue-500/20 dark:ring-blue-400/30 overflow-hidden">
                {photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photo} alt={user.nama_lengkap} className="size-full object-cover" />
                ) : (
                  initials
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Pilih & Unggah Foto Profil"
                className="absolute bottom-0 right-0 p-2.5 rounded-full bg-[#2563EB] hover:bg-blue-700 text-white shadow-md cursor-pointer transition-all hover:scale-110 border-2 border-white dark:border-slate-900 flex items-center justify-center"
              >
                <Camera className="h-4 w-4" />
              </button>
            </div>

            {/* Name + Username & Aktif aligned together */}
            <div className="space-y-1 w-full text-center">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
                {formattedTeacherName}
              </h2>
              <div className="flex items-center justify-center gap-2 pt-0.5">
                <span className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400">
                  @{user.username}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800/60">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {user.status_akun}
                </span>
              </div>
            </div>

            <div className="w-full pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2.5 text-xs text-slate-600 dark:text-slate-300 text-left">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <School className="h-4 w-4 text-[#2563EB] dark:text-blue-400 shrink-0" />
                <span className="font-semibold text-slate-700 dark:text-slate-200 truncate">
                  {schoolName}
                </span>
              </div>

              {teacherProfile?.nip && (
                <div className="flex items-center justify-between text-[11px] py-1.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
                  <span className="text-slate-400 dark:text-slate-400 font-medium">NIP Resmi</span>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-200">
                    {teacherProfile.nip}
                  </span>
                </div>
              )}

              {teacherProfile?.nuptk && (
                <div className="flex items-center justify-between text-[11px] py-1.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
                  <span className="text-slate-400 dark:text-slate-400 font-medium">NUPTK</span>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-200">
                    {teacherProfile.nuptk}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 text-[11px] pt-1">
                <Calendar className="h-3.5 w-3.5 shrink-0" />
                <span>
                  Bergabung sejak{" "}
                  {new Date(user.created_at).toLocaleDateString("id-ID", {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>

            {/* Quick Links */}
            <div className="w-full pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <Link
                href="/ganti-password"
                className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 dark:bg-slate-800/60 dark:hover:bg-blue-950/40 border border-slate-200/80 hover:border-blue-300 dark:border-slate-700/60 dark:hover:border-blue-500/40 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-[#2563EB] dark:hover:text-blue-400 transition-colors"
              >
                <KeyRound className="h-4 w-4 text-slate-400 group-hover:text-[#2563EB]" />
                <span>Ganti Kata Sandi</span>
              </Link>

              {user.peran_dasar === "TEACHER" && (
                <Link
                  href="/kelas-saya"
                  className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-xs font-bold text-white shadow-xs transition-colors"
                >
                  <BookOpen className="h-4 w-4" />
                  <span>Ruang Kelas Saya</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* ========================================== */}
        {/* RIGHT COLUMN: TABS & INTERACTIVE FORMS    */}
        {/* ========================================== */}
        <div className="lg:col-span-8 space-y-5">
          {/* Navigation Tab Bar */}
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white dark:bg-slate-900/75 dark:backdrop-blur-xl border border-slate-200/80 dark:border-blue-500/20 shadow-2xs w-fit">
            <button
              type="button"
              onClick={() => setActiveTab("KONTAK")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "KONTAK"
                  ? "bg-[#2563EB] text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <User className="h-4 w-4" />
              <span>Data Akun & Kontak</span>
            </button>

            {user.peran_dasar === "TEACHER" && (
              <button
                type="button"
                onClick={() => setActiveTab("AKADEMIK")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "AKADEMIK"
                    ? "bg-[#2563EB] text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <GraduationCap className="h-4 w-4" />
                <span>Informasi Kepegawaian & KBM</span>
              </button>
            )}
          </div>

          {/* TAB 1: FORMULIR DATA AKUN & KONTAK */}
          {activeTab === "KONTAK" && (
            <div className="p-6 sm:p-7 rounded-[28px] bg-white dark:bg-slate-900/75 dark:backdrop-blur-xl border border-slate-200/80 dark:border-blue-500/20 shadow-xs dark:shadow-[0_0_30px_-5px_rgba(37,99,235,0.16)] space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Data Akun & Kontak Personal
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Perbarui username dan informasi kontak pribadi Anda untuk keperluan komunikasi
                  sekolah.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Foto Profil Upload Section */}
                <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative size-16 rounded-2xl overflow-hidden shrink-0 ring-2 ring-white dark:ring-slate-700 shadow-sm bg-gradient-to-tr from-[#1E40AF] to-[#3B82F6] text-white flex items-center justify-center text-xl font-bold">
                    {photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={photo} alt="Foto Profil" className="size-full object-cover" />
                    ) : (
                      initials
                    )}
                  </div>

                  <div className="space-y-1.5 text-center sm:text-left flex-1 min-w-0">
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Foto Profil Akun
                      </h4>
                      {photo && (
                        <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-200/60 dark:border-emerald-800/60">
                          Terpasang
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      Format didukung: JPG, PNG, atau WebP (maks. 5MB). Foto otomatis dioptimalkan
                      untuk tampilan tajam.
                    </p>
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold shadow-2xs cursor-pointer transition-colors"
                      >
                        <Upload className="h-3.5 w-3.5 text-[#2563EB] dark:text-blue-400" />
                        <span>{photo ? "Ganti Foto" : "Unggah Foto"}</span>
                      </button>

                      {photo && (
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 text-xs font-bold transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Hapus Foto</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Hidden input for foto_url payload */}
                <input type="hidden" name="foto_url" value={photo || ""} />

                {/* Hidden file input referenced by fileInputRef */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  onChange={handlePhotoChange}
                  className="sr-only"
                />

                {/* Read-Only Official Name */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Nama Lengkap Resmi
                    </label>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                      <Lock className="h-3 w-3" />
                      Terproteksi (Dikelola TU)
                    </span>
                  </div>
                  <input
                    type="text"
                    disabled
                    value={formattedTeacherName}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/40 text-xs font-semibold text-slate-500 dark:text-slate-400 cursor-not-allowed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Editable Username */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Username Login <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-bold text-slate-400">
                        @
                      </span>
                      <input
                        type="text"
                        name="username"
                        required
                        minLength={3}
                        maxLength={30}
                        value={username}
                        onChange={(e) => setUsername(e.target.value.toLowerCase())}
                        className="w-full pl-7 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
                        placeholder="username_anda"
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                      Digunakan untuk login (huruf kecil, angka, garis bawah).
                    </p>
                  </div>

                  {/* Editable Email */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Email Kontak & Pemulihan
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <input
                        type="email"
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
                        placeholder="guru@sekolah.sch.id"
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                      Untuk notifikasi dan reset kata sandi mandiri.
                    </p>
                  </div>
                </div>

                {user.peran_dasar === "TEACHER" && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Editable Phone / WhatsApp */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Nomor WhatsApp / Handphone
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                          <input
                            type="tel"
                            name="telepon"
                            value={telepon}
                            onChange={(e) => setTelepon(e.target.value)}
                            className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
                            placeholder="081234567890"
                          />
                        </div>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                          Kontak aktif untuk koordinasi dan komunikasi sekolah.
                        </p>
                      </div>

                      {/* Status Kepegawaian (Read-Only) */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                            Status Kepegawaian
                          </label>
                          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                            Resmi
                          </span>
                        </div>
                        <input
                          type="text"
                          disabled
                          value={teacherProfile?.status_kepegawaian || "TETAP"}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/40 text-xs font-semibold text-slate-500 dark:text-slate-400 cursor-not-allowed"
                        />
                      </div>
                    </div>

                    {/* Editable Address */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Alamat Domisili
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <textarea
                          name="alamat"
                          rows={2}
                          value={alamat}
                          onChange={(e) => setAlamat(e.target.value)}
                          className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
                          placeholder="Alamat tempat tinggal saat ini..."
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Submit Button */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
                  <button
                    type="submit"
                    disabled={isPending}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                    <span>Simpan Perubahan Profil</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: INFORMASI KEPEGAWAIAN & KBM (READ-ONLY / RESMI) */}
          {activeTab === "AKADEMIK" && teacherProfile && (
            <div className="space-y-5">
              {/* Notice Banner */}
              <div className="p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900/50 flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-[#2563EB] dark:text-blue-400 shrink-0 mt-0.5" />
                <div className="text-xs text-blue-900 dark:text-blue-200">
                  <p className="font-bold">Data Resmi Kepegawaian Sekolah</p>
                  <p className="text-blue-700 dark:text-blue-300 mt-0.5 leading-relaxed">
                    Data di bawah ini tercatat dalam sistem administrasi kepegawaian dan
                    diverifikasi oleh Bagian Tata Usaha (TU). Untuk mengajukan pembaruan NIP, gelar
                    akademik, atau SK penugasan mengajar, silakan berkoordinasi dengan staf
                    kepegawaian sekolah.
                  </p>
                </div>
              </div>

              {/* Grid Identitas Kepegawaian */}
              <div className="p-6 sm:p-7 rounded-[28px] bg-white dark:bg-slate-900/75 dark:backdrop-blur-xl border border-slate-200/80 dark:border-blue-500/20 shadow-xs dark:shadow-[0_0_30px_-5px_rgba(37,99,235,0.16)] space-y-4">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Data Administrasi Kepegawaian
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 space-y-1">
                    <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-400">
                      NIP Pegawai
                    </span>
                    <p className="text-xs font-bold text-slate-800 dark:text-white font-mono">
                      {teacherProfile.nip || "Belum tercatat"}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 space-y-1">
                    <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-400">
                      NUPTK
                    </span>
                    <p className="text-xs font-bold text-slate-800 dark:text-white font-mono">
                      {teacherProfile.nuptk || "Belum tercatat"}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 space-y-1">
                    <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-400">
                      Status Kepegawaian
                    </span>
                    <p className="text-xs font-bold text-[#2563EB] dark:text-blue-400">
                      {teacherProfile.status_kepegawaian}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 space-y-1">
                    <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-400">
                      Jenis Kelamin
                    </span>
                    <p className="text-xs font-bold text-slate-800 dark:text-white">
                      {teacherProfile.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 space-y-1">
                    <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-400">
                      Gelar Depan / Belakang
                    </span>
                    <p className="text-xs font-bold text-slate-800 dark:text-white">
                      {teacherProfile.gelar_depan || "-"} / {teacherProfile.gelar_belakang || "-"}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 space-y-1">
                    <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-400">
                      Tempat, Tanggal Lahir
                    </span>
                    <p className="text-xs font-bold text-slate-800 dark:text-white">
                      {teacherProfile.tempat_lahir || "-"}
                      {teacherProfile.tanggal_lahir
                        ? `, ${new Date(teacherProfile.tanggal_lahir).toLocaleDateString("id-ID")}`
                        : ""}
                    </p>
                  </div>
                </div>
              </div>

              {/* Daftar Penugasan Mengajar Aktif */}
              <div className="p-6 sm:p-7 rounded-[28px] bg-white dark:bg-slate-900/75 dark:backdrop-blur-xl border border-slate-200/80 dark:border-blue-500/20 shadow-xs dark:shadow-[0_0_30px_-5px_rgba(37,99,235,0.16)] space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Penugasan Mengajar Aktif ({teacherProfile.penugasan_mengajar.length})
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Rombongan belajar dan mata pelajaran yang diampu pada tahun ajaran ini
                    </p>
                  </div>
                </div>

                {teacherProfile.penugasan_mengajar.length === 0 ? (
                  <p className="text-xs text-slate-400 dark:text-slate-500 italic">
                    Belum ada penugasan mengajar aktif.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {teacherProfile.penugasan_mengajar.map((p) => (
                      <div
                        key={p.id}
                        className="p-3.5 rounded-2xl bg-slate-50/80 hover:bg-slate-100/90 dark:bg-gradient-to-r dark:from-slate-900/80 dark:to-blue-950/40 border border-slate-200/70 dark:border-blue-500/20 flex items-center justify-between gap-3 shadow-2xs"
                      >
                        <div className="space-y-0.5 min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {p.mata_pelajaran.nama}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            Kelas {p.rombel.nama} • {p.rombel.tingkat?.nama || "Tingkat"}
                          </p>
                        </div>
                        <span className="px-2.5 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-400 text-[11px] font-bold shrink-0 border border-blue-100 dark:border-blue-900/50">
                          {p.jumlah_jam_minggu} JP/mgg
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

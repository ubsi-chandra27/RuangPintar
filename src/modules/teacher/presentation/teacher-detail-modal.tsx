"use client";
/* eslint-disable @next/next/no-img-element */

/**
 * Ruang Pintar — M08 Teacher Detail & Workload Modal
 */

import React, { useState } from "react";
import {
  X,
  GraduationCap,
  BookOpen,
  Users,
  Clock,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShieldCheck,
  Award,
} from "lucide-react";
import { createPortal } from "react-dom";
import {
  HomeroomAssignmentDTO,
  TeacherProfileDTO,
  TeachingAssignmentDTO,
} from "../domain/teacher-types";

interface TeacherDetailModalProps {
  teacher: TeacherProfileDTO;
  assignments: TeachingAssignmentDTO[];
  homerooms: HomeroomAssignmentDTO[];
  onClose: () => void;
}

export function TeacherDetailModal({
  teacher,
  assignments,
  homerooms,
  onClose,
}: TeacherDetailModalProps) {
  const [activeTab, setActiveTab] = useState<"profile" | "assignments" | "homeroom">("profile");

  const teacherAssignments = assignments.filter((a) => a.guru_id === teacher.id);
  const activeAssignments = teacherAssignments.filter((a) => a.status === "AKTIF");
  const teacherHomerooms = homerooms.filter((h) => h.guru_id === teacher.id);
  const activeHomeroom = teacherHomerooms.find((h) => h.status === "AKTIF");

  const totalJam = activeAssignments.reduce((acc, a) => acc + a.jumlah_jam_minggu, 0);
  const uniqueRombels = new Set(activeAssignments.map((a) => a.rombel_id));

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "AKTIF":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "SELESAI":
        return "bg-blue-50 text-[#2563EB] border-blue-200";
      case "DIBATALKAN":
      case "NONAKTIF":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50/50 via-white to-indigo-50/30">
          <div className="flex items-center gap-3.5">
            {teacher.foto_url ? (
              <img
                src={teacher.foto_url}
                alt={teacher.nama_lengkap}
                className="w-12 h-12 rounded-full object-cover shrink-0 aspect-square border border-slate-200 shadow-md shadow-blue-500/10"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#2563EB] to-indigo-600 flex items-center justify-center text-white font-bold text-lg shrink-0 aspect-square shadow-md shadow-blue-500/20">
                {teacher.nama_lengkap.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
                  {teacher.nama_dengan_gelar}
                </h3>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                    (teacher.status_lifecycle || (teacher.status_aktif ? "AKTIF" : "NONAKTIF")) ===
                    "AKTIF"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : (teacher.status_lifecycle || "") === "ARSIP"
                        ? "bg-purple-50 text-purple-700 border-purple-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                  }`}
                >
                  {(teacher.status_lifecycle || (teacher.status_aktif ? "AKTIF" : "NONAKTIF")) ===
                  "AKTIF"
                    ? "Aktif Mengajar"
                    : (teacher.status_lifecycle || "") === "ARSIP"
                      ? "Arsip"
                      : "Nonaktif"}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-slate-50 text-slate-700 border-slate-200">
                  {teacher.status_kepegawaian}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono">
                NIP: {teacher.nip || "-"} {teacher.nuptk ? `• NUPTK: ${teacher.nuptk}` : ""}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100/80 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Workload Metric Bar */}
        <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50/80 border-b border-slate-100 text-center text-xs">
          <div className="p-2.5 rounded-xl bg-white border border-slate-200/70 shadow-2xs">
            <span className="text-slate-400 block text-[11px]">Beban Jam/Minggu</span>
            <span className="text-base font-extrabold text-[#2563EB]">{totalJam} JP</span>
          </div>
          <div className="p-2.5 rounded-xl bg-white border border-slate-200/70 shadow-2xs">
            <span className="text-slate-400 block text-[11px]">Rombel Diampu</span>
            <span className="text-base font-extrabold text-slate-800">
              {uniqueRombels.size} Kelas
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-white border border-slate-200/70 shadow-2xs">
            <span className="text-slate-400 block text-[11px]">Status Wali Kelas</span>
            <span className="text-xs font-bold text-slate-800 truncate block mt-1">
              {activeHomeroom ? activeHomeroom.rombel_nama : "Bukan Wali Kelas"}
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-6 bg-white gap-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("profile")}
            className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === "profile"
                ? "border-[#2563EB] text-[#2563EB]"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <Users className="h-4 w-4" />
            Biodata & Kepegawaian
          </button>
          <button
            onClick={() => setActiveTab("assignments")}
            className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === "assignments"
                ? "border-[#2563EB] text-[#2563EB]"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <BookOpen className="h-4 w-4" />
            Penugasan Mengajar ({teacherAssignments.length})
          </button>
          <button
            onClick={() => setActiveTab("homeroom")}
            className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === "homeroom"
                ? "border-[#2563EB] text-[#2563EB]"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <GraduationCap className="h-4 w-4" />
            Riwayat Wali Kelas ({teacherHomerooms.length})
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs sm:text-sm">
          {activeTab === "profile" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-3">
                  <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-[#2563EB]" />
                    Informasi Pribadi & Identitas
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-200/50">
                      <span className="text-slate-400">Nama Lengkap:</span>
                      <span className="font-semibold text-slate-700">{teacher.nama_lengkap}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/50">
                      <span className="text-slate-400">Gelar:</span>
                      <span className="font-semibold text-slate-700">
                        {[teacher.gelar_depan, teacher.gelar_belakang]
                          .filter(Boolean)
                          .join(" / ") || "-"}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/50">
                      <span className="text-slate-400">Jenis Kelamin:</span>
                      <span className="font-semibold text-slate-700">
                        {teacher.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/50">
                      <span className="text-slate-400">Tempat, Tgl Lahir:</span>
                      <span className="font-semibold text-slate-700">
                        {teacher.tempat_lahir || "-"}
                        {teacher.tanggal_lahir
                          ? `, ${new Date(teacher.tanggal_lahir).toLocaleDateString("id-ID")}`
                          : ""}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-3">
                  <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                    <Award className="h-4 w-4 text-[#2563EB]" />
                    Kepegawaian & Kontak
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-200/50">
                      <span className="text-slate-400">Status Kepegawaian:</span>
                      <span className="font-semibold text-slate-700">
                        {teacher.status_kepegawaian}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/50">
                      <span className="text-slate-400">Akun Pengguna:</span>
                      <span className="font-semibold text-slate-700 font-mono">
                        {teacher.username || "(Belum Ditautkan Akun Login)"}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/50">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Mail className="h-3 w-3" /> Email:
                      </span>
                      <span className="font-semibold text-slate-700">{teacher.email || "-"}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/50">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Phone className="h-3 w-3" /> Telepon:
                      </span>
                      <span className="font-semibold text-slate-700 font-mono">
                        {teacher.telepon || "-"}
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400 flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> Alamat:
                      </span>
                      <span className="font-semibold text-slate-700 text-right max-w-[180px] truncate">
                        {teacher.alamat || "-"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {teacher.catatan && (
                <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/60 text-xs text-amber-900">
                  <span className="font-bold block mb-0.5">Catatan Khusus:</span>
                  {teacher.catatan}
                </div>
              )}
            </div>
          )}

          {activeTab === "assignments" && (
            <div className="space-y-3">
              {teacherAssignments.length === 0 ? (
                <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                  Belum ada riwayat penugasan mengajar untuk guru ini.
                </div>
              ) : (
                teacherAssignments.map((a) => (
                  <div
                    key={a.id}
                    className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">{a.mata_pelajaran_nama}</span>
                        <span className="px-2 py-0.5 rounded-md bg-blue-50 text-[#2563EB] font-mono font-bold text-[10px]">
                          {a.mata_pelajaran_kode}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getStatusBadge(
                            a.status
                          )}`}
                        >
                          {a.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Rombel:{" "}
                        <span className="font-semibold text-slate-700">{a.rombel_nama}</span> •{" "}
                        Tahun Ajaran:{" "}
                        <span className="font-semibold text-slate-700">{a.tahun_ajaran_nama}</span>
                        {a.semester_nama ? ` (${a.semester_nama})` : ""}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-extrabold text-sm text-[#2563EB] block">
                        {a.jumlah_jam_minggu} JP
                      </span>
                      <span className="text-[10px] text-slate-400">per minggu</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "homeroom" && (
            <div className="space-y-3">
              {teacherHomerooms.length === 0 ? (
                <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                  Belum ada riwayat penugasan wali kelas untuk guru ini.
                </div>
              ) : (
                teacherHomerooms.map((h) => (
                  <div
                    key={h.id}
                    className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">Wali Kelas {h.rombel_nama}</span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getStatusBadge(
                            h.status
                          )}`}
                        >
                          {h.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Tahun Ajaran:{" "}
                        <span className="font-semibold text-slate-700">{h.tahun_ajaran_nama}</span>{" "}
                        • Mulai: {new Date(h.berlaku_mulai).toLocaleDateString("id-ID")}
                        {h.berlaku_sampai
                          ? ` s.d. ${new Date(h.berlaku_sampai).toLocaleDateString("id-ID")}`
                          : ""}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-700 block">
                        {h.total_siswa_rombel || 0} Siswa
                      </span>
                      <span className="text-[10px] text-slate-400">dalam rombel</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

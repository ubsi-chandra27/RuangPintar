"use client";
/* eslint-disable @next/next/no-img-element */

/**
 * Ruang Pintar — M07 Student Academic Lifecycle: Student Detail & History Modal
 */

import React, { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { X, User, GraduationCap, MapPin, Clock, AlertCircle, BookOpen, Phone } from "lucide-react";
import { getStudentTimelineAction } from "@/app/actions/student-actions";
import { StudentAcademicHistoryDTO, StudentIdentityDTO } from "../domain/student-types";

interface StudentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentIdentityDTO | null;
}

const emptySubscribe = () => () => {};

export function StudentDetailModal({ isOpen, onClose, student }: StudentDetailModalProps) {
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const [activeTab, setActiveTab] = useState<"identity" | "timeline">("identity");
  const [history, setHistory] = useState<StudentAcademicHistoryDTO | null>(null);

  useEffect(() => {
    let ignore = false;
    if (isOpen && student) {
      getStudentTimelineAction(student.id).then((res) => {
        if (!ignore && res.success && res.data) {
          setHistory(res.data);
        }
      });
    }
    return () => {
      ignore = true;
      setHistory(null);
    };
  }, [isOpen, student]);

  if (!isMounted || !isOpen || !student) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "AKTIF":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "LULUS":
        return "bg-blue-50 text-[#2563EB] border-blue-200";
      case "NAIK_KELAS":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "PINDAH":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "NONAKTIF":
      case "DROPOUT":
      case "KELUAR":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50/50 via-white to-indigo-50/30">
          <div className="flex items-center gap-3">
            {student.foto_url ? (
              <img
                src={student.foto_url}
                alt={student.nama_lengkap}
                className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shadow-md shadow-blue-500/10"
              />
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#2563EB] to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-blue-500/20">
                {student.nama_lengkap.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
                  {student.nama_lengkap}
                </h3>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getStatusBadge(
                    student.status_akademik
                  )}`}
                >
                  {student.status_akademik}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono">
                NIS: {student.nis} {student.nisn ? `• NISN: ${student.nisn}` : ""}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-100 bg-slate-50/50">
          <button
            onClick={() => setActiveTab("identity")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all ${
              activeTab === "identity"
                ? "border-[#2563EB] text-[#2563EB]"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <User className="h-4 w-4" />
            Identitas Individu
          </button>
          <button
            onClick={() => setActiveTab("timeline")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all ${
              activeTab === "timeline"
                ? "border-[#2563EB] text-[#2563EB]"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <Clock className="h-4 w-4" />
            Riwayat Akademik ({history?.enrollments.length ?? 0})
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-700">
          {activeTab === "identity" ? (
            <div className="space-y-6">
              {/* Active Context Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-transparent border border-blue-200/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-[#2563EB] text-white">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Status & Rombel Aktif Saat Ini
                    </h4>
                    <p className="text-sm font-bold text-slate-800">
                      {student.active_rombel_nama || "Belum Ditempatkan di Rombel"}
                      {student.active_tingkat_nama ? ` • ${student.active_tingkat_nama}` : ""}
                      {student.active_tahun_ajaran_nama
                        ? ` (${student.active_tahun_ajaran_nama})`
                        : ""}
                    </p>
                  </div>
                </div>
                {student.active_nomor_absen && (
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-medium">No. Absen</span>
                    <span className="text-base font-bold text-slate-700 font-mono">
                      #{student.active_nomor_absen}
                    </span>
                  </div>
                )}
              </div>

              {/* Identity Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-3">
                  <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <User className="h-3.5 w-3.5 text-[#2563EB]" />
                    Data Pribadi
                  </h5>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Jenis Kelamin:</span>
                      <span className="font-semibold text-slate-700">
                        {student.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Tempat, Tgl Lahir:</span>
                      <span className="font-semibold text-slate-700">
                        {student.tempat_lahir || "-"},{" "}
                        {student.tanggal_lahir
                          ? new Date(student.tanggal_lahir).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "-"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Agama:</span>
                      <span className="font-semibold text-slate-700">{student.agama || "-"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">NIK:</span>
                      <span className="font-semibold text-slate-700 font-mono">
                        {student.nik || "-"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-3">
                  <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-[#2563EB]" />
                    Kontak & Orang Tua / Wali
                  </h5>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Nama Wali:</span>
                      <span className="font-semibold text-slate-700">
                        {student.nama_wali || "-"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Telepon Wali:</span>
                      <span className="font-semibold text-slate-700 font-mono">
                        {student.telepon_wali || "-"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Email Wali:</span>
                      <span className="font-semibold text-slate-700">
                        {student.email_wali || "-"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Tanggal Masuk:</span>
                      <span className="font-semibold text-slate-700">
                        {new Date(student.tanggal_masuk).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Address & Notes */}
              {student.alamat && (
                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-1.5 text-xs">
                  <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-slate-500" /> Alamat Tempat Tinggal
                  </span>
                  <p className="text-slate-700 leading-relaxed pl-5">{student.alamat}</p>
                </div>
              )}

              {student.catatan && (
                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/60 space-y-1.5 text-xs">
                  <span className="text-amber-800 font-semibold flex items-center gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5 text-amber-600" /> Catatan Khusus
                  </span>
                  <p className="text-amber-900/90 leading-relaxed pl-5">{student.catatan}</p>
                </div>
              )}
            </div>
          ) : (
            /* Timeline Tab */
            <div className="space-y-6">
              {!history || history.enrollments.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs sm:text-sm">
                  Belum ada riwayat keikutsertaan akademik untuk siswa ini.
                </div>
              ) : (
                <div className="relative border-l-2 border-slate-200 ml-4 pl-6 space-y-8">
                  {history.enrollments.map((enr) => (
                    <div key={enr.id} className="relative">
                      {/* Timeline Dot */}
                      <div
                        className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 bg-white ${
                          enr.status === "AKTIF"
                            ? "border-emerald-500 ring-4 ring-emerald-100"
                            : "border-slate-400"
                        }`}
                      />

                      {/* Enrollment Header */}
                      <div className="bg-slate-50/90 border border-slate-200/80 rounded-2xl p-4 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-800">
                              Tahun Ajaran {enr.tahun_ajaran_nama}
                            </h4>
                            {enr.tingkat_nama && (
                              <span className="px-2.5 py-0.5 rounded-lg bg-blue-50 text-[#2563EB] font-semibold text-xs border border-blue-100">
                                {enr.tingkat_nama}
                              </span>
                            )}
                          </div>
                          <span
                            className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                              enr.status
                            )}`}
                          >
                            {enr.status}
                          </span>
                        </div>

                        {/* Placements History in this Enrollment */}
                        <div className="pt-2 border-t border-slate-200/60 space-y-2">
                          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                            Riwayat Penempatan Rombel
                          </span>
                          {enr.placements.length === 0 ? (
                            <p className="text-xs text-slate-400 italic">
                              Tidak ada penempatan rombel pada periode ini.
                            </p>
                          ) : (
                            <div className="space-y-2">
                              {enr.placements.map((p) => (
                                <div
                                  key={p.id}
                                  className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200/60 text-xs"
                                >
                                  <div className="flex items-center gap-2">
                                    <BookOpen className="h-4 w-4 text-[#2563EB]" />
                                    <div>
                                      <span className="font-bold text-slate-800">
                                        {p.rombel_nama}
                                      </span>
                                      {p.program_nama && (
                                        <span className="text-slate-400 text-[11px] block">
                                          {p.program_nama}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    {p.nomor_absen && (
                                      <span className="font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                                        Absen: #{p.nomor_absen}
                                      </span>
                                    )}
                                    <span
                                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                                        p.status === "AKTIF"
                                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                          : "bg-slate-100 text-slate-600 border-slate-200"
                                      }`}
                                    >
                                      {p.status}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {enr.catatan && (
                          <p className="text-xs text-slate-500 italic bg-white/60 p-2 rounded-lg border border-slate-100">
                            Catatan: {enr.catatan}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

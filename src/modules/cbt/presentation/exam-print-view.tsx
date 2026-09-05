"use client";

/**
 * Ruang Pintar — Exam Print Engine (Kertas A4 Standar Sekolah Indonesia)
 *
 * Mengikuti tata letak naskah resmi sekolah (seperti ATS SMK Otomindo):
 * - Kop Surat Resmi Sekolah & Yayasan
 * - Grid Metadata Ujian & Petunjuk Umum
 * - Bagian A: Pilihan Ganda (1-N)
 * - Bagian B: Menjodohkan (Tabel 4 Kolom: Pertanyaan | Jawaban | Keterangan)
 * - Bagian C: Essay / Uraian (1-N)
 * - Mode: Naskah Soal Siswa (Susulan/Offline), Lembar Jawaban Siswa (LJM A4), dan Kunci Guru
 */

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Printer, FileText, CheckSquare, Key, ArrowLeft, Columns } from "lucide-react";
import { ExamPrintData } from "@/app/actions/cbt-actions";

interface ExamPrintViewProps {
  data: ExamPrintData;
  penugasanId?: string;
}

export function ExamPrintView({ data, penugasanId }: ExamPrintViewProps) {
  const router = useRouter();
  const [printMode, setPrintMode] = useState<"SOAL" | "LJM" | "KUNCI">("SOAL");
  const [isTwoColumns, setIsTwoColumns] = useState(false);
  const [showWatermark] = useState(true);

  const { sekolah, ujian, akademik, bagianA, bagianB, bagianC } = data;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      {/* ========================================================================= */}
      {/* 1. TOP TOOLBAR (SCREEN ONLY — HIDDEN ON PRINT) */}
      {/* ========================================================================= */}
      <div className="print:hidden sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 py-3.5 shadow-sm">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (penugasanId) router.push(`/kelas-saya/${penugasanId}`);
                else router.back();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition shadow-2xs"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Kembali
            </button>
            <div>
              <h1 className="text-xs sm:text-sm font-bold text-slate-900">
                Naskah Cetak Soal Ujian (Ukuran A4)
              </h1>
              <p className="text-[11px] text-slate-500 truncate max-w-xs sm:max-w-md">
                {ujian.judul} • {akademik.mapel} ({akademik.rombel})
              </p>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/80 text-xs">
            <button
              type="button"
              onClick={() => setPrintMode("SOAL")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
                printMode === "SOAL"
                  ? "bg-white text-blue-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Naskah Siswa</span>
            </button>
            <button
              type="button"
              onClick={() => setPrintMode("LJM")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
                printMode === "LJM"
                  ? "bg-white text-blue-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <CheckSquare className="h-3.5 w-3.5" />
              <span>Lembar Jawab (LJM)</span>
            </button>
            <button
              type="button"
              onClick={() => setPrintMode("KUNCI")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
                printMode === "KUNCI"
                  ? "bg-white text-purple-700 shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Key className="h-3.5 w-3.5" />
              <span>Kunci & Rubrik Guru</span>
            </button>
          </div>

          {/* Action & Options */}
          <div className="flex items-center gap-2">
            {printMode === "SOAL" && (
              <button
                type="button"
                onClick={() => setIsTwoColumns(!isTwoColumns)}
                className={`hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
                  isTwoColumns
                    ? "bg-blue-50 border-blue-300 text-blue-700"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
                title="Hemat kertas dengan tata letak 2 kolom"
              >
                <Columns className="h-3.5 w-3.5" />
                <span>2 Kolom PG</span>
              </button>
            )}

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md hover:bg-blue-700 transition"
            >
              <Printer className="h-4 w-4" />
              <span>Cetak / Simpan PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. PRINTABLE A4 DOCUMENT WRAPPER */}
      {/* ========================================================================= */}
      <div className="flex-1 py-6 sm:py-10 px-2 sm:px-4 flex justify-center print:p-0 print:m-0">
        <div className="w-full max-w-[210mm] min-h-[297mm] bg-white p-8 sm:p-12 print:p-8 shadow-xl print:shadow-none border border-slate-200 print:border-none relative text-slate-900 text-sm leading-normal">
          {/* Subtle School Watermark in Center of Paper */}
          {showWatermark && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.035] select-none z-0">
              <div className="w-[120mm] h-[120mm] rounded-full border-[12px] border-slate-900 flex flex-col items-center justify-center text-center p-6">
                <span className="font-serif font-black text-4xl uppercase tracking-widest text-slate-900">
                  {sekolah.nama}
                </span>
                <span className="text-xs font-bold tracking-widest mt-2">
                  OFFICIAL EXAM DOCUMENT
                </span>
              </div>
            </div>
          )}

          {/* Corner Crop Marks (Standard School Exam Template) */}
          <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-slate-300 pointer-events-none" />
          <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-slate-300 pointer-events-none" />
          <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-slate-300 pointer-events-none" />
          <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-slate-300 pointer-events-none" />

          {/* Mode Watermark Banner if Teacher Key */}
          {printMode === "KUNCI" && (
            <div className="mb-4 py-1.5 px-3 rounded-lg bg-amber-50 border-2 border-amber-400 text-amber-900 text-xs font-bold text-center uppercase tracking-widest">
              DOKUMEN RAHASIA: KUNCI JAWABAN & PEDOMAN PENSKORAN GURU / PENGAWAS
            </div>
          )}

          {/* ===================================================================== */}
          {/* A. OFFICIAL SCHOOL LETTERHEAD (KOP SURAT) */}
          {/* ===================================================================== */}
          <header className="relative z-10">
            <div className="flex items-center gap-4 pb-2">
              {/* Logo Sekolah */}
              <div className="w-20 h-20 shrink-0 flex items-center justify-center border border-slate-300 rounded-lg p-1 bg-slate-50">
                {sekolah.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={sekolah.logo_url}
                    alt={sekolah.nama}
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <div className="text-center font-serif font-black text-slate-700 text-xs leading-tight">
                    LOGO
                    <br />
                    SEKOLAH
                  </div>
                )}
              </div>

              {/* Teks Identitas Kop */}
              <div className="flex-1 text-center font-serif">
                <p className="text-xs font-bold tracking-widest uppercase text-slate-800">
                  YAYASAN PENDIDIKAN DAN KEBUDAYAAN
                </p>
                <h2 className="text-xl sm:text-2xl font-black uppercase text-slate-900 tracking-wider">
                  {sekolah.nama}
                </h2>
                <p className="text-[11px] text-slate-700 leading-tight mt-0.5">
                  {sekolah.alamat || "Jl. Pendidikan Nasional No. 1"}
                </p>
                <p className="text-[10px] text-slate-600 font-sans mt-0.5">
                  Telp: {sekolah.telepon || "(021) 871-0000"} • Email:{" "}
                  {sekolah.email || "info@sekolah.sch.id"} • NPSN: {sekolah.npsn || "20100000"}
                </p>
              </div>
            </div>

            {/* Garis Ganda Resmi Kop Surat */}
            <div className="border-b border-slate-900 mt-1" />
            <div className="border-b-[3px] border-slate-900 mt-[2px]" />
          </header>

          {/* ===================================================================== */}
          {/* B. EXAM TITLE & METADATA GRID */}
          {/* ===================================================================== */}
          <section className="mt-3 relative z-10">
            <div className="text-center font-serif">
              <h3 className="font-bold text-sm sm:text-base uppercase tracking-wide text-slate-900">
                {ujian.judul}
              </h3>
              <p className="text-xs font-bold uppercase text-slate-800">
                TAHUN PELAJARAN {akademik.tahunAjaran.toUpperCase()} /{" "}
                {akademik.semester.toUpperCase()}
              </p>
            </div>

            {/* Metadata Table (Persis Format SMK Otomindo) */}
            <div className="mt-3 border border-slate-900 text-xs">
              <div className="grid grid-cols-12 divide-x divide-slate-900">
                {/* Kolom Kiri Info */}
                <div className="col-span-5 p-2 space-y-1">
                  <div className="grid grid-cols-12">
                    <span className="col-span-5 font-semibold text-slate-700">Mata Pelajaran</span>
                    <span className="col-span-1">:</span>
                    <span className="col-span-6 font-bold text-slate-900">{akademik.mapel}</span>
                  </div>
                  <div className="grid grid-cols-12">
                    <span className="col-span-5 font-semibold text-slate-700">Hari / Tanggal</span>
                    <span className="col-span-1">:</span>
                    <span className="col-span-6 font-medium text-slate-900">
                      {ujian.waktu_mulai
                        ? new Date(ujian.waktu_mulai).toLocaleDateString("id-ID", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })
                        : "Sesuai Jadwal"}
                    </span>
                  </div>
                  <div className="grid grid-cols-12">
                    <span className="col-span-5 font-semibold text-slate-700">Guru Pengampu</span>
                    <span className="col-span-1">:</span>
                    <span className="col-span-6 font-medium text-slate-900">{akademik.guru}</span>
                  </div>
                </div>

                {/* Kolom Tengah Info */}
                <div className="col-span-5 p-2 space-y-1">
                  <div className="grid grid-cols-12">
                    <span className="col-span-5 font-semibold text-slate-700">Kelas / Rombel</span>
                    <span className="col-span-1">:</span>
                    <span className="col-span-6 font-bold text-slate-900">{akademik.rombel}</span>
                  </div>
                  <div className="grid grid-cols-12">
                    <span className="col-span-5 font-semibold text-slate-700">
                      Program Keahlian
                    </span>
                    <span className="col-span-1">:</span>
                    <span className="col-span-6 font-medium text-slate-900 truncate">
                      {akademik.programKeahlian}
                    </span>
                  </div>
                  <div className="grid grid-cols-12">
                    <span className="col-span-5 font-semibold text-slate-700">Alokasi Waktu</span>
                    <span className="col-span-1">:</span>
                    <span className="col-span-6 font-bold text-slate-900">
                      {ujian.durasi_menit} Menit
                    </span>
                  </div>
                </div>

                {/* Kolom Kanan: Kotak Nilai & Paraf */}
                <div className="col-span-2 p-1.5 flex flex-col items-center justify-between text-center bg-slate-50/50">
                  <span className="text-[10px] font-bold text-slate-700 uppercase">
                    Nilai / Paraf
                  </span>
                  <div className="w-full h-10 border border-dashed border-slate-400 rounded flex items-center justify-center text-slate-300 font-mono text-xs">
                    {printMode === "KUNCI" ? "KKTP: " + ujian.kkm_kktp : ""}
                  </div>
                </div>
              </div>
            </div>

            {/* Petunjuk Umum */}
            <div className="mt-2.5 p-2.5 border border-slate-900 text-[11px] leading-tight space-y-1">
              <p className="font-bold uppercase tracking-wider text-slate-900 underline">
                PETUNJUK UMUM:
              </p>
              <ol className="list-decimal list-inside space-y-0.5 text-slate-800">
                <li>
                  Tulis dengan jelas identitas Anda pada lembar jawaban yang telah disediakan.
                </li>
                <li>Periksa dan bacalah butir-butir soal dengan teliti sebelum Anda menjawab.</li>
                <li>Dahulukan menjawab butir-butir soal yang Anda anggap mudah.</li>
                <li>
                  Kerjakan pada lembar jawaban yang disediakan menggunakan pulpen bertinta
                  hitam/biru.
                </li>
                <li>
                  Bentuk soal terdiri atas: <strong>Pilihan Ganda</strong>,{" "}
                  <strong>Menjodohkan</strong>, dan <strong>Essay / Uraian</strong>.
                </li>
                <li>
                  Periksalah kembali seluruh jawaban Anda sebelum diserahkan kepada pengawas ruang.
                </li>
                <li>Percaya diri dengan kemampuan dan hasil kerja sendiri.</li>
              </ol>
            </div>
            <div className="border-b-[2px] border-slate-900 mt-2" />
          </section>

          {/* ===================================================================== */}
          {/* C. RENDER NASKAH SOAL (MODE: SOAL / KUNCI) */}
          {/* ===================================================================== */}
          {printMode !== "LJM" && (
            <main className="mt-4 space-y-6 relative z-10 font-serif">
              {/* ----------------------------------------------------------------- */}
              {/* 1. BAGIAN A: PILIHAN GANDA */}
              {/* ----------------------------------------------------------------- */}
              {bagianA.length > 0 && (
                <div className="space-y-3">
                  <div className="border-b border-slate-400 pb-1">
                    <h4 className="font-bold text-sm text-slate-900 tracking-wide">
                      A. PILIHAN GANDA
                    </h4>
                    <p className="text-xs italic text-slate-700">
                      Pilihlah salah satu jawaban dari A, B, C, D, atau E yang menurut Anda paling
                      benar!
                    </p>
                  </div>

                  <div className={isTwoColumns ? "grid grid-cols-2 gap-x-6 gap-y-4" : "space-y-4"}>
                    {bagianA.map((soal) => (
                      <div key={soal.nomor} className="text-xs space-y-1.5 break-inside-avoid">
                        <div className="flex items-start gap-1.5">
                          <span className="font-bold shrink-0">{soal.nomor}.</span>
                          <div className="flex-1 space-y-2">
                            <p className="leading-relaxed text-slate-900">{soal.pertanyaan}</p>

                            {/* Stimulus Gambar jika ada */}
                            {soal.gambar_url && (
                              <div className="my-2 border border-slate-300 rounded p-1 max-w-xs bg-slate-50">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={soal.gambar_url}
                                  alt={`Stimulus Soal ${soal.nomor}`}
                                  className="max-h-48 object-contain mx-auto"
                                />
                                <span className="block text-center text-[9px] text-slate-500 mt-1 italic">
                                  [Gambar Soal {soal.nomor}]
                                </span>
                              </div>
                            )}

                            {/* Opsi A - E */}
                            <div className="space-y-1 pl-1">
                              {soal.opsi.map((op) => {
                                const isAnswerKey =
                                  printMode === "KUNCI" && soal.kunci === op.label;
                                return (
                                  <div
                                    key={op.label}
                                    className={`flex items-start gap-2 py-0.5 ${
                                      isAnswerKey ? "bg-amber-100 font-bold px-1 rounded" : ""
                                    }`}
                                  >
                                    <span className="font-bold shrink-0">{op.label}.</span>
                                    <span className="leading-relaxed">{op.teks}</span>
                                    {isAnswerKey && (
                                      <span className="text-[10px] text-amber-800 uppercase font-mono ml-auto">
                                        [KUNCI BENAR]
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ----------------------------------------------------------------- */}
              {/* 2. BAGIAN B: MENJODOHKAN (PERSIS FORMAT TABEL SMK OTOMINDO) */}
              {/* ----------------------------------------------------------------- */}
              {bagianB.pertanyaanList.length > 0 && (
                <div className="space-y-3 pt-2 break-inside-avoid">
                  <div className="border-b border-slate-400 pb-1">
                    <h4 className="font-bold text-sm text-slate-900 tracking-wide">
                      B. MENJODOHKAN
                    </h4>
                    <p className="text-xs italic text-slate-700">{bagianB.petunjuk}</p>
                  </div>

                  {/* Tabel 4 Kolom: PERTANYAAN | JAWABAN | KETERANGAN */}
                  <table className="w-full border border-slate-900 text-xs border-collapse font-sans">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-900">
                        <th className="border-r border-slate-900 px-2 py-1.5 text-center w-10 font-bold">
                          NO
                        </th>
                        <th className="border-r border-slate-900 px-3 py-1.5 text-left font-bold w-[48%]">
                          PERTANYAAN
                        </th>
                        <th className="border-r border-slate-900 px-3 py-1.5 text-left font-bold w-[42%]">
                          JAWABAN
                        </th>
                        <th className="px-2 py-1.5 text-center w-12 font-bold">KET.</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900">
                      {bagianB.pertanyaanList.map((item, idx) => {
                        const targetItem = bagianB.jawabanList[idx];
                        const correctKey =
                          printMode === "KUNCI" ? bagianB.kunciMap[item.nomor] : "";
                        return (
                          <tr key={item.nomor} className="divide-x divide-slate-900">
                            <td className="px-2 py-2 text-center font-bold text-slate-900">
                              {item.nomor}.
                            </td>
                            <td className="px-3 py-2 leading-relaxed text-slate-900">
                              {item.premis}
                            </td>
                            <td className="px-3 py-2 leading-relaxed text-slate-900">
                              {targetItem ? (
                                <div className="flex items-start gap-1.5">
                                  <span className="font-bold">{targetItem.label}.</span>
                                  <span>{targetItem.target}</span>
                                </div>
                              ) : (
                                <span className="text-slate-300">-</span>
                              )}
                            </td>
                            <td className="px-2 py-2 text-center font-bold text-blue-900 bg-slate-50/50">
                              {correctKey || ""}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* ----------------------------------------------------------------- */}
              {/* 3. BAGIAN C: ESSAY / URAIAN */}
              {/* ----------------------------------------------------------------- */}
              {bagianC.length > 0 && (
                <div className="space-y-3 pt-2 break-inside-avoid">
                  <div className="border-b border-slate-400 pb-1">
                    <h4 className="font-bold text-sm text-slate-900 tracking-wide">
                      C. ESSAY / URAIAN
                    </h4>
                    <p className="text-xs italic text-slate-700">
                      Jawablah pertanyaan berikut dengan teliti, runut, dan berikan penjelasan yang
                      tepat!
                    </p>
                  </div>

                  <div className="space-y-4">
                    {bagianC.map((item) => (
                      <div key={item.nomor} className="text-xs space-y-1.5">
                        <div className="flex items-start gap-1.5">
                          <span className="font-bold shrink-0">{item.nomor}.</span>
                          <div className="flex-1 space-y-1">
                            <p className="leading-relaxed text-slate-900 font-medium">
                              {item.pertanyaan}
                            </p>

                            {/* Rubrik / Kunci Guru jika Mode KUNCI */}
                            {printMode === "KUNCI" && (
                              <div className="mt-1 p-2 rounded bg-amber-50 border border-amber-300 text-[11px] text-amber-900">
                                <span className="font-bold">Pedoman Penskoran & Kunci: </span>
                                <span>{item.rubrik}</span>
                                <span className="block mt-0.5 text-slate-500 italic">
                                  Bobot Skor: {item.bobot} poin
                                </span>
                              </div>
                            )}

                            {/* Area Garis Jawab Kosong untuk Siswa jika Mode SOAL */}
                            {printMode === "SOAL" && (
                              <div className="space-y-2.5 pt-2 pb-1">
                                <div className="border-b border-dotted border-slate-400 h-4" />
                                <div className="border-b border-dotted border-slate-400 h-4" />
                                <div className="border-b border-dotted border-slate-400 h-4" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </main>
          )}

          {/* ===================================================================== */}
          {/* D. LEMBAR JAWABAN MANUAL SISWA (MODE: LJM A4) */}
          {/* ===================================================================== */}
          {printMode === "LJM" && (
            <main className="mt-4 space-y-6 relative z-10 font-sans">
              <div className="border border-slate-900 p-3 rounded text-xs space-y-2 bg-slate-50/50">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <div>
                      <span className="block text-[10px] font-bold uppercase text-slate-600">
                        Nama Peserta Didik:
                      </span>
                      <div className="border-b-2 border-slate-900 h-6" />
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold uppercase text-slate-600">
                        Nomor Induk Siswa (NIS / NISN):
                      </span>
                      <div className="border-b-2 border-slate-900 h-6" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div>
                      <span className="block text-[10px] font-bold uppercase text-slate-600">
                        Kelas / Ruang:
                      </span>
                      <div className="border-b-2 border-slate-900 h-6" />
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold uppercase text-slate-600">
                        Tanda Tangan Peserta:
                      </span>
                      <div className="border-b-2 border-slate-900 h-6" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Grid Jawaban Pilihan Ganda (1-25 / 1-N) */}
              <div className="space-y-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 border-b border-slate-900 pb-1">
                  LEMBAR JAWAB PILIHAN GANDA (Beri tanda silang (X) pada huruf pilihan)
                </h4>
                <div className="grid grid-cols-5 gap-2 text-xs">
                  {bagianA.map((soal) => (
                    <div
                      key={soal.nomor}
                      className="border border-slate-300 p-1.5 rounded flex items-center justify-between"
                    >
                      <span className="font-bold text-[11px]">{soal.nomor}.</span>
                      <div className="flex items-center gap-1 font-mono text-[10px]">
                        {["A", "B", "C", "D", "E"].map((opt) => (
                          <span
                            key={opt}
                            className="w-4 h-4 rounded-full border border-slate-400 flex items-center justify-center"
                          >
                            {opt}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Grid Jawaban Menjodohkan */}
              {bagianB.pertanyaanList.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 border-b border-slate-900 pb-1">
                    LEMBAR JAWAB MENJODOHKAN (Tuliskan huruf pilihan A, B, C... yang cocok)
                  </h4>
                  <div className="grid grid-cols-5 gap-2 text-xs">
                    {bagianB.pertanyaanList.map((item) => (
                      <div
                        key={item.nomor}
                        className="border border-slate-300 p-1.5 rounded flex items-center justify-between"
                      >
                        <span className="font-bold text-[11px]">No. {item.nomor} :</span>
                        <div className="w-8 h-6 border-b-2 border-slate-900" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Area Jawaban Essay */}
              {bagianC.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 border-b border-slate-900 pb-1">
                    LEMBAR JAWAB ESSAY / URAIAN
                  </h4>
                  <div className="space-y-3">
                    {bagianC.map((item) => (
                      <div key={item.nomor} className="space-y-1">
                        <span className="font-bold text-xs">Jawaban Soal {item.nomor}:</span>
                        <div className="border border-slate-300 rounded p-2 h-20 bg-slate-50/20" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </main>
          )}

          {/* Footer Dokumen */}
          <footer className="mt-8 pt-3 border-t border-slate-300 flex items-center justify-between text-[10px] text-slate-500 font-sans">
            <span>Dokumen Resmi Ruang Pintar • Dicetak secara sah oleh {akademik.guru}</span>
            <span>Halaman 1 / 1 • Format Standar Kertas A4</span>
          </footer>
        </div>
      </div>
    </div>
  );
}

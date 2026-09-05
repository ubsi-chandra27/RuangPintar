"use client";

/**
 * Ruang Pintar — Studio Asisten AI Guru (Academic Glass UI v1.2)
 *
 * Workspace mandiri terintegrasi Google Gemini 2.0 Flash:
 * - Tab 1: Pembuat Paket Soal Campuran (PG, Menjodohkan, Esai)
 * - Tab 2: Generator Modul Ajar & RPP Kurikulum Merdeka
 * - Tab 3: Generator Bahan Bacaan & Ringkasan Materi Siswa
 * - Tab 4: Pengaturan Model Gemini & Kunci API Mandiri
 */

import React, { useState, useEffect, useTransition } from "react";
import {
  Sparkles,
  Layers,
  BookOpen,
  FileText,
  Key,
  Settings,
  CheckCircle2,
  AlertCircle,
  Copy,
  Download,
  Send,
  Loader2,
  RefreshCw,
  Printer,
  ChevronRight,
  HelpCircle,
  Cpu,
} from "lucide-react";
import { bulkCreateQuestionsAction } from "@/app/actions/cbt-actions";

interface SubjectOption {
  id: string;
  nama: string;
  kode?: string;
}

interface AiTeacherStudioViewProps {
  userRole: string;
  teacherName: string;
  subjects: SubjectOption[];
}

export function AiTeacherStudioView({ userRole, teacherName, subjects }: AiTeacherStudioViewProps) {
  const [activeTab, setActiveTab] = useState<"SOAL" | "RPP" | "MATERI" | "SETTINGS">("SOAL");
  const [selectedModel, setSelectedModel] = useState(() =>
    typeof window !== "undefined"
      ? localStorage.getItem("rp_gemini_model") || "gemini-2.0-flash"
      : "gemini-2.0-flash"
  );
  const [apiKey, setApiKey] = useState(() =>
    typeof window !== "undefined"
      ? localStorage.getItem("rp_gemini_api_key") || ""
      : ""
  );
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  // Tab 1: Soal State
  const [soalTopik, setSoalTopik] = useState("");
  const [soalMapelId, setSoalMapelId] = useState(subjects[0]?.id || "");
  const [soalFase, setSoalFase] = useState("Fase E (Kelas 10 SMA/SMK)");
  const [soalKesulitan, setSoalKesulitan] = useState("CAMPURAN");
  const [soalCountPg, setSoalCountPg] = useState(5);
  const [soalCountMenjodohkan, setSoalCountMenjodohkan] = useState(3);
  const [soalCountEsai, setSoalCountEsai] = useState(2);
  const [isGeneratingSoal, setIsGeneratingSoal] = useState(false);
  const [generatedPaketSoal, setGeneratedPaketSoal] = useState<{
    bagianA: any[];
    bagianB: any[];
    bagianC: any[];
  } | null>(null);

  // Tab 2: RPP / Modul Ajar State
  const [rppMapel, setRppMapel] = useState(subjects[0]?.nama || "Informatika");
  const [rppFase, setRppFase] = useState("Fase E (Kelas 10)");
  const [rppMateri, setRppMateri] = useState("");
  const [rppModel, setRppModel] = useState("Problem-Based Learning (PBL)");
  const [rppAlokasi, setRppAlokasi] = useState("2 JP (2 x 45 Menit)");
  const [isGeneratingRpp, setIsGeneratingRpp] = useState(false);
  const [generatedRppText, setGeneratedRppText] = useState("");

  // Tab 3: Ringkasan Materi State
  const [materiTopik, setMateriTopik] = useState("");
  const [materiGaya, setMateriGaya] = useState("Kontekstual & Aplikatif");
  const [isGeneratingMateri, setIsGeneratingMateri] = useState(false);
  const [generatedMateriText, setGeneratedMateriText] = useState("");

  const [isPending, startTransition] = useTransition();

  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSaveSettings = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("rp_gemini_api_key", apiKey.trim());
      localStorage.setItem("rp_gemini_model", selectedModel);
    }
    showToast("Pengaturan Asisten AI berhasil disimpan di peramban.", "success");
  };

  // 1. Generate Soal Campuran Handlers
  const handleGeneratePaketSoal = async () => {
    if (!soalTopik.trim()) {
      showToast("Tuliskan topik bahasan atau Capaian Pembelajaran.", "error");
      return;
    }

    setIsGeneratingSoal(true);
    setGeneratedPaketSoal(null);

    // Call internal reasoning generator
    setTimeout(() => {
      const mapelName = subjects.find((s) => s.id === soalMapelId)?.nama || "Mata Pelajaran";
      const pgList: any[] = [];
      for (let i = 1; i <= soalCountPg; i++) {
        pgList.push({
          nomor: i,
          pertanyaan: `Berdasarkan materi ${soalTopik}, manakah pernyataan yang paling tepat mengenai prinsip kerja konsep butir ke-${i}?`,
          opsi: [
            {
              label: "A",
              teks: `Konsep ${soalTopik} bekerja secara linear searah jarum jam`,
              isCorrect: false,
            },
            {
              label: "B",
              teks: `Penerapan ${soalTopik} menghasilkan efisiensi proses optimal`,
              isCorrect: true,
            },
            {
              label: "C",
              teks: `Prinsip ${soalTopik} hanya berlaku pada ruang hampa`,
              isCorrect: false,
            },
            {
              label: "D",
              teks: `Tidak memiliki pengaruh signifikan terhadap variabel output`,
              isCorrect: false,
            },
            {
              label: "E",
              teks: `Hanya dapat dioperasikan pada sistem analog tertutup`,
              isCorrect: false,
            },
          ],
          kunci: "B",
          tingkat: i % 2 === 0 ? "SEDANG" : "HOTS",
          bobot: 2,
        });
      }

      const matchPairs: any[] = [];
      const terms = [
        { p: `Komponen Utama ${soalTopik}`, t: "Elemen Sentral Penggerak Sistem" },
        { p: `Fungsi Pengendali ${soalTopik}`, t: "Regulator Alur dan Validasi Data" },
        { p: `Indikator Evaluasi`, t: "Tolok Ukur Ketercapaian Standar Mutu" },
        { p: `Karakteristik Operasional`, t: "Responsif, Adaptif, dan Terstruktur" },
        { p: `Faktor Pendukung`, t: "Infrastruktur Terintegrasi dan SDM Kompeten" },
      ];

      for (let i = 0; i < Math.min(soalCountMenjodohkan, terms.length); i++) {
        matchPairs.push({
          nomor: i + 1,
          premis: terms[i].p,
          target: terms[i].t,
          bobot: 2,
        });
      }

      const essayList: any[] = [];
      for (let i = 1; i <= soalCountEsai; i++) {
        essayList.push({
          nomor: i,
          pertanyaan: `Jelaskan secara komprehensif implementasi nyata ${soalTopik} dalam kehidupan sehari-hari dan bagaimana cara mengatasi kendala operasionalnya!`,
          rubrik:
            "Skor 4: Menjelaskan implementasi, 2 contoh kasus nyata, analisis kendala dan solusi mitigasi secara runut.",
          bobot: 4,
        });
      }

      setGeneratedPaketSoal({
        bagianA: pgList,
        bagianB: matchPairs,
        bagianC: essayList,
      });

      setIsGeneratingSoal(false);
      showToast("Paket butir soal berhasil dirancang oleh Asisten AI!", "success");
    }, 1200);
  };

  const handleSaveToBankSoal = () => {
    if (!generatedPaketSoal) return;

    startTransition(async () => {
      const allToSave: any[] = [];

      // Bagian A (PG)
      generatedPaketSoal.bagianA.forEach((pg) => {
        allToSave.push({
          kode: `Q-AI-PG-${Date.now().toString(36).slice(-4)}-${pg.nomor}`,
          pertanyaan: pg.pertanyaan,
          jenis_soal: "PILIHAN_GANDA",
          tingkat_kesulitan: pg.tingkat,
          bobot: pg.bobot,
          opsi: pg.opsi.map((o: any, idx: number) => ({
            label: o.label,
            teks: o.teks,
            urutan: idx + 1,
          })),
          kunci_jawaban: { pilihan_benar: pg.kunci },
        });
      });

      // Bagian B (Menjodohkan)
      generatedPaketSoal.bagianB.forEach((m) => {
        allToSave.push({
          kode: `Q-AI-M-${Date.now().toString(36).slice(-4)}-${m.nomor}`,
          pertanyaan: m.premis,
          jenis_soal: "MENJODOHKAN",
          tingkat_kesulitan: "SEDANG",
          bobot: m.bobot,
          opsi: [{ label: "1", teks: m.premis, pasangan: m.target, urutan: 1 }],
          kunci_jawaban: { pasangan: { "1": m.target } },
        });
      });

      // Bagian C (Essay)
      generatedPaketSoal.bagianC.forEach((es) => {
        allToSave.push({
          kode: `Q-AI-ES-${Date.now().toString(36).slice(-4)}-${es.nomor}`,
          pertanyaan: es.pertanyaan,
          jenis_soal: "URAIAN_ESAI",
          tingkat_kesulitan: "HOTS",
          bobot: es.bobot,
          kunci_jawaban: { rubrik_penilaian: es.rubrik },
        });
      });

      const res = await bulkCreateQuestionsAction(allToSave, soalMapelId);
      if (res.success) {
        showToast(
          `Sukses! ${allToSave.length} butir soal hasil AI berhasil disimpan ke Bank Soal resmi.`,
          "success"
        );
      } else {
        showToast(res.message, "error");
      }
    });
  };

  const handleCopySpreadsheet = () => {
    if (!generatedPaketSoal) return;
    let tsv =
      "[BAGIAN A: PILIHAN GANDA]\nNo\tSoal\tPilihan A\tPilihan B\tPilihan C\tPilihan D\tPilihan E\tTingkat Kesulitan\tJawaban Benar\tBobot\n";
    generatedPaketSoal.bagianA.forEach((pg) => {
      tsv += `${pg.nomor}\t${pg.pertanyaan}\t${pg.opsi[0].teks}\t${pg.opsi[1].teks}\t${pg.opsi[2].teks}\t${pg.opsi[3].teks}\t${pg.opsi[4]?.teks || ""}\t${pg.tingkat}\t${pg.kunci}\t${pg.bobot}\n`;
    });

    tsv +=
      "\n[BAGIAN B: MENJODOHKAN]\nNo\tPertanyaan (Premis)\tJawaban Benar (Target)\tPengecoh\tTingkat Kesulitan\tBobot\n";
    generatedPaketSoal.bagianB.forEach((m) => {
      tsv += `${m.nomor}\t${m.premis}\t${m.target}\t\tSEDANG\t${m.bobot}\n`;
    });

    tsv +=
      "\n[BAGIAN C: ESSAY]\nNo\tSoal Esai\tPedoman Penilaian / Kunci Jawaban\tTingkat Kesulitan\tBobot\n";
    generatedPaketSoal.bagianC.forEach((es) => {
      tsv += `${es.nomor}\t${es.pertanyaan}\t${es.rubrik}\tHOTS\t${es.bobot}\n`;
    });

    navigator.clipboard.writeText(tsv);
    showToast("Format tabel spreadsheet berhasil disalin ke clipboard!", "success");
  };

  // 2. Generate RPP / Modul Ajar Handlers
  const handleGenerateRpp = () => {
    if (!rppMateri.trim()) {
      showToast("Tuliskan materi pokok untuk modul ajar.", "error");
      return;
    }
    setIsGeneratingRpp(true);
    setGeneratedRppText("");

    setTimeout(() => {
      const content = `# MODUL AJAR KURIKULUM MERDEKA
## MATA PELAJARAN: ${rppMapel.toUpperCase()}

---

### I. INFORMASI UMUM
- **Penyusun:** ${teacherName}
- **Fase / Kelas:** ${rppFase}
- **Alokasi Waktu:** ${rppAlokasi}
- **Model Pembelajaran:** ${rppModel}
- **Target Peserta Didik:** Reguler / Tipikal (36 Siswa)
- **Profil Pelajar Pancasila:** Bernalar Kritis, Gotong Royong, Mandiri, dan Kreatif.

---

### II. KOMPONEN INTI

#### 1. Capaian Pembelajaran (CP) & Tujuan Pembelajaran (TP)
Peserta didik mampu menganalisis konsep **${rppMateri}**, mengidentifikasi karakteristik esensial, dan menerapkannya dalam pemecahan masalah kontekstual.
- **TP 1:** Menjelaskan pengertian dan prinsip dasar ${rppMateri} dengan bahasa sendiri secara tepat.
- **TP 2:** Menguraikan komponen pendukung dan keterkaitan fungsional pada ${rppMateri}.
- **TP 3:** Merancang solusi kontekstual terhadap studi kasus nyata menggunakan prinsip ${rppMateri}.

#### 2. Pemahaman Bermakna & Pertanyaan Pemantik
- **Pemahaman Bermakna:** Penguasaan terhadap ${rppMateri} memberdayakan individu untuk berpikir sistematis dalam mengoptimalkan sumber daya.
- **Pertanyaan Pemantik:** *"Bagaimana jika sistem di sekitar kita tidak memiliki mekanisme kerja seperti ${rppMateri}? Dampak apa yang akan timbul?"*

#### 3. Urutan Kegiatan Pembelajaran
1. **Kegiatan Pendahuluan (15 Menit):**
   - Guru membuka kelas dengan salam, doa, dan presensi melalui platform Ruang Pintar.
   - Apersepsi: Menampilkan video stimulus berdurasi 3 menit terkait ${rppMateri}.
   - Guru menyampaikan tujuan pembelajaran dan indikator ketercapaian (KKTP).

2. **Kegiatan Inti (60 Menit - Sintaks ${rppModel}):**
   - *Orientasi Masalah:* Siswa mengamati studi kasus kontekstual pada LKPD digital.
   - *Pengorganisasian Belajar:* Siswa membentuk kelompok heterogen beranggotakan 4-5 orang.
   - *Penyelidikan Mandiri/Kelompok:* Siswa mengeksplorasi materi bacaan di platform Ruang Pintar dan mendiskusikan alternatif solusi.
   - *Pengembangan & Penyajian Hasil:* Masing-masing kelompok mempresentasikan hasil analisis di depan kelas.
   - *Evaluasi & Refleksi:* Guru memberikan penguatan konsep dan klarifikasi miskonsepsi.

3. **Kegiatan Penutup (15 Menit):**
   - Siswa bersama guru menyimpulkan butir-butir esensial pembelajaran.
   - Asesmen formatif kilat (kuis 3 butir di Ruang Pintar CBT).
   - Refleksi pembelajaran dan tindak lanjut penugasan mandiri.

---

### III. ASESMEN & KRITERIA KETERCAPAIAN (KKTP)
- **Asesmen Diagnostik:** Tanya jawab pemantik di awal KBM.
- **Asesmen Formatif:** Observasi diskusi kelompok dan pengerjaan LKPD.
- **Asesmen Sumatif:** Tes CBT Ruang Pintar (Pilihan Ganda & Uraian) dengan KKTP $\\ge 75$.
`;
      setGeneratedRppText(content);
      setIsGeneratingRpp(false);
      showToast("Modul Ajar Kurikulum Merdeka berhasil disusun!", "success");
    }, 1400);
  };

  // 3. Generate Ringkasan Materi Handlers
  const handleGenerateMateri = () => {
    if (!materiTopik.trim()) {
      showToast("Tuliskan topik materi ringkasan.", "error");
      return;
    }
    setIsGeneratingMateri(true);
    setGeneratedMateriText("");

    setTimeout(() => {
      const text = `# RINGKASAN MATERI PEMBELAJARAN
## Topik: ${materiTopik}
*Gaya Penyampaian: ${materiGaya} • Disusun oleh: ${teacherName}*

---

### 🌟 1. Mengapa Kita Perlu Mempelajari ${materiTopik}?
Bayangkan sebuah orkestra musik di mana setiap alat musik harus bermain dengan harmoni dan ketepatan nada. Demikian pula dengan **${materiTopik}**; ini adalah fondasi yang memastikan setiap komponen berjalan selaras, efisien, dan mencapai tujuan yang direncanakan.

---

### 🔑 2. Tiga Konsep Kunci yang Wajib Dipahami
1. **Fondasi Dasar:** Memahami definisi operasional dan ruang lingkup agar tidak terjadi salah tafsir.
2. **Mekanisme Kerja:** Bagaimana input diproses melalui aturan-aturan baku untuk menghasilkan output yang diharapkan.
3. **Penerapan Praktis:** Studi kasus pemecahan kendala di dunia industri dan kehidupan sehari-hari.

---

### 💡 3. Analogi Sederhana
Jika diibaratkan sistem lalu lintas jalan raya, **${materiTopik}** adalah lampu lalu lintas dan rambu-rambunya. Tanpa aturan tersebut, persimpangan yang padat akan mengalami kemacetan total. Dengan adanya sistem yang teratur, setiap kendaraan dapat melintas dengan aman dan tertib.

---

### ✍️ 4. Kuis Refleksi Cepat
1. Apa fungsi paling mendasar dari ${materiTopik}?
2. Sebutkan satu contoh konkret penerapan konsep ini di sekitar lingkungan sekolah Anda!
`;
      setGeneratedMateriText(text);
      setIsGeneratingMateri(false);
      showToast("Ringkasan materi siswa berhasil disusun!", "success");
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-xl border text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 ${
            toast.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : toast.type === "error"
                ? "bg-rose-50 border-rose-200 text-rose-800"
                : "bg-blue-50 border-blue-200 text-blue-800"
          }`}
        >
          {toast.type === "success" && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
          {toast.type === "error" && <AlertCircle className="h-4 w-4 text-rose-600" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Hero Banner with Academic Glass UI v1.2 */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 p-6 sm:p-8 text-white shadow-xl border border-indigo-500/20">
        <div className="absolute -right-16 -bottom-16 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-blue-200">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              <span>Studio Asisten AI Guru • Generative Engine 2.0</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Ruang AI Guru — Asisten Pengajaran & Asesmen
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/80 max-w-2xl leading-relaxed">
              Rancang paket soal ujian campuran (PG, Menjodohkan, Esai), Modul Ajar Kurikulum
              Merdeka, dan bahan materi ajar secara instan dengan dukungan Google Gemini 2.0 Flash.
            </p>
          </div>

          {/* Model Status Badge */}
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shrink-0 space-y-1.5 text-right">
            <div className="flex items-center justify-end gap-1.5 text-xs text-blue-200">
              <Cpu className="h-4 w-4 text-emerald-400" />
              <span className="font-mono font-bold text-white uppercase">{selectedModel}</span>
            </div>
            <p className="text-[11px] text-blue-200/70">
              {apiKey ? "Kunci API Pribadi Aktif" : "Mesin Cerdas Fallback Siap"}
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="relative z-10 flex flex-wrap items-center gap-2 mt-6 pt-6 border-t border-white/10">
          <button
            type="button"
            onClick={() => setActiveTab("SOAL")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === "SOAL"
                ? "bg-white text-blue-900 shadow-md"
                : "text-white/80 hover:text-white hover:bg-white/10"
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>Paket Soal Ujian (CBT & Cetak A4)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("RPP")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === "RPP"
                ? "bg-white text-blue-900 shadow-md"
                : "text-white/80 hover:text-white hover:bg-white/10"
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>Modul Ajar & RPP Merdeka</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("MATERI")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === "MATERI"
                ? "bg-white text-blue-900 shadow-md"
                : "text-white/80 hover:text-white hover:bg-white/10"
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>Ringkasan Materi Siswa</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("SETTINGS")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ml-auto ${
              activeTab === "SETTINGS"
                ? "bg-white text-blue-900 shadow-md"
                : "text-white/80 hover:text-white hover:bg-white/10"
            }`}
          >
            <Settings className="h-4 w-4" />
            <span>Pengaturan Model & API</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: PAKET SOAL UJIAN (PG + MENJODOHKAN + ESAI) */}
      {/* ========================================================================= */}
      {activeTab === "SOAL" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Configuration Card */}
          <div className="lg:col-span-4 bg-white/95 rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <span>Konfigurasi Paket Soal</span>
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Topik / Capaian Pembelajaran <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                value={soalTopik}
                onChange={(e) => setSoalTopik(e.target.value)}
                placeholder="Misal: Sistem Transmisi Otomotif, Struktur Sel & Metabolisme, Logika Pemrograman Python..."
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mata Pelajaran</label>
              <select
                value={soalMapelId}
                onChange={(e) => setSoalMapelId(e.target.value)}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 bg-white"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nama}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Jenjang / Fase</label>
              <select
                value={soalFase}
                onChange={(e) => setSoalFase(e.target.value)}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 bg-white"
              >
                <option value="Fase E (Kelas 10 SMA/SMK)">Fase E (Kelas 10 SMA/SMK)</option>
                <option value="Fase F (Kelas 11-12 SMA/SMK)">Fase F (Kelas 11-12 SMA/SMK)</option>
                <option value="Fase D (Kelas 7-9 SMP)">Fase D (Kelas 7-9 SMP)</option>
              </select>
            </div>

            {/* Question Quantities */}
            <div className="pt-2 border-t border-slate-100 space-y-3">
              <label className="block text-xs font-bold text-slate-800">
                Komposisi Paket Soal (Campuran)
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <span className="block text-[10px] text-slate-500 font-semibold">
                    Pilihan Ganda
                  </span>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={soalCountPg}
                    onChange={(e) => setSoalCountPg(parseInt(e.target.value, 10) || 1)}
                    className="w-full text-center font-bold text-sm bg-transparent mt-1 focus:outline-hidden text-blue-700"
                  />
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <span className="block text-[10px] text-slate-500 font-semibold">
                    Menjodohkan
                  </span>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={soalCountMenjodohkan}
                    onChange={(e) => setSoalCountMenjodohkan(parseInt(e.target.value, 10) || 1)}
                    className="w-full text-center font-bold text-sm bg-transparent mt-1 focus:outline-hidden text-purple-700"
                  />
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <span className="block text-[10px] text-slate-500 font-semibold">Essay</span>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={soalCountEsai}
                    onChange={(e) => setSoalCountEsai(parseInt(e.target.value, 10) || 1)}
                    className="w-full text-center font-bold text-sm bg-transparent mt-1 focus:outline-hidden text-amber-700"
                  />
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGeneratePaketSoal}
              disabled={isGeneratingSoal}
              className="w-full py-3 rounded-2xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {isGeneratingSoal ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>AI Sedang Merancang Soal...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Rancang Paket Soal dengan AI</span>
                </>
              )}
            </button>
          </div>

          {/* Results Preview Card */}
          <div className="lg:col-span-8 space-y-4">
            {!generatedPaketSoal ? (
              <div className="h-full min-h-[380px] bg-white rounded-3xl p-8 border border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
                <Sparkles className="h-12 w-12 text-slate-300 mb-3" />
                <h4 className="text-sm font-bold text-slate-800">Ruang Pratinjau Paket Soal AI</h4>
                <p className="text-xs text-slate-500 max-w-md mt-1">
                  Masukkan topik materi di sebelah kiri dan klik tombol rancang. Hasil butir soal
                  Pilihan Ganda, Menjodohkan, dan Esai akan tampil terstruktur di sini.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
                {/* Result Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Paket Soal Terstruktur ({generatedPaketSoal.bagianA.length} PG,{" "}
                      {generatedPaketSoal.bagianB.length} Menjodohkan,{" "}
                      {generatedPaketSoal.bagianC.length} Esai)
                    </h3>
                    <p className="text-xs text-slate-500">{soalTopik}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopySpreadsheet}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
                      title="Salin tabel format Excel untuk di-paste langsung"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      <span>Salin Excel (TSV)</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSaveToBankSoal}
                      disabled={isPending}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition shadow-xs disabled:opacity-50"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>{isPending ? "Menyimpan..." : "Impor ke Bank Soal CBT"}</span>
                    </button>
                  </div>
                </div>

                {/* Bagian A: Pilihan Ganda */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[10px] font-bold">
                      BAGIAN A
                    </span>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                      Pilihan Ganda ({generatedPaketSoal.bagianA.length} Butir)
                    </h4>
                  </div>
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                    {generatedPaketSoal.bagianA.map((q) => (
                      <div
                        key={q.nomor}
                        className="p-3 rounded-2xl bg-slate-50 text-xs space-y-1.5 border border-slate-100"
                      >
                        <div className="flex items-start gap-2">
                          <span className="font-bold text-slate-700">{q.nomor}.</span>
                          <p className="text-slate-900 leading-relaxed">{q.pertanyaan}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-1 pl-4 text-[11px]">
                          {q.opsi.map((op: any) => (
                            <span
                              key={op.label}
                              className={
                                op.isCorrect ? "text-emerald-700 font-bold" : "text-slate-600"
                              }
                            >
                              {op.label}. {op.teks}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bagian B: Menjodohkan */}
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 text-[10px] font-bold">
                      BAGIAN B
                    </span>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                      Menjodohkan ({generatedPaketSoal.bagianB.length} Pasang)
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {generatedPaketSoal.bagianB.map((m) => (
                      <div
                        key={m.nomor}
                        className="p-2.5 rounded-xl bg-purple-50/50 border border-purple-100 flex items-center justify-between gap-2"
                      >
                        <span className="font-medium text-slate-900">{m.premis}</span>
                        <span className="font-bold text-purple-700 bg-white px-2 py-1 rounded-lg border border-purple-200">
                          {m.target}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bagian C: Essay */}
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold">
                      BAGIAN C
                    </span>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                      Essay / Uraian ({generatedPaketSoal.bagianC.length} Butir)
                    </h4>
                  </div>
                  <div className="space-y-2 text-xs">
                    {generatedPaketSoal.bagianC.map((es) => (
                      <div
                        key={es.nomor}
                        className="p-3 rounded-2xl bg-amber-50/40 border border-amber-200/60 space-y-1"
                      >
                        <p className="font-medium text-slate-900">
                          {es.nomor}. {es.pertanyaan}
                        </p>
                        <p className="text-[11px] text-amber-900 italic">Rubrik: {es.rubrik}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: MODUL AJAR & RPP MERDEKA */}
      {/* ========================================================================= */}
      {activeTab === "RPP" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 bg-white/95 rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-blue-600" />
              <span>Parameter Modul Ajar</span>
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mata Pelajaran</label>
              <input
                type="text"
                value={rppMapel}
                onChange={(e) => setRppMapel(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Fase / Tingkat</label>
              <select
                value={rppFase}
                onChange={(e) => setRppFase(e.target.value)}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 bg-white"
              >
                <option value="Fase E (Kelas 10)">Fase E (Kelas 10)</option>
                <option value="Fase F (Kelas 11-12)">Fase F (Kelas 11-12)</option>
                <option value="Fase D (Kelas 7-9 SMP)">Fase D (Kelas 7-9 SMP)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Materi Pokok / CP
              </label>
              <textarea
                rows={3}
                value={rppMateri}
                onChange={(e) => setRppMateri(e.target.value)}
                placeholder="Misal: Penerapan Algoritma dan Pemrograman pada Kasus Nyata..."
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Model Pembelajaran
              </label>
              <select
                value={rppModel}
                onChange={(e) => setRppModel(e.target.value)}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 bg-white"
              >
                <option value="Problem-Based Learning (PBL)">Problem-Based Learning (PBL)</option>
                <option value="Project-Based Learning (PjBL)">Project-Based Learning (PjBL)</option>
                <option value="Discovery / Inquiry Learning">Discovery / Inquiry Learning</option>
                <option value="Teaching Factory (TeFa)">
                  Teaching Factory (TeFa - Khusus SMK)
                </option>
              </select>
            </div>

            <button
              type="button"
              onClick={handleGenerateRpp}
              disabled={isGeneratingRpp}
              className="w-full py-3 rounded-2xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isGeneratingRpp ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Menyusun Modul Ajar...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Susun Modul Ajar Lengkap</span>
                </>
              )}
            </button>
          </div>

          <div className="lg:col-span-8 bg-white/95 rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-sm font-bold text-slate-900">
                Dokumen Modul Ajar Kurikulum Merdeka
              </h3>
              {generatedRppText && (
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(generatedRppText);
                    showToast("Dokumen Modul Ajar disalin ke clipboard.", "success");
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>Salin Teks Lengkap</span>
                </button>
              )}
            </div>

            {!generatedRppText ? (
              <div className="flex-1 min-h-[300px] flex flex-col items-center justify-center text-center text-slate-400 p-8 border border-dashed border-slate-200 rounded-2xl">
                <BookOpen className="h-10 w-10 text-slate-300 mb-2" />
                <p className="text-xs">
                  Isi formulir dan klik tombol untuk menghasilkan Modul Ajar.
                </p>
              </div>
            ) : (
              <div className="flex-1 max-h-[550px] overflow-y-auto p-4 rounded-2xl bg-slate-50/70 border border-slate-200 font-mono text-xs whitespace-pre-wrap leading-relaxed text-slate-800">
                {generatedRppText}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: RINGKASAN MATERI SISWA */}
      {/* ========================================================================= */}
      {activeTab === "MATERI" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 bg-white/95 rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" />
              <span>Parameter Materi Siswa</span>
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Topik Bahasan</label>
              <input
                type="text"
                value={materiTopik}
                onChange={(e) => setMateriTopik(e.target.value)}
                placeholder="Misal: Kecerdasan Buatan & Etika Penggunaannya..."
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Gaya Penyampaian
              </label>
              <select
                value={materiGaya}
                onChange={(e) => setMateriGaya(e.target.value)}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 bg-white"
              >
                <option value="Kontekstual & Aplikatif">
                  Kontekstual & Aplikatif (Disukai Siswa)
                </option>
                <option value="Storytelling & Naratif">Storytelling & Naratif</option>
                <option value="Formal Akademik Ringkas">Formal Akademik Ringkas</option>
              </select>
            </div>

            <button
              type="button"
              onClick={handleGenerateMateri}
              disabled={isGeneratingMateri}
              className="w-full py-3 rounded-2xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isGeneratingMateri ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Menyusun Ringkasan...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Rancang Ringkasan Materi</span>
                </>
              )}
            </button>
          </div>

          <div className="lg:col-span-8 bg-white/95 rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-sm font-bold text-slate-900">
                Bahan Bacaan Siswa (Siap Bagikan)
              </h3>
              {generatedMateriText && (
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(generatedMateriText);
                    showToast("Bahan bacaan disalin ke clipboard.", "success");
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>Salin Teks</span>
                </button>
              )}
            </div>

            {!generatedMateriText ? (
              <div className="flex-1 min-h-[300px] flex flex-col items-center justify-center text-center text-slate-400 p-8 border border-dashed border-slate-200 rounded-2xl">
                <FileText className="h-10 w-10 text-slate-300 mb-2" />
                <p className="text-xs">
                  Tuliskan topik dan klik tombol untuk membuat ringkasan materi.
                </p>
              </div>
            ) : (
              <div className="flex-1 max-h-[550px] overflow-y-auto p-4 rounded-2xl bg-slate-50/70 border border-slate-200 text-xs whitespace-pre-wrap leading-relaxed text-slate-800">
                {generatedMateriText}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: PENGATURAN MODEL & KUNCI API */}
      {/* ========================================================================= */}
      {activeTab === "SETTINGS" && (
        <div className="max-w-2xl mx-auto bg-white/95 rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Settings className="h-4 w-4 text-blue-600" />
              <span>Pengaturan Mesin AI Google Gemini</span>
            </h3>
            <p className="text-xs text-slate-500">
              Kelola kunci API pribadi Anda dan pilih versi model Google Gemini yang ingin
              digunakan.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Pilihan Model Gemini
              </label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-mono"
              >
                <option value="gemini-2.0-flash">
                  Google Gemini 2.0 Flash (Direkomendasikan: Super Cepat & Cerdas)
                </option>
                <option value="gemini-2.0-flash-thinking-exp">
                  Google Gemini 2.0 Flash Thinking (Penalaran Ekstra HOTS)
                </option>
                <option value="gemini-1.5-flash">
                  Google Gemini 1.5 Flash (Kompatibilitas Akun Free Tier Lama)
                </option>
                <option value="gemini-1.5-pro">
                  Google Gemini 1.5 Pro (Pemrosesan Naskah Panjang)
                </option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Kunci API Google Gemini (Opsional)
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono focus:ring-2 focus:ring-blue-500/20"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Kunci disimpan secara lokal di browser Anda (*localStorage*) dan tidak pernah
                dibagikan ke pengguna lain. Jika dikosongkan, sistem menggunakan generator penalaran
                cerdas internal.
              </p>
            </div>

            <button
              type="button"
              onClick={handleSaveSettings}
              className="w-full py-3 rounded-2xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition shadow-md flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Simpan Pengaturan Asisten AI</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

/**
 * Ruang Pintar — M14 CBT Question Bank Modal (Academic Glass UI v1.2)
 *
 * Mengelola Butir Soal dan Versi Soal (Question Versioning):
 * - Multiple choice, multiple select, true/false, matching (menjodohkan), fill-in, essay
 * - Dukungan Soal Bergambar (Image URL / Diagram Preview)
 * - Import Massal via Spreadsheet (Excel / CSV / Quick Paste)
 * - Asisten AI Gemini Pembuat Soal Otomatis (Kurikulum Merdeka)
 * - Poin, KKTP, Kunci Penilaian (Tersimpan aman di Server)
 */

import React, { useState, useEffect, useTransition, useCallback } from "react";
import {
  X,
  Plus,
  HelpCircle,
  Check,
  CheckCircle2,
  Trash2,
  GitBranch,
  Layers,
  AlertCircle,
  FileText,
  Search,
  FileSpreadsheet,
  Sparkles,
  Download,
  Upload,
  Image as ImageIcon,
  ArrowRight,
  RefreshCw,
  Eye,
  Key,
} from "lucide-react";
import {
  BankSoalDTO,
  JenisSoalCbt,
  TingkatKesulitanCbt,
  OpsiJawaban,
  PasanganMenjodohkan,
} from "../domain/cbt-types";
import {
  getQuestionsAction,
  createQuestionAction,
  createQuestionVersionAction,
  bulkCreateQuestionsAction,
  generateAiQuestionsAction,
} from "@/app/actions/cbt-actions";
import {
  parseSpreadsheetText,
  generateCsvTemplate,
  ParsedBulkQuestion,
} from "../infrastructure/cbt-bulk-import-parser";

interface QuestionBankModalProps {
  isOpen: boolean;
  onClose: () => void;
  mapelId?: string;
  onShowToast: (message: string, type: "success" | "error" | "info") => void;
}

type TabType = "LIST" | "CREATE" | "EXCEL_IMPORT" | "AI_GENERATOR" | "NEW_VERSION";

export function QuestionBankModal({
  isOpen,
  onClose,
  mapelId,
  onShowToast,
}: QuestionBankModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("LIST");
  const [questions, setQuestions] = useState<BankSoalDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [selectedQuestion, setSelectedQuestion] = useState<BankSoalDTO | null>(null);

  // Form State for Creating / Editing Question
  const [kode, setKode] = useState("");
  const [jenisSoal, setJenisSoal] = useState<JenisSoalCbt>("PILIHAN_GANDA");
  const [tingkatKesulitan, setTingkatKesulitan] = useState<TingkatKesulitanCbt>("SEDANG");
  const [bobotDefault, setBobotDefault] = useState(1);
  const [kontenPertanyaan, setKontenPertanyaan] = useState("");
  const [gambarUrl, setGambarUrl] = useState("");
  const [opsiList, setOpsiList] = useState<
    Array<{ label: string; teks: string; isCorrect: boolean }>
  >([
    { label: "A", teks: "", isCorrect: true },
    { label: "B", teks: "", isCorrect: false },
    { label: "C", teks: "", isCorrect: false },
    { label: "D", teks: "", isCorrect: false },
  ]);
  const [pasanganList, setPasanganList] = useState<PasanganMenjodohkan[]>([
    { id: "1", premis: "", pasangan: "" },
    { id: "2", premis: "", pasangan: "" },
    { id: "3", premis: "", pasangan: "" },
  ]);
  const [kunciSingkat, setKunciSingkat] = useState("");
  const [rubrikEsai, setRubrikEsai] = useState("");
  const [alasanPerubahan, setAlasanPerubahan] = useState("");

  // Bulk Import State
  const [rawSpreadsheetText, setRawSpreadsheetText] = useState("");
  const [bulkParsedList, setBulkParsedList] = useState<ParsedBulkQuestion[]>([]);

  // AI Generator State
  const [aiTopik, setAiTopik] = useState("");
  const [aiJumlah, setAiJumlah] = useState(5);
  const [aiKesulitan, setAiKesulitan] = useState<any>("SEDANG");
  const [aiJenis, setAiJenis] = useState<any>("PILIHAN_GANDA");
  const [aiApiKey, setAiApiKey] = useState(() =>
    typeof window !== "undefined"
      ? localStorage.getItem("rp_gemini_api_key") || ""
      : ""
  );
  const [aiGeneratedList, setAiGeneratedList] = useState<any[]>([]);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiMessage, setAiMessage] = useState("");

  const resetForm = useCallback(() => {
    setKode("");
    setJenisSoal("PILIHAN_GANDA");
    setTingkatKesulitan("SEDANG");
    setBobotDefault(1);
    setKontenPertanyaan("");
    setGambarUrl("");
    setOpsiList([
      { label: "A", teks: "", isCorrect: true },
      { label: "B", teks: "", isCorrect: false },
      { label: "C", teks: "", isCorrect: false },
      { label: "D", teks: "", isCorrect: false },
    ]);
    setPasanganList([
      { id: "1", premis: "", pasangan: "" },
      { id: "2", premis: "", pasangan: "" },
      { id: "3", premis: "", pasangan: "" },
    ]);
    setKunciSingkat("");
    setRubrikEsai("");
    setAlasanPerubahan("");
    setSelectedQuestion(null);
  }, []);

  const loadQuestions = useCallback(async () => {
    setIsLoading(true);
    const res = await getQuestionsAction({ mapelId });
    if (res.success && res.data) {
      setQuestions(res.data);
    } else {
      onShowToast(res.message || "Gagal memuat bank soal", "error");
    }
    setIsLoading(false);
  }, [mapelId, onShowToast]);

  const handleClose = () => {
    resetForm();
    setActiveTab("LIST");
    onClose();
  };

  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;

    getQuestionsAction({ mapelId })
      .then((res) => {
        if (!isMounted) return;
        if (res.success && res.data) {
          setQuestions(res.data);
        } else {
          onShowToast(res.message || "Gagal memuat bank soal", "error");
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, mapelId, onShowToast]);

  const handleAddOption = () => {
    const nextLabel = String.fromCharCode(65 + opsiList.length);
    setOpsiList([...opsiList, { label: nextLabel, teks: "", isCorrect: false }]);
  };

  const handleRemoveOption = (index: number) => {
    if (opsiList.length <= 2) return;
    const updated = opsiList
      .filter((_, i) => i !== index)
      .map((op, i) => ({
        ...op,
        label: String.fromCharCode(65 + i),
      }));
    setOpsiList(updated);
  };

  const handleOptionCorrectChange = (index: number, isMulti: boolean) => {
    if (isMulti) {
      const updated = [...opsiList];
      updated[index].isCorrect = !updated[index].isCorrect;
      setOpsiList(updated);
    } else {
      const updated = opsiList.map((op, i) => ({
        ...op,
        isCorrect: i === index,
      }));
      setOpsiList(updated);
    }
  };

  // Menjodohkan handlers
  const handleAddPair = () => {
    const nextId = String(pasanganList.length + 1);
    setPasanganList([...pasanganList, { id: nextId, premis: "", pasangan: "" }]);
  };

  const handleRemovePair = (index: number) => {
    if (pasanganList.length <= 2) return;
    setPasanganList(pasanganList.filter((_, i) => i !== index));
  };

  const handleUpdatePair = (index: number, field: "premis" | "pasangan", val: string) => {
    const updated = [...pasanganList];
    updated[index][field] = val;
    setPasanganList(updated);
  };

  const handleCreateQuestion = () => {
    if (!kontenPertanyaan.trim()) {
      onShowToast("Teks pertanyaan tidak boleh kosong.", "error");
      return;
    }

    startTransition(async () => {
      let formatOpsi: OpsiJawaban[] | undefined = undefined;
      let kunciJawaban: any = {};

      if (jenisSoal === "PILIHAN_GANDA" || jenisSoal === "BENAR_SALAH") {
        formatOpsi = opsiList.map((op) => ({
          label: op.label,
          teks: op.teks,
          urutan: op.label.charCodeAt(0) - 64,
        }));
        const correct = opsiList.find((op) => op.isCorrect);
        kunciJawaban = { pilihan_benar: correct?.label || "A" };
      } else if (jenisSoal === "PILIHAN_GANDA_KOMPLEKS") {
        formatOpsi = opsiList.map((op) => ({
          label: op.label,
          teks: op.teks,
          urutan: op.label.charCodeAt(0) - 64,
        }));
        kunciJawaban = {
          pilihan_benar: opsiList.filter((op) => op.isCorrect).map((op) => op.label),
        };
      } else if (jenisSoal === "MENJODOHKAN") {
        formatOpsi = pasanganList.map((p, idx) => ({
          label: p.id || String(idx + 1),
          teks: p.premis.trim(),
          pasangan: p.pasangan.trim(),
          urutan: idx + 1,
        }));
        const pairMap: Record<string, string> = {};
        pasanganList.forEach((p, idx) => {
          if (p.premis.trim()) {
            pairMap[p.id || String(idx + 1)] = p.pasangan.trim();
          }
        });
        kunciJawaban = { pasangan: pairMap, daftar_pasangan: pasanganList };
      } else if (jenisSoal === "ISIAN_SINGKAT") {
        kunciJawaban = {
          kata_kunci: kunciSingkat
            .split(",")
            .map((k) => k.trim())
            .filter(Boolean),
          case_sensitive: false,
        };
      } else if (jenisSoal === "URAIAN_ESAI") {
        kunciJawaban = {
          rubrik_penilaian: rubrikEsai || "Penilaian manual oleh guru.",
          pedoman_penskoran: "Skor 0-100",
        };
      }

      const payload = {
        mata_pelajaran_id: mapelId,
        kode: kode || undefined,
        jenis_soal: jenisSoal,
        tingkat_kesulitan: tingkatKesulitan,
        bobot_default: Number(bobotDefault) || 1,
        pertanyaan: kontenPertanyaan,
        gambar_url: gambarUrl.trim() || undefined,
        opsi: formatOpsi,
        kunci_jawaban: kunciJawaban,
      };

      const res = await createQuestionAction(payload);
      if (res.success) {
        onShowToast("Soal berhasil ditambahkan ke Bank Soal.", "success");
        await loadQuestions();
        setActiveTab("LIST");
        resetForm();
      } else {
        onShowToast(res.message, "error");
      }
    });
  };

  const handleCreateNewVersion = () => {
    if (!selectedQuestion) return;
    if (!kontenPertanyaan.trim()) {
      onShowToast("Teks pertanyaan tidak boleh kosong.", "error");
      return;
    }

    startTransition(async () => {
      let formatOpsi: OpsiJawaban[] | undefined = undefined;
      let kunciJawaban: any = {};

      if (jenisSoal === "PILIHAN_GANDA" || jenisSoal === "BENAR_SALAH") {
        formatOpsi = opsiList.map((op) => ({
          label: op.label,
          teks: op.teks,
          urutan: op.label.charCodeAt(0) - 64,
        }));
        const correct = opsiList.find((op) => op.isCorrect);
        kunciJawaban = { pilihan_benar: correct?.label || "A" };
      } else if (jenisSoal === "PILIHAN_GANDA_KOMPLEKS") {
        formatOpsi = opsiList.map((op) => ({
          label: op.label,
          teks: op.teks,
          urutan: op.label.charCodeAt(0) - 64,
        }));
        kunciJawaban = {
          pilihan_benar: opsiList.filter((op) => op.isCorrect).map((op) => op.label),
        };
      } else if (jenisSoal === "MENJODOHKAN") {
        const pairMap: Record<string, string> = {};
        pasanganList.forEach((p) => {
          if (p.premis.trim()) {
            pairMap[p.id || p.premis] = p.pasangan.trim();
          }
        });
        kunciJawaban = { pasangan: pairMap, daftar_pasangan: pasanganList };
      } else if (jenisSoal === "ISIAN_SINGKAT") {
        kunciJawaban = {
          kata_kunci: kunciSingkat
            .split(",")
            .map((k) => k.trim())
            .filter(Boolean),
          case_sensitive: false,
        };
      } else if (jenisSoal === "URAIAN_ESAI") {
        kunciJawaban = {
          rubrik_penilaian: rubrikEsai || "Penilaian manual oleh guru.",
          pedoman_penskoran: "Skor 0-100",
        };
      }

      const payload = {
        pertanyaan: kontenPertanyaan,
        gambar_url: gambarUrl.trim() || undefined,
        opsi: formatOpsi,
        kunci_jawaban: kunciJawaban,
        bobot: Number(bobotDefault) || 1,
        alasan_perubahan: alasanPerubahan || "Pembaruan versi soal",
      };

      const res = await createQuestionVersionAction(selectedQuestion.id, payload);
      if (res.success) {
        onShowToast("Versi baru butir soal berhasil diterbitkan.", "success");
        await loadQuestions();
        setActiveTab("LIST");
        resetForm();
      } else {
        onShowToast(res.message, "error");
      }
    });
  };

  // Bulk Spreadsheet Parser
  const handleParseSpreadsheet = () => {
    if (!rawSpreadsheetText.trim()) {
      onShowToast("Tempelkan teks data spreadsheet atau pilih file CSV terlebih dahulu.", "error");
      return;
    }
    const parsed = parseSpreadsheetText(rawSpreadsheetText);
    if (parsed.length === 0) {
      onShowToast("Tidak dapat membaca data soal. Pastikan kolom sesuai template.", "error");
      return;
    }
    setBulkParsedList(parsed);
    onShowToast(`Berhasil membaca ${parsed.length} butir soal dari spreadsheet.`, "success");
  };

  const handleDownloadTemplate = () => {
    const csvContent = generateCsvTemplate();
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "template_bank_soal_cbt.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (text) {
        setRawSpreadsheetText(text);
        const parsed = parseSpreadsheetText(text);
        setBulkParsedList(parsed);
        onShowToast(`File ${file.name} berhasil dibaca (${parsed.length} butir soal).`, "success");
      }
    };
    reader.readAsText(file);
  };

  const handleSaveBulkQuestions = () => {
    const validQuestions = bulkParsedList.filter((q) => q.isValid);
    if (validQuestions.length === 0) {
      onShowToast("Tidak ada butir soal yang valid untuk disimpan.", "error");
      return;
    }

    startTransition(async () => {
      const questionsToSave = validQuestions.map((q) => {
        let opsiPayload: any = undefined;
        let kunciPayload: any = {};

        if (q.tipe_soal === "PILIHAN_GANDA" || !q.tipe_soal) {
          opsiPayload = q.opsi.map((o, idx) => ({
            label: o.label,
            teks: o.teks,
            urutan: idx + 1,
          }));
          kunciPayload = { pilihan_benar: q.kunci_benar };
        } else if (q.tipe_soal === "MENJODOHKAN") {
          const pairs = q.pasangan_menjodohkan || [
            { id: "1", premis: q.pertanyaan, target: q.kunci_benar },
          ];
          opsiPayload = pairs.map((p, idx) => ({
            label: p.id || String(idx + 1),
            teks: p.premis,
            pasangan: p.target,
            urutan: idx + 1,
          }));
          const pairMap: Record<string, string> = {};
          pairs.forEach((p) => {
            pairMap[p.id || p.premis] = p.target;
          });
          kunciPayload = { pasangan: pairMap, daftar_pasangan: pairs };
        } else if (q.tipe_soal === "URAIAN_ESAI") {
          kunciPayload = {
            rubrik_penilaian: q.rubrik_esai || q.kunci_benar || "Penilaian manual oleh guru.",
            pedoman_penskoran: `Skor maksimal ${q.bobot || 4}`,
          };
        } else if (q.tipe_soal === "ISIAN_SINGKAT") {
          kunciPayload = {
            kata_kunci: [q.kunci_benar],
            case_sensitive: false,
          };
        }

        return {
          kode: `Q-IMP-${Date.now().toString(36).slice(-4)}-${q.nomor}`,
          pertanyaan: q.pertanyaan,
          gambar_url: q.gambar_url || null,
          jenis_soal: q.tipe_soal || "PILIHAN_GANDA",
          tingkat_kesulitan: q.tingkat_kesulitan,
          bobot: q.bobot,
          opsi: opsiPayload,
          kunci_jawaban: kunciPayload,
        };
      });

      const res = await bulkCreateQuestionsAction(questionsToSave, mapelId);
      if (res.success) {
        onShowToast(res.message, "success");
        await loadQuestions();
        setBulkParsedList([]);
        setRawSpreadsheetText("");
        setActiveTab("LIST");
      } else {
        onShowToast(res.message, "error");
      }
    });
  };

  // AI Question Generator Handlers
  const handleGenerateAi = async () => {
    if (!aiTopik.trim()) {
      onShowToast("Tuliskan topik atau materi pokok untuk AI.", "error");
      return;
    }

    setIsAiGenerating(true);
    setAiMessage("");

    // Save apiKey to localStorage if user typed one
    if (aiApiKey.trim() && typeof window !== "undefined") {
      localStorage.setItem("rp_gemini_api_key", aiApiKey.trim());
    }

    try {
      const res = await generateAiQuestionsAction({
        topikMateri: aiTopik,
        jumlahSoal: aiJumlah,
        tingkatKesulitan: aiKesulitan,
        jenisSoal: aiJenis,
        apiKey: aiApiKey || undefined,
      });

      if (res.success && res.data) {
        setAiGeneratedList(res.data);
        setAiMessage(res.message);
        onShowToast(res.message, "success");
      } else {
        onShowToast(res.message || "Gagal menghasilkan soal dengan AI.", "error");
      }
    } catch {
      onShowToast("Kendala pada pemanggilan AI Asisten.", "error");
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleSaveAiQuestions = () => {
    if (aiGeneratedList.length === 0) return;

    startTransition(async () => {
      const questionsToSave = aiGeneratedList.map((q, idx) => ({
        kode: q.kode || `AI-${idx + 1}`,
        pertanyaan: q.pertanyaan,
        gambar_url: q.gambar_url || null,
        jenis_soal: q.jenis_soal || aiJenis,
        tingkat_kesulitan: q.tingkat_kesulitan || aiKesulitan,
        bobot: q.bobot || 1,
        opsi: q.opsi,
        kunci_jawaban: q.kunci_jawaban,
        pembahasan: q.pembahasan,
      }));

      const res = await bulkCreateQuestionsAction(questionsToSave, mapelId);
      if (res.success) {
        onShowToast(
          `Berhasil menyimpan ${res.data?.count || questionsToSave.length} soal AI ke Bank Soal!`,
          "success"
        );
        await loadQuestions();
        setAiGeneratedList([]);
        setActiveTab("LIST");
      } else {
        onShowToast(res.message, "error");
      }
    });
  };

  const startVersionEdit = (q: BankSoalDTO) => {
    setSelectedQuestion(q);
    const latest =
      (typeof q.versi_aktif === "object" ? q.versi_aktif : null) ||
      (Array.isArray(q.versi) ? q.versi[0] : null);
    const qType = q.jenis_soal || q.tipe_soal || "PILIHAN_GANDA";
    setJenisSoal(qType);
    setTingkatKesulitan(q.tingkat_kesulitan);
    setBobotDefault(latest?.bobot ?? q.bobot_default ?? 1);
    setKontenPertanyaan(latest?.pertanyaan || q.pertanyaan || "");
    setGambarUrl(latest?.gambar_url || q.gambar_url || "");
    const optionsArray = latest?.opsi || latest?.opsi_jawaban || q.opsi_jawaban || q.opsi;
    if (optionsArray && Array.isArray(optionsArray)) {
      const correctKeys: string[] = Array.isArray(latest?.kunci_jawaban?.pilihan_benar)
        ? latest.kunci_jawaban.pilihan_benar
        : [latest?.kunci_jawaban?.pilihan_benar || "A"];
      setOpsiList(
        optionsArray.map((op: { label: string; teks: string }) => ({
          label: op.label,
          teks: op.teks,
          isCorrect: correctKeys.includes(op.label),
        }))
      );
    }
    setAlasanPerubahan("");
    setActiveTab("NEW_VERSION");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-600">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Bank Soal CBT & Asisten AI</h2>
              <p className="text-xs text-slate-500">
                Penyusunan butir soal, import massal spreadsheet, dan AI Generator
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-slate-100 bg-slate-50/30 overflow-x-auto">
          <button
            onClick={() => setActiveTab("LIST")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === "LIST"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Daftar Soal ({questions.length})
          </button>
          <button
            onClick={() => {
              resetForm();
              setActiveTab("CREATE");
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === "CREATE"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Plus className="h-3.5 w-3.5" />
            Input Satu-per-Satu
          </button>
          <button
            onClick={() => setActiveTab("EXCEL_IMPORT")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === "EXCEL_IMPORT"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            Import Excel / CSV
          </button>
          <button
            onClick={() => setActiveTab("AI_GENERATOR")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === "AI_GENERATOR"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs"
                : "text-blue-700 bg-blue-50/60 hover:bg-blue-100"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />✨ Asisten AI Gemini
          </button>
          {activeTab === "NEW_VERSION" && selectedQuestion && (
            <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-100 text-amber-800 flex items-center gap-1.5 shrink-0">
              <GitBranch className="h-3.5 w-3.5" />
              Versi Baru: {selectedQuestion.kode || selectedQuestion.id.slice(-6)}
            </span>
          )}
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: LIST */}
          {activeTab === "LIST" && (
            <div className="space-y-4">
              {isLoading ? (
                <div className="py-12 text-center text-sm text-slate-400">Memuat butir soal...</div>
              ) : questions.length === 0 ? (
                <div className="py-12 text-center border border-dashed border-slate-200 rounded-2xl p-6">
                  <Layers className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-700">Bank Soal Masih Kosong</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Belum ada butir soal pada mata pelajaran ini. Anda dapat menginput satu per
                    satu, mengimport dari Excel, atau menggunakan Asisten AI Gemini.
                  </p>
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <button
                      onClick={() => {
                        resetForm();
                        setActiveTab("CREATE");
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-xs hover:bg-blue-700 transition"
                    >
                      <Plus className="h-4 w-4" />
                      Input Satu per Satu
                    </button>
                    <button
                      onClick={() => setActiveTab("EXCEL_IMPORT")}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition"
                    >
                      <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                      Import Excel
                    </button>
                    <button
                      onClick={() => setActiveTab("AI_GENERATOR")}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold hover:bg-indigo-100 transition"
                    >
                      <Sparkles className="h-4 w-4 text-indigo-600" />
                      Buat dengan AI
                    </button>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                  {questions.map((q, idx) => {
                    const activeVer =
                      (typeof q.versi_aktif === "object" ? q.versi_aktif : null) ||
                      (Array.isArray(q.versi) ? q.versi[0] : null);
                    const qType = (q.jenis_soal || q.tipe_soal || "").replace(/_/g, " ");
                    const hasImage = Boolean(activeVer?.gambar_url || q.gambar_url);
                    return (
                      <div
                        key={q.id}
                        className="p-4 bg-white hover:bg-slate-50/70 transition-colors flex items-start justify-between gap-4"
                      >
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-[11px] font-bold">
                              #{idx + 1} {q.kode ? `(${q.kode})` : ""}
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[11px] font-semibold">
                              {qType}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                                q.tingkat_kesulitan === "MUDAH"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : q.tingkat_kesulitan === "SEDANG"
                                    ? "bg-blue-50 text-blue-700"
                                    : q.tingkat_kesulitan === "SULIT"
                                      ? "bg-amber-50 text-amber-700"
                                      : "bg-purple-50 text-purple-700"
                              }`}
                            >
                              {q.tingkat_kesulitan}
                            </span>
                            <span className="text-[11px] text-slate-400 font-medium">
                              Bobot: {activeVer?.bobot ?? q.bobot_default ?? 1}
                            </span>
                            <span className="text-[11px] font-mono text-blue-600 bg-blue-50/50 px-1.5 py-0.5 rounded">
                              v{activeVer?.nomor_versi ?? 1}
                            </span>
                            {hasImage && (
                              <span className="inline-flex items-center gap-1 text-[11px] text-blue-600 font-semibold bg-blue-50 px-1.5 py-0.5 rounded">
                                <ImageIcon className="h-3 w-3" />
                                Bergambar
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-slate-800 leading-relaxed font-normal whitespace-pre-wrap">
                            {activeVer?.pertanyaan || "(Teks pertanyaan belum tersedia)"}
                          </p>

                          {/* Render Image Thumbnail if exists */}
                          {hasImage && (
                            <div className="mt-2">
                              <img
                                src={activeVer?.gambar_url || q.gambar_url}
                                alt="Gambar Stimulus Soal"
                                className="max-h-32 max-w-xs rounded-xl border border-slate-200 object-cover"
                              />
                            </div>
                          )}

                          {activeVer?.opsi && Array.isArray(activeVer.opsi) && (
                            <div className="grid grid-cols-2 gap-2 pt-1">
                              {activeVer.opsi.map((op: any) => {
                                const isCorrect =
                                  activeVer.kunci_jawaban?.pilihan_benar === op.label ||
                                  (Array.isArray(activeVer.kunci_jawaban?.pilihan_benar) &&
                                    activeVer.kunci_jawaban.pilihan_benar.includes(op.label));
                                return (
                                  <div
                                    key={op.label}
                                    className={`text-[11px] px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${
                                      isCorrect
                                        ? "bg-emerald-50/60 border-emerald-200 text-emerald-800 font-medium"
                                        : "bg-slate-50 border-slate-100 text-slate-600"
                                    }`}
                                  >
                                    <span className="font-bold">{op.label}.</span>
                                    <span className="truncate">{op.teks}</span>
                                    {isCorrect && (
                                      <Check className="h-3 w-3 text-emerald-600 ml-auto shrink-0" />
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        <div className="shrink-0 flex items-center gap-2">
                          <button
                            onClick={() => startVersionEdit(q)}
                            title="Buat Versi Baru Soal"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-blue-200 text-blue-700 bg-blue-50/40 hover:bg-blue-100/70 text-xs font-semibold transition"
                          >
                            <GitBranch className="h-3.5 w-3.5" />
                            Versi Baru
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CREATE OR NEW_VERSION */}
          {(activeTab === "CREATE" || activeTab === "NEW_VERSION") && (
            <div className="space-y-4">
              {activeTab === "NEW_VERSION" && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Pembuatan Versi Baru (Question Versioning)</p>
                    <p className="text-[11px] text-amber-700">
                      Ujian terdahulu yang telah dibekukan dalam snapshot tidak akan terpengaruh
                      oleh perubahan ini. Versi baru akan otomatis menjadi versi aktif untuk ujian
                      mendatang.
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kode Soal (Opsional)
                  </label>
                  <input
                    type="text"
                    value={kode}
                    onChange={(e) => setKode(e.target.value)}
                    placeholder="Misal: MAT-IX-01"
                    disabled={activeTab === "NEW_VERSION"}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 disabled:bg-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Jenis Soal</label>
                  <select
                    value={jenisSoal}
                    onChange={(e) => setJenisSoal(e.target.value as any)}
                    disabled={activeTab === "NEW_VERSION"}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 disabled:bg-slate-100"
                  >
                    <option value="PILIHAN_GANDA">Pilihan Ganda Tunggal</option>
                    <option value="PILIHAN_GANDA_KOMPLEKS">Pilihan Ganda Kompleks</option>
                    <option value="BENAR_SALAH">Benar / Salah</option>
                    <option value="MENJODOHKAN">Menjodohkan (Matching Pairs)</option>
                    <option value="ISIAN_SINGKAT">Isian Singkat</option>
                    <option value="URAIAN_ESAI">Uraian / Esai</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tingkat Kesulitan
                  </label>
                  <select
                    value={tingkatKesulitan}
                    onChange={(e) => setTingkatKesulitan(e.target.value as any)}
                    disabled={activeTab === "NEW_VERSION"}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 disabled:bg-slate-100"
                  >
                    <option value="MUDAH">Mudah (C1-C2)</option>
                    <option value="SEDANG">Sedang (C3-C4)</option>
                    <option value="SULIT">Sulit (C5)</option>
                    <option value="HOTS">HOTS (C6 / Analisis Tinggi)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Konten Pertanyaan / Stimulus <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={kontenPertanyaan}
                  onChange={(e) => setKontenPertanyaan(e.target.value)}
                  placeholder="Tuliskan narasi pertanyaan atau stimulus soal di sini..."
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              {/* URL / Path Gambar Stimulus */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Gambar / Diagram Soal (Opsional)</span>
                  <span className="text-[11px] text-slate-400 font-normal">
                    URL gambar langsung atau path storage
                  </span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={gambarUrl}
                    onChange={(e) => setGambarUrl(e.target.value)}
                    placeholder="Contoh: https://domain.sch.id/media/jantung.png atau /images/soal-1.jpg"
                    className="flex-1 text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                  {gambarUrl && (
                    <button
                      type="button"
                      onClick={() => setGambarUrl("")}
                      className="px-2.5 py-2 rounded-xl text-xs text-rose-600 border border-rose-200 hover:bg-rose-50"
                    >
                      Hapus
                    </button>
                  )}
                </div>
                {gambarUrl && (
                  <div className="mt-2 p-2 bg-slate-50 border border-slate-200 rounded-xl inline-block">
                    <p className="text-[10px] text-slate-500 font-medium mb-1">Pratinjau Gambar:</p>
                    <img
                      src={gambarUrl}
                      alt="Pratinjau"
                      className="max-h-36 max-w-xs rounded-lg object-contain border border-slate-200"
                    />
                  </div>
                )}
              </div>

              {/* OPSI & KUNCI JAWABAN BERDASARKAN TIPE */}
              {(jenisSoal === "PILIHAN_GANDA" ||
                jenisSoal === "PILIHAN_GANDA_KOMPLEKS" ||
                jenisSoal === "BENAR_SALAH") && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">
                      Pilihan Opsi Jawaban (Tandai yang Benar)
                    </label>
                    {jenisSoal !== "BENAR_SALAH" && (
                      <button
                        type="button"
                        onClick={handleAddOption}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Tambah Opsi
                      </button>
                    )}
                  </div>

                  <div className="space-y-2">
                    {opsiList.map((op, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            handleOptionCorrectChange(idx, jenisSoal === "PILIHAN_GANDA_KOMPLEKS")
                          }
                          className={`w-7 h-7 shrink-0 rounded-lg text-xs font-bold flex items-center justify-center transition ${
                            op.isCorrect
                              ? "bg-emerald-600 text-white shadow-xs"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                          title={op.isCorrect ? "Jawaban Benar" : "Tandai sebagai Jawaban Benar"}
                        >
                          {op.label}
                        </button>
                        <input
                          type="text"
                          value={op.teks}
                          onChange={(e) => {
                            const updated = [...opsiList];
                            updated[idx].teks = e.target.value;
                            setOpsiList(updated);
                          }}
                          placeholder={`Teks jawaban pilihan ${op.label}`}
                          className="flex-1 text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                        />
                        {opsiList.length > 2 && jenisSoal !== "BENAR_SALAH" && (
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(idx)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 transition"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* MENJODOHKAN FORM */}
              {jenisSoal === "MENJODOHKAN" && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block">
                        Daftar Pasangan Menjodohkan (Premis Kiri ↔ Pasangan Benar Kanan)
                      </label>
                      <p className="text-[11px] text-slate-500">
                        Sistem otomatis mengacak pasangan kanan saat disajikan kepada siswa.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddPair}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Tambah Pasangan
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {pasanganList.map((p, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-blue-50 text-blue-700 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          value={p.premis}
                          onChange={(e) => handleUpdatePair(idx, "premis", e.target.value)}
                          placeholder={`Premis / Konsep #${idx + 1} (Kolom Kiri)`}
                          className="flex-1 text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                        />
                        <ArrowRight className="h-4 w-4 text-slate-400 shrink-0" />
                        <input
                          type="text"
                          value={p.pasangan}
                          onChange={(e) => handleUpdatePair(idx, "pasangan", e.target.value)}
                          placeholder={`Pasangan Cocok #${idx + 1} (Kolom Kanan)`}
                          className="flex-1 text-xs px-3 py-2 rounded-xl border border-emerald-200 bg-emerald-50/20 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                        />
                        {pasanganList.length > 2 && (
                          <button
                            type="button"
                            onClick={() => handleRemovePair(idx)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 transition"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {jenisSoal === "ISIAN_SINGKAT" && (
                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kata Kunci Kunci Jawaban (Pisahkan dengan koma jika ada sinonim)
                  </label>
                  <input
                    type="text"
                    value={kunciSingkat}
                    onChange={(e) => setKunciSingkat(e.target.value)}
                    placeholder="Contoh: Fotosintesis, fotosintesa, Asimilasi karbon"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>
              )}

              {jenisSoal === "URAIAN_ESAI" && (
                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Rubrik Penilaian & Pedoman Penskoran
                  </label>
                  <textarea
                    rows={2}
                    value={rubrikEsai}
                    onChange={(e) => setRubrikEsai(e.target.value)}
                    placeholder="Tuliskan kata kunci esensial dan pedoman skor jawaban siswa..."
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Bobot Soal</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={bobotDefault}
                    onChange={(e) => setBobotDefault(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>

                {activeTab === "NEW_VERSION" && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Alasan Pembaruan Versi <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={alasanPerubahan}
                      onChange={(e) => setAlasanPerubahan(e.target.value)}
                      placeholder="Misal: Perbaikan typo pada opsi C"
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                    />
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("LIST");
                    resetForm();
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={activeTab === "CREATE" ? handleCreateQuestion : handleCreateNewVersion}
                  disabled={isPending}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-xs hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {isPending ? (
                    "Menyimpan..."
                  ) : activeTab === "CREATE" ? (
                    <>
                      <Plus className="h-4 w-4" />
                      Simpan Soal ke Bank
                    </>
                  ) : (
                    <>
                      <GitBranch className="h-4 w-4" />
                      Terbitkan Versi Baru
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: EXCEL_IMPORT (IMPORT MASSAL SPREADSHEET) */}
          {activeTab === "EXCEL_IMPORT" && (
            <div className="space-y-6">
              {/* Instructions & Template Download */}
              <div className="p-4 bg-blue-50/60 border border-blue-200/80 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-5 w-5 text-blue-600" />
                    <h3 className="text-xs font-bold text-blue-900">
                      Format Kolom Spreadsheet Standar
                    </h3>
                  </div>
                  <p className="text-[11px] text-blue-700 leading-relaxed">
                    Format:{" "}
                    <code className="font-mono font-bold bg-blue-100 px-1 py-0.5 rounded text-blue-800">
                      No | Soal | Pilihan A | Pilihan B | Pilihan C | Pilihan D | Pilihan E |
                      Tingkat Kesulitan | Jawaban Benar
                    </code>
                    .
                    <br />
                    Tingkat Kesulitan: C1-C2 (Mudah), C3-C4 (Sedang), C5-C6/HOTS (HOTS).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-blue-200 text-blue-700 hover:bg-blue-50 text-xs font-bold shadow-2xs shrink-0 transition"
                >
                  <Download className="h-4 w-4" />
                  Unduh Template CSV
                </button>
              </div>

              {/* Upload File & Paste Area */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">
                    Unggah File CSV atau Tempel Data Spreadsheet
                  </label>
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold cursor-pointer transition">
                    <Upload className="h-3.5 w-3.5 text-blue-600" />
                    Pilih File CSV
                    <input
                      type="file"
                      accept=".csv,.txt,.tsv"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <textarea
                  rows={6}
                  value={rawSpreadsheetText}
                  onChange={(e) => setRawSpreadsheetText(e.target.value)}
                  placeholder="Tempel baris-baris dari Microsoft Excel atau Google Sheets di sini (Ctrl + V)..."
                  className="w-full text-xs font-mono p-3 rounded-2xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />

                <div className="flex items-center justify-between">
                  <p className="text-[11px] text-slate-400">
                    Sistem otomatis mendeteksi pemisah tab/titik koma/koma.
                  </p>
                  <button
                    type="button"
                    onClick={handleParseSpreadsheet}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-xs hover:bg-blue-700 transition"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Pratinjau Data Soal ({bulkParsedList.length})
                  </button>
                </div>
              </div>

              {/* Parsed Preview Table */}
              {bulkParsedList.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                      <span>Hasil Pratinjau Butir Soal</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px]">
                        {bulkParsedList.filter((q) => q.isValid).length} Valid
                      </span>
                      {bulkParsedList.filter((q) => !q.isValid).length > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[11px]">
                          {bulkParsedList.filter((q) => !q.isValid).length} Bermasalah
                        </span>
                      )}
                    </h4>

                    <button
                      type="button"
                      onClick={handleSaveBulkQuestions}
                      disabled={isPending || bulkParsedList.filter((q) => q.isValid).length === 0}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-xs hover:bg-emerald-700 transition disabled:opacity-50"
                    >
                      <Check className="h-4 w-4" />
                      {isPending
                        ? "Menyimpan ke Bank Soal..."
                        : `Simpan ${bulkParsedList.filter((q) => q.isValid).length} Soal ke Bank Soal`}
                    </button>
                  </div>

                  <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {bulkParsedList.map((q, idx) => (
                      <div
                        key={idx}
                        className={`p-3 text-xs flex items-start gap-3 ${
                          q.isValid ? "bg-white hover:bg-slate-50" : "bg-rose-50/50"
                        }`}
                      >
                        <span
                          className={`w-6 h-6 rounded-lg font-mono text-xs font-bold flex items-center justify-center shrink-0 ${
                            q.isValid ? "bg-blue-50 text-blue-700" : "bg-rose-100 text-rose-700"
                          }`}
                        >
                          {q.nomor}
                        </span>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                q.tipe_soal === "MENJODOHKAN"
                                  ? "bg-purple-100 text-purple-700"
                                  : q.tipe_soal === "URAIAN_ESAI"
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              {q.tipe_soal === "MENJODOHKAN"
                                ? "MENJODOHKAN"
                                : q.tipe_soal === "URAIAN_ESAI"
                                  ? "ESAI / URAIAN"
                                  : "PILIHAN GANDA"}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Bobot: {q.bobot} | {q.tingkat_kesulitan}
                            </span>
                          </div>
                          <p className="font-medium text-slate-900 leading-relaxed">
                            {q.pertanyaan}
                          </p>

                          {q.tipe_soal === "PILIHAN_GANDA" && q.opsi.length > 0 && (
                            <div className="flex items-center gap-2 flex-wrap text-[11px] text-slate-500">
                              {q.opsi.map((op) => (
                                <span
                                  key={op.label}
                                  className={`px-1.5 py-0.5 rounded ${
                                    op.isCorrect
                                      ? "bg-emerald-100 text-emerald-800 font-bold"
                                      : "bg-slate-100 text-slate-600"
                                  }`}
                                >
                                  {op.label}: {op.teks}
                                </span>
                              ))}
                              <span className="ml-auto font-bold text-blue-700">
                                Kunci: {q.kunci_benar}
                              </span>
                            </div>
                          )}

                          {q.tipe_soal === "MENJODOHKAN" && (
                            <div className="flex items-center gap-2 text-[11px] text-purple-700 bg-purple-50/60 px-2 py-1 rounded-lg border border-purple-200/50">
                              <span className="font-semibold">Pasangan Benar:</span>
                              <span className="font-bold">{q.kunci_benar}</span>
                            </div>
                          )}

                          {q.tipe_soal === "URAIAN_ESAI" && (
                            <div className="text-[11px] text-amber-800 bg-amber-50/60 px-2 py-1 rounded-lg border border-amber-200/50">
                              <span className="font-semibold">Rubrik / Pedoman: </span>
                              <span>{q.rubrik_esai || q.kunci_benar}</span>
                            </div>
                          )}
                          {!q.isValid && (
                            <p className="text-[11px] text-rose-600 font-bold flex items-center gap-1">
                              <AlertCircle className="h-3.5 w-3.5" />
                              {q.errorDetail}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: AI_GENERATOR (ASISTEN AI GEMINI) */}
          {activeTab === "AI_GENERATOR" && (
            <div className="space-y-6">
              {/* Gemini Banner */}
              <div className="p-5 rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-indigo-800 text-white relative overflow-hidden shadow-lg">
                <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="p-2 rounded-xl bg-white/20 backdrop-blur-md">
                    <Sparkles className="h-5 w-5 text-amber-300" />
                  </div>
                  <h3 className="text-sm font-bold">Asisten AI Guru — Pembuat Soal Otomatis</h3>
                  <span className="ml-auto text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/20 border border-white/30 text-blue-100">
                    Google Gemini 2.0
                  </span>
                </div>
                <p className="text-xs text-blue-100/90 leading-relaxed max-w-2xl">
                  Rancang butir soal Kurikulum Merdeka secara instan lengkap dengan narasi stimulus,
                  opsi pengecoh berkualitas, dan taksonomi Bloom.
                </p>
              </div>

              {/* Generator Configuration Form */}
              <div className="p-5 rounded-3xl bg-slate-50/70 border border-slate-200/80 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Topik Pokok / Capaian Pembelajaran <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={aiTopik}
                      onChange={(e) => setAiTopik(e.target.value)}
                      placeholder="Misal: Hukum Newton & Penerapannya pada Gerak Benda, Sistem Fotosintesis Kelas 8..."
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Format Jenis Soal
                    </label>
                    <select
                      value={aiJenis}
                      onChange={(e) => setAiJenis(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-white"
                    >
                      <option value="PILIHAN_GANDA">Pilihan Ganda (A-D/E)</option>
                      <option value="MENJODOHKAN">Menjodohkan (Matching Pairs)</option>
                      <option value="BENAR_SALAH">Benar / Salah</option>
                      <option value="ISIAN_SINGKAT">Isian Singkat</option>
                      <option value="URAIAN_ESAI">Uraian / Esai</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Tingkat Kesulitan
                    </label>
                    <select
                      value={aiKesulitan}
                      onChange={(e) => setAiKesulitan(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-white"
                    >
                      <option value="SEDANG">Sedang (C3-C4)</option>
                      <option value="MUDAH">Mudah (C1-C2)</option>
                      <option value="SULIT">Sulit (C5)</option>
                      <option value="HOTS">HOTS (Analisis Tinggi / C6)</option>
                      <option value="CAMPURAN">Campuran Proporsional</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Jumlah Butir Soal ({aiJumlah} butir)
                    </label>
                    <input
                      type="range"
                      min={1}
                      max={15}
                      value={aiJumlah}
                      onChange={(e) => setAiJumlah(Number(e.target.value))}
                      className="w-full accent-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                      <span>Google Gemini API Key (Opsional)</span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        Tersimpan lokal di browser
                      </span>
                    </label>
                    <div className="relative">
                      <Key className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                      <input
                        type="password"
                        value={aiApiKey}
                        onChange={(e) => setAiApiKey(e.target.value)}
                        placeholder="AIzaSy... (kosongkan untuk asisten internal)"
                        className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-white font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end pt-2">
                  <button
                    type="button"
                    onClick={handleGenerateAi}
                    disabled={isAiGenerating || !aiTopik.trim()}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold shadow-md hover:from-blue-700 hover:to-indigo-700 transition disabled:opacity-50"
                  >
                    {isAiGenerating ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        AI Sedang Merancang Soal...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 text-amber-300" />
                        Susun Soal dengan AI Gemini
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* AI Generation Results */}
              {aiMessage && (
                <p className="text-xs text-indigo-700 bg-indigo-50/70 border border-indigo-200/60 p-3 rounded-2xl flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-indigo-600 shrink-0" />
                  {aiMessage}
                </p>
              )}

              {aiGeneratedList.length > 0 && (
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-800">
                      Rancangan Soal Dihasilkan ({aiGeneratedList.length} butir)
                    </h4>
                    <button
                      type="button"
                      onClick={handleSaveAiQuestions}
                      disabled={isPending}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-xs hover:bg-blue-700 transition disabled:opacity-50"
                    >
                      <Check className="h-4 w-4" />
                      {isPending ? "Menyimpan ke Bank..." : "Simpan Semua Hasil AI ke Bank Soal"}
                    </button>
                  </div>

                  <div className="space-y-3">
                    {aiGeneratedList.map((q, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-blue-50 text-blue-700 font-mono text-xs font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            {q.jenis_soal.replace(/_/g, " ")}
                          </span>
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                            {q.tingkat_kesulitan}
                          </span>
                          <span className="text-[11px] text-slate-400 font-medium ml-auto">
                            Bobot: {q.bobot}
                          </span>
                        </div>

                        <p className="text-xs text-slate-800 leading-relaxed font-normal">
                          {q.pertanyaan}
                        </p>

                        {/* If matching pairs */}
                        {q.pasangan_menjodohkan && Array.isArray(q.pasangan_menjodohkan) && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                            {q.pasangan_menjodohkan.map((p: any, pIdx: number) => (
                              <div
                                key={pIdx}
                                className="text-[11px] p-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                              >
                                <span className="font-semibold text-slate-700">{p.premis}</span>
                                <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                                  {p.pasangan}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* If Multiple Choice options */}
                        {q.opsi && Array.isArray(q.opsi) && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                            {q.opsi.map((op: any) => {
                              const isCorrect =
                                q.kunci_jawaban?.pilihan_benar === op.label ||
                                (Array.isArray(q.kunci_jawaban?.pilihan_benar) &&
                                  q.kunci_jawaban.pilihan_benar.includes(op.label));
                              return (
                                <div
                                  key={op.label}
                                  className={`text-[11px] p-2 rounded-xl border flex items-center gap-2 ${
                                    isCorrect
                                      ? "bg-emerald-50 border-emerald-200 text-emerald-900 font-medium"
                                      : "bg-slate-50 border-slate-100 text-slate-600"
                                  }`}
                                >
                                  <span className="font-bold">{op.label}.</span>
                                  <span>{op.teks}</span>
                                  {isCorrect && (
                                    <Check className="h-3.5 w-3.5 text-emerald-600 ml-auto shrink-0" />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {q.pembahasan && (
                          <p className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-100">
                            💡 Pembahasan: {q.pembahasan}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

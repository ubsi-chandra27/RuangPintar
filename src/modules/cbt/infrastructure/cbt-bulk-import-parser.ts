/**
 * Ruang Pintar — CBT Bulk Import Parser (Excel / CSV / Quick Paste)
 *
 * Mendukung format kolom yang ditentukan:
 * No | Soal | Pilihan A | Pilihan B | Pilihan C | Pilihan D | Pilihan E | Tingkat Kesulitan (C1-C6/HOTS) | Jawaban Benar
 */

import { TingkatKesulitanCbt, TipeSoal } from "../domain/cbt-types";

export interface ParsedBulkQuestion {
  nomor: number;
  tipe_soal: TipeSoal;
  pertanyaan: string;
  gambar_url?: string;
  opsi: Array<{ label: string; teks: string; isCorrect: boolean }>;
  opsi_menjodohkan?: {
    premis: Array<{ id: string; teks: string }>;
    pilihan_target: string[];
  };
  pasangan_menjodohkan?: Array<{ id: string; premis: string; target: string }>;
  rubrik_esai?: string;
  tingkat_kesulitan: TingkatKesulitanCbt;
  kunci_benar: string;
  bobot: number;
  isValid: boolean;
  errorDetail?: string;
}

/**
 * Parse spreadsheet text supporting:
 * 1. 11/10-column format: No | Jenis Soal | Soal / Premis | Opsi A / Target | Opsi B / Pengecoh | Opsi C | Opsi D | Opsi E | Tingkat Kesulitan | Kunci Jawaban | Bobot
 * 2. Section headers: [BAGIAN A: PILIHAN GANDA], [BAGIAN B: MENJODOHKAN], [BAGIAN C: ESSAY]
 * 3. 9-column legacy format: No | Soal | Pilihan A | Pilihan B | Pilihan C | Pilihan D | Pilihan E | Tingkat Kesulitan | Jawaban Benar
 */
export function parseSpreadsheetText(rawText: string): ParsedBulkQuestion[] {
  if (!rawText || !rawText.trim()) return [];

  // Normalize line endings
  const lines = rawText
    .trim()
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  if (lines.length === 0) return [];

  // Detect primary delimiter: tab (\t), semicolon (;), or comma (,)
  let delimiter = "\t";
  const sampleLine = lines.find((l) => !l.startsWith("[") && !l.startsWith("#")) || lines[0];
  if (sampleLine.includes("\t")) {
    delimiter = "\t";
  } else if (sampleLine.includes(";")) {
    delimiter = ";";
  } else if (sampleLine.includes(",")) {
    delimiter = ",";
  }

  let currentSectionType: TipeSoal = "PILIHAN_GANDA";
  const parsedQuestions: ParsedBulkQuestion[] = [];
  let currentNumber = 1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check for Section Header (e.g., [BAGIAN A: PILIHAN GANDA] or [MENJODOHKAN])
    if (line.startsWith("[") && line.endsWith("]")) {
      const sectionTag = line.replace(/[\[\]]/g, "").toUpperCase();
      if (
        sectionTag.includes("MENJODOHKAN") ||
        sectionTag.includes("MATCHING") ||
        sectionTag.includes("JODOH")
      ) {
        currentSectionType = "MENJODOHKAN";
      } else if (
        sectionTag.includes("ESAI") ||
        sectionTag.includes("ESSAY") ||
        sectionTag.includes("URAIAN")
      ) {
        currentSectionType = "URAIAN_ESAI";
      } else if (sectionTag.includes("ISIAN")) {
        currentSectionType = "ISIAN_SINGKAT";
      } else if (
        sectionTag.includes("PILIHAN") ||
        sectionTag.includes("GANDA") ||
        sectionTag.includes("PG")
      ) {
        currentSectionType = "PILIHAN_GANDA";
      }
      continue;
    }

    // Check if line is a table header row (e.g. No | Soal | Pilihan A...)
    if (/^(no|soal|pertanyaan|jenis|tipe|pernyataan)/i.test(line)) {
      continue;
    }

    const rawCols = splitCsvLine(line, delimiter);
    if (rawCols.length < 2) continue; // Skip empty/trivial lines

    // Detect if column 1 is "Jenis Soal" (e.g., PG, MENJODOHKAN, ESAI)
    let detectedType: TipeSoal = currentSectionType;
    let colOffset = 0;
    const col1Upper = (rawCols[1] || "").trim().toUpperCase();

    if (col1Upper === "PG" || col1Upper === "PILIHAN_GANDA" || col1Upper === "PILIHAN GANDA") {
      detectedType = "PILIHAN_GANDA";
      colOffset = 1;
    } else if (col1Upper === "MENJODOHKAN" || col1Upper === "JODOH" || col1Upper === "MATCHING") {
      detectedType = "MENJODOHKAN";
      colOffset = 1;
    } else if (
      col1Upper === "ESAI" ||
      col1Upper === "ESSAY" ||
      col1Upper === "URAIAN" ||
      col1Upper === "URAIAN_ESAI"
    ) {
      detectedType = "URAIAN_ESAI";
      colOffset = 1;
    } else if (col1Upper === "ISIAN" || col1Upper === "ISIAN_SINGKAT") {
      detectedType = "ISIAN_SINGKAT";
      colOffset = 1;
    }

    // Parse according to detected question type
    if (detectedType === "PILIHAN_GANDA") {
      let no = parseInt(rawCols[0].trim(), 10) || currentNumber;
      let soal = rawCols[1 + colOffset]?.trim() || "";
      let optA = rawCols[2 + colOffset]?.trim() || "";
      let optB = rawCols[3 + colOffset]?.trim() || "";
      let optC = rawCols[4 + colOffset]?.trim() || "";
      let optD = rawCols[5 + colOffset]?.trim() || "";
      let optE = "";
      let kesulitanRaw = "SEDANG";
      let kunciRaw = "A";
      let bobot = 1;

      if (rawCols.length >= 8 + colOffset) {
        optE = rawCols[6 + colOffset]?.trim() || "";
        kesulitanRaw = rawCols[7 + colOffset]?.trim() || "SEDANG";
        kunciRaw = (rawCols[8 + colOffset]?.trim() || "A").toUpperCase();
        if (rawCols[9 + colOffset]) {
          bobot = parseFloat(rawCols[9 + colOffset].trim()) || 1;
        }
      } else if (rawCols.length >= 7 + colOffset) {
        kesulitanRaw = rawCols[6 + colOffset]?.trim() || "SEDANG";
        kunciRaw = (rawCols[7 + colOffset]?.trim() || "A").toUpperCase();
      }

      // Extract image tag if present [img:url]
      let extractedImage: string | undefined = undefined;
      const imgMatch = soal.match(/\[img:([^\]]+)\]/i);
      if (imgMatch) {
        extractedImage = imgMatch[1].trim();
        soal = soal.replace(/\[img:[^\]]+\]/i, "").trim();
      }

      const mappedKesulitan = mapDifficulty(kesulitanRaw);
      const cleanKunci = kunciRaw.replace(/[^A-E]/g, "").charAt(0) || "A";

      const opsiList: Array<{ label: string; teks: string; isCorrect: boolean }> = [
        { label: "A", teks: optA, isCorrect: cleanKunci === "A" },
        { label: "B", teks: optB, isCorrect: cleanKunci === "B" },
      ];
      if (optC) opsiList.push({ label: "C", teks: optC, isCorrect: cleanKunci === "C" });
      if (optD) opsiList.push({ label: "D", teks: optD, isCorrect: cleanKunci === "D" });
      if (optE) opsiList.push({ label: "E", teks: optE, isCorrect: cleanKunci === "E" });

      const hasQuestion = soal.length > 0;
      const hasEnoughOptions = opsiList.filter((o) => o.teks.length > 0).length >= 2;
      const hasValidKey = opsiList.some((o) => o.isCorrect);

      const isValid = hasQuestion && hasEnoughOptions && hasValidKey;
      let errorDetail: string | undefined = undefined;
      if (!hasQuestion) errorDetail = "Pertanyaan kosong";
      else if (!hasEnoughOptions) errorDetail = "Opsi jawaban kurang dari 2";
      else if (!hasValidKey) errorDetail = `Kunci jawaban '${kunciRaw}' tidak cocok dengan opsi`;

      parsedQuestions.push({
        nomor: no,
        tipe_soal: "PILIHAN_GANDA",
        pertanyaan: soal,
        gambar_url: extractedImage,
        opsi: opsiList,
        tingkat_kesulitan: mappedKesulitan,
        kunci_benar: cleanKunci,
        bobot: bobot > 0 ? bobot : mappedKesulitan === "HOTS" ? 2 : 1,
        isValid,
        errorDetail,
      });
      currentNumber++;
    } else if (detectedType === "MENJODOHKAN") {
      // Format: No | [Jenis Soal] | Pertanyaan / Premis | Jawaban Target (Benar) | Pengecoh | Kesulitan | Bobot
      // Atau dalam format 9-kolom standar: No | Premis | ... | Kesulitan | Target Jawaban
      let no = parseInt(rawCols[0].trim(), 10) || currentNumber;
      let premis = rawCols[1 + colOffset]?.trim() || "";
      let targetBenar = rawCols[2 + colOffset]?.trim() || "";
      let pengecoh = rawCols[3 + colOffset]?.trim() || "";
      let kesulitanRaw = rawCols[4 + colOffset]?.trim() || "SEDANG";
      let bobot = 2;

      if (!targetBenar && rawCols.length >= 8) {
        targetBenar = rawCols[rawCols.length - 1]?.trim() || "";
        kesulitanRaw = rawCols[rawCols.length - 2]?.trim() || kesulitanRaw;
      }

      if (rawCols[5 + colOffset] && rawCols.length < 8) {
        bobot = parseFloat(rawCols[5 + colOffset].trim()) || 2;
      }

      // Check if premis has image
      let extractedImage: string | undefined = undefined;
      const imgMatch = premis.match(/\[img:([^\]]+)\]/i);
      if (imgMatch) {
        extractedImage = imgMatch[1].trim();
        premis = premis.replace(/\[img:[^\]]+\]/i, "").trim();
      }

      const mappedKesulitan = mapDifficulty(kesulitanRaw);
      const targets = [targetBenar];
      if (pengecoh) targets.push(pengecoh);

      const isValid = premis.length > 0 && targetBenar.length > 0;
      let errorDetail: string | undefined = undefined;
      if (!premis) errorDetail = "Premis / pertanyaan menjodohkan kosong";
      else if (!targetBenar) errorDetail = "Target pasangan benar kosong";

      parsedQuestions.push({
        nomor: no,
        tipe_soal: "MENJODOHKAN",
        pertanyaan: premis,
        gambar_url: extractedImage,
        opsi: [],
        opsi_menjodohkan: {
          premis: [{ id: "1", teks: premis }],
          pilihan_target: targets,
        },
        pasangan_menjodohkan: [{ id: "1", premis, target: targetBenar }],
        tingkat_kesulitan: mappedKesulitan,
        kunci_benar: targetBenar,
        bobot: bobot > 0 ? bobot : 2,
        isValid,
        errorDetail,
      });
      currentNumber++;
    } else if (detectedType === "URAIAN_ESAI" || detectedType === "ISIAN_SINGKAT") {
      // Format: No | [Jenis Soal] | Soal Pertanyaan | Rubrik / Kunci Acuan | Kesulitan | Bobot
      // Atau dalam format 9-kolom standar: No | Soal | ... | Kesulitan | Rubrik
      let no = parseInt(rawCols[0].trim(), 10) || currentNumber;
      let soal = rawCols[1 + colOffset]?.trim() || "";
      let rubrik = rawCols[2 + colOffset]?.trim() || "";
      let kesulitanRaw = rawCols[3 + colOffset]?.trim() || "SEDANG";
      let bobot = detectedType === "URAIAN_ESAI" ? 4 : 2;

      if (!rubrik && rawCols.length >= 8) {
        rubrik = rawCols[rawCols.length - 1]?.trim() || "";
        kesulitanRaw = rawCols[rawCols.length - 2]?.trim() || kesulitanRaw;
      }

      if (rawCols[4 + colOffset] && rawCols.length < 8) {
        bobot = parseFloat(rawCols[4 + colOffset].trim()) || bobot;
      }

      let extractedImage: string | undefined = undefined;
      const imgMatch = soal.match(/\[img:([^\]]+)\]/i);
      if (imgMatch) {
        extractedImage = imgMatch[1].trim();
        soal = soal.replace(/\[img:[^\]]+\]/i, "").trim();
      }

      const mappedKesulitan = mapDifficulty(kesulitanRaw);
      const isValid = soal.length > 0;
      let errorDetail: string | undefined = undefined;
      if (!soal) errorDetail = "Teks pertanyaan esai / isian kosong";

      parsedQuestions.push({
        nomor: no,
        tipe_soal: detectedType,
        pertanyaan: soal,
        gambar_url: extractedImage,
        opsi: [],
        rubrik_esai: rubrik || undefined,
        tingkat_kesulitan: mappedKesulitan,
        kunci_benar: rubrik || "Penilaian manual oleh guru.",
        bobot: bobot > 0 ? bobot : 4,
        isValid,
        errorDetail,
      });
      currentNumber++;
    }
  }

  return parsedQuestions;
}

function mapDifficulty(kesulitanRaw: string): TingkatKesulitanCbt {
  const kUpper = (kesulitanRaw || "").toUpperCase();
  if (kUpper.includes("C1") || kUpper.includes("C2") || kUpper.includes("MUDAH")) {
    return "MUDAH";
  } else if (kUpper.includes("C3") || kUpper.includes("C4") || kUpper.includes("SEDANG")) {
    return "SEDANG";
  } else if (
    kUpper.includes("C5") ||
    kUpper.includes("C6") ||
    kUpper.includes("HOTS") ||
    kUpper.includes("SULIT")
  ) {
    return "HOTS";
  }
  return "SEDANG";
}

/**
 * Split CSV line taking quotes into account
 */
function splitCsvLine(line: string, delimiter: string): string[] {
  if (delimiter === "\t") {
    return line.split("\t");
  }

  const result: string[] = [];
  let current = "";
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"' || char === "'") {
      insideQuotes = !insideQuotes;
    } else if (char === delimiter && !insideQuotes) {
      result.push(current.trim().replace(/^["']|["']$/g, ""));
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim().replace(/^["']|["']$/g, ""));
  return result;
}

/**
 * Generate CSV template string with authentic Indonesian school multi-section sample
 * (Bagian A: Pilihan Ganda, Bagian B: Menjodohkan, Bagian C: Essay)
 */
export function generateCsvTemplate(): string {
  return `[BAGIAN A: PILIHAN GANDA]
No\tSoal\tPilihan A\tPilihan B\tPilihan C\tPilihan D\tPilihan E\tTingkat Kesulitan\tJawaban Benar\tBobot
1\tBagian sel yang berfungsi sebagai pusat pengendali kegiatan sel adalah...\tSitoplasma\tNukleus (Inti Sel)\tMitokondria\tRibosom\tBadan Golgi\tC1\tB\t2
2\tOrganel yang bertanggung jawab dalam respirasi sel dan produksi ATP adalah...\tMitokondria\tKloroplas\tLisosom\tVakuola\tSentriol\tC2\tA\t2
3\tManakah pernyataan yang benar mengenai fotosintesis tumbuhan C3 dan C4?\tC3 lebih hemat air\tC4 fiksasi CO2 awal oleh PEP karboksilase\tC3 tidak fotorespirasi\tC4 fotosintesis malam\tSemua salah\tC4\tB\t2

[BAGIAN B: MENJODOHKAN]
No\tPertanyaan (Premis)\tJawaban Benar (Target)\tPengecoh\tTingkat Kesulitan\tBobot
1\tFitoplankton & Tumbuhan Hijau\tProdusen Primer (Autotrof)\tKonsumen Tersier\tC2\t2
2\tZooplankton & Herbivora\tKonsumen Primer (Herbivora)\tDekomposer\tC2\t2
3\tBakteri Pengurai & Fungi\tDekomposer / Saprofit\tKarnivora Puncak\tC2\t2

[BAGIAN C: ESSAY]
No\tSoal Esai\tPedoman Penilaian / Kunci Jawaban\tTingkat Kesulitan\tBobot
1\tJelaskan tahapan utama dalam siklus Calvin pada reaksi gelap fotosintesis!\tFiksasi CO2 oleh RuBP, Reduksi PGA menjadi PGAL, dan Regenerasi RuBP menggunakan ATP & NADPH\tC4\t4
2\tMengapa fermentasi asam laktat terjadi pada sel otot saat aktivitas fisik berat?\tKekurangan suplai oksigen memicu glikolisis anaerob untuk regenerasi NAD+ menghasilkan ATP darurat\tC4\t4
`;
}

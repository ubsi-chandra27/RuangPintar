/**
 * Ruang Pintar — CBT Bulk Import Parser (Excel / CSV / Quick Paste)
 *
 * Mendukung semua jenis butir soal CBT:
 * 1. Pilihan Ganda (PG)
 * 2. Pilihan Ganda Kompleks (Lebih dari 1 jawaban benar)
 * 3. Benar / Salah
 * 4. Menjodohkan (Matching Pairs)
 * 5. Isian Singkat (Kata Kunci)
 * 6. Uraian / Esai (Rubrik Penilaian)
 *
 * Kompatibel dengan:
 * - Microsoft Excel (CSV Pemisah Titik Koma ';' dengan UTF-8 BOM)
 * - Standard CSV (Pemisah Koma ',' dengan Quotes RFC 4180)
 * - Copy-Paste Langsung dari Excel / Google Sheets (Tab '\t')
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
 * Format helper for writing RFC-4180 compliant CSV cells
 */
export function formatCsvCell(val: string | number, delimiter: string): string {
  const str = String(val ?? "");
  if (str.includes(delimiter) || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Split CSV line taking quotes into account, including escaped quotes ("")
 */
export function splitCsvLine(line: string, delimiter: string): string[] {
  if (delimiter === "\t") {
    return line.split("\t").map((c) => c.trim().replace(/^["']|["']$/g, ""));
  }

  const result: string[] = [];
  let current = "";
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (insideQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // skip escaped quote
      } else {
        insideQuotes = !insideQuotes;
      }
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
 * Map difficulty text into standard TingkatKesulitanCbt
 */
export function mapDifficulty(kesulitanRaw: string): TingkatKesulitanCbt {
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
 * Parse spreadsheet text supporting:
 * 1. Delimiters: Tab (\t), Semicolon (;), Comma (,) with auto-detection
 * 2. Section headers: [BAGIAN A: PILIHAN GANDA], [PILIHAN GANDA KOMPLEKS], [BENAR SALAH], [MENJODOHKAN], [ISIAN SINGKAT], [ESSAY/URAIAN]
 * 3. 11/10-column unified table format: No | Jenis Soal | Soal | Opsi A / Target | ... | Kunci | Bobot
 * 4. 9-column standard legacy format: No | Soal | Pilihan A | Pilihan B | Pilihan C | Pilihan D | Pilihan E | Tingkat Kesulitan | Jawaban Benar
 */
export function parseSpreadsheetText(rawText: string): ParsedBulkQuestion[] {
  if (!rawText || !rawText.trim()) return [];

  // Strip UTF-8 BOM if present
  let cleanText = rawText.replace(/^\uFEFF/, "");

  // Check if first line contains explicit sep=... (e.g. sep=; or sep=,)
  let forcedDelimiter: string | null = null;
  const firstLineMatch = cleanText.match(/^sep=([^\r\n]+)\r?\n/i);
  if (firstLineMatch) {
    forcedDelimiter = firstLineMatch[1].trim();
    cleanText = cleanText.slice(firstLineMatch[0].length);
  }

  // Normalize line endings
  const lines = cleanText
    .trim()
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  if (lines.length === 0) return [];

  // Detect primary delimiter: tab (\t), semicolon (;), or comma (,) based on counts across non-header lines
  let delimiter = forcedDelimiter || "\t";
  if (!forcedDelimiter) {
    const dataSample = lines.filter((l) => !l.startsWith("[") && !l.startsWith("#")).slice(0, 15);
    let tabCount = 0;
    let semiCount = 0;
    let commaCount = 0;

    for (const l of dataSample) {
      tabCount += (l.match(/\t/g) || []).length;
      semiCount += (l.match(/;/g) || []).length;
      commaCount += (l.match(/,/g) || []).length;
    }

    if (tabCount >= semiCount && tabCount >= commaCount && tabCount > 0) {
      delimiter = "\t";
    } else if (semiCount >= commaCount && semiCount > 0) {
      delimiter = ";";
    } else if (commaCount > 0) {
      delimiter = ",";
    } else {
      // Fallback check on sampleLine
      const sampleLine = lines.find((l) => !l.startsWith("[") && !l.startsWith("#")) || lines[0];
      if (sampleLine.includes("\t")) delimiter = "\t";
      else if (sampleLine.includes(";")) delimiter = ";";
      else if (sampleLine.includes(",")) delimiter = ",";
    }
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
        sectionTag.includes("KOMPLEKS") ||
        sectionTag.includes("COMPLEX") ||
        sectionTag.includes("MULTIPLE")
      ) {
        currentSectionType = "PILIHAN_GANDA_KOMPLEKS";
      } else if (
        sectionTag.includes("BENAR") ||
        sectionTag.includes("SALAH") ||
        sectionTag.includes("TRUE") ||
        sectionTag.includes("FALSE")
      ) {
        currentSectionType = "BENAR_SALAH";
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
    if (/^(no|nomor|soal|pertanyaan|pernyataan|jenis|tipe)/i.test(line)) {
      continue;
    }

    const rawCols = splitCsvLine(line, delimiter);
    if (rawCols.length < 2) continue; // Skip empty/trivial lines

    // Detect if column 1 is "Jenis Soal" (e.g., PG, KOMPLEKS, MENJODOHKAN, ESAI, ISIAN, BENAR_SALAH)
    let detectedType: TipeSoal = currentSectionType;
    let colOffset = 0;
    const col1Upper = (rawCols[1] || "").trim().toUpperCase();

    if (
      col1Upper === "KOMPLEKS" ||
      col1Upper === "PG_KOMPLEKS" ||
      col1Upper === "PILIHAN_GANDA_KOMPLEKS" ||
      col1Upper === "PILIHAN GANDA KOMPLEKS"
    ) {
      detectedType = "PILIHAN_GANDA_KOMPLEKS";
      colOffset = 1;
    } else if (
      col1Upper === "BENAR_SALAH" ||
      col1Upper === "BENAR SALAH" ||
      col1Upper === "BS" ||
      col1Upper === "TRUE_FALSE"
    ) {
      detectedType = "BENAR_SALAH";
      colOffset = 1;
    } else if (
      col1Upper === "PG" ||
      col1Upper === "PILIHAN_GANDA" ||
      col1Upper === "PILIHAN GANDA"
    ) {
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

    // ========================================================================
    // 1 & 2. PILIHAN GANDA & PILIHAN GANDA KOMPLEKS
    // ========================================================================
    if (detectedType === "PILIHAN_GANDA" || detectedType === "PILIHAN_GANDA_KOMPLEKS") {
      let no = parseInt(rawCols[0].trim(), 10) || currentNumber;
      let soal = rawCols[1 + colOffset]?.trim() || "";
      let optA = rawCols[2 + colOffset]?.trim() || "";
      let optB = rawCols[3 + colOffset]?.trim() || "";
      let optC = rawCols[4 + colOffset]?.trim() || "";
      let optD = rawCols[5 + colOffset]?.trim() || "";
      let optE = "";
      let kesulitanRaw = "SEDANG";
      let kunciRaw = "A";
      let bobot = detectedType === "PILIHAN_GANDA_KOMPLEKS" ? 3 : 1;

      if (rawCols.length >= 8 + colOffset) {
        optE = rawCols[6 + colOffset]?.trim() || "";
        kesulitanRaw = rawCols[7 + colOffset]?.trim() || "SEDANG";
        kunciRaw = (rawCols[8 + colOffset]?.trim() || "A").toUpperCase();
        if (rawCols[9 + colOffset]) {
          bobot = parseFloat(rawCols[9 + colOffset].trim()) || bobot;
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

      // Check if multiple correct keys are provided (e.g., "A, C" or "A,C,D")
      const correctKeys = kunciRaw
        .replace(/[^A-E]/g, " ")
        .split(/\s+/)
        .filter(Boolean);

      const isComplex = detectedType === "PILIHAN_GANDA_KOMPLEKS" || correctKeys.length > 1;
      const effectiveType: TipeSoal = isComplex ? "PILIHAN_GANDA_KOMPLEKS" : "PILIHAN_GANDA";

      const cleanKunci = isComplex ? correctKeys.join(", ") : correctKeys[0] || "A";

      const opsiList: Array<{ label: string; teks: string; isCorrect: boolean }> = [
        { label: "A", teks: optA, isCorrect: correctKeys.includes("A") },
        { label: "B", teks: optB, isCorrect: correctKeys.includes("B") },
      ];
      if (optC) opsiList.push({ label: "C", teks: optC, isCorrect: correctKeys.includes("C") });
      if (optD) opsiList.push({ label: "D", teks: optD, isCorrect: correctKeys.includes("D") });
      if (optE) opsiList.push({ label: "E", teks: optE, isCorrect: correctKeys.includes("E") });

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
        tipe_soal: effectiveType,
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

      // ========================================================================
      // 3. BENAR / SALAH
      // ========================================================================
    } else if (detectedType === "BENAR_SALAH") {
      let no = parseInt(rawCols[0].trim(), 10) || currentNumber;
      let soal = rawCols[1 + colOffset]?.trim() || "";
      let kunciRaw = "";
      let kesulitanRaw = "SEDANG";
      let bobot = 1;

      if (rawCols.length >= 5 + colOffset) {
        // Format: No | Soal | Benar/Salah | Kesulitan | Bobot
        kunciRaw = rawCols[2 + colOffset]?.trim() || "";
        kesulitanRaw = rawCols[3 + colOffset]?.trim() || "SEDANG";
        bobot = parseFloat(rawCols[4 + colOffset]?.trim() || "1") || 1;
      } else if (rawCols.length >= 3 + colOffset) {
        kunciRaw = rawCols[2 + colOffset]?.trim() || "";
        if (rawCols[3 + colOffset]) {
          kesulitanRaw = rawCols[3 + colOffset]?.trim() || "SEDANG";
        }
      }

      let extractedImage: string | undefined = undefined;
      const imgMatch = soal.match(/\[img:([^\]]+)\]/i);
      if (imgMatch) {
        extractedImage = imgMatch[1].trim();
        soal = soal.replace(/\[img:[^\]]+\]/i, "").trim();
      }

      const kUpper = kunciRaw.toUpperCase();
      const isBenar =
        kUpper.includes("BENAR") ||
        kUpper === "B" ||
        kUpper === "TRUE" ||
        kUpper === "T" ||
        kUpper === "A";

      const mappedKesulitan = mapDifficulty(kesulitanRaw);
      const opsiList = [
        { label: "A", teks: "Benar", isCorrect: isBenar },
        { label: "B", teks: "Salah", isCorrect: !isBenar },
      ];

      const isValid = soal.length > 0 && kunciRaw.length > 0;
      let errorDetail: string | undefined = undefined;
      if (!soal) errorDetail = "Pernyataan Benar/Salah kosong";
      else if (!kunciRaw) errorDetail = "Kunci jawaban Benar/Salah kosong";

      parsedQuestions.push({
        nomor: no,
        tipe_soal: "BENAR_SALAH",
        pertanyaan: soal,
        gambar_url: extractedImage,
        opsi: opsiList,
        tingkat_kesulitan: mappedKesulitan,
        kunci_benar: isBenar ? "A (Benar)" : "B (Salah)",
        bobot: bobot > 0 ? bobot : 1,
        isValid,
        errorDetail,
      });
      currentNumber++;

      // ========================================================================
      // 4. MENJODOHKAN
      // ========================================================================
    } else if (detectedType === "MENJODOHKAN") {
      let no = parseInt(rawCols[0].trim(), 10) || currentNumber;
      let premis = rawCols[1 + colOffset]?.trim() || "";
      let targetBenar = rawCols[2 + colOffset]?.trim() || "";
      let pengecoh = "";
      let kesulitanRaw = "SEDANG";
      let bobot = 2;

      // Smart column detection: Check whether col 3 is a difficulty code or distractor
      const col3 = rawCols[3 + colOffset]?.trim() || "";
      const isCol3Difficulty = /^C[1-6]$/i.test(col3) || /^(MUDAH|SEDANG|SULIT|HOTS)$/i.test(col3);

      if (isCol3Difficulty) {
        kesulitanRaw = col3;
        bobot = parseFloat(rawCols[4 + colOffset]?.trim() || "2") || 2;
      } else {
        pengecoh = col3;
        kesulitanRaw = rawCols[4 + colOffset]?.trim() || "SEDANG";
        if (rawCols[5 + colOffset]) {
          bobot = parseFloat(rawCols[5 + colOffset].trim()) || 2;
        }
      }

      if (!targetBenar && rawCols.length >= 8) {
        targetBenar = rawCols[rawCols.length - 1]?.trim() || "";
        kesulitanRaw = rawCols[rawCols.length - 2]?.trim() || kesulitanRaw;
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

      // ========================================================================
      // 5. ISIAN SINGKAT
      // ========================================================================
    } else if (detectedType === "ISIAN_SINGKAT") {
      let no = parseInt(rawCols[0].trim(), 10) || currentNumber;
      let soal = rawCols[1 + colOffset]?.trim() || "";
      let kunci = rawCols[2 + colOffset]?.trim() || "";
      let kesulitanRaw = rawCols[3 + colOffset]?.trim() || "SEDANG";
      let bobot = 2;

      if (rawCols[4 + colOffset]) {
        bobot = parseFloat(rawCols[4 + colOffset].trim()) || 2;
      }

      let extractedImage: string | undefined = undefined;
      const imgMatch = soal.match(/\[img:([^\]]+)\]/i);
      if (imgMatch) {
        extractedImage = imgMatch[1].trim();
        soal = soal.replace(/\[img:[^\]]+\]/i, "").trim();
      }

      const mappedKesulitan = mapDifficulty(kesulitanRaw);
      const isValid = soal.length > 0 && kunci.length > 0;
      let errorDetail: string | undefined = undefined;
      if (!soal) errorDetail = "Teks pertanyaan isian singkat kosong";
      else if (!kunci) errorDetail = "Kunci jawaban isian singkat kosong";

      parsedQuestions.push({
        nomor: no,
        tipe_soal: "ISIAN_SINGKAT",
        pertanyaan: soal,
        gambar_url: extractedImage,
        opsi: [],
        tingkat_kesulitan: mappedKesulitan,
        kunci_benar: kunci,
        bobot: bobot > 0 ? bobot : 2,
        isValid,
        errorDetail,
      });
      currentNumber++;

      // ========================================================================
      // 6. URAIAN / ESAI
      // ========================================================================
    } else if (detectedType === "URAIAN_ESAI") {
      let no = parseInt(rawCols[0].trim(), 10) || currentNumber;
      let soal = rawCols[1 + colOffset]?.trim() || "";
      let rubrik = rawCols[2 + colOffset]?.trim() || "";
      let kesulitanRaw = rawCols[3 + colOffset]?.trim() || "SEDANG";
      let bobot = 4;

      if (rawCols[4 + colOffset]) {
        bobot = parseFloat(rawCols[4 + colOffset].trim()) || 4;
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
      if (!soal) errorDetail = "Teks pertanyaan esai / uraian kosong";

      parsedQuestions.push({
        nomor: no,
        tipe_soal: "URAIAN_ESAI",
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

/**
 * Generate CSV template string with standard 3 sections (PG, Menjodohkan, Essay).
 * Compatible with Microsoft Excel when using semicolon (;) delimiter.
 */
export function generateCsvTemplate(delimiter: ";" | "," | "\t" = ";"): string {
  const d = delimiter;
  const c = (val: string | number) => formatCsvCell(val, d);

  return `[BAGIAN A: PILIHAN GANDA]
No${d}Soal${d}Pilihan A${d}Pilihan B${d}Pilihan C${d}Pilihan D${d}Pilihan E${d}Tingkat Kesulitan${d}Jawaban Benar${d}Bobot
1${d}Bagian sel yang berfungsi sebagai pusat pengendali kegiatan sel adalah...${d}Sitoplasma${d}Nukleus (Inti Sel)${d}Mitokondria${d}Ribosom${d}Badan Golgi${d}C1${d}B${d}2
2${d}Organel yang bertanggung jawab dalam respirasi sel dan produksi ATP adalah...${d}Mitokondria${d}Kloroplas${d}Lisosom${d}Vakuola${d}Sentriol${d}C2${d}A${d}2
3${d}Manakah pernyataan yang benar mengenai fotosintesis tumbuhan C3 dan C4?${d}C3 lebih hemat air${d}C4 fiksasi CO2 awal oleh PEP karboksilase${d}C3 tidak fotorespirasi${d}C4 fotosintesis malam${d}Semua salah${d}C4${d}B${d}2

[BAGIAN B: MENJODOHKAN]
No${d}Pertanyaan (Premis)${d}Jawaban Benar (Target)${d}Pengecoh${d}Tingkat Kesulitan${d}Bobot
1${d}Fitoplankton & Tumbuhan Hijau${d}Produsen Primer (Autotrof)${d}Konsumen Tersier${d}C2${d}2
2${d}Zooplankton & Herbivora${d}Konsumen Primer (Herbivora)${d}Dekomposer${d}C2${d}2
3${d}Bakteri Pengurai & Fungi${d}Dekomposer / Saprofit${d}Karnivora Puncak${d}C2${d}2

[BAGIAN C: ESSAY]
No${d}Soal Esai${d}Pedoman Penilaian / Kunci Jawaban${d}Tingkat Kesulitan${d}Bobot
1${d}Jelaskan tahapan utama dalam siklus Calvin pada reaksi gelap fotosintesis!${d}${c("Fiksasi CO2 oleh RuBP, Reduksi PGA menjadi PGAL, dan Regenerasi RuBP menggunakan ATP & NADPH")}${d}C4${d}4
2${d}Mengapa fermentasi asam laktat terjadi pada sel otot saat aktivitas fisik berat?${d}${c("Kekurangan suplai oksigen memicu glikolisis anaerob untuk regenerasi NAD+ menghasilkan ATP darurat")}${d}C4${d}4
`;
}

/**
 * Generate Comprehensive Template covering all 6 question types supported by Ruang Pintar CBT
 */
export function generateComprehensiveCsvTemplate(delimiter: ";" | "," | "\t" = ";"): string {
  const d = delimiter;
  const c = (val: string | number) => formatCsvCell(val, d);

  return `[BAGIAN A: PILIHAN GANDA]
No${d}Soal${d}Pilihan A${d}Pilihan B${d}Pilihan C${d}Pilihan D${d}Pilihan E${d}Tingkat Kesulitan${d}Jawaban Benar${d}Bobot
1${d}Bagian sel yang berfungsi sebagai pusat pengendali kegiatan sel adalah...${d}Sitoplasma${d}Nukleus (Inti Sel)${d}Mitokondria${d}Ribosom${d}Badan Golgi${d}C1${d}B${d}2
2${d}Organel yang bertanggung jawab dalam respirasi sel dan produksi ATP adalah...${d}Mitokondria${d}Kloroplas${d}Lisosom${d}Vakuola${d}Sentriol${d}C2${d}A${d}2

[BAGIAN B: PILIHAN GANDA KOMPLEKS]
No${d}Soal${d}Pilihan A${d}Pilihan B${d}Pilihan C${d}Pilihan D${d}Pilihan E${d}Tingkat Kesulitan${d}Jawaban Benar${d}Bobot
1${d}Manakah pernyataan berikut yang benar mengenai karakteristik sel prokariotik?${d}Tidak memiliki membran inti${d}Memiliki mitokondria${d}Materi genetik berada di nukleoid${d}Memiliki dinding sel peptidoglikan${d}Memiliki retikulum endoplasma${d}C4${d}${c("A, C, D")}${d}3

[BAGIAN C: BENAR / SALAH]
No${d}Pernyataan${d}Jawaban Benar${d}Tingkat Kesulitan${d}Bobot
1${d}Dinding sel pada sel tumbuhan tersusun atas zat kitin.${d}SALAH${d}C2${d}1
2${d}Ribosom berperan dalam proses sintesis protein.${d}BENAR${d}C1${d}1

[BAGIAN D: MENJODOHKAN]
No${d}Pertanyaan (Premis Kiri)${d}Jawaban Benar (Target Kanan)${d}Pengecoh${d}Tingkat Kesulitan${d}Bobot
1${d}Fitoplankton & Tumbuhan Hijau${d}Produsen Primer (Autotrof)${d}Konsumen Tersier${d}C2${d}2
2${d}Zooplankton & Herbivora${d}Konsumen Primer (Herbivora)${d}Dekomposer${d}C2${d}2
3${d}Bakteri Pengurai & Fungi${d}Dekomposer / Saprofit${d}Karnivora Puncak${d}C2${d}2

[BAGIAN E: ISIAN SINGKAT]
No${d}Pertanyaan / Soal Isian${d}Kunci Jawaban (Pisahkan Sinonim dengan Koma)${d}Tingkat Kesulitan${d}Bobot
1${d}Organel yang menghasilkan pigmen klorofil untuk fotosintesis adalah...${d}${c("Kloroplas, Plastida")}${d}C1${d}2
2${d}Molekul pembawa energi utama hasil respirasi selular disingkat dengan...${d}ATP${d}C2${d}2

[BAGIAN F: ESSAY]
No${d}Soal Esai${d}Pedoman Penilaian / Kunci Jawaban${d}Tingkat Kesulitan${d}Bobot
1${d}Jelaskan tahapan utama dalam siklus Calvin pada reaksi gelap fotosintesis!${d}${c("Fiksasi CO2 oleh RuBP, Reduksi PGA menjadi PGAL, dan Regenerasi RuBP menggunakan ATP & NADPH")}${d}C4${d}4
2${d}Mengapa fermentasi asam laktat terjadi pada sel otot saat aktivitas fisik berat?${d}${c("Kekurangan suplai oksigen memicu glikolisis anaerob untuk regenerasi NAD+ menghasilkan ATP darurat")}${d}C4${d}4
`;
}

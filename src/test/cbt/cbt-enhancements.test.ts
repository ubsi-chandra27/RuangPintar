import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  parseSpreadsheetText,
  generateCsvTemplate,
} from "@/modules/cbt/infrastructure/cbt-bulk-import-parser";
import { generateQuestionsWithGemini } from "@/modules/cbt/infrastructure/gemini-cbt-ai-service";
import { CbtRepository } from "@/modules/cbt/infrastructure/cbt-repository";
import { prisma } from "@/shared/infrastructure/database/prisma";
import { CbtAccessDeniedError } from "@/modules/cbt/domain/cbt-errors";

describe("M14 CBT Enhancements — Bulk Import, Menjodohkan, Token & AI Agent", () => {
  describe("1. Spreadsheet Bulk Import Parser", () => {
    it("parses spreadsheet text matching user column specification correctly", () => {
      const csvData = `No\tSoal\tPilihan A\tPilihan B\tPilihan C\tPilihan D\tPilihan E\tTingkat Kesulitan Soal (C1/C2/C3)\tJawaban Benar
1\tApa ibu kota Indonesia saat ini?\tJakarta\tNusantara\tBandung\tSurabaya\tMedan\tC1\tB
2\tManakah yang merupakan produsen primer?\tKelinci\tRumput\tElang\tJamur\tSinga\tC2\tB`;

      const questions = parseSpreadsheetText(csvData);
      expect(questions).toHaveLength(2);

      const q1 = questions[0];
      expect(q1.pertanyaan).toBe("Apa ibu kota Indonesia saat ini?");
      expect(q1.tingkat_kesulitan).toBe("MUDAH"); // C1 -> MUDAH
      expect(q1.opsi).toHaveLength(5);
      expect(q1.opsi[1].teks).toBe("Nusantara");
      expect(q1.opsi[1].isCorrect).toBe(true);
      expect(q1.kunci_benar).toBe("B");
      expect(q1.isValid).toBe(true);

      const q2 = questions[1];
      expect(q2.tingkat_kesulitan).toBe("MUDAH"); // C2 -> MUDAH (LOTS)
      expect(q2.kunci_benar).toBe("B");
      expect(q2.isValid).toBe(true);
    });

    it("handles C3-C6 taxonomy mapping accurately", () => {
      const csvData = `No,Soal,Pilihan A,Pilihan B,Pilihan C,Pilihan D,Pilihan E,Tingkat Kesulitan Soal (C1/C2/C3),Jawaban Benar
1,Soal Aplikasi,A,B,C,D,E,C3,A
2,Soal Analisis,A,B,C,D,E,C4,C
3,Soal Evaluasi,A,B,C,D,E,C5,D
4,Soal Kreasi,A,B,C,D,E,C6,E`;

      const questions = parseSpreadsheetText(csvData);
      expect(questions).toHaveLength(4);
      expect(questions[0].tingkat_kesulitan).toBe("SEDANG"); // C3 (MOTS)
      expect(questions[1].tingkat_kesulitan).toBe("SEDANG"); // C4 (MOTS)
      expect(questions[2].tingkat_kesulitan).toBe("HOTS"); // C5 (HOTS)
      expect(questions[3].tingkat_kesulitan).toBe("HOTS"); // C6 (HOTS)
    });

    it("generates a valid downloadable CSV template header with multiple sections", () => {
      const template = generateCsvTemplate();
      expect(template).toContain("[BAGIAN A: PILIHAN GANDA]");
      expect(template).toContain("[BAGIAN B: MENJODOHKAN]");
      expect(template).toContain("[BAGIAN C: ESSAY]");
      expect(template).toContain("Fitoplankton & Tumbuhan Hijau");
    });

    it("parses multi-section spreadsheet (PG, Menjodohkan, and Essay) seamlessly", () => {
      const template = generateCsvTemplate();
      const parsed = parseSpreadsheetText(template);
      expect(parsed.length).toBe(8);

      const pgItems = parsed.filter((q) => q.tipe_soal === "PILIHAN_GANDA");
      const matchItems = parsed.filter((q) => q.tipe_soal === "MENJODOHKAN");
      const essayItems = parsed.filter((q) => q.tipe_soal === "URAIAN_ESAI");

      expect(pgItems).toHaveLength(3);
      expect(matchItems).toHaveLength(3);
      expect(essayItems).toHaveLength(2);
      expect(parsed.every((q) => q.isValid)).toBe(true);
    });
  });

  describe("2. AI Question Generator (Google Gemini & Smart Offline Fallback)", () => {
    it("generates curriculum-aligned questions with correct options and key", async () => {
      const result = await generateQuestionsWithGemini({
        topikMateri: "Ekosistem dan Rantai Makanan",
        mataPelajaran: "Biologi",
        jenjangKelas: "Fase E (Kelas 10)",
        jumlahSoal: 3,
        jenisSoal: "PILIHAN_GANDA",
        tingkatKesulitan: "SEDANG",
      });

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(3);
      result.data.forEach((q) => {
        expect(q.pertanyaan).toBeTruthy();
        expect(q.tingkat_kesulitan).toBe("SEDANG");
        expect(q.opsi).toHaveLength(4);
        expect(q.kunci_jawaban.pilihan_benar).toMatch(/^[A-D]$/);
      });
    });

    it("generates Menjodohkan pairs with proper structure", async () => {
      const result = await generateQuestionsWithGemini({
        topikMateri: "Ibu Kota Negara ASEAN",
        mataPelajaran: "Geografi",
        jenjangKelas: "Fase F (Kelas 11)",
        jumlahSoal: 1,
        jenisSoal: "MENJODOHKAN",
        tingkatKesulitan: "MUDAH",
      });

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      const q = result.data[0];
      expect(q.jenis_soal).toBe("MENJODOHKAN");
      expect(q.pasangan_menjodohkan).toBeDefined();
      expect(q.pasangan_menjodohkan!.length).toBeGreaterThanOrEqual(3);
      expect(q.kunci_jawaban.pasangan).toBeDefined();
    });
  });

  describe("3. Exam Entry Token Verification", () => {
    let repo: CbtRepository;

    beforeEach(() => {
      vi.clearAllMocks();
      repo = new CbtRepository();

      vi.spyOn(prisma, "$transaction").mockImplementation(async (cb: any) => {
        if (typeof cb === "function") return cb(prisma);
        return cb;
      });
    });

    it("rejects attempt start when token is required but wrong token is submitted", async () => {
      vi.spyOn(prisma.ujianCbt, "findUnique").mockResolvedValue({
        id: "UJIAN_TOKEN_1",
        sekolah_id: "SEKOLAH_1",
        status: "DITERBITKAN",
        durasi_menit: 60,
        gunakan_token: true,
        token_masuk: "KRYZQA",
        waktu_mulai: new Date(Date.now() - 10000),
        waktu_selesai: new Date(Date.now() + 60000),
        maksimal_attempt: 1,
        penugasan_mengajar: {
          rombel: { nama: "X-A" },
          mata_pelajaran: { nama: "Biologi" },
        },
      } as any);

      vi.spyOn(prisma.siswa, "findUnique").mockResolvedValue({
        id: "SISWA_1",
        sekolah_id: "SEKOLAH_1",
      } as any);

      vi.spyOn(prisma.sesiUjianSiswa, "findMany").mockResolvedValue([]);

      await expect(
        repo.startOrResumeAttempt("UJIAN_TOKEN_1", "SISWA_1", { tokenInput: "WRONGTOKEN" })
      ).rejects.toThrow(CbtAccessDeniedError);
    });
  });

  describe("4. Menjodohkan Proportional Scoring Engine", () => {
    let repo: CbtRepository;

    beforeEach(() => {
      vi.clearAllMocks();
      repo = new CbtRepository();

      vi.spyOn(prisma, "$transaction").mockImplementation(async (cb: any) => {
        if (typeof cb === "function") return cb(prisma);
        return cb;
      });
    });

    it("calculates partial credit proportionally for matching questions (e.g. 2 out of 3 correct = 66.7%)", async () => {
      const mockSessionId = "01J_MENJODOHKAN_TEST";
      const futureDeadline = new Date(Date.now() + 60000);

      const kunciPenilaian = [
        {
          soal_id: "SOAL_MATCH_1",
          nomor_urut: 1,
          tipe_soal: "MENJODOHKAN",
          bobot: 30,
          kunci_jawaban: {
            pasangan: {
              "1": "Nusantara (IKN)",
              "2": "Rupiah",
              "3": "Indonesia Raya",
            },
          },
        },
      ];

      vi.spyOn(prisma.sesiUjianSiswa, "findUnique").mockResolvedValue({
        id: mockSessionId,
        ujian_cbt_id: "UJIAN_MATCH",
        snapshot_ujian_id: "SNAP_MATCH",
        siswa_id: "SISWA_MATCH",
        sekolah_id: "SEKOLAH_1",
        status: "SEDANG_MENGERJAKAN",
        waktu_mulai: new Date(),
        batas_waktu_server: futureDeadline,
        snapshot: {
          id: "SNAP_MATCH",
          kunci_penilaian: JSON.stringify(kunciPenilaian),
        },
        ujian_cbt: {
          id: "UJIAN_MATCH",
          kkm_kktp: 60,
        },
        siswa: {
          id: "SISWA_MATCH",
          nama_lengkap: "Siswa Menjodohkan",
          nis: "12348",
        },
        jawaban_siswa: [
          {
            id: "J_MATCH_1",
            soal_id: "SOAL_MATCH_1",
            // Student got premise 1 & 2 correct, but premise 3 incorrect
            jawaban_peserta: JSON.stringify({
              jawaban_menjodohkan: {
                "1": "Nusantara (IKN)",
                "2": "Rupiah",
                "3": "Maju Tak Gentar",
              },
            }),
          },
        ],
      } as any);

      vi.spyOn(prisma.jawabanSiswa, "update").mockResolvedValue({} as any);
      vi.spyOn(prisma.sesiUjianSiswa, "update").mockResolvedValue({} as any);
      vi.spyOn(prisma.hasilUjianCbt, "upsert").mockImplementation(((args: any) =>
        Promise.resolve({
          id: "HASIL_MATCH",
          ...args.create,
        })) as any);

      const hasil = await repo.submitAttempt(mockSessionId);

      // 2 out of 3 matched = (2/3) * 30 = 20 points out of 30 max = 66.7%
      expect(hasil.skor_mentah).toBe(20);
      expect(hasil.skor_maksimal).toBe(30);
      expect(hasil.nilai_akhir).toBe(66.7);
      expect(hasil.apakah_tuntas).toBe(true); // KKTP is 60, score is 66.7
    });
  });
});

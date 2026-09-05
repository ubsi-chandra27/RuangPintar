import { describe, it, expect, vi, beforeEach } from "vitest";
import { CbtRepository } from "@/modules/cbt/infrastructure/cbt-repository";
import { prisma } from "@/shared/infrastructure/database/prisma";

describe("M14 CBT Auto-Grading & Scoring Engine Invariants", () => {
  let repo: CbtRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repo = new CbtRepository();

    // Mock prisma.$transaction to simply execute the callback with prisma
    vi.spyOn(prisma, "$transaction").mockImplementation(async (cb: any) => {
      if (typeof cb === "function") {
        return cb(prisma);
      }
      return cb;
    });
  });

  const mockSessionId = "01J000000000000000SESSI001";
  const mockUjianId = "01J00000000000000000UJIAN1";
  const mockSnapshotId = "01J00000000000000SNAPSHOT1";
  const mockSiswaId = "01J00000000000000000SISWA1";

  it("calculates 100% score for all correct answers and sets status apakah_tuntas true", async () => {
    const futureDeadline = new Date(Date.now() + 60000);

    const kunciPenilaian = [
      {
        soal_id: "S1",
        nomor_urut: 1,
        tipe_soal: "PILIHAN_GANDA",
        bobot: 10,
        kunci_jawaban: ["B"],
      },
      {
        soal_id: "S2",
        nomor_urut: 2,
        tipe_soal: "PILIHAN_GANDA_KOMPLEKS",
        bobot: 10,
        kunci_jawaban: ["A", "C"],
      },
      {
        soal_id: "S3",
        nomor_urut: 3,
        tipe_soal: "ISIAN_SINGKAT",
        bobot: 10,
        kunci_jawaban: ["Fotosintesis"],
      },
    ];

    vi.spyOn(prisma.sesiUjianSiswa, "findUnique").mockResolvedValue({
      id: mockSessionId,
      ujian_cbt_id: mockUjianId,
      snapshot_ujian_id: mockSnapshotId,
      siswa_id: mockSiswaId,
      sekolah_id: "SEKOLAH_1",
      status: "SEDANG_MENGERJAKAN",
      waktu_mulai: new Date(),
      batas_waktu_server: futureDeadline,
      snapshot: {
        id: mockSnapshotId,
        kunci_penilaian: JSON.stringify(kunciPenilaian),
      },
      ujian_cbt: {
        id: mockUjianId,
        kkm_kktp: 75,
      },
      siswa: {
        id: mockSiswaId,
        nama_lengkap: "Siswa Berprestasi",
        nis: "12345",
      },
      jawaban_siswa: [
        {
          id: "J1",
          soal_id: "S1",
          jawaban_peserta: JSON.stringify(["B"]),
        },
        {
          id: "J2",
          soal_id: "S2",
          jawaban_peserta: JSON.stringify(["C", "A"]),
        },
        {
          id: "J3",
          soal_id: "S3",
          jawaban_peserta: JSON.stringify(["Fotosintesis"]),
        },
      ],
    } as any);

    vi.spyOn(prisma.jawabanSiswa, "update").mockResolvedValue({} as any);
    vi.spyOn(prisma.sesiUjianSiswa, "update").mockResolvedValue({} as any);
    vi.spyOn(prisma.hasilUjianCbt, "upsert").mockImplementation(((args: any) =>
      Promise.resolve({
        id: "HASIL_1",
        ...args.create,
      })) as any);

    const hasil = await repo.submitAttempt(mockSessionId);

    expect(hasil.jumlah_benar).toBe(3);
    expect(hasil.jumlah_salah).toBe(0);
    expect(hasil.skor_mentah).toBe(30);
    expect(hasil.skor_maksimal).toBe(30);
    expect(hasil.nilai_akhir).toBe(100);
    expect(hasil.apakah_tuntas).toBe(true);
  });

  it("calculates partial score and marks apakah_tuntas false if score < KKTP", async () => {
    const futureDeadline = new Date(Date.now() + 60000);

    const kunciPenilaian = [
      {
        soal_id: "S1",
        nomor_urut: 1,
        tipe_soal: "PILIHAN_GANDA",
        bobot: 10,
        kunci_jawaban: ["B"],
      },
      {
        soal_id: "S2",
        nomor_urut: 2,
        tipe_soal: "PILIHAN_GANDA",
        bobot: 10,
        kunci_jawaban: ["A"],
      },
    ];

    vi.spyOn(prisma.sesiUjianSiswa, "findUnique").mockResolvedValue({
      id: mockSessionId,
      ujian_cbt_id: mockUjianId,
      snapshot_ujian_id: mockSnapshotId,
      siswa_id: mockSiswaId,
      sekolah_id: "SEKOLAH_1",
      status: "SEDANG_MENGERJAKAN",
      waktu_mulai: new Date(),
      batas_waktu_server: futureDeadline,
      snapshot: {
        id: mockSnapshotId,
        kunci_penilaian: JSON.stringify(kunciPenilaian),
      },
      ujian_cbt: {
        id: mockUjianId,
        kkm_kktp: 75,
      },
      siswa: {
        id: mockSiswaId,
        nama_lengkap: "Siswa Belum Tuntas",
        nis: "12346",
      },
      jawaban_siswa: [
        {
          id: "J1",
          soal_id: "S1",
          jawaban_peserta: JSON.stringify(["B"]), // Benar 10
        },
        {
          id: "J2",
          soal_id: "S2",
          jawaban_peserta: JSON.stringify(["D"]), // Salah 0
        },
      ],
    } as any);

    vi.spyOn(prisma.jawabanSiswa, "update").mockResolvedValue({} as any);
    vi.spyOn(prisma.sesiUjianSiswa, "update").mockResolvedValue({} as any);
    vi.spyOn(prisma.hasilUjianCbt, "upsert").mockImplementation(((args: any) =>
      Promise.resolve({
        id: "HASIL_2",
        ...args.create,
      })) as any);

    const hasil = await repo.submitAttempt(mockSessionId);

    expect(hasil.jumlah_benar).toBe(1);
    expect(hasil.jumlah_salah).toBe(1);
    expect(hasil.nilai_akhir).toBe(50);
    expect(hasil.apakah_tuntas).toBe(false);
  });

  it("handles empty answers gracefully with 0 points", async () => {
    const futureDeadline = new Date(Date.now() + 60000);

    const kunciPenilaian = [
      {
        soal_id: "S1",
        nomor_urut: 1,
        tipe_soal: "PILIHAN_GANDA",
        bobot: 10,
        kunci_jawaban: ["A"],
      },
    ];

    vi.spyOn(prisma.sesiUjianSiswa, "findUnique").mockResolvedValue({
      id: mockSessionId,
      ujian_cbt_id: mockUjianId,
      snapshot_ujian_id: mockSnapshotId,
      siswa_id: mockSiswaId,
      sekolah_id: "SEKOLAH_1",
      status: "SEDANG_MENGERJAKAN",
      waktu_mulai: new Date(),
      batas_waktu_server: futureDeadline,
      snapshot: {
        id: mockSnapshotId,
        kunci_penilaian: JSON.stringify(kunciPenilaian),
      },
      ujian_cbt: {
        id: mockUjianId,
        kkm_kktp: 75,
      },
      siswa: {
        id: mockSiswaId,
        nama_lengkap: "Siswa Kosong",
        nis: "12347",
      },
      jawaban_siswa: [], // no answers provided
    } as any);

    vi.spyOn(prisma.jawabanSiswa, "update").mockResolvedValue({} as any);
    vi.spyOn(prisma.sesiUjianSiswa, "update").mockResolvedValue({} as any);
    vi.spyOn(prisma.hasilUjianCbt, "upsert").mockImplementation(((args: any) =>
      Promise.resolve({
        id: "HASIL_3",
        ...args.create,
      })) as any);

    const hasil = await repo.submitAttempt(mockSessionId);

    expect(hasil.jumlah_kosong).toBe(1);
    expect(hasil.jumlah_benar).toBe(0);
    expect(hasil.nilai_akhir).toBe(0);
    expect(hasil.apakah_tuntas).toBe(false);
  });
});

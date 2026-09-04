import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

type NormalEntry = {
  rombel: string;
  slot: number;
  mapel: string;
  kode_guru: string;
};

type PracticalBlock = {
  rombel: string;
  slot_mulai: number;
  slot_selesai: number;
  deskripsi: string;
};

type SourceData = {
  metadata: { sekolah: string; tahun_ajaran: string; tanggal_dokumen: string };
  guru: Array<{ kode: number; nama_lengkap: string }>;
  rombel: Array<{ nama: string; kode_guru_wali: number }>;
  hari: Record<string, { entries: NormalEntry[]; praktik: PracticalBlock[] }>;
};

const sourcePath = path.resolve(process.cwd(), "scripts/data/jadwal-otomindo-2026-2027.json");
const source = JSON.parse(readFileSync(sourcePath, "utf8")) as SourceData;
const expectedPeriods: Record<string, number> = {
  SENIN: 10,
  SELASA: 10,
  RABU: 11,
  KAMIS: 10,
  JUMAT: 7,
};

describe("Sumber jadwal riil SMK OTOMINDO 2026/2027", () => {
  it("memuat identitas dokumen, 38 guru, 21 rombel, dan 21 wali kelas", () => {
    expect(source.metadata).toMatchObject({
      sekolah: "SMK OTOMINDO",
      tahun_ajaran: "2026/2027",
      tanggal_dokumen: "2026-08-19",
    });
    expect(source.guru).toHaveLength(38);
    expect(source.rombel).toHaveLength(21);
    expect(new Set(source.guru.map((teacher) => teacher.kode))).toEqual(
      new Set(Array.from({ length: 38 }, (_, index) => index + 1))
    );
    expect(new Set(source.rombel.map((classGroup) => classGroup.nama)).size).toBe(21);
    expect(
      source.rombel.every(
        (classGroup) => classGroup.kode_guru_wali >= 1 && classGroup.kode_guru_wali <= 38
      )
    ).toBe(true);
  });

  it("membentuk matriks penuh 1.008 sel jadwal tanpa slot rombel ganda", () => {
    const resourceKeys = new Set<string>();
    const perClassDay = new Map<string, number>();
    let totalCells = 0;

    for (const [day, dayData] of Object.entries(source.hari)) {
      for (const entry of dayData.entries) {
        const key = `${day}|${entry.slot}|${entry.rombel}`;
        expect(resourceKeys.has(key)).toBe(false);
        resourceKeys.add(key);
        perClassDay.set(
          `${day}|${entry.rombel}`,
          (perClassDay.get(`${day}|${entry.rombel}`) ?? 0) + 1
        );
        totalCells += 1;
      }

      for (const block of dayData.praktik) {
        expect(block.deskripsi).not.toBe("");
        for (let slot = block.slot_mulai; slot <= block.slot_selesai; slot += 1) {
          const key = `${day}|${slot}|${block.rombel}`;
          expect(resourceKeys.has(key)).toBe(false);
          resourceKeys.add(key);
          perClassDay.set(
            `${day}|${block.rombel}`,
            (perClassDay.get(`${day}|${block.rombel}`) ?? 0) + 1
          );
          totalCells += 1;
        }
      }
    }

    expect(totalCells).toBe(1008);
    for (const day of Object.keys(expectedPeriods)) {
      for (const classGroup of source.rombel) {
        expect(perClassDay.get(`${day}|${classGroup.nama}`)).toBe(expectedPeriods[day]);
      }
    }
  });

  it("hanya memakai kode guru yang tersedia pada daftar sumber", () => {
    const teacherCodes = new Set(source.guru.map((teacher) => teacher.kode));
    for (const dayData of Object.values(source.hari)) {
      for (const entry of dayData.entries) {
        expect(entry.mapel).not.toBe("");
        for (const code of entry.kode_guru.split("/").map(Number)) {
          expect(teacherCodes.has(code)).toBe(true);
        }
      }
    }
  });
});

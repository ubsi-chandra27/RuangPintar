import { describe, it, expect } from "vitest";
import { extractStudentsFromClassPhoto } from "@/modules/ai-assistant/infrastructure/gemini-vision-service";

describe("Gemini Vision Service (Photo-to-Class Extractor)", () => {
  it("harus dapat mengekstrak daftar siswa dari foto menggunakan Smart Fallback Parser saat offline/test", async () => {
    const fakeBase64 = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP...";
    const result = await extractStudentsFromClassPhoto({
      imageBase64: fakeBase64,
      namaKelasHint: "X MIPA 2",
      mataPelajaranHint: "Fisika",
    });

    expect(result).toBeDefined();
    expect(result.nama_kelas).toBe("X MIPA 2");
    expect(result.mata_pelajaran).toBe("Fisika");
    expect(result.siswa.length).toBeGreaterThan(15);
    expect(result.total_terdeteksi).toBe(result.siswa.length);
    expect(result.confidence_score).toBeGreaterThan(0.8);

    // Verifikasi struktur tiap siswa
    const firstStudent = result.siswa[0];
    expect(firstStudent.nama_lengkap).toBeDefined();
    expect(firstStudent.nis).toBeDefined();
    expect(["L", "P"]).toContain(firstStudent.jenis_kelamin);
  });

  it("harus menggunakan hint nama kelas bawaan jika hint tidak disertakan", async () => {
    const result = await extractStudentsFromClassPhoto({
      imageBase64: "fake_base64_string",
    });

    expect(result.nama_kelas).toBe("Kelas X-1");
    expect(result.mata_pelajaran).toBe("Mata Pelajaran Umum");
    expect(result.siswa.length).toBeGreaterThan(0);
  });
});

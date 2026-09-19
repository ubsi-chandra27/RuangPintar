/**
 * Ruang Pintar — Smart Onboarding & AI Class Setup Service (M21)
 *
 * Mengatur alur registrasi guru mandiri (SaaS), pemindaian foto AI,
 * dan penerbitan rombel + siswa secara otomatis dengan konfirmasi guru (Human-in-the-Loop).
 */

import { prisma } from "@/shared/infrastructure/database/prisma";
import { generateUlid } from "@/shared/lib/ulid";
import { hashPassword } from "@/shared/lib/password";
import {
  generateSessionToken,
  hashSessionToken,
  SESSION_DURATION_STANDARD_MS,
} from "@/shared/lib/session";
import {
  SmartOnboardingRegistrationDTO,
  ConfirmClassCreationDTO,
  ClassExtractionResult,
  TeacherTrialStatusDTO,
} from "../domain/ai-types";
import {
  UserRegistrationError,
  TrialExpiredError,
  RombelQuotaExceededError,
} from "../domain/ai-errors";
import { extractStudentsFromClassPhoto } from "../infrastructure/gemini-vision-service";

const MAX_FREE_ROMBEL_QUOTA = 5;
const TRIAL_DURATION_DAYS = 30;

export class SmartOnboardingService {
  /**
   * 1. Registrasi Guru Mandiri (Self-Service 4-Column Signup)
   */
  async registerTeacher(dto: SmartOnboardingRegistrationDTO): Promise<{
    user: { id: string; username: string; email: string; nama_lengkap: string };
    sekolah: { id: string; nama: string };
    rawSessionToken: string;
  }> {
    // Validasi duplikasi email / username
    const normalizedEmail = dto.email.trim().toLowerCase();
    const existingEmail = await prisma.pengguna.findFirst({
      where: { email: normalizedEmail },
    });

    if (existingEmail) {
      throw new UserRegistrationError(
        "Email sudah terdaftar. Silakan gunakan email lain atau login."
      );
    }

    // Buat username ramah dari input pengguna atau email
    const requestedUsername = dto.username
      ?.trim()
      .toLowerCase()
      .replace(/[^a-zA-Z0-9_]/g, "");
    if (requestedUsername) {
      const existingUser = await prisma.pengguna.findUnique({
        where: { username: requestedUsername },
      });
      if (existingUser) {
        throw new UserRegistrationError(
          "Username tersebut sudah digunakan. Silakan pilih username lain."
        );
      }
    }

    const baseUsername =
      requestedUsername ||
      normalizedEmail
        .split("@")[0]
        .replace(/[^a-zA-Z0-9_]/g, "_")
        .substring(0, 20);
    let username = baseUsername;
    let counter = 1;
    while (await prisma.pengguna.findUnique({ where: { username } })) {
      username = `${baseUsername}_${counter++}`;
    }

    const schoolId = generateUlid();
    const userId = generateUlid();
    const teacherId = generateUlid();
    const tahunAjaranId = generateUlid();
    const semesterId = generateUlid();
    const passwordHash = await hashPassword(dto.password);

    const trialEndsAt = new Date(Date.now() + TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000);

    // Jalankan pembuatan data instan dalam 1 transaksi
    await prisma.$transaction(async (tx) => {
      // a. Buat Sekolah Baru untuk Guru Tersebut
      await tx.sekolah.create({
        data: {
          id: schoolId,
          nama: dto.nama_sekolah.trim(),
          jenjang: "SMA",
          alamat: "Indonesia",
          email: normalizedEmail,
          tipe_lisensi: "FREEMIUM",
          trial_berakhir_pada: trialEndsAt,
          status_aktif: true,
        },
      });

      // b. Buat Tahun Ajaran & Semester Aktif Bawaan
      await tx.tahunAjaran.create({
        data: {
          id: tahunAjaranId,
          sekolah_id: schoolId,
          nama: "2026/2027",
          kode: "TA-2026-2027",
          tanggal_mulai: new Date("2026-07-01"),
          tanggal_selesai: new Date("2027-06-30"),
          status: "AKTIF",
        },
      });

      await tx.semester.create({
        data: {
          id: semesterId,
          sekolah_id: schoolId,
          tahun_ajaran_id: tahunAjaranId,
          nama: "Semester Ganjil",
          kode: "GANJIL",
          urutan: 1,
          tanggal_mulai: new Date("2026-07-01"),
          tanggal_selesai: new Date("2026-12-31"),
          status: "AKTIF",
        },
      });

      // c. Buat Akun Pengguna (Role: TEACHER)
      await tx.pengguna.create({
        data: {
          id: userId,
          sekolah_id: schoolId,
          username,
          email: normalizedEmail,
          no_telepon: dto.no_telepon?.trim() || null,
          password_hash: passwordHash,
          nama_lengkap: dto.nama_lengkap.trim(),
          peran_dasar: "TEACHER",
          status_akun: "AKTIF",
          tipe_lisensi: "FREEMIUM",
          trial_berakhir_pada: trialEndsAt,
        },
      });

      // d. Buat Entitas Guru
      await tx.guru.create({
        data: {
          id: teacherId,
          sekolah_id: schoolId,
          pengguna_id: userId,
          nama_lengkap: dto.nama_lengkap.trim(),
          jenis_kelamin: "L",
          status_kepegawaian: "TETAP",
          status_aktif: true,
        },
      });

      // e. Preferensi Notifikasi Default
      await tx.preferensiNotifikasi.create({
        data: {
          id: generateUlid(),
          pengguna_id: userId,
          in_app_aktif: true,
          whatsapp_aktif: true,
          email_aktif: true,
        },
      });
    });

    // Buat token sesi login instan
    const rawSessionToken = generateSessionToken();
    const hashedSessionToken = hashSessionToken(rawSessionToken);

    await prisma.sesiPengguna.create({
      data: {
        id: generateUlid(),
        pengguna_id: userId,
        token_hash: hashedSessionToken,
        ip_address: "127.0.0.1",
        user_agent: "Ruang Pintar Self-Service Onboarding",
        berlaku_sampai: new Date(Date.now() + SESSION_DURATION_STANDARD_MS),
      },
    });

    return {
      user: {
        id: userId,
        username,
        email: normalizedEmail,
        nama_lengkap: dto.nama_lengkap.trim(),
      },
      sekolah: {
        id: schoolId,
        nama: dto.nama_sekolah.trim(),
      },
      rawSessionToken,
    };
  }

  /**
   * 2. Pindai Foto Lembar Absensi Menggunakan Gemini Vision AI
   */
  async processClassPhotoWithAi(params: {
    userId: string;
    sekolahId: string;
    imageBase64: string;
    mimeType?: string;
    namaKelasHint?: string;
    mataPelajaranHint?: string;
  }): Promise<ClassExtractionResult> {
    // Validasi masa uji coba & kuota kelas
    const trialStatus = await this.getTeacherTrialStatus(params.userId, params.sekolahId);
    if (trialStatus.is_expired) {
      throw new TrialExpiredError();
    }
    if (!trialStatus.can_create_rombel) {
      throw new RombelQuotaExceededError();
    }

    // Panggil Engine Vision
    const extraction = await extractStudentsFromClassPhoto({
      imageBase64: params.imageBase64,
      mimeType: params.mimeType,
      namaKelasHint: params.namaKelasHint,
      mataPelajaranHint: params.mataPelajaranHint,
    });

    // Simpan draft riwayat di database untuk audit trail
    const requestId = generateUlid();
    await prisma.permintaanSetupKelasAi.create({
      data: {
        id: requestId,
        sekolah_id: params.sekolahId,
        pengguna_id: params.userId,
        nama_kelas: extraction.nama_kelas,
        mata_pelajaran: extraction.mata_pelajaran || null,
        foto_url: params.imageBase64.substring(0, 100) + "...(base64)",
        hasil_ekstraksi_json: JSON.stringify(extraction.siswa),
        status: "DRAFT",
      },
    });

    return {
      ...extraction,
      requestId,
    };
  }

  /**
   * 3. Konfirmasi Guru & Penerbitan Kelas + Siswa (Human-in-the-Loop)
   */
  async confirmAndCreateClass(
    userId: string,
    sekolahId: string,
    dto: ConfirmClassCreationDTO
  ): Promise<{
    rombelId: string;
    namaRombel: string;
    totalSiswa: number;
    mataPelajaran: string;
  }> {
    // Cek kuota
    const trialStatus = await this.getTeacherTrialStatus(userId, sekolahId);
    if (trialStatus.is_expired) {
      throw new TrialExpiredError();
    }
    if (!trialStatus.can_create_rombel) {
      throw new RombelQuotaExceededError();
    }

    const guru = await prisma.guru.findFirst({
      where: { pengguna_id: userId, sekolah_id: sekolahId },
    });
    if (!guru) {
      throw new Error("Entitas guru tidak ditemukan untuk akun ini.");
    }

    // Ambil tahun ajaran & semester aktif
    const tahunAjaran = await prisma.tahunAjaran.findFirst({
      where: { sekolah_id: sekolahId, status: "AKTIF" },
    });
    const semester = await prisma.semester.findFirst({
      where: { sekolah_id: sekolahId, status: "AKTIF" },
    });

    if (!tahunAjaran || !semester) {
      throw new Error("Tahun ajaran atau semester aktif sekolah belum siap.");
    }

    const rombelId = generateUlid();
    const mapelId = generateUlid();

    await prisma.$transaction(async (tx) => {
      // a. Dapatkan / Buat Fase Kurikulum Merdeka
      const kodeFase = "FASE_" + (dto.tingkat_kelas === "10" ? "E" : "F");
      let fase = await tx.fase.findFirst({
        where: { sekolah_id: sekolahId, kode: kodeFase },
      });
      if (!fase) {
        fase = await tx.fase.create({
          data: {
            id: generateUlid(),
            sekolah_id: sekolahId,
            kode: kodeFase,
            nama: `Fase ${dto.tingkat_kelas === "10" ? "E" : "F"}`,
          },
        });
      }

      // b. Dapatkan / Buat Tingkat Kelas
      let tingkat = await tx.tingkatKelas.findFirst({
        where: { sekolah_id: sekolahId, kode: dto.tingkat_kelas },
      });
      if (!tingkat) {
        tingkat = await tx.tingkatKelas.create({
          data: {
            id: generateUlid(),
            sekolah_id: sekolahId,
            fase_id: fase.id,
            kode: dto.tingkat_kelas,
            nama: `Tingkat ${dto.tingkat_kelas}`,
            urutan: parseInt(dto.tingkat_kelas, 10) || 10,
          },
        });
      }

      // c. Buat Rombongan Belajar (Kelas)
      await tx.rombel.create({
        data: {
          id: rombelId,
          sekolah_id: sekolahId,
          tahun_ajaran_id: tahunAjaran.id,
          tingkat_id: tingkat.id,
          fase_id: fase.id,
          nama: dto.nama_kelas.trim(),
          kapasitas: Math.max(dto.siswa.length + 5, 40),
          status: "AKTIF",
        },
      });

      // d. Dapatkan / Buat Mata Pelajaran
      const cleanMapelName = dto.mata_pelajaran.trim();
      let mapel = await tx.mataPelajaran.findFirst({
        where: { sekolah_id: sekolahId, nama: cleanMapelName },
      });
      if (!mapel) {
        mapel = await tx.mataPelajaran.create({
          data: {
            id: mapelId,
            sekolah_id: sekolahId,
            kode: cleanMapelName.substring(0, 6).toUpperCase().replace(/\s+/g, ""),
            nama: cleanMapelName,
            kelompok: "UMUM",
            status_aktif: true,
            status_lifecycle: "AKTIF",
          },
        });
      }

      // e. Buat Penugasan Mengajar untuk Guru ini pada Rombel & Mapel ini
      await tx.penugasanMengajar.create({
        data: {
          id: generateUlid(),
          sekolah_id: sekolahId,
          guru_id: guru.id,
          mata_pelajaran_id: mapel.id,
          tahun_ajaran_id: tahunAjaran.id,
          semester_id: semester.id,
          rombel_id: rombelId,
          jumlah_jam_minggu: 3,
          status: "AKTIF",
        },
      });

      // f. Masukkan Seluruh Siswa Hasil Ekstraksi
      for (let i = 0; i < dto.siswa.length; i++) {
        const s = dto.siswa[i];
        const studentId = generateUlid();
        const enrollmentId = generateUlid();
        const nis = s.nis || `${tingkat.kode}${String(i + 1).padStart(3, "0")}`;

        await tx.siswa.create({
          data: {
            id: studentId,
            sekolah_id: sekolahId,
            nama_lengkap: s.nama_lengkap.trim(),
            nis,
            nisn: s.nisn || null,
            jenis_kelamin: s.jenis_kelamin === "P" ? "P" : "L",
            status_akademik: "AKTIF",
          },
        });

        await tx.keikutsertaanSiswa.create({
          data: {
            id: enrollmentId,
            sekolah_id: sekolahId,
            siswa_id: studentId,
            tahun_ajaran_id: tahunAjaran.id,
            tingkat_id: tingkat.id,
            status: "AKTIF",
          },
        });

        await tx.penempatanRombel.create({
          data: {
            id: generateUlid(),
            sekolah_id: sekolahId,
            keikutsertaan_id: enrollmentId,
            rombel_id: rombelId,
            nomor_absen: i + 1,
            status: "AKTIF",
          },
        });
      }

      // g. Jika ada requestId, perbarui status permintaan AI
      if (dto.requestId) {
        await tx.permintaanSetupKelasAi.updateMany({
          where: { id: dto.requestId, sekolah_id: sekolahId },
          data: {
            status: "DISETUJUI",
            rombel_id_hasil: rombelId,
          },
        });
      }
    });

    return {
      rombelId,
      namaRombel: dto.nama_kelas.trim(),
      totalSiswa: dto.siswa.length,
      mataPelajaran: dto.mata_pelajaran.trim(),
    };
  }

  /**
   * 4. Periksa Status Uji Coba Guru (Trial Status & Quota)
   */
  async getTeacherTrialStatus(userId: string, sekolahId: string): Promise<TeacherTrialStatusDTO> {
    const school = await prisma.sekolah.findUnique({
      where: { id: sekolahId },
      select: { tipe_lisensi: true, trial_berakhir_pada: true },
    });

    const isTrial = school?.tipe_lisensi === "FREEMIUM";
    const trialEndsAt = school?.trial_berakhir_pada || null;

    let daysRemaining = TRIAL_DURATION_DAYS;
    let isExpired = false;

    if (trialEndsAt) {
      const msLeft = trialEndsAt.getTime() - Date.now();
      daysRemaining = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));
      isExpired = msLeft <= 0;
    }

    const currentRombelCount = await prisma.rombel.count({
      where: { sekolah_id: sekolahId, status: "AKTIF" },
    });

    const canCreateRombel = !isExpired && (!isTrial || currentRombelCount < MAX_FREE_ROMBEL_QUOTA);

    return {
      is_trial: isTrial,
      tipe_lisensi: (school?.tipe_lisensi as any) || "FREEMIUM",
      days_remaining: daysRemaining,
      trial_berakhir_pada: trialEndsAt ? trialEndsAt.toISOString() : null,
      max_rombel: MAX_FREE_ROMBEL_QUOTA,
      current_rombel_count: currentRombelCount,
      can_create_rombel: canCreateRombel,
      is_expired: isExpired,
    };
  }
}

export const smartOnboardingService = new SmartOnboardingService();

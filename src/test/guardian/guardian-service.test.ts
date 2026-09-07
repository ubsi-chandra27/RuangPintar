import { describe, it, expect, vi, beforeEach } from "vitest";
import { GuardianService } from "@/modules/guardian/application/guardian-service";
import { GuardianRepository } from "@/modules/guardian/infrastructure/guardian-repository";
import { AuthenticatedUser } from "@/shared/infrastructure/auth/auth-service";
import {
  ChildNotLinkedError,
  GuardianNotFoundError,
  PengajuanWaliValidationError,
  UnauthorizedGuardianActionError,
  UnverifiedRelationshipError,
} from "@/modules/guardian/domain/guardian-errors";

vi.mock("@/shared/infrastructure/audit/audit-logger", () => ({
  recordAuditEvent: vi.fn().mockResolvedValue({ id: "AUDIT_01" }),
}));

describe("M15 Guardian & Family — GuardianService", () => {
  let mockRepo: any;
  let service: GuardianService;

  const mockGuardianUser: AuthenticatedUser = {
    id: "USER_GUARDIAN_01",
    sekolah_id: "SCH_01",
    username: "wali_santoso",
    email: "santoso@example.com",
    nama_lengkap: "Santoso Pratama, S.T.",
    peran_dasar: "GUARDIAN",
    status_akun: "AKTIF",
    harus_ganti_password: false,
  };

  const mockTeacherUser: AuthenticatedUser = {
    id: "USER_TEACHER_01",
    sekolah_id: "SCH_01",
    username: "guru_andi",
    email: "andi@example.com",
    nama_lengkap: "Andi Setiawan, S.Pd.",
    peran_dasar: "TEACHER",
    status_akun: "AKTIF",
    harus_ganti_password: false,
  };

  const mockGuardianProfile = {
    id: "WALI_01",
    sekolah_id: "SCH_01",
    pengguna_id: "USER_GUARDIAN_01",
    nama_lengkap: "Santoso Pratama, S.T.",
    jenis_kelamin: "L",
    no_telepon: "081234567890",
    email: "santoso@example.com",
    pekerjaan: "Konsultan IT",
    penghasilan: "Rp 15jt - Rp 25jt",
    alamat: "Bandung",
  };

  const mockChildren = [
    {
      siswa_id: "STUDENT_01",
      nama_lengkap: "Rian Pratama",
      nis: "20261001",
      nisn: "0081234567",
      rombel_nama: "X RPL",
      tingkat_kelas: "Kelas X",
      jenis_kelamin: "L",
      foto_url: null,
      jenis_hubungan: "AYAH" as const,
      apakah_wali_utama: true,
      status_verifikasi: "TERVERIFIKASI" as const,
    },
    {
      siswa_id: "STUDENT_02",
      nama_lengkap: "Nadia Pratama",
      nis: "20261099",
      nisn: "0088776655",
      rombel_nama: "X DKV 1",
      tingkat_kelas: "Kelas X",
      jenis_kelamin: "P",
      foto_url: null,
      jenis_hubungan: "AYAH" as const,
      apakah_wali_utama: true,
      status_verifikasi: "TERVERIFIKASI" as const,
    },
  ];

  beforeEach(() => {
    mockRepo = {
      getGuardianProfileByUserId: vi.fn().mockResolvedValue(mockGuardianProfile),
      getGuardianById: vi.fn().mockResolvedValue(mockGuardianProfile),
      getLinkedChildren: vi.fn().mockResolvedValue(mockChildren),
      assertVerifiedRelationship: vi.fn().mockResolvedValue(undefined),
      getActiveChildContext: vi.fn().mockResolvedValue({
        siswa: mockChildren[0],
        sekolah_nama: "SMK OTOMINDO",
        tahun_ajaran_aktif: "2026/2027",
        semester_aktif: "Semester Ganjil",
        wali_kelas: {
          guru_id: "GURU_01",
          nama_lengkap: "Pak Guru Homeroom",
          email: "guru@example.com",
          no_telepon: "0812345678",
          foto_url: null,
        },
      }),
      getChildAttendanceRecap: vi.fn().mockResolvedValue({
        total_sesi: 20,
        hadir: 19,
        sakit: 1,
        izin: 0,
        alpa: 0,
        persentase_kehadiran: 95,
        kategori_kehadiran: "Sangat Baik",
      }),
      getChildAttendanceHistory: vi.fn().mockResolvedValue([]),
      getChildUpcomingAssignments: vi.fn().mockResolvedValue([]),
      getChildUpcomingCbt: vi.fn().mockResolvedValue([]),
      getChildPublishedGrades: vi.fn().mockResolvedValue([
        {
          id: "ASSESS_01",
          judul_asesmen: "Formatif TP 1.1",
          jenis_asesmen: "FORMATIF",
          mata_pelajaran: "Rekayasa Perangkat Lunak",
          guru_nama: "Pak Budi",
          nilai: 88,
          kategori_capaian: "Sangat Baik (A)",
          tanggal_publikasi: new Date().toISOString(),
          catatan: null,
        },
      ]),
      getChildReportCard: vi.fn().mockResolvedValue({
        siswa_id: "STUDENT_01",
        nama_siswa: "Rian Pratama",
        nis: "20261001",
        nisn: "0081234567",
        rombel_nama: "X RPL",
        fase: "Fase E",
        semester_nama: "Semester Ganjil",
        tahun_ajaran: "2026/2027",
        wali_kelas_nama: "Pak Guru Homeroom",
        wali_kelas_nip: null,
        kepala_sekolah_nama: "Drs. H. Mulyadi",
        kepala_sekolah_nip: null,
        mata_pelajaran: [],
        rekap_presensi: {
          total_sesi: 20,
          hadir: 19,
          sakit: 1,
          izin: 0,
          alpa: 0,
          persentase_kehadiran: 95,
          kategori_kehadiran: "Sangat Baik",
        },
        catatan_wali_kelas: "Sangat berprestasi",
        status_kenaikan: null,
      }),
      createPengajuan: vi.fn().mockResolvedValue({
        id: "PENGAJUAN_01",
        siswa_id: "STUDENT_01",
        nama_siswa: "Rian Pratama",
        tipe: "SAKIT",
        judul: "Izin Sakit",
        deskripsi: "Ananda sedang sakit demam",
        tanggal_mulai: null,
        tanggal_selesai: null,
        lampiran_url: null,
        status: "MENUNGGU",
        catatan_tanggapan: null,
        created_at: new Date().toISOString(),
      }),
      getPengajuanList: vi.fn().mockResolvedValue([]),
    };

    service = new GuardianService(mockRepo);
  });

  it("berhasil mengambil data dashboard wali murid dengan anak default", async () => {
    const data = await service.getDashboardData(mockGuardianUser);

    expect(data.guardian.nama_lengkap).toBe("Santoso Pratama, S.T.");
    expect(data.linkedChildren).toHaveLength(2);
    expect(data.activeChild.siswa.siswa_id).toBe("STUDENT_01");
    expect(data.attendanceRecap.persentase_kehadiran).toBe(95);
    expect(data.recentPublishedGrades).toHaveLength(1);
    expect(mockRepo.getActiveChildContext).toHaveBeenCalledWith("WALI_01", "STUDENT_01");
  });

  it("mendukung Multi-Child Context Switcher (beralih ke anak kedua)", async () => {
    mockRepo.getActiveChildContext.mockResolvedValueOnce({
      siswa: mockChildren[1],
      sekolah_nama: "SMK OTOMINDO",
      tahun_ajaran_aktif: "2026/2027",
      semester_aktif: "Semester Ganjil",
      wali_kelas: null,
    });

    const data = await service.getDashboardData(mockGuardianUser, "STUDENT_02");

    expect(data.activeChild.siswa.siswa_id).toBe("STUDENT_02");
    expect(mockRepo.getActiveChildContext).toHaveBeenCalledWith("WALI_01", "STUDENT_02");
  });

  it("menolak akses dashboard jika role bukan GUARDIAN (Invariant Access Control)", async () => {
    await expect(service.getDashboardData(mockTeacherUser)).rejects.toThrow(
      UnauthorizedGuardianActionError
    );
  });

  it("menolak akses jika profil wali murid tidak ditemukan", async () => {
    mockRepo.getGuardianProfileByUserId.mockResolvedValueOnce(null);

    await expect(service.getDashboardData(mockGuardianUser)).rejects.toThrow(GuardianNotFoundError);
  });

  it("menolak akses data anak jika relasi tidak sah / tidak terdaftar", async () => {
    mockRepo.assertVerifiedRelationship.mockRejectedValueOnce(
      new ChildNotLinkedError("WALI_01", "STUDENT_UNKNOWN")
    );

    await expect(service.getChildAttendance(mockGuardianUser, "STUDENT_UNKNOWN")).rejects.toThrow(
      ChildNotLinkedError
    );
  });

  it("menolak akses data anak jika relasi belum terverifikasi (UnverifiedRelationshipError)", async () => {
    mockRepo.assertVerifiedRelationship.mockRejectedValueOnce(
      new UnverifiedRelationshipError("WALI_01", "STUDENT_01")
    );

    await expect(service.getChildAttendance(mockGuardianUser, "STUDENT_01")).rejects.toThrow(
      UnverifiedRelationshipError
    );
  });

  it("berhasil mengambil perkembangan nilai dan buku rapor Kurikulum Merdeka", async () => {
    const res = await service.getChildGradesAndReport(mockGuardianUser, "STUDENT_01");

    expect(res.activeChild.siswa.nama_lengkap).toBe("Rian Pratama");
    expect(res.publishedGrades).toHaveLength(1);
    expect(res.reportCard.siswa_id).toBe("STUDENT_01");
    expect(res.reportCard.catatan_wali_kelas).toBe("Sangat berprestasi");
  });

  it("berhasil mengajukan permohonan izin/sakit anak dan memvalidasi input Zod", async () => {
    const payload = {
      siswa_id: "STUDENT_01",
      tipe: "SAKIT",
      judul: "Permohonan Izin Sakit Demam",
      deskripsi: "Ananda Rian mengalami demam dan disarankan istirahat oleh dokter.",
      tanggal_mulai: "2026-09-07",
      tanggal_selesai: "2026-09-08",
    };

    const pengajuan = await service.submitPengajuanIzin(mockGuardianUser, payload);

    expect(pengajuan.id).toBe("PENGAJUAN_01");
    expect(pengajuan.status).toBe("MENUNGGU");
    expect(mockRepo.createPengajuan).toHaveBeenCalledWith("WALI_01", payload);
  });

  it("menolak pengajuan jika deskripsi permohonan terlalu pendek (< 10 karakter)", async () => {
    const payload = {
      siswa_id: "STUDENT_01",
      tipe: "SAKIT",
      judul: "Izin",
      deskripsi: "Pendek",
    };

    await expect(service.submitPengajuanIzin(mockGuardianUser, payload)).rejects.toThrow(
      PengajuanWaliValidationError
    );
  });
});

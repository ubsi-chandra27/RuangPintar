import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TeacherDashboard } from "@/shared/components/dashboard/role-views/teacher-dashboard";
import { StudentDashboard } from "@/shared/components/dashboard/role-views/student-dashboard";
import { GuardianDashboard } from "@/shared/components/dashboard/role-views/guardian-dashboard";
import { StaffDashboard } from "@/shared/components/dashboard/role-views/staff-dashboard";
import { SuperAdminDashboard } from "@/shared/components/dashboard/role-views/super-admin-dashboard";
import { AuthenticatedUser } from "@/shared/infrastructure/auth/auth-service";

const mockTeacher: AuthenticatedUser = {
  id: "01J000000000000000000TEACH1",
  username: "guru_ahmad",
  nama_lengkap: "Ahmad Dahlan, S.Pd.",
  email: null,
  peran_dasar: "TEACHER",
  status_akun: "AKTIF",
  harus_ganti_password: false,
  sekolah_id: "01J00000000000000000000001",
};

const mockStudent: AuthenticatedUser = {
  id: "01J000000000000000000STUD01",
  username: "siswa_budi",
  nama_lengkap: "Budi Santoso",
  email: null,
  peran_dasar: "STUDENT",
  status_akun: "AKTIF",
  harus_ganti_password: false,
  sekolah_id: "01J00000000000000000000001",
};

const mockGuardian: AuthenticatedUser = {
  id: "01J000000000000000000GUAR01",
  username: "wali_santoso",
  nama_lengkap: "Santoso Wijaya",
  email: null,
  peran_dasar: "GUARDIAN",
  status_akun: "AKTIF",
  harus_ganti_password: false,
  sekolah_id: "01J00000000000000000000001",
};

const mockStaff: AuthenticatedUser = {
  id: "01J000000000000000000STAF01",
  username: "staf_tatausaha",
  nama_lengkap: "Siti Rahma",
  email: null,
  peran_dasar: "SCHOOL_STAFF",
  status_akun: "AKTIF",
  harus_ganti_password: false,
  sekolah_id: "01J00000000000000000000001",
};

const mockAdmin: AuthenticatedUser = {
  id: "01J000000000000000000ADMN01",
  username: "superadmin",
  nama_lengkap: "Administrator Utama",
  email: null,
  peran_dasar: "SUPER_ADMIN",
  status_akun: "AKTIF",
  harus_ganti_password: false,
  sekolah_id: "01J00000000000000000000001",
};

describe("Role Dashboard Views & Page Contracts (Phase 05)", () => {
  it("renders TeacherDashboard with schedule and academic quick actions", async () => {
    const jsx = await TeacherDashboard({
      user: mockTeacher,
      initialData: {
        hasProfile: true,
        teacher: {
          id: "01J00000000000000000000001",
          sekolah_id: "01J00000000000000000000001",
          nama_lengkap: "Ahmad Dahlan",
          gelar_belakang: "S.Pd.",
          nama_dengan_gelar: "Ahmad Dahlan, S.Pd.",
          jenis_kelamin: "L",
          status_kepegawaian: "PNS",
          status_aktif: true,
          status_lifecycle: "AKTIF",
          created_at: new Date(),
          updated_at: new Date(),
        },
        activeAssignments: [
          {
            id: "01J00000000000000000000002",
            sekolah_id: "01J00000000000000000000001",
            guru_id: "01J00000000000000000000001",
            mata_pelajaran_id: "01J00000000000000000000003",
            tahun_ajaran_id: "01J00000000000000000000004",
            rombel_id: "01J00000000000000000000005",
            jumlah_jam_minggu: 4,
            berlaku_mulai: new Date(),
            status: "AKTIF",
            created_at: new Date(),
            updated_at: new Date(),
            guru_nama: "Ahmad Dahlan, S.Pd.",
            mata_pelajaran_kode: "PWPB",
            mata_pelajaran_nama: "Pemrograman Web & Mobile",
            tahun_ajaran_nama: "2026/2027",
            rombel_nama: "X RPL 1",
          },
        ],
        activeHomeroom: {
          id: "01J00000000000000000000006",
          sekolah_id: "01J00000000000000000000001",
          guru_id: "01J00000000000000000000001",
          rombel_id: "01J00000000000000000000005",
          tahun_ajaran_id: "01J00000000000000000000004",
          berlaku_mulai: new Date(),
          status: "AKTIF",
          created_at: new Date(),
          updated_at: new Date(),
          guru_nama: "Ahmad Dahlan, S.Pd.",
          rombel_nama: "X RPL 1",
          tahun_ajaran_nama: "2026/2027",
          total_siswa_rombel: 36,
        },
        totalJamMinggu: 4,
        totalRombel: 1,
        totalSiswaBinaan: 36,
      },
    });
    render(jsx);

    expect(screen.getByText("Ahmad Dahlan, S.Pd.")).toBeInTheDocument();
    expect(screen.queryByText("Guru Pengajar")).not.toBeInTheDocument();
    expect(screen.getByText("Jam Digital & Kalender")).toBeInTheDocument();
    expect(screen.getByText("Jadwal Hari Ini")).toBeInTheDocument();
    expect(screen.getByText("Aksi Cepat Guru")).toBeInTheDocument();
  });

  it("renders TeacherDashboard with pending tasks to-do list and official announcements", async () => {
    const jsx = await TeacherDashboard({
      user: mockTeacher,
      initialData: {
        hasProfile: true,
        teacher: {
          id: "01J00000000000000000000001",
          sekolah_id: "01J00000000000000000000001",
          nama_lengkap: "Ahmad Dahlan",
          nama_dengan_gelar: "Ahmad Dahlan, S.Pd.",
          nip: "198501012010011001",
          status_kepegawaian: "TETAP",
          status_aktif: true,
          status_lifecycle: "AKTIF",
          jenis_kelamin: "L",
          created_at: new Date(),
          updated_at: new Date(),
        },
        activeAssignments: [],
        activeHomeroom: null,
        totalJamMinggu: 0,
        totalRombel: 0,
        totalSiswaBinaan: 0,
        pendingTasks: [
          {
            publikasi_id: "PUB_01",
            penugasan_mengajar_id: "PENUGASAN_01",
            tugas_id: "TUG_01",
            judul_tugas: "Tugas 1: Algoritma Pencarian Linear",
            rombel_nama: "X RPL 1",
            mata_pelajaran_kode: "PBO",
            total_dikumpulkan: 28,
            belum_dinilai: 5,
            batas_waktu: new Date("2026-09-20"),
          },
        ],
        totalTugasPerluDiperiksa: 1,
      },
      initialAnnouncements: [
        {
          id: "ANN_01",
          sekolah_id: "01J00000000000000000000001",
          penulis_id: "ADMIN_01",
          penulis: { id: "ADMIN_01", nama_lengkap: "Kepala Sekolah", peran_dasar: "SUPER_ADMIN" },
          judul: "Sosialisasi Implementasi Asesmen Kurikulum Merdeka",
          konten: "Diharapkan seluruh dewan guru hadir di ruang rapat utama.",
          kategori: "AKADEMIK",
          status: "PUBLISHED",
          apakah_disematkan: true,
          lampiran_url: null,
          target_audiens: "GURU",
          target_rombel_id: null,
          dipublikasikan_pada: new Date("2026-09-12"),
          created_at: new Date("2026-09-12"),
          updated_at: new Date("2026-09-12"),
        },
      ],
    });
    render(jsx);

    expect(screen.getByText("Tugas Menunggu Periksa")).toBeInTheDocument();
    expect(screen.getByText("1 Tugas Perlu Dinilai")).toBeInTheDocument();
    expect(screen.getByText("Perlu Diperiksa & Dinilai")).toBeInTheDocument();
    expect(screen.getByText("Tugas 1: Algoritma Pencarian Linear")).toBeInTheDocument();
    expect(screen.getByText("28 Siswa Mengumpulkan")).toBeInTheDocument();
    expect(screen.getByText("5 Belum Dinilai")).toBeInTheDocument();
    expect(screen.getByText("Pengumuman Resmi Sekolah")).toBeInTheDocument();
    expect(
      screen.getByText("Sosialisasi Implementasi Asesmen Kurikulum Merdeka")
    ).toBeInTheDocument();
  });

  it("renders StudentDashboard with student self-scope items and CBT cards", async () => {
    const jsx = await StudentDashboard({
      user: mockStudent,
      initialData: {
        profile: {
          siswaId: "01M18QCSXR59TR1FXG03V6YT91",
          namaLengkap: "Budi Santoso",
          nis: "20261001",
          nisn: "0081234501",
          fotoUrl: null,
          statusAkademik: "AKTIF",
          tahunAjaranId: "01M18FWDEHE6QRXKWP4H2ASHXY",
          tahunAjaranNama: "2026/2027",
          semesterId: "01M18FWDEHE6QRXKWP4H2ASHXZ",
          semesterNama: "Semester Ganjil",
          rombelId: "01M19MV91XH1TVZE0RJVPKDJN2",
          rombelNama: "X RPL",
          tingkatNama: "Kelas 10",
          waliKelasNama: "Ahmad Dahlan, S.Pd.",
          nomorAbsen: 1,
        },
        statCards: {
          rombelNama: "X RPL",
          waliKelasNama: "Ahmad Dahlan, S.Pd.",
          persentaseKehadiran: 100,
          totalHadir: 18,
          totalAlpha: 0,
          tugasPerluDikerjakan: 2,
          totalTugasAktif: 4,
          nilaiRataRata: 88.5,
          cbtAktifCount: 1,
        },
        jadwalHariIni: [],
        tugasMendatang: [],
        cbtMendatang: [],
        nilaiTerbaru: [],
      },
    });
    render(jsx);

    expect(screen.getByText(/Halo, Budi Santoso!/i)).toBeInTheDocument();
    expect(screen.getByText("Siswa Aktif")).toBeInTheDocument();
    expect(screen.getByText("Jadwal Pelajaran Hari Ini")).toBeInTheDocument();
    expect(screen.getByText("CBT & Ujian Online")).toBeInTheDocument();
    expect(screen.getByText("Aksi Cepat Siswa")).toBeInTheDocument();
  });

  it("renders GuardianDashboard with child learning progress and quick actions", async () => {
    const jsx = await GuardianDashboard({
      user: mockGuardian,
      initialData: {
        guardian: {
          id: "01M18WALI001",
          sekolah_id: "01J00000000000000000000001",
          pengguna_id: mockGuardian.id,
          nama_lengkap: "Santoso Wijaya",
          jenis_kelamin: "L",
          no_telepon: "081234567890",
          email: "santoso@example.com",
          pekerjaan: "Wiraswasta",
          penghasilan: "Rp 15.000.000",
          alamat: "Jakarta",
        },
        linkedChildren: [
          {
            siswa_id: "01M18QCSXR59TR1FXG03V6YT91",
            nama_lengkap: "Rian Pratama",
            nis: "20261001",
            nisn: "0081234501",
            rombel_nama: "X RPL 1",
            tingkat_kelas: "Kelas 10",
            jenis_kelamin: "L",
            foto_url: null,
            jenis_hubungan: "AYAH",
            apakah_wali_utama: true,
            status_verifikasi: "TERVERIFIKASI",
          },
        ],
        activeChild: {
          siswa: {
            siswa_id: "01M18QCSXR59TR1FXG03V6YT91",
            nama_lengkap: "Rian Pratama",
            nis: "20261001",
            nisn: "0081234501",
            rombel_nama: "X RPL 1",
            tingkat_kelas: "Kelas 10",
            jenis_kelamin: "L",
            foto_url: null,
            jenis_hubungan: "AYAH",
            apakah_wali_utama: true,
            status_verifikasi: "TERVERIFIKASI",
          },
          sekolah_nama: "SMK Otomindo Jakarta",
          tahun_ajaran_aktif: "2026/2027",
          semester_aktif: "Semester Ganjil",
          wali_kelas: {
            guru_id: "01M18GURU01",
            nama_lengkap: "Pak Andi Setiawan, S.Pd.",
            email: "andi@otomindo.sch.id",
            no_telepon: "08123456789",
            foto_url: null,
          },
        },
        attendanceRecap: {
          total_sesi: 20,
          hadir: 20,
          sakit: 0,
          izin: 0,
          alpa: 0,
          persentase_kehadiran: 100,
          kategori_kehadiran: "Sangat Baik",
        },
        upcomingAssignments: [],
        upcomingCbt: [],
        recentPublishedGrades: [],
        recentPengajuan: [],
      },
    });
    render(jsx);

    expect(screen.getByText(/Selamat Datang, Bapak\/Ibu Santoso Wijaya/i)).toBeInTheDocument();
    expect(screen.getByText("Wali Murid")).toBeInTheDocument();
    expect(screen.getByText(/Profil Pembelajaran — Rian Pratama/i)).toBeInTheDocument();
    expect(screen.getByText("Layanan Orang Tua")).toBeInTheDocument();
  });

  it("renders StaffDashboard reflecting assigned capability bundles", () => {
    render(
      <StaffDashboard
        user={mockStaff}
        capabilities={["ACADEMIC_OPERATOR", "STUDENT_DATA_OPERATOR"]}
      />
    );

    expect(screen.getByText("Dashboard Operasional")).toBeInTheDocument();
    expect(screen.getByText("Staf Tata Usaha")).toBeInTheDocument();
    expect(screen.getByText("Operator Akademik")).toBeInTheDocument();
    expect(screen.getByText("Operator Kesiswaan")).toBeInTheDocument();
    expect(screen.getByText("Modul Operasional & Wewenang")).toBeInTheDocument();
  });

  it("renders SuperAdminDashboard with core stat cards, activity chart, and quick actions", () => {
    render(<SuperAdminDashboard user={mockAdmin} />);

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(
      screen.getByText("Ringkasan operasional dan aktivitas akademik sekolah.")
    ).toBeInTheDocument();
    expect(screen.getByText("Total Siswa")).toBeInTheDocument();
    expect(screen.getByText("Kehadiran Hari Ini")).toBeInTheDocument();
    expect(screen.getByText("Aktivitas Terbaru")).toBeInTheDocument();
    expect(screen.getByText("Aksi Cepat")).toBeInTheDocument();
  });
});

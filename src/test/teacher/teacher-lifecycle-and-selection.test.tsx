import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { TeachersView } from "@/modules/teacher/presentation/teachers-view";
import { SubjectsView } from "@/modules/teacher/presentation/subjects-view";
import { TeachingAssignmentsView } from "@/modules/teacher/presentation/teaching-assignments-view";
import {
  SubjectDTO,
  TeacherProfileDTO,
  TeachingAssignmentDTO,
} from "@/modules/teacher/domain/teacher-types";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: vi.fn(),
    push: vi.fn(),
  }),
}));

describe("Human Review Correction: Multi-Selection & Lifecycle Protection (Item 15 Test Suite)", () => {
  const teacherAktifTanpaHistori: TeacherProfileDTO = {
    id: "01J00000000000000000000001",
    sekolah_id: "01J00000000000000000000001",
    nama_lengkap: "Dewi Lestari",
    nama_dengan_gelar: "Dewi Lestari, S.Pd.",
    nip: "198501012010012001",
    jenis_kelamin: "P",
    status_kepegawaian: "PNS",
    status_aktif: true,
    status_lifecycle: "AKTIF",
    bisa_hapus_permanen: true,
    jumlah_histori_akademik: 0,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const teacherAktifAdaHistori: TeacherProfileDTO = {
    id: "01J00000000000000000000002",
    sekolah_id: "01J00000000000000000000001",
    nama_lengkap: "Budi Santoso",
    nama_dengan_gelar: "Drs. Budi Santoso, M.Kom.",
    nip: "198002022005011002",
    jenis_kelamin: "L",
    status_kepegawaian: "TETAP",
    status_aktif: true,
    status_lifecycle: "AKTIF",
    bisa_hapus_permanen: false,
    jumlah_histori_akademik: 4,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const teacherNonaktif: TeacherProfileDTO = {
    id: "01J00000000000000000000003",
    sekolah_id: "01J00000000000000000000001",
    nama_lengkap: "Siti Rahma",
    nama_dengan_gelar: "Siti Rahma, S.Pd.",
    nip: "197803032003012003",
    jenis_kelamin: "P",
    status_kepegawaian: "HONORER",
    status_aktif: false,
    status_lifecycle: "NONAKTIF",
    bisa_hapus_permanen: false,
    jumlah_histori_akademik: 2,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const teacherArsip: TeacherProfileDTO = {
    id: "01J00000000000000000000004",
    sekolah_id: "01J00000000000000000000001",
    nama_lengkap: "Hendra Wijaya",
    nama_dengan_gelar: "Hendra Wijaya, M.T.",
    nip: "197504041999031004",
    jenis_kelamin: "L",
    status_kepegawaian: "TETAP",
    status_aktif: false,
    status_lifecycle: "ARSIP",
    bisa_hapus_permanen: false,
    jumlah_histori_akademik: 10,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockTeacherList: TeacherProfileDTO[] = [
    teacherAktifTanpaHistori,
    teacherAktifAdaHistori,
    teacherNonaktif,
    teacherArsip,
  ];

  const mapelTanpaHistori: SubjectDTO = {
    id: "01J0000000000000000000MAP01",
    sekolah_id: "01J00000000000000000000001",
    kode: "KIM",
    nama: "Kimia Dasar",
    kelompok: "UMUM",
    status_aktif: true,
    status_lifecycle: "AKTIF",
    bisa_hapus_permanen: true,
    jumlah_histori_akademik: 0,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mapelAdaHistori: SubjectDTO = {
    id: "01J0000000000000000000MAP02",
    sekolah_id: "01J00000000000000000000001",
    kode: "PBO",
    nama: "Pemrograman Berorientasi Objek",
    kelompok: "KEJURUAN",
    status_aktif: true,
    status_lifecycle: "AKTIF",
    bisa_hapus_permanen: false,
    jumlah_histori_akademik: 5,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockSubjectList: SubjectDTO[] = [mapelTanpaHistori, mapelAdaHistori];

  const penugasanTanpaHistori: TeachingAssignmentDTO = {
    id: "01J0000000000000000000TUG01",
    sekolah_id: "01J00000000000000000000001",
    guru_id: teacherAktifTanpaHistori.id,
    mata_pelajaran_id: mapelTanpaHistori.id,
    tahun_ajaran_id: "01J00000000000000000000004",
    rombel_id: "01J00000000000000000000005",
    jumlah_jam_minggu: 2,
    berlaku_mulai: new Date(),
    status: "AKTIF",
    bisa_hapus_permanen: true,
    jumlah_histori_akademik: 0,
    guru_nama: "Dewi Lestari, S.Pd.",
    mata_pelajaran_kode: "KIM",
    mata_pelajaran_nama: "Kimia Dasar",
    tahun_ajaran_nama: "2026/2027",
    rombel_nama: "X RPL 1",
    created_at: new Date(),
    updated_at: new Date(),
  };

  const penugasanAdaHistori: TeachingAssignmentDTO = {
    id: "01J0000000000000000000TUG02",
    sekolah_id: "01J00000000000000000000001",
    guru_id: teacherAktifAdaHistori.id,
    mata_pelajaran_id: mapelAdaHistori.id,
    tahun_ajaran_id: "01J00000000000000000000004",
    rombel_id: "01J00000000000000000000005",
    jumlah_jam_minggu: 4,
    berlaku_mulai: new Date(),
    status: "AKTIF",
    bisa_hapus_permanen: false,
    jumlah_histori_akademik: 6,
    guru_nama: "Drs. Budi Santoso, M.Kom.",
    mata_pelajaran_kode: "PBO",
    mata_pelajaran_nama: "Pemrograman Berorientasi Objek",
    tahun_ajaran_nama: "2026/2027",
    rombel_nama: "X RPL 1",
    created_at: new Date(),
    updated_at: new Date(),
  };

  describe("1. Selection & Checkbox Tests", () => {
    it("renders row checkboxes and toggles row selection", () => {
      render(
        <TeachersView
          initialTeachers={mockTeacherList}
          teachingAssignments={[]}
          homeroomAssignments={[]}
          canManage={true}
        />
      );

      const rowCheckboxes = screen.getAllByLabelText("Pilih guru Dewi Lestari, S.Pd.");
      const targetCheckbox = rowCheckboxes[0];
      expect(targetCheckbox).not.toBeChecked();

      fireEvent.click(targetCheckbox);
      expect(targetCheckbox).toBeChecked();
      expect(screen.getByText("1 data dipilih")).toBeInTheDocument();
    });

    it("supports Select All across visible items", () => {
      render(
        <TeachersView
          initialTeachers={mockTeacherList}
          teachingAssignments={[]}
          homeroomAssignments={[]}
          canManage={true}
        />
      );

      const selectAll = screen.getByLabelText("Pilih semua guru");
      expect(selectAll).not.toBeChecked();

      fireEvent.click(selectAll);

      // Default filter is AKTIF: 2 active teachers are visible and selected
      const dewiCheckboxes = screen.getAllByLabelText("Pilih guru Dewi Lestari, S.Pd.");
      const budiCheckboxes = screen.getAllByLabelText("Pilih guru Drs. Budi Santoso, M.Kom.");
      expect(dewiCheckboxes[0]).toBeChecked();
      expect(budiCheckboxes[0]).toBeChecked();
      expect(screen.getByText("2 data dipilih")).toBeInTheDocument();
    });

    it("sets indeterminate state on Select All when only partial rows are selected", () => {
      render(
        <TeachersView
          initialTeachers={mockTeacherList}
          teachingAssignments={[]}
          homeroomAssignments={[]}
          canManage={true}
        />
      );

      const selectAll = screen.getByLabelText("Pilih semua guru") as HTMLInputElement;
      const row1 = screen.getAllByLabelText("Pilih guru Dewi Lestari, S.Pd.")[0];

      // Initially indeterminate is false
      expect(selectAll.indeterminate).toBe(false);

      // Select 1 of 2 visible rows
      fireEvent.click(row1);

      expect(selectAll.indeterminate).toBe(true);
      expect(selectAll.checked).toBe(false);

      // Select second row -> now full, indeterminate becomes false
      const row2 = screen.getAllByLabelText("Pilih guru Drs. Budi Santoso, M.Kom.")[0];
      fireEvent.click(row2);
      expect(selectAll.checked).toBe(true);
      expect(selectAll.indeterminate).toBe(false);
    });

    it("resets selection via 'Batal Pilih' bulk button", () => {
      render(
        <TeachersView
          initialTeachers={mockTeacherList}
          teachingAssignments={[]}
          homeroomAssignments={[]}
          canManage={true}
        />
      );

      const row1 = screen.getAllByLabelText("Pilih guru Dewi Lestari, S.Pd.")[0];
      fireEvent.click(row1);
      expect(screen.getByText("1 data dipilih")).toBeInTheDocument();

      const cancelBtn = screen.getByRole("button", { name: "Batal Pilih" });
      fireEvent.click(cancelBtn);

      expect(screen.queryByTestId("bulk-toolbar")).not.toBeInTheDocument();
      expect(row1).not.toBeChecked();
    });
  });

  describe("2. Data Guru Lifecycle Tests", () => {
    it("filters teachers by Aktif (default filter)", () => {
      render(
        <TeachersView
          initialTeachers={mockTeacherList}
          teachingAssignments={[]}
          homeroomAssignments={[]}
          canManage={true}
        />
      );

      // Active teachers visible by default
      expect(screen.getAllByText("Dewi Lestari, S.Pd.")[0]).toBeInTheDocument();
      expect(screen.getAllByText("Drs. Budi Santoso, M.Kom.")[0]).toBeInTheDocument();

      // Inactive and archived are hidden by default
      expect(screen.queryByText("Siti Rahma, S.Pd.")).not.toBeInTheDocument();
      expect(screen.queryByText("Hendra Wijaya, M.T.")).not.toBeInTheDocument();
    });

    it("filters teachers by Nonaktif", () => {
      render(
        <TeachersView
          initialTeachers={mockTeacherList}
          teachingAssignments={[]}
          homeroomAssignments={[]}
          canManage={true}
        />
      );

      fireEvent.click(screen.getByRole("button", { name: "Filter" }));
      const statusSelect = screen.getByLabelText("Status Keaktifan");
      fireEvent.change(statusSelect, { target: { value: "NONAKTIF" } });

      expect(screen.getAllByText("Siti Rahma, S.Pd.")[0]).toBeInTheDocument();
      expect(screen.queryByText("Dewi Lestari, S.Pd.")).not.toBeInTheDocument();
      expect(screen.queryByText("Hendra Wijaya, M.T.")).not.toBeInTheDocument();
    });

    it("filters teachers by Arsip", () => {
      render(
        <TeachersView
          initialTeachers={mockTeacherList}
          teachingAssignments={[]}
          homeroomAssignments={[]}
          canManage={true}
        />
      );

      fireEvent.click(screen.getByRole("button", { name: "Filter" }));
      const statusSelect = screen.getByLabelText("Status Keaktifan");
      fireEvent.change(statusSelect, { target: { value: "ARSIP" } });

      expect(screen.getAllByText("Hendra Wijaya, M.T.")[0]).toBeInTheDocument();
      expect(screen.queryByText("Dewi Lestari, S.Pd.")).not.toBeInTheDocument();
    });

    it("displays restore action button on archived teacher", () => {
      render(
        <TeachersView
          initialTeachers={mockTeacherList}
          teachingAssignments={[]}
          homeroomAssignments={[]}
          canManage={true}
        />
      );

      // Switch to ARSIP filter
      fireEvent.click(screen.getByRole("button", { name: "Filter" }));
      const statusSelect = screen.getByLabelText("Status Keaktifan");
      fireEvent.change(statusSelect, { target: { value: "ARSIP" } });

      expect(screen.getAllByTitle("Pulihkan Guru ke Aktif")[0]).toBeInTheDocument();
    });

    it("allows hard delete modal when teacher has no academic history", () => {
      render(
        <TeachersView
          initialTeachers={[teacherAktifTanpaHistori]}
          teachingAssignments={[]}
          homeroomAssignments={[]}
          canManage={true}
        />
      );

      const deleteBtn = screen.getAllByTitle("Hapus Data Guru")[0];
      fireEvent.click(deleteBtn);

      expect(screen.getByText("Hapus Data Guru")).toBeInTheDocument();
      expect(
        screen.getByText(/belum pernah memiliki penugasan atau data akademik/i)
      ).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Hapus Permanen" })).toBeInTheDocument();
    });

    it("rejects hard delete and offers Arsip when teacher has academic history", () => {
      render(
        <TeachersView
          initialTeachers={[teacherAktifAdaHistori]}
          teachingAssignments={[]}
          homeroomAssignments={[]}
          canManage={true}
        />
      );

      // In the table row, delete button is replaced with Arsipkan
      const archiveBtn = screen.getAllByTitle("Arsipkan Guru (Memiliki Histori Akademik)")[0];
      expect(archiveBtn).toBeInTheDocument();
      fireEvent.click(archiveBtn);

      expect(screen.getByText("Histori Akademik Terdeteksi")).toBeInTheDocument();
      expect(screen.getByText(/Hard Delete Dilarang/i)).toBeInTheDocument();
      expect(
        screen.getByText(/Guru tidak dapat dihapus permanen karena memiliki histori akademik/i)
      ).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Arsipkan Guru" })).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Hapus Permanen" })).not.toBeInTheDocument();
    });

    it("provides bulk archive and bulk delete options in selection toolbar", () => {
      render(
        <TeachersView
          initialTeachers={mockTeacherList}
          teachingAssignments={[]}
          homeroomAssignments={[]}
          canManage={true}
        />
      );

      fireEvent.click(screen.getAllByLabelText("Pilih guru Dewi Lestari, S.Pd.")[0]);

      const bulkToolbar = screen.getByTestId("bulk-toolbar");
      expect(bulkToolbar).toBeInTheDocument();

      expect(screen.getByRole("button", { name: "Arsipkan" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Nonaktifkan" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Hapus Permanen" })).toBeInTheDocument();

      // Click bulk delete to verify confirmation dialog
      fireEvent.click(screen.getByRole("button", { name: "Hapus Permanen" }));
      expect(screen.getByText("Konfirmasi Hapus Massal")).toBeInTheDocument();
      expect(screen.getByText(/Perlindungan Histori Akademik Aktif/i)).toBeInTheDocument();
    });
  });

  describe("3. Mata Pelajaran Dependency & Lifecycle Tests", () => {
    it("verifies dependency check and allows hard delete only if no dependencies", () => {
      render(<SubjectsView initialSubjects={[mapelTanpaHistori]} canManage={true} />);

      const deleteBtn = screen.getAllByTitle("Hapus Mata Pelajaran")[0];
      fireEvent.click(deleteBtn);

      expect(screen.getByText("Hapus Mata Pelajaran")).toBeInTheDocument();
      expect(
        screen.getByText(/belum pernah digunakan dalam penugasan akademik/i)
      ).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Hapus Permanen" })).toBeInTheDocument();
    });

    it("verifies dependency check and redirects to archive if subject has history", () => {
      render(<SubjectsView initialSubjects={[mapelAdaHistori]} canManage={true} />);

      const archiveBtn = screen.getAllByTitle("Arsipkan Mapel (Memiliki Histori Akademik)")[0];
      fireEvent.click(archiveBtn);

      expect(screen.getByText("Histori Akademik Terdeteksi")).toBeInTheDocument();
      expect(screen.getByText(/Hard Delete Dilarang/i)).toBeInTheDocument();
      expect(
        screen.getByText(
          /Mata pelajaran tidak dapat dihapus permanen karena memiliki histori akademik/i
        )
      ).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Arsipkan Mapel" })).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Hapus Permanen" })).not.toBeInTheDocument();
    });
  });

  describe("4. Penugasan Mengajar Dependency & Lifecycle Tests", () => {
    it("allows hard delete when assignment has no sessions or schedules", () => {
      render(
        <TeachingAssignmentsView
          initialAssignments={[penugasanTanpaHistori]}
          teachers={[teacherAktifTanpaHistori]}
          subjects={[mapelTanpaHistori]}
          academicYears={[{ id: "01J00000000000000000000004", nama: "2026/2027", status: "AKTIF" }]}
          semesters={[]}
          rombels={[
            {
              id: "01J00000000000000000000005",
              nama: "X RPL 1",
              tahun_ajaran_id: "01J00000000000000000000004",
            },
          ]}
          canManage={true}
        />
      );

      // Switch to detailed table mode
      fireEvent.click(screen.getByRole("button", { name: /Tabel Rinci/i }));

      const deleteBtn = screen.getAllByTitle("Hapus Penugasan")[0];
      fireEvent.click(deleteBtn);

      expect(screen.getByText("Hapus Penugasan Mengajar")).toBeInTheDocument();
      expect(screen.getByText(/belum memiliki jadwal atau data sesi KBM/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Hapus Permanen" })).toBeInTheDocument();
    });

    it("protects assignment with academic history by offering archive instead of hard delete", () => {
      render(
        <TeachingAssignmentsView
          initialAssignments={[penugasanAdaHistori]}
          teachers={[teacherAktifAdaHistori]}
          subjects={[mapelAdaHistori]}
          academicYears={[{ id: "01J00000000000000000000004", nama: "2026/2027", status: "AKTIF" }]}
          semesters={[]}
          rombels={[
            {
              id: "01J00000000000000000000005",
              nama: "X RPL 1",
              tahun_ajaran_id: "01J00000000000000000000004",
            },
          ]}
          canManage={true}
        />
      );

      // Switch to detailed table mode
      fireEvent.click(screen.getByRole("button", { name: /Tabel Rinci/i }));

      const archiveBtn = screen.getAllByTitle("Arsipkan Penugasan (Memiliki Histori Akademik)")[0];
      fireEvent.click(archiveBtn);

      expect(screen.getByText("Histori Akademik Terdeteksi")).toBeInTheDocument();
      expect(screen.getByText(/Hard Delete Dilarang/i)).toBeInTheDocument();
      expect(
        screen.getByText(
          /Penugasan mengajar tidak dapat dihapus permanen karena memiliki histori akademik/i
        )
      ).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Arsipkan Penugasan" })).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Hapus Permanen" })).not.toBeInTheDocument();
    });
  });
});

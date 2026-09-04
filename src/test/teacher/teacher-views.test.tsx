import { describe, it, expect } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { TeachersView } from "@/modules/teacher/presentation/teachers-view";
import { SubjectsView } from "@/modules/teacher/presentation/subjects-view";
import { TeachingAssignmentsView } from "@/modules/teacher/presentation/teaching-assignments-view";
import { HomeroomAssignmentsView } from "@/modules/teacher/presentation/homeroom-assignments-view";
import { TeacherManagementTabs } from "@/modules/teacher/presentation/teacher-management-tabs";
import {
  HomeroomAssignmentDTO,
  SubjectDTO,
  TeacherProfileDTO,
  TeachingAssignmentDTO,
} from "@/modules/teacher/domain/teacher-types";

describe("M08 — Teacher Presentation Views & Tabs (Academic Glass UI v1.2)", () => {
  const mockTeachers: TeacherProfileDTO[] = [
    {
      id: "01J00000000000000000000001",
      sekolah_id: "01J00000000000000000000001",
      nama_lengkap: "Budi Santoso",
      gelar_depan: "Drs.",
      gelar_belakang: "M.Kom.",
      nama_dengan_gelar: "Drs. Budi Santoso M.Kom.",
      nip: "198205142008011005",
      jenis_kelamin: "L",
      status_kepegawaian: "PNS",
      status_aktif: true,
      status_lifecycle: "AKTIF",
      bisa_hapus_permanen: true,
      jumlah_histori_akademik: 0,
      total_rombel_aktif: 2,
      total_jam_minggu: 8,
      is_wali_kelas_aktif: true,
      rombel_wali_nama: "X RPL 1",
      created_at: new Date(),
      updated_at: new Date(),
    },
  ];

  const mockSubjects: SubjectDTO[] = [
    {
      id: "01J00000000000000000000002",
      sekolah_id: "01J00000000000000000000001",
      kode: "PBO",
      nama: "Pemrograman Berorientasi Objek",
      kelompok: "KEJURUAN",
      status_aktif: true,
      status_lifecycle: "AKTIF",
      bisa_hapus_permanen: true,
      jumlah_histori_akademik: 0,
      total_guru_pengajar: 1,
      total_rombel_aktif: 2,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ];

  const mockTeachingAssignments: TeachingAssignmentDTO[] = [
    {
      id: "01J00000000000000000000003",
      sekolah_id: "01J00000000000000000000001",
      guru_id: "01J00000000000000000000001",
      mata_pelajaran_id: "01J00000000000000000000002",
      tahun_ajaran_id: "01J00000000000000000000004",
      rombel_id: "01J00000000000000000000005",
      jumlah_jam_minggu: 4,
      berlaku_mulai: new Date(),
      status: "AKTIF",
      bisa_hapus_permanen: true,
      jumlah_histori_akademik: 0,
      guru_nama: "Drs. Budi Santoso M.Kom.",
      mata_pelajaran_kode: "PBO",
      mata_pelajaran_nama: "Pemrograman Berorientasi Objek",
      tahun_ajaran_nama: "2026/2027",
      rombel_nama: "X RPL 1",
      created_at: new Date(),
      updated_at: new Date(),
    },
  ];

  const mockHomerooms: HomeroomAssignmentDTO[] = [
    {
      id: "01J00000000000000000000006",
      sekolah_id: "01J00000000000000000000001",
      guru_id: "01J00000000000000000000001",
      rombel_id: "01J00000000000000000000005",
      tahun_ajaran_id: "01J00000000000000000000004",
      berlaku_mulai: new Date(),
      status: "AKTIF",
      guru_nama: "Drs. Budi Santoso M.Kom.",
      rombel_nama: "X RPL 1",
      tahun_ajaran_nama: "2026/2027",
      total_siswa_rombel: 36,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ];

  it("renders TeachersView with teacher profiles and toolbar", () => {
    render(
      <TeachersView
        initialTeachers={mockTeachers}
        teachingAssignments={mockTeachingAssignments}
        homeroomAssignments={mockHomerooms}
        canManage={true}
      />
    );

    expect(screen.getByPlaceholderText(/search guru/i)).toBeInTheDocument();
    expect(screen.getAllByText("Drs. Budi Santoso M.Kom.")[0]).toBeInTheDocument();
    expect(screen.getAllByText(/198205142008011005/)[0]).toBeInTheDocument();
    expect(screen.getByText(/Tambah Guru/i)).toBeInTheDocument();
  });

  it("permits hard-delete confirmation for teacher without academic history", () => {
    render(
      <TeachersView
        initialTeachers={mockTeachers}
        teachingAssignments={mockTeachingAssignments}
        homeroomAssignments={mockHomerooms}
        canManage={true}
      />
    );

    fireEvent.click(screen.getAllByTitle("Hapus Data Guru")[0]);

    expect(screen.getByText("Hapus Data Guru")).toBeInTheDocument();
    expect(
      screen.getByText(/belum pernah memiliki penugasan atau data akademik/i)
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Hapus Permanen" })).toBeInTheDocument();
  });

  it("renders SubjectsView with subjects and curriculum groups", () => {
    render(<SubjectsView initialSubjects={mockSubjects} canManage={true} />);

    expect(screen.getByPlaceholderText(/search mata pelajaran/i)).toBeInTheDocument();
    expect(screen.getByText("Pemrograman Berorientasi Objek")).toBeInTheDocument();
    expect(screen.getByText("PBO")).toBeInTheDocument();
    expect(screen.getByText(/Tambah Mata Pelajaran/i)).toBeInTheDocument();
  });

  it("renders TeachingAssignmentsView with workload summary and assignment table", () => {
    render(
      <TeachingAssignmentsView
        initialAssignments={mockTeachingAssignments}
        teachers={mockTeachers}
        subjects={mockSubjects}
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

    expect(screen.getByPlaceholderText(/search guru/i)).toBeInTheDocument();
    expect(screen.getByText("Total Beban Jam (JP)")).toBeInTheDocument();
    expect(screen.getAllByText("4 JP")[0]).toBeInTheDocument();
    expect(screen.getByText(/\+ Tetapkan Penugasan/i)).toBeInTheDocument();
  });

  it("keeps the teaching-assignment filter popover above the table without clipping", () => {
    render(
      <TeachingAssignmentsView
        initialAssignments={mockTeachingAssignments}
        teachers={mockTeachers}
        subjects={mockSubjects}
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

    fireEvent.click(screen.getByRole("button", { name: "Filter" }));

    expect(screen.getByTestId("teaching-assignment-toolbar")).toHaveClass("relative", "z-20");
    expect(screen.getByTestId("teaching-assignment-filter-popover")).toHaveClass("z-50");
    expect(screen.getByText("Filter Penugasan Mengajar")).toBeInTheDocument();
  });

  it("protects teacher with academic history by rejecting hard delete and offering archive", () => {
    const teacherWithHistory: TeacherProfileDTO = {
      ...mockTeachers[0],
      bisa_hapus_permanen: false,
      jumlah_histori_akademik: 3,
    };

    render(
      <TeachersView
        initialTeachers={[teacherWithHistory]}
        teachingAssignments={mockTeachingAssignments}
        homeroomAssignments={mockHomerooms}
        canManage={true}
      />
    );

    // Row action button offers Arsip icon
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

  it("renders HomeroomAssignmentsView with homeroom statistics and rombel mapping", () => {
    render(
      <HomeroomAssignmentsView
        initialHomerooms={mockHomerooms}
        teachers={mockTeachers}
        academicYears={[{ id: "01J00000000000000000000004", nama: "2026/2027", status: "AKTIF" }]}
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

    expect(screen.getByPlaceholderText(/search wali kelas/i)).toBeInTheDocument();
    expect(screen.getByText("Wali Kelas Aktif")).toBeInTheDocument();
    expect(screen.getByText(/Tetapkan Wali Kelas/i)).toBeInTheDocument();
  });

  it("renders TeacherManagementTabs container with 4 symmetrical tabs", () => {
    render(
      <TeacherManagementTabs
        initialData={{
          teachers: mockTeachers,
          subjects: mockSubjects,
          teachingAssignments: mockTeachingAssignments,
          homeroomAssignments: mockHomerooms,
          academicYears: [{ id: "01J00000000000000000000004", nama: "2026/2027", status: "AKTIF" }],
          semesters: [],
          rombels: [
            {
              id: "01J00000000000000000000005",
              nama: "X RPL 1",
              tahun_ajaran_id: "01J00000000000000000000004",
              kapasitas: 36,
            },
          ],
        }}
        canManage={true}
      />
    );

    expect(screen.getAllByText("Data Guru")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Mata Pelajaran")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Penugasan Mengajar")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Wali Kelas")[0]).toBeInTheDocument();
  });
});

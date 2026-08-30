import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { SchoolManagementTabs } from "@/modules/school/presentation/school-management-tabs";
import { SchoolProfileForm } from "@/modules/school/presentation/school-profile-form";
import { OrganizationUnitsView } from "@/modules/school/presentation/organization-units-view";
import { PositionsView } from "@/modules/school/presentation/positions-view";
import { PositionAssignmentsView } from "@/modules/school/presentation/position-assignments-view";
import {
  OrganizationUnitDTO,
  PersonilOptionDTO,
  PositionAssignmentDTO,
  PositionDTO,
  SchoolProfileDTO,
} from "@/modules/school/domain/school-types";

// Mock server actions to avoid network calls in UI unit tests
vi.mock("@/app/actions/school-actions", () => ({
  updateSchoolProfileAction: vi.fn().mockResolvedValue({ success: true }),
  createOrganizationUnitAction: vi.fn().mockResolvedValue({ success: true }),
  updateOrganizationUnitAction: vi.fn().mockResolvedValue({ success: true }),
  deleteOrganizationUnitAction: vi.fn().mockResolvedValue({ success: true }),
  createPositionAction: vi.fn().mockResolvedValue({ success: true }),
  updatePositionAction: vi.fn().mockResolvedValue({ success: true }),
  deletePositionAction: vi.fn().mockResolvedValue({ success: true }),
  assignPositionAction: vi.fn().mockResolvedValue({ success: true }),
  endPositionAssignmentAction: vi.fn().mockResolvedValue({ success: true }),
  cancelPositionAssignmentAction: vi.fn().mockResolvedValue({ success: true }),
}));

describe("School & Organization (Phase 06) — Presentation Views & Tabs", () => {
  const mockProfile: SchoolProfileDTO = {
    id: "sch_01",
    nama: "SMA Negeri 1 Nusantara",
    npsn: "20108899",
    jenjang: "SMA",
    alamat: "Jl. Pendidikan No. 45",
    telepon: "021-5551234",
    email: "info@sman1nusantara.sch.id",
    zona_waktu: "Asia/Jakarta",
    logo_url: "/images/brand/logo.png",
    status_aktif: true,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockUnits: OrganizationUnitDTO[] = [
    {
      id: "unit_01",
      sekolah_id: "sch_01",
      nama: "Bidang Kurikulum",
      kode: "KUR",
      induk_unit_id: null,
      induk_unit_nama: null,
      sub_unit_count: 1,
      jabatan_count: 1,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: "unit_02",
      sekolah_id: "sch_01",
      nama: "Tata Usaha",
      kode: "TU",
      induk_unit_id: null,
      induk_unit_nama: null,
      sub_unit_count: 0,
      jabatan_count: 1,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ];

  const mockPositions: PositionDTO[] = [
    {
      id: "pos_01",
      sekolah_id: "sch_01",
      unit_id: "unit_01",
      unit_nama: "Bidang Kurikulum",
      kode_jabatan: "VICE_PRINCIPAL_CURRICULUM",
      nama_jabatan: "Wakil Kepala Sekolah Kurikulum",
      tingkat_akses: "SCHOOL_WIDE",
      is_canonical: true,
      penugasan_count: 1,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ];

  const mockAssignments: PositionAssignmentDTO[] = [
    {
      id: "asg_01",
      sekolah_id: "sch_01",
      jabatan_id: "pos_01",
      jabatan_nama: "Wakil Kepala Sekolah Kurikulum",
      jabatan_kode: "VICE_PRINCIPAL_CURRICULUM",
      unit_nama: "Bidang Kurikulum",
      personil_id: "usr_01",
      personil_nama: "Ahmad Dahlan, S.Pd.",
      personil_username: "guru_ahmad",
      berlaku_mulai: new Date("2026-07-01"),
      berlaku_sampai: new Date("2027-06-30"),
      status: "AKTIF",
      catatan: "SK No. 421/01/2026",
      created_at: new Date(),
      updated_at: new Date(),
    },
  ];

  const mockPersonnel: PersonilOptionDTO[] = [
    {
      id: "usr_01",
      username: "guru_ahmad",
      nama_lengkap: "Ahmad Dahlan, S.Pd.",
      peran_dasar: "TEACHER",
      status_akun: "AKTIF",
    },
  ];

  it("renders SchoolManagementTabs and switches between tabs seamlessly", () => {
    render(
      <SchoolManagementTabs
        profile={mockProfile}
        units={mockUnits}
        positions={mockPositions}
        assignments={mockAssignments}
        personnel={mockPersonnel}
        canManageSchool={true}
        canViewStructure={true}
        canManageStructure={true}
      />
    );

    // Initial tab: Profil Sekolah
    expect(screen.getByText("Identitas & Profil Sekolah")).toBeInTheDocument();
    expect(screen.getByDisplayValue("SMA Negeri 1 Nusantara")).toBeInTheDocument();

    // Click tab: Unit Organisasi
    fireEvent.click(screen.getByText(/Unit Organisasi/i));
    expect(screen.getByText("Unit & Bagian Organisasi")).toBeInTheDocument();
    expect(screen.getAllByText("Bidang Kurikulum")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Tata Usaha")[0]).toBeInTheDocument();

    // Click tab: Master Jabatan
    fireEvent.click(screen.getByText(/Master Jabatan/i));
    expect(screen.getByText("Master Jabatan Struktural")).toBeInTheDocument();
    expect(screen.getAllByText("Wakil Kepala Sekolah Kurikulum")[0]).toBeInTheDocument();

    // Click tab: Penugasan
    fireEvent.click(screen.getByRole("button", { name: /Penugasan/i }));
    expect(screen.getByText("Penugasan Jabatan Struktural")).toBeInTheDocument();
    expect(screen.getAllByText("Ahmad Dahlan, S.Pd.")[0]).toBeInTheDocument();
  });

  it("hides structure tabs entirely when actor lacks canViewStructure (Data Isolation)", () => {
    render(
      <SchoolManagementTabs
        profile={mockProfile}
        units={mockUnits}
        positions={mockPositions}
        assignments={mockAssignments}
        personnel={mockPersonnel}
        canManageSchool={false}
        canViewStructure={false}
        canManageStructure={false}
      />
    );

    // Only Profil Sekolah tab is available
    expect(screen.getByRole("button", { name: /Profil Sekolah/i })).toBeInTheDocument();
    expect(screen.queryByText(/Unit Organisasi/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Master Jabatan/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Penugasan Personil/i)).not.toBeInTheDocument();
  });

  it("renders SchoolProfileForm in read-only state for viewers without manage permission", () => {
    render(<SchoolProfileForm initialProfile={mockProfile} canManage={false} />);

    expect(screen.getByDisplayValue("SMA Negeri 1 Nusantara")).toBeDisabled();
    expect(screen.getByDisplayValue("20108899")).toBeDisabled();
    expect(screen.queryByText("Simpan Perubahan")).not.toBeInTheDocument();
  });

  it("renders OrganizationUnitsView without create/edit/delete buttons when canManage is false", () => {
    render(<OrganizationUnitsView initialUnits={mockUnits} canManage={false} />);

    expect(screen.queryByText(/Tambah Unit/i)).not.toBeInTheDocument();
    expect(screen.queryByText("Edit")).not.toBeInTheDocument();
    expect(screen.queryByText("Hapus")).not.toBeInTheDocument();
    expect(screen.getAllByText("Bidang Kurikulum")[0]).toBeInTheDocument();
  });

  it("renders PositionsView without create/edit/delete buttons when canManage is false", () => {
    render(<PositionsView initialPositions={mockPositions} units={mockUnits} canManage={false} />);

    expect(screen.queryByText(/Tambah Jabatan/i)).not.toBeInTheDocument();
    expect(screen.queryByText("Edit")).not.toBeInTheDocument();
    expect(screen.queryByText("Hapus")).not.toBeInTheDocument();
    expect(screen.getAllByText("Wakil Kepala Sekolah Kurikulum")[0]).toBeInTheDocument();
  });

  it("renders PositionAssignmentsView without assign/end/cancel actions when canManage is false", () => {
    render(
      <PositionAssignmentsView
        initialAssignments={mockAssignments}
        positions={mockPositions}
        personnel={mockPersonnel}
        canManage={false}
      />
    );

    expect(screen.queryByText(/Tugaskan Personil/i)).not.toBeInTheDocument();
    expect(screen.queryByText("Akhiri")).not.toBeInTheDocument();
    expect(screen.queryByText("Batalkan")).not.toBeInTheDocument();
    expect(screen.getAllByText("Ahmad Dahlan, S.Pd.")[0]).toBeInTheDocument();
  });

  it("opens modal on '+ Tambah Unit' click in OrganizationUnitsView", () => {
    render(<OrganizationUnitsView initialUnits={mockUnits} canManage={true} />);

    fireEvent.click(screen.getByText(/Tambah Unit/i));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Tambah Unit Organisasi")).toBeInTheDocument();
  });

  it("opens modal on '+ Tambah Jabatan' click in PositionsView", () => {
    render(<PositionsView initialPositions={mockPositions} units={mockUnits} canManage={true} />);

    fireEvent.click(screen.getByText(/Tambah Jabatan/i));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Tambah Jabatan Struktural")).toBeInTheDocument();
  });

  it("opens modal on '+ Tugaskan Personil' click in PositionAssignmentsView", () => {
    render(
      <PositionAssignmentsView
        initialAssignments={mockAssignments}
        positions={mockPositions}
        personnel={mockPersonnel}
        canManage={true}
      />
    );

    fireEvent.click(screen.getByText(/Tugaskan Personil/i));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Tugaskan Personil ke Jabatan")).toBeInTheDocument();
  });
});

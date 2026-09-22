import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AnnouncementDirectoryView } from "@/modules/communication/presentation/announcement-directory-view";
import { CreateAnnouncementModal } from "@/modules/communication/presentation/create-announcement-modal";
import { AnnouncementDetailModal } from "@/modules/communication/presentation/announcement-detail-modal";
import { NotificationEntry } from "@/shared/components/shell/notification-entry";
import { AnnouncementItem } from "@/modules/communication/domain/communication-types";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

// Mock communication actions
vi.mock("@/app/actions/communication-actions", () => ({
  createAnnouncementAction: vi.fn().mockResolvedValue({ success: true, message: "OK" }),
  updateAnnouncementAction: vi.fn().mockResolvedValue({ success: true, message: "OK" }),
  publishAnnouncementAction: vi.fn().mockResolvedValue({ success: true, message: "OK" }),
  archiveAnnouncementAction: vi.fn().mockResolvedValue({ success: true, message: "OK" }),
  deleteAnnouncementAction: vi.fn().mockResolvedValue({ success: true, message: "OK" }),
}));

// Mock notification actions
vi.mock("@/app/actions/notification-actions", () => ({
  getNotificationSummaryAction: vi.fn().mockResolvedValue({
    success: true,
    data: {
      unread_count: 2,
      items: [
        {
          id: "NOTIF_01",
          judul: "Pengumuman Baru",
          pesan: "Jadwal ATS Ganjil telah terbit",
          tipe: "PENGUMUMAN_BARU",
          tautan_url: "/pengumuman",
          apakah_dibaca: false,
          created_at: new Date(),
        },
        {
          id: "NOTIF_02",
          judul: "Selamat Datang",
          pesan: "Selamat menggunakan platform Ruang Pintar",
          tipe: "SISTEM",
          tautan_url: "/dashboard",
          apakah_dibaca: true,
          created_at: new Date(),
        },
      ],
    },
  }),
  markNotificationReadAction: vi.fn().mockResolvedValue({ success: true }),
  markAllNotificationsReadAction: vi.fn().mockResolvedValue({ success: true, data: { count: 2 } }),
}));

const mockAnnouncements: AnnouncementItem[] = [
  {
    id: "ANN_01",
    sekolah_id: "SCH_01",
    penulis_id: "USR_ADMIN",
    penulis: { id: "USR_ADMIN", nama_lengkap: "Budi Administrator", peran_dasar: "SUPER_ADMIN" },
    judul: "Jadwal Asesmen Tengah Semester Ganjil",
    konten: "Pelaksanaan ATS akan dimulai pekan depan secara digital.",
    kategori: "AKADEMIK",
    status: "PUBLISHED",
    apakah_disematkan: true,
    lampiran_url: null,
    target_audiens: "SEMUA",
    target_rombel_id: null,
    dipublikasikan_pada: new Date("2026-09-08"),
    created_at: new Date("2026-09-08"),
    updated_at: new Date("2026-09-08"),
  },
  {
    id: "ANN_02",
    sekolah_id: "SCH_01",
    penulis_id: "USR_ADMIN",
    penulis: { id: "USR_ADMIN", nama_lengkap: "Budi Administrator", peran_dasar: "SUPER_ADMIN" },
    judul: "Workshop Guru Digital Learning",
    konten: "Pelatihan khusus dewan guru bertempat di lab multimedia.",
    kategori: "KEGIATAN",
    status: "PUBLISHED",
    apakah_disematkan: false,
    lampiran_url: null,
    target_audiens: "GURU",
    target_rombel_id: null,
    dipublikasikan_pada: new Date("2026-09-09"),
    created_at: new Date("2026-09-09"),
    updated_at: new Date("2026-09-09"),
  },
];

describe("M16 & M17 Presentation Views — Academic Glass UI v1.2", () => {
  it("merender AnnouncementDirectoryView dengan benar", () => {
    render(<AnnouncementDirectoryView announcements={mockAnnouncements} canManage={true} />);

    expect(screen.getByText("Pengumuman & Edaran Resmi")).toBeDefined();
    expect(screen.getByText("Jadwal Asesmen Tengah Semester Ganjil")).toBeDefined();
    expect(screen.getByText("Workshop Guru Digital Learning")).toBeDefined();
    expect(screen.getByText("Buat Pengumuman")).toBeDefined();
  });

  it("memfilter pengumuman berdasarkan kategori", () => {
    render(<AnnouncementDirectoryView announcements={mockAnnouncements} canManage={false} />);

    // Filter kategori Kegiatan
    const kegiatanTab = screen.getByRole("button", { name: "Kegiatan" });
    fireEvent.click(kegiatanTab);

    expect(screen.getByText("Workshop Guru Digital Learning")).toBeDefined();
    expect(screen.queryByText("Jadwal Asesmen Tengah Semester Ganjil")).toBeNull();
  });

  it("memfilter pengumuman berdasarkan input pencarian", () => {
    render(<AnnouncementDirectoryView announcements={mockAnnouncements} canManage={false} />);

    const searchInput = screen.getByPlaceholderText(/Cari pengumuman/i);
    fireEvent.change(searchInput, { target: { value: "Workshop" } });

    expect(screen.getByText("Workshop Guru Digital Learning")).toBeDefined();
    expect(screen.queryByText("Jadwal Asesmen Tengah Semester Ganjil")).toBeNull();
  });

  it("merender CreateAnnouncementModal dan memvalidasi input", async () => {
    render(<CreateAnnouncementModal isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByText("Buat Pengumuman Baru")).toBeDefined();

    // Klik Terbitkan dengan input kosong
    const submitBtn = screen.getByRole("button", { name: /Terbitkan Sekarang/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Judul pengumuman minimal 3 karakter/i)).toBeDefined();
    });
  });

  it("merender AnnouncementDetailModal dengan rincian lengkap", () => {
    render(
      <AnnouncementDetailModal
        isOpen={true}
        announcement={mockAnnouncements[0]}
        onClose={vi.fn()}
        canManage={true}
      />
    );

    expect(screen.getByText("Jadwal Asesmen Tengah Semester Ganjil")).toBeDefined();
    expect(
      screen.getByText("Pelaksanaan ATS akan dimulai pekan depan secara digital.")
    ).toBeDefined();
    expect(screen.getByText("Budi Administrator (SUPER_ADMIN)")).toBeDefined();
    expect(screen.getByText("Arsipkan")).toBeDefined();
    expect(screen.getByText("Hapus")).toBeDefined();
  });

  it("merender NotificationEntry dan menampilkan unread badge live", async () => {
    render(<NotificationEntry />);

    // Tunggu fetching mock selesai
    await waitFor(() => {
      expect(screen.getByText("2")).toBeDefined(); // unread count badge
    });

    // Buka popover
    const bellBtn = screen.getByLabelText("Pemberitahuan Sistem");
    fireEvent.click(bellBtn);

    await waitFor(() => {
      expect(screen.getByText("Pemberitahuan")).toBeDefined();
      expect(screen.getByText("2 belum dibaca")).toBeDefined();
      expect(screen.getByText("Jadwal ATS Ganjil telah terbit")).toBeDefined();
    });
  });
});

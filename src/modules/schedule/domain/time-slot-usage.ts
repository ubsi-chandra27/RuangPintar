import type { TimeSlotUsage } from "./schedule-types";

export function summarizeTimeSlotUsage(
  entries: { versi_jadwal: { status: string }; _count: { sesi_aktual: number } }[]
): TimeSlotUsage {
  return {
    total: entries.length,
    draft: entries.filter((entry) => entry.versi_jadwal.status === "DRAFT").length,
    published: entries.filter((entry) => entry.versi_jadwal.status === "PUBLISHED").length,
    archived: entries.filter((entry) => entry.versi_jadwal.status === "ARCHIVED").length,
    sessions: entries.reduce((total, entry) => total + entry._count.sesi_aktual, 0),
  };
}

export function timeSlotEditLockReason(usage?: TimeSlotUsage): string | null {
  if (!usage) return "Informasi pemakaian belum tersedia. Muat ulang halaman.";
  if (usage.archived || usage.sessions) {
    return `Slot terkait ${usage.archived} alokasi arsip dan ${usage.sessions} sesi kelas. Perubahan dikunci untuk menjaga riwayat. Buat slot baru untuk jadwal berikutnya.`;
  }
  return null;
}

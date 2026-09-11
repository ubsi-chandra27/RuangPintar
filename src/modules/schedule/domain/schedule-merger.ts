/**
 * Ruang Pintar — Schedule Slot Merger Utility
 *
 * Menggabungkan slot waktu berurutan (consecutive slots) untuk hari, rombel,
 * mapel, dan ruangan yang sama menjadi 1 unified block kartu.
 *
 * Murni komputasi data tanpa dependensi client/browser sehingga aman dipanggil
 * baik dari Server Component maupun Client Component.
 */

import { HariBelajar, ScheduleEntryDTO } from "./schedule-types";

export interface MergedScheduleBlock {
  key: string;
  hari: HariBelajar;
  mata_pelajaran_id: string;
  mata_pelajaran_nama: string;
  mata_pelajaran_kode: string;
  rombel_id: string;
  rombel_nama: string;
  tingkat_nama?: string | null;
  guru_id: string;
  guru_nama: string;
  ruangan?: string | null;
  tahun_ajaran_id: string;
  semester_id?: string | null;
  penugasan_mengajar_id: string;
  jam_mulai: string;
  jam_selesai: string;
  total_jp: number;
  slot_range_label: string;
  entries: ScheduleEntryDTO[];
  primary_entry: ScheduleEntryDTO;
}

const HARI_ORDER: Record<string, number> = {
  SENIN: 1,
  SELASA: 2,
  RABU: 3,
  KAMIS: 4,
  JUMAT: 5,
  SABTU: 6,
  MINGGU: 7,
};

/**
 * Menggabungkan slot waktu berurutan (consecutive slots) untuk hari, rombel,
 * mapel, dan ruangan yang sama menjadi 1 unified block kartu.
 */
export function mergeConsecutiveScheduleEntries(
  rawEntries: ScheduleEntryDTO[]
): MergedScheduleBlock[] {
  if (!rawEntries || rawEntries.length === 0) return [];

  const sorted = [...rawEntries].sort((a, b) => {
    const dayDiff = (HARI_ORDER[a.hari] || 99) - (HARI_ORDER[b.hari] || 99);
    if (dayDiff !== 0) return dayDiff;

    const timeDiff = (a.slot_waktu_jam_mulai || "").localeCompare(b.slot_waktu_jam_mulai || "");
    if (timeDiff !== 0) return timeDiff;

    return (a.slot_waktu_urutan || 0) - (b.slot_waktu_urutan || 0);
  });

  const blocks: MergedScheduleBlock[] = [];

  for (const entry of sorted) {
    const prevBlock = blocks[blocks.length - 1];

    const isSameDay = prevBlock && prevBlock.hari === entry.hari;
    const isSameSubject = prevBlock && prevBlock.mata_pelajaran_id === entry.mata_pelajaran_id;
    const isSameRombel = prevBlock && prevBlock.rombel_id === entry.rombel_id;
    const isSameRuangan = prevBlock && (prevBlock.ruangan || "") === (entry.ruangan || "");

    const lastEntry = prevBlock?.entries[prevBlock.entries.length - 1];
    const isConsecutiveTime =
      prevBlock &&
      (prevBlock.jam_selesai === entry.slot_waktu_jam_mulai ||
        (entry.slot_waktu_urutan &&
          lastEntry?.slot_waktu_urutan &&
          entry.slot_waktu_urutan === lastEntry.slot_waktu_urutan + 1));

    if (isSameDay && isSameSubject && isSameRombel && isSameRuangan && isConsecutiveTime) {
      // Perpanjang jam selesai dan jumlah JP blok
      prevBlock.jam_selesai = entry.slot_waktu_jam_selesai;
      prevBlock.total_jp += 1;
      prevBlock.entries.push(entry);

      const firstSlotNum = prevBlock.entries[0].slot_waktu_urutan || 1;
      const lastSlotNum = entry.slot_waktu_urutan || firstSlotNum + prevBlock.total_jp - 1;
      prevBlock.slot_range_label = `Jam ke-${firstSlotNum} – ${lastSlotNum}`;
    } else {
      // Buat blok jadwal baru
      const slotNum = entry.slot_waktu_urutan || 1;
      blocks.push({
        key: `${entry.id}_${entry.hari}_${entry.mata_pelajaran_id}_${entry.rombel_id}_${entry.slot_waktu_jam_mulai}`,
        hari: entry.hari,
        mata_pelajaran_id: entry.mata_pelajaran_id,
        mata_pelajaran_nama: entry.mata_pelajaran_nama,
        mata_pelajaran_kode: entry.mata_pelajaran_kode,
        rombel_id: entry.rombel_id,
        rombel_nama: entry.rombel_nama,
        tingkat_nama: entry.tingkat_nama,
        guru_id: entry.guru_id,
        guru_nama: entry.guru_nama,
        ruangan: entry.ruangan,
        tahun_ajaran_id: entry.tahun_ajaran_id,
        semester_id: entry.semester_id,
        penugasan_mengajar_id: entry.penugasan_mengajar_id,
        jam_mulai: entry.slot_waktu_jam_mulai,
        jam_selesai: entry.slot_waktu_jam_selesai,
        total_jp: 1,
        slot_range_label: entry.slot_waktu_nama || `Jam ke-${slotNum}`,
        entries: [entry],
        primary_entry: entry,
      });
    }
  }

  return blocks;
}

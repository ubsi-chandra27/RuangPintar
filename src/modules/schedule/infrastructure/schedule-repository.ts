/**
 * Ruang Pintar — M10 Scheduling & Class Session Repository Layer
 */

import { prisma } from "@/shared/infrastructure/database/prisma";
import {
  runInTransaction,
  type TransactionClient,
} from "@/shared/infrastructure/database/transaction";
import { summarizeTimeSlotUsage } from "../domain/time-slot-usage";
import { generateUlid } from "@/shared/lib/ulid";
import {
  ClassSessionDTO,
  CreateScheduleEntryInput,
  CreateScheduleVersionInput,
  CreateTimeSlotInput,
  HariBelajar,
  OpenClassSessionInput,
  ScheduleEntryDTO,
  ScheduleVersionDTO,
  StatusSesiKelas,
  TimeSlotDTO,
} from "../domain/schedule-types";

const timeSlotUsageInclude = {
  jadwal: {
    select: {
      versi_jadwal: { select: { status: true } },
      _count: { select: { sesi_aktual: true } },
    },
  },
} as const;

export class ScheduleRepository {
  constructor(private readonly db: TransactionClient = prisma) {}

  async withTransaction<T>(
    work: (repository: ScheduleRepository, db: TransactionClient) => Promise<T>
  ): Promise<T> {
    return runInTransaction((db) => work(new ScheduleRepository(db), db));
  }

  async updateTimeSlot(id: string, data: CreateTimeSlotInput): Promise<TimeSlotDTO> {
    return this.db.slotWaktu.update({ where: { id, sekolah_id: data.sekolah_id }, data });
  }

  async deleteTimeSlot(id: string, sekolah_id: string): Promise<void> {
    await this.db.slotWaktu.delete({ where: { id, sekolah_id } });
  }

  async listActiveScheduleVersionIds(sekolah_id: string): Promise<string[]> {
    const versions = await this.db.versiJadwal.findMany({
      where: { sekolah_id, status: { in: ["DRAFT", "PUBLISHED"] } },
      select: { id: true },
    });
    return versions.map((version) => version.id);
  }
  async updateEntry(
    id: string,
    input: CreateScheduleEntryInput,
    derived: {
      tahun_ajaran_id: string;
      semester_id?: string | null;
      guru_id: string;
      mata_pelajaran_id: string;
    }
  ): Promise<ScheduleEntryDTO> {
    await this.db.jadwalPelajaran.update({
      where: { id, sekolah_id: input.sekolah_id },
      data: { ...input, ...derived },
    });
    return (await this.findEntryById(id, input.sekolah_id))!;
  }
  // ==========================================
  // TIME SLOTS
  // ==========================================

  async findTimeSlotById(id: string, sekolah_id: string): Promise<TimeSlotDTO | null> {
    const record = await this.db.slotWaktu.findFirst({
      where: { id, sekolah_id },
      include: timeSlotUsageInclude,
    });
    if (!record) return null;
    return {
      id: record.id,
      sekolah_id: record.sekolah_id,
      nama: record.nama,
      kode: record.kode,
      urutan: record.urutan,
      jam_mulai: record.jam_mulai,
      jam_selesai: record.jam_selesai,
      is_istirahat: record.is_istirahat,
      is_upacara: record.is_upacara,
      hari_khusus: record.hari_khusus,
      status_aktif: record.status_aktif,
      created_at: record.created_at,
      updated_at: record.updated_at,
      penggunaan: summarizeTimeSlotUsage(record.jadwal),
    };
  }

  async listTimeSlots(sekolah_id: string): Promise<TimeSlotDTO[]> {
    const records = await this.db.slotWaktu.findMany({
      where: { sekolah_id },
      include: timeSlotUsageInclude,
      orderBy: { urutan: "asc" },
    });
    return records.map((r) => ({
      id: r.id,
      sekolah_id: r.sekolah_id,
      nama: r.nama,
      kode: r.kode,
      urutan: r.urutan,
      jam_mulai: r.jam_mulai,
      jam_selesai: r.jam_selesai,
      is_istirahat: r.is_istirahat,
      is_upacara: r.is_upacara,
      hari_khusus: r.hari_khusus,
      status_aktif: r.status_aktif,
      created_at: r.created_at,
      updated_at: r.updated_at,
      penggunaan: summarizeTimeSlotUsage(r.jadwal),
    }));
  }

  async createTimeSlot(data: CreateTimeSlotInput): Promise<TimeSlotDTO> {
    const id = generateUlid();
    const record = await this.db.slotWaktu.create({
      data: {
        id,
        sekolah_id: data.sekolah_id,
        nama: data.nama,
        kode: data.kode,
        urutan: data.urutan ?? 1,
        jam_mulai: data.jam_mulai,
        jam_selesai: data.jam_selesai,
        is_istirahat: data.is_istirahat ?? false,
        is_upacara: data.is_upacara ?? false,
        hari_khusus: data.hari_khusus || null,
        status_aktif: data.status_aktif ?? true,
      },
    });
    return {
      id: record.id,
      sekolah_id: record.sekolah_id,
      nama: record.nama,
      kode: record.kode,
      urutan: record.urutan,
      jam_mulai: record.jam_mulai,
      jam_selesai: record.jam_selesai,
      is_istirahat: record.is_istirahat,
      is_upacara: record.is_upacara,
      hari_khusus: record.hari_khusus,
      status_aktif: record.status_aktif,
      created_at: record.created_at,
      updated_at: record.updated_at,
    };
  }

  // ==========================================
  // SCHEDULE VERSIONS
  // ==========================================

  async findVersionById(id: string, sekolah_id: string): Promise<ScheduleVersionDTO | null> {
    const record = await this.db.versiJadwal.findFirst({
      where: { id, sekolah_id },
      include: {
        tahun_ajaran: true,
        semester: true,
        _count: {
          select: { jadwal: true },
        },
      },
    });
    if (!record) return null;
    return {
      id: record.id,
      sekolah_id: record.sekolah_id,
      tahun_ajaran_id: record.tahun_ajaran_id,
      tahun_ajaran_nama: record.tahun_ajaran.nama,
      semester_id: record.semester_id,
      semester_nama: record.semester?.nama ?? null,
      nomor_versi: record.nomor_versi,
      nama: record.nama,
      status: record.status as any,
      tanggal_publikasi: record.tanggal_publikasi,
      dipublikasikan_oleh: record.dipublikasikan_oleh,
      catatan: record.catatan,
      total_entri: record._count.jadwal,
      created_at: record.created_at,
      updated_at: record.updated_at,
    };
  }

  async listVersions(sekolah_id: string, tahun_ajaran_id?: string): Promise<ScheduleVersionDTO[]> {
    const where: any = { sekolah_id };
    if (tahun_ajaran_id && tahun_ajaran_id !== "ALL") {
      where.tahun_ajaran_id = tahun_ajaran_id;
    }
    const records = await this.db.versiJadwal.findMany({
      where,
      include: {
        tahun_ajaran: true,
        semester: true,
        _count: {
          select: { jadwal: true },
        },
      },
      orderBy: [{ tahun_ajaran: { tanggal_mulai: "desc" } }, { nomor_versi: "desc" }],
    });
    return records.map((r) => ({
      id: r.id,
      sekolah_id: r.sekolah_id,
      tahun_ajaran_id: r.tahun_ajaran_id,
      tahun_ajaran_nama: r.tahun_ajaran.nama,
      semester_id: r.semester_id,
      semester_nama: r.semester?.nama ?? null,
      nomor_versi: r.nomor_versi,
      nama: r.nama,
      status: r.status as any,
      tanggal_publikasi: r.tanggal_publikasi,
      dipublikasikan_oleh: r.dipublikasikan_oleh,
      catatan: r.catatan,
      total_entri: r._count.jadwal,
      created_at: r.created_at,
      updated_at: r.updated_at,
    }));
  }

  async getPublishedVersion(
    sekolah_id: string,
    tahun_ajaran_id: string
  ): Promise<ScheduleVersionDTO | null> {
    const record = await this.db.versiJadwal.findFirst({
      where: {
        sekolah_id,
        tahun_ajaran_id,
        status: "PUBLISHED",
      },
      include: {
        tahun_ajaran: true,
        semester: true,
        _count: {
          select: { jadwal: true },
        },
      },
      orderBy: { nomor_versi: "desc" },
    });
    if (!record) return null;
    return {
      id: record.id,
      sekolah_id: record.sekolah_id,
      tahun_ajaran_id: record.tahun_ajaran_id,
      tahun_ajaran_nama: record.tahun_ajaran.nama,
      semester_id: record.semester_id,
      semester_nama: record.semester?.nama ?? null,
      nomor_versi: record.nomor_versi,
      nama: record.nama,
      status: record.status as any,
      tanggal_publikasi: record.tanggal_publikasi,
      dipublikasikan_oleh: record.dipublikasikan_oleh,
      catatan: record.catatan,
      total_entri: record._count.jadwal,
      created_at: record.created_at,
      updated_at: record.updated_at,
    };
  }

  async createVersion(data: CreateScheduleVersionInput): Promise<ScheduleVersionDTO> {
    // Get next version number
    const lastVersion = await this.db.versiJadwal.findFirst({
      where: {
        sekolah_id: data.sekolah_id,
        tahun_ajaran_id: data.tahun_ajaran_id,
      },
      orderBy: { nomor_versi: "desc" },
    });
    const nomor_versi = (lastVersion?.nomor_versi || 0) + 1;

    const id = generateUlid();
    const record = await this.db.versiJadwal.create({
      data: {
        id,
        sekolah_id: data.sekolah_id,
        tahun_ajaran_id: data.tahun_ajaran_id,
        semester_id: data.semester_id || null,
        nomor_versi,
        nama: data.nama,
        status: "DRAFT",
        catatan: data.catatan || null,
      },
      include: {
        tahun_ajaran: true,
        semester: true,
      },
    });

    return {
      id: record.id,
      sekolah_id: record.sekolah_id,
      tahun_ajaran_id: record.tahun_ajaran_id,
      tahun_ajaran_nama: record.tahun_ajaran.nama,
      semester_id: record.semester_id,
      semester_nama: record.semester?.nama ?? null,
      nomor_versi: record.nomor_versi,
      nama: record.nama,
      status: record.status as any,
      tanggal_publikasi: record.tanggal_publikasi,
      dipublikasikan_oleh: record.dipublikasikan_oleh,
      catatan: record.catatan,
      total_entri: 0,
      created_at: record.created_at,
      updated_at: record.updated_at,
    };
  }

  async publishVersion(
    id: string,
    sekolah_id: string,
    publisherName: string
  ): Promise<ScheduleVersionDTO> {
    const version = await this.db.versiJadwal.findFirst({
      where: { id, sekolah_id },
    });
    if (!version) throw new Error("Versi jadwal tidak ditemukan");

    // Archive previous published versions in the same academic year
    await this.db.versiJadwal.updateMany({
      where: {
        sekolah_id,
        tahun_ajaran_id: version.tahun_ajaran_id,
        status: "PUBLISHED",
      },
      data: {
        status: "ARCHIVED",
      },
    });

    // Set this version as PUBLISHED
    const record = await this.db.versiJadwal.update({
      where: { id },
      data: {
        status: "PUBLISHED",
        tanggal_publikasi: new Date(),
        dipublikasikan_oleh: publisherName,
      },
      include: {
        tahun_ajaran: true,
        semester: true,
        _count: { select: { jadwal: true } },
      },
    });

    return {
      id: record.id,
      sekolah_id: record.sekolah_id,
      tahun_ajaran_id: record.tahun_ajaran_id,
      tahun_ajaran_nama: record.tahun_ajaran.nama,
      semester_id: record.semester_id,
      semester_nama: record.semester?.nama ?? null,
      nomor_versi: record.nomor_versi,
      nama: record.nama,
      status: record.status as any,
      tanggal_publikasi: record.tanggal_publikasi,
      dipublikasikan_oleh: record.dipublikasikan_oleh,
      catatan: record.catatan,
      total_entri: record._count.jadwal,
      created_at: record.created_at,
      updated_at: record.updated_at,
    };
  }

  // ==========================================
  // SCHEDULE ENTRIES (MASTER SCHEDULE)
  // ==========================================

  async findEntryById(id: string, sekolah_id: string): Promise<ScheduleEntryDTO | null> {
    const record = await this.db.jadwalPelajaran.findFirst({
      where: { id, sekolah_id },
      include: {
        versi_jadwal: true,
        tahun_ajaran: true,
        semester: true,
        rombel: { include: { tingkat: true } },
        guru: true,
        mata_pelajaran: true,
        slot_waktu: true,
      },
    });
    if (!record) return null;
    return {
      id: record.id,
      sekolah_id: record.sekolah_id,
      versi_jadwal_id: record.versi_jadwal_id,
      versi_jadwal_nama: record.versi_jadwal.nama,
      versi_jadwal_status: record.versi_jadwal.status as any,
      tahun_ajaran_id: record.tahun_ajaran_id,
      tahun_ajaran_nama: record.tahun_ajaran.nama,
      semester_id: record.semester_id,
      semester_nama: record.semester?.nama ?? null,
      rombel_id: record.rombel_id,
      rombel_nama: record.rombel.nama,
      tingkat_nama: record.rombel.tingkat?.nama ?? null,
      penugasan_mengajar_id: record.penugasan_mengajar_id,
      guru_id: record.guru_id,
      guru_nama: record.guru.nama_lengkap,
      guru_nip: record.guru.nip,
      guru_foto_url: record.guru.foto_url,
      mata_pelajaran_id: record.mata_pelajaran_id,
      mata_pelajaran_nama: record.mata_pelajaran.nama,
      mata_pelajaran_kode: record.mata_pelajaran.kode,
      slot_waktu_id: record.slot_waktu_id,
      slot_waktu_nama: record.slot_waktu.nama,
      slot_waktu_jam_mulai: record.slot_waktu.jam_mulai,
      slot_waktu_jam_selesai: record.slot_waktu.jam_selesai,
      slot_waktu_urutan: record.slot_waktu.urutan,
      hari: record.hari as HariBelajar,
      ruangan: record.ruangan,
      catatan: record.catatan,
      created_at: record.created_at,
      updated_at: record.updated_at,
    };
  }

  async listEntriesByVersion(
    versi_jadwal_id: string,
    sekolah_id: string
  ): Promise<ScheduleEntryDTO[]> {
    const records = await this.db.jadwalPelajaran.findMany({
      where: { versi_jadwal_id, sekolah_id },
      include: {
        versi_jadwal: true,
        tahun_ajaran: true,
        semester: true,
        rombel: { include: { tingkat: true } },
        guru: true,
        mata_pelajaran: true,
        slot_waktu: true,
      },
      orderBy: [{ hari: "asc" }, { slot_waktu: { urutan: "asc" } }],
    });

    return records.map((record) => ({
      id: record.id,
      sekolah_id: record.sekolah_id,
      versi_jadwal_id: record.versi_jadwal_id,
      versi_jadwal_nama: record.versi_jadwal.nama,
      versi_jadwal_status: record.versi_jadwal.status as any,
      tahun_ajaran_id: record.tahun_ajaran_id,
      tahun_ajaran_nama: record.tahun_ajaran.nama,
      semester_id: record.semester_id,
      semester_nama: record.semester?.nama ?? null,
      rombel_id: record.rombel_id,
      rombel_nama: record.rombel.nama,
      tingkat_nama: record.rombel.tingkat?.nama ?? null,
      penugasan_mengajar_id: record.penugasan_mengajar_id,
      guru_id: record.guru_id,
      guru_nama: record.guru.nama_lengkap,
      guru_nip: record.guru.nip,
      guru_foto_url: record.guru.foto_url,
      mata_pelajaran_id: record.mata_pelajaran_id,
      mata_pelajaran_nama: record.mata_pelajaran.nama,
      mata_pelajaran_kode: record.mata_pelajaran.kode,
      slot_waktu_id: record.slot_waktu_id,
      slot_waktu_nama: record.slot_waktu.nama,
      slot_waktu_jam_mulai: record.slot_waktu.jam_mulai,
      slot_waktu_jam_selesai: record.slot_waktu.jam_selesai,
      slot_waktu_urutan: record.slot_waktu.urutan,
      hari: record.hari as HariBelajar,
      ruangan: record.ruangan,
      catatan: record.catatan,
      created_at: record.created_at,
      updated_at: record.updated_at,
    }));
  }

  async listEntriesByTeacher(
    guru_id: string,
    sekolah_id: string,
    publishedOnly = true
  ): Promise<ScheduleEntryDTO[]> {
    const where: any = {
      guru_id,
      sekolah_id,
    };
    if (publishedOnly) {
      where.versi_jadwal = { status: "PUBLISHED" };
    }

    const records = await this.db.jadwalPelajaran.findMany({
      where,
      include: {
        versi_jadwal: true,
        tahun_ajaran: true,
        semester: true,
        rombel: { include: { tingkat: true } },
        guru: true,
        mata_pelajaran: true,
        slot_waktu: true,
      },
      orderBy: [{ hari: "asc" }, { slot_waktu: { urutan: "asc" } }],
    });

    return records.map((record) => ({
      id: record.id,
      sekolah_id: record.sekolah_id,
      versi_jadwal_id: record.versi_jadwal_id,
      versi_jadwal_nama: record.versi_jadwal.nama,
      versi_jadwal_status: record.versi_jadwal.status as any,
      tahun_ajaran_id: record.tahun_ajaran_id,
      tahun_ajaran_nama: record.tahun_ajaran.nama,
      semester_id: record.semester_id,
      semester_nama: record.semester?.nama ?? null,
      rombel_id: record.rombel_id,
      rombel_nama: record.rombel.nama,
      tingkat_nama: record.rombel.tingkat?.nama ?? null,
      penugasan_mengajar_id: record.penugasan_mengajar_id,
      guru_id: record.guru_id,
      guru_nama: record.guru.nama_lengkap,
      guru_nip: record.guru.nip,
      guru_foto_url: record.guru.foto_url,
      mata_pelajaran_id: record.mata_pelajaran_id,
      mata_pelajaran_nama: record.mata_pelajaran.nama,
      mata_pelajaran_kode: record.mata_pelajaran.kode,
      slot_waktu_id: record.slot_waktu_id,
      slot_waktu_nama: record.slot_waktu.nama,
      slot_waktu_jam_mulai: record.slot_waktu.jam_mulai,
      slot_waktu_jam_selesai: record.slot_waktu.jam_selesai,
      slot_waktu_urutan: record.slot_waktu.urutan,
      hari: record.hari as HariBelajar,
      ruangan: record.ruangan,
      catatan: record.catatan,
      created_at: record.created_at,
      updated_at: record.updated_at,
    }));
  }

  async createEntry(
    data: CreateScheduleEntryInput,
    derived: {
      tahun_ajaran_id: string;
      semester_id?: string | null;
      guru_id: string;
      mata_pelajaran_id: string;
    }
  ): Promise<ScheduleEntryDTO> {
    const id = generateUlid();
    const record = await this.db.jadwalPelajaran.create({
      data: {
        id,
        sekolah_id: data.sekolah_id,
        versi_jadwal_id: data.versi_jadwal_id,
        tahun_ajaran_id: derived.tahun_ajaran_id,
        semester_id: derived.semester_id || null,
        rombel_id: data.rombel_id,
        penugasan_mengajar_id: data.penugasan_mengajar_id,
        guru_id: derived.guru_id,
        mata_pelajaran_id: derived.mata_pelajaran_id,
        slot_waktu_id: data.slot_waktu_id,
        hari: data.hari,
        ruangan: data.ruangan || null,
        catatan: data.catatan || null,
      },
      include: {
        versi_jadwal: true,
        tahun_ajaran: true,
        semester: true,
        rombel: { include: { tingkat: true } },
        guru: true,
        mata_pelajaran: true,
        slot_waktu: true,
      },
    });

    return {
      id: record.id,
      sekolah_id: record.sekolah_id,
      versi_jadwal_id: record.versi_jadwal_id,
      versi_jadwal_nama: record.versi_jadwal.nama,
      versi_jadwal_status: record.versi_jadwal.status as any,
      tahun_ajaran_id: record.tahun_ajaran_id,
      tahun_ajaran_nama: record.tahun_ajaran.nama,
      semester_id: record.semester_id,
      semester_nama: record.semester?.nama ?? null,
      rombel_id: record.rombel_id,
      rombel_nama: record.rombel.nama,
      tingkat_nama: record.rombel.tingkat?.nama ?? null,
      penugasan_mengajar_id: record.penugasan_mengajar_id,
      guru_id: record.guru_id,
      guru_nama: record.guru.nama_lengkap,
      guru_nip: record.guru.nip,
      guru_foto_url: record.guru.foto_url,
      mata_pelajaran_id: record.mata_pelajaran_id,
      mata_pelajaran_nama: record.mata_pelajaran.nama,
      mata_pelajaran_kode: record.mata_pelajaran.kode,
      slot_waktu_id: record.slot_waktu_id,
      slot_waktu_nama: record.slot_waktu.nama,
      slot_waktu_jam_mulai: record.slot_waktu.jam_mulai,
      slot_waktu_jam_selesai: record.slot_waktu.jam_selesai,
      slot_waktu_urutan: record.slot_waktu.urutan,
      hari: record.hari as HariBelajar,
      ruangan: record.ruangan,
      catatan: record.catatan,
      created_at: record.created_at,
      updated_at: record.updated_at,
    };
  }

  async deleteEntry(id: string, sekolah_id: string): Promise<boolean> {
    await this.db.jadwalPelajaran.deleteMany({
      where: { id, sekolah_id },
    });
    return true;
  }

  // ==========================================
  // ACTUAL CLASS SESSIONS (SESI KELAS AKTUAL)
  // ==========================================

  async findSessionById(id: string, sekolah_id: string): Promise<ClassSessionDTO | null> {
    const record = await this.db.sesiKelasAktual.findFirst({
      where: { id, sekolah_id },
      include: {
        tahun_ajaran: true,
        semester: true,
        rombel: true,
        guru: true,
        guru_pengganti: true,
        mata_pelajaran: true,
      },
    });
    if (!record) return null;
    return {
      id: record.id,
      sekolah_id: record.sekolah_id,
      jadwal_pelajaran_id: record.jadwal_pelajaran_id,
      penugasan_mengajar_id: record.penugasan_mengajar_id,
      rombel_id: record.rombel_id,
      rombel_nama: record.rombel.nama,
      mata_pelajaran_id: record.mata_pelajaran_id,
      mata_pelajaran_nama: record.mata_pelajaran.nama,
      mata_pelajaran_kode: record.mata_pelajaran.kode,
      guru_id: record.guru_id,
      guru_nama: record.guru.nama_lengkap,
      guru_nip: record.guru.nip,
      guru_foto_url: record.guru.foto_url,
      guru_pengganti_id: record.guru_pengganti_id,
      guru_pengganti_nama: record.guru_pengganti?.nama_lengkap ?? null,
      tahun_ajaran_id: record.tahun_ajaran_id,
      tahun_ajaran_nama: record.tahun_ajaran.nama,
      semester_id: record.semester_id,
      tanggal: record.tanggal,
      jam_mulai_aktual: record.jam_mulai_aktual,
      jam_selesai_aktual: record.jam_selesai_aktual,
      status: record.status as StatusSesiKelas,
      ruangan_aktual: record.ruangan_aktual,
      topik_pembelajaran: record.topik_pembelajaran,
      catatan: record.catatan,
      created_at: record.created_at,
      updated_at: record.updated_at,
    };
  }

  async listSessions(
    sekolah_id: string,
    filters?: {
      guru_id?: string;
      rombel_id?: string;
      tanggal?: Date;
      status?: string;
    }
  ): Promise<ClassSessionDTO[]> {
    const where: any = { sekolah_id };
    if (filters?.guru_id) {
      where.OR = [{ guru_id: filters.guru_id }, { guru_pengganti_id: filters.guru_id }];
    }
    if (filters?.rombel_id && filters.rombel_id !== "ALL") {
      where.rombel_id = filters.rombel_id;
    }
    if (filters?.status && filters.status !== "ALL") {
      where.status = filters.status;
    }
    if (filters?.tanggal) {
      const startOfDay = new Date(filters.tanggal);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(filters.tanggal);
      endOfDay.setHours(23, 59, 59, 999);
      where.tanggal = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    const records = await this.db.sesiKelasAktual.findMany({
      where,
      include: {
        tahun_ajaran: true,
        semester: true,
        rombel: true,
        guru: true,
        guru_pengganti: true,
        mata_pelajaran: true,
      },
      orderBy: [{ tanggal: "desc" }, { created_at: "desc" }],
    });

    return records.map((record) => ({
      id: record.id,
      sekolah_id: record.sekolah_id,
      jadwal_pelajaran_id: record.jadwal_pelajaran_id,
      penugasan_mengajar_id: record.penugasan_mengajar_id,
      rombel_id: record.rombel_id,
      rombel_nama: record.rombel.nama,
      mata_pelajaran_id: record.mata_pelajaran_id,
      mata_pelajaran_nama: record.mata_pelajaran.nama,
      mata_pelajaran_kode: record.mata_pelajaran.kode,
      guru_id: record.guru_id,
      guru_nama: record.guru.nama_lengkap,
      guru_nip: record.guru.nip,
      guru_foto_url: record.guru.foto_url,
      guru_pengganti_id: record.guru_pengganti_id,
      guru_pengganti_nama: record.guru_pengganti?.nama_lengkap ?? null,
      tahun_ajaran_id: record.tahun_ajaran_id,
      tahun_ajaran_nama: record.tahun_ajaran.nama,
      semester_id: record.semester_id,
      tanggal: record.tanggal,
      jam_mulai_aktual: record.jam_mulai_aktual,
      jam_selesai_aktual: record.jam_selesai_aktual,
      status: record.status as StatusSesiKelas,
      ruangan_aktual: record.ruangan_aktual,
      topik_pembelajaran: record.topik_pembelajaran,
      catatan: record.catatan,
      created_at: record.created_at,
      updated_at: record.updated_at,
    }));
  }

  async openClassSession(data: OpenClassSessionInput): Promise<ClassSessionDTO> {
    const id = generateUlid();
    const now = new Date();
    const sessionDate = data.tanggal ? new Date(data.tanggal) : now;

    const record = await this.db.sesiKelasAktual.create({
      data: {
        id,
        sekolah_id: data.sekolah_id,
        jadwal_pelajaran_id: data.jadwal_pelajaran_id || null,
        penugasan_mengajar_id: data.penugasan_mengajar_id,
        rombel_id: data.rombel_id,
        mata_pelajaran_id: data.mata_pelajaran_id,
        guru_id: data.guru_id,
        guru_pengganti_id: data.guru_pengganti_id || null,
        tahun_ajaran_id: data.tahun_ajaran_id,
        semester_id: data.semester_id || null,
        tanggal: sessionDate,
        jam_mulai_aktual: now,
        status: "DIMULAI",
        ruangan_aktual: data.ruangan_aktual || null,
        topik_pembelajaran: data.topik_pembelajaran || null,
        catatan: data.catatan || null,
      },
      include: {
        tahun_ajaran: true,
        semester: true,
        rombel: true,
        guru: true,
        guru_pengganti: true,
        mata_pelajaran: true,
      },
    });

    return {
      id: record.id,
      sekolah_id: record.sekolah_id,
      jadwal_pelajaran_id: record.jadwal_pelajaran_id,
      penugasan_mengajar_id: record.penugasan_mengajar_id,
      rombel_id: record.rombel_id,
      rombel_nama: record.rombel.nama,
      mata_pelajaran_id: record.mata_pelajaran_id,
      mata_pelajaran_nama: record.mata_pelajaran.nama,
      mata_pelajaran_kode: record.mata_pelajaran.kode,
      guru_id: record.guru_id,
      guru_nama: record.guru.nama_lengkap,
      guru_nip: record.guru.nip,
      guru_foto_url: record.guru.foto_url,
      guru_pengganti_id: record.guru_pengganti_id,
      guru_pengganti_nama: record.guru_pengganti?.nama_lengkap ?? null,
      tahun_ajaran_id: record.tahun_ajaran_id,
      tahun_ajaran_nama: record.tahun_ajaran.nama,
      semester_id: record.semester_id,
      tanggal: record.tanggal,
      jam_mulai_aktual: record.jam_mulai_aktual,
      jam_selesai_aktual: record.jam_selesai_aktual,
      status: record.status as StatusSesiKelas,
      ruangan_aktual: record.ruangan_aktual,
      topik_pembelajaran: record.topik_pembelajaran,
      catatan: record.catatan,
      created_at: record.created_at,
      updated_at: record.updated_at,
    };
  }

  async closeClassSession(
    id: string,
    sekolah_id: string,
    catatan?: string
  ): Promise<ClassSessionDTO> {
    const record = await this.db.sesiKelasAktual.update({
      where: { id },
      data: {
        status: "SELESAI",
        jam_selesai_aktual: new Date(),
        catatan: catatan !== undefined ? catatan : undefined,
      },
      include: {
        tahun_ajaran: true,
        semester: true,
        rombel: true,
        guru: true,
        guru_pengganti: true,
        mata_pelajaran: true,
      },
    });

    return {
      id: record.id,
      sekolah_id: record.sekolah_id,
      jadwal_pelajaran_id: record.jadwal_pelajaran_id,
      penugasan_mengajar_id: record.penugasan_mengajar_id,
      rombel_id: record.rombel_id,
      rombel_nama: record.rombel.nama,
      mata_pelajaran_id: record.mata_pelajaran_id,
      mata_pelajaran_nama: record.mata_pelajaran.nama,
      mata_pelajaran_kode: record.mata_pelajaran.kode,
      guru_id: record.guru_id,
      guru_nama: record.guru.nama_lengkap,
      guru_nip: record.guru.nip,
      guru_foto_url: record.guru.foto_url,
      guru_pengganti_id: record.guru_pengganti_id,
      guru_pengganti_nama: record.guru_pengganti?.nama_lengkap ?? null,
      tahun_ajaran_id: record.tahun_ajaran_id,
      tahun_ajaran_nama: record.tahun_ajaran.nama,
      semester_id: record.semester_id,
      tanggal: record.tanggal,
      jam_mulai_aktual: record.jam_mulai_aktual,
      jam_selesai_aktual: record.jam_selesai_aktual,
      status: record.status as StatusSesiKelas,
      ruangan_aktual: record.ruangan_aktual,
      topik_pembelajaran: record.topik_pembelajaran,
      catatan: record.catatan,
      created_at: record.created_at,
      updated_at: record.updated_at,
    };
  }
}

export const scheduleRepository = new ScheduleRepository();

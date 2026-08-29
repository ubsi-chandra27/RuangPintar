/**
 * Ruang Pintar — School & Organization (M01) Persistence Repository
 *
 * Mengakses database SQLite melalui Prisma ORM dengan batasan transaksi atomik
 * dan pencatatan audit log terintegrasi via recordAuditEvent.
 */

import { prisma } from "@/shared/infrastructure/database/prisma";
import { generateUlid } from "@/shared/lib/ulid";
import { recordAuditEvent } from "@/shared/infrastructure/audit/audit-logger";
import {
  CreateOrganizationUnitInput,
  CreatePositionInput,
  AssignPositionInput,
  UpdateOrganizationUnitInput,
  UpdatePositionInput,
  UpdateSchoolProfileInput,
} from "../domain/school-types";

export interface AuditContext {
  aktor_id: string;
  aktor_role: string;
  ip_address?: string | null;
  user_agent?: string | null;
}

export class SchoolRepository {
  /**
   * Mengambil data sekolah aktif berdasarkan ID.
   */
  async findSchoolById(sekolahId: string) {
    return prisma.sekolah.findUnique({
      where: { id: sekolahId },
    });
  }

  /**
   * Mengambil sekolah berdasarkan NPSN (untuk cek duplikasi).
   */
  async findSchoolByNpsn(npsn: string) {
    return prisma.sekolah.findUnique({
      where: { npsn },
    });
  }

  /**
   * Memperbarui data profil sekolah dengan audit log secara transaksional.
   */
  async updateSchoolProfile(
    sekolahId: string,
    data: UpdateSchoolProfileInput,
    auditContext: AuditContext
  ) {
    return prisma.$transaction(async (tx) => {
      const before = await tx.sekolah.findUnique({
        where: { id: sekolahId },
      });

      const updated = await tx.sekolah.update({
        where: { id: sekolahId },
        data: {
          nama: data.nama,
          npsn: data.npsn,
          jenjang: data.jenjang,
          alamat: data.alamat,
          telepon: data.telepon,
          email: data.email,
          zona_waktu: data.zona_waktu ?? "Asia/Jakarta",
          logo_url: data.logo_url,
        },
      });

      await recordAuditEvent(
        {
          sekolah_id: sekolahId,
          aktor_id: auditContext.aktor_id,
          aktor_role: auditContext.aktor_role,
          tipe_sumber: "SEKOLAH",
          id_sumber: sekolahId,
          aksi: "SCHOOL_PROFILE_UPDATED",
          payload_sebelum: before as unknown as Record<string, unknown>,
          payload_sesudah: updated as unknown as Record<string, unknown>,
          ip_address: auditContext.ip_address ?? null,
          user_agent: auditContext.user_agent ?? null,
        },
        tx
      );

      return updated;
    });
  }

  /**
   * Mengambil daftar seluruh unit organisasi pada sekolah beserta relasi induk dan count.
   */
  async findOrganizationUnits(sekolahId: string) {
    return prisma.unitOrganisasi.findMany({
      where: { sekolah_id: sekolahId },
      include: {
        induk_unit: {
          select: { id: true, nama: true, kode: true },
        },
        _count: {
          select: { sub_unit: true, jabatan: true },
        },
      },
      orderBy: [{ induk_unit_id: "asc" }, { nama: "asc" }],
    });
  }

  /**
   * Mengambil satu unit organisasi berdasarkan ID dan sekolah.
   */
  async findOrganizationUnitById(id: string, sekolahId: string) {
    return prisma.unitOrganisasi.findFirst({
      where: { id, sekolah_id: sekolahId },
      include: {
        induk_unit: true,
        _count: {
          select: { sub_unit: true, jabatan: true },
        },
      },
    });
  }

  /**
   * Mengambil unit organisasi berdasarkan nama dalam satu sekolah (untuk cek duplikasi).
   */
  async findOrganizationUnitByName(sekolahId: string, nama: string) {
    return prisma.unitOrganisasi.findUnique({
      where: {
        sekolah_id_nama: {
          sekolah_id: sekolahId,
          nama,
        },
      },
    });
  }

  /**
   * Membuat unit organisasi baru dengan audit log transaksional.
   */
  async createOrganizationUnit(
    sekolahId: string,
    data: CreateOrganizationUnitInput,
    auditContext: AuditContext
  ) {
    const id = generateUlid();

    return prisma.$transaction(async (tx) => {
      const created = await tx.unitOrganisasi.create({
        data: {
          id,
          sekolah_id: sekolahId,
          nama: data.nama,
          kode: data.kode ?? null,
          induk_unit_id: data.induk_unit_id ?? null,
        },
      });

      await recordAuditEvent(
        {
          sekolah_id: sekolahId,
          aktor_id: auditContext.aktor_id,
          aktor_role: auditContext.aktor_role,
          tipe_sumber: "UNIT_ORGANISASI",
          id_sumber: id,
          aksi: "ORG_UNIT_CREATED",
          payload_sebelum: null,
          payload_sesudah: created as unknown as Record<string, unknown>,
          ip_address: auditContext.ip_address ?? null,
          user_agent: auditContext.user_agent ?? null,
        },
        tx
      );

      return created;
    });
  }

  /**
   * Memperbarui unit organisasi dengan audit log transaksional.
   */
  async updateOrganizationUnit(
    id: string,
    sekolahId: string,
    data: UpdateOrganizationUnitInput,
    auditContext: AuditContext
  ) {
    return prisma.$transaction(async (tx) => {
      const before = await tx.unitOrganisasi.findFirst({
        where: { id, sekolah_id: sekolahId },
      });

      const updated = await tx.unitOrganisasi.update({
        where: { id },
        data: {
          nama: data.nama,
          kode: data.kode ?? null,
          induk_unit_id: data.induk_unit_id ?? null,
        },
      });

      await recordAuditEvent(
        {
          sekolah_id: sekolahId,
          aktor_id: auditContext.aktor_id,
          aktor_role: auditContext.aktor_role,
          tipe_sumber: "UNIT_ORGANISASI",
          id_sumber: id,
          aksi: "ORG_UNIT_UPDATED",
          payload_sebelum: before as unknown as Record<string, unknown>,
          payload_sesudah: updated as unknown as Record<string, unknown>,
          ip_address: auditContext.ip_address ?? null,
          user_agent: auditContext.user_agent ?? null,
        },
        tx
      );

      return updated;
    });
  }

  /**
   * Menghapus unit organisasi dengan audit log transaksional.
   */
  async deleteOrganizationUnit(id: string, sekolahId: string, auditContext: AuditContext) {
    return prisma.$transaction(async (tx) => {
      const before = await tx.unitOrganisasi.findFirst({
        where: { id, sekolah_id: sekolahId },
      });

      await tx.unitOrganisasi.delete({
        where: { id },
      });

      await recordAuditEvent(
        {
          sekolah_id: sekolahId,
          aktor_id: auditContext.aktor_id,
          aktor_role: auditContext.aktor_role,
          tipe_sumber: "UNIT_ORGANISASI",
          id_sumber: id,
          aksi: "ORG_UNIT_DELETED",
          payload_sebelum: before as unknown as Record<string, unknown>,
          payload_sesudah: null,
          ip_address: auditContext.ip_address ?? null,
          user_agent: auditContext.user_agent ?? null,
        },
        tx
      );

      return before;
    });
  }

  /**
   * Mengambil daftar master jabatan pada sekolah.
   */
  async findPositions(sekolahId: string) {
    return prisma.jabatan.findMany({
      where: { sekolah_id: sekolahId },
      include: {
        unit: {
          select: { id: true, nama: true, kode: true },
        },
        _count: {
          select: { penugasan: true },
        },
      },
      orderBy: { kode_jabatan: "asc" },
    });
  }

  /**
   * Mengambil satu jabatan berdasarkan ID.
   */
  async findPositionById(id: string, sekolahId: string) {
    return prisma.jabatan.findFirst({
      where: { id, sekolah_id: sekolahId },
      include: {
        unit: true,
        _count: {
          select: { penugasan: true },
        },
      },
    });
  }

  /**
   * Mengambil jabatan berdasarkan kode jabatan (untuk cek duplikasi).
   */
  async findPositionByCode(sekolahId: string, kodeJabatan: string) {
    return prisma.jabatan.findUnique({
      where: {
        sekolah_id_kode_jabatan: {
          sekolah_id: sekolahId,
          kode_jabatan: kodeJabatan,
        },
      },
    });
  }

  /**
   * Membuat master jabatan baru dengan audit log transaksional.
   */
  async createPosition(sekolahId: string, data: CreatePositionInput, auditContext: AuditContext) {
    const id = generateUlid();

    return prisma.$transaction(async (tx) => {
      const created = await tx.jabatan.create({
        data: {
          id,
          sekolah_id: sekolahId,
          kode_jabatan: data.kode_jabatan,
          nama_jabatan: data.nama_jabatan,
          unit_id: data.unit_id ?? null,
          tingkat_akses: data.tingkat_akses ?? "SCHOOL_WIDE",
        },
      });

      await recordAuditEvent(
        {
          sekolah_id: sekolahId,
          aktor_id: auditContext.aktor_id,
          aktor_role: auditContext.aktor_role,
          tipe_sumber: "JABATAN",
          id_sumber: id,
          aksi: "POSITION_CREATED",
          payload_sebelum: null,
          payload_sesudah: created as unknown as Record<string, unknown>,
          ip_address: auditContext.ip_address ?? null,
          user_agent: auditContext.user_agent ?? null,
        },
        tx
      );

      return created;
    });
  }

  /**
   * Memperbarui master jabatan dengan audit log transaksional.
   */
  async updatePosition(
    id: string,
    sekolahId: string,
    data: UpdatePositionInput,
    auditContext: AuditContext
  ) {
    return prisma.$transaction(async (tx) => {
      const before = await tx.jabatan.findFirst({
        where: { id, sekolah_id: sekolahId },
      });

      const updated = await tx.jabatan.update({
        where: { id },
        data: {
          nama_jabatan: data.nama_jabatan,
          unit_id: data.unit_id !== undefined ? data.unit_id : undefined,
          tingkat_akses: data.tingkat_akses !== undefined ? data.tingkat_akses : undefined,
        },
      });

      await recordAuditEvent(
        {
          sekolah_id: sekolahId,
          aktor_id: auditContext.aktor_id,
          aktor_role: auditContext.aktor_role,
          tipe_sumber: "JABATAN",
          id_sumber: id,
          aksi: "POSITION_UPDATED",
          payload_sebelum: before as unknown as Record<string, unknown>,
          payload_sesudah: updated as unknown as Record<string, unknown>,
          ip_address: auditContext.ip_address ?? null,
          user_agent: auditContext.user_agent ?? null,
        },
        tx
      );

      return updated;
    });
  }

  /**
   * Menghapus jabatan dengan audit log transaksional.
   */
  async deletePosition(id: string, sekolahId: string, auditContext: AuditContext) {
    return prisma.$transaction(async (tx) => {
      const before = await tx.jabatan.findFirst({
        where: { id, sekolah_id: sekolahId },
      });

      await tx.jabatan.delete({
        where: { id },
      });

      await recordAuditEvent(
        {
          sekolah_id: sekolahId,
          aktor_id: auditContext.aktor_id,
          aktor_role: auditContext.aktor_role,
          tipe_sumber: "JABATAN",
          id_sumber: id,
          aksi: "POSITION_DELETED",
          payload_sebelum: before as unknown as Record<string, unknown>,
          payload_sesudah: null,
          ip_address: auditContext.ip_address ?? null,
          user_agent: auditContext.user_agent ?? null,
        },
        tx
      );

      return before;
    });
  }

  /**
   * Mengambil daftar penugasan jabatan beserta informasi jabatan, unit, dan personil.
   */
  async findPositionAssignments(sekolahId: string, filterStatus?: string) {
    const assignments = await prisma.penugasanJabatan.findMany({
      where: {
        sekolah_id: sekolahId,
        ...(filterStatus ? { status: filterStatus } : {}),
      },
      include: {
        jabatan: {
          include: { unit: true },
        },
      },
      orderBy: [{ berlaku_mulai: "desc" }, { created_at: "desc" }],
    });

    const personilIds = Array.from(new Set(assignments.map((a) => a.personil_id)));
    const users = await prisma.pengguna.findMany({
      where: {
        id: { in: personilIds },
      },
      select: {
        id: true,
        username: true,
        nama_lengkap: true,
      },
    });
    const userMap = new Map(users.map((u) => [u.id, u]));

    return assignments.map((a) => {
      const user = userMap.get(a.personil_id);
      return {
        ...a,
        personil_nama: user?.nama_lengkap ?? "Personil Tidak Diketahui",
        personil_username: user?.username ?? "-",
      };
    });
  }

  /**
   * Mengambil satu penugasan jabatan berdasarkan ID.
   */
  async findPositionAssignmentById(id: string, sekolahId: string) {
    return prisma.penugasanJabatan.findFirst({
      where: { id, sekolah_id: sekolahId },
      include: {
        jabatan: {
          include: { unit: true },
        },
      },
    });
  }

  /**
   * Menemukan akun pengguna aktif pada sekolah (untuk validasi personil penugasan).
   */
  async findActiveUserInSchool(personilId: string, sekolahId: string) {
    return prisma.pengguna.findFirst({
      where: {
        id: personilId,
        sekolah_id: sekolahId,
        status_akun: "AKTIF",
      },
    });
  }

  /**
   * Mengambil daftar personil yang dapat ditugaskan (staff & teacher aktif di sekolah).
   */
  async findAssignablePersonnel(sekolahId: string) {
    return prisma.pengguna.findMany({
      where: {
        sekolah_id: sekolahId,
        status_akun: "AKTIF",
        peran_dasar: { in: ["SCHOOL_STAFF", "TEACHER", "SUPER_ADMIN"] },
      },
      select: {
        id: true,
        username: true,
        nama_lengkap: true,
        peran_dasar: true,
        status_akun: true,
      },
      orderBy: { nama_lengkap: "asc" },
    });
  }

  /**
   * Membuat penugasan jabatan baru dengan audit log transaksional.
   */
  async createPositionAssignment(
    sekolahId: string,
    data: AssignPositionInput,
    auditContext: AuditContext
  ) {
    const id = generateUlid();

    return prisma.$transaction(async (tx) => {
      const created = await tx.penugasanJabatan.create({
        data: {
          id,
          sekolah_id: sekolahId,
          jabatan_id: data.jabatan_id,
          personil_id: data.personil_id,
          berlaku_mulai: data.berlaku_mulai,
          berlaku_sampai: data.berlaku_sampai ?? null,
          status: "AKTIF",
          catatan: data.catatan ?? null,
        },
      });

      await recordAuditEvent(
        {
          sekolah_id: sekolahId,
          aktor_id: auditContext.aktor_id,
          aktor_role: auditContext.aktor_role,
          tipe_sumber: "PENUGASAN_JABATAN",
          id_sumber: id,
          aksi: "POSITION_ASSIGNED",
          payload_sebelum: null,
          payload_sesudah: created as unknown as Record<string, unknown>,
          ip_address: auditContext.ip_address ?? null,
          user_agent: auditContext.user_agent ?? null,
        },
        tx
      );

      return created;
    });
  }

  /**
   * Mengakhiri penugasan jabatan (status -> SELESAI) dengan audit log transaksional.
   */
  async endPositionAssignment(
    id: string,
    sekolahId: string,
    berlakuSampai: Date,
    catatan: string | null | undefined,
    auditContext: AuditContext
  ) {
    return prisma.$transaction(async (tx) => {
      const before = await tx.penugasanJabatan.findFirst({
        where: { id, sekolah_id: sekolahId },
      });

      const updated = await tx.penugasanJabatan.update({
        where: { id },
        data: {
          status: "SELESAI",
          berlaku_sampai: berlakuSampai,
          catatan: catatan !== undefined ? catatan : before?.catatan,
        },
      });

      await recordAuditEvent(
        {
          sekolah_id: sekolahId,
          aktor_id: auditContext.aktor_id,
          aktor_role: auditContext.aktor_role,
          tipe_sumber: "PENUGASAN_JABATAN",
          id_sumber: id,
          aksi: "POSITION_ASSIGNMENT_ENDED",
          payload_sebelum: before as unknown as Record<string, unknown>,
          payload_sesudah: updated as unknown as Record<string, unknown>,
          ip_address: auditContext.ip_address ?? null,
          user_agent: auditContext.user_agent ?? null,
        },
        tx
      );

      return updated;
    });
  }

  /**
   * Membatalkan penugasan jabatan (status -> DIBATALKAN) dengan audit log transaksional.
   */
  async cancelPositionAssignment(
    id: string,
    sekolahId: string,
    catatan: string,
    auditContext: AuditContext
  ) {
    return prisma.$transaction(async (tx) => {
      const before = await tx.penugasanJabatan.findFirst({
        where: { id, sekolah_id: sekolahId },
      });

      const updated = await tx.penugasanJabatan.update({
        where: { id },
        data: {
          status: "DIBATALKAN",
          catatan,
        },
      });

      await recordAuditEvent(
        {
          sekolah_id: sekolahId,
          aktor_id: auditContext.aktor_id,
          aktor_role: auditContext.aktor_role,
          tipe_sumber: "PENUGASAN_JABATAN",
          id_sumber: id,
          aksi: "POSITION_ASSIGNMENT_CANCELLED",
          payload_sebelum: before as unknown as Record<string, unknown>,
          payload_sesudah: updated as unknown as Record<string, unknown>,
          ip_address: auditContext.ip_address ?? null,
          user_agent: auditContext.user_agent ?? null,
        },
        tx
      );

      return updated;
    });
  }
}

export const schoolRepository = new SchoolRepository();

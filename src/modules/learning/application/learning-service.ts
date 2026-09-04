/**
 * Ruang Pintar — M11 Learning Application Service
 */

import { recordAuditEvent } from "@/shared/infrastructure/audit/audit-logger";
import {
  CreateAdministrasiInput,
  CreateLingkupMateriInput,
  CreateMateriInput,
  CreateTugasInput,
  CreateTujuanPembelajaranInput,
  LingkupMateriDTO,
  MateriPembelajaranDTO,
  TeacherClassCardDTO,
  TeacherClassWorkspaceDTO,
  TujuanPembelajaranDTO,
  UpdateAdministrasiInput,
  UpdateLingkupMateriInput,
  UpdateTujuanPembelajaranInput,
  AdministrasiPembelajaranDTO,
  DefinisiTugasDTO,
} from "../domain/learning-types";
import {
  CreateAdministrasiSchema,
  CreateLingkupMateriSchema,
  CreateMateriSchema,
  CreateTugasSchema,
  CreateTujuanPembelajaranSchema,
  UpdateAdministrasiSchema,
  UpdateLingkupMateriSchema,
  UpdateTujuanPembelajaranSchema,
} from "../domain/learning-validation";
import { LearningRepository, learningRepository } from "../infrastructure/learning-repository";
import {
  LingkupMateriNotFoundError,
  TeacherClassAccessDeniedError,
} from "../domain/learning-errors";

export class LearningService {
  constructor(private readonly repository: LearningRepository = learningRepository) {}

  /**
   * Mengambil daftar kelas yang diampu guru atau seluruh kelas (supervisi admin)
   */
  async listTeacherClasses(
    sekolahId: string,
    guruId?: string | null
  ): Promise<TeacherClassCardDTO[]> {
    return this.repository.listTeacherClasses(sekolahId, guruId);
  }

  /**
   * Mengambil daftar guru yang memiliki penugasan mengajar aktif
   */
  async listTeachersWithAssignments(sekolahId: string) {
    return this.repository.listTeachersWithAssignments(sekolahId);
  }

  /**
   * Mengambil detail Workspace Kelas Terpadu
   */
  async getClassWorkspace(
    penugasanId: string,
    sekolahId: string,
    actorGuruId?: string | null,
    isSuperAdmin: boolean = false
  ): Promise<TeacherClassWorkspaceDTO> {
    const workspace = await this.repository.getTeacherClassWorkspace(penugasanId, sekolahId);
    if (!workspace) {
      throw new Error(`Kelas dengan penugasan '${penugasanId}' tidak ditemukan.`);
    }

    // Akses guard: pastikan guru adalah pengampu kelas tersebut kecuali Super Admin / Staff
    if (!isSuperAdmin && actorGuruId && workspace.penugasan.guru_id !== actorGuruId) {
      throw new TeacherClassAccessDeniedError(
        `${workspace.penugasan.rombel_nama} - ${workspace.penugasan.mata_pelajaran_nama}`
      );
    }

    return workspace;
  }

  // ==========================================
  // LINGKUP MATERI (BAB)
  // ==========================================

  async createLingkupMateri(
    actorId: string,
    actorRole: string,
    input: CreateLingkupMateriInput
  ): Promise<LingkupMateriDTO> {
    const validated = CreateLingkupMateriSchema.parse(input);
    const created = await this.repository.createLingkupMateri(validated);

    await recordAuditEvent({
      sekolah_id: validated.sekolah_id,
      aktor_id: actorId,
      aktor_role: actorRole,
      tipe_sumber: "LINGKUP_MATERI",
      id_sumber: created.id,
      aksi: "CREATE_LINGKUP_MATERI",
      payload_sesudah: created as unknown as Record<string, unknown>,
    });

    return created;
  }

  async updateLingkupMateri(
    actorId: string,
    actorRole: string,
    id: string,
    sekolahId: string,
    input: UpdateLingkupMateriInput
  ): Promise<LingkupMateriDTO> {
    const validated = UpdateLingkupMateriSchema.parse(input);
    const updated = await this.repository.updateLingkupMateri(id, validated);

    await recordAuditEvent({
      sekolah_id: sekolahId,
      aktor_id: actorId,
      aktor_role: actorRole,
      tipe_sumber: "LINGKUP_MATERI",
      id_sumber: id,
      aksi: "UPDATE_LINGKUP_MATERI",
      payload_sesudah: updated as unknown as Record<string, unknown>,
    });

    return updated;
  }

  async deleteLingkupMateri(
    actorId: string,
    actorRole: string,
    id: string,
    sekolahId: string
  ): Promise<void> {
    await this.repository.deleteLingkupMateri(id);

    await recordAuditEvent({
      sekolah_id: sekolahId,
      aktor_id: actorId,
      aktor_role: actorRole,
      tipe_sumber: "LINGKUP_MATERI",
      id_sumber: id,
      aksi: "DELETE_LINGKUP_MATERI",
    });
  }

  // ==========================================
  // TUJUAN PEMBELAJARAN (TP)
  // ==========================================

  async createTujuanPembelajaran(
    actorId: string,
    actorRole: string,
    input: CreateTujuanPembelajaranInput
  ): Promise<TujuanPembelajaranDTO> {
    const validated = CreateTujuanPembelajaranSchema.parse(input);
    const created = await this.repository.createTujuanPembelajaran(validated);

    await recordAuditEvent({
      sekolah_id: validated.sekolah_id,
      aktor_id: actorId,
      aktor_role: actorRole,
      tipe_sumber: "TUJUAN_PEMBELAJARAN",
      id_sumber: created.id,
      aksi: "CREATE_TUJUAN_PEMBELAJARAN",
      payload_sesudah: created as unknown as Record<string, unknown>,
    });

    return created;
  }

  async updateTujuanPembelajaran(
    actorId: string,
    actorRole: string,
    id: string,
    sekolahId: string,
    input: UpdateTujuanPembelajaranInput
  ): Promise<TujuanPembelajaranDTO> {
    const validated = UpdateTujuanPembelajaranSchema.parse(input);
    const updated = await this.repository.updateTujuanPembelajaran(id, validated);

    await recordAuditEvent({
      sekolah_id: sekolahId,
      aktor_id: actorId,
      aktor_role: actorRole,
      tipe_sumber: "TUJUAN_PEMBELAJARAN",
      id_sumber: id,
      aksi: "UPDATE_TUJUAN_PEMBELAJARAN",
      payload_sesudah: updated as unknown as Record<string, unknown>,
    });

    return updated;
  }

  async deleteTujuanPembelajaran(
    actorId: string,
    actorRole: string,
    id: string,
    sekolahId: string
  ): Promise<void> {
    await this.repository.deleteTujuanPembelajaran(id);

    await recordAuditEvent({
      sekolah_id: sekolahId,
      aktor_id: actorId,
      aktor_role: actorRole,
      tipe_sumber: "TUJUAN_PEMBELAJARAN",
      id_sumber: id,
      aksi: "DELETE_TUJUAN_PEMBELAJARAN",
    });
  }

  // ==========================================
  // MATERI PEMBELAJARAN
  // ==========================================

  async createMateri(
    actorId: string,
    actorRole: string,
    input: CreateMateriInput
  ): Promise<MateriPembelajaranDTO> {
    const validated = CreateMateriSchema.parse(input);
    const created = await this.repository.createMateri(validated);

    await recordAuditEvent({
      sekolah_id: validated.sekolah_id,
      aktor_id: actorId,
      aktor_role: actorRole,
      tipe_sumber: "MATERI_PEMBELAJARAN",
      id_sumber: created.id,
      aksi: "CREATE_MATERI",
      payload_sesudah: created as unknown as Record<string, unknown>,
    });

    return created;
  }

  async deleteMateri(
    actorId: string,
    actorRole: string,
    id: string,
    sekolahId: string
  ): Promise<void> {
    await this.repository.deleteMateri(id);

    await recordAuditEvent({
      sekolah_id: sekolahId,
      aktor_id: actorId,
      aktor_role: actorRole,
      tipe_sumber: "MATERI_PEMBELAJARAN",
      id_sumber: id,
      aksi: "DELETE_MATERI",
    });
  }

  // ==========================================
  // TUGAS PEMBELAJARAN
  // ==========================================

  async createTugas(
    actorId: string,
    actorRole: string,
    input: CreateTugasInput
  ): Promise<DefinisiTugasDTO> {
    const validated = CreateTugasSchema.parse(input);
    const created = await this.repository.createTugas(validated);

    await recordAuditEvent({
      sekolah_id: validated.sekolah_id,
      aktor_id: actorId,
      aktor_role: actorRole,
      tipe_sumber: "DEFINISI_TUGAS",
      id_sumber: created.id,
      aksi: "CREATE_TUGAS",
      payload_sesudah: created as unknown as Record<string, unknown>,
    });

    return created;
  }

  async deleteTugas(
    actorId: string,
    actorRole: string,
    id: string,
    sekolahId: string
  ): Promise<void> {
    await this.repository.deleteTugas(id);

    await recordAuditEvent({
      sekolah_id: sekolahId,
      aktor_id: actorId,
      aktor_role: actorRole,
      tipe_sumber: "DEFINISI_TUGAS",
      id_sumber: id,
      aksi: "DELETE_TUGAS",
    });
  }

  // ==========================================
  // ADMINISTRASI PEMBELAJARAN (JURNAL KBM)
  // ==========================================

  async createAdministrasi(
    actorId: string,
    actorRole: string,
    input: CreateAdministrasiInput
  ): Promise<AdministrasiPembelajaranDTO> {
    const validated = CreateAdministrasiSchema.parse(input);
    const created = await this.repository.createAdministrasi(validated);

    await recordAuditEvent({
      sekolah_id: validated.sekolah_id,
      aktor_id: actorId,
      aktor_role: actorRole,
      tipe_sumber: "ADMINISTRASI_PEMBELAJARAN",
      id_sumber: created.id,
      aksi: "CREATE_ADMINISTRASI",
      payload_sesudah: created as unknown as Record<string, unknown>,
    });

    return created;
  }

  async deleteAdministrasi(
    actorId: string,
    actorRole: string,
    id: string,
    sekolahId: string
  ): Promise<void> {
    await this.repository.deleteAdministrasi(id);

    await recordAuditEvent({
      sekolah_id: sekolahId,
      aktor_id: actorId,
      aktor_role: actorRole,
      tipe_sumber: "ADMINISTRASI_PEMBELAJARAN",
      id_sumber: id,
      aksi: "DELETE_ADMINISTRASI",
    });
  }
}

export const learningService = new LearningService();

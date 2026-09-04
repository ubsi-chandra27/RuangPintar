/**
 * Ruang Pintar — M08 Homeroom Assignment Application Service
 */

import { prisma } from "@/shared/infrastructure/database/prisma";
import { recordAuditEvent } from "@/shared/infrastructure/audit/audit-logger";
import { CrossSchoolBoundaryError, HomeroomAlreadyAssignedError } from "../domain/teacher-errors";
import {
  AssignHomeroomInput,
  HomeroomAssignmentDTO,
  StatusPenugasan,
} from "../domain/teacher-types";
import { AssignHomeroomSchema } from "../domain/teacher-validation";
import { TeacherRepository } from "../infrastructure/teacher-repository";

export class HomeroomAssignmentService {
  static async getHomeroomAssignments(
    sekolah_id: string,
    options?: {
      guru_id?: string;
      rombel_id?: string;
      tahun_ajaran_id?: string;
      status?: StatusPenugasan;
      take?: number;
      skip?: number;
    }
  ): Promise<HomeroomAssignmentDTO[]> {
    return TeacherRepository.findHomeroomAssignments(sekolah_id, options);
  }

  static async getHomeroomAssignmentById(
    id: string,
    sekolah_id: string
  ): Promise<HomeroomAssignmentDTO | null> {
    return TeacherRepository.findHomeroomAssignmentById(id, sekolah_id);
  }

  static async assignHomeroom(
    input: AssignHomeroomInput,
    actorId?: string,
    actorRole?: string
  ): Promise<HomeroomAssignmentDTO> {
    const validated = AssignHomeroomSchema.parse(input);

    // 1. Cross-school validation: Guru
    const teacher = await TeacherRepository.findTeacherById(
      validated.guru_id,
      validated.sekolah_id
    );
    if (!teacher) {
      throw new CrossSchoolBoundaryError(`Guru ${validated.guru_id}`);
    }

    // 2. Cross-school validation: Rombel
    const rombel = await prisma.rombel.findFirst({
      where: { id: validated.rombel_id, sekolah_id: validated.sekolah_id },
    });
    if (!rombel) {
      throw new CrossSchoolBoundaryError(`Rombel ${validated.rombel_id}`);
    }

    // 3. Active Homeroom conflict check on the same rombel & academic year
    const existingActive = await TeacherRepository.findActiveHomeroomByRombel(
      validated.rombel_id,
      validated.tahun_ajaran_id,
      validated.sekolah_id
    );

    if (existingActive) {
      throw new HomeroomAlreadyAssignedError(
        existingActive.rombel.nama,
        existingActive.guru.nama_lengkap
      );
    }

    const created = await TeacherRepository.assignHomeroom({
      sekolah_id: validated.sekolah_id,
      guru_id: validated.guru_id,
      rombel_id: validated.rombel_id,
      tahun_ajaran_id: validated.tahun_ajaran_id,
      berlaku_mulai: validated.berlaku_mulai || new Date(),
      catatan: validated.catatan || null,
    });

    if (actorId && actorRole) {
      await recordAuditEvent({
        sekolah_id: validated.sekolah_id,
        aktor_id: actorId,
        aktor_role: actorRole,
        aksi: "CREATE",
        tipe_sumber: "PENUGASAN_WALI_KELAS",
        id_sumber: created.id,
        payload_sesudah: created as unknown as Record<string, unknown>,
      });
    }

    return created;
  }

  static async closeHomeroom(
    id: string,
    sekolah_id: string,
    status: StatusPenugasan = "SELESAI",
    actorId?: string,
    actorRole?: string
  ): Promise<boolean> {
    const existing = await TeacherRepository.findHomeroomAssignmentById(id, sekolah_id);
    if (!existing) {
      throw new CrossSchoolBoundaryError(`Penugasan Wali Kelas ${id}`);
    }

    await TeacherRepository.closeHomeroomAssignment(id, sekolah_id, status, new Date());

    if (actorId && actorRole) {
      await recordAuditEvent({
        sekolah_id,
        aktor_id: actorId,
        aktor_role: actorRole,
        aksi: "UPDATE",
        tipe_sumber: "PENUGASAN_WALI_KELAS",
        id_sumber: id,
        payload_sebelum: existing as unknown as Record<string, unknown>,
        payload_sesudah: { status, berlaku_sampai: new Date() },
      });
    }

    return true;
  }
}

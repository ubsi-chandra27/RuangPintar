/**
 * Ruang Pintar — Position, Assignment & Relationship Context Contracts (M02)
 *
 * Sesuai docs/04-ROLE-ACCESS.md dan ROADMAP-RULE-006 / MOD-RULE-009:
 * M02 tidak memiliki data tabel Teaching/Homeroom/Position/Guardian di Phase 04,
 * melainkan menyediakan kontrak evaluasi yang deterministik untuk effective access.
 */

import {
  ITeachingAssignmentContext,
  IHomeroomAssignmentContext,
  IPositionAssignmentContext,
  IGuardianRelationshipContext,
  ResourceContext,
} from "./types";

/**
 * Memvalidasi apakah assignment / relasi berstatus AKTIF dan berada dalam rentang tanggal evaluasi.
 */
export function isAssignmentActive(
  contract: {
    status: string;
    valid_from: Date;
    valid_until?: Date | null;
  },
  evaluationDate: Date = new Date()
): boolean {
  if (contract.status !== "AKTIF") {
    return false;
  }

  const evalTime = evaluationDate.getTime();
  const fromTime = contract.valid_from.getTime();

  if (evalTime < fromTime) {
    return false; // Belum berlaku (future)
  }

  if (contract.valid_until) {
    const untilTime = contract.valid_until.getTime();
    if (evalTime > untilTime) {
      return false; // Sudah kadaluarsa (expired)
    }
  }

  return true;
}

/**
 * Evaluasi kesesuaian scope Teaching Assignment terhadap resource.
 */
export function evaluateTeachingAssignmentScope(
  actorId: string,
  assignment: ITeachingAssignmentContext,
  resource: ResourceContext = {},
  evaluationDate: Date = new Date()
): boolean {
  if (assignment.teacher_id !== actorId) {
    return false;
  }

  if (!isAssignmentActive(assignment, evaluationDate)) {
    return false;
  }

  if (resource.sekolah_id && resource.sekolah_id !== assignment.sekolah_id) {
    return false;
  }

  if (resource.rombel_id && resource.rombel_id !== assignment.rombel_id) {
    return false;
  }

  if (resource.subject_id && resource.subject_id !== assignment.subject_id) {
    return false;
  }

  return true;
}

/**
 * Evaluasi kesesuaian scope Homeroom Assignment (Wali Kelas) terhadap resource.
 */
export function evaluateHomeroomAssignmentScope(
  actorId: string,
  homeroom: IHomeroomAssignmentContext,
  resource: ResourceContext = {},
  evaluationDate: Date = new Date()
): boolean {
  if (homeroom.teacher_id !== actorId) {
    return false;
  }

  if (!isAssignmentActive(homeroom, evaluationDate)) {
    return false;
  }

  if (resource.sekolah_id && resource.sekolah_id !== homeroom.sekolah_id) {
    return false;
  }

  if (resource.rombel_id && resource.rombel_id !== homeroom.rombel_id) {
    return false;
  }

  return true;
}

/**
 * Evaluasi kesesuaian scope Position Assignment terhadap resource.
 */
export function evaluatePositionAssignmentScope(
  actorId: string,
  position: IPositionAssignmentContext,
  resource: ResourceContext = {},
  evaluationDate: Date = new Date()
): boolean {
  if (position.personil_id !== actorId) {
    return false;
  }

  if (!isAssignmentActive(position, evaluationDate)) {
    return false;
  }

  if (resource.sekolah_id && resource.sekolah_id !== position.sekolah_id) {
    return false;
  }

  // Khusus Kepala Program (PROGRAM_HEAD)
  if (position.position_code === "PROGRAM_HEAD") {
    if (position.program_id && resource.program_id && position.program_id !== resource.program_id) {
      return false;
    }
  }

  return true;
}

/**
 * Evaluasi relasi Guardian -> Student.
 */
export function evaluateGuardianRelationshipScope(
  actorId: string,
  relationship: IGuardianRelationshipContext,
  resource: ResourceContext = {},
  evaluationDate: Date = new Date()
): boolean {
  if (relationship.guardian_id !== actorId) {
    return false;
  }

  if (!relationship.verified) {
    return false; // Relasi belum terverifikasi resmi oleh sekolah
  }

  if (!isAssignmentActive(relationship, evaluationDate)) {
    return false;
  }

  if (resource.student_id && resource.student_id !== relationship.student_id) {
    return false; // Mencoba mengakses data siswa yang bukan anaknya
  }

  return true;
}

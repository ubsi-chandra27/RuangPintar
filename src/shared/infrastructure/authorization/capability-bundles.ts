/**
 * Ruang Pintar — SCHOOL_STAFF Capability Bundles Definition & Mapping (M02)
 *
 * Sesuai docs/04-ROLE-ACCESS.md Section 6.2:
 * SCHOOL_STAFF bukan akses penuh. Akses staf ditentukan melalui capability bundle.
 * Bundle bukan Base Role; bundle mengelompokkan permission set spesifik.
 */

import { CapabilityBundle, PermissionString } from "./types";

export const CAPABILITY_BUNDLE_PERMISSIONS: Record<
  CapabilityBundle,
  ReadonlyArray<PermissionString>
> = {
  SYSTEM_ADMIN: [
    "system.config.view",
    "system.config.manage",
    "system.audit.view",
    "system.backup.manage",
    "system.staff_capabilities.manage",
    "academic.school.view",
    "report.school.view",
    "report.export",
  ],

  ACADEMIC_OPERATOR: [
    "academic.school.view",
    "academic.structure.view",
    "academic.structure.manage",
    "academic.calendar.view",
    "academic.calendar.manage",
    "academic.classes.view",
    "academic.classes.manage",
    "academic.teachers.view",
    "academic.teachers.manage",
    "academic.teaching_assignments.view",
    "academic.teaching_assignments.manage",
    "academic.homeroom_assignments.view",
    "academic.homeroom_assignments.manage",
    "schedule.master.view",
    "schedule.master.manage",
    "schedule.master.publish",
    "schedule.class.view",
    "report.academic.view",
  ],

  STUDENT_DATA_OPERATOR: [
    "academic.school.view",
    "academic.classes.view",
    "academic.students.view",
    "academic.students.manage",
    "attendance.school.view",
    "monitoring.student.view",
    "communication.announcement.view",
    "communication.announcement.manage",
    "report.academic.view",
    "report.attendance.view",
  ],

  REPORT_OPERATOR: [
    "academic.school.view",
    "academic.classes.view",
    "attendance.school.view",
    "report.school.view",
    "report.academic.view",
    "report.attendance.view",
    "report.export",
  ],
};

/**
 * Mengembalikan set permission unik untuk sekumpulan capability bundle.
 */
export function getPermissionsForBundles(bundles: CapabilityBundle[] = []): Set<PermissionString> {
  const permissions = new Set<PermissionString>();
  for (const bundle of bundles) {
    const list = CAPABILITY_BUNDLE_PERMISSIONS[bundle];
    if (list) {
      for (const perm of list) {
        permissions.add(perm);
      }
    }
  }
  return permissions;
}

/**
 * Memvalidasi apakah kode capability merupakan string bundle yang valid.
 */
export function isValidCapabilityBundle(code: string): code is CapabilityBundle {
  return (
    code === "SYSTEM_ADMIN" ||
    code === "ACADEMIC_OPERATOR" ||
    code === "STUDENT_DATA_OPERATOR" ||
    code === "REPORT_OPERATOR"
  );
}

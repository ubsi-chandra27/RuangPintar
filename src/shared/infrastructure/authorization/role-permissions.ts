/**
 * Ruang Pintar — Base Role & Position Permissions Definition (M02)
 *
 * Sesuai docs/04-ROLE-ACCESS.md Section 4-18.
 */

import { BaseRole, PermissionString, PositionCode } from "./types";

export const BASE_ROLE_PERMISSIONS: Record<BaseRole, ReadonlyArray<PermissionString>> = {
  SUPER_ADMIN: [
    // Global & System
    "system.config.view",
    "system.config.manage",
    "system.audit.view",
    "system.backup.manage",
    "system.school.bootstrap",
    "system.staff_capabilities.manage",

    // Academic & School Platform
    "academic.school.view",
    "academic.school.manage",
    "academic.structure.view",
    "academic.structure.manage",
    "academic.calendar.view",
    "academic.calendar.manage",
    "academic.classes.view",
    "academic.classes.manage",
    "academic.students.view",
    "academic.students.manage",
    "academic.teachers.view",
    "academic.teachers.manage",
    "academic.teaching_assignments.view",
    "academic.teaching_assignments.manage",
    "academic.homeroom_assignments.view",
    "academic.homeroom_assignments.manage",

    // Schedule & Ops
    "schedule.master.view",
    "schedule.master.manage",
    "schedule.master.publish",
    "schedule.class.view",

    // Learning & Assessment
    "learning.material.view",
    "learning.material.manage",
    "learning.assignment.view",
    "learning.assignment.manage",
    "attendance.session.view",
    "attendance.school.view",
    "assessment.grades.view",
    "assessment.report_card.view",
    "cbt.exam.view",

    // Communication & Reports
    "monitoring.student.view",
    "communication.announcement.view",
    "communication.announcement.manage",
    "report.school.view",
    "report.academic.view",
    "report.attendance.view",
    "report.export",
  ],

  SCHOOL_STAFF: ["academic.school.view", "communication.announcement.view"],

  TEACHER: [
    "academic.school.view",
    "academic.classes.view",
    "academic.calendar.view",
    "schedule.class.view",
    "learning.material.view",
    "learning.material.manage",
    "learning.assignment.view",
    "learning.assignment.manage",
    "attendance.session.view",
    "attendance.session.record",
    "attendance.session.correct",
    "assessment.grades.view",
    "assessment.grades.manage",
    "assessment.grades.publish",
    "assessment.report_card.view",
    "cbt.exam.view",
    "cbt.exam.manage",
    "cbt.attempt.monitor",
    "monitoring.student.view",
    "communication.announcement.view",
  ],

  STUDENT: [
    "academic.school.view",
    "academic.calendar.view",
    "schedule.class.view",
    "learning.material.view",
    "learning.assignment.view",
    "learning.assignment.submit",
    "attendance.session.view",
    "assessment.grades.view",
    "assessment.report_card.view",
    "cbt.exam.view",
    "cbt.attempt.start",
    "communication.announcement.view",
  ],

  GUARDIAN: [
    "academic.school.view",
    "academic.calendar.view",
    "attendance.session.view",
    "assessment.grades.view",
    "assessment.report_card.view",
    "communication.announcement.view",
  ],
};

export const POSITION_PERMISSIONS: Record<PositionCode, ReadonlyArray<PermissionString>> = {
  HEADMASTER: [
    "academic.school.view",
    "academic.classes.view",
    "academic.students.view",
    "academic.teachers.view",
    "academic.calendar.view",
    "academic.teaching_assignments.view",
    "academic.homeroom_assignments.view",
    "schedule.master.view",
    "schedule.class.view",
    "attendance.school.view",
    "attendance.session.view",
    "assessment.grades.view",
    "assessment.report_card.view",
    "assessment.report_card.sign",
    "monitoring.student.view",
    "monitoring.homeroom.view",
    "report.school.view",
    "report.academic.view",
    "report.attendance.view",
    "communication.announcement.view",
    "communication.announcement.manage",
  ],

  VICE_PRINCIPAL_CURRICULUM: [
    "academic.school.view",
    "academic.structure.view",
    "academic.structure.manage",
    "academic.calendar.view",
    "academic.calendar.manage",
    "academic.classes.view",
    "academic.classes.manage",
    "academic.teachers.view",
    "academic.teaching_assignments.view",
    "academic.teaching_assignments.manage",
    "academic.homeroom_assignments.view",
    "schedule.master.view",
    "schedule.master.manage",
    "schedule.master.publish",
    "schedule.class.view",
    "attendance.school.view",
    "assessment.grades.view",
    "report.academic.view",
    "communication.announcement.view",
  ],

  VICE_PRINCIPAL_STUDENT_AFFAIRS: [
    "academic.school.view",
    "academic.classes.view",
    "academic.students.view",
    "attendance.school.view",
    "attendance.session.view",
    "monitoring.student.view",
    "monitoring.student.record",
    "monitoring.homeroom.view",
    "communication.announcement.view",
    "communication.announcement.manage",
    "report.attendance.view",
  ],

  PROGRAM_HEAD: [
    "academic.school.view",
    "academic.classes.view",
    "academic.students.view",
    "academic.teachers.view",
    "schedule.class.view",
    "attendance.session.view",
    "monitoring.student.view",
    "report.academic.view",
    "communication.announcement.view",
  ],
};

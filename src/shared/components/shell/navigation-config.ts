/**
 * Ruang Pintar — Role-Aware Navigation Configuration (Phase 05)
 *
 * Mengintegrasikan fondasi otorisasi Phase 04 untuk memfilter item navigasi
 * secara presisi berdasarkan peran pengguna dan capability bundle yang sah.
 */

import {
  BaseRole,
  CapabilityBundle,
  PermissionString,
} from "@/shared/infrastructure/authorization/types";

export interface NavItem {
  id: string;
  title: string;
  href: string;
  iconName: string;
  roles: BaseRole[];
  requiredPermission?: PermissionString;
  requiredCapability?: CapabilityBundle;
  badge?: string;
  isPhaseDeferred?: boolean;
  phaseNote?: string;
}

export interface NavGroup {
  id: string;
  title: string;
  items: NavItem[];
}

export const CANONICAL_NAVIGATION_CONFIG: NavGroup[] = [
  {
    id: "main",
    title: "Menu Utama",
    items: [
      {
        id: "dashboard",
        title: "Dashboard",
        href: "/dashboard",
        iconName: "LayoutDashboard",
        roles: ["SUPER_ADMIN", "SCHOOL_STAFF", "TEACHER", "STUDENT", "GUARDIAN"],
      },
    ],
  },

  // ==========================================
  // GURU (TEACHER)
  // ==========================================
  {
    id: "teacher-ops",
    title: "Akademik & Pengajaran",
    items: [
      {
        id: "teacher-workspace",
        title: "Kelas Saya",
        href: "/kelas-saya",
        iconName: "BookOpen",
        roles: ["TEACHER"],
        requiredPermission: "learning.material.view",
        isPhaseDeferred: false,
      },
      {
        id: "teacher-schedule",
        title: "Jadwal Mengajar",
        href: "/jadwal-saya",
        iconName: "Calendar",
        roles: ["TEACHER"],
        requiredPermission: "schedule.class.view",
        isPhaseDeferred: false,
      },
      {
        id: "teacher-class-sessions",
        title: "Sesi Kelas (KBM)",
        href: "/sesi-pembelajaran",
        iconName: "PlayCircle",
        roles: ["TEACHER"],
        requiredPermission: "schedule.class.view",
        isPhaseDeferred: false,
      },
      {
        id: "teacher-calendar",
        title: "Kalender Akademik",
        href: "/kalender-akademik",
        iconName: "CalendarDays",
        roles: ["TEACHER"],
        requiredPermission: "academic.calendar.view",
        isPhaseDeferred: false,
      },
      {
        id: "teacher-classes",
        title: "Presensi Kehadiran",
        href: "/presensi-kelas",
        iconName: "Users",
        roles: ["TEACHER"],
        requiredPermission: "attendance.session.record",
        isPhaseDeferred: false,
      },
      {
        id: "teacher-grades",
        title: "Buku Nilai & Rapor",
        href: "/penilaian",
        iconName: "GraduationCap",
        roles: ["TEACHER", "SUPER_ADMIN"],
        requiredPermission: "assessment.grades.manage",
        isPhaseDeferred: false,
      },
      {
        id: "teacher-cbt",
        title: "CBT Ujian Online",
        href: "/cbt-ujian",
        iconName: "FileCheck",
        roles: ["TEACHER", "SUPER_ADMIN"],
        requiredPermission: "cbt.exam.manage",
        isPhaseDeferred: false,
      },
      {
        id: "teacher-ai-assistant",
        title: "Asisten AI Guru",
        href: "/asisten-ai",
        iconName: "Sparkles",
        roles: ["TEACHER", "SUPER_ADMIN", "SCHOOL_STAFF"],
        badge: "AI 2.0",
        isPhaseDeferred: false,
      },
    ],
  },

  // ==========================================
  // SISWA (STUDENT)
  // ==========================================
  {
    id: "student-ops",
    title: "Aktivitas Belajar",
    items: [
      {
        id: "student-schedule",
        title: "Jadwal Pelajaran",
        href: "/jadwal-saya",
        iconName: "Calendar",
        roles: ["STUDENT"],
        requiredPermission: "schedule.class.view",
        isPhaseDeferred: false,
      },
      {
        id: "student-calendar",
        title: "Kalender Akademik",
        href: "/kalender-akademik",
        iconName: "CalendarDays",
        roles: ["STUDENT"],
        requiredPermission: "academic.calendar.view",
        isPhaseDeferred: false,
      },
      {
        id: "student-cbt",
        title: "CBT Ujian Online",
        href: "/cbt-ujian",
        iconName: "FileCheck",
        roles: ["STUDENT"],
        requiredPermission: "cbt.attempt.start",
        isPhaseDeferred: false,
      },
      {
        id: "student-learning",
        title: "Materi & Tugas",
        href: "/tugas-siswa",
        iconName: "BookOpen",
        roles: ["STUDENT"],
        requiredPermission: "learning.assignment.submit",
        isPhaseDeferred: true,
        phaseNote: "Tersedia pada Phase 12",
      },
      {
        id: "student-grades",
        title: "Nilai & Rapor",
        href: "/rapor-siswa",
        iconName: "Award",
        roles: ["STUDENT"],
        requiredPermission: "assessment.report_card.view",
        isPhaseDeferred: true,
        phaseNote: "Tersedia pada Phase 14",
      },
    ],
  },

  // ==========================================
  // WALI / ORANG TUA (GUARDIAN)
  // ==========================================
  {
    id: "guardian-ops",
    title: "Monitoring Anak",
    items: [
      {
        id: "guardian-attendance",
        title: "Presensi Anak",
        href: "/presensi-anak",
        iconName: "UserCheck",
        roles: ["GUARDIAN"],
        requiredPermission: "attendance.session.view",
        isPhaseDeferred: true,
        phaseNote: "Tersedia pada Phase 16",
      },
      {
        id: "guardian-grades",
        title: "Perkembangan Nilai",
        href: "/nilai-anak",
        iconName: "TrendingUp",
        roles: ["GUARDIAN"],
        requiredPermission: "assessment.grades.view",
        isPhaseDeferred: true,
        phaseNote: "Tersedia pada Phase 16",
      },
    ],
  },

  // ==========================================
  // OPERASIONAL STAF (SCHOOL_STAFF) & ADMIN
  // ==========================================
  {
    id: "staff-ops",
    title: "Manajemen Sekolah",
    items: [
      {
        id: "staff-school",
        title: "Profil & Organisasi",
        href: "/sekolah",
        iconName: "Building2",
        roles: ["SUPER_ADMIN", "SCHOOL_STAFF"],
        requiredPermission: "academic.school.view",
        isPhaseDeferred: false,
      },
      {
        id: "staff-academic",
        title: "Struktur Kurikulum",
        href: "/struktur-akademik",
        iconName: "Layers",
        roles: ["SUPER_ADMIN", "SCHOOL_STAFF"],
        requiredPermission: "academic.structure.manage",
        requiredCapability: "ACADEMIC_OPERATOR",
        isPhaseDeferred: false,
      },
      {
        id: "staff-students",
        title: "Data Kesiswaan",
        href: "/data-siswa",
        iconName: "UserSquare2",
        roles: ["SUPER_ADMIN", "SCHOOL_STAFF"],
        requiredPermission: "academic.students.manage",
        requiredCapability: "STUDENT_DATA_OPERATOR",
        isPhaseDeferred: false,
      },
      {
        id: "staff-teachers",
        title: "Guru & Penugasan",
        href: "/guru-pengajaran",
        iconName: "GraduationCap",
        roles: ["SUPER_ADMIN", "SCHOOL_STAFF"],
        requiredPermission: "academic.teachers.manage",
        requiredCapability: "ACADEMIC_OPERATOR",
        isPhaseDeferred: false,
      },
      {
        id: "staff-calendar",
        title: "Kalender Akademik",
        href: "/kalender-akademik",
        iconName: "CalendarDays",
        roles: ["SUPER_ADMIN", "SCHOOL_STAFF"],
        requiredPermission: "academic.calendar.view",
        requiredCapability: "ACADEMIC_OPERATOR",
        isPhaseDeferred: false,
      },
      {
        id: "staff-schedule",
        title: "Jadwal Pelajaran",
        href: "/jadwal-sekolah",
        iconName: "Calendar",
        roles: ["SUPER_ADMIN", "SCHOOL_STAFF"],
        requiredPermission: "schedule.master.view",
        requiredCapability: "ACADEMIC_OPERATOR",
        isPhaseDeferred: false,
      },
      {
        id: "staff-sessions",
        title: "Sesi Pembelajaran",
        href: "/sesi-pembelajaran",
        iconName: "PlayCircle",
        roles: ["SUPER_ADMIN", "SCHOOL_STAFF"],
        requiredPermission: "schedule.class.view",
        isPhaseDeferred: false,
      },
      {
        id: "staff-workspace",
        title: "Supervisi Pembelajaran",
        href: "/kelas-saya",
        iconName: "BookOpen",
        roles: ["SUPER_ADMIN", "SCHOOL_STAFF"],
        requiredPermission: "learning.material.view",
        requiredCapability: "ACADEMIC_OPERATOR",
        isPhaseDeferred: false,
      },
      {
        id: "staff-reports",
        title: "Laporan & Ekspor",
        href: "/laporan-sekolah",
        iconName: "BarChart3",
        roles: ["SUPER_ADMIN", "SCHOOL_STAFF"],
        requiredPermission: "report.export",
        requiredCapability: "REPORT_OPERATOR",
        isPhaseDeferred: true,
        phaseNote: "Tersedia pada Phase 20 (Reporting & Analytics)",
      },
    ],
  },
];

/**
 * Filter navigasi yang sah untuk pengguna berdasarkan peran dasar dan capability bundle.
 */
export function getFilteredNavigation(
  userRole: BaseRole,
  userCapabilities: CapabilityBundle[] = []
): NavGroup[] {
  const filteredGroups: NavGroup[] = [];

  for (const group of CANONICAL_NAVIGATION_CONFIG) {
    const matchingItems: NavItem[] = [];

    for (const item of group.items) {
      // 1. Periksa apakah Base Role diizinkan
      if (!item.roles.includes(userRole)) {
        continue;
      }

      // 2. Jika user adalah SCHOOL_STAFF dan item butuh capability bundle tertentu
      if (userRole === "SCHOOL_STAFF" && item.requiredCapability) {
        if (!userCapabilities.includes(item.requiredCapability)) {
          continue;
        }
      }

      matchingItems.push(item);
    }

    if (matchingItems.length > 0) {
      filteredGroups.push({
        ...group,
        items: matchingItems,
      });
    }
  }

  return filteredGroups;
}

/**
 * Ruang Pintar — M08 Teacher & Teaching Assignment Facade
 *
 * Mengagregasikan dataset Guru, Mata Pelajaran, Penugasan Mengajar,
 * dan Dashboard Guru secara terpadu.
 */

import { prisma } from "@/shared/infrastructure/database/prisma";
import {
  HomeroomAssignmentDTO,
  SubjectDTO,
  TeacherProfileDTO,
  TeachingAssignmentDTO,
} from "../domain/teacher-types";
import { HomeroomAssignmentService } from "./homeroom-assignment-service";
import { SubjectService } from "./subject-service";
import { TeacherProfileService } from "./teacher-profile-service";
import { TeachingAssignmentService } from "./teaching-assignment-service";

export interface TeacherManagementPageData {
  teachers: TeacherProfileDTO[];
  subjects: SubjectDTO[];
  teachingAssignments: TeachingAssignmentDTO[];
  homeroomAssignments: HomeroomAssignmentDTO[];
  academicYears: Array<{ id: string; nama: string; status: string }>;
  semesters: Array<{ id: string; nama: string; tahun_ajaran_id: string; status: string }>;
  rombels: Array<{
    id: string;
    nama: string;
    tingkat_nama?: string | null;
    tahun_ajaran_id: string;
    kapasitas: number;
  }>;
}

export interface TeacherDashboardData {
  hasProfile: boolean;
  teacher: TeacherProfileDTO | null;
  activeAssignments: TeachingAssignmentDTO[];
  activeHomeroom: HomeroomAssignmentDTO | null;
  totalJamMinggu: number;
  totalRombel: number;
  totalSiswaBinaan: number;
}

export class TeacherFacade {
  static async getTeacherManagementData(sekolah_id: string): Promise<TeacherManagementPageData> {
    const [
      teachers,
      subjects,
      teachingAssignments,
      homeroomAssignments,
      academicYears,
      semesters,
      rombels,
    ] = await Promise.all([
      TeacherProfileService.getTeachers(sekolah_id),
      SubjectService.getSubjects(sekolah_id),
      TeachingAssignmentService.getTeachingAssignments(sekolah_id),
      HomeroomAssignmentService.getHomeroomAssignments(sekolah_id),
      prisma.tahunAjaran.findMany({
        where: { sekolah_id },
        select: { id: true, nama: true, status: true },
        orderBy: { nama: "desc" },
      }),
      prisma.semester.findMany({
        where: { sekolah_id },
        select: { id: true, nama: true, tahun_ajaran_id: true, status: true },
        orderBy: { urutan: "asc" },
      }),
      prisma.rombel.findMany({
        where: { sekolah_id, status: "AKTIF" },
        select: {
          id: true,
          nama: true,
          tahun_ajaran_id: true,
          kapasitas: true,
          tingkat: { select: { nama: true } },
        },
        orderBy: { nama: "asc" },
      }),
    ]);

    return {
      teachers,
      subjects,
      teachingAssignments,
      homeroomAssignments,
      academicYears,
      semesters,
      rombels: rombels.map((r) => ({
        id: r.id,
        nama: r.nama,
        tahun_ajaran_id: r.tahun_ajaran_id,
        kapasitas: r.kapasitas,
        tingkat_nama: r.tingkat?.nama || null,
      })),
    };
  }

  static async getTeacherDashboardData(
    userId: string,
    sekolahId?: string | null
  ): Promise<TeacherDashboardData> {
    const teacher = await TeacherProfileService.getTeacherByUserId(userId, sekolahId || undefined);

    if (!teacher) {
      return {
        hasProfile: false,
        teacher: null,
        activeAssignments: [],
        activeHomeroom: null,
        totalJamMinggu: 0,
        totalRombel: 0,
        totalSiswaBinaan: 0,
      };
    }

    const assignments = await TeachingAssignmentService.getTeachingAssignments(teacher.sekolah_id, {
      guru_id: teacher.id,
      status: "AKTIF",
    });

    const homerooms = await HomeroomAssignmentService.getHomeroomAssignments(teacher.sekolah_id, {
      guru_id: teacher.id,
      status: "AKTIF",
    });

    const activeHomeroom = homerooms.length > 0 ? homerooms[0] : null;
    const uniqueRombelIds = Array.from(new Set(assignments.map((a) => a.rombel_id)));
    const totalJam = assignments.reduce((acc, a) => acc + a.jumlah_jam_minggu, 0);

    // Count students across unique taught rombels
    let totalSiswa = 0;
    if (uniqueRombelIds.length > 0) {
      totalSiswa = await prisma.penempatanRombel.count({
        where: {
          rombel_id: { in: uniqueRombelIds },
          status: "AKTIF",
        },
      });
    }

    return {
      hasProfile: true,
      teacher,
      activeAssignments: assignments,
      activeHomeroom,
      totalJamMinggu: totalJam,
      totalRombel: uniqueRombelIds.length,
      totalSiswaBinaan: totalSiswa,
    };
  }
}

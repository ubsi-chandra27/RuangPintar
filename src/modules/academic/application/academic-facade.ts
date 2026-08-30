/**
 * Ruang Pintar — Academic Structure Unified Facade (M06)
 *
 * Menyediakan agregasi data terpadu untuk tampilan UI manajemen akademik.
 */

import {
  AcademicProgramDTO,
  AcademicYearDTO,
  GradeLevelDTO,
  PhaseDTO,
  RombelDTO,
  SemesterDTO,
} from "../domain/academic-types";
import { academicYearService } from "./academic-year-service";
import { semesterService } from "./semester-service";
import { phaseGradeService } from "./phase-grade-service";
import { programService } from "./program-service";
import { rombelService } from "./rombel-service";

export interface AcademicStructureData {
  academicYears: AcademicYearDTO[];
  semesters: SemesterDTO[];
  phases: PhaseDTO[];
  gradeLevels: GradeLevelDTO[];
  programs: AcademicProgramDTO[];
  rombels: RombelDTO[];
  activeYear: AcademicYearDTO | null;
  activeSemester: SemesterDTO | null;
}

export class AcademicFacade {
  async getFullAcademicStructure(sekolahId: string): Promise<AcademicStructureData> {
    const [
      academicYears,
      semesters,
      phases,
      gradeLevels,
      programs,
      rombels,
      activeYear,
      activeSemester,
    ] = await Promise.all([
      academicYearService.getAcademicYears(sekolahId),
      semesterService.getSemesters(sekolahId),
      phaseGradeService.getPhases(sekolahId),
      phaseGradeService.getGradeLevels(sekolahId),
      programService.getPrograms(sekolahId),
      rombelService.getRombels(sekolahId),
      academicYearService.getActiveAcademicYear(sekolahId),
      semesterService.getActiveSemester(sekolahId),
    ]);

    return {
      academicYears,
      semesters,
      phases,
      gradeLevels,
      programs,
      rombels,
      activeYear,
      activeSemester,
    };
  }
}

export const academicFacade = new AcademicFacade();

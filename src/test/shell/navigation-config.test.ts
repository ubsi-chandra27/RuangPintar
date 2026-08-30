import { describe, it, expect } from "vitest";
import {
  getFilteredNavigation,
  CANONICAL_NAVIGATION_CONFIG,
} from "@/shared/components/shell/navigation-config";

describe("Role-Aware Navigation Filtering (Phase 05)", () => {
  it("filters navigation correctly for TEACHER role", () => {
    const nav = getFilteredNavigation("TEACHER");
    const allItemIds = nav.flatMap((g) => g.items.map((i) => i.id));

    expect(allItemIds).toContain("dashboard");
    expect(allItemIds).toContain("teacher-schedule");
    expect(allItemIds).toContain("teacher-classes");
    expect(allItemIds).toContain("teacher-grades");
    expect(allItemIds).toContain("teacher-cbt");

    // Must NOT contain student, guardian, or admin items
    expect(allItemIds).not.toContain("student-schedule");
    expect(allItemIds).not.toContain("guardian-attendance");
    expect(allItemIds).not.toContain("system-configs");
  });

  it("filters navigation correctly for STUDENT role", () => {
    const nav = getFilteredNavigation("STUDENT");
    const allItemIds = nav.flatMap((g) => g.items.map((i) => i.id));

    expect(allItemIds).toContain("dashboard");
    expect(allItemIds).toContain("student-schedule");
    expect(allItemIds).toContain("student-learning");
    expect(allItemIds).toContain("student-grades");

    expect(allItemIds).not.toContain("teacher-schedule");
    expect(allItemIds).not.toContain("system-configs");
  });

  it("filters navigation correctly for GUARDIAN role", () => {
    const nav = getFilteredNavigation("GUARDIAN");
    const allItemIds = nav.flatMap((g) => g.items.map((i) => i.id));

    expect(allItemIds).toContain("dashboard");
    expect(allItemIds).toContain("guardian-attendance");
    expect(allItemIds).toContain("guardian-grades");

    expect(allItemIds).not.toContain("teacher-schedule");
    expect(allItemIds).not.toContain("student-schedule");
  });

  it("filters navigation correctly for SUPER_ADMIN role", () => {
    const nav = getFilteredNavigation("SUPER_ADMIN");
    const allItemIds = nav.flatMap((g) => g.items.map((i) => i.id));

    expect(allItemIds).toContain("dashboard");
    expect(allItemIds).toContain("staff-school");
    expect(allItemIds).toContain("staff-academic");
    expect(allItemIds).toContain("staff-students");
    expect(allItemIds).toContain("staff-reports");
  });

  it("restricts SCHOOL_STAFF without capabilities from specialized administrative items", () => {
    const nav = getFilteredNavigation("SCHOOL_STAFF", []);
    const allItemIds = nav.flatMap((g) => g.items.map((i) => i.id));

    expect(allItemIds).toContain("dashboard");
    expect(allItemIds).toContain("staff-school");
    expect(allItemIds).not.toContain("staff-academic");
    expect(allItemIds).not.toContain("staff-students");
    expect(allItemIds).not.toContain("staff-reports");
  });

  it("grants ACADEMIC_OPERATOR capability items to SCHOOL_STAFF", () => {
    const nav = getFilteredNavigation("SCHOOL_STAFF", ["ACADEMIC_OPERATOR"]);
    const allItemIds = nav.flatMap((g) => g.items.map((i) => i.id));

    expect(allItemIds).toContain("dashboard");
    expect(allItemIds).toContain("staff-school");
    expect(allItemIds).toContain("staff-academic");
    expect(allItemIds).not.toContain("staff-students");
  });

  it("grants STUDENT_DATA_OPERATOR capability items to SCHOOL_STAFF", () => {
    const nav = getFilteredNavigation("SCHOOL_STAFF", ["STUDENT_DATA_OPERATOR"]);
    const allItemIds = nav.flatMap((g) => g.items.map((i) => i.id));

    expect(allItemIds).toContain("dashboard");
    expect(allItemIds).toContain("staff-school");
    expect(allItemIds).toContain("staff-students");
    expect(allItemIds).not.toContain("staff-academic");
  });
});

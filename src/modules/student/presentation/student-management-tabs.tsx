"use client";

/**
 * Ruang Pintar — M07 Student Academic Lifecycle: Symmetrical Management Tabs Container
 */

import React, { useState } from "react";
import { Users, Calendar, BookOpen } from "lucide-react";
import { StudentManagementDataset } from "../application/student-facade";
import { StudentDirectoryView } from "./student-directory-view";
import { StudentEnrollmentsView } from "./student-enrollments-view";
import { StudentPlacementsView } from "./student-placements-view";

interface StudentManagementTabsProps {
  dataset: StudentManagementDataset;
  canManage: boolean;
}

export function StudentManagementTabs({ dataset, canManage }: StudentManagementTabsProps) {
  const [activeTab, setActiveTab] = useState<"directory" | "enrollments" | "placements">(
    "directory"
  );

  const tabs = [
    {
      id: "directory" as const,
      label: "Daftar Siswa",
      icon: Users,
      count: dataset.totalStudents,
      badgeColor: "bg-blue-100 text-blue-700",
    },
    {
      id: "enrollments" as const,
      label: "Keikutsertaan Akademik",
      icon: Calendar,
      count: dataset.totalEnrollments,
      badgeColor: "bg-indigo-100 text-indigo-700",
    },
    {
      id: "placements" as const,
      label: "Penempatan Rombel",
      icon: BookOpen,
      count: dataset.totalPlacements,
      badgeColor: "bg-emerald-100 text-emerald-700",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Responsive Tab Bar matching Struktur Kurikulum (Academic Glass UI v1.2) */}
      <div className="rounded-3xl bg-white/80 backdrop-blur-md border border-slate-200/80 p-2 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#2563EB] text-white shadow-md shadow-blue-500/20"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{tab.label}</span>
                <span
                  className={`ml-1 text-[11px] px-2 py-0.5 rounded-full font-extrabold ${
                    isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Tab View */}
      {activeTab === "directory" && (
        <StudentDirectoryView
          initialStudents={dataset.students}
          academicYears={dataset.academicYears}
          gradeLevels={dataset.gradeLevels}
          rombels={dataset.rombels}
          canManage={canManage}
        />
      )}

      {activeTab === "enrollments" && (
        <StudentEnrollmentsView
          initialEnrollments={dataset.enrollments}
          students={dataset.students}
          academicYears={dataset.academicYears}
          activeYear={dataset.activeYear}
          gradeLevels={dataset.gradeLevels}
          rombels={dataset.rombels}
          canManage={canManage}
        />
      )}

      {activeTab === "placements" && (
        <StudentPlacementsView
          initialPlacements={dataset.placements}
          enrollments={dataset.enrollments}
          rombels={dataset.rombels}
          academicYears={dataset.academicYears}
          canManage={canManage}
        />
      )}
    </div>
  );
}

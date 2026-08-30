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
      {/* Symmetrical 3-Tab Navigator (Academic Glass UI v1.2) */}
      <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-slate-200/50 backdrop-blur-md border border-slate-200/80 shadow-inner">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-white text-slate-800 shadow-md shadow-slate-200/60 border border-slate-200/60"
                  : "text-slate-500 hover:text-slate-800 hover:bg-white/40"
              }`}
            >
              <Icon
                className={`h-4 w-4 shrink-0 ${isActive ? "text-[#2563EB]" : "text-slate-400"}`}
              />
              <span className="truncate">{tab.label}</span>
              <span
                className={`hidden md:inline-block text-[11px] font-bold px-2 py-0.5 rounded-full ${tab.badgeColor}`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
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

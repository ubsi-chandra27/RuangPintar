"use client";

/**
 * Ruang Pintar — M08 Teacher Management Tabs (Academic Glass UI v1.2)
 */

import React, { useState } from "react";
import { GraduationCap, BookOpen, Layers, Users } from "lucide-react";
import { TeacherManagementPageData } from "../application/teacher-facade";
import { HomeroomAssignmentsView } from "./homeroom-assignments-view";
import { SubjectsView } from "./subjects-view";
import { TeachersView } from "./teachers-view";
import { TeachingAssignmentsView } from "./teaching-assignments-view";

interface TeacherManagementTabsProps {
  initialData: TeacherManagementPageData;
  canManage: boolean;
}

export function TeacherManagementTabs({ initialData, canManage }: TeacherManagementTabsProps) {
  const [activeTab, setActiveTab] = useState<"teachers" | "subjects" | "teaching" | "homeroom">(
    "teachers"
  );

  const tabs = [
    {
      id: "teachers" as const,
      label: "Data Guru",
      count: initialData.teachers.length,
      icon: GraduationCap,
    },
    {
      id: "subjects" as const,
      label: "Mata Pelajaran",
      count: initialData.subjects.filter((subject) => subject.status_aktif).length,
      icon: BookOpen,
    },
    {
      id: "teaching" as const,
      label: "Penugasan Mengajar",
      count: initialData.teachingAssignments.filter((t) => t.status === "AKTIF").length,
      icon: Layers,
    },
    {
      id: "homeroom" as const,
      label: "Wali Kelas",
      count: initialData.homeroomAssignments.filter((h) => h.status === "AKTIF").length,
      icon: Users,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Responsive Tab Bar matching Struktur Kurikulum (Academic Glass UI v1.2) */}
      <div className="rounded-3xl bg-white/80 backdrop-blur-md border border-slate-200/80 p-2 shadow-sm">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-1.5">
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

      {/* Tab Views */}
      {activeTab === "teachers" && (
        <TeachersView
          initialTeachers={initialData.teachers}
          teachingAssignments={initialData.teachingAssignments}
          homeroomAssignments={initialData.homeroomAssignments}
          canManage={canManage}
        />
      )}

      {activeTab === "subjects" && (
        <SubjectsView initialSubjects={initialData.subjects} canManage={canManage} />
      )}

      {activeTab === "teaching" && (
        <TeachingAssignmentsView
          initialAssignments={initialData.teachingAssignments}
          teachers={initialData.teachers}
          subjects={initialData.subjects}
          academicYears={initialData.academicYears}
          semesters={initialData.semesters}
          rombels={initialData.rombels}
          canManage={canManage}
        />
      )}

      {activeTab === "homeroom" && (
        <HomeroomAssignmentsView
          initialHomerooms={initialData.homeroomAssignments}
          teachers={initialData.teachers}
          academicYears={initialData.academicYears}
          rombels={initialData.rombels}
          canManage={canManage}
        />
      )}
    </div>
  );
}

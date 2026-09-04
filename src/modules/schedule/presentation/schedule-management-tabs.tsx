"use client";

/**
 * Ruang Pintar — M10 Schedule Management Tabs Container (Academic Glass UI v1.2)
 */

import React, { useState } from "react";
import { Calendar, Clock } from "lucide-react";
import { MasterScheduleView } from "./master-schedule-view";
import { TimeSlotsView } from "./time-slots-view";
import { ScheduleEntryDTO, ScheduleVersionDTO, TimeSlotDTO } from "../domain/schedule-types";
import { TeachingAssignmentDTO } from "@/modules/teacher/domain/teacher-types";

interface ScheduleManagementTabsProps {
  versions: ScheduleVersionDTO[];
  entries: ScheduleEntryDTO[];
  timeSlots: TimeSlotDTO[];
  rombels: Array<{ id: string; nama: string; tingkat_nama?: string | null }>;
  assignments: TeachingAssignmentDTO[];
  academicYears: Array<{ id: string; nama: string; status: string }>;
  canManage: boolean;
  canPublish: boolean;
}

export function ScheduleManagementTabs({
  versions,
  entries,
  timeSlots,
  rombels,
  assignments,
  academicYears,
  canManage,
  canPublish,
}: ScheduleManagementTabsProps) {
  const [activeTab, setActiveTab] = useState<"JADWAL" | "SLOT">("JADWAL");
  const activeVersion = versions.find((version) => version.status === "PUBLISHED") || versions[0];
  const activeVersionEntryCount = activeVersion
    ? entries.filter((entry) => entry.versi_jadwal_id === activeVersion.id).length
    : 0;

  return (
    <div className="space-y-6">
      {/* Modern Academic Glass Tab Container */}
      <div className="inline-flex p-1.5 rounded-3xl bg-white/80 backdrop-blur-md border border-slate-200/80 shadow-sm">
        <button
          type="button"
          onClick={() => setActiveTab("JADWAL")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === "JADWAL"
              ? "bg-[#2563EB] text-white shadow-md shadow-blue-500/20"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <Calendar className="h-4 w-4" />
          <span>Jadwal Pelajaran</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
              activeTab === "JADWAL" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
            }`}
          >
            {activeVersionEntryCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("SLOT")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === "SLOT"
              ? "bg-[#2563EB] text-white shadow-md shadow-blue-500/20"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <Clock className="h-4 w-4" />
          <span>Slot Waktu</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
              activeTab === "SLOT" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
            }`}
          >
            {timeSlots.filter((slot) => slot.status_aktif).length}
          </span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "JADWAL" && (
        <MasterScheduleView
          versions={versions}
          initialEntries={entries}
          timeSlots={timeSlots}
          rombels={rombels}
          assignments={assignments}
          academicYears={academicYears}
          canManage={canManage}
          canPublish={canPublish}
        />
      )}

      {activeTab === "SLOT" && (
        <TimeSlotsView
          initialTimeSlots={timeSlots.filter((slot) => slot.status_aktif)}
          canManage={canManage}
        />
      )}
    </div>
  );
}

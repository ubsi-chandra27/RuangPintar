"use client";

/**
 * Ruang Pintar — School Management Tabs Component (Academic Glass UI v1.2)
 */

import React, { useState } from "react";
import {
  OrganizationUnitDTO,
  PersonilOptionDTO,
  PositionAssignmentDTO,
  PositionDTO,
  SchoolProfileDTO,
} from "../domain/school-types";
import { SchoolProfileForm } from "./school-profile-form";
import { OrganizationUnitsView } from "./organization-units-view";
import { PositionsView } from "./positions-view";
import { PositionAssignmentsView } from "./position-assignments-view";

interface SchoolManagementTabsProps {
  profile: SchoolProfileDTO;
  units: OrganizationUnitDTO[];
  positions: PositionDTO[];
  assignments: PositionAssignmentDTO[];
  personnel: PersonilOptionDTO[];
  canManageSchool: boolean;
  canViewStructure: boolean;
  canManageStructure: boolean;
  initialTab?: string;
}

export function SchoolManagementTabs({
  profile,
  units,
  positions,
  assignments,
  personnel,
  canManageSchool,
  canViewStructure,
  canManageStructure,
  initialTab = "profil",
}: SchoolManagementTabsProps) {
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  return (
    <div className="space-y-6">
      {/* TAB NAVIGATION BAR */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200/80 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("profil")}
          className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === "profil"
              ? "bg-blue-50/90 text-blue-700 shadow-sm border border-blue-100"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          🏛️ Profil Sekolah
        </button>

        {canViewStructure && (
          <>
            <button
              type="button"
              onClick={() => setActiveTab("unit")}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === "unit"
                  ? "bg-blue-50/90 text-blue-700 shadow-sm border border-blue-100"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              🏢 Unit Organisasi ({units.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("jabatan")}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === "jabatan"
                  ? "bg-blue-50/90 text-blue-700 shadow-sm border border-blue-100"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              🎖️ Master Jabatan ({positions.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("penugasan")}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === "penugasan"
                  ? "bg-blue-50/90 text-blue-700 shadow-sm border border-blue-100"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              👥 Penugasan Personil ({assignments.length})
            </button>
          </>
        )}
      </div>

      {/* TAB CONTENT PANELS */}
      <div>
        {activeTab === "profil" && (
          <SchoolProfileForm initialProfile={profile} canManage={canManageSchool} />
        )}

        {canViewStructure && activeTab === "unit" && (
          <OrganizationUnitsView initialUnits={units} canManage={canManageStructure} />
        )}

        {canViewStructure && activeTab === "jabatan" && (
          <PositionsView
            initialPositions={positions}
            units={units}
            canManage={canManageStructure}
          />
        )}

        {canViewStructure && activeTab === "penugasan" && (
          <PositionAssignmentsView
            initialAssignments={assignments}
            positions={positions}
            personnel={personnel}
            canManage={canManageStructure}
          />
        )}
      </div>
    </div>
  );
}

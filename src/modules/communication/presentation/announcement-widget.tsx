"use client";

import * as React from "react";
import Link from "next/link";
import { Megaphone, Pin, ArrowRight, Calendar, Paperclip } from "lucide-react";
import { AnnouncementItem } from "../domain/communication-types";

interface AnnouncementWidgetProps {
  announcements: AnnouncementItem[];
  className?: string;
}

export function AnnouncementWidget({ announcements, className = "" }: AnnouncementWidgetProps) {
  if (!announcements || announcements.length === 0) {
    return null;
  }

  const displayItems = announcements.slice(0, 3);

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "DARURAT":
        return "text-rose-700 bg-rose-50 border-rose-200";
      case "PENTING":
        return "text-amber-700 bg-amber-50 border-amber-200";
      case "AKADEMIK":
        return "text-blue-700 bg-blue-50 border-blue-200";
      default:
        return "text-slate-700 bg-slate-50 border-slate-200";
    }
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur-md border border-slate-200/80 p-5 shadow-xs transition-all hover:shadow-md ${className}`}
    >
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100 shadow-2xs">
            <Megaphone className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Pengumuman Sekolah</h3>
            <p className="text-[11px] text-slate-500">Informasi & edaran resmi terkini</p>
          </div>
        </div>

        <Link
          href="/pengumuman"
          className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
        >
          <span>Semua</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="space-y-2.5">
        {displayItems.map((item) => (
          <Link
            key={item.id}
            href={`/pengumuman?id=${item.id}`}
            className="group block p-3 rounded-xl bg-slate-50/70 hover:bg-blue-50/50 border border-slate-100 hover:border-blue-200/80 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-1.5">
                <span
                  className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${getCategoryColor(
                    item.kategori
                  )}`}
                >
                  {item.kategori}
                </span>
                {item.apakah_disematkan && (
                  <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 text-amber-800">
                    <Pin className="h-2.5 w-2.5 rotate-45" />
                    Sematkan
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-400">
                {new Date(item.dipublikasikan_pada || item.created_at).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                })}
              </span>
            </div>

            <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
              {item.judul}
            </h4>
            <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">
              {item.konten}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}

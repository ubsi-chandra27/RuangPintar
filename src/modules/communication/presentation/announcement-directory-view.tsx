"use client";

import * as React from "react";
import {
  Megaphone,
  Search,
  Plus,
  Pin,
  Calendar,
  User,
  Paperclip,
  CheckCircle2,
  AlertTriangle,
  Radio,
} from "lucide-react";
import { AnnouncementItem, AnnouncementCategory } from "../domain/communication-types";
import { CreateAnnouncementModal } from "./create-announcement-modal";
import { AnnouncementDetailModal } from "./announcement-detail-modal";
import { useRouter } from "next/navigation";

interface AnnouncementDirectoryViewProps {
  announcements: AnnouncementItem[];
  canManage: boolean;
  availableRombels?: { id: string; nama: string }[];
  initialSelectedId?: string | null;
}

export function AnnouncementDirectoryView({
  announcements,
  canManage,
  availableRombels = [],
  initialSelectedId,
}: AnnouncementDirectoryViewProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState<string>("SEMUA");
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = React.useState<AnnouncementItem | null>(
    () => {
      if (!initialSelectedId) return null;
      return announcements.find((a) => a.id === initialSelectedId) || null;
    }
  );

  // Filter announcements
  const filteredAnnouncements = announcements.filter((item) => {
    // Category filter
    if (selectedCategory !== "SEMUA") {
      if (selectedCategory === "PENTING") {
        if (item.kategori !== "PENTING" && item.kategori !== "DARURAT") return false;
      } else if (item.kategori !== selectedCategory) {
        return false;
      }
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.judul.toLowerCase().includes(q);
      const matchContent = item.konten.toLowerCase().includes(q);
      const matchAuthor = item.penulis.nama_lengkap.toLowerCase().includes(q);
      if (!matchTitle && !matchContent && !matchAuthor) return false;
    }

    return true;
  });

  const pinnedItems = filteredAnnouncements.filter((a) => a.apakah_disematkan);
  const standardItems = filteredAnnouncements.filter((a) => !a.apakah_disematkan);

  const getCategoryBadge = (cat: AnnouncementCategory) => {
    switch (cat) {
      case "DARURAT":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            Darurat
          </span>
        );
      case "PENTING":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            Penting
          </span>
        );
      case "AKADEMIK":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            Akademik
          </span>
        );
      case "KEGIATAN":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Kegiatan
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            Umum
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner Academic Glass UI */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-blue-200">
              <Radio className="h-3.5 w-3.5 text-blue-400 animate-pulse" />
              <span>Pusat Komunikasi Resmi</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Pengumuman Sekolah
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Informasi terpercaya, edaran akademik, dan agenda kegiatan resmi untuk seluruh warga
              sekolah.
            </p>
          </div>

          {canManage && (
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-blue-600/30 transition-all cursor-pointer shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span>Buat Pengumuman</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white/80 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari pengumuman berdasarkan judul, isi, atau penulis..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50/70 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "SEMUA", label: "Semua" },
            { id: "PENTING", label: "Penting" },
            { id: "AKADEMIK", label: "Akademik" },
            { id: "KEGIATAN", label: "Kegiatan" },
            { id: "UMUM", label: "Umum" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedCategory(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                selectedCategory === tab.id
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-100/80 text-slate-600 hover:bg-slate-200/70"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Pinned Section */}
      {pinnedItems.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-700 uppercase tracking-wider">
            <Pin className="h-3.5 w-3.5 rotate-45 text-amber-600" />
            <span>Pengumuman Utama Disematkan</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pinnedItems.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedAnnouncement(item)}
                className="group relative flex flex-col justify-between p-5 rounded-2xl bg-gradient-to-br from-amber-50/60 to-white border-2 border-amber-200/90 shadow-md shadow-amber-900/5 hover:shadow-lg transition-all cursor-pointer"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {getCategoryBadge(item.kategori)}
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                        Disematkan
                      </span>
                      {item.status !== "PUBLISHED" && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
                          {item.status}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {new Date(item.dipublikasikan_pada || item.created_at).toLocaleDateString(
                        "id-ID",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        }
                      )}
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {item.judul}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {item.konten}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-amber-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-slate-400" />
                    <span className="truncate max-w-[150px]">{item.penulis.nama_lengkap}</span>
                  </div>
                  {item.lampiran_url && (
                    <div className="flex items-center gap-1 text-blue-600 text-[11px] font-bold">
                      <Paperclip className="h-3 w-3" />
                      <span>Lampiran</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Regular Announcements Grid */}
      <div className="space-y-3">
        {pinnedItems.length > 0 && (
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Daftar Pengumuman Lainnya
          </div>
        )}

        {standardItems.length === 0 && pinnedItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-500 mb-3">
              <Megaphone className="h-6 w-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800 mb-1">
              Tidak Ada Pengumuman Ditemukan
            </h4>
            <p className="text-xs text-slate-400 max-w-sm">
              {searchQuery
                ? `Tidak ada pengumuman yang sesuai dengan kata kunci "${searchQuery}".`
                : "Belum ada pengumuman yang dipublikasikan pada kategori ini."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {standardItems.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedAnnouncement(item)}
                className="group flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all cursor-pointer"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      {getCategoryBadge(item.kategori)}
                      {item.status !== "PUBLISHED" && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                          {item.status}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {new Date(item.dipublikasikan_pada || item.created_at).toLocaleDateString(
                        "id-ID",
                        {
                          day: "numeric",
                          month: "short",
                        }
                      )}
                    </span>
                  </div>

                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {item.judul}
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                    {item.konten}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <span className="truncate max-w-[140px]">{item.penulis.nama_lengkap}</span>
                  {item.lampiran_url && (
                    <span className="flex items-center gap-1 text-blue-600 text-[11px] font-bold">
                      <Paperclip className="h-3 w-3" />
                      <span>Lampiran</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateAnnouncementModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        availableRombels={availableRombels}
        onSuccess={() => {
          router.refresh();
        }}
      />

      <AnnouncementDetailModal
        announcement={selectedAnnouncement}
        isOpen={!!selectedAnnouncement}
        onClose={() => setSelectedAnnouncement(null)}
        canManage={canManage}
        onActionSuccess={() => {
          router.refresh();
        }}
      />
    </div>
  );
}

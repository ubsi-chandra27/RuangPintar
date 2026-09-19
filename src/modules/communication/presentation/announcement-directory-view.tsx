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
  Radio,
  ArrowRight,
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
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200/70 dark:border-rose-800/60 whitespace-nowrap">
            Darurat
          </span>
        );
      case "PENTING":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200/70 dark:border-amber-800/60 whitespace-nowrap">
            Penting
          </span>
        );
      case "AKADEMIK":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200/70 dark:border-blue-800/60 whitespace-nowrap">
            Akademik
          </span>
        );
      case "KEGIATAN":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800/60 whitespace-nowrap">
            Kegiatan
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700/60 whitespace-nowrap">
            Umum
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 sm:space-y-7 pb-8">
      {/* 1. Header Banner Academic Glass UI */}
      <div className="rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 sm:p-8 shadow-[0_8px_30px_rgba(15,23,42,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] border border-white/60 dark:border-slate-800/80 transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200/60 dark:border-blue-800/60 text-xs font-bold text-[#2563EB] dark:text-blue-400">
              <Radio className="size-3.5 animate-pulse" />
              <span>Pusat Komunikasi Resmi</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Pengumuman & Edaran Resmi
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
              Informasi terpercaya, edaran akademik, dan agenda kegiatan resmi untuk seluruh warga
              sekolah dan komunitas platform.
            </p>
          </div>

          {canManage && (
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-[#2563EB] hover:bg-blue-700 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-lg shadow-blue-500/20 transition-all cursor-pointer shrink-0"
            >
              <Plus className="size-4" />
              <span>Buat Pengumuman</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Filter & Search Toolbar */}
      <div className="rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-3.5 sm:p-4 border border-white/60 dark:border-slate-800/80 shadow-[0_4px_20px_rgba(15,23,42,0.03)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.2)] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari pengumuman berdasarkan judul, isi, atau penulis..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
          {[
            { id: "SEMUA", label: "Semua" },
            { id: "PENTING", label: "Penting" },
            { id: "AKADEMIK", label: "Akademik" },
            { id: "KEGIATAN", label: "Kegiatan" },
            { id: "UMUM", label: "Umum" },
          ].map((tab) => {
            const isActive = selectedCategory === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap active:scale-95 cursor-pointer ${
                  isActive
                    ? "bg-[#2563EB] text-white shadow-md shadow-blue-500/25"
                    : "bg-slate-100/70 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700/50"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Pinned Announcements (Disematkan) */}
      {pinnedItems.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
            <Pin className="size-3.5 rotate-45" />
            <span>Pengumuman Utama Disematkan</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pinnedItems.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedAnnouncement(item)}
                className="group relative flex flex-col justify-between p-5 rounded-3xl bg-gradient-to-br from-amber-50/40 via-white/80 to-amber-50/20 dark:from-amber-950/20 dark:via-slate-900/80 dark:to-slate-900/80 border border-amber-200/70 dark:border-amber-500/30 shadow-[0_8px_30px_rgba(245,158,11,0.06)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:shadow-xl hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {getCategoryBadge(item.kategori)}
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 whitespace-nowrap">
                        Disematkan
                      </span>
                      {item.status !== "PUBLISHED" && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 whitespace-nowrap">
                          {item.status}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 whitespace-nowrap">
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

                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                    {item.judul}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                    {item.konten}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-amber-200/40 dark:border-amber-500/20 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <User className="size-3.5 text-slate-400 shrink-0" />
                    <span className="truncate max-w-[150px] font-medium">
                      {item.penulis.nama_lengkap}
                    </span>
                  </div>
                  {item.lampiran_url && (
                    <div className="flex items-center gap-1 text-[#2563EB] dark:text-blue-400 text-[11px] font-bold shrink-0">
                      <Paperclip className="size-3" />
                      <span>Lampiran</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Regular Announcements Grid / Empty State */}
      <div className="space-y-3">
        {pinnedItems.length > 0 && (
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Daftar Pengumuman Lainnya
          </div>
        )}

        {standardItems.length === 0 && pinnedItems.length === 0 ? (
          <div className="rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-10 sm:p-14 text-center border border-white/60 dark:border-slate-800/80 shadow-[0_8px_30px_rgba(15,23,42,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] flex flex-col items-center justify-center space-y-4">
            <div className="size-16 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-400 flex items-center justify-center shadow-inner">
              <Megaphone className="size-7" />
            </div>
            <div className="space-y-1 max-w-md">
              <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {searchQuery
                  ? "Tidak Ada Pengumuman yang Cocok"
                  : "Belum Ada Pengumuman Diterbitkan"}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {searchQuery
                  ? `Tidak ditemukan pengumuman dengan kata kunci "${searchQuery}". Coba kata kunci lain atau reset filter kategori.`
                  : "Pusat siaran informasi masih kosong. Pengumuman resmi sekolah dan rilis platform akan tampil di sini saat diterbitkan."}
              </p>
            </div>

            {canManage && !searchQuery && (
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#2563EB] hover:bg-blue-700 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-lg shadow-blue-500/20 transition-all cursor-pointer mt-2"
              >
                <Plus className="size-4" />
                <span>Buat Pengumuman Baru</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {standardItems.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedAnnouncement(item)}
                className="group rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/60 dark:border-slate-800/80 p-5 shadow-[0_4px_20px_rgba(15,23,42,0.03)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.2)] hover:shadow-xl hover:border-blue-500/40 hover:-translate-y-0.5 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {getCategoryBadge(item.kategori)}
                      {item.status !== "PUBLISHED" && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                          {item.status}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 whitespace-nowrap">
                      {new Date(item.dipublikasikan_pada || item.created_at).toLocaleDateString(
                        "id-ID",
                        {
                          day: "numeric",
                          month: "short",
                        }
                      )}
                    </span>
                  </div>

                  <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                    {item.judul}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                    {item.konten}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/70 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="truncate max-w-[140px] font-medium">
                    {item.penulis.nama_lengkap}
                  </span>
                  {item.lampiran_url && (
                    <span className="flex items-center gap-1 text-[#2563EB] dark:text-blue-400 text-[11px] font-bold shrink-0">
                      <Paperclip className="size-3" />
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

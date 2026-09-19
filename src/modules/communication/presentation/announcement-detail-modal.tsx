"use client";

import * as React from "react";
import {
  X,
  Pin,
  Calendar,
  User,
  Paperclip,
  ExternalLink,
  Archive,
  Trash2,
  Send,
  Loader2,
} from "lucide-react";
import { AnnouncementItem } from "../domain/communication-types";
import {
  archiveAnnouncementAction,
  deleteAnnouncementAction,
  publishAnnouncementAction,
} from "@/app/actions/communication-actions";

interface AnnouncementDetailModalProps {
  announcement: AnnouncementItem | null;
  isOpen: boolean;
  onClose: () => void;
  canManage?: boolean;
  onActionSuccess?: () => void;
}

export function AnnouncementDetailModal({
  announcement,
  isOpen,
  onClose,
  canManage = false,
  onActionSuccess,
}: AnnouncementDetailModalProps) {
  const [isProcessing, setIsProcessing] = React.useState(false);

  if (!isOpen || !announcement) return null;

  const handlePublish = async () => {
    try {
      setIsProcessing(true);
      const res = await publishAnnouncementAction(announcement.id);
      if (res.success) {
        onClose();
        if (onActionSuccess) onActionSuccess();
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleArchive = async () => {
    try {
      setIsProcessing(true);
      const res = await archiveAnnouncementAction(announcement.id);
      if (res.success) {
        onClose();
        if (onActionSuccess) onActionSuccess();
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Apakah Anda yakin ingin menghapus pengumuman ini secara permanen?")) {
      return;
    }
    try {
      setIsProcessing(true);
      const res = await deleteAnnouncementAction(announcement.id);
      if (res.success) {
        onClose();
        if (onActionSuccess) onActionSuccess();
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const getCategoryBadgeClass = (cat: string) => {
    switch (cat) {
      case "DARURAT":
        return "bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/60";
      case "PENTING":
        return "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60";
      case "AKADEMIK":
        return "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/60";
      case "KEGIATAN":
        return "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60";
      default:
        return "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700/60";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-white/60 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex-1 pr-4">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border whitespace-nowrap ${getCategoryBadgeClass(
                  announcement.kategori
                )}`}
              >
                {announcement.kategori}
              </span>
              {announcement.apakah_disematkan && (
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 whitespace-nowrap">
                  <Pin className="size-3 rotate-45" />
                  Disematkan
                </span>
              )}
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                Sasaran: {announcement.target_audiens}
                {announcement.target_rombel ? ` (${announcement.target_rombel.nama})` : ""}
              </span>
              {announcement.status !== "PUBLISHED" && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 whitespace-nowrap">
                  {announcement.status}
                </span>
              )}
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white leading-snug">
              {announcement.judul}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Metadata Strip */}
        <div className="flex flex-wrap items-center gap-4 px-6 py-3 bg-slate-100/60 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <User className="size-3.5 text-slate-400" />
            <span className="font-medium">
              {announcement.penulis.nama_lengkap} ({announcement.penulis.peran_dasar})
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="size-3.5 text-slate-400" />
            <span>
              {new Date(
                announcement.dipublikasikan_pada || announcement.created_at
              ).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line">
          {announcement.konten}

          {announcement.lampiran_url && (
            <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
              <a
                href={announcement.lampiran_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200/80 dark:border-blue-800/60 transition-colors text-xs font-bold active:scale-95 cursor-pointer shadow-xs"
              >
                <Paperclip className="size-3.5" />
                <span>Buka / Unduh Berkas Lampiran</span>
                <ExternalLink className="size-3" />
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors active:scale-95 cursor-pointer"
          >
            Tutup
          </button>

          {canManage && (
            <div className="flex items-center gap-2">
              {announcement.status === "DRAFT" && (
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handlePublish}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#2563EB] hover:bg-blue-700 text-white transition-all cursor-pointer shadow-md shadow-blue-500/20 active:scale-95 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Send className="size-3.5" />
                  )}
                  <span>Terbitkan</span>
                </button>
              )}

              {announcement.status === "PUBLISHED" && (
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleArchive}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer active:scale-95 disabled:opacity-50 shadow-2xs"
                >
                  <Archive className="size-3.5 text-slate-500" />
                  <span>Arsipkan</span>
                </button>
              )}

              <button
                type="button"
                disabled={isProcessing}
                onClick={handleDelete}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer active:scale-95 disabled:opacity-50"
              >
                <Trash2 className="size-3.5" />
                <span>Hapus</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import * as React from "react";
import {
  X,
  Megaphone,
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
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "PENTING":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "AKADEMIK":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "KEGIATAN":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex-1 pr-4">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getCategoryBadgeClass(
                  announcement.kategori
                )}`}
              >
                {announcement.kategori}
              </span>
              {announcement.apakah_disematkan && (
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  <Pin className="h-3 w-3 rotate-45" />
                  Disematkan
                </span>
              )}
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">
                Sasaran: {announcement.target_audiens}
                {announcement.target_rombel ? ` (${announcement.target_rombel.nama})` : ""}
              </span>
              {announcement.status !== "PUBLISHED" && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                  {announcement.status}
                </span>
              )}
            </div>
            <h3 className="text-lg font-bold text-slate-900 leading-snug">{announcement.judul}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Metadata Strip */}
        <div className="flex flex-wrap items-center gap-4 px-6 py-2.5 bg-slate-100/60 border-b border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 text-slate-400" />
            <span>
              {announcement.penulis.nama_lengkap} ({announcement.penulis.peran_dasar})
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
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
        <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line">
          {announcement.konten}

          {announcement.lampiran_url && (
            <div className="pt-4 mt-4 border-t border-slate-100">
              <a
                href={announcement.lampiran_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200/80 transition-colors text-xs font-bold"
              >
                <Paperclip className="h-3.5 w-3.5" />
                <span>Buka / Unduh Berkas Lampiran</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
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
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {isProcessing ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                  <span>Terbitkan</span>
                </button>
              )}

              {announcement.status === "PUBLISHED" && (
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleArchive}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Archive className="h-3.5 w-3.5 text-slate-500" />
                  <span>Arsipkan</span>
                </button>
              )}

              <button
                type="button"
                disabled={isProcessing}
                onClick={handleDelete}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Hapus</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

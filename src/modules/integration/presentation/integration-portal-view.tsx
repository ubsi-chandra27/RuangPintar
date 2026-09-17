"use client";

/**
 * Ruang Pintar — Integration Portal View (M20 Integration Foundation)
 * Academic Glass UI v1.2
 */

import React, { useState, useTransition, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import {
  IntegrationOverviewDTO,
  IntegrationServiceType,
  IntegrationProvider,
  IntegrationStatus,
  WebhookEndpointDTO,
  IntegrationDeliveryLogDTO,
} from "../domain/integration-types";
import {
  testServiceConnectionAction,
  testWebhookEndpointAction,
  deleteWebhookEndpointAction,
  retryFailedDeliveryAction,
} from "@/app/actions/integration-actions";
import { AdapterConfigModal } from "./adapter-config-modal";
import { CreateWebhookModal } from "./create-webhook-modal";
import {
  Plug,
  MessageSquare,
  Bell,
  Mail,
  HardDrive,
  Webhook,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  RefreshCw,
  Plus,
  Play,
  Trash2,
  Eye,
  RotateCw,
  ExternalLink,
  ShieldCheck,
  Send,
  Zap,
  X,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";

const emptySubscribe = () => () => {};

interface IntegrationPortalViewProps {
  initialData: IntegrationOverviewDTO;
}

export function IntegrationPortalView({ initialData }: IntegrationPortalViewProps) {
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const [data, setData] = useState<IntegrationOverviewDTO>(initialData);
  const [activeTab, setActiveTab] = useState<"CATALOG" | "WEBHOOKS" | "LOGS">("CATALOG");
  const [isPending, startTransition] = useTransition();

  // Modal States
  const [editingAdapter, setEditingAdapter] = useState<{
    type: IntegrationServiceType;
    name: string;
    provider: IntegrationProvider;
    status: IntegrationStatus;
  } | null>(null);

  const [isCreateWebhookOpen, setIsCreateWebhookOpen] = useState(false);
  const [viewingLog, setViewingLog] = useState<IntegrationDeliveryLogDTO | null>(null);

  // Testing Feedback States
  const [testingService, setTestingService] = useState<IntegrationServiceType | null>(null);
  const [testingWebhookId, setTestingWebhookId] = useState<string | null>(null);
  const [alertFeedback, setAlertFeedback] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  // Filter Log
  const [logFilterStatus, setLogFilterStatus] = useState<string>("ALL");

  const handleTestService = (serviceType: IntegrationServiceType) => {
    setTestingService(serviceType);
    setAlertFeedback(null);
    startTransition(async () => {
      try {
        const res = await testServiceConnectionAction(serviceType);
        setAlertFeedback({
          type: res.success ? "success" : "error",
          message: `${res.message} (Latensi: ${res.durationMs}ms)`,
        });
      } catch (err) {
        setAlertFeedback({
          type: "error",
          message: err instanceof Error ? err.message : "Pengujian gagal.",
        });
      } finally {
        setTestingService(null);
      }
    });
  };

  const handleTestWebhook = (webhookId: string) => {
    setTestingWebhookId(webhookId);
    setAlertFeedback(null);
    startTransition(async () => {
      try {
        const res = await testWebhookEndpointAction(webhookId);
        setAlertFeedback({
          type: res.success ? "success" : "error",
          message: res.message,
        });
      } catch (err) {
        setAlertFeedback({
          type: "error",
          message: err instanceof Error ? err.message : "Gagal menguji webhook",
        });
      } finally {
        setTestingWebhookId(null);
      }
    });
  };

  const handleDeleteWebhook = (webhookId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus endpoint webhook ini?")) return;
    startTransition(async () => {
      try {
        await deleteWebhookEndpointAction(webhookId);
        setData((prev) => ({
          ...prev,
          webhooks: prev.webhooks.filter((w) => w.id !== webhookId),
          statistikGlobal: {
            ...prev.statistikGlobal,
            total_webhook_terdaftar: Math.max(0, prev.statistikGlobal.total_webhook_terdaftar - 1),
          },
        }));
        setAlertFeedback({ type: "success", message: "Endpoint webhook berhasil dihapus." });
      } catch (err) {
        setAlertFeedback({
          type: "error",
          message: err instanceof Error ? err.message : "Gagal menghapus webhook",
        });
      }
    });
  };

  const handleRetryLog = (logId: string) => {
    startTransition(async () => {
      try {
        const res = await retryFailedDeliveryAction(logId);
        setAlertFeedback({
          type: res.success ? "success" : "error",
          message: res.success
            ? `Pengiriman ulang sukses! HTTP ${res.statusCode} (${res.durationMs}ms)`
            : "Pengiriman ulang gagal.",
        });
      } catch (err) {
        setAlertFeedback({
          type: "error",
          message: err instanceof Error ? err.message : "Gagal retry",
        });
      }
    });
  };

  const getServiceIcon = (type: IntegrationServiceType) => {
    switch (type) {
      case "WHATSAPP":
        return <MessageSquare className="h-5 w-5 text-emerald-600" />;
      case "PUSH_NOTIFICATION":
        return <Bell className="h-5 w-5 text-indigo-600" />;
      case "EMAIL":
        return <Mail className="h-5 w-5 text-blue-600" />;
      case "STORAGE":
        return <HardDrive className="h-5 w-5 text-amber-600" />;
      case "WEBHOOK":
        return <Webhook className="h-5 w-5 text-violet-600" />;
      default:
        return <Plug className="h-5 w-5 text-slate-600" />;
    }
  };

  const filteredLogs = data.recentLogs.filter((l) => {
    if (logFilterStatus === "ALL") return true;
    return l.status === logFilterStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* 1. Header Banner */}
      <div className="rounded-2xl bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] text-white p-6 sm:p-8 relative overflow-hidden shadow-xl border border-slate-800">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold">
              <Zap className="h-3.5 w-3.5 text-blue-400" />
              <span>Milestone H — Extension & External Ready</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Pusat Integrasi & Layanan Eksternal
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Manajemen gateway WhatsApp, Push Notification HP, Email, Cloud Storage, dan Webhook
              untuk pertukaran data sekolah tanpa mengorbankan keamanan data primer.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              onClick={() => setIsCreateWebhookOpen(true)}
              className="bg-[#2563EB] hover:bg-blue-600 text-white font-bold text-xs h-10 px-4 rounded-xl shadow-lg cursor-pointer"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              <span>Tambah Webhook</span>
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Global Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Adapter Aktif
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-slate-800">
              {data.statistikGlobal.total_adapter_aktif}
            </span>
            <span className="text-xs font-semibold text-slate-400">/ 5 Layanan</span>
          </div>
          <span className="text-[11px] text-emerald-600 font-bold block mt-1">Siap kirim live</span>
        </div>

        <div className="p-4 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Webhook Terdaftar
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-indigo-600">
              {data.statistikGlobal.total_webhook_terdaftar}
            </span>
            <span className="text-xs font-semibold text-slate-400">Endpoint</span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium block mt-1">
            Signed HMAC-SHA256
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Pengiriman 24 Jam
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-blue-600">
              {data.statistikGlobal.total_pengiriman_hari_ini}
            </span>
            <span className="text-xs font-semibold text-slate-400">Event</span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium block mt-1">
            Idempotent outbox
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Tingkat Keberhasilan
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600">
              {data.adapters[0]?.tingkat_keberhasilan_persen ?? 100}%
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium block mt-1">
            Gagal: {data.statistikGlobal.total_gagal_hari_ini} transaksi
          </span>
        </div>
      </div>

      {/* Alert Feedback */}
      {alertFeedback && (
        <div
          className={`p-4 rounded-2xl border text-xs font-medium flex items-center justify-between gap-3 shadow-xs ${
            alertFeedback.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {alertFeedback.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            ) : (
              <XCircle className="h-4 w-4 shrink-0 text-rose-600" />
            )}
            <span>{alertFeedback.message}</span>
          </div>
          <button
            onClick={() => setAlertFeedback(null)}
            className="text-slate-400 hover:text-slate-600 cursor-pointer text-xs font-bold"
          >
            Tutup
          </button>
        </div>
      )}

      {/* 3. Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
        <button
          onClick={() => setActiveTab("CATALOG")}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "CATALOG"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Plug className="h-4 w-4" />
          <span>Katalog Adapter Layanan</span>
        </button>

        <button
          onClick={() => setActiveTab("WEBHOOKS")}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "WEBHOOKS"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Webhook className="h-4 w-4" />
          <span>Endpoint Webhook ({data.webhooks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("LOGS")}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "LOGS"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Clock className="h-4 w-4" />
          <span>Log Pengiriman & Audit Trail</span>
        </button>
      </div>

      {/* 4. Tab Contents */}

      {/* TAB 1: KATALOG ADAPTER */}
      {activeTab === "CATALOG" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.adapters.map((adapter) => {
            const isTestingThis = testingService === adapter.tipe_layanan;
            return (
              <div
                key={adapter.tipe_layanan}
                className="rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between hover:shadow-md hover:border-blue-300 transition-all duration-200"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      {getServiceIcon(adapter.tipe_layanan)}
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        adapter.status === "AKTIF"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : adapter.status === "SIMULASI"
                            ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                            : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {adapter.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-black text-slate-900 tracking-tight">
                      {adapter.nama_layanan}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-3">
                      {adapter.deskripsi}
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-100 text-xs space-y-1">
                    <div className="flex justify-between text-slate-600">
                      <span>Provider:</span>
                      <strong className="font-mono text-slate-800 font-bold">
                        {adapter.provider}
                      </strong>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Uji Terakhir:</span>
                      <span className="font-medium text-slate-700">
                        {adapter.status_uji_terakhir || "Belum diuji"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isTestingThis}
                    onClick={() => handleTestService(adapter.tipe_layanan)}
                    className="h-8 px-3 text-xs font-bold rounded-xl border-slate-200 cursor-pointer"
                  >
                    {isTestingThis ? (
                      <>
                        <RefreshCw className="h-3 w-3 animate-spin mr-1.5 text-blue-600" />
                        Menguji...
                      </>
                    ) : (
                      <>
                        <Play className="h-3 w-3 mr-1.5 text-blue-600" />
                        Uji Koneksi
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    onClick={() =>
                      setEditingAdapter({
                        type: adapter.tipe_layanan,
                        name: adapter.nama_layanan,
                        provider: adapter.provider,
                        status: adapter.status,
                      })
                    }
                    className="h-8 px-3 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-2xs cursor-pointer"
                  >
                    Pengaturan
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: WEBHOOK ENDPOINTS */}
      {activeTab === "WEBHOOKS" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-slate-800">
              Daftar Endpoint Webhook Terdaftar
            </h2>
            <Button
              onClick={() => setIsCreateWebhookOpen(true)}
              className="h-9 px-3.5 text-xs font-bold bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl shadow-xs"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Daftar Webhook Baru
            </Button>
          </div>

          {data.webhooks.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-white border border-slate-200 text-slate-400 space-y-2">
              <Webhook className="h-10 w-10 mx-auto text-slate-300" />
              <p className="text-sm font-semibold text-slate-600">Belum ada webhook terdaftar</p>
              <p className="text-xs max-w-md mx-auto">
                Daftarkan endpoint HTTP POST untuk menerima notifikasi otomatis event presensi,
                nilai, dan tugas sekolah secara real-time.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.webhooks.map((wh) => {
                const isTestingThis = testingWebhookId === wh.id;
                return (
                  <div
                    key={wh.id}
                    className="p-5 rounded-2xl bg-white/95 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-slate-900">{wh.nama}</span>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            wh.status === "AKTIF"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {wh.status}
                        </span>
                      </div>

                      <div className="text-xs font-mono text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-center gap-2 max-w-xl truncate">
                        <ExternalLink className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{wh.url_target}</span>
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {wh.event_langganan.map((ev) => (
                          <span
                            key={ev}
                            className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100 text-[10px] font-bold"
                          >
                            {ev}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                      <Button
                        type="button"
                        variant="outline"
                        disabled={isTestingThis}
                        onClick={() => handleTestWebhook(wh.id)}
                        className="h-8 px-3 text-xs font-bold rounded-xl border-slate-200 cursor-pointer"
                      >
                        {isTestingThis ? (
                          <>
                            <RefreshCw className="h-3 w-3 animate-spin mr-1 text-blue-600" />
                            Ping...
                          </>
                        ) : (
                          <>
                            <Send className="h-3 w-3 mr-1 text-blue-600" />
                            Kirim Test Ping
                          </>
                        )}
                      </Button>

                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => handleDeleteWebhook(wh.id)}
                        className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: LOG PENGIRIMAN & AUDIT TRAIL */}
      {activeTab === "LOGS" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-slate-800">
              Log Pengiriman & Riwayat Transaksi Integrasi
            </h2>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
              {["ALL", "SUKSES", "GAGAL", "PENDING"].map((st) => (
                <button
                  key={st}
                  onClick={() => setLogFilterStatus(st)}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    logFilterStatus === st
                      ? "bg-white text-slate-900 shadow-2xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {st === "ALL" ? "Semua" : st}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Waktu</th>
                    <th className="py-3 px-4">Layanan</th>
                    <th className="py-3 px-4">Event</th>
                    <th className="py-3 px-4">Tujuan / Target</th>
                    <th className="py-3 px-4 text-center">Status HTTP</th>
                    <th className="py-3 px-4 text-center">Durasi</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        Belum ada riwayat pengiriman integrasi.
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                          {new Date(log.created_at).toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-800">{log.tipe_layanan}</td>
                        <td className="py-3 px-4 font-mono text-xs text-indigo-700">
                          {log.event_name}
                        </td>
                        <td className="py-3 px-4 text-slate-600 max-w-xs truncate font-mono text-[11px]">
                          {log.penerima || "-"}
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-bold">
                          {log.respons_status_code ? (
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] ${
                                log.respons_status_code >= 200 && log.respons_status_code < 300
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-rose-50 text-rose-700"
                              }`}
                            >
                              {log.respons_status_code}
                            </span>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-slate-500 text-[11px]">
                          {log.durasi_ms ? `${log.durasi_ms}ms` : "-"}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              log.status === "SUKSES"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : log.status === "GAGAL"
                                  ? "bg-rose-50 text-rose-700 border border-rose-200"
                                  : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}
                          >
                            {log.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right space-x-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setViewingLog(log)}
                            className="h-7 px-2 text-slate-500 hover:text-slate-800 text-xs"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          {log.status === "GAGAL" && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleRetryLog(log.id)}
                              className="h-7 px-2 text-rose-600 hover:bg-rose-50 text-xs font-bold"
                            >
                              <RotateCw className="h-3 w-3 mr-1" />
                              Retry
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal Pengaturan Adapter */}
      {editingAdapter && (
        <AdapterConfigModal
          isOpen={!!editingAdapter}
          onClose={() => setEditingAdapter(null)}
          serviceType={editingAdapter.type}
          serviceName={editingAdapter.name}
          currentProvider={editingAdapter.provider}
          currentStatus={editingAdapter.status}
          onSuccess={() => {
            setAlertFeedback({
              type: "success",
              message: "Konfigurasi layanan berhasil disimpan.",
            });
          }}
        />
      )}

      {/* Modal Tambah Webhook */}
      <CreateWebhookModal
        isOpen={isCreateWebhookOpen}
        onClose={() => setIsCreateWebhookOpen(false)}
        onSuccess={() => {
          setAlertFeedback({
            type: "success",
            message: "Endpoint webhook berhasil didaftarkan.",
          });
        }}
      />

      {/* Modal Detail Log Payload */}
      {viewingLog &&
        isMounted &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
              onClick={() => setViewingLog(null)}
            />
            <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200/80 flex flex-col overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200 p-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Detail Transaksi Integrasi
                  </h3>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    Idempotency: {viewingLog.idempotency_key}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setViewingLog(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3 pt-3 text-xs">
                <div>
                  <span className="font-bold text-slate-700 block mb-1">Payload Terkirim:</span>
                  <pre className="p-3 bg-slate-900 text-slate-100 rounded-xl font-mono text-[11px] overflow-x-auto max-h-40">
                    {(() => {
                      try {
                        return JSON.stringify(JSON.parse(viewingLog.payload_json), null, 2);
                      } catch {
                        return viewingLog.payload_json;
                      }
                    })()}
                  </pre>
                </div>

                <div>
                  <span className="font-bold text-slate-700 block mb-1">Respons Provider:</span>
                  <pre className="p-3 bg-slate-100 text-slate-800 rounded-xl font-mono text-[11px] overflow-x-auto max-h-32 border border-slate-200">
                    {viewingLog.respons_body || "Tidak ada respons body"}
                  </pre>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}

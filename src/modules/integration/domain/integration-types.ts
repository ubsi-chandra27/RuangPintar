/**
 * Ruang Pintar — M20 Integration Foundation Domain Types
 *
 * Mendefinisikan tipe data, enum, DTO, dan kontrak adapter untuk
 * integrasi pihak ketiga (WhatsApp, Push FCM, Email, Cloud S3, Webhook).
 */

export type IntegrationServiceType =
  "WHATSAPP" | "PUSH_NOTIFICATION" | "EMAIL" | "STORAGE" | "CALENDAR" | "WEBHOOK";

export type IntegrationProvider =
  | "WHATSAPP_FONNTE"
  | "WHATSAPP_META"
  | "FCM"
  | "RESEND"
  | "SMTP"
  | "S3"
  | "LOCAL_DISK"
  | "CUSTOM_WEBHOOK";

export type IntegrationStatus = "AKTIF" | "NONAKTIF" | "SIMULASI";

export type DeliveryStatus = "PENDING" | "SUKSES" | "GAGAL" | "RETRY";

export type DeliveryDirection = "OUTBOUND" | "INBOUND";

export const WEBHOOK_AVAILABLE_EVENTS = [
  {
    event: "PRESENSI_SESI_SELESAI",
    label: "Presensi Sesi KBM Selesai",
    deskripsi: "Dipicu saat guru menyelesaikan dan mengunci presensi kelas.",
  },
  {
    event: "SISWA_TERCATAT_ALPHA",
    label: "Siswa Tercatat Alpha / Absen",
    deskripsi: "Dipicu otomatis saat siswa terdeteksi Alpha untuk diteruskan ke ortu via WA/Push.",
  },
  {
    event: "TUGAS_BARU_DITERBITKAN",
    label: "Tugas Baru Diterbitkan",
    deskripsi: "Dipicu saat guru mempublikasikan tugas baru ke siswa rombel.",
  },
  {
    event: "NILAI_DIPUBLIKASIKAN",
    label: "Nilai Asesmen Dipublikasikan",
    deskripsi: "Dipicu saat nilai resmi dirilis ke siswa atau orang tua.",
  },
  {
    event: "PENGUMUMAN_BARU",
    label: "Pengumuman Resmi Baru",
    deskripsi: "Dipicu saat sekolah merilis surat edaran / pengumuman penting.",
  },
  {
    event: "UJIAN_CBT_DIMULAI",
    label: "Sesi Ujian CBT Dibuka",
    deskripsi: "Dipicu saat ujian daring aktif dan peserta mulai masuk ruang ujian.",
  },
] as const;

export type WebhookEventType = (typeof WEBHOOK_AVAILABLE_EVENTS)[number]["event"];

export interface IntegrationConfigDTO {
  id: string;
  sekolah_id: string;
  tipe_layanan: IntegrationServiceType;
  nama_konfigurasi: string;
  provider: IntegrationProvider;
  status: IntegrationStatus;
  kredensial_json?: string | null;
  parameter_json?: string | null;
  terakhir_diuji_pada?: string | null;
  status_uji_terakhir?: string | null;
  catatan_uji?: string | null;
  created_at: string;
  updated_at: string;
}

export interface WebhookEndpointDTO {
  id: string;
  sekolah_id: string;
  nama: string;
  url_target: string;
  secret_token_masked: string;
  event_langganan: string[];
  status: "AKTIF" | "NONAKTIF";
  retry_count_max: number;
  timeout_detik: number;
  terakhir_dipicu_pada?: string | null;
  total_terkirim: number;
  total_gagal: number;
  created_at: string;
  updated_at: string;
}

export interface IntegrationDeliveryLogDTO {
  id: string;
  sekolah_id: string;
  tipe_layanan: IntegrationServiceType;
  arah: DeliveryDirection;
  event_name: string;
  idempotency_key: string;
  penerima?: string | null;
  judul?: string | null;
  payload_json: string;
  respons_status_code?: number | null;
  respons_body?: string | null;
  status: DeliveryStatus;
  jumlah_percobaan: number;
  error_message?: string | null;
  durasi_ms?: number | null;
  created_at: string;
  updated_at: string;
}

export interface IntegrationOverviewDTO {
  adapters: {
    tipe_layanan: IntegrationServiceType;
    nama_layanan: string;
    deskripsi: string;
    provider: IntegrationProvider;
    status: IntegrationStatus;
    terakhir_diuji_pada?: string | null;
    status_uji_terakhir?: string | null;
    total_kirim_24jam: number;
    tingkat_keberhasilan_persen: number;
  }[];
  webhooks: WebhookEndpointDTO[];
  recentLogs: IntegrationDeliveryLogDTO[];
  statistikGlobal: {
    total_adapter_aktif: number;
    total_webhook_terdaftar: number;
    total_pengiriman_hari_ini: number;
    total_gagal_hari_ini: number;
  };
}

export interface SendWhatsAppInput {
  sekolah_id: string;
  nomor_tujuan: string;
  nama_penerima?: string;
  pesan: string;
  event_name: string;
  idempotency_key: string;
}

export interface SendWhatsAppResult {
  success: boolean;
  message_id?: string;
  error?: string;
  simulated?: boolean;
}

export interface SendPushNotificationInput {
  sekolah_id: string;
  user_id?: string;
  fcm_token?: string;
  judul: string;
  isi: string;
  action_url?: string;
  event_name: string;
  idempotency_key: string;
}

export interface SendPushNotificationResult {
  success: boolean;
  multicast_id?: string;
  error?: string;
  simulated?: boolean;
}

export interface SendEmailInput {
  sekolah_id: string;
  email_tujuan: string;
  subjek: string;
  isi_html: string;
  event_name: string;
  idempotency_key: string;
}

export interface SendEmailResult {
  success: boolean;
  email_id?: string;
  error?: string;
  simulated?: boolean;
}

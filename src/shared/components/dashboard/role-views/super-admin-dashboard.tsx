import * as React from "react";
import { AuthenticatedUser } from "@/shared/infrastructure/auth/auth-service";
import { prisma } from "@/shared/infrastructure/database/prisma";
import { parseUserAgent, calculatePresence } from "@/shared/lib/device-detector";
import { SuperAdminDashboardView } from "@/shared/components/dashboard/role-views/super-admin-dashboard-view";

export interface SuperAdminDashboardProps {
  user: AuthenticatedUser;
}

export async function SuperAdminDashboard({ user }: SuperAdminDashboardProps) {
  // Query 100% data operasional riil dari basis data (Zero Fake KPI)
  const [
    totalSekolah,
    totalSekolahFreemium,
    totalSekolahInstitusi,
    totalGuru,
    totalSiswa,
    totalRombel,
    daftarSekolahTerbaru,
    sesiPenggunaTerbaru,
    totalPresensiHadir,
    totalPresensiIzinSakit,
    totalPresensiAlpha,
    totalSesiAktual,
    rombelListReal,
    guruTerdaftarList,
    auditLogsReal,
  ] = await Promise.all([
    prisma.sekolah.count(),
    prisma.sekolah.count({ where: { tipe_lisensi: "FREEMIUM" } }),
    prisma.sekolah.count({ where: { tipe_lisensi: "SEKOLAH" } }),
    prisma.pengguna.count({ where: { peran_dasar: "TEACHER" } }),
    prisma.siswa.count(),
    prisma.rombel.count({ where: { status: "AKTIF" } }),
    prisma.sekolah.findMany({
      take: 6,
      orderBy: { created_at: "desc" },
      include: {
        pengguna: {
          where: { peran_dasar: "TEACHER" },
          take: 1,
          select: { nama_lengkap: true, email: true },
        },
        rombel: {
          where: { status: "AKTIF" },
          select: { id: true },
        },
      },
    }),
    prisma.sesiPengguna.findMany({
      take: 20,
      orderBy: { created_at: "desc" },
      include: {
        pengguna: {
          select: {
            nama_lengkap: true,
            peran_dasar: true,
            sekolah: { select: { nama: true } },
          },
        },
      },
    }),
    prisma.presensiSesiKelas.count({ where: { status: "HADIR" } }),
    prisma.presensiSesiKelas.count({ where: { status: { in: ["IZIN", "SAKIT", "DISPENSASI"] } } }),
    prisma.presensiSesiKelas.count({ where: { status: "ALPHA" } }),
    prisma.sesiKelasAktual.count(),
    prisma.rombel.findMany({
      where: { status: "AKTIF" },
      take: 12,
      include: {
        penugasan_mengajar: {
          include: {
            mata_pelajaran: true,
            guru: { select: { nama_lengkap: true } },
          },
        },
        penempatan_rombel: {
          select: { id: true },
        },
      },
      orderBy: { nama: "asc" },
    }),
    prisma.pengguna.findMany({
      where: { peran_dasar: "TEACHER" },
      take: 8,
      orderBy: { created_at: "desc" },
      select: {
        id: true,
        nama_lengkap: true,
        email: true,
        created_at: true,
        sekolah: { select: { nama: true } },
      },
    }),
    prisma.logAudit.findMany({
      take: 20,
      orderBy: { dibuat_pada: "desc" },
    }),
  ]);

  // Kalkulasi Kehadiran Murni (Tanpa Fallback Palsu: jika 0 presensi, maka 0%)
  const totalPresensiRecorded = totalPresensiHadir + totalPresensiIzinSakit + totalPresensiAlpha;
  const hadirPct =
    totalPresensiRecorded > 0
      ? Number(((totalPresensiHadir / totalPresensiRecorded) * 100).toFixed(1))
      : 0;
  const izinSakitPct =
    totalPresensiRecorded > 0
      ? Number(((totalPresensiIzinSakit / totalPresensiRecorded) * 100).toFixed(1))
      : 0;
  const alphaPct =
    totalPresensiRecorded > 0
      ? Number(((totalPresensiAlpha / totalPresensiRecorded) * 100).toFixed(1))
      : 0;

  // Kalkulasi Distribusi Perangkat Riil
  let mobileCount = 0;
  let desktopCount = 0;
  let tabletCount = 0;

  const sesiList = sesiPenggunaTerbaru.map((sesi) => {
    const device = parseUserAgent(sesi.user_agent);
    const presence = calculatePresence(sesi.terakhir_aktif_pada || sesi.created_at);
    if (device.type === "mobile") mobileCount++;
    else if (device.type === "tablet") tabletCount++;
    else desktopCount++;

    return {
      id: sesi.id,
      nama: sesi.pengguna?.nama_lengkap || "Pengguna SaaS",
      sekolah: sesi.pengguna?.sekolah?.nama || "Sekolah",
      deviceType: device.type as "mobile" | "tablet" | "desktop",
      deviceBrand: device.brand,
      presenceLabel: presence.label,
      presenceBadgeClass: presence.badgeClass,
      presenceDotClass: presence.dotClass,
    };
  });

  const totalSesiTerdata = sesiPenggunaTerbaru.length;
  const mobilePct =
    totalSesiTerdata > 0 ? Math.round(((mobileCount + tabletCount) / totalSesiTerdata) * 100) : 0;
  const desktopPct = totalSesiTerdata > 0 ? 100 - mobilePct : 0;

  // Format Rombel Riil (Zero Fake Performance)
  const rombelList = rombelListReal.map((r) => {
    const mapelNama = r.penugasan_mengajar[0]?.mata_pelajaran?.nama || "Umum";
    const guruNama = r.penugasan_mengajar[0]?.guru?.nama_lengkap || "Belum Ditugaskan";
    return {
      id: r.id,
      nama: r.nama,
      siswaCount: r.penempatan_rombel.length,
      mapelNama,
      guruNama,
      completion: 0,
      sessionCount: 0,
    };
  });

  // Format Sekolah Riil
  const sekolahList = daftarSekolahTerbaru.map((s) => ({
    id: s.id,
    nama: s.nama,
    jenjang: s.jenjang,
    tipe_lisensi: s.tipe_lisensi,
    rombelCount: s.rombel.length,
    guruKontak: s.pengguna[0]?.nama_lengkap || "Admin Sekolah",
  }));

  // Format Guru Riil
  const guruList = guruTerdaftarList.map((g) => ({
    id: g.id,
    nama_lengkap: g.nama_lengkap,
    email: g.email,
    sekolahNama: g.sekolah?.nama || "Pendidik Mandiri",
    penugasanCount: 0,
  }));

  // Format Audit Logs Riil (Dari SQLite LogAudit)
  const auditLogs = auditLogsReal.map((log) => {
    const dibuatDate = new Date(log.dibuat_pada);
    // eslint-disable-next-line react-hooks/purity
    const diffMs = Math.max(0, Date.now() - dibuatDate.getTime());
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    let timeAgo = "Baru saja";
    if (diffDays > 0) timeAgo = `${diffDays} hari lalu`;
    else if (diffHours > 0) timeAgo = `${diffHours} jam lalu`;
    else if (diffMinutes > 0) timeAgo = `${diffMinutes} menit lalu`;

    let payloadPretty: string | null = null;
    if (log.payload_sesudah) {
      try {
        payloadPretty = JSON.stringify(JSON.parse(log.payload_sesudah), null, 2);
      } catch {
        payloadPretty = log.payload_sesudah;
      }
    }

    return {
      id: log.id,
      aktor_role: log.aktor_role || "SYSTEM",
      aksi: log.aksi,
      tipe_sumber: log.tipe_sumber,
      id_sumber: log.id_sumber,
      dibuat_pada: dibuatDate.toLocaleString("id-ID", {
        dateStyle: "medium",
        timeStyle: "short",
      }),
      timeAgo,
      payload_sebelum: log.payload_sebelum,
      payload_sesudah: payloadPretty,
      ip_address: log.ip_address,
    };
  });

  return (
    <SuperAdminDashboardView
      user={{
        nama_lengkap: user.nama_lengkap,
        peran_dasar: user.peran_dasar,
        username: user.username,
      }}
      stats={{
        totalSiswa,
        totalGuru,
        totalSekolah,
        totalSekolahFreemium,
        totalSekolahInstitusi,
        totalRombel,
        totalSesiAktual,
      }}
      attendance={{
        totalPresensiRecorded,
        totalPresensiHadir,
        totalPresensiIzinSakit,
        totalPresensiAlpha,
        hadirPct,
        izinSakitPct,
        alphaPct,
      }}
      rombelList={rombelList}
      sekolahList={sekolahList}
      guruList={guruList}
      auditLogs={auditLogs}
      deviceStats={{
        mobilePct,
        desktopPct,
        sesiList,
      }}
    />
  );
}

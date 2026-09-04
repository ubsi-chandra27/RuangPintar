/**
 * Ruang Pintar — M12 Class Session Attendance Infrastructure Repository
 */

import { prisma } from "@/shared/infrastructure/database/prisma";
import { ulid } from "ulidx";
import {
  AttendanceStatus,
  ClassSessionAttendanceDTO,
  SaveSessionAttendanceInput,
  SessionAttendanceHistoryItemDTO,
  SessionAttendanceSummaryDTO,
  StudentAttendanceItemDTO,
} from "../domain/attendance-types";

export class AttendanceRepository {
  /**
   * Mengambil sesi kelas aktual beserta daftar seluruh siswa aktif di rombel tersebut
   * dan rekaman presensi yang sudah ada (jika sudah dicatat).
   */
  async findSessionWithStudents(
    sesiId: string,
    sekolahId: string
  ): Promise<ClassSessionAttendanceDTO | null> {
    const session = await prisma.sesiKelasAktual.findFirst({
      where: { id: sesiId, sekolah_id: sekolahId },
      include: {
        rombel: {
          include: {
            tingkat: true,
          },
        },
        mata_pelajaran: true,
        guru: true,
        guru_pengganti: true,
      },
    });

    if (!session) return null;

    // Ambil seluruh siswa aktif di rombel sesi ini
    const activePlacements = await prisma.penempatanRombel.findMany({
      where: {
        sekolah_id: sekolahId,
        rombel_id: session.rombel_id,
        status: "AKTIF",
      },
      include: {
        keikutsertaan: {
          include: {
            siswa: true,
          },
        },
      },
      orderBy: [{ nomor_absen: "asc" }, { keikutsertaan: { siswa: { nama_lengkap: "asc" } } }],
    });

    // Ambil data presensi yang sudah dicatat pada sesi ini
    const existingAttendances = await prisma.presensiSesiKelas.findMany({
      where: {
        sekolah_id: sekolahId,
        sesi_kelas_id: sesiId,
      },
    });

    const attendanceMap = new Map(existingAttendances.map((a) => [a.siswa_id, a]));

    const daftar_siswa: StudentAttendanceItemDTO[] = activePlacements.map((p) => {
      const siswa = p.keikutsertaan.siswa;
      const record = attendanceMap.get(siswa.id);

      return {
        siswa_id: siswa.id,
        nama_lengkap: siswa.nama_lengkap,
        nis: siswa.nis,
        nisn: siswa.nisn,
        nomor_absen: p.nomor_absen,
        foto_url: siswa.foto_url,
        penempatan_rombel_id: p.id,
        presensi_id: record ? record.id : null,
        status: (record ? record.status : "HADIR") as AttendanceStatus,
        catatan: record ? record.catatan : null,
        waktu_presensi: record ? record.waktu_presensi : null,
      };
    });

    const total_siswa = daftar_siswa.length;
    const sudah_diabsen = existingAttendances.length > 0;

    let jumlah_hadir = 0;
    let jumlah_izin = 0;
    let jumlah_sakit = 0;
    let jumlah_alpha = 0;
    let jumlah_dispensasi = 0;
    let jumlah_terlambat = 0;

    for (const item of daftar_siswa) {
      if (item.status === "HADIR") jumlah_hadir++;
      else if (item.status === "IZIN") jumlah_izin++;
      else if (item.status === "SAKIT") jumlah_sakit++;
      else if (item.status === "ALPHA") jumlah_alpha++;
      else if (item.status === "DISPENSASI") jumlah_dispensasi++;
      else if (item.status === "TERLAMBAT") jumlah_terlambat++;
    }

    const persentase_kehadiran =
      total_siswa > 0
        ? Math.round(((jumlah_hadir + jumlah_terlambat + jumlah_dispensasi) / total_siswa) * 100)
        : 0;

    return {
      sesi_id: session.id,
      sekolah_id: session.sekolah_id,
      penugasan_mengajar_id: session.penugasan_mengajar_id,
      rombel_id: session.rombel_id,
      rombel_nama: session.rombel.nama,
      mata_pelajaran_id: session.mata_pelajaran_id,
      mata_pelajaran_nama: session.mata_pelajaran.nama,
      guru_id: session.guru_id,
      guru_nama: session.guru.nama_lengkap,
      tanggal: session.tanggal,
      status_sesi: session.status,
      ruangan: session.ruangan_aktual,
      topik_pembelajaran: session.topik_pembelajaran,
      total_siswa,
      jumlah_hadir,
      jumlah_izin,
      jumlah_sakit,
      jumlah_alpha,
      jumlah_dispensasi,
      jumlah_terlambat,
      persentase_kehadiran,
      sudah_diabsen,
      daftar_siswa,
    };
  }

  /**
   * Menyimpan / memperbarui presensi seluruh siswa pada sesi kelas secara transaksional.
   */
  async saveSessionAttendance(
    input: SaveSessionAttendanceInput,
    actorUserId: string
  ): Promise<SessionAttendanceSummaryDTO> {
    const { sesi_kelas_id, sekolah_id, items, alasan_koreksi } = input;

    await prisma.$transaction(async (tx) => {
      for (const item of items) {
        const existing = await tx.presensiSesiKelas.findUnique({
          where: {
            sesi_kelas_id_siswa_id: {
              sesi_kelas_id,
              siswa_id: item.siswa_id,
            },
          },
        });

        if (existing) {
          await tx.presensiSesiKelas.update({
            where: { id: existing.id },
            data: {
              status: item.status,
              catatan: item.catatan !== undefined ? item.catatan : existing.catatan,
              penempatan_rombel_id: item.penempatan_rombel_id || existing.penempatan_rombel_id,
              diubah_terakhir_oleh: actorUserId,
              alasan_koreksi: alasan_koreksi || existing.alasan_koreksi,
              waktu_presensi: new Date(),
            },
          });
        } else {
          await tx.presensiSesiKelas.create({
            data: {
              id: ulid(),
              sekolah_id,
              sesi_kelas_id,
              siswa_id: item.siswa_id,
              penempatan_rombel_id: item.penempatan_rombel_id || null,
              status: item.status,
              catatan: item.catatan || null,
              diinput_oleh: actorUserId,
              waktu_presensi: new Date(),
            },
          });
        }
      }

      // Update status sesi dari TERJADWAL menjadi DIMULAI jika belum
      const currentSession = await tx.sesiKelasAktual.findUnique({
        where: { id: sesi_kelas_id },
        select: { status: true, jam_mulai_aktual: true },
      });

      if (currentSession && currentSession.status === "TERJADWAL") {
        await tx.sesiKelasAktual.update({
          where: { id: sesi_kelas_id },
          data: {
            status: "DIMULAI",
            jam_mulai_aktual: currentSession.jam_mulai_aktual || new Date(),
          },
        });
      }
    });

    // Hitung ringkasan
    const saved = await prisma.presensiSesiKelas.findMany({
      where: { sesi_kelas_id, sekolah_id },
    });

    const total_siswa = saved.length;
    let jumlah_hadir = 0;
    let jumlah_izin = 0;
    let jumlah_sakit = 0;
    let jumlah_alpha = 0;
    let jumlah_dispensasi = 0;
    let jumlah_terlambat = 0;

    for (const s of saved) {
      if (s.status === "HADIR") jumlah_hadir++;
      else if (s.status === "IZIN") jumlah_izin++;
      else if (s.status === "SAKIT") jumlah_sakit++;
      else if (s.status === "ALPHA") jumlah_alpha++;
      else if (s.status === "DISPENSASI") jumlah_dispensasi++;
      else if (s.status === "TERLAMBAT") jumlah_terlambat++;
    }

    const persentase_kehadiran =
      total_siswa > 0
        ? Math.round(((jumlah_hadir + jumlah_terlambat + jumlah_dispensasi) / total_siswa) * 100)
        : 0;

    return {
      total_siswa,
      jumlah_hadir,
      jumlah_izin,
      jumlah_sakit,
      jumlah_alpha,
      jumlah_dispensasi,
      jumlah_terlambat,
      persentase_kehadiran,
      sudah_diabsen: true,
    };
  }

  /**
   * Mengambil riwayat sesi kelas dan ringkasan presensi untuk suatu penugasan mengajar
   */
  async getTeachingAssignmentAttendanceHistory(
    penugasanId: string,
    sekolahId: string
  ): Promise<SessionAttendanceHistoryItemDTO[]> {
    const sessions = await prisma.sesiKelasAktual.findMany({
      where: {
        sekolah_id: sekolahId,
        penugasan_mengajar_id: penugasanId,
      },
      include: {
        presensi_siswa: true,
      },
      orderBy: {
        tanggal: "desc",
      },
    });

    // Ambil rombel_id untuk menghitung total siswa aktif di kelas
    const firstSession = sessions[0];
    let totalRombelStudents = 0;
    if (firstSession) {
      totalRombelStudents = await prisma.penempatanRombel.count({
        where: {
          sekolah_id: sekolahId,
          rombel_id: firstSession.rombel_id,
          status: "AKTIF",
        },
      });
    }

    return sessions.map((s) => {
      const records = s.presensi_siswa;
      const sudah_diabsen = records.length > 0;
      const total_siswa = sudah_diabsen ? records.length : totalRombelStudents;

      let jumlah_hadir = 0;
      let jumlah_izin = 0;
      let jumlah_sakit = 0;
      let jumlah_alpha = 0;
      let jumlah_dispensasi = 0;
      let jumlah_terlambat = 0;

      for (const r of records) {
        if (r.status === "HADIR") jumlah_hadir++;
        else if (r.status === "IZIN") jumlah_izin++;
        else if (r.status === "SAKIT") jumlah_sakit++;
        else if (r.status === "ALPHA") jumlah_alpha++;
        else if (r.status === "DISPENSASI") jumlah_dispensasi++;
        else if (r.status === "TERLAMBAT") jumlah_terlambat++;
      }

      const persentase_kehadiran =
        total_siswa > 0 && sudah_diabsen
          ? Math.round(((jumlah_hadir + jumlah_terlambat + jumlah_dispensasi) / total_siswa) * 100)
          : 0;

      return {
        sesi_id: s.id,
        tanggal: s.tanggal,
        status_sesi: s.status,
        topik_pembelajaran: s.topik_pembelajaran,
        ruangan: s.ruangan_aktual,
        total_siswa,
        jumlah_hadir,
        jumlah_izin,
        jumlah_sakit,
        jumlah_alpha,
        jumlah_dispensasi,
        jumlah_terlambat,
        persentase_kehadiran,
        sudah_diabsen,
      };
    });
  }

  /**
   * Mengambil agregat kehadiran global untuk penugasan mengajar tertentu
   */
  async getOverallAttendanceStats(
    penugasanId: string,
    sekolahId: string
  ): Promise<{
    total_sesi_terjadwal: number;
    total_sesi_selesai: number;
    total_presensi_diambil: number;
    rata_rata_kehadiran: number;
  }> {
    const history = await this.getTeachingAssignmentAttendanceHistory(penugasanId, sekolahId);

    const total_sesi_terjadwal = history.length;
    const total_sesi_selesai = history.filter((h) => h.status_sesi === "SELESAI").length;
    const sessionsWithAttendance = history.filter((h) => h.sudah_diabsen);
    const total_presensi_diambil = sessionsWithAttendance.length;

    const rata_rata_kehadiran =
      sessionsWithAttendance.length > 0
        ? Math.round(
            sessionsWithAttendance.reduce((acc, cur) => acc + cur.persentase_kehadiran, 0) /
              sessionsWithAttendance.length
          )
        : 0;

    return {
      total_sesi_terjadwal,
      total_sesi_selesai,
      total_presensi_diambil,
      rata_rata_kehadiran,
    };
  }
}

export const attendanceRepository = new AttendanceRepository();

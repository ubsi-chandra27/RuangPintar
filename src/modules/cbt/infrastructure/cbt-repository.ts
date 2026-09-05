/**
 * Ruang Pintar — CBT Repository (M14)
 *
 * Mengelola persistensi Bank Soal, Versi Soal, Ujian, Snapshot Imutabel,
 * Sesi Attempt Siswa, Autosave Jawaban, Penilaian Server-Side, dan Transfer Gradebook.
 */

import { prisma } from "@/shared/infrastructure/database/prisma";
import { generateUlid } from "@/shared/lib/ulid";
import {
  BankSoalDTO,
  VersiSoalDTO,
  UjianCbtDTO,
  SnapshotUjianDTO,
  CbtPlayerStateDTO,
  SaveAnswerInput,
  HasilUjianCbtDTO,
  RecordIntegrityEventInput,
  EventIntegritasDTO,
  ManifestItemSoal,
  KunciPenilaianItem,
  OpsiJawabanSoal,
  BlueprintItemConfig,
  TipeSoal,
  TingkatKesulitan,
} from "../domain/cbt-types";
import {
  CbtNotFoundError,
  CbtAttemptClosedError,
  CbtTimerExpiredError,
  CbtOneActiveAttemptViolationError,
  CbtExamNotAvailableError,
  CbtTransferError,
  CbtAccessDeniedError,
} from "../domain/cbt-errors";

export class CbtRepository {
  // ============================================================================
  // 1. BANK SOAL & QUESTION VERSIONING
  // ============================================================================

  async createQuestion(
    data: {
      sekolah_id: string;
      guru_id: string;
      mata_pelajaran_id: string;
      lingkup_materi_id?: string | null;
      tujuan_pembelajaran_id?: string | null;
      kode: string;
      judul: string;
      tipe_soal: TipeSoal;
      tingkat_kesulitan: TingkatKesulitan;
      pertanyaan: string;
      gambar_url?: string | null;
      opsi_jawaban?: OpsiJawabanSoal[];
      kunci_jawaban: any;
      pembahasan?: string | null;
      bobot_default?: number;
    },
    creatorName: string
  ): Promise<BankSoalDTO> {
    const bankSoalId = generateUlid();
    const versiSoalId = generateUlid();

    const [bankSoal, versiSoal] = await prisma.$transaction(async (tx) => {
      const bs = await tx.bankSoal.create({
        data: {
          id: bankSoalId,
          sekolah_id: data.sekolah_id,
          guru_id: data.guru_id,
          mata_pelajaran_id: data.mata_pelajaran_id,
          lingkup_materi_id: data.lingkup_materi_id || null,
          tujuan_pembelajaran_id: data.tujuan_pembelajaran_id || null,
          kode: data.kode,
          judul: data.judul,
          tipe_soal: data.tipe_soal,
          tingkat_kesulitan: data.tingkat_kesulitan,
          versi_aktif: 1,
          status: "AKTIF",
        },
      });

      const vs = await tx.versiSoal.create({
        data: {
          id: versiSoalId,
          sekolah_id: data.sekolah_id,
          bank_soal_id: bankSoalId,
          nomor_versi: 1,
          pertanyaan: data.pertanyaan,
          gambar_url: data.gambar_url || null,
          opsi_jawaban: data.opsi_jawaban ? JSON.stringify(data.opsi_jawaban) : null,
          kunci_jawaban: JSON.stringify(data.kunci_jawaban),
          pembahasan: data.pembahasan || null,
          bobot_default: data.bobot_default || 1.0,
          dibuat_oleh: creatorName,
        },
      });

      return [bs, vs];
    });

    return {
      ...bankSoal,
      tipe_soal: bankSoal.tipe_soal as TipeSoal,
      tingkat_kesulitan: bankSoal.tingkat_kesulitan as TingkatKesulitan,
      pertanyaan: versiSoal.pertanyaan,
      gambar_url: versiSoal.gambar_url,
      opsi_jawaban: versiSoal.opsi_jawaban ? JSON.parse(versiSoal.opsi_jawaban) : undefined,
      kunci_jawaban: JSON.parse(versiSoal.kunci_jawaban || "[]"),
      pembahasan: versiSoal.pembahasan,
      bobot_default: versiSoal.bobot_default,
    };
  }

  async bulkCreateQuestions(
    questions: Array<{
      sekolah_id: string;
      guru_id: string;
      mata_pelajaran_id: string;
      kode: string;
      judul: string;
      tipe_soal: TipeSoal;
      tingkat_kesulitan: TingkatKesulitan;
      pertanyaan: string;
      gambar_url?: string | null;
      opsi_jawaban?: OpsiJawabanSoal[];
      kunci_jawaban: any;
      pembahasan?: string | null;
      bobot_default?: number;
    }>,
    creatorName: string
  ): Promise<number> {
    let createdCount = 0;
    for (const q of questions) {
      await this.createQuestion(q, creatorName);
      createdCount++;
    }
    return createdCount;
  }

  async updateQuestion(
    bankSoalId: string,
    data: {
      judul?: string;
      tingkat_kesulitan?: TingkatKesulitan;
      lingkup_materi_id?: string | null;
      tujuan_pembelajaran_id?: string | null;
      pertanyaan?: string;
      opsi_jawaban?: OpsiJawabanSoal[];
      kunci_jawaban?: string[];
      pembahasan?: string | null;
      bobot_default?: number;
    },
    updaterName: string
  ): Promise<BankSoalDTO> {
    const existing = await prisma.bankSoal.findUnique({
      where: { id: bankSoalId },
      include: {
        versi_soal: {
          orderBy: { nomor_versi: "desc" },
          take: 1,
        },
      },
    });

    if (!existing) {
      throw new CbtNotFoundError("Bank Soal", bankSoalId);
    }

    const latestVersion = existing.versi_soal[0];
    const isContentChanged =
      (data.pertanyaan && data.pertanyaan !== latestVersion?.pertanyaan) ||
      (data.opsi_jawaban && JSON.stringify(data.opsi_jawaban) !== latestVersion?.opsi_jawaban) ||
      (data.kunci_jawaban && JSON.stringify(data.kunci_jawaban) !== latestVersion?.kunci_jawaban) ||
      (data.bobot_default !== undefined && data.bobot_default !== latestVersion?.bobot_default) ||
      (data.pembahasan !== undefined && data.pembahasan !== latestVersion?.pembahasan);

    return await prisma.$transaction(async (tx) => {
      let nextVersionNum = existing.versi_aktif;

      if (isContentChanged) {
        nextVersionNum = existing.versi_aktif + 1;
        const newVersiId = generateUlid();

        await tx.versiSoal.create({
          data: {
            id: newVersiId,
            sekolah_id: existing.sekolah_id,
            bank_soal_id: existing.id,
            nomor_versi: nextVersionNum,
            pertanyaan: data.pertanyaan ?? latestVersion?.pertanyaan ?? "",
            opsi_jawaban: data.opsi_jawaban
              ? JSON.stringify(data.opsi_jawaban)
              : (latestVersion?.opsi_jawaban ?? null),
            kunci_jawaban: data.kunci_jawaban
              ? JSON.stringify(data.kunci_jawaban)
              : (latestVersion?.kunci_jawaban ?? "[]"),
            pembahasan:
              data.pembahasan !== undefined ? data.pembahasan : (latestVersion?.pembahasan ?? null),
            bobot_default: data.bobot_default ?? latestVersion?.bobot_default ?? 1.0,
            dibuat_oleh: updaterName,
          },
        });
      }

      const updatedBs = await tx.bankSoal.update({
        where: { id: bankSoalId },
        data: {
          judul: data.judul ?? existing.judul,
          tingkat_kesulitan: data.tingkat_kesulitan ?? existing.tingkat_kesulitan,
          lingkup_materi_id:
            data.lingkup_materi_id !== undefined
              ? data.lingkup_materi_id
              : existing.lingkup_materi_id,
          tujuan_pembelajaran_id:
            data.tujuan_pembelajaran_id !== undefined
              ? data.tujuan_pembelajaran_id
              : existing.tujuan_pembelajaran_id,
          versi_aktif: nextVersionNum,
        },
      });

      return {
        ...updatedBs,
        tipe_soal: updatedBs.tipe_soal as TipeSoal,
        tingkat_kesulitan: updatedBs.tingkat_kesulitan as TingkatKesulitan,
      };
    });
  }

  async getQuestionsBySubject(
    sekolahId: string,
    mataPelajaranId: string,
    filters?: {
      guruId?: string;
      tipe_soal?: string;
      tingkat_kesulitan?: string;
      search?: string;
    }
  ): Promise<BankSoalDTO[]> {
    const whereClause: any = {
      sekolah_id: sekolahId,
      mata_pelajaran_id: mataPelajaranId,
      status: "AKTIF",
    };

    if (filters?.guruId) whereClause.guru_id = filters.guruId;
    if (filters?.tipe_soal) whereClause.tipe_soal = filters.tipe_soal;
    if (filters?.tingkat_kesulitan) whereClause.tingkat_kesulitan = filters.tingkat_kesulitan;
    if (filters?.search) {
      whereClause.OR = [
        { judul: { contains: filters.search } },
        { kode: { contains: filters.search } },
      ];
    }

    const items = await prisma.bankSoal.findMany({
      where: whereClause,
      include: {
        mata_pelajaran: { select: { nama: true } },
        guru: { select: { nama_lengkap: true } },
        tujuan_pembelajaran: { select: { kode: true, deskripsi: true } },
        lingkup_materi: { select: { judul: true } },
        versi_soal: {
          orderBy: { nomor_versi: "desc" },
          take: 1,
        },
      },
      orderBy: { created_at: "desc" },
    });

    return items.map((bs) => {
      const activeVs = bs.versi_soal[0];
      return {
        id: bs.id,
        sekolah_id: bs.sekolah_id,
        guru_id: bs.guru_id,
        mata_pelajaran_id: bs.mata_pelajaran_id,
        lingkup_materi_id: bs.lingkup_materi_id,
        tujuan_pembelajaran_id: bs.tujuan_pembelajaran_id,
        kode: bs.kode,
        judul: bs.judul,
        tipe_soal: bs.tipe_soal as TipeSoal,
        tingkat_kesulitan: bs.tingkat_kesulitan as TingkatKesulitan,
        versi_aktif: bs.versi_aktif,
        status: bs.status,
        created_at: bs.created_at,
        updated_at: bs.updated_at,
        mata_pelajaran_nama: bs.mata_pelajaran.nama,
        guru_nama: bs.guru.nama_lengkap,
        tp_kode: bs.tujuan_pembelajaran?.kode || null,
        tp_deskripsi: bs.tujuan_pembelajaran?.deskripsi || null,
        lingkup_materi_judul: bs.lingkup_materi?.judul || null,
        pertanyaan: activeVs?.pertanyaan,
        gambar_url: activeVs?.gambar_url || null,
        opsi_jawaban: activeVs?.opsi_jawaban ? JSON.parse(activeVs.opsi_jawaban) : undefined,
        kunci_jawaban: activeVs?.kunci_jawaban ? JSON.parse(activeVs.kunci_jawaban) : undefined,
        pembahasan: activeVs?.pembahasan,
        bobot_default: activeVs?.bobot_default,
      };
    });
  }

  async getQuestionDetail(id: string): Promise<BankSoalDTO | null> {
    const bs = await prisma.bankSoal.findUnique({
      where: { id },
      include: {
        mata_pelajaran: { select: { nama: true } },
        guru: { select: { nama_lengkap: true } },
        tujuan_pembelajaran: { select: { kode: true, deskripsi: true } },
        lingkup_materi: { select: { judul: true } },
        versi_soal: {
          orderBy: { nomor_versi: "desc" },
        },
      },
    });

    if (!bs) return null;
    const activeVs =
      bs.versi_soal.find((v) => v.nomor_versi === bs.versi_aktif) || bs.versi_soal[0];

    return {
      id: bs.id,
      sekolah_id: bs.sekolah_id,
      guru_id: bs.guru_id,
      mata_pelajaran_id: bs.mata_pelajaran_id,
      lingkup_materi_id: bs.lingkup_materi_id,
      tujuan_pembelajaran_id: bs.tujuan_pembelajaran_id,
      kode: bs.kode,
      judul: bs.judul,
      tipe_soal: bs.tipe_soal as TipeSoal,
      tingkat_kesulitan: bs.tingkat_kesulitan as TingkatKesulitan,
      versi_aktif: bs.versi_aktif,
      status: bs.status,
      created_at: bs.created_at,
      updated_at: bs.updated_at,
      mata_pelajaran_nama: bs.mata_pelajaran.nama,
      guru_nama: bs.guru.nama_lengkap,
      tp_kode: bs.tujuan_pembelajaran?.kode || null,
      tp_deskripsi: bs.tujuan_pembelajaran?.deskripsi || null,
      lingkup_materi_judul: bs.lingkup_materi?.judul || null,
      pertanyaan: activeVs?.pertanyaan,
      gambar_url: activeVs?.gambar_url || null,
      opsi_jawaban: activeVs?.opsi_jawaban ? JSON.parse(activeVs.opsi_jawaban) : undefined,
      kunci_jawaban: activeVs?.kunci_jawaban ? JSON.parse(activeVs.kunci_jawaban) : undefined,
      pembahasan: activeVs?.pembahasan,
      bobot_default: activeVs?.bobot_default,
    };
  }

  // ============================================================================
  // 2. EXAM BLUEPRINT & IMMUTABLE SNAPSHOT
  // ============================================================================

  async createExam(
    data: {
      sekolah_id: string;
      penugasan_mengajar_id: string;
      asesmen_id?: string | null;
      judul: string;
      deskripsi?: string | null;
      durasi_menit: number;
      waktu_mulai?: string | null;
      waktu_selesai?: string | null;
      kkm_kktp?: number;
      acak_soal?: boolean;
      acak_opsi?: boolean;
      gunakan_token?: boolean;
      token_masuk?: string | null;
      tampilkan_nilai?: boolean;
      tampilkan_pembahasan?: boolean;
      maksimal_attempt?: number;
      blueprint: BlueprintItemConfig[];
    },
    creatorName: string
  ): Promise<UjianCbtDTO> {
    const examId = generateUlid();

    // Verify all questions in blueprint exist
    const questionIds = data.blueprint.map((b) => b.bank_soal_id);
    const questions = await prisma.bankSoal.findMany({
      where: { id: { in: questionIds } },
      include: { versi_soal: true },
    });

    if (questions.length !== questionIds.length) {
      throw new CbtNotFoundError("Sebagian soal pada blueprint tidak ditemukan.");
    }

    // Automatically freeze an initial snapshot for the exam
    const snapshotId = generateUlid();
    const manifestSoal: ManifestItemSoal[] = [];
    const kunciPenilaian: KunciPenilaianItem[] = [];
    let totalBobot = 0;

    data.blueprint.forEach((bp, index) => {
      const q = questions.find((item) => item.id === bp.bank_soal_id);
      if (!q) return;
      const vs = q.versi_soal.find((v) => v.id === bp.versi_soal_id) || q.versi_soal[0];
      if (!vs) return;

      totalBobot += bp.bobot;

      // Clean manifest WITHOUT answer key (Zero Answer Key Leakage Invariant)
      let cleanOpsi: any = vs.opsi_jawaban ? JSON.parse(vs.opsi_jawaban) : null;
      if (q.tipe_soal === "MENJODOHKAN" && Array.isArray(cleanOpsi)) {
        const allTargets = cleanOpsi
          .map((item: any) => item.pasangan || item.target || item.respon)
          .filter(Boolean);
        const shuffledTargets = [...allTargets].sort(() => Math.random() - 0.5);
        cleanOpsi = {
          premis: cleanOpsi.map((item: any, i: number) => ({
            id: item.label || item.id || String(i + 1),
            teks: item.teks,
          })),
          pilihan_target: shuffledTargets,
        };
      }

      manifestSoal.push({
        nomor_urut: index + 1,
        soal_id: q.id,
        versi_soal_id: vs.id,
        tipe_soal: q.tipe_soal as TipeSoal,
        pertanyaan: vs.pertanyaan,
        gambar_url: vs.gambar_url || null,
        opsi_jawaban: cleanOpsi,
        bobot: bp.bobot,
      });

      // Secret scoring keys strictly on server boundary
      kunciPenilaian.push({
        soal_id: q.id,
        versi_soal_id: vs.id,
        tipe_soal: q.tipe_soal as TipeSoal,
        kunci_jawaban: vs.kunci_jawaban ? JSON.parse(vs.kunci_jawaban) : [],
        bobot: bp.bobot,
      });
    });

    const [exam] = await prisma.$transaction(async (tx) => {
      const newExam = await tx.ujianCbt.create({
        data: {
          id: examId,
          sekolah_id: data.sekolah_id,
          penugasan_mengajar_id: data.penugasan_mengajar_id,
          asesmen_id: data.asesmen_id || null,
          judul: data.judul,
          deskripsi: data.deskripsi || null,
          durasi_menit: data.durasi_menit,
          waktu_mulai: data.waktu_mulai ? new Date(data.waktu_mulai) : null,
          waktu_selesai: data.waktu_selesai ? new Date(data.waktu_selesai) : null,
          kkm_kktp: data.kkm_kktp || 75.0,
          acak_soal: data.acak_soal || false,
          acak_opsi: data.acak_opsi || false,
          gunakan_token: data.gunakan_token || false,
          token_masuk: data.token_masuk || null,
          tampilkan_nilai: data.tampilkan_nilai || false,
          tampilkan_pembahasan: data.tampilkan_pembahasan || false,
          maksimal_attempt: data.maksimal_attempt || 1,
          status: "DITERBITKAN",
          blueprint: JSON.stringify(data.blueprint),
          snapshot_aktif_id: snapshotId,
        },
      });

      await tx.snapshotUjian.create({
        data: {
          id: snapshotId,
          sekolah_id: data.sekolah_id,
          ujian_cbt_id: examId,
          nomor_snapshot: 1,
          total_soal: manifestSoal.length,
          total_bobot: totalBobot,
          durasi_menit: data.durasi_menit,
          konfigurasi: JSON.stringify({
            kkm_kktp: data.kkm_kktp || 75.0,
            acak_soal: data.acak_soal || false,
            acak_opsi: data.acak_opsi || false,
          }),
          manifest_soal: JSON.stringify(manifestSoal),
          kunci_penilaian: JSON.stringify(kunciPenilaian),
          dibekukan_oleh: creatorName,
        },
      });

      return [newExam];
    });

    return {
      ...exam,
      status: exam.status as any,
      blueprint: JSON.parse(exam.blueprint || "[]"),
      total_soal: manifestSoal.length,
    };
  }

  async getExamsByAssignment(penugasanId: string): Promise<UjianCbtDTO[]> {
    const exams = await prisma.ujianCbt.findMany({
      where: { penugasan_mengajar_id: penugasanId },
      include: {
        asesmen: { select: { judul: true } },
        snapshot_ujian: {
          orderBy: { nomor_snapshot: "desc" },
          take: 1,
          select: { total_soal: true },
        },
        sesi_ujian_siswa: {
          select: { id: true, status: true, siswa_id: true },
        },
      },
      orderBy: { created_at: "desc" },
    });

    return exams.map((e) => {
      const completedAttempts = e.sesi_ujian_siswa.filter(
        (s) => s.status !== "SEDANG_MENGERJAKAN"
      ).length;
      return {
        id: e.id,
        sekolah_id: e.sekolah_id,
        penugasan_mengajar_id: e.penugasan_mengajar_id,
        asesmen_id: e.asesmen_id,
        judul: e.judul,
        deskripsi: e.deskripsi,
        durasi_menit: e.durasi_menit,
        waktu_mulai: e.waktu_mulai,
        waktu_selesai: e.waktu_selesai,
        kkm_kktp: e.kkm_kktp,
        acak_soal: e.acak_soal,
        acak_opsi: e.acak_opsi,
        gunakan_token: e.gunakan_token,
        token_masuk: e.token_masuk,
        tampilkan_nilai: e.tampilkan_nilai,
        tampilkan_pembahasan: e.tampilkan_pembahasan,
        maksimal_attempt: e.maksimal_attempt,
        status: e.status as any,
        blueprint: e.blueprint ? JSON.parse(e.blueprint) : null,
        snapshot_aktif_id: e.snapshot_aktif_id,
        asesmen_judul: e.asesmen?.judul || null,
        total_soal: e.snapshot_ujian[0]?.total_soal || 0,
        total_peserta: e.sesi_ujian_siswa.length,
        jumlah_sudah_selesai: completedAttempts,
        created_at: e.created_at,
        updated_at: e.updated_at,
      };
    });
  }

  async getExamDetail(id: string): Promise<UjianCbtDTO | null> {
    const e = await prisma.ujianCbt.findUnique({
      where: { id },
      include: {
        penugasan_mengajar: {
          include: {
            rombel: { select: { nama: true } },
            mata_pelajaran: { select: { nama: true } },
          },
        },
        asesmen: { select: { judul: true } },
        snapshot_ujian: {
          orderBy: { nomor_snapshot: "desc" },
          take: 1,
        },
      },
    });

    if (!e) return null;

    return {
      id: e.id,
      sekolah_id: e.sekolah_id,
      penugasan_mengajar_id: e.penugasan_mengajar_id,
      asesmen_id: e.asesmen_id,
      judul: e.judul,
      deskripsi: e.deskripsi,
      durasi_menit: e.durasi_menit,
      waktu_mulai: e.waktu_mulai,
      waktu_selesai: e.waktu_selesai,
      kkm_kktp: e.kkm_kktp,
      acak_soal: e.acak_soal,
      acak_opsi: e.acak_opsi,
      gunakan_token: e.gunakan_token,
      token_masuk: e.token_masuk,
      tampilkan_nilai: e.tampilkan_nilai,
      tampilkan_pembahasan: e.tampilkan_pembahasan,
      maksimal_attempt: e.maksimal_attempt,
      status: e.status as any,
      blueprint: e.blueprint ? JSON.parse(e.blueprint) : null,
      snapshot_aktif_id: e.snapshot_aktif_id,
      rombel_nama: e.penugasan_mengajar.rombel.nama,
      mata_pelajaran_nama: e.penugasan_mengajar.mata_pelajaran.nama,
      asesmen_judul: e.asesmen?.judul || null,
      total_soal: e.snapshot_ujian[0]?.total_soal || 0,
      created_at: e.created_at,
      updated_at: e.updated_at,
    };
  }

  // ============================================================================
  // 3. ATTEMPT LIFECYCLE & SERVER-AUTHORITATIVE TIMER
  // ============================================================================

  async startOrResumeAttempt(
    examId: string,
    siswaIdOrSnapshotId: string,
    contextInfoOrSiswaId?: any,
    maybePenempatanRombelId?: string,
    maybeDurasiMenit?: number,
    maybeMetadata?: { ipAddress?: string; userAgent?: string; tokenInput?: string }
  ): Promise<any> {
    const siswaId =
      typeof contextInfoOrSiswaId === "string" ? contextInfoOrSiswaId : siswaIdOrSnapshotId;
    const contextInfo =
      typeof contextInfoOrSiswaId === "object"
        ? contextInfoOrSiswaId
        : maybeMetadata
          ? {
              ip: maybeMetadata.ipAddress,
              userAgent: maybeMetadata.userAgent,
              tokenInput: (maybeMetadata as any).tokenInput,
            }
          : undefined;

    const exam = await prisma.ujianCbt.findUnique({
      where: { id: examId },
      include: {
        penugasan_mengajar: {
          include: {
            rombel: { select: { nama: true } },
            mata_pelajaran: { select: { nama: true } },
          },
        },
      },
    });

    if (!exam) {
      throw new CbtNotFoundError("Ujian CBT", examId);
    }

    const siswa = await prisma.siswa.findUnique({
      where: { id: siswaId },
    });

    if (!siswa) {
      throw new CbtNotFoundError("Siswa", siswaId);
    }

    const penempatan = await prisma.penempatanRombel.findFirst({
      where: {
        rombel_id: exam.penugasan_mengajar.rombel_id,
        status: "AKTIF",
        keikutsertaan: {
          siswa_id: siswaId,
        },
      },
    });

    // Check existing active attempt (One Active Attempt Invariant)
    const existingAttempts = await prisma.sesiUjianSiswa.findMany({
      where: { ujian_cbt_id: examId, siswa_id: siswaId },
      orderBy: { attempt_ke: "desc" },
    });

    const activeAttempt = existingAttempts.find(
      (a) => a.status === "SEDANG_MENGERJAKAN" || a.status === "TERKUNCI_PELANGGARAN"
    );

    if (activeAttempt) {
      return activeAttempt;
    }

    // Validate exam token if required
    if (exam.gunakan_token && exam.token_masuk) {
      const givenToken = (contextInfo?.tokenInput || "").trim().toUpperCase();
      const expectedToken = exam.token_masuk.trim().toUpperCase();
      if (!givenToken || givenToken !== expectedToken) {
        throw new CbtAccessDeniedError(
          "Token ujian tidak valid. Pastikan token yang Anda masukkan sesuai dengan yang diberikan oleh pengawas ruang."
        );
      }
    }

    // CREATE NEW ATTEMPT
    let snapshot = exam.snapshot_aktif_id
      ? await prisma.snapshotUjian.findUnique({ where: { id: exam.snapshot_aktif_id } })
      : null;

    if (!snapshot) {
      snapshot = await prisma.snapshotUjian.findFirst({
        where: { ujian_cbt_id: examId },
        orderBy: { nomor_snapshot: "desc" },
      });
    }

    if (!snapshot) {
      throw new CbtNotFoundError("Snapshot Ujian", examId);
    }

    const now = new Date();
    const duration = maybeDurasiMenit || snapshot.durasi_menit || exam.durasi_menit || 60;
    const serverDeadline = new Date(now.getTime() + duration * 60 * 1000);
    const nextAttemptNum = existingAttempts.length + 1;
    const attemptId = generateUlid();

    const manifestItems: any[] = JSON.parse(snapshot.manifest_soal);
    let questionOrder = manifestItems.map((m) => m.soal_id);

    if (exam.acak_soal) {
      questionOrder = [...questionOrder].sort(() => Math.random() - 0.5);
    }

    const session = await prisma.sesiUjianSiswa.create({
      data: {
        id: attemptId,
        sekolah_id: exam.sekolah_id,
        ujian_cbt_id: exam.id,
        snapshot_id: snapshot.id,
        siswa_id: siswa.id,
        penempatan_rombel_id: maybePenempatanRombelId || penempatan?.id || null,
        attempt_ke: nextAttemptNum,
        waktu_mulai: now,
        batas_waktu_server: serverDeadline,
        status: "SEDANG_MENGERJAKAN",
        urutan_soal_peserta: JSON.stringify(questionOrder),
        ip_address: contextInfo?.ip || null,
        user_agent: contextInfo?.userAgent || null,
      },
    });

    return session;
  }

  async loadPlayerState(attemptId: string, siswaId: string): Promise<CbtPlayerStateDTO> {
    const attempt = await prisma.sesiUjianSiswa.findUnique({
      where: { id: attemptId },
      include: {
        ujian_cbt: {
          include: {
            penugasan_mengajar: {
              include: {
                rombel: { select: { nama: true } },
                mata_pelajaran: { select: { nama: true } },
              },
            },
          },
        },
        snapshot: true,
        siswa: { select: { id: true, nama_lengkap: true, nis: true } },
        jawaban_siswa: true,
      },
    });

    if (!attempt) {
      throw new CbtNotFoundError("Sesi Ujian", attemptId);
    }

    if (attempt.siswa_id !== siswaId) {
      throw new CbtAttemptClosedError(
        "Akses ditolak: Anda tidak memiliki akses ke sesi ujian ini."
      );
    }

    const now = new Date();
    const serverDeadline = new Date(attempt.batas_waktu_server);
    const remainingSeconds = Math.max(
      0,
      Math.floor((serverDeadline.getTime() - now.getTime()) / 1000)
    );

    // Check if time expired server-side
    if (remainingSeconds <= 0 && attempt.status === "SEDANG_MENGERJAKAN") {
      // Automatically auto-submit/close attempt
      await this.submitAttempt(attemptId, "Batas waktu pengerjaan habis");
      throw new CbtTimerExpiredError();
    }

    // Parse clean manifest without answers
    const rawManifest: ManifestItemSoal[] = JSON.parse(attempt.snapshot.manifest_soal);
    const customOrder: string[] = attempt.urutan_soal_peserta
      ? JSON.parse(attempt.urutan_soal_peserta)
      : rawManifest.map((m) => m.soal_id);

    // Sort manifest according to participant's randomized sequence
    const orderedManifest: ManifestItemSoal[] = [];
    customOrder.forEach((soalId, idx) => {
      const item = rawManifest.find((m) => m.soal_id === soalId);
      if (item) {
        orderedManifest.push({
          ...item,
          nomor_urut: idx + 1,
        });
      }
    });

    // Map saved answers
    const jawabanMap: Record<
      string,
      { jawaban: string[] | string | null; ragu_ragu: boolean; terakhir_disimpan: string }
    > = {};

    attempt.jawaban_siswa.forEach((j) => {
      jawabanMap[j.soal_id] = {
        jawaban: j.jawaban_peserta ? JSON.parse(j.jawaban_peserta) : null,
        ragu_ragu: j.ragu_ragu,
        terakhir_disimpan: j.waktu_simpan.toISOString(),
      };
    });

    return {
      sesi_id: attempt.id,
      ujian_id: attempt.ujian_cbt_id,
      snapshot_id: attempt.snapshot_id,
      judul_ujian: attempt.ujian_cbt.judul,
      deskripsi_ujian: attempt.ujian_cbt.deskripsi,
      mata_pelajaran_nama: attempt.ujian_cbt.penugasan_mengajar.mata_pelajaran.nama,
      rombel_nama: attempt.ujian_cbt.penugasan_mengajar.rombel.nama,
      siswa_id: attempt.siswa.id,
      siswa_nama: attempt.siswa.nama_lengkap,
      siswa_nis: attempt.siswa.nis,
      durasi_menit: attempt.snapshot.durasi_menit,
      waktu_mulai: attempt.waktu_mulai.toISOString(),
      batas_waktu_server: attempt.batas_waktu_server.toISOString(),
      sisa_detik_server: remainingSeconds,
      status: attempt.status as any,
      daftar_soal: orderedManifest,
      jawaban_tersimpan: jawabanMap,
    };
  }

  // ============================================================================
  // 4. IDEMPOTENT AUTOSAVE JAWABAN
  // ============================================================================

  async saveAnswer(
    input: SaveAnswerInput,
    siswaId: string
  ): Promise<{ success: boolean; waktu_simpan: string }> {
    const attempt = await prisma.sesiUjianSiswa.findUnique({
      where: { id: input.sesi_ujian_id },
    });

    if (!attempt) {
      throw new CbtNotFoundError("Sesi Ujian", input.sesi_ujian_id);
    }

    if (attempt.siswa_id !== siswaId) {
      throw new CbtAttemptClosedError("Akses ditolak: Anda tidak berhak mengubah sesi ini.");
    }

    if (attempt.status !== "SEDANG_MENGERJAKAN") {
      throw new CbtAttemptClosedError("Sesi ujian sudah dikumpulkan atau terkunci.");
    }

    const now = new Date();
    if (now.getTime() > attempt.batas_waktu_server.getTime()) {
      await this.submitAttempt(attempt.id, "Batas waktu pengerjaan habis");
      throw new CbtTimerExpiredError();
    }

    const serializedJawaban =
      input.jawaban_peserta !== null && input.jawaban_peserta !== undefined
        ? typeof input.jawaban_peserta === "string"
          ? input.jawaban_peserta
          : JSON.stringify(input.jawaban_peserta)
        : null;

    const answerId = generateUlid();

    const saved = await prisma.jawabanSiswa.upsert({
      where: {
        sesi_ujian_id_soal_id: {
          sesi_ujian_id: input.sesi_ujian_id,
          soal_id: input.soal_id,
        },
      },
      update: {
        versi_soal_id: input.versi_soal_id,
        jawaban_peserta: serializedJawaban,
        ragu_ragu: input.ragu_ragu !== undefined ? input.ragu_ragu : false,
        waktu_simpan: now,
      },
      create: {
        id: answerId,
        sekolah_id: attempt.sekolah_id,
        sesi_ujian_id: input.sesi_ujian_id,
        soal_id: input.soal_id,
        versi_soal_id: input.versi_soal_id,
        jawaban_peserta: serializedJawaban,
        ragu_ragu: input.ragu_ragu || false,
        waktu_simpan: now,
      },
    });

    return {
      success: true,
      waktu_simpan: saved.waktu_simpan.toISOString(),
    };
  }

  // ============================================================================
  // 5. SERVER-SIDE SCORING & SUBMISSION
  // ============================================================================

  async submitAttempt(attemptId: string, reason?: string): Promise<HasilUjianCbtDTO> {
    const attempt = await prisma.sesiUjianSiswa.findUnique({
      where: { id: attemptId },
      include: {
        snapshot: true,
        ujian_cbt: true,
        siswa: { select: { id: true, nama_lengkap: true, nis: true } },
        jawaban_siswa: true,
      },
    });

    if (!attempt) {
      throw new CbtNotFoundError("Sesi Ujian", attemptId);
    }

    // Idempotent: If already submitted, return existing result
    if (attempt.status !== "SEDANG_MENGERJAKAN") {
      const existingResult = await prisma.hasilUjianCbt.findUnique({
        where: { sesi_ujian_id: attemptId },
      });
      if (existingResult) {
        return {
          ...existingResult,
          status_transfer: existingResult.status_transfer as any,
          siswa_nama: attempt.siswa.nama_lengkap,
          siswa_nis: attempt.siswa.nis,
          waktu_selesai: attempt.waktu_selesai,
          jumlah_event_integritas: 0,
        };
      }
    }

    const kunciPenilaianList: KunciPenilaianItem[] = JSON.parse(attempt.snapshot.kunci_penilaian);
    let totalBenar = 0;
    let totalSalah = 0;
    let totalKosong = 0;
    let skorMentah = 0;
    let skorMaksimal = 0;
    let hasEssay = false;

    // Evaluate answers server-side
    const answersToUpdate: { id: string; apakah_benar: boolean; skor_diperoleh: number }[] = [];

    kunciPenilaianList.forEach((kunci) => {
      skorMaksimal += kunci.bobot;
      const userAns = attempt.jawaban_siswa.find((j) => j.soal_id === kunci.soal_id);

      if (!userAns || !userAns.jawaban_peserta) {
        totalKosong++;
        return;
      }

      let parsedAns: any = userAns.jawaban_peserta;
      try {
        if (typeof parsedAns === "string") {
          parsedAns = JSON.parse(parsedAns);
          if (typeof parsedAns === "string") {
            parsedAns = JSON.parse(parsedAns);
          }
        }
      } catch {
        parsedAns = userAns.jawaban_peserta;
      }

      if (kunci.tipe_soal === "PILIHAN_GANDA" || kunci.tipe_soal === "BENAR_SALAH") {
        const studentChoice = Array.isArray(parsedAns) ? parsedAns[0] : parsedAns;
        const correctChoice = kunci.kunci_jawaban[0];
        const isCorrect =
          String(studentChoice).trim().toUpperCase() === String(correctChoice).trim().toUpperCase();

        if (isCorrect) {
          totalBenar++;
          skorMentah += kunci.bobot;
          answersToUpdate.push({ id: userAns.id, apakah_benar: true, skor_diperoleh: kunci.bobot });
        } else {
          totalSalah++;
          answersToUpdate.push({ id: userAns.id, apakah_benar: false, skor_diperoleh: 0 });
        }
      } else if (kunci.tipe_soal === "PILIHAN_GANDA_KOMPLEKS") {
        const studentChoices = Array.isArray(parsedAns) ? parsedAns : [parsedAns];
        const correctChoices = kunci.kunci_jawaban;

        // Exact match of all selected answers
        const isExactMatch =
          studentChoices.length === correctChoices.length &&
          studentChoices.every((c: string) => correctChoices.includes(c));

        if (isExactMatch) {
          totalBenar++;
          skorMentah += kunci.bobot;
          answersToUpdate.push({ id: userAns.id, apakah_benar: true, skor_diperoleh: kunci.bobot });
        } else {
          totalSalah++;
          answersToUpdate.push({ id: userAns.id, apakah_benar: false, skor_diperoleh: 0 });
        }
      } else if (kunci.tipe_soal === "ISIAN_SINGKAT") {
        const studentText = String(Array.isArray(parsedAns) ? parsedAns[0] : parsedAns)
          .trim()
          .toLowerCase();
        const isCorrect = kunci.kunci_jawaban.some((k) => k.trim().toLowerCase() === studentText);

        if (isCorrect) {
          totalBenar++;
          skorMentah += kunci.bobot;
          answersToUpdate.push({ id: userAns.id, apakah_benar: true, skor_diperoleh: kunci.bobot });
        } else {
          totalSalah++;
          answersToUpdate.push({ id: userAns.id, apakah_benar: false, skor_diperoleh: 0 });
        }
      } else if (kunci.tipe_soal === "MENJODOHKAN") {
        let pairMap: Record<string, string> = {};
        if (typeof kunci.kunci_jawaban === "object" && !Array.isArray(kunci.kunci_jawaban)) {
          pairMap = (kunci.kunci_jawaban as any).pasangan || kunci.kunci_jawaban;
        } else if (Array.isArray(kunci.kunci_jawaban)) {
          kunci.kunci_jawaban.forEach((item: any, idx: number) => {
            if (item && typeof item === "object" && item.premis) {
              pairMap[item.id || item.premis] = item.pasangan;
            } else if (typeof item === "string") {
              pairMap[String(idx + 1)] = item;
            }
          });
        }

        const studentPairs: Record<string, string> =
          typeof parsedAns === "object" && parsedAns !== null && !Array.isArray(parsedAns)
            ? parsedAns.jawaban_menjodohkan || parsedAns
            : {};

        const totalPairs = Object.keys(pairMap).length;
        let matchedCount = 0;
        if (totalPairs > 0) {
          for (const [k, v] of Object.entries(pairMap)) {
            if (
              studentPairs[k] &&
              String(studentPairs[k]).trim().toLowerCase() === String(v).trim().toLowerCase()
            ) {
              matchedCount++;
            }
          }
        }

        const earned = totalPairs > 0 ? (matchedCount / totalPairs) * kunci.bobot : 0;
        const roundedEarned = Math.round(earned * 100) / 100;
        if (matchedCount === totalPairs && totalPairs > 0) {
          totalBenar++;
        } else if (matchedCount > 0) {
          totalBenar++; // Nilai proporsional
        } else {
          totalSalah++;
        }
        skorMentah += roundedEarned;
        answersToUpdate.push({
          id: userAns.id,
          apakah_benar: matchedCount === totalPairs,
          skor_diperoleh: roundedEarned,
        });
      } else if (kunci.tipe_soal === "ESAI") {
        hasEssay = true;
      }
    });

    const totalDijawab = attempt.jawaban_siswa.filter((j) => j.jawaban_peserta !== null).length;
    const finalScore = skorMaksimal > 0 ? (skorMentah / skorMaksimal) * 100 : 0;
    const roundedFinalScore = Math.round(finalScore * 10) / 10;
    const isTuntas = roundedFinalScore >= attempt.ujian_cbt.kkm_kktp;
    const now = new Date();
    const resultId = generateUlid();

    const [savedResult] = await prisma.$transaction(async (tx) => {
      // 1. Update individual answer records
      for (const ans of answersToUpdate) {
        await tx.jawabanSiswa.update({
          where: { id: ans.id },
          data: { apakah_benar: ans.apakah_benar, skor_diperoleh: ans.skor_diperoleh },
        });
      }

      // 2. Finalize attempt status
      await tx.sesiUjianSiswa.update({
        where: { id: attemptId },
        data: {
          status: "DIKUMPULKAN",
          waktu_selesai: now,
        },
      });

      // 3. Upsert HasilUjianCbt
      const res = await tx.hasilUjianCbt.upsert({
        where: { sesi_ujian_id: attemptId },
        create: {
          id: resultId,
          sekolah_id: attempt.sekolah_id,
          sesi_ujian_id: attemptId,
          ujian_cbt_id: attempt.ujian_cbt_id,
          siswa_id: attempt.siswa_id,
          total_soal: kunciPenilaianList.length,
          total_dijawab: totalDijawab,
          jumlah_benar: totalBenar,
          jumlah_salah: totalSalah,
          jumlah_kosong: totalKosong,
          skor_mentah: skorMentah,
          skor_maksimal: skorMaksimal,
          nilai_akhir: roundedFinalScore,
          apakah_tuntas: isTuntas,
          status_penilaian: hasEssay ? "PERLU_KOREKSI_MANUAL" : "LENGKAP",
          status_transfer: "BELUM_DITRANSFER",
        },
        update: {
          total_soal: kunciPenilaianList.length,
          total_dijawab: totalDijawab,
          jumlah_benar: totalBenar,
          jumlah_salah: totalSalah,
          jumlah_kosong: totalKosong,
          skor_mentah: skorMentah,
          skor_maksimal: skorMaksimal,
          nilai_akhir: roundedFinalScore,
          apakah_tuntas: isTuntas,
        },
      });

      return [res];
    });

    return {
      ...savedResult,
      total_benar: savedResult.jumlah_benar,
      total_salah: savedResult.jumlah_salah,
      total_kosong: savedResult.jumlah_kosong,
      total_skor_diperoleh: savedResult.skor_mentah,
      total_skor_maksimal: savedResult.skor_maksimal,
      status_kelulusan: (savedResult.apakah_tuntas ? "TUNTAS" : "BELUM_TUNTAS") as
        "TUNTAS" | "BELUM_TUNTAS",
      status_transfer: savedResult.status_transfer as any,
      siswa_nama: attempt.siswa.nama_lengkap,
      siswa_nis: attempt.siswa.nis,
      waktu_selesai: now,
      jumlah_event_integritas: 0,
    };
  }

  // ============================================================================
  // 6. INTEGRITY EVENTS
  // ============================================================================

  async recordIntegrityEvent(input: any): Promise<any> {
    const attemptId = input.sesi_ujian_siswa_id || input.sesi_ujian_id;
    const rawJenis = input.tipe_event || input.jenis_event || "LAINNYA";
    const jenisEvent =
      rawJenis === "KELUAR_LAYAR_PENUH"
        ? "FULLSCREEN_EXIT"
        : rawJenis === "PINDAH_TAB_ATAU_WINDOW"
          ? "TAB_SWITCH"
          : rawJenis === "PERCOBAAN_DEVTOOLS"
            ? "WINDOW_BLUR"
            : rawJenis;

    const attempt = await prisma.sesiUjianSiswa.findUnique({
      where: { id: attemptId },
      select: { sekolah_id: true, status: true },
    });

    if (!attempt) {
      throw new CbtNotFoundError("Sesi Ujian", attemptId);
    }

    const eventId = generateUlid();
    const event = await prisma.eventIntegritasUjian.create({
      data: {
        id: eventId,
        sekolah_id: attempt.sekolah_id,
        sesi_ujian_id: attemptId,
        jenis_event: jenisEvent,
        deskripsi: input.deskripsi,
        payload:
          input.metadata || input.payload ? JSON.stringify(input.metadata || input.payload) : null,
      },
    });

    return {
      id: event.id,
      sesi_ujian_siswa_id: event.sesi_ujian_id,
      sesi_ujian_id: event.sesi_ujian_id,
      tipe_event: input.tipe_event || event.jenis_event,
      jenis_event: event.jenis_event as any,
      deskripsi: event.deskripsi,
      waktu_kejadian: event.waktu_kejadian,
    };
  }

  async getAttemptIntegrityEvents(attemptId: string): Promise<any[]> {
    const events = await prisma.eventIntegritasUjian.findMany({
      where: { sesi_ujian_id: attemptId },
      orderBy: { waktu_kejadian: "asc" },
    });

    return events.map((e) => ({
      id: e.id,
      sesi_ujian_id: e.sesi_ujian_id,
      sesi_ujian_siswa_id: e.sesi_ujian_id,
      jenis_event: e.jenis_event,
      tipe_event:
        e.jenis_event === "FULLSCREEN_EXIT"
          ? "KELUAR_LAYAR_PENUH"
          : e.jenis_event === "TAB_SWITCH"
            ? "PINDAH_TAB_ATAU_WINDOW"
            : e.jenis_event,
      deskripsi: e.deskripsi,
      waktu_kejadian: e.waktu_kejadian,
    }));
  }

  // ============================================================================
  // 7. EXAM RESULTS & OFFICIAL PHASE 13 GRADEBOOK TRANSFER
  // ============================================================================

  async getExamResults(examId: string): Promise<HasilUjianCbtDTO[]> {
    const results = await prisma.hasilUjianCbt.findMany({
      where: { ujian_cbt_id: examId },
      include: {
        siswa: { select: { nama_lengkap: true, nis: true } },
        sesi_ujian: {
          select: {
            waktu_selesai: true,
            _count: { select: { event_integritas_ujian: true } },
          },
        },
      },
      orderBy: { siswa: { nama_lengkap: "asc" } },
    });

    return results.map((r) => ({
      id: r.id,
      sesi_ujian_id: r.sesi_ujian_id,
      ujian_cbt_id: r.ujian_cbt_id,
      siswa_id: r.siswa_id,
      siswa_nama: r.siswa.nama_lengkap,
      siswa_nis: r.siswa.nis,
      total_soal: r.total_soal,
      total_dijawab: r.total_dijawab,
      jumlah_benar: r.jumlah_benar,
      jumlah_salah: r.jumlah_salah,
      jumlah_kosong: r.jumlah_kosong,
      skor_mentah: r.skor_mentah,
      skor_maksimal: r.skor_maksimal,
      nilai_akhir: r.nilai_akhir,
      apakah_tuntas: r.apakah_tuntas,
      status_penilaian: r.status_penilaian,
      status_transfer: r.status_transfer as any,
      ditransfer_ke_nilai_siswa_id: r.ditransfer_ke_nilai_siswa_id,
      waktu_selesai: r.sesi_ujian.waktu_selesai,
      jumlah_event_integritas: r.sesi_ujian._count.event_integritas_ujian,
    }));
  }

  /**
   * Official Transfer Contract: Bridges CBT result into Phase 13 Assessment & Gradebook.
   * Does NOT duplicate gradebook tables. Updates existing or creates NilaiSiswa under DefinisiAsesmen.
   */
  async transferResultToGradebook(
    hasilId: string,
    targetAsesmenId: string,
    transferredByName: string
  ): Promise<{ success: boolean; nilai_siswa_id: string; nilai_akhir: number }> {
    const hasil = await prisma.hasilUjianCbt.findUnique({
      where: { id: hasilId },
      include: {
        ujian_cbt: true,
        sesi_ujian: { select: { penempatan_rombel_id: true } },
      },
    });

    if (!hasil) {
      throw new CbtNotFoundError("Hasil CBT", hasilId);
    }

    // Verify Target Assessment in Phase 13 domain
    const targetAsesmen = await prisma.definisiAsesmen.findUnique({
      where: { id: targetAsesmenId },
    });

    if (!targetAsesmen) {
      throw new CbtNotFoundError("Definisi Asesmen (Target Gradebook)", targetAsesmenId);
    }

    const nilaiSiswaId = generateUlid();
    const now = new Date();

    const [savedNilai] = await prisma.$transaction(async (tx) => {
      // Upsert into Phase 13 NilaiSiswa table
      const ns = await tx.nilaiSiswa.upsert({
        where: {
          asesmen_id_siswa_id: {
            asesmen_id: targetAsesmenId,
            siswa_id: hasil.siswa_id,
          },
        },
        create: {
          id: nilaiSiswaId,
          sekolah_id: targetAsesmen.sekolah_id,
          asesmen_id: targetAsesmenId,
          siswa_id: hasil.siswa_id,
          penempatan_rombel_id: hasil.sesi_ujian.penempatan_rombel_id,
          nilai_angka: hasil.nilai_akhir,
          nilai_huruf:
            hasil.nilai_akhir >= 85
              ? "A"
              : hasil.nilai_akhir >= 75
                ? "B"
                : hasil.nilai_akhir >= 65
                  ? "C"
                  : "D",
          capaian_kompetensi: `Hasil Ujian CBT "${hasil.ujian_cbt.judul}": Skor ${hasil.nilai_akhir} (Tuntas: ${hasil.apakah_tuntas ? "Ya" : "Belum"}).`,
          status: "PUBLISHED",
          diinput_oleh: transferredByName,
        },
        update: {
          nilai_angka: hasil.nilai_akhir,
          nilai_huruf:
            hasil.nilai_akhir >= 85
              ? "A"
              : hasil.nilai_akhir >= 75
                ? "B"
                : hasil.nilai_akhir >= 65
                  ? "C"
                  : "D",
          capaian_kompetensi: `Hasil Ujian CBT "${hasil.ujian_cbt.judul}": Skor ${hasil.nilai_akhir} (Tuntas: ${hasil.apakah_tuntas ? "Ya" : "Belum"}).`,
          diubah_terakhir_oleh: transferredByName,
          alasan_koreksi: "Sinkronisasi transfer hasil ujian CBT resmi",
        },
      });

      // Update CBT Result transfer status
      await tx.hasilUjianCbt.update({
        where: { id: hasilId },
        data: {
          status_transfer: "SUDAH_DITRANSFER",
          ditransfer_ke_nilai_siswa_id: ns.id,
          waktu_transfer: now,
          ditransfer_oleh: transferredByName,
        },
      });

      return [ns];
    });

    return {
      success: true,
      nilai_siswa_id: savedNilai.id,
      nilai_akhir: hasil.nilai_akhir,
    };
  }

  // ============================================================================
  // CBTSERVICE ADAPTER METHODS
  // ============================================================================

  async findBankSoal(sekolahId: string, guruId?: string, filter?: any): Promise<BankSoalDTO[]> {
    return this.getQuestionsBySubject(sekolahId, filter?.mapelId, guruId ? { guruId } : undefined);
  }

  async findBankSoalById(id: string, sekolahId: string): Promise<BankSoalDTO | null> {
    return this.getQuestionDetail(id);
  }

  async createBankSoal(input: any, sekolahId: string, guruId: string | null): Promise<BankSoalDTO> {
    const rawTipe = input.jenis_soal || input.tipe_soal || "PILIHAN_GANDA";
    const tipeSoal = rawTipe === "URAIAN_ESAI" ? "ESAI" : rawTipe;

    let opsi: OpsiJawabanSoal[] | undefined = undefined;
    if (input.opsi && Array.isArray(input.opsi)) {
      opsi = input.opsi.map((op: any, i: number) => ({
        id: op.label || String.fromCharCode(65 + i),
        teks: op.teks,
        urutan: op.urutan || i + 1,
      }));
    }

    let kunci: string[] = [];
    if (Array.isArray(input.kunci_jawaban?.pilihan_benar)) {
      kunci = input.kunci_jawaban.pilihan_benar;
    } else if (typeof input.kunci_jawaban?.pilihan_benar === "string") {
      kunci = [input.kunci_jawaban.pilihan_benar];
    } else if (Array.isArray(input.kunci_jawaban?.kata_kunci)) {
      kunci = input.kunci_jawaban.kata_kunci;
    } else if (Array.isArray(input.kunci_jawaban)) {
      kunci = input.kunci_jawaban;
    } else {
      kunci = ["A"];
    }

    return this.createQuestion(
      {
        sekolah_id: sekolahId,
        guru_id: guruId || "",
        mata_pelajaran_id: input.mata_pelajaran_id || "",
        lingkup_materi_id: input.lingkup_materi_id || null,
        tujuan_pembelajaran_id: input.tujuan_pembelajaran_id || null,
        kode: input.kode || `Q-${Date.now().toString(36).toUpperCase()}`,
        judul: input.judul || input.pertanyaan?.slice(0, 40) || "Soal CBT",
        tipe_soal: tipeSoal as any,
        tingkat_kesulitan:
          (input.tingkat_kesulitan === "HOTS" ? "SULIT" : input.tingkat_kesulitan) || "SEDANG",
        pertanyaan: input.pertanyaan,
        opsi_jawaban: opsi,
        kunci_jawaban: kunci,
        bobot_default: input.bobot_default || 1.0,
      },
      "Guru Pengampu"
    );
  }

  async createVersiSoal(bankSoalId: string, input: any, guruId: string | null): Promise<any> {
    let opsi: OpsiJawabanSoal[] | undefined = undefined;
    if (input.opsi && Array.isArray(input.opsi)) {
      opsi = input.opsi.map((op: any, i: number) => ({
        id: op.label || String.fromCharCode(65 + i),
        teks: op.teks,
        urutan: op.urutan || i + 1,
      }));
    }

    let kunci: string[] = [];
    if (Array.isArray(input.kunci_jawaban?.pilihan_benar)) {
      kunci = input.kunci_jawaban.pilihan_benar;
    } else if (typeof input.kunci_jawaban?.pilihan_benar === "string") {
      kunci = [input.kunci_jawaban.pilihan_benar];
    } else if (Array.isArray(input.kunci_jawaban?.kata_kunci)) {
      kunci = input.kunci_jawaban.kata_kunci;
    } else if (Array.isArray(input.kunci_jawaban)) {
      kunci = input.kunci_jawaban;
    }

    return this.updateQuestion(
      bankSoalId,
      {
        pertanyaan: input.pertanyaan,
        opsi_jawaban: opsi,
        kunci_jawaban: kunci,
        bobot_default: input.bobot,
        pembahasan: input.alasan_perubahan,
      },
      "Guru Pengampu"
    );
  }

  async findUjianByPenugasan(penugasanId: string, sekolahId: string): Promise<any[]> {
    const list = await this.getExamsByAssignment(penugasanId);
    return list.map((e) => ({
      ...e,
      kktp: e.kkm_kktp,
      blueprint_soal: e.blueprint || [],
    }));
  }

  async findUjianById(id: string, sekolahId: string): Promise<any> {
    const exam = await this.getExamDetail(id);
    if (!exam) return null;
    return {
      ...exam,
      kktp: exam.kkm_kktp,
      blueprint_soal: exam.blueprint || [],
    };
  }

  async createUjian(input: any, sekolahId: string, guruId: string | null): Promise<any> {
    const bp = (input.blueprint_soal || []).map((b: any, i: number) => ({
      bank_soal_id: b.bank_soal_id,
      versi_soal_id: b.versi_soal_id || b.bank_soal_id,
      bobot: b.bobot_kustom || 1.0,
      urutan: b.nomor_urut || i + 1,
    }));

    const exam = await this.createExam(
      {
        sekolah_id: sekolahId,
        penugasan_mengajar_id: input.penugasan_mengajar_id,
        judul: input.judul,
        deskripsi: input.deskripsi || null,
        durasi_menit: input.durasi_menit,
        waktu_mulai: input.waktu_mulai ? new Date(input.waktu_mulai).toISOString() : null,
        waktu_selesai: input.waktu_selesai ? new Date(input.waktu_selesai).toISOString() : null,
        kkm_kktp: input.kktp || 75.0,
        acak_soal: Boolean(input.acak_soal),
        acak_opsi: Boolean(input.acak_opsi),
        tampilkan_nilai: input.tampilkan_nilai !== false,
        blueprint: bp,
      },
      guruId || ""
    );

    return {
      ...exam,
      kktp: exam.kkm_kktp,
      blueprint_soal: exam.blueprint || [],
    };
  }

  async updateUjianStatus(id: string, status: string): Promise<void> {
    await prisma.ujianCbt.update({
      where: { id },
      data: { status: status === "DIPUBLIKASI" ? "DITERBITKAN" : status },
    });
  }

  async freezeSnapshot(ujianId: string, sekolahId: string): Promise<any> {
    const existing = await prisma.snapshotUjian.findFirst({
      where: { ujian_cbt_id: ujianId },
    });
    if (existing) {
      return { id: existing.id };
    }

    const exam = await this.getExamDetail(ujianId);
    if (!exam) throw new CbtNotFoundError("Ujian CBT", ujianId);

    const manifestItems: any[] = [];
    const scoringKeys: any[] = [];

    const blueprint = exam.blueprint || [];
    let totalBobot = 0;
    for (let i = 0; i < blueprint.length; i++) {
      const bp = blueprint[i];
      const q = await this.getQuestionDetail(bp.bank_soal_id);
      if (q) {
        totalBobot += bp.bobot;
        manifestItems.push({
          nomor_urut: i + 1,
          soal_id: q.id,
          versi_soal_id: bp.versi_soal_id,
          tipe_soal: q.tipe_soal,
          pertanyaan: q.pertanyaan,
          opsi_jawaban: q.opsi_jawaban || null,
          bobot: bp.bobot,
        });

        scoringKeys.push({
          soal_id: q.id,
          versi_soal_id: bp.versi_soal_id,
          tipe_soal: q.tipe_soal,
          kunci_jawaban: q.kunci_jawaban || [],
          bobot: bp.bobot,
        });
      }
    }

    const snapshotId = generateUlid();
    const snapshot = await prisma.snapshotUjian.create({
      data: {
        id: snapshotId,
        sekolah_id: sekolahId,
        ujian_cbt_id: ujianId,
        nomor_snapshot: 1,
        total_soal: manifestItems.length,
        total_bobot: totalBobot,
        durasi_menit: exam.durasi_menit,
        konfigurasi: JSON.stringify({ acak_soal: exam.acak_soal, acak_opsi: exam.acak_opsi }),
        manifest_soal: JSON.stringify(manifestItems),
        kunci_penilaian: JSON.stringify(scoringKeys),
        dibekukan_oleh: "Admin CBT",
      },
    });

    await prisma.ujianCbt.update({
      where: { id: ujianId },
      data: { snapshot_aktif_id: snapshotId, status: "DITERBITKAN" },
    });

    return { id: snapshot.id };
  }

  async getActiveSnapshot(ujianId: string): Promise<any> {
    const snapshot = await prisma.snapshotUjian.findFirst({
      where: { ujian_cbt_id: ujianId },
      orderBy: { nomor_snapshot: "desc" },
    });
    if (!snapshot) return null;

    return {
      id: snapshot.id,
      manifest_soal: JSON.parse(snapshot.manifest_soal),
      kunci_penilaian: JSON.parse(snapshot.kunci_penilaian),
    };
  }

  async findSessionById(id: string): Promise<any> {
    const s = await prisma.sesiUjianSiswa.findUnique({
      where: { id },
    });
    return s;
  }

  async saveJawaban(input: any): Promise<void> {
    const session = await prisma.sesiUjianSiswa.findUnique({
      where: { id: input.sesi_ujian_siswa_id },
      include: { snapshot: true },
    });
    if (!session) throw new CbtNotFoundError("Sesi Ujian", input.sesi_ujian_siswa_id);

    const manifest: any[] = JSON.parse(session.snapshot.manifest_soal);
    const item =
      manifest.find((m) => m.nomor_urut === input.nomor_urut) || manifest[input.nomor_urut - 1];
    const soalId = item?.soal_id || generateUlid();
    const versiSoalId = item?.versi_soal_id || soalId;

    let jawabanPeserta: any = null;
    if (input.jawaban_pilihan) {
      jawabanPeserta = [input.jawaban_pilihan];
    } else if (input.jawaban_kompleks) {
      jawabanPeserta = input.jawaban_kompleks;
    } else if (input.jawaban_teks) {
      jawabanPeserta = [input.jawaban_teks];
    }

    await this.saveAnswer(
      {
        sesi_ujian_id: input.sesi_ujian_siswa_id,
        soal_id: soalId,
        versi_soal_id: versiSoalId,
        jawaban_peserta: jawabanPeserta ? JSON.stringify(jawabanPeserta) : null,
        ragu_ragu: input.ragu_ragu,
      },
      session.siswa_id
    );
  }

  async findJawabanBySession(sessionId: string): Promise<any[]> {
    const answers = await prisma.jawabanSiswa.findMany({
      where: { sesi_ujian_id: sessionId },
    });

    const session = await prisma.sesiUjianSiswa.findUnique({
      where: { id: sessionId },
      include: { snapshot: true },
    });
    const manifest: any[] = session ? JSON.parse(session.snapshot.manifest_soal) : [];

    return answers.map((a) => {
      const match = manifest.find((m) => m.soal_id === a.soal_id);
      let parsed = null;
      try {
        parsed = a.jawaban_peserta ? JSON.parse(a.jawaban_peserta) : null;
      } catch {}
      return {
        id: a.id,
        nomor_urut: match?.nomor_urut || 1,
        jawaban_pilihan: Array.isArray(parsed) ? parsed[0] : parsed,
        jawaban_teks: Array.isArray(parsed) ? parsed[0] : parsed,
        jawaban_kompleks: Array.isArray(parsed) ? parsed : null,
        ragu_ragu: a.ragu_ragu,
      };
    });
  }

  async findIntegrityEvents(sessionId: string): Promise<any[]> {
    return this.getAttemptIntegrityEvents(sessionId);
  }

  async lockAttemptForViolation(sessionId: string, alasan: string): Promise<void> {
    await prisma.sesiUjianSiswa.update({
      where: { id: sessionId },
      data: { status: "TERKUNCI_PELANGGARAN" },
    });
  }

  async unlockAttempt(sessionId: string): Promise<void> {
    await prisma.sesiUjianSiswa.update({
      where: { id: sessionId },
      data: { status: "SEDANG_MENGERJAKAN" },
    });
  }

  async findHasilBySession(sessionId: string): Promise<any> {
    const res = await prisma.hasilUjianCbt.findUnique({
      where: { sesi_ujian_id: sessionId },
    });
    if (!res) return null;
    return {
      ...res,
      total_benar: res.jumlah_benar,
      total_salah: res.jumlah_salah,
      total_skor_diperoleh: res.skor_mentah,
      total_skor_maksimal: res.skor_maksimal,
      status_kelulusan: res.apakah_tuntas ? "TUNTAS" : "BELUM_TUNTAS",
    };
  }

  async findExamAttempts(ujianId: string): Promise<any[]> {
    const attempts = await prisma.sesiUjianSiswa.findMany({
      where: { ujian_cbt_id: ujianId },
      include: {
        siswa: { select: { id: true, nama_lengkap: true, nisn: true } },
        hasil: true,
        event_integritas_ujian: true,
      },
    });

    return attempts.map((a) => ({
      ...a,
      siswa: a.siswa,
      hasil: a.hasil
        ? {
            ...a.hasil,
            total_benar: a.hasil.jumlah_benar,
            total_salah: a.hasil.jumlah_salah,
            status_kelulusan: a.hasil.apakah_tuntas ? "TUNTAS" : "BELUM_TUNTAS",
          }
        : null,
      integrityEventCount: a.event_integritas_ujian.length,
    }));
  }

  async transferResultsToGradebook(input: any, sekolahId: string): Promise<any> {
    const exam = await prisma.ujianCbt.findUnique({
      where: { id: input.ujian_cbt_id },
      include: {
        penugasan_mengajar: true,
        hasil_ujian_cbt: {
          include: { sesi_ujian: true },
        },
      },
    });

    if (!exam) throw new CbtNotFoundError("Ujian CBT", input.ujian_cbt_id);

    const assessmentId = generateUlid();
    await prisma.definisiAsesmen.create({
      data: {
        id: assessmentId,
        sekolah_id: sekolahId,
        penugasan_mengajar_id: exam.penugasan_mengajar_id,
        judul: input.nama_asesmen,
        kategori: input.kategori || "SUMATIF",
        teknik_penilaian: "TES_TERTULIS",
        bobot: input.bobot || 1.0,
        skala_maksimal: 100,
        kkm_kktp: exam.kkm_kktp,
        status: "PUBLISHED",
      },
    });

    let transferredCount = 0;
    for (const h of exam.hasil_ujian_cbt) {
      if (h.sesi_ujian?.penempatan_rombel_id) {
        await prisma.nilaiSiswa.upsert({
          where: {
            asesmen_id_siswa_id: {
              asesmen_id: assessmentId,
              siswa_id: h.siswa_id,
            },
          },
          create: {
            id: generateUlid(),
            sekolah_id: sekolahId,
            asesmen_id: assessmentId,
            siswa_id: h.siswa_id,
            penempatan_rombel_id: h.sesi_ujian.penempatan_rombel_id,
            nilai_angka: h.nilai_akhir,
            status: "PUBLISHED",
            capaian_kompetensi: `Hasil Ujian CBT: Skor ${h.nilai_akhir}`,
          },
          update: {
            nilai_angka: h.nilai_akhir,
          },
        });
        transferredCount++;
      }
    }

    return { assessmentId, transferredCount };
  }
}

export const cbtRepository = new CbtRepository();

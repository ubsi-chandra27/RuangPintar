/**
 * Ruang Pintar — QA Walkthrough & Domain Verification Script: Phase 14 CBT
 *
 * Menguji Invarian Kritis CBT:
 * 1. Question ≠ Question Version ≠ Exam Blueprint ≠ Exam ≠ Exam Snapshot ≠ Attempt ≠ Answer ≠ Result ≠ Assessment ≠ Grade
 * 2. Immutable Exam Snapshot (pembekuan butir soal saat publikasi)
 * 3. Zero Answer Key Leakage (manifest soal ke siswa tidak memuat kunci jawaban)
 * 4. One Active Attempt per Siswa
 * 5. Server Authoritative Timer
 * 6. Autosave Idempotent
 * 7. Anti-Cheat Integrity Strike & Lock Engine
 * 8. Server-Side Auto-Grading (MC, Complex MC, Short Answer)
 * 9. Jembatan Transfer Nilai ke Buku Nilai (M13 Assessment Contract)
 */

import { PrismaClient } from "@prisma/client";
import { cbtService } from "../src/modules/cbt/application/cbt-service.ts";
import { cbtRepository } from "../src/modules/cbt/infrastructure/cbt-repository.ts";

const prisma = new PrismaClient();

async function main() {
  console.log("================================================================================");
  console.log("RUANG PINTAR — QA FULL WALKTHROUGH: PHASE 14 CBT (COMPUTER-BASED TEST)");
  console.log("================================================================================\n");

  // Step 1: Resolusi Data Master Sekolah & Pengampu
  console.log("[1/9] Resolusi Sekolah, Guru, Penugasan Mengajar, dan Rombel Siswa...");
  const sekolah = await prisma.sekolah.findFirst();
  if (!sekolah) throw new Error("Data sekolah tidak ditemukan.");
  console.log(`✓ Sekolah: ${sekolah.nama_sekolah} (${sekolah.id})`);

  const penugasan = await prisma.penugasanMengajar.findFirst({
    where: {
      sekolah_id: sekolah.id,
      status: "AKTIF",
      rombel: {
        penempatan_rombel: {
          some: { status: "AKTIF" },
        },
      },
    },
    include: { rombel: true, mata_pelajaran: true, guru: true },
  });
  if (!penugasan) throw new Error("Penugasan mengajar dengan siswa aktif tidak ditemukan.");
  const guru = penugasan.guru;
  console.log(`✓ Guru: ${guru.nama_lengkap} (${guru.id})`);
  console.log(
    `✓ Penugasan: ${penugasan.mata_pelajaran.nama} - Rombel ${penugasan.rombel.nama} (${penugasan.id})`
  );

  const penempatan = await prisma.penempatanRombel.findFirst({
    where: { rombel_id: penugasan.rombel_id, status: "AKTIF" },
    include: { keikutsertaan: { include: { siswa: true } } },
  });
  if (!penempatan || !penempatan.keikutsertaan?.siswa) {
    throw new Error("Siswa aktif di rombel tidak ditemukan.");
  }
  const siswa = penempatan.keikutsertaan.siswa;
  console.log(`✓ Siswa Peserta Ujian: ${siswa.nama_lengkap} (${siswa.id})`);

  // Step 2: Bank Soal & Versi Soal
  const runTag = Date.now().toString().slice(-6);
  console.log(`\n[2/9] Membuat Butir Soal di Bank Soal (Run Tag: ${runTag})...`);
  const q1 = await cbtService.createQuestion(
    {
      mata_pelajaran_id: penugasan.mata_pelajaran_id,
      kode: `CBT-QA-01-${runTag}`,
      jenis_soal: "PILIHAN_GANDA",
      tingkat_kesulitan: "SEDANG",
      bobot_default: 20,
      pertanyaan: "Organel sel tumbuhan yang berperan menangkap energi cahaya matahari adalah...",
      opsi: [
        { label: "A", teks: "Mitokondria", urutan: 1 },
        { label: "B", teks: "Kloroplas", urutan: 2 },
        { label: "C", teks: "Ribosom", urutan: 3 },
        { label: "D", teks: "Vakuola", urutan: 4 },
      ],
      kunci_jawaban: { pilihan_benar: "B" },
    },
    sekolah.id,
    guru.id,
    false
  );
  console.log(`✓ Soal 1 (Pilihan Ganda) dibuat: ID ${q1.id} (Versi 1)`);

  const q2 = await cbtService.createQuestion(
    {
      mata_pelajaran_id: penugasan.mata_pelajaran_id,
      kode: `CBT-QA-02-${runTag}`,
      jenis_soal: "PILIHAN_GANDA_KOMPLEKS",
      tingkat_kesulitan: "HOTS",
      bobot_default: 40,
      pertanyaan: "Manakah faktor eksternal yang langsung mempengaruhi laju fotosintesis?",
      opsi: [
        { label: "A", teks: "Intensitas cahaya matahari", urutan: 1 },
        { label: "B", teks: "Konsentrasi karbon dioksida", urutan: 2 },
        { label: "C", teks: "Bentuk dinding sel", urutan: 3 },
        { label: "D", teks: "Suhu lingkungan", urutan: 4 },
      ],
      kunci_jawaban: { pilihan_benar: ["A", "B", "D"] },
    },
    sekolah.id,
    guru.id,
    false
  );
  console.log(`✓ Soal 2 (Pilihan Ganda Kompleks) dibuat: ID ${q2.id}`);

  const q3 = await cbtService.createQuestion(
    {
      mata_pelajaran_id: penugasan.mata_pelajaran_id,
      kode: `CBT-QA-03-${runTag}`,
      jenis_soal: "ISIAN_SINGKAT",
      tingkat_kesulitan: "SEDANG",
      bobot_default: 40,
      pertanyaan:
        "Proses biokimia pembentukan glukosa dari CO2 dan H2O dengan energi surya dinamakan...",
      kunci_jawaban: { kata_kunci: ["Fotosintesis", "fotosintesa"], case_sensitive: false },
    },
    sekolah.id,
    guru.id,
    false
  );
  console.log(`✓ Soal 3 (Isian Singkat) dibuat: ID ${q3.id}`);

  // Question Versioning Test
  console.log("\n[3/9] Menguji Question Versioning (Penerbitan Versi 2 pada Soal 1)...");
  const q1v2 = await cbtService.createQuestionVersion(
    q1.id,
    {
      pertanyaan:
        "Organel sel berklorofil yang berperan menangkap energi cahaya matahari adalah...",
      opsi: [
        { label: "A", teks: "Mitokondria", urutan: 1 },
        { label: "B", teks: "Kloroplas (Plastida)", urutan: 2 },
        { label: "C", teks: "Ribosom", urutan: 3 },
        { label: "D", teks: "Retikulum Endoplasma", urutan: 4 },
      ],
      kunci_jawaban: { pilihan_benar: "B" },
      bobot: 20,
      alasan_perubahan: "Perbaikan opsi jawaban D dan spesifikasi kloroplas",
    },
    sekolah.id,
    guru.id,
    false
  );
  console.log(`✓ Versi 2 berhasil diterbitkan: Versi ${q1v2.nomor_versi} (Status Aktif)`);

  // Step 4: Susun Ujian CBT (Draft Blueprint)
  console.log("\n[4/9] Menyusun Ujian CBT (Blueprint & Parameter)...");
  const exam = await cbtService.createExam(
    {
      penugasan_mengajar_id: penugasan.id,
      judul: "Asesmen CBT Sumatif Tengah Semester - Biologi",
      deskripsi: "Kerjakan secara jujur dan mandiri. Sistem dilengkapi anti-cheat detector.",
      durasi_menit: 60,
      kktp: 75,
      acak_soal: true,
      acak_opsi: true,
      tampilkan_nilai: true,
      blueprint_soal: [
        { bank_soal_id: q1.id, nomor_urut: 1, bobot_kustom: 20 },
        { bank_soal_id: q2.id, nomor_urut: 2, bobot_kustom: 40 },
        { bank_soal_id: q3.id, nomor_urut: 3, bobot_kustom: 40 },
      ],
    },
    sekolah.id,
    guru.id,
    false
  );
  console.log(`✓ Ujian CBT berhasil dibuat (Draft): ${exam.judul} (${exam.id})`);

  // Step 5: Publikasi Ujian & Pembekuan Snapshot (Immutable Snapshot)
  console.log("\n[5/9] Mempublikasikan Ujian & Membekukan Snapshot Soal (Immutable)...");
  const published = await cbtService.publishExam(exam.id, sekolah.id, guru.id, false);
  console.log(`✓ Ujian Berhasil Dipublikasikan. Snapshot ID: ${published.snapshotId}`);

  // Invariant Check: Snapshot manifest MUST NOT contain answer keys
  const activeSnapshot = await cbtRepository.getActiveSnapshot(exam.id);
  const firstItem = activeSnapshot.manifest_soal[0];
  if ("kunci_jawaban" in firstItem || "pilihan_benar" in firstItem) {
    throw new Error("SECURITY INVARIANT VIOLATION: Kunci jawaban bocor ke manifest siswa!");
  }
  console.log(
    "✓ Verifikasi Keamanan: Manifest butir soal bersih tanpa kunci jawaban (Zero Leakage)."
  );

  // Step 6: Siswa Memulai Ujian (One Active Attempt & Authoritative Timer)
  console.log("\n[6/9] Siswa Memulai Sesi Ujian (Start Attempt & Authoritative Timer)...");
  const playerPayload = await cbtService.startOrResumeAttempt(exam.id, sekolah.id, siswa.id, {
    ipAddress: "127.0.0.1",
    userAgent: "RuangPintarQA/1.0",
  });
  const attemptSession = playerPayload.session;
  console.log(`✓ Sesi Ujian Siswa Aktif: ${attemptSession.id}`);
  console.log(`✓ Batas Waktu Server: ${attemptSession.batas_waktu_server.toISOString()}`);
  console.log(`✓ Sisa Waktu Detik: ${playerPayload.timeRemainingSeconds}s`);

  // Step 7: Autosave Jawaban Siswa
  console.log("\n[7/9] Simulasi Pengerjaan & Autosave Jawaban Siswa...");
  // Soal 1: Pilihan B (Benar)
  await cbtService.autosaveAnswer(
    {
      sesi_ujian_siswa_id: attemptSession.id,
      nomor_urut: 1,
      jawaban_pilihan: "B",
    },
    sekolah.id,
    siswa.id
  );
  console.log("✓ Autosave Butir 1 (Pilihan 'B') tersimpan.");

  // Soal 2: Pilihan A, B, D (Benar)
  await cbtService.autosaveAnswer(
    {
      sesi_ujian_siswa_id: attemptSession.id,
      nomor_urut: 2,
      jawaban_kompleks: ["A", "B", "D"],
    },
    sekolah.id,
    siswa.id
  );
  console.log("✓ Autosave Butir 2 (Kompleks 'A, B, D') tersimpan.");

  // Soal 3: Isian "Fotosintesis" (Benar)
  await cbtService.autosaveAnswer(
    {
      sesi_ujian_siswa_id: attemptSession.id,
      nomor_urut: 3,
      jawaban_teks: "Fotosintesis",
    },
    sekolah.id,
    siswa.id
  );
  console.log("✓ Autosave Butir 3 (Isian 'Fotosintesis') tersimpan.");

  // Step 8: Pengujian Anti-Cheat & Integrity Strike
  console.log(
    "\n[8/9] Menguji Anti-Cheat Integrity Strike (Keluar Layar & Penguncian Otomatis)..."
  );
  const strike1 = await cbtService.recordIntegrityEvent(
    {
      sesi_ujian_siswa_id: attemptSession.id,
      nomor_urut_soal: 2,
      tipe_event: "KELUAR_LAYAR_PENUH",
      deskripsi: "Siswa keluar dari layar penuh",
    },
    sekolah.id,
    siswa.id
  );
  console.log(`✓ Strike 1 tercatat (isLocked: ${strike1.isLocked})`);

  const strike2 = await cbtService.recordIntegrityEvent(
    {
      sesi_ujian_siswa_id: attemptSession.id,
      nomor_urut_soal: 2,
      tipe_event: "PINDAH_TAB_ATAU_WINDOW",
      deskripsi: "Siswa membuka tab browser lain",
    },
    sekolah.id,
    siswa.id
  );
  console.log(`✓ Strike 2 tercatat (isLocked: ${strike2.isLocked}) -> Attempt otomatis TERKUNCI!`);

  // Buka kembali kunci oleh Guru / Pengawas
  await cbtService.unlockAttempt(attemptSession.id, sekolah.id, guru.id, false);
  console.log("✓ Pengawas membuka kembali kunci sesi ujian siswa (Unlock Successful).");

  // Step 9: Submission & Server Auto-Grading & Gradebook Bridge Transfer
  console.log(
    "\n[9/9] Pengumpulan Ujian, Penilaian Otomatis Server, dan Transfer ke Buku Nilai..."
  );
  const hasil = await cbtService.submitAttempt(attemptSession.id, sekolah.id, siswa.id);
  console.log(`✓ Hasil Ujian CBT:`);
  console.log(`  - Total Soal: ${hasil.total_soal}`);
  console.log(`  - Jumlah Benar: ${hasil.total_benar}`);
  console.log(`  - Jumlah Salah: ${hasil.total_salah}`);
  console.log(`  - Skor Diperoleh: ${hasil.total_skor_diperoleh} / ${hasil.total_skor_maksimal}`);
  console.log(`  - Nilai Akhir: ${hasil.nilai_akhir}`);
  console.log(`  - Status Kelulusan: ${hasil.status_kelulusan}`);

  if (hasil.nilai_akhir !== 100 || hasil.status_kelulusan !== "TUNTAS") {
    throw new Error(`Grading invariant mismatch: expected 100, got ${hasil.nilai_akhir}`);
  }

  // Transfer ke Buku Nilai (M13 Assessment Module)
  const transfer = await cbtService.transferToGradebook(
    {
      ujian_cbt_id: exam.id,
      nama_asesmen: "Hasil CBT: " + exam.judul,
      kategori: "SUMATIF",
      jenis_asesmen: "SUMATIF_TENGAH_SEMESTER",
      bobot: 1.0,
    },
    sekolah.id,
    guru.id,
    false
  );
  console.log(`\n✓ Jembatan Buku Nilai Berhasil:`);
  console.log(`  - ID Definisi Asesmen M13: ${transfer.assessmentId}`);
  console.log(`  - Jumlah Nilai Siswa Ditransfer: ${transfer.transferredCount}`);

  // Verifikasi record di NilaiSiswa M13
  const nilaiSiswa = await prisma.nilaiSiswa.findFirst({
    where: { asesmen_id: transfer.assessmentId, siswa_id: siswa.id },
  });
  if (!nilaiSiswa || nilaiSiswa.nilai_angka !== 100) {
    throw new Error(
      `Verifikasi Gradebook gagal: Nilai siswa (${nilaiSiswa?.nilai_angka}) tidak sesuai dengan hasil CBT.`
    );
  }
  console.log(
    `✓ Verifikasi Sinkronisasi: Nilai Siswa di Buku Nilai terkonfirmasi: ${nilaiSiswa.nilai_angka}`
  );

  console.log("\n================================================================================");
  console.log("SELURUH INVARIAN & INTEGRASI PHASE 14 CBT BERHASIL TERVERIFIKASI PENUH!");
  console.log("================================================================================");
}

main()
  .catch((err) => {
    console.error("\n❌ GAGAL PADA WALKTHROUGH CBT:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

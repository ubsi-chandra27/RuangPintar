import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function run() {
  const manifest = [
    {
      nomor_urut: 1,
      soal_id: "Q_PG_1",
      versi_soal_id: "V_PG_1",
      tipe_soal: "PILIHAN_GANDA",
      pertanyaan:
        "Dalam arsitektur komputasi modern, komponen perangkat keras yang bertanggung jawab secara langsung dalam melakukan operasi aritmetika dan logika biner adalah...",
      bobot: 10,
      opsi_jawaban: [
        { label: "A", teks: "Control Unit (CU)", urutan: 1 },
        { label: "B", teks: "Arithmetic Logic Unit (ALU)", urutan: 2 },
        { label: "C", teks: "Random Access Memory (RAM)", urutan: 3 },
        { label: "D", teks: "Read Only Memory (ROM)", urutan: 4 },
        { label: "E", teks: "Solid State Drive (SSD)", urutan: 5 },
      ],
    },
    {
      nomor_urut: 2,
      soal_id: "Q_PG_2",
      versi_soal_id: "V_PG_2",
      tipe_soal: "PILIHAN_GANDA",
      pertanyaan:
        "Manakah dari struktur data berikut yang menerapkan prinsip First-In First-Out (FIFO) dalam manajemen antrean data digital?",
      bobot: 10,
      opsi_jawaban: [
        { label: "A", teks: "Stack", urutan: 1 },
        { label: "B", teks: "Queue", urutan: 2 },
        { label: "C", teks: "Binary Tree", urutan: 3 },
        { label: "D", teks: "Graph Berbobot", urutan: 4 },
        { label: "E", teks: "Hash Table", urutan: 5 },
      ],
    },
    {
      nomor_urut: 3,
      soal_id: "Q_PG_3",
      versi_soal_id: "V_PG_3",
      tipe_soal: "PILIHAN_GANDA",
      pertanyaan:
        "Perhatikan diagram alur algoritma pencarian biner (Binary Search). Kompleksitas waktu asimptotik (Big-O) kasus terbaik dan kasus terburuk secara berurutan adalah...",
      bobot: 10,
      opsi_jawaban: [
        { label: "A", teks: "O(1) dan O(log n)", urutan: 1 },
        { label: "B", teks: "O(n) dan O(n^2)", urutan: 2 },
        { label: "C", teks: "O(log n) dan O(n log n)", urutan: 3 },
        { label: "D", teks: "O(1) dan O(n)", urutan: 4 },
        { label: "E", teks: "O(n) dan O(log n)", urutan: 5 },
      ],
    },
    {
      nomor_urut: 4,
      soal_id: "Q_MATCH_1",
      versi_soal_id: "V_MATCH_1",
      tipe_soal: "MENJODOHKAN",
      pertanyaan:
        "Pasangkanlah konsep arsitektur komputer berikut dengan definisi fungsionalnya yang sesuai:",
      bobot: 30,
      opsi_jawaban: {
        premis: [
          { id: "1", teks: "Register CPU" },
          { id: "2", teks: "Cache Memory (L1/L2)" },
          { id: "3", teks: "Virtual Memory" },
          { id: "4", teks: "Interrupt Request (IRQ)" },
          { id: "5", teks: "Direct Memory Access (DMA)" },
        ],
        pilihan_target: [
          "Memori internal berkecepatan tertinggi di dalam inti prosesor",
          "Penyangga memori SRAM perantara antara CPU dan DRAM",
          "Teknik pemetaan ruang memori sekunder sebagai perluasan RAM",
          "Sinyal interupsi dari piranti periferal ke CPU",
          "Akses transfer data peranti langsung ke RAM tanpa membebani CPU",
        ],
      },
    },
    {
      nomor_urut: 5,
      soal_id: "Q_ESSAY_1",
      versi_soal_id: "V_ESSAY_1",
      tipe_soal: "URAIAN_ESAI",
      pertanyaan:
        "Jelaskan perbedaan mendasar antara model kecerdasan artifisial Machine Learning konvensional dengan Deep Learning dalam hal ekstraksi fitur data mentah!",
      bobot: 20,
    },
    {
      nomor_urut: 6,
      soal_id: "Q_ESSAY_2",
      versi_soal_id: "V_ESSAY_2",
      tipe_soal: "URAIAN_ESAI",
      pertanyaan:
        "Analisis skenario kegagalan jaringan transmisi data berbasis model TCP/IP ketika terjadi congestion collapse pada router, dan jelaskan mekanisme congestion control untuk mengatasinya!",
      bobot: 20,
    },
  ];

  const kunci = [
    { soal_id: "Q_PG_1", kunci_jawaban: "B" },
    { soal_id: "Q_PG_2", kunci_jawaban: "B" },
    { soal_id: "Q_PG_3", kunci_jawaban: "A" },
    {
      soal_id: "Q_MATCH_1",
      kunci_jawaban: {
        daftar_pasangan: [
          {
            premis: "Register CPU",
            target: "Memori internal berkecepatan tertinggi di dalam inti prosesor",
          },
          {
            premis: "Cache Memory (L1/L2)",
            target: "Penyangga memori SRAM perantara antara CPU dan DRAM",
          },
          {
            premis: "Virtual Memory",
            target: "Teknik pemetaan ruang memori sekunder sebagai perluasan RAM",
          },
          {
            premis: "Interrupt Request (IRQ)",
            target: "Sinyal interupsi dari piranti periferal ke CPU",
          },
          {
            premis: "Direct Memory Access (DMA)",
            target: "Akses transfer data peranti langsung ke RAM tanpa membebani CPU",
          },
        ],
      },
    },
    {
      soal_id: "Q_ESSAY_1",
      kunci_jawaban: {
        rubrik_penilaian:
          "Skor 20: Menjelaskan feature engineering manual pada ML vs feature learning otomatis end-to-end via multi-layer neural network pada DL secara komprehensif.",
      },
    },
    {
      soal_id: "Q_ESSAY_2",
      kunci_jawaban: {
        rubrik_penilaian:
          "Skor 20: Menguraikan buffer overflow antrean paket dan mekanisme TCP Slow Start, Congestion Avoidance, Fast Retransmit, serta Fast Recovery.",
      },
    },
  ];

  await prisma.snapshotUjian.updateMany({
    where: { ujian_cbt_id: "01M1PMVKP7HKCBHPPBYFGR0XXA" },
    data: {
      manifest_soal: JSON.stringify(manifest),
      kunci_penilaian: JSON.stringify(kunci),
      total_soal: manifest.length,
      total_bobot: 100,
    },
  });

  console.log("Snapshot successfully enriched for exam 01M1PMVKP7HKCBHPPBYFGR0XXA!");
}

run()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

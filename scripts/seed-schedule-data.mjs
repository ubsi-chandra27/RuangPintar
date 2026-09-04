import { runOtomindoScheduleImport } from "./import-otomindo-schedule.mjs";

console.warn(
  "Seed contoh Phase 10 sudah diganti dengan impor data riil Jadwal Pelajaran SMK OTOMINDO tanggal 19 Agustus 2026."
);

runOtomindoScheduleImport({ apply: true }).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

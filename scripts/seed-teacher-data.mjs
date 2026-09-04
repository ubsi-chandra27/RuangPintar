import { runOtomindoScheduleImport } from "./import-otomindo-schedule.mjs";

console.warn(
  "Seed contoh Phase 09 sudah diganti dengan impor data riil guru, wali kelas, penugasan, dan jadwal SMK OTOMINDO."
);

runOtomindoScheduleImport({ apply: true }).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

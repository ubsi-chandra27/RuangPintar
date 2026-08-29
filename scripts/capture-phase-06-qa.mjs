import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const outDir = path.resolve("docs/phases/screenshots/phase-06");

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function seedPhase06Data() {
  const existingSchool = await prisma.sekolah.findFirst();
  const schoolId = existingSchool ? existingSchool.id : "01JA0000000000000000000001";
  await prisma.sekolah.upsert({
    where: { id: schoolId },
    update: {
      nama: "SMK Negeri 1 Ruang Pintar",
      jenjang: "SMK",
      alamat: "Jl. Pendidikan Cerdas No. 128, Jakarta",
      telepon: "(021) 7890123",
      email: "info@smkn1ruangpintar.sch.id",
      zona_waktu: "Asia/Jakarta",
      logo_url: "/images/brand/logo.png",
      status_aktif: true,
    },
    create: {
      id: schoolId,
      nama: "SMK Negeri 1 Ruang Pintar",
      npsn: "20108899",
      jenjang: "SMK",
      alamat: "Jl. Pendidikan Cerdas No. 128, Jakarta",
      telepon: "(021) 7890123",
      email: "info@smkn1ruangpintar.sch.id",
      zona_waktu: "Asia/Jakarta",
      logo_url: "/images/brand/logo.png",
      status_aktif: true,
    },
  });

  const passwordHash = await bcrypt.hash("Password123", 10);

  // 1. Super Admin
  const adminId = "01JA000000000000000000ADM001";
  await prisma.pengguna.upsert({
    where: { username: "superadmin" },
    update: {
      password_hash: passwordHash,
      status_akun: "AKTIF",
      harus_ganti_password: false,
      sekolah_id: schoolId,
    },
    create: {
      id: adminId,
      sekolah_id: schoolId,
      username: "superadmin",
      password_hash: passwordHash,
      nama_lengkap: "Administrator Utama",
      peran_dasar: "SUPER_ADMIN",
      status_akun: "AKTIF",
      harus_ganti_password: false,
    },
  });

  // 2. Teacher
  const teacherId = "01JA000000000000000000TEACH1";
  await prisma.pengguna.upsert({
    where: { username: "guru_ahmad" },
    update: {
      password_hash: passwordHash,
      status_akun: "AKTIF",
      harus_ganti_password: false,
      sekolah_id: schoolId,
    },
    create: {
      id: teacherId,
      sekolah_id: schoolId,
      username: "guru_ahmad",
      password_hash: passwordHash,
      nama_lengkap: "Ahmad Dahlan, S.Pd.",
      peran_dasar: "TEACHER",
      status_akun: "AKTIF",
      harus_ganti_password: false,
    },
  });

  // 3. Units
  const unitKurId = "01JA0000000000000000UNITKUR1";
  await prisma.unitOrganisasi.upsert({
    where: { id: unitKurId },
    update: {},
    create: {
      id: unitKurId,
      sekolah_id: schoolId,
      nama: "Bidang Kurikulum & Pengajaran",
      kode: "KUR",
    },
  });

  const unitKswId = "01JA0000000000000000UNITKSW1";
  await prisma.unitOrganisasi.upsert({
    where: { id: unitKswId },
    update: {},
    create: {
      id: unitKswId,
      sekolah_id: schoolId,
      nama: "Bidang Kesiswaan & Ekstrakurikuler",
      kode: "KSW",
    },
  });

  const unitRplId = "01JA0000000000000000UNITRPL1";
  await prisma.unitOrganisasi.upsert({
    where: { id: unitRplId },
    update: {},
    create: {
      id: unitRplId,
      sekolah_id: schoolId,
      nama: "Program Keahlian RPL",
      kode: "PROG-RPL",
      induk_unit_id: unitKurId,
    },
  });

  // 4. Positions
  const posHeadId = "01JA0000000000000000POSHEAD1";
  await prisma.jabatan.upsert({
    where: { id: posHeadId },
    update: {},
    create: {
      id: posHeadId,
      sekolah_id: schoolId,
      kode_jabatan: "HEADMASTER",
      nama_jabatan: "Kepala Sekolah",
      tingkat_akses: "SCHOOL_WIDE",
    },
  });

  const posWakaKurId = "01JA0000000000000000POSWAKUR";
  await prisma.jabatan.upsert({
    where: { id: posWakaKurId },
    update: {},
    create: {
      id: posWakaKurId,
      sekolah_id: schoolId,
      unit_id: unitKurId,
      kode_jabatan: "VICE_PRINCIPAL_CURRICULUM",
      nama_jabatan: "Wakil Kepala Sekolah Bidang Kurikulum",
      tingkat_akses: "SCHOOL_WIDE",
    },
  });

  const posKaprogliId = "01JA0000000000000000POSKAPRG";
  await prisma.jabatan.upsert({
    where: { id: posKaprogliId },
    update: {},
    create: {
      id: posKaprogliId,
      sekolah_id: schoolId,
      unit_id: unitRplId,
      kode_jabatan: "KAPROGLI_RPL",
      nama_jabatan: "Kepala Program Keahlian RPL",
      tingkat_akses: "PROGRAM_WIDE",
    },
  });

  // 5. Position Assignment
  const asgId = "01JA0000000000000000ASG00001";
  await prisma.penugasanJabatan.upsert({
    where: { id: asgId },
    update: {},
    create: {
      id: asgId,
      sekolah_id: schoolId,
      jabatan_id: posWakaKurId,
      personil_id: teacherId,
      berlaku_mulai: new Date("2026-07-01"),
      berlaku_sampai: new Date("2027-06-30"),
      status: "AKTIF",
      catatan: "SK Penetapan No. 421/05/SK/2026",
    },
  });

  console.log("Seed data Phase 06 berhasil disiapkan.");
}

async function loginUser(page, username, password = "Password123") {
  await page.goto("http://localhost:3000/login", { waitUntil: "domcontentloaded" });
  await page.fill('input[name="username"]', username);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL("**/dashboard", { timeout: 15000 });
}

async function runVisualQA() {
  await seedPhase06Data();

  const browser = await chromium.launch({ headless: true });

  console.log("Menjalankan capture visual QA across viewports...");

  // 1. Desktop Large (1440x900) — Profil Sekolah
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await loginUser(page, "superadmin");
    await page.goto("http://localhost:3000/sekolah", { waitUntil: "domcontentloaded" });
    await page.waitForSelector("text=Identitas & Profil Sekolah");
    await page.screenshot({
      path: path.join(outDir, "01_desktop_large_1440x900_profile.png"),
      fullPage: true,
    });
    await ctx.close();
    console.log("Captured: 01_desktop_large_1440x900_profile.png");
  }

  // 2. Desktop Standard (1024x768) — Unit Organisasi
  {
    const ctx = await browser.newContext({ viewport: { width: 1024, height: 768 } });
    const page = await ctx.newPage();
    await loginUser(page, "superadmin");
    await page.goto("http://localhost:3000/sekolah", { waitUntil: "domcontentloaded" });
    await page.waitForSelector("text=Identitas & Profil Sekolah");
    await page.click('button:has-text("Unit Organisasi")');
    await page.waitForSelector("text=Unit & Bagian Organisasi");
    await page.screenshot({
      path: path.join(outDir, "02_desktop_standard_1024x768_units.png"),
      fullPage: true,
    });
    await ctx.close();
    console.log("Captured: 02_desktop_standard_1024x768_units.png");
  }

  // 3. Tablet Portrait (768x1024) — Master Jabatan
  {
    const ctx = await browser.newContext({ viewport: { width: 768, height: 1024 } });
    const page = await ctx.newPage();
    await loginUser(page, "superadmin");
    await page.goto("http://localhost:3000/sekolah", { waitUntil: "domcontentloaded" });
    await page.waitForSelector("text=Identitas & Profil Sekolah");
    await page.click('button:has-text("Master Jabatan")');
    await page.waitForSelector("text=Master Jabatan Struktural");
    await page.screenshot({
      path: path.join(outDir, "03_tablet_portrait_768x1024_positions.png"),
      fullPage: true,
    });
    await ctx.close();
    console.log("Captured: 03_tablet_portrait_768x1024_positions.png");
  }

  // 4. Mobile Phone (390x844) — Penugasan Personil
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await ctx.newPage();
    await loginUser(page, "superadmin");
    await page.goto("http://localhost:3000/sekolah", { waitUntil: "domcontentloaded" });
    await page.waitForSelector("text=Identitas & Profil Sekolah");
    await page.click('button:has-text("Penugasan Personil")');
    await page.waitForSelector("text=Penugasan Jabatan Struktural");
    await page.screenshot({
      path: path.join(outDir, "04_mobile_phone_390x844_assignments.png"),
      fullPage: true,
    });
    await ctx.close();
    console.log("Captured: 04_mobile_phone_390x844_assignments.png");
  }

  // 5. Modal Tambah Unit (1440x900)
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await loginUser(page, "superadmin");
    await page.goto("http://localhost:3000/sekolah", { waitUntil: "domcontentloaded" });
    await page.waitForSelector("text=Identitas & Profil Sekolah");
    await page.click('button:has-text("Unit Organisasi")');
    await page.waitForSelector("text=Unit & Bagian Organisasi");
    await page.click('button:has-text("+ Tambah Unit")');
    await page.waitForSelector('[role="dialog"]');
    await page.screenshot({ path: path.join(outDir, "05_modal_create_unit.png") });
    await ctx.close();
    console.log("Captured: 05_modal_create_unit.png");
  }

  // 6. Modal Tambah Jabatan (1440x900)
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await loginUser(page, "superadmin");
    await page.goto("http://localhost:3000/sekolah", { waitUntil: "domcontentloaded" });
    await page.waitForSelector("text=Identitas & Profil Sekolah");
    await page.click('button:has-text("Master Jabatan")');
    await page.waitForSelector("text=Master Jabatan Struktural");
    await page.click('button:has-text("+ Tambah Jabatan")');
    await page.waitForSelector('[role="dialog"]');
    await page.screenshot({ path: path.join(outDir, "06_modal_create_position.png") });
    await ctx.close();
    console.log("Captured: 06_modal_create_position.png");
  }

  // 7. Modal Tugaskan Personil (1440x900)
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await loginUser(page, "superadmin");
    await page.goto("http://localhost:3000/sekolah", { waitUntil: "domcontentloaded" });
    await page.waitForSelector("text=Identitas & Profil Sekolah");
    await page.click('button:has-text("Penugasan Personil")');
    await page.waitForSelector("text=Penugasan Jabatan Struktural");
    await page.click('button:has-text("+ Tugaskan Personil")');
    await page.waitForSelector('[role="dialog"]');
    await page.screenshot({ path: path.join(outDir, "07_modal_assign_position.png") });
    await ctx.close();
    console.log("Captured: 07_modal_assign_position.png");
  }

  await browser.close();
  await prisma.$disconnect();
  console.log("Playwright Visual QA Phase 06 selesai 100%!");
}

runVisualQA().catch((err) => {
  console.error("Visual QA Error:", err);
  process.exit(1);
});

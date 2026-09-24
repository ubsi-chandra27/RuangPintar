import { chromium } from "playwright";
import { PrismaClient } from "@prisma/client";
import { ulid } from "ulidx";
import crypto from "crypto";
import path from "path";
import fs from "fs";
import bcrypt from "bcryptjs";
import { tenantMembershipService } from "../src/shared/infrastructure/tenant/tenant-membership-service.ts";
import { getTenantEntitlement } from "../src/shared/infrastructure/tenant/tenant-entitlement-service.ts";

const prisma = new PrismaClient();
const screenshotDir = path.resolve("docs/phases/screenshots/saas-04-product-review");

if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

async function createTestSession(userId, activeTenantId = null) {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  const sessionId = ulid();

  await prisma.sesiPengguna.create({
    data: {
      id: sessionId,
      pengguna_id: userId,
      sekolah_aktif_id: activeTenantId,
      token_hash: tokenHash,
      berlaku_sampai: new Date(Date.now() + 24 * 60 * 60 * 1000),
      ip_address: "127.0.0.1",
      user_agent: "Playwright Product Review",
    },
  });

  return { sessionId, rawToken };
}

async function main() {
  console.log("🚀 Starting SAAS-04 Product Review Walkthrough & Screenshot Generation...");

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1.5,
  });

  // -------------------------------------------------------------
  // SCENARIO 1: Registrasi SaaS Sekolah Baru
  // -------------------------------------------------------------
  console.log("📸 [1/7] Capturing Scenario 1: Registrasi SaaS Sekolah Baru...");
  {
    const page = await context.newPage();
    await page.goto("http://localhost:3000/register", { waitUntil: "networkidle" });
    await page.waitForTimeout(800);

    // Isi form registrasi sekolah baru
    await page.fill('input[name="nama_lengkap"]', "Dra. Nurul Hidayati, M.Pd");
    await page.fill('input[name="email"]', "nurul.hidayati@sman1bintang.sch.id");
    await page.fill('input[name="username"]', "nurul_hidayati");
    await page.fill('input[name="nama_sekolah"]', "SMA Negeri 1 Bintang Harapan");
    await page.fill('input[name="password"]', "BintangHarapan@2026");
    await page.fill('input[name="confirmPassword"]', "BintangHarapan@2026");
    await page.waitForTimeout(500);

    const out1 = path.join(screenshotDir, "01-saas-new-school-registration.png");
    await page.screenshot({ path: out1, fullPage: false });
    console.log("   Saved:", out1);
    await page.close();
  }

  // Siapkan data institusi dan akun untuk demonstrasi skenario berikutnya
  const passwordHash = await bcrypt.hash("Password123#", 10);

  // 1. Sekolah Utama (SMK Nusantara Raya)
  let schoolA = await prisma.sekolah.findFirst({ where: { npsn: "NPSN-SMK-NUSANTARA" } });
  if (!schoolA) {
    schoolA = await prisma.sekolah.create({
      data: {
        id: ulid(),
        nama: "SMK Nusantara Raya",
        npsn: "NPSN-SMK-NUSANTARA",
        jenjang: "SMK",
        tipe_lisensi: "FREEMIUM",
        trial_berakhir_pada: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
    await prisma.langgananTenant.create({
      data: {
        id: ulid(),
        sekolah_id: schoolA.id,
        paket: "TRIAL",
        status: "TRIAL_ACTIVE",
        berakhir_pada: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        sumber_aktivasi: "TRIAL_PROVISIONING",
      },
    });
  }

  // 2. Sekolah Kedua untuk Tenant Switching (SMA PGRI 1 Bintang)
  let schoolB = await prisma.sekolah.findFirst({ where: { npsn: "NPSN-SMA-PGRI-BINTANG" } });
  if (!schoolB) {
    schoolB = await prisma.sekolah.create({
      data: {
        id: ulid(),
        nama: "SMA PGRI 1 Bintang",
        npsn: "NPSN-SMA-PGRI-BINTANG",
        jenjang: "SMA",
        tipe_lisensi: "SEKOLAH",
        trial_berakhir_pada: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
    });
    await prisma.langgananTenant.create({
      data: {
        id: ulid(),
        sekolah_id: schoolB.id,
        paket: "BASIC",
        status: "ACTIVE",
        berakhir_pada: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        sumber_aktivasi: "PAYMENT",
      },
    });
  }

  // Akun Guru Chandra
  let userChandra = await prisma.pengguna.findUnique({ where: { username: "guru_chandra" } });
  if (!userChandra) {
    userChandra = await prisma.pengguna.create({
      data: {
        id: ulid(),
        username: "guru_chandra",
        email: "guru.chandra@ruangpintar.id",
        password_hash: passwordHash,
        nama_lengkap: "Eri Chandra Apriyadi, S.Kom.",
        peran_dasar: "TEACHER",
        status_akun: "AKTIF",
        sekolah_id: schoolA.id,
      },
    });
  }

  // Pastikan membership di Sekolah A (Owner & Active)
  let memberA = await prisma.keanggotaanSekolah.findUnique({
    where: { pengguna_id_sekolah_id: { pengguna_id: userChandra.id, sekolah_id: schoolA.id } },
  });
  if (!memberA) {
    memberA = await prisma.keanggotaanSekolah.create({
      data: {
        id: ulid(),
        pengguna_id: userChandra.id,
        sekolah_id: schoolA.id,
        peran_dasar_di_tenant: "TEACHER",
        status_keanggotaan: "ACTIVE",
        is_owner: true,
        berlaku_mulai: new Date(),
        sumber_pendaftaran: "OWNER_CREATE",
      },
    });
  }

  // Pastikan profil Guru ada di Sekolah A
  let guruA = await prisma.guru.findUnique({
    where: { pengguna_id: userChandra.id },
  });
  if (!guruA) {
    guruA = await prisma.guru.create({
      data: {
        id: ulid(),
        sekolah_id: schoolA.id,
        pengguna_id: userChandra.id,
        nip: "198809212026011002",
        nama_lengkap: userChandra.nama_lengkap,
        jenis_kelamin: "LAKI_LAKI",
        status_kepegawaian: "TETAP",
        status_aktif: true,
      },
    });
  } else {
    guruA = await prisma.guru.update({
      where: { id: guruA.id },
      data: { sekolah_id: schoolA.id, status_aktif: true },
    });
  }

  // -------------------------------------------------------------
  // SCENARIO 2: Registrasi Guru ke Sekolah yang Sudah Ada (Join Request)
  // -------------------------------------------------------------
  console.log(
    "📸 [2/7] Capturing Scenario 2: Registrasi Guru ke Sekolah Existing (Join Request)..."
  );
  let userRian = await prisma.pengguna.findUnique({ where: { username: "guru_rian" } });
  if (!userRian) {
    userRian = await prisma.pengguna.create({
      data: {
        id: ulid(),
        username: "guru_rian",
        email: "rian.hidayat@gmail.com",
        password_hash: passwordHash,
        nama_lengkap: "Rian Hidayat, S.Pd.",
        peran_dasar: "TEACHER",
        status_akun: "AKTIF",
        sekolah_id: schoolA.id,
      },
    });
  }

  // Membership Rian berstatus PENDING di Sekolah A
  let memberRian = await prisma.keanggotaanSekolah.findUnique({
    where: { pengguna_id_sekolah_id: { pengguna_id: userRian.id, sekolah_id: schoolA.id } },
  });
  if (!memberRian) {
    memberRian = await prisma.keanggotaanSekolah.create({
      data: {
        id: ulid(),
        pengguna_id: userRian.id,
        sekolah_id: schoolA.id,
        peran_dasar_di_tenant: "TEACHER",
        status_keanggotaan: "PENDING",
        is_owner: false,
        sumber_pendaftaran: "JOIN_REQUEST",
      },
    });
  }

  {
    // Tangkap sesi saat guru_rian menunggu approval di dashboard
    const { rawToken: tokenRian } = await createTestSession(userRian.id, schoolA.id);
    const authContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1.5,
    });
    await authContext.addCookies([
      {
        name: "ruang_pintar_session",
        value: tokenRian,
        domain: "localhost",
        path: "/",
        httpOnly: true,
        secure: false,
        sameSite: "Lax",
      },
    ]);

    const page = await authContext.newPage();
    await page.goto("http://localhost:3000/dashboard", { waitUntil: "networkidle" });
    await page.waitForTimeout(800);

    const out2 = path.join(screenshotDir, "02-teacher-join-existing-school.png");
    await page.screenshot({ path: out2, fullPage: false });
    console.log("   Saved:", out2);
    await authContext.close();
  }

  // -------------------------------------------------------------
  // SCENARIO 3: Approval Membership & Audit Trail
  // -------------------------------------------------------------
  console.log("📸 [3/7] Capturing Scenario 3: Approval Membership & Audit Trail...");
  {
    // Lakukan approval keanggotaan via TenantMembershipService
    await tenantMembershipService.changeStatus({
      membershipId: memberRian.id,
      nextStatus: "ACTIVE",
      actorId: userChandra.id,
      actorRole: "TEACHER",
      reason: "Guru mapel produktif terverifikasi oleh Kepala/Owner Sekolah",
    });

    // Login sebagai Super Admin untuk melihat direktori guru & audit trail
    const superAdmin = await prisma.pengguna.findFirst({ where: { peran_dasar: "SUPER_ADMIN" } });
    if (superAdmin) {
      const { rawToken: tokenAdmin } = await createTestSession(superAdmin.id, null);
      const adminCtx = await browser.newContext({
        viewport: { width: 1440, height: 900 },
        deviceScaleFactor: 1.5,
      });
      await adminCtx.addCookies([
        {
          name: "ruang_pintar_session",
          value: tokenAdmin,
          domain: "localhost",
          path: "/",
          httpOnly: true,
          secure: false,
          sameSite: "Lax",
        },
      ]);

      const page = await adminCtx.newPage();
      await page.goto("http://localhost:3000/guru-pengajaran", { waitUntil: "networkidle" });
      await page.waitForTimeout(1000);

      const out3 = path.join(screenshotDir, "03-membership-approval-and-audit.png");
      await page.screenshot({ path: out3, fullPage: false });
      console.log("   Saved:", out3);
      await adminCtx.close();
    }
  }

  // -------------------------------------------------------------
  // SCENARIO 4: First Login Onboarding Guru (Pilih Avatar)
  // -------------------------------------------------------------
  console.log("📸 [4/7] Capturing Scenario 4: First Login Onboarding Guru (Pilih Avatar)...");
  {
    const { rawToken: tokenChandra } = await createTestSession(userChandra.id, schoolA.id);
    const teacherCtx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1.5,
    });
    await teacherCtx.addCookies([
      {
        name: "ruang_pintar_session",
        value: tokenChandra,
        domain: "localhost",
        path: "/",
        httpOnly: true,
        secure: false,
        sameSite: "Lax",
      },
    ]);

    const page = await teacherCtx.newPage();
    await page.goto("http://localhost:3000/onboarding/pilih-avatar", { waitUntil: "networkidle" });
    await page.waitForTimeout(800);

    const out4 = path.join(screenshotDir, "04-first-login-avatar-onboarding.png");
    await page.screenshot({ path: out4, fullPage: false });
    console.log("   Saved:", out4);
    await teacherCtx.close();
  }

  // -------------------------------------------------------------
  // SCENARIO 5: Teacher Dashboard Setelah Onboarding (Inisialisasi Kelas)
  // -------------------------------------------------------------
  console.log("📸 [5/7] Capturing Scenario 5: Teacher Dashboard Setelah Onboarding...");
  {
    const { rawToken: tokenChandra } = await createTestSession(userChandra.id, schoolA.id);
    const teacherCtx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1.5,
    });
    await teacherCtx.addCookies([
      {
        name: "ruang_pintar_session",
        value: tokenChandra,
        domain: "localhost",
        path: "/",
        httpOnly: true,
        secure: false,
        sameSite: "Lax",
      },
    ]);

    const page = await teacherCtx.newPage();
    await page.goto("http://localhost:3000/dashboard", { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);

    // 5a. Wizard modal di atas blurred dashboard
    const out5a = path.join(screenshotDir, "05-teacher-first-class-wizard.png");
    await page.screenshot({ path: out5a, fullPage: false });
    console.log("   Saved:", out5a);

    // Tutup wizard dengan klik "Saya isi nanti"
    const btnNanti = page.locator('button:has-text("Saya isi nanti")').first();
    if (await btnNanti.isVisible()) {
      await btnNanti.click();
      await page.waitForTimeout(600);
    }

    // 5b. Cockpit dashboard penuh setelah wizard ditutup
    const out5b = path.join(screenshotDir, "05b-teacher-dashboard-cockpit.png");
    await page.screenshot({ path: out5b, fullPage: false });
    console.log("   Saved:", out5b);

    // 5c. Buka Modal Inisialisasi Kelas Manual dari Card Onboarding
    const btnManual = page.locator('button:has-text("Buat Rombel Manual")').first();
    if (await btnManual.isVisible()) {
      await btnManual.click();
      await page.waitForTimeout(600);
      const out5c = path.join(screenshotDir, "05c-teacher-manual-class-modal.png");
      await page.screenshot({ path: out5c, fullPage: false });
      console.log("   Saved:", out5c);
    }

    await teacherCtx.close();
  }

  // -------------------------------------------------------------
  // SCENARIO 6: Tenant Switching (Beralih Antar Sekolah)
  // -------------------------------------------------------------
  console.log("📸 [6/7] Capturing Scenario 6: Tenant Switching (Beralih Antar Sekolah)...");
  {
    // Berikan userChandra membership aktif kedua di School B (SMA PGRI 1 Bintang)
    let memberB = await prisma.keanggotaanSekolah.findUnique({
      where: { pengguna_id_sekolah_id: { pengguna_id: userChandra.id, sekolah_id: schoolB.id } },
    });
    if (!memberB) {
      memberB = await prisma.keanggotaanSekolah.create({
        data: {
          id: ulid(),
          pengguna_id: userChandra.id,
          sekolah_id: schoolB.id,
          peran_dasar_di_tenant: "TEACHER",
          status_keanggotaan: "ACTIVE",
          is_owner: false,
          sumber_pendaftaran: "INVITATION",
          disetujui_pada: new Date(),
        },
      });
    }

    // Buat sesi di mana sekolah_aktif_id diarahkan ke School B
    const { sessionId, rawToken: tokenSwitch } = await createTestSession(
      userChandra.id,
      schoolA.id
    );

    // Switch tenant secara server-authoritative
    await tenantMembershipService.setActiveTenant({
      sessionId,
      penggunaId: userChandra.id,
      sekolahId: schoolB.id,
      actorRole: "TEACHER",
    });

    const switchCtx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1.5,
    });
    await switchCtx.addCookies([
      {
        name: "ruang_pintar_session",
        value: tokenSwitch,
        domain: "localhost",
        path: "/",
        httpOnly: true,
        secure: false,
        sameSite: "Lax",
      },
    ]);

    const page = await switchCtx.newPage();
    // Bypass modal agar dashboard SMA PGRI 1 Bintang langsung terlihat
    await page.addInitScript(() => {
      sessionStorage.setItem("rp_first_class_setup_seen", "1");
    });

    await page.goto("http://localhost:3000/dashboard", { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);

    const out6 = path.join(screenshotDir, "06-tenant-switching-verification.png");
    await page.screenshot({ path: out6, fullPage: false });
    console.log("   Saved:", out6);
    await switchCtx.close();
  }

  // -------------------------------------------------------------
  // SCENARIO 7: Trial Status & Entitlement State (Active vs Read-Only)
  // -------------------------------------------------------------
  console.log("📸 [7/7] Capturing Scenario 7: Trial Status & Entitlement State...");
  {
    // Evaluasi entitlement Sekolah A (Trial Aktif 30 Hari)
    const entA = await getTenantEntitlement(schoolA.id);
    console.log("   Sekolah A Entitlement:", entA);

    // Buka dashboard Sekolah A dengan Trial Banner aktif
    const { rawToken: tokenChandra } = await createTestSession(userChandra.id, schoolA.id);
    const trialCtx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1.5,
    });
    await trialCtx.addCookies([
      {
        name: "ruang_pintar_session",
        value: tokenChandra,
        domain: "localhost",
        path: "/",
        httpOnly: true,
        secure: false,
        sameSite: "Lax",
      },
    ]);

    const page = await trialCtx.newPage();
    await page.addInitScript(() => {
      sessionStorage.setItem("rp_first_class_setup_seen", "1");
    });
    await page.goto("http://localhost:3000/dashboard", { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);

    const out7 = path.join(screenshotDir, "07-trial-status-and-entitlement-state.png");
    await page.screenshot({ path: out7, fullPage: false });
    console.log("   Saved:", out7);
    await trialCtx.close();
  }

  await browser.close();
  await prisma.$disconnect();

  console.log("\n✅ All 7 product review scenarios successfully executed & captured!");
}

main().catch((err) => {
  console.error("❌ Execution error:", err);
  process.exit(1);
});

import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const outDir = path.resolve("docs/phases/screenshots/phase-03");

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function seedTestUsers() {
  const schoolId = "01JA0000000000000000000001";
  await prisma.sekolah.upsert({
    where: { id: schoolId },
    update: {},
    create: {
      id: schoolId,
      nama: "SMK Negeri 1 Ruang Pintar",
      jenjang: "SMK",
    },
  });

  const passwordHash = await bcrypt.hash("Password123", 10);

  // Normal active user
  await prisma.pengguna.upsert({
    where: { username: "guru_demo" },
    update: { password_hash: passwordHash, status_akun: "AKTIF", harus_ganti_password: false },
    create: {
      id: "01JA0000000000000000000002",
      sekolah_id: schoolId,
      username: "guru_demo",
      password_hash: passwordHash,
      nama_lengkap: "Siti Rahma, S.Pd.",
      peran_dasar: "TEACHER",
      status_akun: "AKTIF",
      harus_ganti_password: false,
    },
  });

  // User with must change password
  await prisma.pengguna.upsert({
    where: { username: "siswa_baru" },
    update: { password_hash: passwordHash, status_akun: "AKTIF", harus_ganti_password: true },
    create: {
      id: "01JA0000000000000000000003",
      sekolah_id: schoolId,
      username: "siswa_baru",
      password_hash: passwordHash,
      nama_lengkap: "Ahmad Fajar Pratama",
      peran_dasar: "STUDENT",
      status_akun: "AKTIF",
      harus_ganti_password: true,
    },
  });

  // Inactive user
  await prisma.pengguna.upsert({
    where: { username: "user_nonaktif" },
    update: { password_hash: passwordHash, status_akun: "NONAKTIF" },
    create: {
      id: "01JA0000000000000000000004",
      sekolah_id: schoolId,
      username: "user_nonaktif",
      password_hash: passwordHash,
      nama_lengkap: "User Nonaktif Demo",
      peran_dasar: "SCHOOL_STAFF",
      status_akun: "NONAKTIF",
    },
  });
}

async function runQa() {
  console.log("Seeding test users for Browser QA...");
  await seedTestUsers();

  console.log("Launching Chromium browser...");
  const browser = await chromium.launch();
  const consoleErrors = [];

  const viewports = [
    { width: 1440, height: 900, name: "phase-03-login-1440x900.png" },
    { width: 1024, height: 768, name: "phase-03-login-1024x768.png" },
    { width: 768, height: 1024, name: "phase-03-login-768x1024.png" },
    { width: 390, height: 844, name: "phase-03-login-390x844.png" },
  ];

  // 1. Capture Login across viewports
  for (const vp of viewports) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(`[${vp.name}] ${msg.text()}`);
    });

    await page.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
    await page.screenshot({ path: path.join(outDir, vp.name), fullPage: false });
    console.log(`Saved screenshot: ${vp.name}`);
    await page.close();
  }

  // 2. Test Invalid Login & Validation Error State
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
    await page.fill('input[name="username"]', "guru_demo");
    await page.fill('input[name="password"]', "WrongPassword123");
    await page.click('button[type="submit"]');
    await page.waitForSelector('[role="alert"]', { state: "visible", timeout: 8000 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(outDir, "phase-03-login-validation.png") });
    console.log("Saved screenshot: phase-03-login-validation.png");
    await page.close();
  }

  // 3. Test Must Change Password flow
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
    await page.fill('input[name="username"]', "siswa_baru");
    await page.fill('input[name="password"]', "Password123");
    await page.click('button[type="submit"]');
    await page.waitForURL("**/ganti-password", { timeout: 8000 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(outDir, "phase-03-password-required.png") });
    console.log("Saved screenshot: phase-03-password-required.png");
    await page.close();
  }

  // 4. Test Forgot Password Page
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto("http://localhost:3000/forgot-password", { waitUntil: "networkidle" });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(outDir, "phase-03-forgot-password.png") });
    console.log("Saved screenshot: phase-03-forgot-password.png");
    await page.close();
  }

  // 5. Test Full Valid Login & Logout Flow
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
    await page.fill('input[name="username"]', "guru_demo");
    await page.fill('input[name="password"]', "Password123");
    await page.check('input[name="remember"]');
    await page.click('button[type="submit"]');
    await page.waitForURL("http://localhost:3000/", { timeout: 8000 });

    const text = await page.textContent("body");
    const isAuthenticated = text.includes("Siti Rahma, S.Pd.") && text.includes("TEACHER");
    console.log("Authenticated Landing Page Check:", isAuthenticated ? "PASS" : "FAIL");

    // Click logout
    await page.click('button:has-text("Keluar")');
    await page.waitForURL("**/login", { timeout: 8000 });
    console.log("Logout redirect to /login Check: PASS");

    await page.close();
  }

  // 6. Test Inactive Account
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
    await page.fill('input[name="username"]', "user_nonaktif");
    await page.fill('input[name="password"]', "Password123");
    await page.click('button[type="submit"]');
    await page.waitForSelector('[role="alert"]', { state: "visible", timeout: 8000 });
    const alertText = await page.textContent('[role="alert"]');
    console.log("Inactive account rejected with message:", alertText);
    await page.close();
  }

  await browser.close();
  await prisma.$disconnect();

  console.log("Console errors collected during QA:", consoleErrors.length);
  console.log("Browser QA Completed Successfully!");
}

runQa().catch((err) => {
  console.error("QA script failed:", err);
  process.exit(1);
});

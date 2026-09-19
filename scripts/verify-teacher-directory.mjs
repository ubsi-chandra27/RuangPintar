import { chromium } from "playwright";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import path from "path";
import fs from "fs";

const prisma = new PrismaClient();

function generateUlid() {
  const chars = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
  let id = "";
  for (let i = 0; i < 26; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

async function run() {
  const admin = await prisma.pengguna.findFirst({
    where: { peran_dasar: "SUPER_ADMIN" },
  });

  if (!admin) {
    console.error("Super admin not found!");
    process.exit(1);
  }

  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  const sessionId = generateUlid();

  await prisma.sesiPengguna.create({
    data: {
      id: sessionId,
      pengguna_id: admin.id,
      token_hash: tokenHash,
      berlaku_sampai: new Date(Date.now() + 24 * 60 * 60 * 1000),
      ip_address: "127.0.0.1",
      user_agent: "Mozilla/5.0 Playwright Verification",
    },
  });

  console.log("Created test session for", admin.username);

  const targetDir = path.resolve("docs/phases/screenshots");
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const browser = await chromium.launch();

  // 1. Desktop Context
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1.5,
  });

  await context.addCookies([
    {
      name: "ruang_pintar_session",
      value: rawToken,
      domain: "localhost",
      path: "/",
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
    },
  ]);

  const page = await context.newPage();

  console.log("Navigating to http://localhost:3000/guru-pengajaran...");
  await page.goto("http://localhost:3000/guru-pengajaran", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  const currentUrl = page.url();
  console.log("Current URL after navigation:", currentUrl);
  if (!currentUrl.includes("/guru-pengajaran")) {
    throw new Error(`Expected URL to contain /guru-pengajaran, but got: ${currentUrl}`);
  }

  const pageTitle = await page.textContent("h1");
  console.log("Page H1 content:", pageTitle);

  // Desktop Empty Screenshot
  const desktopPath = path.join(targetDir, "super-admin-guru-desktop.png");
  await page.screenshot({ path: desktopPath, fullPage: true });
  console.log("Saved desktop screenshot:", desktopPath);

  // 2. Mobile Context (393 x 852)
  const mobileContext = await browser.newContext({
    viewport: { width: 393, height: 852 },
    deviceScaleFactor: 2,
    isMobile: true,
  });

  await mobileContext.addCookies([
    {
      name: "ruang_pintar_session",
      value: rawToken,
      domain: "localhost",
      path: "/",
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
    },
  ]);

  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto("http://localhost:3000/guru-pengajaran", { waitUntil: "networkidle" });
  await mobilePage.waitForTimeout(1000);

  const mobilePath = path.join(targetDir, "super-admin-guru-mobile.png");
  await mobilePage.screenshot({ path: mobilePath, fullPage: true });
  console.log("Saved mobile screenshot:", mobilePath);

  await mobileContext.close();

  // 3. Test with a School & Teacher
  const testSchoolId = generateUlid();
  await prisma.sekolah.create({
    data: {
      id: testSchoolId,
      nama: "SMA Negeri 1 Jakarta Barat",
      jenjang: "SMA",
      status_aktif: true,
      tipe_lisensi: "SEKOLAH",
    },
  });

  const testTeacherId = generateUlid();
  await prisma.guru.create({
    data: {
      id: testTeacherId,
      sekolah_id: testSchoolId,
      nama_lengkap: "Budi Rahardjo",
      gelar_belakang: "M.Kom.",
      nip: "198001012005011001",
      jenis_kelamin: "L",
      email: "budi.rahardjo@sman1jakbar.sch.id",
      status_kepegawaian: "PNS",
      status_aktif: true,
    },
  });

  // Reload page to see teacher in table
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  const teacherWithDataPath = path.join(targetDir, "super-admin-guru-with-data.png");
  await page.screenshot({ path: teacherWithDataPath, fullPage: true });
  console.log("Saved screenshot with data:", teacherWithDataPath);

  // Click "Kelola di Sekolah"
  const kelolaBtn = page.locator("a:has-text('Kelola di Sekolah')").first();
  if (await kelolaBtn.isVisible()) {
    await kelolaBtn.click();
    await page.waitForTimeout(1200);
    console.log("Drill-down URL:", page.url());
    const drilldownPath = path.join(targetDir, "super-admin-guru-drilldown.png");
    await page.screenshot({ path: drilldownPath, fullPage: true });
    console.log("Saved drill-down screenshot:", drilldownPath);
  }

  // Cleanup test teacher and test school
  await prisma.guru.delete({ where: { id: testTeacherId } });
  await prisma.sekolah.delete({ where: { id: testSchoolId } });
  console.log("Cleaned up test teacher and school!");

  await context.close();
  await prisma.sesiPengguna.delete({ where: { id: sessionId } });
  await browser.close();
  await prisma.$disconnect();

  console.log("All teacher directory verifications finished successfully!");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});

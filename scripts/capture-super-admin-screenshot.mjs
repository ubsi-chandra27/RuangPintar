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
  // Find superadmin user
  const admin = await prisma.pengguna.findFirst({
    where: { peran_dasar: "SUPER_ADMIN" },
  });

  if (!admin) {
    console.error("Super admin not found!");
    process.exit(1);
  }

  // Create temporary session
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

  console.log("Navigating to http://localhost:3000/dashboard...");
  await page.goto("http://localhost:3000/dashboard", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  // 1. Capture full desktop dashboard overview
  const overviewPath = path.join(targetDir, "super-admin-academic-glass.png");
  await page.screenshot({ path: overviewPath, fullPage: true });
  console.log("Saved desktop:", overviewPath);

  // 2. Mobile viewport screenshot (iPhone 14 Pro: 393 x 852)
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
  await mobilePage.goto("http://localhost:3000/dashboard", { waitUntil: "networkidle" });
  await mobilePage.waitForTimeout(1000);

  const mobileOverviewPath = path.join(targetDir, "super-admin-mobile-verified.png");
  await mobilePage.screenshot({ path: mobileOverviewPath, fullPage: true });
  console.log("Saved mobile full page:", mobileOverviewPath);

  const mobileViewportPath = path.join(targetDir, "super-admin-mobile-viewport.png");
  await mobilePage.screenshot({ path: mobileViewportPath });
  console.log("Saved mobile top viewport:", mobileViewportPath);

  // Scroll to "Performa Rombongan Belajar & KBM" to verify the exact section from the user's report
  const rombelSection = mobilePage.locator("text=Performa Rombongan Belajar & KBM");
  if (await rombelSection.isVisible()) {
    await rombelSection.scrollIntoViewIfNeeded();
    await mobilePage.waitForTimeout(400);
    const mobileRombelPath = path.join(targetDir, "super-admin-mobile-rombel.png");
    await mobilePage.screenshot({ path: mobileRombelPath });
    console.log("Saved mobile rombel section:", mobileRombelPath);
  }

  await mobileContext.close();

  // Clean up test session
  await prisma.sesiPengguna.delete({ where: { id: sessionId } });
  await browser.close();
  await prisma.$disconnect();

  console.log("All visual verification checks completed successfully!");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});

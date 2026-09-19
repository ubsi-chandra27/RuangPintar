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

  // Desktop Context
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

  console.log("Navigating to http://localhost:3000/sekolah...");
  const response = await page.goto("http://localhost:3000/sekolah", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  const currentUrl = page.url();
  console.log("Current URL after navigation:", currentUrl);
  if (!currentUrl.includes("/sekolah")) {
    throw new Error(`Expected URL to contain /sekolah, but got: ${currentUrl}`);
  }

  const pageTitle = await page.textContent("h1");
  console.log("Page H1 content:", pageTitle);

  // 1. Desktop Screenshot
  const desktopPath = path.join(targetDir, "super-admin-sekolah-desktop.png");
  await page.screenshot({ path: desktopPath, fullPage: true });
  console.log("Saved desktop screenshot:", desktopPath);

  // 2. Open Modal and verify
  const openModalBtn = page.locator("button:has-text('Daftarkan Sekolah')").first();
  if (await openModalBtn.isVisible()) {
    await openModalBtn.click();
    await page.waitForTimeout(600);
    const modalHeading = await page.locator("h3:has-text('Daftarkan Sekolah Baru')").isVisible();
    console.log("Modal opened successfully:", modalHeading);

    const modalPath = path.join(targetDir, "super-admin-sekolah-modal.png");
    await page.screenshot({ path: modalPath });
    console.log("Saved modal screenshot:", modalPath);

    // Close modal
    const closeBtn = page.locator("button:has-text('Batal')");
    await closeBtn.click();
    await page.waitForTimeout(400);
  }

  // 3. Mobile Context (393 x 852)
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
  await mobilePage.goto("http://localhost:3000/sekolah", { waitUntil: "networkidle" });
  await mobilePage.waitForTimeout(1000);

  const mobilePath = path.join(targetDir, "super-admin-sekolah-mobile.png");
  await mobilePage.screenshot({ path: mobilePath, fullPage: true });
  console.log("Saved mobile screenshot:", mobilePath);

  await mobileContext.close();
  await context.close();

  // Cleanup session
  await prisma.sesiPengguna.delete({ where: { id: sessionId } });
  await browser.close();
  await prisma.$disconnect();

  console.log("Verification finished successfully!");
}

run().catch((e) => {
  console.error("Verification failed:", e);
  process.exit(1);
});

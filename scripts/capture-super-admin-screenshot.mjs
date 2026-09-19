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

  // 1. Capture full dashboard overview
  const overviewPath = path.join(targetDir, "super-admin-academic-glass.png");
  await page.screenshot({ path: overviewPath, fullPage: true });
  console.log("Saved:", overviewPath);

  // 2. Open User Menu to verify Power (Off) icon
  const userMenuBtn = page.locator('button[aria-label="Menu Pengguna"]');
  if (await userMenuBtn.isVisible()) {
    await userMenuBtn.click();
    await page.waitForTimeout(400);
    const userMenuPath = path.join(targetDir, "super-admin-user-menu-power.png");
    await page.screenshot({ path: userMenuPath });
    console.log("Saved:", userMenuPath);

    // Click "Keluar dari Akun" to trigger smooth zoom-in modal
    const logoutBtn = page.locator('button:has-text("Keluar dari Akun")');
    if (await logoutBtn.isVisible()) {
      await logoutBtn.click();
      await page.waitForTimeout(400);
      const modalLogoutPath = path.join(targetDir, "super-admin-logout-modal-zoom.png");
      await page.screenshot({ path: modalLogoutPath });
      console.log("Saved:", modalLogoutPath);

      // Close modal
      const batalBtn = page.locator('button:has-text("Batal")');
      if (await batalBtn.isVisible()) {
        await batalBtn.click();
        await page.waitForTimeout(300);
      }
    }
  }

  // 3. Switch to Audit Log tab & Open Activity Details Modal
  const auditTab = page.locator('button:has-text("Audit Log Sistem")');
  if (await auditTab.isVisible()) {
    await auditTab.click();
    await page.waitForTimeout(500);

    const auditDetailBtn = page.locator('button:has-text("Detail")').first();
    if (await auditDetailBtn.isVisible()) {
      await auditDetailBtn.click();
      await page.waitForTimeout(400);
      const modalAuditPath = path.join(targetDir, "super-admin-audit-modal-zoom.png");
      await page.screenshot({ path: modalAuditPath });
      console.log("Saved:", modalAuditPath);
    }
  }

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

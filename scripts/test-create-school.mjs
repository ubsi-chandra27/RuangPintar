import { PrismaClient } from "@prisma/client";
import { chromium } from "playwright";
import crypto from "crypto";
import path from "path";

const prisma = new PrismaClient();

function generateUlid() {
  const chars = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
  let id = "";
  for (let i = 0; i < 26; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

async function test() {
  const admin = await prisma.pengguna.findFirst({
    where: { peran_dasar: "SUPER_ADMIN" },
  });

  if (!admin) {
    console.error("Super admin not found!");
    process.exit(1);
  }

  // Pre-clean any test school
  const prev = await prisma.sekolah.findFirst({ where: { npsn: "20109999" } });
  if (prev) {
    await prisma.logAudit.deleteMany({ where: { sekolah_id: prev.id } });
    await prisma.sekolah.delete({ where: { id: prev.id } });
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
      user_agent: "Playwright Test",
    },
  });

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
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
  await page.goto("http://localhost:3000/sekolah", { waitUntil: "networkidle" });

  // Open modal
  const openBtn = page.locator("button:has-text('Daftarkan Sekolah Baru')");
  await openBtn.click();
  await page.waitForTimeout(400);

  // Fill form
  const testSchoolName = "SMA Teladan Nusantara 1";
  await page.fill("input[placeholder='Contoh: SMA Negeri 1 Jakarta']", testSchoolName);
  await page.fill("input[placeholder='Contoh: 20101234']", "20109999");
  await page.fill(
    "textarea[placeholder='Jalan, Kota/Kabupaten, Provinsi...']",
    "Jl. Jenderal Sudirman No. 45, Jakarta Pusat"
  );
  await page.fill("input[placeholder='admin@sekolah.sch.id']", "info@smateladan.sch.id");
  await page.fill("input[placeholder='021-xxxxxxxx']", "021-5551234");

  // Submit
  const submitBtn = page.locator("button[type='submit']:has-text('Daftarkan Sekolah')");
  await submitBtn.click();
  await page.waitForTimeout(1500);

  // Check if school appears in list
  const schoolRow = page.locator(`text=${testSchoolName}`).first();
  const isVisible = await schoolRow.isVisible();
  console.log(`School ${testSchoolName} visible in directory:`, isVisible);

  if (isVisible) {
    const targetDir = path.resolve("docs/phases/screenshots");
    await page.screenshot({
      path: path.join(targetDir, "super-admin-sekolah-with-data.png"),
      fullPage: true,
    });
    console.log("Saved screenshot with created school!");

    // Test drill-down link "Kelola"
    const kelolaLink = page.locator(`tr:has-text('${testSchoolName}') a:has-text('Kelola')`);
    if (await kelolaLink.isVisible()) {
      await kelolaLink.click();
      await page.waitForTimeout(1000);
      console.log("Navigated to drill-down page:", page.url());
      await page.screenshot({
        path: path.join(targetDir, "super-admin-sekolah-drilldown.png"),
        fullPage: true,
      });
      console.log("Saved drilldown screenshot!");
    }
  }

  // Clean up created school and session
  const createdSchool = await prisma.sekolah.findFirst({
    where: { npsn: "20109999" },
  });
  if (createdSchool) {
    await prisma.logAudit.deleteMany({ where: { sekolah_id: createdSchool.id } });
    await prisma.sekolah.delete({ where: { id: createdSchool.id } });
    console.log("Cleaned up test school!");
  }

  await prisma.sesiPengguna.delete({ where: { id: sessionId } });
  await browser.close();
  await prisma.$disconnect();

  console.log("Test completed successfully!");
}

test().catch((err) => {
  console.error(err);
  process.exit(1);
});

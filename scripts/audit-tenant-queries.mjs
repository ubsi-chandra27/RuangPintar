import fs from "node:fs";
import path from "node:path";

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      if (file !== "node_modules" && file !== ".next" && file !== "test") {
        results = results.concat(walk(fullPath));
      }
    } else if (file.endsWith(".ts") || file.endsWith(".tsx")) {
      results.push(fullPath);
    }
  }
  return results;
}

const files = walk("src");

// Entitas global yang memang id-based (bukan milik satu tenant spesifik, atau root tenant):
const GLOBAL_ENTITIES = new Set([
  "sekolah", // Root tenant itu sendiri
  "pengguna", // User global identity
  "sesiPengguna", // Token sesi global
  "metadataBerkas", // Storage key global
  "keanggotaanSekolah", // Link user <-> sekolah (compound key / membership)
  "transaksiPembayaran", // Billing global
  "langgananSekolah", // Subscription per sekolah
]);

const findings = [];

for (const file of files) {
  const content = fs.readFileSync(file, "utf8");
  const lines = content.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Cek prisma.<model>.(findUnique|update|delete)
    const match = line.match(/prisma\.([a-zA-Z0-9_]+)\.(findUnique|update|delete)\(/);
    if (match) {
      const model = match[1];
      const op = match[2];
      const context = lines.slice(Math.max(0, i - 15), Math.min(lines.length, i + 15)).join("\n");
      const isGlobal = GLOBAL_ENTITIES.has(model);

      // Cek apakah ada sekolah_id dalam query atau di context fungsi sebelumnya
      const hasSekolahIdFilter =
        context.includes("sekolah_id") ||
        context.includes("sekolahId") ||
        context.includes("schoolId");

      findings.push({
        file: file.replace(/\\/g, "/"),
        line: i + 1,
        model,
        op,
        isGlobal,
        hasSekolahIdFilter,
        contextPreview: line.trim(),
      });
    }

    // Cek input parameter: client-provided sekolah_id, guru_id, tenant_id
    if (
      line.includes('formData.get("sekolah_id")') ||
      line.includes('formData.get("guru_id")') ||
      line.includes('formData.get("tenant_id")') ||
      line.includes("params.sekolah_id") ||
      line.includes("params.tenant_id")
    ) {
      const context = lines.slice(Math.max(0, i - 5), Math.min(lines.length, i + 10)).join("\n");
      // Periksa apakah ada validasi terhadap session
      const hasValidation =
        context.includes("session.sekolah_id") ||
        context.includes("user.sekolah_id") ||
        context.includes("actor.sekolah_id") ||
        context.includes("AuthorizationError") ||
        context.includes("Akses ditolak") ||
        context.includes("assert");

      findings.push({
        file: file.replace(/\\/g, "/"),
        line: i + 1,
        model: "INPUT_PARAM",
        op: "CLIENT_PARAM_CHECK",
        isGlobal: false,
        hasValidation,
        contextPreview: line.trim(),
      });
    }
  }
}

// Kelompokkan findings berdasarkan model / kategori
const byCategory = {};
for (const f of findings) {
  const cat = f.model;
  if (!byCategory[cat]) byCategory[cat] = [];
  byCategory[cat].push(f);
}

for (const [cat, items] of Object.entries(byCategory)) {
  console.log(`=== Category: ${cat} (Total: ${items.length}) ===`);
  for (const item of items) {
    console.log(
      `  ${item.file}:${item.line} [${item.op}] global=${item.isGlobal} hasSekolahId/validation=${item.hasSekolahIdFilter ?? item.hasValidation}`
    );
  }
}

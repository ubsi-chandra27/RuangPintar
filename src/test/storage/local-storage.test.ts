import { describe, it, expect, beforeAll, afterAll } from "vitest";
import path from "path";
import fs from "fs/promises";
import { prisma, configureSqlitePragmas } from "@/shared/infrastructure/database/prisma";
import { LocalStorageAdapter } from "@/shared/infrastructure/storage/local-storage-adapter";

describe("Local Storage Adapter (M04) — Private File Storage", () => {
  const testDir = path.join(process.cwd(), "data", "test_storage");
  const storage = new LocalStorageAdapter(testDir);
  let savedStorageKey = "";

  beforeAll(async () => {
    await configureSqlitePragmas(prisma);
  });

  afterAll(async () => {
    // Cleanup test storage directory and metadata
    if (savedStorageKey) {
      await prisma.metadataBerkas.deleteMany({ where: { storage_key: savedStorageKey } });
    }
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch {
      // Ignore
    }
    await prisma.$disconnect();
  });

  it("saves a private file and creates database metadata with SHA-256 checksum", async () => {
    const fileContent = Buffer.from("Ruang Pintar Document Payload Test");
    const metadata = await storage.saveFile({
      nama_file_asli: "dokumen_rahasia.pdf",
      mime_type: "application/pdf",
      content: fileContent,
    });

    savedStorageKey = metadata.storage_key;

    expect(metadata.id).toBeDefined();
    expect(metadata.nama_file_asli).toBe("dokumen_rahasia.pdf");
    expect(metadata.ukuran_byte).toBe(fileContent.length);
    expect(metadata.checksum).toBeDefined();
    expect(metadata.status).toBe("AKTIF");

    const exists = await storage.fileExists(savedStorageKey);
    expect(exists).toBe(true);
  });

  it("reads the stored private file and validates content integrity", async () => {
    const stored = await storage.readFile(savedStorageKey);

    expect(stored.metadata.nama_file_asli).toBe("dokumen_rahasia.pdf");
    expect(stored.content.toString()).toBe("Ruang Pintar Document Payload Test");
  });

  it("deletes file and marks metadata as TERHAPUS", async () => {
    await storage.deleteFile(savedStorageKey);

    const exists = await storage.fileExists(savedStorageKey);
    expect(exists).toBe(false);

    const metadata = await prisma.metadataBerkas.findUnique({
      where: { storage_key: savedStorageKey },
    });
    expect(metadata?.status).toBe("TERHAPUS");
  });
});

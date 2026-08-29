import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { MetadataBerkas } from "@prisma/client";
import { prisma } from "../database/prisma";
import { generateUlid } from "../../lib/ulid";
import type { IStorageService, SaveFileOptions, StoredFile } from "./storage-interface";

export class LocalStorageAdapter implements IStorageService {
  private baseDir: string;

  constructor(baseDir?: string) {
    this.baseDir =
      baseDir ?? process.env.STORAGE_LOCAL_ROOT ?? path.join(process.cwd(), "data", "storage");
  }

  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    await fs.mkdir(dirPath, { recursive: true });
  }

  private calculateChecksum(content: Buffer | Uint8Array): string {
    return crypto.createHash("sha256").update(content).digest("hex");
  }

  async saveFile(options: SaveFileOptions): Promise<MetadataBerkas> {
    const fileId = generateUlid();
    const datePrefix = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const sanitizedName = path.basename(options.nama_file_asli).replace(/[^a-zA-Z0-9._-]/g, "_");
    const storageKey = `${datePrefix}/${fileId}_${sanitizedName}`;
    const absolutePath = path.join(this.baseDir, storageKey);

    await this.ensureDirectoryExists(path.dirname(absolutePath));
    await fs.writeFile(absolutePath, options.content);

    const checksum = this.calculateChecksum(options.content);
    const sizeBytes = options.content.length;

    const metadata = await prisma.metadataBerkas.create({
      data: {
        id: fileId,
        sekolah_id: options.sekolah_id ?? null,
        nama_file_asli: options.nama_file_asli,
        storage_provider: "LOCAL",
        storage_key: storageKey,
        mime_type: options.mime_type,
        ukuran_byte: sizeBytes,
        checksum,
        status: "AKTIF",
      },
    });

    return metadata;
  }

  async readFile(storageKey: string): Promise<StoredFile> {
    const metadata = await prisma.metadataBerkas.findUnique({
      where: { storage_key: storageKey },
    });

    if (!metadata) {
      throw new Error(`File metadata with storage_key ${storageKey} not found.`);
    }

    const absolutePath = path.join(this.baseDir, storageKey);
    const content = await fs.readFile(absolutePath);

    return {
      metadata,
      content,
    };
  }

  async deleteFile(storageKey: string): Promise<void> {
    const metadata = await prisma.metadataBerkas.findUnique({
      where: { storage_key: storageKey },
    });

    if (!metadata) {
      return;
    }

    const absolutePath = path.join(this.baseDir, storageKey);
    try {
      await fs.unlink(absolutePath);
    } catch {
      // Ignore if physical file already unlinked
    }

    await prisma.metadataBerkas.update({
      where: { storage_key: storageKey },
      data: { status: "TERHAPUS" },
    });
  }

  async fileExists(storageKey: string): Promise<boolean> {
    const absolutePath = path.join(this.baseDir, storageKey);
    try {
      await fs.access(absolutePath);
      return true;
    } catch {
      return false;
    }
  }
}

export const localStorageService = new LocalStorageAdapter();

import { MetadataBerkas } from "@prisma/client";

export interface SaveFileOptions {
  sekolah_id?: string | null;
  nama_file_asli: string;
  mime_type: string;
  content: Buffer | Uint8Array;
}

export interface StoredFile {
  metadata: MetadataBerkas;
  content: Buffer;
}

export interface IStorageService {
  saveFile(options: SaveFileOptions): Promise<MetadataBerkas>;
  readFile(storageKey: string): Promise<StoredFile>;
  deleteFile(storageKey: string): Promise<void>;
  fileExists(storageKey: string): Promise<boolean>;
}

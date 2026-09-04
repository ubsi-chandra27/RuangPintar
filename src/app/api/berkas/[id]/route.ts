/**
 * Ruang Pintar — Private File Access API (M04 Storage)
 * Serves private school files to authorized users.
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/shared/infrastructure/auth/auth-guard";
import { prisma } from "@/shared/infrastructure/database/prisma";
import { LocalStorageAdapter } from "@/shared/infrastructure/storage/local-storage-adapter";

export async function GET(
  _request: NextRequest,
  props: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const user = await getCurrentUser();
  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const params = await props.params;
  const fileId = params.id;

  const metadata = await prisma.metadataBerkas.findUnique({
    where: { id: fileId },
  });

  if (!metadata || metadata.status === "TERHAPUS") {
    return new NextResponse("Berkas tidak ditemukan", { status: 404 });
  }

  // School multi-tenancy check
  if (
    metadata.sekolah_id &&
    metadata.sekolah_id !== user.sekolah_id &&
    user.peran_dasar !== "SUPER_ADMIN"
  ) {
    return new NextResponse("Akses ditolak", { status: 403 });
  }

  try {
    const storage = new LocalStorageAdapter();
    const stored = await storage.readFile(metadata.storage_key);

    const filename = encodeURIComponent(metadata.nama_file_asli);
    return new NextResponse(new Uint8Array(stored.content), {
      status: 200,
      headers: {
        "Content-Type": metadata.mime_type || "application/octet-stream",
        "Content-Disposition": `inline; filename*=UTF-8''${filename}`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return new NextResponse("Gagal membaca berkas dari media penyimpanan", { status: 500 });
  }
}

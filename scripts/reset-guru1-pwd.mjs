import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/shared/lib/password.ts";

const prisma = new PrismaClient();

async function main() {
  const hash = await hashPassword("Password123#");
  await prisma.pengguna.update({
    where: { username: "guru1" },
    data: {
      password_hash: hash,
      percobaan_login_gagal: 0,
      status_akun: "AKTIF",
      dikunci_sampai: null,
    },
  });
  console.log("Password for guru1 set to Password123#");
}

main().finally(() => prisma.$disconnect());

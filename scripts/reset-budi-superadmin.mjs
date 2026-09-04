import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/shared/lib/password.ts";

const prisma = new PrismaClient();

async function main() {
  const hash = await hashPassword("Password123#");
  await prisma.pengguna.updateMany({
    where: { username: { in: ["guru_budi", "superadmin"] } },
    data: {
      password_hash: hash,
      percobaan_login_gagal: 0,
      status_akun: "AKTIF",
      dikunci_sampai: null,
    },
  });
  console.log("Passwords set for guru_budi and superadmin");
}

main().finally(() => prisma.$disconnect());

import { PrismaClient } from "@prisma/client";
import { verifyPassword } from "../src/shared/lib/password.ts";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.pengguna.findUnique({
    where: { username: "guru1" },
  });

  if (!user) {
    console.log("No guru1");
    return;
  }

  console.log("Status akun:", user.status_akun);
  const candidates = [
    "Password123!",
    "Password123#",
    "guru123",
    "guru1",
    "Admin123!",
    "Admin123#",
    "12345678",
  ];

  for (const pwd of candidates) {
    const ok = await verifyPassword(pwd, user.password_hash);
    if (ok) {
      console.log("MATCH FOUND:", pwd);
      return;
    }
  }
  console.log("No candidate matched");
}

main().finally(() => prisma.$disconnect());

/**
 * Ruang Pintar — Validation Schemas: AI Assistance & SaaS Onboarding (M21)
 */

import { z } from "zod";

export const SmartOnboardingRegistrationSchema = z.object({
  nama_lengkap: z
    .string()
    .min(3, "Nama lengkap minimal 3 karakter")
    .max(100, "Nama lengkap maksimal 100 karakter"),
  username: z
    .string()
    .min(3, "Username minimal 3 karakter")
    .max(30, "Username maksimal 30 karakter")
    .regex(/^[a-zA-Z0-9_]+$/, "Username hanya boleh huruf, angka, dan underscore")
    .optional()
    .or(z.literal("")),
  email: z.string().email("Format email tidak valid"),
  no_telepon: z
    .string()
    .optional()
    .refine((val) => !val || /^[0-9+ -]{8,20}$/.test(val), "Nomor telepon / WhatsApp tidak valid"),
  password: z
    .string()
    .min(8, "Kata sandi minimal 8 karakter")
    .max(100, "Kata sandi maksimal 100 karakter")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/,
      "Kata sandi wajib memadukan huruf besar, huruf kecil, angka, dan simbol"
    ),
  nama_sekolah: z
    .string()
    .min(3, "Nama sekolah minimal 3 karakter")
    .max(150, "Nama sekolah maksimal 150 karakter"),
});

export const StudentDraftSchema = z.object({
  nama_lengkap: z.string().min(2, "Nama siswa minimal 2 karakter"),
  nis: z.string().optional(),
  nisn: z.string().optional(),
  jenis_kelamin: z.enum(["L", "P"]).default("L"),
});

export const ConfirmClassCreationSchema = z.object({
  requestId: z.string().optional(),
  nama_kelas: z.string().min(2, "Nama kelas wajib diisi (misal: X MIPA 1)"),
  mata_pelajaran: z.string().min(2, "Mata pelajaran wajib diisi"),
  tingkat_kelas: z.string().default("10"),
  siswa: z.array(StudentDraftSchema).min(1, "Minimal 1 orang siswa terdaftar dalam kelas"),
});

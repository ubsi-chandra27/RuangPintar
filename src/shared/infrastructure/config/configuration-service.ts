import { KonfigurasiSistem } from "@prisma/client";
import { prisma } from "../database/prisma";
import { generateUlid } from "../../lib/ulid";

export class ConfigurationService {
  /**
   * Retrieve a configuration value by key, prioritizing school-specific override over global default.
   */
  async getConfig(
    kunci: string,
    sekolah_id?: string | null,
    defaultValue?: string
  ): Promise<string | undefined> {
    if (sekolah_id) {
      const schoolConfig = await prisma.konfigurasiSistem.findUnique({
        where: {
          sekolah_id_kunci: {
            sekolah_id,
            kunci,
          },
        },
      });
      if (schoolConfig) return schoolConfig.nilai;
    }

    const globalConfig = await prisma.konfigurasiSistem.findFirst({
      where: {
        sekolah_id: null,
        kunci,
      },
    });

    return globalConfig ? globalConfig.nilai : defaultValue;
  }

  /**
   * Set or update a configuration key-value pair.
   */
  async setConfig(
    kunci: string,
    nilai: string,
    options?: {
      sekolah_id?: string | null;
      kategori?: string;
      deskripsi?: string;
    }
  ): Promise<KonfigurasiSistem> {
    const sekolah_id = options?.sekolah_id ?? null;

    const existing = await prisma.konfigurasiSistem.findFirst({
      where: {
        sekolah_id,
        kunci,
      },
    });

    if (existing) {
      return await prisma.konfigurasiSistem.update({
        where: { id: existing.id },
        data: {
          nilai,
          kategori: options?.kategori ?? existing.kategori,
          deskripsi: options?.deskripsi ?? existing.deskripsi,
        },
      });
    }

    return await prisma.konfigurasiSistem.create({
      data: {
        id: generateUlid(),
        sekolah_id,
        kunci,
        nilai,
        kategori: options?.kategori ?? "UMUM",
        deskripsi: options?.deskripsi ?? null,
      },
    });
  }

  /**
   * Retrieve all configuration values for a given school context merged with global defaults.
   */
  async getAllConfigs(sekolah_id?: string | null): Promise<Record<string, string>> {
    const configs = await prisma.konfigurasiSistem.findMany({
      where: {
        OR: [{ sekolah_id: null }, ...(sekolah_id ? [{ sekolah_id }] : [])],
      },
    });

    const result: Record<string, string> = {};
    // Global defaults first
    configs
      .filter((c) => c.sekolah_id === null)
      .forEach((c) => {
        result[c.kunci] = c.nilai;
      });
    // School-specific overrides
    if (sekolah_id) {
      configs
        .filter((c) => c.sekolah_id === sekolah_id)
        .forEach((c) => {
          result[c.kunci] = c.nilai;
        });
    }

    return result;
  }
}

export const configurationService = new ConfigurationService();

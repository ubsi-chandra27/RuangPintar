/**
 * Ruang Pintar — Domain Errors: AI Assistance & SaaS Onboarding (M21)
 */

export class AiExtractionError extends Error {
  constructor(message = "Gagal mengekstrak data kelas dari foto yang diunggah.") {
    super(message);
    this.name = "AiExtractionError";
  }
}

export class ImageProcessingError extends Error {
  constructor(message = "Berkas gambar tidak valid atau tidak dapat dibaca.") {
    super(message);
    this.name = "ImageProcessingError";
  }
}

export class TrialExpiredError extends Error {
  constructor(
    message = "Masa uji coba gratis Anda telah berakhir. Hubungi kami untuk upgrade ke lisensi sekolah."
  ) {
    super(message);
    this.name = "TrialExpiredError";
  }
}

export class RombelQuotaExceededError extends Error {
  constructor(
    message = "Batas kuota kelas gratis tercapai (Maksimal 5 Rombel). Upgrade ke paket sekolah untuk kelas tanpa batas."
  ) {
    super(message);
    this.name = "RombelQuotaExceededError";
  }
}

export class UserRegistrationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UserRegistrationError";
  }
}

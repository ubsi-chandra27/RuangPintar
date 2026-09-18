/**
 * Ruang Pintar — User-Agent & Device Presence Parser (Phase 22)
 *
 * Menganalisis string User-Agent untuk mengidentifikasi perangkat (HP, Tablet, Laptop),
 * merek/sistem operasi (Samsung, iPhone, Xiaomi, Windows, Mac), dan status aktivitas pengguna.
 */

export interface DeviceInfo {
  type: "mobile" | "tablet" | "desktop";
  brand: string;
  os: string;
  browser: string;
  label: string;
  iconName: "Smartphone" | "Tablet" | "Laptop";
}

export interface PresenceInfo {
  status: "online" | "recent" | "offline";
  label: string;
  badgeClass: string;
  dotClass: string;
}

/**
 * Mendeteksi informasi perangkat dan peramban dari string User-Agent.
 */
export function parseUserAgent(uaString: string | null | undefined): DeviceInfo {
  if (!uaString || uaString.trim() === "") {
    return {
      type: "desktop",
      brand: "Desktop Browser",
      os: "Web",
      browser: "Browser",
      label: "Desktop Web",
      iconName: "Laptop",
    };
  }

  const ua = uaString.toLowerCase();

  // 1. Deteksi Tablet
  const isTablet =
    ua.includes("ipad") ||
    (ua.includes("tablet") && !ua.includes("mobile")) ||
    (ua.includes("android") && !ua.includes("mobile"));

  // 2. Deteksi Mobile / Smartphone
  const isMobile =
    !isTablet &&
    (ua.includes("mobile") ||
      ua.includes("iphone") ||
      ua.includes("ipod") ||
      ua.includes("android") ||
      ua.includes("blackberry") ||
      ua.includes("windows phone"));

  const type: "mobile" | "tablet" | "desktop" = isTablet
    ? "tablet"
    : isMobile
      ? "mobile"
      : "desktop";

  // 3. Deteksi Merek & Sistem Operasi
  let brand = "Perangkat Umum";
  let os = "OS Tidak Dikenal";

  if (ua.includes("iphone")) {
    brand = "iPhone";
    os = "iOS";
  } else if (ua.includes("ipad")) {
    brand = "iPad";
    os = "iPadOS";
  } else if (ua.includes("macintosh") || ua.includes("mac os x")) {
    brand = "Mac / Apple";
    os = "macOS";
  } else if (ua.includes("windows")) {
    brand = "Komputer PC";
    os = "Windows";
  } else if (ua.includes("cros")) {
    brand = "Chromebook";
    os = "ChromeOS";
  } else if (ua.includes("linux")) {
    if (ua.includes("samsung") || ua.includes("sm-")) {
      brand = "Samsung Galaxy";
      os = "Android";
    } else if (ua.includes("redmi") || ua.includes("xiaomi") || ua.includes("mi ")) {
      brand = "Xiaomi / Redmi";
      os = "Android";
    } else if (ua.includes("oppo") || ua.includes("cph")) {
      brand = "OPPO";
      os = "Android";
    } else if (ua.includes("vivo")) {
      brand = "Vivo";
      os = "Android";
    } else if (ua.includes("realme") || ua.includes("rmx")) {
      brand = "Realme";
      os = "Android";
    } else if (ua.includes("infinix")) {
      brand = "Infinix";
      os = "Android";
    } else if (ua.includes("android")) {
      brand = "Ponsel Android";
      os = "Android";
    } else {
      brand = "Komputer Linux";
      os = "Linux";
    }
  } else if (ua.includes("android")) {
    brand = "Ponsel Android";
    os = "Android";
  }

  // 4. Deteksi Browser
  let browser = "Peramban Web";
  if (ua.includes("edg/")) {
    browser = "Microsoft Edge";
  } else if (ua.includes("chrome/") && !ua.includes("chromium/")) {
    browser = isMobile ? "Chrome Mobile" : "Google Chrome";
  } else if (ua.includes("safari/") && !ua.includes("chrome/")) {
    browser = isMobile ? "Safari Mobile" : "Safari";
  } else if (ua.includes("firefox/")) {
    browser = "Mozilla Firefox";
  } else if (ua.includes("opr/") || ua.includes("opera/")) {
    browser = "Opera";
  }

  const iconName: "Smartphone" | "Tablet" | "Laptop" =
    type === "tablet" ? "Tablet" : type === "mobile" ? "Smartphone" : "Laptop";

  const label = `${brand} (${os}) • ${browser}`;

  return {
    type,
    brand,
    os,
    browser,
    label,
    iconName,
  };
}

/**
 * Menentukan status keaktifan pengguna berdasarkan waktu terakhir aktif / sesi.
 */
export function calculatePresence(
  lastActive: Date | string | null | undefined,
  referenceNow: Date = new Date()
): PresenceInfo {
  if (!lastActive) {
    return {
      status: "offline",
      label: "Belum pernah aktif",
      badgeClass:
        "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400",
      dotClass: "bg-slate-400",
    };
  }

  const activeDate = typeof lastActive === "string" ? new Date(lastActive) : lastActive;
  const diffMs = referenceNow.getTime() - activeDate.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  // Di bawah 10 menit dianggap masih aktif (Online)
  if (diffMinutes < 10) {
    return {
      status: "online",
      label: "Online Sekarang",
      badgeClass:
        "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60",
      dotClass: "bg-emerald-500 animate-pulse",
    };
  }

  // Antara 10 menit sampai 60 menit dianggap baru saja aktif
  if (diffMinutes < 60) {
    return {
      status: "recent",
      label: `Aktif ${diffMinutes} mnt lalu`,
      badgeClass:
        "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60",
      dotClass: "bg-blue-500",
    };
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return {
      status: "offline",
      label: `Aktif ${diffHours} jam lalu`,
      badgeClass:
        "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
      dotClass: "bg-slate-400",
    };
  }

  const diffDays = Math.floor(diffHours / 24);
  return {
    status: "offline",
    label: `Aktif ${diffDays} hari lalu`,
    badgeClass:
      "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
    dotClass: "bg-slate-300",
  };
}

import { describe, it, expect } from "vitest";
import { parseUserAgent, calculatePresence } from "@/shared/lib/device-detector";

describe("DeviceDetector & Presence Utility", () => {
  it("harus mendeteksi iPhone Safari dengan benar", () => {
    const iphoneUa =
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Mobile/15E148 Safari/604.1";
    const result = parseUserAgent(iphoneUa);

    expect(result.type).toBe("mobile");
    expect(result.brand).toBe("iPhone");
    expect(result.os).toBe("iOS");
    expect(result.browser).toBe("Safari Mobile");
    expect(result.iconName).toBe("Smartphone");
  });

  it("harus mendeteksi ponsel Android Samsung Chrome dengan benar", () => {
    const samsungUa =
      "Mozilla/5.0 (Linux; Android 14; SM-A546E) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36";
    const result = parseUserAgent(samsungUa);

    expect(result.type).toBe("mobile");
    expect(result.brand).toBe("Samsung Galaxy");
    expect(result.os).toBe("Android");
    expect(result.browser).toBe("Chrome Mobile");
  });

  it("harus mendeteksi Desktop Windows Chrome dengan benar", () => {
    const windowsUa =
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";
    const result = parseUserAgent(windowsUa);

    expect(result.type).toBe("desktop");
    expect(result.brand).toBe("Komputer PC");
    expect(result.os).toBe("Windows");
    expect(result.browser).toBe("Google Chrome");
    expect(result.iconName).toBe("Laptop");
  });

  it("harus menghitung status kehadiran (presence) online, recent, dan offline", () => {
    const now = new Date("2026-09-18T10:00:00Z");

    // 2 menit lalu -> Online
    const onlineDate = new Date("2026-09-18T09:58:00Z");
    const onlinePresence = calculatePresence(onlineDate, now);
    expect(onlinePresence.status).toBe("online");
    expect(onlinePresence.label).toBe("Online Sekarang");

    // 25 menit lalu -> Recent
    const recentDate = new Date("2026-09-18T09:35:00Z");
    const recentPresence = calculatePresence(recentDate, now);
    expect(recentPresence.status).toBe("recent");
    expect(recentPresence.label).toBe("Aktif 25 mnt lalu");

    // 3 jam lalu -> Offline
    const offlineDate = new Date("2026-09-18T07:00:00Z");
    const offlinePresence = calculatePresence(offlineDate, now);
    expect(offlinePresence.status).toBe("offline");
    expect(offlinePresence.label).toBe("Aktif 3 jam lalu");
  });
});

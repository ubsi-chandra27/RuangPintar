import type { NextConfig } from "next";
import os from "node:os";

// Detect all active non-internal IPv4 addresses for LAN access
const detectedIps: string[] = [];
const ifaces = os.networkInterfaces();
for (const dev in ifaces) {
  for (const details of ifaces[dev] || []) {
    if (details.family === "IPv4" && !details.internal) {
      detectedIps.push(details.address);
    }
  }
}

const localOrigins = [
  ...detectedIps,
  ...detectedIps.map((ip) => `${ip}:3000`),
  ...detectedIps.map((ip) => `${ip}:3001`),
  "192.168.1.30",
  "192.168.1.30:3000",
  "192.168.1.30:3001",
  "192.168.0.103",
  "192.168.0.103:3000",
  "192.168.0.103:3001",
  "192.168.*.*",
  "10.*.*.*",
  "*.local",
  "localhost",
  "localhost:3000",
  "localhost:3001",
  "127.0.0.1",
  "127.0.0.1:3000",
  "127.0.0.1:3001",
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: localOrigins,
  experimental: {
    serverActions: {
      allowedOrigins: localOrigins,
    },
  },
};

export default nextConfig;

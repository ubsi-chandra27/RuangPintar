import { chromium } from "playwright";
import sharp from "sharp";
import path from "path";
import fs from "fs";

async function main() {
  console.log("1. Rendering composite in Playwright...");
  const browser = await chromium.launch({
    headless: true,
    args: ["--allow-file-access-from-files", "--disable-web-security"]
  });
  const page = await browser.newPage({ viewport: { width: 896, height: 1200 } });

  page.on("console", msg => console.log("PAGE LOG:", msg.text()));
  page.on("pageerror", err => console.error("PAGE ERROR:", err.message));

  const htmlPath = "file:///" + path.resolve("scripts/composite-stage.html").replace(/\\/g, "/");
  await page.goto(htmlPath, { waitUntil: "networkidle" });
  await page.waitForFunction(() => window.__COMPOSITE_READY__ === true, { timeout: 10000 });
  await page.waitForTimeout(600);

  const rawCompositePath = path.resolve("scripts/composite-raw.png");
  await page.screenshot({ path: rawCompositePath });
  await browser.close();
  console.log("✓ Raw composite saved to:", rawCompositePath);

  // 2. Process transparency using BFS flood fill
  console.log("2. Applying BFS flood-fill transparency...");
  const { data, info } = await sharp(rawCompositePath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height } = info;
  const visited = new Uint8Array(width * height);
  const queue = new Int32Array(width * height);
  let head = 0;
  let tail = 0;

  function isBgColor(r, g, b) {
    return r >= 238 && g >= 238 && b >= 238;
  }

  // Seed with outer border pixels
  for (let x = 0; x < width; x++) {
    // Top border
    const idxTop = x;
    if (isBgColor(data[idxTop * 4], data[idxTop * 4 + 1], data[idxTop * 4 + 2])) {
      visited[idxTop] = 1;
      queue[tail++] = idxTop;
    }
    // Bottom border
    const idxBot = (height - 1) * width + x;
    if (isBgColor(data[idxBot * 4], data[idxBot * 4 + 1], data[idxBot * 4 + 2])) {
      visited[idxBot] = 1;
      queue[tail++] = idxBot;
    }
  }

  for (let y = 0; y < height; y++) {
    // Left border
    const idxLeft = y * width;
    if (isBgColor(data[idxLeft * 4], data[idxLeft * 4 + 1], data[idxLeft * 4 + 2]) && visited[idxLeft] === 0) {
      visited[idxLeft] = 1;
      queue[tail++] = idxLeft;
    }
    // Right border
    const idxRight = y * width + (width - 1);
    if (isBgColor(data[idxRight * 4], data[idxRight * 4 + 1], data[idxRight * 4 + 2]) && visited[idxRight] === 0) {
      visited[idxRight] = 1;
      queue[tail++] = idxRight;
    }
  }

  // BFS
  while (head < tail) {
    const curr = queue[head++];
    const cx = curr % width;
    const cy = Math.floor(curr / width);

    const neighbors = [
      cx > 0 ? curr - 1 : -1,
      cx < width - 1 ? curr + 1 : -1,
      cy > 0 ? curr - width : -1,
      cy < height - 1 ? curr + width : -1
    ];

    for (let n = 0; n < 4; n++) {
      const nid = neighbors[n];
      if (nid >= 0 && visited[nid] === 0) {
        if (isBgColor(data[nid * 4], data[nid * 4 + 1], data[nid * 4 + 2])) {
          visited[nid] = 1;
          queue[tail++] = nid;
        } else {
          visited[nid] = 2; // boundary
        }
      }
    }
  }

  console.log(`✓ BFS completed. Transparent pixels: ${tail}`);

  for (let i = 0; i < width * height; i++) {
    if (visited[i] === 1) {
      data[i * 4 + 3] = 0;
    } else if (visited[i] === 2) {
      const r = data[i * 4];
      const g = data[i * 4 + 1];
      const b = data[i * 4 + 2];
      const minVal = Math.min(r, g, b);
      if (minVal > 220) {
        data[i * 4 + 3] = Math.max(0, Math.floor(255 * (1 - (minVal - 220) / 35)));
      }
    }
  }

  const unclipped = await sharp(data, {
    raw: { width, height, channels: 4 }
  }).png({ compressionLevel: 8 }).toBuffer();

  const outputPath = path.resolve("public/images/illustrations/astronaut-large-ipad-transparent.png");
  const trimmed = await sharp(unclipped)
    .trim({ threshold: 5 })
    .toFile(outputPath);

  console.log("✓ Saved final trimmed transparent mockup:", trimmed);
}

main().catch(console.error);

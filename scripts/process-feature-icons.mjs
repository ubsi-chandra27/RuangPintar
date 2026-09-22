import sharp from "sharp";
import fs from "fs";
import path from "path";

const images = [
  {
    src: "C:/Users/vitam/.gemini/antigravity-cli/brain/651c150a-16e4-4324-8459-56cbd481e84c/icon_lms_admin_1789788857678.jpg",
    dest: "public/images/features/feature-lms-3d.png",
  },
  {
    src: "C:/Users/vitam/.gemini/antigravity-cli/brain/651c150a-16e4-4324-8459-56cbd481e84c/icon_cbt_exam_1789788882755.jpg",
    dest: "public/images/features/feature-cbt-3d.png",
  },
  {
    src: "C:/Users/vitam/.gemini/antigravity-cli/brain/651c150a-16e4-4324-8459-56cbd481e84c/icon_leger_rapor_1789788909002.jpg",
    dest: "public/images/features/feature-leger-3d.png",
  },
];

async function processIcon(item) {
  const { data, info } = await sharp(item.src)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height } = info;
  const visited = new Uint8Array(width * height);
  const queue = new Int32Array(width * height);
  let head = 0;
  let tail = 0;

  function isBg(r, g, b) {
    return r >= 248 && g >= 248 && b >= 248;
  }

  // Seed 4 borders
  for (let x = 0; x < width; x++) {
    const t = x;
    if (isBg(data[t * 4], data[t * 4 + 1], data[t * 4 + 2])) {
      visited[t] = 1;
      queue[tail++] = t;
    }
    const b = (height - 1) * width + x;
    if (isBg(data[b * 4], data[b * 4 + 1], data[b * 4 + 2])) {
      visited[b] = 1;
      queue[tail++] = b;
    }
  }
  for (let y = 0; y < height; y++) {
    const l = y * width;
    if (isBg(data[l * 4], data[l * 4 + 1], data[l * 4 + 2]) && visited[l] === 0) {
      visited[l] = 1;
      queue[tail++] = l;
    }
    const r = y * width + (width - 1);
    if (isBg(data[r * 4], data[r * 4 + 1], data[r * 4 + 2]) && visited[r] === 0) {
      visited[r] = 1;
      queue[tail++] = r;
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
      cy < height - 1 ? curr + width : -1,
    ];

    for (let n = 0; n < 4; n++) {
      const nid = neighbors[n];
      if (nid >= 0 && visited[nid] === 0) {
        if (isBg(data[nid * 4], data[nid * 4 + 1], data[nid * 4 + 2])) {
          visited[nid] = 1;
          queue[tail++] = nid;
        } else {
          visited[nid] = 2; // edge feathering
        }
      }
    }
  }

  // Apply alpha
  for (let i = 0; i < width * height; i++) {
    if (visited[i] === 1) {
      data[i * 4 + 3] = 0;
    } else if (visited[i] === 2) {
      const r = data[i * 4];
      const g = data[i * 4 + 1];
      const b = data[i * 4 + 2];
      const minVal = Math.min(r, g, b);
      if (minVal > 235) {
        data[i * 4 + 3] = Math.max(0, Math.floor(255 * (1 - (minVal - 235) / 20)));
      }
    }
  }

  const outDir = path.dirname(item.dest);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const buffer = await sharp(data, {
    raw: { width, height, channels: 4 },
  })
    .trim({ threshold: 5 })
    .png({ compressionLevel: 8 })
    .toFile(item.dest);

  console.log("Processed:", item.dest, buffer);
}

async function main() {
  for (const item of images) {
    await processIcon(item);
  }
  console.log("All 3 icons processed successfully!");
}

main().catch(console.error);

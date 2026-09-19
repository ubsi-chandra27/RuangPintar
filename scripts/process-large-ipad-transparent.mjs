import sharp from "sharp";
import path from "path";

const inputPath = "C:/Users/vitam/.gemini/antigravity-cli/brain/651c150a-16e4-4324-8459-56cbd481e84c/astronaut_ipad_atm_mockup_1789785095125.jpg";
const outputPath = path.resolve("public/images/illustrations/astronaut-large-ipad-transparent.png");

async function run() {
  const image = sharp(inputPath);
  const { data, info } = await image
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  console.log(`Image loaded: ${width}x${height}, channels: ${channels}`);

  // Visited array: Uint8Array of size width * height (0: not visited, 1: background, 2: non-bg edge)
  const visited = new Uint8Array(width * height);
  const queue = new Int32Array(width * height);
  let head = 0;
  let tail = 0;

  function isBgColor(r, g, b) {
    // Check if near white
    return r >= 238 && g >= 238 && b >= 238;
  }

  // Seed with border pixels that are background white
  for (let x = 0; x < width; x++) {
    // Top border (y = 0)
    const idxTop = x;
    const rTop = data[idxTop * 4];
    const gTop = data[idxTop * 4 + 1];
    const bTop = data[idxTop * 4 + 2];
    if (isBgColor(rTop, gTop, bTop) && visited[idxTop] === 0) {
      visited[idxTop] = 1;
      queue[tail++] = idxTop;
    }

    // Bottom border (y = height - 1)
    const idxBot = (height - 1) * width + x;
    const rBot = data[idxBot * 4];
    const gBot = data[idxBot * 4 + 1];
    const bBot = data[idxBot * 4 + 2];
    if (isBgColor(rBot, gBot, bBot) && visited[idxBot] === 0) {
      visited[idxBot] = 1;
      queue[tail++] = idxBot;
    }
  }

  for (let y = 0; y < height; y++) {
    // Left border (x = 0)
    const idxLeft = y * width;
    const rLeft = data[idxLeft * 4];
    const gLeft = data[idxLeft * 4 + 1];
    const bLeft = data[idxLeft * 4 + 2];
    if (isBgColor(rLeft, gLeft, bLeft) && visited[idxLeft] === 0) {
      visited[idxLeft] = 1;
      queue[tail++] = idxLeft;
    }

    // Right border (x = width - 1)
    const idxRight = y * width + (width - 1);
    const rRight = data[idxRight * 4];
    const gRight = data[idxRight * 4 + 1];
    const bRight = data[idxRight * 4 + 2];
    if (isBgColor(rRight, gRight, bRight) && visited[idxRight] === 0) {
      visited[idxRight] = 1;
      queue[tail++] = idxRight;
    }
  }

  console.log(`Initial queue size: ${tail}`);

  // BFS
  while (head < tail) {
    const curr = queue[head++];
    const cx = curr % width;
    const cy = Math.floor(curr / width);

    // 4-neighborhood
    const neighbors = [
      cx > 0 ? curr - 1 : -1,
      cx < width - 1 ? curr + 1 : -1,
      cy > 0 ? curr - width : -1,
      cy < height - 1 ? curr + width : -1
    ];

    for (let n = 0; n < 4; n++) {
      const nid = neighbors[n];
      if (nid >= 0 && visited[nid] === 0) {
        const nr = data[nid * 4];
        const ng = data[nid * 4 + 1];
        const nb = data[nid * 4 + 2];

        if (isBgColor(nr, ng, nb)) {
          visited[nid] = 1;
          queue[tail++] = nid;
        } else {
          visited[nid] = 2; // boundary non-bg pixel
        }
      }
    }
  }

  console.log(`BFS finished. Total transparent pixels: ${tail}`);

  // Now apply transparency with soft anti-aliased edge feathering
  for (let i = 0; i < width * height; i++) {
    if (visited[i] === 1) {
      data[i * 4 + 3] = 0; // completely transparent
    } else if (visited[i] === 2) {
      // Near boundary: check if it's very bright white that should be smoothly blended
      const r = data[i * 4];
      const g = data[i * 4 + 1];
      const b = data[i * 4 + 2];
      const minVal = Math.min(r, g, b);
      if (minVal > 220) {
        const alpha = Math.floor(255 * (1 - (minVal - 220) / (255 - 220)));
        data[i * 4 + 3] = Math.max(0, Math.min(255, alpha));
      }
    }
  }

  // Trim transparent padding so the mockup fills its bounding box perfectly
  const unclipped = await sharp(data, {
    raw: {
      width,
      height,
      channels: 4,
    },
  })
    .png({ compressionLevel: 8 })
    .toBuffer();

  const trimmed = await sharp(unclipped)
    .trim({ threshold: 5 })
    .toFile(outputPath);

  console.log(`Successfully saved trimmed transparent mockup:`, trimmed);
}

run().catch(console.error);

import sharp from "sharp";
import path from "path";

const inputPath =
  "C:/Users/vitam/.gemini/antigravity-cli/brain/5c203a37-e73c-4b09-8a80-1d188533023a/student_lifecycle_3d_1788082579811.jpg";
const outputPath = path.resolve("public/images/illustrations/student-lifecycle-3d.png");

async function processImage() {
  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const threshold = 245; // Threshold for pure white
  const softThreshold = 230;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    if (r >= threshold && g >= threshold && b >= threshold) {
      data[i + 3] = 0; // Transparent
    } else if (r >= softThreshold && g >= softThreshold && b >= softThreshold) {
      const avg = (r + g + b) / 3;
      const alpha = Math.floor(255 * (1 - (avg - softThreshold) / (255 - softThreshold)));
      data[i + 3] = Math.min(data[i + 3], alpha);
    }
  }

  await sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4,
    },
  })
    .png({ quality: 90, compressionLevel: 8 })
    .toFile(outputPath);

  console.log("✓ Saved transparent 3D student illustration to:", outputPath);
}

processImage().catch(console.error);

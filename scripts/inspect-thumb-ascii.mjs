import sharp from "sharp";

async function main() {
  const { data, info } = await sharp("scripts/astronaut_ipad_atm_mockup_1789785095125.jpg")
    .raw()
    .toBuffer({ resolveWithObject: true });

  console.log("Analyzing y from 535 to 660, x from 520 to 720:");
  for (let y = 535; y <= 660; y += 5) {
    let row = [];
    for (let x = 520; x <= 720; x += 5) {
      const idx = (y * info.width + x) * 3;
      const r = data[idx],
        g = data[idx + 1],
        b = data[idx + 2];
      // Thumb rubber/glove is dark or textured
      const isDark = r < 140 && g < 140 && b < 140;
      const isGray = r < 200 && g < 200 && b < 200;
      row.push(isDark ? "#" : isGray ? "+" : ".");
    }
    console.log(`y=${y}: ${row.join("")}`);
  }
}

main().catch(console.error);

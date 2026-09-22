import sharp from "sharp";

async function main() {
  const { data, info } = await sharp("scripts/astronaut_ipad_atm_mockup_1789785095125.jpg")
    .raw()
    .toBuffer({ resolveWithObject: true });

  console.log("Width:", info.width, "Height:", info.height);
  console.log("Scanning thumb region in JPG (y from 420 to 620):");

  for (let y = 430; y <= 620; y += 10) {
    let darkXs = [];
    for (let x = 500; x <= 750; x++) {
      const idx = (y * info.width + x) * 3;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      // Thumb rubber is dark: r < 140, g < 140, b < 140
      if (r < 140 && g < 140 && b < 140) {
        darkXs.push(x);
      }
    }
    if (darkXs.length > 0) {
      console.log(
        `y=${y}: dark x from ${Math.min(...darkXs)} to ${Math.max(...darkXs)} (count: ${darkXs.length})`
      );
    } else {
      console.log(`y=${y}: none`);
    }
  }
}

main().catch(console.error);

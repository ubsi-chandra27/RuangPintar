import sharp from "sharp";

async function main() {
  function getScreenRightX(y) {
    return 735 + (y - 255) * (-190 / 593);
  }

  const { data, info } = await sharp("scripts/astronaut_ipad_atm_mockup_1789785095125.jpg")
    .raw()
    .toBuffer({ resolveWithObject: true });

  console.log("Inspecting thumb pixels across y=545..665, x=530..rx:");
  // Let's check color distribution of the thumb:
  let maxR = 0, maxG = 0, maxB = 0;
  let minR = 255, minG = 255, minB = 255;
  let samples = [];

  for (let y = 545; y <= 665; y += 2) {
    const rx = getScreenRightX(y) - 3;
    for (let x = 528; x < rx; x++) {
      const idx = (y * info.width + x) * 3;
      const r = data[idx], g = data[idx+1], b = data[idx+2];
      // In the original image, screen background is #F8FAFD (r>230, g>230, b>230)
      // The thumb is anything not near-white!
      if (r < 210 || g < 210 || b < 210) {
        if (r > maxR) maxR = r;
        if (g > maxG) maxG = g;
        if (b > maxB) maxB = b;
        if (r < minR) minR = r;
        if (g < minG) minG = g;
        if (b < minB) minB = b;
      }
    }
  }

  console.log(`Thumb color range: R[${minR}..${maxR}], G[${minG}..${maxG}], B[${minB}..${maxB}]`);
}

main().catch(console.error);

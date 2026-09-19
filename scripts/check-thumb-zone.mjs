import sharp from "sharp";

async function main() {
  function getScreenRightX(y) {
    return 735 + (y - 255) * (-190 / 593);
  }

  const { data, info } = await sharp("scripts/astronaut_ipad_atm_mockup_1789785095125.jpg")
    .raw()
    .toBuffer({ resolveWithObject: true });

  console.log("Checking pixels in thumb zone inside screen:");
  for (let y = 520; y <= 670; y += 5) {
    const rx = getScreenRightX(y) - 3;
    let thumbPixels = [];
    for (let x = 500; x < rx; x++) {
      const idx = (y * info.width + x) * 3;
      const r = data[idx], g = data[idx+1], b = data[idx+2];
      // Check if it's the dark rubber thumb (not light background)
      if (r < 140 && g < 140 && b < 140) {
        thumbPixels.push({ x, r, g, b });
      }
    }
    if (thumbPixels.length > 0) {
      const minX = thumbPixels[0].x;
      const maxX = thumbPixels[thumbPixels.length - 1].x;
      console.log(`y=${y} (rx=${rx.toFixed(1)}): thumb from x=${minX} to ${maxX} (count: ${thumbPixels.length})`);
    } else {
      console.log(`y=${y} (rx=${rx.toFixed(1)}): NO dark pixels inside screen`);
    }
  }
}

main().catch(console.error);

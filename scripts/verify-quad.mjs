import sharp from "sharp";

async function main() {
  const { data, info } = await sharp("scripts/astronaut_ipad_atm_mockup_1789785095125.jpg")
    .raw()
    .toBuffer({ resolveWithObject: true });

  console.log("Checking bezel edges:");
  function getPixel(x, y) {
    const px = Math.round(x);
    const py = Math.round(y);
    if (px < 0 || px >= info.width || py < 0 || py >= info.height) return null;
    const idx = (py * info.width + px) * 3;
    return [data[idx], data[idx+1], data[idx+2]];
  }

  console.log("TL interior (325, 160):", getPixel(325, 160));
  console.log("TL bezel (310, 140):", getPixel(310, 140));

  console.log("TR interior (720, 260):", getPixel(720, 260));
  console.log("TR bezel (745, 250):", getPixel(745, 250));

  console.log("BL interior (150, 720):", getPixel(150, 720));
  console.log("BL bezel (125, 740):", getPixel(125, 740));

  console.log("BR interior (535, 835):", getPixel(535, 835));
  console.log("BR bezel (555, 860):", getPixel(555, 860));
}

main().catch(console.error);

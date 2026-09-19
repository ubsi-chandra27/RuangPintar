import sharp from "sharp";

const imgPath = "C:/Users/vitam/.gemini/antigravity-cli/brain/651c150a-16e4-4324-8459-56cbd481e84c/astronaut_ipad_atm_mockup_1789785095125.jpg";

async function main() {
  const { data, info } = await sharp(imgPath).raw().toBuffer({ resolveWithObject: true });
  const { width, height } = info;

  // Let's sample the 4 corner regions:
  // Top-Left: around x=315..325, y=145..155
  // Top-Right: around x=695..710, y=245..260
  // Bottom-Left: around x=130..145, y=720..735
  // Bottom-Right: around x=510..530, y=825..840
  
  console.log("Image size:", width, height);

  function isBezel(x, y) {
    if (x < 0 || x >= width || y < 0 || y >= height) return false;
    const idx = (y * width + x) * 3;
    const r = data[idx], g = data[idx+1], b = data[idx+2];
    return r < 60 && g < 60 && b < 60;
  }

  function isScreen(x, y) {
    if (x < 0 || x >= width || y < 0 || y >= height) return false;
    const idx = (y * width + x) * 3;
    const r = data[idx], g = data[idx+1], b = data[idx+2];
    return r > 200 && g > 200 && b > 200;
  }

  console.log("Top-Left check (320, 150):", isScreen(320, 150), "bezel(320, 140):", isBezel(320, 140));
  console.log("Top-Right check (700, 255):", isScreen(700, 255), "bezel(705, 245):", isBezel(705, 245));
  console.log("Bottom-Left check (138, 725):", isScreen(138, 725), "bezel(130, 735):", isBezel(130, 735));
  console.log("Bottom-Right check (515, 830):", isScreen(515, 830));
}

main();

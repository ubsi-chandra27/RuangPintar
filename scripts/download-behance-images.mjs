import fs from "fs";
import path from "path";

const images = [
  "https://mir-s3-cdn-cf.behance.net/project_modules/1400_webp/6b0cbf247507873.69dea62a97ae6.png",
  "https://mir-s3-cdn-cf.behance.net/project_modules/1400_webp/1ad963247507873.69def0d4a76cf.png",
  "https://mir-s3-cdn-cf.behance.net/project_modules/1400_webp/8a3f85247507873.69de888012882.png",
  "https://mir-s3-cdn-cf.behance.net/project_modules/1400_webp/1304c2247507873.69dfa8f315ee8.png",
  "https://mir-s3-cdn-cf.behance.net/project_modules/1400_webp/73636d247507873.69dfa8f313129.png",
  "https://mir-s3-cdn-cf.behance.net/project_modules/1400_webp/9899bd247507873.69dfa8f316605.png",
];

const destDir = "scripts/behance_ref";
if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

async function download() {
  for (let i = 0; i < images.length; i++) {
    const url = images[i];
    const filename = `ref_${i + 1}.png`;
    const targetPath = path.join(destDir, filename);
    console.log(`Downloading ${url} -> ${targetPath}`);
    const res = await fetch(url);
    const buffer = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(targetPath, buffer);
    console.log(`Saved ${filename} (${buffer.length} bytes)`);
  }
}

download();

import fs from "fs";
import path from "path";

// Generate a dotted world map SVG with 1200x540 resolution
// Grid spacing: 14px - Soft blue periwinkle dots matching the Camply reference
const width = 1200;
const height = 540;
const step = 14;

const continents = [
  // North America
  {
    minX: 120,
    maxX: 360,
    minY: 70,
    maxY: 260,
    shape: (x, y) => {
      if (x < 180 && y > 220) return false;
      if (x > 320 && y > 180) return false;
      return true;
    },
  },
  // Central America
  {
    minX: 240,
    maxX: 330,
    minY: 250,
    maxY: 320,
    shape: (x, y) => Math.abs(x - 240 - (y - 250) * 1.1) < 40,
  },
  // South America
  {
    minX: 280,
    maxX: 420,
    minY: 310,
    maxY: 500,
    shape: (x, y) => {
      const relY = (y - 310) / 190;
      const w = 120 * (1 - relY * 0.7);
      return x >= 300 && x <= 300 + w;
    },
  },
  // Europe
  { minX: 520, maxX: 680, minY: 70, maxY: 210, shape: (x, y) => true },
  // Africa
  {
    minX: 510,
    maxX: 690,
    minY: 200,
    maxY: 460,
    shape: (x, y) => {
      if (y < 300) return x >= 510 && x <= 690;
      const relY = (y - 300) / 160;
      const w = 150 * (1 - relY * 0.7);
      return x >= 550 && x <= 550 + w;
    },
  },
  // Asia
  {
    minX: 680,
    maxX: 1040,
    minY: 70,
    maxY: 300,
    shape: (x, y) => {
      if (x > 960 && y < 140) return false;
      if (x < 740 && y > 250) return false;
      return true;
    },
  },
  // India
  {
    minX: 740,
    maxX: 810,
    minY: 240,
    maxY: 330,
    shape: (x, y) => {
      const relY = (y - 240) / 90;
      return x >= 740 + relY * 25 && x <= 810 - relY * 25;
    },
  },
  // Southeast Asia & Indonesia Archipelago
  { minX: 810, maxX: 990, minY: 300, maxY: 390, shape: (x, y) => true },
  // Australia
  {
    minX: 890,
    maxX: 1080,
    minY: 370,
    maxY: 490,
    shape: (x, y) => {
      return x >= 910 && x <= 1060 && y >= 380 && y <= 480;
    },
  },
  // Japan / Korea
  { minX: 980, maxX: 1040, minY: 180, maxY: 260, shape: (x, y) => true },
];

function isLand(x, y) {
  for (const c of continents) {
    if (x >= c.minX && x <= c.maxX && y >= c.minY && y <= c.maxY) {
      if (c.shape(x, y)) return true;
    }
  }
  return false;
}

let dots = [];

for (let y = 30; y < height; y += step) {
  for (let x = 30; x < width; x += step) {
    const land = isLand(x, y);
    if (land) {
      const isIndo = x >= 810 && x <= 990 && y >= 300 && y <= 390;
      dots.push(
        `<circle cx="${x}" cy="${y}" r="${isIndo ? 2.8 : 2.2}" class="${isIndo ? "map-dot-indo" : "map-dot-land"}" />`
      );
    } else {
      if ((x + y) % (step * 2) === 0) {
        dots.push(`<circle cx="${x}" cy="${y}" r="1.1" class="map-dot-ocean" />`);
      }
    }
  }
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" fill="none">
  <style>
    .map-dot-land { fill: #93C5FD; opacity: 0.75; }
    .map-dot-indo { fill: #2563EB; opacity: 0.95; }
    .map-dot-ocean { fill: #DBEAFE; opacity: 0.4; }
    @media (prefers-color-scheme: dark) {
      .map-dot-land { fill: #38BDF8; opacity: 0.45; }
      .map-dot-indo { fill: #60A5FA; opacity: 0.85; }
      .map-dot-ocean { fill: #1E293B; opacity: 0.35; }
    }
  </style>
  <g>
    ${dots.join("\n    ")}
  </g>
</svg>`;

const outDir = "public/images/features";
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "dotted-world-map.svg"), svg, "utf-8");
console.log(`Regenerated dotted-world-map.svg with soft periwinkle-blue dots!`);

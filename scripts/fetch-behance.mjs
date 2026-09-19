import fs from "fs";

async function run() {
  const url = "https://www.behance.net/gallery/247507873/LMS-SaaS-Dashboard-Admin-Experience?tracking_source=search_projects|lms&l=3";
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9"
      }
    });
    console.log("Status:", res.status);
    const html = await res.text();
    fs.writeFileSync("scripts/behance-page.html", html);
    console.log("Written scripts/behance-page.html, size:", html.length);
    
    // Look for images or JSON state
    const matches = html.match(/https:\/\/[^"'\s]+\.(?:png|jpg|jpeg|webp)/gi) || [];
    const unique = [...new Set(matches)];
    console.log("Images found:", unique.length);
    unique.slice(0, 15).forEach(img => console.log(" -", img));
    
    // Check for modules in project
    const moduleMatch = html.match(/mir-s3-cdn-cf\.behance\.net\/project_modules\/[^\"]+/gi);
    if (moduleMatch) {
      console.log("Project modules found:", moduleMatch.length);
      [...new Set(moduleMatch)].forEach(m => console.log(" * module:", m));
    }
  } catch (err) {
    console.error("Error fetching:", err);
  }
}

run();

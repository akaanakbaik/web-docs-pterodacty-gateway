import fs from "node:fs";

const html = fs.readFileSync("dist/index.html", "utf8");
const required = [
  "Pterodactyl Gateway",
  "/icon.svg",
  "/site.webmanifest",
  "pterodacty-gateway.akadev.me"
];
const missing = required.filter((marker) => !html.includes(marker));

if (missing.length > 0) {
  console.error(`Missing build markers: ${missing.join(", ")}`);
  process.exit(1);
}

if (html.includes("v1.0.2") || html.includes("v1.0.1")) {
  console.error("Stale SDK version marker detected in built HTML");
  process.exit(1);
}

console.log("Site smoke OK: production index and metadata markers are present");

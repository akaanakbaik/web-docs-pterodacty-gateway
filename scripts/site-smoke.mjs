import fs from "node:fs";
import path from "node:path";

const html = fs.readFileSync("dist/index.html", "utf8");
const required = [
  "Pterodactyl Gateway",
  "Manual operasional",
  "/icon.svg",
  "/site.webmanifest",
  "pterodacty-gateway.akaa.dev",
  "v1.6.0"
];
const missing = required.filter((marker) => !html.includes(marker));

const assetsDir = "dist/assets";
const assetNames = fs.existsSync(assetsDir) ? fs.readdirSync(assetsDir) : [];
const jsAssets = assetNames.filter((name) => name.endsWith(".js"));
const cssAssets = assetNames.filter((name) => name.endsWith(".css"));
const bundle = jsAssets.map((name) => fs.readFileSync(path.join(assetsDir, name), "utf8")).join("\n");
const styles = cssAssets.map((name) => fs.readFileSync(path.join(assetsDir, name), "utf8")).join("\n");
const interfaceMarkers = ["Manual operasional", "Tanya docs", "Ctrl K", "Pilih pekerjaan, bukan menu.", "Simulasi terminal", "Lewati"];
const missingInterface = interfaceMarkers.filter((marker) => !bundle.includes(marker));
const missingStyle = ["Bricolage Grotesque", "IBM Plex Mono", ".assistant-panel", ".palette-panel", ".runner-cursor", ".ui-dialog-overlay", ".spec-strip"].filter((marker) => !styles.includes(marker));

if (missing.length > 0) {
  console.error(`Missing build markers: ${missing.join(", ")}`);
  process.exit(1);
}

if (jsAssets.length === 0) {
  console.error("No JavaScript assets found in dist/assets");
  process.exit(1);
}

if (missingInterface.length > 0) {
  console.error(`Missing interface markers: ${missingInterface.join(", ")}`);
  process.exit(1);
}

if (missingStyle.length > 0) {
  console.error(`Missing style markers: ${missingStyle.join(", ")}`);
  process.exit(1);
}

if (bundle.includes("v1.0.2") || bundle.includes("v1.0.1")) {
  console.error("Stale SDK version marker detected in built assets");
  process.exit(1);
}

console.log("Site smoke OK: production index, metadata, interface, and style markers are present");

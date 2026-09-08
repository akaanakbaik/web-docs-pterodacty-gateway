import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

function listSourceFiles(directory, prefix = "") {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const relative = path.join(prefix, entry.name);
    if (entry.isDirectory()) {
      if ([".git", "node_modules", "dist", ".vite"].includes(entry.name)) return [];
      return listSourceFiles(path.join(directory, entry.name), relative);
    }
    return relative;
  });
}

let tracked;
try {
  tracked = execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim().split("\n").filter(Boolean);
} catch {
  tracked = listSourceFiles(process.cwd());
}

tracked = tracked
  .filter((file) => /\.(ts|tsx|js|jsx|mjs|css|html|md|json|yaml|yml|txt)$/.test(file))
  .filter((file) => !file.startsWith("dist/") && !file.startsWith("node_modules/"))
  .filter((file) => fs.existsSync(path.resolve(file)));

const lineComment = new RegExp("(^|[^:])" + String.fromCharCode(47, 47));
const blockComment = String.fromCharCode(47, 42);
const htmlComment = String.fromCharCode(60, 33, 45, 45);
const credentialPatterns = [
  /ptla_[A-Za-z0-9]{20,}/,
  /ptlc_[A-Za-z0-9]{20,}/,
  /ghp_[A-Za-z0-9]{20,}/,
  /github_pat_[A-Za-z0-9_]{20,}/
];
const violations = [];
const stripStrings = (line) => line.replace(/("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)/g, "\"\"");

for (const file of tracked) {
  const absolute = path.resolve(file);
  const lines = fs.readFileSync(absolute, "utf8").split("\n");
  lines.forEach((line, index) => {
    const codeOnly = stripStrings(line);
    if (/\.(ts|tsx|js|jsx|mjs|css|html)$/.test(file) && (lineComment.test(codeOnly) || codeOnly.includes(blockComment) || codeOnly.includes(htmlComment))) {
      violations.push(`${file}:${index + 1}: code comment detected`);
    }
    if (credentialPatterns.some((pattern) => pattern.test(line))) {
      violations.push(`${file}:${index + 1}: credential pattern detected`);
    }
  });
}

if (violations.length > 0) {
  console.error(violations.join("\n"));
  process.exit(1);
}

console.log(`Source guard OK: ${tracked.length} tracked code files scanned`);

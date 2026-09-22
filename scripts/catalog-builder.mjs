import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const LINES = ["Honolulu", "Oahu", "Kaala"];
export const FAMILY_ORDER = [
  "red", "orange", "yellow", "green", "teal", "blue", "violet", "pink", "neutral",
];

const __dirname = dirname(fileURLToPath(import.meta.url));

export function readCsv() {
  const csv = readFileSync(resolve(__dirname, "../data/ohuhu.csv"), "utf8");
  return csv
    .split("\n")
    .slice(1)
    .filter((line) => line.trim().length > 0)
    .map((line) => line.split(","));
}

export function hexToHsl(hex) {
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h;
  switch (max) {
    case r: h = (g - b) / d + (g < b ? 6 : 0); break;
    case g: h = (b - r) / d + 2; break;
    default: h = (r - g) / d + 4;
  }
  return { h: h * 60, s, l };
}

export function familyOf(h, s) {
  if (s < 0.12) return "neutral";
  if (h < 15 || h >= 345) return "red";
  if (h < 40) return "orange";
  if (h < 70) return "yellow";
  if (h < 150) return "green";
  if (h < 190) return "teal";
  if (h < 250) return "blue";
  if (h < 290) return "violet";
  return "pink";
}

export function buildMarkers() {
  const markers = [];
  const seen = new Set();

  for (const row of readCsv()) {
    const code = row[0].trim();
    const name = row[1].trim();
    const hex = row[8].trim();

    let id = code;
    if (seen.has(id)) {
      id = `${code}-${name.replace(/\s+/g, "-").toLowerCase()}`;
    }
    seen.add(id);

    const lines = [];
    const oldCodes = {};
    LINES.forEach((line, i) => {
      const oldCode = row[2 + i * 2].trim();
      const oldName = row[3 + i * 2].trim();
      if (oldCode) {
        lines.push(line);
        oldCodes[line] = oldName ? `${oldCode} ${oldName}` : oldCode;
      }
    });

    const { h, s } = hexToHsl(hex);
    markers.push({ id, code, name, hex, family: familyOf(h, s), lines, oldCodes });
  }

  markers.sort((a, b) => {
    const fi = FAMILY_ORDER.indexOf(a.family);
    const fj = FAMILY_ORDER.indexOf(b.family);
    if (fi !== fj) return fi - fj;
    return a.code.localeCompare(b.code, undefined, { numeric: true });
  });

  return markers;
}
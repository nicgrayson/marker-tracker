import { CATALOG, FAMILIES, CATALOG_BY_ID } from "@/lib/catalogData";
import type { CatalogMarker } from "@/lib/types";

export const catalog: CatalogMarker[] = CATALOG;
export const families = FAMILIES;

export const markersById: Map<string, CatalogMarker> = new Map(CATALOG.map((m) => [m.id, m]));

export function getMarker(id: string | undefined): CatalogMarker | undefined {
  return id ? CATALOG_BY_ID[id] : undefined;
}

const ROMAN_NUMERALS: Record<string, string> = {
  "Ⅰ": "i", "Ⅱ": "ii", "Ⅲ": "iii", "Ⅳ": "iv", "Ⅴ": "v",
  "Ⅵ": "vi", "Ⅶ": "vii", "Ⅷ": "viii", "Ⅸ": "ix", "Ⅹ": "x",
  "ⅰ": "i", "ⅱ": "ii", "ⅲ": "iii", "ⅳ": "iv", "ⅴ": "v",
  "ⅵ": "vi", "ⅶ": "vii", "ⅷ": "viii", "ⅸ": "ix", "ⅹ": "x",
};

// Normalize search text so codes like "CGⅡ00" (Unicode Roman-numeral two) are
// found by plain "CGII00", and to ignore case and whitespace.
export function normalizeSearch(s: string): string {
  let out = "";
  for (const ch of s.toLowerCase()) {
    out += ROMAN_NUMERALS[ch] ?? ch;
  }
  return out.replace(/\s+/g, "");
}

export function searchMarkers(query: string): CatalogMarker[] {
  const q = normalizeSearch(query.trim());
  if (!q) return CATALOG;
  return CATALOG.filter((m) => {
    const hay = normalizeSearch(`${m.code} ${m.name} ${Object.values(m.oldCodes).join(" ")}`);
    return hay.includes(q);
  });
}

export function familyLabel(key: string): string {
  return FAMILIES.find((f) => f.key === key)?.label ?? key;
}
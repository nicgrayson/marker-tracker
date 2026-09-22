import { CATALOG, FAMILIES, CATALOG_BY_ID } from "@/lib/catalogData";
import type { CatalogMarker } from "@/lib/types";

export const catalog: CatalogMarker[] = CATALOG;
export const families = FAMILIES;

export const markersById: Map<string, CatalogMarker> = new Map(CATALOG.map((m) => [m.id, m]));

export function getMarker(id: string | undefined): CatalogMarker | undefined {
  return id ? CATALOG_BY_ID[id] : undefined;
}

export function searchMarkers(query: string): CatalogMarker[] {
  const q = query.trim().toLowerCase();
  if (!q) return CATALOG;
  return CATALOG.filter((m) => {
    if (m.code.toLowerCase().includes(q)) return true;
    if (m.name.toLowerCase().includes(q)) return true;
    return Object.values(m.oldCodes).some((old) => old && old.toLowerCase().includes(q));
  });
}

export function familyLabel(key: string): string {
  return FAMILIES.find((f) => f.key === key)?.label ?? key;
}
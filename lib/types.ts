export type Line = "Honolulu" | "Oahu" | "Kaala";

export const LINE_NAMES: Line[] = ["Honolulu", "Oahu", "Kaala"];

export interface CatalogMarker {
  id: string;
  code: string;
  name: string;
  hex: string;
  family: string;
  lines: Line[];
  oldCodes: Partial<Record<Line, string>>;
}

export interface Family {
  key: string;
  label: string;
  hue: number;
}
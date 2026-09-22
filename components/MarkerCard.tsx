"use client";

import type { CatalogMarker, Line } from "@/lib/types";

const LINE_COLORS: Record<Line, string> = {
  Honolulu: "#6d5ae6",
  Oahu: "#0e9f6e",
  Kaala: "#d97706",
};

function textOn(hex: string) {
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 140 ? "#1c1936" : "#ffffff";
}

interface MarkerCardProps {
  marker: CatalogMarker;
  owned: boolean;
  wished: boolean;
  signedIn: boolean;
  onToggleCollection: () => void;
  onToggleWishlist: () => void;
}

export default function MarkerCard({
  marker,
  owned,
  wished,
  signedIn,
  onToggleCollection,
  onToggleWishlist,
}: MarkerCardProps) {
  const over = textOn(marker.hex);

  return (
    <div className={`card${owned ? " is-owned" : ""}${wished ? " is-wished" : ""}`}>
      <div className="swatch" style={{ backgroundColor: `#${marker.hex}`, color: over }}>
        <div className="swatch-code">{marker.code}</div>
        <div className="swatch-name">{marker.name}</div>
        <div className="swatch-hex">#{marker.hex}</div>
      </div>

      <div className="card-body">
        <div className="card-lines">
          {marker.lines.map((line) => (
            <span
              key={line}
              className="line-badge"
              style={{ backgroundColor: LINE_COLORS[line] }}
              title={`Available in ${line}`}
            >
              {line}
            </span>
          ))}
        </div>

        <div className="card-actions">
          <button
            className={`btn btn-action${owned ? " is-active" : ""}`}
            disabled={!signedIn}
            title={signedIn ? undefined : "Sign in to save to your collection"}
            onClick={onToggleCollection}
          >
            {owned ? "✓ Owned" : "Own"}
          </button>
          <button
            className={`btn btn-action${wished ? " is-active wish" : ""}`}
            disabled={!signedIn}
            title={signedIn ? undefined : "Sign in to save to your wishlist"}
            onClick={onToggleWishlist}
          >
            {wished ? "★ Wanted" : "Want"}
          </button>
        </div>
      </div>
    </div>
  );
}
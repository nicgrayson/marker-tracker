"use client";

import { useAuth } from "@/components/AuthProvider";
import { useTrackerData, type Status } from "@/lib/useTrackerData";
import { markersById, catalog } from "@/lib/catalog";
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
  return (r * 299 + g * 587 + b * 114) / 1000 >= 140 ? "#1c1936" : "#ffffff";
}

interface SavedViewProps {
  title: string;
  blurb: string;
  status: Status;
  otherLabel: string;
  emptyMessage: string;
}

export default function SavedView({ title, blurb, status, otherLabel, emptyMessage }: SavedViewProps) {
  const { user, loading } = useAuth();
  const tracker = useTrackerData(user?.uid, markersById);
  const items: CatalogMarker[] = status === "collection" ? tracker.ownedMarkers : tracker.wishedMarkers;
  const count = items.length;
  const percent = user ? Math.round((count / catalog.length) * 1000) / 10 : 0;

  if (loading) {
    return (
      <div className="page">
        <p className="muted">Loading…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="page">
        <h1>{title}</h1>
        <div className="banner">
          This list is private to you. <strong>Sign in with Google</strong> to view and manage your
          {title.toLowerCase()} — your data lives in your own Firestore account and is never public.
        </div>
      </div>
    );
  }

  const move = (marker: CatalogMarker) =>
    tracker.moveTo(marker, status, status === "collection" ? "wishlist" : "collection");
  const remove = (marker: CatalogMarker) => tracker.remove(marker, status);

  return (
    <div className="page">
      <div className="page-head">
        <h1>{title}</h1>
        <p className="muted">
          {blurb} You currently have <strong>{count}</strong> {count === 1 ? "marker" : "markers"}
          {user && ` (${percent}% of the ${catalog.length}-color catalog)`}.
        </p>
      </div>

      {items.length === 0 ? (
        <p className="muted">{emptyMessage}</p>
      ) : (
        <div className="list">
          {items.map((marker) => (
            <div key={marker.id} className="list-row">
              <div className="list-swatch" style={{ backgroundColor: `#${marker.hex}` }}>
                <span className="list-swatch-code" style={{ color: textOn(marker.hex) }}>
                  {marker.code}
                </span>
              </div>
              <div className="list-info">
                <div className="list-name">
                  {marker.name}
                  <span className="list-code muted">#{marker.hex}</span>
                </div>
                <div className="card-lines">
                  {marker.lines.map((line) => (
                    <span
                      key={line}
                      className="line-badge"
                      style={{ backgroundColor: LINE_COLORS[line] }}
                    >
                      {line}
                    </span>
                  ))}
                </div>
              </div>
              <div className="list-actions">
                <button className="btn btn-ghost btn-sm" onClick={() => move(marker)}>
                  Move to {otherLabel}
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => remove(marker)}>
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
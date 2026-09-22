"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import MarkerCard from "@/components/MarkerCard";
import { catalog, families, markersById } from "@/lib/catalog";
import { useTrackerData } from "@/lib/useTrackerData";
import type { Line } from "@/lib/types";

type LineFilter = "all" | Line;

export default function CatalogView() {
  const { user, loading } = useAuth();
  const tracker = useTrackerData(user?.uid, markersById);
  const [query, setQuery] = useState("");
  const [lineFilter, setLineFilter] = useState<LineFilter>("all");
  const [familyFilter, setFamilyFilter] = useState<string>("all");
  const [showOwnedOnly, setShowOwnedOnly] = useState(false);

  const visible = useMemo(() => {
    let results = catalog;
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      results = results.filter((m) => {
        if (m.code.toLowerCase().includes(q)) return true;
        if (m.name.toLowerCase().includes(q)) return true;
        return Object.values(m.oldCodes).some((old) => old && old.toLowerCase().includes(q));
      });
    }
    if (lineFilter !== "all") {
      results = results.filter((m) => m.lines.includes(lineFilter));
    }
    if (familyFilter !== "all") {
      results = results.filter((m) => m.family === familyFilter);
    }
    if (showOwnedOnly) {
      results = results.filter((m) => tracker.ownedIds.has(m.id));
    }
    return results;
  }, [query, lineFilter, familyFilter, showOwnedOnly, tracker.ownedIds]);

  const ownedCount = tracker.ownedIds.size;
  const wishedCount = tracker.wishedIds.size;
  const signedIn = Boolean(user);

  return (
    <div className="page">
      <div className="page-head">
        <h1>Ohuhu Marker Catalog</h1>
        <p className="muted">
          {catalog.length} colors across Honolulu, Oahu and Kaala (2025 unified numbering).
          {signedIn && (
            <>
              {" "}
              You own {ownedCount} and want {wishedCount}.
            </>
          )}
        </p>
      </div>

      {signedIn && (
        <div className="toolbar">
          <input
            className="search"
            type="search"
            placeholder="Search code, name, or old code…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="chips">
            <button
              className={`chip${showOwnedOnly ? " is-active" : ""}`}
              onClick={() => setShowOwnedOnly((v) => !v)}
            >
              Owned only
            </button>
          </div>
        </div>
      )}

      {!signedIn && !loading && (
        <div className="banner">
          You are browsing the catalog.{" "}
          <strong>Sign in with Google</strong> to start tracking your own collection and wishlist
          (each account is kept private).
        </div>
      )}

      <div className="filter-group">
        <div className="filter-row">
          <span className="filter-label">Line</span>
          <div className="chips">
            {(["all", "Honolulu", "Oahu", "Kaala"] as const).map((line) => (
              <button
                key={line}
                className={`chip${lineFilter === line ? " is-active" : ""}`}
                onClick={() => setLineFilter(line)}
              >
                {line === "all" ? "All lines" : line}
              </button>
            ))}
          </div>
        </div>
        <div className="filter-row">
          <span className="filter-label">Family</span>
          <div className="chips">
            <button
              className={`chip${familyFilter === "all" ? " is-active" : ""}`}
              onClick={() => setFamilyFilter("all")}
            >
              All
            </button>
            {families.map((family) => (
              <button
                key={family.key}
                className={`chip${familyFilter === family.key ? " is-active" : ""}`}
                onClick={() => setFamilyFilter(family.key)}
              >
                <span
                  className="chip-dot"
                  style={{
                    backgroundColor: `hsl(${family.hue} 70% 45%)`,
                  }}
                />
                {family.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {showOwnedOnly ? (
        <p>
          You own <strong>{visible.length}</strong> of {catalog.length} colors (
          {Math.round((visible.length / catalog.length) * 100) || 0}%).
        </p>
      ) : (
        <p className="muted">
          Showing {visible.length} markers
          {lineFilter !== "all" && ` in ${lineFilter}`}
          {familyFilter !== "all" && ` · ${familyFilter}`}
        </p>
      )}

      <div className="grid">
        {visible.map((marker) => (
          <MarkerCard
            key={marker.id}
            marker={marker}
            owned={tracker.ownedIds.has(marker.id)}
            wished={tracker.wishedIds.has(marker.id)}
            signedIn={signedIn}
            onToggleCollection={() => tracker.toggleCollection(marker)}
            onToggleWishlist={() => tracker.toggleWishlist(marker)}
          />
        ))}
      </div>

      {visible.length === 0 && <p className="muted">No markers match the current filters.</p>}
    </div>
  );
}
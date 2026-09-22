"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { collection, deleteDoc, doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { getDb, isFirebaseConfigured } from "@/lib/firebase";
import type { CatalogMarker } from "@/lib/types";

export type Status = "collection" | "wishlist";

export interface TrackerData {
  ownedIds: Set<string>;
  wishedIds: Set<string>;
  ready: boolean;
  ownedMarkers: CatalogMarker[];
  wishedMarkers: CatalogMarker[];
  toggleCollection: (m: CatalogMarker) => Promise<void>;
  toggleWishlist: (m: CatalogMarker) => Promise<void>;
  moveTo: (m: CatalogMarker, from: Status, to: Status) => Promise<void>;
  remove: (m: CatalogMarker, from: Status) => Promise<void>;
}

export function useTrackerData(uid: string | undefined, markersById: Map<string, CatalogMarker>): TrackerData {
  const [ownedIds, setOwnedIds] = useState<Set<string>>(new Set());
  const [wishedIds, setWishedIds] = useState<Set<string>>(new Set());
  const [loadedSubs, setLoadedSubs] = useState(0);

  useEffect(() => {
    if (!uid || !isFirebaseConfigured) {
      setOwnedIds(new Set());
      setWishedIds(new Set());
      setLoadedSubs(0);
      return;
    }
    const db = getDb();
    const unsubscribers: (() => void)[] = [];
    let subsLoaded = 0;

    const subs: { name: Status; setIds: (ids: Set<string>) => void }[] = [
      { name: "collection", setIds: setOwnedIds },
      { name: "wishlist", setIds: setWishedIds },
    ];

    for (const sub of subs) {
      const ref = collection(db, "users", uid, sub.name);
      const unsub = onSnapshot(
        ref,
        (snapshot) => {
          if (snapshot.metadata.hasPendingWrites) return;
          const ids = new Set<string>();
          snapshot.forEach((d) => ids.add(d.id));
          sub.setIds(ids);
          subsLoaded += 1;
          setLoadedSubs(subsLoaded);
        },
        () => {
          subsLoaded += 1;
          setLoadedSubs(subsLoaded);
        },
      );
      unsubscribers.push(unsub);
    }
    return () => unsubscribers.forEach((u) => u());
  }, [uid]);

  const write = useCallback(
    async (sub: Status, markerId: string, remove: boolean) => {
      if (!uid || !isFirebaseConfigured) return;
      const db = getDb();
      const ref = doc(db, "users", uid, sub, markerId);
      if (remove) {
        await deleteDoc(ref);
      } else {
        await setDoc(ref, { markerId, addedAt: serverTimestamp() });
      }
    },
    [uid],
  );

  const toggleCollection = useCallback(
    async (m: CatalogMarker) => {
      await write("collection", m.id, ownedIds.has(m.id));
    },
    [write, ownedIds],
  );

  const toggleWishlist = useCallback(
    async (m: CatalogMarker) => {
      await write("wishlist", m.id, wishedIds.has(m.id));
    },
    [write, wishedIds],
  );

  const moveTo = useCallback(
    async (m: CatalogMarker, from: Status, to: Status) => {
      await write(from, m.id, true);
      await write(to, m.id, false);
    },
    [write],
  );

  const remove = useCallback(
    async (m: CatalogMarker, from: Status) => {
      await write(from, m.id, true);
    },
    [write],
  );

  const ownedMarkers = useMemo(
    () => Array.from(ownedIds).map((id) => markersById.get(id)).filter((m): m is CatalogMarker => Boolean(m)),
    [ownedIds, markersById],
  );
  const wishedMarkers = useMemo(
    () => Array.from(wishedIds).map((id) => markersById.get(id)).filter((m): m is CatalogMarker => Boolean(m)),
    [wishedIds, markersById],
  );

  return {
    ownedIds,
    wishedIds,
    ready: !uid || loadedSubs === 2,
    ownedMarkers,
    wishedMarkers,
    toggleCollection,
    toggleWishlist,
    moveTo,
    remove,
  };
}
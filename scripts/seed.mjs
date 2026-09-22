// Optional: push the marker catalog into your Firestore database so the data
// lives in Firebase (public read-only) instead of only in the app bundle.
//
// Requires:
//   - A Firebase service account JSON (Project settings > Service accounts > Generate new private key)
//   - GOOGLE_APPLICATION_CREDENTIALS=/path/to/serviceAccountKey.json
//
// Usage:
//   node scripts/seed.mjs
//
// Firestore security rules already allow anyone to read /markers; writes are
// only possible from the Admin SDK, which bypasses rules entirely.

import { cert, initializeApp, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { buildMarkers } from "./catalog-builder.mjs";

if (getApps().length === 0) {
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.error("Missing GOOGLE_APPLICATION_CREDENTIALS (path to service account JSON).");
    process.exit(1);
  }
  initializeApp({ credential: cert(process.env.GOOGLE_APPLICATION_CREDENTIALS) });
}

const db = getFirestore();
const markers = buildMarkers();

const BATCH_SIZE = 400;

for (let start = 0; start < markers.length; start += BATCH_SIZE) {
  const chunk = markers.slice(start, start + BATCH_SIZE);
  const batch = db.batch();
  for (const marker of chunk) {
    batch.set(db.collection("markers").doc(marker.id), {
      code: marker.code,
      name: marker.name,
      hex: marker.hex,
      family: marker.family,
      lines: marker.lines,
      oldCodes: marker.oldCodes,
    });
  }
  await batch.commit();
  console.log(`Seeded ${start + chunk.length}/${markers.length}`);
}

console.log("Done. Catalog is now available in Firestore under /markers.");
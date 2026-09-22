# Ohuhu Marker Tracker

Track your Ohuhu alcohol-marker collection and wishlist against the full
Honolulu / Oahu / Kaala color catalog. Sign in with Google — every account's
collection is **private** and stored in its own Firestore space.

Built with **Next.js 15** (fully static export for GitHub Pages) + **Firebase**
(Auth + Firestore). 100% free to run.

## Features

- **Catalog** — every Ohuhu color (495 entries, 2025 unified numbering), filterable
  by marker line (Honolulu / Oahu / Kaala), color family, and searchable by new
  code, name, or old code.
- **My Collection** — the colors you own, with counts and % of catalog.
- **Want to Buy** — a manual wishlist, independent of the collection.
- **Private per user** — data lives under `users/{uid}` with Firestore security
  rules that only allow the owner to read/write it.
- **Free hosting** — static export deployed to GitHub Pages via Actions.

## Tech stack

| Piece       | Choice                                         |
| ----------- | ---------------------------------------------- |
| App         | Next.js 15 (App Router, `output: "export"`)    |
| Auth        | Firebase Authentication — Google provider      |
| Database    | Cloud Firestore (free tier)                    |
| Hosting     | GitHub Pages (repo home via GitHub Actions)    |
| Catalog data| Vendored `data/ohuhu.csv` → `lib/catalogData.ts` |

## Data model (Firestore)

```
/markers/{code}            Public catalog (optional to seed; read-only in the app)
/users/{uid}               Profile doc (displayName, email, photoURL, timestamps)
/users/{uid}/collection/{markerId}    A marker you own   — { markerId, addedAt }
/users/{uid}/wishlist/{markerId}      A marker you want  — { markerId, addedAt }
```

Security rules (`firestore.rules`) enforce:
- `/markers` readable by everyone, writable only via the Admin SDK (seed script).
- `/users/{uid}/**` readable/writable **only** by that signed-in user.

## Local development

### 1. Create a Firebase project

1. Go to <https://console.firebase.google.com> → **Add project**.
2. **Build → Authentication → Get started → Sign-in method → Google** → enable it.
   - In **Authorized domains**, add `localhost` (usually pre-added).
   - Later, add `<you>.github.io` so GitHub Pages can sign in.
3. **Build → Firestore Database → Create database** (start in *production mode*,
   any region — e.g. `us-central`).
4. Copy the web app config: **Project settings → Your apps → Web app** →
   copy the `firebaseConfig` values.

### 2. Configure the app

```bash
cp .env.local.example .env.local
# fill in the six NEXT_PUBLIC_FIREBASE_* values
npm install
npm run dev
```

Open <http://localhost:3000>.

### 3. Deploy the security rules (required)

```bash
npm i -g firebase-tools
firebase login
firebase deploy --only firestore:rules
```

### 4. (Optional) Seed the catalog into Firestore

The catalog ships in the app bundle, so this is not required. But if you want
the marker data stored in your database too:

1. Firebase console → **Project settings → Service accounts → Generate new private key**.
2. `export GOOGLE_APPLICATION_CREDENTIALS=/path/to/serviceAccountKey.json`
3. `node scripts/seed.mjs`

## Deploying to GitHub Pages

1. Create a repo (e.g. `marker-tracker`) and push this project to `main`.
2. Repo **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Repo **Settings → Secrets and variables → Actions → Variables** and add the
   six `NEXT_PUBLIC_FIREBASE_*` values from your `firebaseConfig`.
4. Back in Firebase console → Authentication → **Authorized domains** →
   add `<you>.github.io`.
5. Push any commit (or run the **Deploy to GitHub Pages** workflow manually).
   Your site will be live at `https://<you>.github.io/marker-tracker/`.

The workflow in `.github/workflows/deploy.yml` builds `npm run build` (which
writes the static export to `out/`) and publishes it. The page base path is
derived automatically from the repo name.

## Maintaining the catalog

The catalog is generated from `data/ohuhu.csv`:

```bash
node scripts/build-catalog.mjs   # regenerates lib/catalogData.ts
npm run typecheck
```

Update the CSV (add/rename colors, fix hex values) and regenerate. To keep the
bundle lean, only the 2025 unified catalog is shipped; old codes are preserved
per marker so you can still search for your old markers.

> Note: hex values are approximate swatch reproductions (from the community-maintained
> [Ohuhu Palette Generator](https://github.com/MysticSparkleWings/OhuhuPaletteGenerator)
> dataset by MysticSparkleWings). Verify against real swatches if exact color
> accuracy matters to you.

## Project structure

```
app/            Next.js pages (catalog, collection, wishlist) + layout + styles
components/     AuthProvider, NavBar, MarkerCard, CatalogView, SavedView
lib/            firebase client, types, catalog helpers, tracker data hook
data/           ohuhu.csv (source catalog)
scripts/        catalog generation + optional Firestore seeding
```

## Notes & caveats

- This isn't affiliated with Ohuhu.
- Ohuhu renumbered everything in 2025. This app uses the **new** unified codes
  as the canonical marker identity and keeps old codes for search.
- A color may exist in more than one line (e.g. Honolulu + Oahu). It appears as
  a single catalog entry with badges for which lines carry it.
import type { Metadata } from "next";
import SavedView from "@/components/SavedView";

export const metadata: Metadata = {
  title: "Ohuhu Marker Tracker — My Collection",
};

export default function CollectionPage() {
  return (
    <SavedView
      title="My Collection"
      blurb="Markers you own."
      status="collection"
      otherLabel="Want to Buy"
      emptyMessage="Nothing here yet. Browse the catalog and hit “Own” on any color you have."
    />
  );
}
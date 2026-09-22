import type { Metadata } from "next";
import SavedView from "@/components/SavedView";

export const metadata: Metadata = {
  title: "Ohuhu Marker Tracker — Want to Buy",
};

export default function WishlistPage() {
  return (
    <SavedView
      title="Want to Buy"
      blurb="Colors you plan to pick up."
      status="wishlist"
      otherLabel="My Collection"
      emptyMessage="Your wishlist is empty. Browse the catalog and hit “Want” on any color you plan to buy."
    />
  );
}
import type { Metadata } from "next";
import CatalogView from "@/components/CatalogView";

export const metadata: Metadata = {
  title: "Ohuhu Marker Tracker — Catalog",
};

export default function HomePage() {
  return <CatalogView />;
}
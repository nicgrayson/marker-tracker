"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

const TABS = [
  { href: "/catalog", label: "Catalog" },
  { href: "/collection", label: "My Collection" },
  { href: "/wishlist", label: "Want to Buy" },
];

export default function NavBar() {
  const pathname = usePathname() ?? "";
  const { user, loading, firebaseReady, signIn, signOut } = useAuth();

  return (
    <header className="nav">
      <div className="nav-inner">
        <Link href="/catalog" className="brand">
          <span className="brand-mark" aria-hidden="true" />
          Marker Tracker
        </Link>

        <nav className="tabs">
          {TABS.map((tab) => {
            const active =
              tab.href === "/catalog"
                ? pathname === "/" || pathname === "/catalog"
                : pathname === tab.href;
            return (
              <Link key={tab.href} href={tab.href} className={`tab${active ? " is-active" : ""}`}>
                {tab.label}
              </Link>
            );
          })}
        </nav>

        <div className="nav-user">
          {loading ? (
            <span className="muted">Loading…</span>
          ) : !firebaseReady ? (
            <span className="muted" title="Add Firebase env vars — see README">
              Firebase not configured
            </span>
          ) : user ? (
            <div className="user-chip">
              {user.photoURL ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.photoURL} alt="" width={26} height={26} className="avatar" />
              ) : (
                <span className="avatar avatar-fallback">{user.displayName?.[0] ?? "?"}</span>
              )}
              <span className="user-name">{user.displayName ?? user.email}</span>
              <button className="btn btn-ghost btn-sm" onClick={signOut}>
                Sign out
              </button>
            </div>
          ) : (
            <button className="btn btn-primary btn-sm" onClick={signIn}>
              Sign in with Google
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
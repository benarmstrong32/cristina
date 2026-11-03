import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = { title: "Campaign Tracker", description: "Meta campaign performance across all accounts" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="top">
          <Link href="/" className="brand">Campaign Tracker</Link>
          <nav>
            <Link href="/">Portfolio</Link>
            <Link href="/settings">Accounts &amp; sync</Link>
          </nav>
        </header>
        <div className="wrap">{children}</div>
      </body>
    </html>
  );
}

import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ad Results Dashboard",
  description: "Meta ad spend, leads, intro calls and ROAS.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

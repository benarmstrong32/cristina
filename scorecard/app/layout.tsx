import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "9miles Growth Scorecard",
  description: "Meta ad spend, ROAS, intros and Cristina's bonus for 9miles Media.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

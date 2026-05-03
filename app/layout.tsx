import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PasteShare",
  description: "Quickly share text with anyone via a link.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

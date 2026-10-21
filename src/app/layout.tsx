import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WineGrid | The Master Sommelier 3x3 Wine Matrix Game",
  description:
    "GeoGrid-style daily and unlimited 3x3 wine trivia matrix. Match Appellations, Noble Grape Varieties, and Iconic Estates across Terroir, Soil, Climate, Vinification, and Classification clues.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen bg-cellar-950 text-zinc-100">
        {children}
      </body>
    </html>
  );
}

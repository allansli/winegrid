import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Outfit } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["400", "500", "600", "700"],
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "WineGrid — The Daily Wine Matrix Game",
  description:
    "GeoGrid-style daily and unlimited 3x3 wine matrix. Match Appellations, Grape Varieties, and Iconic Estates across Terroir, Soil, Climate, and Style.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${jakarta.variable} ${outfit.variable}`}>
      <body className="font-sans antialiased min-h-screen bg-[#F8FAFC] text-slate-900">
        {children}
      </body>
    </html>
  );
}

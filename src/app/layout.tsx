import type { Metadata, Viewport } from "next";
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

const SITE_URL = "https://winegrid.vercel.app";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "WineGrid | The Daily Sommelier Matrix",
  description:
    "Test your wine knowledge on the daily 3x3 sommelier matrix. Match Appellations, Grape Varieties, and Iconic Estates across Terroir, Soil, Climate, and Classification.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    type: "website",
    siteName: "WineGrid",
    title: "WineGrid | The Daily Sommelier Matrix",
    description:
      "Can you solve today's 3x3 Wine Matrix? Match Regions, Grapes & Iconic Producers across Terroir, Soil, and Classification.",
    images: [
      {
        url: `${SITE_URL}/og-hero-v3.jpg`,
        width: 1200,
        height: 630,
        type: "image/jpeg",
        alt: "WineGrid - The Daily Sommelier Matrix Game",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "WineGrid | The Daily Sommelier Matrix",
    description:
      "Can you solve today's 3x3 Wine Matrix? Match Regions, Grapes & Iconic Producers across Terroir, Soil, and Classification.",
    images: [`${SITE_URL}/og-hero-v3.jpg`],
  },
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

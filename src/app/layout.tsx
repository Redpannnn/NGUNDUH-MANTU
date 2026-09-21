import type { Metadata, Viewport } from "next";
import {
  Playfair_Display,
  Cormorant_Garamond,
  Cinzel,
  Great_Vibes,
} from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const greatVibes = Great_Vibes({
  variable: "--font-great-vibes",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Meilany & Fadhil — The Wedding",
  description: "Undangan pernikahan digital Meilany & Fadhil. Dengan memohon rahmat Allah SWT, kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri resepsi pernikahan kami.",
  keywords: ["undangan digital", "wedding invitation", "Meilany", "Fadhil", "pernikahan"],
  authors: [{ name: "Meilany & Fadhil" }],
  openGraph: {
    title: "Meilany & Fadhil — The Wedding",
    description: "Minggu, 06 Desember 2026 — Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan do'a restu kepada kami.",
    type: "website",
    images: [
      {
        url: "https://imglinkv-3.vercel.app/api/images/cmtve6ge9aswqzkci/file",
        width: 1200,
        height: 1200,
        alt: "Meilany & Fadhil — The Wedding",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Meilany & Fadhil — The Wedding",
    description: "Minggu, 06 Desember 2026 — Undangan pernikahan Meilany & Fadhil",
    images: ["https://imglinkv-3.vercel.app/api/images/cmtve6ge9aswqzkci/file"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${playfair.variable} ${cormorant.variable} ${cinzel.variable} ${greatVibes.variable} antialiased bg-white text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}

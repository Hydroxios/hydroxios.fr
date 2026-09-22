import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "./components/Navbar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://hydroxios.fr"),
  title: {
    default: "Hydroxios — Créateur, développeur & streamer",
    template: "%s · Hydroxios",
  },
  description: "L’univers d’Hydroxios : streams Twitch, créations Minecraft, bots Discord et projets de développement.",
  keywords: ["Hydroxios", "Twitch", "Minecraft", "Discord", "développement"],
  authors: [{ name: "Hydroxios", url: "https://hydroxios.fr" }],
  creator: "Hydroxios",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://hydroxios.fr",
    siteName: "Hydroxios",
    title: "Hydroxios — Créateur, développeur & streamer",
    description: "Streams Twitch, créations Minecraft, bots Discord et projets de développement.",
  },
  twitter: {
    card: "summary",
    title: "Hydroxios — Créateur, développeur & streamer",
    description: "Streams Twitch, créations Minecraft, bots Discord et projets de développement.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col pt-[76px]">
        <Navbar />
        {children}
      </body>
    </html>
  );
}

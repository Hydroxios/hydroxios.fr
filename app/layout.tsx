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
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full scroll-smooth antialiased [scrollbar-width:thin] [scrollbar-color:#737373_#171717] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-neutral-900 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-neutral-500 [&::-webkit-scrollbar-thumb:hover]:bg-neutral-400 motion-reduce:scroll-auto motion-reduce:[&_*]:scroll-auto motion-reduce:[&_*]:animate-none motion-reduce:[&_*]:transition-none motion-reduce:[&_*::before]:animate-none motion-reduce:[&_*::after]:animate-none motion-reduce:[&_*::before]:transition-none motion-reduce:[&_*::after]:transition-none`}
    >
      <body className="flex min-h-full flex-col bg-background pt-[76px] font-sans text-foreground">
        <Navbar />
        {children}
      </body>
    </html>
  );
}

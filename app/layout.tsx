import type { Metadata } from "next";
import { Allura, Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import CursorWrapper from "./components/CursorWrapper"; 
import Header from "./components/Header";
import "./globals.css";

// 1. Define the fonts (These were missing or unreachable)
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const allura = Allura({
  variable: "--font-allura",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'TEDxTIST Edition 2',
  description: 'Clarity in Chaos - Join us on March 18th, 2026.',
  openGraph: {
    title: 'TEDxTIST Edition 2',
    description: 'Clarity in Chaos - Join us on March 18th, 2026.',
    images: [
      {
        url: 'https://tedxtist.in/banner.png',
        width: 1200,
        height: 630,
        alt: 'TEDxTIST Edition 2 Banner',
      },
    ],
  },
  icons: {
    icon: "/logo-white-512.webp",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth dark" data-theme="dark">
      <head>
        <link rel="preconnect" href="https://tedxtist.in" />
      </head>
      {/* 2. Variables are now correctly defined and accessible here */}
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${allura.variable} antialiased relative dark bg-black`}
      >
        {/* Defer Font Awesome CSS for non-blocking load using Next.js Script */}
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/js/all.min.js"
          strategy="lazyOnload"
        />
        <CursorWrapper />
        <Header />
        <main className="relative z-10">
          {children}
        </main>
      </body>
    </html>
  );
}
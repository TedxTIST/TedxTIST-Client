import type { Metadata } from "next";
import { Allura, Geist, Geist_Mono } from "next/font/google";
import ConditionalFluidCursorBackground from "./components/ConditionalFluidCursorBackground";
import Image from "next/image";
import Header from "./components/Header";
import "./globals.css";
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
        url: 'https://tedxtist.in/banner.jpg', // Absolute URL is required
        width: 1200,
        height: 630,
        alt: 'TEDxTIST Edition 2 Banner',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth dark" data-theme="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${allura.variable} antialiased relative dark bg-black`}
      >
        <ConditionalFluidCursorBackground />
        <Header />
        {/* ThemeToggle removed to enforce dark mode */}
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}

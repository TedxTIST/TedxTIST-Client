import type { Metadata } from "next";
import { Allura, Geist, Geist_Mono } from "next/font/google";
import FluidCursorBackground from "./components/FluidCursorBackground";
import Header from "./components/Header";
import ThemeToggle from "./components/ThemeToggle";
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
  title: "TedxTIST",
  description: "TedxTIST Edition 2",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${allura.variable} antialiased relative`}
      >
        <FluidCursorBackground />
        <Header />
        <ThemeToggle />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}

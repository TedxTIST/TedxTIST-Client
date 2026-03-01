"use client";

import Image from "next/image";
import Button from "./Button";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Speakers", href: "#speakers" },
  { label: "About", href: "#about" },
  { label: "Gallery", href: "#gallery" },
  { label: "Contact", href: "#contact" },
];

export default function Header() {
  return (
    <header className="fixed top-0 left-0 z-50 w-full backdrop-blur-md bg-black/20 border-b border-white/5">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        {/* Logo */}
        <a href="#home" className="flex items-center gap-2">
          <Image
            src="/logo-white 4.png"
            alt="TEDxTIST Logo"
            width={160}
            height={40}
            priority
          />
        </a>

        {/* Navigation */}
        <nav className="hidden items-center gap-3 md:flex">
          {navLinks.map((link) => (
            <Button
              key={link.href}
              onClick={() => {
                document
                  .querySelector(link.href)
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              {link.label}
            </Button>
          ))}
        </nav>

        {/* Mobile menu button (placeholder for future implementation) */}
        <button
          className="flex flex-col gap-1.5 md:hidden"
          aria-label="Open menu"
        >
          <span className="block h-0.5 w-6 bg-white" />
          <span className="block h-0.5 w-6 bg-white" />
          <span className="block h-0.5 w-6 bg-white" />
        </button>
      </div>
    </header>
  );
}

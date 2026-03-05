"use client";

import Image from "next/image";
import { useState } from "react";
import Button from "./Button";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Speakers", href: "#speakers" },
  { label: "Tickets", href: "#tickets" },
  { label: "Sponsors", href: "#sponsors" },
  { label: "Us", href: "#us" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 z-50 w-full ">
      {/*<header className="fixed top-0 left-0 z-50 w-full backdrop-blur-md bg-black/20 border-b border-white/5" */}
      <div className="mx-auto flex max-w-8xl items-center justify-between px-6 py-3">
        {/* Logo */}
        <a href="#home" className="flex items-center gap-10">
          <Image
            src="/logo-white 4.png"
            alt="TEDxTIST Logo"
            width={250}
            height={80}
            priority
          />
        </a>

        {/* Navigation — Desktop */}
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

        {/* Mobile menu button */}
        <button
          className="flex flex-col gap-1.5 md:hidden"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          <span
            className={`block h-0.5 w-6 bg-white transition-transform duration-300 ${
              menuOpen ? "translate-y-2 rotate-45" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-6 bg-white transition-opacity duration-300 ${
              menuOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-6 bg-white transition-transform duration-300 ${
              menuOpen ? "-translate-y-2 -rotate-45" : ""
            }`}
          />
        </button>
      </div>

      {/* Mobile Navigation Drawer */}
      <nav
        className={`flex flex-col items-center gap-2 overflow-hidden bg-black/90 backdrop-blur-md transition-all duration-300 md:hidden ${
          menuOpen ? "max-h-screen py-4" : "max-h-0"
        }`}
      >
        {navLinks.map((link) => (
          <Button
            key={link.href}
            className="w-4/5 text-center"
            onClick={() => {
              setMenuOpen(false);
              document
                .querySelector(link.href)
                ?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            {link.label}
          </Button>
        ))}
      </nav>
    </header>
  );
}

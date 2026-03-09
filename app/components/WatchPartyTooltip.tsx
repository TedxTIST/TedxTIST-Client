"use client";

import { useState, useRef } from "react";

export default function WatchPartyTooltip() {
  const [show, setShow] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => setShow(true), 1000);
  };
  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setShow(false);
  };

  return (
    <span
      className="relative inline-block text-[clamp(0.875rem,1vw,1rem)] text-white/70 cursor-pointer"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      tabIndex={0}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
    >
      Join the watch party ?
      {show && (
        <span className="absolute left-0 right-0 mx-auto top-full z-20 mt-2 w-fit min-w-[220px] max-w-[90vw] rounded-lg bg-zinc-900/95 px-4 py-2 text-sm text-white shadow-xl border border-zinc-700 transition-opacity duration-200 animate-fade-in overflow-x-auto">
          Watch party lets you enjoy the event with friends in a group viewing setup, on campus without any extra amenities provided. Just show up at the venue and find your friends to enjoy the event together!
        </span>
      )}
    </span>
  );
}
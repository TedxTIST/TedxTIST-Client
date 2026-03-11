"use client";

import Image from "next/image";
import { useState } from "react";

export default function TeamMemberImage({ src, name, priority = false, sizes = "(max-width: 768px) 75vw, 312px" }: { src: string; name: string; priority?: boolean; sizes?: string }) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="relative h-full w-full overflow-hidden bg-red-950/20">
      {/* 1. The Placeholder (Blurred) */}
      {!isLoaded && (
        <div className="absolute inset-0 z-0 animate-pulse bg-red-900/10 backdrop-blur-xl" />
      )}
      {/* 2. The High-Res Image */}
      <Image
        src={src}
        alt={name}
        fill
        // Highly specific sizes for responsive images
        sizes="(max-width: 768px) 300px, 450px"
        className={`object-cover object-center grayscale transition-all duration-700 ease-in-out ${isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105"}`}
        onLoad={() => setIsLoaded(true)}
        decoding="async"
        priority={priority}
        draggable={false}
      />
    </div>
  );
}

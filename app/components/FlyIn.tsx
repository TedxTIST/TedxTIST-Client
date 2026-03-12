"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface FlyInProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export default function FlyIn({ children, delay = 0, className = "" }: FlyInProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const timeout = setTimeout(() => {
      el.classList.add("fly-in-visible");
    }, delay);
    return () => clearTimeout(timeout);
  }, [delay]);

  return (
    <div
      ref={ref}
      className={`fly-in ${className}`}
    >
      {children}
    </div>
  );
}

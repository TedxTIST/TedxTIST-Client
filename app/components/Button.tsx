"use client";

import { useCallback, useRef, useState, type ButtonHTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** "default" buttons turn red on hover/selection; "toggle" buttons keep the dark style */
  variant?: "default" | "toggle";
  /** Whether the button is currently in a selected/active state */
  selected?: boolean;
};

const base =
  "relative overflow-hidden rounded-full px-5 py-2 text-sm font-semibold tracking-wide text-white backdrop-blur transition-shadow duration-300 cursor-pointer border";

const idle =
  "bg-black/80 border-transparent shadow-[0_4px_12px_rgba(220,38,38,0.35)]";

const hovered =
  "shadow-[0_4px_18px_rgba(220,38,38,0.55)]";

const selectedClass =
  "bg-red-700 border-red-500/40 shadow-[0_4px_18px_rgba(220,38,38,0.55)]";

export default function Button({
  className,
  children,
  variant = "default",
  selected = false,
  onMouseMove,
  onMouseEnter,
  onMouseLeave,
  ...props
}: ButtonProps) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      onMouseMove?.(e);
    },
    [onMouseMove]
  );

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      setIsHovered(true);
      onMouseEnter?.(e);
    },
    [onMouseEnter]
  );

  const handleMouseLeave = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      setIsHovered(false);
      onMouseLeave?.(e);
    },
    [onMouseLeave]
  );

  const isSelected = variant === "default" && selected;
  const variantClass = isSelected ? selectedClass : `${idle} ${isHovered ? hovered : ""}`;

  return (
    <button
      ref={btnRef}
      className={twMerge(base, variantClass, className)}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {/* Radial crimson glow that follows the cursor */}
      {isHovered && !isSelected && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-200"
          style={{
            background: `radial-gradient(circle 60px at ${pos.x}px ${pos.y}px, rgba(220,38,38,0.7) 0%, transparent 100%)`,
          }}
        />
      )}
      <span className="relative z-10">{children}</span>
    </button>
  );
}

"use client";


import { useCallback, useRef, useState, type ButtonHTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** "default" buttons turn red on hover/selection; "toggle" buttons keep the dark style */
  variant?: "default" | "toggle";
  /** Whether the button is currently in a selected/active state */
  selected?: boolean;
  /** Border radius variant: 'full', 'md', 'lg', 'xl', etc. */
  radius?: 'full' | 'md' | 'lg' | 'xl';
};


const RADIUS_CLASSES: Record<string, string> = {
  full: 'rounded-full',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
};

const base =
  "relative overflow-hidden px-5 py-2 text-sm font-semibold tracking-wide text-white backdrop-blur transition-colors duration-300 cursor-pointer";

const idle = "bg-gradient-to-r from-gray-700 to-black";
const hovered = "";
const selectedClass = "bg-gradient-to-r from-gray-700 to-black";
export default function Button({
  className,
  children,
  variant = "default",
  selected = false,
  radius = "full",
  onMouseMove,
  onMouseEnter,
  onMouseLeave,
  ...props
}: ButtonProps) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  // Use CSS variable for glow position
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      // Batch DOM read
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setPos({ x, y });
      // Batch DOM write in rAF
      if (btnRef.current) {
        requestAnimationFrame(() => {
          btnRef.current?.style.setProperty('--glow-x', `${x}px`);
          btnRef.current?.style.setProperty('--glow-y', `${y}px`);
        });
      }
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
  const radiusClass = RADIUS_CLASSES[radius] || RADIUS_CLASSES.full;

  return (
    <button
      ref={btnRef}
      className={twMerge(base, variantClass, radiusClass, className)}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {/* Gradient border (ted red → yellow) — only visible on hover */}
      <span
        aria-hidden
        className={twMerge(
          "pointer-events-none absolute inset-0 z-0 rounded-[inherit] transition-opacity duration-300",
          isHovered ? "opacity-100" : "opacity-0"
        )}
        style={{
          background: "linear-gradient(to right, #eb0028, #eab933)",
        }}
      />
      {/* Radial crimson glow using CSS variable for position */}
      <span
        aria-hidden
        className={twMerge(
          "pointer-events-none absolute z-0 transition-opacity duration-200 glow-effect",
          isHovered && !isSelected ? "opacity-100" : "opacity-0"
        )}
      />
      <span className="relative z-10">{children}</span>
    </button>
  );
}

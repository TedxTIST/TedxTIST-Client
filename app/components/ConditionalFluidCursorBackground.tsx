"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// Code-split: FluidCursorBackground is only loaded on desktop with WebGL support
const FluidCursorBackground = dynamic(() => import("./FluidCursorBackground"), { ssr: false });

function isWebGLSupported() {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch (e) {
    return false;
  }
}

export default function ConditionalFluidCursorBackground() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    // Only enable on desktop with WebGL support
    const isMobile = typeof window !== "undefined" && window.innerWidth <= 768;
    setEnabled(isWebGLSupported() && !isMobile);
  }, []);

  if (!enabled) return null;
  return <FluidCursorBackground />;
}

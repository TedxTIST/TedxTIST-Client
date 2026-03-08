"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

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
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported(isWebGLSupported());
  }, []);

  if (!supported) return null;
  return <FluidCursorBackground />;
}

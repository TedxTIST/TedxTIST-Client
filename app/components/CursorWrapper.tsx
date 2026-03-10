"use client";

import dynamic from "next/dynamic";

// This is now safe because it's inside a Client Component
const FluidCursor = dynamic(
  () => import("./FluidCursorBackground"),
  { ssr: true }
);

export default function CursorWrapper() {
  return <FluidCursor />;
}
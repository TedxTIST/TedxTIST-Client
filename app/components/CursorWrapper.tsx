"use client";

import dynamic from "next/dynamic";

const FluidCursor = dynamic(
  () => import("./FluidCursorBackground"),
  { ssr: false }
);

export default function CursorWrapper() {
  return <FluidCursor />;
}
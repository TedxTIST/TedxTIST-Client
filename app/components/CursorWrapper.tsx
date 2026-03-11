"use client";

import dynamic from "next/dynamic";

const FluidCursor = dynamic(
  () => import("./FluidCursorBackground"),
  { 
    ssr: false, // Strictly client-side
    loading: () => <div className="fixed inset-0 bg-black -z-20" /> // Prevents layout pop-in
  }
);

export default function CursorWrapper() {
  return <FluidCursor />;
}
"use client";

import { ReactNode } from "react";
import CursorWrapper from "./CursorWrapper";
import Header from "./Header";

export default function RootLayoutClient({ children }: { children: ReactNode }) {
  return (
    <>
      <CursorWrapper />
      <Header />
      <main className="relative z-10">
        {children}
      </main>
    </>
  );
}

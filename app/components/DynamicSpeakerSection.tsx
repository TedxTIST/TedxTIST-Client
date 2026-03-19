"use client";

import dynamic from "next/dynamic";

const SpeakerSection = dynamic(() => import("../pages/SpeakerSection"), {
  ssr: false,
  loading: () => <div className="min-h-screen animate-pulse bg-black/20" />,
});

export default function DynamicSpeakerSection() {
  return <SpeakerSection />;
}

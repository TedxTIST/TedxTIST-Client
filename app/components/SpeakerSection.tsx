"use client";

import { useState, useEffect, useRef } from "react";

function SpeakerImage({ src, alt }: { src: string; alt: string }) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className={`h-full w-full object-cover object-top ${
          hasError ? "invisible" : ""
        }`}
        onError={() => setHasError(true)}
      />
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl">
          <svg
            width="120"
            height="120"
            viewBox="0 0 24 24"
            fill="none"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="1"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
      )}
    </>
  );
}

interface Speaker {
  name: string;
  bio: string;
  image: string;
}

const speakers: Speaker[] = [
  {
    name: "Aron Kollassani Selestin",
    bio: "Aron (Aksomaniac) is a Malayalam R&B artist from Thiruvananthapuram, known for shaping the genre almost single-handedly. A trained Western classical pianist, he pivoted during the pandemic—dropping out of engineering to pursue music full-time from his bedroom studio.",
    image: "/speakers/aksomaniac.png",
  },
  {
    name: "Speaker Two",
    bio: "A visionary entrepreneur who built a multi-million dollar company from scratch. Their journey from a small town to the global stage is a testament to perseverance and innovation in the face of adversity.",
    image: "/speakers/speaker-2.png",
  },
  {
    name: "Speaker Three",
    bio: "An acclaimed researcher in artificial intelligence and ethics, dedicated to ensuring technology serves humanity. Their groundbreaking work bridges the gap between cutting-edge innovation and responsible development.",
    image: "/speakers/speaker-3.png",
  },
  {
    name: "Speaker Four",
    bio: "A celebrated filmmaker and storyteller whose documentaries have shed light on underrepresented communities. Their lens captures the raw beauty and resilience of the human spirit across cultures.",
    image: "/speakers/speaker-4.png",
  },
  {
    name: "Speaker Five",
    bio: "A climate activist and environmental scientist working at the intersection of policy and grassroots action. Their tireless advocacy has influenced landmark legislation and inspired a generation of changemakers.",
    image: "/speakers/speaker-5.png",
  },
  {
    name: "Speaker Six",
    bio: "A neuroscientist exploring the frontiers of human consciousness and mental health. Their research into mindfulness and cognitive resilience has transformed therapeutic approaches worldwide.",
    image: "/speakers/speaker-6.png",
  },
  {
    name: "Speaker Seven",
    bio: "A social entrepreneur revolutionizing education in rural communities through technology. Their innovative platform has brought quality learning to thousands of students who previously had no access.",
    image: "/speakers/speaker-7.png",
  },
  {
    name: "Speaker Eight",
    bio: "An Olympic athlete turned motivational coach who inspires people to push beyond their limits. Their story of overcoming career-threatening injuries is a powerful narrative of grit and determination.",
    image: "/speakers/speaker-8.png",
  },
  {
    name: "Speaker Nine",
    bio: "A pioneering architect designing sustainable cities of the future. Their biomimicry-inspired structures have won international awards and are redefining how we think about urban living.",
    image: "/speakers/speaker-9.png",
  },
  {
    name: "Speaker Ten",
    bio: "A bestselling author and philosopher exploring the meaning of purpose in the modern world. Their books have sparked global conversations about finding clarity amidst the chaos of contemporary life.",
    image: "/speakers/speaker-10.png",
  },
];

export default function SpeakerSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const containerTop = -rect.top;
      const scrollableHeight = container.scrollHeight - window.innerHeight;

      if (scrollableHeight <= 0) return;

      const rawProgress = Math.max(0, Math.min(1, containerTop / scrollableHeight));
      const index = Math.min(
        speakers.length - 1,
        Math.floor(rawProgress * speakers.length)
      );

      setCurrentIndex(index);
      setProgress(rawProgress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const speaker = speakers[currentIndex];

  // Calculate per-speaker progress (0-1) for the active speaker
  const perSpeaker = 1 / speakers.length;
  const speakerLocalProgress =
    (progress - currentIndex * perSpeaker) / perSpeaker;
  // Fade in at start, fade out at end of each speaker's scroll segment
  const fadeZone = 0.15;
  let opacity = 1;
  if (speakerLocalProgress < fadeZone) {
    opacity = speakerLocalProgress / fadeZone;
  } else if (speakerLocalProgress > 1 - fadeZone) {
    opacity = (1 - speakerLocalProgress) / fadeZone;
  }
  // Clamp and ensure first/last are fully visible at boundaries
  if (currentIndex === 0 && progress < perSpeaker * fadeZone) opacity = 1;
  if (currentIndex === speakers.length - 1 && progress > 1 - perSpeaker * fadeZone) opacity = 1;
  opacity = Math.max(0, Math.min(1, opacity));

  return (
    <div
      ref={containerRef}
      id="speakers"
      style={{ height: `${speakers.length * 100}vh` }}
      className="relative"
    >
      {/* Sticky viewport — pins inside the tall scroll container */}
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden px-6 md:px-16 lg:px-24">
        {/* Background glow effects */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute -bottom-32 -right-32 h-[600px] w-[600px] rounded-full opacity-30"
            style={{
              background:
                "radial-gradient(circle, rgba(220, 38, 38, 0.6) 0%, rgba(220, 38, 38, 0.1) 40%, transparent 70%)",
            }}
          />
          <div
            className="absolute -top-20 -left-20 h-[300px] w-[300px] rounded-full opacity-10"
            style={{
              background:
                "radial-gradient(circle, rgba(220, 38, 38, 0.5) 0%, transparent 70%)",
            }}
          />
        </div>

        {/* Microphone illustration accent */}
        <div className="pointer-events-none absolute top-16 right-16 hidden opacity-40 md:block lg:right-32 lg:top-24">
          <svg
            width="120"
            height="140"
            viewBox="0 0 120 140"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="rotate-12"
          >
            <ellipse cx="60" cy="35" rx="22" ry="30" stroke="#dc2626" strokeWidth="2" />
            <line x1="60" y1="65" x2="60" y2="110" stroke="#dc2626" strokeWidth="2" />
            <path d="M40 110 Q60 125 80 110" stroke="#dc2626" strokeWidth="2" fill="none" />
            <path
              d="M60 110 Q55 130 50 135"
              stroke="#dc2626"
              strokeWidth="1.5"
              fill="none"
              strokeDasharray="4 3"
            />
            <line x1="45" y1="22" x2="75" y2="22" stroke="#dc2626" strokeWidth="0.5" opacity="0.5" />
            <line x1="43" y1="30" x2="77" y2="30" stroke="#dc2626" strokeWidth="0.5" opacity="0.5" />
            <line x1="43" y1="38" x2="77" y2="38" stroke="#dc2626" strokeWidth="0.5" opacity="0.5" />
            <line x1="45" y1="46" x2="75" y2="46" stroke="#dc2626" strokeWidth="0.5" opacity="0.5" />
          </svg>
        </div>

        {/* Speaker Content — crossfade based on scroll */}
        <div
          className="relative z-10 flex flex-col gap-8 md:flex-row md:items-center md:gap-16"
          style={{
            opacity,
            transform: `translateY(${(1 - opacity) * 12}px)`,
            transition: "opacity 0.15s ease-out, transform 0.15s ease-out",
          }}
        >
          {/* Left: Name + Bio */}
          <div className="flex flex-col md:w-1/2">
            <h2 className="font-[family-name:var(--font-allura)] text-4xl leading-tight text-red-600 sm:text-5xl lg:text-7xl">
              {speaker.name}
            </h2>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-white/70 sm:text-lg lg:text-xl">
              {speaker.bio}
            </p>
          </div>

          {/* Right: Speaker Image */}
          <div className="relative flex items-center justify-center md:w-1/2">
            <div className="relative h-[350px] w-[300px] sm:h-[450px] sm:w-[380px] lg:h-[550px] lg:w-[450px]">
              <div className="absolute inset-0 overflow-hidden rounded-2xl">
                <SpeakerImage src={speaker.image} alt={speaker.name} />
              </div>
              <div
                className="absolute -bottom-8 left-1/2 -z-10 h-[200px] w-[300px] -translate-x-1/2 rounded-full opacity-40 blur-3xl"
                style={{ background: "rgba(220, 38, 38, 0.5)" }}
              />
            </div>
          </div>
        </div>

        {/* Navigation Indicators */}
        <div className="relative z-10 mt-12 flex items-center justify-between md:mt-16">
          {/* Dot indicators — scroll-driven, no click navigation needed */}
          <div className="flex items-center gap-2">
            {speakers.map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === currentIndex
                    ? "w-8 bg-red-600"
                    : "w-2 bg-white/30"
                }`}
              />
            ))}
          </div>

          {/* Counter */}
          <span className="text-sm tabular-nums text-white/40">
            {String(currentIndex + 1).padStart(2, "0")} /{" "}
            {String(speakers.length).padStart(2, "0")}
          </span>
        </div>

        {/* Scroll hint — only visible on the first speaker */}
        {currentIndex === 0 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-white/30">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}

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
        className={`h-full w-full object-cover object-top grayscale ${
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
    name: "Ajas Mohammed Jansher",
    bio: "Ajas Mohammed is the Founder and CEO of Eduport, a Kerala-based EdTech startup redefining how students in India experience education. He has positioned Eduport at the forefront of personalized, adaptive learning, ensuring education is no longer one-size-fits-all but tailored to each learner's strengths, struggles, and pace.",
    image: "/speakers/ajas.png",
  },
  {
    name: "Anoop Ambika",
    bio: " Anoop Ambika is the CEO of the Kerala Startup Mission (KSUM), the state's nodal agency for entrepreneurship. He is a rare \"Practitioner-Leader\", a bureaucrat who was first a serial entrepreneur (founding companies like Genpro Research) and an engineer with a background in Computational Biology and AI. He took charge during the global \"Funding Winter\" and has successfully steered Kerala's startup ecosystem toward stability and maturity",
    image: "/speakers/anoopambika.png",
  },
  {
    name: "Nasima Nasir",
    bio: "Nasmina Nasir is a social entrepreneur, educator, and community leader reshaping the developmental narrative of Kerala's coastal belt. As the Founder and Director of the iLAB Innovation Laboratory Society, established in 2016, she has built a structured grassroots model to address systemic inequalities affecting fishing communities in Kozhikode.",
    image: "/speakers/nasima.png",
  },
  {
    name: "Vinu Peter",
    bio: "As Director — DBiz India, Vinu leads the company's India operations with a focus on strategy, growth, and delivery excellence. He plays a pivotal role in expanding DBiz.ai's footprint in India - strengthening capabilities, driving business performance, and ensuring alignment with the company's global vision. As Chief of People & Culture, he also leads global talent and culture initiatives that keep DBiz.ai's growth anchored in its people-first values.",
    image: "/speakers/vinupeter.png",
  },
  {
    name: "Zarin Shihab",
    bio: "Born into an Indian Air Force family and raised across cities as diverse as Assam, Karnataka, Tamil Nadu, and Uttar Pradesh, Zarin grew up learning how to adapt to languages, cultures, classrooms, and constant movement. Though her roots trace back to Kerala, Hindi became her primary language of literacy, shaping her identity that was deeply cosmopolitan long before she stepped onto a film set.",
    image: "/speakers/zarin-1.png",
  },
  {
    name: "Arjun Radhakrishnan",
    bio: "Born in Nagercoil to a Tamil-Malayali household and raised in Pune, his identity was never singular. He grew up navigating languages, cultures, and perspectives: Tamil at home, Marathi in the streets, English in classrooms, Malayalam in heritage. This layered upbringing would later become one of his greatest artistic strengths. In a cinematic landscape divided by region and accent, Arjun moves fluidly across geographies, not by imitation, but by lived experience.",
    image: "/speakers/arjun.png",
  },
  {
    name: "Jithin A Shaji",
    bio: "Jithin A. Shaji is a seasoned Planning and Project Controls Manager with over 15 years of experience leading iconic, large-scale infrastructure projects across the UK, UAE, and Bahrain. Currently at Vinci Construction, he specializes in delivering high-stakes techno-commercial excellence for major developments, including the Etihad Rail network.",
    image: "/speakers/jithin.png",
  },
  {
    name: "Mridul George",
    bio: "Born and raised in Muvattupuzha, Kerala, Mridul George followed a path familiar to many, an engineering education, followed by over a decade in the IT industry. Yet alongside spreadsheets, code, and corporate deadlines, another life was taking shape. From school and college days onward, he was a storyteller, writing, anchoring television programs, and learning early what it meant to speak to an audience. This duality would later define his work: creativity tempered by discipline, emotion structured by intent.",
    image: "/speakers/mridul.png",
  },
  {
    name: "Ritwik Aravindakshan",
    bio: "An Associate Professor of Mechanical Engineering at the Toc H Institute of Science and Technology (TIST), Dr. Aravindakshan operates at the intersections where disciplines meet and boundaries dissolve. His research journey moves fluidly from the microscopic surfaces of biomedical implants to the vast, interconnected challenges of megaproject infrastructure, revealing how the same principles of balance, foresight, and responsibility apply at every scale.",
    image: "/speakers/ritwik.png",
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

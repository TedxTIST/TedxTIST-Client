"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";





function SpeakerImage({ src, alt, priority = false }: { src: string; alt: string; priority?: boolean }) {
  // You may want to adjust width/height based on your design
  return (
    <Image
      src={src}
      alt={alt}
      width={400}
      height={400}
      priority={priority}
      className="h-full w-full object-cover object-top grayscale rounded-2xl"
      loading={priority ? "eager" : "lazy"}
    />
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
    image: "/speakers/nasmina.png",
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
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handleScroll = () => {
      const rect = container.getBoundingClientRect();
      const containerTop = -rect.top;
      const scrollableHeight = container.scrollHeight - window.innerHeight;
      if (scrollableHeight <= 0) return;
      const rawProgress = Math.max(0, Math.min(1, containerTop / scrollableHeight));
      container.style.setProperty('--scroll-progress', rawProgress.toString());
      // Calculate index for speaker change
      const index = Math.min(
        speakers.length - 1,
        Math.floor(rawProgress * speakers.length)
      );
      setCurrentIndex(index);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const speaker = speakers[currentIndex];

  // CSS handles opacity/transform via --scroll-progress

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

        {/* Speaker Content — crossfade based on scroll */}
        <div
          className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:gap-16 speaker-fade"
        >
          {/* Top on mobile, Left on desktop: Name + Bio */}
          <div className="order-1 flex flex-col flex-1 min-w-0 md:w-1/2">
            <h2 className="font-[family-name:var(--font-allura)] text-5xl leading-tight text-red-600 sm:text-5xl lg:text-7xl">
              <span style={{ textShadow: '0 0 12px rgba(0, 0, 0, 0.9), 0 0 2px #470f0f' }}>{speaker.name}</span>
            </h2>
            <p className="mt-3 md:mt-6 max-w-lg text-base leading-relaxed text-white/70 sm:text-lg md:text-base lg:text-xl line-clamp-5 md:line-clamp-none">
              {speaker.bio}
            </p>
          </div>

          {/* Bottom on mobile, Right on desktop: Speaker Image */}
          <div className="order-2 relative flex items-center justify-center md:w-1/2">
            <div className="relative h-[300px] w-[240px] sm:h-[360px] sm:w-[290px] md:h-[350px] md:w-[300px] lg:h-[550px] lg:w-[450px]">
              <div className="absolute inset-0 overflow-hidden rounded-2xl">
                <SpeakerImage src={speaker.image} alt={speaker.name} priority={currentIndex === 0} />
              </div>
              <div
                className="absolute -bottom-8 left-1/2 -z-10 h-[200px] w-[300px] -translate-x-1/2 rounded-full opacity-40 blur-3xl"
                style={{ background: "rgba(220, 38, 38, 0.5)" }}
              />
            </div>
          </div>
        </div>

        {/* Navigation Indicators */}
        <div className="relative z-10 mt-4 flex items-center justify-between md:mt-16">
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

"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

function SpeakerImage({ src, alt, priority = false }: { src: string; alt: string; priority?: boolean }) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      unoptimized
      quality={70}
      sizes="(max-width: 768px) 80vw, 40vw"
      className="object-cover object-top grayscale rounded-2xl"
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
    image: "/speakers/aksomaniac.webp",
  },
  {
    name: "Ajas Mohammed Jansher",
    bio: "Ajas Mohammed is the Founder and CEO of Eduport, a Kerala-based EdTech startup redefining how students in India experience education. He has positioned Eduport at the forefront of personalized, adaptive learning, ensuring education is no longer one-size-fits-all but tailored to each learner's strengths, struggles, and pace.",
    image: "/speakers/ajas.webp",
  },
  {
    name: "Anoop Ambika",
    bio: "Anoop Ambika is the CEO of the Kerala Startup Mission (KSUM), the state's nodal agency for entrepreneurship. He is a rare \"Practitioner-Leader\", a bureaucrat who was first a serial entrepreneur (founding companies like Genpro Research) and an engineer with a background in Computational Biology and AI. He took charge during the global \"Funding Winter\" and has successfully steered Kerala's startup ecosystem toward stability and maturity",
    image: "/speakers/anoopambika.webp",
  },
  {
    name: "Nasima Nasir",
    bio: "Nasmina Nasir is a social entrepreneur, educator, and community leader reshaping the developmental narrative of Kerala's coastal belt. As the Founder and Director of the iLAB Innovation Laboratory Society, established in 2016, she has built a structured grassroots model to address systemic inequalities affecting fishing communities in Kozhikode.",
    image: "/speakers/nasmina.webp",
  },
  {
    name: "Vinu Peter",
    bio: "Vinu leads the company's India operations with a focus on strategy, growth, and delivery excellence. He plays a pivotal role in expanding DBiz.ai's footprint in India - strengthening capabilities, driving business performance, and ensuring alignment with the company's global vision. As Chief of People & Culture, he also leads global talent and culture initiatives that keep DBiz.ai's growth anchored in its people-first values.",
    image: "/speakers/vinupeter.webp",
  },
  {
    name: "Arjun Radhakrishnan",
    bio: "Born in Nagercoil to a Tamil-Malayali household and raised in Pune, his identity was never singular. He grew up navigating languages, cultures, and perspectives: Tamil at home, Marathi in the streets, English in classrooms, Malayalam in heritage. This layered upbringing would later become one of his greatest artistic strengths. In a cinematic landscape divided by region and accent, Arjun moves fluidly across geographies, not by imitation, but by lived experience.",
    image: "/speakers/arjun.webp",
  },
  {
    name: "Jithin A Shaji",
    bio: "Jithin A. Shaji is a seasoned Planning and Project Controls Manager with over 15 years of experience leading iconic, large-scale infrastructure projects across the UK, UAE, and Bahrain. Currently at Vinci Construction, he specializes in delivering high-stakes techno-commercial excellence for major developments, including the Etihad Rail network.",
    image: "/speakers/jithin.webp",
  },
  {
    name: "Mridul George",
    bio: "Born and raised in Muvattupuzha, Kerala, Mridul George followed a path familiar to many, an engineering education, followed by over a decade in the IT industry. Yet alongside spreadsheets, code, and corporate deadlines, another life was taking shape. From school and college days onward, he was a storyteller, writing, anchoring television programs, and learning early what it meant to speak to an audience. This duality would later define his work: creativity tempered by discipline, emotion structured by intent.",
    image: "/speakers/mridul.webp",
  },
  {
    name: "Ritwik Aravindakshan",
    bio: "An Associate Professor of Mechanical Engineering at the Toc H Institute of Science and Technology (TIST), Dr. Aravindakshan operates at the intersections where disciplines meet and boundaries dissolve. His research journey moves fluidly from the microscopic surfaces of biomedical implants to the vast, interconnected challenges of megaproject infrastructure, revealing how the same principles of balance, foresight, and responsibility apply at every scale.",
    image: "/speakers/ritwik.webp",
  },
];

export default function SpeakerSection() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTouchDevice, setIsTouchDevice] = useState<boolean | null>(null);

  useEffect(() => {
    const checkTouch = () => {
      const hasTouch = window.matchMedia("(pointer: coarse)").matches || "ontouchstart" in window;
      setIsTouchDevice(hasTouch);
    };
    checkTouch();
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute("data-index"));
            setCurrentIndex(index);
          }
        });
      },
      {
        root: container,
        threshold: 0.6,
      }
    );

    const cards = container.querySelectorAll(".speaker-card");
    cards.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, []);

  const scrollToSpeaker = (index: number) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const card = container.querySelector(`[data-index="${index}"]`);
    if (card) {
      card.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  };

  return (
    <section id="speakers" className="relative py-16 md:py-24 overflow-hidden">
      <style dangerouslySetInnerHTML={{ __html: `.no-scrollbar::-webkit-scrollbar { display: none; }` }} />

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -bottom-32 -right-32 h-[600px] w-[600px] rounded-full opacity-30"
          style={{
            background: "radial-gradient(circle, rgba(220, 38, 38, 0.6) 0%, rgba(220, 38, 38, 0.1) 40%, transparent 70%)",
          }}
        />
        <div
          className="absolute -top-20 -left-20 h-[300px] w-[300px] rounded-full opacity-10"
          style={{
            background: "radial-gradient(circle, rgba(220, 38, 38, 0.5) 0%, transparent 70%)",
          }}
        />
      </div>

      <div
        ref={scrollContainerRef}
        className="flex w-full overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar items-center"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {speakers.map((speaker, idx) => (
          <div
            key={speaker.name}
            data-index={idx}
            className="speaker-card relative z-10 flex w-full shrink-0 snap-center flex-col md:flex-row md:items-center justify-between px-6 md:px-0 pb-8"
          >
            {/* 1. RELATIVE LEFT GUTTER / PREV BUTTON (10% Width) */}
            <div className="hidden md:flex items-center justify-center w-[10%] shrink-0">
              {isTouchDevice === false && idx > 0 && (
                <button
                  onClick={() => scrollToSpeaker(idx - 1)}
                  className="group flex flex-row items-center gap-2 p-2 text-white/50 hover:text-white transition-colors focus:outline-none"
                  aria-label="Previous speaker"
                >
                  <div className="rounded-full bg-white/5 group-hover:bg-white/20 p-2 md:p-3 transition-colors border border-transparent group-hover:border-white/40 backdrop-blur-sm shrink-0">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform rotate-180">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </div>
                  {/* Text only renders on large screens to prevent flex squeezing */}
                  <span className="text-xs tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity hidden lg:block whitespace-nowrap">Prev</span>
                </button>
              )}
            </div>

            {/* 2. RELATIVE TEXT AREA (40% Width) */}
            <div className="flex flex-col justify-center w-full md:w-[40%] px-0 md:px-4 lg:px-8 mt-6 md:mt-0 order-first md:order-none shrink-0">
              <h2 className="tedx-red-glow font-[family-name:var(--font-allura)] text-5xl leading-tight text-red-600 sm:text-5xl lg:text-7xl">
                <span>
                  {speaker.name}
                </span>
              </h2>
              <p className="mt-3 md:mt-6 text-base leading-relaxed text-white/70 sm:text-lg lg:text-xl line-clamp-5 md:line-clamp-none">
                {speaker.bio}
              </p>
            </div>

            {/* 3. RELATIVE IMAGE AREA (40% Width) + Mobile Swipe Hint */}
            <div className="flex flex-row items-center justify-center w-full md:w-[40%] mt-8 md:mt-0 shrink-0 gap-4 lg:gap-8">
              
              {/* Image uses Aspect Ratio scaling instead of fixed pixels */}
              <div className="relative w-full max-w-[260px] sm:max-w-[320px] md:max-w-[350px] lg:max-w-[450px] aspect-[4/5] shrink-0">
                <div className="absolute inset-0 overflow-hidden rounded-2xl shadow-xl">
                  <SpeakerImage src={speaker.image} alt={speaker.name} priority={idx === 0} />
                </div>
                {/* Decorative bottom glow */}
                <div
                  className="absolute -bottom-8 left-1/2 -z-10 h-[50%] w-[80%] -translate-x-1/2 rounded-full opacity-40 blur-3xl"
                  style={{ background: "rgba(220, 38, 38, 0.5)" }}
                />
              </div>

              {/* MOBILE SWIPE HINT (In normal document flow, directly beside the image) */}
              {isTouchDevice === true && idx < speakers.length - 1 && (
                <div className="flex md:hidden flex-col items-center justify-center gap-1 text-white/40 animate-pulse shrink-0">
                  <span className="text-[10px] tracking-widest uppercase hidden sm:block">Swipe</span>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              )}
            </div>

            {/* 4. RELATIVE RIGHT GUTTER / NEXT BUTTON (10% Width) */}
            <div className="hidden md:flex items-center justify-center w-[10%] shrink-0">
              {isTouchDevice === false && idx < speakers.length - 1 && (
                <button
                  onClick={() => scrollToSpeaker(idx + 1)}
                  className="group flex flex-row items-center gap-2 p-2 text-white/50 hover:text-white transition-colors focus:outline-none"
                  aria-label="Next speaker"
                >
                  <span className="text-xs tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity hidden lg:block whitespace-nowrap">Next</span>
                  <div className="rounded-full bg-white/5 group-hover:bg-white/20 p-2 md:p-3 transition-colors border border-transparent group-hover:border-white/40 backdrop-blur-sm shrink-0">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </div>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Indicators */}
      <div className="relative z-10 mt-8 flex items-center justify-between px-6 md:px-16 lg:px-24">
        <div className="flex items-center gap-2">
          {speakers.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollToSpeaker(i)}
              aria-label={`Go to speaker ${i + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === currentIndex ? "w-8 bg-red-600" : "w-2 bg-white/30 hover:bg-white/50"
              }`}
            />
          ))}
        </div>

        <span className="text-sm tabular-nums text-white/40 font-mono">
          {String(currentIndex + 1).padStart(2, "0")} / {String(speakers.length).padStart(2, "0")}
        </span>
      </div>
    </section>
  );
}
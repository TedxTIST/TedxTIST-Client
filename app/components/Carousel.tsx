"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Slide = {
  id: string;
  name: string;
  role: string;
};

const slides: Slide[] = [
  { id: "1", name: "Ealiyas Shaji", role: "Community Lead TEDxTIST" },
  { id: "2", name: "John Savio Romy", role: "Co - Lead" },
  { id: "3", name: "Anirudh K", role: "TEDxTIST 2026 Licensee and Organiser" },
  { id: "4", name: "Anjali Biju", role: "Lead Supervisor" },
  { id: "5", name: "Sanjana Vijay", role: "Operations Lead" },
  { id: "6", name: "Christene Sara John", role: "Operations Lead" },
  { id: "7", name: "Mary Ann", role: "Venue & Infrastructure Lead (Operations)" },
  { id: "8", name: "Gayathri J S", role: "Experience & Hospitality Lead (Operations)" },
  { id: "9", name: "Cyrus Babu", role: "Production and Stage Lead (Operations)" },
  { id: "10", name: "Aadhil Kassim", role: "Technical Lead" },
  { id: "11", name: "Aakash Rajeev", role: "Technical Lead" },
  { id: "12", name: "Leanne George", role: "Documentation & Compliance Lead" },
  { id: "13", name: "Joyel Sebastian", role: "Social Media Coordinator" },
  { id: "14", name: "Ganga Giresh", role: "Design Lead" },
  { id: "15", name: "Sruthika", role: "Visual Identity & Assets Lead (Design)" },
  { id: "16", name: "Devi Anjana", role: "Merch and Brand Experience Lead(Design)" },
  { id: "17", name: "Aswin Philip Raju", role: "Volunteer Coordinator" },
  { id: "18", name: "Calvin Binu", role: "Volunteer Coordinator" },
  { id: "19", name: "Ram Uday", role: "Volunteer Coordinator" },
  { id: "20", name: "Abhishek Sadasivan", role: "Volunteer Coordinator" },
  { id: "21", name: "Eldho G Blayil", role: "Cluster Lead" },
  { id: "22", name: "Vignesh Nair", role: "Cluster Lead" },
];

const CARD_WIDTH = 312;
const CARD_GAP = 36;
const SCROLL_PER_SLIDE = 150;

export default function Carousel() {
  const [displayPosition, setDisplayPosition] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const targetPositionRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  const trackStep = CARD_WIDTH + CARD_GAP;
  const roundedPosition = Math.round(displayPosition);
  const activeIndex = Math.max(0, Math.min(slides.length - 1, roundedPosition));

  const totalScrollDistance = (slides.length - 1) * SCROLL_PER_SLIDE;

  // Smooth animation loop
  useEffect(() => {
    const animate = () => {
      setDisplayPosition((current) => {
        const target = targetPositionRef.current;
        const next = current + (target - current) * 0.18;
        if (Math.abs(target - next) < 0.001) {
          return target;
        }
        return next;
      });

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  // Drive carousel position from page scroll
  useEffect(() => {
    const handleScroll = () => {
      const container = containerRef.current;
      if (!container) return;

      const scrollProgress = -container.getBoundingClientRect().top;

      if (scrollProgress <= 0) {
        targetPositionRef.current = 0;
      } else if (scrollProgress >= totalScrollDistance) {
        targetPositionRef.current = slides.length - 1;
      } else {
        targetPositionRef.current =
          (scrollProgress / totalScrollDistance) * (slides.length - 1);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [totalScrollDistance]);

  const navigate = useCallback(
    (step: number) => {
      const container = containerRef.current;
      if (!container) return;
      const containerTop =
        container.getBoundingClientRect().top + window.scrollY;
      const newTarget = Math.max(
        0,
        Math.min(
          slides.length - 1,
          Math.round(targetPositionRef.current) + step
        )
      );
      const targetScroll =
        containerTop +
        (newTarget / (slides.length - 1)) * totalScrollDistance;
      window.scrollTo({ top: targetScroll, behavior: "smooth" });
    },
    [totalScrollDistance]
  );

  const jumpToIndex = useCallback(
    (targetIndex: number) => {
      const container = containerRef.current;
      if (!container) return;
      const containerTop =
        container.getBoundingClientRect().top + window.scrollY;
      const targetScroll =
        containerTop +
        (targetIndex / (slides.length - 1)) * totalScrollDistance;
      window.scrollTo({ top: targetScroll, behavior: "smooth" });
    },
    [totalScrollDistance]
  );

  const visibleSlides = useMemo(() => {
    const cards = [];
    for (let offset = -5; offset <= 5; offset += 1) {
      const absolute = roundedPosition + offset;
      if (absolute >= 0 && absolute < slides.length) {
        cards.push({
          key: absolute,
          absolute,
          slide: slides[absolute],
        });
      }
    }
    return cards;
  }, [roundedPosition]);

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      style={{ height: `calc(100vh + ${totalScrollDistance}px)` }}
    >
      <div className="sticky top-0 flex h-screen items-center justify-center">
        <div className="relative mx-auto w-full max-w-[1220px] overflow-hidden px-6 pb-16 text-white md:px-10">
          <div className="relative h-[430px] overflow-hidden">
        {visibleSlides.map(({ slide, absolute, key }) => {

          const offset = absolute - displayPosition;
          if (Math.abs(offset) > 3.6) {
            return null;
          }

          const isActive = offset === 0;
          const translateX = offset * trackStep;
          const distance = Math.abs(offset);
          const scale = Math.max(0.76, 1 - distance * 0.11);
          const opacity = Math.max(0.35, 1 - distance * 0.23);

          return (
            <article
              key={`${slide.id}-${key}`}
              className="absolute left-1/2 top-0 h-[390px] w-[312px] -translate-x-1/2 overflow-hidden rounded-[28px] border border-red-700/40 bg-red-700/70 shadow-[0_30px_80px_rgba(0,0,0,0.55)]"
              style={{
                transform: `translateX(calc(-50% + ${translateX}px)) scale(${scale})`,
                opacity,
                zIndex: 30 - Math.abs(offset),
              }}
              aria-hidden={!isActive || distance > 0.5}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-[#ff0033] via-[#bd0024] to-[#670014]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_38%_30%,rgba(255,255,255,0.18),transparent_55%)]" />

              <div className="absolute left-1/2 top-16 h-[300px] w-[260px] -translate-x-1/2 rounded-[45%] bg-gradient-to-b from-zinc-400/70 to-zinc-900/85 grayscale" />
              <div className="absolute left-[58%] top-[42%] h-24 w-24 rounded-full bg-black/45 blur-sm" />

              {distance < 0.5 && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-red-600/50 via-red-500/35 to-transparent px-5 pb-7 pt-12">
                  <p className="text-3xl font-bold tracking-tight">{slide.name}</p>
                  <p className="mt-1 text-lg text-white/90">{slide.role}</p>
                </div>
              )}

              {!isActive && (
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/35 to-transparent" />
              )}

              <button
                type="button"
                aria-label={`Show ${slide.name}`}
                onClick={() => {
                  const step = Math.round(offset);
                  if (step !== 0) {
                    navigate(step);
                  }
                }}
                className="absolute inset-0"
              />
            </article>
          );
        })}


          </div>

          <div className="mt-6 flex items-center justify-center gap-2">
            {slides.map((slide, index) => {
              const isActive = index === activeIndex;

              return (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => jumpToIndex(index)}
                  aria-label={`Go to slide ${index + 1}`}
                  className={`rounded-full border transition-all duration-300 ${
                    isActive
                      ? "h-3.5 w-3.5 border-red-500/80 bg-gradient-to-b from-red-500 to-red-900 shadow-[0_0_10px_rgba(220,38,38,0.6)]"
                      : "h-2.5 w-2.5 border-red-800/70 bg-gradient-to-b from-red-900/70 to-black"
                  }`}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
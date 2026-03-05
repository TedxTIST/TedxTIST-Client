"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Slide = {
  id: string;
  name: string;
  role: string;
};

const navItems = ["Home", "About", "Speakers", "Tickets", "Sponsors", "Us"];

const slides: Slide[] = [
  { id: "1", name: "Ganga Gireesh", role: "Design Lead" },
  { id: "2", name: "Aadhil Rahman", role: "Creative Director" },
  { id: "3", name: "Niranjan Paul", role: "Media Lead" },
  { id: "4", name: "Anagha Maria", role: "Brand Strategist" },
  { id: "5", name: "Sreya Thomas", role: "Event Curator" },
];

const CARD_WIDTH = 312;
const CARD_GAP = 36;

export default function Carousel() {
  const [displayPosition, setDisplayPosition] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const targetPositionRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  const trackStep = CARD_WIDTH + CARD_GAP;
  const roundedPosition = Math.round(displayPosition);
  const activeIndex = Math.max(0, Math.min(slides.length - 1, roundedPosition));

  const navigate = useCallback(
    (step: number, immediate = false) => {
      const newTarget = targetPositionRef.current + step;
      // Clamp to valid range
      targetPositionRef.current = Math.max(0, Math.min(slides.length - 1, newTarget));
      if (immediate) {
        setDisplayPosition(targetPositionRef.current);
      }
    },
    []
  );

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

  const handleWheel = useCallback(
    (event: WheelEvent) => {
      event.preventDefault();

      const delta = Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
      const stepDelta = delta / 180;
      const newTarget = targetPositionRef.current + stepDelta;
      // Clamp to valid range
      targetPositionRef.current = Math.max(0, Math.min(slides.length - 1, newTarget));
    },
    []
  );

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    element.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      element.removeEventListener("wheel", handleWheel);
    };
  }, [handleWheel]);

  const visibleSlides = useMemo(() => {
    const cards = [];
    for (let offset = -5; offset <= 5; offset += 1) {
      const absolute = roundedPosition + offset;
      // Only render cards within valid bounds
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

  const jumpToIndex = useCallback((targetIndex: number) => {
    targetPositionRef.current = targetIndex;
  }, []);

  return (
    <section className="relative mx-auto w-full max-w-[1220px] overflow-hidden bg-black px-6 pb-16 pt-10 text-white md:px-10 md:pt-12">
      <header className="flex items-center justify-between">
        <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
          <span className="font-bold text-red-600">TEDx</span>
          <span className="ml-1 font-light text-white/90">TIST</span>
        </h1>

        <nav className="hidden items-center gap-2 md:flex">
          {navItems.map((item, index) => (
            <button
              key={item}
              type="button"
              className={`rounded-full border px-4 py-1 text-sm transition-colors ${
                index === 0
                  ? "border-red-500/80 bg-red-900/50 text-white"
                  : "border-red-500/50 bg-zinc-800/65 text-white/80 hover:text-white"
              }`}
            >
              {item}
            </button>
          ))}
        </nav>
      </header>

      <div
        ref={scrollRef}
        className="relative mt-14 h-[430px] overflow-hidden cursor-grab active:cursor-grabbing"
      >
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

        <div className="pointer-events-none absolute inset-y-0 left-0 w-28 bg-gradient-to-r from-black via-black/85 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-28 bg-gradient-to-l from-black via-black/85 to-transparent" />
      </div>

      <div className="mt-6 flex items-center justify-center gap-4">
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
                  ? "h-9 w-9 border-red-500/80 bg-gradient-to-b from-red-500 to-red-900 text-white shadow-[0_0_20px_rgba(220,38,38,0.6)]"
                  : "h-6 w-6 border-red-800/70 bg-gradient-to-b from-red-900/70 to-black text-transparent"
              }`}
            >
              {isActive ? "╱" : "·"}
            </button>
          );
        })}
      </div>
    </section>
  );
}
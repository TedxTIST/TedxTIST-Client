"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Slide = {
  id: string;
  name: string;
  role: string;
};

const slides: Slide[] = [
  { id: "1", name: "Ganga Gireesh", role: "Design Lead" },
  { id: "2", name: "Aadhil Kassim", role: "Technical Lead" },
  { id: "3", name: "Aakash Rajeev", role: "Technical Lead" },
  { id: "4", name: "Anagha Maria", role: "Brand Strategist" },
  { id: "5", name: "Sreya Thomas", role: "Event Curator" },
];

const CARD_WIDTH = 312;
const CARD_GAP = 36;
const WHEEL_STEP_THRESHOLD = 24;
const WHEEL_STEP_COOLDOWN_MS = 160;

export default function Carousel() {
  const interactionRef = useRef<HTMLDivElement>(null);
  const targetPositionRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const wheelAccumulatorRef = useRef(0);
  const lastStepTimestampRef = useRef(0);
  const [displayPosition, setDisplayPosition] = useState(0);

  const maxIndex = slides.length - 1;
  const trackStep = CARD_WIDTH + CARD_GAP;
  const roundedPosition = Math.round(displayPosition);
  const activeIndex = Math.max(0, Math.min(maxIndex, roundedPosition));

  useEffect(() => {
    const animate = () => {
      setDisplayPosition((current) => {
        const target = targetPositionRef.current;
        const next = current + (target - current) * 0.2;
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

  const jumpToIndex = useCallback((targetIndex: number) => {
    targetPositionRef.current = Math.max(0, Math.min(maxIndex, targetIndex));
  }, [maxIndex]);

  useEffect(() => {
    const element = interactionRef.current;
    if (!element) return;

    const tryStep = (direction: 1 | -1) => {
      const now = performance.now();
      if (now - lastStepTimestampRef.current < WHEEL_STEP_COOLDOWN_MS) {
        return false;
      }

      const currentTarget = targetPositionRef.current;
      const nextTarget = Math.max(0, Math.min(maxIndex, currentTarget + direction));
      if (nextTarget === currentTarget) {
        return false;
      }

      targetPositionRef.current = nextTarget;
      lastStepTimestampRef.current = now;
      wheelAccumulatorRef.current = 0;
      return true;
    };

    const handleWheel = (event: WheelEvent) => {
      const rect = element.getBoundingClientRect();
      const isInViewport = rect.bottom > 0 && rect.top < window.innerHeight;
      const isInteractionZoneActive =
        rect.top <= window.innerHeight * 0.12 && rect.bottom >= window.innerHeight * 0.88;
      if (!isInViewport) {
        return;
      }

      const dominantDelta =
        Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX;

      if (dominantDelta === 0) return;

      const currentTarget = targetPositionRef.current;
      const scrollingForward = dominantDelta > 0;
      const atStart = currentTarget <= 0.001;
      const atEnd = currentTarget >= maxIndex - 0.001;

      const deltaMultiplier =
        event.deltaMode === WheelEvent.DOM_DELTA_LINE
          ? 16
          : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
            ? window.innerHeight
            : 1;
      const normalizedDelta = dominantDelta * deltaMultiplier;

      if (!isInteractionZoneActive) {
        if (!scrollingForward && !atStart) {
          event.preventDefault();
          wheelAccumulatorRef.current += normalizedDelta;
          if (wheelAccumulatorRef.current <= -WHEEL_STEP_THRESHOLD) {
            tryStep(-1);
          }
        }
        return;
      }

      const shouldReleaseToPageScroll =
        (atStart && !scrollingForward) || (atEnd && scrollingForward);

      if (!shouldReleaseToPageScroll) {
        event.preventDefault();
        wheelAccumulatorRef.current += normalizedDelta;

        if (wheelAccumulatorRef.current >= WHEEL_STEP_THRESHOLD) {
          tryStep(1);
        } else if (wheelAccumulatorRef.current <= -WHEEL_STEP_THRESHOLD) {
          tryStep(-1);
        }
      } else {
        wheelAccumulatorRef.current = 0;
      }
    };

    element.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      element.removeEventListener("wheel", handleWheel);
    };
  }, [maxIndex]);

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
    <div ref={interactionRef} className="relative flex min-h-screen flex-col justify-center overflow-hidden px-6 text-white md:px-16 lg:px-24">
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

      <h2 className="relative z-10 mb-8 text-5xl font-bold leading-tight text-red-600 sm:text-6xl lg:text-7xl">
        Us
      </h2>

      <div className="relative z-10 h-[430px] overflow-hidden">
        {visibleSlides.map(({ slide, absolute, key }) => {
          const offset = absolute - displayPosition;
          if (Math.abs(offset) > 3.6) {
            return null;
          }

          const distance = Math.abs(offset);
          const isActive = distance < 0.5;
          const translateX = offset * trackStep;
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
              aria-hidden={!isActive}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-[#ff0033] via-[#bd0024] to-[#670014]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_38%_30%,rgba(255,255,255,0.18),transparent_55%)]" />

              <div className="absolute left-1/2 top-16 h-[300px] w-[260px] -translate-x-1/2 rounded-[45%] bg-gradient-to-b from-zinc-400/70 to-zinc-900/85 grayscale" />
              <div className="absolute left-[58%] top-[42%] h-24 w-24 rounded-full bg-black/45 blur-sm" />

              {isActive && (
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
                onClick={() => jumpToIndex(absolute)}
                className="absolute inset-0"
              />
            </article>
          );
        })}
      </div>

      <div className="relative z-10 mt-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {slides.map((slide, index) => (
            <button
              key={`${slide.id}-${index}`}
              type="button"
              onClick={() => jumpToIndex(index)}
              aria-label={`Go to slide ${index + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === activeIndex ? "w-8 bg-red-600" : "w-2 bg-white/30"
              }`}
            />
          ))}
        </div>

        <span className="text-sm tabular-nums text-white/40">
          {String(activeIndex + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
        </span>
      </div>
    </div>
  );
}
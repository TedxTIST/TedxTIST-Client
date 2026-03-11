"use client";


import { useState, useRef, useEffect, useCallback, memo } from "react";

import teamData from "./team.json";
import TeamMemberImage from "./TeamMemberImage";

type Slide = {
  id: string;
  name: string;
  role: string;
  image: string;
};


function Carousel() {
  const slides: Slide[] = teamData;
  const [activeIndex, setActiveIndex] = useState(0);
  const [dimensions, setDimensions] = useState({ width: 312, height: 390, gap: 36 });
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Responsive sizing
  useEffect(() => {
    const handleResize = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const fluidWidth = vw < 768 ? vw * 0.75 : vw * 0.25;
      let targetWidth = Math.max(220, Math.min(fluidWidth, 360));
      let targetHeight = targetWidth * 1.25;
      const maxAllowedHeight = vh * (vw < 768 ? 0.55 : 0.60);
      if (targetHeight > maxAllowedHeight) {
        targetHeight = Math.max(250, maxAllowedHeight);
        targetWidth = targetHeight / 1.25;
      }
      const gap = vw < 768 ? 6 : Math.max(16, targetWidth * 0.1);
      setDimensions({ width: targetWidth, height: targetHeight, gap });
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const paddingOffset = dimensions.width / 2;

  // Center detection for active card
  const updateActiveIndex = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const cards = Array.from(container.querySelectorAll<HTMLElement>(".carousel-card"));
    if (!cards.length) return;
    // Batch all DOM reads first
    const containerRect = container.getBoundingClientRect();
    const containerCenter = containerRect.left + containerRect.width / 2;
    // Collect all card centers in a single read loop
    const cardCenters = cards.map(card => {
      const cardRect = card.getBoundingClientRect();
      return cardRect.left + cardRect.width / 2;
    });
    // Now process to find the closest
    let minDist = Infinity;
    let closestIdx = 0;
    cardCenters.forEach((cardCenter, idx) => {
      const dist = Math.abs(cardCenter - containerCenter);
      if (dist < minDist) {
        minDist = dist;
        closestIdx = idx;
      }
    });
    // DOM write/state update after all reads
    requestAnimationFrame(() => setActiveIndex(closestIdx));
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    updateActiveIndex();
    container.addEventListener("scroll", updateActiveIndex, { passive: true });
    window.addEventListener("resize", updateActiveIndex);
    return () => {
      container.removeEventListener("scroll", updateActiveIndex);
      window.removeEventListener("resize", updateActiveIndex);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dimensions, updateActiveIndex]);

  // Scroll to card on dot/click
  const scrollToCard = (idx: number) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const card = container.querySelector(`[data-id="${slides[idx].id}"]`);
    if (card && card instanceof HTMLElement) {
      card.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  };



  return (
    <div
      className="w-[100vw] shrink-0 flex flex-col items-center"
      style={{ marginLeft: "calc(50% - 50vw)", marginRight: "calc(50% - 50vw)" }}
    >
      <div
        className="relative flex items-center justify-center w-full transition-all duration-300"
        style={{ height: dimensions.height + 40 }}
      >
        {/* Scroll Container */}
        <div
          ref={scrollContainerRef}
          className="flex w-full overflow-x-auto snap-x snap-mandatory items-center h-full"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            gap: `${dimensions.gap}px`,
            paddingLeft: `calc(50% - ${paddingOffset}px)`,
            paddingRight: `calc(50% - ${paddingOffset}px)`,
            touchAction: "pan-x"
          }}
        >
          <style dangerouslySetInnerHTML={{ __html: `::-webkit-scrollbar { display: none; }` }} />
          {slides.map((slide, idx) => (
            <MemoCard
              key={slide.id}
              slide={slide}
              idx={idx}
              isActive={idx === activeIndex}
              dimensions={dimensions}
              onClick={() => scrollToCard(idx)}
            />
          ))}
        </div>
      </div>
      {/* Pagination Dots */}
      <div
        className="mt-[clamp(1rem,2vw,1.5rem)] flex-nowrap flex overflow-x-auto items-center justify-center gap-[clamp(0.25rem,0.5vw,0.5rem)] max-w-full scrollbar-hide"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {slides.map((slide, idx) => {
          // Responsive dot size: smaller on small screens, only active dot is larger
          // Use clamp for CSS sizing: inactive = min 9px, preferred 2.5vw, max 20px; active = min 20px, preferred 4vw, max 32px
          const inactiveSize = 'clamp(9px, 2.5vw, 12px)';
          const activeSize = 'clamp(12px, 4vw, 20px)';
          const size = idx === activeIndex ? activeSize : inactiveSize;
          return (
            <button
              key={slide.id}
              onClick={() => scrollToCard(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              tabIndex={0}
              className={`rounded-full border focus:outline-none transition-all duration-200 flex items-center justify-center focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black
                ${idx === activeIndex
                  ? "border-red-500/80 bg-gradient-to-b from-red-500 to-red-900 shadow-[0_0_10px_rgba(220,38,38,0.6)]"
                  : "border-red-800/70 bg-gradient-to-b from-red-900/70 to-black hover:bg-red-800/50"
                }`
              }
              style={{ minWidth: size, minHeight: size, width: size, height: size, padding: 0 }}
            />
          );
        })}
      </div>
    </div>
  );
}

// Memoized Card component
type CardProps = {
  slide: Slide;
  idx: number;
  isActive: boolean;
  dimensions: { width: number; height: number; gap: number };
  onClick: () => void;
};


const Card = ({ slide, idx, isActive, dimensions, onClick }: CardProps) => {
  // CSS variable for scale and grayscale
  const scale = isActive ? 1 : 0.85;
  const gray = isActive ? 0 : 1;
  return (
    <div
      data-id={slide.id}
      onClick={onClick}
      style={{
        width: dimensions.width,
        height: dimensions.height,
        willChange: "transform",
        transform: `scale(var(--card-scale, ${scale}))`,
        filter: `grayscale(var(--card-gray, ${gray}))`,
        zIndex: isActive ? 20 : 10,
        border: isActive ? "1.5px solid rgba(185,28,28,0.4)" : "1.5px solid transparent",
        boxShadow: isActive ? "0 30px 80px rgba(220,38,38,0.35)" : undefined,
        transition: "transform 0.2s, filter 0.2s, box-shadow 0.2s, border 0.2s"
      }}
      className={
        `carousel-card snap-center shrink-0 cursor-pointer rounded-[clamp(2rem,4vw,3rem)] overflow-hidden relative flex flex-col items-center focus:outline-none`
      }
      aria-hidden={!isActive}
    >
      {/* Fallback backgrounds */}
      <div className={`absolute inset-0 transition-colors duration-200 ${isActive ? 'bg-red-700/70' : 'bg-red-950'}`} />
      {isActive && (
        <>
          <div className="absolute inset-0 bg-gradient-to-b from-[#ff0033] via-[#bd0024] to-[#670014]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_38%_30%,rgba(255,255,255,0.18),transparent_55%)]" />
        </>
      )}
      {/* Progressive Blur-up Image */}
      <TeamMemberImage
        src={slide.image}
        name={slide.name}
        priority={idx < 3}
        sizes={`(max-width: 768px) 75vw, ${Math.round(dimensions.width)}px`}
      />
      {/* Fluid Text Overlay */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-red-900/90 via-red-600/50 to-transparent px-[clamp(1rem,1.5vw,1.25rem)] pb-[clamp(1.5rem,2vw,1.75rem)] pt-[clamp(2rem,3vw,3rem)] mt-auto">
        <p className={`font-bold tracking-tight text-center transition-colors duration-200 ${isActive ? 'text-white' : 'text-white/70'} text-[clamp(1.25rem,2vw,1.875rem)]`}>
          {slide.name}
        </p>
        <p className={`mt-1 text-center transition-colors duration-200 ${isActive ? 'text-white/90' : 'text-white/50'} text-[clamp(0.875rem,1.2vw,1.125rem)]`}>
          {slide.role}
        </p>
      </div>
    </div>
  );
};

const MemoCard = memo(Card);

export { Carousel };
export default Carousel;
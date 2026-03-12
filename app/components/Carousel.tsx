"use client";

import { useState, useRef, useEffect, useLayoutEffect, memo } from "react";
import teamData from "./team.json";
import TeamMemberImage from "./TeamMemberImage";

type Slide = {
  id: string;
  name: string;
  role: string;
  image: string;
};

// 1. NATIVE RESIZE OBSERVER (Prevents Layout Thrashing)
function useContainerDimensions(ref: React.RefObject<HTMLDivElement | null>) {
  const [dimensions, setDimensions] = useState({ width: 312, height: 390, gap: 36 });

  useLayoutEffect(() => {
    if (!ref.current) return;

    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const vw = entry.contentRect.width;
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
      }
    });

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref]);

  return dimensions;
}

function Carousel() {
  const slides: Slide[] = teamData;
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const mainContainerRef = useRef<HTMLDivElement>(null);
  
  const dimensions = useContainerDimensions(mainContainerRef);

  const activeIndexRef = useRef(activeIndex);
  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  // 2. DUAL-AXIS WHEEL BRIDGE
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let wheelAccumulator = 0;
    let isScrolling = false;
    let scrollTimeout: NodeJS.Timeout;

    const handleWheel = (e: WheelEvent) => {
      const isHorizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY);
      const delta = isHorizontal ? e.deltaX : e.deltaY;

      const currentIdx = activeIndexRef.current;
      const isScrollingBackwards = delta < 0; 
      const isScrollingForwards = delta > 0;  

      const atStart = currentIdx === 0 && isScrollingBackwards;
      const atEnd = currentIdx === slides.length - 1 && isScrollingForwards;

      if (atStart || atEnd) {
        wheelAccumulator = 0;
        return;
      }

      e.preventDefault();

      if (isScrolling) {
        wheelAccumulator = 0; 
        return;
      }

      wheelAccumulator += delta;

      if (Math.abs(wheelAccumulator) > 40) {
        const direction = wheelAccumulator > 0 ? 1 : -1;
        wheelAccumulator = 0;

        const nextIndex = currentIdx + direction;

        if (nextIndex >= 0 && nextIndex < slides.length) {
          isScrolling = true;

          const card = container.querySelector(`[data-index="${nextIndex}"]`) as HTMLElement;
          if (card) {
            card.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
          }

          clearTimeout(scrollTimeout);
          scrollTimeout = setTimeout(() => {
            isScrolling = false;
          }, 450); 
        }
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      container.removeEventListener("wheel", handleWheel);
      clearTimeout(scrollTimeout);
    };
  }, [slides.length]);

  // 3. NATIVE CENTER DETECTION
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute("data-index"));
            setActiveIndex(index);
          }
        });
      },
      {
        root: container,
        threshold: 0, 
        rootMargin: "0px -49% 0px -49%" 
      }
    );

    const cards = container.querySelectorAll(".carousel-card");
    cards.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, [dimensions]);

  const scrollToCard = (idx: number) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const card = container.querySelector(`[data-index="${idx}"]`);
    if (card && card instanceof HTMLElement) {
      card.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  };

  return (
    <div
      ref={mainContainerRef}
      className="w-[100vw] shrink-0 flex flex-col items-center"
      style={{ marginLeft: "calc(50% - 50vw)", marginRight: "calc(50% - 50vw)" }}
    >
      <div
        // FIXED: transition-opacity instead of transition-all prevents layout thrashing
        className="relative flex items-center justify-center w-full transition-opacity duration-300"
        style={{ height: dimensions.height + 40 }}
      >
        <div
          ref={scrollContainerRef}
          className="flex w-full overflow-x-auto snap-x snap-mandatory items-center h-full no-scrollbar"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            gap: `${dimensions.gap}px`,
            paddingLeft: `calc(50vw - ${dimensions.width / 2}px)`,
            paddingRight: `calc(50vw - ${dimensions.width / 2}px)`,
            touchAction: "pan-x"
          }}
        >
          <style dangerouslySetInnerHTML={{ __html: `.no-scrollbar::-webkit-scrollbar { display: none; }` }} />
          {slides.map((slide, idx) => (
            <MemoCard
              key={slide.id}
              data-index={idx}
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

type CardProps = {
  slide: Slide;
  idx: number;
  isActive: boolean;
  dimensions: { width: number; height: number; gap: number };
  onClick: () => void;
  "data-index"?: number;
};

const Card = ({ slide, idx, isActive, dimensions, onClick, ...props }: CardProps) => {
  const scale = isActive ? 1 : 0.85;
  const gray = isActive ? 0 : 1;
  return (
    <div
      {...props}
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
        transition: "transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), filter 0.4s, box-shadow 0.4s, border 0.4s"
      }}
      className={
        `carousel-card snap-center shrink-0 cursor-pointer rounded-[clamp(2rem,4vw,3rem)] overflow-hidden relative flex flex-col items-center focus:outline-none`
      }
      aria-hidden={!isActive}
    >
      <div className={`absolute inset-0 transition-colors duration-200 ${isActive ? 'bg-red-700/70' : 'bg-red-950'}`} />
      {isActive && (
        <>
          <div className="absolute inset-0 bg-gradient-to-b from-[#ff0033] via-[#bd0024] to-[#670014]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_38%_30%,rgba(255,255,255,0.18),transparent_55%)]" />
        </>
      )}
      <TeamMemberImage
        src={slide.image}
        name={slide.name}
        priority={idx < 3}
        // Strict sizes prop to resolve the final Lighthouse warning
        sizes="(max-width: 640px) 350px, (max-width: 1024px) 400px, 450px"
      />
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
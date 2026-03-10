"use client";

import { useState, useRef, useEffect, useCallback } from "react";

type Slide = {
  id: string;
  name: string;
  role: string;
  image: string;
};

const slides: Slide[] = [
  { id: "1", name: "Ealiyas Shaji", role: "Community Lead TEDxTIST", image: "/team/Ealiyas Shaji.jpg" },
  { id: "2", name: "John Savio Romy", role: "Co - Lead", image: "/team/John Savio Romy.jpg" },
  { id: "3", name: "Anirudh K", role: "TEDxTIST 2026 Licensee and Organiser", image: "/team/Anirudh K.jpg" },
  { id: "4", name: "Anjali Biju", role: "Lead Supervisor", image: "/team/Anjali Biju.png" },
  { id: "5", name: "Sanjana Vijay", role: "Operations Lead", image: "/team/Sanjana Vijay.jpg" },
  { id: "6", name: "Christene Sara John", role: "Operations Lead", image: "/team/Christene Sara John.jpg" },
  { id: "7", name: "Mary Ann", role: "Venue & Infrastructure Lead (Operations)", image: "/team/Mary Ann.jpg" },
  { id: "8", name: "Gayathri J S", role: "Experience & Hospitality Lead (Operations)", image: "/team/Gayathri J S.jpg" },
  { id: "9", name: "Cyrus Babu", role: "Production and Stage Lead (Operations)", image: "/team/Cyrus Babu.jpg" },
  { id: "10", name: "Aadhil Kassim", role: "Technical Lead", image: "/team/Aadhil Kassim.jpg" },
  { id: "11", name: "Aakash Rajeev", role: "Technical Lead", image: "/team/Aakash Rajeev.jpg" },
  { id: "12", name: "Leanne George", role: "Documentation & Compliance Lead", image: "/team/Leanne George.jpg" },
  { id: "13", name: "Joyel Sebastian", role: "Social Media Coordinator", image: "/team/Joyel Sebastian.png" },
  { id: "14", name: "Ganga Gireesh", role: "Design Lead", image: "/team/Ganga Gireesh.png" },
  { id: "15", name: "Sruthika", role: "Visual Identity & Assets Lead (Design)", image: "/team/Sruthika.jpg" },
  { id: "16", name: "Devi Anjana", role: "Merch and Brand Experience Lead(Design)", image: "/team/Devi Anjana.jpg" },
  { id: "17", name: "Aswin Philip Raju", role: "Volunteer Coordinator", image: "/team/Aswin Philip Raju.jpg" },
  { id: "18", name: "Calvin Binu", role: "Volunteer Coordinator", image: "/team/Calvin Binu.jpeg" },
  { id: "19", name: "Ram Uday", role: "Volunteer Coordinator", image: "/team/Ram Uday.jpeg" },
  { id: "20", name: "Abhishek Sivadasan", role: "Volunteer Coordinator", image: "/team/Abhishek Sivadasan.jpg" },
  { id: "21", name: "Eldho G Blayil", role: "Cluster Lead", image: "/team/Eldho G Blayil.jpg" },
  { id: "22", name: "Vignesh Nair", role: "Cluster Lead", image: "/team/Vignesh Nair.jpeg" },
];

function getScrollDuration() {
  if (typeof window !== "undefined" && window.innerWidth < 768) {
    return 100; // Faster on mobile
  }
  return 200;
}

const SCROLL_DURATION = typeof window !== "undefined" ? getScrollDuration() : 200;

export default function Carousel() {
  const [activeIndex, setActiveIndex] = useState(0);

  const [dimensions, setDimensions] = useState({
    width: 312,
    height: 390,
    gap: 36,
  });

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);
  const animationFrameId = useRef<number | null>(null);

  useEffect(() => {
    const handleResize = () => {
      const vw = window.innerWidth;
     const vh = window.innerHeight;

      // 1. Initial calculation based on Width
      const fluidWidth = vw < 768 ? vw * 0.75 : vw * 0.25;
      let targetWidth = Math.max(220, Math.min(fluidWidth, 360));
      let targetHeight = targetWidth * 1.25; // 4:5 ratio

      // 2. Vertical Overflow Protection
      const maxAllowedHeight = vh * (vw < 768 ? 0.55 : 0.60);
      if (targetHeight > maxAllowedHeight) {
        targetHeight = Math.max(250, maxAllowedHeight);
        targetWidth = targetHeight / 1.25;
      }

      // Make gap smaller on mobile for stickier scroll
      const gap = vw < 768 ? 6 : Math.max(16, targetWidth * 0.1);

      setDimensions({
        width: targetWidth,
        height: targetHeight,
        gap,
      });
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const paddingOffset = dimensions.width / 2;

  const executeScroll = useCallback((index: number) => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;

    const itemWidth = dimensions.width + dimensions.gap;
    const targetLeft = index * itemWidth;

    const startLeft = container.scrollLeft;
    const distance = targetLeft - startLeft;
    let startTime: number | null = null;

    if (animationFrameId.current !== null) {
      cancelAnimationFrame(animationFrameId.current);
    }

    isScrollingRef.current = true;
    container.style.scrollSnapType = "none";

    const animation = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;
      const duration = getScrollDuration();
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);

      // Make the scroll more snappy on mobile
      const ease = window.innerWidth < 768
        ? progress // linear for snappier feel
        : (progress < 0.5
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2);

      container.scrollLeft = startLeft + distance * ease;

      if (timeElapsed < duration) {
        animationFrameId.current = requestAnimationFrame(animation);
      } else {
        container.style.scrollSnapType = "x mandatory";
        isScrollingRef.current = false;
      }
    };

    animationFrameId.current = requestAnimationFrame(animation);
  }, [dimensions.width, dimensions.gap]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        const isAtLeftEdge = container.scrollLeft <= 0;
        const isAtRightEdge = Math.ceil(container.scrollLeft + container.clientWidth) >= container.scrollWidth;
        const isScrollingUp = e.deltaY < 0;
        const isScrollingDown = e.deltaY > 0;

        if ((isAtLeftEdge && isScrollingUp) || (isAtRightEdge && isScrollingDown)) {
          return;
        }

        e.preventDefault();

        if (isScrollingRef.current) return;

        const itemWidth = dimensions.width + dimensions.gap;
        const currentIndex = Math.round(container.scrollLeft / itemWidth);
        const direction = e.deltaY > 0 ? 1 : -1;
        const nextIndex = Math.max(0, Math.min(slides.length - 1, currentIndex + direction));

        if (currentIndex !== nextIndex) {
          executeScroll(nextIndex);
        }
      }
    };

    // We must use { passive: false } because we call e.preventDefault() to enable custom scroll behavior.
    container.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      container.removeEventListener("wheel", handleWheel);
    };
  }, [executeScroll, dimensions.width, dimensions.gap]);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const scrollLeft = scrollContainerRef.current.scrollLeft;
    const itemWidth = dimensions.width + dimensions.gap;

    const newActiveIndex = Math.round(scrollLeft / itemWidth);

    if (newActiveIndex !== activeIndex) {
      setActiveIndex(newActiveIndex);
    }
  };

  return (
    // UPDATED: shrink-0 prevents flex squashing, and the margin calc strictly snaps to the viewport edges
    <div
      className="w-[100vw] shrink-0 flex flex-col items-center"
      style={{
        marginLeft: "calc(50% - 50vw)",
        marginRight: "calc(50% - 50vw)"
      }}
    >
      <div
        className="relative flex items-center justify-center w-full transition-all duration-300"
        style={{ height: dimensions.height + 40 }}
      >

        {/* Scroll Container */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex w-full overflow-x-auto snap-x snap-mandatory items-center h-full"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            gap: `${dimensions.gap}px`,
            paddingLeft: `calc(50% - ${paddingOffset}px)`,
            paddingRight: `calc(50% - ${paddingOffset}px)`
          }}
        >
          <style dangerouslySetInnerHTML={{ __html: `::-webkit-scrollbar { display: none; }` }} />

          {slides.map((slide, idx) => {
            const isActive = idx === activeIndex;

            return (
              <div
                key={slide.id}
                onClick={() => executeScroll(idx)}
                style={{ width: dimensions.width, height: dimensions.height }}
                className={`snap-center shrink-0 transition-all duration-200 cursor-pointer rounded-[clamp(2rem,4vw,3rem)] overflow-hidden relative flex flex-col items-center border focus:outline-none
                  ${isActive
                    ? "scale-100 z-20 border-red-700/40 shadow-[0_30px_80px_rgba(220,38,38,0.35)]"
                    : "scale-85 z-10 border-transparent brightness-40 grayscale hover:opacity-80"
                  }
                `}
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

                {/* Image fills the whole card */}
                <div
                  className="absolute inset-0 bg-cover bg-center grayscale transition-all duration-200"
                  style={{ backgroundImage: `url("${encodeURI(slide.image)}")` }}
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
          })}
        </div>
      </div>

      {/* Fluid Pagination Dots */}
      <div className="mt-[clamp(1rem,2vw,1.5rem)] flex flex-wrap items-center justify-center gap-[clamp(0.25rem,0.5vw,0.5rem)] max-w-[90%] md:max-w-[80%]">
        {slides.map((slide, idx) => (
          <button
            key={slide.id}
            onClick={() => executeScroll(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={`rounded-full border focus:outline-none transition-all duration-200 ${idx === activeIndex
                ? "h-[clamp(0.6rem,1vw,0.875rem)] w-[clamp(0.6rem,1vw,0.875rem)] border-red-500/80 bg-gradient-to-b from-red-500 to-red-900 shadow-[0_0_10px_rgba(220,38,38,0.6)]"
                : "h-[clamp(0.4rem,0.75vw,0.625rem)] w-[clamp(0.4rem,0.75vw,0.625rem)] border-red-800/70 bg-gradient-to-b from-red-900/70 to-black hover:bg-red-800/50"
              }`}
          />
        ))}
      </div>
    </div>
  );
}
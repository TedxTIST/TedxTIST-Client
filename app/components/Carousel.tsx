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
  { id: "4", name: "Anjali Biju", role: "Lead Supervisor", image: "/team/Anjali Biju.jpg" },
  { id: "5", name: "Sanjana Vijay", role: "Operations Lead", image: "/team/Sanjana Vijay.jpg" },
  { id: "6", name: "Christene Sara John", role: "Operations Lead", image: "/team/Christene Sara John.jpg" },
  { id: "7", name: "Mary Ann", role: "Venue & Infrastructure Lead (Operations)", image: "/team/Mary Ann.jpg" },
  { id: "8", name: "Gayathri J S", role: "Experience & Hospitality Lead (Operations)", image: "/team/Gayathri J S.jpeg" }, // Updated to .jpeg
  { id: "9", name: "Cyrus Babu", role: "Production and Stage Lead (Operations)", image: "/team/Cyrus Babu.jpg" },
  { id: "10", name: "Aadhil Kassim", role: "Technical Lead", image: "/team/Aadhil Kassim.jpg" },
  { id: "11", name: "Aakash Rajeev", role: "Technical Lead", image: "/team/Aakash Rajeev.jpg" },
  { id: "12", name: "Leanne George", role: "Documentation & Compliance Lead", image: "/team/Leanne George.jpg" },
  { id: "13", name: "Joyel Sebastian", role: "Social Media Coordinator", image: "/team/Joyel Sebastian.heic" }, // Updated to .heic
  { id: "14", name: "Ganga Gireesh", role: "Design Lead", image: "/team/Ganga Gireesh.heif" }, // Updated to .heif
  { id: "15", name: "Sruthika", role: "Visual Identity & Assets Lead (Design)", image: "/team/Sruthika.jpg" },
  { id: "16", name: "Devi Anjana", role: "Merch and Brand Experience Lead(Design)", image: "/team/Devi Anjana.jpg" },
  { id: "17", name: "Aswin Philip Raju", role: "Volunteer Coordinator", image: "/team/Aswin Philip Raju.jpg" },
  { id: "18", name: "Calvin Binu", role: "Volunteer Coordinator", image: "/team/Calvin Binu.jpeg" }, // Updated to .jpeg
  { id: "19", name: "Ram Uday", role: "Volunteer Coordinator", image: "/team/Ram Uday.jpg" },
  { id: "20", name: "Abhishek Sadasivan", role: "Volunteer Coordinator", image: "/team/Abhishek Sadasivan.jpg" },
  { id: "21", name: "Eldho G Blayil", role: "Cluster Lead", image: "/team/Eldho G Blayil.jpg" },
  { id: "22", name: "Vignesh Nair", role: "Cluster Lead", image: "/team/Vignesh Nair.jpeg" }, // Updated to .jpeg
];

const SCROLL_DURATION = 200;

export default function Carousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);
  const animationFrameId = useRef<number | null>(null);

  // Dynamic responsive dimensions
  const cardWidth = isMobile ? 260 : 312;
  const cardHeight = isMobile ? 325 : 390;
  const cardGap = isMobile ? 24 : 36;
  const paddingOffset = cardWidth / 2;

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const executeScroll = useCallback((index: number) => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const itemWidth = cardWidth + cardGap;
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
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / SCROLL_DURATION, 1);

      const ease = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      container.scrollLeft = startLeft + distance * ease;

      if (timeElapsed < SCROLL_DURATION) {
        animationFrameId.current = requestAnimationFrame(animation);
      } else {
        container.style.scrollSnapType = "x mandatory";
        isScrollingRef.current = false;
      }
    };

    animationFrameId.current = requestAnimationFrame(animation);
  }, [cardWidth, cardGap]);

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

        const itemWidth = cardWidth + cardGap;
        const currentIndex = Math.round(container.scrollLeft / itemWidth);
        const direction = e.deltaY > 0 ? 1 : -1;
        const nextIndex = Math.max(0, Math.min(slides.length - 1, currentIndex + direction));

        if (currentIndex !== nextIndex) {
          executeScroll(nextIndex);
        }
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      container.removeEventListener("wheel", handleWheel);
    };
  }, [executeScroll, cardWidth, cardGap]);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const scrollLeft = scrollContainerRef.current.scrollLeft;
    const itemWidth = cardWidth + cardGap;
    
    const newActiveIndex = Math.round(scrollLeft / itemWidth);
    
    if (newActiveIndex !== activeIndex) {
      setActiveIndex(newActiveIndex);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div 
        className="relative flex items-center justify-center w-full" 
        style={{ height: cardHeight + 40 }}
      >
        
        {/* Scroll Container */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex w-full overflow-x-auto snap-x snap-mandatory items-center h-full"
          style={{ 
            scrollbarWidth: "none", 
            msOverflowStyle: "none",
            gap: `${cardGap}px`,
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
                style={{ width: cardWidth, height: cardHeight }}
                className={`snap-center shrink-0 transition-all duration-200 cursor-pointer rounded-[48px] overflow-hidden relative flex flex-col items-center border focus:outline-none
                  ${isActive 
                    ? "scale-100 z-20 border-red-700/40 shadow-[0_30px_80px_rgba(220,38,38,0.35)]" 
                    : "scale-85 z-10 border-transparent opacity-60 brightness-50 grayscale hover:opacity-80"
                  }
                `}
                aria-hidden={!isActive}
              >
                {/* Fallback backgrounds if image fails to load */}
                <div className={`absolute inset-0 transition-colors duration-200 ${isActive ? 'bg-red-700/70' : 'bg-red-950'}`} />
                
                {isActive && (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-b from-[#ff0033] via-[#bd0024] to-[#670014]" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_38%_30%,rgba(255,255,255,0.18),transparent_55%)]" />
                  </>
                )}

                {/* --- UPDATED: Image fills the whole card (Standard Grayscale) --- */}
                <div 
                  className="absolute inset-0 bg-cover bg-center grayscale transition-all duration-200"
                  style={{ backgroundImage: `url("${encodeURI(slide.image)}")` }}
                />

                {/* Text Overlay - kept over the image with a gradient scrim for readability */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-red-900/90 via-red-600/50 to-transparent px-5 pb-7 pt-12 mt-auto">
                  <p className={`font-bold tracking-tight text-center transition-colors duration-200 ${isActive ? 'text-white' : 'text-white/70'} ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
                    {slide.name}
                  </p>
                  <p className={`mt-1 text-center transition-colors duration-200 ${isActive ? 'text-white/90' : 'text-white/50'} ${isMobile ? 'text-base' : 'text-lg'}`}>
                    {slide.role}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pagination Dots */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2 max-w-[90%] md:max-w-[80%]">
        {slides.map((slide, idx) => (
          <button
            key={slide.id}
            onClick={() => executeScroll(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={`rounded-full border focus:outline-none transition-all duration-200 ${
              idx === activeIndex
                ? "h-3.5 w-3.5 border-red-500/80 bg-gradient-to-b from-red-500 to-red-900 shadow-[0_0_10px_rgba(220,38,38,0.6)]"
                : "h-2.5 w-2.5 border-red-800/70 bg-gradient-to-b from-red-900/70 to-black hover:bg-red-800/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
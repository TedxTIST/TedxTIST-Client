"use client";

import { useState, useEffect } from "react";
import FlyIn from "../components/FlyIn";
import CTAHeroButtons from "../components/CTAHeroButtons";
import HeroFluidX from "../components/HeroFluidX";

export default function HeroSection() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    // Stage 1: At 3500ms, the X animation finishes flying off-screen.
    // Unmount the X and mount the FlyIn texts.
    const textTimer = setTimeout(() => {
      setStep(1);
    }, 3500);

    // Stage 2: The FlyIns take about 1.5 seconds total to settle.
    // At 5000ms, broadcast the signal to start the interactive cursor.
    const cursorTimer = setTimeout(() => {
      window.dispatchEvent(new Event("startInteractiveCursor"));
    }, 5000);

    return () => {
      clearTimeout(textTimer);
      clearTimeout(cursorTimer);
    };
  }, []);

  return (
    <section id="home" className="relative flex min-h-screen items-center justify-center px-[clamp(1.5rem,5vw,6rem)]">
      {/* STAGE 1: The X Animation */}
      {step === 0 && (
        <HeroFluidX 
          bundle1Count={180} 
          bundle1Length={60} 
          bundle2Count={100} 
          bundle2Length={30} 
          duration={3000} 
        />
      )}

      {/* STAGE 2: The Fly-In Text */}
      <div className="z-10 flex flex-col items-center text-center max-w-[clamp(30rem,40vw,36rem)]">
        {step >= 1 && (
          <>
            {/* Note: Delays are reset to start from 0 since the component is delayed by 3.5s */}
            <FlyIn delay={0}>
              <h1 className="text-[clamp(3rem,6vw,6rem)] font-medium leading-tight tracking-tight text-white">
                Clarity in{" "}
                <span
                  className="font-[family-name:var(--font-allura)] text-red-600 text-[1.25em]"
                  style={{
                    textShadow: '0 0 24px rgba(31, 9, 9, 0.7), 0 0 12px rgba(0,0,0,0.9), 0 0 2px #470f0f',
                    background: 'radial-gradient(circle, rgba(220,38,38,0.25) 0%, transparent 70%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'currentcolor',
                    MozBackgroundClip: 'text',
                  }}
                >
                  Chaos
                </span>
              </h1>
            </FlyIn>

            <FlyIn delay={300}>
              <p className="mt-[clamp(1rem,2vh,2rem)] text-[clamp(1rem,1.5vw,1.125rem)] text-white/60">
                Ideas worth spreading - TEDxTIST Edition 2
              </p>
            </FlyIn>

            <FlyIn delay={600}>
              <CTAHeroButtons />
            </FlyIn>

            <FlyIn delay={900} className="w-full">
              <div className="mt-[clamp(2rem,4vh,3rem)] flex flex-wrap items-center justify-center gap-[clamp(1rem,2vw,1.5rem)] text-[clamp(0.75rem,1vw,0.875rem)] text-white/50">
                <span className="flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-[clamp(1rem,1.5vw,1.25rem)] w-[clamp(1rem,1.5vw,1.25rem)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Toc H Institute, Arakkunam
                </span>
                <span className="flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-[clamp(1rem,1.5vw,1.25rem)] w-[clamp(1rem,1.5vw,1.25rem)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  March 2026
                </span>
                <span className="flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-[clamp(1rem,1.5vw,1.25rem)] w-[clamp(1rem,1.5vw,1.25rem)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m-4-4h8m-4-8a3 3 0 100-6 3 3 0 000 6z" />
                  </svg>
                  Live event
                </span>
              </div>
            </FlyIn>
          </>
        )}
      </div>
    </section>
  );
}
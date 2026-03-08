"use client";

import Button from "./components/Button";
import Carousel from "./components/Carousel";
import SpeakerSection from "./components/SpeakerSection";

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section
        id="home"
        className="relative flex min-h-screen items-center justify-end px-[clamp(1.5rem,5vw,6rem)]"
      >
        {/* X image — left side*/}
        {/* <div className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 w-11/20 md:w-full select-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
        {/* <img
            src="/X.png"
            alt=""
            className="w-full object-contain"
          />
        </div> */}

        {/* Hero Content — positioned right */}
        <div className="z-10 flex flex-col items-start text-left max-w-[clamp(30rem,40vw,36rem)]">
          <h1 className="text-[clamp(3rem,6vw,6rem)] font-bold leading-tight tracking-tight text-white">
            Clarity in
            <br />
            <span className="font-[family-name:var(--font-allura)] text-red-600">Chaos</span>
          </h1>

          <p className="mt-[clamp(1rem,2vh,2rem)] text-[clamp(1rem,1.5vw,1.125rem)] text-white/60">
            Ideas worth spreading - TEDxTIST Edition 2
          </p>

          {/* CTA Buttons */}
          <div className="mt-[clamp(2rem,4vh,3rem)] flex flex-wrap gap-[clamp(1rem,1.5vw,1.5rem)]">
            <Button
              className="rounded-md bg-red-700 px-[clamp(1.5rem,2.5vw,2rem)] py-[clamp(0.5rem,1vh,0.75rem)] text-[clamp(0.875rem,1.2vw,1rem)] shadow-lg shadow-red-700/30"
              onClick={() =>
                document
                  .querySelector("#tickets")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Book now
            </Button>
            <Button
              className="rounded-md px-[clamp(1.5rem,2.5vw,2rem)] py-[clamp(0.5rem,1vh,0.75rem)] text-[clamp(0.875rem,1.2vw,1rem)]"
              onClick={() =>
                document
                  .querySelector("#about")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Learn more
            </Button>
          </div>

          {/* Info Strip */}
          <div className="mt-[clamp(2rem,4vh,3rem)] flex flex-wrap items-center gap-[clamp(1rem,2vw,1.5rem)] text-[clamp(0.75rem,1vw,0.875rem)] text-white/50">
            {/* Location */}
            <span className="flex items-center gap-1.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-[clamp(1rem,1.5vw,1.25rem)] w-[clamp(1rem,1.5vw,1.25rem)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Toc H, Arakkunam
            </span>

            {/* Date */}
            <span className="flex items-center gap-1.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-[clamp(1rem,1.5vw,1.25rem)] w-[clamp(1rem,1.5vw,1.25rem)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              March 2026
            </span>

            {/* Live Event */}
            <span className="flex items-center gap-1.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-[clamp(1rem,1.5vw,1.25rem)] w-[clamp(1rem,1.5vw,1.25rem)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m-4-4h8m-4-8a3 3 0 100-6 3 3 0 000 6z"
                />
              </svg>
              Live event
            </span>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section
        id="about"
        className="relative flex min-h-screen flex-col md:flex-row items-center overflow-hidden px-[clamp(1.5rem,5vw,6rem)]"
      >
        {/* Text Content — Left */}
        <div className="z-10 flex w-full flex-col md:w-5/12 items-start text-left max-w-xl pt-[clamp(4rem,10vh,6rem)] md:pt-0">
          <h2 className="text-[clamp(2.5rem,5vw,4.5rem)] font-bold leading-tight text-red-600">
            About
          </h2>
          <p className="mt-[clamp(1rem,2vh,1.5rem)] text-[clamp(1rem,1.5vw,1.25rem)] leading-relaxed text-white/80">
            Toc H Institute of Science and Technology (TIST) is a NAAC-accredited engineering
            and management institution that emphasizes global technological advancements,
            innovation and holistic student development. Offering a comprehensive range of
            B.Tech, M.Tech and MBA programmes, the institute focuses on interdisciplinary collaboration
            and entrepreneurship to incubate "job creators" rather than just job seekers.
          </p>
        </div>

        {/* Image — right-aligned on desktop */}
        <div className="relative w-full mt-auto md:mt-0 md:absolute md:bottom-0 md:right-0 md:w-8/12">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/TIST-main-block.png"
            alt="TIST Campus"
            className="w-[100vw] max-w-none h-full object-cover object-bottom grayscale md:w-full md:max-w-full"
            style={{ left: '50%', transform: 'translateX(-50%)', position: 'relative' }}
          />
          {/* Gradient overlay */}
          <div
            className="absolute inset-0 hidden md:block"
            style={{
              background:
                "radial-gradient(ellipse at 0% 50%, black 0%, rgba(0, 0, 0, 0.55) 10%, rgba(0,0,0,0.2) 30%, transparent 60%)",
            }}
          />
        </div>
      </section>

      {/* Speakers Section */}
      <SpeakerSection />

{/* Tickets Section */}
      <section
        id="tickets"
        // UPDATED: The viewport breakout trick forces the section to absolute screen edges
        className="relative flex min-h-screen flex-col md:flex-row items-center justify-between overflow-hidden w-[100vw] shrink-0"
        style={{
          marginLeft: "calc(50% - 50vw)",
          marginRight: "calc(50% - 50vw)"
        }}
      >
        {/* Left: Text and Buttons */}
        {/* UPDATED: We moved the global left padding (pl-[...]) here so the text stays aligned with your other sections */}
        <div className="z-10 flex w-full flex-col items-start justify-center md:w-[45%] pl-[clamp(1.5rem,5vw,6rem)] pr-[clamp(1.5rem,5vw,6rem)] md:pr-0 shrink-0 py-[clamp(4rem,10vh,6rem)]">
          {/* Heading */}
          <h2 className="mb-[clamp(0.5rem,1.5vh,1rem)] text-[clamp(3.5rem,7vw,6.5rem)] font-black uppercase leading-none tracking-wide text-[#eb0028]">
            <span className="block pt-25 md:pt-0">TICKETS</span>
          </h2>
          
          {/* Subtext */}
          <p className="mb-[clamp(2rem,4vh,3rem)] text-[clamp(1rem,1.5vw,1.25rem)] leading-relaxed text-white/90">
            Book your seats today.<br />Limited Seats only
          </p>

          {/* Buttons Container */}
          <div className="mb-[clamp(1.5rem,3vh,2rem)] flex flex-wrap items-center gap-[clamp(1rem,2vw,1.5rem)] w-full">
            
            {/* "Book now" Button */}
            <div className="relative rounded-[clamp(0.5rem,1vw,0.75rem)] p-[1px] bg-gradient-to-b from-red-500 to-red-800 shadow-[0_0_15px_rgba(235,0,40,0.3)] hover:shadow-[0_0_25px_rgba(235,0,40,0.5)] transition-all duration-300">
              <Button
                className="flex h-full w-full items-center justify-center rounded-[clamp(0.5rem,1vw,0.75rem)] bg-[#eb0028] px-[clamp(1.5rem,2.5vw,2rem)] py-[clamp(0.6rem,1.5vh,0.875rem)] text-[clamp(1rem,1.2vw,1.125rem)] font-medium text-white transition-colors hover:bg-red-700 whitespace-nowrap"
                onClick={() => window.open('https://www.snaptiqz.com/event/tedxtist', '_blank')}
              >
                Book now
              </Button>
            </div>

            {/* "Watch party" Button */}
            <div className="relative rounded-[clamp(0.5rem,1vw,0.75rem)] p-[1px] bg-gradient-to-br from-zinc-500 via-pink-900/40 to-orange-900/40 hover:from-zinc-400 hover:to-zinc-500 transition-all duration-300">
              <Button
                className="flex h-full w-full items-center justify-center rounded-[clamp(0.5rem,1vw,0.75rem)] bg-[#0a0a0a] px-[clamp(1.5rem,2.5vw,2rem)] py-[clamp(0.6rem,1.5vh,0.875rem)] text-[clamp(1rem,1.2vw,1.125rem)] font-medium text-white transition-colors hover:bg-zinc-900 whitespace-nowrap"
                onClick={() => window.open('https://www.snaptiqz.com/event/tedxtist', '_blank')}
              >
                Watch party
              </Button>
            </div>

          </div>

          {/* Watch Party Prompt Text with delayed tooltip */}
          {/* Tooltip logic */}
          {(() => {
            const React = require("react");
            const { useState, useRef } = React;
            // Inline component for tooltip with delay
            function WatchPartyTooltip() {
              const [show, setShow] = useState(false);
              const timeoutRef = useRef(null);

              const handleMouseEnter = () => {
                timeoutRef.current = setTimeout(() => setShow(true), 1000);
              };
              const handleMouseLeave = () => {
                clearTimeout(timeoutRef.current);
                setShow(false);
              };

              return (
                <span
                  className="relative inline-block text-[clamp(0.875rem,1vw,1rem)] text-white/70 cursor-pointer"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  tabIndex={0}
                  onFocus={handleMouseEnter}
                  onBlur={handleMouseLeave}
                >
                  Join the watch party ?
                  {show && (
                    <span className="absolute left-0 right-0 mx-auto top-full z-20 mt-2 w-fit min-w-[220px] max-w-[90vw] rounded-lg bg-zinc-900/95 px-4 py-2 text-sm text-white shadow-xl border border-zinc-700 transition-opacity duration-200 animate-fade-in overflow-x-auto">
                      Watch party lets you enjoy the event with friends in a group viewing setup, on campus without any extra amenities provided. Just show up at the venue and find your friends to enjoy the event together!
                    </span>
                  )}
                </span>
              );
            }
            return <WatchPartyTooltip />;
          })()}
        </div>

        {/* Right: Ticket Image */}
        {/* Absolute right alignment for md+ screens, normal flow on mobile */}
        <div className="z-10 flex w-full md:w-[55%] flex-1 items-center justify-end pr-0 ml-auto mt-[clamp(0.5rem,1vh,0px)] pb-6 md:pb-0 md:mt-0 relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/Ticket Component.png"
            alt="TEDxTIST Stage Admit Card"
            className="block h-auto w-full max-w-[clamp(450px,55vw,1200px)] object-contain object-right drop-shadow-[0_0_40px_rgba(235,0,40,0.15)] origin-right transition-transform duration-500 hover:scale-[1.02] md:absolute md:right-0 md:top-1/2 md:-translate-y-1/2 md:w-auto"
            style={{ right: 0 }}
            loading="lazy"
            draggable="false"
          />
        </div>
      </section>


      {/* Sponsors Section */}
      <section
        id="sponsors"
        className="flex min-h-screen flex-col items-center justify-center px-[clamp(1.5rem,5vw,6rem)] text-center"
      >
        <h2 className="text-[clamp(2rem,3vw,2.5rem)] font-bold text-white">Sponsors</h2>
        <p className="mt-[clamp(0.5rem,1vh,1rem)] max-w-lg text-[clamp(1rem,1.5vw,1.125rem)] text-white/50">Coming soon.</p>
      </section>

      {/* Us Section */}
      <section
        id="us"
        className="flex min-h-screen flex-col items-center justify-center px-[clamp(1.5rem,5vw,6rem)] pb-[clamp(2rem,5vh,4rem)] text-center w-full overflow-x-hidden"
      >
        <h2 className="mb-[clamp(0.5rem,1vh,1rem)] text-[clamp(2.5rem,5vw,4.5rem)] font-bold leading-tight text-red-600">
          The Team
        </h2>
        <p className="mb-[clamp(1.5rem,3vh,2.5rem)] max-w-lg text-[clamp(1rem,1.5vw,1.125rem)] text-white/60">
          The people behind TEDxTIST
        </p>
        <div className="w-full flex justify-center">
          <Carousel />
        </div>
      </section>
    </>
  );
}
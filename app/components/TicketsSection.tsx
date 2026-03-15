"use client";

import Button from "./Button";
import WatchPartyTooltip from "./WatchPartyTooltip";

export default function TicketsSection() {
  return (
    <section
      id="tickets"
      className="tickets-breakout relative min-h-screen grid grid-cols-1 md:grid-cols-2 items-center overflow-hidden w-full"
    >
      {/* Left: Text and Buttons */}
      {/* UPDATED: We moved the global left padding (pl-[...]) here so the text stays aligned with your other sections */}
      <div className="z-10 flex w-full flex-col items-start justify-center md:w-[45%] pl-[clamp(1.5rem,5vw,6rem)] pr-[clamp(1.5rem,5vw,6rem)] md:pr-0 shrink-0 py-[clamp(4rem,10vh,6rem)]">
        {/* Heading */}
        <h2 className="tedx-red-glow mb-[clamp(0.5rem,1.5vh,1rem)] text-[clamp(3.5rem,7vw,6.5rem)] font-black uppercase leading-none tracking-wide text-[#eb0028]">
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
        <WatchPartyTooltip />
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
  );
}

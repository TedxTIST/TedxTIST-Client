"use client";

import Button from "./components/Button";
import Carousel from "./components/Carousel";

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section
        id="home"
        className="relative flex min-h-screen items-center justify-end px-6 md:px-16 lg:px-24"
      >
        {/* Hero Content — positioned right */}
        <div className="z-10 flex flex-col items-start text-left max-w-xl">
          <h1 className="text-5xl font-bold leading-tight tracking-tight text-white sm:text-7xl lg:text-8xl">
            Clarity in
            <br />
            <span className="font-[family-name:var(--font-allura)] text-red-600">Chaos</span>
          </h1>

          <p className="mt-4 text-base text-white/60 sm:text-lg">
            Ideas worth spreading - TEDxTIST Edition 2
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-wrap gap-4">
            <Button
              className="rounded-md bg-red-700 px-8 py-3 text-base shadow-lg shadow-red-700/30"
              onClick={() =>
                document
                  .querySelector("#tickets")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Book now
            </Button>
            <Button
              className="rounded-md px-8 py-3 text-base"
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
          <div className="mt-12 flex flex-wrap items-center gap-6 text-sm text-white/50">
            {/* Location */}
            <span className="flex items-center gap-1.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
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
                className="h-4 w-4"
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
                className="h-4 w-4"
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
        className="relative flex min-h-screen flex-col md:flex-row items-center overflow-hidden md:px-16 lg:px-24"
      >
        {/* Text Content — Left */}
        <div className="z-10 flex w-full flex-col md:w-[35%] items-start text-left max-w-xl px-6 md:px-0 pt-24 md:pt-0">
          <h2 className="text-5xl font-bold leading-tight text-red-600 sm:text-6xl lg:text-7xl">
            About
          </h2>
          <p className="mt-6 text-base leading-relaxed text-white/80 sm:text-lg lg:text-xl">
            Lorem Ipsum is simply dummy text of the printing and typesetting
            industry. Lorem Ipsum has been the industry&apos;s standard dummy
            text ever since the 1500s, when an unknown printer took a galley of
            type and scrambled it to make a type specimen book. It has survived
            not only five centuries, but also the leap into electronic
            typesetting, remaining essentially unchanged.
          </p>
        </div>

        {/* Image — full width on mobile, right-aligned on desktop */}
        <div className="relative w-full mt-auto md:mt-0 md:absolute md:bottom-0 md:right-0 md:w-[70%]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/TIST-main-block.png"
            alt="TIST Campus"
            className="h-full w-full object-cover object-bottom grayscale"
          />
          {/* Gradient overlay — hidden on mobile, visible on desktop */}
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
      <section
        id="speakers"
        className="flex min-h-screen flex-col items-center justify-center px-6 text-center"
      >
        <h2 className="text-4xl font-bold text-white">Speakers</h2>
        <p className="mt-4 max-w-lg text-white/50">Coming soon.</p>
      </section>

      {/* Tickets Section */}
      <section
        id="tickets"
        className="flex min-h-screen flex-col items-center justify-center px-6 text-center"
      >
        <h2 className="text-4xl font-bold text-white">Tickets</h2>
        <p className="mt-4 max-w-lg text-white/50">Coming soon.</p>
      </section>

      {/* Sponsors Section */}
      <section
        id="sponsors"
        className="flex min-h-screen flex-col items-center justify-center px-6 text-center"
      >
        <h2 className="text-4xl font-bold text-white">Sponsors</h2>
        <p className="mt-4 max-w-lg text-white/50">Coming soon.</p>
      </section>

      {/* Us Section */}
      <section
        id="us"
        className="flex min-h-screen flex-col items-center justify-center px-6 text-center"
      >
        <h2 className="text-4xl font-bold text-white">Us</h2>
        <Carousel />
      </section>
    </>
  );
}

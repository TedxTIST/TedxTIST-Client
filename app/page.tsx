"use client";

import Button from "./components/Button";

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
            Ideas worth spreading - Ted X TIST 2026
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

      {/* Speakers Section */}
      <section
        id="speakers"
        className="flex min-h-screen flex-col items-center justify-center px-6 text-center"
      >
        <h2 className="text-4xl font-bold text-white">Speakers</h2>
        <p className="mt-4 max-w-lg text-white/50">Coming soon.</p>
      </section>

      {/* About Section */}
      <section
        id="about"
        className="flex min-h-screen flex-col items-center justify-center px-6 text-center"
      >
        <h2 className="text-4xl font-bold text-white">About</h2>
        <p className="mt-4 max-w-lg text-white/50">Coming soon.</p>
      </section>

      {/* Gallery Section */}
      <section
        id="gallery"
        className="flex min-h-screen flex-col items-center justify-center px-6 text-center"
      >
        <h2 className="text-4xl font-bold text-white">Gallery</h2>
        <p className="mt-4 max-w-lg text-white/50">Coming soon.</p>
      </section>

      {/* Contact Section */}
      <section
        id="contact"
        className="flex min-h-screen flex-col items-center justify-center px-6 text-center"
      >
        <h2 className="text-4xl font-bold text-white">Contact</h2>
        <p className="mt-4 max-w-lg text-white/50">Coming soon.</p>
      </section>
    </>
  );
}

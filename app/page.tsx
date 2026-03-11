
// Enable ISR: Regenerate this page every 600 seconds
export const revalidate = 600; // 10 minutes


import Image from "next/image";
import CTAHeroButtons from "./components/CTAHeroButtons";
import Carousel from "./components/Carousel";
import DynamicSpeakerSection from "./components/DynamicSpeakerSection";
import Footer from "./components/Footer";
// import TicketsSection from "./components/TicketsSection";

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section
        id="home"
        className="relative flex min-h-screen items-center justify-end px-[clamp(1.5rem,5vw,6rem)]"
      >

        {/* X background image restored with next/image and blur placeholder, moved after LCP content for better LCP */}
        <Image
          src="/X.png"
          alt="Background X"
          fill
          className="fixed top-0 left-0 w-full h-full object-contain object-left pointer-events-none select-none"
          priority={true}
          fetchPriority="high"
          sizes="(max-width: 1465px) 100vw, 1465px"
          placeholder="blur"
          blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/w8AAn8B9nQn2wAAAABJRU5ErkJggg=="
        />

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
          <CTAHeroButtons />

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
          <Image
            src="/TIST-main-block.png"
            alt="TIST Campus"
            width={1200}
            height={675}
            priority
            quality={70}
            fetchPriority="high"
            sizes="(max-width: 600px) 100vw, (max-width: 1200px) 80vw, 1200px"
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

      {/* Speakers Section - Now safely lazy-loaded */}
      <section>
        <DynamicSpeakerSection />
      </section>


      {/* Tickets Section
      <TicketsSection /> */}


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
        className="relative flex min-h-screen flex-col items-center justify-center px-[clamp(1.5rem,5vw,6rem)] pb-0 text-center w-full overflow-x-hidden"
      >
        <div className="flex-1 w-full flex flex-col items-center justify-center pb-[clamp(2rem,5vh,4rem)]">
          <h2 className="mb-[clamp(0.5rem,1vh,1rem)] text-[clamp(2.5rem,5vw,4.5rem)] font-bold leading-tight text-red-600">
            The Team
          </h2>
          <p className="mb-[clamp(1.5rem,3vh,2.5rem)] max-w-lg text-[clamp(1rem,1.5vw,1.125rem)] text-white/60">
            The people behind TEDxTIST
          </p>
          <div className="w-full flex justify-center">
            <Carousel />
          </div>
        </div>
        {/* Footer visually part of Us Section, full width at bottom */}
        <div className="w-full absolute left-0 right-0 bottom-0">
          <Footer />
        </div>
      </section>
    </>
  );
}
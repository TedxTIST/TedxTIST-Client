import Image from "next/image";
import FlyIn from "./FlyIn";

const titleSponsor = {
  name: "Global Reach",
  category: "Title Sponsor",
  logoSrc: "/sponsors/global-reach.png",
};

const categorySponsors = [
  {
    name: "Carestack",
    category: "Technology Sponsor",
    logoSrc: "/sponsors/carestack.png",
  },
  {
    name: "Hashboosh",
    category: "Fashion Partner",
    logoSrc: "/sponsors/hashboosh.png",
  },
  {
    name: "Sangeeth Mahal Musicals",
    category: "Instrument Sponsor",
    logoSrc: "/sponsors/sangeeth-mahal-musicals.png",
  },
];

export default function SponsorsSection() {
  return (
    <section
      id="sponsors"
      className="flex min-h-screen scroll-mt-24 flex-col items-center justify-center px-[clamp(1.5rem,5vw,6rem)] pt-[clamp(3rem,5vh,4rem)] pb-[clamp(4rem,7vh,5.5rem)] text-center"
    >
      <div
        data-scroll-target="sponsors"
        className="flex w-full max-w-5xl flex-col items-center -translate-y-[clamp(0.75rem,2vh,1.5rem)]"
      >
        {/* Section heading */}
        <FlyIn delay={100}>
          <h2 className="tedx-red-glow text-[clamp(2.5rem,5vw,4.5rem)] font-bold leading-tight text-red-600">
            Sponsors
          </h2>
          <p className="mt-[clamp(0.5rem,1vh,1rem)] text-[clamp(1rem,1.5vw,1.125rem)] text-white/50">
            The partners who make TEDxTIST possible.
          </p>
        </FlyIn>

        {/* Title Sponsor */}
        <FlyIn delay={250} className="w-full">
          <div className="mt-[clamp(2rem,4vh,2.75rem)] flex flex-col items-center">
            <span className="tedx-red-glow mb-3 text-[clamp(0.65rem,1vw,0.75rem)] font-semibold uppercase tracking-[0.2em] text-red-500/80">
              Presented by
            </span>

            <div className="flex w-full max-w-xl flex-col items-center justify-center">
              <div className="flex min-h-[clamp(130px,18vw,190px)] w-[clamp(300px,42vw,540px)] items-center justify-center rounded-2xl border border-white/10 bg-white/[0.048] px-6 py-5">
                <Image
                  src={titleSponsor.logoSrc}
                  alt={titleSponsor.name}
                  width={800}
                  height={344}
                  priority={false}
                  unoptimized
                  className="h-auto max-h-[150px] w-full object-contain"
                />
              </div>
            </div>
          </div>
        </FlyIn>

        {/* Divider label */}
        <FlyIn delay={400} className="w-full">
          <div className="mt-[clamp(2rem,4vh,2.75rem)] flex items-center gap-4 max-w-4xl mx-auto">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-[clamp(0.65rem,1vw,0.75rem)] font-semibold uppercase tracking-[0.2em] text-white/30">
              Category Sponsors
            </span>
            <div className="flex-1 h-px bg-white/10" />
          </div>
        </FlyIn>

        {/* Category Sponsors */}
        <FlyIn delay={550} className="w-full">
          <div className="mt-[clamp(1rem,2vh,1.5rem)] grid grid-cols-1 sm:grid-cols-3 gap-[clamp(1rem,2vw,1.5rem)] max-w-5xl mx-auto w-full items-start">
            {categorySponsors.map((sponsor) => (
              <div
                key={sponsor.category}
                className="flex min-h-[250px] flex-col items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-[clamp(1.5rem,3vw,2rem)] py-[clamp(1.5rem,3vh,2rem)] transition-all duration-300 hover:border-white/20 hover:bg-white/[0.06] hover:-translate-y-1"
              >
                {/* Category label */}
                <span className="tedx-red-glow text-[clamp(0.6rem,0.9vw,0.7rem)] font-semibold uppercase tracking-[0.15em] text-red-600/70">
                  {sponsor.category}
                </span>

                <div className="my-4 flex min-h-[clamp(90px,10vw,120px)] w-full items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-4 py-4">
                  <Image
                    src={sponsor.logoSrc}
                    alt={sponsor.name}
                    width={480}
                    height={240}
                    priority={false}
                    unoptimized
                    className="h-auto max-h-[96px] w-full object-contain"
                  />
                </div>
              </div>
            ))}
          </div>
        </FlyIn>
      </div>
    </section>
  );
}

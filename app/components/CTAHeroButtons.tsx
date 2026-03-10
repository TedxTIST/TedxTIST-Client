"use client";

import Button from "./Button";

export default function CTAHeroButtons() {
  return (
    <div className="mt-[clamp(2rem,4vh,3rem)] flex flex-wrap gap-[clamp(1rem,1.5vw,1.5rem)]">
      <Button
        className="rounded-md bg-red-700 px-[clamp(1.5rem,2.5vw,2rem)] py-[clamp(0.5rem,1vh,0.75rem)] text-[clamp(0.875rem,1.2vw,1rem)] shadow-lg shadow-red-700/30"
        onClick={() => window.open("https://snaptiqz.com/event/tedxtist", "_blank")}
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
  );
}

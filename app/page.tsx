export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section
        id="home"
        className="flex min-h-screen flex-col items-center justify-center px-6 text-center"
      >
        <h1 className="text-5xl font-bold tracking-tight text-white sm:text-7xl">
          TEDx<span className="text-red-600">TIST</span>
        </h1>
        <p className="mt-4 max-w-xl text-lg text-white/60">
          Ideas worth spreading — Season 2
        </p>
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

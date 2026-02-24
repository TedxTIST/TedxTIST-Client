import ThreadBackground from "./components/ThreadBackground";

export default function Home() {
  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <ThreadBackground className="absolute inset-0" />
    </div>
  );
}

type FPSCounterProps = {
  fps: number;
};

export default function FPSCounter({ fps }: FPSCounterProps) {
  return (
    <div className="pointer-events-none fixed right-4 bottom-4 z-20 rounded-md border border-black/10 bg-white/70 px-2 py-1 font-mono text-xs text-black backdrop-blur-sm dark:border-white/20 dark:bg-black/50 dark:text-white">
      {Math.round(fps)} FPS
    </div>
  );
}
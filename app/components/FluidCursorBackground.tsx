"use client";

import { useEffect, useRef } from "react";

const CONSTANTS = {
  FOLLOW_FORCE: 0.15,
  DAMPING: 0.91,
  SEGMENT_LENGTH: 6,
  MAX_SPEED: 12,
  CONSTRAINT_ITERATIONS: 2,
  MIN_SEGMENTS: 5,
  POINT_SIZE: 4,
  SPREAD_SENSITIVITY: 80,
};

const THREAD_COUNT = 360;

export default function FluidCursorBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const workerRef = useRef<Worker | null>(null);
  const hasTransferred = useRef(false);

  useEffect(() => {
    if (!canvasRef.current || hasTransferred.current) return;

    const canvas = canvasRef.current;
    hasTransferred.current = true;
    
    const offscreen = canvas.transferControlToOffscreen();
    const dpr = window.devicePixelRatio || 1;
    
    const worker = new Worker(new URL("./cursor.worker.ts", import.meta.url));
    workerRef.current = worker;

    const threadData = [];
    let totalPoints = 0;

    for (let i = 0; i < THREAD_COUNT; i++) {
      const length = Math.floor(Math.random() * 10) + 8;
      threadData.push({
        offset: totalPoints,
        length,
        hue: (i / THREAD_COUNT) * 360,
        targetOffsetX: (Math.random() - 0.5) * 200,
        targetOffsetY: (Math.random() - 0.5) * 200,
        initX: Math.random() * window.innerWidth * dpr,
        initY: Math.random() * window.innerHeight * dpr,
        driftX: (Math.random() - 0.5) * 1,
        driftY: (Math.random() - 0.5) * 1,
      });
      totalPoints += length;
    }

    const poolData = new Float32Array(totalPoints * CONSTANTS.POINT_SIZE);

    worker.postMessage({
      type: "INIT",
      canvas: offscreen,
      threadData,
      poolData,
      constants: CONSTANTS,
      width: window.innerWidth * dpr,
      height: window.innerHeight * dpr,
    }, [offscreen]);

    const handleMove = (e: MouseEvent) => {
      worker.postMessage({
        type: "UPDATE_CURSOR",
        cursor: { 
          x: e.clientX * dpr, 
          y: e.clientY * dpr, 
          active: true 
        },
        timestamp: performance.now()
      });
    };

    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1;
      worker.postMessage({
        type: "RESIZE",
        width: window.innerWidth * dpr,
        height: window.innerHeight * dpr,
      });
    };

    window.addEventListener("mousemove", handleMove, { passive: true });
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("resize", handleResize);
      worker.terminate();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
      style={{ background: 'transparent' }} 
    />
  );
}
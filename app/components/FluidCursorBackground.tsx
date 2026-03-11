"use client";

import { useEffect, useRef, useState } from "react";

// EXTRACTED: Exactly matching your provided physics profile
const CONSTANTS = {
  THREAD_COUNT: 300,
  MIN_SEGMENTS: 8,
  SEGMENT_COUNT: 50,
  SEGMENT_LENGTH: 20, // From your file
  FOLLOW_FORCE: 2,    // From your file
  DAMPING: 0.84,      // From your file
  MAX_SPEED: 100,
  CONSTRAINT_ITERATIONS: 12,
  BUNDLE_RADIUS: 60,
  SPREAD_SENSITIVITY: 12,
  POINT_SIZE: 4, 
};

export default function FluidCursorBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const dpr = Math.min(window.devicePixelRatio || 1, 2); 
    const { innerWidth: iw, innerHeight: ih } = window;

    let offscreen: OffscreenCanvas;
    try {
      offscreen = canvas.transferControlToOffscreen();
    } catch (e) {
      return; 
    }

    const worker = new Worker(new URL("./cursor.worker.ts", import.meta.url));
    const threadData = [];
    let totalPoints = 0;

    for (let i = 0; i < CONSTANTS.THREAD_COUNT; i++) {
      const length = CONSTANTS.MIN_SEGMENTS + Math.floor(Math.random() * (CONSTANTS.SEGMENT_COUNT - CONSTANTS.MIN_SEGMENTS + 1));
      const t = i / CONSTANTS.THREAD_COUNT;
      const angle = t * Math.PI * 0.5;
      const radius = (iw * 0.5) + (Math.sin(t * Math.PI) * 100);

      threadData.push({
        offset: totalPoints,
        length,
        // Using your original red hue range
        hue: Math.random() * 15,
        targetOffsetX: Math.cos(Math.random() * Math.PI * 2) * (Math.random() * CONSTANTS.BUNDLE_RADIUS),
        targetOffsetY: Math.sin(Math.random() * Math.PI * 2) * (Math.random() * CONSTANTS.BUNDLE_RADIUS),
        initX: iw * 0.8 - Math.cos(angle) * radius,
        initY: ih * 0.2 + Math.sin(angle) * radius,
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
      width: iw * dpr,
      height: ih * dpr,
      dpr
    }, [offscreen, poolData.buffer]);

    const handleMove = (e: PointerEvent) => {
      worker.postMessage({
        type: "UPDATE_CURSOR",
        cursor: { x: e.clientX, y: e.clientY, active: true },
        timestamp: performance.now()
      });
    };

    window.addEventListener("pointermove", handleMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", handleMove);
      worker.terminate();
    };
  }, [isMounted]);

  return (
    <canvas 
      ref={canvasRef} 
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full bg-black" 
    />
  );
}
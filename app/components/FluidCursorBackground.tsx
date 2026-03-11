"use client";

import { useEffect, useRef } from "react";

const CONSTANTS = {
  THREAD_COUNT: 300,
  MIN_SEGMENTS: 8,
  SEGMENT_COUNT: 50,
  SEGMENT_LENGTH: 20,
  FOLLOW_FORCE: 2,
  DAMPING: 0.84,
  MAX_SPEED: 100,
  CONSTRAINT_ITERATIONS: 20,
  BUNDLE_RADIUS: 60,
  SPREAD_SENSITIVITY: 12,
  POINT_SIZE: 4, // Corrected from 20 to match x, y, vx, vy
};

export default function FluidCursorBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const workerRef = useRef<Worker | null>(null);
  const hasTransferred = useRef(false);

  useEffect(() => {
    if (!canvasRef.current || hasTransferred.current) return;
    const canvas = canvasRef.current;
    hasTransferred.current = true;
    
    const dpr = window.devicePixelRatio || 1;
    const offscreen = canvas.transferControlToOffscreen();
    const worker = new Worker(new URL("./cursor.worker.ts", import.meta.url));
    workerRef.current = worker;

    const { innerWidth: iw, innerHeight: ih } = window;
    const threadData = [];
    let totalPoints = 0;

    // Seeding logic
    for (let i = 0; i < CONSTANTS.THREAD_COUNT; i++) {
      const length = CONSTANTS.MIN_SEGMENTS + Math.floor(Math.random() * (CONSTANTS.SEGMENT_COUNT - CONSTANTS.MIN_SEGMENTS + 1));
      const t = i / CONSTANTS.THREAD_COUNT;
      const angle = t * Math.PI * 0.5;
      const radius = (iw * 0.5) + (Math.sin(t * Math.PI) * 100);

      const startX = iw * 0.8 - Math.cos(angle) * radius;
      const startY = ih * 0.2 + Math.sin(angle) * radius;

      const offsetTheta = Math.random() * Math.PI * 2;
      const offsetRadius = Math.random() * CONSTANTS.BUNDLE_RADIUS;

      threadData.push({
        offset: totalPoints,
        length,
        hue: Math.random() * 15, // TEDx Red
        driftX: Math.cos(angle),
        driftY: Math.sin(angle),
        targetOffsetX: Math.cos(offsetTheta) * offsetRadius,
        targetOffsetY: Math.sin(offsetTheta) * offsetRadius,
        initX: startX,
        initY: startY,
      });
      totalPoints += length;
    }

    const poolData = new Float32Array(totalPoints * CONSTANTS.POINT_SIZE);
    
    // Initial Layout in Pool
    let currentOffset = 0;
    threadData.forEach(thread => {
      for (let j = 0; j < thread.length; j++) {
        const idx = (currentOffset + j) * CONSTANTS.POINT_SIZE;
        poolData[idx] = thread.initX;
        poolData[idx + 1] = thread.initY;
      }
      currentOffset += thread.length;
    });

    worker.postMessage({
      type: "INIT",
      canvas: offscreen,
      threadData,
      poolData,
      constants: CONSTANTS,
      width: iw * dpr,
      height: ih * dpr,
      dpr: dpr
    }, [offscreen]);

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
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0 h-screen w-screen"
      style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', zIndex: 0 }}
    />
  );
}
"use client";

import { useEffect, useRef } from "react";

// Exact constants from your reference
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
  POINT_SIZE: 20,
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

    // --- BEZIER INITIALIZATION FROM REFERENCE ---
    const { innerWidth: iw, innerHeight: ih } = window;
    const p0x = iw * 1.1, p0y = ih * 0.38;
    const p1x = iw * 0.38, p1y = ih * 0.42;
    const p2x = iw * -0.12, p2y = ih * 0.75;

    const threadData = [];
    let totalPoints = 0;
    const segmentsArr: number[] = [];

    for (let i = 0; i < CONSTANTS.THREAD_COUNT; i++) {
      const len = CONSTANTS.MIN_SEGMENTS + Math.floor(Math.random() * (CONSTANTS.SEGMENT_COUNT - CONSTANTS.MIN_SEGMENTS + 1));
      segmentsArr.push(len);
      totalPoints += len;
    }

    const poolData = new Float32Array(totalPoints * CONSTANTS.POINT_SIZE);
    let offset = 0;

    for (let i = 0; i < CONSTANTS.THREAD_COUNT; i++) {
      const t = Math.random();
      const u = 1 - t;
      const strokeX = (u * u * p0x + 2 * u * t * p1x + t * t * p2x) * dpr;
      const strokeY = (u * u * p0y + 2 * u * t * p1y + t * t * p2y) * dpr;
      
      const tx = (2 * u * (p1x - p0x) + 2 * t * (p2x - p1x)) * dpr;
      const ty = (2 * u * (p1y - p0y) + 2 * t * (p2y - p1y)) * dpr;
      const tangentLen = Math.hypot(tx, ty) || 1;
      
      const perpX = -ty / tangentLen;
      const perpY = tx / tangentLen;
      const spread = (Math.random() - 0.5) * (20 + t * t * 200) * dpr;
      
      const startX = strokeX + perpX * spread;
      const startY = strokeY + perpY * spread;
      const localAngle = Math.atan2(ty, tx);
      const offsetRadius = Math.random() * CONSTANTS.BUNDLE_RADIUS * dpr;
      const offsetTheta = Math.random() * Math.PI * 2;

      for (let j = 0; j < segmentsArr[i]; j++) {
        const idx = (offset + j) * CONSTANTS.POINT_SIZE;
        poolData[idx] = startX - Math.cos(localAngle) * j * CONSTANTS.SEGMENT_LENGTH * dpr;
        poolData[idx + 1] = startY - Math.sin(localAngle) * j * CONSTANTS.SEGMENT_LENGTH * dpr;
      }

      threadData.push({
        offset,
        length: segmentsArr[i],
        hue: Math.random() * 15,
        driftX: Math.cos(localAngle + (Math.random() - 0.5) * 0.4),
        driftY: Math.sin(localAngle + (Math.random() - 0.5) * 0.4),
        targetOffsetX: Math.cos(offsetTheta) * offsetRadius,
        targetOffsetY: Math.sin(offsetTheta) * offsetRadius,
        initX: startX,
        initY: startY,
      });
      offset += segmentsArr[i];
    }

    worker.postMessage({
      type: "INIT",
      canvas: offscreen,
      threadData,
      poolData,
      constants: CONSTANTS,
      width: iw * dpr,
      height: ih * dpr,
    }, [offscreen]);

    const handleMove = (e: PointerEvent) => {
      worker.postMessage({
        type: "UPDATE_CURSOR",
        cursor: { x: e.clientX * dpr, y: e.clientY * dpr, active: true },
        timestamp: performance.now()
      });
    };

    window.addEventListener("pointermove", handleMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", handleMove);
      worker.terminate();
    };
  }, []);

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 -z-10 h-full w-full" />;
}
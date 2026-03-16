"use client";

import { useEffect, useRef, useState } from "react";

interface HeroFluidXProps {
  bundle1Count?: number;
  bundle2Count?: number;
  bundle1Length?: number;
  bundle2Length?: number;
  duration?: number; 
}

const BASE_CONSTANTS = {
  FOLLOW_FORCE: 2,    
  DAMPING: 0.84,      
  MAX_SPEED: 100,
  CONSTRAINT_ITERATIONS: 12,
  POINT_SIZE: 4, 
  SPREAD_SENSITIVITY: 12, 
  SEGMENT_LENGTH: 20, 
};

export default function HeroFluidX({
  bundle1Count = 250, // Bumped up
  bundle2Count = 150, // Bumped up to fill the new massive space
  bundle1Length = 30,
  bundle2Length = 15,
  duration = 2000,
}: HeroFluidXProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => setIsMounted(true), []);

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
    const totalThreads = bundle1Count + bundle2Count;

    for (let i = 0; i < totalThreads; i++) {
      const isBundle1 = i < bundle1Count;
      const strokeGroup = isBundle1 ? 1 : 2;
      const length = isBundle1 ? bundle1Length : bundle2Length;
      
      // 🚨 THE SPREAD: 15px for the solid laser, 180px for the wispy hair
      const bundleRadius = isBundle1 ? 15 : 180;
      
      // Circular distribution math for a better looking brush
      const r = bundleRadius * Math.sqrt(Math.random());
      const theta = Math.random() * 2 * Math.PI;

      threadData.push({
        offset: totalPoints,
        length,
        strokeGroup, 
        hue: Math.random() * 15, // Keep the pure chaotic red
        targetOffsetX: r * Math.cos(theta),
        targetOffsetY: r * Math.sin(theta),
        initX: iw * 0.5,
        initY: -200, 
      });
      totalPoints += length;
    }

    const poolData = new Float32Array(totalPoints * BASE_CONSTANTS.POINT_SIZE);

    let pIdx = 0;
    for (let i = 0; i < totalThreads; i++) {
      const t = threadData[i];
      for (let j = 0; j < t.length; j++) {
        poolData[pIdx++] = t.initX + j * 0.1; 
        poolData[pIdx++] = t.initY + j * 0.1; 
        poolData[pIdx++] = 0; 
        poolData[pIdx++] = 0; 
      }
    }

    worker.postMessage({
      type: "INIT",
      mode: "X_ANIMATION",
      canvas: offscreen,
      threadData,
      poolData,
      constants: BASE_CONSTANTS,
      animationConfig: {
        duration: duration,
        spanPercent: 0.35, 
      },
      width: iw * dpr, 
      height: ih * dpr, 
      dpr
    }, [offscreen, poolData.buffer]);

    return () => worker.terminate();
  }, [isMounted, bundle1Count, bundle2Count, bundle1Length, bundle2Length, duration]);

  return (
    <canvas 
      ref={canvasRef} 
      className="pointer-events-none absolute inset-0 z-0 h-full w-full" 
    />
  );
}
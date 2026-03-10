
"use client";

import { useEffect, useRef, forwardRef } from "react";

type ThreadPoint = {
  x: number;
  y: number;
  vx: number;
  vy: number;
};

type Thread = {
  points: ThreadPoint[];
  width: number;
  hue: number;
  driftX: number;
  driftY: number;
  targetOffsetX: number;
  targetOffsetY: number;
  initX: number;
  initY: number;
};

export interface SimulationParams {
  threadCount: number;
  minSegments: number;
  segmentCount: number;
  segmentLength: number;
  followForce: number;
  damping: number;
  maxSpeed: number;
  constraintIterations: number;
  bundleRadius: number;
  spreadSensitivity: number;
}

interface FluidCursorBackgroundProps {
  params: SimulationParams;
  isRecording: boolean;
  resolution: { width: number; height: number };
}

const FluidCursorBackground = forwardRef<
  HTMLCanvasElement,
  FluidCursorBackgroundProps
>(({ params, isRecording, resolution }, ref) => {
  const {
    threadCount,
    minSegments,
    segmentCount,
    segmentLength,
    followForce,
    damping,
    maxSpeed,
    constraintIterations,
    bundleRadius,
    spreadSensitivity,
  } = params;
  const threadsRef = useRef<Thread[]>([]);
  const cursorRef = useRef({ x: 0, y: 0, active: false });
  const animationRef = useRef<number | null>(null);
  const lastMoveRef = useRef({ x: 0, y: 0, time: 0 });
  const recordingAreaCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const internalCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = internalCanvasRef.current;
    if (!canvas) return;

    if (typeof ref === "function") {
      ref(canvas);
    } else if (ref) {
      ref.current = canvas;
    }

    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;

    const recordingAreaCanvas = recordingAreaCanvasRef.current;
    const recordingAreaCtx = recordingAreaCanvas?.getContext("2d");

    const resize = () => {
      const { innerWidth, innerHeight, devicePixelRatio } = window;
      canvas.width = innerWidth * devicePixelRatio;
      canvas.height = innerHeight * devicePixelRatio;
      canvas.style.width = `${innerWidth}px`;
      canvas.style.height = `${innerHeight}px`;
      context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);

      if (recordingAreaCanvas) {
        recordingAreaCanvas.width = innerWidth * devicePixelRatio;
        recordingAreaCanvas.height = innerHeight * devicePixelRatio;
        recordingAreaCanvas.style.width = `${innerWidth}px`;
        recordingAreaCanvas.style.height = `${innerHeight}px`;
        recordingAreaCtx?.setTransform(
          devicePixelRatio,
          0,
          0,
          devicePixelRatio,
          0,
          0,
        );
      }
    };

    const initializeThreads = () => {
      // Use the same initialization logic as FluidCursorBackground
      const { innerWidth, innerHeight } = window;
      const p0x = innerWidth * 1.10, p0y = innerHeight * 0.38;
      const p1x = innerWidth * 0.38, p1y = innerHeight * 0.42;
      const p2x = innerWidth * -0.12, p2y = innerHeight * 0.75;

      const bezier = (t: number) => {
        const u = 1 - t;
        return {
          x: u * u * p0x + 2 * u * t * p1x + t * t * p2x,
          y: u * u * p0y + 2 * u * t * p1y + t * t * p2y,
        };
      };
      const bezierTangent = (t: number) => {
        const u = 1 - t;
        return {
          tx: 2 * u * (p1x - p0x) + 2 * t * (p2x - p1x),
          ty: 2 * u * (p1y - p0y) + 2 * t * (p2y - p1y),
        };
      };

      threadsRef.current = Array.from({ length: threadCount }, () => {
        const t = Math.random();
        const { x: strokeX, y: strokeY } = bezier(t);
        const { tx, ty } = bezierTangent(t);
        const tangentLen = Math.hypot(tx, ty) || 1;
        const perpX = -ty / tangentLen;
        const perpY = tx / tangentLen;
        const spreadRadius = 20 + t * t * 200;
        const spread = (Math.random() - 0.5) * spreadRadius;
        const startX = strokeX + perpX * spread;
        const startY = strokeY + perpY * spread;
        const localAngle = Math.atan2(ty, tx);
        const jitter = (Math.random() - 0.5) * 0.4;
        const driftAngle = localAngle + jitter;
        const currentSegmentCount = minSegments + Math.floor(Math.random() * (segmentCount - minSegments + 1));
        const points: ThreadPoint[] = [];
        const offsetRadius = Math.random() * bundleRadius;
        const offsetTheta = Math.random() * Math.PI * 2;
        for (let i = 0; i < currentSegmentCount; i += 1) {
          points.push({
            x: startX - Math.cos(localAngle) * i * segmentLength,
            y: startY - Math.sin(localAngle) * i * segmentLength,
            vx: 0,
            vy: 0,
          });
        }
        return {
          points,
          width: 5 + Math.random() * 2.5,
          hue: Math.random() * 15,
          driftX: Math.cos(driftAngle),
          driftY: Math.sin(driftAngle),
          targetOffsetX: Math.cos(offsetTheta) * offsetRadius,
          targetOffsetY: Math.sin(offsetTheta) * offsetRadius,
          initX: startX,
          initY: startY,
        };
      });
    };

    const onPointerMove = (event: PointerEvent) => {
      const now = performance.now();
      lastMoveRef.current = {
        x: event.clientX,
        y: event.clientY,
        time: now,
      };
      cursorRef.current.x = event.clientX;
      cursorRef.current.y = event.clientY;
      cursorRef.current.active = true;
    };

    const onPointerLeave = () => {
      cursorRef.current.active = false;
    };

    resize();
    initializeThreads();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerdown", onPointerMove);
    window.addEventListener("pointerleave", onPointerLeave);

    let prevCursorX = window.innerWidth * 0.5;
    let prevCursorY = window.innerHeight * 0.5;
    let smoothedSpeed = 0;
    let spreadFactor = 1;

    const render = () => {
      animationRef.current = requestAnimationFrame(render);

      context.clearRect(0, 0, canvas.width, canvas.height);

      if (isRecording && recordingAreaCtx && recordingAreaCanvas) {
        // Clear the recording area canvas
        recordingAreaCtx.clearRect(
          0,
          0,
          recordingAreaCanvas.width,
          recordingAreaCanvas.height,
        );
        const { width, height } = resolution;
        const devicePixelRatio = window.devicePixelRatio;
        const x = (canvas.width - width) / 2 / devicePixelRatio;
        const y = (canvas.height - height) / 2 / devicePixelRatio;
        // Draw semi-transparent highlight fill
        recordingAreaCtx.save();
        recordingAreaCtx.fillStyle = "rgba(255, 0, 0, 0.08)";
        recordingAreaCtx.fillRect(x, y, width, height);
        // Draw red dashed border
        recordingAreaCtx.strokeStyle = "red";
        recordingAreaCtx.setLineDash([5, 5]);
        recordingAreaCtx.lineWidth = 2;
        recordingAreaCtx.strokeRect(x, y, width, height);
        // Clip to the recording area
        recordingAreaCtx.beginPath();
        recordingAreaCtx.rect(x, y, width, height);
        recordingAreaCtx.clip();
        // Draw threads using the same parameters
        recordingAreaCtx.globalCompositeOperation = "source-over";
        recordingAreaCtx.lineCap = "round";
        recordingAreaCtx.lineJoin = "round";
        // Use a fixed color for all recorded threads
        const recordedThreadColor = `hsla(0, 100%, 20%, 1)`; //red color
        for (
          let threadIdx = 0;
          threadIdx < threadsRef.current.length;
          threadIdx += 1
        ) {
          const thread = threadsRef.current[threadIdx];
          recordingAreaCtx.strokeStyle = recordedThreadColor;
          recordingAreaCtx.beginPath();
          recordingAreaCtx.moveTo(thread.points[0].x, thread.points[0].y);
          for (let i = 1; i < thread.points.length; i += 1) {
            recordingAreaCtx.lineTo(thread.points[i].x, thread.points[i].y);
          }
          recordingAreaCtx.stroke();
        }
        recordingAreaCtx.restore();
      }

      // Use the same drawing settings as FluidCursorBackground
      context.globalCompositeOperation = "lighter";
      context.lineCap = "round";
      context.lineJoin = "round";

      const { x: targetX, y: targetY, active } = cursorRef.current;
      const { innerWidth, innerHeight } = window;
      const baseGoalX = active ? targetX : prevCursorX;
      const baseGoalY = active ? targetY : prevCursorY;
      const cursorDx = baseGoalX - prevCursorX;
      const cursorDy = baseGoalY - prevCursorY;
      const currentSpeed = Math.hypot(cursorDx, cursorDy);
      prevCursorX = baseGoalX;
      prevCursorY = baseGoalY;
      smoothedSpeed = smoothedSpeed * 0.85 + currentSpeed * 0.15;
      const targetSpread = 1 - Math.min(smoothedSpeed / spreadSensitivity, 1);
      spreadFactor = spreadFactor * 0.9 + targetSpread * 0.1;

      const idleTime = performance.now() - lastMoveRef.current.time;
      const idleFactor =
        idleTime > 180 ? Math.min((idleTime - 180) / 1200, 1) : 0;

      for (
        let threadIdx = 0;
        threadIdx < threadsRef.current.length;
        threadIdx += 1
      ) {
        const thread = threadsRef.current[threadIdx];
        const head = thread.points[0];
        const goalX = active
          ? baseGoalX + thread.targetOffsetX * spreadFactor
          : thread.initX;
        const goalY = active
          ? baseGoalY + thread.targetOffsetY * spreadFactor
          : thread.initY;
        const threadGoalX = goalX;
        const threadGoalY = goalY;
        const dx = threadGoalX - head.x;
        const dy = threadGoalY - head.y;
        head.vx += dx * followForce * 0.01;
        head.vy += dy * followForce * 0.01;
        head.vx += (Math.random() - 0.5) * 0.3;
        head.vy += (Math.random() - 0.5) * 0.3;
        head.vx *= damping;
        head.vy *= damping;
        const speed = Math.hypot(head.vx, head.vy);
        if (speed > maxSpeed) {
          head.vx = (head.vx / speed) * maxSpeed;
          head.vy = (head.vy / speed) * maxSpeed;
        }
        head.x += head.vx;
        head.y += head.vy;

        if (
          head.x < -200 ||
          head.x > innerWidth + 200 ||
          head.y < -200 ||
          head.y > innerHeight + 200
        ) {
          const angle = Math.random() * Math.PI * 2;
          head.x = threadGoalX + Math.cos(angle) * 40;
          head.y = threadGoalY + Math.sin(angle) * 40;
          for (let i = 1; i < thread.points.length; i += 1) {
            thread.points[i].x =
              head.x - Math.cos(angle) * i * segmentLength;
            thread.points[i].y =
              head.y - Math.sin(angle) * i * segmentLength;
            thread.points[i].vx = 0;
            thread.points[i].vy = 0;
          }
        }
        for (
          let iteration = 0;
          iteration < constraintIterations;
          iteration += 1
        ) {
          for (let i = 1; i < thread.points.length; i += 1) {
            const prev = thread.points[i - 1];
            const point = thread.points[i];
            const segDx = point.x - prev.x;
            const segDy = point.y - prev.y;
            const distance = Math.hypot(segDx, segDy) || 1;
            const scale = segmentLength / distance;
            point.x = prev.x + segDx * scale;
            point.y = prev.y + segDy * scale;
          }
        }
        if (idleFactor > 0) {
          const lengthFactor = Math.min(minSegments / thread.points.length, 30);
          const driftStrength = 0.09 * idleFactor * lengthFactor;
          for (let i = 1; i < thread.points.length; i += 1) {
            thread.points[i].x += thread.driftX * driftStrength;
            thread.points[i].y += thread.driftY * driftStrength;
          }
        }
        // Use a fixed color for all threads
        // Use the same color logic as FluidCursorBackground
        context.strokeStyle = `hsla(${thread.hue}, 100%, 20%, 1)`;
        context.beginPath();
        context.moveTo(thread.points[0].x, thread.points[0].y);
        for (let i = 1; i < thread.points.length; i += 1) {
          context.lineTo(thread.points[i].x, thread.points[i].y);
        }
        context.stroke();
      }
    };
    render();
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [
    bundleRadius,
    constraintIterations,
    damping,
    followForce,
    isRecording,
    maxSpeed,
    minSegments,
    ref,
    resolution,
    segmentCount,
    segmentLength,
    spreadSensitivity,
    threadCount,
  ]);
  return (
    <>
      <canvas
        ref={recordingAreaCanvasRef}
        className="pointer-events-none fixed inset-0 z-0 h-full w-full"
        aria-hidden="true"
      />
      <canvas
        ref={internalCanvasRef}
        className="pointer-events-none fixed inset-0 z-0 h-full w-full bg-transparent"
        aria-hidden="true"
      />
    </>
  );
});
FluidCursorBackground.displayName = "FluidCursorBackground";
export default FluidCursorBackground;

"use client";

import { useEffect, useRef } from "react";

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
};

const THREAD_COUNT = 36;
const SEGMENT_COUNT = 18;
const SEGMENT_LENGTH = 16;
const FOLLOW_FORCE = 0.18;
const DAMPING = 0.92;
const MAX_SPEED = 24;
const STIFFNESS = 0.50;
const CONSTRAINT_ITERATIONS = 2;

export default function FluidCursorBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const threadsRef = useRef<Thread[]>([]);
  const cursorRef = useRef({ x: 0, y: 0, active: false });
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    // Acquire canvas + context once; bail early if unavailable.
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    // Resize canvas with devicePixelRatio for crisp rendering.
    const resize = () => {
      const { innerWidth, innerHeight, devicePixelRatio } = window;
      canvas.width = innerWidth * devicePixelRatio;
      canvas.height = innerHeight * devicePixelRatio;
      canvas.style.width = `${innerWidth}px`;
      canvas.style.height = `${innerHeight}px`;
      context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    };

    // Seed threads around center with fixed-length segments.
    const initializeThreads = () => {
      const { innerWidth, innerHeight } = window;
      threadsRef.current = Array.from({ length: THREAD_COUNT }, () => {
        const angle = Math.random() * Math.PI * 2;
        const startX = innerWidth * 0.5 + Math.cos(angle) * 60;
        const startY = innerHeight * 0.5 + Math.sin(angle) * 60;
        const points: ThreadPoint[] = [];

        for (let i = 0; i < SEGMENT_COUNT; i += 1) {
          points.push({
            x: startX - Math.cos(angle) * i * SEGMENT_LENGTH,
            y: startY - Math.sin(angle) * i * SEGMENT_LENGTH,
            vx: 0,
            vy: 0,
          });
        }

        return {
          points,
          width: 10 + Math.random() * 2.5,
          hue: 1 + Math.random() * 30,
        };
      });
    };

    const onPointerMove = (event: PointerEvent) => {
      cursorRef.current.x = event.clientX;
      cursorRef.current.y = event.clientY;
      cursorRef.current.active = true;
    };

    const onPointerLeave = () => {
      cursorRef.current.active = false;
    };

    // Initial setup and event wiring.
    resize();
    initializeThreads();

    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerdown", onPointerMove);
    window.addEventListener("pointerleave", onPointerLeave);

    // Render loop: fade previous frame, then draw trailing threads chasing cursor.
    const render = () => {
      animationRef.current = requestAnimationFrame(render);

      context.globalCompositeOperation = "destination-in";
      context.fillStyle = "rgba(172, 38, 38, 0)";
      context.fillRect(0, 0, canvas.width, canvas.height);

      context.globalCompositeOperation = "lighter";
      context.lineCap = "round";
      context.lineJoin = "round";

      const { x: targetX, y: targetY, active } = cursorRef.current;
      const { innerWidth, innerHeight } = window;
      const fallbackX = innerWidth * 0.5;
      const fallbackY = innerHeight * 0.5;
      const goalX = active ? targetX : fallbackX;
      const goalY = active ? targetY : fallbackY;

      for (let threadIdx = 0; threadIdx < threadsRef.current.length; threadIdx += 1) {
        const thread = threadsRef.current[threadIdx];
        const head = thread.points[0];

        // Move head toward the cursor with minimal elasticity.
        const dx = goalX - head.x;
        const dy = goalY - head.y;
        head.vx += dx * FOLLOW_FORCE * 0.01;
        head.vy += dy * FOLLOW_FORCE * 0.01;

        head.vx += (Math.random() - 0.5) * 0.3;
        head.vy += (Math.random() - 0.5) * 0.3;

        head.vx *= DAMPING;
        head.vy *= DAMPING;

        const speed = Math.hypot(head.vx, head.vy);
        if (speed > MAX_SPEED) {
          head.vx = (head.vx / speed) * MAX_SPEED;
          head.vy = (head.vy / speed) * MAX_SPEED;
        }

        head.x += head.vx;
        head.y += head.vy;

        // Keep threads inside bounds by resetting when head drifts too far.
        if (
          head.x < -200 ||
          head.x > innerWidth + 200 ||
          head.y < -200 ||
          head.y > innerHeight + 200
        ) {
          const angle = Math.random() * Math.PI * 2;
          head.x = goalX + Math.cos(angle) * 40;
          head.y = goalY + Math.sin(angle) * 40;
          for (let i = 1; i < thread.points.length; i += 1) {
            thread.points[i].x = head.x - Math.cos(angle) * i * SEGMENT_LENGTH;
            thread.points[i].y = head.y - Math.sin(angle) * i * SEGMENT_LENGTH;
            thread.points[i].vx = 0;
            thread.points[i].vy = 0;
          }
        }

        // Apply fixed-length constraints with spread multiplier based on motion speed.
        const spreadFactor = 0.8 + Math.min(speed / MAX_SPEED, 1) * 1.4;
        for (let iteration = 0; iteration < CONSTRAINT_ITERATIONS; iteration += 1) {
          for (let i = 1; i < thread.points.length; i += 1) {
            const prev = thread.points[i - 1];
            const point = thread.points[i];
            const segDx = prev.x - point.x;
            const segDy = prev.y - point.y;
            const distance = Math.hypot(segDx, segDy) || 1;
            const targetDist = SEGMENT_LENGTH * spreadFactor;
            const diff = (distance - targetDist) / distance;
            point.x += segDx * diff * STIFFNESS;
            point.y += segDy * diff * STIFFNESS;
          }
        }

        // Draw a glowing thread stroke.
        context.strokeStyle = `hsla(${thread.hue}, 100%, 5%, 1)`;
        context.lineWidth = thread.width;
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
      // Cleanup listeners and animation frame on unmount.
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0 h-full w-full"
      aria-hidden="true"
    />
  );
}

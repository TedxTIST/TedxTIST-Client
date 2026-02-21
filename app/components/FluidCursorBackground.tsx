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
  driftX: number;
  driftY: number;
  targetOffsetX: number;
  targetOffsetY: number;
};

/* the following parameters were tuned through trial and error to achieve a visually pleasing balance of responsiveness, fluidity, and thread separation. Adjusting these values will significantly change the behavior and appearance of the cursor trails:

- THREAD_COUNT: More threads create a denser effect but can reduce performance. 360 provides a good balance.
- SEGMENT_COUNT: More segments make smoother curves but increase computation. 18 allows for fluid motion without excessive CPU load.
- SEGMENT_LENGTH: Longer segments create looser trails, while shorter segments produce tighter ones. 16 gives a nice flowing look.
- FOLLOW_FORCE: Higher values make threads snap more quickly to the cursor, while lower values create a laggier effect. 0.68 feels responsive without being too stiff.
- DAMPING: Controls how quickly the threads slow down. 0.92 provides a natural decay of motion.
- MAX_SPEED: Caps the velocity of the thread heads to prevent erratic behavior. 24 keeps the motion controlled even with fast cursor movements.
- CONSTRAINT_ITERATIONS: More iterations improve the accuracy of the segment length constraints but increase CPU usage. 10 iterations ensure the threads maintain their shape without excessive computation.
- BUNDLE_RADIUS: Controls the overall thickness/spread of the thread bundle around the cursor.
- SPREAD_SENSITIVITY: Controls how sensitive the bundle is to movement. Lower values make it pinch tighter with less movement.
*/

const THREAD_COUNT = 360;
const MIN_SEGMENTS = 8;
const SEGMENT_COUNT = 100;
const SEGMENT_LENGTH = 16;
const FOLLOW_FORCE = 2;
const DAMPING = 0.84;
const MAX_SPEED = 100;
const CONSTRAINT_ITERATIONS = 20;
const BUNDLE_RADIUS = 60;
const SPREAD_SENSITIVITY = 12; // NEW: Tune this to change the pinch responsiveness

export default function FluidCursorBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const threadsRef = useRef<Thread[]>([]);
  const cursorRef = useRef({ x: 0, y: 0, active: false });
  const animationRef = useRef<number | null>(null);
  const lastMoveRef = useRef({ x: 0, y: 0, time: 0 });

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
        const jitter = (Math.random() - 0.5) * 0.6;
        const driftAngle = angle + jitter;
        const startX = innerWidth * 0.5 + (Math.random() - 0.5) * 140;
        const startY = innerHeight * 0.5 + (Math.random() - 0.5) * 140;
        const segmentCount =
          MIN_SEGMENTS + Math.floor(Math.random() * (SEGMENT_COUNT - MIN_SEGMENTS + 1));
        const points: ThreadPoint[] = [];
        
        const offsetRadius = Math.random() * BUNDLE_RADIUS;
        const offsetTheta = Math.random() * Math.PI * 2;

        for (let i = 0; i < segmentCount; i += 1) {
          points.push({
            x: startX - Math.cos(angle) * i * SEGMENT_LENGTH,
            y: startY - Math.sin(angle) * i * SEGMENT_LENGTH,
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

    // Initial setup and event wiring.
    resize();
    initializeThreads();

    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerdown", onPointerMove);
    window.addEventListener("pointerleave", onPointerLeave);

    // --- NEW VARIABLES FOR SPREAD DYNAMICS ---
    let prevCursorX = window.innerWidth * 0.5;
    let prevCursorY = window.innerHeight * 0.5;
    let smoothedSpeed = 0;
    let spreadFactor = 1;
    // -----------------------------------------

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
      const baseGoalX = active ? targetX : fallbackX;
      const baseGoalY = active ? targetY : fallbackY;
      
      // --- NEW: CALCULATE SPEED AND DYNAMIC SPREAD ---
      const cursorDx = baseGoalX - prevCursorX;
      const cursorDy = baseGoalY - prevCursorY;
      const currentSpeed = Math.hypot(cursorDx, cursorDy);

      prevCursorX = baseGoalX;
      prevCursorY = baseGoalY;

      // Smooth the speed measurement to prevent harsh snapping
      smoothedSpeed = smoothedSpeed * 0.85 + currentSpeed * 0.15;

      // Calculate the target spread (1 when slow/stopped, 0 when moving fast)
      const targetSpread = 1 - Math.min(smoothedSpeed / SPREAD_SENSITIVITY, 1);
      
      // Smooth out the transition of the actual spread value
      spreadFactor = spreadFactor * 0.9 + targetSpread * 0.1;
      // -----------------------------------------------

      const idleTime = performance.now() - lastMoveRef.current.time;
      const idleFactor = idleTime > 180 ? Math.min((idleTime - 180) / 1200, 1) : 0;

      for (let threadIdx = 0; threadIdx < threadsRef.current.length; threadIdx += 1) {
        const thread = threadsRef.current[threadIdx];
        const head = thread.points[0];

        // UPDATED: Scale the offset by the dynamic spreadFactor
        // When moving fast, spreadFactor approaches 0, pinching the bundle.
        const threadGoalX = baseGoalX + thread.targetOffsetX * spreadFactor;
        const threadGoalY = baseGoalY + thread.targetOffsetY * spreadFactor;

        // Move head toward its unique target with minimal elasticity.
        const dx = threadGoalX - head.x; 
        const dy = threadGoalY - head.y; 
        head.vx += dx * FOLLOW_FORCE * 0.01;
        head.vy += dy * FOLLOW_FORCE * 0.01;
        
        // Add some random noise to the head's velocity for a more organic, fluid motion.
        head.vx += (Math.random() - 0.5) * 0.3;
        head.vy += (Math.random() - 0.5) * 0.3;

        // Apply damping to slow down the head over time, creating a natural decay of motion.
        head.vx *= DAMPING;
        head.vy *= DAMPING;

        // Cap the head's speed to prevent erratic behavior during fast cursor movements.
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
          head.x = threadGoalX + Math.cos(angle) * 40; 
          head.y = threadGoalY + Math.sin(angle) * 40; 
          for (let i = 1; i < thread.points.length; i += 1) {
            thread.points[i].x = head.x - Math.cos(angle) * i * SEGMENT_LENGTH;
            thread.points[i].y = head.y - Math.sin(angle) * i * SEGMENT_LENGTH;
            thread.points[i].vx = 0;
            thread.points[i].vy = 0;
          }
        }

        // Apply fixed-length constraints (no elasticity).
        for (let iteration = 0; iteration < CONSTRAINT_ITERATIONS; iteration += 1) {
          for (let i = 1; i < thread.points.length; i += 1) {
            const prev = thread.points[i - 1];
            const point = thread.points[i];
            const segDx = point.x - prev.x;
            const segDy = point.y - prev.y;
            const distance = Math.hypot(segDx, segDy) || 1;
            const scale = SEGMENT_LENGTH / distance;
            point.x = prev.x + segDx * scale;
            point.y = prev.y + segDy * scale;
          }
        }

        // When idle, gently push non-head segments outward to separate threads slightly.
        if (idleFactor > 0) {
          const lengthFactor = Math.min(MIN_SEGMENTS / thread.points.length, 30);
          const driftStrength = 0.09 * idleFactor * lengthFactor;
          for (let i = 1; i < thread.points.length; i += 1) {
            thread.points[i].x += thread.driftX * driftStrength;
            thread.points[i].y += thread.driftY * driftStrength;
          }
        }

        // Draw a thread-like stroke (no glow); add a subtle shadow and keep a future texture hook.
        context.strokeStyle = `hsla(${thread.hue}, 100%, 20%, 1)`; 
        //context.shadowColor = `hsla(${thread.hue}, 40%, 0%, 0.12)`;
        // context.shadowBlur = 1;
        // context.shadowOffsetX = 0;
        // context.shadowOffsetY = 0;
        //context.lineWidth = thread.width; 
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
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
};

/* 
the following parameters were tuned through trial and error to achieve a visually pleasing balance of responsiveness, fluidity, and thread separation. Adjusting these values will significantly change the behavior and appearance of the cursor trails:

- THREAD_COUNT: More threads create a denser effect but can reduce performance. 360 provides a good balance.
- SEGMENT_COUNT: More segments make smoother curves but increase computation. 18 allows for fluid motion without excessive CPU load.
- SEGMENT_LENGTH: Longer segments create looser trails, while shorter segments produce tighter ones. 16 gives a nice flowing look.
- FOLLOW_FORCE: Higher values make threads snap more quickly to the cursor, while lower values create a laggier effect. 0.68 feels responsive without being too stiff.
- DAMPING: Controls how quickly the threads slow down. 0.92 provides a natural decay of motion.
- MAX_SPEED: Caps the velocity of the thread heads to prevent erratic behavior. 24 keeps the motion controlled even with fast cursor movements.
- CONSTRAINT_ITERATIONS: More iterations improve the accuracy of the segment length constraints but increase CPU usage. 10 iterations ensure the threads maintain their shape without excessive computation.
*/

const THREAD_COUNT = 360;
const MIN_SEGMENTS = 8;
const SEGMENT_COUNT = 18;
const SEGMENT_LENGTH = 16;
const FOLLOW_FORCE = 0.68;
const DAMPING = 0.92;
const MAX_SPEED = 24;
const CONSTRAINT_ITERATIONS = 10;

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
        const angle = Math.random() * Math.PI * 2; // Random initial direction to avoid circular layout.
        const jitter = (Math.random() - 0.5) * 0.6; // Add some random jitter to the drift angle for visual variety.
        const driftAngle = angle + jitter; // Base drift direction on initial angle plus jitter for natural swirling motion.
        const startX = innerWidth * 0.5 + (Math.random() - 0.5) * 140; // Randomize initial positions near center.
        const startY = innerHeight * 0.5 + (Math.random() - 0.5) * 140; // Same as above, but for Y coordinate.
        const segmentCount =
          MIN_SEGMENTS + Math.floor(Math.random() * (SEGMENT_COUNT - MIN_SEGMENTS + 1));
        const points: ThreadPoint[] = []; // Create a chain of points for the thread, each initialized at a fixed distance from the previous one based on the initial angle. This sets up the initial shape of the thread.

        for (let i = 0; i < segmentCount; i += 1) {
          points.push({
            x: startX - Math.cos(angle) * i * SEGMENT_LENGTH,
            y: startY - Math.sin(angle) * i * SEGMENT_LENGTH,
            vx: 0,
            vy: 0,
          });
        }

        return {
          // Randomize thread width and hue for visual variety.
          points,
          width: 5 + Math.random() * 2.5,
          hue: Math.random() * 15,
          driftX: Math.cos(driftAngle),
          driftY: Math.sin(driftAngle),
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
      const idleTime = performance.now() - lastMoveRef.current.time;
      const idleFactor = idleTime > 180 ? Math.min((idleTime - 180) / 1200, 1) : 0;

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
          const lengthFactor = Math.min(MIN_SEGMENTS / thread.points.length, 30); // Longer threads get a stronger push to prevent tangling, while shorter threads maintain a tighter shape. 
          const driftStrength = 0.09 * idleFactor * lengthFactor;
          for (let i = 1; i < thread.points.length; i += 1) {
            thread.points[i].x += thread.driftX * driftStrength;
            thread.points[i].y += thread.driftY * driftStrength;
          }
        }

        // Draw a thread-like stroke (no glow); add a subtle shadow and keep a future texture hook.
        context.strokeStyle = "rgba(195, 0, 0, 0.73)"; // Solid red with some opacity for a vibrant look. Adjust alpha for more or less visibility.
        context.shadowColor = `hsla(${thread.hue}, 60%, 0%, 0.25)`;
        // context.shadowBlur = 3;
        // context.shadowOffsetX = 0;
        // context.shadowOffsetY = 0;
        // context.lineWidth = thread.width;
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

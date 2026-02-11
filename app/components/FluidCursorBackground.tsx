"use client";

import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
};

const PARTICLE_COUNT = 80;
const FOLLOW_FORCE = 0.12;
const DAMPING = 0.98;
const MAX_SPEED = 30;

export default function FluidCursorBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
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

    // Seed particles around center with randomized velocity/size.
    const initializeParticles = () => {
      const { innerWidth, innerHeight } = window;
      particlesRef.current = Array.from({ length: PARTICLE_COUNT }, () => ({
        x: innerWidth * 0.5 + (Math.random() - 0.5) * 120,
        y: innerHeight * 0.5 + (Math.random() - 0.5) * 120,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        radius: 12 + Math.random() * 26,
      }));
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
    initializeParticles();

    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerdown", onPointerMove);
    window.addEventListener("pointerleave", onPointerLeave);

    // Render loop: fade previous frame, then draw glowing particles chasing cursor.
    const render = () => {
      animationRef.current = requestAnimationFrame(render);

      context.globalCompositeOperation = "destination-in";
      context.fillStyle = "rgba(0, 0, 0, 0.9)";
      context.fillRect(0, 0, canvas.width, canvas.height);

      context.globalCompositeOperation = "lighter";

      const { x: targetX, y: targetY, active } = cursorRef.current;
      const { innerWidth, innerHeight } = window;
      const fallbackX = innerWidth * 0.5;
      const fallbackY = innerHeight * 0.5;
      const goalX = active ? targetX : fallbackX;
      const goalY = active ? targetY : fallbackY;

      for (const particle of particlesRef.current) {
        // Move particles toward the cursor with light noise and damping.
        const dx = goalX - particle.x;
        const dy = goalY - particle.y;
        particle.vx += dx * FOLLOW_FORCE * 0.01;
        particle.vy += dy * FOLLOW_FORCE * 0.01;

        particle.vx += (Math.random() - 0.5) * 0.6;
        particle.vy += (Math.random() - 0.5) * 0.6;

        particle.vx *= DAMPING;
        particle.vy *= DAMPING;

        const speed = Math.hypot(particle.vx, particle.vy);
        if (speed > MAX_SPEED) {
          particle.vx = (particle.vx / speed) * MAX_SPEED;
          particle.vy = (particle.vy / speed) * MAX_SPEED;
        }

        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < -100) particle.x = innerWidth + 100;
        if (particle.x > innerWidth + 100) particle.x = -100;
        if (particle.y < -100) particle.y = innerHeight + 100;
        if (particle.y > innerHeight + 100) particle.y = -100;

        // Draw a soft radial glow per particle.
        const gradient = context.createRadialGradient(
          particle.x,
          particle.y,
          0,
          particle.x,
          particle.y,
          particle.radius
        );
        gradient.addColorStop(0, "rgba(120, 220, 255, 0.35)");
        gradient.addColorStop(0.4, "rgba(120, 220, 255, 0.2)");
        gradient.addColorStop(1, "rgba(120, 220, 255, 0)");

        context.fillStyle = gradient;
        context.beginPath();
        context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        context.fill();
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

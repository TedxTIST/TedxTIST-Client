"use client";

import { useEffect, useRef, useState } from "react";
import FPSCounter from "./FPSCounter";

// --- Configuration ---
const THREAD_COUNT = 600;
const SEGMENT_COUNT = 40;
const SEGMENT_LENGTH = 20;
const DAMPING = 0.88;               // Velocity decay — lower = more jiggle oscillation
const SPRING_STIFFNESS = 0.03;      // How hard points snap back to rest position
const CONSTRAINT_ITERATIONS = 10;
const INTERACTION_RADIUS = 150;     // Mouse repulsion radius
const PUSH_FORCE = 2.5;            // Strong push away from mouse
const WIGGLE_DAMPING = 0.92;       // Secondary damping for tail wiggle propagation

// Lighting direction (normalized top-left light)
const LIGHT_DIR_X = -0.6;
const LIGHT_DIR_Y = -0.75;
const LIGHT_DIR_LEN = Math.hypot(LIGHT_DIR_X, LIGHT_DIR_Y);
const LIGHT_NX = LIGHT_DIR_X / LIGHT_DIR_LEN;
const LIGHT_NY = LIGHT_DIR_Y / LIGHT_DIR_LEN;

type ThreadPoint = {
	x: number;
	y: number;
	restX: number;   // static rest position
	restY: number;
	vx: number;
	vy: number;
};

type Thread = {
	points: ThreadPoint[];
	baseR: number;
	baseG: number;
	baseB: number;
	baseOpacity: number;
	lineWidth: number;
	specularPower: number;
	depthLayer: number;
};

export default function SubtleThreadBackground() {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const threadsRef = useRef<Thread[]>([]);
	const cursorRef = useRef({ x: -9999, y: -9999 });
	const animationRef = useRef<number | null>(null);
	const [fps, setFps] = useState(0);
	const fpsFrameCount = useRef(0);
	const fpsLastTime = useRef(0);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const context = canvas.getContext("2d");
		if (!context) return;

		const resize = () => {
			const dpr = window.devicePixelRatio || 1;
			const width = window.innerWidth;
			const height = window.innerHeight;
			canvas.width = width * dpr;
			canvas.height = height * dpr;
			canvas.style.width = `${width}px`;
			canvas.style.height = `${height}px`;
			context.setTransform(dpr, 0, 0, dpr, 0, 0);
		};

		const initializeThreads = () => {
			const { innerWidth, innerHeight } = window;
			threadsRef.current = Array.from({ length: THREAD_COUNT }, () => {
				const points: ThreadPoint[] = [];

				const startX = Math.random() * (innerWidth + 200) - 100;
				const startY = Math.random() * (innerHeight + 200) - 100;

				const angle = Math.random() * Math.PI * 2;
				// Slight initial curl for organic look
				const curlFactor = (Math.random() - 0.5) * 0.08;
				for (let i = 0; i < SEGMENT_COUNT; i++) {
					const a = angle + curlFactor * i;
					const px = startX + Math.cos(a) * i * SEGMENT_LENGTH;
					const py = startY + Math.sin(a) * i * SEGMENT_LENGTH;
					points.push({
						x: px,
						y: py,
						restX: px,  // remember where this point should be at rest
						restY: py,
						vx: 0,
						vy: 0,
					});
				}

				// Depth layering: 30% deep, 40% mid, 30% near
				const depthRoll = Math.random();
				let depthLayer: number;
				let baseOpacity: number;
				let lineWidth: number;
				let specularPower: number;

				if (depthRoll < 0.3) {
					depthLayer = 0;
					baseOpacity = 0.04 + Math.random() * 0.06;
					lineWidth = 0.3 + Math.random() * 0.3;
					specularPower = 8;
				} else if (depthRoll < 0.7) {
					depthLayer = 1;
					baseOpacity = 0.08 + Math.random() * 0.12;
					lineWidth = 0.6 + Math.random() * 0.5;
					specularPower = 12;
				} else {
					depthLayer = 2;
					baseOpacity = 0.15 + Math.random() * 0.15;
					lineWidth = 0.9 + Math.random() * 0.6;
					specularPower = 20;
				}

				// Dark grey base color with subtle variation
				const greyBase = 25 + Math.random() * 40;
				const baseR = Math.floor(greyBase + (Math.random() - 0.5) * 10);
				const baseG = Math.floor(greyBase + (Math.random() - 0.5) * 10);
				const baseB = Math.floor(greyBase + (Math.random() - 0.5) * 10 + 3);

				return {
					points,
					baseR,
					baseG,
					baseB,
					baseOpacity,
					lineWidth,
					specularPower,
					depthLayer,
				};
			});
		};

		const onPointerMove = (event: PointerEvent) => {
			cursorRef.current.x = event.clientX;
			cursorRef.current.y = event.clientY;
		};

		const onPointerLeave = () => {
			cursorRef.current.x = -9999;
			cursorRef.current.y = -9999;
		};

		resize();
		initializeThreads();

		window.addEventListener("resize", resize);
		window.addEventListener("pointermove", onPointerMove);
		window.addEventListener("pointerleave", onPointerLeave);

		const render = () => {
			animationRef.current = requestAnimationFrame(render);

			// FPS tracking
			fpsFrameCount.current++;
			const now = performance.now();
			if (now - fpsLastTime.current >= 1000) {
				setFps(fpsFrameCount.current / ((now - fpsLastTime.current) / 1000));
				fpsFrameCount.current = 0;
				fpsLastTime.current = now;
			}

			const { innerWidth, innerHeight } = window;

			// Pure black background — full clear each frame (no trails since threads are static)
			context.fillStyle = "#000000";
			context.fillRect(0, 0, innerWidth, innerHeight);

			context.lineCap = "round";
			context.lineJoin = "round";

			const cursorX = cursorRef.current.x;
			const cursorY = cursorRef.current.y;

			for (const thread of threadsRef.current) {
				// --- Physics: spring-back + mouse repulsion ---
				for (let i = 0; i < thread.points.length; i++) {
					const point = thread.points[i];

					// Spring force: pull back to rest position
					const springDx = point.restX - point.x;
					const springDy = point.restY - point.y;
					point.vx += springDx * SPRING_STIFFNESS;
					point.vy += springDy * SPRING_STIFFNESS;

					// Mouse repulsion: push points away from cursor
					const dx = point.x - cursorX;
					const dy = point.y - cursorY;
					const distanceSq = dx * dx + dy * dy;

					if (distanceSq < INTERACTION_RADIUS * INTERACTION_RADIUS && distanceSq > 0.01) {
						const distance = Math.sqrt(distanceSq);
						const falloff = 1 - distance / INTERACTION_RADIUS;
						// Quadratic falloff for more natural feel
						const force = falloff * falloff * PUSH_FORCE;
						point.vx += (dx / distance) * force;
						point.vy += (dy / distance) * force;
					}

					// Propagate wiggle from neighbors (makes tail segments jiggle)
					if (i > 0) {
						const prev = thread.points[i - 1];
						point.vx += (prev.vx - point.vx) * 0.08;
						point.vy += (prev.vy - point.vy) * 0.08;
					}

					// Damping — lets oscillation ring out naturally
					const dampFactor = i === 0 ? DAMPING : WIGGLE_DAMPING;
					point.vx *= dampFactor;
					point.vy *= dampFactor;

					// Update position
					point.x += point.vx;
					point.y += point.vy;
				}

				// --- IK Constraints: keep segments at fixed length ---
				for (let iteration = 0; iteration < CONSTRAINT_ITERATIONS; iteration++) {
					for (let i = 1; i < thread.points.length; i++) {
						const prev = thread.points[i - 1];
						const point = thread.points[i];
						const dx = point.x - prev.x;
						const dy = point.y - prev.y;
						const distance = Math.hypot(dx, dy);
						if (distance === 0) continue;

						const difference = SEGMENT_LENGTH - distance;
						const percent = difference / distance / 2;
						const offsetX = dx * percent;
						const offsetY = dy * percent;

						prev.x -= offsetX;
						prev.y -= offsetY;
						point.x += offsetX;
						point.y += offsetY;
					}
				}

				// --- Lit Drawing: per-segment shading ---
				context.lineWidth = thread.lineWidth;

				for (let i = 0; i < thread.points.length - 1; i++) {
					const p0 = thread.points[i];
					const p1 = thread.points[i + 1];

					// Segment tangent
					const tDx = p1.x - p0.x;
					const tDy = p1.y - p0.y;
					const segLen = Math.hypot(tDx, tDy) || 1;

					// Normal perpendicular to segment (cylinder surface)
					const nx = -tDy / segLen;
					const ny = tDx / segLen;

					// Diffuse lighting
					const diffuse = Math.max(0, nx * LIGHT_NX + ny * LIGHT_NY);

					// Specular highlight (Blinn-Phong)
					const reflectDot = 2 * (nx * LIGHT_NX + ny * LIGHT_NY);
					const rx = LIGHT_NX - reflectDot * nx;
					const ry = LIGHT_NY - reflectDot * ny;
					const specularRaw = Math.max(0, -(rx * 0 + ry * 0 - 1));
					const specular = Math.pow(specularRaw, thread.specularPower) * 0.3;

					// Combine lighting
					const ambient = 0.15;
					const lightIntensity = ambient + diffuse * 0.55 + specular;

					// Final color
					const r = Math.min(255, Math.floor(thread.baseR + lightIntensity * 90));
					const g = Math.min(255, Math.floor(thread.baseG + lightIntensity * 88));
					const b = Math.min(255, Math.floor(thread.baseB + lightIntensity * 95));

					// Tip fade
					const tipFade = i < 3
						? i / 3
						: i > thread.points.length - 4
							? (thread.points.length - 1 - i) / 3
							: 1;
					const alpha = thread.baseOpacity * tipFade;

					context.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
					context.beginPath();

					if (i < thread.points.length - 2) {
						const p2 = thread.points[i + 1];
						const p3 = thread.points[Math.min(i + 2, thread.points.length - 1)];
						const midX = (p2.x + p3.x) / 2;
						const midY = (p2.y + p3.y) / 2;
						context.moveTo(p0.x, p0.y);
						context.quadraticCurveTo(p1.x, p1.y, midX, midY);
					} else {
						context.moveTo(p0.x, p0.y);
						context.lineTo(p1.x, p1.y);
					}
					context.stroke();
				}
			}
		};

		render();

		return () => {
			if (animationRef.current) {
				cancelAnimationFrame(animationRef.current);
			}
			window.removeEventListener("resize", resize);
			window.removeEventListener("pointermove", onPointerMove);
			window.removeEventListener("pointerleave", onPointerLeave);
		};
	}, []);

	return (
		<>
			<canvas
				ref={canvasRef}
				className="pointer-events-none fixed inset-0 z-0 h-full w-full"
				style={{ backgroundColor: "#000000" }}
				aria-hidden="true"
			/>
			<FPSCounter fps={fps} />
		</>
	);
}
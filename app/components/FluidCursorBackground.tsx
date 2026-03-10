"use client";

import { useEffect, useRef } from "react";
// import FPSCounter from "./FPSCounter";


// Each thread's points are stored in a contiguous Float32Array.
// For each point: [x, y, vx, vy]
type ThreadPool = {
  offset: number; // start index in the pool
  length: number; // number of segments
  width: number;
  hue: number;
  driftX: number;
  driftY: number;
  targetOffsetX: number;
  targetOffsetY: number;
  initX: number;
  initY: number;
};

declare global {
	interface Window {
		setFps?: (value: number) => void;
	}
}

/* 
the following parameters were tuned through trial and error to achieve a visually pleasing balance of responsiveness, fluidity, and thread separation. Adjusting these values will significantly change the behavior and appearance of the cursor trails:

- THREAD_COUNT: More threads create a denser effect but can reduce performance. 360 provides a good balance.
- SEGMENT_COUNT: More segments make smoother curves but increase computation. 18 allows for fluid motion without excessive CPU load.
- SEGMENT_LENGTH: Longer segments create looser trails, while shorter segments produce tighter ones. 16 gives a nice flowing look.
- FOLLOW_FORCE: Higher values make threads snap more quickly to the cursor, while lower values create a laggier effect. 0.68 feels responsive without being too stiff.
- DAMPING: Controls how quickly the threads slow down. 0.92 provides a natural decay of motion.
- MAX_SPEED: Caps the velocity of the thread heads to prevent erratic behavior. 24 keeps the motion controlled even with fast cursor movements.
- CONSTRAINT_ITERATIONS: More iterations improve the accuracy of the segment length constraints but increase CPU usage. 10 iterations ensure the threads maintain their shape without excessive computation.
- BUNDLE_RADIUS: Controls the overall thickness/spread of the thread bundle around the cursor.
- SPREAD_SENSITIVITY: Controls how sensitive the bundle is to movement. Lower values make it pinch tighter with less movement.
- MIN_SEGMENTS: Ensures threads have a minimum length for visual consistency, preventing very short threads that can look awkward.
- SPREAD_SENSITIVITY: This new parameter was added to control how quickly the thread bundle pinches together in response to cursor movement. A lower value means the threads will pinch more tightly with less movement, while a higher value allows for more movement before significant pinching occurs. This helps create a more dynamic and responsive visual effect that reacts to the user's interactions in a visually engaging way.
*/

const THREAD_COUNT = 360;
const MIN_SEGMENTS = 8;
const SEGMENT_COUNT = 150;
const SEGMENT_LENGTH = 15;
const FOLLOW_FORCE = 2;
const DAMPING = 0.84;
const MAX_SPEED = 100;
const CONSTRAINT_ITERATIONS = 20;
const BUNDLE_RADIUS = 60;
const SPREAD_SENSITIVITY = 12;
const POINT_SIZE = 4; // [x, y, vx, vy]

export default function FluidCursorBackground() {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const threadPoolsRef = useRef<ThreadPool[]>([]);
	const poolRef = useRef<Float32Array | null>(null);
	const cursorRef = useRef({ x: 0, y: 0, active: false });
	const animationRef = useRef<number | null>(null);
	const lastMoveRef = useRef({ x: 0, y: 0, time: 0 });

	useEffect(() => {
		window.setFps ??= () => {};

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

		// Seed threads along a curved stroke matching the reference X sweep.
		const initializeThreads = () => {
			const { innerWidth, innerHeight } = window;
			const p0x = innerWidth * 1.10,  p0y = innerHeight * 0.38;
			const p1x = innerWidth * 0.38,  p1y = innerHeight * 0.42;
			const p2x = innerWidth * -0.12, p2y = innerHeight * 0.75;

			// Helper: Write bezier result directly to arr at idx
			function bezierTo(arr: Float32Array, idx: number, t: number) {
				const u = 1 - t;
				arr[idx] = u * u * p0x + 2 * u * t * p1x + t * t * p2x;
				arr[idx + 1] = u * u * p0y + 2 * u * t * p1y + t * t * p2y;
			}
			// Helper: Write tangent result directly to arr at idx
			function bezierTangentTo(arr: Float32Array, idx: number, t: number) {
				const u = 1 - t;
				arr[idx] = 2 * u * (p1x - p0x) + 2 * t * (p2x - p1x);
				arr[idx + 1] = 2 * u * (p1y - p0y) + 2 * t * (p2y - p1y);
			}

			// Precompute total points needed
			let totalPoints = 0;
			const threadSegments: number[] = [];
			for (let i = 0; i < THREAD_COUNT; i++) {
				const segmentCount = MIN_SEGMENTS + Math.floor(Math.random() * (SEGMENT_COUNT - MIN_SEGMENTS + 1));
				threadSegments.push(segmentCount);
				totalPoints += segmentCount;
			}
			const pool = new Float32Array(totalPoints * POINT_SIZE);
			const threadPools: ThreadPool[] = [];
			let offset = 0;
			for (let i = 0; i < THREAD_COUNT; i++) {
				const segmentCount = threadSegments[i];
				const t = Math.random();
				// Stroke position
				bezierTo(pool, offset * POINT_SIZE, t);
				const strokeX = pool[offset * POINT_SIZE];
				const strokeY = pool[offset * POINT_SIZE + 1];
				// Tangent
				bezierTangentTo(pool, offset * POINT_SIZE + 2, t);
				const tx = pool[offset * POINT_SIZE + 2];
				const ty = pool[offset * POINT_SIZE + 3];
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
				const offsetRadius = Math.random() * BUNDLE_RADIUS;
				const offsetTheta = Math.random() * Math.PI * 2;
				// Lay segments
				for (let j = 0; j < segmentCount; j++) {
					const idx = (offset + j) * POINT_SIZE;
					pool[idx] = startX - Math.cos(localAngle) * j * SEGMENT_LENGTH;
					pool[idx + 1] = startY - Math.sin(localAngle) * j * SEGMENT_LENGTH;
					pool[idx + 2] = 0;
					pool[idx + 3] = 0;
				}
				threadPools.push({
					offset,
					length: segmentCount,
					width: 5 + Math.random() * 2.5,
					hue: Math.random() * 15,
					driftX: Math.cos(driftAngle),
					driftY: Math.sin(driftAngle),
					targetOffsetX: Math.cos(offsetTheta) * offsetRadius,
					targetOffsetY: Math.sin(offsetTheta) * offsetRadius,
					initX: startX,
					initY: startY,
				});
				offset += segmentCount;
			}
			poolRef.current = pool;
			threadPoolsRef.current = threadPools;
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
		let previousFrameTime = performance.now();
		// -----------------------------------------

		// Render loop: fade previous frame, then draw trailing threads chasing cursor.
		const render = () => {
			animationRef.current = requestAnimationFrame(render);

			const now = performance.now();
			const frameDelta = now - previousFrameTime;
			previousFrameTime = now;

			context.globalCompositeOperation = "destination-in";
			context.fillStyle = "rgba(172, 38, 38, 0)";
			context.fillRect(0, 0, canvas.width, canvas.height);

			context.globalCompositeOperation = "lighter";
			context.lineCap = "round";
			context.lineJoin = "round";

			const { x: targetX, y: targetY, active } = cursorRef.current;
			const { innerWidth, innerHeight } = window;

			// --- NEW: CALCULATE SPEED AND DYNAMIC SPREAD ---
			// Use cursor position for speed tracking only when active.
			const baseGoalX = active ? targetX : prevCursorX;
			const baseGoalY = active ? targetY : prevCursorY;

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

			const pool = poolRef.current;
			const threadPools = threadPoolsRef.current;
			if (!pool || !threadPools) return;
			for (let tIdx = 0; tIdx < threadPools.length; tIdx++) {
				const thread = threadPools[tIdx];
				const headIdx = thread.offset * POINT_SIZE;
				// When cursor is active, threads converge on cursor + spread offset.
				// When idle, each thread returns to its own stroke-position (initX/initY).
				const goalX = active ? baseGoalX + thread.targetOffsetX * spreadFactor : thread.initX;
				const goalY = active ? baseGoalY + thread.targetOffsetY * spreadFactor : thread.initY;
				// Move head toward its unique target with minimal elasticity.
				let dx = goalX - pool[headIdx];
				let dy = goalY - pool[headIdx + 1];
				pool[headIdx + 2] += dx * FOLLOW_FORCE * 0.01;
				pool[headIdx + 3] += dy * FOLLOW_FORCE * 0.01;
				// Add some random noise to the head's velocity for a more organic, fluid motion.
				pool[headIdx + 2] += (Math.random() - 0.5) * 0.3;
				pool[headIdx + 3] += (Math.random() - 0.5) * 0.3;
				// Apply damping
				pool[headIdx + 2] *= DAMPING;
				pool[headIdx + 3] *= DAMPING;
				// Cap speed
				const speed = Math.hypot(pool[headIdx + 2], pool[headIdx + 3]);
				if (speed > MAX_SPEED) {
					pool[headIdx + 2] = (pool[headIdx + 2] / speed) * MAX_SPEED;
					pool[headIdx + 3] = (pool[headIdx + 3] / speed) * MAX_SPEED;
				}
				pool[headIdx] += pool[headIdx + 2];
				pool[headIdx + 1] += pool[headIdx + 3];
				// Keep threads inside bounds by resetting when head drifts too far.
				if (
					pool[headIdx] < -200 ||
					pool[headIdx] > innerWidth + 200 ||
					pool[headIdx + 1] < -200 ||
					pool[headIdx + 1] > innerHeight + 200
				) {
					const angle = Math.random() * Math.PI * 2;
					pool[headIdx] = goalX + Math.cos(angle) * 40;
					pool[headIdx + 1] = goalY + Math.sin(angle) * 40;
					for (let i = 1; i < thread.length; i++) {
						const idx = (thread.offset + i) * POINT_SIZE;
						pool[idx] = pool[headIdx] - Math.cos(angle) * i * SEGMENT_LENGTH;
						pool[idx + 1] = pool[headIdx + 1] - Math.sin(angle) * i * SEGMENT_LENGTH;
						pool[idx + 2] = 0;
						pool[idx + 3] = 0;
					}
				}
				// Apply fixed-length constraints
				for (let iteration = 0; iteration < CONSTRAINT_ITERATIONS; iteration++) {
					for (let i = 1; i < thread.length; i++) {
						const prevIdx = (thread.offset + i - 1) * POINT_SIZE;
						const idx = (thread.offset + i) * POINT_SIZE;
						const segDx = pool[idx] - pool[prevIdx];
						const segDy = pool[idx + 1] - pool[prevIdx + 1];
						const distance = Math.hypot(segDx, segDy) || 1;
						const scale = SEGMENT_LENGTH / distance;
						pool[idx] = pool[prevIdx] + segDx * scale;
						pool[idx + 1] = pool[prevIdx + 1] + segDy * scale;
					}
				}
				// When idle, gently push non-head segments outward
				if (idleFactor > 0) {
					const lengthFactor = Math.min(MIN_SEGMENTS / thread.length, 30);
					const driftStrength = 0.09 * idleFactor * lengthFactor;
					for (let i = 1; i < thread.length; i++) {
						const idx = (thread.offset + i) * POINT_SIZE;
						pool[idx] += thread.driftX * driftStrength;
						pool[idx + 1] += thread.driftY * driftStrength;
					}
				}
				// Draw
				context.strokeStyle = `hsla(${thread.hue}, 100%, 20%, 1)`;
				context.beginPath();
				context.moveTo(pool[headIdx], pool[headIdx + 1]);
				for (let i = 1; i < thread.length; i++) {
					const idx = (thread.offset + i) * POINT_SIZE;
					context.lineTo(pool[idx], pool[idx + 1]);
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
		<>
			<canvas
				ref={canvasRef}
				className="pointer-events-none fixed inset-0 z-0 h-full w-full"
				aria-hidden="true"
			/>
		</>
	);
}
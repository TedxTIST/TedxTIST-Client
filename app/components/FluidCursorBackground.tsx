"use client";

import { useEffect, useRef } from "react";


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
			// Debug: log workerUrl
			const workerUrl = new URL("./cursor.worker.ts", import.meta.url);
			console.log("[FluidCursorBackground] workerUrl:", workerUrl);
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const animationRef = useRef<number | null>(null);
	// State for cursor position
	const cursor = useRef({ x: 0, y: 0, moved: false });
	// Thread pool
	const threads = useRef<ThreadPool[]>([]);
	// All points for all threads
	const points = useRef<Float32Array | null>(null);

	// Utility: clamp
	function clamp(val: number, min: number, max: number) {
		return Math.max(min, Math.min(max, val));
	}

	// Initialize threads and points
	function initialize(width: number, height: number) {
		threads.current = [];
		const allPoints = new Float32Array(THREAD_COUNT * SEGMENT_COUNT * POINT_SIZE);
		let offset = 0;
		for (let i = 0; i < THREAD_COUNT; i++) {
			const angle = (i / THREAD_COUNT) * Math.PI * 2;
			const hue = (i / THREAD_COUNT) * 360;
			const initX = width / 2 + Math.cos(angle) * BUNDLE_RADIUS;
			const initY = height / 2 + Math.sin(angle) * BUNDLE_RADIUS;
			threads.current.push({
				offset,
				length: SEGMENT_COUNT,
				width: 1.5 + Math.sin(angle * 3) * 0.5,
				hue,
				driftX: Math.cos(angle) * 0.5,
				driftY: Math.sin(angle) * 0.5,
				targetOffsetX: 0,
				targetOffsetY: 0,
				initX,
				initY,
			});
			for (let j = 0; j < SEGMENT_COUNT; j++) {
				const idx = offset + j * POINT_SIZE;
				allPoints[idx + 0] = initX;
				allPoints[idx + 1] = initY;
				allPoints[idx + 2] = 0;
				allPoints[idx + 3] = 0;
			}
			offset += SEGMENT_COUNT * POINT_SIZE;
		}
		points.current = allPoints;
	}

	// Animation loop
	function animate(width: number, height: number) {
		if (!canvasRef.current || !points.current) return;
		const ctx = canvasRef.current.getContext("2d");
		if (!ctx) return;
		ctx.clearRect(0, 0, width, height);

		// Calculate bundle spread based on cursor velocity
		let spread = BUNDLE_RADIUS;
		if (cursor.current.moved) {
			// Optionally, you can use velocity for more dynamic spread
			spread = clamp(BUNDLE_RADIUS - 10, 24, BUNDLE_RADIUS);
		}

		// For each thread
		threads.current.forEach((thread, tIdx) => {
			const { offset, length, hue, width: threadWidth, driftX, driftY, initX, initY } = thread;
			// Head follows cursor
			const headIdx = offset;
			let px = points.current![headIdx + 0];
			let py = points.current![headIdx + 1];
			let vx = points.current![headIdx + 2];
			let vy = points.current![headIdx + 3];
			// Target is cursor + thread's drift
			const tx = cursor.current.x + driftX * spread;
			const ty = cursor.current.y + driftY * spread;
			let dx = tx - px;
			let dy = ty - py;
			vx += dx * FOLLOW_FORCE * 0.016;
			vy += dy * FOLLOW_FORCE * 0.016;
			// Damping
			vx *= DAMPING;
			vy *= DAMPING;
			// Clamp speed
			const speed = Math.sqrt(vx * vx + vy * vy);
			if (speed > MAX_SPEED) {
				vx = (vx / speed) * MAX_SPEED;
				vy = (vy / speed) * MAX_SPEED;
			}
			px += vx;
			py += vy;
			points.current![headIdx + 0] = px;
			points.current![headIdx + 1] = py;
			points.current![headIdx + 2] = vx;
			points.current![headIdx + 3] = vy;

			// Each segment follows previous
			for (let j = 1; j < length; j++) {
				const prevIdx = offset + (j - 1) * POINT_SIZE;
				const idx = offset + j * POINT_SIZE;
				let px2 = points.current![idx + 0];
				let py2 = points.current![idx + 1];
				let vx2 = points.current![idx + 2];
				let vy2 = points.current![idx + 3];
				const tx2 = points.current![prevIdx + 0];
				const ty2 = points.current![prevIdx + 1];
				let dx2 = tx2 - px2;
				let dy2 = ty2 - py2;
				vx2 += dx2 * FOLLOW_FORCE * 0.012;
				vy2 += dy2 * FOLLOW_FORCE * 0.012;
				vx2 *= DAMPING;
				vy2 *= DAMPING;
				px2 += vx2;
				py2 += vy2;
				points.current![idx + 0] = px2;
				points.current![idx + 1] = py2;
				points.current![idx + 2] = vx2;
				points.current![idx + 3] = vy2;
			}

			// Draw thread
			ctx.save();
			ctx.beginPath();
			ctx.moveTo(points.current![headIdx + 0], points.current![headIdx + 1]);
			for (let j = 1; j < length; j++) {
				const idx = offset + j * POINT_SIZE;
				ctx.lineTo(points.current![idx + 0], points.current![idx + 1]);
			}
			ctx.strokeStyle = `hsl(${hue}, 90%, 60%)`;
			ctx.lineWidth = threadWidth;
			ctx.globalAlpha = 0.18;
			ctx.stroke();
			ctx.restore();
		});
	}

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		let width = window.innerWidth;
		let height = window.innerHeight;
		canvas.width = width;
		canvas.height = height;
		initialize(width, height);

		// Mouse move handler
		function handleMove(e: MouseEvent) {
			cursor.current.x = e.clientX;
			cursor.current.y = e.clientY;
			cursor.current.moved = true;
		}
		window.addEventListener("mousemove", handleMove);

		// Resize handler
		function handleResize() {
			width = window.innerWidth;
			height = window.innerHeight;
			canvas.width = width;
			canvas.height = height;
			initialize(width, height);
		}
		window.addEventListener("resize", handleResize);

		// Animation loop
		function loop() {
			animate(width, height);
			animationRef.current = requestAnimationFrame(loop);
		}
		animationRef.current = requestAnimationFrame(loop);

		return () => {
			window.removeEventListener("mousemove", handleMove);
			window.removeEventListener("resize", handleResize);
			if (animationRef.current) cancelAnimationFrame(animationRef.current);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<canvas
			ref={canvasRef}
			className="pointer-events-none fixed inset-0 z-0 h-full w-full"
			aria-hidden="true"
		/>
	);
}
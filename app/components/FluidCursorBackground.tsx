"use client";

import { useEffect, useRef } from "react";
// @ts-ignore
import CursorWorker from "./cursor.worker.ts?worker";
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
	const animationRef = useRef<number | null>(null);
	const workerRef = useRef<Worker | null>(null);
	const sharedRef = useRef<Float32Array | null>(null);

	useEffect(() => {
		window.setFps ??= () => {};
		const canvas = canvasRef.current;
		if (!canvas) return;
		const context = canvas.getContext("2d");
		if (!context) return;

		// Calculate total points
		const totalPoints = THREAD_COUNT * SEGMENT_COUNT;
		const buffer = new SharedArrayBuffer(totalPoints * POINT_SIZE * 4);
		const shared = new Float32Array(buffer);
		sharedRef.current = shared;

		// Worker setup
		const worker = new CursorWorker();
		workerRef.current = worker;
		const sendConfig = () => {
			worker.postMessage({
				type: 'INIT',
				buffer,
				config: {
					THREAD_COUNT,
					SEGMENT_COUNT,
					FOLLOW_FORCE,
					DAMPING,
					CONSTRAINT_ITERATIONS,
					SEGMENT_LENGTH,
					BUNDLE_RADIUS,
					SPREAD_SENSITIVITY,
					MIN_SEGMENTS,
					width: window.innerWidth,
					height: window.innerHeight,
				},
			});
		};
		sendConfig();

		// Resize logic
		const resize = () => {
			const { innerWidth, innerHeight, devicePixelRatio } = window;
			canvas.width = innerWidth * devicePixelRatio;
			canvas.height = innerHeight * devicePixelRatio;
			canvas.style.width = `${innerWidth}px`;
			canvas.style.height = `${innerHeight}px`;
			context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
			worker.postMessage({ type: 'RESIZE', width: innerWidth, height: innerHeight });
		};
		resize();
		window.addEventListener("resize", resize);

		// Pointer events
		const pointerHandler = (e: PointerEvent) => {
			worker.postMessage({ type: 'POINTER', x: e.clientX, y: e.clientY, active: true });
		};
		const pointerLeave = () => {
			worker.postMessage({ type: 'POINTER', x: 0, y: 0, active: false });
		};
		window.addEventListener("pointermove", pointerHandler);
		window.addEventListener("pointerdown", pointerHandler);
		window.addEventListener("pointerleave", pointerLeave);

		// Render loop: just draw from shared memory
		const render = () => {
			animationRef.current = requestAnimationFrame(render);
			context.globalCompositeOperation = "destination-in";
			context.fillStyle = "rgba(172, 38, 38, 0)";
			context.fillRect(0, 0, canvas.width, canvas.height);
			context.globalCompositeOperation = "lighter";
			context.lineCap = "round";
			context.lineJoin = "round";
			// Draw all threads
			let offset = 0;
			for (let t = 0; t < THREAD_COUNT; t++) {
				context.strokeStyle = `hsla(${Math.random() * 15}, 100%, 20%, 1)`;
				context.beginPath();
				context.moveTo(shared[offset], shared[offset + 1]);
				for (let s = 1; s < SEGMENT_COUNT; s++) {
					const idx = offset + s * POINT_SIZE;
					context.lineTo(shared[idx], shared[idx + 1]);
				}
				context.stroke();
				offset += SEGMENT_COUNT * POINT_SIZE;
			}
		};
		render();

		return () => {
			if (animationRef.current) cancelAnimationFrame(animationRef.current);
			window.removeEventListener("resize", resize);
			window.removeEventListener("pointermove", pointerHandler);
			window.removeEventListener("pointerdown", pointerHandler);
			window.removeEventListener("pointerleave", pointerLeave);
			worker.terminate();
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
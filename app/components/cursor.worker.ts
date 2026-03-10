// cursor.worker.ts

let ctx: OffscreenCanvasRenderingContext2D | null = null;
let pool: Float32Array;
let threads: any[] = [];
let cursor = { x: 0, y: 0, active: false };
let constants: any = {};
let lastMoveTime = performance.now();

// Persistent physics state matching your reference
let smoothedSpeed = 0;
let spreadFactor = 1;
let prevCursorX = 0;
let prevCursorY = 0;

self.onmessage = (e) => {
  const { type, canvas, threadData, poolData, cursor: cursorData, width, height, constants: consts, timestamp } = e.data;
  
  if (type === 'INIT') {
    ctx = canvas.getContext('2d');
    threads = threadData;
    pool = poolData;
    if (width && height && ctx) {
      ctx.canvas.width = width;
      ctx.canvas.height = height;
    }
    constants = consts;
    prevCursorX = width * 0.5;
    prevCursorY = height * 0.5;
    render();
  }

  if (type === 'UPDATE_CURSOR') {
    cursor = cursorData;
    if (timestamp) lastMoveTime = timestamp;
  }

  if (type === 'RESIZE' && ctx) {
    ctx.canvas.width = width;
    ctx.canvas.height = height;
  }
};

function render() {
  if (!ctx || !constants) return;

  const {
    FOLLOW_FORCE,
    DAMPING,
    SEGMENT_LENGTH,
    MAX_SPEED,
    CONSTRAINT_ITERATIONS,
    MIN_SEGMENTS,
    POINT_SIZE,
    SPREAD_SENSITIVITY,
  } = constants;

  const { width, height } = ctx.canvas;

  // Matching your reference's "destination-in" clear for that specific trail fade
  ctx.globalCompositeOperation = "destination-in";
  ctx.fillStyle = "rgba(172, 38, 38, 0)"; // Your specific alpha clear
  ctx.fillRect(0, 0, width, height);

  ctx.globalCompositeOperation = "lighter";
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // --- PHYSICS SYNCED WITH REFERENCE ---
  const active = cursor.active;
  const baseGoalX = active ? cursor.x : prevCursorX;
  const baseGoalY = active ? cursor.y : prevCursorY;

  const dx_cursor = baseGoalX - prevCursorX;
  const dy_cursor = baseGoalY - prevCursorY;
  const currentSpeed = Math.hypot(dx_cursor, dy_cursor);

  prevCursorX = baseGoalX;
  prevCursorY = baseGoalY;

  smoothedSpeed = smoothedSpeed * 0.85 + currentSpeed * 0.15;
  const targetSpread = 1 - Math.min(smoothedSpeed / SPREAD_SENSITIVITY, 1);
  spreadFactor = spreadFactor * 0.9 + targetSpread * 0.1;

  const idleTime = performance.now() - lastMoveTime;
  const idleFactor = idleTime > 180 ? Math.min((idleTime - 180) / 1200, 1) : 0;

  for (let tIdx = 0; tIdx < threads.length; tIdx++) {
    const thread = threads[tIdx];
    const headIdx = thread.offset * POINT_SIZE;

    const goalX = active ? baseGoalX + thread.targetOffsetX * spreadFactor : thread.initX;
    const goalY = active ? baseGoalY + thread.targetOffsetY * spreadFactor : thread.initY;

    // Head movement
    let dx = goalX - pool[headIdx];
    let dy = goalY - pool[headIdx + 1];
    pool[headIdx + 2] += dx * FOLLOW_FORCE * 0.01;
    pool[headIdx + 3] += dy * FOLLOW_FORCE * 0.01;
    pool[headIdx + 2] += (Math.random() - 0.5) * 0.3;
    pool[headIdx + 3] += (Math.random() - 0.5) * 0.3;
    pool[headIdx + 2] *= DAMPING;
    pool[headIdx + 3] *= DAMPING;

    // Speed Cap
    const speed = Math.hypot(pool[headIdx + 2], pool[headIdx + 3]);
    if (speed > MAX_SPEED) {
      pool[headIdx + 2] = (pool[headIdx + 2] / speed) * MAX_SPEED;
      pool[headIdx + 3] = (pool[headIdx + 3] / speed) * MAX_SPEED;
    }

    pool[headIdx] += pool[headIdx + 2];
    pool[headIdx + 1] += pool[headIdx + 3];

    // Verlet Constraints
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

    // Idle drift
    if (idleFactor > 0) {
      const driftStrength = 0.09 * idleFactor * Math.min(MIN_SEGMENTS / thread.length, 30);
      for (let i = 1; i < thread.length; i++) {
        const idx = (thread.offset + i) * POINT_SIZE;
        pool[idx] += thread.driftX * driftStrength;
        pool[idx + 1] += thread.driftY * driftStrength;
      }
    }

    // DRAWING
    ctx.strokeStyle = `hsla(${thread.hue}, 100%, 20%, 1)`;
    ctx.beginPath();
    ctx.moveTo(pool[headIdx], pool[headIdx + 1]);
    for (let i = 1; i < thread.length; i++) {
      const idx = (thread.offset + i) * POINT_SIZE;
      ctx.lineTo(pool[idx], pool[idx + 1]);
    }
    ctx.stroke();
  }

  requestAnimationFrame(render);
}
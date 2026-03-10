// cursor.worker.ts


let ctx: OffscreenCanvasRenderingContext2D | null = null;
let pool: Float32Array;
let threads: any[] = [];
let cursor = { x: 0, y: 0, active: false };
let constants: any = {};
let lastMoveTime = performance.now();

// Persistent physics state
let smoothedSpeed = 0;
let spreadFactor = 1;
let prevCursorX = 0;
let prevCursorY = 0;
const hueMap = new Map<number, number[]>();

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
    if (consts) constants = consts;

    // Initialize persistent cursor position
    prevCursorX = ctx ? ctx.canvas.width * 0.5 : 0;
    prevCursorY = ctx ? ctx.canvas.height * 0.5 : 0;
    smoothedSpeed = 0;
    spreadFactor = 1;

    // Group threads by hue ONCE
    hueMap.clear();
    threads.forEach((t, i) => {
      const hue = Math.round(t.hue);
      if (!hueMap.has(hue)) hueMap.set(hue, []);
      hueMap.get(hue)!.push(i);
    });

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
  if (!ctx) return;
  // Physics constants
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
  // 1. Clear Canvas
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = "rgba(0, 0, 0, 0)";
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.globalCompositeOperation = "lighter";
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  // --- CALCULATE SPEED AND DYNAMIC SPREAD ---
  // For batching
  const { width, height } = ctx.canvas;
  // Calculate idle factor
  const idleTime = performance.now() - lastMoveTime;
  const idleFactor = idleTime > 180 ? Math.min((idleTime - 180) / 1200, 1) : 0;

  // Calculate speed and spread
  const dx = cursor.x - prevCursorX;
  const dy = cursor.y - prevCursorY;
  const currentSpeed = Math.hypot(dx, dy);
  smoothedSpeed = smoothedSpeed * 0.9 + currentSpeed * 0.1;
  const targetSpread = 1 - Math.min(smoothedSpeed / (constants?.SPREAD_SENSITIVITY || 1), 1);
  spreadFactor = spreadFactor * 0.95 + targetSpread * 0.05;
  prevCursorX = cursor.x;
  prevCursorY = cursor.y;
  // Physics and drawing
  for (const [hue, indices] of hueMap.entries()) {
    ctx.strokeStyle = `hsla(${hue}, 100%, 20%, 1)`;
    ctx.beginPath();
    for (const tIdx of indices) {
      const thread = threads[tIdx];
      const headIdx = thread.offset * POINT_SIZE;
      // Physics update
      // Use cursor position for speed tracking only when active.
      const baseGoalX = cursor.active ? cursor.x : prevCursorX;
      const baseGoalY = cursor.active ? cursor.y : prevCursorY;
      const goalX = cursor.active ? baseGoalX + thread.targetOffsetX * spreadFactor : thread.initX;
      const goalY = cursor.active ? baseGoalY + thread.targetOffsetY * spreadFactor : thread.initY;
      let dx = goalX - pool[headIdx];
      let dy = goalY - pool[headIdx + 1];
      pool[headIdx + 2] += dx * FOLLOW_FORCE * 0.01;
      pool[headIdx + 3] += dy * FOLLOW_FORCE * 0.01;
      pool[headIdx + 2] += (Math.random() - 0.5) * 0.3;
      pool[headIdx + 3] += (Math.random() - 0.5) * 0.3;
      pool[headIdx + 2] *= DAMPING;
      pool[headIdx + 3] *= DAMPING;
      const speed = Math.hypot(pool[headIdx + 2], pool[headIdx + 3]);
      if (speed > MAX_SPEED) {
        pool[headIdx + 2] = (pool[headIdx + 2] / speed) * MAX_SPEED;
        pool[headIdx + 3] = (pool[headIdx + 3] / speed) * MAX_SPEED;
      }
      pool[headIdx] += pool[headIdx + 2];
      pool[headIdx + 1] += pool[headIdx + 3];
      if (
        pool[headIdx] < -200 ||
        pool[headIdx] > width + 200 ||
        pool[headIdx + 1] < -200 ||
        pool[headIdx + 1] > height + 200
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
      if (idleFactor > 0) {
        const lengthFactor = Math.min(MIN_SEGMENTS / thread.length, 30);
        const driftStrength = 0.09 * idleFactor * lengthFactor;
        for (let i = 1; i < thread.length; i++) {
          const idx = (thread.offset + i) * POINT_SIZE;
          pool[idx] += thread.driftX * driftStrength;
          pool[idx + 1] += thread.driftY * driftStrength;
        }
      }
      // Batched drawing
      ctx.moveTo(pool[headIdx], pool[headIdx + 1]);
      for (let i = 1; i < thread.length; i++) {
        const idx = (thread.offset + i) * POINT_SIZE;
        ctx.lineTo(pool[idx], pool[idx + 1]);
      }
    }
    ctx.stroke();
  }
  requestAnimationFrame(render);
}

// cursor.worker.ts - Finalized Multi-threaded Physics Engine
// Optimized for tedxtist.in (Edition 2, 2026)

let ctx: OffscreenCanvasRenderingContext2D | null = null;
let pool: Float32Array;
let threads: any[] = [];
let cursor = { x: 0, y: 0, active: false };
let constants: any = {};
let lastMoveTime = performance.now();
let dpr = 1;

let smoothedSpeed = 0;
let spreadFactor = 1;
let prevCursorX = 0;
let prevCursorY = 0;

self.onmessage = (e) => {
  const { type, canvas, threadData, poolData, cursor: cursorData, width, height, constants: consts, dpr: deviceDpr } = e.data;
  
  if (type === 'INIT') {
    ctx = canvas.getContext('2d', { alpha: true });
    threads = threadData;
    pool = poolData;
    constants = consts;
    dpr = deviceDpr || 1;

    if (ctx) {
      ctx.canvas.width = width;
      ctx.canvas.height = height;
      ctx.scale(dpr, dpr);
    }
    render();
  }

  if (type === 'UPDATE_CURSOR') {
    cursor = cursorData;
    lastMoveTime = e.data.timestamp || performance.now();
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
    POINT_SIZE,
    SPREAD_SENSITIVITY, // RESTORED
  } = constants;

  const { width, height } = ctx.canvas;

  // 1. RESTORED CLEAR LOGIC (Ghosting/Trails)
  // Using 0.92 alpha creates the "Chaos" trails you're missing.
  ctx.globalCompositeOperation = "destination-in";
  ctx.fillStyle = "rgba(0, 0, 0, 0)"; 
  ctx.fillRect(0, 0, width / dpr, height / dpr);

  // 2. GLOW COMPOSITING
  ctx.globalCompositeOperation = "lighter";
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = 1.4;

  const active = cursor.active;
  const baseGoalX = active ? cursor.x : prevCursorX;
  const baseGoalY = active ? cursor.y : prevCursorY;

  // 3. RESTORED SPREAD SENSITIVITY
  const distToCursor = Math.hypot(baseGoalX - prevCursorX, baseGoalY - prevCursorY);
  smoothedSpeed = smoothedSpeed * 0.85 + distToCursor * 0.15;
  spreadFactor = spreadFactor * 0.9 + (1 - Math.min(smoothedSpeed / SPREAD_SENSITIVITY, 1)) * 0.1;
  
  prevCursorX = baseGoalX;
  prevCursorY = baseGoalY;

  for (let tIdx = 0; tIdx < threads.length; tIdx++) {
    const thread = threads[tIdx];
    const headIdx = thread.offset * POINT_SIZE;

    // Movement Toward Cursor with Spread Factor
    let goalX = active ? baseGoalX + thread.targetOffsetX * spreadFactor : pool[headIdx];
    let goalY = active ? baseGoalY + thread.targetOffsetY * spreadFactor : pool[headIdx + 1];

    // Physics Update
    pool[headIdx + 2] += (goalX - pool[headIdx]) * FOLLOW_FORCE * 0.01;
    pool[headIdx + 3] += (goalY - pool[headIdx + 1]) * FOLLOW_FORCE * 0.01;
    pool[headIdx + 2] *= DAMPING;
    pool[headIdx + 3] *= DAMPING;
    pool[headIdx] += pool[headIdx + 2];
    pool[headIdx + 1] += pool[headIdx + 3];

    // Verlet Constraints
    for (let it = 0; it < CONSTRAINT_ITERATIONS; it++) {
      for (let i = 1; i < thread.length; i++) {
        const p = (thread.offset + i - 1) * POINT_SIZE;
        const c = (thread.offset + i) * POINT_SIZE;
        const dx = pool[c] - pool[p], dy = pool[c + 1] - pool[p + 1];
        const dist = Math.hypot(dx, dy) || 1;
        const scale = SEGMENT_LENGTH / dist;
        pool[c] = pool[p] + dx * scale;
        pool[c + 1] = pool[p + 1] + dy * scale;
      }
    }

    // 4. RESTORED HSLA COLORS
    // 46% Lightness and 0.4 Alpha creates the vibrant TEDx Red glow.
    ctx.strokeStyle = `hsla(${thread.hue}, 100%, 46%, 0.4)`;
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
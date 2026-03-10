// cursor.worker.ts
// FluidCursorBackground physics engine in a Web Worker using SharedArrayBuffer

// Types for config
interface InitMessage {
  type: 'INIT';
  buffer: SharedArrayBuffer;
  config: {
    THREAD_COUNT: number;
    SEGMENT_COUNT: number;
    FOLLOW_FORCE: number;
    DAMPING: number;
    CONSTRAINT_ITERATIONS: number;
    SEGMENT_LENGTH: number;
    BUNDLE_RADIUS: number;
    SPREAD_SENSITIVITY: number;
    MIN_SEGMENTS: number;
    width: number;
    height: number;
  };
}

interface PointerMessage {
  type: 'POINTER';
  x: number;
  y: number;
  active: boolean;
}

interface ResizeMessage {
  type: 'RESIZE';
  width: number;
  height: number;
}

type WorkerMessage = InitMessage | PointerMessage | ResizeMessage;

// Physics state
let shared: Float32Array;
let config: InitMessage['config'];
let threads: ThreadMeta[] = [];
let pointer = { x: 0, y: 0, active: false };
let prevCursorX = 0;
let prevCursorY = 0;
let smoothedSpeed = 0;
let spreadFactor = 1;

// Thread meta for fast access
interface ThreadMeta {
  offset: number;
  length: number;
  targetOffsetX: number;
  targetOffsetY: number;
  driftX: number;
  driftY: number;
  initX: number;
  initY: number;
}

const POINT_SIZE = 4; // x, y, vx, vy

function bezier(t: number, w: number, h: number) {
  // Quadratic bezier: P0 (right entry) → P1 (X convergence) → P2 (left exit)
  const p0x = w * 1.10,  p0y = h * 0.38;
  const p1x = w * 0.38,  p1y = h * 0.42;
  const p2x = w * -0.12, p2y = h * 0.75;
  const u = 1 - t;
  return {
    x: u * u * p0x + 2 * u * t * p1x + t * t * p2x,
    y: u * u * p0y + 2 * u * t * p1y + t * t * p2y,
  };
}

function bezierTangent(t: number, w: number, h: number) {
  const p0x = w * 1.10,  p0y = h * 0.38;
  const p1x = w * 0.38,  p1y = h * 0.42;
  const p2x = w * -0.12, p2y = h * 0.75;
  const u = 1 - t;
  return {
    x: 2 * u * (p1x - p0x) + 2 * t * (p2x - p1x),
    y: 2 * u * (p1y - p0y) + 2 * t * (p2y - p1y),
  };
}

function seedThreads() {
  threads = [];
  let offset = 0;
  for (let i = 0; i < config.THREAD_COUNT; i++) {
    const segmentCount = config.MIN_SEGMENTS + Math.floor(Math.random() * (config.SEGMENT_COUNT - config.MIN_SEGMENTS + 1));
    const t = Math.random();
    const { x: strokeX, y: strokeY } = bezier(t, config.width, config.height);
    const { x: tx, y: ty } = bezierTangent(t, config.width, config.height);
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
    const offsetRadius = Math.random() * config.BUNDLE_RADIUS;
    const offsetTheta = Math.random() * Math.PI * 2;
    for (let j = 0; j < segmentCount; j++) {
      const idx = (offset + j) * POINT_SIZE;
      shared[idx] = startX - Math.cos(localAngle) * j * config.SEGMENT_LENGTH;
      shared[idx + 1] = startY - Math.sin(localAngle) * j * config.SEGMENT_LENGTH;
      shared[idx + 2] = 0;
      shared[idx + 3] = 0;
    }
    threads.push({
      offset,
      length: segmentCount,
      targetOffsetX: Math.cos(offsetTheta) * offsetRadius,
      targetOffsetY: Math.sin(offsetTheta) * offsetRadius,
      driftX: Math.cos(driftAngle),
      driftY: Math.sin(driftAngle),
      initX: startX,
      initY: startY,
    });
    offset += segmentCount;
  }
}

function updatePhysics() {
  // Spread dynamics
  const baseGoalX = pointer.active ? pointer.x : prevCursorX;
  const baseGoalY = pointer.active ? pointer.y : prevCursorY;
  const cursorDx = baseGoalX - prevCursorX;
  const cursorDy = baseGoalY - prevCursorY;
  const currentSpeed = Math.hypot(cursorDx, cursorDy);
  prevCursorX = baseGoalX;
  prevCursorY = baseGoalY;
  smoothedSpeed = smoothedSpeed * 0.85 + currentSpeed * 0.15;
  const targetSpread = 1 - Math.min(smoothedSpeed / config.SPREAD_SENSITIVITY, 1);
  spreadFactor = spreadFactor * 0.9 + targetSpread * 0.1;

  for (let tIdx = 0; tIdx < threads.length; tIdx++) {
    const thread = threads[tIdx];
    const headIdx = thread.offset * POINT_SIZE;
    // Target
    const goalX = pointer.active ? baseGoalX + thread.targetOffsetX * spreadFactor : thread.initX;
    const goalY = pointer.active ? baseGoalY + thread.targetOffsetY * spreadFactor : thread.initY;
    // Move head
    let dx = goalX - shared[headIdx];
    let dy = goalY - shared[headIdx + 1];
    shared[headIdx + 2] += dx * config.FOLLOW_FORCE * 0.01;
    shared[headIdx + 3] += dy * config.FOLLOW_FORCE * 0.01;
    shared[headIdx + 2] += (Math.random() - 0.5) * 0.3;
    shared[headIdx + 3] += (Math.random() - 0.5) * 0.3;
    shared[headIdx + 2] *= config.DAMPING;
    shared[headIdx + 3] *= config.DAMPING;
    const speed = Math.hypot(shared[headIdx + 2], shared[headIdx + 3]);
    if (speed > 100) {
      shared[headIdx + 2] = (shared[headIdx + 2] / speed) * 100;
      shared[headIdx + 3] = (shared[headIdx + 3] / speed) * 100;
    }
    shared[headIdx] += shared[headIdx + 2];
    shared[headIdx + 1] += shared[headIdx + 3];
    // Bounds reset
    if (
      shared[headIdx] < -200 ||
      shared[headIdx] > config.width + 200 ||
      shared[headIdx + 1] < -200 ||
      shared[headIdx + 1] > config.height + 200
    ) {
      const angle = Math.random() * Math.PI * 2;
      shared[headIdx] = goalX + Math.cos(angle) * 40;
      shared[headIdx + 1] = goalY + Math.sin(angle) * 40;
      for (let i = 1; i < thread.length; i++) {
        const idx = (thread.offset + i) * POINT_SIZE;
        shared[idx] = shared[headIdx] - Math.cos(angle) * i * config.SEGMENT_LENGTH;
        shared[idx + 1] = shared[headIdx + 1] - Math.sin(angle) * i * config.SEGMENT_LENGTH;
        shared[idx + 2] = 0;
        shared[idx + 3] = 0;
      }
    }
    // Constraints
    for (let iter = 0; iter < config.CONSTRAINT_ITERATIONS; iter++) {
      for (let i = 1; i < thread.length; i++) {
        const prevIdx = (thread.offset + i - 1) * POINT_SIZE;
        const idx = (thread.offset + i) * POINT_SIZE;
        const segDx = shared[idx] - shared[prevIdx];
        const segDy = shared[idx + 1] - shared[prevIdx + 1];
        const distance = Math.hypot(segDx, segDy) || 1;
        const scale = config.SEGMENT_LENGTH / distance;
        shared[idx] = shared[prevIdx] + segDx * scale;
        shared[idx + 1] = shared[prevIdx + 1] + segDy * scale;
      }
    }
    // Idle drift
    if (!pointer.active) {
      const lengthFactor = Math.min(config.MIN_SEGMENTS / thread.length, 30);
      const driftStrength = 0.09 * lengthFactor;
      for (let i = 1; i < thread.length; i++) {
        const idx = (thread.offset + i) * POINT_SIZE;
        shared[idx] += thread.driftX * driftStrength;
        shared[idx + 1] += thread.driftY * driftStrength;
      }
    }
  }
}

function loop() {
  updatePhysics();
  setTimeout(loop, 16); // ~60Hz
}

self.onmessage = function (e: MessageEvent<WorkerMessage>) {
  const msg = e.data;
  if (msg.type === 'INIT') {
    config = msg.config;
    shared = new Float32Array(msg.buffer);
    seedThreads();
    loop();
  } else if (msg.type === 'POINTER') {
    pointer.x = msg.x;
    pointer.y = msg.y;
    pointer.active = msg.active;
  } else if (msg.type === 'RESIZE') {
    config.width = msg.width;
    config.height = msg.height;
    seedThreads();
  }
};

import { createBounds } from "./canvas";

export const state = {
  bounds: createBounds(),
  elapsedSeconds: 0,
  stats: {
    fps: 0,
    maxUpdateMs: 0,
    maxDrawMs: 0,
    heapMb: 0,
    heapDeltaMb: 0,
  },
  settings: {
    poolSize: 100,
    particlesPerSecond: 100,
    memoryMode: "push" as "push" | "ring",
    drawMode: "batched" as "none" | "batched" | "single" | "composited",
  },
  spawnAccumulator: 0,
  nextParticleIndex: 0,
  particles: Array.from({ length: 100 }, () => ({
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    age: 0,
    life: 1,
    fromSize: 0,
    toSize: 0,
    fromOpacity: 0,
    toOpacity: 0,
  })),
};

export type State = typeof state;
export type Particle = (typeof state.particles)[number];

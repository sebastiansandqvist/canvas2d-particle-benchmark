import { createBounds } from "./canvas";

export const state = {
  bounds: createBounds(),
  elapsedSeconds: 0,
  stats: {
    currentSecond: 0,
    update: {
      currentMaxMs: 0, // for next second's calculations
      prevMaxMs: 0, // gets printed
    },
    draw: {
      currentMaxMs: 0, // for next second's calculations
      prevMaxMs: 0, // gets printed
    },
    // fps: {
    //   accumulator: 0,
    //   frames: 0, // number of ticks
    //   prevFramesPerSecond: 0,
    // },
    // maxUpdateMs: 0,
    // maxDrawMs: 0,
    // heapMb: 0,
    // heapDeltaMb: 0,
  },
  settings: {
    poolSize: 100,
    particlesPerSecond: 100,
    // heapJunk: 100MB junk at a time
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
    life: 0,
    fromSize: 0,
    toSize: 0,
    fromOpacity: 0,
    toOpacity: 0,
  })),
};

// todo: add free index buffer and a new slider for "particle lifetime random range" and new memory management "mode"
// free: [] as number[],
// update
// if (needToEmitNow) {
//   const nextFreeIndex = state.free.pop();
//   emitParticle(state.particles[nextFreeIndex]);
// }

export type State = typeof state;
export type Particle = (typeof state.particles)[number];
export type Stats = (typeof state)["stats"];

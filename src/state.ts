import { createBounds } from "./canvas";

export function createParticle(x: number, y: number, life: number) {
  return {
    x,
    y,
    vx: 0,
    vy: 0,
    age: 0,
    life,
    fromSize: 0,
    toSize: 0,
    fromOpacity: 0,
    toOpacity: 0,
  };
}

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
    particleLife: 2,
    // heapJunk: 100MB junk at a time
    memoryMode: "ring" as "push" | "ring",
    drawMode: "batched" as "none" | "batched" | "single" | "composited",
  },
  spawnAccumulator: 0,
  nextParticleIndex: 0,
  particles: Array.from({ length: 100 }, () => createParticle(0, 0, 0)),
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

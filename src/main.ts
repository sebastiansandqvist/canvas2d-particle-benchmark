/*
  main.ts is the main entry point for your game.
*/

import { scaleAndObserveCanvasSize } from "./canvas";
import { gameLoop } from "./gameLoop";
import { render, update } from "./gameplay";
import { state } from "./state";

const canvas = document.createElement("canvas");
document.body.appendChild(canvas);

const ctx = canvas.getContext("2d", { alpha: false })!;
scaleAndObserveCanvasSize(ctx, state.bounds);

gameLoop({ ctx, state, update, render });

const elements = {
  poolSizeInput: document.getElementById("pool-size") as HTMLInputElement,
  spawnRateInput: document.getElementById("spawn-rate") as HTMLInputElement,
  poolSizeOutput: document.getElementById("pool-size-output") as HTMLOutputElement,
  spawnRateOutput: document.getElementById("spawn-rate-output") as HTMLOutputElement,
};

elements.poolSizeInput.oninput = () => {
  const poolSize = elements.poolSizeInput.valueAsNumber;
  state.settings.poolSize = poolSize;
  elements.poolSizeOutput.textContent = `${poolSize}`;
  state.particles = Array.from({ length: poolSize }, () => ({
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
  }));
  state.nextParticleIndex = 0;
};

elements.spawnRateInput.oninput = () => {
  const spawnRate = elements.spawnRateInput.valueAsNumber;
  state.settings.particlesPerSecond = spawnRate;
  elements.spawnRateOutput.textContent = `${spawnRate} particles per second`;
};

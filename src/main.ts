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

function createParticle() {
  return {
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    age: 0,
    life: 2,
    fromSize: 0,
    toSize: 0,
    fromOpacity: 0,
    toOpacity: 0,
  };
}

// log scale range input values instead of linear
function getScaledValue(input: HTMLInputElement) {
  const t = input.valueAsNumber / 1000;
  return Math.round(1_000_000 ** t);
}

function applyPoolSize(poolSize: number) {
  state.settings.poolSize = poolSize;
  elements.poolSizeOutput.textContent = `${poolSize}`;
  state.particles = Array.from({ length: poolSize }, createParticle);
  state.nextParticleIndex = 0;
}

function applySpawnRate(spawnRate: number) {
  state.settings.particlesPerSecond = spawnRate;
  elements.spawnRateOutput.textContent = `${spawnRate} particles per second`;

  if (state.settings.poolSize < spawnRate) {
    elements.poolSizeInput.value = elements.spawnRateInput.value;
    applyPoolSize(spawnRate);
  }
}

function syncPoolSize() {
  const requestedPoolSize = getScaledValue(elements.poolSizeInput);
  const poolSize = Math.max(requestedPoolSize, state.settings.particlesPerSecond);

  if (poolSize !== requestedPoolSize) {
    elements.poolSizeInput.value = elements.spawnRateInput.value;
  }

  applyPoolSize(poolSize);
}

function syncSpawnRate() {
  const spawnRate = getScaledValue(elements.spawnRateInput);
  applySpawnRate(spawnRate);
}

elements.poolSizeInput.oninput = syncPoolSize;
elements.spawnRateInput.oninput = syncSpawnRate;

syncPoolSize();
syncSpawnRate();

import { createParticle, state } from "./state";

export function initDom() {
  const elements = {
    poolSizeInput: document.getElementById("pool-size") as HTMLInputElement,
    spawnRateInput: document.getElementById("spawn-rate") as HTMLInputElement,
    particleLifeInput: document.getElementById("particle-life") as HTMLInputElement,
    poolSizeOutput: document.getElementById("pool-size-output") as HTMLOutputElement,
    spawnRateOutput: document.getElementById("spawn-rate-output") as HTMLOutputElement,
    particleLifeOutput: document.getElementById("particle-life-output") as HTMLOutputElement,
    drawModeInput: document.getElementById("draw-mode") as HTMLSelectElement,
    memoryModeInput: document.getElementById("memory-mode") as HTMLSelectElement,
  };

  // log scale range input values instead of linear
  function getScaledValue(input: HTMLInputElement) {
    const t = input.valueAsNumber / 1000;
    return Math.round(1_000_000 ** t);
  }

  function applyPoolSize(poolSize: number) {
    state.settings.poolSize = poolSize;
    elements.poolSizeOutput.textContent = `${poolSize}`;
    state.particles = Array.from({ length: poolSize }, () => createParticle(0, 0, 0));
    state.nextParticleIndex = 0;
  }

  function applySpawnRate(spawnRate: number) {
    state.settings.particlesPerSecond = spawnRate;
    elements.spawnRateOutput.textContent = `${spawnRate} particles per second`;

    const minimumPoolSize = Math.ceil(spawnRate * state.settings.particleLife);

    if (state.settings.poolSize < minimumPoolSize && state.settings.memoryMode === "ring") {
      const t = Math.log(minimumPoolSize) / Math.log(1_000_000);
      elements.poolSizeInput.value = `${Math.round(t * 1000)}`;
      applyPoolSize(minimumPoolSize);
    }
  }

  function syncPoolSize() {
    const requestedPoolSize = getScaledValue(elements.poolSizeInput);
    const poolSize = state.settings.memoryMode === "push" ? 0 : requestedPoolSize;
    applyPoolSize(poolSize);
  }

  function syncSpawnRate() {
    const spawnRate = getScaledValue(elements.spawnRateInput);
    applySpawnRate(spawnRate);
  }

  function syncParticleLife() {
    state.settings.particleLife = elements.particleLifeInput.valueAsNumber;
    elements.particleLifeOutput.textContent = `${state.settings.particleLife.toFixed(1)} seconds`;
    applySpawnRate(state.settings.particlesPerSecond);
  }

  elements.poolSizeInput.oninput = syncPoolSize;
  elements.spawnRateInput.oninput = syncSpawnRate;
  elements.particleLifeInput.oninput = syncParticleLife;
  elements.drawModeInput.oninput = () => {
    const value = elements.drawModeInput.value;
    state.settings.drawMode = value as typeof state.settings.drawMode;
  };
  elements.memoryModeInput.oninput = () => {
    const value = elements.memoryModeInput.value;
    state.settings.memoryMode = value as typeof state.settings.memoryMode;
    elements.poolSizeInput.disabled = state.settings.memoryMode === "push";

    if (state.settings.memoryMode === "push") {
      elements.poolSizeInput.value = "0";
      applyPoolSize(0);
      return;
    }

    syncSpawnRate();
  };

  elements.drawModeInput.value = state.settings.drawMode;
  elements.memoryModeInput.value = state.settings.memoryMode;
  elements.particleLifeInput.value = `${state.settings.particleLife}`;

  syncPoolSize();
  syncParticleLife();
  syncSpawnRate();
}

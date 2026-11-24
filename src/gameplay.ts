import { createParticle, type Particle, type State } from "./state";
import { lerp, random } from "./utils";

function ringBufferEmit(state: State) {
  const particle = state.particles[state.nextParticleIndex]!;
  initParticle(particle, state.bounds.centerX, state.bounds.centerY, state.settings.particleLife);
  state.nextParticleIndex = (state.nextParticleIndex + 1) % state.particles.length;
}

function packedPoolEmit(state: State) {
  if (state.liveCount === state.particles.length) return;
  const particle = state.particles[state.liveCount]!;
  initParticle(particle, state.bounds.centerX, state.bounds.centerY, state.settings.particleLife);
  state.liveCount++;
}

function pushAndFilterEmit(state: State) {
  const particle = createParticle(
    state.bounds.centerX,
    state.bounds.centerY,
    state.settings.particleLife,
  );
  initParticle(particle, state.bounds.centerX, state.bounds.centerY, state.settings.particleLife);
  state.particles.push(particle);
}

const emitByMode = { ring: ringBufferEmit, packed: packedPoolEmit, push: pushAndFilterEmit };

function updatePackedPool(state: State, dt: number) {
  const { particles } = state;
  let i = 0;
  while (i < state.liveCount) {
    const particle = particles[i]!;
    if (stepParticle(particle, dt)) {
      i++;
    } else {
      state.liveCount--;
      particles[i] = particles[state.liveCount]!;
      particles[state.liveCount] = particle;
      // the particle that was moved into slot i still needs its update
    }
  }
}

export function update(state: State, dt: number) {
  const updateStartTime = performance.now();
  const currentSecond = Math.floor(updateStartTime / 1000);

  if (state.stats.currentSecond !== currentSecond) {
    state.stats.currentSecond = currentSecond;
    state.stats.update.prevMaxMs = state.stats.update.currentMaxMs;
    state.stats.update.currentMaxMs = 0;
    state.stats.draw.prevMaxMs = state.stats.draw.currentMaxMs;
    state.stats.draw.currentMaxMs = 0;
  }

  state.elapsedSeconds += dt;
  state.spawnAccumulator += dt;
  const interval = 1 / state.settings.particlesPerSecond;
  const mode = state.settings.memoryMode;
  const emit = emitByMode[mode];
  while (state.spawnAccumulator >= interval) {
    emit(state);
    state.spawnAccumulator -= interval;
  }

  if (mode === "packed") {
    updatePackedPool(state, dt);
  } else {
    for (const particle of state.particles) {
      if (particle.age >= particle.life) continue;
      stepParticle(particle, dt);
    }

    if (mode === "push") {
      state.particles = state.particles.filter((particle) => particle.age < particle.life);
    }
  }

  const updateDeltaTime = performance.now() - updateStartTime;
  state.stats.update.currentMaxMs = Math.max(state.stats.update.currentMaxMs, updateDeltaTime);
}

const COLOR = "orange";

function drawParticlesBatched(
  ctx: CanvasRenderingContext2D,
  particles: Particle[],
  count: number,
  checkLife: boolean,
) {
  ctx.beginPath();
  for (let i = 0; i < count; i++) {
    const particle = particles[i]!;
    if (checkLife && particle.age >= particle.life) continue;
    const t = particle.age / particle.life;
    const size = lerp(particle.fromSize, particle.toSize, t);
    const half = size / 2;
    ctx.rect(particle.x - half, particle.y - half, size, size);
  }
  ctx.fillStyle = COLOR;
  ctx.fill();
}

function drawParticlesSingle(
  ctx: CanvasRenderingContext2D,
  particles: Particle[],
  count: number,
  checkLife: boolean,
) {
  ctx.fillStyle = COLOR;
  for (let i = 0; i < count; i++) {
    const particle = particles[i]!;
    if (checkLife && particle.age >= particle.life) continue;
    const t = particle.age / particle.life;
    const size = lerp(particle.fromSize, particle.toSize, t);
    const half = size / 2;
    ctx.fillRect(particle.x - half, particle.y - half, size, size);
  }
}

function drawParticlesComposited(
  ctx: CanvasRenderingContext2D,
  particles: Particle[],
  count: number,
  checkLife: boolean,
) {
  ctx.fillStyle = COLOR;
  for (let i = 0; i < count; i++) {
    const particle = particles[i]!;
    if (checkLife && particle.age >= particle.life) continue;
    const t = particle.age / particle.life;
    const size = lerp(particle.fromSize, particle.toSize, t);
    const opacity = lerp(particle.fromOpacity, particle.toOpacity, t);
    const half = size / 2;
    ctx.globalAlpha = opacity;
    ctx.globalCompositeOperation = "lighter";
    ctx.fillRect(particle.x - half, particle.y - half, size, size);
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
}

export function render(state: State, ctx: CanvasRenderingContext2D) {
  const drawStartTime = performance.now();

  const { width, height } = state.bounds;
  ctx.clearRect(0, 0, width, height);

  const { particles } = state;
  const mode = state.settings.memoryMode;
  const count = mode === "packed" ? state.liveCount : particles.length;
  const checkLife = mode === "ring";
  switch (state.settings.drawMode) {
    case "none": {
      break;
    }
    case "batched": {
      drawParticlesBatched(ctx, particles, count, checkLife);
      break;
    }
    case "single": {
      drawParticlesSingle(ctx, particles, count, checkLife);
      break;
    }
    case "composited": {
      drawParticlesComposited(ctx, particles, count, checkLife);
      break;
    }
  }

  const drawDeltaTime = performance.now() - drawStartTime;
  state.stats.draw.currentMaxMs = Math.max(state.stats.draw.currentMaxMs, drawDeltaTime);

  // write the stats
  ctx.font = "14px monospace";
  ctx.fillStyle = "white";
  let y = 40;
  ctx.fillText(`Update ········ ${state.stats.update.prevMaxMs.toFixed(2)}ms`, width - 220, y);
  y += 20;
  ctx.fillText(`Draw ·········· ${state.stats.draw.prevMaxMs.toFixed(2)}ms`, width - 220, y);
  y += 30;
  ctx.globalAlpha = 0.5;
  ctx.fillText("(Open devtools for FPS)", width - 220, y);
  ctx.globalAlpha = 1;
  // y += 20;
  // ctx.fillText("Heap size ····· ", width - 220, y);
}

function stepParticle(p: Particle, dt: number) {
  p.age += dt;
  if (p.age >= p.life) return false;
  p.x += p.vx * dt;
  p.y += p.vy * dt;
  return true;
}

function initParticle(particle: Particle, x: number, y: number, life: number) {
  const angle = random(0, Math.PI * 2);
  const speed = random(0, 100);

  particle.x = x;
  particle.y = y;
  particle.vx = Math.cos(angle) * speed;
  particle.vy = Math.sin(angle) * speed;
  particle.age = 0;
  particle.life = life;
  particle.fromOpacity = 1;
  particle.toOpacity = 0;
  particle.fromSize = random(3, 6);
  particle.toSize = 0;
}

import type { Particle, State } from "./state";

function ringBufferEmit(state: State) {
  const particle = state.particles[state.nextParticleIndex]!;
  initParticle(particle, state.bounds.centerX, state.bounds.centerY);
  state.nextParticleIndex = (state.nextParticleIndex + 1) % state.particles.length;
}

function pushAndFilterEmit(state: State) {
  state.particles.push(createParticle(state.bounds.centerX, state.bounds.centerY));
}

function createParticle(x: number, y: number) {
  const angle = random(0, Math.PI * 2);
  const speed = random(0, 100);
  return {
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    age: 0,
    life: 2,
    fromSize: random(3, 6),
    toSize: 0,
    fromOpacity: 1,
    toOpacity: 0,
  };
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
  const emit = state.settings.memoryMode === "ring" ? ringBufferEmit : pushAndFilterEmit;
  while (state.spawnAccumulator >= interval) {
    emit(state);
    state.spawnAccumulator -= interval;
  }

  for (const particle of state.particles) {
    if (particle.age >= particle.life) continue;
    stepParticle(particle, dt);
  }

  if (state.settings.memoryMode === "push") {
    state.particles = state.particles.filter((particle) => particle.age < particle.life);
  }

  const updateDeltaTime = performance.now() - updateStartTime;
  state.stats.update.currentMaxMs = Math.max(state.stats.update.currentMaxMs, updateDeltaTime);
}

const COLOR = "orange";

function drawParticlesBatched(state: State, ctx: CanvasRenderingContext2D) {
  ctx.beginPath();
  for (const particle of state.particles) {
    if (particle.age >= particle.life) continue;
    const t = particle.age / particle.life;
    const size = lerp(particle.fromSize, particle.toSize, t);
    const half = size / 2;
    ctx.rect(particle.x - half, particle.y - half, size, size);
  }
  ctx.fillStyle = COLOR;
  ctx.fill();
}

function drawParticlesSingle(state: State, ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = COLOR;
  for (const particle of state.particles) {
    if (particle.age >= particle.life) continue;
    const t = particle.age / particle.life;
    const size = lerp(particle.fromSize, particle.toSize, t);
    const half = size / 2;
    ctx.fillRect(particle.x - half, particle.y - half, size, size);
  }
}

function drawParticlesComposited(state: State, ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = COLOR;
  for (const particle of state.particles) {
    if (particle.age >= particle.life) continue;
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

  switch (state.settings.drawMode) {
    case "none": {
      break;
    }
    case "batched": {
      drawParticlesBatched(state, ctx);
      break;
    }
    case "single": {
      drawParticlesSingle(state, ctx);
      break;
    }
    case "composited": {
      drawParticlesComposited(state, ctx);
      break;
    }
  }

  const drawDeltaTime = performance.now() - drawStartTime;
  state.stats.draw.currentMaxMs = Math.max(state.stats.draw.currentMaxMs, drawDeltaTime);

  // write the stats
  ctx.font = "14px monospace";
  ctx.fillStyle = "white";
  let y = 40;
  // ctx.fillText(`FPS ··········· ${state.stats.fps.prevFramesPerSecond}`, width - 220, y);
  // y += 20;
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
  if (p.age >= p.life) return;
  p.x += p.vx * dt;
  p.y += p.vy * dt;
}

function initParticle(particle: Particle, x: number, y: number) {
  const angle = random(0, Math.PI * 2);
  const speed = random(0, 100);

  particle.x = x;
  particle.y = y;
  particle.vx = Math.cos(angle) * speed;
  particle.vy = Math.sin(angle) * speed;
  particle.age = 0;
  particle.life = 2;
  particle.fromOpacity = 1;
  particle.toOpacity = 0;
  particle.fromSize = random(3, 6);
  particle.toSize = 0;
}

function random(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

import type { Particle, State } from "./state";

export function update(state: State, dt: number) {
  state.elapsedSeconds += dt;
  state.spawnAccumulator += dt;
  const interval = 1 / state.settings.particlesPerSecond;
  while (state.spawnAccumulator >= interval) {
    emit(state);
    state.spawnAccumulator -= interval;
  }
  for (const particle of state.particles) {
    if (particle.age >= particle.life) continue;
    stepParticle(particle, dt);
  }
}

const COLOR = "orange";

function drawParticlesBatched(state: State, ctx: CanvasRenderingContext2D) {
  // draw particles
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

export function render(state: State, ctx: CanvasRenderingContext2D) {
  const { width, height, centerX, centerY } = state.bounds;
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
      // todo:
      break;
    }
    case "composited": {
      // todo:
      break;
    }
  }

  // write some text
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "48px sans-serif";
  ctx.fillStyle = "white";
  ctx.fillText("hello", centerX, centerY);
}

function stepParticle(p: Particle, dt: number) {
  p.age += dt;
  if (p.age >= p.life) return;
  p.x += p.vx * dt;
  p.y += p.vy * dt;
}

function emit(state: State) {
  const particle = state.particles[state.nextParticleIndex]!;
  initParticle(particle, state.bounds.centerX, state.bounds.centerY);
  state.nextParticleIndex = (state.nextParticleIndex + 1) % state.particles.length;
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

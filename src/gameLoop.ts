type GameLoopConfig<State> = {
  ctx: CanvasRenderingContext2D;
  state: State;
  update: (state: State, dt: number) => void;
  render: (state: State, ctx: CanvasRenderingContext2D) => void;
  fixedDeltaTime?: number;
};

export function gameLoop<State>({
  ctx,
  state,
  update,
  render,
  fixedDeltaTime = 8 / 1000,
}: GameLoopConfig<State>) {
  let lastFrameTime: number | null = null;
  let accumulator = 0;

  function tick(now: number) {
    if (lastFrameTime === null) {
      lastFrameTime = now;
    }

    const elapsed = now - lastFrameTime;
    const dt = Math.min(elapsed / 1000, 0.1);
    lastFrameTime = now;

    {
      accumulator += dt;
      while (accumulator >= fixedDeltaTime) {
        update(state, fixedDeltaTime);
        accumulator -= fixedDeltaTime;
      }
    }

    render(state, ctx);
    requestAnimationFrame(tick);
  }

  render(state, ctx);
  requestAnimationFrame(tick);
}

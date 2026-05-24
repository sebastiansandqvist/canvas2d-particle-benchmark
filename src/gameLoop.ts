// import { Stats } from "./state";

type GameLoopConfig<State> = {
  ctx: CanvasRenderingContext2D;
  state: State;
  update?: (state: State, dt: number) => void;
  fixedUpdate?: (state: State, dt: number) => void;
  render: (state: State, ctx: CanvasRenderingContext2D) => void;
  fixedDeltaTime?: number;
};

export function gameLoop<State>({
  ctx,
  state,
  update,
  fixedUpdate,
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
    const dt = elapsed / 1000;
    // const stats = (state as any).stats as Stats;
    lastFrameTime = now;

    if (fixedUpdate) {
      {
        accumulator += dt;
        // stats.fps.accumulator += elapsed / 1000;
        while (accumulator >= fixedDeltaTime) {
          fixedUpdate(state, fixedDeltaTime);
          accumulator -= fixedDeltaTime;
        }
      }
    }

    update?.(state, dt);

    // todo: think about this a bit more, and probably fix.
    // if (stats.fps.accumulator >= 1) {
    //   stats.fps.accumulator -= 1;
    //   stats.fps.prevFramesPerSecond = stats.fps.frames;
    //   stats.fps.frames = 0;
    // }

    render(state, ctx);
    // stats.fps.frames++;
    requestAnimationFrame(tick);
  }

  render(state, ctx);
  requestAnimationFrame(tick);
}

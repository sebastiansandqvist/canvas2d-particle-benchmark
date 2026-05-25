import { scaleAndObserveCanvasSize } from "./canvas";
import { initDom } from "./dom";
import { gameLoop } from "./gameLoop";
import { render, update } from "./gameplay";
import { state } from "./state";

const canvas = document.createElement("canvas");
document.body.appendChild(canvas);

const ctx = canvas.getContext("2d", { alpha: false })!;
scaleAndObserveCanvasSize(ctx, state.bounds);

gameLoop({ ctx, state, update, render });
initDom();

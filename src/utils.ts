export function random(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

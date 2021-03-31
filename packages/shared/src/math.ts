
const rand_range = function (a: number, b: number): number {
  return Math.random() * (b - a) + a;
}

const rand_normalish = function (): number {
  const r = Math.random() + Math.random() + Math.random() + Math.random();
  return (r / 4.0) * 2.0 - 1;
}

const rand_int = function (a: number, b: number): number {
  return Math.round(Math.random() * (b - a) + a);
}

const lerp = function (x: number, a: number, b: number): number {
  return x * (b - a) + a;
}

const smoothstep = function (x: number, a: number, b: number): number {
  x = x * x * (3.0 - 2.0 * x);
  return x * (b - a) + a;
}

const smootherstep = function (x: number, a: number, b: number): number {
  x = x * x * x * (x * (x * 6 - 15) + 10);
  return x * (b - a) + a;
}

const clamp = function (x: number, a: number, b: number): number {
  return Math.min(Math.max(x, a), b);
}

const sat = function (x: number): number {
  return Math.min(Math.max(x, 0.0), 1.0);
}

const in_range = (x: number, a: number, b: number):boolean => {
  return x >= a && x <= b;
}

export {
  rand_range,
  rand_int,
  rand_normalish,
  lerp,
  smoothstep,
  smootherstep,
  clamp,
  sat,
  in_range,
}
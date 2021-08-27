export function rand_range(a, b) {
  return Math.random() * (b - a) + a;
}

export function rand_normalish() {
  const r = Math.random() + Math.random() + Math.random() + Math.random();
  return (r / 4.0) * 2.0 - 1;
}

export function rand_int(a, b) {
  return Math.round(Math.random() * (b - a) + a);
}

export function lerp(x, a, b) {
  return x * (b - a) + a;
}

export function smoothstep(x, a, b) {
  x = x * x * (3.0 - 2.0 * x);
  return x * (b - a) + a;
}

export function smootherstep(x, a, b) {
  x = x * x * x * (x * (x * 6 - 15) + 10);
  return x * (b - a) + a;
}

export function clamp(x, a, b) {
  return Math.min(Math.max(x, a), b);
}

export function sat(x) {
  return Math.min(Math.max(x, 0.0), 1.0);
}

export const in_range = (x, a, b) => {
  return x >= a && x <= b;
}


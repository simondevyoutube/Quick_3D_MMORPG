export const math = (function() {
  return {
    rand_range: function(a, b) {
      return Math.random() * (b - a) + a;
    },

    rand_normalish: function() {
      const r = Math.random() + Math.random() + Math.random() + Math.random();
      return (r / 4.0) * 2.0 - 1;
    },

    rand_int: function(a, b) {
      return Math.round(Math.random() * (b - a) + a);
    },

    lerp: function(x, a, b) {
      return x * (b - a) + a;
    },

    smoothstep: function(x, a, b) {
      x = x * x * (3.0 - 2.0 * x);
      return x * (b - a) + a;
    },

    smootherstep: function(x, a, b) {
      x = x * x * x * (x * (x * 6 - 15) + 10);
      return x * (b - a) + a;
    },

    clamp: function(x, a, b) {
      return Math.min(Math.max(x, a), b);
    },

    sat: function(x) {
      return Math.min(Math.max(x, 0.0), 1.0);
    },

    in_range: (x, a, b) => {
      return x >= a && x <= b;
    },
  };
})();

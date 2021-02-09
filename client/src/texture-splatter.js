import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.124/build/three.module.js';


import {math} from '/shared/math.mjs';
import {spline} from '/shared/spline.mjs';
import {terrain_constants} from '/shared/terrain-constants.mjs';


export const texture_splatter = (function() {

  const _HEIGHT_NORMALIZATION = terrain_constants.NOISE_HEIGHT / 10.0;

  const _WHITE = new THREE.Color(0x808080);

  const _DEEP_OCEAN = new THREE.Color(0x20020FF);
  const _SHALLOW_OCEAN = new THREE.Color(0x8080FF);
  const _BEACH = new THREE.Color(0xd9d592);
  const _SNOW = new THREE.Color(0xFFFFFF);
  const _FOREST_BOREAL = new THREE.Color(0x29c100);
  
  const _GREEN = new THREE.Color(0x80FF80);
  const _RED = new THREE.Color(0xFF8080);
  const _BLACK = new THREE.Color(0x000000);


  class TextureSplatter {
    constructor(params) {
      const _colourLerp = (t, p0, p1) => {
        const c = p0.clone();

        return c.lerp(p1, t);
      };
      this._colourSpline = [
        new spline.LinearSpline(_colourLerp),
        new spline.LinearSpline(_colourLerp)
      ];

      // Arid
      this._colourSpline[0].AddPoint(0.0, new THREE.Color(0xb7a67d));
      this._colourSpline[0].AddPoint(0.5, new THREE.Color(0xf1e1bc));
      this._colourSpline[0].AddPoint(1.0, _SNOW);

      // Humid
      this._colourSpline[1].AddPoint(0.0, _FOREST_BOREAL);
      this._colourSpline[1].AddPoint(0.5, new THREE.Color(0x8a9343));
      this._colourSpline[1].AddPoint(1.0, _SNOW);
      // this._colourSpline[1].AddPoint(0.5, new THREE.Color(0x8a9343));
      // this._colourSpline[1].AddPoint(1.0, _SNOW);

      this._oceanSpline = new spline.LinearSpline(_colourLerp);
      this._oceanSpline.AddPoint(0, _DEEP_OCEAN);
      this._oceanSpline.AddPoint(0.03, _SHALLOW_OCEAN);
      this._oceanSpline.AddPoint(0.05, _SHALLOW_OCEAN);

      this._params = params;
    }

    _BaseColour(x, y, z) {
      const m = this._params.biomeGenerator.Get(x, y, z);
      const h = math.sat(z / 100.0);

      const c1 = this._colourSpline[0].Get(h);
      const c2 = this._colourSpline[1].Get(h);

      let c = c1.lerp(c2, m);

      if (h < 0.1) {
        c = c.lerp(new THREE.Color(0x54380e), 1.0 - math.sat(h / 0.05));
      }
      return c;      
    }

    _Colour(x, y, z) {
      const c = this._BaseColour(x, y, z);
      const r = this._params.colourNoise.Get(x, y, z) * 2.0 - 1.0;

      c.offsetHSL(0.0, 0.0, r * 0.2);
      return c;
    }

    _GetTextureWeights(p, n, up) {
      const m = this._params.biomeGenerator.Get(p.x, p.y, p.z);
      const h = p.z / _HEIGHT_NORMALIZATION;

      const types = {
        dirt: {index: 0, strength: 0.0},
        grass: {index: 1, strength: 0.0},
        gravel: {index: 2, strength: 0.0},
        rock: {index: 3, strength: 0.0},
        snow: {index: 4, strength: 0.0},
        snowrock: {index: 5, strength: 0.0},
        cobble: {index: 6, strength: 0.0},
        sandyrock: {index: 7, strength: 0.0},
      };

      function _ApplyWeights(dst, v, m) {
        for (let k in types) {
          types[k].strength *= m;
        }
        types[dst].strength = v;
      };

      types.grass.strength = 1.0;
      _ApplyWeights('gravel', 1.0 - m, m);

      if (h < 0.2) {
        const s = 1.0 - math.sat((h - 0.1) / 0.05);
        _ApplyWeights('cobble', s, 1.0 - s);

        if (h < 0.1) {
          const s = 1.0 - math.sat((h - 0.05) / 0.05);
          _ApplyWeights('sandyrock', s, 1.0 - s);
        }
      } else {
        if (h > 0.125) {
          const s = (math.sat((h - 0.125) / 1.25));
          _ApplyWeights('rock', s, 1.0 - s);
        }

        if (h > 1.5) {
          const s = math.sat((h - 0.75) / 2.0);
          _ApplyWeights('snow', s, 1.0 - s);
        }
      }

      // In case nothing gets set.
      types.dirt.strength = 0.01;

      let total = 0.0;
      for (let k in types) {
        total += types[k].strength;
      }
      if (total < 0.01) {
        const a = 0;
      }
      const normalization = 1.0 / total;

      for (let k in types) {
        types[k].strength / normalization;
      }

      return types;
    }

    GetColour(position) {
      return this._Colour(position.x, position.y, position.z);
    }

    GetSplat(position, normal, up) {
      return this._GetTextureWeights(position, normal, up);
    }
  }

  return {
    TextureSplatter: TextureSplatter,
  }
})();

import { THREE } from "../deps.js";
import { rand_range, sat } from "../functions/math.js";
import { Noise } from "../functions/noise.js";
import { BIOMES } from "../data/biomes/mod.js";
import { Cloud, Plant, Rock, Tree } from "../entities/mod.js";

const _SCENERY = (biome) => {
  switch (biome) {
    case "desert":
      return [Plant, Rock]
    case "forest":
      return [Plant, Rock, Tree]
    case "arid":
      return [Rock]
    default:
      return []
  }
}

export class Scenery {
  constructor(world) {
    this.world = world

    const noiseParams = {
      octaves: 1,
      persistence: 0.5,
      lacunarity: 2.0,
      exponentiation: 1.0,
      scale: 1.0,
      noiseType: "simplex",
      seed: 2,
      height: 1.0,
    };
    this.noise = new Noise(noiseParams);

    this.center_ = undefined;
    this.scenery = [];
    this.spawnClouds();
  }

  spawnClouds() {
    for (let i = 0; i < 20; ++i) {
      const pos = new THREE.Vector3(
        (Math.random() * 2.0 - 1.0) * 5000,
        500,
        (Math.random() * 2.0 - 1.0) * 5000,
      );

      const cloud = new Cloud(this.world)
      cloud.setPosition(pos)
      const q = new THREE.Quaternion().setFromAxisAngle(
        new THREE.Vector3(0, 1, 0),
        rand_range(0, 360),
      );
      cloud.setQuaternion(q);
      this.world.entities.add(cloud)
    }
  }

  getBiomeAt(pos) {
    const biome = this.world.terrain.getBiomeAt(pos);

    // HACK: duplicaed code from texture-splatter
    const m = biome;
    const h = sat(pos.y / 100.0);

    if (h < 0.05) {
      return "desert";
    } else if (m > 0.5) {
      return "forest";
    } else {
      return "arid";
    }
  }

  createSceneryEntity(biome, spawnPos) {
    const matchingScenery = _SCENERY(biome);

    const roll = this.noise.Get(spawnPos.x, 3.0, spawnPos.z);
    const semiRandomEntity = matchingScenery[Math.round(roll * (matchingScenery.length - 1))];

    return new semiRandomEntity(this.world)
  }

  createScenery() {
    const player = this.world.entities.get("player");
    if (!player) {
      return;
    }

    const center = new THREE.Vector3().copy(player.position);

    center.x = Math.round(center.x / 50.0);
    center.y = 0.0;
    center.z = Math.round(center.z / 50.0);

    if (this.center_ && this.center_.equals(center)) {
      return;
    }

    this.center_ = center;

    const _P = new THREE.Vector3();
    const _V = new THREE.Vector3();

    for (let x = -10; x <= 10; ++x) {
      for (let y = -10; y <= 10; ++y) {
        _P.set(x, 0.0, y);
        _P.add(center);
        _P.multiplyScalar(50.0);

        const key = "__scenery__[" + _P.x + "][" + _P.z + "]";
        if (this.world.entities.get(key)) {
          continue;
        }

        _V.copy(_P);

        _P.x += (this.noise.Get(_P.x, 0.0, _P.z) * 2.0 - 1.0) * 25.0;
        _P.z += (this.noise.Get(_P.x, 1.0, _P.z) * 2.0 - 1.0) * 25.0;
        _P.y = this.world.terrain.getHeight(_P)[0];

        const biome = this.getBiomeAt(_P);

        const roll = this.noise.Get(_V.x, 2.0, _V.z);
        if (roll > BIOMES[biome]) {
          continue;
        }

        const e = this.createSceneryEntity(biome, _P);
        e.setPosition(_P);
        const q = new THREE.Quaternion().setFromAxisAngle(
          new THREE.Vector3(0, 1, 0),
          this.noise.Get(_P.x, 5.0, _P.z) * 360,
        );
        e.setQuaternion(q);

        this.world.entities.add(e);

        this.scenery.push(e);
      }
    }
  }

  update(_) {
    this.createScenery();
  }
}

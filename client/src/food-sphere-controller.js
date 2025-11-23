import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.124/build/three.module.js';

import {entity} from './entity.js';

import {noise} from '../shared/noise.mjs';

export const food_sphere_controller = (() => {

  class FoodSphereController extends entity.Component {
    constructor(params) {
      super();
      this.params_ = params;

      const noiseParams = {
        octaves: 1.0,
        persistence: 0.5,
        lacunarity: 2.0,
        exponentiation: 1.0,
        scale: 1.0,
        noiseType: 'simplex',
        seed: 3,
        height: 1.0,
      };
      this.noise_ = new noise.Noise(noiseParams);

      this.center_ = null;
      this.foodSpheres_ = [];
    }

    InitEntity() {
      // Nothing to initialize at start
    }

    FindBiome_(terrain, pos) {
      const biome = terrain.GetBiomeAt(pos);
      const m = biome;
      const h = pos.y / 100.0;

      if (h < 0.05) {
        return 'desert';
      } else if (m > 0.5) {
        return 'forest';
      } else {
        return 'arid';
      }
    }

    SpawnFoodSphere_(spawnPos) {
      // Create sphere geometry
      const geometry = new THREE.SphereGeometry(0.1, 16, 16); // 0.2 diameter = 0.1 radius
      const material = new THREE.MeshStandardMaterial({
        color: 0xff6600, // Orange color for food
        emissive: 0x331100,
        roughness: 0.5,
        metalness: 0.1,
      });
      const sphere = new THREE.Mesh(geometry, material);
      sphere.castShadow = true;
      sphere.receiveShadow = true;

      // Position sphere higher in the air to simulate falling from tree
      const startHeight = spawnPos.y + 5 + Math.random() * 3; // 5-8 units above ground
      sphere.position.set(spawnPos.x, startHeight, spawnPos.z);

      this.params_.scene.add(sphere);

      const e = new entity.Entity();
      e.mesh = sphere;
      e.velocity = 0; // Initial falling velocity
      e.startHeight = startHeight;
      e.groundHeight = spawnPos.y;
      e.hasLanded = false;
      e.lifeTime = 0; // Track how long it's been on ground

      return e;
    }

    SpawnFoodSpheres_() {
      const player = this.FindEntity('player');
      if (!player) {
        return;
      }

      const center = new THREE.Vector3().copy(player.Position);

      center.x = Math.round(center.x / 50.0);
      center.y = 0.0;
      center.z = Math.round(center.z / 50.0);

      if (this.center_ && this.center_.equals(center)) {
        return;
      }

      this.center_ = center;

      const _P = new THREE.Vector3();
      const _V = new THREE.Vector3();
      const terrain = this.FindEntity('terrain').GetComponent('TerrainChunkManager');

      // Spawn food spheres in forest biome only
      for (let x = -3; x <= 3; ++x) {
        for (let y = -3; y <= 3; ++y) {
          _P.set(x, 0.0, y);
          _P.add(center);
          _P.multiplyScalar(50.0);

          // Check if already exists
          const key = '__foodsphere__[' + _P.x + '][' + _P.z + ']';
          const obj = this.FindEntity(key);
          if (obj) {
            continue;
          }

          _V.copy(_P);
          
          _P.x += (this.noise_.Get(_P.x, 0.0, _P.z) * 2.0 - 1.0) * 20.0;
          _P.z += (this.noise_.Get(_P.x, 1.0, _P.z) * 2.0 - 1.0) * 20.0;
          _P.y = terrain.GetHeight(_P)[0];

          const biome = this.FindBiome_(terrain, _P);

          // Only spawn in forest biome
          if (biome !== 'forest') {
            continue;
          }

          // Random chance to spawn (not every grid cell gets one)
          const roll = this.noise_.Get(_V.x, 2.0, _V.z);
          if (roll > 0.7) { // 30% spawn rate
            continue;
          }

          const foodSphere = this.SpawnFoodSphere_(_P);

          this.Manager.Add(foodSphere, key);
          this.foodSpheres_.push({
            Name: key,
            Entity: foodSphere,
          });
        }
      }
    }

    CheckPlayerCollision_(sphere) {
      const player = this.FindEntity('player');
      if (!player) {
        return false;
      }

      const playerPos = player.Position;
      const spherePos = sphere.mesh.position;

      // Check distance between player and sphere
      const dx = playerPos.x - spherePos.x;
      const dy = playerPos.y - spherePos.y;
      const dz = playerPos.z - spherePos.z;
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

      // Collision radius (player size + sphere size)
      return distance < 2.0; // Generous collision distance
    }

    Update(timeInSeconds) {
      this.SpawnFoodSpheres_();

      // Update all food spheres (falling animation and collision detection)
      for (let i = 0; i < this.foodSpheres_.length; ++i) {
        const foodItem = this.foodSpheres_[i];
        const sphere = foodItem.Entity;

        if (!sphere || !sphere.mesh) {
          continue;
        }

        // Falling physics
        if (!sphere.hasLanded) {
          sphere.velocity += 9.8 * timeInSeconds; // Gravity
          sphere.mesh.position.y -= sphere.velocity * timeInSeconds;

          // Check if landed on ground
          if (sphere.mesh.position.y <= sphere.groundHeight) {
            sphere.mesh.position.y = sphere.groundHeight;
            sphere.hasLanded = true;
            sphere.velocity = 0;
          }
        }

        // Check collision with player
        if (sphere.hasLanded && this.CheckPlayerCollision_(sphere)) {
          // Add health to player using message system
          const player = this.FindEntity('player');
          if (player) {
            player.Broadcast({
              topic: 'health.heal',
              value: 5,
            });
          }

          // Remove the food sphere
          this.params_.scene.remove(sphere.mesh);
          sphere.mesh.geometry.dispose();
          sphere.mesh.material.dispose();
          this.Manager.Remove(sphere);
          this.foodSpheres_.splice(i, 1);
          i--;
          continue;
        }

        // Remove spheres that have been on the ground too long or are far from player
        if (sphere.hasLanded) {
          sphere.lifeTime += timeInSeconds;
          
          const player = this.FindEntity('player');
          if (player) {
            const dist = sphere.mesh.position.distanceTo(player.Position);
            
            // Remove if too far or too old
            if (dist > 300 || sphere.lifeTime > 120) { // 120 seconds = 2 minutes
              this.params_.scene.remove(sphere.mesh);
              sphere.mesh.geometry.dispose();
              sphere.mesh.material.dispose();
              this.Manager.Remove(sphere);
              this.foodSpheres_.splice(i, 1);
              i--;
            }
          }
        }
      }
    }
  };

  return {
    FoodSphereController: FoodSphereController,
  };
})();

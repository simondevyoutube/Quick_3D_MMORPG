import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.124/build/three.module.js';

import {entity} from './entity.js';

import {math} from '../shared/math.mjs';
import {defs} from '../shared/defs.mjs';


export const health_bar = (() => {

  const _VS = `
varying vec2 vUV;

void main() {
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  vUV = uv;
}
`;

  const _PS = `
uniform vec3 colour;
uniform float health;

varying vec2 vUV;

void main() {
  gl_FragColor = vec4(mix(colour, vec3(0.0), step(health, vUV.y)), 1.0);
}
`;

  // Offset below the floating name (in world units)
  const HEALTH_BAR_OFFSET = 2.5;
  // Default Y position when model data is not available
  const DEFAULT_Y_OFFSET = 8.0;
  // Distance check interval (in frames) to optimize performance
  const DISTANCE_CHECK_INTERVAL = 10;

class HealthBar extends entity.Component {
  constructor(params) {
    super();
    this.params_ = params;
    this.maxDistance_ = params.maxDistance || 25.0; // Default 25m visibility
    this.maxDistanceSquared_ = this.maxDistance_ * this.maxDistance_; // Pre-calculate for performance
    this.frameCount_ = 0;
    this.Initialize_();
  }

  Destroy() {
    if (this.material_) {
      this.material_.dispose();
    }
    if (this.geometry_) {
      this.geometry_.dispose();
    }
    if (this.bar_ && this.params_.parent) {
      this.params_.parent.remove(this.bar_);
    }
  }

  Initialize_() {
    const uniforms = {
      colour: {
        value: new THREE.Color(0, 1, 0),
      },
      health: {
        value: 1.0,
      },
    };
    this.material_ = new THREE.ShaderMaterial( {
      uniforms: uniforms,
      vertexShader: _VS,
      fragmentShader: _PS,
      blending: THREE.NormalBlending,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      side: THREE.DoubleSide,
    });

    this.geometry_ = new THREE.BufferGeometry();

    this.bar_ = new THREE.Mesh(this.geometry_, this.material_);
    this.bar_.frustumCulled = false;
    this.bar_.scale.set(2, 0.125, 1);
    this.bar_.visible = false; // Start hidden

    this.realHealth_ = 1.0;
    this.animHealth_ = 1.0;

    this.params_.parent.add(this.bar_);
    this.GenerateBuffers_();
  }

  InitComponent() {
    this._RegisterHandler('health.update', (m) => { this.OnHealth_(m); });
  }

  OnHealth_(msg) {
    const healthPercent = (msg.health / msg.maxHealth);
    
    this.realHealth_ = healthPercent;
  }

  Update(timeElapsed) {
    const t = 1.0 - Math.pow(0.001, timeElapsed);

    this.animHealth_ = math.lerp(t, this.animHealth_, this.realHealth_);

    const _R = new THREE.Color(1.0, 0, 0);
    const _G = new THREE.Color(0.0, 1.0, 0.0);
    const c = _R.clone();
    c.lerpHSL(_G, this.animHealth_);

    this.material_.uniforms.health.value = this.animHealth_;
    this.material_.uniforms.colour.value = c;

    // Check distance only every DISTANCE_CHECK_INTERVAL frames for performance
    this.frameCount_++;
    if (this.frameCount_ >= DISTANCE_CHECK_INTERVAL) {
      this.frameCount_ = 0;
      
      // Get player position for distance check
      const player = this.FindEntity('player');
      if (player) {
        // Use distanceToSquared for better performance (avoids sqrt)
        const distanceSquared = this.parent_.Position.distanceToSquared(player.Position);
        this.bar_.visible = distanceSquared <= this.maxDistanceSquared_;
      } else {
        this.bar_.visible = false;
      }
    }

    // Update position below the name
    if (this.bar_.visible) {
      this.bar_.position.copy(this.parent_.Position);
      
      // Position below the floating name
      // Get the character model data to use the nameOffset
      const desc = this.params_.desc;
      const modelData = (desc && desc.character && desc.character.class) 
        ? defs.CHARACTER_MODELS[desc.character.class] 
        : null;
      
      const yOffset = (modelData && modelData.nameOffset) 
        ? modelData.nameOffset - HEALTH_BAR_OFFSET 
        : DEFAULT_Y_OFFSET;
      
      this.bar_.position.y += yOffset;
      this.bar_.quaternion.copy(this.params_.camera.quaternion);
    }
  }

  GenerateBuffers_() {
    const indices = [];
    const positions = [];
    const uvs = [];

    const square = [0, 1, 2, 2, 3, 0];

    indices.push(...square);

    const p1 = new THREE.Vector3(-1, -1, 0);
    const p2 = new THREE.Vector3(-1, 1, 0);
    const p3 = new THREE.Vector3(1, 1, 0);
    const p4 = new THREE.Vector3(1, -1, 0);

    uvs.push(0.0, 0.0);
    uvs.push(1.0, 0.0);
    uvs.push(1.0, 1.0);
    uvs.push(0.0, 1.0);

    positions.push(p1.x, p1.y, p1.z);
    positions.push(p2.x, p2.y, p2.z);
    positions.push(p3.x, p3.y, p3.z);
    positions.push(p4.x, p4.y, p4.z);

    this.geometry_.setAttribute(
        'position', new THREE.Float32BufferAttribute(positions, 3));
    this.geometry_.setAttribute(
        'uv', new THREE.Float32BufferAttribute(uvs, 2));
    this.geometry_.setIndex(
        new THREE.BufferAttribute(new Uint32Array(indices), 1));

    this.geometry_.attributes.position.needsUpdate = true;
  }
};

  return {
    HealthBar: HealthBar,
  };
})();
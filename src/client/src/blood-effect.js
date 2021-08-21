import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.124/build/three.module.js'
import { entity } from './entity.js'
import { particle_system } from './particle-system.js'

export const blood_effect = (() => {
  class BloodEffectEmitter extends particle_system.ParticleEmitter {
    constructor(parent) {
      super()
      this.parent_ = parent
      this.blend_ = 0.0
    }

    OnUpdate_() {
      this.parent_.updateMatrixWorld(true)

      this.SetEmissionRate(300.0 * (this.emitterLife_ / 3.0))
    }

    CreateParticle_() {
      const origin = new THREE.Vector3(0, 0, 0)
      this.parent_.localToWorld(origin)

      const radius = 1.0
      const life = (Math.random() * 0.75 + 0.25) * 0.5
      const p = new THREE.Vector3(
        (Math.random() * 2 - 1) * radius,
        (Math.random() * 2 - 1) * radius,
        (Math.random() * 2 - 1) * radius
      )

      const d = p.clone().normalize()
      p.copy(d)
      p.multiplyScalar(radius)
      p.add(origin)
      d.multiplyScalar(0.0)

      return {
        position: p,
        size: (Math.random() * 0.5 + 0.5) * 1.0,
        colour: new THREE.Color(),
        alpha: 1.0,
        life: life,
        maxLife: life,
        rotation: Math.random() * 2.0 * Math.PI,
        velocity: d,
        blend: this.blend_
      }
    }
  }

  class FireFXEmitter extends particle_system.ParticleEmitter {
    constructor(parent) {
      super()
      this.parent_ = parent
      this.blend_ = 0.0
    }

    OnUpdate_() {
      this.parent_.updateMatrixWorld(true)
    }

    AddParticles(num) {
      for (let i = 0; i < num; ++i) {
        this.particles_.push(this.CreateParticle_())
      }
    }

    CreateParticle_() {
      const origin = new THREE.Vector3(0, 0, 0)
      this.parent_.localToWorld(origin)

      const radius = 1.0
      const life = (Math.random() * 0.75 + 0.25) * 1.5
      const p = new THREE.Vector3(
        (Math.random() * 2 - 1) * radius,
        (Math.random() * 2 - 1) * radius,
        (Math.random() * 2 - 1) * radius
      )

      const d = p.clone().normalize()
      p.copy(d)
      p.multiplyScalar(radius)
      p.add(origin)
      d.multiplyScalar(3.0)

      return {
        position: p,
        size: (Math.random() * 0.5 + 0.5) * 1.0,
        colour: new THREE.Color(),
        alpha: 1.0,
        life: life,
        maxLife: life,
        rotation: Math.random() * 2.0 * Math.PI,
        velocity: d,
        blend: this.blend_
      }
    }
  }

  class BloodEffect extends entity.Component {
    constructor(params) {
      super()
      this.params_ = params

      this.bloodFX_ = new particle_system.ParticleSystem({
        camera: params.camera,
        parent: params.scene,
        texture: './resources/textures/whitePuff14.png'
      })
      this.fireFX_ = new particle_system.ParticleSystem({
        camera: params.camera,
        parent: params.scene,
        texture: './resources/textures/fire.png'
      })
    }

    Destroy() {
      this.bloodFX_.Destroy()
      this.fireFX_.Destroy()
    }

    InitComponent() {
      this._RegisterHandler('events.network', (m) => {
        this.OnEvents_(m)
      })
      this._RegisterHandler('load.character', (m) => this.OnCharacterLoaded_(m))
    }

    OnCharacterLoaded_(msg) {
      this.bones_ = msg.bones
    }

    OnEvents_(msg) {
      if (!this.bones_) {
        return
      }

      for (let e of msg.value) {
        if (e.type != 'attack') {
          continue
        }

        // Another hack
        const hc = e.attacker.GetComponent('HealthComponent')

        if (hc.stats_.desc.character.class != 'sorceror') {
          this.EmitBloodFX_()
        } else {
          this.EmitFireFX_()
        }
      }
    }

    EmitFireFX_() {
      const targets = ['Head', 'Hips']
      for (let t of targets) {
        const b = this.bones_[t]
        let emitter = new FireFXEmitter(b)
        emitter.alphaSpline_.AddPoint(0.0, 0.0)
        emitter.alphaSpline_.AddPoint(0.5, 1.0)
        emitter.alphaSpline_.AddPoint(1.0, 0.0)

        emitter.colourSpline_.AddPoint(0.0, new THREE.Color(0x00ff00))
        emitter.colourSpline_.AddPoint(0.3, new THREE.Color(0x00ff00))
        emitter.colourSpline_.AddPoint(0.4, new THREE.Color(0xdeec42))
        emitter.colourSpline_.AddPoint(1.0, new THREE.Color(0xf4a776))

        emitter.sizeSpline_.AddPoint(0.0, 0.5)
        emitter.sizeSpline_.AddPoint(0.5, 3.0)
        emitter.sizeSpline_.AddPoint(1.0, 0.5)
        emitter.blend_ = 0.0
        emitter.AddParticles(200)

        this.fireFX_.AddEmitter(emitter)

        emitter = new FireFXEmitter(b)
        emitter.alphaSpline_.AddPoint(0.0, 0.0)
        emitter.alphaSpline_.AddPoint(0.7, 1.0)
        emitter.alphaSpline_.AddPoint(1.0, 0.0)

        emitter.colourSpline_.AddPoint(0.0, new THREE.Color(0x000000))
        emitter.colourSpline_.AddPoint(1.0, new THREE.Color(0x000000))

        emitter.sizeSpline_.AddPoint(0.0, 0.5)
        emitter.sizeSpline_.AddPoint(0.5, 4.0)
        emitter.sizeSpline_.AddPoint(1.0, 10.0)
        emitter.blend_ = 1.0
        emitter.AddParticles(100)

        this.fireFX_.AddEmitter(emitter)
      }
    }

    EmitBloodFX_() {
      // hack shoudl check if this was legit anything else than damage
      const targets = ['Head', 'Hips']
      for (let t of targets) {
        const b = this.bones_[t]
        const emitter = new BloodEffectEmitter(b)
        emitter.alphaSpline_.AddPoint(0.0, 0.0)
        emitter.alphaSpline_.AddPoint(0.7, 1.0)
        emitter.alphaSpline_.AddPoint(1.0, 0.0)

        emitter.colourSpline_.AddPoint(0.0, new THREE.Color(0xbb2909))
        emitter.colourSpline_.AddPoint(1.0, new THREE.Color(0x701a08))

        emitter.sizeSpline_.AddPoint(0.0, 0.5)
        emitter.sizeSpline_.AddPoint(0.5, 1.0)
        emitter.sizeSpline_.AddPoint(1.0, 0.5)
        emitter.SetLife(0.5)
        emitter.SetEmissionRate(500)
        emitter.blend_ = 1.0

        this.bloodFX_.AddEmitter(emitter)
      }
    }

    Update(timeElapsed) {
      this.bloodFX_.Update(timeElapsed)
      this.fireFX_.Update(timeElapsed)
    }
  }

  return {
    BloodEffect: BloodEffect
  }
})()

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.124/build/three.module.js'
import { entity } from './entity.js'
import { defs } from '/shared/defs.js'

export const floating_name = (() => {
  class FloatingName extends entity.Component {
    constructor(params) {
      super()
      this.params_ = params
      this.visible_ = true
    }

    Destroy() {
      if (!this.sprite_) {
        this.visible_ = false
        return
      }

      this.sprite_.traverse((c) => {
        if (c.material) {
          let materials = c.material
          if (!(c.material instanceof Array)) {
            materials = [c.material]
          }
          for (let m of materials) {
            m.dispose()
          }
        }

        if (c.geometry) {
          c.geometry.dispose()
        }
      })
      if (this.sprite_.parent) {
        this.sprite_.parent.remove(this.sprite_)
      }
    }

    InitComponent() {
      this._RegisterHandler('load.character', (m) => {
        this.CreateSprite_(m)
      })
      this._RegisterHandler('health.death', (m) => {
        this.OnDeath_(m)
      })
    }

    OnDeath_() {
      this.Destroy()
    }

    CreateSprite_(msg) {
      if (!this.visible_) {
        return
      }
      const modelData = defs.CHARACTER_MODELS[this.params_.desc.character.class]

      this.element_ = document.createElement('canvas')
      this.context2d_ = this.element_.getContext('2d')
      this.context2d_.canvas.width = 256
      this.context2d_.canvas.height = 128
      this.context2d_.fillStyle = '#FFF'
      this.context2d_.font = '18pt Helvetica'
      this.context2d_.shadowOffsetX = 3
      this.context2d_.shadowOffsetY = 3
      this.context2d_.shadowColor = 'rgba(0,0,0,0.3)'
      this.context2d_.shadowBlur = 4
      this.context2d_.textAlign = 'center'
      this.context2d_.fillText(this.params_.desc.account.name, 128, 64)

      const map = new THREE.CanvasTexture(this.context2d_.canvas)

      this.sprite_ = new THREE.Sprite(new THREE.SpriteMaterial({ map: map, color: 0xffffff, fog: false }))
      this.sprite_.scale.set(10, 5, 1)
      this.sprite_.position.y += modelData.nameOffset
      msg.model.add(this.sprite_)
    }
  }

  return {
    FloatingName: FloatingName
  }
})()

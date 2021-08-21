import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.124/build/three.module.js'
import { entity } from './entity.js'

export const player_input = (() => {
  class PickableComponent extends entity.Component {
    constructor() {
      super()
    }

    InitComponent() {}
  }

  class BasicCharacterControllerInput extends entity.Component {
    constructor(params) {
      super()
      this._params = params
      this._Init()
    }

    _Init() {
      this._keys = {
        forward: false,
        backward: false,
        left: false,
        right: false,
        space: false,
        shift: false,
        backspace: false
      }
      this._raycaster = new THREE.Raycaster()
      document.addEventListener('keydown', (e) => this._onKeyDown(e), false)
      document.addEventListener('keyup', (e) => this._onKeyUp(e), false)
      document.addEventListener('mouseup', (e) => this._onMouseUp(e), false)
    }

    _onMouseUp(event) {
      const rect = document.getElementById('threejs').getBoundingClientRect()
      const pos = {
        x: ((event.clientX - rect.left) / rect.width) * 2 - 1,
        y: ((event.clientY - rect.top) / rect.height) * -2 + 1
      }

      this._raycaster.setFromCamera(pos, this._params.camera)

      const pickables = this.Manager.Filter((e) => {
        const p = e.GetComponent('PickableComponent')
        if (!p) {
          return false
        }
        return e._mesh
      })

      const ray = new THREE.Ray()
      ray.origin.setFromMatrixPosition(this._params.camera.matrixWorld)
      ray.direction.set(pos.x, pos.y, 0.5).unproject(this._params.camera).sub(ray.origin).normalize()

      // hack
      document.getElementById('quest-ui').style.visibility = 'hidden'

      for (let p of pickables) {
        // GOOD ENOUGH
        const box = new THREE.Box3().setFromObject(p._mesh)

        if (ray.intersectsBox(box)) {
          p.Broadcast({
            topic: 'input.picked'
          })
          break
        }
      }
    }

    _onKeyDown(event) {
      if (event.currentTarget.activeElement != document.body) {
        return
      }
      switch (event.keyCode) {
        case 87: // w
          this._keys.forward = true
          break
        case 65: // a
          this._keys.left = true
          break
        case 83: // s
          this._keys.backward = true
          break
        case 68: // d
          this._keys.right = true
          break
        case 32: // SPACE
          this._keys.space = true
          break
        case 16: // SHIFT
          this._keys.shift = true
          break
        case 8: // BACKSPACE
          this._keys.backspace = true
          break
      }
    }

    _onKeyUp(event) {
      if (event.currentTarget.activeElement != document.body) {
        return
      }
      switch (event.keyCode) {
        case 87: // w
          this._keys.forward = false
          break
        case 65: // a
          this._keys.left = false
          break
        case 83: // s
          this._keys.backward = false
          break
        case 68: // d
          this._keys.right = false
          break
        case 32: // SPACE
          this._keys.space = false
          break
        case 16: // SHIFT
          this._keys.shift = false
          break
        case 8: // BACKSPACE
          this._keys.backspace = false
          break
      }
    }
  }

  return {
    BasicCharacterControllerInput: BasicCharacterControllerInput,
    PickableComponent: PickableComponent
  }
})()

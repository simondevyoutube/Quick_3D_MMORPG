import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.124/build/three.module.js'

export const terrain_chunk = (function () {
  class TerrainChunk {
    constructor(params) {
      this._params = params
      this._Init(params)
    }

    Destroy() {
      this._params.group.remove(this._plane)
    }

    Hide() {
      this._plane.visible = false
    }

    Show() {
      this._plane.visible = true
    }

    _Init(params) {
      this._geometry = new THREE.BufferGeometry()
      this._plane = new THREE.Mesh(this._geometry, params.material)
      this._plane.castShadow = false
      this._plane.receiveShadow = true
      this._plane.frustumCulled = false
      this._params.group.add(this._plane)
      this.Reinit(params)
    }

    Update(cameraPosition) {
      // this._plane.position.copy(this._params.origin);
      // this._plane.position.sub(cameraPosition);
    }

    Reinit(params) {
      this._params = params
      this._plane.position.set(0, 0, 0)
    }

    RebuildMeshFromData(data) {
      this._geometry.setAttribute('position', new THREE.Float32BufferAttribute(data.positions, 3))
      this._geometry.setAttribute('color', new THREE.Float32BufferAttribute(data.colours, 3))
      this._geometry.setAttribute('normal', new THREE.Float32BufferAttribute(data.normals, 3))
      this._geometry.setAttribute('coords', new THREE.Float32BufferAttribute(data.coords, 3))
      this._geometry.setAttribute('weights1', new THREE.Float32BufferAttribute(data.weights1, 4))
      this._geometry.setAttribute('weights2', new THREE.Float32BufferAttribute(data.weights2, 4))
      this._geometry.computeBoundingBox()
    }
  }

  return {
    TerrainChunk: TerrainChunk
  }
})()

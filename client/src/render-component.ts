import { KNOWN_ENTITIES } from 'shared/src/constants';
import * as THREE from 'three';

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

import { Component } from './entity';

class RenderComponent extends Component {
  group_: THREE.Group;
  params_: any;
  _target: any;
  constructor(params) {
    super();
    this.group_ = new THREE.Group();
    this.params_ = params;
    this.params_.scene.add(this.group_);
  }

  Destroy() {
    this.group_.traverse((c: any) => {
      if (c.material) {
        c.material.dispose();
      }
      if (c.geometry) {
        c.geometry.dispose();
      }
    });
    this.params_.scene.remove(this.group_);
  }

  InitEntity() {
    this._Init(this.params_);
  }

  _Init(params) {
    this.params_ = params;

    this._LoadModels();
  }

  InitComponent() {
    this._RegisterHandler('update.position', (m) => { this._OnPosition(m); });
    this._RegisterHandler('update.rotation', (m) => { this._OnRotation(m); });
  }

  _OnPosition(m) {
    this.group_.position.copy(m.value);
  }

  _OnRotation(m) {
    this.group_.quaternion.copy(m.value);
  }

  _LoadModels() {
    if (this.params_.resourceName.endsWith('glb')) {
      this._LoadGLB();
    } else if (this.params_.resourceName.endsWith('fbx')) {
      this._LoadFBX();
    } else if (this.params_.resourceName.endsWith('obj')) {
      this._LoadOBJ();
    }
  }

  _OnLoaded(obj) {
    this._target = obj;
    this.group_.add(this._target);

    this._target.scale.setScalar(this.params_.scale);

    const textures = {};
    if (this.params_.textures) {
      const loader = this.FindEntity(KNOWN_ENTITIES.LOADER).GetComponent('LoadController');

      for (let k in this.params_.textures.names) {
        const t = loader.LoadTexture(
          this.params_.textures.resourcePath, this.params_.textures.names[k]);
        t.encoding = THREE.sRGBEncoding;

        if (this.params_.textures.wrap) {
          t.wrapS = THREE.RepeatWrapping;
          t.wrapT = THREE.RepeatWrapping;
        }

        textures[k] = t;
      }
    }

    this._target.traverse(c => {
      let materials = c.material;
      if (!(c.material instanceof Array)) {
        materials = [c.material];
      }

      if (c.geometry) {
        c.geometry.computeBoundingBox();
      }

      for (let m of materials) {
        if (m) {
          if (this.params_.onMaterial) {
            this.params_.onMaterial(m);
          }
          for (let k in textures) {
            if (m.name.search(k) >= 0) {
              m.map = textures[k];
            }
          }
          if (this.params_.specular) {
            m.specular = this.params_.specular;
          }
          if (this.params_.emissive) {
            m.emissive = this.params_.emissive;
          }
        }
      }
      if (this.params_.receiveShadow != undefined) {
        c.receiveShadow = this.params_.receiveShadow;
      }
      if (this.params_.castShadow != undefined) {
        c.castShadow = this.params_.castShadow;
      }
      if (this.params_.visible != undefined) {
        c.visible = this.params_.visible;
      }

      this.Broadcast({
        topic: 'render.loaded',
        value: this._target,
      })
    });
  }

  _LoadGLB() {
    const loader = new GLTFLoader();
    loader.setPath(this.params_.resourcePath);
    loader.load(this.params_.resourceName, (glb) => {
      this._OnLoaded(glb.scene);
    });
  }

  _LoadFBX() {
    const loader = this.FindEntity(KNOWN_ENTITIES.LOADER).GetComponent('LoadController');
    loader.LoadFBX(
      this.params_.resourcePath, this.params_.resourceName, (fbx) => {
        this._OnLoaded(fbx);
      });
  }

  _LoadOBJ() {
    const loader = new OBJLoader();
    loader.setPath(this.params_.resourcePath);
    loader.load(this.params_.resourceName, (fbx) => {
      this._OnLoaded(fbx);
    });
  }

  Update(timeInSeconds) {
  }
};

export {
  RenderComponent
}
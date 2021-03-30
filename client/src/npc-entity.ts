import * as THREE from 'three';

import { Component } from './entity';
import {CharacterFSM, BasicCharacterControllerProxy} from './player-entity'
import {CHARACTER_MODELS} from 'shared/src/defs';
import { ANIM_TYPES, EVENT_TYPES, KNOWN_ENTITIES, STATE_TYPES } from 'shared/src/constants';

  class NPCController extends Component {
    params_: any;
    group_: any;
    animations_: {};
    queuedState_: any;
    stateMachine_: any;
    target_: any;
    bones_: {};
    mixer_: THREE.AnimationMixer;
    constructor(params) {
      super();
      this.params_ = params;
    }

    Destroy() {
      this.group_.traverse(c => {
        if (c.material) {
          let materials = c.material;
          if (!(c.material instanceof Array)) {
            materials = [c.material];
          }
          for (let m of materials) {
            m.dispose();
          }
        }

        if (c.geometry) {
          c.geometry.dispose();
        }
      });
      this.params_.scene.remove(this.group_);
    }

    InitEntity() {
      this._Init();
    }

    _Init() {
      this.animations_ = {};
      this.group_ = new THREE.Group();

      this.params_.scene.add(this.group_);
      this.queuedState_ = null;

      this.LoadModels_();
    }

    InitComponent() {
      this._RegisterHandler(EVENT_TYPES.HEALTH_DEATH, (m) => { this.OnDeath_(m); });
      this._RegisterHandler('update.position', (m) => { this.OnPosition_(m); });
      this._RegisterHandler('update.rotation', (m) => { this.OnRotation_(m); });
    }

    SetState(s) {
      if (!this.stateMachine_) {
        this.queuedState_ = s;
        return;
      }

      // hack: should propogate attacks through the events on server
      // Right now, they're inferred from whatever animation we're running, blech
      if (s == STATE_TYPES.ATTACK && this.stateMachine_._currentState.Name != STATE_TYPES.ATTACK) {
        this.Broadcast({
            topic: EVENT_TYPES.ACTION_ATTACK,
        });
      }

      this.stateMachine_.SetState(s);
    }

    OnDeath_(msg) {
      this.SetState(STATE_TYPES.DEATH);
    }

    OnPosition_(m) {
      this.group_.position.copy(m.value);
    }

    OnRotation_(m) {
      this.group_.quaternion.copy(m.value);
    }

    LoadModels_() {
      const classType = this.params_.desc.character.class;
      const modelData = CHARACTER_MODELS[classType];

      const loader = this.FindEntity(KNOWN_ENTITIES.LOADER).GetComponent('LoadController');
      loader.LoadSkinnedGLB(modelData.path, modelData.base, (glb) => {
        this.target_ = glb.scene;
        this.target_.scale.setScalar(modelData.scale);
        this.target_.visible = false;

        this.group_.add(this.target_);
  
        this.bones_ = {};
        this.target_.traverse(c => {
          if (!c.skeleton) {
            return;
          }
          for (let b of c.skeleton.bones) {
            this.bones_[b.name] = b;
          }
        });

        this.target_.traverse(c => {
          c.castShadow = true;
          c.receiveShadow = true;
          if (c.material && c.material.map) {
            c.material.map.encoding = THREE.sRGBEncoding;
          }
        });

        this.mixer_ = new THREE.AnimationMixer(this.target_);

        
        const _FindAnim = (animName) => {
          for (let i = 0; i < glb.animations.length; i++) {
            if (glb.animations[i].name.includes(animName)) {
              const clip = glb.animations[i];
              const action = this.mixer_.clipAction(clip);
              return {
                clip: clip,
                action: action
              }
            }
          }
          return null;
        };

        this.animations_[STATE_TYPES.IDLE] = _FindAnim(ANIM_TYPES.IDLE);
        this.animations_[STATE_TYPES.WALK] = _FindAnim(ANIM_TYPES.WALK)
        this.animations_[STATE_TYPES.RUN] = _FindAnim(ANIM_TYPES.RUN)
        this.animations_[STATE_TYPES.DEATH] = _FindAnim(ANIM_TYPES.DEATH);
        this.animations_[STATE_TYPES.ATTACK] = _FindAnim(ANIM_TYPES.ATTACK);
        this.animations_[STATE_TYPES.DANCE] = _FindAnim(ANIM_TYPES.DANCE);

        this.target_.visible = true;

        this.stateMachine_ = new CharacterFSM(
            new BasicCharacterControllerProxy(this.animations_));

        if (this.queuedState_) {
          this.stateMachine_.SetState(this.queuedState_)
          this.queuedState_ = null;
        } else {
          this.stateMachine_.SetState(STATE_TYPES.IDLE);
        }

        this.Broadcast({
            topic: EVENT_TYPES.LOAD_CHARACTER,
            model: this.group_,
            bones: this.bones_,
        });
      });
    }

    Update(timeInSeconds) {
      if (!this.stateMachine_) {
        return;
      }
      this.stateMachine_.Update(timeInSeconds, null);
      
      if (this.mixer_) {
        this.mixer_.update(timeInSeconds);
      }
    }
  };


export {
  NPCController
}
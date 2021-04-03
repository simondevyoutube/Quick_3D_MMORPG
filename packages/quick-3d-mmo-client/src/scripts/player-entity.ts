import * as THREE from 'three';

import { Component } from './entity';
import { FiniteStateMachine } from './finite-state-machine';
import { IdleState, WalkState, RunState, AttackState, DanceState, DeathState } from './player-state';
import { Constants, Defs } from 'quick-3d-mmo-shared';

const { ANIM_TYPES, EVENT_TYPES, KNOWN_ENTITIES, NAMED_COMPONENTS, STATE_TYPES, CHARACTER_MODELS } = {...Constants, ...Defs};

class CharacterFSM extends FiniteStateMachine {
  _proxy: any;
  constructor(proxy) {
    super();
    this._proxy = proxy;
    this.Init_();
  }

  Init_() {
    this._AddState(STATE_TYPES.IDLE, IdleState);
    this._AddState(STATE_TYPES.WALK, WalkState);
    this._AddState(STATE_TYPES.RUN, RunState);
    this._AddState(STATE_TYPES.ATTACK, AttackState);
    this._AddState(STATE_TYPES.DEATH, DeathState);
    this._AddState(STATE_TYPES.DANCE, DanceState);
  }
};

class BasicCharacterControllerProxy {
  animations_: any;
  constructor(animations) {
    this.animations_ = animations;
  }

  get animations() {
    return this.animations_;
  }
};

class BasicCharacterController extends Component {
  params_: any;
  decceleration_: THREE.Vector3;
  acceleration_: THREE.Vector3;
  velocity_: THREE.Vector3;
  group_: THREE.Group;
  animations_: {};
  stateMachine_: any;
  target_: any;
  bones_: {};
  _mixer: THREE.AnimationMixer;
  constructor(params) {
    super();
    this.params_ = params;
  }

  InitEntity() {
    this.Init_();
  }

  Init_() {
    this.decceleration_ = new THREE.Vector3(-0.0005, -0.0001, -5.0);
    this.acceleration_ = new THREE.Vector3(1, 0.125, 100.0);
    this.velocity_ = new THREE.Vector3(0, 0, 0);
    this.group_ = new THREE.Group();

    this.params_.scene.add(this.group_);

    this.animations_ = {};

    this.LoadModels_();
  }

  InitComponent() {
    this._RegisterHandler(EVENT_TYPES.HEALTH_DEATH, (m) => { this.OnDeath_(m); });
    this._RegisterHandler(
      'update.position', (m) => { this.OnUpdatePosition_(m); });
    this._RegisterHandler(
      'update.rotation', (m) => { this.OnUpdateRotation_(m); });
  }

  OnUpdatePosition_(msg) {
    this.group_.position.copy(msg.value);
  }

  OnUpdateRotation_(msg) {
    this.group_.quaternion.copy(msg.value);
  }

  OnDeath_(msg) {
    if(!this.stateMachine_) {
      console.log("Couldn't find state machine");
    }
    this.stateMachine_?.SetState?.(STATE_TYPES.DEATH);
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

      this._mixer = new THREE.AnimationMixer(this.target_);

      const _FindAnim = (animName) => {
        for (let i = 0; i < glb.animations.length; i++) {
          if (glb.animations[i].name.includes(animName)) {
            const clip = glb.animations[i];
            const action = this._mixer.clipAction(clip);
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
      this.animations_[STATE_TYPES.RUN] = _FindAnim(ANIM_TYPES.RUN);
      this.animations_[STATE_TYPES.DEATH] = _FindAnim(ANIM_TYPES.DEATH);
      this.animations_[STATE_TYPES.ATTACK] = _FindAnim(ANIM_TYPES.ATTACK);
      this.animations_[STATE_TYPES.DANCE] = _FindAnim(ANIM_TYPES.DANCE);

      this.target_.visible = true;

      this.stateMachine_ = new CharacterFSM(
        new BasicCharacterControllerProxy(this.animations_));

      this.stateMachine_.SetState(STATE_TYPES.IDLE);

      this.Broadcast({
        topic: EVENT_TYPES.LOAD_CHARACTER,
        model: this.target_,
        bones: this.bones_,
      });

      this.FindEntity(KNOWN_ENTITIES.UI).GetComponent(NAMED_COMPONENTS.UI_CONTROLLER).FadeoutLogin();
    });
  }

  _FindIntersections(pos, oldPos) {
    const _IsAlive = (c) => {
      const h = c.entity.GetComponent('HealthComponent');
      if (!h) {
        return true;
      }
      return h.Health > 0;
    };

    const grid = this.GetComponent('SpatialGridController');
    const nearby = grid.FindNearbyEntities(5).filter(e => _IsAlive(e));
    const collisions = [];

    for (let i = 0; i < nearby.length; ++i) {
      const e = nearby[i].entity;
      const d = ((pos.x - e.Position.x) ** 2 + (pos.z - e.Position.z) ** 2) ** 0.5;

      // HARDCODED
      if (d <= 4) {
        const d2 = ((oldPos.x - e.Position.x) ** 2 + (oldPos.z - e.Position.z) ** 2) ** 0.5;

        // If they're already colliding, let them get untangled.
        if (d2 <= 4) {
          continue;
        } else {
          collisions.push(nearby[i].entity);
        }
      }
    }
    return collisions;
  }

  Update(timeInSeconds) {
    if (!this.stateMachine_) {
      return;
    }

    const input = this.GetComponent('BasicCharacterControllerInput');
    this.stateMachine_.Update(timeInSeconds, input);

    if (this._mixer) {
      this._mixer.update(timeInSeconds);
    }

    // HARDCODED
    this.Broadcast({
      topic: 'player.action',
      action: this.stateMachine_._currentState.Name,
    });

    const currentState = this.stateMachine_._currentState;
    if (currentState.Name != STATE_TYPES.WALK &&
      currentState.Name != STATE_TYPES.RUN &&
      currentState.Name != STATE_TYPES.IDLE) {
      return;
    }

    const velocity = this.velocity_;
    const frameDecceleration = new THREE.Vector3(
      velocity.x * this.decceleration_.x,
      velocity.y * this.decceleration_.y,
      velocity.z * this.decceleration_.z
    );
    frameDecceleration.multiplyScalar(timeInSeconds);
    frameDecceleration.z = Math.sign(frameDecceleration.z) * Math.min(
      Math.abs(frameDecceleration.z), Math.abs(velocity.z));

    velocity.add(frameDecceleration);

    const controlObject = this.group_;
    const _Q = new THREE.Quaternion();
    const _A = new THREE.Vector3();
    const _R = controlObject.quaternion.clone();

    const acc = this.acceleration_.clone();
    if (input._keys.shift) {
      acc.multiplyScalar(2.0);
    }

    if (input._keys.forward) {
      velocity.z += acc.z * timeInSeconds;
    }
    if (input._keys.backward) {
      velocity.z -= acc.z * timeInSeconds;
    }
    if (input._keys.left) {
      _A.set(0, 1, 0);
      _Q.setFromAxisAngle(_A, 4.0 * Math.PI * timeInSeconds * this.acceleration_.y);
      _R.multiply(_Q);
    }
    if (input._keys.right) {
      _A.set(0, 1, 0);
      _Q.setFromAxisAngle(_A, 4.0 * -Math.PI * timeInSeconds * this.acceleration_.y);
      _R.multiply(_Q);
    }

    controlObject.quaternion.copy(_R);

    const oldPosition = new THREE.Vector3();
    oldPosition.copy(controlObject.position);

    const forward = new THREE.Vector3(0, 0, 1);
    forward.applyQuaternion(controlObject.quaternion);
    forward.normalize();

    const sideways = new THREE.Vector3(1, 0, 0);
    sideways.applyQuaternion(controlObject.quaternion);
    sideways.normalize();

    sideways.multiplyScalar(velocity.x * timeInSeconds);
    forward.multiplyScalar(velocity.z * timeInSeconds);

    const pos = controlObject.position.clone();
    pos.add(forward);
    pos.add(sideways);

    const collisions = this._FindIntersections(pos, oldPosition);
    if (collisions.length > 0) {
      return;
    }

    const terrain = this.FindEntity(KNOWN_ENTITIES.TERRAIN).GetComponent('TerrainChunkManager');
    pos.y = terrain.GetHeight(pos)[0];

    controlObject.position.copy(pos);

    this.Parent.SetPosition(controlObject.position);
    this.Parent.SetQuaternion(controlObject.quaternion);
  }
};


export {
  CharacterFSM,
  BasicCharacterControllerProxy,
  BasicCharacterController,
}
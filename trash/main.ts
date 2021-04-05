/**
 * THIS ISN"T USED KADAJETT
 */

import * as THREE from 'three';

// Not sure why latest three.js package is missing these. Might be making a huge mistake updating. lol
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';

import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import {Constants} from 'quick-3d-mmo-shared';
import type {Constants as IConstants} from 'quick-3d-mmo-shared';

const { EVENT_TYPES, STATE_TYPES } = Constants;

const _CHARACTER_MODELS = {
  zombie: {
    base: 'mremireh_o_desbiens.fbx',
    path: 'src/resources/characters/zombie/',
    animations: {
      idle: 'idle.fbx',
      walk: 'walk.fbx',
      run: 'run.fbx',
      dance: 'dance.fbx',
    },
    nameOffset: 25,
  },
  guard: {
    base: 'castle_guard_01.fbx',
    path: 'src/resources/characters/guard/',
    animations: {
      idle: 'Sword And Shield Idle.fbx',
      walk: 'Sword And Shield Walk.fbx',
      run: 'Sword And Shield Run.fbx',
      dance: 'Macarena Dance.fbx',
    },
    nameOffset: 20,
  }
}


class FloatingName {
  params_: any;
  element_: HTMLCanvasElement;
  context2d_: CanvasRenderingContext2D;
  sprite_: THREE.Sprite;

  constructor(params) {
    this.params_ = params;
    this.Init_();
  }

  Destroy() {
    this.element_ = null;
  }

  Init_() {
    console.log("FloatingName Init_");
    const modelData = _CHARACTER_MODELS[this.params_.desc.character.class];

    this.element_ = document.createElement('canvas');
    this.context2d_ = this.element_.getContext('2d');
    this.context2d_.canvas.width = 256;
    this.context2d_.canvas.height = 128;
    this.context2d_.fillStyle = '#FFF';
    this.context2d_.font = "18pt Helvetica";
    this.context2d_.shadowOffsetX = 3;
    this.context2d_.shadowOffsetY = 3;
    this.context2d_.shadowColor = "rgba(0,0,0,0.3)";
    this.context2d_.shadowBlur = 4;
    this.context2d_.textAlign = 'center';
    this.context2d_.fillText(this.params_.desc.account.name, 128, 64);

    const map = new THREE.CanvasTexture(this.context2d_.canvas);

    this.sprite_ = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: map, color: 0xffffff }));
    this.sprite_.scale.set(20, 10, 1)
    this.sprite_.position.y += modelData.nameOffset;
    this.params_.parent.add(this.sprite_);
  }
};


class OurLoadingManager {
  loader_: any;
  files_: Set<any>;
  onLoad: () => void;


  constructor(loader) {
    this.loader_ = loader;
    this.files_ = new Set();
    this.onLoad = () => { };
  }

  load(file, cb) {
    console.log("OurLoadingManager load()", file);
    this.files_.add(file);

    this.loader_.load(file, (result) => {
      this.files_.delete(file);
      cb(result);

      if (this.files_.size == 0) {
        this.onLoad();
      }
    });
  }
};


class BasicCharacterControllerProxy {
  animations_: any;

  constructor(animations) {
    console.log('new BasicCharacterControllerProxy', animations)
    this.animations_ = animations;
  }

  get animations() {
    return this.animations_;
  }
};


class AnimatedMesh {
  params_: any;
  group_: any;
  target_: any;
  animations_: any;
  mixer_: any;
  onLoad: () => void;
  manager_: OurLoadingManager;

  constructor(params) {
    console.log('new AnimatedMesh', params)
    this.params_ = params;
    this.group_ = new THREE.Group();
    this.params_.scene.add(this.group_);
    this.target_ = null;
    this.animations_ = {};
    this.mixer_ = null;
    this.onLoad = () => { };
    this.Load_();
  }

  Destroy() {
    if (this.target_) {
      this.target_.traverse(c => {
        if (c.material) {
          c.material.dispose();
        }
        if (c.geometry) {
          c.geometry.dispose();
        }
      });
    }
    this.params_.scene.remove(this.group_);
  }

  get position() {
    return this.group_.position;
  }

  get quaternion() {
    return this.group_.quaternion;
  }

  Load_() {
    console.log("AnimatedMesh load_()")
    const modelData = _CHARACTER_MODELS[this.params_.desc.character.class];
    // kadajett. Had to add param null. expected "manager"
    const loader = new FBXLoader();
    loader.setPath(modelData.path);
    loader.load(modelData.base, (fbx) => {
      fbx.scale.setScalar(0.1);
      fbx.traverse(c => {
        c.castShadow = true;
      });

      this.target_ = fbx;
      this.group_.add(this.target_);

      this.mixer_ = new THREE.AnimationMixer(this.target_);

      const _OnLoad = (animName, anim) => {
        const clip = anim.animations[0];
        const action = this.mixer_.clipAction(clip);

        this.animations_[animName] = {
          clip: clip,
          action: action,
        };
      };

      // LoadingManager seems to be broken when you attempt to load multiple
      // resources multiple times, only first onLoad is called.
      // So roll our own.
      const loader = new FBXLoader();
      loader.setPath(modelData.path);

      this.manager_ = new OurLoadingManager(loader);
      this.manager_.load(
        modelData.animations.idle,
        (a) => { _OnLoad(STATE_TYPES.IDLE, a); });
      this.manager_.load(
        modelData.animations.walk,
        (a) => { _OnLoad(STATE_TYPES.WALK, a); });
      this.manager_.load(
        modelData.animations.run,
        (a) => { _OnLoad(STATE_TYPES.RUN, a); });
      this.manager_.load(
        modelData.animations.dance,
        (a) => { _OnLoad(STATE_TYPES.DANCE, a); });
      this.manager_.onLoad = () => {
        this.onLoad();
      };
    });
  }

  Update(timeElapsed) {
    if (this.mixer_) {
      this.mixer_.update(timeElapsed);
    }
  }
};


class BasicCharacterController {
  params_: any;
  decceleration_: THREE.Vector3;
  acceleration_: THREE.Vector3;
  velocity_: THREE.Vector3;
  position_: THREE.Vector3;
  quaternion_: THREE.Quaternion;
  loaded_: boolean;
  _input: BasicCharacterControllerInput;
  target_: AnimatedMesh;
  stateMachine_: CharacterFSM;
  _keys: []

  constructor(params) {
    console.log("new BasicCharacterController", params)
    this._Init(params);
  }

  _Init(params) {
    this.params_ = params;
    this.decceleration_ = new THREE.Vector3(-0.0005, -0.0001, -5.0);
    this.acceleration_ = new THREE.Vector3(1, 0.25, 50.0);
    this.velocity_ = new THREE.Vector3(0, 0, 0);
    this.position_ = new THREE.Vector3();
    this.quaternion_ = new THREE.Quaternion();
    this.loaded_ = false;

    this._input = new BasicCharacterControllerInput();

    this.target_ = new AnimatedMesh({
      scene: params.scene,
      desc: params.desc,
    });
    this.target_.onLoad = () => {
      this.loaded_ = true;
      this.stateMachine_.SetState(STATE_TYPES.IDLE);
    }
    this.stateMachine_ = new CharacterFSM(
      new BasicCharacterControllerProxy(this.target_.animations_));
  }

  get IsLoaded() {
    return this.loaded_;
  }

  get Position() {
    return this.position_;
  }

  get Rotation() {
    return this.quaternion_;
  }

  SetTransform(p, q) {
    this.position_.copy(p);
    this.quaternion_.copy(q);
    this.target_.group_.position.copy(this.position_);
    this.target_.group_.quaternion.copy(this.quaternion_);
  }

  CreateTransformPacket() {
    return [
      this.stateMachine_.currentState_.Name,
      this.position_.toArray(),
      this.quaternion_.toArray(),
    ];
  }

  Update(timeInSeconds) {
    if (!this.stateMachine_.currentState_) {
      return;
    }

    this.stateMachine_.Update(timeInSeconds, this._input);

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

    const controlObject = this.target_;
    const _Q = new THREE.Quaternion();
    const _A = new THREE.Vector3();
    const _R = controlObject.quaternion.clone();

    const acc = this.acceleration_.clone();
    if (this._input._keys.shift) {
      acc.multiplyScalar(2.0);
    }

    if (this.stateMachine_.currentState_.Name == STATE_TYPES.DANCE) {
      acc.multiplyScalar(0.0);
    }

    if (this._input._keys.forward) {
      velocity.z += acc.z * timeInSeconds;
    }
    if (this._input._keys.backward) {
      velocity.z -= acc.z * timeInSeconds;
    }
    if (this._input._keys.left) {
      _A.set(0, 1, 0);
      _Q.setFromAxisAngle(_A, 4.0 * Math.PI * timeInSeconds * this.acceleration_.y);
      _R.multiply(_Q);
    }
    if (this._input._keys.right) {
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

    controlObject.position.add(forward);
    controlObject.position.add(sideways);

    this.position_.copy(controlObject.position);
    this.quaternion_.copy(controlObject.quaternion);

    this.target_.Update(timeInSeconds); 
  }
};

interface IKeys {
  forward: boolean,
  backward: boolean,
  left: boolean,
  right: boolean,
  space: boolean,
  shift: boolean,
}

interface ICustomKeyboardEvent extends KeyboardEvent {
  currentTarget: HTMLElement & {
    activeElement: HTMLElement
  }
  keyCode: number
}

class BasicCharacterControllerInput {
  _keys: IKeys;

  constructor() {
    this._Init();
  }

  _Init() {
    this._keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      space: false,
      shift: false,
    };
    document.addEventListener('keydown', (e) => this.OnKeyDown_(e as ICustomKeyboardEvent), false);
    document.addEventListener('keyup', (e) => this._onKeyUp(e), false);
  }

  // extract this typedef into a shared interface
  OnKeyDown_(event: ICustomKeyboardEvent) {
    const activeElement = event?.currentTarget?.activeElement;
    if (activeElement != document.body) {
      return;
    }
    switch (event.keyCode) {
      case 87: // w
        this._keys.forward = true;
        break;
      case 65: // a
        this._keys.left = true;
        break;
      case 83: // s
        this._keys.backward = true;
        break;
      case 68: // d
        this._keys.right = true;
        break;
      case 32: // SPACE
        this._keys.space = true;
        break;
      case 16: // SHIFT
        this._keys.shift = true;
        break;
    }
  }

  _onKeyUp(event) {
    if (event.currentTarget.activeElement != document.body) {
      return;
    }
    switch (event.keyCode) {
      case 87: // w
        this._keys.forward = false;
        break;
      case 65: // a
        this._keys.left = false;
        break;
      case 83: // s
        this._keys.backward = false;
        break;
      case 68: // d
        this._keys.right = false;
        break;
      case 32: // SPACE
        this._keys.space = false;
        break;
      case 16: // SHIFT
        this._keys.shift = false;
        break;
    }
  }
};


class FiniteStateMachine {
  currentState_: any;
  _states: any;

  constructor() {
    this._states = {};
    this.currentState_ = null;
  }

  _AddState(name, type) {
    this._states[name] = type;
  }

  SetState(name) {
    const prevState = this.currentState_;

    if (prevState) {
      if (prevState.Name == name) {
        return;
      }
      prevState.Exit();
    }

    const state = new this._states[name](this);

    this.currentState_ = state;
    state.Enter(prevState);
  }

  Update(timeElapsed, input) {
    if (this.currentState_) {
      this.currentState_.Update(timeElapsed, input);
    }
  }
};


class CharacterFSM extends FiniteStateMachine {
  _proxy: any;

  constructor(proxy) {
    super();
    this._proxy = proxy;
    this._Init();
  }

  _Init() {
    this._AddState(STATE_TYPES.IDLE, IdleState);
    this._AddState(STATE_TYPES.WALK, WalkState);
    this._AddState(STATE_TYPES.RUN, RunState);
    this._AddState(STATE_TYPES.DANCE, DanceState);
  }
};


class State {
  _parent: any;
  constructor(parent) {
    this._parent = parent;
  }

  Enter(_) { }
  Exit() { }
  Update(a, b) { }
};


class DanceState extends State {
  _FinishedCallback: () => void;
  _CleanupCallback: any;

  constructor(parent) {
    super(parent);

    this._FinishedCallback = () => {
      this._Finished();
    }
  }

  get Name() {
    return STATE_TYPES.DANCE;
  }

  Enter(prevState) {
    const curAction = this._parent._proxy.animations_[STATE_TYPES.DANCE].action;
    const mixer = curAction.getMixer();
    mixer.addEventListener('finished', this._FinishedCallback);

    if (prevState) {
      const prevAction = this._parent._proxy.animations_[prevState.Name].action;

      curAction.reset();
      curAction.setLoop(THREE.LoopOnce, 1);
      curAction.clampWhenFinished = true;
      curAction.crossFadeFrom(prevAction, 0.2, true);
      curAction.play();
    } else {
      curAction.play();
    }
  }

  _Finished() {
    this._Cleanup();
    this._parent.SetState(STATE_TYPES.IDLE);
  }

  _Cleanup() {
    const action = this._parent._proxy.animations_[STATE_TYPES.DANCE].action;

    action.getMixer().removeEventListener('finished', this._CleanupCallback);
  }

  Exit() {
    this._Cleanup();
  }

  Update(_) {
  }
};


class WalkState extends State {
  constructor(parent) {
    super(parent);
  }

  get Name() {
    return STATE_TYPES.WALK;
  }

  Enter(prevState) {
    const curAction = this._parent._proxy.animations_[STATE_TYPES.WALK].action;
    if (prevState) {
      const prevAction = this._parent._proxy.animations_[prevState.Name].action;

      curAction.enabled = true;

      if (prevState.Name == STATE_TYPES.RUN) {
        const ratio = curAction.getClip().duration / prevAction.getClip().duration;
        curAction.time = prevAction.time * ratio;
      } else {
        curAction.time = 0.0;
        curAction.setEffectiveTimeScale(1.0);
        curAction.setEffectiveWeight(1.0);
      }

      curAction.crossFadeFrom(prevAction, 0.5, true);
      curAction.play();
    } else {
      curAction.play();
    }
  }

  Exit() {
  }

  Update(timeElapsed, input) {
    if (!input) {
      return;
    }

    if (input._keys.forward || input._keys.backward) {
      if (input._keys.shift) {
        this._parent.SetState(STATE_TYPES.RUN);
      }
      return;
    }

    this._parent.SetState(STATE_TYPES.IDLE);
  }
};


class RunState extends State {
  constructor(parent) {
    super(parent);
  }

  get Name() {
    return STATE_TYPES.RUN;
  }

  Enter(prevState) {
    const curAction = this._parent._proxy.animations_[STATE_TYPES.RUN].action;
    if (prevState) {
      const prevAction = this._parent._proxy.animations_[prevState.Name].action;

      curAction.enabled = true;

      if (prevState.Name == STATE_TYPES.WALK) {
        const ratio = curAction.getClip().duration / prevAction.getClip().duration;
        curAction.time = prevAction.time * ratio;
      } else {
        curAction.time = 0.0;
        curAction.setEffectiveTimeScale(1.0);
        curAction.setEffectiveWeight(1.0);
      }

      curAction.crossFadeFrom(prevAction, 0.5, true);
      curAction.play();
    } else {
      curAction.play();
    }
  }

  Exit() {
  }

  Update(timeElapsed, input) {
    if (!input) {
      return;
    }

    if (input._keys.forward || input._keys.backward) {
      if (!input._keys.shift) {
        this._parent.SetState(STATE_TYPES.WALK);
      }
      return;
    }

    this._parent.SetState(STATE_TYPES.IDLE);
  }
};


class IdleState extends State {
  constructor(parent) {
    super(parent);
  }

  get Name() {
    return STATE_TYPES.IDLE;
  }

  Enter(prevState) {
    const idleAction = this._parent._proxy.animations_[STATE_TYPES.IDLE].action;
    if (prevState) {
      const prevAction = this._parent._proxy.animations_[prevState.Name].action;
      idleAction.time = 0.0;
      idleAction.enabled = true;
      idleAction.setEffectiveTimeScale(1.0);
      idleAction.setEffectiveWeight(1.0);
      idleAction.crossFadeFrom(prevAction, 0.5, true);
      idleAction.play();
    } else {
      idleAction.play();
    }
  }

  Exit() {
  }

  Update(_, input) {
    if (!input) {
      return;
    }
    if (input._keys.forward || input._keys.backward) {
      this._parent.SetState(STATE_TYPES.WALK);
    } else if (input._keys.space) {
      this._parent.SetState(STATE_TYPES.DANCE);
    }
  }
};


class ThirdPersonCamera {
  params_: any;
  _camera: any;
  _currentPosition: THREE.Vector3;
  _currentLookat: THREE.Vector3;

  constructor(params) {
    this.params_ = params;
    this._camera = params.camera;

    this._currentPosition = new THREE.Vector3();
    this._currentLookat = new THREE.Vector3();
  }

  _CalculateIdealOffset() {
    const idealOffset = new THREE.Vector3(-15, 20, -30);
    idealOffset.applyQuaternion(this.params_.target.Rotation);
    idealOffset.add(this.params_.target.Position);
    return idealOffset;
  }

  _CalculateIdealLookat() {
    const idealLookat = new THREE.Vector3(0, 10, 50);
    idealLookat.applyQuaternion(this.params_.target.Rotation);
    idealLookat.add(this.params_.target.Position);
    return idealLookat;
  }

  Update(timeElapsed) {
    const idealOffset = this._CalculateIdealOffset();
    const idealLookat = this._CalculateIdealLookat();

    // const t = 0.05;
    // const t = 4.0 * timeElapsed;
    const t = 1.0 - Math.pow(0.001, timeElapsed);

    this._currentPosition.lerp(idealOffset, t);
    this._currentLookat.lerp(idealLookat, t);

    this._camera.position.copy(this._currentPosition);
    this._camera.lookAt(this._currentLookat);
  }
}


class PlayerEntity {
  params_: any;
  controls_: BasicCharacterController;
  thirdPersonCamera_: ThirdPersonCamera;
  updateTimer_: number;

  constructor(params) {
    this.params_ = params;
    this.Init_();
  }

  Init_() {
  }

  CreateFromDesc(desc) {
    const params = {
      camera: this.params_.camera,
      scene: this.params_.scene,
      desc: desc,
    };
    this.controls_ = new BasicCharacterController(params);

    this.thirdPersonCamera_ = new ThirdPersonCamera({
      camera: this.params_.camera,
      target: this.controls_,
    });

    this.updateTimer_ = 0.0;
  }

  UpdateTransform(data) {
    const s = data[0];
    const p = data[1];
    const q = data[2];
    this.controls_.SetTransform(
      new THREE.Vector3(...p),
      new THREE.Quaternion(...q)
    );
  }

  Update(timeElapsed) {
    this.controls_.Update(timeElapsed);
    this.thirdPersonCamera_.Update(timeElapsed);
    this.SendTransform_(timeElapsed);
  }

  SendTransform_(timeElapsed) {
    this.updateTimer_ -= timeElapsed;
    if (this.updateTimer_ <= 0.0 && this.controls_.IsLoaded) {
      this.updateTimer_ = 0.1;
      this.params_.socket.emit(
        EVENT_TYPES.WORLD_UPDATE,
        this.controls_.CreateTransformPacket(),
      );
    }
  }
};


class NetworkCharacterController {
  name_: any;
  target_: any;
  params_: any;
  stateMachine_: CharacterFSM;


  constructor(params) {
    this._Init(params);
  }

  Destroy() {
    this.name_?.Destroy?.();
    this.name_ = null;
    this.target_?.Destroy?.();
    this.target_ = null;
  }

  _Init(params) {
    this.params_ = params;

    this.target_ = new AnimatedMesh({
      scene: params.scene,
      desc: params.desc,
    });
    this.target_.onLoad = () => {
      this.stateMachine_ = new CharacterFSM(
        new BasicCharacterControllerProxy(this.target_.animations_));
      this.stateMachine_.SetState(STATE_TYPES.IDLE);
    }

    this.name_ = new FloatingName({
      parent: this.target_.group_,
      desc: params.desc,
    });
  }

  get position() {
    return this.target_.position;
  }

  get quaternion() {
    return this.target_.quaternion;
  }

  SetState(s) {
    if (!this.stateMachine_) {
      return;
    }
    this.stateMachine_.SetState(s);
  }

  Update(timeInSeconds) {
    if (!this.stateMachine_) {
      return;
    }

    this.stateMachine_.Update(timeInSeconds, null);
    this.target_.Update(timeInSeconds);
  }
};

interface ITransformUpdate {
  time: number,
  transform: []
}

class NetworkEntity {
  params_: any;
  transformUpdates_: ITransformUpdate[];
  lastFrame_: any;
  targetFrame_: any;
  controller_: any;

  constructor(params) {
    this.params_ = params;
    this.transformUpdates_ = [];
    this.targetFrame_ = null;
    this.lastFrame_ = null;
    this.Init_();
  }

  Destroy() {
    this.controller_?.Destroy?.();
  }

  Init_() {
  }

  CreateFromDesc(desc, transform) {
    this.controller_ = new NetworkCharacterController({
      scene: this.params_.scene,
      desc: desc,
    });
    this.controller_.position.set(...transform[1]);
    this.controller_.quaternion.set(...transform[2]);
    this.targetFrame_ = { time: 0.1, transform: transform };
  }

  UpdateTransform(data) {
    this.transformUpdates_.push({ time: 0.1, transform: data });
  }

  Update(timeElapsed) {
    this.controller_.Update(timeElapsed);

    this.ApplyLCT_(timeElapsed);
  }

  ApplyLCT_(timeElapsed) {
    if (this.transformUpdates_.length == 0) {
      return;
    }

    for (let i = 0; i < this.transformUpdates_.length; ++i) {
      this.transformUpdates_[i].time -= timeElapsed;
    }

    while (this.transformUpdates_.length > 0 &&
      this.transformUpdates_[0].time <= 0.0) {
      this.lastFrame_ = {
        transform: [
          this.targetFrame_.transform[0],
          this.controller_.position.toArray(),
          this.controller_.quaternion.toArray()
        ]
      };
      this.targetFrame_ = this.transformUpdates_.shift();
      this.targetFrame_.time = 0.0;
    }

    if (this.targetFrame_ && this.lastFrame_) {
      this.targetFrame_.time += timeElapsed;
      const p1 = new THREE.Vector3(...this.lastFrame_.transform[1]);
      const p2 = new THREE.Vector3(...this.targetFrame_.transform[1]);
      const q1 = new THREE.Quaternion(...this.lastFrame_.transform[2]);
      const q2 = new THREE.Quaternion(...this.targetFrame_.transform[2]);
      this.controller_.position.copy(p1);
      this.controller_.quaternion.copy(q1);
      const t = Math.max(Math.min(this.targetFrame_.time / 0.1, 1.0), 0.0);
      this.controller_.position.lerp(p2, t);
      this.controller_.quaternion.slerp(q2, t);
      this.controller_.SetState(this.lastFrame_.transform[0]);
    }
  }
}


class Chatbox {
  params_: any;
  element_: HTMLInputElement;
  OnChat: (msg) => void;

  constructor(params) {
    this.params_ = params;
    this.OnChat = () => { };
    this.Init_();
  }

  Init_() {
    this.element_ = document.getElementById('chat-input') as HTMLInputElement;
    this.element_.addEventListener(
      'keydown', (e) => this.OnKeyDown_(e), false);
  }

  OnKeyDown_(evt: any) {
    if (evt.keyCode === 13) {
      evt.preventDefault();
      const msg = this.element_.value;
      if (msg != '') {
        this.OnChat(msg);
      }
      this.element_.value = '';
    }
  }

  AddMessage(msg: any) {
    const e = document.createElement('div');
    e.className = 'chat-text';
    e.innerText = '[' + msg.name + ']: ' + msg.text;
    const chatElement = document.getElementById('chat-ui-text-area');
    chatElement.insertBefore(e, document.getElementById('chat-input'));
  }
};


class BasicMMODemo {
  threejs_: THREE.WebGLRenderer;
  camera_: THREE.PerspectiveCamera;
  scene_: THREE.Scene;
  entities_: any;
  chatbox_: Chatbox;
  previousRAF_: any;
  socket_: Socket;
  playerID_: string;


  constructor() {
    this._Initialize();
  }

  _Initialize() {
    this.threejs_ = new THREE.WebGLRenderer({
      antialias: true,
    });
    this.threejs_.outputEncoding = THREE.sRGBEncoding;
    this.threejs_.gammaFactor = 2.2;
    this.threejs_.shadowMap.enabled = true;
    this.threejs_.shadowMap.type = THREE.PCFSoftShadowMap;
    this.threejs_.setPixelRatio(window.devicePixelRatio);
    this.threejs_.setSize(window.innerWidth, window.innerHeight);

    document.getElementById('container').appendChild(
      this.threejs_.domElement);

    window.addEventListener('resize', () => {
      this.OnWindowResize_();
    }, false);

    const fov = 60;
    const aspect = 1920 / 1080;
    const near = 1.0;
    const far = 1000.0;
    this.camera_ = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this.camera_.position.set(75, 20, 0);

    this.scene_ = new THREE.Scene();

    let light = new THREE.DirectionalLight(0xFFFFFF, 1.0);
    light.position.set(20, 100, 10);
    light.target.position.set(0, 0, 0);
    light.castShadow = true;
    light.shadow.bias = -0.001;
    light.shadow.mapSize.width = 2048;
    light.shadow.mapSize.height = 2048;
    light.shadow.camera.near = 0.1;
    light.shadow.camera.far = 500.0;
    light.shadow.camera.near = 0.5;
    light.shadow.camera.far = 500.0;
    light.shadow.camera.left = 100;
    light.shadow.camera.right = -100;
    light.shadow.camera.top = 100;
    light.shadow.camera.bottom = -100;
    this.scene_.add(light);

    let light2 = new THREE.AmbientLight(0x101010);
    this.scene_.add(light2);

    const controls = new OrbitControls(
      this.camera_, this.threejs_.domElement);
    controls.target.set(0, 20, 0);
    controls.update();

    const loader = new THREE.CubeTextureLoader();
    const texture = loader.load([
      'src/resources/posx.jpg',
      'src/resources/negx.jpg',
      'src/resources/posy.jpg',
      'src/resources/negy.jpg',
      'src/resources/posz.jpg',
      'src/resources/negz.jpg',
    ]);
    texture.encoding = THREE.sRGBEncoding;
    this.scene_.background = texture;

    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(100, 100, 10, 10),
      new THREE.MeshStandardMaterial({
        color: 0x808080,
      }));
    plane.castShadow = false;
    plane.receiveShadow = true;
    plane.rotation.x = -Math.PI / 2;
    this.scene_.add(plane);

    this.SetupSocket_();

    this.entities_ = {};

    this.chatbox_ = new Chatbox(null);
    this.chatbox_.OnChat = (txt) => { this.OnChat_(txt); };

    this.previousRAF_ = null;
    this.RAF_();
  }

  GenerateRandomName_() {
    const names1 = [
      'Aspiring', 'Nameless', 'Cautionary', 'Excited',
      'Modest', 'Maniacal', 'Caffeinated', 'Sleepy',
      'Passionate', 'Masochistic', 'Aging', 'Pedantic',
      'Talkative',
    ];
    const names2 = [
      'Coder', 'Mute', 'Giraffe', 'Snowman',
      'Machinist', 'Fondler', 'Typist',
      'Noodler', 'Arborist', 'Peeper', 'Ghost',
    ];
    const n1 = names1[
      Math.floor(Math.random() * names1.length)];
    const n2 = names2[
      Math.floor(Math.random() * names2.length)];
    return n1 + ' ' + n2;
  }

  SetupSocket_() {
    this.socket_ = io('ws://localhost:3000', {
      reconnection: true,
      transports: ['websocket'],
    });

    // The socket.io TS definition is wrong I think. This is a hack. 
    (this.socket_ as any).on(EVENT_TYPES.CONNECT, () => {
      console.log("BasicMMODemo.socket_.on: ", EVENT_TYPES.CONNECT);
      const randomName = this.GenerateRandomName_();
      this.socket_.emit(EVENT_TYPES.LOGIN_COMMIT, randomName);
    });

    this.socket_.on("disconnect", () => {
      console.log('DISCONNECTED: ' + this.socket_.id); // undefined
    });

    this.socket_.onAny((e, d) => {
      console.log("BasicMMODemo.socket_.onAny(): ", {e, d})
      this.OnMessage_(e, d);
    });
  }

  OnChat_(txt) {
    this.socket_.emit(EVENT_TYPES.CHAT_MSG, txt);
  }

  OnMessage_(e, d) {
    if (e == EVENT_TYPES.WORLD_PLAYER) {
      debugger;
      this.playerID_ = d.id;
      const e = new PlayerEntity({
        scene: this.scene_,
        camera: this.camera_,
        socket: this.socket_
      });
      e.CreateFromDesc(d.desc);
      e.UpdateTransform(d.transform);
      this.entities_[d.id] = e;
      console.log('entering world: ' + d.id);
    } else if (e == EVENT_TYPES.WORLD_UPDATE) {
      const updates = d;
      const alive = {};

      alive[this.playerID_] = this.entities_[this.playerID_];

      for (let u of updates) {
        if ('desc' in u) {
          const e = new NetworkEntity({ scene: this.scene_ });
          e.CreateFromDesc(u.desc, u.transform);
          this.entities_[u.id] = e;
        } else {
          this.entities_[u.id].UpdateTransform(u.transform);
        }

        alive[u.id] = this.entities_[u.id];
      }

      const dead = [];
      for (let k in this.entities_) {
        if (!(k in alive)) {
          dead.push(this.entities_[k]);
        }
      }

      this.entities_ = alive;

      for (let i = 0; i < dead.length; ++i) {
        dead[i].Destroy();
      }
    } else if (e == 'chat.message') {
      this.chatbox_.AddMessage(d);
    }
  }

  OnWindowResize_() {
    this.camera_.aspect = window.innerWidth / window.innerHeight;
    this.camera_.updateProjectionMatrix();
    this.threejs_.setSize(window.innerWidth, window.innerHeight);
  }

  RAF_() {
    requestAnimationFrame((t) => {
      if (this.previousRAF_ == null) {
        this.previousRAF_ = t;
      }

      this.Update_((t - this.previousRAF_) * 0.001);
      this.threejs_.render(this.scene_, this.camera_);
      this.previousRAF_ = t;
      this.RAF_();
    });
  }

  Update_(timeElapsed) {
    for (let k in this.entities_) {
      this.entities_[k].Update(timeElapsed);
    }
  }
}


let _APP = null;

window.addEventListener('DOMContentLoaded', () => {
  _APP = new BasicMMODemo();
});

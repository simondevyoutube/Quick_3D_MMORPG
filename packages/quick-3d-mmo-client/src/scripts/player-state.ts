import * as THREE from 'three';

import { Constants } from 'quick-3d-mmo-shared';

const { STATE_TYPES } = Constants;

class State {
  _parent: any;
  constructor(parent) {
    this._parent = parent;
  }

};

class DeathState extends State {
  _action: any;
  constructor(parent) {
    super(parent);

    this._action = null;
  }

  get Name() {
    return STATE_TYPES.DEATH;
  }

  Enter(prevState) {
    this._action = this._parent._proxy.animations[STATE_TYPES.DEATH].action;

    this._action.reset();
    this._action.setLoop(THREE.LoopOnce, 1);
    this._action.clampWhenFinished = true;

    if (prevState) {
      const prevAction = this._parent._proxy.animations[prevState.Name].action;

      this._action.crossFadeFrom(prevAction, 0.2, true);
      this._action.play();
    } else {
      this._action.play();
    }
  }

  Exit() {
  }

  Update(arg0?: any, arg1?: any): void {
  }
};

class DanceState extends State {
  _action: any;
  _FinishedCallback: () => void;
  constructor(parent) {
    super(parent);

    this._action = null;

    this._FinishedCallback = () => {
      this._Finished();
    }
  }

  get Name() {
    return STATE_TYPES.DANCE;
  }

  Enter(prevState) {
    this._action = this._parent._proxy.animations[STATE_TYPES.DANCE].action;
    const mixer = this._action.getMixer();
    mixer.addEventListener('finished', this._FinishedCallback);

    this._action.reset();
    this._action.setLoop(THREE.LoopOnce, 1);
    this._action.clampWhenFinished = true;

    if (prevState) {
      const prevAction = this._parent._proxy.animations[prevState.Name].action;

      this._action.crossFadeFrom(prevAction, 0.2, true);
      this._action.play();
    } else {
      this._action.play();
    }
  }

  _Finished() {
    this._Cleanup();
    this._parent.SetState(STATE_TYPES.IDLE);
  }

  _Cleanup() {
    if (this._action) {
      this._action.getMixer().removeEventListener('finished', this._FinishedCallback);
    }
  }

  Exit() {
    this._Cleanup();
  }

  Update() {
  }
};

class AttackState extends State {
  _action: any;
  _FinishedCallback: () => void;
  constructor(parent) {
    super(parent);

    this._action = null;

    this._FinishedCallback = () => {
      this._Finished();
    }
  }

  get Name() {
    return STATE_TYPES.ATTACK;
  }

  Enter(prevState) {
    this._action = this._parent._proxy.animations[STATE_TYPES.ATTACK].action;
    const mixer = this._action.getMixer();
    mixer.addEventListener('finished', this._FinishedCallback);

    if (prevState) {
      const prevAction = this._parent._proxy.animations[prevState.Name].action;

      this._action.reset();
      this._action.setLoop(THREE.LoopOnce, 1);
      this._action.clampWhenFinished = true;
      this._action.crossFadeFrom(prevAction, 0.4, true);
      this._action.play();
    } else {
      this._action.play();
    }
  }

  _Finished() {
    this._Cleanup();
    this._parent.SetState(STATE_TYPES.IDLE);
  }

  _Cleanup() {
    if (this._action) {
      this._action.getMixer().removeEventListener('finished', this._FinishedCallback);
    }
  }

  Exit() {
    this._Cleanup();
  }

  Update() {
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
    const curAction = this._parent._proxy.animations[STATE_TYPES.WALK].action;
    if (prevState) {
      const prevAction = this._parent._proxy.animations[prevState.Name].action;

      curAction.enabled = true;

      if (prevState.Name == STATE_TYPES.RUN) {
        const ratio = curAction.getClip().duration / prevAction.getClip().duration;
        curAction.time = prevAction.time * ratio;
      } else {
        curAction.time = 0.0;
        curAction.setEffectiveTimeScale(1.0);
        curAction.setEffectiveWeight(1.0);
      }

      curAction.crossFadeFrom(prevAction, 0.1, true);
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
    const curAction = this._parent._proxy.animations[STATE_TYPES.RUN].action;
    if (prevState) {
      const prevAction = this._parent._proxy.animations[prevState.Name].action;

      curAction.enabled = true;

      if (prevState.Name == STATE_TYPES.WALK) {
        const ratio = curAction.getClip().duration / prevAction.getClip().duration;
        curAction.time = prevAction.time * ratio;
      } else {
        curAction.time = 0.0;
        curAction.setEffectiveTimeScale(1.0);
        curAction.setEffectiveWeight(1.0);
      }

      curAction.crossFadeFrom(prevAction, 0.1, true);
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
    const idleAction = this._parent._proxy.animations[STATE_TYPES.IDLE].action;
    if (prevState) {
      const prevAction = this._parent._proxy.animations[prevState.Name].action;
      idleAction.time = 0.0;
      idleAction.enabled = true;
      idleAction.setEffectiveTimeScale(1.0);
      idleAction.setEffectiveWeight(1.0);
      idleAction.crossFadeFrom(prevAction, 0.25, true);
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
      this._parent.SetState(STATE_TYPES.ATTACK);
    } else if (input._keys.backspace) {
      this._parent.SetState(STATE_TYPES.DANCE);
    }
  }
};
export {
  State,
  DanceState,
  AttackState,
  IdleState,
  WalkState,
  RunState,
  DeathState,
}
import { FiniteStateMachine } from "./finitestatemachine.js"
import {
  AttackState,
  DanceState,
  DeathState,
  IdleState,
  RunState,
  WalkState,
} from "./state.js"

export class CharacterFSM extends FiniteStateMachine {
  constructor(proxy) {
    super();
    this._proxy = proxy;
    this.Init_();
  }

  Init_() {
    this._AddState("idle", IdleState);
    this._AddState("walk", WalkState);
    this._AddState("run", RunState);
    this._AddState("attack", AttackState);
    this._AddState("death", DeathState);
    this._AddState("dance", DanceState);
  }
}
import * as THREE from 'three';

import {Component} from './entity';
import {EVENT_TYPES} from 'shared/src/constants'


export const attack_controller = (() => {

  class AttackController extends Component {
    action_: any;

    constructor() {
      super();
      this.action_ = null;
    }

    InitComponent() {
      this._RegisterHandler(EVENT_TYPES.PLAYER_ACTION, (m: {action: EVENT_TYPES}) => { this._OnAnimAction(m); });
    }

    _OnAnimAction(m) {
      if (m.action != EVENT_TYPES.ATTACK) {
        this.action_ = m.action;
        return;
      } else if (m.action != this.action_) {
        this.action_ = m.action;
        this.Broadcast({
            topic: EVENT_TYPES.ACTION_ATTACK,
        });
      }
    }
  };

  return {
      AttackController: AttackController,
  };
})();
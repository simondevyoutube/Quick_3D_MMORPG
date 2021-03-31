import { Component } from './entity';
import { Constants } from 'shared';
const { EVENT_TYPES } = Object.assign({}, Constants);
class AttackController extends Component {
    constructor() {
        super();
        this.action_ = null;
    }
    InitComponent() {
        this._RegisterHandler(EVENT_TYPES.PLAYER_ACTION, (m) => { this._OnAnimAction(m); });
    }
    _OnAnimAction(m) {
        if (m.action != EVENT_TYPES.ATTACK) {
            this.action_ = m.action;
            return;
        }
        else if (m.action != this.action_) {
            this.action_ = m.action;
            this.Broadcast({
                topic: EVENT_TYPES.ACTION_ATTACK,
            });
        }
    }
}
;
export { AttackController };

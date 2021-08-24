import { Component } from "../objects/entity.js";

export class AttackController extends Component {
  constructor() {
    super();
    this.action_ = null;
  }

  InitComponent() {
    this._RegisterHandler("player.action", (m) => {
      this._OnAnimAction(m);
    });
  }

  _OnAnimAction(m) {
    if (m.action != "attack") {
      this.action_ = m.action;
      return;
    } else if (m.action != this.action_) {
      this.action_ = m.action;
      this.Broadcast({
        topic: "action.attack",
      });
    }
  }
}

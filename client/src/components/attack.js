import { Component } from "../utils/component.js";

export class AttackController extends Component {
  action_ = undefined;
  
  constructor() {
    super();
  }

  InitComponent() {
    this.registerHandler("player.action", (m) => {
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

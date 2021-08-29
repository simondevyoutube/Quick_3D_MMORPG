export class Attack {
  action_ = undefined;

  initComponent() {
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
      this.broadcast({
        topic: "action.attack",
      });
    }
  }
}

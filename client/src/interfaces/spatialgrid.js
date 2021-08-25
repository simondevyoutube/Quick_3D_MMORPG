import { Component } from "../utils/component.js";

export class SpatialGridController extends Component {
  constructor(params) {
    super();

    this.grid_ = params.grid;
  }

  destroy() {
    this.grid_.Remove(this.client_);
    this.client_ = null;
  }

  InitComponent() {
    const pos = [
      this.parent.position.x,
      this.parent.position.z,
    ];

    this.client_ = this.grid_.NewClient(pos, [1, 1]);
    this.client_.entity = this.parent;
    this.registerHandler("update.position", (m) => this._OnPosition(m));
  }

  _OnPosition(msg) {
    this.client_.position = [msg.value.x, msg.value.z];
    this.grid_.UpdateClient(this.client_);
  }

  FindNearbyEntities(range) {
    const results = this.grid_.FindNear(
      [this.parent.position.x, this.parent.position.z],
      [range, range],
    );

    return results.filter((c) => c.entity != this.parent);
  }
}

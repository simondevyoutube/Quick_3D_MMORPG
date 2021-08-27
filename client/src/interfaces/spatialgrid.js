import { Component } from "../structures/component.js";

export class Grid extends Component {
  constructor(world, entity) {
    super();
    this.world = world
    this.grid = world.grid;
    
    this.entity = entity
  }

  destroy() {
    this.grid.Remove(this.client_);
    this.client_ = undefined;
  }

  InitComponent() {
    const pos = [
      this.entity.position.x,
      this.entity.position.z,
    ];

    this.client_ = this.grid.NewClient(pos, [1, 1]);
    this.client_.entity = this.entity;
    this.registerHandler("update.position", (m) => this._OnPosition(m));
  }

  _OnPosition(msg) {
    this.client_.position = [msg.value.x, msg.value.z];
    this.grid.UpdateClient(this.client_);
  }

  FindNearbyEntities(range) {
    const results = this.grid.FindNear(
      [this.parent.position.x, this.parent.position.z],
      [range, range],
    );

    return results.filter((c) => c.entity != this.parent);
  }
}

import { THREE } from "../deps.js";

let ID = 0

export class Entity {
  name = `entity_${ID++}`;
  position = new THREE.Vector3();
  quaternion = new THREE.Quaternion();
  handlers = {};
  dead = false;

  destroy() {
    this.handlers = undefined;
  }

  registerHandler(name, handler) {
    if (!(name in this.handlers)) {
      this.handlers[name] = [];
    }
    this.handlers[name].push(handler);
  }

  broadcast(msg) {
    if (!(msg.topic in this.handlers)) {
      // console.warn(`${msg.topic} was not handled`);
      return;
    }

    for (const curHandler of this.handlers[msg.topic]) {
      curHandler(msg);
    }
  }

  setPosition(p) {
    this.position.copy(p);
    this.broadcast({
      topic: "update.position",
      value: this.position,
    });
  }

  setQuaternion(q) {
    this.quaternion.copy(q);
    this.broadcast({
      topic: "update.quaternion",
      value: this.quaternion,
    });
  }
}
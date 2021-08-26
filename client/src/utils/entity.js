import { THREE } from "../deps.js";

export class Entity {
  name = undefined;
  position = new THREE.Vector3();
  quaternion = new THREE.Quaternion();
  components = {};
  handlers = {};
  parent = undefined;
  dead = false;

  destroy() {
    for (const k in this.components) {
      this.components[k].destroy();
    }
    this.components = undefined;
    this.parent = undefined;
    this.handlers = undefined;
  }

  registerHandler(name, handler) {
    if (!(name in this.handlers)) {
      this.handlers[name] = [];
    }
    this.handlers[name].push(handler);
  }

  SetActive(b) {
    this.parent.SetActive(this, b);
  }

  AddComponent(c) {
    c.parent = this;
    this.components[c.constructor.name] = c;

    c.InitComponent();
  }

  // TODO-DefinitelyMaybe: components should not need to be initialized like this
  InitEntity() {
    for (const k in this.components) {
      this.components[k].InitEntity();
    }
  }

  GetComponent(n) {
    return this.components[n];
  }

  // TODO-DefinitelyMaybe: Finding an entity is not the job of the entity
  FindEntity(n) {
    return this.parent.get(n);
  }

  Broadcast(msg) {
    if (!(msg.topic in this.handlers)) {
      // console.warn(`${msg.topic} was not handled`);
      return;
    }

    for (const curHandler of this.handlers[msg.topic]) {
      curHandler(msg);
    }
  }

  SetPosition(p) {
    this.position.copy(p);
    this.Broadcast({
      topic: "update.position",
      value: this.position,
    });
  }

  SetQuaternion(q) {
    this.quaternion.copy(q);
    this.Broadcast({
      topic: "update.quaternion",
      value: this.quaternion,
    });
  }

  Update(timeElapsed) {
    for (const k in this.components) {
      this.components[k].Update(timeElapsed);
    }
  }
}
import { THREE } from "../deps.js";

export class Entity {
  name = null;
  components = {};
  position = new THREE.Vector3();
  rotation = new THREE.Quaternion();
  handlers = {};
  parent = null;
  dead = false;

  destroy() {
    for (const k in this.components) {
      this.components[k].destroy();
    }
    this.components = null;
    this.parent = null;
    this.handlers = null;
  }

  registerHandler(n, h) {
    if (!(n in this.handlers)) {
      this.handlers[n] = [];
    }
    this.handlers[n].push(h);
  }

  SetActive(b) {
    this.parent.SetActive(this, b);
  }

  SetDead() {
    this.dead = true;
  }

  AddComponent(c) {
    c.SetParent(this);
    this.components[c.constructor.name] = c;

    c.InitComponent();
  }

  InitEntity() {
    for (const k in this.components) {
      this.components[k].InitEntity();
    }
  }

  GetComponent(n) {
    return this.components[n];
  }

  FindEntity(n) {
    return this.parent.Get(n);
  }

  Broadcast(msg) {
    if (!(msg.topic in this.handlers)) {
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

  SetQuaternion(r) {
    this.rotation.copy(r);
    this.Broadcast({
      topic: "update.rotation",
      value: this.rotation,
    });
  }

  get Position() {
    return this.position;
  }

  get Quaternion() {
    return this.rotation;
  }

  Update(timeElapsed) {
    for (const k in this.components) {
      this.components[k].Update(timeElapsed);
    }
  }
}
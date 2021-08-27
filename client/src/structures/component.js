export class Component {
  parent = undefined;

  destroy() {}

  initComponent() {}

  InitEntity() {}

  GetComponent(n) {
    return this.parent.GetComponent(n);
  }

  get Manager() {
    return this.parent.parent;
  }

  broadcast(m) {
    this.parent.broadcast(m);
  }

  Update(_) {}

  registerHandler(name, handler) {
    this.parent.registerHandler(name, handler);
  }
}

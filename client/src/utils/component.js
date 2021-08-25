export class Component {
  parent = null;

  destroy() {
  }

  SetParent(p) {
    this.parent = p;
  }

  InitComponent() {}

  InitEntity() {}

  GetComponent(n) {
    return this.parent.GetComponent(n);
  }

  get Manager() {
    return this.parent.parent;
  }

  get Parent() {
    return this.parent;
  }

  FindEntity(n) {
    return this.parent.FindEntity(n);
  }

  Broadcast(m) {
    this.parent.Broadcast(m);
  }

  Update(_) {}

  registerHandler(n, h) {
    this.parent.registerHandler(n, h);
  }
}

import { THREE } from "../deps.js";

/** For generating a 3D cube that looks like a sphere. NYI */
export class CubeQuadTree {
  constructor(args) {
    this.radius = args.radius;
    this.minSize = args.min_node_size
    this.faces = [];

    const transforms = [];

    // TODO-DefinitelyMaybe: Keeping it simple to begin with. Only one of the cube faces is active
    // ref: https://www.youtube.com/watch?v=HIYs7Hoq2yQ
    
    // +Y
    let m = new THREE.Matrix4();
    m = transforms.push(m);
    // m.makeRotationX(-Math.PI / 2);
    // m.premultiply(new THREE.Matrix4().makeTranslation(0, this.radius, 0));
    // transforms.push(m);  

    // // -Y
    // m = new THREE.Matrix4();
    // m.makeRotationX(Math.PI / 2);
    // m.premultiply(new THREE.Matrix4().makeTranslation(0, -this.radius, 0));
    // transforms.push(m);

    // // +X
    // m = new THREE.Matrix4();
    // m.makeRotationY(Math.PI / 2);
    // m.premultiply(new THREE.Matrix4().makeTranslation(this.radius, 0, 0));
    // transforms.push(m);

    // // -X
    // m = new THREE.Matrix4();
    // m.makeRotationY(-Math.PI / 2);
    // m.premultiply(new THREE.Matrix4().makeTranslation(-this.radius, 0, 0));
    // transforms.push(m);

    // // +Z
    // m = new THREE.Matrix4();
    // m.premultiply(new THREE.Matrix4().makeTranslation(0, 0, this.radius));
    // transforms.push(m);

    // // -Z
    // m = new THREE.Matrix4();
    // m.makeRotationY(Math.PI);
    // m.premultiply(new THREE.Matrix4().makeTranslation(0, 0, -this.radius));
    // transforms.push(m);

    for (const t of transforms) {
      this.faces.push({
        transform: t.clone(),
        quadtree: new QuadTree({
          size: this.radius,
          min_node_size: this.minSize,
        }),
      });
    }
  }

  GetChildren() {
    const children = [];

    for (const face of this.faces) {
      children.push({
        transform: face.transform,
        children: face.quadtree.GetChildren(),
      });
    }
    return children;
  }

  Insert(pos) {
    // TODO-DefinitelyMaybe: wouldn't we only insert a position into a single face?
    for (const face of this.faces) {
      face.quadtree.Insert(pos);
    }
  }
}

/** For generating a 2D landscape */
export class QuadTree {
  // TODO-DefinitelyMaybe: Create a method of update so that we don't need to keep recreating the structure
  constructor(params) {
    const s = params.size;
    const b = new THREE.Box3(
      new THREE.Vector3(-s, 0, -s),
      new THREE.Vector3(s, 0, s),
    );
    this._root = {
      bounds: b,
      children: [],
      center: b.getCenter(new THREE.Vector3()),
      size: b.getSize(new THREE.Vector3()),
      root: true,
    };

    this._params = params;
  }

  GetChildren() {
    const children = [];
    this._GetChildren(this._root, children);
    return children;
  }

  _GetChildren(node, target) {
    if (node.children.length == 0) {
      target.push(node);
      return;
    }

    for (let c of node.children) {
      this._GetChildren(c, target);
    }
  }

  Insert(pos) {
    this._Insert(this._root, pos);
  }

  _Insert(child, pos) {
    const distToChild = this._DistanceToChild(child, pos);

    if (
      distToChild < child.size.x * 1.5 &&
      child.size.x > this._params.min_node_size
    ) {
      child.children = this._CreateChildren(child);

      for (let c of child.children) {
        this._Insert(c, pos);
      }
    }
  }

  _DistanceToChild(child, pos) {
    return child.center.distanceTo(pos);
  }

  _CreateChildren(child) {
    const midpoint = child.bounds.getCenter(new THREE.Vector3());

    // Bottom left
    const b1 = new THREE.Box3(child.bounds.min, midpoint);

    // Bottom right
    const b2 = new THREE.Box3(
      new THREE.Vector3(midpoint.x, 0, child.bounds.min.z),
      new THREE.Vector3(child.bounds.max.x, 0, midpoint.z),
    );

    // Top left
    const b3 = new THREE.Box3(
      new THREE.Vector3(child.bounds.min.x, 0, midpoint.z),
      new THREE.Vector3(midpoint.x, 0, child.bounds.max.z),
    );

    // Top right
    const b4 = new THREE.Box3(midpoint, child.bounds.max);

    const children = [b1, b2, b3, b4].map(
      (b) => {
        return {
          bounds: b,
          children: [],
          center: b.getCenter(new THREE.Vector3()),
          size: b.getSize(new THREE.Vector3()),
        };
      },
    );

    return children;
  }
}

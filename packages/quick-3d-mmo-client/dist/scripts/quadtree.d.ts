import * as THREE from 'three';
declare class CubeQuadTree {
    _params: any;
    _sides: any[];
    constructor(params: any);
    GetChildren(): any[];
    Insert(pos: any): void;
}
declare class QuadTree {
    _root: {
        bounds: THREE.Box3;
        children: any[];
        center: THREE.Vector3;
        size: THREE.Vector3;
        root: boolean;
    };
    _params: any;
    constructor(params: any);
    GetChildren(): any[];
    _GetChildren(node: any, target: any): void;
    Insert(pos: any): void;
    _Insert(child: any, pos: any): void;
    _DistanceToChild(child: any, pos: any): any;
    _CreateChildren(child: any): {
        bounds: any;
        children: any[];
        center: any;
        size: any;
    }[];
}
export { QuadTree, CubeQuadTree };

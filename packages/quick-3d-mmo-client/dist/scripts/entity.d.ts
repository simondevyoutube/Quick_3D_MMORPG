import * as THREE from 'three';
declare class Entity {
    _name: any;
    _components: {};
    _position: THREE.Vector3;
    _rotation: THREE.Quaternion;
    _handlers: {};
    parent_: any;
    dead_: boolean;
    Account: any;
    constructor();
    Destroy(): void;
    _RegisterHandler(n: any, h: any): void;
    SetParent(p: any): void;
    SetName(n: any): void;
    get Name(): any;
    get Manager(): any;
    SetActive(b: any): void;
    SetDead(): void;
    AddComponent(c: any): void;
    InitEntity(): void;
    GetComponent(n: any): any;
    FindEntity(n: any): any;
    Broadcast(msg: any): void;
    SetPosition(p: any): void;
    SetQuaternion(r: any): void;
    get Position(): any;
    get Quaternion(): any;
    Update(timeElapsed: any): void;
}
declare class Component {
    parent_: any;
    constructor(params?: any);
    Destroy(): void;
    SetParent(p: any): void;
    InitComponent(): void;
    InitEntity(): void;
    GetComponent(n: any): any;
    get Manager(): any;
    get Parent(): any;
    FindEntity(n: any): any;
    Broadcast(m: any): void;
    Update(_: any): void;
    _RegisterHandler(n: any, h: any): void;
}
export { Entity, Component };

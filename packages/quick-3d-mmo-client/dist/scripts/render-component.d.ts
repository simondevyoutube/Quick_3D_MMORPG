import * as THREE from 'three';
import { Component } from './entity';
declare class RenderComponent extends Component {
    group_: THREE.Group;
    params_: any;
    _target: any;
    constructor(params: any);
    Destroy(): void;
    InitEntity(): void;
    _Init(params: any): void;
    InitComponent(): void;
    _OnPosition(m: any): void;
    _OnRotation(m: any): void;
    _LoadModels(): void;
    _OnLoaded(obj: any): void;
    _LoadGLB(): void;
    _LoadFBX(): void;
    _LoadOBJ(): void;
    Update(timeInSeconds: any): void;
}
export { RenderComponent };

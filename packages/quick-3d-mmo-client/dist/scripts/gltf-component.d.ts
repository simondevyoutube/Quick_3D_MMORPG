import { Component } from './entity';
declare class StaticModelComponent extends Component {
    _params: any;
    _target: any;
    constructor(params: any);
    _Init(params: any): void;
    InitComponent(): void;
    _OnPosition(m: any): void;
    _LoadModels(): void;
    _OnLoaded(obj: any): void;
    _LoadGLB(): void;
    _LoadFBX(): void;
    Update(timeInSeconds: any): void;
}
declare class AnimatedModelComponent extends Component {
    _target: any;
    _params: any;
    _parent: any;
    _mixer: any;
    constructor(params: any);
    InitComponent(): void;
    _OnPosition(m: any): void;
    _Init(params: any): void;
    _LoadModels(): void;
    _OnLoaded(obj: any, animations: any): void;
    _LoadGLB(): void;
    _LoadFBX(): void;
    Update(timeInSeconds: any): void;
}
export { StaticModelComponent, AnimatedModelComponent };

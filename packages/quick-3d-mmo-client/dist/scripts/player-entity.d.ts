import * as THREE from 'three';
import { Component } from './entity';
import { FiniteStateMachine } from './finite-state-machine';
declare class CharacterFSM extends FiniteStateMachine {
    _proxy: any;
    constructor(proxy: any);
    Init_(): void;
}
declare class BasicCharacterControllerProxy {
    animations_: any;
    constructor(animations: any);
    get animations(): any;
}
declare class BasicCharacterController extends Component {
    params_: any;
    decceleration_: THREE.Vector3;
    acceleration_: THREE.Vector3;
    velocity_: THREE.Vector3;
    group_: THREE.Group;
    animations_: {};
    stateMachine_: any;
    target_: any;
    bones_: {};
    _mixer: THREE.AnimationMixer;
    constructor(params: any);
    InitEntity(): void;
    Init_(): void;
    InitComponent(): void;
    OnUpdatePosition_(msg: any): void;
    OnUpdateRotation_(msg: any): void;
    OnDeath_(msg: any): void;
    LoadModels_(): void;
    _FindIntersections(pos: any, oldPos: any): any[];
    Update(timeInSeconds: any): void;
}
export { CharacterFSM, BasicCharacterControllerProxy, BasicCharacterController, };

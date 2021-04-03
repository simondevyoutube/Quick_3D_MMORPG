import * as THREE from 'three';
import { Component } from './entity';
declare class NPCController extends Component {
    params_: any;
    group_: any;
    animations_: {};
    queuedState_: any;
    stateMachine_: any;
    target_: any;
    bones_: {};
    mixer_: THREE.AnimationMixer;
    constructor(params: any);
    Destroy(): void;
    InitEntity(): void;
    _Init(): void;
    InitComponent(): void;
    SetState(s: any): void;
    OnDeath_(msg: any): void;
    OnPosition_(m: any): void;
    OnRotation_(m: any): void;
    LoadModels_(): void;
    Update(timeInSeconds: any): void;
}
export { NPCController };

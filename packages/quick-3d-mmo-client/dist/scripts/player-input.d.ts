import * as THREE from 'three';
import { Component } from "./entity";
declare class PickableComponent extends Component {
    constructor();
    InitComponent(): void;
}
declare class BasicCharacterControllerInput extends Component {
    _params: any;
    _keys: {
        forward: boolean;
        backward: boolean;
        left: boolean;
        right: boolean;
        space: boolean;
        shift: boolean;
        backspace: boolean;
    };
    _raycaster: THREE.Raycaster;
    constructor(params: any);
    _Init(): void;
    _onMouseUp(event: any): void;
    _onKeyDown(event: any): void;
    _onKeyUp(event: any): void;
}
export { BasicCharacterControllerInput, PickableComponent, };

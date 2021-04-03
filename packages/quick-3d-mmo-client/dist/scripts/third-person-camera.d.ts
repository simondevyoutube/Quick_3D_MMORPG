import * as THREE from 'three';
import { Component } from './entity';
declare class ThirdPersonCamera extends Component {
    _params: any;
    _camera: any;
    _currentPosition: THREE.Vector3;
    _currentLookat: THREE.Vector3;
    constructor(params: any);
    _CalculateIdealOffset(): any;
    _CalculateIdealLookat(): any;
    Update(timeElapsed: any): void;
}
export { ThirdPersonCamera };

import * as THREE from 'three';
import { Component } from './entity';
declare class HealthBar extends Component {
    params_: any;
    material_: any;
    geometry_: any;
    bar_: THREE.Mesh<any, any>;
    realHealth_: number;
    animHealth_: number;
    constructor(params: any);
    Destroy(): void;
    Initialize_(): void;
    InitComponent(): void;
    OnHealth_(msg: any): void;
    Update(timeElapsed: any): void;
    GenerateBuffers_(): void;
}
export { HealthBar };

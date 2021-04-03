import * as THREE from 'three';
import { Component } from "./entity";
declare class ThreeJSController extends Component {
    threejs_: THREE.WebGLRenderer;
    camera_: THREE.PerspectiveCamera;
    scene_: THREE.Scene;
    sun_: THREE.DirectionalLight;
    constructor();
    InitEntity(): void;
    _OnWindowResize(): void;
    LoadSky_(): void;
    Update(_: any): void;
}
export { ThreeJSController };

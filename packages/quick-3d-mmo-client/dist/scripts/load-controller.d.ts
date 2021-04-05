import { Component } from "./entity";
declare class LoadController extends Component {
    textures_: {};
    models_: {};
    constructor();
    LoadTexture(path: any, name: any): any;
    LoadFBX(path: any, name: any, onLoad: any): void;
    LoadSkinnedGLB(path: any, name: any, onLoad: any): void;
}
export { LoadController };

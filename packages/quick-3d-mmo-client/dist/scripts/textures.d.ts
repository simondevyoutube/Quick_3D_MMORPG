import * as THREE from 'three';
declare class TextureAtlas {
    onLoad: () => void;
    _threejs: any;
    _manager: THREE.LoadingManager;
    _loader: THREE.TextureLoader;
    _textures: {};
    constructor(params: any);
    Load(atlas: any, names: any): void;
    _Create(): void;
    get Info(): {};
    _LoadTexture(n: any): any;
    _OnLoad(): void;
    _LoadAtlas(atlas: any, names: any): void;
}
export { TextureAtlas };

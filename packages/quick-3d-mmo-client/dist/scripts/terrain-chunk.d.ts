import * as THREE from 'three';
declare class TerrainChunk {
    _params: any;
    _geometry: THREE.BufferGeometry;
    _plane: THREE.Mesh;
    constructor(params: any);
    Destroy(): void;
    Hide(): void;
    Show(): void;
    _Init(params: any): void;
    Update(cameraPosition: any): void;
    Reinit(params: any): void;
    RebuildMeshFromData(data: any): void;
}
export { TerrainChunk };

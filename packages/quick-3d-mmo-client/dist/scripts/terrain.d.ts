import * as THREE from 'three';
import { Component } from './entity';
import { TerrainChunkRebuilder_Threaded } from './terrain-builder-threaded';
declare class TerrainChunkManager extends Component {
    _params: any;
    _material: THREE.MeshStandardMaterial;
    _builder: TerrainChunkRebuilder_Threaded;
    heightGenerator_: any;
    _biomes: any;
    _biomesParams: any;
    _colourNoise: any;
    _colourNoiseParams: {
        octaves: number;
        persistence: number;
        lacunarity: number;
        exponentiation: number;
        scale: number;
        noiseType: string;
        seed: number;
        height: number;
    };
    _groups: THREE.Group[];
    _chunks: any;
    constructor(params: any);
    _Init(params: any): void;
    _InitNoise(): void;
    _InitBiomes(params: any): void;
    _InitTerrain(params: any): void;
    _CreateTerrainChunk(group: any, groupTransform: any, offset: any, width: any, resolution: any): any;
    GetHeight(pos: any): any;
    GetBiomeAt(pos: any): any;
    Update(_: any): void;
    _UpdateVisibleChunks_Quadtree(target: any): void;
}
export { TerrainChunkManager };

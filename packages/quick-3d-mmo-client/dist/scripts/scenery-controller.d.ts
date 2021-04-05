import { Entity, Component } from './entity';
import type { Noise as INoise } from 'quick-3d-mmo-shared';
declare class SceneryController extends Component {
    params_: any;
    noise_: INoise.Noise;
    center_: any;
    crap_: any[];
    constructor(params: any);
    InitEntity(): void;
    SpawnClouds_(): void;
    FindBiome_(terrain: any, pos: any): "forest" | "arid" | "desert";
    SpawnAt_(biome: any, spawnPos: any): Entity;
    SpawnCrap_(): void;
    Update(_: any): void;
}
export { SceneryController };

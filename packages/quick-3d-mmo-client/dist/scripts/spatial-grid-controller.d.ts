import { Component } from './entity';
declare class SpatialGridController extends Component {
    grid_: any;
    client_: any;
    constructor(params: any);
    Destroy(): void;
    InitComponent(): void;
    _OnPosition(msg: any): void;
    FindNearbyEntities(range: any): any;
}
export { SpatialGridController };

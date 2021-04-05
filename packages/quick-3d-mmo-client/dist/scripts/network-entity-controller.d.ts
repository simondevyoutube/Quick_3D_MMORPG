import { Component } from './entity';
declare class NetworkEntityController extends Component {
    transformUpdates_: any[];
    targetFrame_: any;
    lastFrame_: any;
    lastUpdate_: number;
    constructor(params?: any);
    InitComponent(): void;
    SetTransform_(transform: any): void;
    OnNetworkUpdate_(msg: any): void;
    Update(timeElapsed: any): void;
}
export { NetworkEntityController };

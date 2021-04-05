import { Component } from './entity';
declare class NetworkEntityController extends Component {
    updateTimer_: number;
    loaded_: boolean;
    net_: any;
    constructor(params?: any);
    InitComponent(): void;
    InitEntity(): void;
    OnEquipChanged_(msg: any): void;
    OnActionAttack_(msg: any): void;
    OnUpdate_(msg: any): void;
    OnLoaded_(_: any): void;
    CreateTransformPacket(): any[];
    Update(timeElapsed: any): void;
}
export { NetworkEntityController };

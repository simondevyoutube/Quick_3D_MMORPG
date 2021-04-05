import { Component } from './entity';
declare class NetworkController extends Component {
    playerID_: any;
    socket_: any;
    constructor(params?: any);
    GenerateRandomName_(): string;
    SetupSocket_(): void;
    SendChat(txt: any): void;
    SendTransformUpdate(transform: any): void;
    SendActionAttack_(): void;
    SendInventoryChange_(packet: any): void;
    GetEntityID_(serverID: any): string;
    OnMessage_(e: any, d: any): void;
}
export { NetworkController };

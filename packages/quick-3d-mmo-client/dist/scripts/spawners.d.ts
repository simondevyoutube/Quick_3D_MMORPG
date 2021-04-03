import { Component, Entity } from './entity';
declare class PlayerSpawner extends Component {
    params_: any;
    constructor(params: any);
    Spawn(playerParams: any): Entity;
}
declare class NetworkEntitySpawner extends Component {
    params_: any;
    constructor(params: any);
    Spawn(name: any, desc: any): Entity;
}
export { PlayerSpawner, NetworkEntitySpawner };

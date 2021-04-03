import { Component, Entity } from "./entity";
declare class LevelUpComponentSpawner extends Component {
    _params: any;
    constructor(params: any);
    Spawn(pos: any): Entity;
}
declare class LevelUpComponent extends Component {
    _params: any;
    _particles: any;
    constructor(params: any);
    InitComponent(): void;
    Update(timeElapsed: any): void;
}
export { LevelUpComponent, LevelUpComponentSpawner, };

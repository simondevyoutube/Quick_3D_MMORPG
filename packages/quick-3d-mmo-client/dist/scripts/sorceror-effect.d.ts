import { Component } from "./entity";
declare class SorcerorEffect extends Component {
    params_: any;
    particles_: any;
    _bones: any;
    constructor(params: any);
    Destroy(): void;
    InitComponent(): void;
    OnCharacterLoaded_(msg: any): void;
    OnAttack_(m: any): void;
    Update(timeElapsed: any): void;
}
export { SorcerorEffect };

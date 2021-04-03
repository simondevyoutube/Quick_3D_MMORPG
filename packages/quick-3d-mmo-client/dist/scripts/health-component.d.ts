import { Component } from "./entity";
declare class HealthComponent extends Component {
    stats_: {
        level: number;
        updateUI: boolean;
        health: number;
        maxHealth: number;
        strength: number;
        wisdomness: number;
        benchpress: number;
        curl: number;
        experience: number;
    };
    constructor(params: any);
    InitComponent(): void;
    IsAlive(): boolean;
    get Health(): number;
    UpdateUI_(): void;
    _ComputeLevelXPRequirement(): number;
    OnAddExperience_(msg: any): void;
    _OnDeath(): void;
    OnHealthChanged_(): void;
    OnNetworkUpdate_(msg: any): void;
    OnDamage_(msg: {
        value: number;
    }): void;
}
export { HealthComponent };

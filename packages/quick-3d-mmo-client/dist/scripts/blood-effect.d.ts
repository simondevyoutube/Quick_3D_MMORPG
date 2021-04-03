import { ParticleEmitter, ParticleSystem } from "./particle-system";
import { Component } from "./entity";
declare class BloodEffectEmitter extends ParticleEmitter {
    parent_: any;
    blend_: number;
    emitterLife_: number;
    alphaSpline_: any;
    colourSpline_: any;
    sizeSpline_: any;
    constructor(parent: any);
    OnUpdate_(): void;
    CreateParticle_(): {
        position: any;
        size: number;
        colour: any;
        alpha: number;
        life: number;
        maxLife: number;
        rotation: number;
        velocity: any;
        blend: number;
    };
}
declare class FireFXEmitter extends ParticleEmitter {
    parent_: any;
    blend_: number;
    particles_: any;
    alphaSpline_: any;
    colourSpline_: any;
    sizeSpline_: any;
    constructor(parent: any);
    OnUpdate_(): void;
    AddParticles(num: any): void;
    CreateParticle_(): {
        position: any;
        size: number;
        colour: any;
        alpha: number;
        life: number;
        maxLife: number;
        rotation: number;
        velocity: any;
        blend: number;
    };
}
declare class BloodEffect extends Component {
    params_: any;
    bloodFX_: ParticleSystem;
    fireFX_: ParticleSystem;
    bones_: any;
    constructor(params: any);
    Destroy(): void;
    InitComponent(): void;
    OnCharacterLoaded_(msg: any): void;
    OnEvents_(msg: any): void;
    EmitFireFX_(): void;
    EmitBloodFX_(): void;
    Update(timeElapsed: any): void;
}
export { BloodEffect, FireFXEmitter, BloodEffectEmitter };

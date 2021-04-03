declare class LinearSpline {
    points_: any[];
    _lerp: any;
    constructor(lerp: any);
    AddPoint(t: any, d: any): void;
    Get(t: any): any;
}
declare class ParticleEmitter {
    alphaSpline_: LinearSpline;
    colourSpline_: LinearSpline;
    sizeSpline_: LinearSpline;
    emissionRate_: number;
    emissionAccumulator_: number;
    particles_: any[];
    emitterLife_: any;
    constructor();
    UpdateParticles_(timeElapsed: any): void;
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
    get IsAlive(): boolean;
    SetLife(life: any): void;
    SetEmissionRate(rate: any): void;
    OnUpdate_(_: any): void;
    Update(timeElapsed: any): void;
}
declare class ParticleSystem {
    material_: any;
    camera_: any;
    particles_: any[];
    geometry_: any;
    points_: any;
    emitters_: any[];
    constructor(params: any);
    Destroy(): void;
    AddEmitter(e: any): void;
    UpdateGeometry_(): void;
    UpdateParticles_(timeElapsed: any): void;
    UpdateEmitters_(timeElapsed: any): void;
    Update(timeElapsed: any): void;
}
export { ParticleEmitter, ParticleSystem };

import { Constants } from 'quick-3d-mmo-shared';
declare class State {
    _parent: any;
    constructor(parent: any);
}
declare class DeathState extends State {
    _action: any;
    constructor(parent: any);
    get Name(): Constants.STATE_TYPES;
    Enter(prevState: any): void;
    Exit(): void;
    Update(arg0?: any, arg1?: any): void;
}
declare class DanceState extends State {
    _action: any;
    _FinishedCallback: () => void;
    constructor(parent: any);
    get Name(): Constants.STATE_TYPES;
    Enter(prevState: any): void;
    _Finished(): void;
    _Cleanup(): void;
    Exit(): void;
    Update(): void;
}
declare class AttackState extends State {
    _action: any;
    _FinishedCallback: () => void;
    constructor(parent: any);
    get Name(): Constants.STATE_TYPES;
    Enter(prevState: any): void;
    _Finished(): void;
    _Cleanup(): void;
    Exit(): void;
    Update(): void;
}
declare class WalkState extends State {
    constructor(parent: any);
    get Name(): Constants.STATE_TYPES;
    Enter(prevState: any): void;
    Exit(): void;
    Update(timeElapsed: any, input: any): void;
}
declare class RunState extends State {
    constructor(parent: any);
    get Name(): Constants.STATE_TYPES;
    Enter(prevState: any): void;
    Exit(): void;
    Update(timeElapsed: any, input: any): void;
}
declare class IdleState extends State {
    constructor(parent: any);
    get Name(): Constants.STATE_TYPES;
    Enter(prevState: any): void;
    Exit(): void;
    Update(_: any, input: any): void;
}
export { State, DanceState, AttackState, IdleState, WalkState, RunState, DeathState, };

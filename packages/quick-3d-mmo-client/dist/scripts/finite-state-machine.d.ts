declare class FiniteStateMachine {
    _states: {};
    _currentState: any;
    constructor();
    _AddState(name: any, type: any): void;
    SetState(name: any): void;
    Update(timeElapsed: any, input: any): void;
}
export { FiniteStateMachine };

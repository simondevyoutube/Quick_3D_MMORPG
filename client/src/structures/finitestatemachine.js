export class FiniteStateMachine {
  constructor() {
    this._states = {};
    this._currentState = undefined;
  }

  _AddState(name, type) {
    this._states[name] = type;
  }

  SetState(name) {
    const prevState = this._currentState;

    if (prevState) {
      if (prevState.Name == name) {
        return;
      }
      prevState.Exit();
    }

    const state = new this._states[name](this);

    this._currentState = state;
    state.Enter(prevState);
  }

  update(timeElapsed, input) {
    if (this._currentState) {
      this._currentState.update(timeElapsed, input);
    }
  }
}

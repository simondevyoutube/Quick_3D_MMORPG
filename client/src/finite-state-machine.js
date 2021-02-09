

export const finite_state_machine = (() => {

  class FiniteStateMachine {
    constructor() {
      this._states = {};
      this._currentState = null;
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

    Update(timeElapsed, input) {
      if (this._currentState) {
        this._currentState.Update(timeElapsed, input);
      }
    }
  };

  return {
    FiniteStateMachine: FiniteStateMachine
  };

})();
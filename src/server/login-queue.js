export const login_queue = (() => {
  class FiniteStateMachine {
    constructor(onEvent) {
      this.currentState_ = null;
      this.onEvent_ = onEvent;
    }

    get State() {
      return this.currentState_;
    }

    Broadcast(evt) {
      this.onEvent_(evt);
    }

    OnMessage(evt, data) {
      return this.currentState_.OnMessage(evt, data);
    }

    SetState(state) {
      const prevState = this.currentState_;

      if (prevState) {
        prevState.OnExit();
      }

      this.currentState_ = state;
      this.currentState_.parent_ = this;
      state.OnEnter(prevState);
    }
  }

  class State {
    constructor() {}

    Broadcast(evt) {
      this.parent_.Broadcast(evt);
    }

    OnEnter() {}

    OnMessage() {}

    OnExit() {}
  }

  class Login_Await extends State {
    constructor() {
      super();
      this.params_ = {};
    }

    OnMessage(evt, data) {
      if (evt != "login.commit") {
        return false;
      }

      this.params_.accountName = data;
      this.parent_.SetState(new Login_Confirm(this.params_));

      return true;
    }
  }

  class Login_Confirm extends State {
    constructor(params) {
      super();
      this.params_ = { ...params };
    }

    OnEnter() {
      console.log("login confirmed: " + this.params_.accountName);
      this.Broadcast({ topic: "login.complete", params: this.params_ });
    }

    OnMessage() {
      return true;
    }
  }

  class LoginClient {
    constructor(client, onLogin) {
      this.onLogin_ = onLogin;

      client.onMessage = (e, d) => this.OnMessage_(e, d);

      this.fsm_ = new FiniteStateMachine((e) => {
        this.OnEvent_(e);
      });
      this.fsm_.SetState(new Login_Await());
    }

    OnEvent_(evt) {
      this.onLogin_(evt.params);
    }

    OnMessage_(topic, data) {
      return this.fsm_.OnMessage(topic, data);
    }
  }

  class LoginQueue {
    constructor(onLogin) {
      this.clients_ = {};
      this.onLogin_ = onLogin;
    }

    Add(client) {
      this.clients_[client.ID] = new LoginClient(client, (e) => {
        this.OnLogin_(client, e);
      });
    }

    OnLogin_(client, params) {
      delete this.clients_[client.ID];

      this.onLogin_(client, params);
    }
  }

  return {
    LoginQueue: LoginQueue,
  };
})();

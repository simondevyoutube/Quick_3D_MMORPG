export const login_queue = (() => {

  class FiniteStateMachine {
    #currentState: State;
    #onEvent: (evt: any, data?: any) => any;
    

    constructor(onEvent) {
      this.#currentState = null;
      this.#onEvent = onEvent;
    }
  
    get State() {
      return this.#currentState;
    }
  
    Broadcast(evt) {
      this.#onEvent(evt);
    }

    OnMessage(evt, data) {
      return this.#currentState.OnMessage(evt, data);
    }

    SetState(state) {
      const prevState = this.#currentState;
      
      if (prevState) {
        prevState.OnExit();
      }
  
      this.#currentState = state;
      this.#currentState.setParent(this);
      state.OnEnter(prevState);
    }
  };
  
  
  class State {
    #parent: any;
    #params: {
      accountName?: string
    };
    constructor() {}

    Broadcast(evt) {
      this.#parent.Broadcast(evt);
    }

    setParent(stateMachine: FiniteStateMachine) {
      this.#parent = stateMachine;
    }

    getParent() {
      return this.#parent;
    }

    setParams(newParams) {
      this.#params = newParams;
    }

    getParams() {
      return this.#params;
    }
  
    OnEnter() {
    }
  
    OnMessage(evt, data) {
    }
  
    OnExit() {
    }
  };
  

  class Login_Await extends State {
    #params: {
      accountName?: string
    };
    constructor() {
      super();
      this.setParams({});
    }
  
    OnMessage(evt, data) {
      if (evt != 'login.commit') {
        return false;
      }
  
      this.#params.accountName = data;
      this.getParent().SetState(new Login_Confirm(this.#params));

      return true;
    }
  };
  
  
  class Login_Confirm extends State {
    constructor(params) {
      super();
      this.setParams({...params});
    }
  
    OnEnter() {
      console.log('login confirmed: ' + this.getParams().accountName);
      this.Broadcast({topic: 'login.complete', params: this.getParams()});
    }
  
    OnMessage() {
      return true;
    }
  };


  class LoginClient {
    #onLogin: (any) => any;
    #fsm: FiniteStateMachine;

    constructor(client, onLogin) {
      this.#onLogin = onLogin;

      client.onMessage = (e, d) => this.OnMessage_(e, d);

      this.#fsm = new FiniteStateMachine((e) => { this.OnEvent(e); });
      this.#fsm.SetState(new Login_Await());
    }

    OnEvent(evt) {
      this.#onLogin?.(evt.params);
    }

    OnMessage_(topic, data) {
      return this.#fsm.OnMessage(topic, data);
    }
  };


  class LoginQueue {
    #clients: any;
    
    constructor(onLogin) {
      this.#clients = {};
      this.OnLogin = onLogin;
    }
  
    Add(client) {
      this.#clients[client.ID] = new LoginClient(
          client, (e) => { this.OnLogin(client, e); });
    }
  
    *OnLogin(client, params) {
      delete this.#clients[client.ID];
  
      this.OnLogin(client, params);
    }
  };

  return {
      LoginQueue: LoginQueue,
  };
})();
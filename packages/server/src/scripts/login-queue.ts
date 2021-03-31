import {Constants} from 'shared';
import type {GlobalTypes} from "shared";

const { EVENT_TYPES, STATE_TYPES } = Constants;
interface IState {}

interface IOnEvent {
  (evt: string, data?: any): void
}

interface IFiniteStateMachine {
    _currentState: IState,
    onEvent(evt: GlobalTypes.TEvt, data?: any): any;
    Broadcast(evt: string): void,
    OnMessage: IOnEvent
}
  class FiniteStateMachine implements IFiniteStateMachine {
    _currentState;
    onEvent;
    

    constructor(onEvent: any) {
      this._currentState = new State({});
      this.onEvent = onEvent;
    }
  
    get currentState() {
      return this._currentState;
    }
  
    Broadcast(evt: string) {
      this.onEvent(evt);
    }

    OnMessage(evt: string, data?: any) {
      return this._currentState?.OnMessage?.(evt, data);
    }

    SetState(state: State) {
      const prevState = this._currentState;
      
      if (prevState) {
        prevState.OnExit();
      }
  
      this._currentState = state;
      this._currentState.setParent(this);
      state.OnEnter(prevState);
    }
  };
  
  
  class State {
    #parent: any;
    params: {
      accountName?: string
    };
    constructor(params: any) {
      this.params = params;
    }

    

    Broadcast(evt: {topic: any, params: any}) {
      this.#parent.Broadcast(evt);
    }

    setParent(stateMachine: FiniteStateMachine) {
      this.#parent = stateMachine;
    }

    getParent() {
      return this.#parent;
    }

    setParams(newParams: any) {
      this.params = newParams;
    }

    getParams() {
      return this.params;
    }
  
    OnEnter(state?: State) {
    }
  
    OnMessage(evt: string, data: any) {
    }
  
    OnExit() {
    }
  };
  
  interface ILoginParams {
    accountName?: string
  }
  class Login_Await extends State {
    constructor(params: ILoginParams) {
      super(params);
    }
  
    OnMessage(evt: string, data: any) {
      if (evt != EVENT_TYPES.LOGIN_COMMIT) {
        return false;
      }
  
      this.params.accountName = data;
      this.getParent().SetState(new Login_Confirm(this.params));

      return true;
    }
  };
  
  
  class Login_Confirm extends State {
    constructor(params: any) {
      super(params);
      this.setParams({...params});
    }
  
    OnEnter() {
      console.log('login confirmed: ' + this.getParams().accountName);
      this.Broadcast({topic: EVENT_TYPES.LOGIN_COMMIT, params: this.getParams()});
    }
  
    OnMessage() {
      return true;
    }
  };

  class LoginClient {
    #onLogin: (evt: string, data?: any) => any;
    #fsm: FiniteStateMachine;

    constructor(client: any, onLogin: (evt: string, data: any) => any) {
      this.#onLogin = onLogin;

      client.onMessage = (e: string, d: any) => this.OnMessage_(e, d);

      this.#fsm = new FiniteStateMachine((e: any) => { this.OnEvent(e); });
      this.#fsm.SetState(new Login_Await({}));
    }

    OnEvent(evt: any) {
      this.#onLogin?.(evt.params);
    }

    OnMessage_(topic: string, data?: any) {
      return this.#fsm.OnMessage(topic, data);
    }
  };

  interface IClient {
    ID: string
  }
  // onLogin, OnLogin is confusing. Rename once I know the purpose. 
  class LoginQueue {
    #clients: any;
    #onLogin: any;

    constructor(onLogin: any) {
      this.#clients = {};
      this.#onLogin = onLogin;
    }
  
    Add(client: IClient) {
      this.#clients[client.ID] = new LoginClient(
          client, (e) => { this.OnLogin(client, e); });
    }
  
    *OnLogin(client: IClient, params: any) {
      delete this.#clients[client.ID];
  
      this.#onLogin(client, params);
    }
  };

  export {LoginQueue}
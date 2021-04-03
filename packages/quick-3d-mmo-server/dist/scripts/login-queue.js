var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, privateMap, value) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to set private field on non-instance");
    }
    privateMap.set(receiver, value);
    return value;
};
var _parent, _onLogin, _fsm;
import { Constants } from 'quick-3d-mmo-shared';
const { EVENT_TYPES, STATE_TYPES } = Constants;
class FiniteStateMachine {
    constructor(onEvent) {
        this._currentState = new State({});
        this.onEvent = onEvent;
    }
    get currentState() {
        return this._currentState;
    }
    Broadcast(evt) {
        this.onEvent(evt);
    }
    OnMessage(evt, data) {
        var _a, _b;
        return (_b = (_a = this._currentState) === null || _a === void 0 ? void 0 : _a.OnMessage) === null || _b === void 0 ? void 0 : _b.call(_a, evt, data);
    }
    SetState(state) {
        const prevState = this._currentState;
        if (prevState) {
            prevState.OnExit();
        }
        this._currentState = state;
        this._currentState.setParent(this);
        state.OnEnter(prevState);
    }
}
;
class State {
    constructor(params) {
        _parent.set(this, void 0);
        this.params = params;
    }
    Broadcast(evt) {
        __classPrivateFieldGet(this, _parent).Broadcast(evt);
    }
    setParent(stateMachine) {
        __classPrivateFieldSet(this, _parent, stateMachine);
    }
    getParent() {
        return __classPrivateFieldGet(this, _parent);
    }
    setParams(newParams) {
        this.params = newParams;
    }
    getParams() {
        return this.params;
    }
    OnEnter(state) {
    }
    OnMessage(evt, data) {
    }
    OnExit() {
    }
}
_parent = new WeakMap();
;
class Login_Await extends State {
    constructor(params) {
        super(params);
    }
    OnMessage(evt, data) {
        // console.log("Login_Await.OnMessage: ", {evt, data})
        if (evt != EVENT_TYPES.LOGIN_COMMIT) {
            return false;
        }
        this.params.accountName = data;
        this.getParent().SetState(new Login_Confirm(this.params));
        return true;
    }
}
;
class Login_Confirm extends State {
    constructor(params) {
        super(params);
        this.setParams(Object.assign({}, params));
    }
    OnEnter() {
        // console.log('login confirmed: ' + this.getParams().accountName);
        this.Broadcast({ topic: EVENT_TYPES.LOGIN_COMMIT, params: this.getParams() });
    }
    OnMessage() {
        return true;
    }
}
;
class LoginClient {
    constructor(client, onLogin) {
        _onLogin.set(this, void 0);
        _fsm.set(this, void 0);
        __classPrivateFieldSet(this, _onLogin, onLogin);
        // console.log("Server: new LoginClient(): ");
        client.onMessage = (e, d) => this.OnMessage_(e, d);
        __classPrivateFieldSet(this, _fsm, new FiniteStateMachine((e) => { this.OnEvent(e); }));
        __classPrivateFieldGet(this, _fsm).SetState(new Login_Await({}));
    }
    OnEvent(evt) {
        var _a;
        (_a = __classPrivateFieldGet(this, _onLogin)) === null || _a === void 0 ? void 0 : _a.call(this, evt.params);
    }
    OnMessage_(topic, data) {
        return __classPrivateFieldGet(this, _fsm).OnMessage(topic, data);
    }
}
_onLogin = new WeakMap(), _fsm = new WeakMap();
;
// onLogin, OnLogin is confusing. Rename once I know the purpose. 
class LoginQueue {
    constructor(onLogin) {
        this.clients = {};
        this.onLogin = onLogin;
    }
    Add(client) {
        // console.log
        this.clients[client.ID] = new LoginClient(client, (e) => { this.OnLogin(client, e); });
    }
    OnLogin(client, params) {
        delete this.clients[client.ID];
        this.onLogin(client, params);
    }
}
;
export { LoginQueue };
//# sourceMappingURL=login-queue.js.map
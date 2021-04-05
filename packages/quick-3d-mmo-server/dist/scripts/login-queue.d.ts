interface IClient {
    ID: string;
}
declare class LoginQueue {
    #private;
    constructor(onLogin: any);
    Add(client: IClient): void;
    OnLogin(client: IClient, params: any): Generator<never, void, unknown>;
}
export { LoginQueue };

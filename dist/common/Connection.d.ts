import EventEmitter from "./EventEmitter";
import { RequestOptions } from "../interfaces/common";
import Token from "./Token";
import Environment from "./Environment";
import { JSONValue, RequestData } from "../types";
import AuthServer from "./AuthServer";
import Auth from "./Auth";
export default class Connection extends EventEmitter {
    protected readonly token: Token;
    protected readonly environment: Environment;
    protected readonly auth: Auth;
    protected connected: boolean;
    protected authServer: AuthServer | null;
    constructor(environment: Environment, token: Token, auth: Auth);
    update(): Promise<boolean>;
    isTokenExpired(): boolean;
    connect(): Promise<boolean>;
    protected waitForUserAction(): Promise<boolean>;
    makeRequest(method: string, url: string, data?: RequestData, options?: RequestOptions): Promise<import("../interfaces/common").APIResponse<JSONValue>>;
}

import { inject, injectable, LazyServiceIdentifer } from "inversify";
import EventEmitter from "./EventEmitter";
import { AuthServerOptions, JSONResponse, RequestOptions } from "../interfaces/common";
import Token from "./Token";
import Environment from "./Environment";
import {IoC, RequestData} from "../types";
import DomainRequest from "./DomainRequest";
import AuthServer from "./AuthServer";

@injectable()
export default class Connection extends EventEmitter {
    protected readonly token: Token;
    protected readonly environment: Environment;

    protected connected: boolean = false;
    protected authServer: AuthServer | null = null;

    constructor(
        @inject(IoC.Token) token: Token,
        @inject(IoC.Environment) environment: Environment
    ) {
        super();
        this.token = token;
        this.environment = environment;
    }

    async update(): Promise<boolean> {
        if (!this.connected) {
            return await this.connect();
        }

        this.emit('check', true);
        if (this.token.exists() || this.isTokenExpired()) {
            await this.token.refresh();
            return this.isTokenExpired();
        }

        return true;
    }

    public isTokenExpired(): boolean {
        const expired = this.token.isExpired();
        this.connected = !expired;
        return expired;
    }

    async connect(): Promise<boolean> {
        if (this.connected) {
            return true;
        }

        this.emit('beforeConnect');

        const tokenHasCode = this.token.hasCode();
        const hasAuthServer = this.environment.exists('auth.server');
        const tokenExists = this.token.exists();

        if (!tokenHasCode && hasAuthServer) {
            await this.waitForUserAction();
            return true;
        }
        this.emit('check', true);
        if (tokenExists && this.isTokenExpired()) {
            await this.token.refresh();
            this.connected = this.token.isExpired();
            return this.connected;
        }
        if (!tokenHasCode && !tokenExists) {
            return false;
        }

        try {
            await this.token.fetch();
            this.emit('connected');
            this.connected = true;
            return true;
        }
        catch (e) {
            this.emit('error', e);
            throw e;
        }
    }

    protected async waitForUserAction(): Promise<boolean> {
        if (this.authServer) {
            return Promise.resolve(true);
        }
        const { state, port } = this.environment.get('auth.server');
        const options: AuthServerOptions = {
            state,
            port
        };
        const server = new AuthServer(options);

        this.authServer = server;

        const code: string = await new Promise( resolve => {
            server.on('code', event => {
                const { code } = event;
                resolve(code);
            });
            server.run();
        });

        await server.stop();
        this.authServer = null;
        this.token.setCode(code);
        return this.connect();
    }

    async makeRequest(method: string, url: string, data?: RequestData, options?: RequestOptions) {
        await this.update();
        const token = this.token.getValue();
        const domain = this.environment.get<string>('domain');
        const config = {
            domain,
            method,
            url,
            data,
            options,
            token
        };
        const domainRequest = new DomainRequest(config);
        return await domainRequest.process<JSONResponse>();
    }
}
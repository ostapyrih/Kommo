import "reflect-metadata";
import { IClientOptions } from "./interfaces/common";
import EventEmitter from "./common/EventEmitter";
import Connection from './common/Connection';
import Environment from "./common/Environment";
import ClientRequest from "./common/ClientRequest";
import Auth from "./common/Auth";
import Token from "./common/Token";
import LeadFactory from "./api/factories/LeadFactory";
import Lead from "./api/activeRecords/Lead";
import { IEntityConstructor, IResourceFactory } from "./interfaces/api";
/**
 * Основной класс библиотеки
 * */
export default class Client extends EventEmitter {
    readonly token: Token;
    readonly environment: Environment;
    readonly request: ClientRequest;
    readonly connection: Connection;
    readonly auth: Auth;
    readonly Lead: IEntityConstructor<Lead>;
    readonly leads: LeadFactory;
    constructor(options: IClientOptions);
    /**
     * Привязывает конструктор сущностей
     * @param factory - фабрика сущностей
     * @returns функция конструктор для вызова new client[Entity]
     * */
    protected assignEntity<T>(factory: IResourceFactory<T>): IEntityConstructor<T>;
}

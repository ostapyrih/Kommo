/// <reference types="node" />
import * as http from 'http';
import EventEmitter from "../EventEmitter";
import { IAPIResponse, IResponseParser } from "../../interfaces/common";
import { JSONObject } from "../../types";
/**
 * Преобразует ответ портала в JSON-объект
 * */
export default class JSONResponseParser extends EventEmitter implements IResponseParser<string, JSONObject | null> {
    parse(apiResponse: IAPIResponse<string>): {
        response: http.IncomingMessage;
        data: null;
    } | {
        response: http.IncomingMessage;
        data: JSONObject;
    };
    checkErrors(data: object, response: http.IncomingMessage): void;
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const EventEmitter_1 = tslib_1.__importDefault(require("./EventEmitter"));
/**
 * Компонент запросов к серверу.
 * Доступен как client.request
 * */
class ClientRequest extends EventEmitter_1.default {
    constructor(connection) {
        super();
        this.connection = connection;
    }
    make(method, url, data, options) {
        return this.connection.makeRequest(method, url, data, options);
    }
    get(url, data, options) {
        return this.connection.makeRequest('GET', url, data, options);
    }
    post(url, data, options) {
        return this.connection.makeRequest('POST', url, data, options);
    }
    patch(url, data, options) {
        return this.connection.makeRequest('PATCH', url, data, options);
    }
}
exports.default = ClientRequest;
//# sourceMappingURL=ClientRequest.js.map
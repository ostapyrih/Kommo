"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const ResourceEntity_1 = tslib_1.__importDefault(require("./ResourceEntity"));
const EventEmitter_1 = tslib_1.__importDefault(require("../common/EventEmitter"));
/**
 * Основной класс фабрики сущностей. Класс-фабрика служит для создания
 * новых сущностей. Например, {@link LeadFactory} отвечает за {@link Lead}
 * */
class ResourceFactory extends EventEmitter_1.default {
    constructor(request) {
        super();
        this.request = request;
    }
    /**
     * Создаёт сущность и заполняет её атрибутами, которые
     * будут синхронизироваться с порталом AmoCRM
     * */
    from(attributes) {
        const instance = this.createEntity();
        instance.setAttributes(attributes);
        return instance;
    }
    /**
     * Приводит все переданные объекты-сущности в массиве
     * criteriaData к их объекту-атрибутов (ключ-значение)
     * @param criteriaData массив plain JavaScript-объектов или сущностей
     * @returns массив plain JavaScript-объектов
     * */
    getEntityCriteria(criteriaData) {
        return criteriaData.map(criteria => {
            if (criteria instanceof ResourceEntity_1.default) {
                return criteria.getAttributes();
            }
            return criteria;
        });
    }
}
exports.default = ResourceFactory;
//# sourceMappingURL=ResourceFactory.js.map
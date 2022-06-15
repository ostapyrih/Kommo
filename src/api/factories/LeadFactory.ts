/**
 * Фабрика для создания сделок {@link Lead}
 * */
import ResourceFactory from "../ResourceFactory";
import Lead, { LeadAttributes } from "../activeRecords/Lead";
import schema from '../../schema/v4';
import ResourcePagination from "../ResourcePagination";
import { IRequestOptions } from "../../interfaces/common";
import { JSONObject } from "../../types";
import ResourceEntity from "../ResourceEntity";
import { CollectionResponse } from "../../interfaces/api";

export interface LeadsGetCriteria {
    with?: string;
    page?: number;
    limit?: number;
    query?: string | number;
    filter?: string;
    order?: string;
}

export interface LeadsGetByIdCriteria {
    with?: string;
}

export interface LeadsCreateCriteria {
    name?: string;
    price?: number;
    status_id?: number;
    pipeline_id?: number;
    created_by?: number;
    updated_by?: number;
    closed_at?: number;
    loss_reason_id?: number;
    responsible_user_id?: number;
    custom_fields_values?: JSONObject[] | null;
    _embedded?: JSONObject;

    request_id?: string;
}

export interface LeadCreateResult {
    id: number;
    request_id: string;
}

export interface LeadsUpdateCriteria {
    id: number;
    name?: string;
    price?: number;
    status_id?: number;
    pipeline_id?: number;
    created_by?: number;
    closed_at?: number;
    created_at?: number;
    updated_at?: number;
    loss_reason_id?: number;
    responsible_user_id?: number;
    custom_fields_values?: JSONObject[];

    request_id?: string;
}

export interface LeadUpdateResult {
    id: number;
    request_id: string;
    updated_at: number
}

/**
 * Фабрика управления сделками
 * */
export default class LeadFactory extends ResourceFactory<Lead> {
    createEntity() {
        return new Lead(this);
    }

    getBaseUrl(): string {
        return schema.entities.leads.path;
    }

    /**
     * @param criteria фильтр сделок (https://www.amocrm.ru/developers/content/crm_platform/leads-api#leads-list)
     * @example
     * ```ts
     * const pagination = await client.leads.get({
     *     order: 'created_at',
     *     page: 2,
     *     query: 'Иванов'
     * })
     * ```
     * @param options настройки запроса и обработки результата
     * @returns постраничную навигацию, экземпляр {@link ResourcePagination}
     *
     * @example
     * ```ts
     * const pagination = await client.leads.get()
     * const data = pagination.getData(); // [lead, lead]
     * const page = pagination.getPage();
     *
     * await pagination.next();
     *
     * const nextData = pagination.data();
     * ```
     *
     * Метод {@link ResourcePagination.getData | getData()} навигации вернёт массив объектов {@link Lead}
     *
     * */
    async get(criteria?: LeadsGetCriteria, options?: IRequestOptions) {
        const url = this.getUrl();

        const params = {
            url,
            criteria,
            options,
            factory: this,
            embedded: 'leads'
        };
        const pagination = new ResourcePagination<Lead>(this.request, params);
        await pagination.fetch();

        this.emit('get');
        return pagination;
    }

    /**
     * Находит сделку по её id
     * @param identity id сделки
     * @param criteria параметры получения сделки (https://www.amocrm.ru/developers/content/crm_platform/leads-api#lead-detail)
     * @example
     * ```ts
     * const lead = client.leads.getById(123, {
     *     with: 'catalog_elements'
     * })
     * ```
     * @param options настройки запроса и обработки результата
     * @returns экземпляр найденной сделки или null, если сделка не найдена.
     * */
    async getById(identity: number, criteria?: LeadsGetByIdCriteria, options?: IRequestOptions): Promise<Lead|null> {
        const url = this.getUrl('/' + identity);
        const { data } = await this.request.get<LeadAttributes>(url, criteria, options);
        if (!data) {
            return null;
        }
        const lead = this.createEntity();

        lead.setAttributes(data);
        return lead;
    }

    /**
     * Создаёт новые сделки
     * @param criteria параметры создания сделок (https://www.amocrm.ru/developers/content/crm_platform/leads-api#leads-add)
     * и/или массив объектов {@link Lead}
     * @example
     * ```ts
     * const leads = await client.leads.create([
     *  {
     *      name: "Lead 1"
     *  },
     *  {
     *      name: "Lead 2"
     *  }
     * ])
     * ```
     *
     * @example
     * ```ts
     * const lead1 = new client.Lead;
     * lead1.name = 'Lead 1';
     * const lead2 = new client.Lead;
     * lead2.name = 'Lead 2';
     *
     * await client.leads.create([lead1, lead2])
     * ```
     *
     * @example
     * ```ts
     * const leads = await client.leads.create([
     *  new client.Lead({
     *      name: "Lead 1"
     *  }),
     *  {
     *      name: "Lead 2"
     *  }
     * ]);
     * ```
     *
     * @param options настройки запроса и обработки результата
     * @returns массив объектов {@link Lead}. Если в параметр criteria передавались экземпляры {@link Lead}, после
     * создания сделок в AmoCRM, у них обновится поле id
     *
     * @example
     * ```ts
     * const lead1 = new client.Lead;
     * lead1.name = 'Lead 1';
     * lead1.id; // undefined;
     *
     * await client.leads.create([lead1])
     *
     * lead1.id; // 123
     * ```
     * */
    async create(criteria: (LeadsCreateCriteria | Lead)[], options?: IRequestOptions): Promise<Lead[]> {
        const url = this.getUrl();
        const requestCriteria = this.getEntityCriteria(criteria);
        const { data } = await this.request.post<CollectionResponse<LeadCreateResult>>(url, requestCriteria, options);
        const response = data?._embedded?.leads || [];

        const result = response.map((attributes, index: number) => {
            const entityCriteria = criteria[index];
            const lead = entityCriteria instanceof ResourceEntity ?
                entityCriteria :
                this.from(entityCriteria);
            lead.id = attributes.id;
            return lead;
        });
        return result;
    }

    /**
     * @todo https://www.amocrm.ru/developers/content/crm_platform/leads-api#leads-complex-add
     * */
    async complexCreate() {
        return false;
    }

    /**
     * Обновляет существующие сделки. Принцип работы метода аналогичен {@link create}
     * @param criteria параметры обновления сделок (https://www.amocrm.ru/developers/content/crm_platform/leads-api#leads-edit)
     * и/или массив объектов {@link Lead}
     * @param options настройки запроса и обработки результата
     * @returns массив объектов {@link Lead}. Если в параметр criteria передавались экземпляры {@link Lead}, после
     * создания сделок в AmoCRM, у них обновится поле id
     * */
    async update(criteria: (LeadsUpdateCriteria | Lead)[], options?: IRequestOptions): Promise<Lead[]> {
        const url = this.getUrl();
        const requestCriteria = this.getEntityCriteria(criteria);
        const { data } = await this.request.patch<CollectionResponse<LeadUpdateResult>>(url, requestCriteria, options);
        const response = data?._embedded?.leads || [];

        const result = response.map((attributes, index: number) => {
            const entityCriteria = criteria[index];
            const lead = entityCriteria instanceof Lead ?
                entityCriteria :
                this.from(entityCriteria);
            lead.id = attributes.id;
            lead.updated_at = attributes.updated_at;
            return lead;
        });
        return result;
    }
}
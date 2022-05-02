import request from '@/utils/request';
import {ConfigDataType, TableListQueryParams} from './data'

export async function queryList(params?: TableListQueryParams): Promise<any> {
    return request({
        url: 'config/search',
        method: 'get',
        params,
    });
}

export async function createData(params: Omit<ConfigDataType, 'id'>): Promise<any> {
    return request({
        url: 'config',
        method: 'POST',
        data: params,
    });
}

export async function updateData(id: number, params: Omit<ConfigDataType, 'id'>): Promise<any> {
    return request({
        url: `config`,
        method: 'PUT',
        data: params,
    });
}

export async function removeData(id: number): Promise<any> {
    return request({
        url: `config/${id}`,
        method: 'delete',
    });
}

export async function batchRemoveData(id: (number | string)[]): Promise<any> {
    return request({
        url: `config`,
        method: 'delete',
        data: id,
    });
}

export async function detailData(id: number): Promise<any> {
    return request({url: `config/${id}`});
}
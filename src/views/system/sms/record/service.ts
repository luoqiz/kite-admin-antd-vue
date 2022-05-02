import request from '@/utils/request';
import {RecordDataType, TableListQueryParams} from './data'

export async function queryList(params?: TableListQueryParams): Promise<any> {
    return request({
        url: 'record/search',
        method: 'get',
        params,
    });
}

export async function createData(params: Omit<RecordDataType, 'id'>): Promise<any> {
    return request({
        url: 'record',
        method: 'POST',
        data: params,
    });
}

export async function updateData(id: number, params: Omit<RecordDataType, 'id'>): Promise<any> {
    return request({
        url: `record`,
        method: 'PUT',
        data: params,
    });
}

export async function removeData(id: number): Promise<any> {
    return request({
        url: `record/${id}`,
        method: 'delete',
    });
}

export async function batchRemoveData(id: (number | string)[]): Promise<any> {
    return request({
        url: `record`,
        method: 'delete',
        data: id,
    });
}

export async function detailData(id: number): Promise<any> {
    return request({url: `record/${id}`});
}
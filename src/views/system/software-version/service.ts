import request from '@/utils/request';
import {SysSoftwareVersionDataType, TableListQueryParams} from './data'

export async function queryList(params?: TableListQueryParams): Promise<any> {
    return request({
        url: 'sysSoftwareVersion/search',
        method: 'get',
        params,
    });
}

export async function createData(params: Omit<SysSoftwareVersionDataType, 'id'>): Promise<any> {
    return request({
        url: 'sysSoftwareVersion',
        method: 'POST',
        data: params,
    });
}

export async function updateData(id: number, params: Omit<SysSoftwareVersionDataType, 'id'>): Promise<any> {
    return request({
        url: `sysSoftwareVersion`,
        method: 'PUT',
        data: params,
    });
}

export async function removeData(id: number): Promise<any> {
    return request({
        url: `sysSoftwareVersion/${id}`,
        method: 'delete',
    });
}

export async function batchRemoveData(id: (number | string)[]): Promise<any> {
    return request({
        url: `sysSoftwareVersion`,
        method: 'delete',
        data: id,
    });
}

export async function detailData(id: number): Promise<any> {
    return request({url: `sysSoftwareVersion/${id}`});
}
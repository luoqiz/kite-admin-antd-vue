import request from '@/utils/request';
import {MerchantDetailsDataType, TableListQueryParams} from './data'

export async function queryList(params?: TableListQueryParams): Promise<any> {
    return request({
        url: 'merchantDetails/search',
        method: 'get',
        params,
    });
}

export async function createData(params: Omit<MerchantDetailsDataType, 'detailsId'>): Promise<any> {
    return request({
        url: 'merchantDetails',
        method: 'POST',
        data: params,
    });
}

export async function updateData(detailsId: string, params: Omit<MerchantDetailsDataType, 'detailsId'>): Promise<any> {
    return request({
        url: `merchantDetails`,
        method: 'PUT',
        data: params,
    });
}

export async function removeData(detailsId: string): Promise<any> {
    return request({
        url: `merchantDetails/${detailsId}`,
        method: 'delete',
    });
}

export async function batchRemoveData(detailsId: (number | string)[]): Promise<any> {
    return request({
        url: `merchantDetails`,
        method: 'delete',
        data: detailsId,
    });
}

export async function detailData(detailsId: string): Promise<any> {
    return request({url: `merchantDetails/${detailsId}`});
}
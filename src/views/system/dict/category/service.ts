import request from '@/utils/request';
import { SysDictDataType, TableListQueryParams } from './data';

export async function queryList(params?: TableListQueryParams): Promise<any> {
  return request({
    url: '/v1/sys-dict/search',
    method: 'get',
    params,
  });
}

export async function createData(params: Omit<SysDictDataType, 'dictId'>): Promise<any> {
  return request({
    url: '/v1/sys-dict',
    method: 'POST',
    data: params,
  });
}

export async function updateData(
  dictId: number,
  params: Omit<SysDictDataType, 'dictId'>
): Promise<any> {
  return request({
    url: `/v1/sys-dict`,
    method: 'PUT',
    data: params,
  });
}

export async function removeData(dictId: number): Promise<any> {
  return request({
    url: `/v1/sys-dict/${dictId}`,
    method: 'delete',
  });
}

export async function detailData(dictId: number): Promise<any> {
  return request({ url: `/v1/sys-dict/${dictId}` });
}

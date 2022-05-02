import request from '@/utils/request';
import { SysDictDetailDataType, TableListQueryParams } from './data';

export async function queryList(params?: TableListQueryParams): Promise<any> {
  return request({
    url: '/v1/sys-dict-detail/search',
    method: 'get',
    params,
  });
}

export async function createData(params: Omit<SysDictDetailDataType, 'detailId'>): Promise<any> {
  return request({
    url: '/v1/sys-dict-detail',
    method: 'POST',
    data: params,
  });
}

export async function updateData(
  detailId: number,
  params: Omit<SysDictDetailDataType, 'detailId'>
): Promise<any> {
  return request({
    url: `/v1/sys-dict-detail`,
    method: 'PUT',
    data: params,
  });
}

export async function removeData(detailId: number): Promise<any> {
  return request({
    url: `/v1/sys-dict-detail/${detailId}`,
    method: 'delete',
  });
}

export async function detailData(detailId: number): Promise<any> {
  return request({ url: `/v1/sys-dict-detail/${detailId}` });
}

import request from '@/utils/request';
import { SysUserDataType, TableListQueryParams } from './data';

export async function queryList(params?: TableListQueryParams): Promise<any> {
  return request({
    url: '/v1/sys-user/search',
    method: 'get',
    params,
  });
}

export async function createData(params: Omit<SysUserDataType, 'userId'>): Promise<any> {
  return request({
    url: '/v1/sys-user',
    method: 'POST',
    data: params,
  });
}

export async function updateData(
  userId: number,
  params: Omit<SysUserDataType, 'userId'>
): Promise<any> {
  return request({
    url: `/v1/sys-user`,
    method: 'PUT',
    data: params,
  });
}

export async function removeData(userId: number): Promise<any> {
  return request({
    url: `/v1/sys-user/${userId}`,
    method: 'delete',
  });
}

export async function batchRemoveData(userId: (number | string)[]): Promise<any> {
  return request({
    url: `/v1/sys-user`,
    method: 'delete',
    data: userId,
  });
}

export async function detailData(userId: number): Promise<any> {
  return request({ url: `/v1/sys-user/${userId}` });
}

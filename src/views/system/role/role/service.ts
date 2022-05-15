import request from '@/utils/request';
import { SysRoleDataType, TableListQueryParams } from './data';

export async function queryList(params?: TableListQueryParams): Promise<any> {
  return request({
    url: '/v1/sys-role/search',
    method: 'get',
    params,
  });
}

export async function queryAll(params?: TableListQueryParams): Promise<any> {
  return request({
    url: '/v1/sys-role/search/all',
    method: 'get',
    params,
  });
}

export async function createData(params: Omit<SysRoleDataType, 'roleId'>): Promise<any> {
  return request({
    url: '/v1/sys-role',
    method: 'POST',
    data: params,
  });
}

export async function updateData(
  roleId: number,
  params: Omit<SysRoleDataType, 'roleId'>
): Promise<any> {
  return request({
    url: `/v1/sys-role`,
    method: 'PUT',
    data: params,
  });
}

export async function removeData(roleId: number): Promise<any> {
  return request({
    url: `/v1/sys-role/${roleId}`,
    method: 'delete',
  });
}

export async function batchRemoveData(roleId: (number | string)[]): Promise<any> {
  return request({
    url: `/v1/sys-role`,
    method: 'delete',
    data: roleId,
  });
}

export async function detailData(roleId: number): Promise<any> {
  return request({ url: `/v1/sys-role/${roleId}` });
}

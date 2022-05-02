import request from '@/utils/request';
import {
  RoleMenuRelationQueryParams,
  RoleMenuRelationSaveParams,
  SysMenuDataType,
  TableListQueryParams,
} from './data';

export async function queryList(params?: TableListQueryParams): Promise<any> {
  return request({
    url: '/v1/sys-menu/search',
    method: 'get',
    params,
  });
}

export async function queryAll(params?: TableListQueryParams): Promise<any> {
  return request({
    url: '/v1/sys-menu/search/all',
    method: 'get',
    params,
  });
}

export async function createData(params: Omit<SysMenuDataType, 'menuId'>): Promise<any> {
  return request({
    url: '/v1/sys-menu',
    method: 'POST',
    data: params,
  });
}

export async function updateData(
  menuId: number,
  params: Omit<SysMenuDataType, 'menuId'>
): Promise<any> {
  return request({
    url: `/v1/sys-menu`,
    method: 'PUT',
    data: params,
  });
}

export async function removeData(menuId: number): Promise<any> {
  return request({
    url: `/v1/sys-menu/${menuId}`,
    method: 'delete',
  });
}

export async function batchRemoveData(menuId: (number | string)[]): Promise<any> {
  return request({
    url: `/v1/sys-menu`,
    method: 'delete',
    data: menuId,
  });
}

export async function detailData(menuId: number): Promise<any> {
  return request({ url: `/v1/sys-menu/${menuId}` });
}

export async function listMenuByRoleId(params?: RoleMenuRelationQueryParams): Promise<any> {
  return request({
    url: `/v1/sys-roles-menus/search/all`,
    method: 'get',
    params,
  });
}

export async function saveRoleMenus(params?: RoleMenuRelationSaveParams): Promise<any> {
  return request({
    url: `/v1/sys-roles-menus/save:batch`,
    method: 'POST',
    data: params,
  });
}

import request from '@/utils/request';

export async function queryList(dictKey: string): Promise<any> {
  return request({
    url: '/v1/sys-dict/search/all',
    method: 'get',
    params: { dictKey: dictKey },
  });
}

import { Action, Mutation } from 'vuex';
import { StoreModuleType } from '@/utils/store';
import { ResponseData } from '@/utils/request';
import {
  RoleMenuRelationQueryParams,
  RoleMenuRelationSaveParams,
  SysMenuDataType,
  TableDataType,
  TableListQueryParams,
} from '@/views/system/menu/data.d';
import { listMenuByRoleId, queryAll, queryList, saveRoleMenus } from '@/views/system/menu/service';

export interface StateType {
  tableData: TableDataType;
  updateData: Partial<SysMenuDataType>;
}

export interface ModuleType extends StoreModuleType<StateType> {
  state: StateType;
  mutations: {
    setTableData: Mutation<StateType>;
    setUpdateData: Mutation<StateType>;
  };
  actions: {
    queryTableData: Action<StateType, StateType>;
    queryAllData: Action<StateType, StateType>;
    queryTreeData: Action<StateType, StateType>;
    batchSaveRolesMenus: Action<StateType, StateType>;
  };
}

const initState: StateType = {
  tableData: {
    list: [],
    pagination: {
      total: 0,
      current: 1,
      pageSize: 10,
      showSizeChanger: true,
      showQuickJumper: true,
    },
  },
  updateData: {},
};

const StoreModel: ModuleType = {
  namespaced: true,
  name: 'SysMenuListTree',
  state: {
    ...initState,
  },
  mutations: {
    setTableData(state, payload) {
      state.tableData = payload;
    },
    setUpdateData(state, payload) {
      state.updateData = payload;
    },
  },
  actions: {
    async queryTableData({ commit }, payload: TableListQueryParams) {
      try {
        const response: ResponseData = await queryList(payload);
        const { data } = response;
        commit('setTableData', {
          ...initState.tableData,
          list: data.data || [],
          pagination: {
            ...initState.tableData.pagination,
            current: payload.page,
            pageSize: payload.size,
            total: data.total || 0,
          },
        });
        return true;
      } catch (error) {
        return false;
      }
    },
    async queryAllData({ commit }, payload: TableListQueryParams) {
      try {
        const response: ResponseData = await queryAll(payload);
        const { data } = response;
        commit('setTableData', {
          ...initState.tableData,
          list: data || [],
          pagination: {
            ...initState.tableData.pagination,
            current: payload.page,
            pageSize: payload.size,
            total: data.total || 0,
          },
        });
        return true;
      } catch (error) {
        return false;
      }
    },
    async queryTreeData({ commit }, payload: RoleMenuRelationQueryParams) {
      try {
        const response: ResponseData = await listMenuByRoleId(payload);
        const { data } = response;
        console.log('data--------------');
        console.log(data);
        return data;
      } catch (error) {
        return false;
      }
    },

    async batchSaveRolesMenus({ commit }, payload: RoleMenuRelationSaveParams) {
      try {
        await saveRoleMenus(payload);
        return true;
      } catch (error) {
        return false;
      }
    },
  },
};

export default StoreModel;

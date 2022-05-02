import { Mutation, Action } from 'vuex';
import { StoreModuleType } from "@/utils/store";
import { ResponseData } from '@/utils/request';
import { MerchantDetailsDataType, TableDataType, TableListQueryParams } from './data.d';
import {
    queryList,
    removeData,
    createData,
    detailData,
    updateData,
    batchRemoveData,
} from './service';

export interface StateType {
    tableData: TableDataType;
    updateData: Partial<MerchantDetailsDataType>;
}


export interface ModuleType extends StoreModuleType<StateType> {
    state: StateType;
    mutations: {
        setTableData: Mutation<StateType>;
        setUpdateData: Mutation<StateType>;
    };
    actions: {
        queryTableData: Action<StateType, StateType>;
        deleteTableData: Action<StateType, StateType>;
        batchDeleteTableData: Action<StateType, StateType>;
        createTableData: Action<StateType, StateType>;
        queryUpdateData: Action<StateType, StateType>;
        updateTableData: Action<StateType, StateType>;
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
    name: 'MerchantDetailsListSearchTable',
    state: {
        ...initState
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
        async queryTableData({ commit }, payload: TableListQueryParams ) {
        try {
            const response: ResponseData = await queryList(payload);
            const { data } = response;
            commit('setTableData',{
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
    async deleteTableData({ commit }, payload: string ) {
        try {
            await removeData(payload);
            return true;
        } catch (error) {
            return false;
        }
    },
    async batchDeleteTableData({ commit }, payload: (number | string)[] ) {
        try {
            await batchRemoveData(payload);
            return true;
        } catch (error) {
            return false;
        }
    },
    async createTableData({ commit }, payload: Pick<MerchantDetailsDataType,  "detailsId" |  "payType" |  "signType" |  "inputCharset" |  "isTest"> ) {
        try {
            await createData(payload);
            return true;
        } catch (error) {
            return false;
        }
    },
    async queryUpdateData({ commit }, payload: string ) {
        try {
            const response: ResponseData = await detailData(payload);
            const { data } = response;
            commit('setUpdateData',{
                ...initState.updateData,
                ...data,
            });
            return true;
        } catch (error) {
            return false;
        }
    },
    async updateTableData({ commit }, payload: MerchantDetailsDataType ) {
            try {
                const { detailsId } = payload;
                await updateData(detailsId, payload);
                return true;
            } catch (error) {
                return false;
            }
        },
    }
};

export default StoreModel;
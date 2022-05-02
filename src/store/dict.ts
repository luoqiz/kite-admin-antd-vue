import { ResponseData } from '@/utils/request';
import { queryList } from '@/services/dict';

export interface DictItemDataType {
  detailId: string; //ID
  dictId?: string; //字典id
  dictName?: string; //所属字典
  label: string; //字典标签
  value: string; //字典值
  dictSort?: number; //排序
  createBy?: string; //创建者
  updateBy?: string; //更新者
  createTime?: Date; //创建日期
  updateTime?: Date; //更新时间
}

export interface OptionDataType {
  value: string;
  label: string;
  disabled?: boolean;
  key?: string;
  title?: string;
}

export interface StateType {
  dict: string;
  items: DictItemDataType[];
}

export async function FetchItems(dictKey: string) {
  try {
    const response: ResponseData = await queryList(dictKey);
    console.log('dict***********', response);
    const { data } = response;
    const dictItems: DictItemDataType[] = data;
    const items: OptionDataType[] = [];
    dictItems.forEach(function (ditem) {
      const item = {
        value: ditem.value,
        label: ditem.label,
        key: ditem.detailId,
      };
      items.push(item);
    });
    console.log('....dict...items', items);
    return items;
  } catch (error) {
    return [];
  }
}

// export interface ModuleType extends StoreModuleType<StateType> {
//   state: StateType;
//   mutations: {
//     getItems: Mutation<StateType>;
//   };
//   actions: {
//     fetchItems: Action<StateType, StateType>;
//   };
// }

// const initState: StateType = {
//   dict: '',
//   items: [],
// }

// const StoreModel: ModuleType = {
//   namespaced: true,
//   name: 'Dict',
//   state: {
//     ...initState
//   },
//   mutations: {
//     getItems(state, payload) {
//       state = {
//         ...initState,
//         ...payload,
//       }
//     },
//   },
//   actions: {
//     async fetchItems({ commit }, payload: string) {
//       try {
//         const response: ResponseData = await queryList(payload);
//         console.log("dict***********", response);
//         const { data } = response;
//         commit('getItems', data || {});
//         return true;
//       } catch (error) {
//         return false;
//       }
//     },
//   }
// }

// export default StoreModel;

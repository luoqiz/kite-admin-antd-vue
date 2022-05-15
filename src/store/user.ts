import { Action, Mutation } from 'vuex';
import { StoreModuleType } from '@/utils/store';
import { ResponseData } from '@/utils/request';
import { queryCurrent, queryMessage } from '@/services/user';
import { removeToken } from '@/utils/localToken';
import { RoutesDataItem } from '@/utils/routes';
import { clearMenus, setMenus } from '@/utils/sessionMenus';

export interface CurrentUser {
  userId: number;
  username: string;
  nickName: string;
  deptId: number;
  email: string;
  gender: string;
  avatarPath: string;
  roles: string[];
  menus: any[];
}

export interface StateType {
  currentUser: CurrentUser;
  userMenus: RoutesDataItem[];
  message: number;
}

export interface SysMenuDataType {
  menuId: string; //ID
  pid?: string; //上级菜单ID
  subCount?: number; //子菜单数目
  type?: number; //菜单类型
  title?: string; //菜单标题
  name?: string; //组件名称
  component?: string; //组件
  menuSort?: number; //排序
  icon?: string; //图标
  path?: string; //链接地址
  iFrame?: boolean; //是否外链
  cache?: boolean; //缓存
  hidden?: boolean; //隐藏
  permission?: string; //权限
  createBy?: string; //创建者
  updateBy?: string; //更新者
  createTime?: Date; //创建日期
  updateTime?: Date; //更新时间
  children?: SysMenuDataType[]; // 子菜单
}

export interface ModuleType extends StoreModuleType<StateType> {
  state: StateType;
  mutations: {
    saveCurrentUser: Mutation<StateType>;
    saveUserMenus: Mutation<StateType>;
    saveMessage: Mutation<StateType>;
  };
  actions: {
    fetchCurrent: Action<StateType, StateType>;
    fetchMessage: Action<StateType, StateType>;
    logout: Action<StateType, StateType>;
  };
}

const initState: StateType = {
  currentUser: {
    userId: 0,
    username: '',
    nickName: '',
    deptId: 0,
    email: '',
    gender: '',
    avatarPath: '',
    roles: [],
    menus: [],
  },
  userMenus: [],
  message: 0,
};

const StoreModel: ModuleType = {
  namespaced: true,
  name: 'user',
  state: {
    ...initState,
  },
  mutations: {
    saveCurrentUser(state, payload) {
      state.currentUser = {
        ...initState.currentUser,
        ...payload,
      };
    },
    saveUserMenus(state, payload) {
      state.userMenus = payload;
    },
    saveMessage(state, payload) {
      state.message = payload;
    },
  },
  actions: {
    async fetchCurrent({ commit }) {
      try {
        console.log('---------saveCurrentUser--------');
        const response: ResponseData = await queryCurrent();
        const { data } = response;
        commit('saveCurrentUser', data || {});
        const { menus } = data;
        await setMenus(menus);

        // let userMenus = toMenu(menus, '/');
        // await setMenus(userMenus);
        // commit('saveUserMenus', userMenus || {});
        return true;
      } catch (error) {
        return false;
      }
    },
    async fetchMessage({ commit }) {
      try {
        const response: ResponseData = await queryMessage();
        const { data } = response;
        commit('saveMessage', data || 0);
        return true;
      } catch (error) {
        return false;
      }
    },
    async logout({ commit }) {
      try {
        await removeToken();
        clearMenus();
        commit('saveCurrentUser', { ...initState.currentUser });
        return true;
      } catch (error) {
        return false;
      }
    },
  },
};

export default StoreModel;

import { Action, Mutation } from 'vuex';
import { StoreModuleType } from '@/utils/store';
import { ResponseData } from '@/utils/request';
import { queryCurrent, queryMessage } from '@/services/user';
import { removeToken } from '@/utils/localToken';

export interface CurrentUser {
  userId: number;
  username: string;
  nickName: string;
  deptId: number;
  email: string;
  gender: string;
  avatarPath: string;
  roles: string[];
}

export interface StateType {
  currentUser: CurrentUser;
  message: number;
}

export interface ModuleType extends StoreModuleType<StateType> {
  state: StateType;
  mutations: {
    saveCurrentUser: Mutation<StateType>;
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
  },
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
    saveMessage(state, payload) {
      state.message = payload;
    },
  },
  actions: {
    async fetchCurrent({ commit }) {
      try {
        const response: ResponseData = await queryCurrent();
        const { data } = response;
        commit('saveCurrentUser', data || {});
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
        commit('saveCurrentUser', { ...initState.currentUser });
        return true;
      } catch (error) {
        return false;
      }
    },
  },
};

export default StoreModel;

/**
 * 自定义 菜单 操作
 * @author luoqiz
 */
import settings from '@/config/settings';
import { RoutesDataItem } from '@/utils/routes';
import BlankLayout from '@/layouts/BlankLayout.vue';
import { defineAsyncComponent } from 'vue';
import { SysMenuDataType } from '@/store/user';
import IndexLayout from '@/layouts/IndexLayout/index.vue';

/**
 * 获取会话菜单
 */
export const getMenus = (): RoutesDataItem[] => {
  const menusStr = sessionStorage.getItem(settings.siteMenusKey);
  if (menusStr === undefined || menusStr === null) return [];
  // console.log('menusStr---', menusStr);
  const menus = JSON.parse(menusStr);
  const userMenus = toMenu(menus, '/');
  return userMenus;
};

/**
 * 设置存储 会话菜单
 */
export const setMenus = async (menus: SysMenuDataType[]): Promise<boolean> => {
  try {
    await sessionStorage.setItem(settings.siteMenusKey, JSON.stringify(menus));
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * 清空 会话菜单
 */
export const clearMenus = () => {
  try {
    sessionStorage.removeItem(settings.siteMenusKey);
    return true;
  } catch (error) {
    return false;
  }
};

function toMenu(treeNodes: SysMenuDataType[], prefix: String) {
  const result: Array<RoutesDataItem> = [];
  treeNodes.forEach((item) => {
    let path = '/';
    if (prefix === undefined || prefix === '/') {
      path = '/' + (item.path || '');
    } else {
      path = prefix + '/' + (item.path || '');
    }

    /* @vite-ignore */
    let temp: RoutesDataItem = {
      icon: item.icon,
      title: item.title || '',
      path: path,
    };

    if (item.children !== undefined && item.children !== null) {
      const children = toMenu(item.children, path);
      if (children.length < 1) {
        temp.hidden = true;
      } else {
        temp.redirect = children[0]['path'];
        temp.component = BlankLayout;
      }
      temp.children = children;
    } else {
      temp.component = loadView(item.component);
    }
    result.push(temp);
  });
  return result;
}

/**
 * 路由懒加载 拼接
 * @param view
 * @returns {function(): *}
 */
const loadView = (view) => {
  // 这里需要注意一下 vite+vue3 要用 defineAsyncComponent 才能拼接成功 不然会一直报错找不到模块  加上/* @vite-ignore */ 可以不显示警告
  return () => defineAsyncComponent(() => import(/* @vite-ignore */ `/src/views/${view}`));
};

export const updateRouter = (router) => {
  const menus = getMenus();
  if (menus.length !== 0) {
    router.addRoute('security', {
      title: 'empty',
      path: '/',
      redirect: menus.at(0)?.path || '',
      component: IndexLayout,
      children: menus,
    });
  }

  // console.log('userStore.userMenus**-*-', menus);
  // console.log('router**-*-', router.getRoutes());
};

/**
 * 路由入口
 * @author LiQingSong
 */
import NProgress from 'nprogress'; // progress bar
import 'nprogress/nprogress.css'; // progress bar style
import { createRouter, createWebHashHistory } from 'vue-router';
import { RoutesDataItem } from '@/utils/routes';

import UserLayoutRoutes from '@/layouts/UserLayout/routes';
import UserLayout from '@/layouts/UserLayout/index.vue';
import BlankLayout from '@/layouts/BlankLayout.vue';
import { updateRouter } from '@/utils/sessionMenus';

NProgress.configure({ showSpinner: false, easing: 'ease', speed: 1000 }); // NProgress Configuration

const routes: RoutesDataItem[] = [
  // {
  //   title: 'empty',
  //   path: '/',
  //   component: SecurityLayout,
  //   children: [
  //     {
  //       title: 'empty',
  //       path: '/',
  //       redirect: settings.homeRouteItem.path,
  //       component: IndexLayout,
  //       children: store.state.user.userMenus,
  //     },
  //     {
  //       title: 'empty',
  //       path: '/refresh',
  //       component: () => import('@/views/refresh/index.vue'),
  //     },
  //   ],
  // },
  {
    name: 'index',
    title: 'empty',
    path: '/',
    component: BlankLayout,
    redirect: '/user',
  },
  {
    title: 'empty',
    path: '/user',
    redirect: '/user/login',
    component: UserLayout,
    children: UserLayoutRoutes,
  },
];

const router = createRouter({
  scrollBehavior(/* to, from, savedPosition */) {
    return { top: 0 };
  },
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: routes,
});

router.beforeEach((/* to, from */) => {
  // start progress bar
  NProgress.start();
});

router.afterEach(() => {
  // finish progress bar
  NProgress.done();
});

updateRouter(router);

export default router;

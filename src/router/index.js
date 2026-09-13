import { createRouter, createWebHistory } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

/**
 * 路由表
 * meta.requiresAuth 标记"需要登录才能访问"的页面，配合全局前置守卫实现登录拦截
 */
const routes = [
  {
    // 主布局（顶部导航 + 底部页脚），业务页面全部作为它的子路由
    path: '/',
    component: () => import('@/layout/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('@/views/HomeView.vue'),
        meta: { title: '首页' }
      },
      {
        path: 'heritages',
        name: 'heritage-list',
        component: () => import('@/views/HeritageListView.vue'),
        meta: { title: '非遗图鉴' }
      },
      {
        path: 'heritages/:id', // 动态路由：通过 params.id 获取详情
        name: 'heritage-detail',
        component: () => import('@/views/HeritageDetailView.vue'),
        meta: { title: '非遗详情' }
      },
      {
        path: 'inheritors',
        name: 'inheritors',
        component: () => import('@/views/InheritorsView.vue'),
        meta: { title: '传承人名录' }
      },
      {
        path: 'favorites',
        name: 'favorites',
        component: () => import('@/views/FavoritesView.vue'),
        meta: { title: '我的收藏', requiresAuth: true }
      },
      {
        path: 'profile',
        name: 'profile',
        component: () => import('@/views/ProfileView.vue'),
        meta: { title: '个人中心', requiresAuth: true }
      }
    ]
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/RegisterView.vue'),
    meta: { title: '注册' }
  },
  {
    // 任意未匹配路径 → 404
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
    meta: { title: '页面不存在' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  // 切换路由时回到页面顶部
  scrollBehavior() {
    return { top: 0 }
  }
})

/**
 * 全局前置守卫：登录拦截
 * 1. 目标页面需要登录（meta.requiresAuth）且未登录 → 重定向到 /login，并带上
 *    redirect 参数，登录成功后可以回到原页面
 * 2. 已登录用户访问 /login、/register → 直接送回首页
 */
router.beforeEach((to) => {
  const userStore = useUserStore()

  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    ElMessage.warning('请先登录后再访问该页面')
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (userStore.isLoggedIn && (to.name === 'login' || to.name === 'register')) {
    return { name: 'home' }
  }
  // 返回 undefined / true 表示放行
})

/**
 * 全局后置钩子：根据 meta.title 动态设置浏览器标签页标题
 */
router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} · 遗韵华夏` : '遗韵华夏'
})

export default router

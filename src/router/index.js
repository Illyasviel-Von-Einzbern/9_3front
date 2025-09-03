/**
 * router/index.ts
 *
 * Automatic routes for `./src/pages/*.vue`
 */

// Composables

import { setupLayouts } from 'virtual:generated-layouts'
// eslint-disable-next-line import/no-duplicates
import { createRouter, createWebHistory, START_LOCATION } from 'vue-router/auto'
// eslint-disable-next-line import/no-duplicates
import { routes } from 'vue-router/auto-routes'
import userService from '@/services/user'
import { useUserStore } from '@/stores/user'

// 手動引入，可以放自訂資料夾
// import RestaurantCreate from '@/pages/restaurants/create.vue'
// import RestaurantDetail from '@/views/RestaurantDetail.vue'
// import RestaurantList from '@/views/RestaurantList.vue'
// | 檔案路徑                            | 對應的 URL 路徑        | 說明                                                     |
// | ---------------------------------- | --------------------- | ------------------------------------------------------ |
// | `src/pages/restaurants/index.vue`  | `/restaurants`        | 餐廳列表頁（RestaurantList.vue）                              |
// | `src/pages/restaurants/create.vue` | `/restaurants/create` | 餐廳建立頁（RestaurantCreate.vue）                            |
// | `src/pages/restaurants/[id].vue`   | `/restaurants/:id`    | 餐廳詳細頁（RestaurantDetail.vue）<br>（例如 `/restaurants/123`） |

// const routes2 = [
//   { path: '/', redirect: '/restaurants' },
//   { path: '/restaurants', component: RestaurantList },
//   { path: '/restaurants/create', component: RestaurantCreate },
//   { path: '/restaurants/:id', component: RestaurantDetail },
// ]

// const router2 = createRouter({
//   history: createWebHistory(),
//   routes2,
// })

console.log(routes)

// 自訂 layout 對應邏輯
function customLayoutResolver (route) {
  console.log('前端/router/customLayoutResolver 路由:', route.path, 'meta.layout:', route.meta?.layout)

  // 若已有明確 layout 設定，就用它
  if (route.meta?.layout) {
    return route.meta.layout
  }

  // 若路徑以 /admin 開頭，自動套用 admin layout
  if (route.path?.startsWith('/admin')) {
    return 'admin'
  }

  // 其他路徑都用 default.vue
  return undefined
}

// 自動引入，全部都放pages
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: setupLayouts(routes, customLayoutResolver),
  // 自動路由
  // 自動添加 admin 路徑(上面的 customLayoutResolver )
})

router.beforeEach(async (to, from, next) => {
  const user = useUserStore()

  if (from === START_LOCATION && user.isLoggedIn) {
    // 第一次進入網站初始導航時，如果有 token，取使用者資料
    try {
      const { data } = await userService.profile()
      user.login(data.user)
    } catch (error) {
      console.error(error)
      user.token = ''
    }
  }

  if (to.meta.login === 'no-login-only' && user.isLoggedIn) {
    // 去未登入限定頁面，註冊頁和登入頁，且使用者有登入
    next('/')
    // 導航回首頁
  } else if (to.meta.login === 'login-only' && !user.isLoggedIn) {
    // 去登入限定頁面，且使用者沒有登入
    next('/login')
    // 導航到登入頁
  } else if (to.meta.admin && !user.isAdmin) {
    // 去管理員限定頁面，且使用者不是管理員
    next('/')
    // 導航回首頁
  } else {
    // 不阻擋
    next()
  }
  // 根據登入狀態和頁面路徑進行導航守衛
})

router.afterEach(to => {
  // document.title = `${to.meta.title} | 購物網站`
  document.title = `${to.meta.title} | 訂便當`
})

// Workaround for https://github.com/vitejs/vite/issues/11804
router.onError((err, to) => {
  if (err?.message?.includes?.('Failed to fetch dynamically imported module')) {
    if (localStorage.getItem('vuetify:dynamic-reload')) {
      console.error('Dynamic import error, reloading page did not fix it', err)
    } else {
      console.log('Reloading page to fix dynamic import error')
      localStorage.setItem('vuetify:dynamic-reload', 'true')
      location.assign(to.fullPath)
    }
  } else {
    console.error(err)
  }
})

router.isReady().then(() => {
  localStorage.removeItem('vuetify:dynamic-reload')
})

export default router

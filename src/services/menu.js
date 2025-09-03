import apiService from './api'

export default {
  getAll () {
    return apiService.apiAuth.get('/menus')
  },
  create (data) {
    return apiService.apiAuth.post('/menus', data)
  },
  getMenuById (id) {
    return apiService.api.get(`/menus/${id}`)
  },
  updateMenu (id, data) {
    return apiService.apiAuth.patch(`/menus/${id}`, data)
  },
  deleteMenu (id) {
    return apiService.apiAuth.delete(`/menus/${id}`)
  },
}
// 對應 back/routes/menu.js

// | 功能         | Method | 路由               | 前端 method              | 權限           | 圖片上傳 | 狀態 |
// | ------       | ------ | ---------------- | ---------------------- | ------------ | ---- | -- |
// | 取得單一菜單  | GET    | `/menus/:menuId` | `getMenuById(id)`      | ❌            | ❌    | ✅  |
// | 修改菜單     | PATCH  | `/menus/:menuId` | `updateMenu(id, data)` | ✅ user/admin | ✅    | ✅  |
// | 刪除菜單     | DELETE | `/menus/:menuId` | `deleteMenu(id)`       | ✅ user/admin | ❌    | ✅  |

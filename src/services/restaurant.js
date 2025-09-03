import axios from 'axios'
import apiService from './api'

const BASE_URL = '/api/restaurants'
const getDetail = id => {
  return axios.get(`${BASE_URL}/${id}`)
}

export default {
  // get () {
  //   return apiService.api.get('/restaurants')
  // },
  getAll (params = {}) {
    return apiService.api.get('/restaurants', { params })
    // .then(res => res.data)
  },
  getAllAuth (params = {}) {
    return apiService.apiAuth.get('/restaurants', { params })
    // .then(res => res.data)
  },
  getAllAdmin (params = {}) {
    return apiService.apiAuth.get('/restaurants/admin/all', { params })
    // .then(res => res.data)
  },
  create (data) {
    return apiService.apiAuth.post('/restaurants', data)
    // .then(res => res.data)
  },
  getById (id) {
    return apiService.api.get(`/restaurants/${id}`)
    // .then(res => res.data)
  },
  update (id, data) {
    return apiService.apiAuth.patch(`/restaurants/${id}`, data)
    // .then(res => res.data)
  },
  delete (id) {
    return apiService.apiAuth.delete(`/restaurants/${id}`)
    // .then(res => res.data)
  },
  createMenu (id, data) {
    return apiService.apiAuth.post(`/restaurants/${id}/menus`, data)
    // .then(res => res.data)
  },
  getMenu (id, params) {
    return apiService.apiAuth.get(`/restaurants/${id}/menus`, { params })
    // .then(res => res.data)
  },
  getDetail,
}
// 對應 back/routes/restaurant.js

// | 功能        | Method | 路由                      | 前端 method              | 權限           | 圖片上傳 | 狀態 |
// | ------      | ------ | ----------------------- | ---------------------- | ------------ | ---- | -- |
// | 取得所有餐廳 | GET    | `/restaurant`           | `getAll()`             | ❌            | ❌    | ✅  |
// | 新增餐廳     | POST   | `/restaurant`           | `create(data)`         | ✅ user/admin | ✅    | ✅  |
// | 取得單一餐廳 | GET    | `/restaurant/:id`       | `getId(id)`            | ❌            | ❌    | ✅  |
// | 修改餐廳     | PATCH  | `/restaurant/:id`       | `update(id, data)`     | ✅ user/admin | ✅    | ✅  |
// | 刪除餐廳     | DELETE | `/restaurant/:id`       | `delete(id)`           | ✅ admin      | ❌    | ✅  |
// | 建立菜單     | POST   | `/restaurant/:id/menus` | `createMenu(id, data)` | ✅ user/admin | ✅    | ✅  |
// | 取得菜單     | GET    | `/restaurant/:id/menus` | `getMenu(id)`          | ❌            | ❌    | ✅  |

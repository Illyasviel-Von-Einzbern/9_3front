import apiService from './api'

export default {
  get () {
    return apiService.api.get('/product')
  },
  getAll () {
    return apiService.apiAuth.get('/product/all')
  },
  getId (id) {
    return apiService.api.get('/product/' + id)
  },
  create (data) {
    return apiService.apiAuth.post('/product', data)
  },
  update (id, data) {
    return apiService.apiAuth.patch(`/product/${id}`, data)
  },
}
// 對應 back/routes/product.js

// | 功能        | Method | 路由             | 前端對應 method        | 權限控制                          | 備註     |
// | ------      | ------ | -------------- | ------------------ | ----------------------------- | ------ |
// | 取得公開商品 | GET    | `/product`     | `get()`            | 無                             | ✅      |
// | 取得所有商品 | GET    | `/product/all` | `getAll()`         | `auth.token + admin`          | ✅      |
// | 取得單一商品 | GET    | `/product/:id` | `getId(id)`        | 無                             | ✅      |
// | 新增商品     | POST   | `/product`     | `create(data)`     | `auth.token` + `upload`       | ✅ 圖片上傳 |
// | 修改商品     | PATCH  | `/product/:id` | `update(id, data)` | `auth.token + admin + upload` | ✅      |

// /services/review.js

import apiService from './api'

export default {
  getAllAdmin () {
    return apiService.apiAuth.get(`/reviews`) // admin 專用（你後端控制權限）
  },
  getByRestaurant (restaurantId) {
    return apiService.apiAuth.get(`/reviews/${restaurantId}`)
  },
  // getUserReview (restaurantId) {
  //   return apiService.apiAuth.get(`/reviews/${restaurantId}/user-review`)
  // },
  update (id, data) {
    return apiService.apiAuth.patch(`/reviews/${id}`, data)
  },
  create (id, data) {
    // 送 POST 請求到 /reviews 建立新評論
    return apiService.apiAuth.post(`/reviews/${id}`, data)
  },
  // 你也可以擴充其他函式，例如 getByRestaurant 等
  softDelete (id) {
    return apiService.apiAuth.patch(`/reviews/${id}/soft-delete`)
  },
  restore (id) {
    return apiService.apiAuth.patch(`/reviews/${id}/restore`)
  },
  delete (id) {
    return apiService.apiAuth.delete(`/reviews/${id}`)
  },
}

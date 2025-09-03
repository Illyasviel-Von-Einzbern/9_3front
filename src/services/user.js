import apiService from './api'

export default {
  create (data) {
    return apiService.api.post('/user', data)
  },
  batchCreate (data) {
    return apiService.api.post('/user/batch', data)
  },
  adminCreate (data) {
    return apiService.apiAuth.post('/user/admin', data)
  },
  login (data) {
    return apiService.api.post('/user/login', data)
  },
  profile () {
    return apiService.apiAuth.get('/user/profile')
  },
  refresh () {
    return apiService.apiAuth.patch('/user/refresh')
  },
  logout () {
    return apiService.apiAuth.delete('/user/logout')
  },
  cart (data) {
    return apiService.apiAuth.patch('/user/cart', data)
  },
  getCart () {
    return apiService.apiAuth.get('/user/cart')
  },
  getAll () {
    return apiService.apiAuth.get('/user')
  },
  delete (id) {
    return apiService.apiAuth.delete(`/user/${id}`)
  },
  update (id, data) {
    return apiService.apiAuth.patch(`/user/${id}`, data)
  },
}

import apiService from './api'

export default {
  create () {
    return apiService.apiAuth.post('/orders')
  },
  getAll () {
    return apiService.apiAuth.get('/orders')
  },
  getMy () {
    return apiService.apiAuth.get('/orders/my')
  },
}

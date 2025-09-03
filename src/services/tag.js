import apiService from './api'

export default {
  getDefaultTags () {
    return apiService.apiAuth.get('/tags')
  },
}

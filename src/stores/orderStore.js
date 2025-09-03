import { defineStore } from 'pinia'
import { createOrderApi } from '../services/order'

export const useOrderStore = defineStore('order', {
  state: () => ({
    loading: false,
    error: '',
    orderResult: null,
  }),
  actions: {
    async createOrder (payload) {
      this.loading = true
      this.error = ''
      try {
        const res = await createOrderApi(payload)
        this.orderResult = res.data
      } catch (error) {
        this.error = error.response?.data?.message || '下單失敗'
      } finally {
        this.loading = false
      }
    },
  },
})

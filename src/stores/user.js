// Utilities
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const _id = ref('')
  const account = ref('')
  const cartTotal = ref(0)
  const role = ref('user')
  const token = ref('')

  const isLoggedIn = computed(() => token.value.length > 0)
  const isAdmin = computed(() => role.value === 'admin')

  const login = data => {
    _id.value = data._id
    account.value = data.account
    cartTotal.value = data.cartTotal
    role.value = data.role

    if (data.token) {
      token.value = data.token
    }
    // 重新整理頁面時，用 token 取得使用者資料
    // 這個回應不包含 token
  }

  const logout = () => {
    _id.value = ''
    account.value = ''
    cartTotal.value = 0
    role.value = 'user'
    token.value = ''
  }

  return {
    _id,
    account,
    cartTotal,
    role,
    token,
    isLoggedIn,
    isAdmin,
    login,
    logout,
  }
}, {
  persist: {
    key: 'shop-user',
    pick: ['token'],
  },
})

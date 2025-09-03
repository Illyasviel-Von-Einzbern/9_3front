<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">新增餐廳</h1>
        <v-btn class="mb-4" prepend-icon="mdi-arrow-left" to="/restaurants" variant="text">
          返回列表
        </v-btn>
      </v-col>
    </v-row>
    <RestaurantForm @success="onSuccess" />
  </v-container>
</template>

<script setup>
  import { useRouter } from 'vue-router'
  import { useSnackbar } from 'vuetify-use-dialog'
  import RestaurantForm from '@/components/RestaurantForm.vue'

  const router = useRouter()
  const createSnackbar = useSnackbar()

  function onSuccess () {
    createSnackbar({
      text: '餐廳新增成功',
      snackbarProps: { color: 'success' },
    })
    router.push('/restaurants')
  }
</script>

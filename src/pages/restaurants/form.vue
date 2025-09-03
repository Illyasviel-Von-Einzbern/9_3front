<!-- 餐廳新增/編輯共用表單 -->
<template>
  <v-form ref="formRef" @submit.prevent="onSubmit">
    <v-card class="pa-4">
      <v-card-title>{{ isEdit ? '編輯餐廳' : '新增餐廳' }}</v-card-title>
      <v-card-text>
        <v-text-field v-model="form.name" label="餐廳名稱" :rules="[v => !!v || '必填']" />
        <v-text-field v-model="form.phone" label="電話" :rules="[v => !!v || '必填']" />
        <v-text-field v-model="form.address" label="地址" />
        <v-text-field v-model="form.link" label="外部連結" />
        <v-select
          v-model="form.category"
          :items="categories"
          label="分類"
          :rules="[v => !!v || '必填']"
        />
        <v-switch v-model="form.sell" label="是否上架" />
        <v-file-input v-model="imageFile" accept="image/*" label="餐廳圖片" show-size />
        <v-img v-if="previewUrl" class="mt-3" height="200" :src="previewUrl" />

        <v-combobox
          v-model="form.tags"
          chips
          clearable
          label="標籤"
          multiple
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="primary" type="submit">{{ isEdit ? '更新' : '儲存' }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-form>
</template>

<script setup>
  import { computed, ref, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useRestaurantStore } from '@/stores/restaurantStore'

  const store = useRestaurantStore()
  const route = useRoute()
  const router = useRouter()
  const formRef = ref(null)

  const isEdit = computed(() => !!route.params.id)
  const categories = ['食物', '飲料', '其他']

  const form = ref({ name: '', phone: '', address: '', link: '', category: '', tags: [], sell: true })
  const imageFile = ref(null)
  const previewUrl = ref(null)

  watch(imageFile, f => {
    if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = f ? URL.createObjectURL(f) : null
  })

  onMounted(async () => {
    if (isEdit.value) {
      const res = await store.fetchById(route.params.id)
      Object.assign(form.value, res.data)
    }
  })

  async function onSubmit () {
    const valid = await formRef.value.validate()
    if (!valid) return
    const data = new FormData()
    for (const k of ['name', 'phone', 'address', 'link', 'category', 'sell']) {
      data.append(k, form.value[k])
    }
    data.append('tags', JSON.stringify(form.value.tags))
    if (imageFile.value) data.append('image', imageFile.value)
    const res = isEdit.value
      ? await store.update(route.params.id, data)
      : await store.create(data)

    if (res.success) router.push('/')
  }
</script>

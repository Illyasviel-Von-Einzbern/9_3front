<template>
  <v-app>
    <v-app-bar color="primary">
      <!-- 漢堡選單圖示，在手機版上點擊會展開側邊欄 -->
      <v-app-bar-nav-icon @click="drawer = !drawer" />

      <!-- 網站標題，點擊後會回到首頁 -->
      <v-toolbar-title class="cursor-pointer" @click="$router.push('/')">
        午餐訂餐系統
      </v-toolbar-title>

      <v-spacer />

      <!-- 桌面版的導覽按鈕 -->
      <div class="d-none d-md-flex">
        <v-btn text to="/restaurants">
          餐廳列表
        </v-btn>
        <!-- <v-btn text to="/menus">
          所有菜單
        </v-btn> -->
        <v-btn text to="/orders">
          今日訂單
        </v-btn>
      </div>
    </v-app-bar>

    <!-- 手機版的側邊導覽選單 -->
    <v-navigation-drawer v-model="drawer" temporary>
      <v-list>
        <v-list-item prepend-icon="mdi-silverware-fork-knife" title="餐廳列表" to="/restaurants" />
        <!-- <v-list-item prepend-icon="mdi-book-open-page-variant" title="所有菜單" to="/menus" /> -->
        <v-list-item prepend-icon="mdi-format-list-checks" title="今日訂單" to="/orders" />
      </v-list>
    </v-navigation-drawer>

    <!-- 頁面內容會顯示在這裡 -->
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'

  const drawer = ref(false)
  const $router = useRouter()
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
</style>

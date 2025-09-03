<!-- <template>
  <v-app-bar>
    <v-container>
      <v-app-bar-title>購物網站</v-app-bar-title>
      <template v-for="item of navItems" :key="item.to">
        <v-btn v-if="item.show" :prepend-icon="item.icon" :to="item.to">
          {{ item.title }}
          <v-badge v-if="item.to === '/cart' && user.cartTotal > 0" color="red" :content="user.cartTotal" floating />
        </v-btn>
      </template>
      <v-btn v-if="user.isLoggedIn" prepend-icon="mdi-logout" @click="logout">登出</v-btn>
    </v-container>
  </v-app-bar>
  <v-main>
    <router-view :key="$route.fullPath" />
  </v-main>
</template> -->

<template>
  <v-app-bar>
    <v-container class="d-flex align-center" max-width="lg">
      <v-app-bar-title class="your-custom-class"><v-icon icon="mdi-silverware-variant" style="vertical-align: -5px;" />訂便當</v-app-bar-title>
      <!-- eslint-disable-next-line -->
      <template v-for="item of navItems" :key="item.to">
        <v-btn
          v-if="item.show"
          class="mx-1"
          :prepend-icon="item.icon"
          size="large"
          :to="item.to"
        >
          {{ item.title }}
        </v-btn>
      </template>
      <v-spacer />
      <v-menu v-if="user.isLoggedIn" location="bottom end">
        <template #activator="{ props }">
          <v-btn v-bind="props" icon>
            <v-avatar color="#CFB53B" size="32">
              <span>{{ user.account?.charAt(0)?.toUpperCase() || 'U' }}</span>
            </v-avatar>
          </v-btn>
        </template>
        <v-list>
          <v-list-item :to="'/orders/history'">
            <v-list-item-title>訂單紀錄</v-list-item-title>
          </v-list-item>
          <v-list-item @click="logout">
            <v-list-item-title>登出</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
      <v-btn v-else prepend-icon="mdi-login" :to="'/login'">登入</v-btn>
    </v-container>
  </v-app-bar>
  <!-- eslint-disable-next-line -->
  <v-main>
    <div class="smoke-wrapper">
      <video
        autoplay
        class="smoke-video"
        loop
        muted
        playsinline
      >
        <source src="@/assets/smoke.mp4" type="video/mp4">
        您的瀏覽器不支援 HTML5 影片。
      </video>
    </div>
    <router-view :key="$route.fullPath" />
  </v-main>
</template>

<script setup>
  import { computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { useSnackbar } from 'vuetify-use-dialog'
  import userService from '@/services/user'
  import { useUserStore } from '@/stores/user'

  const user = useUserStore()
  const createSnackbar = useSnackbar()
  const router = useRouter()

  // const navItems = computed(() => [
  //   { title: '首頁', to: '/', icon: 'mdi-home', show: true },
  //   { title: '註冊', to: '/register', icon: 'mdi-account-plus', show: !user.isLoggedIn },
  //   { title: '登入', to: '/login', icon: 'mdi-login', show: !user.isLoggedIn },
  //   { title: '購物車', to: '/cart', icon: 'mdi-cart', show: user.isLoggedIn },
  //   { title: '訂單', to: '/orders', icon: 'mdi-invoice-list-outline', show: user.isLoggedIn },
  //   { title: '管理', to: '/admin', icon: 'mdi-cog', show: user.isLoggedIn && user.isAdmin },
  // ])

  const navItems = computed(() => [
    { title: '首頁', to: '/', icon: 'mdi-home', show: true },
    { title: '註冊', to: '/register', icon: 'mdi-account-plus', show: user.isLoggedIn && user.isAdmin },
    { title: '登入', to: '/login', icon: 'mdi-login', show: !user.isLoggedIn },
    // { title: '購物車', to: '/cart', icon: 'mdi-cart', show: user.isLoggedIn },
    { title: '餐廳', to: '/restaurants', icon: 'mdi-silverware-fork-knife', show: user.isLoggedIn },
    { title: '訂單', to: '/orders', icon: 'mdi-invoice-list-outline', show: user.isLoggedIn },
    { title: '管理', to: '/admin', icon: 'mdi-cog', show: user.isLoggedIn && user.isAdmin },
  ])

  const logout = async () => {
    try {
      await userService.logout()
    } catch (error) {
      console.error(error)
    }
    user.logout()
    router.push('/')
    createSnackbar({
      text: '登出成功！',
      snackbarProps: {
        color: 'green',
      },
    })
  }
</script>

<style scoped>
main{
  /* background-color: #fff; */
  background:
    url("../assets/bg2.png") no-repeat fixed 1150px bottom /800px,
    url("../assets/bg.png") no-repeat fixed -550px bottom /1000px,
    url("../assets/bg_wall.jpg") no-repeat fixed center / cover;
}
/* v-app-bar-title{
  background-color: #ff0;
} */
 @font-face {
  font-family: 'A_KsoTouryu';
  src: url('@/assets/fonts/A_KsoTouryu.otf') format('opentype');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}

.your-custom-class {
  font-family: 'A_KsoTouryu', sans-serif;
  font-size: 2rem;
}
 .v-icon{
  color: #CFB53B;
 }
 .v-app-bar{
  border-bottom: 1px solid #555;
 }

.smoke-wrapper {
  position: fixed;
  bottom: -500px;
  right: 600px;
  width: 1920px;
  height: auto;
  pointer-events: none;
  z-index: 1;

  /* 混合模式 */
  mix-blend-mode:screen;

  /* 自訂動畫讓煙霧浮動 */
  /* animation: floatUp 6s ease-in-out infinite; */
}

.smoke-video {
  width: 100%;
  height: auto;

  /* 嘗試去除綠色背景 */
  /* filter: brightness(1.2) contrast(1.5) saturate(0.7) hue-rotate(30deg); */
  opacity: 0.8;
}

/* 煙霧飄浮動畫 */
/* @keyframes floatUp {
  0% {
    transform: translateY(0px) scale(1);
    opacity: 0.8;
  }
  50% {
    transform: translateY(-10px) scale(1.05);
    opacity: 1;
  }
  100% {
    transform: translateY(0px) scale(1);
    opacity: 0.8;
  }
} */

</style>

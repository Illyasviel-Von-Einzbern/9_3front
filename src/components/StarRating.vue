<template>
  <div class="star-rating">
    <div
      v-for="index in 5"
      :key="index"
      class="star-wrapper"
    >
      <!-- 背景星星（灰） -->
      <v-icon color="grey darken-1" size="20">mdi-star</v-icon>

      <!-- 前景星星（黃），用遮罩遮住 -->
      <div
        class="star-overlay"
        :style="{ width: getFillPercent(index) + '%' }"
      >
        <v-icon color="yellow darken-2" size="20">mdi-star</v-icon>
      </div>
    </div>
  </div>
</template>

<script setup>
  const props = defineProps({
    score: {
      type: Number,
      default: 0,
    },
  })

  /**
   * 計算第 N 顆星要亮多少比例（0~100）
   */
  const getFillPercent = index => {
    const full = Math.floor(props.score)
    const partial = props.score - full

    if (index <= full) return 100
    if (index === full + 1) return Math.round(partial * 100)
    return 0
  }
</script>

<style scoped>
.star-rating {
  display: flex;
  align-items: center;
  gap: 2px;
}
.star-wrapper {
  position: relative;
  width: 20px;
  height: 20px;
}
.star-overlay {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  overflow: hidden;
}
</style>

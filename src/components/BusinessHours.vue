<template>
  <div>
    <!-- 點擊區塊，加 .stop 阻止事件冒泡 -->
    <div class="status" style="cursor: pointer; user-select: none; display: flex; align-items: center; gap: 6px;" @click.stop="toggleOpen">
      <v-icon color="#ccc">mdi-clock-outline</v-icon>
      <span>{{ openNow ? '營業中' : '休息中' }}</span>
      <v-icon>{{ expanded ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
    </div>

    <!-- 折疊營業時間列表 -->
    <transition name="fade">
      <div v-show="expanded" class="hours-list" style="margin-top: 8px; font-size: 14px; color: #ccc;">
        <div
          v-for="item in hours"
          :key="item.day"
          :class="{ closed: item.isClosed }"
          style="display: flex; gap: 8px; align-items: center;"
        >
          <!-- 固定寬度欄位，避免換行 -->
          <strong style="width: 61px; flex-shrink: 0; display: inline-block;">{{ dayMap[item.day] }}：</strong>
          <span v-if="!item.isClosed">{{ item.open }}－{{ item.close }}</span>
          <span v-else>休息</span>
        </div>
      </div>
    </transition>

  </div>
</template>

<!-- <template>
  <div>
    <div class="status" @click.stop="toggleOpen">
      <v-icon color="primary">mdi-clock-outline</v-icon>
      <span>{{ openNow ? '營業中' : '休息中' }}</span>
      <v-icon>{{ expanded ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
    </div>

    <transition name="fade">
      <div v-show="expanded" class="hours-list">
        <div v-for="item in hours" :key="item.day" :class="['hours-item', { closed: item.isClosed }]">
          <strong class="day-label">{{ dayMap[item.day] }} :</strong>
          <span v-if="!item.isClosed">{{ item.open }} - {{ item.close }}</span>
          <span v-else>休息</span>
        </div>
      </div>
    </transition>
  </div>
</template> -->

<!-- <template>
<div
  v-for="item in hours"
  :key="item.day"
  :class="{ closed: item.isClosed }"
  style="display: flex; align-items: center; margin-bottom: 4px;"
>
  <div style="width: 56px; white-space: nowrap; font-weight: 600;">
    {{ item.day }}
  </div>
  <div style="flex: 1;">
    <span v-if="!item.isClosed">{{ item.open }} - {{ item.close }}</span>
    <span v-else>休息</span>
  </div>
</div>
</template> -->

<script setup>
  import { computed, ref } from 'vue'

  const props = defineProps({
    hours: {
      type: Array,
      default: () => [],
    },
  })

  const expanded = ref(false)

  const toggleOpen = () => {
    expanded.value = !expanded.value
  }

  // 星期英文對應中文
  const dayMap = {
    Mon: '星期一',
    Tue: '星期二',
    Wed: '星期三',
    Thu: '星期四',
    Fri: '星期五',
    Sat: '星期六',
    Sun: '星期日',
  }

  // 判斷現在時間是否在營業時間內
  const openNow = computed(() => {
    if (props.hours.length === 0) return false

    const dayMap = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 0 }
    const now = new Date()
    const todayDayNum = now.getDay() // 0~6 (Sun ~ Sat)
    // 找出今天的營業時間
    const today = props.hours.find(h => dayMap[h.day] === todayDayNum)

    if (!today || today.isClosed) return false

    const nowTime = now.getHours() * 60 + now.getMinutes()
    const openParts = today.open.split(':').map(Number)
    const closeParts = today.close.split(':').map(Number)
    const openTime = openParts[0] * 60 + openParts[1]
    const closeTime = closeParts[0] * 60 + closeParts[1]

    return nowTime >= openTime && nowTime <= closeTime
  })
</script>

<style scoped>
.status {
  cursor: pointer;
  user-select: none;
  display: flex;
  align-items: center;
  gap: 6px;
}

.hours-list {
  margin-top: 8px;
  font-size: 14px;
  color: #ccc;
}

.hours-item {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 4px;
}

.day-label {
  width: 60px;
  flex-shrink: 0;
  display: inline-block;
}

.closed {
  color: gray;
  font-style: italic;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

</style>

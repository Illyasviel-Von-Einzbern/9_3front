<!-- RestaurantCard.vue — 餐廳資訊卡片元件 -->
<!-- 用途： -->
  <!-- 這個元件負責以卡片形式顯示單一餐廳的資訊，包括餐廳圖片、名稱、分類、評分、外送狀態和營業時間等。 -->
<!-- 主要功能： -->
  <!-- 顯示餐廳圖片（沒圖片會有預設圖） -->
  <!-- 顯示餐廳名稱與分類標籤 -->
  <!-- 顯示星星評分與分數數字 -->
  <!-- 顯示是否有外送、外送門檻（份數、金額） -->
  <!-- 顯示營業時間（用另一個子元件 BusinessHours） -->
  <!-- 點擊整張卡片會發出 click 事件，方便父元件監聽使用 -->
<!-- 怎麼用？ -->
<!-- 父元件引入後，傳入 restaurant 物件： -->
<!-- <RestaurantCard :restaurant="someRestaurantObject" @click="handleClick" /> -->
<!-- 例如： -->
  <!-- someRestaurantObject = {
    name: '麥當勞',
    category: '速食',
    average_score: 4.5,
    delivery: true,
    delivery_number: 2,
    delivery_price: 200,
    business_hours: {...},
    image: 'some-image-url'
  } -->
<!-- 你可以在父元件用 @click 監聽點擊事件。 -->
<template>
  <v-card
    class="hover:scale-[1.01] transition cursor-pointer "
    elevation="2"
    hover
    rounded="lg"
    @click="$emit('click')"
  >
    <!-- 圖片 -->
    <v-img
      cover
      height="180"
      :src="restaurant.image || 'https://via.placeholder.com/300x180?text=No+Image'"
    />

    <v-card-text>
      <!-- ✅ 名稱 + 分類同一行 -->
      <v-row class="justify-space-between align-center mb-2">
        <v-col cols="auto">
          <div class="text-h6 font-weight-bold">{{ restaurant.name }}</div>
        </v-col>
        <v-col cols="auto">
          <v-chip color="#ccc" size="small" variant="outlined">
            {{ restaurant.category || '未分類' }}
          </v-chip>
        </v-col>
      </v-row>

      <!-- ✅ 星星評分區 -->
      <v-row class="align-center mb-3">
        <v-col class="d-flex align-center" cols="auto">
          <StarRating :score="restaurant.average_score" />
          <span class="ml-2">{{ restaurant.average_score?.toFixed(1) ?? '-' }}</span>
        </v-col>
      </v-row>

      <!-- ✅ 外送資訊區：改為分行呈現 -->
      <v-row class="mb-2">
        <v-col>
          <div class="text-body-2">
            <strong>外送狀態：</strong>
            {{ restaurant.delivery ? '有外送' : '無外送' }}
          </div>

          <template v-if="restaurant.delivery">
            <div class="text-body-2">
              <strong>份數：</strong>滿 {{ restaurant.delivery_number }} 個送，
              <strong>金額：</strong>滿 {{ restaurant.delivery_price }} 元送
            </div>
          </template>
        </v-col>
      </v-row>

      <!-- ✅ 營業時間 -->
      <!-- <v-row>
        <v-col class="d-flex align-center">
          <v-icon class="mr-1" size="18">mdi-clock-time-four-outline</v-icon>
          <span class="text-body-2">{{ restaurant.business_hours || '未提供' }}</span>
        </v-col>
      </v-row> -->
      <BusinessHours :hours="restaurant.business_hours" />

    </v-card-text>
  </v-card>
</template>
<script setup>

  import BusinessHours from '@/components/BusinessHours.vue'
  import StarRating from '@/components/StarRating.vue'
  // defineProps({
  //   restaurant: Object,
  // })
  const { restaurant } = defineProps({
    restaurant: Object,
  })

  // ✅ 加這一行來定義事件
  defineEmits(['click'])

</script>

<style scoped>
.business-hours {
  font-size: 14px;
  color: white;
}
.status {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}
.hours-list div {
  margin-bottom: 2px;
}
.closed {
  color: gray;
  font-style: italic;
}
</style>

<style scoped>
/* *{
  background-color: #cc0;
} */
.v-card{
  border: 1px solid #CFB53B;
  z-index: 2;
}

</style>

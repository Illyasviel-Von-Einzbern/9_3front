<template>
  <!-- <v-main>
      <v-container>
        <v-btn class="mb-4" color="primary" @click="toggleDraggable">
          {{ draggable ? '關閉' : '開啟' }} 拖動畫布
        </v-btn>
      </v-container>
    </v-main> -->

  <canvas
    id="live2d-canvas"
    ref="canvas"
    :height="canvasHeight"
    :style="canvasStyle"
    :width="canvasWidth"
    @mousedown="onPointerDown"
    @touchstart.prevent="onPointerDown"
  />
</template>

<script setup>
  import { Live2DModel } from 'pixi-live2d-display'
  import * as PIXI from 'pixi.js'
  import { computed, onMounted, reactive, ref } from 'vue'

  const canvas = ref(null)
  const draggable = ref(true)
  const isDragging = ref(false)

  const canvasWidth = ref(250)
  const canvasHeight = ref(250)

  const position = reactive({ left: 0, top: 0 })
  const dragOffset = reactive({ x: 0, y: 0 })

  const canvasStyle = computed(() => ({
    position: 'fixed',
    width: canvasWidth.value + 'px',
    height: canvasHeight.value + 'px',
    left: position.left + 'px',
    top: position.top + 'px',
    cursor: draggable.value ? (isDragging.value ? 'grabbing' : 'grab') : 'default',
    userSelect: 'none',
    touchAction: 'none',
    // border: '1px solid #ccc',
    zIndex: 9999,
  }))

  function clamp (val, min, max) {
    return Math.min(Math.max(val, min), max)
  }

  function initPosition () {
    const saved = localStorage.getItem('live2d-canvas-position')
    if (saved) {
      const { left, top } = JSON.parse(saved)
      position.left = clamp(left, 0, window.innerWidth - canvasWidth.value)
      position.top = clamp(top, 0, window.innerHeight - canvasHeight.value)
    } else {
      position.left = (window.innerWidth - canvasWidth.value) / 2
      position.top = (window.innerHeight - canvasHeight.value) / 2
    }
  }

  function getClientXY (e) {
    return e.touches && e.touches.length > 0 ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : { x: e.clientX, y: e.clientY }
  }

  function onPointerDown (e) {
    if (!draggable.value) return
    const { x, y } = getClientXY(e)

    isDragging.value = true
    dragOffset.x = x - position.left
    dragOffset.y = y - position.top

    window.addEventListener('mousemove', onPointerMove)
    window.addEventListener('mouseup', onPointerUp)
    window.addEventListener('touchmove', onPointerMove, { passive: false })
    window.addEventListener('touchend', onPointerUp)
  }

  function onPointerMove (e) {
    if (!isDragging.value) return
    e.preventDefault()

    const { x, y } = getClientXY(e)

    let newLeft = x - dragOffset.x
    let newTop = y - dragOffset.y

    newLeft = clamp(newLeft, 0, window.innerWidth - canvasWidth.value)
    newTop = clamp(newTop, 0, window.innerHeight - canvasHeight.value)

    position.left = newLeft
    position.top = newTop
  }

  function onPointerUp () {
    if (!isDragging.value) return
    isDragging.value = false

    localStorage.setItem(
      'live2d-canvas-position',
      JSON.stringify({ left: position.left, top: position.top }),
    )

    window.removeEventListener('mousemove', onPointerMove)
    window.removeEventListener('mouseup', onPointerUp)
    window.removeEventListener('touchmove', onPointerMove)
    window.removeEventListener('touchend', onPointerUp)
  }

  function toggleDraggable () {
    draggable.value = !draggable.value
  }

  onMounted(async () => {
    initPosition()

    const app = new PIXI.Application({
      view: canvas.value,
      width: canvasWidth.value,
      height: canvasHeight.value,
      backgroundAlpha: 0,
      autoStart: true,
    })

    const model = await Live2DModel.from('./model/wanko.model.json')
    // 關閉 Live2D 模型互動的 pointer events（最穩定），防止 PIXI 嘗試處理 hover/click 導致錯誤
    model.interactive = false
    model.interactiveChildren = false

    model.scale.set(0.3)
    app.stage.addChild(model)

    // 置中模型
    model.position.set(
      app.view.width / 2 - model.width / 2,
      app.view.height / 2 - model.height / 2,
    )

    model.on('hit', areas => {
      if (areas.includes('head')) model.expression()
      if (areas.includes('body')) model.motion('tap_body')
    })

    window.addEventListener('resize', () => {
      position.left = clamp(position.left, 0, window.innerWidth - canvasWidth.value)
      position.top = clamp(position.top, 0, window.innerHeight - canvasHeight.value)
    })
  })
</script>

<style scoped>
#live2d-canvas {
  user-select: none;
  touch-action: none;
}
</style>

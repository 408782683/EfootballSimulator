<script setup lang="ts">
import { watch } from 'vue'
import type { GiftPackage, PackageBundle } from '../types/package'
import { useCarousel } from '../composables/useCarousel'
import { playClickSound } from '../composables/useSound'
import PackageCard from './PackageCard.vue'

const props = defineProps<{
  packages: GiftPackage[]
  currentIndex: number
}>()

const emit = defineEmits<{
  'update:currentIndex': [index: number]
  purchase: [packageId: number]
  showPlayers: [bundle: PackageBundle]
}>()

const {
  setViewportRef,
  setItemRef,
  transitionEnabled,
  isReady,
  suppressClick,
  canGoPrev,
  canGoNext,
  goNext,
  goPrev,
  goTo,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onWheel,
  trackStyle,
  getItemStyle,
} = useCarousel(props.packages, {
  initialIndex: props.currentIndex,
  // 礼包整体靠右展示，减少左侧人物对礼包的遮挡
  focalRatio: 0.53,
  onIndexChange: (index) => emit('update:currentIndex', index),
})

const handlePrevArea = () => {
  if (suppressClick.value) {
    return
  }

  if (canGoPrev.value) {
    playClickSound()
  }
  goPrev()
}

const handleNextArea = () => {
  if (suppressClick.value) {
    return
  }

  if (canGoNext.value) {
    playClickSound()
  }
  goNext()
}

// 拖拽结束松手落在按钮上时，抑制随之而来的 click；纯点击（未超过阈值）则照常放行
const handleCardPurchase = (packageId: number) => {
  if (suppressClick.value) {
    return
  }

  playClickSound()
  emit('purchase', packageId)
}

const handleCardShowPlayers = (bundle: PackageBundle) => {
  if (suppressClick.value) {
    return
  }

  playClickSound()
  emit('showPlayers', bundle)
}

// 顶部节点跳转会从外部改变 currentIndex，需要同步轨道位移（goTo 幂等，不会形成回环）
watch(
  () => props.currentIndex,
  (index) => goTo(index),
)

defineExpose({ goTo, goNext, goPrev })
</script>

<template>
  <section class="package-carousel">
    <div
      :ref="setViewportRef"
      class="package-carousel__viewport"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
      @wheel.prevent="onWheel($event.deltaY)"
    >
      <div
        class="package-carousel__track"
        :class="{
          'is-ready': isReady,
          'is-transitioning': transitionEnabled,
        }"
        :style="trackStyle"
      >
        <div
          v-for="(giftPackage, index) in packages"
          :key="giftPackage.id"
          :ref="(el) => setItemRef(el, index)"
          class="package-carousel__item"
          :class="{ 'is-transitioning': transitionEnabled }"
          :style="getItemStyle(index)"
        >
          <PackageCard
            :gift-package="giftPackage"
            :active="index === currentIndex"
            @purchase="handleCardPurchase(giftPackage.id)"
            @show-players="handleCardShowPlayers($event)"
          />
        </div>
      </div>
    </div>

    <button
      class="package-carousel__hit-area package-carousel__hit-area--left"
      type="button"
      :disabled="!canGoPrev"
      aria-label="查看上一个礼包"
      @click="handlePrevArea"
    ></button>

    <button
      class="package-carousel__hit-area package-carousel__hit-area--right"
      type="button"
      :disabled="!canGoNext"
      aria-label="查看下一个礼包"
      @click="handleNextArea"
    ></button>
  </section>
</template>

<style scoped>
.package-carousel {
  position: absolute;
  inset: 0;
  z-index: 3;
}

.package-carousel__viewport {
  position: absolute;
  inset: 20vh 0 0;
  overflow: hidden;
  cursor: grab;
  touch-action: pan-y;
  /* 向左移出的礼包越过这条线即被裁掉（不做线性淡出），避免遮挡左侧人物
     （人物右缘约在 32vw 附近） */
  -webkit-mask-image: linear-gradient(to right, transparent 0, transparent 32vw, #000 32vw);
  mask-image: linear-gradient(to right, transparent 0, transparent 32vw, #000 32vw);
}

.package-carousel__viewport:active {
  cursor: grabbing;
}

.package-carousel__track {
  position: absolute;
  left: 0;
  top: 0;
  display: flex;
  align-items: center;
  gap: 2.4vw;
  height: 100%;
  opacity: 0;
  will-change: transform;
}

.package-carousel__track.is-ready {
  opacity: 1;
  transition: opacity 200ms ease;
}

.package-carousel__track.is-transitioning {
  transition:
    transform 450ms cubic-bezier(0.22, 0.61, 0.36, 1),
    opacity 200ms ease;
}

.package-carousel__item {
  flex: 0 0 auto;
  display: flex;
  justify-content: center;
  will-change: opacity, filter;
}

/* 传送带效果：滑动过程中礼包尺寸保持不变，只淡出 */
.package-carousel__item.is-transitioning {
  transition:
    opacity 450ms cubic-bezier(0.22, 0.61, 0.36, 1),
    filter 450ms cubic-bezier(0.22, 0.61, 0.36, 1);
}

.package-carousel__hit-area {
  position: absolute;
  top: 20vh;
  bottom: 0;
  width: 12vw;
  border: none;
  background: transparent;
  z-index: 4;
  cursor: pointer;
}

.package-carousel__hit-area:disabled {
  cursor: default;
}

.package-carousel__hit-area--left {
  left: 0;
}

.package-carousel__hit-area--right {
  right: 0;
}
</style>

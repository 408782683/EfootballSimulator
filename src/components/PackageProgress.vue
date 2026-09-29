<script setup lang="ts">
import { playClickSound } from '../composables/useSound'
import type { GiftPackage } from '../types/package'

defineProps<{
  packages: GiftPackage[]
  currentIndex: number
}>()

const emit = defineEmits<{
  select: [index: number]
}>()

/** 点击进度节点切换礼包：播放点击音效 */
const handleSelect = (index: number) => {
  playClickSound()
  emit('select', index)
}
</script>

<template>
  <nav class="package-progress" aria-label="礼包进度">
    <div
      v-for="(giftPackage, index) in packages"
      :key="giftPackage.id"
      class="package-progress__item"
    >
      <button
        type="button"
        class="package-progress__node"
        :class="{
          'is-active': index === currentIndex,
          'is-claimed': giftPackage.status === 'claimed',
          'is-locked': giftPackage.status === 'locked',
        }"
        :aria-current="index === currentIndex"
        @click="handleSelect(index)"
      >
        <span class="package-progress__code">{{ giftPackage.code }}</span>

        <span
          v-if="giftPackage.status === 'claimed'"
          class="package-progress__badge package-progress__badge--done"
          aria-hidden="true"
        ></span>
        <span
          v-else-if="giftPackage.status === 'locked'"
          class="package-progress__badge package-progress__badge--lock"
          aria-hidden="true"
        ></span>
      </button>

      <span
        v-if="index < packages.length - 1"
        class="package-progress__line"
        aria-hidden="true"
      ></span>
    </div>
  </nav>
</template>

<style scoped>
.package-progress {
  position: absolute;
  top: 12.4vh;
  left: 72vw;
  z-index: 10;
  display: flex;
  align-items: center;
  transform: translateX(-50%);
}

.package-progress__item {
  display: flex;
  align-items: center;
}

.package-progress__line {
  width: min(2.23vw, 36px);
  height: 2px;
  background: rgba(226, 213, 202, 0.7);
}

.package-progress__node {
  position: relative;
  display: grid;
  place-items: center;
  width: min(2.93vw, 47px);
  aspect-ratio: 1;
  border: none;
  border-radius: 50%;
  background: rgba(188, 189, 195, 0.92);
  color: rgba(44, 44, 50, 0.6);
  cursor: pointer;
  transition:
    transform 180ms ease,
    filter 180ms ease,
    background-color 180ms ease,
    color 180ms ease;
}

.package-progress__code {
  font-size: min(1.5vw, 24px);
  font-weight: 900;
  line-height: 1;
}

.package-progress__node:hover {
  transform: translateY(-2px);
  filter: brightness(1.06);
}

.package-progress__node.is-active {
  background: #f3d85a;
  color: #16130a;
  transform: scale(1.08);
  filter: drop-shadow(0 0 14px rgba(243, 216, 90, 0.75));
}

.package-progress__node.is-claimed:not(.is-active) {
  color: rgba(40, 40, 45, 0.85);
}

.package-progress__badge {
  position: absolute;
  right: -0.1rem;
  bottom: -0.1rem;
  display: grid;
  place-items: center;
  width: min(0.9vw, 14px);
  aspect-ratio: 1;
  border-radius: 50%;
}

/* 已领取：绿色圆 + 白色对勾 */
.package-progress__badge--done {
  background: #29b95a;
}

.package-progress__badge--done::before {
  content: '';
  width: 42%;
  height: 24%;
  border-left: 2px solid #ffffff;
  border-bottom: 2px solid #ffffff;
  transform: translateY(-12%) rotate(-45deg);
}

/* 未解锁：蓝色圆 + 白色锁 */
.package-progress__badge--lock {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1px;
  background: #2b52a8;
}

.package-progress__badge--lock::before {
  content: '';
  width: 28%;
  height: 26%;
  border: 1.5px solid #ffffff;
  border-bottom: none;
  border-radius: 999px 999px 0 0;
}

.package-progress__badge--lock::after {
  content: '';
  width: 48%;
  height: 34%;
  border-radius: 1px;
  background: #ffffff;
}

@media (max-width: 1200px) {
  .package-progress {
    left: 68vw;
    transform: translateX(-50%) scale(0.92);
    transform-origin: center center;
  }
}

/* 移动端（竖屏手机）：节点改为固定像素尺寸并居中，避免 vw 过小导致节点不可点 */
@media (max-width: 820px) {
  .package-progress {
    top: 8vh;
    left: 50%;
    transform: translateX(-50%) scale(1);
  }

  .package-progress__node {
    width: 1.75rem;
  }

  .package-progress__code {
    font-size: 0.75rem;
  }

  .package-progress__line {
    width: 0.7rem;
  }

  .package-progress__badge {
    width: 10px;
  }
}
</style>

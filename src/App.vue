<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import CharacterLayer from './components/CharacterLayer.vue'
import DrawResultModal from './components/DrawResultModal.vue'
import GameHeader from './components/GameHeader.vue'
import InfoModal from './components/InfoModal.vue'
import PackageCarousel from './components/PackageCarousel.vue'
import PackageProgress from './components/PackageProgress.vue'
import PlayerDetailModal from './components/PlayerDetailModal.vue'
import { useGacha } from './composables/useGacha'
import { playClickSound, playResetSound } from './composables/useSound'
import { packages as packageDefinitions } from './data/packages'
import type { PackageBundle } from './types/package'

const { packages, lastResult, purchase, reset } = useGacha(packageDefinitions)

const infoOpen = ref(false)
const currentIndex = ref(0)
const detailBundle = ref<PackageBundle | null>(null)
const resultOpen = ref(false)

/** 背景图地址：生产构建（Electron file://）下 BASE_URL 为 './'，开发环境为 '/' */
const backgroundImage = `url(${import.meta.env.BASE_URL}assets/backgrounds/main-background.png)`

/** 活动截止时间：2027-09-29 00:00（本地时区） */
const DEADLINE = new Date(2027, 8, 29, 0, 0, 0).getTime()
const remainingText = ref('')
let countdownTimer: number | undefined

const updateRemaining = () => {
  const diff = Math.max(DEADLINE - Date.now(), 0)
  const days = Math.floor(diff / 86_400_000)
  const hours = Math.floor((diff % 86_400_000) / 3_600_000)
  remainingText.value = `剩余${days}天${hours}小时`
}

onMounted(() => {
  updateRemaining()
  countdownTimer = window.setInterval(updateRemaining, 60_000)
})

onBeforeUnmount(() => {
  window.clearInterval(countdownTimer)
})

const handleProgressSelect = (index: number) => {
  currentIndex.value = index
}

/** 打开规则说明：播放点击音效 */
const handleOpenInfo = () => {
  playClickSound()
  infoOpen.value = true
}

const handlePurchase = (packageId: number) => {
  if (purchase(packageId)) {
    resultOpen.value = true
  }
}

/** 重置礼包状态：回到初始进度并收起所有弹窗（播放重置音效） */
const handleReset = () => {
  playResetSound()
  reset()
  currentIndex.value = 0
  detailBundle.value = null
  resultOpen.value = false
}
</script>

<template>
  <div class="app-shell">
    <div class="app-shell__background" :style="{ backgroundImage }"></div>
    <div class="app-shell__light"></div>

    <CharacterLayer />

    <GameHeader
      title="球王传承 连锁礼包"
      :remaining-text="remainingText"
      @open-info="handleOpenInfo"
    />

    <PackageProgress
      :packages="packages"
      :current-index="currentIndex"
      @select="handleProgressSelect"
    />

    <PackageCarousel
      :packages="packages"
      :current-index="currentIndex"
      @update:current-index="currentIndex = $event"
      @purchase="handlePurchase"
      @show-players="detailBundle = $event"
    />

    <button
      class="reset-button"
      type="button"
      aria-label="重置礼包状态"
      title="重置礼包状态"
      @click="handleReset"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M20.4 12a8.4 8.4 0 1 1-2.6-6.06"
          fill="none"
          stroke="currentColor"
          stroke-width="2.4"
          stroke-linecap="round"
        />
        <path d="M20.9 2.9v4.7h-4.7z" fill="currentColor" />
      </svg>
    </button>

    <InfoModal :open="infoOpen" @close="infoOpen = false" />

    <PlayerDetailModal :open="detailBundle !== null" :bundle="detailBundle" @close="detailBundle = null" />

    <DrawResultModal :open="resultOpen" :result="lastResult" @close="resultOpen = false" />
  </div>
</template>

<style scoped>
.app-shell {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  isolation: isolate;
  background: #180604;
}

.app-shell__background,
.app-shell__light {
  position: absolute;
  inset: 0;
}

.app-shell__background {
  z-index: 0;
  background-size: cover;
  background-position: center center;
  background-repeat: no-repeat;
  transform: scale(1.04);
}

.app-shell__light {
  z-index: 1;
  background:
    radial-gradient(circle at 56% 26%, rgba(250, 184, 67, 0.36), transparent 18%),
    radial-gradient(circle at 58% 42%, rgba(255, 132, 0, 0.16), transparent 24%),
    linear-gradient(180deg, rgba(70, 5, 3, 0.16), rgba(5, 1, 1, 0.06));
  mix-blend-mode: screen;
  pointer-events: none;
}

/* 右上角按钮：重置礼包状态 */
.reset-button {
  position: absolute;
  top: 3.5vh;
  right: 10.46vw;
  z-index: 20;
  display: grid;
  place-items: center;
  width: clamp(2.8rem, 3.7vw, 3.4rem);
  aspect-ratio: 1;
  border: none;
  border-radius: 50%;
  background: #dfefff;
  color: #2390ea;
  cursor: pointer;
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.18);
  transition: transform 120ms ease;
}

.reset-button svg {
  width: 58%;
  height: 58%;
}

.reset-button:hover {
  transform: scale(1.05);
}

.reset-button:active {
  transform: scale(0.92);
}

@media (max-width: 1100px) {
  .reset-button {
    right: 5vw;
  }
}

/* 移动端（竖屏手机）：右上角重置按钮缩小并贴边 */
@media (max-width: 820px) {
  .reset-button {
    top: 1.6vh;
    right: 4vw;
    width: clamp(2.1rem, 9vw, 2.6rem);
  }
}
</style>

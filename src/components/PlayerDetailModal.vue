<script setup lang="ts">
import { computed } from 'vue'
import { pools } from '../data/packages'
import { playResetSound } from '../composables/useSound'
import type { PackageBundle } from '../types/package'

const props = defineProps<{
  open: boolean
  bundle: PackageBundle | null
}>()

const emit = defineEmits<{
  close: []
}>()

const pool = computed(() => (props.bundle ? pools[props.bundle.poolType] : null))

/** 单次抽取命中「包内某一名球员」的概率 = 出包概率 ÷ 池内球员数 */
const playerRateText = computed(() => {
  const count = pool.value?.players.length ?? 0
  if (!props.bundle || count === 0) {
    return '0'
  }
  return String(Number((props.bundle.probability / count).toFixed(2)))
})

/** 单次抽取不出任何球员的概率 */
const missRateText = computed(() => (props.bundle ? String(100 - props.bundle.probability) : '0'))

/** 关闭弹窗：播放重置音效 */
const handleClose = () => {
  playResetSound()
  emit('close')
}
</script>

<template>
  <Transition name="modal">
    <div v-if="open && pool" class="player-detail">
      <button class="player-detail__backdrop" type="button" aria-label="关闭详情" @click="handleClose"></button>

      <div class="player-detail__panel" role="dialog" aria-modal="true" aria-label="可抽出球员详情">
        <button class="player-detail__close" type="button" aria-label="关闭详情弹窗" @click="handleClose">
          ×
        </button>

        <header class="player-detail__header">
          <h2>{{ pool.name }}</h2>
          <p>
            共 {{ pool.players.length }} 名可抽出球员 ·
            单次抽中任一球员 {{ bundle?.probability }}%（{{ missRateText }}% 不出）
          </p>
          <p class="player-detail__rate-tip">每名球员概率 {{ playerRateText }}%</p>
        </header>

        <ul class="player-detail__list">
          <li v-for="player in pool.players" :key="player.id" class="player-detail__item">
            <img :src="player.image" :alt="player.name" draggable="false" />
            <span class="player-detail__code">{{ player.code }}</span>
            <span class="player-detail__name">{{ player.name }}</span>
            <span class="player-detail__rate">{{ playerRateText }}%</span>
          </li>
        </ul>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.player-detail {
  position: absolute;
  inset: 0;
  z-index: 100;
}

.player-detail__backdrop {
  position: absolute;
  inset: 0;
  border: none;
  background: rgba(0, 0, 0, 0.6);
  z-index: 99;
}

.player-detail__panel {
  position: absolute;
  left: 50%;
  top: 50%;
  z-index: 100;
  display: flex;
  flex-direction: column;
  width: min(900px, 84vw);
  max-height: 78vh;
  padding: 1.6rem 1.8rem 1.4rem;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 1.4rem;
  background: linear-gradient(180deg, rgba(29, 17, 14, 0.97), rgba(18, 11, 9, 0.97));
  color: #f7f0df;
  box-shadow: 0 28px 60px rgba(0, 0, 0, 0.35);
  transform: translate(-50%, -50%);
}

.player-detail__header h2 {
  margin: 0;
  font-size: 1.8rem;
}

.player-detail__header p {
  margin: 0.4rem 0 0;
  font-size: 1.05rem;
  color: rgba(247, 240, 223, 0.72);
}

.player-detail__rate-tip {
  font-weight: 800;
  color: #f3d85a !important;
}

.player-detail__list {
  flex: 1 1 auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 0.9rem;
  margin: 1.2rem 0 0;
  padding: 0;
  overflow-y: auto;
  list-style: none;
}

.player-detail__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  padding: 0.6rem 0.4rem;
  border-radius: 0.8rem;
  background: rgba(255, 255, 255, 0.06);
}

.player-detail__item img {
  width: 72px;
  height: 72px;
  object-fit: contain;
}

.player-detail__code {
  font-size: 0.8rem;
  color: rgba(247, 240, 223, 0.55);
}

.player-detail__name {
  font-size: 1rem;
  font-weight: 700;
}

.player-detail__rate {
  font-size: 0.95rem;
  font-weight: 800;
  color: #f3d85a;
}

.player-detail__close {
  position: absolute;
  top: 0.8rem;
  right: 0.9rem;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.92);
  font-size: 2rem;
  cursor: pointer;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 220ms ease;
}

.modal-enter-active .player-detail__panel,
.modal-leave-active .player-detail__panel {
  transition:
    transform 220ms ease,
    opacity 220ms ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .player-detail__panel,
.modal-leave-to .player-detail__panel {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.94);
}
</style>

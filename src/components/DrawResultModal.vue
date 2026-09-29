<script setup lang="ts">
import { playResetSound } from '../composables/useSound'
import type { DrawResult } from '../types/package'

defineProps<{
  open: boolean
  result: DrawResult | null
}>()

const emit = defineEmits<{
  close: []
}>()

/** 关闭结果弹窗：播放重置音效 */
const handleClose = () => {
  playResetSound()
  emit('close')
}
</script>

<template>
  <Transition name="modal">
    <div v-if="open && result" class="draw-result">
      <button class="draw-result__backdrop" type="button" aria-label="关闭结果" @click="handleClose"></button>

      <div class="draw-result__panel" role="dialog" aria-modal="true" aria-label="抽卡结果">
        <button class="draw-result__close" type="button" aria-label="关闭结果弹窗" @click="handleClose">
          ×
        </button>

        <h2>礼包 {{ result.code }} 抽卡结果</h2>

        <div class="draw-result__players">
          <p v-if="result.outcomes.length === 0" class="draw-result__empty">
            本次没有抽出球员
          </p>

          <figure
            v-for="(outcome, index) in result.outcomes"
            :key="`${outcome.bundleId}-${index}`"
            class="draw-result__player"
          >
            <img :src="outcome.player.image" :alt="outcome.player.name" draggable="false" />
            <figcaption>
              <strong>{{ outcome.player.name }}</strong>
              <span>{{ outcome.poolName }}</span>
            </figcaption>
          </figure>
        </div>

        <button class="draw-result__confirm" type="button" @click="handleClose">
          确定
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.draw-result {
  position: absolute;
  inset: 0;
  z-index: 110;
}

.draw-result__backdrop {
  position: absolute;
  inset: 0;
  border: none;
  background: rgba(0, 0, 0, 0.68);
  z-index: 109;
}

.draw-result__panel {
  position: absolute;
  left: 50%;
  top: 50%;
  z-index: 110;
  width: min(640px, 82vw);
  padding: 1.8rem 2rem 1.6rem;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 1.4rem;
  background: linear-gradient(180deg, rgba(29, 17, 14, 0.97), rgba(18, 11, 9, 0.97));
  color: #f7f0df;
  text-align: center;
  box-shadow: 0 28px 60px rgba(0, 0, 0, 0.35);
  transform: translate(-50%, -50%);
}

.draw-result__panel h2 {
  margin: 0 0 1.2rem;
  font-size: 1.7rem;
}

.draw-result__players {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1.6rem;
}

.draw-result__empty {
  margin: 2rem 0;
  font-size: min(1.6vw, 28px);
  font-weight: 700;
  color: rgba(255, 255, 255, 0.82);
}

.draw-result__player {
  margin: 0;
}

.draw-result__player img {
  width: min(30vw, 220px);
  height: auto;
  filter: drop-shadow(0 14px 22px rgba(0, 0, 0, 0.4));
}

.draw-result__player figcaption {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  margin-top: 0.4rem;
}

.draw-result__player strong {
  font-size: 1.3rem;
}

.draw-result__player span {
  font-size: 0.95rem;
  color: rgba(247, 240, 223, 0.7);
}

.draw-result__confirm {
  margin-top: 1.6rem;
  min-width: 200px;
  padding: 0.7rem 1.6rem;
  border: none;
  border-radius: 999px;
  background: #f6d75c;
  color: #5a3c00;
  font-size: 1.2rem;
  font-weight: 900;
  cursor: pointer;
  transition: transform 120ms ease;
}

.draw-result__confirm:hover {
  transform: scale(1.03);
}

.draw-result__confirm:active {
  transform: scale(0.97);
}

.draw-result__close {
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

.modal-enter-active .draw-result__panel,
.modal-leave-active .draw-result__panel {
  transition:
    transform 220ms ease,
    opacity 220ms ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .draw-result__panel,
.modal-leave-to .draw-result__panel {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.94);
}
</style>

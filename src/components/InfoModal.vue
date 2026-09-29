<script setup lang="ts">
import { playResetSound } from '../composables/useSound'

defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

/** 关闭说明弹窗：播放重置音效 */
const handleClose = () => {
  playResetSound()
  emit('close')
}
</script>

<template>
  <Transition name="modal">
    <div v-if="open" class="info-modal">
      <button class="info-modal__backdrop" type="button" aria-label="关闭说明" @click="handleClose"></button>

      <div class="info-modal__panel" role="dialog" aria-modal="true" aria-label="礼包规则说明">
        <button class="info-modal__close" type="button" aria-label="关闭说明弹窗" @click="handleClose">
          ×
        </button>

        <h2>礼包规则说明</h2>
        <ul>
          <li>每个连锁礼包都对应一个阶段奖励，顶部进度会和当前 Carousel 同步。</li>
          <li>拖动、滚轮、点击左右热区或进度节点，都可以连续切换礼包。</li>
          <li>第一阶段以视觉与交互还原为主，抽卡动画、概率明细和音效稍后再接入。</li>
        </ul>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.info-modal {
  position: absolute;
  inset: 0;
  z-index: 100;
}

.info-modal__backdrop {
  position: absolute;
  inset: 0;
  border: none;
  background: rgba(0, 0, 0, 0.56);
  z-index: 99;
}

.info-modal__panel {
  position: absolute;
  left: 50%;
  top: 50%;
  z-index: 100;
  width: min(560px, 80vw);
  padding: 2rem 2rem 1.6rem;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 1.4rem;
  background: linear-gradient(180deg, rgba(29, 17, 14, 0.96), rgba(18, 11, 9, 0.96));
  color: #f7f0df;
  box-shadow: 0 28px 60px rgba(0, 0, 0, 0.3);
  transform: translate(-50%, -50%);
}

.info-modal__panel h2 {
  margin: 0 0 1rem;
  font-size: 1.7rem;
}

.info-modal__panel ul {
  margin: 0;
  padding-left: 1.3rem;
  line-height: 1.75;
}

.info-modal__close {
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

.modal-enter-active .info-modal__panel,
.modal-leave-active .info-modal__panel {
  transition:
    transform 220ms ease,
    opacity 220ms ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .info-modal__panel,
.modal-leave-to .info-modal__panel {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.94);
}
</style>

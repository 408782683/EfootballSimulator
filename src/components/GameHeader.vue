<script setup lang="ts">
defineProps<{
  title: string
  remainingText: string
}>()

defineEmits<{
  openInfo: []
}>()
</script>

<template>
  <header class="game-header">
    <div class="game-header__copy">
      <h1>{{ title }}</h1>
      <p>{{ remainingText }}</p>
    </div>

    <button
      class="game-header__info"
      type="button"
      aria-label="查看礼包规则"
      @click="$emit('openInfo')"
    >
      i
    </button>
  </header>
</template>

<style scoped>
.game-header {
  position: absolute;
  top: 4.8vh;
  left: 12vw;
  z-index: 10;
  display: flex;
  align-items: flex-start;
  gap: clamp(1rem, 1.6vw, 1.5rem);
}

.game-header__copy h1 {
  margin: 0;
  font-size: clamp(2.1rem, 4vw, 4.2rem);
  line-height: 0.95;
  font-weight: 900;
  letter-spacing: 0.04em;
  color: #ffffff;
  text-shadow: 0 6px 16px rgba(0, 0, 0, 0.35);
}

.game-header__copy p {
  margin: 1rem 0 0;
  font-size: clamp(1rem, 1.6vw, 1.8rem);
  font-weight: 700;
  color: rgba(255, 255, 255, 0.94);
}

.game-header__info {
  display: grid;
  place-items: center;
  width: clamp(2.4rem, 3.5vw, 3.8rem);
  aspect-ratio: 1;
  border: 3px solid rgba(255, 255, 255, 0.92);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.04);
  color: #ffffff;
  font-size: clamp(1.5rem, 2vw, 2rem);
  font-weight: 900;
  cursor: pointer;
  transition:
    transform 160ms ease,
    background-color 160ms ease;
}

.game-header__info:hover {
  transform: scale(1.06);
  background: rgba(255, 255, 255, 0.12);
}

.game-header__info:active {
  transform: scale(0.94);
}

@media (max-width: 1100px) {
  .game-header {
    left: 7vw;
  }
}

/* 移动端（竖屏手机）：标题与活动倒计时压缩，避免与右上角重置按钮重叠 */
@media (max-width: 820px) {
  .game-header {
    top: 1.6vh;
    left: 4vw;
    max-width: 76vw;
    gap: 0.6rem;
  }

  .game-header__copy h1 {
    font-size: clamp(1.25rem, 6.2vw, 1.9rem);
    letter-spacing: 0.02em;
    line-height: 1.05;
  }

  .game-header__copy p {
    margin-top: 0.35rem;
    font-size: clamp(0.72rem, 3.2vw, 0.95rem);
  }

  .game-header__info {
    flex: 0 0 auto;
    width: clamp(1.7rem, 7.6vw, 2.2rem);
    border-width: 2px;
    font-size: clamp(0.85rem, 3.8vw, 1.1rem);
  }
}
</style>
